const admin = require('firebase-admin');
const fs = require('fs');

const email = process.argv[2];
if (!email) {
  console.error("Please provide an email. Usage: node scripts/bypass-mfa.js <email>");
  process.exit(1);
}

// Check for service account
let serviceAccount;
try {
  serviceAccount = require('../serviceAccountKey.json');
} catch (e) {
  require('dotenv').config({ path: '.env.local' });
  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.error("Error: Could not find ../serviceAccountKey.json and FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY are not set in .env.local.");
      process.exit(1);
    }
  } else {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }
}

const config = {};
if (serviceAccount) {
    config.credential = admin.credential.cert(serviceAccount);
} else {
    config.credential = admin.credential.applicationDefault();
}

admin.initializeApp(config);

async function bypassMfa() {
  try {
    const user = await admin.auth().getUserByEmail(email);
    const currentClaims = user.customClaims || {};
    
    console.log(`Found user: ${user.uid}`);
    console.log(`Current custom claims:`, currentClaims);
    
    const newClaims = {
      ...currentClaims,
      mfaEnrolled: true
    };
    
    await admin.auth().setCustomUserClaims(user.uid, newClaims);
    console.log(`\nSuccess! Updated custom claims for ${email}. mfaEnrolled is now true.`);
    console.log(`New custom claims:`, newClaims);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

bypassMfa();
