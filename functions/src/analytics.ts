import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

function generateSlug(text: string): string {
  if (!text) return "unknown";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

export const syncAnalyticsSummary = functions.firestore
  .document("events/{eventId}/attendees/{attendeeId}")
  .onWrite(async (change, context) => {
    const db = admin.firestore();
    const eventId = context.params.eventId;

    const before = change.before.data();
    const after = change.after.data();

    const getStatus = (data: any | undefined) => {
      if (!data) return null;
      
      const isCheckedIn = data.checkIn?.checkedIn === true || !!data.checkIn?.checkedInAt || !!data.checkedInAt;
      
      let groupingName = "";
      if (data.conferenceId === "campus_fellowship") {
        groupingName = data.campusFellowshipName || "Unknown Campus";
      } else {
        groupingName = data.associationName || "Unknown Association";
      }

      return {
        conferenceId: data.conferenceId || "other",
        isCheckedIn,
        groupingName,
        slug: generateSlug(groupingName),
      };
    };

    const beforeStatus = getStatus(before);
    const afterStatus = getStatus(after);

    // If there is no change in relevant fields, exit early
    if (
      beforeStatus &&
      afterStatus &&
      beforeStatus.conferenceId === afterStatus.conferenceId &&
      beforeStatus.isCheckedIn === afterStatus.isCheckedIn &&
      beforeStatus.slug === afterStatus.slug
    ) {
      return;
    }

    const batch = db.batch();
    const mainRef = db.collection("events").doc(eventId).collection("analyticsSummary").doc("main");

    const mainUpdates: Record<string, any> = {};
    const assocUpdates: Record<string, { name: string; conferenceId: string; registeredInc: number; checkedInInc: number }> = {};

    const applyDiff = (status: ReturnType<typeof getStatus>, multiplier: 1 | -1) => {
      if (!status) return;

      // Main doc global
      mainUpdates["totalRegistered"] = admin.firestore.FieldValue.increment(multiplier);
      if (status.isCheckedIn) {
        mainUpdates["totalCheckedIn"] = admin.firestore.FieldValue.increment(multiplier);
      }

      // Main doc conference level
      mainUpdates[`conferences.${status.conferenceId}.registered`] = admin.firestore.FieldValue.increment(multiplier);
      if (status.isCheckedIn) {
        mainUpdates[`conferences.${status.conferenceId}.checkedIn`] = admin.firestore.FieldValue.increment(multiplier);
      }

      // Association doc
      const assocKey = status.slug;
      if (!assocUpdates[assocKey]) {
        assocUpdates[assocKey] = {
          name: status.groupingName,
          conferenceId: status.conferenceId,
          registeredInc: 0,
          checkedInInc: 0,
        };
      }
      assocUpdates[assocKey].registeredInc += multiplier;
      if (status.isCheckedIn) {
        assocUpdates[assocKey].checkedInInc += multiplier;
      }
    };

    if (beforeStatus) applyDiff(beforeStatus, -1);
    if (afterStatus) applyDiff(afterStatus, 1);

    if (Object.keys(mainUpdates).length > 0) {
      batch.set(mainRef, mainUpdates, { merge: true });
    }

    for (const [slug, data] of Object.entries(assocUpdates)) {
      if (data.registeredInc === 0 && data.checkedInInc === 0) continue;

      const assocRef = mainRef.collection("byAssociation").doc(slug);
      batch.set(
        assocRef,
        {
          id: slug,
          name: data.name,
          conferenceId: data.conferenceId,
          registered: admin.firestore.FieldValue.increment(data.registeredInc),
          checkedIn: admin.firestore.FieldValue.increment(data.checkedInInc),
        },
        { merge: true }
      );
    }

    await batch.commit();
  });
