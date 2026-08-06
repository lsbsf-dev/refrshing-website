const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = admin.storage().bucket();
const seedFilePath = path.join(__dirname, '../src/lib/firebase/seedMinisters.json');
const seedData = require(seedFilePath);

async function uploadImages() {
  console.log('Starting image upload...');
  let updated = false;

  for (let i = 0; i < seedData.length; i++) {
    const minister = seedData[i];
    if (minister.photoUrl && minister.photoUrl.startsWith('/ministers/')) {
      const localImagePath = path.join(__dirname, '../public', minister.photoUrl);
      
      if (fs.existsSync(localImagePath)) {
        const destination = `ministers/${path.basename(localImagePath)}`;
        console.log(`Uploading ${localImagePath} to ${destination}...`);
        
        try {
          await bucket.upload(localImagePath, {
            destination: destination,
            metadata: {
              cacheControl: 'public, max-age=31536000',
            }
          });
          
          // Make file public
          const file = bucket.file(destination);
          await file.makePublic();
          
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
          minister.photoUrl = publicUrl;
          updated = true;
          
          // Also update Firestore directly
          const slug = minister.slug || minister.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          await admin.firestore().collection('ministers').doc(slug).set({ photoUrl: publicUrl }, { merge: true });
          
          console.log(`Uploaded! New URL: ${publicUrl}`);
        } catch (error) {
          console.error(`Failed to upload ${localImagePath}:`, error);
        }
      } else {
        console.warn(`Local file not found: ${localImagePath}`);
      }
    }
  }

  if (updated) {
    fs.writeFileSync(seedFilePath, JSON.stringify(seedData, null, 2));
    console.log('Successfully updated seedMinisters.json with public URLs!');
  } else {
    console.log('No images needed uploading.');
  }
}

uploadImages().catch(console.error);
