import Dexie, { type EntityTable } from 'dexie';

export interface LocalAttendee {
  id: string; // The attendeeId / registration code
  eventId: string;
  name: string;
  photoUrl?: string;
  ticketStatus: string;
  checkedInAt: string | null;
  phoneMasked: string;
  church: string;
  association: string;
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
      attendees: 'id, eventId, name', // Primary key and indexed props
      checkinQueue: '++id, eventId, status' // Primary key and indexed props
    });
  }
}

export const db = new RefreshingDB();
