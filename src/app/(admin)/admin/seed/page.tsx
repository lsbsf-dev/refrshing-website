/**
 * @file page.tsx
 * @description Admin control page for seeding Firestore collections with initial data.
 */

import { notFound } from "next/navigation";
import AdminSeedClientPage from "./AdminSeedClientPage";

export default function AdminSeedPage() {
  if (process.env.ADMIN_SEED_ENABLED !== "true") {
    notFound();
  }

  return <AdminSeedClientPage />;
}
