const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Ensure we have required env vars
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error("Missing Firebase Admin credentials in .env.local");
  process.exit(1);
}
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("Missing Cloudinary credentials (API KEY/SECRET) in .env.local");
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY,
    }),
  });
}
const db = admin.firestore();

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const activeEventId = 'refreshing-2026';

// The list of collections and fields to migrate. Specifies if it's event-scoped or root.
const collectionsConfig = [
  { collection: 'ministers', scoped: true, fields: ['photoUrl'] },
  { collection: 'galleryAlbums', scoped: false, fields: ['coverImageUrl'] }, // App queries root
  { collection: 'photos', scoped: false, fields: ['url'] }, // In gallery.ts this is at root
  { collection: 'advertisements', scoped: true, fields: ['bannerUrl'] },
  { collection: 'timelineEntries', scoped: false, fields: ['photoUrl'] }, // Timeline is global
  { collection: 'committeeMembers', scoped: true, fields: ['photoUrl'] },
  { collection: 'downloads', scoped: true, fields: ['fileUrl'] },
  { collection: 'articles', scoped: true, fields: ['coverImageUrl'] },
  { collection: 'resources', scoped: true, fields: ['fileUrl'] },
];

const singletonConfig = [
  {
    path: `events/${activeEventId}/homepageSettings/settings`, 
    fields: ['heroBackgroundImageUrl', 'anniversary.backgroundImageUrl', 'milestone.imageUrl'],
  },
  {
    path: `events/${activeEventId}/aboutSettings/settings`,
    fields: ['themeArchive']
  }
];

const richTextFieldsConfig = [
  {
    path: `events/${activeEventId}/aboutSettings/settings`,
    fields: ['historyHtml', 'visionHtml', 'missionHtml', 'aboutLsbsfHtml'],
  }
];

// Helpers
const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);
const setNestedValue = (obj, path, value) => {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
};

const logStream = fs.createWriteStream(path.resolve(__dirname, 'migration.log'), { flags: 'a' });
const backupStream = fs.createWriteStream(path.resolve(__dirname, 'migration_backup.jsonl'), { flags: 'a' });
const log = (msg) => {
  console.log(msg);
  logStream.write(`[${new Date().toISOString()}] ${msg}\n`);
};

const args = process.argv.slice(2);
const isTestMode = args.includes('--test=ministers');
const isDryRun = args.includes('--dry-run');

async function uploadToCloudinary(url) {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: 'refreshing/migrated/',
      resource_type: 'auto', 
    });
    return result.secure_url;
  } catch (err) {
    throw new Error(`Cloudinary Upload Error: ${err.message}`);
  }
}

async function processDocument(docRef, data, fieldsToMigrate, docName) {
  let updatedData = {};
  let changed = false;

  for (const fieldPath of fieldsToMigrate) {
    if (fieldPath === 'themeArchive') {
      const archive = data.themeArchive || [];
      let archiveChanged = false;
      const updatedArchive = [...archive];
      for (let i = 0; i < updatedArchive.length; i++) {
        const t = updatedArchive[i];
        if (t.imageUrl) {
          let shouldMigrateArchive = false;
          let uploadTargetArchive = null;
          let isLocalArchive = false;

          if (t.imageUrl.includes('firebasestorage.googleapis.com')) {
            shouldMigrateArchive = true;
            uploadTargetArchive = t.imageUrl;
          } else if (t.imageUrl.startsWith('/') && !t.imageUrl.startsWith('//')) {
            shouldMigrateArchive = true;
            uploadTargetArchive = path.join(__dirname, '../public', decodeURIComponent(t.imageUrl));
            isLocalArchive = true;
          }

          if (shouldMigrateArchive) {
            log(`Found URL to migrate in ${docName} -> themeArchive[${i}].imageUrl: ${t.imageUrl}`);
            
            if (!isDryRun) {
              try {
                if (isLocalArchive && !fs.existsSync(uploadTargetArchive)) {
                  throw new Error(`Local file does not exist: ${uploadTargetArchive}`);
                }
                const newUrl = await uploadToCloudinary(uploadTargetArchive);
                log(`SUCCESS: Uploaded to Cloudinary -> ${newUrl}`);
                updatedArchive[i].imageUrl = newUrl;
                archiveChanged = true;
              } catch (e) {
                log(`FAILURE: Failed to upload ${t.imageUrl}. Error: ${e.message}`);
              }
            }
          }
        }
      }
      if (archiveChanged) {
        setNestedValue(updatedData, 'themeArchive', updatedArchive);
        changed = true;
      }
      continue;
    }

    const val = getNestedValue(data, fieldPath);
    let shouldMigrate = false;
    let uploadTarget = null;
    let isLocal = false;

    if (val && typeof val === 'string') {
      if (val.includes('firebasestorage.googleapis.com')) {
        shouldMigrate = true;
        uploadTarget = val;
      } else if (val.startsWith('/') && !val.startsWith('//')) {
        // Handle local paths e.g. /ministers/image.jpg
        shouldMigrate = true;
        uploadTarget = path.join(__dirname, '../public', decodeURIComponent(val));
        isLocal = true;
      }
    }

    if (shouldMigrate) {
      log(`Found URL to migrate in ${docName} -> ${fieldPath}: ${val}`);
      
      // Save to backup before writing
      backupStream.write(JSON.stringify({ docPath: docName, fieldPath, oldUrl: val, isLocal }) + '\n');
      
      if (!isDryRun) {
        try {
          if (isLocal && !fs.existsSync(uploadTarget)) {
            throw new Error(`Local file does not exist: ${uploadTarget}`);
          }
          const newUrl = await uploadToCloudinary(uploadTarget);
          log(`SUCCESS: Uploaded to Cloudinary -> ${newUrl}`);
          setNestedValue(updatedData, fieldPath, newUrl);
          changed = true;
        } catch (uploadErr) {
          log(`FAILURE: Failed to upload ${val}. Error: ${uploadErr.message}`);
        }
      }
    }
  }

  if (changed && !isDryRun) {
    try {
      await docRef.set(updatedData, { merge: true });
      log(`SUCCESS: Updated Firestore document ${docName}`);
    } catch (dbErr) {
      log(`FAILURE: Failed to update Firestore for ${docName}. Error: ${dbErr.message}`);
    }
  }
}

