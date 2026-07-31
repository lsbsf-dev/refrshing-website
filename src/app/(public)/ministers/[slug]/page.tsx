/**
 * Minister Profile Details Page
 * Loads biography data from Firestore with cross-links to assigned sessions
 * and published articles/resources authored by this minister.
 */

"use client";

import React, { use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ChevronLeft, Clock, MapPin, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMinisterBySlug } from "@/lib/firebase/ministers";
import { getSessionsForMinister } from "@/lib/firebase/programme";
import { getResources } from "@/lib/firebase/resources";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import { logAnalyticsEvent } from "@/lib/analytics";

export default function MinisterSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const {
    data: minister,
    isLoading: loadingMinister,
    error,
  } = useQuery({
    queryKey: ["minister", ACTIVE_EVENT_ID, slug],
    queryFn: () => getMinisterBySlug(ACTIVE_EVENT_ID, slug),
    staleTime: 6 * 60 * 60 * 1000,
  });

  useEffect(() => {
    if (minister) {
      logAnalyticsEvent({
        category: "Engagement",
        action: "view_minister",
        label: minister.name,
      });
    }
  }, [minister]);

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions", "minister", minister?.id],
    queryFn: () => getSessionsForMinister(ACTIVE_EVENT_ID, minister!.id),
    enabled: !!minister,
    staleTime: 30 * 60 * 1000,
  });

  const { data: allResources = [] } = useQuery({
    queryKey: ["resources", ACTIVE_EVENT_ID],
    queryFn: () => getResources(ACTIVE_EVENT_ID),
    enabled: !!minister,
    staleTime: 6 * 60 * 60 * 1000,
  });

  // Resources authored by or linked to this minister
  const relatedResources = allResources.filter(
    (r) => r.ministerIds?.includes(minister?.id || "") || r.author === minister?.name
  );

  if (loadingMinister) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] animate-pulse">
        <div className="h-[40dvh] bg-[#0B0907]" />
        <div className="max-w-7xl mx-auto w-full py-16 px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 aspect-[3/4] bg-zinc-200" />
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
      <section className="w-full bg-[#0B0907] text-white flex flex-col justify-end pt-36 lg:pt-48 pb-12 px-6 md:px-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto w-full">
          <Link
            href="/ministers"
            className="inline-flex items-center gap-1.5 font-sans text-xs text-white/40 hover:text-white transition-colors mb-6 active-press"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Ministers
          </Link>
          <span className="font-sans text-xs font-bold tracking-widest text-[#DDB94E] uppercase block mb-2">
            {minister.category === "music"
              ? "GOSPEL MUSIC"
              : minister.category === "panelist"
                ? "PANELIST & ALUMNI"
                : "KEYNOTE SPEAKER"}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-light text-white uppercase leading-none">
            {minister.name}
          </h1>
        </div>
      </section>

      {/* ── Profile card ── */}
      <section className="w-full py-16 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Photo */}
          <div className="lg:col-span-4">
            <div className="relative w-full max-w-sm mx-auto lg:max-w-none aspect-[3/4] bg-[#0B0907] overflow-hidden">
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
            <div className="flex flex-col gap-1">
              <span className="font-sans text-sm text-[#C25627] tracking-widest uppercase font-bold">
                Affiliation
              </span>
              <p className="font-sans text-sm text-[#0B0907] font-medium">
                {minister.affiliation}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-sans text-sm text-[#C25627] tracking-widest uppercase font-bold">
                Biography
              </span>
              <p className="font-sans text-sm text-[#3D3530] leading-relaxed font-light whitespace-pre-line">
                {minister.biography}
              </p>
            </div>

            {/* Sessions */}
            {sessions.length > 0 && (
              <div className="flex flex-col gap-4 pt-6 border-t border-black/5">
                <span className="font-sans text-sm text-[#C25627] tracking-widest uppercase font-bold">
                  Assigned Sessions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/programme/${session.slug}`}
                      className="group flex flex-col gap-1.5 p-4 bg-white border border-black/5 hover:border-[#C25627]/30 transition-all duration-300 active-press"
                    >
                      <span className="font-mono text-xs text-[#C25627] tracking-widest uppercase">
                        {session.day}
                      </span>
                      <h3 className="font-serif text-sm font-normal text-[#0B0907] group-hover:text-[#C25627] transition-colors leading-snug">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-3 font-sans text-sm text-[#7A7062]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.startTime} – {session.endTime}
                        </span>
                        {session.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.venue}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Resources/Articles */}
            {relatedResources.length > 0 && (
              <div className="flex flex-col gap-4 pt-6 border-t border-black/5">
                <span className="font-sans text-sm text-[#C25627] tracking-widest uppercase font-bold">
                  Published Articles & Study Materials
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedResources.map((r) => (
                    <Link
                      key={r.id}
                      href={`/booklet/${r.slug}`}
                      className="group flex items-start gap-3 p-4 bg-white border border-black/5 hover:border-[#C25627]/30 transition-all duration-300 active-press"
                    >
                      <BookOpen className="h-4 w-4 text-[#C25627] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div>
                        <p className="font-serif text-sm text-[#0B0907] group-hover:text-[#C25627] transition-colors leading-snug">
                          {r.title}
                        </p>
                        <span className="font-mono text-sm text-[#7A7062] tracking-widest uppercase">
                          {r.category}
                        </span>
                      </div>
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
