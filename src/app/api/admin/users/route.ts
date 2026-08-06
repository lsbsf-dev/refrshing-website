import { NextResponse } from "next/server";
import { auth, firestore } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { action, email, password, displayName, role, allowedEvents, uid } = data;

    if (action === "provision") {
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
      } catch (e: any) {
        if (e.code === 'auth/user-not-found') {
          userRecord = await auth.createUser({
            email,
            password: password || 'Refreshing2026!',
            displayName,
          });
        } else {
          throw e;
        }
      }

      await firestore.collection("users").doc(userRecord.uid).set({
        name: displayName,
        email,
        role: role || "viewer",
        allowedEvents: allowedEvents || [],
        isActive: true,
        createdAt: new Date().toISOString()
      }, { merge: true });

      return NextResponse.json({ success: true, uid: userRecord.uid });
    }

    if (action === "update") {
      await firestore.collection("users").doc(uid).set({
        role,
        allowedEvents,
      }, { merge: true });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin Users API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
