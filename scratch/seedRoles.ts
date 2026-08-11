import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars so we can authenticate
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Fallback if no service account is provided, hoping default credentials work
    admin.initializeApp({
      projectId: 'refreshing-website'
    });
  }
}

const db = admin.firestore();

const systemRoles = [
  {
    id: 'superAdmin',
    name: 'Super Administrator',
    description: 'System-wide access to all modules.',
    isSystemRole: true,
    permissions: [
      'users.read', 'users.write',
      'programme.read', 'programme.write', 'programme.publish',
      'ministers.read', 'ministers.write',
      'gallery.read', 'gallery.write', 'gallery.publish',
      'medialibrary.read', 'medialibrary.write',
      'announcements.read', 'announcements.write',
      'resources.read', 'resources.write',
      'homepage.read', 'homepage.write',
      'about.read', 'about.write',
      'faqs.read', 'faqs.write',
      'registrations.read', 'registrations.write', 'registrations.checkin',
      'analytics.read',
      'reports.read', 'reports.export',
      'settings.read', 'settings.write',
      'enquiries.read', 'enquiries.write'
    ]
  },
  {
    id: 'eventAdmin',
    name: 'Event Administrator',
    description: 'Manage all features within an event.',
    isSystemRole: true,
    permissions: [
      'users.read',
      'programme.read', 'programme.write', 'programme.publish',
      'ministers.read', 'ministers.write',
      'gallery.read', 'gallery.write', 'gallery.publish',
      'medialibrary.read', 'medialibrary.write',
      'announcements.read', 'announcements.write',
      'resources.read', 'resources.write',
      'homepage.read', 'homepage.write',
      'about.read', 'about.write',
      'faqs.read', 'faqs.write',
      'registrations.read', 'registrations.write', 'registrations.checkin',
      'analytics.read',
      'reports.read', 'reports.export',
      'settings.read', 'settings.write',
      'enquiries.read', 'enquiries.write'
    ]
  },
  {
    id: 'registrationStaff',
    name: 'Registration Staff',
    description: 'Manage registrations and view analytics.',
    isSystemRole: true,
    permissions: [
      'registrations.read', 'registrations.write', 'registrations.checkin',
      'analytics.read'
    ]
  },
  {
    id: 'checkinStaff',
    name: 'Check-in Staff',
    description: 'Check in attendees at the venue.',
    isSystemRole: true,
    permissions: [
      'registrations.checkin'
    ]
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Manage content like programme, ministers, resources, and gallery.',
    isSystemRole: true,
    permissions: [
      'programme.read', 'programme.write',
      'ministers.read', 'ministers.write',
      'gallery.read', 'gallery.write',
      'medialibrary.read', 'medialibrary.write',
      'announcements.read', 'announcements.write',
      'resources.read', 'resources.write',
      'homepage.read', 'homepage.write',
      'about.read', 'about.write',
      'faqs.read', 'faqs.write'
    ]
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to most admin areas.',
    isSystemRole: true,
    permissions: [
      'users.read', 'programme.read', 'ministers.read', 'gallery.read',
      'medialibrary.read', 'announcements.read', 'resources.read',
      'homepage.read', 'about.read', 'faqs.read', 'registrations.read',
      'analytics.read', 'reports.read', 'settings.read', 'enquiries.read'
    ]
  }
];

async function seed() {
  const batch = db.batch();
  for (const role of systemRoles) {
    const ref = db.collection('settings').doc('global').collection('roles').doc(role.id);
    batch.set(ref, role, { merge: true });
  }
  await batch.commit();
  console.log('Seeded system roles successfully.');
}

seed().catch(console.error);
