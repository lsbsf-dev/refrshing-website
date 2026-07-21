/**
 * Event Type Model
 * Defines the schema structure for a conference edition.
 */

export interface Event {
  id: string; // e.g. "refreshing-2026"
  name: string;
  theme: string;
  scripture: string;
  startDate: string; // ISO string representation
  endDate: string;
  venue: string;
  status: "draft" | "active" | "completed";
}
