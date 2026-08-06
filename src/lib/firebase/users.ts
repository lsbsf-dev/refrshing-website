import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db, app, auth } from "./app";

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

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { "Authorization": `Bearer ${token}` };
}

export async function provisionAdminAccount(data: {
  email: string;
  password?: string;
  displayName: string;
  role: string;
  allowedEvents?: string[];
}): Promise<{ data: { success: boolean; uid: string } }> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ action: "provision", ...data }),
  });
  if (!res.ok) throw new Error("Failed to provision user");
  const json = await res.json();
  return { data: json };
}

export async function getUsers(): Promise<UserMetadata[]> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/admin/users", {
    headers: { ...headers }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.users.map((u: any) => ({
    id: u.id,
    name: u.name || "",
    email: u.email || "",
    role: u.role || "viewer",
    allowedEvents: u.allowedEvents || [],
    isActive: u.isActive ?? true,
    createdAt: u.createdAt || "",
    tokensValidAfter: u.tokensValidAfter,
  }));
}

export async function updateUserAccess(uid: string, data: Partial<UserMetadata> & { password?: string }): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ 
      action: "update", 
      uid, 
      role: data.role, 
      allowedEvents: data.allowedEvents,
      displayName: data.name,
      email: data.email,
      password: data.password
    }),
  });
  if (!res.ok) throw new Error("Failed to update user");
}
