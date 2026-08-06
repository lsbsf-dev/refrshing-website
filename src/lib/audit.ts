import { firestore } from "./admin";

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
    // We intentionally don't throw here to avoid failing the main user operation
    // just because logging failed, but in a strict compliance system you might throw.
  }
}
