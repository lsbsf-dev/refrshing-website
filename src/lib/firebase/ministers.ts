/**
 * Ministers Query Module
 * Handlers for retrieving speaker profiles and biography data.
 */

import { collection, doc, getDoc, getDocs, query, where, FirestoreDataConverter } from "firebase/firestore";
import { db } from "./app";
import { Minister } from "@/types/minister";

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
  const ref = collection(db, "ministers").withConverter(ministerConverter);
  const q = query(
    ref,
    where("eventId", "==", eventId),
    where("status", "==", "published")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => doc.data());
}

export async function getMinisterBySlug(eventId: string, slug: string): Promise<Minister | null> {
  const ref = collection(db, "ministers").withConverter(ministerConverter);
  const q = query(
    ref,
    where("eventId", "==", eventId),
    where("slug", "==", slug),
    where("status", "==", "published")
  );
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].data();
}
