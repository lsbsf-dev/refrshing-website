import * as admin from "firebase-admin";

const hasEnvCreds =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
  if (hasEnvCreds) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY!
      .replace(/^"+|"+$/g, '')
      .replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  } else {
    admin.initializeApp();
  }
}

const db = admin.firestore();

function generateSlug(text: string): string {
  if (!text) return "unknown";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

async function run() {
  const eventId = "refreshing-2026";
  console.log(`Starting analytics backfill for event: ${eventId}`);

  const attendeesSnap = await db.collection("events").doc(eventId).collection("attendees").get();
  
  console.log(`Found ${attendeesSnap.size} attendees. Processing...`);

  let totalRegistered = 0;
  let totalCheckedIn = 0;
  const conferences: Record<string, { registered: number; checkedIn: number }> = {};
  const associations: Record<string, { name: string; conferenceId: string; registered: number; checkedIn: number }> = {};

  attendeesSnap.forEach((doc) => {
    const data = doc.data();
    const isCheckedIn = data.checkIn?.checkedIn === true || !!data.checkIn?.checkedInAt || !!data.checkedInAt;
    const conferenceId = data.conferenceId || "other";

    let groupingName = "";
    if (conferenceId === "campus_fellowship") {
      groupingName = data.campusFellowshipName || "Unknown Campus";
    } else {
      groupingName = data.associationName || "Unknown Association";
    }
    const slug = generateSlug(groupingName);

    // Global
    totalRegistered++;
    if (isCheckedIn) totalCheckedIn++;

    // Conference
    if (!conferences[conferenceId]) {
      conferences[conferenceId] = { registered: 0, checkedIn: 0 };
    }
    conferences[conferenceId].registered++;
    if (isCheckedIn) conferences[conferenceId].checkedIn++;

    // Association
    if (!associations[slug]) {
      associations[slug] = { name: groupingName, conferenceId, registered: 0, checkedIn: 0 };
    }
    associations[slug].registered++;
    if (isCheckedIn) associations[slug].checkedIn++;
  });

  console.log("Writing main analytics summary...");
  const mainRef = db.collection("events").doc(eventId).collection("analyticsSummary").doc("main");
  await mainRef.set({
    totalRegistered,
    totalCheckedIn,
    conferences,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log("Writing associations subcollection...");
  const batch = db.batch();
  let count = 0;
  for (const [slug, data] of Object.entries(associations)) {
    const assocRef = mainRef.collection("byAssociation").doc(slug);
    batch.set(assocRef, {
      id: slug,
      name: data.name,
      conferenceId: data.conferenceId,
      registered: data.registered,
      checkedIn: data.checkedIn,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    count++;
    if (count % 500 === 0) {
      await batch.commit();
    }
  }
  if (count % 500 !== 0) {
    await batch.commit();
  }

  console.log("Backfill complete!");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
