/**
 * Announcements Query Module
 * Handlers for retrieving reverse-chronological news notices.
 */

import { collection, doc, getDoc, getDocs, query, where, orderBy, FirestoreDataConverter } from "firebase/firestore";
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
    if (snap.empty) {
      return (seedAnnouncements as Announcement[]).filter(
        (a) => a.eventId === eventId && a.status === "published"
      );
    }
    return snap.docs.map((doc) => doc.data());
  } catch (error) {
    console.warn("Firestore query getAnnouncements failed, using fallback static data:", error);
    return (seedAnnouncements as Announcement[]).filter(
      (a) => a.eventId === eventId && a.status === "published"
    );
  }
}
