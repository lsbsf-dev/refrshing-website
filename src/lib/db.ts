import Dexie, { type EntityTable } from 'dexie';

export interface LocalAttendee {
  id: string; // The attendeeId / registration code
  eventId: string;
  fullName: string;
  photoUrl?: string;
  memberStatus: string;
  checkedInAt: string | null;
  phoneMasked: string;
  churchName?: string;
  associationName?: string;
  campusFellowshipName?: string;
}

export interface CheckinQueueItem {
  id?: number; // auto-increment primary key
  attendeeId: string;
  eventId: string;
  timestamp: string;
  status: 'pending' | 'synced' | 'conflict';
  idempotencyKey: string;
}

export class RefreshingDB extends Dexie {
  attendees!: EntityTable<LocalAttendee, 'id'>;
  checkinQueue!: EntityTable<CheckinQueueItem, 'id'>;

  constructor() {
    super('RefreshingDB');
    this.version(1).stores({
      attendees: 'id, eventId, fullName', // Primary key and indexed props
      checkinQueue: '++id, eventId, status' // Primary key and indexed props
    });
  }
}

export const db = new RefreshingDB();
