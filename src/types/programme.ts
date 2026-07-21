/**
 * Programme Session Type Model
 * Schema mapping for schedule blocks.
 */

export interface Session {
  id: string;
  eventId: string;
  slug: string;
  day: string; // e.g. "Day 1"
  title: string;
  description: string;
  startTime: string; // ISO string representation
  endTime: string;
  venue: string;
  ministerIds: string[];
  status: "draft" | "published";
}
