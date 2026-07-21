/**
 * Minister Profile Details Page
 * Loads biography data from Firestore using TanStack query hooks.
 */

"use client";

import React, { use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMinisterBySlug } from "@/lib/firebase/ministers";
import { getSessionsForMinister } from "@/lib/firebase/programme";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import { logAnalyticsEvent } from "@/lib/analytics";

export default function MinisterSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);

  const { data: minister, isLoading: loadingMinister, error: errorMinister } = useQuery({
    queryKey: ["minister", ACTIVE_EVENT_ID, resolvedParams.slug],
    queryFn: () => getMinisterBySlug(ACTIVE_EVENT_ID, resolvedParams.slug),
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

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ["sessions", "minister", minister?.id],
    queryFn: () => getSessionsForMinister(ACTIVE_EVENT_ID, minister?.id || ""),
    enabled: !!minister?.id,
    staleTime: 30 * 60 * 1000,
  });

  if (loadingMinister) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
        <div className="w-full h-[40dvh] min-h-[340px] bg-[#0B0907] flex flex-col justify-center pt-40 lg:pt-48 pb-20 px-6 md:px-16 border-b border-white/5" />
        <div className="max-w-7xl mx-auto w-full py-24 px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 aspect-[3/4] bg-zinc-200" />
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="h-4 w-48 bg-zinc-200" />
            <div className="h-10 w-96 bg-zinc-300" />
          </div>
        </div>
      </div>
    );
  }

  if (errorMinister) {
    throw errorMinister;
  }

  if (!minister) {
    notFound();
  }

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      <section className="relative w-full h-[40dvh] min-h-[340px] flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-40 lg:pt-48 pb-20 px-6 md:px-16 border-b border-white/5">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <Image
            src={minister.photoUrl || "/pictures/Image 6.jpg"}
            alt={minister.name}
            fill
            className="object-cover object-center filter grayscale"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/30 to-[#0B0907]/80 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <Link 
            href="/ministers"
            className="flex items-center gap-1 font-sans text-[10px] font-extrabold tracking-[0.2em] text-[#DDB94E] uppercase hover:text-white transition-colors mb-2"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Ministers
          </Link>
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase">
            MINISTER PROFILE
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight uppercase select-none leading-none">
            {minister.name.split(" ")[0]} <span className="text-gradient-sunset font-normal font-serif">{minister.name.split(" ").slice(1).join(" ")}</span>
          </h1>
        </div>
      </section>

      <section className="relative w-full py-24 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907]">
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-5 relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-[3/4] border border-black/10 shadow-2xl bg-white overflow-hidden p-2.5">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={minister.photoUrl || "/pictures/Image 6.jpg"}
                  alt={minister.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-top scale-105"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#E05320] uppercase">
              {minister.affiliation}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-[#0B0907] leading-none uppercase">
              BIOGRAPHY
            </h2>
            <div className="h-[1px] w-20 bg-primary-dark my-1" />
            
            <div className="font-sans text-zinc-600 text-sm leading-relaxed font-light space-y-4">
              {minister.biography.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {sessions.length > 0 && (
              <div className="w-full mt-6 border-t border-black/5 pt-8">
                <h3 className="font-serif text-xl font-normal uppercase text-[#0B0907] mb-4">
                  ASSIGNED SESSIONS
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-black/10 bg-white shadow-xs group">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-[#C25627] mt-0.5" />
                        <div>
                          <Link 
                            href={`/programme/${session.slug}`}
                            className="font-serif text-base font-normal text-[#0B0907] hover:text-[#C25627] uppercase transition-colors"
                          >
                            {session.title}
                          </Link>
                          <span className="block font-mono text-[9px] text-[#C25627] tracking-widest uppercase mt-0.5">
                            {session.day}
                          </span>
                        </div>
                      </div>
                      <Link 
                        href={`/programme/${session.slug}`}
                        className="mt-3 sm:mt-0 font-sans text-[10px] font-bold tracking-widest text-[#0B0907] hover:text-[#C25627] uppercase active-press self-start sm:self-center"
                      >
                        [ VIEW DETAILS ]
                      </Link>
                    </div>
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


