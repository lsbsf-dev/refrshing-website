import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logAudit } from "./audit";

function setCorsHeaders(res: functions.Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
}

async function performCheckIn(
  eventId: string,
  attendeeId: string,
  uid: string,
  email: string,
  role: string,
  allowedEvents: string[]
) {
  const isSuper = role === "superAdmin";
  const isEventAdm = role === "eventAdmin" && allowedEvents.includes(eventId);
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

    transaction.update(attendeeRef, {
      checkedInAt: timestamp,
      ticketStatus: "checked-in",
    });
  });

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
  const role = (token.role as string) || "";
  const allowedEvents = (token.allowedEvents || []) as string[];

  try {
    return await performCheckIn(
      eventId,
      attendeeId,
      context.auth.uid,
      token.email || "unknown@lsbsf.org",
      role,
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

export const markCheckedInHttp = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const authHeader = req.headers.authorization || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const decodedToken = bearer ? await admin.auth().verifyIdToken(bearer) : null;

    if (!decodedToken) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { eventId, attendeeId } = req.body || {};
    if (!eventId || !attendeeId) {
      res.status(400).json({ error: "Both eventId and attendeeId are required arguments." });
      return;
    }

    const token = decodedToken;
    const role = (token.role as string) || "";
    const allowedEvents = ((token.allowedEvents as string[]) || []) as string[];

    const result = await performCheckIn(eventId, attendeeId, decodedToken.uid, token.email || "unknown@lsbsf.org", role, allowedEvents);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("HTTP check-in failed:", error);
    const message = error?.message || "Failed to check in attendee.";
    const statusCode = error?.code === "already-exists" ? 409 : 500;
    res.status(statusCode).json({ error: message });
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

  // Permission checks (MFA removed)
  const isSuper = role === "superAdmin";
  const isEventAdm = role === "eventAdmin" && allowedEvents.includes(eventId);
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
