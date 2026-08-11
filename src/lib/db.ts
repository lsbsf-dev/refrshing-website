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
  status: 'pending' | 'pending-undo' | 'synced' | 'conflict';
  idempotencyKey: string;
}

export class RefreshingDB extends Dexie {
  attendees!: EntityTable<LocalAttendee, 'id'>;
  checkinQueue!: EntityTable<CheckinQueueItem, 'id'>;

  constructor() {
    super('RefreshingDB');
    this.version(1).stores({
      attendees: 'id, eventId, name', 
      checkinQueue: '++id, eventId, status' 
    });
    this.version(2).stores({
      attendees: 'id, eventId, fullName', // Changed name -> fullName
      checkinQueue: '++id, eventId, status' 
    });
  }
}

declare global {
  var _dexieDb: RefreshingDB | undefined;
}

let dbReadyPromise: Promise<void> | null = null;

const getDb = () => {
  if (process.env.NODE_ENV === "production") {
    return new RefreshingDB();
  } else {
    // In dev, HMR can cause stale connections that report as open but throw UnknownError on queries.
    // So we close the old one and always create a fresh instance on module reload.
    if (globalThis._dexieDb) {
      try {
        globalThis._dexieDb.close();
      } catch (e) {
        // ignore
      }
    }
    dbReadyPromise = null; // Clear the old promise so ensureDbReady creates a new one
    globalThis._dexieDb = new RefreshingDB();
    return globalThis._dexieDb;
  }
};

export const db = getDb();

export const ensureDbReady = (): Promise<void> => {
  if (db.isOpen()) return Promise.resolve();
  
  if (!dbReadyPromise) {
    dbReadyPromise = db.open().catch((err) => {
      dbReadyPromise = null; // reset so next try attempts to open again
      throw err;
    });
  }
  return dbReadyPromise;
};

if (typeof window !== "undefined") {
  db.on("versionchange", () => {
    db.close();
    console.warn("A new version of the database is available. Please refresh the page.");
    // Optionally: window.location.reload();
  });
}
