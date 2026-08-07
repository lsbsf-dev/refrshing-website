import { db, storage } from "./app";
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ==========================================
// TYPES
// ==========================================

export type BlockVariant = 'default' | 'editorial' | 'immersive';

export interface HeroBlockConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundImageUrl: string;
}

export interface AnniversaryBlockConfig {
  title: string;
  subtitle: string;
  backgroundImageUrl: string;
  displayStart: string; // ISO string
  displayEnd: string;   // ISO string
}

export interface GalleryBlockConfig {
  images: string[];
}

export interface FeaturedMinistersConfig {
  ministerIds: string[];
}

export interface RichTextConfig {
  contentHtml: string;
}

export type HomepageBlock =
  | { id: string; type: 'hero'; label: string; enabled: boolean; variant?: BlockVariant; config: HeroBlockConfig }
  | { id: string; type: 'anniversary'; label: string; enabled: boolean; variant?: BlockVariant; config: AnniversaryBlockConfig }
  | { id: string; type: 'gallery'; label: string; enabled: boolean; variant?: BlockVariant; config: GalleryBlockConfig }
  | { id: string; type: 'featured_ministers'; label: string; enabled: boolean; variant?: BlockVariant; config: FeaturedMinistersConfig }
  | { id: string; type: 'rich_text'; label: string; enabled: boolean; variant?: BlockVariant; config: RichTextConfig };

export interface HomepageSettings extends BaseEventScopedDoc {
  // Global Settings
  showRegistrationButton: boolean;
  registrationLink: string;
  showCountdown: boolean;
  
  // Dynamic Layout (Order is determined entirely by array index)
  blocks: HomepageBlock[];
}

export interface ThemeArchiveEntry {
  id: string; // usually year, e.g. "2024"
  year: string;
  theme: string;
  scripture: string;
  description: string;
  imageUrl?: string;
}

export interface AboutSettings extends BaseEventScopedDoc {
  historyHtml: string;
  visionHtml: string;
  missionHtml: string;
  aboutLsbsfHtml: string;
  themeArchive: ThemeArchiveEntry[];
}

export type PublishStatus = 'draft' | 'published';

export interface BaseEventScopedDoc {
  id: string;
  status: PublishStatus;
  createdAt?: any;
  updatedAt?: any;
}

// 1. Committee Members
export interface CommitteeMember extends BaseEventScopedDoc {
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  order: number;
}

// 2. Timeline Entries (Global)
export interface TimelineEntry {
  id: string;
  year: string;
  title: string;
  description: string;
  photoUrl: string;
  order: number; // Chronological sorting
  status: PublishStatus;
  createdAt?: any;
  updatedAt?: any;
}

// 3. Bible Studies
export interface BibleStudy extends BaseEventScopedDoc {
  title: string;
  theme: string;
  author: string;
  content: string; // Rich Text
  order: number;
}

// 4. Articles
export interface Article extends BaseEventScopedDoc {
  title: string;
  slug: string;
  author: string;
  summary: string;
  content: string; // Rich Text
  coverImageUrl: string;
  publishedDate: string;
}

// 5. Devotionals
export interface Devotional extends BaseEventScopedDoc {
  title: string;
  day: string; // e.g., 'Day 1', 'Day 2'
  scripture: string;
  author: string;
  content: string; // Rich Text
  order: number;
}

// 6. Advertisements
export interface Advertisement extends BaseEventScopedDoc {
  title: string;
  sponsor: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  order: number;
}

// 7. Downloads
export interface Download extends BaseEventScopedDoc {
  title: string;
  description: string;
  fileUrl: string;
  fileType: string; // e.g., 'pdf', 'docx'
  order: number;
}

// ==========================================
// GENERIC CRUD HELPERS
// ==========================================

export async function getEventScopedDocs<T>(eventId: string, collectionName: string, orderField: string = 'order'): Promise<T[]> {
  const q = query(collection(db, "events", eventId, collectionName), orderBy(orderField, 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
}

export async function setEventScopedDoc<T extends { id: string }>(eventId: string, collectionName: string, data: T): Promise<void> {
  const isNew = !(data as any).createdAt;
  const payload = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  if (isNew) {
    (payload as any).createdAt = serverTimestamp();
  }
  await setDoc(doc(db, "events", eventId, collectionName, data.id), payload, { merge: true });
}

export async function setHomepageSettings(eventId: string, data: HomepageSettings, saveVersion: boolean = false): Promise<void> {
  await setEventScopedDoc(eventId, "homepageSettings", data);
  if (saveVersion) {
    const versionRef = doc(collection(db, "events", eventId, "homepageSettings", data.id, "versions"));
    await setDoc(versionRef, {
      ...data,
      versionId: versionRef.id,
      savedAt: serverTimestamp()
    });
  }
}

export async function deleteEventScopedDoc(eventId: string, collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "events", eventId, collectionName, id));
}

// ==========================================
// GLOBAL TIMELINE CRUD
// ==========================================

export async function getTimelineEntries(): Promise<TimelineEntry[]> {
  const q = query(collection(db, "timelineEntries"), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TimelineEntry));
}

export async function setTimelineEntry(data: TimelineEntry): Promise<void> {
  const isNew = !data.createdAt;
  const payload = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  if (isNew) {
    (payload as any).createdAt = serverTimestamp();
  }
  await setDoc(doc(db, "timelineEntries", data.id), payload, { merge: true });
}

export async function deleteTimelineEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, "timelineEntries", id));
}

// ==========================================
// UPLOAD HELPER
// ==========================================

export async function uploadCMSMedia(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const fileRef = ref(storage, `cms/${folder}/${filename}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}
