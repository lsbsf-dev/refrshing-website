/**
 * Resources Query Module
 * Handlers for retrieving publications, outlines, devotionals, and downloads.
 */

import { collection, doc, getDoc, getDocs, query, where, FirestoreDataConverter, setDoc, updateDoc } from "firebase/firestore";
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
    return snap.empty ? [] : snap.docs.map((doc) => doc.data());
  } catch (error) {
    console.warn("Firestore query getResources failed:", error);
    return [];
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
    return null;
  } catch (error) {
    console.warn("Firestore query getResourceBySlug failed:", error);
    return null;
  }
}

export async function updateResource(resourceId: string, data: Partial<Resource>): Promise<void> {
  const ref = doc(db, "resources", resourceId).withConverter(resourceConverter);
  await setDoc(ref, data as Resource, { merge: true });
}

export async function createResource(resource: Omit<Resource, "id">): Promise<string> {
  const slug = resource.slug || resource.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const ref = doc(db, "resources", slug).withConverter(resourceConverter);
  await setDoc(ref, resource as Resource);
  return slug;
}

export async function deleteResource(resourceId: string): Promise<void> {
  const ref = doc(db, "resources", resourceId);
  await updateDoc(ref, { status: "deleted" });
}
