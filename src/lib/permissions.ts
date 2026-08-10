// All available permissions in the system.
// These correspond directly to module/screen access or actions.
export const Permissions = {
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

export type Permission = string;

/**
 * Helper to check if a permissions array contains a specific required permission.
 */
export function hasPermission(
  userPermissions: string[] | undefined,
  requiredPermission: Permission
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return userPermissions.includes(requiredPermission);
}
