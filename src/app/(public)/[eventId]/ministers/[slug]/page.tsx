/**
 * Minister Detail Page Component
 * Displays bio, category, assigned sessions, and articles for a minister.
 */

"use client";

import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Clock, MapPin, BookOpen } from "lucide-react";
import { getMinisterBySlug } from "@/lib/firebase/ministers";
import { getSessions } from "@/lib/firebase/programme";
import { getResources } from "@/lib/firebase/resources";
import { Minister } from "@/types/minister";
import { Session } from "@/types/programme";
import { Resource } from "@/types/resource";

export default function MinisterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const __params = require("next/navigation").useParams();
  const ACTIVE_EVENT_ID = __params?.eventId as string;
  const { slug } = use(params);

  // Minister details query
  const { data: minister, isLoading, error } = useQuery({
    queryKey: ["minister", ACTIVE_EVENT_ID, slug],
    queryFn: () => getMinisterBySlug(ACTIVE_EVENT_ID, slug),
    staleTime: 6 * 60 * 60 * 1000,
  });

  // Assigned sessions query
  const { data: allSessions = [] } = useQuery({
    queryKey: ["sessions", ACTIVE_EVENT_ID],
    queryFn: () => getSessions(ACTIVE_EVENT_ID),
    staleTime: 30 * 60 * 1000,
  });

  // Authored resources query
  const { data: allResources = [] } = useQuery({
    queryKey: ["resources", "all", ACTIVE_EVENT_ID],
    queryFn: async () => {
      const [articles, bibleStudies, resourcesData] = await Promise.all([
        import("@/lib/firebase/articles").then(m => m.getArticles(ACTIVE_EVENT_ID)),
        import("@/lib/firebase/bible-studies").then(m => m.getBibleStudies(ACTIVE_EVENT_ID)),
        getResources(ACTIVE_EVENT_ID)
      ]);
      return [...articles, ...bibleStudies, ...resourcesData];
    },
    staleTime: 30 * 60 * 1000,
  });

  const sessions = minister
    ? allSessions.filter((s) => s.ministerIds?.includes(minister.id))
    : [];

  const articles = minister
    ? allResources.filter(
        (r) =>
          r.ministerIds?.includes(minister.id) ||
          r.author?.toLowerCase().includes(minister.name.toLowerCase())
      )
    : [];

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
        <div className="h-[40dvh] bg-[#0B0907]" />
        <div className="max-w-7xl mx-auto w-full py-10 sm:py-16 px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 aspect-[3/4] bg-zinc-200 rounded-2xl" />
          <div className="lg:col-span-7 space-y-4 pt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-4 bg-zinc-200 rounded ${i === 0 ? "w-1/3" : i % 2 === 0 ? "w-full" : "w-3/4"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !minister) return notFound();

  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907]">

      {/* ── Hero banner ── */}
      <section className="relative w-full h-[45dvh] min-h-[460px] hero-landscape flex flex-col justify-end bg-[#0B0907] text-white overflow-hidden pt-52 lg:pt-64 pb-16 px-4 sm:px-6 md:px-16 border-b border-white/5">
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
          <Link
            href="/ministers"
            className="inline-flex items-center gap-1.5 font-sans text-xs text-white/60 hover:text-white transition-colors mb-6 active-press"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Ministers
          </Link>
          <span className="font-sans text-xs font-bold tracking-widest text-[#DDB94E] uppercase block mb-2 px-3 py-1 bg-[#DDB94E]/10 rounded-full w-fit">
            {minister.category === "music" ? "GOSPEL MUSIC" : "SPEAKER"}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-light text-white uppercase leading-none break-words">
            {minister.name}
          </h1>
        </div>
      </section>

      {/* ── Profile card ── */}
      <section className="w-full py-16 px-4 sm:px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Photo */}
          <div className="lg:col-span-4">
            <div className="relative w-full max-w-sm mx-auto lg:max-w-none aspect-[3/4] bg-[#0B0907] rounded-2xl overflow-hidden shadow-xl border border-black/10">
              {minister.photoUrl ? (
                <Image
                  src={minister.photoUrl}
                  alt={minister.name}
                  fill
                  className="object-cover object-top"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-serif text-8xl text-white/10 font-light uppercase">
                    {minister.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            <div className="flex flex-col gap-3">
              <span className="font-sans text-xs text-[#C25627] tracking-widest uppercase font-bold">
                Biography
              </span>
              <div className="font-sans text-sm sm:text-base text-[#3D3530] leading-relaxed font-light whitespace-pre-line space-y-4 break-words">
                {minister.biography}
              </div>
            </div>

            {/* Sessions */}
            {sessions.length > 0 && (
              <div className="flex flex-col gap-4 pt-6 border-t border-black/10">
                <span className="font-sans text-xs text-[#C25627] tracking-widest uppercase font-bold">
                  Assigned Sessions
                </span>
                <div className="flex flex-col gap-3">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="flex flex-col gap-1.5 p-5 bg-white border border-black/5 rounded-xl shadow-sm hover:border-primary/20 transition-all duration-300"
                    >
                      <h3 className="font-serif text-lg font-medium text-[#0B0907]">
                        {sess.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 font-sans text-xs text-zinc-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {sess.day} &bull; {sess.startTime} - {sess.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {sess.venue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Articles */}
            {articles.length > 0 && (
              <div className="flex flex-col gap-4 pt-6 border-t border-black/10">
                <span className="font-sans text-xs text-[#C25627] tracking-widest uppercase font-bold">
                  Published Articles & Guides
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {articles.map((art) => (
                    <Link
                      key={art.id}
                      href={`/booklet/${art.slug}`}
                      className="group flex flex-col gap-1.5 p-4 bg-white border border-black/10 rounded-xl hover:border-[#C25627]/40 hover:shadow-md transition-all duration-300 active-press"
                    >
                      <div className="flex items-center gap-1 text-[#C25627]">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span className="font-sans text-xs font-bold uppercase tracking-wider">
                          {art.category}
                        </span>
                      </div>
                      <h3 className="font-serif text-base font-medium text-[#0B0907] group-hover:text-[#C25627] transition-colors leading-snug">
                        {art.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

    </div>
  );
}
