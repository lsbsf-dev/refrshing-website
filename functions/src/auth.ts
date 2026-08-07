import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { z } from "zod";
import * as crypto from "crypto";
import { logAudit } from "./audit";

// Validation schemas using Zod
const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["superAdmin", "eventAdmin", "editor", "registrationStaff", "checkinStaff", "viewer"]),
  allowedEvents: z.array(z.string()),
});

/**
 * Callable function to invite a new administrator user.
 * Gated strictly to superAdmin.
 */
export const createInvite = functions.runWith({ secrets: ["EMAIL_API_KEY"] }).https.onCall(async (data, context) => {
  // 1. Verify caller has superAdmin privileges
  if (!context.auth || context.auth.token.role !== "superAdmin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only superAdmin can invite users."
    );
  }

  // 2. Validate inputs
  const parsed = inviteSchema.safeParse(data);
  if (!parsed.success) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid invite configuration parameters."
    );
  }

  const { email, role, allowedEvents } = parsed.data;
  const db = admin.firestore();
  
  // 3. Create a disabled Firebase Auth user (if they don't exist already)
  let authUser;
  try {
    authUser = await admin.auth().getUserByEmail(email);
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      authUser = await admin.auth().createUser({
        email,
        disabled: true,
      });
    } else {
      throw new functions.https.HttpsError("internal", error.message);
    }
  }

  // 4. Create an expiring invite token document
  const inviteToken = crypto.randomBytes(32).toString("hex");
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 48); // 48-hour lifespan

  await db.collection("invites").doc(inviteToken).set({
    uid: authUser.uid,
    email,
    role,
    allowedEvents,
    used: false,
    expiresAt: admin.firestore.Timestamp.fromDate(expirationDate),
  });

  // 5. Send onboarding email (using secrets config)
  const emailApiKey = process.env.EMAIL_API_KEY || "";
  const inviteLink = `https://admin.refreshingwebsite.netlify.app/accept-invite?token=${inviteToken}`;
  console.log(`Sending invite email to ${email} (ApiKey present: ${!!emailApiKey}): Link: ${inviteLink}`);
  
  // Note: Integrate with SendGrid/SMTP credentials here based on emailApiKey

  // 6. Log audit event
  await logAudit(db, "user_invited", context.auth.uid, context.auth.token.email || "unknown", {
    invitedEmail: email,
    assignedRole: role,
  });

  return { success: true, message: "User invited successfully." };
});

/**
 * Callable function to accept invitation and activate account.
 */
export const acceptInvite = functions.https.onCall(async (data, context) => {
  const { token, password } = data;
  if (!token || !password || password.length < 8) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid token or password strength."
    );
  }

  const db = admin.firestore();
  const inviteRef = db.collection("invites").doc(token);
  const inviteDoc = await inviteRef.get();

  if (!inviteDoc.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      "Invitation token is invalid."
    );
  }

  const inviteData = inviteDoc.data();
  if (inviteData?.used || inviteData?.expiresAt.toDate() < new Date()) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Invitation token has expired or already been used."
    );
  }

  const { uid, email, role, allowedEvents } = inviteData as any;

  // 1. Enable account and set password
  await admin.auth().updateUser(uid, {
    password,
    disabled: false,
  });

  // 2. Set Custom Claims (MFA set to false initially)
  await admin.auth().setCustomUserClaims(uid, { role, allowedEvents });

  // 3. Mark invite as used
  await inviteRef.update({ used: true });

  // 4. Initialize user configuration document with tokensValidAfter set to prevent stale login bypasses
  await db.collection("users").doc(uid).set({
    uid,
    email,
    role,
    allowedEvents,
    tokensValidAfter: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 5. Log audit
  await logAudit(db, "user_invite_accepted", uid, email, { role });

  return { success: true, message: "Account activated. Please log in and complete MFA enrollment if required." };
});

/**
 * Callable function to verify client-side TOTP MFA enrollment and activate the claim.
 */
// MFA enrollment functionality removed per spec; no longer needed.

/**
 * Set user role claims manually (superAdmin-only).
 */
export const setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== "superAdmin") {
    throw new functions.https.HttpsError("permission-denied", "Unauthorized.");
  }

  const { targetUid, role, allowedEvents } = data;
  if (!targetUid || !role || !allowedEvents) {
    throw new functions.https.HttpsError("invalid-argument", "Missing parameters.");
  }

  const db = admin.firestore();
  
  // Set claims
  await admin.auth().setCustomUserClaims(targetUid, {
    role,
    allowedEvents,
// mfaEnrolled claim removed as MFA is not required
  });

  await db.collection("users").doc(targetUid).update({
    role,
    allowedEvents,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await logAudit(db, "user_role_changed", context.auth.uid, context.auth.token.email || "unknown", {
    targetUid,
    role,
    allowedEvents,
  });

  return { success: true };
});

/**
 * Revoke user access and terminate sessions immediately.
 */
export const revokeUserAccess = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Auth required.");
  }

  const { targetUid } = data;
  if (!targetUid) {
    throw new functions.https.HttpsError("invalid-argument", "Missing targetUid.");
  }

  const token = context.auth.token;
  const role = token.role as string;
  const db = admin.firestore();

  // Validate the caller can perform deactivation
  const isSuper = role === "superAdmin";
  if (!isSuper) {
    throw new functions.https.HttpsError("permission-denied", "Unauthorized action.");
  }

  // 1. Disable in Firebase Auth
  await admin.auth().updateUser(targetUid, { disabled: true });

  // 2. Revoke refresh tokens
  await admin.auth().revokeRefreshTokens(targetUid);

  // 3. Update tokensValidAfter in Firestore user doc to invalidate active browser sessions
  await db.collection("users").doc(targetUid).update({
    tokensValidAfter: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 4. Log audit trail
  await logAudit(db, "user_access_revoked", context.auth.uid, token.email || "unknown", {
    revokedUid: targetUid,
  });

  return { success: true, message: "User access revoked and active sessions killed." };
});
