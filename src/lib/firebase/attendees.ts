import { collection, doc, getDoc, getDocs, updateDoc, setDoc, query, where, orderBy, FirestoreDataConverter } from "firebase/firestore";
import { db } from "./app";

export interface Attendee {
  id: string; // Registration Code (e.g. REF26-1001)
  name: string;
  email: string;
  phone: string;
  category: string;
  ticketId: string;
  eventId: string;
  checkedIn: boolean;
  checkInTime: string | null;
  checkInLocation: string | null;
  checkInMethod: string | null;
  createdAt: string;
  updatedAt: string;
}

export const attendeeConverter: FirestoreDataConverter<Attendee> = {
  toFirestore(attendee: Attendee) {
    return {
      name: attendee.name,
      email: attendee.email,
      phone: attendee.phone,
      category: attendee.category,
      ticketId: attendee.ticketId,
      eventId: attendee.eventId,
      checkedIn: attendee.checkedIn,
      checkInTime: attendee.checkInTime,
      checkInLocation: attendee.checkInLocation,
      checkInMethod: attendee.checkInMethod,
      createdAt: attendee.createdAt,
      updatedAt: attendee.updatedAt,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name || "Unknown",
      email: data.email || "",
      phone: data.phone || "",
      category: data.category || "General",
      ticketId: data.ticketId || "",
      eventId: data.eventId || "",
      checkedIn: data.checkedIn || false,
      checkInTime: data.checkInTime || null,
      checkInLocation: data.checkInLocation || null,
      checkInMethod: data.checkInMethod || null,
      createdAt: data.createdAt || "",
      updatedAt: data.updatedAt || "",
    };
  },
};

/**
 * Get all attendees for a specific event
 */
export async function getAttendees(eventId: string): Promise<Attendee[]> {
  const ref = collection(db, "events", eventId, "attendees").withConverter(attendeeConverter);
  const snap = await getDocs(query(ref, orderBy("name", "asc")));
  return snap.docs.map((doc) => doc.data());
}

/**
 * Get a specific attendee by their registration code (document ID)
 */
export async function getAttendeeByCode(eventId: string, code: string): Promise<Attendee | null> {
  const ref = doc(db, "events", eventId, "attendees", code).withConverter(attendeeConverter);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/**
 * Update attendee (e.g. manual edit)
 */
export async function updateAttendee(eventId: string, code: string, data: Partial<Attendee>): Promise<void> {
  const ref = doc(db, "events", eventId, "attendees", code);
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}
