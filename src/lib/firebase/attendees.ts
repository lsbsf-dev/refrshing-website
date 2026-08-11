import { collection, doc, getDoc, getDocs, updateDoc, setDoc, query, where, orderBy, FirestoreDataConverter, Timestamp } from "firebase/firestore";
import { db } from "./app";

export interface Attendee {
  id: string; // Registration Code (e.g. REF26-1001)
  eventId: "refreshing-2026";
  
  // Identity
  fullName: string;
  email: string; // Now optional/nullable in the type if we wanted to relax it, but the user said "email is explicitly captured and required" in their list: "Automatically captured from the Google account/form submission, Required". So we keep it required.
  phoneNumber: string;
  memberStatus: "Member" | "Executive";
  
  // Hierarchy
  conferenceId: "lagos_east" | "lagos_west" | "lagos_central" | "campus_fellowship" | "other";
  conferenceName: string;
  
  associationId?: string;
  associationName?: string;
  
  churchId?: string;
  churchName?: string;
  
  campusFellowshipId?: string;
  campusFellowshipName?: string;
  otherSchool?: string;
  
  expectation?: string;
  
  // Attendance
  checkIn: {
    checkedIn: boolean;
    checkedInAt?: Timestamp;
    checkedInBy?: string;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Payment information is protected and stored in a subcollection:
// /events/{eventId}/attendees/{attendeeId}/payment/record
export interface AttendeePayment {
  hasPaid: boolean;
  verificationStatus: "pending" | "verified" | "rejected";
  receiptUrl?: string; // Protected, only viewed in detail panel
  verifiedAt?: Timestamp;
  verifiedBy?: string;
}

export const attendeeConverter: FirestoreDataConverter<Attendee> = {
  toFirestore(attendee: Attendee) {
    return {
      eventId: attendee.eventId,
      fullName: attendee.fullName,
      email: attendee.email,
      phoneNumber: attendee.phoneNumber,
      memberStatus: attendee.memberStatus,
      conferenceId: attendee.conferenceId,
      conferenceName: attendee.conferenceName,
      associationId: attendee.associationId || null,
      associationName: attendee.associationName || null,
      churchId: attendee.churchId || null,
      churchName: attendee.churchName || null,
      campusFellowshipId: attendee.campusFellowshipId || null,
      campusFellowshipName: attendee.campusFellowshipName || null,
      otherSchool: attendee.otherSchool || null,
      expectation: attendee.expectation || null,
      checkIn: attendee.checkIn,
      createdAt: attendee.createdAt,
      updatedAt: attendee.updatedAt,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      eventId: data.eventId,
      fullName: data.fullName || "Unknown",
      email: data.email || "",
      phoneNumber: data.phoneNumber || "",
      memberStatus: data.memberStatus || "Member",
      conferenceId: data.conferenceId,
      conferenceName: data.conferenceName,
      associationId: data.associationId || undefined,
      associationName: data.associationName || undefined,
      churchId: data.churchId || undefined,
      churchName: data.churchName || undefined,
      campusFellowshipId: data.campusFellowshipId || undefined,
      campusFellowshipName: data.campusFellowshipName || undefined,
      otherSchool: data.otherSchool || undefined,
      expectation: data.expectation || undefined,
      checkIn: data.checkIn 
        ? { ...data.checkIn, checkedIn: data.checkIn.checkedIn ?? !!data.checkIn.checkedInAt }
        : { checkedIn: !!data.checkedInAt, checkedInAt: data.checkedInAt },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};

/**
 * Get all attendees for a specific event
 */
export async function getAttendees(eventId: string): Promise<Attendee[]> {
  const ref = collection(db, "events", eventId, "attendees").withConverter(attendeeConverter);
  const snap = await getDocs(query(ref));
  return snap.docs.map((doc) => doc.data()).sort((a, b) => a.fullName.localeCompare(b.fullName));
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
    updatedAt: Timestamp.now(),
  });
}

/**
 * Get protected payment record for an attendee
 */
export async function getAttendeePayment(eventId: string, code: string): Promise<AttendeePayment | null> {
  const ref = doc(db, "events", eventId, "attendees", code, "payment", "record");
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as AttendeePayment) : null;
}

/**
 * On-the-spot registration: Creates an attendee and instantly marks them as checked in.
 */
export async function createAndCheckInAttendee(
  eventId: "refreshing-2026",
  data: Omit<Attendee, "id" | "eventId" | "createdAt" | "updatedAt" | "checkIn">,
  adminUid: string,
  hasPaid: boolean
): Promise<string> {
  // Generate random code e.g. REF26-XYZ123
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const code = `REF26-${randomStr}`;
  
  const attendee: Attendee = {
    ...data,
    id: code,
    eventId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  const ref = doc(db, "events", eventId, "attendees", code).withConverter(attendeeConverter);
  await setDoc(ref, attendee);

  if (hasPaid) {
    const paymentRef = doc(db, "events", eventId, "attendees", code, "payment", "record");
    await setDoc(paymentRef, {
      hasPaid: true,
      verificationStatus: "verified",
      verifiedAt: Timestamp.now(),
      verifiedBy: adminUid
    } as AttendeePayment);
  }

  // Call the markCheckedIn Cloud Function instead of direct write
  // This preserves the audit log and security rules
  const { getFunctions, httpsCallable } = await import("firebase/functions");
  const { app } = await import("@/lib/firebase/app");
  const functions = getFunctions(app);
  const markCheckedIn = httpsCallable<{ eventId: string, attendeeId: string }, any>(functions, "markCheckedIn");
  
  try {
    await markCheckedIn({ eventId, attendeeId: code });
  } catch (err: any) {
    if (err?.code !== 'functions/already-exists' && err?.details?.status !== 'already_checked_in') {
      console.error("Cloud function check-in failed, but attendee was created:", err);
    }
  }

  return code;
}
