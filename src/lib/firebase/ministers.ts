/**
 * Ministers Query Module
 * Handlers for retrieving speaker profiles and biography data.
 */

import { collection, doc, getDoc, getDocs, query, where, FirestoreDataConverter, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "./app";
import { Minister } from "@/types/minister";

import seedMinisters from "./seedMinisters.json";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { "Authorization": `Bearer ${token}` };
}

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
    const ref = collection(db, "events", eventId, "ministers").withConverter(ministerConverter);
    const q = query(ref, where("status", "==", "published"));
    const snap = await getDocs(q);
    // Include Firestore document ID as `id` to match the Minister interface
    return snap.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Failed to load ministers for", eventId, error);
    // Gracefully degrade: return empty array so UI can handle missing data
    return [] as Minister[];
  }
}

export async function getMinisterBySlug(
  eventId: string,
  slug: string
): Promise<Minister | null> {
  try {
    const ref = collection(db, "events", eventId, "ministers").withConverter(ministerConverter);
    const q = query(ref, where("slug", "==", slug), where("status", "==", "published"));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Firestore query getMinisterBySlug failed:", error);
    throw new Error(`Failed to load minister ${slug}: ${message}`);
  }
}

export async function updateMinister(ministerId: string, data: Partial<Minister>): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/admin/ministers", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    // eventId is passed top‑level; remove it from payload to avoid duplicate
    body: JSON.stringify({
      action: "update",
      ministerId,
      eventId: data.eventId,
      payload: (({ eventId, ...rest }) => rest)(data),
    }),
  });
  if (!res.ok) throw new Error("Failed to update minister");
}

export async function createMinister(minister: Omit<Minister, "id" | "slug"> & { slug?: string }): Promise<string> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/admin/ministers", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    // eventId is top‑level; strip it from payload
    body: JSON.stringify({
      action: "create",
      eventId: minister.eventId,
      payload: (({ eventId, ...rest }) => rest)(minister),
    }),
  });
  if (!res.ok) throw new Error("Failed to create minister");
  const data = await res.json();
  return data.slug;
}

export async function deleteMinister(eventId: string, ministerId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/admin/ministers", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ action: "delete", eventId, ministerId }),
  });
  if (!res.ok) throw new Error("Failed to delete minister");
}
