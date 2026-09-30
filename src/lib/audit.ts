/**
 * @file audit.ts
 * @description Server audit logger for tracking sensitive admin actions in Firestore.
 */

import { firestore } from "./firebase/admin";

export interface AuditLogEntry {
  userId: string;
  userEmail: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN";
  collection: string;
  documentId: string;
  before?: any;
  after?: any;
  eventContext: string;
}

export async function logAudit(entry: AuditLogEntry) {
  try {
    await firestore.collection("audit_logs").add({
      ...entry,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
