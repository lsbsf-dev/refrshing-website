/**
 * Camp Guide — Article/Hymn Reader Page
 * Renders the full content of a booklet section (hymn, rules, devotional, study guide)
 * with contextual cross-links to related sessions and ministers.
 */

"use client";

import React, { use, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock, MapPin, User, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getResourceBySlug } from "@/lib/firebase/resources";
import { getSessions } from "@/lib/firebase/programme";
import { getMinisters } from "@/lib/firebase/ministers";
import { useParams } from "next/navigation";
import { logAnalyticsEvent } from "@/lib/analytics";

/* ── Simple markdown-to-HTML renderer ─────────────────────────── */
function renderMarkdown(text: string): string {
  let html = text;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="font-serif text-xl font-normal text-[#0B0907] mt-8 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="font-serif text-2xl font-normal text-[#0B0907] mt-10 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="font-serif text-3xl font-light text-[#0B0907] mt-12 mb-5">$1</h1>');

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#0B0907]">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="border-black/10 my-8" />');

  // Unordered list items and wrapping
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc leading-relaxed">$1</li>');
  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>)(\n<li[^>]*>[\s\S]*?<\/li>)*/g, (m) =>
    `<ul class="space-y-1 my-4 font-sans text-sm text-[#3D3530]">${m}</ul>`
  );

  // Italic chorus lines
  html = html.replace(/^_(.+)_$/gm, '<p class="font-sans text-sm italic text-[#7A7062] my-1">$1</p>');

  // Paragraph blocks (double newline separation)
  const blocks = html.split(/\n{2,}/);
  const wrapped = blocks.map((block) => {
    if (
      block.startsWith("<h") ||
      block.startsWith("<ul") ||
      block.startsWith("<hr") ||
      block.startsWith("<p class=\"font-sans text-sm italic")
    ) {
      return block;
    }
    const inner = block.replace(/\n/g, "<br/>");
    return `<p class="font-sans text-sm md:text-base leading-relaxed text-[#3D3530] font-light">${inner}</p>`;
  });

  return wrapped.join("\n");
}

export default function BookletSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const __params = require("next/navigation").useParams();
  const ACTIVE_EVENT_ID = __params?.eventId as string;
  const { slug } = use(params);

  const { data: resource, isLoading, error } = useQuery({
    queryKey: ["resource", ACTIVE_EVENT_ID, slug],
    queryFn: async () => {
      const [articles, bibleStudies, resourcesData] = await Promise.all([
        import("@/lib/firebase/articles").then(m => m.getArticleBySlug(ACTIVE_EVENT_ID, slug)),
        import("@/lib/firebase/bible-studies").then(m => m.getBibleStudyBySlug(ACTIVE_EVENT_ID, slug)),
        getResourceBySlug(ACTIVE_EVENT_ID, slug)
      ]);
      return articles || bibleStudies || resourcesData || null;
    },
    staleTime: 6 * 60 * 60 * 1000,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions", ACTIVE_EVENT_ID],
    queryFn: () => getSessions(ACTIVE_EVENT_ID),
    enabled: !!resource,
    staleTime: 30 * 60 * 1000,
  });

  const { data: ministers = [] } = useQuery({
    queryKey: ["ministers", ACTIVE_EVENT_ID],
    queryFn: () => getMinisters(ACTIVE_EVENT_ID),
    enabled: !!resource,
    staleTime: 6 * 60 * 60 * 1000,
  });

  useEffect(() => {
    if (resource) {
      logAnalyticsEvent({
        category: "Resources",
        action: "view_section",
        label: resource.title,
      });
    }
  }, [resource]);

  if (isLoading) {
    return (
      <div className="w-full flex-1 bg-[#FAF6EE] animate-pulse">
        <div className="h-[30dvh] bg-[#0B0907]" />
        <div className="max-w-3xl mx-auto py-10 sm:py-16 px-4 sm:px-6 space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`h-4 bg-black/5 rounded w-${i % 2 === 0 ? "full" : "3/4"}`} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !resource) return notFound();

  // Related sessions that reference this resource's slug in hymnIds or readingIds
  const relatedSessions = sessions.filter((s: any) =>
    s.hymnIds?.includes(resource.id) || s.readingIds?.includes(resource.id)
  );

  // Related ministers referenced in the resource
  const relatedMinisters = ministers.filter((m) =>
    resource.ministerIds?.includes(m.id)
  );

  const htmlContent = renderMarkdown(resource.description);

  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907]">

      {/* ── Hero banner ── */}
      <section className="w-full bg-[#0B0907] text-white flex flex-col justify-end pt-36 lg:pt-48 pb-12 px-4 sm:px-6 md:px-16 border-b border-white/5">
        <div className="max-w-4xl mx-auto w-full">
          {/* Back link */}
          <Link
            href="/booklet"
            className="inline-flex items-center gap-1.5 font-sans text-xs text-white/40 hover:text-white transition-colors mb-6 active-press"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Resources
          </Link>
          {/* Category */}
          <span className="font-sans text-xs font-bold tracking-widest text-[#DDB94E] uppercase block mb-3">
            {resource.category}
          </span>
          {/* Title */}
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-white leading-tight mb-4">
            {resource.title}
          </h1>
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 font-sans text-sm text-white/40 uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {resource.author}
            </span>
            {resource.publishedAt && (
              <span>
                {new Date(resource.publishedAt).toLocaleDateString("en-GB", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Article content ── */}
      <section className="w-full py-12 px-4 sm:px-6 md:px-16">
        <div className="max-w-3xl mx-auto">
          <div
            className="space-y-4"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Download button */}
          {resource.fileUrl && (
            <div className="mt-12 border-t border-black/5 pt-10 text-center">
              <a
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#C25627] hover:bg-[#A8451D] text-white font-sans font-bold text-xs tracking-widest uppercase py-4 px-8 transition-colors duration-300 active-press cursor-pointer"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </section>


      {/* ── Related Ministers/Authors ── */}
      {relatedMinisters.length > 0 && (
        <section className="w-full py-12 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] border-t border-black/5">
          <div className="max-w-4xl mx-auto">
            <span className="font-sans text-sm font-bold tracking-widest text-[#C25627] uppercase block mb-6">
              RELATED SPEAKERS & AUTHORS
            </span>
            <div className="flex flex-wrap gap-4">
              {relatedMinisters.map((minister) => (
                <Link
                  key={minister.id}
                  href={`/ministers/${minister.slug}`}
                  className="group flex items-center gap-3 p-4 bg-white border border-black/5 hover:border-[#C25627]/30 transition-all duration-300 active-press"
                >
                  <div className="h-10 w-10 bg-[#0B0907] flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-white text-sm font-light">
                      {minister.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-serif text-sm text-[#0B0907] group-hover:text-[#C25627] transition-colors">
                      {minister.name}
                    </p>

                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── More from the guide ── */}
      <section className="w-full py-8 px-4 sm:px-6 md:px-16 border-t border-black/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/booklet"
            className="inline-flex items-center gap-2 font-sans text-xs font-bold tracking-widest text-[#C25627] uppercase hover:gap-3 transition-all active-press"
          >
            <BookOpen className="h-4 w-4" />
            Back to Resources
          </Link>
        </div>
      </section>
    </div>
  );
}
