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
  const sessionSnap = await db.collection('events').doc(eventId).collection('sessions').get();
  const articleSnap = await db.collection('events').doc(eventId).collection('articles').get();
  const bibleSnap = await db.collection('events').doc(eventId).collection('bibleStudies').get();
  const ministerSnap = await db.collection('events').doc(eventId).collection('ministers').get();
  console.log('sessions=', sessionSnap.size);
  console.log('articles=', articleSnap.size);
  console.log('bibleStudies=', bibleSnap.size);
  console.log('ministers=', ministerSnap.size);
  ministerSnap.docs.forEach((doc) => {
    const data = doc.data();
    console.log(doc.id + ' | ' + data.name + ' | biography=' + (data.biography ? 'yes' : 'no'));
  });
})();
