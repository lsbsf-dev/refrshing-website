import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./app";
import { Resource } from "@/types/resource";

export async function getArticles(eventId: string): Promise<Resource[]> {
  try {
    const ref = collection(db, "events", eventId, "articles");
    const q = query(ref, where("status", "==", "published"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id || doc.id,
        eventId,
        slug: data.slug || doc.id,
        title: data.title || "",
        description: data.content || "", // Map content to description for Booklet UI
        category: "Articles",
        author: data.author || "",
        publishedAt: data.publishedDate || new Date().toISOString(),
        status: data.status || "published",
        fileUrl: data.coverImageUrl || "",
        _sourceType: "article"
      } as unknown as Resource;
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export async function getArticleBySlug(eventId: string, slug: string): Promise<Resource | null> {
  try {
    const ref = collection(db, "events", eventId, "articles");
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
      category: "Articles",
      author: data.author || "",
      publishedAt: data.publishedDate || new Date().toISOString(),
      status: data.status || "published",
      fileUrl: data.coverImageUrl || "",
      _sourceType: "article"
    } as unknown as Resource;
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    return null;
  }
}
