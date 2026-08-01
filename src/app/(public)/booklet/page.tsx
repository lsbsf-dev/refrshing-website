/**
 * Camp Guide — Table of Contents Page
 * Replaces the old /resources page. Renders an editorial booklet-style index
 * of all camp articles: rules, hymns, devotionals, study guides, and publications.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getResources } from "@/lib/firebase/resources";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import { REGISTRATION_URL } from "@/lib/constants";
import seedResources from "@/lib/firebase/seedResources.json";
import { Resource } from "@/types/resource";
import { BookOpen, FileText, Music, BookMarked, Download, ChevronRight } from "lucide-react";

type FilterTab = "all" | "articles" | "worship" | "rules" | "studies" | "devotionals" | "publications";

const filterTabs: { id: FilterTab; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All Sections", icon: BookOpen },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "worship", label: "Hymns & Worship", icon: Music },
  { id: "studies", label: "Bible Studies", icon: BookMarked },
  { id: "devotionals", label: "Devotionals", icon: FileText },
  { id: "publications", label: "Publications", icon: Download },
];

const categoryIcon: Record<string, React.ElementType> = {
  "Worship Lyrics": Music,
  "Bible Studies": BookMarked,
  "Devotionals": FileText,
  "Publications": FileText,
  "Articles": FileText,
  "Session Notes": BookOpen,
  "Downloads": Download,
};

export default function BookletPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const { data: resources = [] } = useQuery({
    queryKey: ["resources", ACTIVE_EVENT_ID],
    queryFn: () => getResources(ACTIVE_EVENT_ID),
    staleTime: 6 * 60 * 60 * 1000,
    initialData: () =>
      (seedResources as unknown as Resource[]).filter(
        (r) => r.eventId === ACTIVE_EVENT_ID && r.status === "published"
      ),
  });

  const matchesSearch = (r: Resource) =>
    !search ||
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.author.toLowerCase().includes(search.toLowerCase());

  const filteredResources = resources.filter((r) => {
    const ms = matchesSearch(r);
    if (activeFilter === "all") return ms;
    if (activeFilter === "articles") return ms && r.category === "Articles";
    if (activeFilter === "worship") return ms && r.category === "Worship Lyrics";
    if (activeFilter === "rules") return ms && r.slug === "camp-rules-and-regulations";
    if (activeFilter === "studies") return ms && r.category === "Bible Studies";
    if (activeFilter === "devotionals") return ms && r.category === "Devotionals";
    if (activeFilter === "publications") return ms && (r.category === "Publications" || r.category === "Downloads");
    return ms;
  });

  // Sort resources so that Worship Lyrics (Hymns/Songs) and rules come first in "All" view
  const sortedResources = [...filteredResources].sort((a, b) => {
    const aIsPriority = a.category === "Worship Lyrics" || a.slug === "camp-rules-and-regulations";
    const bIsPriority = b.category === "Worship Lyrics" || b.slug === "camp-rules-and-regulations";
    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    return 0;
  });

  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907]">

      {/* ── Hero ── */}
      <section className="relative w-full min-h-[300px] lg:min-h-[400px] flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-32 lg:pt-48 pb-16 px-4 sm:px-6 md:px-16 border-b border-white/5">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Image
            src="/pictures/Image 3.jpg"
            alt="Sanctuary background"
            fill
            className="object-cover object-center filter grayscale"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/30 to-[#0B0907]/80 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <span className="font-sans text-xs sm:text-sm font-bold tracking-[0.3em] text-[#DDB94E] uppercase block mb-3">
            REFRESHING 2026 — DIGITAL COMPANION
          </span>
          <h1 className="font-serif text-3xl sm:text-6xl lg:text-7xl font-light text-white uppercase leading-none mb-6">
            BOOKLET & <span className="text-[#DDB94E] font-normal">RESOURCES</span>
          </h1>
          <p className="font-sans text-white/50 text-xs sm:text-sm max-w-xl font-light leading-relaxed">
            Your complete digital companion for Refreshing 2026 — camp rules, hymns, devotionals, study guides, and all resources for the five days.
          </p>
        </div>
      </section>

      {/* ── Search + Tabs ── */}
      <section className="w-full bg-white border-b border-black/5 sticky top-20 lg:top-24 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <input
            type="search"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-56 font-sans text-xs border border-black/10 bg-[#FAF6EE] px-3 py-2 outline-none focus:border-[#C25627] transition-colors placeholder:text-[#7A7062] rounded-md"
          />
          {/* Filter tabs */}
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide flex-1 pb-1 md:pb-0">
            {filterTabs.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveFilter(id)}
                className={`flex-shrink-0 font-sans text-xs sm:text-sm font-bold tracking-wider uppercase py-2 px-3 sm:px-4 border-b-2 transition-all duration-200 whitespace-nowrap active-press ${
                  activeFilter === id
                    ? "border-[#C25627] text-[#C25627]"
                    : "border-transparent text-[#7A7062] hover:text-[#0B0907]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content Grid ── */}
      <section className="w-full py-10 px-4 sm:px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          {sortedResources.length === 0 ? (
            <div className="text-center py-24">
              <BookOpen className="h-10 w-10 text-[#7A7062] mx-auto mb-4 opacity-40" />
              <p className="font-sans text-[#7A7062] text-sm">No results found. Try a different search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedResources.map((resource, idx) => {
                const Icon = categoryIcon[resource.category] || FileText;
                return (
                  <Link
                    key={resource.id}
                    href={`/booklet/${resource.slug}`}
                    prefetch={false}
                    className="group flex flex-col bg-white border border-black/10 rounded-2xl hover:border-[#C25627]/40 hover:shadow-lg transition-all duration-300 p-6 active-press"
                  >
                    {/* Index + category */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs text-[#C25627] tracking-widest uppercase font-bold bg-[#C25627]/8 px-2 py-1 rounded">
                        {resource.category}
                      </span>
                      <span className="font-mono text-sm text-[#7A7062] opacity-40">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Icon + Title */}
                    <div className="flex items-start gap-3 mb-3">
                      <Icon className="h-5 w-5 text-[#C25627] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <h2 className="font-serif text-base font-normal text-[#0B0907] group-hover:text-[#C25627] transition-colors duration-300 leading-snug">
                        {resource.title}
                      </h2>
                    </div>

                    {/* Author */}
                    <p className="font-sans text-sm text-[#7A7062] font-light mt-auto">
                      {resource.author}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-1 mt-4 pt-4 border-t border-black/5">
                      <span className="font-sans text-xs font-bold tracking-widest text-[#C25627] uppercase group-hover:gap-2 transition-all">
                        READ
                      </span>
                      <ChevronRight className="h-3 w-3 text-[#C25627] group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-20 px-4 sm:px-6 md:px-16 bg-[#0B0907] text-white overflow-hidden border-t border-white/5 mt-auto">
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <span className="font-sans text-sm font-bold tracking-[0.25em] text-[#DDB94E] uppercase">
            JOIN THE REFRESHING
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-white uppercase leading-none">
            Experience the <span className="font-serif italic font-extralight text-[#C25627]">Greater Glory</span>
          </h2>
          <a
            href={REGISTRATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-sm tracking-widest uppercase transition-all duration-300 mt-2 active-press"
          >
            Register for the Programme
          </a>
        </div>
      </section>
    </div>
  );
}
