/**
 * Gallery Query Module
 * Handlers for retrieving photo albums and individual photos.
 */

import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, query, where, FirestoreDataConverter, increment } from "firebase/firestore";
import { db } from "./app";
import { GalleryAlbum, Photo, Video } from "@/types/gallery";

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

export const videoConverter: FirestoreDataConverter<Video> = {
  toFirestore(video: Video) {
    return {
      eventId: video.eventId,
      youtubeId: video.youtubeId,
      title: video.title,
      description: video.description,
      publishedAt: video.publishedAt,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      eventId: data.eventId || "",
      youtubeId: data.youtubeId || "",
      title: data.title || "",
      description: data.description || "",
      publishedAt: data.publishedAt || "",
    };
  },
};

import seedAlbums from "./seedAlbums.json";

export async function getAlbums(eventId: string): Promise<GalleryAlbum[]> {
  try {
    const ref = collection(db, "events", eventId, "galleryAlbums").withConverter(galleryAlbumConverter);
    const q = query(
      ref,
      where("eventId", "==", eventId),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map((doc) => doc.data());
  } catch (error) {
    console.warn("Firestore query getAlbums failed:", error);
    return [];
  }
}

export async function getAlbumBySlug(eventId: string, slug: string): Promise<GalleryAlbum | null> {
  const ref = collection(db, "events", eventId, "galleryAlbums").withConverter(galleryAlbumConverter);
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
  const ref = collection(db, "events", eventId, "photos").withConverter(photoConverter);
  const q = query(
    ref,
    where("eventId", "==", eventId),
    where("albumId", "==", albumId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => doc.data());
}

// =======================
// ALBUM MUTATIONS
// =======================

export async function createAlbum(eventId: string, album: Omit<GalleryAlbum, "id">, id: string): Promise<void> {
  const ref = doc(db, "events", eventId, "galleryAlbums", id).withConverter(galleryAlbumConverter);
  await setDoc(ref, { ...album, id });
}

export async function updateAlbum(eventId: string, id: string, updates: Partial<GalleryAlbum>): Promise<void> {
  const ref = doc(db, "events", eventId, "galleryAlbums", id);
  await updateDoc(ref, updates);
}

export async function deleteAlbum(eventId: string, id: string): Promise<void> {
  // We should also delete photos, but we leave that to cloud functions or manual cleanup
  const ref = doc(db, "events", eventId, "galleryAlbums", id);
  await deleteDoc(ref);
}

// =======================
// PHOTO MUTATIONS
// =======================

export async function addPhoto(eventId: string, photo: Omit<Photo, "id">, id: string): Promise<void> {
  const ref = doc(db, "events", eventId, "photos", id).withConverter(photoConverter);
  await setDoc(ref, { ...photo, id });
  
  // Increment photo count on the album
  if (photo.albumId) {
    const albumRef = doc(db, "events", eventId, "galleryAlbums", photo.albumId);
    await updateDoc(albumRef, { photoCount: increment(1) });
  }
}

export async function updatePhoto(eventId: string, id: string, updates: Partial<Photo>): Promise<void> {
  const ref = doc(db, "events", eventId, "photos", id);
  
  // If moving between albums, we should technically handle increment/decrement on albums
  // For simplicity here, we assume standard updates
  await updateDoc(ref, updates);
}

export async function deletePhoto(eventId: string, id: string, albumId?: string): Promise<void> {
  const ref = doc(db, "events", eventId, "photos", id);
  await deleteDoc(ref);
  
  if (albumId) {
    const albumRef = doc(db, "events", eventId, "galleryAlbums", albumId);
    await updateDoc(albumRef, { photoCount: increment(-1) });
  }
}

// =======================
// VIDEO OPERATIONS
// =======================

export async function getVideos(eventId: string): Promise<Video[]> {
  const ref = collection(db, "events", eventId, "videos").withConverter(videoConverter);
  const q = query(ref, where("eventId", "==", eventId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => doc.data());
}

export async function addVideo(eventId: string, video: Omit<Video, "id">, id: string): Promise<void> {
  const ref = doc(db, "events", eventId, "videos", id).withConverter(videoConverter);
  await setDoc(ref, { ...video, id });
}

export async function updateVideo(eventId: string, id: string, updates: Partial<Video>): Promise<void> {
  const ref = doc(db, "events", eventId, "videos", id);
  await updateDoc(ref, updates);
}

export async function deleteVideo(eventId: string, id: string): Promise<void> {
  const ref = doc(db, "events", eventId, "videos", id);
  await deleteDoc(ref);
}

