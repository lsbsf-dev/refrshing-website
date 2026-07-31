/**
 * Resources Query Module
 * Handlers for retrieving publications, outlines, devotionals, and downloads.
 */

import { collection, doc, getDoc, getDocs, query, where, FirestoreDataConverter } from "firebase/firestore";
import { db } from "./app";
import { Resource } from "@/types/resource";

import seedResources from "./seedResources.json";

export const resourceConverter: FirestoreDataConverter<Resource> = {
  toFirestore(resource: Resource) {
    return {
      eventId: resource.eventId,
      slug: resource.slug,
      title: resource.title,
      description: resource.description,
      category: resource.category,
      author: resource.author,
      publishedAt: resource.publishedAt,
      fileUrl: resource.fileUrl || null,
      embedUrl: resource.embedUrl || null,
      status: resource.status,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      eventId: data.eventId || "",
      slug: data.slug || "",
      title: data.title || "",
      description: data.description || "",
      category: data.category || "Downloads",
      author: data.author || "",
      publishedAt: data.publishedAt || "",
      fileUrl: data.fileUrl || undefined,
      embedUrl: data.embedUrl || undefined,
      status: data.status || "draft",
    };
  },
};

export async function getResources(eventId: string): Promise<Resource[]> {
  try {
    const ref = collection(db, "resources").withConverter(resourceConverter);
    const q = query(
      ref,
      where("eventId", "==", eventId),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);
    const firestoreDocs = snap.empty ? [] : snap.docs.map((doc) => doc.data());
    const seedDocs = (seedResources as unknown as Resource[]).filter(
      (r) => r.eventId === eventId && r.status === "published"
    );
    // Combine results, ensuring all seed items are represented if not present in Firestore yet
    const merged = [...firestoreDocs];
    for (const s of seedDocs) {
      if (!merged.some((m) => m.slug === s.slug || m.id === s.id)) {
        merged.push(s);
      }
    }
    return merged;
  } catch (error) {
    console.warn("Firestore query getResources failed, using fallback static data:", error);
    return (seedResources as unknown as Resource[]).filter(
      (r) => r.eventId === eventId && r.status === "published"
    );
  }
}

export async function getResourceBySlug(eventId: string, slug: string): Promise<Resource | null> {
  try {
    const ref = collection(db, "resources").withConverter(resourceConverter);
    const q = query(
      ref,
      where("eventId", "==", eventId),
      where("slug", "==", slug),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data();
    }
    const fallback = (seedResources as unknown as Resource[]).find(
      (r) => r.eventId === eventId && r.slug === slug && r.status === "published"
    );
    return fallback || null;
  } catch (error) {
    console.warn("Firestore query getResourceBySlug failed, using fallback static data:", error);
    const fallback = (seedResources as unknown as Resource[]).find(
      (r) => r.eventId === eventId && r.slug === slug && r.status === "published"
    );
    return fallback || null;
  }
}
