/**
 * Resource Type Model
 * Schema mapping for downloadable publications and long-form study devotionals.
 */

export interface Resource {
  id: string;
  eventId: string;
  slug: string;
  title: string;
  description: string;
  category: "Bible Studies" | "Articles" | "Session Notes" | "Presentation Slides" | "Sermon Recordings" | "Videos" | "Worship Lyrics" | "Downloads";
  author: string;
  publishedAt: string; // ISO string
  fileUrl?: string; // Download file url
  embedUrl?: string; // Media embed url
  status: "draft" | "published";
}
