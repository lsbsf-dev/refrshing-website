const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

if (process.env.FIREBASE_PRIVATE_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
} else {
  console.warn("FIREBASE_PRIVATE_KEY not found in .env.local. Assuming default credentials.");
  admin.initializeApp();
}

// Old RolePermissions map from src/lib/permissions.ts
const Permissions = {
  Users: { Read: "users.read", Write: "users.write" },
  Programme: { Read: "programme.read", Write: "programme.write", Publish: "programme.publish" },
  Ministers: { Read: "ministers.read", Write: "ministers.write" },
  Gallery: { Read: "gallery.read", Write: "gallery.write", Publish: "gallery.publish" },
  MediaLibrary: { Read: "medialibrary.read", Write: "medialibrary.write" },
  Announcements: { Read: "announcements.read", Write: "announcements.write" },
  Resources: { Read: "resources.read", Write: "resources.write" },
  Homepage: { Read: "homepage.read", Write: "homepage.write" },
  About: { Read: "about.read", Write: "about.write" },
  Faqs: { Read: "faqs.read", Write: "faqs.write" },
  Registrations: { Read: "registrations.read", Write: "registrations.write", CheckIn: "registrations.checkin" },
  Analytics: { Read: "analytics.read" },
  Reports: { Read: "reports.read", Export: "reports.export" },
  Settings: { Read: "settings.read", Write: "settings.write" },
  Enquiries: { Read: "enquiries.read", Write: "enquiries.write" }
};

const RolePermissions = {
  superAdmin: [
    ...Object.values(Permissions.Users),
    ...Object.values(Permissions.Programme),
    ...Object.values(Permissions.Ministers),
    ...Object.values(Permissions.Gallery),
    ...Object.values(Permissions.MediaLibrary),
    ...Object.values(Permissions.Announcements),
    ...Object.values(Permissions.Resources),
    ...Object.values(Permissions.Homepage),
    ...Object.values(Permissions.About),
    ...Object.values(Permissions.Faqs),
    ...Object.values(Permissions.Registrations),
    ...Object.values(Permissions.Analytics),
    ...Object.values(Permissions.Reports),
    ...Object.values(Permissions.Settings),
    ...Object.values(Permissions.Enquiries),
  ],
  eventAdmin: [
    ...Object.values(Permissions.Programme),
    ...Object.values(Permissions.Ministers),
    ...Object.values(Permissions.Resources),
    ...Object.values(Permissions.Homepage),
    ...Object.values(Permissions.About),
    ...Object.values(Permissions.Faqs),
    ...Object.values(Permissions.Announcements),
    Permissions.Reports.Read,
    Permissions.Reports.Export,
    Permissions.Analytics.Read,
    ...Object.values(Permissions.Enquiries),
  ],
  editor: [
    ...Object.values(Permissions.Gallery),
    ...Object.values(Permissions.MediaLibrary),
    ...Object.values(Permissions.Announcements),
    Permissions.Ministers.Read,
    Permissions.Homepage.Write,
    Permissions.Homepage.Read,
    Permissions.About.Read,
    Permissions.About.Write,
    Permissions.Faqs.Read,
    Permissions.Faqs.Write,
  ],
  registrationStaff: [
    ...Object.values(Permissions.Registrations),
    Permissions.Reports.Read,
    Permissions.Reports.Export,
  ],
  checkinStaff: [
    Permissions.Registrations.Read,
    Permissions.Registrations.CheckIn,
  ],
  viewer: [
    Permissions.Analytics.Read,
    Permissions.Reports.Read,
    Permissions.Registrations.Read,
  ],
};

async function migrateClaims() {
  console.log("Starting custom claims migration...");
  let pageToken;
  let totalMigrated = 0;
  let totalErrors = 0;

  do {
    const listUsersResult = await admin.auth().listUsers(1000, pageToken);
    
    for (const user of listUsersResult.users) {
      const claims = user.customClaims || {};
      const role = claims.role;

      if (!role) {
        console.log(`Skipping user ${user.uid} (${user.email}): No role claim found.`);
        continue;
      }

      const permissions = RolePermissions[role] || [];
      const newClaims = {
        ...claims,
        permissions,
      };

      try {
        await admin.auth().setCustomUserClaims(user.uid, newClaims);
        console.log(`SUCCESS: Migrated user ${user.uid} (${user.email}) - Role: ${role} - ${permissions.length} permissions set.`);
        totalMigrated++;
      } catch (err) {
        console.error(`ERROR: Failed to migrate user ${user.uid} (${user.email}):`, err);
        totalErrors++;
      }
    }

    pageToken = listUsersResult.pageToken;
  } while (pageToken);

  console.log(`\nMigration completed.`);
  console.log(`Total users successfully migrated: ${totalMigrated}`);
  console.log(`Total users failed: ${totalErrors}`);
}

migrateClaims()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal migration error:", err);
    process.exit(1);
  });
