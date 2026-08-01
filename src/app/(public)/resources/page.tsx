/**
 * Resources Page Component
 *  * Public resources and downloads listing.
 */

import { redirect } from "next/navigation";

// Redirect /resources to the new Camp Guide at /booklet
export default function ResourcesRedirectPage() {
  redirect("/booklet");
}
