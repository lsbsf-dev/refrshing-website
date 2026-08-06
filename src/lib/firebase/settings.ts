import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./app";

export interface SystemSettings {
  defaultEventId: string;
}

export async function getSystemSettings(): Promise<SystemSettings> {
  const ref = doc(db, "settings", "global");
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as SystemSettings;
  }
  return { defaultEventId: "refreshing-2026" }; // Fallback
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<void> {
  const ref = doc(db, "settings", "global");
  await setDoc(ref, settings, { merge: true });
}
