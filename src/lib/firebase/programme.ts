/**
 * Programme Schedule Query Module
 * Handlers for retrieving session times and daily itineraries.
 */

import { collection, doc, getDoc, getDocs, query, where, FirestoreDataConverter } from "firebase/firestore";
import { db } from "./app";
import { Session } from "@/types/programme";

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
  const ref = collection(db, "sessions").withConverter(sessionConverter);
  const q = query(
    ref,
    where("eventId", "==", eventId),
    where("status", "==", "published")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => doc.data());
}

export async function getSessionBySlug(eventId: string, slug: string): Promise<Session | null> {
  const ref = collection(db, "sessions").withConverter(sessionConverter);
  const q = query(
    ref,
    where("eventId", "==", eventId),
    where("slug", "==", slug),
    where("status", "==", "published")
  );
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].data();
}

export async function getSessionsForMinister(eventId: string, ministerId: string): Promise<Session[]> {
  const ref = collection(db, "sessions").withConverter(sessionConverter);
  const q = query(
    ref,
    where("eventId", "==", eventId),
    where("ministerIds", "array-contains", ministerId),
    where("status", "==", "published")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => doc.data());
}
