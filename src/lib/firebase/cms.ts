import { db } from "./app";
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

// ==========================================
// TYPES
// ==========================================

// 0. Homepage Settings
export interface HomepageSettings extends BaseEventScopedDoc {
  // FR-HOME-01: Hero Content
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundImageUrl: string;

  // FR-HOME-02: Toggles & Actions
  showRegistrationButton: boolean;
  registrationLink: string;
  showCountdown: boolean;
  
  // FR-HOME-04 & FR-HOME-05
  anniversaryBannerEnabled: boolean;
  anniversary: {
    title: string;
    subtitle: string;
    backgroundImageUrl: string;
    displayStart: string; // ISO string
    displayEnd: string;   // ISO string
  };

  milestoneOverlayEnabled: boolean;
  milestone: {
    text: string;
    imageUrl: string;
  };
  
  // FR-HOME-06: Featured Content Slots
  featuredMinisters: string[];
  featuredAnnouncement: string;
  featuredGalleryImages: string[];
  featuredArticles: string[];
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

export interface ContactPerson {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
}

export interface ContactSettings extends BaseEventScopedDoc {
  address: string;
  contacts: ContactPerson[];
}

export type PublishStatus = 'draft' | 'published';

export interface BaseEventScopedDoc {
  id: string;
  status: PublishStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
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
  createdAt?: unknown;
  updatedAt?: unknown;
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

export async function getEventScopedDocs<T>(eventId: string, collectionName: string, orderField?: string): Promise<T[]> {
  const colRef = collection(db, "events", eventId, collectionName);
  const q = orderField ? query(colRef, orderBy(orderField, 'asc')) : colRef;
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
}

export async function setEventScopedDoc<T extends { id: string }>(eventId: string, collectionName: string, data: T): Promise<void> {
  const isNew = !(data as Record<string, unknown>).createdAt;
  const payload: Record<string, unknown> = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  if (isNew) {
    payload.createdAt = serverTimestamp();
  }
  await setDoc(doc(db, "events", eventId, collectionName, data.id), payload, { merge: true });
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
  const payload: Record<string, unknown> = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  if (isNew) {
    payload.createdAt = serverTimestamp();
  }
  await setDoc(doc(db, "timelineEntries", data.id), payload, { merge: true });
}

export async function deleteTimelineEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, "timelineEntries", id));
}

// uploadCMSMedia removed: migrated to Cloudinary unsigned uploads
