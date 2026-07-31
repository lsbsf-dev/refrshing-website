/**
 * Firebase Admin SDK Initialization
 * Server-side only. Initializes with service account credentials from env vars
 * if available, otherwise falls back to project-only mode for local dev.
 */

import * as admin from "firebase-admin";

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "dummy-project";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
  try {
    if (privateKey && clientEmail) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
      console.log("Firebase Admin initialized via service account credentials.");
    } else {
      admin.initializeApp({ projectId });
      console.log(`Firebase Admin initialized in local/default mode for project: ${projectId}`);
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
  }
}

const adminDb = admin.firestore();

export { adminDb };
