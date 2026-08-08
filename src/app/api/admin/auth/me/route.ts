import { NextResponse } from "next/server";
import { firestore, auth } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { uid } = data;

    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const userDoc = await firestore.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User profile not found in database" }, { status: 404 });
    }

    const userData = userDoc.data();
    
    // Ensure they have an active status
    if (userData?.isActive === false) {
      return NextResponse.json({ error: "Your access has been revoked" }, { status: 403 });
    }

    const authUser = await auth.getUser(uid);

    return NextResponse.json({
      uid: userDoc.id,
      name: userData?.name || "",
      email: userData?.email || "",
      role: authUser.customClaims?.role || "viewer",
      allowedEvents: authUser.customClaims?.allowedEvents || [],
    });
  } catch (error: any) {
    console.error("Auth Session API Error:", error);
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
