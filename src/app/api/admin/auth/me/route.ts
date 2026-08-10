import { NextResponse } from "next/server";
import { firestore, auth } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  // Only allow POST
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Ensure the body exists
  const contentLength = (req.headers.get("content-length") ?? "").trim();
  if (!contentLength || Number(contentLength) === 0) {
    console.error("Empty request body");
    return NextResponse.json({ error: "Request body is required" }, { status: 400 });
  }

  // Parse JSON safely
  let payload: any;
  try {
    payload = await req.json();
  } catch (e) {
    console.error("Failed to parse request JSON:", e);
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const { uid } = payload;
  if (!uid) {
    return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  }

  // Verify Firebase services are initialized
  if (!firestore || !auth) {
    console.error("Firebase admin not initialized", { firestore: !!firestore, auth: !!auth });
    return NextResponse.json({ error: "Server configuration error: Firebase not initialized" }, { status: 500 });
  }

  // Fetch user document from Firestore
  let userDoc;
  try {
    userDoc = await firestore.collection("users").doc(uid).get();
  } catch (e) {
    console.error("Failed to read Firestore user doc:", e);
    return NextResponse.json({ error: "Failed to read user profile" }, { status: 500 });
  }

  if (!userDoc.exists) {
    return NextResponse.json({ error: "User profile not found in database" }, { status: 404 });
  }

  const userData = userDoc.data();
  if (userData?.isActive === false) {
    return NextResponse.json({ error: "Your access has been revoked" }, { status: 403 });
  }

  // Fetch auth record for custom claims
  let authUser;
  try {
    authUser = await auth.getUser(uid);
  } catch (e) {
    console.error("Failed to fetch auth user:", e);
    return NextResponse.json({ error: "Failed to retrieve user auth data" }, { status: 500 });
  }

  return NextResponse.json({
    uid: userDoc.id,
    name: userData?.name || "",
    email: userData?.email || "",
    role: authUser.customClaims?.role || "viewer",
    permissions: Array.isArray(authUser.customClaims?.permissions) ? authUser.customClaims.permissions : [],
    allowedEvents: Array.isArray(authUser.customClaims?.allowedEvents) ? authUser.customClaims.allowedEvents : [],
  });
}
