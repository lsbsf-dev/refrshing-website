const admin = require('firebase-admin');
require('dotenv').config({ path: 'c:/Users/HP/Documents/Github/refrshing-website/.env.local' });
const projectId = process.env.FIREBASE_PROJECT_ID || 'refreshing-website';
const serviceAccount = { projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n') };
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();
(async () => {
  const eventId = 'refreshing-2026';
  const snap = await db.collection('events').doc(eventId).collection('aboutSettings').get();
  console.log('aboutSettings=', snap.size);
  for (const doc of snap.docs) {
    const data = doc.data();
    console.log(doc.id, { historyHtml: !!data.historyHtml, aboutLsbsfHtml: !!data.aboutLsbsfHtml, missionHtml: !!data.missionHtml });
  }
})();
