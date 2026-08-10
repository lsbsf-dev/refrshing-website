import * as admin from 'firebase-admin';

// Protect against multiple initializations and handle missing/invalid credentials gracefully.
let initialized = false;
if (!admin.apps.length) {
  try {
    const hasEnvCreds =
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY;

    console.log('🔧 Firebase env credentials present:', {
      projectId: !!process.env.FIREBASE_PROJECT_ID,
      clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    });

    if (hasEnvCreds) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY!
        .replace(/^\"+|\"+$/g, '')
        .replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
    } else {
      // Fallback to ADC – will work in GCP environments but likely fail locally.
      admin.initializeApp();
    }
    initialized = true;
    console.log('✅ Firebase Admin initialized successfully');
  } catch (e) {
    console.error('⚡️ Firebase Admin init failed', e);
    // initialized remains false
  }
} else {
  initialized = true; // Set to true if already initialized (e.g., during Next.js Hot Module Replacement)
}

export const auth = initialized ? admin.auth() : (null as any);
export const firestore = initialized ? admin.firestore() : (null as any);
export const adminDb = firestore; // Alias for backward compatibility
export const storage = initialized ? admin.storage() : (null as any);
