import { auth, firestore } from "./firebase/admin";
import { hasPermission, Permission } from "./permissions";

export async function verifyApiRequest(req: Request, requiredPermission?: Permission) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authHeader.split("Bearer ")[1];
  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(token);
  } catch (error) {
    throw new Error("Invalid session token");
  }

  const uid = decodedToken.uid;
  const userDoc = await firestore.collection("users").doc(uid).get();
  
  if (!userDoc.exists) {
    throw new Error("User profile not found");
  }

  const profile = { id: userDoc.id, ...userDoc.data() } as any;
  // Use custom claims as the source of truth for permissions, not the user doc
  const tokenRole = decodedToken.role || "viewer";

  if (profile.isActive === false) {
    throw new Error("Account has been deactivated");
  }

  if (requiredPermission && !hasPermission(tokenRole, requiredPermission)) {
    throw new Error(`Insufficient permissions. Requires: ${requiredPermission}`);
  }

  // Also include the token's allowedEvents and role in the returned profile for audit logs to use
  profile.role = tokenRole;
  profile.allowedEvents = decodedToken.allowedEvents || [];

  return profile;
}
