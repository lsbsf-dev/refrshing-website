/**
 * Events Query Module
 * Handlers for retrieving event metadata collections from Firestore with type-safe converters.
 */

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy, FirestoreDataConverter } from "firebase/firestore";
import { db } from "./app";
import { AppEvent } from "@/types/event";

export const eventConverter: FirestoreDataConverter<AppEvent> = {
  toFirestore(event: AppEvent) {
    return {
      name: event.name,
      theme: event.theme,
      scripture: event.scripture,
      startDate: event.startDate,
      endDate: event.endDate,
      venue: event.venue,
      status: event.status,
      isMilestone: event.isMilestone,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name || "",
      theme: data.theme || "",
      scripture: data.scripture || "",
      startDate: data.startDate || "",
      endDate: data.endDate || "",
      venue: data.venue || "",
      status: data.status || "upcoming",
      isMilestone: data.isMilestone || false,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    };
  },
};

export async function getEvents(): Promise<AppEvent[]> {
  const ref = collection(db, "events").withConverter(eventConverter);
  const snap = await getDocs(query(ref, orderBy("startDate", "desc")));
  return snap.docs.map((doc) => doc.data());
}

export async function getEventById(id: string): Promise<AppEvent | null> {
  const ref = doc(db, "events", id).withConverter(eventConverter);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function createEvent(event: Omit<AppEvent, "createdAt" | "updatedAt">): Promise<void> {
  const ref = doc(db, "events", event.id).withConverter(eventConverter);
  await setDoc(ref, {
    ...event,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);
}

export async function updateEvent(id: string, data: Partial<AppEvent>): Promise<void> {
  const ref = doc(db, "events", id);
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  const ref = doc(db, "events", id);
  await deleteDoc(ref);
}
