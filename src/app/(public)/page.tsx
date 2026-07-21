"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { REGISTRATION_URL } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { getMinisters } from "@/lib/firebase/ministers";
import { getSessions } from "@/lib/firebase/programme";
import { ACTIVE_EVENT_ID } from "@/lib/constants";
import seedMinisters from "@/lib/firebase/seedMinisters.json";
import seedSessions from "@/lib/firebase/seedSessions.json";
import { Minister } from "@/types/minister";
import { Session } from "@/types/programme";

/* ─────────────────────────────────────────────
   Scroll reveal hook for staggered visuals
   ───────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -55px 0px" }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function PublicHomepage() {
  const pageRef = useReveal();
  const [daysLeft, setDaysLeft] = useState(26);

  const { data: ministers = [] } = useQuery({
    queryKey: ["ministers", ACTIVE_EVENT_ID],
    queryFn: () => getMinisters(ACTIVE_EVENT_ID),
    staleTime: 6 * 60 * 60 * 1000,
    initialData: () => (seedMinisters as Minister[]).filter(
      (m) => m.eventId === ACTIVE_EVENT_ID && m.status === "published"
    ),
  });

  const { data: allSessions = [] } = useQuery({
    queryKey: ["sessions", ACTIVE_EVENT_ID],
    queryFn: () => getSessions(ACTIVE_EVENT_ID),
    staleTime: 30 * 60 * 1000,
    initialData: () => (seedSessions as Session[]).filter(
      (s) => s.eventId === ACTIVE_EVENT_ID && s.status === "published"
    ),
  });

  const daysConfig = [
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

  useEffect(() => {
    const target = new Date("2026-08-10T08:00:00Z").getTime();
    const updateTime = () => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) {
        setDaysLeft(0);
        return;
      }
      setDaysLeft(Math.floor(diff / (1000 * 60 * 60 * 24)));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={pageRef} className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      
      {/* ═══════════════════════════════════════
          SCENE 1: HERO (Explosive - Dynamic Scale & Entrance)
          ═══════════════════════════════════════ */}
      <section className="relative w-full h-[100dvh] min-h-[650px] flex flex-col justify-between overflow-hidden bg-[#0B0907] text-[#FCFAF6] pt-24 pb-8">
        
        {/* Worship background opacity */}
        <div className="absolute inset-0 w-full h-full opacity-55 pointer-events-none z-0">
          <Image
            src="/pictures/Image 3.jpg"
            alt="Worship active hands backdrop"
            fill
            priority
            className="object-cover object-[50%_65%] scale-[1.03] animate-slow-zoom"
          />
        </div>

        {/* Soft smokey light flares */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/15 to-[#0B0907]/75 pointer-events-none z-1" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] light-smokey-glow pointer-events-none z-1" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] light-smokey-glow pointer-events-none z-1" />
        
        {/* Fine texture filters */}
        <div className="absolute inset-0 texture-halftone opacity-10 pointer-events-none z-2" />
        <div className="absolute inset-0 texture-scanlines opacity-5 pointer-events-none z-2" />

        {/* Dynamic Image Collage - Sharp Editorial Corners */}
        <div className="absolute inset-y-0 right-12 lg:right-28 hidden md:flex flex-col justify-center items-end gap-0 z-10 w-72 pointer-events-none select-none">
          
          {/* 1. Large Portrait (Dominant Subject) */}
          <div className="relative aspect-[3/4] w-56 border border-white/10 shadow-2xl rotate-[3deg] overflow-hidden bg-white/5 z-20">
            <Image
              src="/pictures/Image 6.jpg"
              alt="Dominant worship profile"
              fill
              className="object-cover object-top scale-110 -translate-y-2 filter saturate-[0.85] brightness-95"
            />
          </div>

          {/* 2. Medium (Supporting Details) */}
          <div className="relative aspect-[4/3] w-48 border border-white/10 shadow-xl -translate-x-24 -translate-y-12 rotate-[-6deg] overflow-hidden bg-white/5 z-10">
            <Image
              src="/pictures/Image 11.jpg"
              alt="Supporting seminar scene"
              fill
              className="object-cover object-center scale-110 filter saturate-[0.9]"
            />
          </div>

          {/* 3. Tiny Accent */}
          <div className="relative aspect-square w-28 border border-white/10 shadow-lg -translate-x-12 -translate-y-20 rotate-[12deg] overflow-hidden bg-white/5 z-0 opacity-75">
            <Image
              src="/pictures/Image 9.jpg"
              alt="Sanctuary context details"
              fill
              className="object-cover object-center"
            />
          </div>

        </div>

        {/* Hero Content - Clean Display Typography (Staggered load sequences) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 flex-1 flex flex-col justify-center items-start gap-4">
          
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase animate-hero-item delay-100">
            LAGOS STATE BAPTIST STUDENT FELLOWSHIP PRESENTS
          </span>

          <h1 className="font-serif text-5xl sm:text-7xl md:text-[95px] lg:text-[115px] font-bold tracking-tight leading-[0.95] text-white uppercase select-none animate-hero-item delay-200">
            <span className="text-gradient-gold block font-serif">
              THE GREATER
            </span>
            <span className="text-gradient-gold block font-serif">
              GLORY
            </span>
          </h1>

          <div className="max-w-xl border-l-2 border-[#C25627] pl-4 sm:pl-6 my-2 animate-hero-item delay-300">
            <p className="font-serif text-sm sm:text-base md:text-lg italic text-white/95 leading-relaxed font-light">
              &ldquo;The glory of this present house will be greater than the glory of the former house,&rdquo; says the Lord Almighty.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1 font-mono text-[9px] tracking-widest text-[#DDB94E] uppercase animate-hero-item delay-400">
            <span>AUGUST 10–14, 2026</span>
            <span>·</span>
            <span>BAPTIST ACADEMY, OBANIKORO, LAGOS</span>
          </div>

        </div>

      </section>

      {/* ═══════════════════════════════════════
          SCENE 2: THEME (Scripture Art Card)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-20 px-6 md:px-16 bg-[#0B0907] text-[#FCFAF6] overflow-hidden border-t border-white/5">
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div data-reveal className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            <span className="font-sans text-[10px] font-extrabold tracking-[0.3em] text-[#DDB94E] uppercase">
              THE 40TH ANNIVERSARY REVIVAL
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white leading-tight uppercase">
              Beyond the <br />
              <span className="text-gradient-sunset font-normal">Former Glory</span>
            </h2>
            <div className="h-[1px] w-24 bg-[#C25627] my-2" />
            <p className="font-sans text-white/70 text-base leading-relaxed font-light max-w-xl">
              Refreshing 2026 is a threshold. For forty years, the Lord has gathered campus students in revival, faith, and fellowship. But the narrative is not ending. We are being commissioned into a greater weight of His presence, a heavier output of His glory on our campuses.
            </p>
          </div>

          <div data-reveal className="lg:col-span-5 relative flex justify-center">
            {/* Elegant scripture card - open typography framed with lines */}
            <div className="w-full max-w-md py-6 border-y border-[#DDB94E]/25 relative text-left">
              <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#C25627] uppercase block mb-3">
                HAGGAI 2:9
              </span>
              <p className="font-serif text-lg md:text-xl italic font-light text-white/95 leading-relaxed">
                &ldquo;The glory of this present house will be greater than the glory of the former house, and in this place I will grant peace, says the Lord Almighty.&rdquo;
              </p>
              <div className="mt-4">
                <span className="font-sans text-[9px] font-bold tracking-widest text-[#FFD6C4] uppercase block">
                  ISAIAH 52:1 · ARISE & PUT ON STRENGTH
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 3: 40 YEARS (Nostalgic Album - polaroid rounded frames, tape kept)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-24 bg-gradient-to-b from-[#0B0907] via-[#1D1013] to-[#0B0907] text-[#FCFAF6] texture-paper overflow-hidden border-t border-white/5 min-h-[90vh] flex items-center">
        
        {/* Giant background year watermark */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
          <span className="font-serif text-[180px] md:text-[320px] text-white/[0.015] uppercase tracking-widest font-extrabold rotate-[4deg]">
            1986
          </span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left: Exhibition Gallery Wall (2 Overlapping polaroids) */}
            <div className="lg:col-span-7 relative flex justify-center z-10 w-full">
              <div data-reveal className="relative w-full max-w-xl h-[420px] sm:h-[550px]">
                
                {/* Photo 1: Image 14 (Historic seed, polaroid) */}
                <div className="absolute left-0 top-0 w-[60%] aspect-[3/4] z-10 border border-black/15 shadow-2xl rotate-[-3deg] transition-transform duration-500 hover:rotate-0 bg-white p-2.5 rounded-2xl overflow-hidden active-press">
                  <div className="relative w-full h-[85%] overflow-hidden rounded-xl">
                    <Image
                      src="/pictures/Image 14.jpg"
                      alt="Archival foundations 1986"
                      fill
                      className="object-cover scale-110 -translate-y-2 filter sepia-[0.35] brightness-[0.85] contrast-[1.05]"
                    />
                  </div>
                  <div className="h-[15%] flex items-center justify-center font-serif text-xs italic tracking-wide text-black/85">
                    Leaders Camp Brief
                  </div>
                  <div className="absolute -top-3 left-[30%] w-12 h-4 archival-tape" />
                </div>

                {/* Photo 2: Image 10 (Modern outpour, polaroid) */}
                <div className="absolute right-0 top-16 w-[60%] aspect-[3/4] z-20 border-4 border-[#FAF6EE] shadow-2xl rotate-[3deg] transition-transform duration-500 hover:rotate-0 bg-[#FAF6EE] p-2.5 rounded-2xl overflow-hidden active-press">
                  <div className="relative w-full h-[85%] overflow-hidden rounded-xl">
                    <Image
                      src="/pictures/Image 10.jpg"
                      alt="Alumni Coordination"
                      fill
                      className="object-cover scale-115 -translate-y-3 filter saturate-[0.9]"
                    />
                  </div>
                  <div className="h-[15%] flex items-center justify-center font-serif text-xs italic tracking-wide text-black/85">
                    Covenant Renewal Moments
                  </div>
                  <div className="absolute -top-3 right-[20%] w-12 h-4 archival-tape" />
                </div>

              </div>
            </div>

            {/* Right: Editorial Narrative */}
            <div data-reveal className="lg:col-span-5 flex flex-col items-start gap-6 text-left">
              <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#C25627] uppercase">
                40 YEARS OF AN ENCOUNTER
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] uppercase">
                A legacy <br />
                of covenant <br />
                and <span className="font-serif italic font-extralight text-primary-dark">fire</span>.
              </h2>
              <p className="font-sans text-white/70 text-sm leading-relaxed font-light">
                Since its commencement in 1986, the Refreshing conference has stood as an altar for campus students. For four decades, lives have been transformed, ministries birthed, and fellowship bonds cemented.
              </p>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 font-sans text-[11px] font-extrabold tracking-wider text-[#DDB94E] hover:text-white transition-all duration-300 mt-2 active-press"
              >
                <span className="border-b border-[#DDB94E] group-hover:border-white pb-0.5">
                  THE MOVEMENT HISTORY
                </span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 4: FEATURED MINISTERS (Clean Warm Ivory background, no image overlay, no glow)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-20 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        
        <div className="relative z-10 max-w-7xl mx-auto">
          
          <div className="mb-20 text-left max-w-3xl">
            <span className="font-sans text-[10px] font-bold tracking-[0.3em] text-[#C25627] uppercase block mb-3">
              THE ORACLES COMMITTED
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#0B0907] uppercase leading-none">
              FEATURED <br />
              <span className="text-[#C25627] font-normal font-serif">MINISTERS</span>
            </h2>
            <div className="w-20 h-[1px] bg-[#C25627] mt-6" />
          </div>

          {/* Magazine Cover Editorial Layout - Sharp corners */}
          <div className="flex flex-col gap-28">
            {ministers.slice(0, 3).map((min, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={min.id} data-reveal className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  {/* Photo Frame */}
                  <Link
                    href={`/ministers/${min.slug}`}
                    className={`lg:col-span-6 relative aspect-[3/4] w-full border border-black/10 overflow-hidden shadow-xl bg-white transition-all duration-500 hover:rotate-0 active-press block ${
                      isEven ? "rotate-[-2deg]" : "rotate-[2deg] lg:order-2"
                    }`}
                  >
                    <Image
                      src={min.photoUrl || "/pictures/Image 6.jpg"}
                      alt={min.name}
                      fill
                      className="object-cover object-top scale-120 -translate-y-4 transition-transform duration-[1500ms] hover:scale-[1.22]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-6 left-6 text-left">
                      <span className="font-sans text-[9px] font-extrabold tracking-widest text-[#FAF6EE] uppercase bg-[#C25627] px-3 py-1">
                        {min.affiliation || "SPEAKER"}
                      </span>
                      <h3 className="font-serif text-3xl font-normal text-white mt-3 uppercase">
                        {min.name}
                      </h3>
                    </div>
                  </Link>

                  {/* Biography */}
                  <div className={`lg:col-span-6 flex flex-col items-start gap-4 text-left ${!isEven ? "lg:order-1" : ""}`}>
                    <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#C25627] uppercase">
                      {min.affiliation}
                    </span>
                    <div className="font-sans text-[#4A4032] text-sm leading-relaxed font-light space-y-3">
                      {min.biography.split("\n\n").slice(0, 2).map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>
                    <div className="h-[1px] w-full bg-black/10 my-2" />
                    <Link
                      href={`/ministers/${min.slug}`}
                      className="font-serif text-lg italic text-[#C25627] font-light border-l-2 border-[#C25627]/40 pl-4 hover:text-[#0B0907] transition-colors"
                    >
                      &ldquo;View full profile and assigned schedule sessions.&rdquo;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div data-reveal className="flex justify-center mt-20">
            <Link
              href="/ministers"
              className="group inline-flex items-center gap-3 px-8 py-4 border border-black/15 hover:border-black/35 text-[#0B0907] font-sans font-bold text-[11px] tracking-widest uppercase transition-all duration-300 bg-black/5 hover:bg-black/10 active-press"
            >
              <span>EXPLORE ALL SPEAKERS</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 5: PROGRAMME JOURNEY (Structured Roadmap - Warm Ivory Light background, no glow, no texture)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-20 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <div data-reveal className="lg:col-span-5 flex flex-col items-start gap-6 text-left">
            <span className="font-sans text-[10px] font-bold tracking-[0.3em] text-[#C25627] uppercase">
              FIVE DAYS IN HIS SANCTUARY
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#0B0907] uppercase leading-none">
              THE FIVE <br />
              <span className="text-[#C25627] font-normal font-serif">DAYS</span>
            </h2>
            
            {/* Countdown Accent Highlight */}
            <div className="flex items-center gap-3 mt-4 border-l border-[#C25627]/30 pl-4 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C25627] animate-pulse" />
              <span className="font-serif text-sm italic text-[#4A4032]">
                We gather in <span className="text-3xl font-bold text-[#C25627] mx-1 align-middle leading-none">{daysLeft}</span> days.
              </span>
            </div>

            <Link
              href="/programme"
              className="group inline-flex items-center gap-2 font-sans text-[12px] font-extrabold tracking-wider text-[#C25627] hover:text-[#0B0907] transition-all duration-300 mt-4 active-press"
            >
              <span className="border-b border-[#C25627] group-hover:border-black pb-0.5">
                VIEW PROGRAMME DETAILS
              </span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {/* Unfolded Roadmap on Warm Ivory Background - sharp tags with active scale rows */}
          <div className="lg:col-span-7 flex flex-col w-full">
            {daysConfig.map((item, idx) => (
              <Link
                key={idx}
                href={`/programme?day=${idx}`}
                data-reveal
                className="group flex flex-col sm:flex-row items-start gap-6 py-6 border-b border-black/10 hover:border-[#C25627]/20 transition-all duration-300 text-left active-press cursor-pointer block"
              >
                <div className="flex-shrink-0 w-auto min-w-[125px] sm:min-w-[145px]">
                  <span className="font-mono text-xs font-bold text-[#C25627] bg-[#C25627]/10 border border-[#C25627]/25 px-3 py-1 uppercase whitespace-nowrap">
                    {item.name.slice(0,3).toUpperCase()} · {item.date.split(",")[0].replace("August ", "AUG ")}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-normal text-[#0B0907] group-hover:text-[#C25627] transition-colors duration-300 uppercase">
                    {item.label} · {item.title}
                  </h3>
                  <p className="font-sans text-[#7A7062] text-xs font-light mt-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 6: MOMENTS OF ENCOUNTER (Contrast - Dramatic Worship Spreads)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-20 bg-[#0B0907] text-[#FCFAF6] overflow-hidden border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] light-smokey-glow pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 flex flex-col items-start text-left">
          
          <span className="font-sans text-[10px] font-bold tracking-[0.3em] text-[#C25627] uppercase mb-4">
            ENCOUNTER CHRONICLES
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-white uppercase tracking-tight mb-16">
            MOMENTS OF <span className="text-gradient-gold font-normal">ENCOUNTER</span>
          </h2>

          {/* Large photography spreads - Sharp corners */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch w-full">
            
            <div data-reveal className="md:col-span-8 relative aspect-video w-full overflow-hidden border border-white/10 group bg-white/5 h-[240px] sm:h-[350px] md:h-auto active-press cursor-pointer">
              <Image
                src="/pictures/Image 1.jpg"
                alt="Intensive worship moment"
                fill
                className="object-cover object-center scale-105 -translate-y-1 transition-transform duration-[1500ms] group-hover:scale-[1.08] filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 text-left max-w-md">
                <span className="font-mono text-[9px] text-[#DDB94E] tracking-widest uppercase">CONCENTRATED FIRE</span>
                <p className="font-serif text-lg italic text-white/90 font-light mt-1">
                  &ldquo;Deep worship moments fanning revival flames.&rdquo;
                </p>
              </div>
            </div>

            <div data-reveal className="md:col-span-4 relative aspect-[3/4] md:aspect-auto w-full overflow-hidden border border-white/10 group bg-white/5 h-[240px] sm:h-[350px] md:h-auto active-press cursor-pointer">
              <Image
                src="/pictures/Image 12.jpg"
                alt="Worship crowd congregation"
                fill
                className="object-cover object-center scale-105 transition-transform duration-[1500ms] group-hover:scale-[1.08] filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 text-left">
                <span className="font-mono text-[9px] text-[#DDB94E] tracking-widest uppercase">CORPORATE ENCOUNTER</span>
                <p className="font-serif text-base italic text-white/90 font-light mt-1">
                  Over thousands in fellowship lines of praise.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 7: GALLERY PREVIEW (Collage - Warm Light Ivory, no glow, sharp images)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-32 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        
        <div className="relative z-10 max-w-7xl mx-auto text-center flex flex-col items-center">
          
          <span className="font-sans text-[10px] font-bold tracking-[0.3em] text-[#C25627] uppercase mb-4">
            IMAGING THE ENCOUNTER
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#0B0907] uppercase leading-none mb-16">
            IMMERSE <span className="text-[#C25627] font-normal font-serif">YOURSELF</span>
          </h2>

          {/* Overlapping collage layout, sharp active image cards */}
          <div className="flex flex-col md:grid md:grid-cols-12 gap-8 w-full items-center">
            
            {/* Image 5: Landscape */}
            <div data-reveal className="w-full md:col-span-4 relative aspect-video overflow-hidden border border-black/10 group bg-white md:rotate-[-2deg] transition-transform duration-500 hover:rotate-0 h-[180px] sm:h-[260px] md:h-auto shadow-md active-press cursor-pointer">
              <Image
                src="/pictures/Image 5.jpg"
                alt="Fellowship grid"
                fill
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
              />
            </div>

            {/* Image 8: Square */}
            <div data-reveal className="w-full md:col-span-5 relative aspect-square overflow-hidden border border-black/10 group md:-translate-y-8 z-10 bg-white md:rotate-[1deg] transition-transform duration-500 hover:rotate-0 h-[220px] sm:h-[300px] md:h-auto shadow-lg active-press cursor-pointer">
              <Image
                src="/pictures/Image 8.jpg"
                alt="Worship details"
                fill
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
              />
            </div>

            {/* Image 9 & 12 offset stacks */}
            <div className="w-full md:col-span-3 flex flex-col gap-6">
              <div data-reveal className="relative aspect-[4/3] w-full overflow-hidden border border-black/10 group bg-white md:rotate-[3deg] transition-transform duration-500 hover:rotate-0 h-[160px] sm:h-[220px] md:h-auto shadow-md active-press cursor-pointer">
                <Image
                  src="/pictures/Image 9.jpg"
                  alt="Worship congregation scale"
                  fill
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                />
              </div>
              <div data-reveal className="relative aspect-[3/4] w-[90%] border border-black/10 group bg-white md:rotate-[-4deg] transition-transform duration-500 hover:rotate-0 self-center h-[200px] sm:h-[280px] md:h-auto shadow-md active-press cursor-pointer">
                <Image
                  src="/pictures/Image 12.jpg"
                  alt="Altar prayers scale"
                  fill
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                />
              </div>
            </div>

          </div>

          <div data-reveal className="mt-16">
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-3 px-8 py-4 border border-black/15 hover:border-black/35 text-[#0B0907] font-sans font-bold text-[11px] tracking-widest uppercase transition-all duration-300 bg-black/5 hover:bg-black/10 active-press"
            >
              <span>ACCESS THE FULL GALLERY</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 8: COMMUNITY SECTION (Fellowship display - Warm Light Ivory, no glow, sharp images)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-32 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left: Narrative */}
            <div data-reveal className="lg:col-span-5 flex flex-col items-start gap-6 text-left">
              <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#C25627] uppercase">
                COVENANT CONNECTION
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-light tracking-tight text-[#0B0907] uppercase leading-none">
                THE FELLOWSHIP <br />
                <span className="text-[#C25627] font-normal font-serif">BOUNDS</span>
              </h2>
              <div className="h-[1px] w-20 bg-primary mt-2" />
              <p className="font-sans text-zinc-600 text-sm leading-relaxed font-light">
                Refreshing is where student fellowship lines align. We gather across Lagos Central, East, and West to form covenant relationships that sustain campus altars.
              </p>
            </div>

            {/* Right: Overlapping image displays - Enlarged & Sharp corners */}
            <div data-reveal className="lg:col-span-7 relative flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-0 h-auto sm:h-[450px] w-full">
              
              {/* Image 5: Fellowship */}
              <div className="relative sm:absolute sm:left-0 w-full sm:w-[68%] aspect-video border border-black/10 z-10 shadow-2xl sm:rotate-[-2deg] overflow-hidden bg-white h-[220px] sm:h-auto active-press cursor-pointer">
                <Image
                  src="/pictures/Image 5.jpg"
                  alt="Student fellowship"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-[#C25627] text-white font-mono text-[8px] font-bold px-2.5 py-1 uppercase z-10">
                  FELLOWSHIP JOURNEY
                </div>
              </div>

              {/* Image 13: Friends gathering */}
              <div className="relative sm:absolute sm:right-0 w-full sm:w-[68%] aspect-video border border-black/10 z-20 shadow-2xl sm:translate-y-16 sm:rotate-[3deg] overflow-hidden bg-white h-[220px] sm:h-auto active-press cursor-pointer">
                <Image
                  src="/pictures/Image 13.jpg"
                  alt="Friends gathering"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-3 right-3 bg-primary text-black font-mono text-[8px] font-bold px-2.5 py-1 uppercase z-10">
                  COVENANT STICKER
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 9: TESTIMONIES (Warm Light Ivory background, sharp outlines)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-28 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          
          <span className="font-sans text-[10px] font-bold tracking-[0.3em] text-[#C25627] uppercase block mb-3">
            TESTIMONIALS
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#0B0907] uppercase leading-none mb-16">
            Alumni & Student <span className="font-serif italic font-extralight text-[#C25627]">Voices</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
            {testimonies.map((test, idx) => (
              <div
                key={idx}
                data-reveal
                className="p-8 border border-black/10 bg-white flex flex-col justify-between min-h-[220px] shadow-sm active-press cursor-pointer"
              >
                <p className="font-serif text-base italic font-light text-zinc-700 leading-relaxed mb-6">
                  &ldquo;{test.quote}&rdquo;
                </p>
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#C25627] uppercase">
                    {test.name}
                  </h4>
                  <span className="font-sans text-[10px] text-zinc-500 tracking-wider uppercase mt-0.5 block">
                    {test.role}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 10: REGISTRATION CTA (Voucher Slip contrast card resting on Warm Light Ivory)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-24 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        
        <div className="relative z-10 max-w-2xl mx-auto">
          
          {/* Registration Voucher slip remains a rich dark card for contrast, with rounded-3xl corners */}
          <div data-reveal className="w-full border border-dashed border-[#DDB94E]/40 bg-[#15130F] text-white p-8 sm:p-12 md:p-16 flex flex-col items-center gap-6 text-center shadow-2xl relative rounded-3xl active-press">
            
            {/* Stamps */}
            <span className="absolute top-4 left-6 font-mono text-[8px] text-white/20 uppercase tracking-widest hidden sm:block">
              LSBSF CAMPUS DEP
            </span>
            <span className="absolute top-4 right-6 font-mono text-[8px] text-[#DDB94E]/40 uppercase tracking-widest hidden sm:block">
              EDITION // 40
            </span>

            <span className="font-sans text-[10px] font-extrabold tracking-[0.3em] text-[#DDB94E] uppercase">
              CAMP REGISTRATION VOUCHER
            </span>

            <h2 className="font-serif text-4xl sm:text-6xl font-light tracking-tight text-white uppercase leading-none mt-2">
              Arise & <span className="font-serif italic font-extralight text-[#DDB94E]">Shine</span>
            </h2>

            <p className="font-sans text-white/70 text-xs sm:text-sm leading-relaxed max-w-md font-light">
              Bring your expectations, your heart, and your fellowship. Registration is required for hostel placements.
            </p>

            <div className="h-[1px] w-full bg-white/10 my-4" />

            <div className="w-full flex justify-center">
              <a
                href={REGISTRATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full sm:w-auto px-12 py-5 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-[12px] tracking-widest uppercase transition-all duration-300 text-center active-press"
              >
                Register for the Program
              </a>
            </div>

            <span className="font-sans text-[9px] text-[#FFD6C4]/40 tracking-widest uppercase block mt-4">
              * SECURE ENTRY FOR WORKSHOPS & HOSTEL ALLOCATIONS
            </span>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 11: CHAPTERS (Warm Light Paper Background, sharp card grids)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-20 px-6 md:px-16 bg-[#F2EDE3] text-[#0B0907] border-t border-black/5 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 text-left">
          
          <div className="max-w-md">
            <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#C25627] uppercase block mb-2">
              FELLOWSHIP HUBS
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#0B0907] uppercase tracking-tight">
              LAGOS STATE BSF <br />
              <span className="font-serif italic font-extralight text-[#C25627]">Chapters</span>
            </h3>
            <p className="font-sans text-zinc-600 text-xs leading-relaxed font-light mt-3">
              Coordinating campus student chapters across Lagos State associations. Connect with fellowship leaders for transportation and logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1 w-full">
            {chapters.map((chap, idx) => (
              <div
                key={idx}
                className="p-6 border border-black/5 bg-white flex flex-col justify-between shadow-xs active-press cursor-pointer"
              >
                <h4 className="font-sans text-xs font-bold text-[#0B0907] uppercase tracking-wider">
                  {chap.name}
                </h4>
                <p className="font-sans text-zinc-500 text-[11px] leading-relaxed font-light mt-4">
                  {chap.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}

/* ─── Testimonies Data ─── */
const testimonies = [
  {
    quote: "Refreshing 2024 was where my devotion was restored. In the midst of corporate worship, the fire fell and everything changed.",
    name: "Tobi Alao",
    role: "Unilag Chapter President",
  },
  {
    quote: "As an alumnus, returning to Refreshing is like coming back to the well. The covenant foundations here are real.",
    name: "Sis. Funmi Adebayo",
    role: "Alumni Leader",
  },
  {
    quote: "Five days of concentrated encounter. My life was redirected, and I found my campus mission focus.",
    name: "Bro. David Okoro",
    role: "Lagos Central Representative",
  }
];

/* ─── Chapters Data ─── */
const chapters = [
  { name: "Lagos East", description: "Coordinating student fellowships in Yaba, Somolu, and Ikorodu axis." },
  { name: "Lagos West", description: "Coordinating student fellowships in Ikeja, Agege, and Alimosho axis." },
  { name: "Lagos Central", description: "Coordinating student fellowships in Lagos Island, Lekki, and Surulere axis." }
];

/* ─── Daily Programme Data ─── */
const dailyRoadmap = [
  {
    date: "MON · AUG 10",
    day: "DAY ONE",
    title: "LEADERS CAMP COMMENCES",
    description: "Opening prayers, leadership alignment sessions, and orientation for fellowship leaders.",
  },
  {
    date: "TUE · AUG 11",
    day: "DAY TWO",
    title: "DISCIPLESHIP INTENSIVE",
    description: "Intensive breakout modules covering theology, campus ministry structure, and leadership.",
  },
  {
    date: "WED · AUG 12",
    day: "DAY THREE",
    title: "GENERAL CONFERENCE ARRIVAL",
    description: "Arrival of all attendees. Revival night, corporate worship, and keynote address.",
  },
  {
    date: "THU · AUG 13",
    day: "DAY FOUR",
    title: "WORD FEAST & COMMUNION",
    description: "Morning devotionals, interactive panel sessions, and corporate communion services.",
  },
  {
    date: "FRI · AUG 14",
    day: "DAY FIVE",
    title: "GREATER GLORY COMMISSIONING",
    description: "Final gathering, commission prayers, and sending forth of leaders to campuses.",
  },
];
