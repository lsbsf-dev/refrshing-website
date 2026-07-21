/**
 * Announcements Page Component
 * Displays general notices queried from Firestore via TanStack Query.
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, Calendar, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAnnouncements } from "@/lib/firebase/announcements";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import seedAnnouncements from "@/lib/firebase/seedAnnouncements.json";
import { Announcement } from "@/types/announcement";

export default function AnnouncementsPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: announcements = [], isLoading, error } = useQuery({
    queryKey: ["announcements", ACTIVE_EVENT_ID],
    queryFn: () => getAnnouncements(ACTIVE_EVENT_ID),
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: () => (seedAnnouncements as Announcement[]).filter(
      (a) => a.eventId === ACTIVE_EVENT_ID && a.status === "published"
    ),
  });

  const toggleAnnouncement = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
        <div className="w-full h-[45dvh] min-h-[380px] bg-[#0B0907] flex flex-col justify-center pt-40 lg:pt-48 pb-24 px-6 md:px-16 border-b border-white/5" />
        <div className="max-w-3xl mx-auto w-full pt-10 pb-28 px-6 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white border border-black/5" />
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
            alt="Announcements details background"
            fill
            className="object-cover object-center filter grayscale"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/30 to-[#0B0907]/80 pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[300px] bg-[#E05320]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase">
            EVENT BROADCASTS
          </span>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-[85px] font-bold tracking-tight uppercase select-none leading-[0.95]">
            LATEST <br />
            <span className="text-gradient-sunset font-normal font-serif">NOTICES</span>
          </h1>
          <p className="font-serif text-base sm:text-lg md:text-xl italic text-white/80 font-light max-w-2xl border-l border-primary/50 pl-6 mt-2">
            Stay up to date with schedule adjustments, logistics announcements, and check-in procedures.
          </p>
        </div>
      </section>

      <section className="relative w-full pt-10 pb-28 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto w-full">
          {announcements.length === 0 ? (
            <div className="py-24 text-center font-serif text-xl italic text-zinc-400">
              No recent announcements.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {announcements.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`border transition-all duration-300 bg-white shadow-xs ${
                      item.isUrgent 
                        ? "border-red-500/40 hover:border-red-500/60" 
                        : "border-black/10 hover:border-[#C25627]/30"
                    }`}
                  >
                    <button
                      onClick={() => toggleAnnouncement(item.id)}
                      className="w-full flex items-center justify-between text-left p-6 font-serif text-lg md:text-xl text-[#0B0907] transition-colors duration-300 active-press select-none cursor-pointer"
                    >
                      <div className="flex flex-col gap-1.5 pr-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`font-mono text-[9px] font-bold tracking-widest px-2.5 py-0.5 uppercase ${
                            item.isUrgent 
                              ? "bg-red-500/10 text-red-600 border border-red-500/20" 
                              : "bg-[#C25627]/10 text-[#C25627] border border-[#C25627]/20"
                          }`}>
                            {item.category}
                          </span>
                          <span className="font-sans text-[10px] text-zinc-400 font-light tracking-wide flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-zinc-400" /> {new Date(item.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="font-normal uppercase leading-tight mt-1 flex items-center gap-2">
                          {item.isUrgent && <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                          {item.title}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-zinc-400 transition-transform duration-300 flex-shrink-0 ${
                          isOpen ? "rotate-180 text-[#C25627]" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100 border-t border-black/5" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="p-6 font-sans text-sm text-[#7A7062] leading-relaxed font-light">
                          {item.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
