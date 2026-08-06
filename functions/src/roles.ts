import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logAudit } from "./audit";

/**
 * Provisions a new administrative user account.
 * Only Super Administrators can call this function.
 */
export const provisionAdminAccount = functions.https.onCall(async (data, context) => {
  // 1. Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Request must be authenticated.");
  }

  const callerToken = context.auth.token;
  if (callerToken.role !== "superAdmin" || !callerToken.mfaEnrolled) {
    throw new functions.https.HttpsError("permission-denied", "Only Super Administrators can provision accounts.");
  }

  const { email, password, displayName, role, allowedEvents = [] } = data;

  if (!email || !password || !displayName || !role) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
  }

  const validRoles = ["superAdmin", "eventAdmin", "editor", "registrationStaff", "checkinStaff", "viewer"];
  if (!validRoles.includes(role)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid role specified.");
  }

  try {
    // 2. Create Auth User
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // 3. Set Custom Claims
    const claims = {
      role,
      allowedEvents,
      mfaEnrolled: false, // Must be enrolled by the user later
    };
    await admin.auth().setCustomUserClaims(userRecord.uid, claims);

    // 4. Create Metadata Document
    const db = admin.firestore();
    await db.collection("users").doc(userRecord.uid).set({
      email,
      name: displayName,
      role,
      allowedEvents,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      tokensValidAfter: new Date().getTime(),
    });

    // 5. Audit Log
    await logAudit(db, "admin_provisioned", context.auth.uid, callerToken.email || "unknown", {
      provisionedUid: userRecord.uid,
      provisionedEmail: email,
      role,
    });

    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    console.error("Error provisioning admin account:", error);
    throw new functions.https.HttpsError("internal", error.message || "Failed to provision account.");
  }
});
