const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const eventId = process.env.NEXT_PUBLIC_ACTIVE_EVENT_ID || 'refreshing-2026';
const projectId = process.env.FIREBASE_PROJECT_ID || 'refreshing-website';

const rawKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/^"|"$/g, '');
const serviceAccount = {
  projectId,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: rawKey.replace(/\\n/g, '\n')
};

if (!serviceAccount.clientEmail || !serviceAccount.privateKey) {
  console.error('Missing Firebase Admin credentials in .env.local.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function countDocs() {
  const collections = [
    'ministers',
    'sessions',
    'announcements',
    'faqs',
    'resources',
    'articles',
    'bibleStudies',
    'homepageSettings',
  ];

  for (const col of collections) {
    const snapshot = await db.collection('events').doc(eventId).collection(col).count().get();
    console.log(`Collection '${col}' has ${snapshot.data().count} documents.`);
  }
}

countDocs().catch(console.error);
