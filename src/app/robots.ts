/**
 * @file robots.ts
 * @description Dynamic robots.txt configuration generator.
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
