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
    if (snap.empty) return [];
    return snap.docs.map((doc) => doc.data());
  } catch (error) {
    console.warn("Firestore query getMinisters failed:", error);
    return [];
  }
}

export async function getMinisterBySlug(
  eventId: string,
  slug: string
): Promise<Minister | null> {
  try {
    const ref = collection(db, "ministers").withConverter(ministerConverter);
    const q = query(
      ref,
      where("eventId", "==", eventId),
      where("slug", "==", slug),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data();
  } catch (error) {
    console.warn("Firestore query getMinisterBySlug failed:", error);
    return null;
  }
}

export async function updateMinister(ministerId: string, data: Partial<Minister>): Promise<void> {
  const res = await fetch("/api/admin/ministers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update", ministerId, payload: data }),
  });
  if (!res.ok) throw new Error("Failed to update minister");
}

export async function createMinister(minister: Omit<Minister, "id" | "slug"> & { slug?: string }): Promise<string> {
  const res = await fetch("/api/admin/ministers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create", payload: minister }),
  });
  if (!res.ok) throw new Error("Failed to create minister");
  const data = await res.json();
  return data.slug;
}

export async function deleteMinister(ministerId: string): Promise<void> {
  const res = await fetch("/api/admin/ministers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", ministerId }),
  });
  if (!res.ok) throw new Error("Failed to delete minister");
}
