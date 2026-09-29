/**
 * @file import.ts
 * @description TypeScript type definitions for bulk attendee import datasets.
 */

export interface AttendeeData {
  id: string; // The row ID or generated ID
  eventId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  memberStatus: "Member" | "Executive";
  
  conferenceRaw: string;
  associationRaw: string;
  churchRaw: string;
  campusFellowshipRaw: string;
  otherSchoolRaw: string;
  expectationRaw: string;
  
  hasPaidRaw: string;
  
  conferenceId?: string;
  associationId?: string;
  churchId?: string;
  campusFellowshipId?: string;
  transferCompleted?: boolean;
  
  [key: string]: any;
}

export interface FieldError {
  field: keyof AttendeeData;
  code: string;
  message: string;
  suggestedMatch?: string;
  suggestedId?: string;
}

export interface ProcessedRow {
  originalIndex: number;
  originalData: AttendeeData;
  data: AttendeeData;
  status: "valid" | "error" | "possible_duplicate" | "confirmed_duplicate";
  errors: FieldError[];
  duplicateOf?: string;
  importDecision?: "include" | "skip" | "force_import";
  edited: boolean;
}
