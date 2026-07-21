/**
 * Ministers Query Module
 * Handlers for retrieving speaker profiles and biography data.
 */

import { collection, doc, getDoc, getDocs, query, where, FirestoreDataConverter } from "firebase/firestore";
import { db } from "./app";
import { Minister } from "@/types/minister";

import seedMinisters from "./seedMinisters.json";

export const ministerConverter: FirestoreDataConverter<Minister> = {
  toFirestore(minister: Minister) {
    return {
      eventId: minister.eventId,
      slug: minister.slug,
      name: minister.name,
      photoUrl: minister.photoUrl,
      biography: minister.biography,
      affiliation: minister.affiliation,
      status: minister.status,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      eventId: data.eventId || "",
      slug: data.slug || "",
      name: data.name || "",
      photoUrl: data.photoUrl || "",
      biography: data.biography || "",
      affiliation: data.affiliation || "",
      status: data.status || "draft",
    };
  },
};

export async function getMinisters(eventId: string): Promise<Minister[]> {
  try {
    const ref = collection(db, "ministers").withConverter(ministerConverter);
    const q = query(
      ref,
      where("eventId", "==", eventId),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return (seedMinisters as Minister[]).filter(
        (m) => m.eventId === eventId && m.status === "published"
      );
    }
    return snap.docs.map((doc) => doc.data());
  } catch (error) {
    console.warn("Firestore query getMinisters failed, using fallback static data:", error);
    return (seedMinisters as Minister[]).filter(
      (m) => m.eventId === eventId && m.status === "published"
    );
  }
}

export async function getMinisterBySlug(eventId: string, slug: string): Promise<Minister | null> {
  try {
    const ref = collection(db, "ministers").withConverter(ministerConverter);
    const q = query(
      ref,
      where("eventId", "==", eventId),
      where("slug", "==", slug),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      const fallback = (seedMinisters as Minister[]).find(
        (m) => m.eventId === eventId && m.slug === slug && m.status === "published"
      );
      return fallback || null;
    }
    return snap.docs[0].data();
  } catch (error) {
    console.warn("Firestore query getMinisterBySlug failed, using fallback static data:", error);
    const fallback = (seedMinisters as Minister[]).find(
      (m) => m.eventId === eventId && m.slug === slug && m.status === "published"
    );
    return fallback || null;
  }
}
