/**
 * Resources Page Component
 *  * Public resources and downloads listing.
 */

import { redirect } from "next/navigation";

// Redirect /resources to the new Camp Guide at /[eventId]/booklet
export default async function ResourcesRedirectPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  redirect(`/${eventId || "refreshing-2026"}/booklet`);
}
