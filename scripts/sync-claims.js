require("dotenv").config({ path: ".env.local" });
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function syncClaims() {
  console.log("Starting claims sync...");
  const snapshot = await db.collection("users").get();
  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const uid = doc.id;
    if (data.role) {
      try {
        await auth.setCustomUserClaims(uid, {
          role: data.role,
          allowedEvents: data.allowedEvents || []
        });
        console.log(`Updated claims for ${uid} (${data.email}) to role: ${data.role}`);
        updated++;
      } catch (err) {
        console.error(`Failed to update claims for ${uid}:`, err.message);
      }
    }
  }
  console.log(`Done! Updated ${updated} users.`);
}

syncClaims().catch(console.error);
