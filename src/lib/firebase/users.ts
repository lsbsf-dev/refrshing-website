import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db, app } from "./app";

export interface UserMetadata {
  id: string;
  name: string;
  email: string;
  role: "superAdmin" | "eventAdmin" | "editor" | "registrationStaff" | "checkinStaff" | "viewer";
  allowedEvents: string[];
  isActive: boolean;
  createdAt: string;
  tokensValidAfter?: number;
}

const functions = getFunctions(app);

export const provisionAdminAccount = httpsCallable<
  { email: string; password?: string; displayName: string; role: string; allowedEvents?: string[] },
  { success: boolean; uid: string }
>(functions, "provisionAdminAccount");

export async function getUsers(): Promise<UserMetadata[]> {
  const ref = collection(db, "users");
  const snap = await getDocs(query(ref, orderBy("createdAt", "desc")));
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "",
      email: data.email || "",
      role: data.role || "viewer",
      allowedEvents: data.allowedEvents || [],
      isActive: data.isActive ?? true,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || "",
      tokensValidAfter: data.tokensValidAfter,
    } as UserMetadata;
  });
}

export async function updateUserAccess(uid: string, data: Partial<UserMetadata>): Promise<void> {
  // Only superAdmins can do this; it's protected by firestore.rules
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    ...data,
  });
}
