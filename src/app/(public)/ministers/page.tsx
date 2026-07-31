/**
 * Ministers Directory Page Component
 * Queries and displays the list of featured speakers from Firestore with React Query caching.
 * Features category filter tabs: All, Keynote, Gospel Music, Panelists & Alumni.
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMinisters } from "@/lib/firebase/ministers";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import { REGISTRATION_URL } from "@/lib/constants";
import seedMinisters from "@/lib/firebase/seedMinisters.json";
import { Minister } from "@/types/minister";

type TabType = "all" | "keynote" | "music" | "panelist";

const tabsConfig: { id: TabType; label: string }[] = [
  { id: "all", label: "All Speakers" },
  { id: "keynote", label: "Keynote Speakers" },
  { id: "music", label: "Gospel Music" },
  { id: "panelist", label: "Panelists & Alumni" },
];

export default function MinistersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const { data: ministers = [], isLoading } = useQuery({
    queryKey: ["ministers", ACTIVE_EVENT_ID],
    queryFn: () => getMinisters(ACTIVE_EVENT_ID),
    staleTime: 6 * 60 * 60 * 1000,
    initialData: () =>
      (seedMinisters as Minister[]).filter(
        (m) => m.eventId === ACTIVE_EVENT_ID && m.status === "published"
      ),
  });

  const filteredMinisters = ministers.filter((m) => {
    if (activeTab === "all") return true;
    return (m.category || "keynote") === activeTab;
  });

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
        <div className="w-full h-[40dvh] min-h-[280px] bg-[#0B0907] flex flex-col justify-center pt-40 lg:pt-48 pb-20 px-6 md:px-16 border-b border-white/5" />
        <div className="max-w-7xl mx-auto w-full py-16 px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-black/5 h-[320px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907]">

      {/* ── Hero ── */}
      <section className="w-full bg-[#0B0907] text-white flex flex-col justify-end pt-36 lg:pt-48 pb-16 px-6 md:px-16 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#C25627]/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <span className="font-sans text-sm font-bold tracking-[0.3em] text-[#DDB94E] uppercase block mb-3">
            REFRESHING 2026 — SPEAKERS & MINISTERS
          </span>
          <h1 className="font-serif text-5xl sm:text-7xl font-light text-white uppercase leading-none mb-6">
            THE <span className="text-[#C25627] font-normal">MINISTERS</span>
          </h1>
          <p className="font-sans text-white/50 text-sm max-w-xl font-light leading-relaxed">
            Men and women of God called to speak into this generation — bringing the Word, the Spirit, and the fire of revival to Refreshing 2026.
          </p>
        </div>
      </section>

      {/* ── Filter Tabs ── */}
      <section className="w-full bg-white border-b border-black/5 sticky top-20 lg:top-24 z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div
            role="tablist"
            aria-label="Speaker categories"
            className="flex items-center gap-0 overflow-x-auto scrollbar-hide"
          >
            {tabsConfig.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 font-sans text-xs font-semibold tracking-wider uppercase py-4 px-5 border-b-2 transition-all duration-200 active-press ${
                  activeTab === tab.id
                    ? "border-[#C25627] text-[#C25627]"
                    : "border-transparent text-[#7A7062] hover:text-[#0B0907]"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="ml-2 text-xs font-bold bg-[#C25627]/10 text-[#C25627] px-1.5 py-0.5 rounded">
                    {filteredMinisters.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="w-full py-16 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          {filteredMinisters.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-sans text-[#7A7062] text-sm">No ministers in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {filteredMinisters.map((minister) => (
                <Link
                  key={minister.id}
                  href={`/ministers/${minister.slug}`}
                  className="group flex flex-col bg-white border border-black/5 overflow-hidden hover:border-[#C25627]/30 hover:shadow-lg transition-all duration-300 active-press"
                >
                  {/* Photo */}
                  <div className="relative w-full aspect-[3/4] bg-[#0B0907] overflow-hidden">
                    {minister.photoUrl ? (
                      <Image
                        src={minister.photoUrl}
                        alt={minister.name}
                        fill
                        className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-serif text-5xl text-white/10 font-light uppercase">
                          {minister.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    {/* Category badge */}
                    <span className="absolute top-3 left-3 font-sans text-sm font-bold tracking-widest uppercase px-2 py-1 bg-[#C25627] text-white">
                      {minister.category === "music"
                        ? "MUSIC"
                        : minister.category === "panelist"
                          ? "PANELIST"
                          : "SPEAKER"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1 p-4 flex-1">
                    <h2 className="font-serif text-sm font-normal text-[#0B0907] group-hover:text-[#C25627] transition-colors duration-300 leading-snug">
                      {minister.name}
                    </h2>
                    <p className="font-sans text-sm text-[#7A7062] font-light leading-snug line-clamp-2">
                      {minister.affiliation}
                    </p>
                    <span className="font-sans text-xs font-bold tracking-widest text-[#C25627] uppercase mt-auto pt-2">
                      View Profile →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative w-full py-24 px-6 md:px-16 bg-[#0B0907] text-white overflow-hidden border-t border-white/5">
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <span className="font-sans text-sm font-bold tracking-[0.25em] text-[#DDB94E] uppercase">
            SECURE YOUR PLACE
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-white uppercase leading-none">
            Join the <span className="font-serif italic font-extralight text-[#C25627]">Refreshing</span>
          </h2>
          <p className="font-sans text-white/60 text-sm leading-relaxed max-w-lg font-light">
            Register now to sit under these anointed voices and experience the move of God at Refreshing 2026.
          </p>
          <a
            href={REGISTRATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-sm tracking-widest uppercase transition-all duration-300 mt-4 active-press"
          >
            Register Now
          </a>
        </div>
      </section>
    </div>
  );
}
