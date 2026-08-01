/**
 * Ministers Query Module
 * Handlers for retrieving speaker profiles and biography data.
 */

import { collection, doc, getDoc, getDocs, query, where, FirestoreDataConverter, setDoc, updateDoc } from "firebase/firestore";
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
      status: minister.status,
      category: minister.category,
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
      status: data.status || "draft",
      category: data.category || "keynote",
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

export async function updateMinister(ministerId: string, data: Partial<Minister>): Promise<void> {
  const ref = doc(db, "ministers", ministerId).withConverter(ministerConverter);
  // We use updateDoc to only update the provided fields, or setDoc with merge: true
  await setDoc(ref, data as Minister, { merge: true });
}

export async function createMinister(minister: Omit<Minister, "id">): Promise<string> {
  const slug = minister.slug || minister.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const ref = doc(db, "ministers", slug).withConverter(ministerConverter);
  await setDoc(ref, minister as Minister);
  return slug;
}

export async function deleteMinister(ministerId: string): Promise<void> {
  const ref = doc(db, "ministers", ministerId);
  await updateDoc(ref, { status: "deleted" }); // Soft delete, or import deleteDoc for hard delete
}
