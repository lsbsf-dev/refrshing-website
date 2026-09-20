/**
 * Admin Seed Page Component
 * Database seeding utilities for admin.
 */

import { notFound } from "next/navigation";
import AdminSeedClientPage from "./AdminSeedClientPage";

export default function AdminSeedPage() {
  if (process.env.ADMIN_SEED_ENABLED !== "true") {
    notFound();
  }

  return <AdminSeedClientPage />;
}
