/**
 * Announcements Query Module
 * Handlers for retrieving reverse-chronological news notices.
 */

import { collection, doc, getDoc, getDocs, query, where, orderBy, FirestoreDataConverter, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./app";
import { Announcement } from "@/types/announcement";

import seedAnnouncements from "./seedAnnouncements.json";

export const announcementConverter: FirestoreDataConverter<Announcement> = {
  toFirestore(announcement: Announcement) {
    return {
      eventId: announcement.eventId,
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      publishedAt: announcement.publishedAt,
      expiresAt: announcement.expiresAt,
      status: announcement.status,
      isUrgent: announcement.isUrgent || null,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      eventId: data.eventId || "",
      title: data.title || "",
      content: data.content || "",
      category: data.category || "General",
      publishedAt: data.publishedAt || "",
      expiresAt: data.expiresAt || "",
      status: data.status || "draft",
      isUrgent: data.isUrgent || undefined,
    };
  },
};

export async function getAnnouncements(eventId: string): Promise<Announcement[]> {
  try {
    const ref = collection(db, "events", eventId, "announcements").withConverter(announcementConverter);
  const q = query(
    ref,
    where("status", "==", "published"),
    orderBy("publishedAt", "desc")
  );
  const snap = await getDocs(q);
  if (snap.empty) return [];
  return snap.docs.map((doc) => doc.data());
  } catch (error) {
    console.warn("Firestore query getAnnouncements failed:", error);
    return [];
  }
}

// Update Announcement with overloads
export async function updateAnnouncement(eventId: string, announcementId: string, data: Partial<Announcement>): Promise<void>;
export async function updateAnnouncement(combinedId: string, data: Partial<Announcement>): Promise<void>;
export async function updateAnnouncement(arg1: string, arg2: string | Partial<Announcement>, arg3?: Partial<Announcement>): Promise<void> {
  if (typeof arg2 === 'object') {
    // Called as overload (combinedId, data)
    const combinedId = arg1;
    const parts = combinedId.split('/');
    if (parts.length === 2) {
      const [eventId, announcementId] = parts;
      const docRef = doc(db, 'events', eventId, 'announcements', announcementId).withConverter(announcementConverter);
      await setDoc(docRef, arg2 as Partial<Announcement>, { merge: true });
      return;
    }
    // Fallback to UNKNOWN eventId
    const docRef = doc(db, 'events', 'UNKNOWN', 'announcements', combinedId).withConverter(announcementConverter);
    await setDoc(docRef, arg2 as Partial<Announcement>, { merge: true });
    return;
  } else {
    // Called with full parameters (eventId, announcementId, data)
    const docRef = doc(db, 'events', arg1, 'announcements', arg2 as string).withConverter(announcementConverter);
    await setDoc(docRef, arg3 as Partial<Announcement>, { merge: true });
  }
}


export async function createAnnouncement(announcement: Omit<Announcement, "id">): Promise<string> {
  // Use the eventId from the announcement object to store under the correct subcollection
  const generatedId = `ann-${Date.now()}`;
  const ref = doc(db, "events", announcement.eventId, "announcements", generatedId).withConverter(announcementConverter);
  await setDoc(ref, announcement as Announcement);
  return generatedId;
}

// Delete Announcement with overloads
export async function deleteAnnouncement(eventId: string, announcementId: string): Promise<void>;
export async function deleteAnnouncement(combinedId: string): Promise<void>;
export async function deleteAnnouncement(arg1: string, arg2?: string): Promise<void> {
  if (typeof arg2 === 'undefined') {
    // Called with combinedId only
    const combinedId = arg1;
    const parts = combinedId.split('/');
    if (parts.length === 2) {
      const [eventId, announcementId] = parts;
      const docRef = doc(db, 'events', eventId, 'announcements', announcementId);
      await updateDoc(docRef, { status: 'deleted' });
      return;
    }
    const docRef = doc(db, 'events', 'UNKNOWN', 'announcements', combinedId);
    await updateDoc(docRef, { status: 'deleted' });
    return;
  } else {
    // Called with explicit eventId and announcementId
    const docRef = doc(db, 'events', arg1, 'announcements', arg2);
    await updateDoc(docRef, { status: 'deleted' });
  }
}

