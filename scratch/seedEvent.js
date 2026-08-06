const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const firestore = admin.firestore();

async function seedEvent() {
  const eventId = process.env.NEXT_PUBLIC_ACTIVE_EVENT_ID || 'refreshing-2026';
  
  const eventDoc = {
    name: "Refreshing Conference 2026",
    theme: "The Glory of the Latter House",
    scripture: "Haggai 2:9",
    startDate: "2026-08-10T00:00:00Z",
    endDate: "2026-08-14T23:59:59Z",
    venue: "The Sanctuary, LSBSF",
    status: "upcoming",
    isMilestone: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await firestore.collection('events').doc(eventId).set(eventDoc, { merge: true });
  console.log(`Successfully seeded event: ${eventId}`);
}

seedEvent().catch(console.error);
