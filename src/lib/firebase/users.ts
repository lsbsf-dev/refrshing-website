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

export async function provisionAdminAccount(data: {
  email: string;
  password?: string;
  displayName: string;
  role: string;
  allowedEvents?: string[];
}): Promise<{ data: { success: boolean; uid: string } }> {
  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "provision", ...data }),
  });
  if (!res.ok) throw new Error("Failed to provision user");
  const json = await res.json();
  return { data: json };
}

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
  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update", uid, role: data.role, allowedEvents: data.allowedEvents }),
  });
  if (!res.ok) throw new Error("Failed to update user");
}
