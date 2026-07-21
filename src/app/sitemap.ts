/**
 * Dynamic Sitemap Generator
 * Defines static and dynamic URL routing paths for web indexing crawls.
 */

import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://refreshing.lsbsf.org";

  const staticRoutes = [
    "",
    "/about",
    "/programme",
    "/ministers",
    "/gallery",
    "/resources",
    "/announcements",
    "/faq",
    "/contact",
    "/search",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const dynamicMinisters = ["pastor-segun-babalola", "dr-helen-adeyemi"].map((slug) => ({
    url: `${baseUrl}/ministers/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const dynamicSessions = [
    "chapter-leaders-arrival-check-in",
    "leadership-convocation-alignment",
    "opening-altar-fire-prayers",
    "morning-covenant-devotions",
    "discipleship-cohort-seminars",
    "campus-strategy-panel",
    "revival-encounter-session",
    "general-delegates-arrival-registration",
    "anniversary-welcome-briefing",
    "the-first-corporate-altar-meeting",
    "corporate-morning-devotions",
    "general-discipleship-seminar",
    "qa-session-panel-discussions",
    "communion-service-prophetic-night",
    "consecration-prayers",
    "commissioning-sendforth-service",
    "check-out-departure",
  ].map((slug) => ({
    url: `${baseUrl}/programme/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const dynamicAlbums = [
    "sanctuary-encounters",
    "fellowship-and-community",
    "seminar-and-study-sessions",
    "archival-reflections",
  ].map((slug) => ({
    url: `${baseUrl}/gallery/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const dynamicResources = [
    "the-greater-glory-study-guide",
    "40th-anniversary-remembrance-devotional",
    "campus-leaders-handbook",
  ].map((slug) => ({
    url: `${baseUrl}/resources/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...dynamicMinisters,
    ...dynamicSessions,
    ...dynamicAlbums,
    ...dynamicResources,
  ];
}
