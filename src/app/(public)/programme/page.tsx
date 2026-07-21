/**
 * Programme Page Component
 * Queries and lists scheduled sessions for each day.
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getSessions } from "@/lib/firebase/programme";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";

interface DayConfig {
  label: string;
  name: string;
  date: string;
  title: string;
  summary: string;
}

const daysConfig: DayConfig[] = [
  {
    label: "DAY 01",
    name: "Monday",
    date: "August 10, 2026",
    title: "The Altar Commenced",
    summary: "Opening alignment sessions for fellowship leaders, orientation, and setting the revival fire."
  },
  {
    label: "DAY 02",
    name: "Tuesday",
    date: "August 11, 2026",
    title: "The Word Exposed",
    summary: "Intensive training, seminar sessions, and theological foundations for fellowship leaders."
  },
  {
    label: "DAY 03",
    name: "Wednesday",
    date: "August 12, 2026",
    title: "General Gathering Arrival",
    summary: "Arrival of the main delegate body. Corporate gatherings commence with the evening revival fire."
  },
  {
    label: "DAY 04",
    name: "Thursday",
    date: "August 13, 2026",
    title: "Word Feast & Communion",
    summary: "A heavy concentration of scripture, breakout panels, and corporate communion table."
  },
  {
    label: "DAY 05",
    name: "Friday",
    date: "August 14, 2026",
    title: "Commissioning & Departure",
    summary: "Final commissioning: sending forth of delegates to campus chapters, and check-out."
  }
];

export default function ProgrammePage() {
  const [activeDay, setActiveDay] = useState(0);

  const { data: allSessions = [], isLoading, error } = useQuery({
    queryKey: ["sessions", ACTIVE_EVENT_ID],
    queryFn: () => getSessions(ACTIVE_EVENT_ID),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const activeDayLabel = `Day ${activeDay + 1}`;
  const filteredSessions = allSessions.filter(
    (sess) => sess.day.toLowerCase() === activeDayLabel.toLowerCase()
  );

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
        <div className="w-full h-[45dvh] min-h-[380px] bg-[#0B0907] flex flex-col justify-center pt-36 pb-24 px-6 md:px-16 border-b border-white/5" />
        <div className="max-w-4xl mx-auto w-full py-24 px-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white border border-black/5 mb-4" />
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
        <div className="absolute top-1/2 left-1/3 w-[600px] h-[400px] bg-[#6B1D2A]/20 rounded-full blur-[160px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase">
            FIVE DAYS IN HIS SANCTUARY
          </span>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-[85px] font-bold tracking-tight uppercase select-none leading-[0.95]">
            DAILY <br />
            <span className="text-gradient-gold font-normal font-serif">JOURNEY</span>
          </h1>
          <p className="font-serif text-base sm:text-lg md:text-xl italic text-white/80 font-light max-w-2xl border-l border-primary/50 pl-6 mt-2">
            An unfolding vertical roadmap from covenant devotion to global deployment.
          </p>
        </div>
      </section>

      <section className="relative w-full bg-[#FAF6EE] border-b border-black/5 py-6 px-6 md:px-16 overflow-hidden z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center overflow-x-auto gap-4 md:gap-8 scrollbar-none">
          {daysConfig.map((d, idx) => {
            const isActive = idx === activeDay;
            return (
              <button
                key={idx}
                onClick={() => setActiveDay(idx)}
                className={`flex-shrink-0 text-left font-sans py-2.5 px-5 border transition-all duration-300 active-press cursor-pointer ${
                  isActive 
                    ? "border-primary text-[#0B0907] bg-white shadow-sm font-semibold" 
                    : "border-transparent text-zinc-400 hover:text-zinc-700"
                }`}
              >
                <span className="block font-mono text-[10px] font-bold tracking-widest text-[#C25627] mb-0.5">
                  {d.label}
                </span>
                <span className="block text-sm font-semibold uppercase tracking-wider">
                  {d.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="relative w-full py-28 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-stretch">
          <div className="mb-16 text-left">
            <span className="font-mono text-xs font-bold text-[#C25627] block mb-2 tracking-widest uppercase">
              {daysConfig[activeDay].date}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-[#0B0907] uppercase tracking-tight">
              {daysConfig[activeDay].name} · <span className="font-serif italic font-extralight text-[#C25627]">{daysConfig[activeDay].title}</span>
            </h2>
            <p className="font-sans text-zinc-500 text-sm font-light mt-3 leading-relaxed max-w-xl">
              {daysConfig[activeDay].summary}
            </p>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="py-24 text-center font-serif text-xl italic text-zinc-400 border-l border-black/10 pl-6 md:pl-12">
              No sessions scheduled for this day yet.
            </div>
          ) : (
            <div className="relative pl-6 md:pl-12 border-l border-black/10 flex flex-col gap-12 text-left">
              {filteredSessions.map((sess) => (
                <Link 
                  href={`/programme/${sess.slug}`} 
                  key={sess.id} 
                  className="relative group active-press cursor-pointer block"
                >
                  <div className="absolute -left-[31px] md:-left-[55px] top-1.5 h-4 w-4 bg-[#FAF6EE] border-2 border-primary-dark flex items-center justify-center z-10 group-hover:scale-125 transition-transform duration-300">
                    <div className="h-1.5 w-1.5 bg-[#C25627]" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[10px] font-extrabold tracking-widest text-[#C25627] bg-[#C25627]/10 border border-[#C25627]/20 px-3 py-1 uppercase">
                        {sess.startTime} - {sess.endTime}
                      </span>
                      <span className="font-sans text-[10px] text-zinc-400 tracking-wider uppercase font-light">
                        {sess.venue}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl font-light text-[#0B0907] group-hover:text-[#C25627] transition-colors duration-300 uppercase">
                      {sess.title}
                    </h3>

                    <p className="font-sans text-zinc-600 text-xs sm:text-sm font-light leading-relaxed max-w-2xl mt-1">
                      {sess.description}
                    </p>
                    
                    <span className="font-sans text-[9px] font-bold tracking-widest text-[#0B0907] group-hover:text-[#C25627] uppercase mt-1 block">
                      [ VIEW DETAILS ]
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative w-full py-24 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6 p-10 bg-[#1A0E12] text-white shadow-2xl rounded-3xl">
          <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#DDB94E] uppercase">
            SECURE YOUR REGISTRATION NOW
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-white uppercase leading-none">
            Experience the <span className="font-serif italic font-extralight text-primary-light">Refreshing</span>
          </h2>
          <p className="font-sans text-white/60 text-sm leading-relaxed max-w-lg font-light">
            Secure your delegates roster, workshop handouts, and hostel room allocations. Camp registration is required for all delegates.
          </p>
          <a
            href="https://forms.gle/DSW4CVMXWK61BHT96"
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
