/**
 * Session Detail Page Component
 * Loads session metadata, assigned speaker profiles, and cross-linked
 * hymns & devotionals from the Camp Guide booklet.
 */

"use client";

import React, { use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, User, ChevronLeft, Music, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSessionBySlug } from "@/lib/firebase/programme";
import { getMinisters } from "@/lib/firebase/ministers";
import { getResources } from "@/lib/firebase/resources";
import { useParams } from "next/navigation";
import { logAnalyticsEvent } from "@/lib/analytics";
import { Resource } from "@/types/resource";

export default function SessionSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const __params = require("next/navigation").useParams();
  const ACTIVE_EVENT_ID = __params?.eventId as string;
  const { slug } = use(params);

  const {
    data: session,
    isLoading: loadingSession,
    error,
  } = useQuery({
    queryKey: ["session", ACTIVE_EVENT_ID, slug],
    queryFn: () => getSessionBySlug(ACTIVE_EVENT_ID, slug),
    staleTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    if (session) {
      logAnalyticsEvent({
        category: "Programme",
        action: "view_session",
        label: session.title,
      });
    }
  }, [session]);

  const { data: ministers = [] } = useQuery({
    queryKey: ["ministers", ACTIVE_EVENT_ID],
    queryFn: () => getMinisters(ACTIVE_EVENT_ID),
    enabled: !!session,
    staleTime: 6 * 60 * 60 * 1000,
  });

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
    enabled: !!session,
    staleTime: 6 * 60 * 60 * 1000,
  });

  if (loadingSession) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
        <div className="w-full h-[40dvh] min-h-[340px] bg-[#0B0907]" />
        <div className="max-w-4xl mx-auto w-full py-16 sm:py-24 px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white border border-black/5" />
            ))}
          </div>
          <div className="h-64 bg-white border border-black/5" />
        </div>
      </div>
    );
  }

  if (error) throw error;
  if (!session) return notFound();

  const assignedMinisters = ministers.filter((m) =>
    session.ministerIds.includes(m.id)
  );

  // Cross-linked hymns: resources whose id is in session.hymnIds
  const sessionAny = session as any;
  const hymns = allResources.filter(
    (r) => r.category === "Worship Lyrics" && (sessionAny.hymnIds?.includes(r.id))
  );

  // Cross-linked readings: resources whose id is in session.readingIds
  const readings = allResources.filter(
    (r) =>
      (r.category === "Devotionals" || r.category === "Bible Studies") &&
      sessionAny.readingIds?.includes(r.id)
  );

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative w-full h-[40dvh] min-h-[340px] flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-40 lg:pt-48 pb-20 px-4 sm:px-6 md:px-16 border-b border-white/5">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <Image
            src="/pictures/Image 3.jpg"
            alt="Session backdrop"
            fill
            className="object-cover object-center filter grayscale"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/30 to-[#0B0907]/80 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <Link
            href="/programme"
            className="flex items-center gap-1 font-sans text-sm font-extrabold tracking-[0.2em] text-[#DDB94E] uppercase hover:text-white transition-colors mb-2"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Programme
          </Link>
          <span className="font-sans text-sm font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase">
            SESSION · {session.day}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight uppercase leading-none">
            {session.title}
          </h1>
        </div>
      </section>

      {/* ── Details ── */}
      <section className="relative w-full py-24 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907]">
        <div className="relative z-10 max-w-4xl mx-auto">

          {/* Meta cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-center gap-3 p-5 border border-black/10 bg-white shadow-xs">
              <Calendar className="h-5 w-5 text-[#C25627]" />
              <div>
                <span className="block font-mono text-xs text-[#C25627] tracking-widest uppercase">
                  CONFERENCE DAY
                </span>
                <span className="font-sans text-sm font-semibold uppercase">{session.day}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-5 border border-black/10 bg-white shadow-xs">
              <Clock className="h-5 w-5 text-[#C25627]" />
              <div>
                <span className="block font-mono text-xs text-[#C25627] tracking-widest uppercase">
                  SESSION TIME
                </span>
                <span className="font-sans text-sm font-semibold uppercase">
                  {session.startTime} – {session.endTime}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-5 border border-black/10 bg-white shadow-xs">
              <MapPin className="h-5 w-5 text-[#C25627]" />
              <div>
                <span className="block font-mono text-xs text-[#C25627] tracking-widest uppercase">
                  ROOM VENUE
                </span>
                <span className="font-sans text-sm font-semibold uppercase">{session.venue}</span>
              </div>
            </div>
          </div>

          {/* Abstract + Speakers */}
          <div className="flex flex-col gap-6 text-left border border-black/10 bg-white p-8 md:p-12 shadow-md">
            <h2 className="font-serif text-3xl font-light uppercase text-[#0B0907]">
              SESSION ABSTRACT
            </h2>
            <div className="h-[1px] w-20 bg-[#C25627]/40 my-1" />
            <p className="font-sans text-zinc-600 text-sm leading-relaxed font-light">
              {session.description}
            </p>

            {/* Assigned ministers */}
            {assignedMinisters.length > 0 && (
              <div className="mt-8 border-t border-black/5 pt-8">
                <h3 className="font-serif text-lg font-normal uppercase text-[#0B0907] mb-4">
                  ASSIGNED MINISTERS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assignedMinisters.map((speaker) => (
                    <div
                      key={speaker.id}
                      className="flex items-center justify-between p-5 border border-black/10 bg-white shadow-xs group"
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-[#C25627]" />
                        <div>
                          <Link
                            href={`/ministers/${speaker.slug}`}
                            className="font-serif text-base font-normal text-[#0B0907] hover:text-[#C25627] uppercase transition-colors"
                          >
                            {speaker.name}
                          </Link>

                        </div>
                      </div>
                      <Link
                        href={`/ministers/${speaker.slug}`}
                        className="font-sans text-xs font-bold tracking-widest text-[#C25627] hover:text-[#0B0907] uppercase active-press"
                      >
                        View Profile →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggested hymns */}
          {hymns.length > 0 && (
            <div className="mt-10 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-[#C25627]" />
                <span className="font-sans text-sm font-bold tracking-widest text-[#C25627] uppercase">
                  Suggested Hymns & Worship
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hymns.map((h) => (
                  <Link
                    key={h.id}
                    href={`/booklet/${h.slug}`}
                    className="group flex items-center gap-3 p-4 bg-white border border-black/5 hover:border-[#C25627]/30 transition-all duration-300 active-press"
                  >
                    <Music className="h-4 w-4 text-[#C25627] flex-shrink-0" strokeWidth={1.5} />
                    <span className="font-serif text-sm text-[#0B0907] group-hover:text-[#C25627] transition-colors leading-snug">
                      {h.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recommended readings */}
          {readings.length > 0 && (
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#C25627]" />
                <span className="font-sans text-sm font-bold tracking-widest text-[#C25627] uppercase">
                  Recommended Readings & Devotionals
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {readings.map((r) => (
                  <Link
                    key={r.id}
                    href={`/booklet/${r.slug}`}
                    className="group flex items-center gap-3 p-4 bg-white border border-black/5 hover:border-[#C25627]/30 transition-all duration-300 active-press"
                  >
                    <BookOpen className="h-4 w-4 text-[#C25627] flex-shrink-0" strokeWidth={1.5} />
                    <span className="font-serif text-sm text-[#0B0907] group-hover:text-[#C25627] transition-colors leading-snug">
                      {r.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
