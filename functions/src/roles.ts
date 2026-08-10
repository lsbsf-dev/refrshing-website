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
  if (callerToken.role !== "superAdmin") {
    throw new functions.https.HttpsError("permission-denied", "Only Super Administrators can provision accounts.");
  }

  const { email, password, displayName, role, allowedEvents = [] } = data;

  if (!email || !password || !displayName || !role) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
  }

  const db = admin.firestore();

  // Fetch role permissions
  let permissions: string[] = [];
  try {
    const roleDoc = await db.collection("settings").doc("global").collection("roles").doc(role).get();
    if (roleDoc.exists) {
      permissions = roleDoc.data()?.permissions || [];
    } else {
      // If role doesn't exist in DB (e.g. legacy system role), we could hard fail or provide empty perms.
      // We will require roles to be explicitly defined in settings/global/roles.
      throw new Error(`Role ${role} not found in system settings.`);
    }
  } catch (err: any) {
    throw new functions.https.HttpsError("invalid-argument", err.message || "Failed to resolve role permissions.");
  }

  try {
    // 2. Create Auth User
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // 3. Set Custom Claims
    const claims = { role, permissions, allowedEvents };
    await admin.auth().setCustomUserClaims(userRecord.uid, claims);

    // 4. Create Metadata Document
    await db.collection("users").doc(userRecord.uid).set({
      email,
      name: displayName,
      role,
      allowedEvents,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      tokensValidAfter: Math.floor(Date.now() / 1000),
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

/**
 * Updates an existing role's permissions and syncs claims to all assigned users.
 */
export const updateRole = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== "superAdmin") {
    throw new functions.https.HttpsError("permission-denied", "Only Super Administrators can update roles.");
  }

  const { roleId, permissions, description, name } = data;
  if (!roleId || !Array.isArray(permissions)) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
  }

  const db = admin.firestore();

  try {
    // 1. Update Role in Firestore
    await db.collection("settings").doc("global").collection("roles").doc(roleId).set({
      name: name || roleId,
      description: description || "",
      permissions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // 2. Sync custom claims for existing users with this role
    let pageToken;
    const usersToUpdate = [];
    do {
      const listUsersResult = await admin.auth().listUsers(1000, pageToken);
      for (const user of listUsersResult.users) {
        if (user.customClaims?.role === roleId) {
          usersToUpdate.push(user);
        }
      }
      pageToken = listUsersResult.pageToken;
    } while (pageToken);

    // Update users in parallel, logging per-user success/failure
    const results = await Promise.allSettled(
      usersToUpdate.map(async (user) => {
        const claims = { ...(user.customClaims || {}), permissions };
        await admin.auth().setCustomUserClaims(user.uid, claims);
        return user.uid;
      })
    );

    const syncResults = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return { uid: usersToUpdate[index].uid, status: "success" };
      } else {
        return { uid: usersToUpdate[index].uid, status: "failed", error: result.reason?.message };
      }
    });

    // 3. Audit Log with detailed results
    await logAudit(db, "role_updated", context.auth.uid, context.auth.token.email || "unknown", {
      roleId,
      permissionsCount: permissions.length,
      usersSynced: usersToUpdate.length,
      syncResults,
    });

    return { success: true, syncResults };
  } catch (error: any) {
    console.error("Error updating role:", error);
    throw new functions.https.HttpsError("internal", error.message || "Failed to update role.");
  }
});
