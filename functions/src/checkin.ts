import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logAudit } from "./audit";

/**
 * Callable function for check-in actions.
 * Validates checkinStaff, registrationStaff, eventAdmin, or superAdmin role limits.
 */
export const markCheckedIn = functions.https.onCall(async (data, context) => {
  // 1. Verify authentication
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
  const role = token.role as string;
  const allowedEvents = (token.allowedEvents || []) as string[];
  const mfaEnrolled = token.mfaEnrolled === true;

  // 2. Validate permissions
  const isSuper = role === "superAdmin" && mfaEnrolled;
  const isEventAdm = role === "eventAdmin" && allowedEvents.includes(eventId) && mfaEnrolled;
  const isRegStaff = role === "registrationStaff" && allowedEvents.includes(eventId);
  const isCheckin = role === "checkinStaff" && allowedEvents.includes(eventId);

  if (!isSuper && !isEventAdm && !isRegStaff && !isCheckin) {
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

  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(attendeeRef);
      if (!doc.exists) {
        throw new Error("Attendee record not found");
      }

      const currentData = doc.data() || {};
      if (currentData.checkedInAt) {
        throw new functions.https.HttpsError("already-exists", "Attendee is already checked in");
      }

      // Update canonical record
      transaction.update(attendeeRef, {
        checkedInAt: timestamp,
        ticketStatus: "checked-in",
      });
    });

    // Write audit log
    await logAudit(db, "attendee_checked_in", context.auth.uid, token.email || "unknown@lsbsf.org", {
      eventId,
      attendeeId,
    });

    return { success: true, message: "Attendee checked in successfully." };
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
  const role = token.role as string;
  const allowedEvents = (token.allowedEvents || []) as string[];
  const mfaEnrolled = token.mfaEnrolled === true;

  const isSuper = role === "superAdmin" && mfaEnrolled;
  const isEventAdm = role === "eventAdmin" && allowedEvents.includes(eventId) && mfaEnrolled;
  const isRegStaff = role === "registrationStaff" && allowedEvents.includes(eventId);
  const isCheckin = role === "checkinStaff" && allowedEvents.includes(eventId);

  if (!isSuper && !isEventAdm && !isRegStaff && !isCheckin) {
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
      if (!currentData.checkedInAt) {
        throw new Error("Attendee is not checked in, cannot undo.");
      }

      const originalCheckedInAt = currentData.checkedInAt;

      // Reverse check-in status
      transaction.update(attendeeRef, {
        checkedInAt: null,
        ticketStatus: "registered",
      });

      // Log the reversal, preserving the original timestamp explicitly
      await logAudit(db, "attendee_checkin_reversed", context.auth!.uid, token.email || "unknown@lsbsf.org", {
        eventId,
        attendeeId,
        previousCheckedInAt: originalCheckedInAt,
        reason: data.reason || "Manual reversal by staff",
      });
    });

    return { success: true, message: "Check-in reversed successfully." };
  } catch (error: any) {
    console.error("Undo check-in transaction failed:", error);
    throw new functions.https.HttpsError("internal", error.message || "Failed to reverse check-in.");
  }
});
