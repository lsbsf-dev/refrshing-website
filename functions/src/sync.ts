import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

/**
 * Firestore trigger to denormalize only check-in-safe fields to the checkinView subcollection.
 * Gated in rules so checkinStaff can read only this subcollection to protect privacy.
 */
export const syncCheckinView = functions.firestore
  .document("events/{eventId}/attendees/{attendeeId}")
  .onWrite(async (change, context) => {
    const db = admin.firestore();
    const eventId = context.params.eventId;
    const attendeeId = context.params.attendeeId;

    const checkinViewRef = db
      .collection("events")
      .doc(eventId)
      .collection("checkinView")
      .doc(attendeeId);

    // If the attendee was deleted, delete the check-in view doc
    if (!change.after.exists) {
      await checkinViewRef.delete();
      return;
    }

    const data = change.after.data();
    if (!data) return;

    // Note: checkinView intentionally omits full phone and email fields to reduce PII exposure
    // for checkinStaff volunteers on shared kiosk devices. Masked phone (last 4 digits) is included
    // to allow disambiguating same-name attendees without exposing the full number.
    const phoneNumber = data.phoneNumber || data.phone || "";
    const phoneMasked = phoneNumber.length > 4 ? `***-***-${phoneNumber.slice(-4)}` : phoneNumber;

    const checkinSafeData = {
      id: attendeeId,
      eventId,
      fullName: data.fullName || data.name || "Anonymous",
      photoUrl: data.photoUrl || "",
      memberStatus: data.memberStatus || data.ticketStatus || "Member",
      checkedInAt: data.checkIn?.checkedInAt || data.checkedInAt || null,
      phoneMasked,
      churchName: data.churchName || data.church || "",
      associationName: data.associationName || data.association || "",
      campusFellowshipName: data.campusFellowshipName || "",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await checkinViewRef.set(checkinSafeData, { merge: true });
  });
