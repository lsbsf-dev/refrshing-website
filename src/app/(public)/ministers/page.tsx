/**
 * Ministers Directory Page Component
 * Queries and displays the list of featured speakers from Firestore with React Query caching.
 */

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMinisters } from "@/lib/firebase/ministers";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import { REGISTRATION_URL } from "@/lib/constants";
import seedMinisters from "@/lib/firebase/seedMinisters.json";
import { Minister } from "@/types/minister";

export default function MinistersPage() {
  const { data: ministers = [], isLoading, error } = useQuery({
    queryKey: ["ministers", ACTIVE_EVENT_ID],
    queryFn: () => getMinisters(ACTIVE_EVENT_ID),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    initialData: () => (seedMinisters as Minister[]).filter(
      (m) => m.eventId === ACTIVE_EVENT_ID && m.status === "published"
    ),
  });

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
        <div className="w-full h-[45dvh] min-h-[380px] bg-[#0B0907] flex flex-col justify-center pt-40 lg:pt-48 pb-24 px-6 md:px-16 border-b border-white/5" />
        <div className="max-w-7xl mx-auto w-full py-24 px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {[1, 2].map((i) => (
            <div key={i} className="h-96 bg-zinc-200 border border-black/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    throw error;
  }

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      <section className="relative w-full h-[45dvh] min-h-[380px] flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-40 lg:pt-48 pb-24 px-6 md:px-16 border-b border-white/5">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Image
            src="/pictures/Image 3.jpg"
            alt="Sanctuary details background"
            fill
            className="object-cover object-center filter grayscale"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/30 to-[#0B0907]/80 pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[300px] bg-[#6B1D2A]/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase">
            REFRESHING 2026 VOICES
          </span>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-[85px] font-bold tracking-tight uppercase select-none leading-[0.95]">
            THE <br />
            <span className="text-gradient-sunset font-normal font-serif">MINISTERS</span>
          </h1>
          <p className="font-serif text-base sm:text-lg md:text-xl italic text-white/80 font-light max-w-2xl border-l border-primary/50 pl-6 mt-2">
            Meet the leaders and teachers fanning the revival flame for the 40th anniversary.
          </p>
        </div>
      </section>

      {ministers.length === 0 ? (
        <div className="py-32 text-center font-serif text-2xl italic text-zinc-400">
          No speakers found for this event edition.
        </div>
      ) : (
        <div className="flex flex-col">
          {ministers.map((minister, index) => {
            const isEven = index % 2 === 0;
            return (
              <section 
                key={minister.id}
                className="relative w-full py-28 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-b border-black/5"
              >
                <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                  <div className={`lg:col-span-6 relative flex justify-center ${isEven ? "" : "lg:order-2"}`}>
                    <Link 
                      href={`/ministers/${minister.slug}`} 
                      className="relative w-full aspect-[3/4] overflow-hidden border border-black/10 bg-[#15130F] shadow-2xl group active-press cursor-pointer block"
                    >
                      <Image
                        src={minister.photoUrl || "/pictures/Image 6.jpg"}
                        alt={minister.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-top scale-120 -translate-y-6 transition-transform duration-[1200ms] group-hover:scale-[1.22]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-65 pointer-events-none" />
                      <div className="absolute bottom-6 left-6 text-left">
                        <span className="font-sans text-[9px] font-extrabold tracking-widest text-[#E05320] uppercase bg-[#E05320]/15 border border-[#E05320]/30 px-3 py-1">
                          FEATURED SPEAKER
                        </span>
                      </div>
                    </Link>
                  </div>

                  <div className={`lg:col-span-6 flex flex-col items-start gap-6 text-left ${isEven ? "" : "lg:order-1"}`}>
                    <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#E05320] uppercase">
                      COVENANT VOICE
                    </span>
                    <h2 className="font-serif text-4xl sm:text-5xl font-light tracking-tight text-[#0B0907] leading-none uppercase">
                      <Link href={`/ministers/${minister.slug}`} className="hover:text-[#C25627] transition-colors">
                        {minister.name.split(" ")[0]} <br />
                        <span className="font-serif italic font-extralight text-primary-dark">{minister.name.split(" ").slice(1).join(" ")}</span>
                      </Link>
                    </h2>
                    <div className="h-[1px] w-20 bg-primary-dark my-2" />
                    <p className="font-sans text-zinc-600 text-sm leading-relaxed font-light">
                      {minister.biography}
                    </p>
                    <span className="font-sans text-[10px] font-bold tracking-widest text-zinc-500 block">
                      {minister.affiliation}
                    </span>
                    <Link 
                      href={`/ministers/${minister.slug}`}
                      className="mt-4 font-sans text-xs font-bold tracking-widest text-[#0B0907] hover:text-[#C25627] uppercase active-press"
                    >
                      [ READ FULL PROFILE ]
                    </Link>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      <section className="relative w-full py-24 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6 p-10 bg-[#1A0E12] text-white shadow-2xl rounded-3xl">
          <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#DDB94E] uppercase">
            MEET THE MINISTERS LIVE IN AUGUST
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-white uppercase leading-none">
            Register to <span className="font-serif italic font-extralight text-primary-light">Join Us</span>
          </h2>
          <p className="font-sans text-white/60 text-sm leading-relaxed max-w-lg font-light">
            Register to attend our keynote breakout seminars. Camp registration is required for all delegates.
          </p>
          <a
            href={REGISTRATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 bg-primary hover:bg-primary-light text-[#0B0907] font-sans font-bold text-[12px] tracking-widest uppercase transition-all duration-300 mt-4 active-press"
          >
            Register for the Program
          </a>
        </div>
      </section>
    </div>
  );
}
