import { NextResponse } from "next/server";
import { auth, firestore } from "@/lib/firebase/admin";
import { verifyApiRequest } from "@/lib/api-auth";
import { Permissions } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

function sanitizeUserRecord(doc: FirebaseFirestore.DocumentSnapshot) {
  const data = doc.data() || {};

  return {
    id: doc.id,
    name: data.name || "",
    email: data.email || "",
    role: data.role || "viewer",
    allowedEvents: Array.isArray(data.allowedEvents) ? data.allowedEvents : [],
    isActive: data.isActive ?? true,
    createdAt: data.createdAt || "",
  };
}

export async function GET(req: Request) {
  try {
    await verifyApiRequest(req, Permissions.Users.Read);

    const snap = await firestore.collection("users").orderBy("createdAt", "desc").get();
    const users = snap.docs.map(sanitizeUserRecord);
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Admin Users API GET Error");
    return NextResponse.json({ error: "Unable to load users." }, { status: error?.message?.includes("permission") ? 403 : 500 });
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

      await auth.setCustomUserClaims(userRecord.uid, {
        role: newRecord.role,
        allowedEvents: newRecord.allowedEvents
      });

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
        await firestore.collection("users").doc(uid).set(updateData, { merge: true });

        if (role || allowedEvents) {
           const mergedRole = role || beforeData?.role;
           const mergedEvents = allowedEvents || beforeData?.allowedEvents || [];
           await auth.setCustomUserClaims(uid, {
             role: mergedRole,
             allowedEvents: mergedEvents
           });
        }

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
          await auth.updateUser(uid, {
            ...(displayName && { displayName }),
            ...(email && { email }),
            ...(password && { password }),
          });
        } catch (e: any) {
          console.error("Admin Users API: Failed to update auth profile");
        }
      }
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin Users API Error");
    return NextResponse.json({ error: "Unable to update user." }, { status: 500 });
  }
}
