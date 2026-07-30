import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

/**
 * Shared utility to log administrative events into the tamper-proof audit log.
 * Gated strictly so clients cannot write directly.
 */
export async function logAudit(
  db: admin.firestore.Firestore,
  action: string,
  uid: string,
  email: string,
  details: Record<string, any>
): Promise<void> {
  const auditRef = db.collection("audit_logs");
  await auditRef.add({
    action,
    userId: uid,
    userEmail: email,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    details,
  });
}

/**
 * Firestore trigger to audit changes in ministers profile.
 */
export const auditMinistersWrite = functions.firestore
  .document("events/{eventId}/ministers/{ministerId}")
  .onWrite(async (change, context) => {
    const db = admin.firestore();
    const eventId = context.params.eventId;
    const ministerId = context.params.ministerId;
    
    let action = "minister_created";
    let details: any = {};

    if (!change.before.exists && change.after.exists) {
      action = "minister_created";
      details = { eventId, ministerId, name: change.after.data()?.name };
    } else if (change.before.exists && !change.after.exists) {
      action = "minister_deleted";
      details = { eventId, ministerId, name: change.before.data()?.name };
    } else {
      action = "minister_updated";
      details = {
        eventId,
        ministerId,
        changedFields: getDiffFields(change.before.data() || {}, change.after.data() || {}),
      };
    }

    // Since triggers don't run in a user authentication context, we infer from
    // the document metadata or record system trigger context
    await logAudit(db, action, "system_trigger", "firestore@lsbsf-trigger", details);
  });

/**
 * Firestore trigger to audit changes in sessions schedule.
 */
export const auditSessionsWrite = functions.firestore
  .document("events/{eventId}/sessions/{sessionId}")
  .onWrite(async (change, context) => {
    const db = admin.firestore();
    const eventId = context.params.eventId;
    const sessionId = context.params.sessionId;
    
    let action = "session_created";
    let details: any = {};

    if (!change.before.exists && change.after.exists) {
      action = "session_created";
      details = { eventId, sessionId, title: change.after.data()?.title };
    } else if (change.before.exists && !change.after.exists) {
      action = "session_deleted";
      details = { eventId, sessionId, title: change.before.data()?.title };
    } else {
      action = "session_updated";
      details = {
        eventId,
        sessionId,
        changedFields: getDiffFields(change.before.data() || {}, change.after.data() || {}),
      };
    }

    await logAudit(db, action, "system_trigger", "firestore@lsbsf-trigger", details);
  });

/**
 * Firestore trigger to audit updates on attendees (specifically status and payments).
 */
export const auditAttendeesWrite = functions.firestore
  .document("events/{eventId}/attendees/{attendeeId}")
  .onWrite(async (change, context) => {
    const db = admin.firestore();
    const eventId = context.params.eventId;
    const attendeeId = context.params.attendeeId;

    if (change.before.exists && change.after.exists) {
      const beforeData = change.before.data() || {};
      const afterData = change.after.data() || {};

      // Only audit critical attendee updates to prevent noise (payments and logistics status)
      const isPaymentChanged = beforeData.paymentStatus !== afterData.paymentStatus;
      const isRegistrationStatusChanged = beforeData.registrationStatus !== afterData.registrationStatus;

      if (isPaymentChanged || isRegistrationStatusChanged) {
        await logAudit(db, "attendee_logistics_updated", "system_trigger", "firestore@lsbsf-trigger", {
          eventId,
          attendeeId,
          name: afterData.name,
          paymentStatus: { before: beforeData.paymentStatus, after: afterData.paymentStatus },
          registrationStatus: { before: beforeData.registrationStatus, after: afterData.registrationStatus },
        });
      }
    }
  });

/**
 * Helper to calculate differences between two objects
 */
function getDiffFields(before: Record<string, any>, after: Record<string, any>): string[] {
  const changed: string[] = [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changed.push(key);
    }
  }
  return changed;
}
