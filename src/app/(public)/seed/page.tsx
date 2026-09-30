/**
 * @file page.tsx
 * @description Public utility page for triggering sample content seeding.
 */

import { notFound } from "next/navigation";
import SeedClientPage from "./SeedClientPage";

export default function SeedPage() {
  if (process.env.ADMIN_SEED_ENABLED !== "true") {
    notFound();
  }

  return <SeedClientPage />;
}
