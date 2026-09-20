/**
 * Seed Page Component
 *  * Public data seeding page.
 */

import { notFound } from "next/navigation";
import SeedClientPage from "./SeedClientPage";

export default function SeedPage() {
  if (process.env.ADMIN_SEED_ENABLED !== "true") {
    notFound();
  }

  return <SeedClientPage />;
}
