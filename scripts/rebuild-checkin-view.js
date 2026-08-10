const fs = require("fs");
const path = require("path");
const { initializeApp, applicationDefault, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg.startsWith("--")) {
    const [key, value] = arg.split("=");
    const next = value ?? process.argv[i + 1];
    if (next && !next.startsWith("--")) {
      args.set(key.slice(2), next);
      i += 1;
    } else {
      args.set(key.slice(2), "true");
    }
  }
}

const eventId = args.get("event") || process.env.EVENT_ID || process.env.DEFAULT_EVENT_ID || process.env.NEXT_PUBLIC_ACTIVE_EVENT_ID || "refreshing-2026";
const dryRun = args.get("dry-run") === "true" || args.get("dryRun") === "true";

const serviceAccountPath =
  args.get("service-account") ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

const adminCredentials = {
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") : undefined,
};

if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id || adminCredentials.projectId });
} else if (adminCredentials.projectId && adminCredentials.clientEmail && adminCredentials.privateKey) {
  initializeApp({
    credential: cert({
      project_id: adminCredentials.projectId,
      client_email: adminCredentials.clientEmail,
      private_key: adminCredentials.privateKey,
    }),
    projectId: adminCredentials.projectId,
  });
} else {
  initializeApp({ credential: applicationDefault() });
}

const db = getFirestore();

function maskPhone(phoneNumber) {
  const value = phoneNumber || "";
  return value.length > 4 ? `***-***-${value.slice(-4)}` : value;
}

async function rebuildCheckinView() {
  const attendeesRef = db.collection("events").doc(eventId).collection("attendees");
  const snapshot = await attendeesRef.get();

  console.log(`Found ${snapshot.size} attendee records for event '${eventId}'.`);

  if (dryRun) {
    console.log("Dry run only — no Firestore writes were made.");
    return;
  }

  const writes = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const checkinViewRef = db.doc(`events/${eventId}/checkinView/${docSnap.id}`);

    const payload = {
      id: docSnap.id,
      eventId,
      fullName: data.fullName || data.name || "Anonymous",
      photoUrl: data.photoUrl || "",
      memberStatus: data.memberStatus || data.ticketStatus || "Member",
      checkedInAt: data.checkIn?.checkedInAt || data.checkedInAt || null,
      phoneMasked: maskPhone(data.phoneNumber || data.phone || ""),
      churchName: data.churchName || data.church || "",
      associationName: data.associationName || data.association || "",
      campusFellowshipName: data.campusFellowshipName || "",
      updatedAt: FieldValue.serverTimestamp(),
    };

    writes.push(checkinViewRef.set(payload, { merge: true }));
  });

  await Promise.all(writes);
  console.log(`Rebuilt checkinView for ${writes.length} attendees in event '${eventId}'.`);
}

rebuildCheckinView()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to rebuild checkinView:", error);
    process.exit(1);
  });
