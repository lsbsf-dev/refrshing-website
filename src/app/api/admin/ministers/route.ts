import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/admin";
import { verifyApiRequest } from "@/lib/api-auth";
import { Permissions } from "@/lib/permissions";

export async function POST(req: Request) {
  try {
    await verifyApiRequest(req, Permissions.Ministers.Write);
    const data = await req.json();
    const { action, ministerId, payload, eventId } = data;

    if (action === "create") {
      if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
      const slug = payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await firestore.collection("events").doc(eventId).collection("ministers").doc(slug).set(payload);
      return NextResponse.json({ success: true, slug });
    }

    if (action === "update") {
      if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
      await firestore.collection("events").doc(eventId).collection("ministers").doc(ministerId).set(payload, { merge: true });
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const eventId = data.eventId; // We need to pass eventId from the frontend for delete
      if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
      await firestore.collection("events").doc(eventId).collection("ministers").doc(ministerId).update({ status: "deleted" });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin Ministers API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
