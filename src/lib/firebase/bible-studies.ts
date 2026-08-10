import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./app";
import { Resource } from "@/types/resource";

export async function getBibleStudies(eventId: string): Promise<Resource[]> {
  try {
    const ref = collection(db, "events", eventId, "bibleStudies");
    const q = query(ref, where("status", "==", "published"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id || doc.id,
        eventId,
        slug: data.slug || doc.id,
        title: data.title || "",
        description: data.content || "", // Map content to description
        category: "Bible Studies",
        author: data.author || "",
        publishedAt: data.updatedAt ? new Date(data.updatedAt.toMillis?.() || Date.now()).toISOString() : new Date().toISOString(),
        status: data.status || "published",
        _sourceType: "bibleStudy"
      } as unknown as Resource;
    });
  } catch (error) {
    console.error("Error fetching bible studies:", error);
    return [];
  }
}

export async function getBibleStudyBySlug(eventId: string, slug: string): Promise<Resource | null> {
  try {
    const ref = collection(db, "events", eventId, "bibleStudies");
    const q = query(ref, where("slug", "==", slug), where("status", "==", "published"));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: data.id || doc.id,
      eventId,
      slug: data.slug || doc.id,
      title: data.title || "",
      description: data.content || "",
      category: "Bible Studies",
      author: data.author || "",
      publishedAt: data.updatedAt ? new Date(data.updatedAt.toMillis?.() || Date.now()).toISOString() : new Date().toISOString(),
      status: data.status || "published",
      _sourceType: "bibleStudy"
    } as unknown as Resource;
  } catch (error) {
    console.error("Error fetching bible study by slug:", error);
    return null;
  }
}
