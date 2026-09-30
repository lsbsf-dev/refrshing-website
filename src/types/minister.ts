/**
 * @file minister.ts
 * @description TypeScript type definitions for speakers and ministers.
 */

export interface Minister {
  id: string;
  eventId: string;
  slug: string;
  name: string;
  photoUrl: string;
  biography: string;
  status: "draft" | "published";
  category: "keynote" | "music" | "panelist";
}