async function checkRichTextFields(docRef, data, fieldsToCheck, docName) {
  for (const fieldPath of fieldsToCheck) {
    const htmlVal = getNestedValue(data, fieldPath);
    if (htmlVal && typeof htmlVal === 'string') {
      const fbUrlRegex = /https:\/\/firebasestorage\.googleapis\.com[^"']+/g;
      const matches = htmlVal.match(fbUrlRegex);
      if (matches && matches.length > 0) {
        log(`WARNING: Found ${matches.length} inline Firebase Storage URLs in rich-text field ${docName} -> ${fieldPath}`);
        matches.forEach((url, i) => {
          log(`  Inline URL [${i + 1}]: ${url}`);
        });
      }
    }
  }
}

async function runMigration() {
  log(`=== Starting Migration ${isTestMode ? '(TEST MODE: ministers only)' : '(FULL MODE)'} ${isDryRun ? '[DRY RUN]' : ''} ===`);

  try {
    for (const config of collectionsConfig) {
      if (isTestMode && config.collection !== 'ministers') continue;

      log(`\n--- Scanning Collection: ${config.collection} ---`);
      
      let query;
      if (config.scoped) {
        query = db.collection("events").doc(activeEventId).collection(config.collection);
      } else {
        query = db.collection(config.collection);
      }
      
      let snapshot;
      try {
        snapshot = await query.get();
      } catch (e) {
        log(`Error fetching ${config.collection}: ${e.message}`);
        continue;
      }

      if (snapshot.empty) {
        log(`No documents found in ${config.collection}`);
        continue;
      }

      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (config.condition && !config.condition(data)) continue;
        const docPath = config.scoped ? `events/${activeEventId}/${config.collection}/${doc.id}` : `${config.collection}/${doc.id}`;
        await processDocument(doc.ref, data, config.fields, docPath);
      }
    }

    if (!isTestMode) {
      log(`\n--- Scanning Singleton Docs ---`);
      for (const config of singletonConfig) {
        const docRef = db.doc(config.path);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          await processDocument(docRef, docSnap.data(), config.fields, config.path);
        } else {
          log(`Document not found: ${config.path}`);
        }
      }

      log(`\n--- Checking Rich Text Fields for Inline Images ---`);
      for (const config of richTextFieldsConfig) {
        const docRef = db.doc(config.path);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          await checkRichTextFields(docRef, docSnap.data(), config.fields, config.path);
        } else {
          log(`Document not found: ${config.path}`);
        }
      }
    }

  } catch (error) {
    log(`CRITICAL ERROR: Migration failed - ${error.message}`);
  }

  log(`\n=== Migration Finished ===`);
  process.exit(0);
}

runMigration();
