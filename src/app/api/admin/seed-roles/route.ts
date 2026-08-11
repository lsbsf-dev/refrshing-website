import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase/admin";

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

export async function GET() {
  try {
    const batch = firestore.batch();
    for (const role of systemRoles) {
      const ref = firestore.collection('settings').doc('global').collection('roles').doc(role.id);
      batch.set(ref, role, { merge: true });
    }
    await batch.commit();
    return NextResponse.json({ success: true, message: "System roles seeded" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
