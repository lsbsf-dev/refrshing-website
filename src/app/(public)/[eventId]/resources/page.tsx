/**
 * @file page.tsx
 * @description Public resource library listing downloadable media and study guides.
 */

import { redirect } from "next/navigation";

export default async function ResourcesRedirectPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  redirect(`/${eventId || "refreshing-2026"}/booklet`);
}
