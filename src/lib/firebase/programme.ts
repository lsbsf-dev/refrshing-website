/**
 * Programme Schedule Query Module
 * Handlers for retrieving session times and daily itineraries.
 */

import { collection, doc, getDoc, getDocs, query, where, FirestoreDataConverter } from "firebase/firestore";
import { db } from "./app";
import { Session } from "@/types/programme";

import seedSessions from "./seedSessions.json";

export const sessionConverter: FirestoreDataConverter<Session> = {
  toFirestore(session: Session) {
    return {
      eventId: session.eventId,
      slug: session.slug,
      day: session.day,
      title: session.title,
      description: session.description,
      startTime: session.startTime,
      endTime: session.endTime,
      venue: session.venue,
      ministerIds: session.ministerIds,
      status: session.status,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      eventId: data.eventId || "",
      slug: data.slug || "",
      day: data.day || "",
      title: data.title || "",
      description: data.description || "",
      startTime: data.startTime || "",
      endTime: data.endTime || "",
      venue: data.venue || "",
      ministerIds: data.ministerIds || [],
      status: data.status || "draft",
    };
  },
};

export async function getSessions(eventId: string): Promise<Session[]> {
  try {
    const ref = collection(db, "sessions").withConverter(sessionConverter);
    const q = query(
      ref,
      where("eventId", "==", eventId),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return (seedSessions as Session[]).filter(
        (s) => s.eventId === eventId && s.status === "published"
      );
    }
    return snap.docs.map((doc) => doc.data());
  } catch (error) {
    console.warn("Firestore query getSessions failed, using fallback static data:", error);
    return (seedSessions as Session[]).filter(
      (s) => s.eventId === eventId && s.status === "published"
    );
  }
}

export async function getSessionBySlug(eventId: string, slug: string): Promise<Session | null> {
  try {
    const ref = collection(db, "sessions").withConverter(sessionConverter);
    const q = query(
      ref,
      where("eventId", "==", eventId),
      where("slug", "==", slug),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      const fallback = (seedSessions as Session[]).find(
        (s) => s.eventId === eventId && s.slug === slug && s.status === "published"
      );
      return fallback || null;
    }
    return snap.docs[0].data();
  } catch (error) {
    console.warn("Firestore query getSessionBySlug failed, using fallback static data:", error);
    const fallback = (seedSessions as Session[]).find(
      (s) => s.eventId === eventId && s.slug === slug && s.status === "published"
    );
    return fallback || null;
  }
}

export async function getSessionsForMinister(eventId: string, ministerId: string): Promise<Session[]> {
  try {
    const ref = collection(db, "sessions").withConverter(sessionConverter);
    const q = query(
      ref,
      where("eventId", "==", eventId),
      where("ministerIds", "array-contains", ministerId),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return (seedSessions as Session[]).filter(
        (s) => s.eventId === eventId && s.ministerIds.includes(ministerId) && s.status === "published"
      );
    }
    return snap.docs.map((doc) => doc.data());
  } catch (error) {
    console.warn("Firestore query getSessionsForMinister failed, using fallback static data:", error);
    return (seedSessions as Session[]).filter(
      (s) => s.eventId === eventId && s.ministerIds.includes(ministerId) && s.status === "published"
    );
  }
}
