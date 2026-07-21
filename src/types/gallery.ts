/**
 * Gallery Type Models
 * Schema mapping for albums and nested photo lists.
 */

export interface GalleryAlbum {
  id: string;
  eventId: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  photoCount: number;
  status: "draft" | "published";
}

export interface Photo {
  id: string;
  albumId: string;
  eventId: string;
  url: string;
  altText: string;
  uploadedAt: string; // ISO string
}
