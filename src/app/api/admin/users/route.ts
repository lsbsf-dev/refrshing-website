import { NextResponse } from "next/server";
import { auth, firestore } from "@/lib/firebase/admin";
import { verifyApiRequest } from "@/lib/api-auth";
import { Permissions } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    await verifyApiRequest(req, Permissions.Users.Read);

    const snap = await firestore.collection("users").orderBy("createdAt", "desc").get();
    const users = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Admin Users API GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: error.message.includes("permission") ? 403 : 500 });
  }
}

export async function POST(req: Request) {
  try {
    const callerProfile = await verifyApiRequest(req, Permissions.Users.Write);

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

      const newRecord = {
        name: displayName,
        email,
        role: role || "viewer",
        allowedEvents: allowedEvents || [],
        isActive: true,
        createdAt: new Date().toISOString()
      };

      await firestore.collection("users").doc(userRecord.uid).set(newRecord, { merge: true });

      await logAudit({
        userId: callerProfile.id,
        userEmail: callerProfile.email,
        action: "CREATE",
        collection: "users",
        documentId: userRecord.uid,
        after: newRecord,
        eventContext: callerProfile.allowedEvents?.[0] || "system"
      });

      return NextResponse.json({ success: true, uid: userRecord.uid });
    }

    if (action === "update") {
      console.log("Admin Users API: Starting update for uid:", uid);
      const { _updatedAt: clientUpdatedAt } = data; // from client for optimistic locking
      
      const beforeDoc = await firestore.collection("users").doc(uid).get();
      if (!beforeDoc.exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      const beforeData = beforeDoc.data();

      if (clientUpdatedAt && beforeData?._updatedAt && beforeData._updatedAt !== clientUpdatedAt) {
        return NextResponse.json({ 
          error: "Conflict: This user was modified by someone else since you opened the page. Please refresh and try again.",
          code: "OPTIMISTIC_LOCK_FAILED" 
        }, { status: 409 });
      }

      const updateData: any = {
        _updatedAt: new Date().toISOString()
      };
      if (role) updateData.role = role;
      if (allowedEvents) updateData.allowedEvents = allowedEvents;
      if (displayName) updateData.name = displayName;
      if (email) updateData.email = email;
      
      try {
        console.log("Admin Users API: Updating firestore document...");
        await firestore.collection("users").doc(uid).set(updateData, { merge: true });
        console.log("Admin Users API: Firestore update complete.");

        await logAudit({
          userId: callerProfile.id,
          userEmail: callerProfile.email,
          action: "UPDATE",
          collection: "users",
          documentId: uid,
          before: beforeData,
          after: updateData,
          eventContext: callerProfile.allowedEvents?.[0] || "system"
        });

      } catch (e: any) {
        console.error("Admin Users API: Firestore update failed:", e);
        return NextResponse.json({ error: "Firestore update failed: " + e.message }, { status: 500 });
      }
      
      if (displayName || email || password) {
        try {
          console.log("Admin Users API: Updating auth profile...");
          await auth.updateUser(uid, {
            ...(displayName && { displayName }),
            ...(email && { email }),
            ...(password && { password }),
          });
          console.log("Admin Users API: Auth update complete.");
        } catch (e: any) {
          console.error("Admin Users API: Failed to update auth profile:", e.message);
        }
      }
      
      console.log("Admin Users API: Update successful.");
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin Users API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
