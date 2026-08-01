/**
 * Minister Type Model
 * Schema mapping details for conference speakers.
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
