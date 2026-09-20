// scripts/check_all_urls.js
// Verify every Cloudinary URL that was written by the migration.
// Reads migration_backup.jsonl, fetches the current field value from Firestore,
// performs a HEAD request and logs the HTTP status code.

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // ensure dependency exists (node-fetch is a dev dependency in many projects)
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function loadBackup() {
  const backupPath = path.resolve(__dirname, 'migration_backup.jsonl');
  if (!fs.existsSync(backupPath)) {
    console.error('Backup file not found at', backupPath);
    process.exit(1);
  }
  const lines = fs.readFileSync(backupPath, 'utf8').trim().split('\n');
  return lines.map(l => JSON.parse(l));
}

async function verifyUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.status;
  } catch (e) {
    return `error:${e.message}`;
  }
}

(async () => {
  const entries = await loadBackup();
  console.log(`Verifying ${entries.length} migrated URLs...`);
  for (const e of entries) {
    const docSnap = await db.doc(e.docPath).get();
    if (!docSnap.exists) {
      console.warn(`Document missing: ${e.docPath}`);
      continue;
    }
    const currentUrl = docSnap.get(e.fieldPath);
    if (!currentUrl) {
      console.warn(`Field ${e.fieldPath} missing in ${e.docPath}`);
      continue;
    }
    const status = await verifyUrl(currentUrl);
    console.log(`${e.docPath} -> ${currentUrl} => ${status}`);
  }
  process.exit(0);
})();
