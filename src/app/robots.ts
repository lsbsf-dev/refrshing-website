/**
 * Robots Configuration Module
 * Instructs search crawlers on allowed indexing boundaries.
 */

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: "https://refreshing.lsbsf.org/sitemap.xml",
  };
}
