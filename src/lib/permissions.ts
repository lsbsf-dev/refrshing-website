export const Permissions = {
  Users: {
    Read: "users.read",
    Write: "users.write",
  },
  Programme: {
    Read: "programme.read",
    Write: "programme.write",
    Publish: "programme.publish",
  },
  Ministers: {
    Read: "ministers.read",
    Write: "ministers.write",
  },
  Gallery: {
    Read: "gallery.read",
    Write: "gallery.write",
    Publish: "gallery.publish",
  },
  MediaLibrary: {
    Read: "medialibrary.read",
    Write: "medialibrary.write",
  },
  Announcements: {
    Read: "announcements.read",
    Write: "announcements.write",
  },
  Resources: {
    Read: "resources.read",
    Write: "resources.write",
  },
  Homepage: {
    Read: "homepage.read",
    Write: "homepage.write",
  },
  Registrations: {
    Read: "registrations.read",
    Write: "registrations.write",
    CheckIn: "registrations.checkin",
  },
  Analytics: {
    Read: "analytics.read",
  },
  Reports: {
    Read: "reports.read",
    Export: "reports.export",
  },
  Settings: {
    Read: "settings.read",
    Write: "settings.write",
  },
  Enquiries: {
    Read: "enquiries.read",
    Write: "enquiries.write",
  }
} as const;

// Flatten the permission values for the type
export type Permission = 
  | typeof Permissions.Users[keyof typeof Permissions.Users]
  | typeof Permissions.Programme[keyof typeof Permissions.Programme]
  | typeof Permissions.Ministers[keyof typeof Permissions.Ministers]
  | typeof Permissions.Gallery[keyof typeof Permissions.Gallery]
  | typeof Permissions.MediaLibrary[keyof typeof Permissions.MediaLibrary]
  | typeof Permissions.Announcements[keyof typeof Permissions.Announcements]
  | typeof Permissions.Resources[keyof typeof Permissions.Resources]
  | typeof Permissions.Homepage[keyof typeof Permissions.Homepage]
  | typeof Permissions.Registrations[keyof typeof Permissions.Registrations]
  | typeof Permissions.Analytics[keyof typeof Permissions.Analytics]
  | typeof Permissions.Reports[keyof typeof Permissions.Reports]
  | typeof Permissions.Settings[keyof typeof Permissions.Settings]
  | typeof Permissions.Enquiries[keyof typeof Permissions.Enquiries];

export const RolePermissions: Record<string, Permission[]> = {
  superAdmin: [
    ...Object.values(Permissions.Users),
    ...Object.values(Permissions.Programme),
    ...Object.values(Permissions.Ministers),
    ...Object.values(Permissions.Gallery),
    ...Object.values(Permissions.MediaLibrary),
    ...Object.values(Permissions.Announcements),
    ...Object.values(Permissions.Resources),
    ...Object.values(Permissions.Homepage),
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

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string, permission: Permission): boolean {
  if (!role || !RolePermissions[role]) return false;
  
  // superAdmin implicitly has all permissions (handled by the mapped array, but adding a fallback safety)
  if (role === "superAdmin") return true;

  return RolePermissions[role].includes(permission);
}
