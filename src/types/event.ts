/**
 * @file event.ts
 * @description TypeScript type definitions for conference event editions.
 */

export interface AppEvent {
  id: string; // e.g. "refreshing-2026"
  name: string;
  theme: string;
  scripture: string;
  startDate: string; // ISO string representation
  endDate: string;
  venue: string;
  status: "upcoming" | "ongoing" | "completed";
  isMilestone: boolean;
  createdAt?: any;
  updatedAt?: any;
}
