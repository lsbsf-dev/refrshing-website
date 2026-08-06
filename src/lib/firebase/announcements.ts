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
    const ref = collection(db, "announcements").withConverter(announcementConverter);
    const q = query(
      ref,
      where("eventId", "==", eventId),
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

export async function updateAnnouncement(announcementId: string, data: Partial<Announcement>): Promise<void> {
  const ref = doc(db, "announcements", announcementId).withConverter(announcementConverter);
  await setDoc(ref, data as Announcement, { merge: true });
}

export async function createAnnouncement(announcement: Omit<Announcement, "id">): Promise<string> {
  // Let firestore generate the ID for announcements, or use a combination of eventId + timestamp
  const generatedId = `ann-${Date.now()}`;
  const ref = doc(db, "announcements", generatedId).withConverter(announcementConverter);
  await setDoc(ref, announcement as Announcement);
  return generatedId;
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  const ref = doc(db, "announcements", announcementId);
  await updateDoc(ref, { status: "deleted" });
}
