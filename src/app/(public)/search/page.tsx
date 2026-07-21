/**
 * Search Page Component
 * Implements client-side filter matching over Firestore-cached collections via React Query.
 */

"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMinisters } from "@/lib/firebase/ministers";
import { getSessions } from "@/lib/firebase/programme";
import { getResources } from "@/lib/firebase/resources";
import { getAnnouncements } from "@/lib/firebase/announcements";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [queryVal, setQueryVal] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<"ministers" | "sessions" | "resources" | "announcements">("ministers");

  const { data: ministers = [], isLoading: loadingMinisters } = useQuery({
    queryKey: ["ministers", ACTIVE_EVENT_ID],
    queryFn: () => getMinisters(ACTIVE_EVENT_ID),
    staleTime: 6 * 60 * 60 * 1000,
  });

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ["sessions", ACTIVE_EVENT_ID],
    queryFn: () => getSessions(ACTIVE_EVENT_ID),
    staleTime: 30 * 60 * 1000,
  });

  const { data: resources = [], isLoading: loadingResources } = useQuery({
    queryKey: ["resources", ACTIVE_EVENT_ID],
    queryFn: () => getResources(ACTIVE_EVENT_ID),
    staleTime: 6 * 60 * 60 * 1000,
  });

  const { data: announcements = [], isLoading: loadingAnnouncements } = useQuery({
    queryKey: ["announcements", ACTIVE_EVENT_ID],
    queryFn: () => getAnnouncements(ACTIVE_EVENT_ID),
    staleTime: 5 * 60 * 1000,
  });

  const filteredMinisters = ministers.filter(
    (m) =>
      m.name.toLowerCase().includes(queryVal.toLowerCase()) ||
      m.biography.toLowerCase().includes(queryVal.toLowerCase()) ||
      m.affiliation.toLowerCase().includes(queryVal.toLowerCase())
  );

  const filteredSessions = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(queryVal.toLowerCase()) ||
      s.description.toLowerCase().includes(queryVal.toLowerCase()) ||
      s.venue.toLowerCase().includes(queryVal.toLowerCase())
  );

  const filteredResources = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(queryVal.toLowerCase()) ||
      r.description.toLowerCase().includes(queryVal.toLowerCase()) ||
      r.category.toLowerCase().includes(queryVal.toLowerCase())
  );

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(queryVal.toLowerCase()) ||
      a.content.toLowerCase().includes(queryVal.toLowerCase()) ||
      a.category.toLowerCase().includes(queryVal.toLowerCase())
  );

  const isLoading = loadingMinisters || loadingSessions || loadingResources || loadingAnnouncements;

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      <section className="relative w-full h-[45dvh] min-h-[380px] flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-36 pb-24 px-6 md:px-16 border-b border-white/5">
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

        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase">
            CROSS-SITE SEARCH
          </span>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-[85px] font-bold tracking-tight uppercase select-none leading-[0.95]">
            FINDER <br />
            <span className="text-gradient-gold font-normal font-serif">INDEX</span>
          </h1>
          <p className="font-serif text-base sm:text-lg md:text-xl italic text-white/80 font-light max-w-2xl border-l border-primary/50 pl-6 mt-2">
            Locate scheduled sessions, speaker details, and downloadable files.
          </p>
        </div>
      </section>

      <section className="relative w-full py-10 px-6 md:px-16 bg-[#FAF6EE] border-b border-black/5 z-20">
        <div className="max-w-3xl mx-auto w-full">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Type your search keyword..."
              value={queryVal}
              onChange={(e) => setQueryVal(e.target.value)}
              className="w-full bg-white border border-black/10 focus:border-[#C25627] text-[#0B0907] placeholder-zinc-400 text-sm font-sans py-4 pl-6 pr-12 outline-none transition-all duration-300 shadow-sm"
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </section>

      <section className="relative w-full py-20 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          
          <div className="flex border-b border-black/10 mb-10 overflow-x-auto scrollbar-none gap-8">
            <button
              onClick={() => setActiveTab("ministers")}
              className={`font-serif text-lg pb-3 relative uppercase tracking-wider transition-colors duration-300 cursor-pointer ${
                activeTab === "ministers" ? "text-[#C25627] font-semibold" : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              Ministers ({filteredMinisters.length})
              {activeTab === "ministers" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C25627]" />}
            </button>
            <button
              onClick={() => setActiveTab("sessions")}
              className={`font-serif text-lg pb-3 relative uppercase tracking-wider transition-colors duration-300 cursor-pointer ${
                activeTab === "sessions" ? "text-[#C25627] font-semibold" : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              Sessions ({filteredSessions.length})
              {activeTab === "sessions" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C25627]" />}
            </button>
            <button
              onClick={() => setActiveTab("resources")}
              className={`font-serif text-lg pb-3 relative uppercase tracking-wider transition-colors duration-300 cursor-pointer ${
                activeTab === "resources" ? "text-[#C25627] font-semibold" : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              Resources ({filteredResources.length})
              {activeTab === "resources" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C25627]" />}
            </button>
            <button
              onClick={() => setActiveTab("announcements")}
              className={`font-serif text-lg pb-3 relative uppercase tracking-wider transition-colors duration-300 cursor-pointer ${
                activeTab === "announcements" ? "text-[#C25627] font-semibold" : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              Notices ({filteredAnnouncements.length})
              {activeTab === "announcements" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C25627]" />}
            </button>
          </div>

          {isLoading ? (
            <div className="py-24 text-center font-serif text-xl italic text-zinc-400">
              Searching database...
            </div>
          ) : (
            <div className="w-full">
              {activeTab === "ministers" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMinisters.map((m) => (
                    <Link
                      key={m.id}
                      href={`/ministers/${m.slug}`}
                      className="p-6 bg-white border border-black/5 hover:border-[#C25627]/30 transition-all duration-300 hover:scale-[1.01] block text-left"
                    >
                      <h3 className="font-serif text-xl font-normal text-[#0B0907] uppercase">{m.name}</h3>
                      <span className="font-mono text-[9px] text-[#C25627] tracking-widest block uppercase mt-1">{m.affiliation}</span>
                      <p className="font-sans text-xs text-zinc-500 font-light mt-3 line-clamp-2">{m.biography}</p>
                    </Link>
                  ))}
                  {filteredMinisters.length === 0 && (
                    <div className="col-span-2 py-16 text-center font-serif text-base italic text-zinc-400">No matching ministers found.</div>
                  )}
                </div>
              )}

              {activeTab === "sessions" && (
                <div className="flex flex-col gap-4">
                  {filteredSessions.map((s) => (
                    <Link
                      key={s.id}
                      href={`/programme/${s.slug}`}
                      className="p-6 bg-white border border-black/5 hover:border-[#C25627]/30 transition-all duration-300 hover:scale-[1.01] block text-left"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-serif text-xl font-normal text-[#0B0907] uppercase">{s.title}</h3>
                        <span className="font-mono text-[9px] text-[#C25627] tracking-widest uppercase bg-[#C25627]/10 px-2 py-0.5">{s.day}</span>
                      </div>
                      <p className="font-sans text-xs text-zinc-500 font-light mt-2 line-clamp-2">{s.description}</p>
                    </Link>
                  ))}
                  {filteredSessions.length === 0 && (
                    <div className="py-16 text-center font-serif text-base italic text-zinc-400">No matching sessions found.</div>
                  )}
                </div>
              )}

              {activeTab === "resources" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredResources.map((r) => (
                    <Link
                      key={r.id}
                      href={`/resources/${r.slug}`}
                      className="p-6 bg-white border border-black/5 hover:border-[#C25627]/30 transition-all duration-300 hover:scale-[1.01] block text-left"
                    >
                      <span className="font-mono text-[9px] text-[#C25627] tracking-widest block uppercase mb-1">{r.category}</span>
                      <h3 className="font-serif text-xl font-normal text-[#0B0907] uppercase">{r.title}</h3>
                      <p className="font-sans text-xs text-zinc-500 font-light mt-2 line-clamp-2">{r.description}</p>
                    </Link>
                  ))}
                  {filteredResources.length === 0 && (
                    <div className="col-span-2 py-16 text-center font-serif text-base italic text-zinc-400">No matching resources found.</div>
                  )}
                </div>
              )}

              {activeTab === "announcements" && (
                <div className="flex flex-col gap-4">
                  {filteredAnnouncements.map((a) => (
                    <Link
                      key={a.id}
                      href="/announcements"
                      className="p-6 bg-white border border-black/5 hover:border-[#C25627]/30 transition-all duration-300 hover:scale-[1.01] block text-left"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-serif text-xl font-normal text-[#0B0907] uppercase">{a.title}</h3>
                        <span className="font-mono text-[9px] text-zinc-400 tracking-widest uppercase bg-black/5 px-2 py-0.5">{a.category}</span>
                      </div>
                      <p className="font-sans text-xs text-zinc-500 font-light mt-2 line-clamp-2">{a.content}</p>
                    </Link>
                  ))}
                  {filteredAnnouncements.length === 0 && (
                    <div className="py-16 text-center font-serif text-base italic text-zinc-400">No matching notices found.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
