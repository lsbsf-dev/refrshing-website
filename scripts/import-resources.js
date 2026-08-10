const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
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

async function importResources() {
  const filePath = path.join(__dirname, '..', 'src', 'lib', 'firebase', 'seedResources.json');
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${filePath}`);
    process.exit(1);
  }

  const resources = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const collectionRef = db.collection('events').doc(eventId).collection('resources');
  
  let written = 0;
  for (const item of resources) {
    const docId = item.slug || item.id;
    await collectionRef.doc(docId).set({
      ...item,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    written++;
  }

  console.log(`Successfully imported ${written} resources into Firestore.`);
}

importResources().catch(console.error);
