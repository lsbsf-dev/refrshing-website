/**
 * @file announcement.ts
 * @description TypeScript type definitions for announcements.
 */

export interface Announcement {
  id: string;
  eventId: string;
  title: string;
  content: string;
  category: "Logistics" | "Programme" | "General";
  publishedAt: string; // ISO string
  expiresAt: string; // ISO string
  status: "draft" | "published";
  isUrgent?: boolean;
}
