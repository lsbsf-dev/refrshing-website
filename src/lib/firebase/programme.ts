/**
 * Programme Schedule Query Module
 * Handlers for retrieving session times and daily itineraries.
 */

import { collection, doc, getDoc, getDocs, query, where, FirestoreDataConverter, setDoc, updateDoc } from "firebase/firestore";
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
    const ref = collection(db, "events", eventId, "sessions").withConverter(sessionConverter);
    const q = query(ref, where("status", "==", "published"));
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map((doc) => doc.data());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Firestore query getSessions failed:", error);
    throw new Error(`Failed to load sessions for ${eventId}: ${message}`);
  }
}

export async function getSessionBySlug(eventId: string, slug: string): Promise<Session | null> {
  try {
    const ref = collection(db, "events", eventId, "sessions").withConverter(sessionConverter);
    const q = query(ref, where("slug", "==", slug), where("status", "==", "published"));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Firestore query getSessionBySlug failed:", error);
    throw new Error(`Failed to load session ${slug}: ${message}`);
  }
}

export async function getSessionsForMinister(eventId: string, ministerId: string): Promise<Session[]> {
  try {
    const ref = collection(db, "events", eventId, "sessions").withConverter(sessionConverter);
    const q = query(ref, where("ministerIds", "array-contains", ministerId), where("status", "==", "published"));
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map((doc) => doc.data());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Firestore query getSessionsForMinister failed:", error);
    throw new Error(`Failed to load sessions for minister ${ministerId}: ${message}`);
  }
}

export async function updateSession(eventId: string, sessionId: string, data: Partial<Session>): Promise<void> {
  const ref = doc(db, "events", eventId, "sessions", sessionId).withConverter(sessionConverter);
  await setDoc(ref, data as Session, { merge: true });
}

export async function createSession(eventId: string, session: Omit<Session, "id">): Promise<string> {
  const slug = session.slug || session.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const ref = doc(db, "events", eventId, "sessions", slug).withConverter(sessionConverter);
  await setDoc(ref, session as Session);
  return slug;
}

export async function deleteSession(eventId: string, sessionId: string): Promise<void> {
  const ref = doc(db, "events", eventId, "sessions", sessionId);
  await updateDoc(ref, { status: "deleted" });
}
