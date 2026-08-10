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

// Initialize Firebase Admin
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

// Initialize Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

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

async function migrateCollection(collectionName, urlField) {
  console.log(`\n=== Migrating ${collectionName} ===`);
  const snapshot = await db.collection(collectionName).get();
  
  if (snapshot.empty) {
    console.log(`No documents found in ${collectionName}`);
    return;
  }

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const url = data[urlField];
    
    if (url && typeof url === 'string' && url.includes('firebasestorage.googleapis.com')) {
      console.log(`Found Firebase URL in ${collectionName}/${doc.id}: ${url}`);
      try {
        const newUrl = await uploadToCloudinary(url);
        console.log(`SUCCESS: Uploaded to Cloudinary -> ${newUrl}`);
        await doc.ref.update({ [urlField]: newUrl });
      } catch (err) {
        console.log(`FAILURE: ${err.message}`);
      }
    }
  }
}

async function run() {
  await migrateCollection('galleryAlbums', 'coverImageUrl');
  await migrateCollection('photos', 'url');
  console.log("\n=== Migration Finished ===");
  process.exit(0);
}

run();
