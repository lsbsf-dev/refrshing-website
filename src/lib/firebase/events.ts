/**
 * Events Query Module
 * Handlers for retrieving event metadata collections from Firestore with type-safe converters.
 */

import { collection, doc, getDoc, getDocs, query, where, FirestoreDataConverter } from "firebase/firestore";
import { db } from "./app";
import { Event } from "@/types/event";

export const eventConverter: FirestoreDataConverter<Event> = {
  toFirestore(event: Event) {
    return {
      name: event.name,
      theme: event.theme,
      scripture: event.scripture,
      startDate: event.startDate,
      endDate: event.endDate,
      venue: event.venue,
      status: event.status,
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
      status: data.status || "draft",
    };
  },
};

export async function getEvents(): Promise<Event[]> {
  const ref = collection(db, "events").withConverter(eventConverter);
  const snap = await getDocs(ref);
  return snap.docs.map((doc) => doc.data());
}

export async function getEventById(id: string): Promise<Event | null> {
  const ref = doc(db, "events", id).withConverter(eventConverter);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
