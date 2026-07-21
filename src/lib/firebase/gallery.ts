/**
 * Gallery Query Module
 * Handlers for retrieving photo albums and individual photos.
 */

import { collection, doc, getDoc, getDocs, query, where, FirestoreDataConverter } from "firebase/firestore";
import { db } from "./app";
import { GalleryAlbum, Photo } from "@/types/gallery";

export const galleryAlbumConverter: FirestoreDataConverter<GalleryAlbum> = {
  toFirestore(album: GalleryAlbum) {
    return {
      eventId: album.eventId,
      slug: album.slug,
      title: album.title,
      description: album.description,
      coverImageUrl: album.coverImageUrl,
      photoCount: album.photoCount,
      status: album.status,
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
      coverImageUrl: data.coverImageUrl || "",
      photoCount: data.photoCount || 0,
      status: data.status || "draft",
    };
  },
};

export const photoConverter: FirestoreDataConverter<Photo> = {
  toFirestore(photo: Photo) {
    return {
      albumId: photo.albumId,
      eventId: photo.eventId,
      url: photo.url,
      altText: photo.altText,
      uploadedAt: photo.uploadedAt,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      albumId: data.albumId || "",
      eventId: data.eventId || "",
      url: data.url || "",
      altText: data.altText || "",
      uploadedAt: data.uploadedAt || "",
    };
  },
};

import seedAlbums from "./seedAlbums.json";

export async function getAlbums(eventId: string): Promise<GalleryAlbum[]> {
  try {
    const ref = collection(db, "galleryAlbums").withConverter(galleryAlbumConverter);
    const q = query(
      ref,
      where("eventId", "==", eventId),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return (seedAlbums as GalleryAlbum[]).filter(
        (a) => a.eventId === eventId && a.status === "published"
      );
    }
    return snap.docs.map((doc) => doc.data());
  } catch (error) {
    console.warn("Firestore query getAlbums failed, using fallback static data:", error);
    return (seedAlbums as GalleryAlbum[]).filter(
      (a) => a.eventId === eventId && a.status === "published"
    );
  }
}

export async function getAlbumBySlug(eventId: string, slug: string): Promise<GalleryAlbum | null> {
  const ref = collection(db, "galleryAlbums").withConverter(galleryAlbumConverter);
  const q = query(
    ref,
    where("eventId", "==", eventId),
    where("slug", "==", slug),
    where("status", "==", "published")
  );
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].data();
}

export async function getPhotos(eventId: string, albumId: string): Promise<Photo[]> {
  const ref = collection(db, "photos").withConverter(photoConverter);
  const q = query(
    ref,
    where("eventId", "==", eventId),
    where("albumId", "==", albumId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => doc.data());
}
