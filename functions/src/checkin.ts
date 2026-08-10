import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logAudit } from "./audit";



async function performCheckIn(
  eventId: string,
  attendeeId: string,
  uid: string,
  email: string,
  permissions: string[],
  allowedEvents: string[]
) {
  const isSuperAdmin = permissions.includes("users.write"); // superAdmin has this, others generally don't, but we can also just rely on checking if they have checkin permission for this event.
  // Actually, we just need to check if they have registrations.checkin and are allowed for this event
  const canCheckIn = permissions.includes("registrations.checkin");
  const isAllowedEvent = allowedEvents.includes(eventId) || isSuperAdmin; // SuperAdmin usually has all events or bypasses

  if (!canCheckIn || !isAllowedEvent) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "User is not authorized to perform check-ins for this event."
    );
  }

  const db = admin.firestore();
  const attendeeRef = db
    .collection("events")
    .doc(eventId)
    .collection("attendees")
    .doc(attendeeId);

  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  let alreadyCheckedIn = false;

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(attendeeRef);
    if (!doc.exists) {
      throw new Error("Attendee record not found");
    }

    const currentData = doc.data() || {};
    if (currentData.checkIn?.checkedIn || currentData.checkedInAt) {
      alreadyCheckedIn = true;
      return;
    }

    transaction.update(attendeeRef, {
      "checkIn.checkedIn": true,
      "checkIn.checkedInAt": timestamp,
      "checkIn.checkedInBy": email || "unknown@lsbsf.org",
      ticketStatus: "checked-in", // keep for backwards compatibility if needed
    });
  });

  if (alreadyCheckedIn) {
    return { success: true, message: "Attendee was already checked in.", alreadyCheckedIn: true };
  }

  await logAudit(db, "attendee_checked_in", uid, email || "unknown@lsbsf.org", {
    eventId,
    attendeeId,
  });

  return { success: true, message: "Attendee checked in successfully." };
}

/**
 * Callable function for check-in actions.
 * Validates checkinStaff, registrationStaff, eventAdmin, or superAdmin role limits.
 */
export const markCheckedIn = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The request must be authenticated."
    );
  }

  const { eventId, attendeeId } = data;
  if (!eventId || !attendeeId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Both eventId and attendeeId are required arguments."
    );
  }

  const token = context.auth.token;
  const permissions = (token.permissions || []) as string[];
  const allowedEvents = (token.allowedEvents || []) as string[];

  try {
    return await performCheckIn(
      eventId,
      attendeeId,
      context.auth.uid,
      token.email || "unknown@lsbsf.org",
      permissions,
      allowedEvents
    );
  } catch (error: any) {
    console.error("Check-in transaction failed:", error);
    if (error.code === "already-exists") {
      throw error;
    }
    throw new functions.https.HttpsError("internal", error.message || "Failed to check in attendee.");
  }
});


/**
 * Callable function to undo a check-in.
 * Reverts ticketStatus to "registered", nullifies checkedInAt, and preserves original timestamp in audit log.
 */
export const undoCheckIn = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The request must be authenticated."
    );
  }

  const { eventId, attendeeId } = data;
  if (!eventId || !attendeeId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Both eventId and attendeeId are required arguments."
    );
  }

  const token = context.auth.token;
  const permissions = (token.permissions || []) as string[];
  const allowedEvents = (token.allowedEvents || []) as string[];

  // Permission checks
  const isSuperAdmin = permissions.includes("users.write");
  const canCheckIn = permissions.includes("registrations.checkin");
  const isAllowedEvent = allowedEvents.includes(eventId) || isSuperAdmin;

  if (!canCheckIn || !isAllowedEvent) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "User is not authorized to reverse check-ins for this event."
    );
  }

  const db = admin.firestore();
  const attendeeRef = db
    .collection("events")
    .doc(eventId)
    .collection("attendees")
    .doc(attendeeId);

  try {
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(attendeeRef);
      if (!doc.exists) {
        throw new Error("Attendee record not found");
      }

      const currentData = doc.data() || {};
      const originalCheckedInAt = currentData.checkIn?.checkedInAt || currentData.checkedInAt;
      
      if (!currentData.checkIn?.checkedIn && !currentData.checkedInAt) {
        return; // Already undone or not checked in
      }

      // Reverse check-in status
      transaction.update(attendeeRef, {
        "checkIn.checkedIn": false,
        "checkIn.checkedInAt": admin.firestore.FieldValue.delete(),
        "checkIn.checkedInBy": admin.firestore.FieldValue.delete(),
        checkedInAt: admin.firestore.FieldValue.delete(),
        ticketStatus: "registered",
      });

      // Log the reversal, preserving the original timestamp explicitly
      await logAudit(db, "attendee_checkin_reversed", context.auth!.uid, token.email || "unknown@lsbsf.org", {
        eventId,
        attendeeId,
        previousCheckedInAt: originalCheckedInAt || null,
        reason: data.reason || "Manual reversal by staff",
      });
    });

    return { success: true, message: "Check-in reversed successfully." };
  } catch (error: any) {
    console.error("Undo check-in transaction failed:", error);
    throw new functions.https.HttpsError("internal", error.message || "Failed to reverse check-in.");
  }
});
