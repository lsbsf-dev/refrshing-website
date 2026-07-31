"use server";

import { adminDb } from "@/lib/firebase/admin";
import ministers from "@/lib/firebase/seedMinisters.json";
import sessions from "@/lib/firebase/seedSessions.json";
import resources from "@/lib/firebase/seedResources.json";

export async function verifySeedSecret(secret: string): Promise<boolean> {
  const adminSecret = process.env.ADMIN_SEED_SECRET;
  if (!adminSecret) {
    console.error("ADMIN_SEED_SECRET environment variable is not configured.");
    return false;
  }
  return secret === adminSecret;
}

export async function seedDatabase(
  secret: string
): Promise<{ success: boolean; message: string }> {
  const isValid = await verifySeedSecret(secret);
  if (!isValid) {
    return {
      success: false,
      message: "Authentication failed: Invalid seeding passkey.",
    };
  }

  try {
    console.log("Starting server-side database seeding...");

    // Seed ministers
    let ministerCount = 0;
    for (const m of ministers) {
      const docRef = adminDb.collection("ministers").doc(m.id);
      await docRef.set({
        eventId: m.eventId,
        slug: m.slug,
        name: m.name,
        photoUrl: m.photoUrl || "",
        biography: m.biography || "",
        affiliation: m.affiliation || "",
        status: m.status,
        category: m.category,
      });
      ministerCount++;
    }
    console.log(`Seeded ${ministerCount} ministers.`);

    // Seed sessions
    let sessionCount = 0;
    for (const s of sessions) {
      const docRef = adminDb.collection("sessions").doc(s.id);
      await docRef.set({
        eventId: s.eventId,
        slug: s.slug,
        day: s.day,
        title: s.title,
        description: s.description || "",
        startTime: s.startTime,
        endTime: s.endTime,
        venue: s.venue || "",
        ministerIds: s.ministerIds || [],
        status: s.status,
      });
      sessionCount++;
    }
    console.log(`Seeded ${sessionCount} sessions.`);

    // Seed resources
    let resourceCount = 0;
    for (const r of resources) {
      const docRef = adminDb.collection("resources").doc(r.id);
      await docRef.set({
        eventId: r.eventId,
        slug: r.slug,
        title: r.title,
        description: r.description || "",
        category: r.category,
        author: r.author || "",
        publishedAt: r.publishedAt || "",
        fileUrl: (r as any).fileUrl || null,
        status: r.status,
      });
      resourceCount++;
    }
    console.log(`Seeded ${resourceCount} resources.`);

    return {
      success: true,
      message: `✅ Database seeded successfully! ${ministerCount} ministers, ${sessionCount} sessions, ${resourceCount} resources.`,
    };
  } catch (error: any) {
    console.error("Seeding error:", error);
    return {
      success: false,
      message: `Seeding execution error: ${error?.message || error}`,
    };
  }
}
