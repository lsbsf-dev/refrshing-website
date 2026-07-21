"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { REGISTRATION_URL } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      
      {/* ═══════════════════════════════════════
          SCENE 1: ABOUT HERO (Centered & Balanced Height with staggered load animations)
          ═══════════════════════════════════════ */}
      <section className="relative w-full h-[45dvh] min-h-[380px] flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-40 lg:pt-48 pb-24 px-6 md:px-16 border-b border-white/5">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Image
            src="/pictures/Image 3.jpg"
            alt="Sanctuary details background"
            fill
            className="object-cover object-center filter grayscale"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/30 to-[#0B0907]/80 pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[300px] bg-[#E05320]/15 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase animate-hero-item delay-100">
            REFRESHING HISTORICAL ARCHIVES
          </span>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-[85px] font-bold tracking-tight uppercase select-none leading-[0.95] animate-hero-item delay-200">
            THE <br />
            <span className="text-gradient-sunset font-normal font-serif">MOVEMENT</span>
          </h1>
          <p className="font-serif text-base sm:text-lg md:text-xl italic text-white/80 font-light max-w-2xl border-l border-primary/50 pl-6 mt-2 animate-hero-item delay-300">
            Fortifying the foundations of faith, campus revival, and covenant leadership since 1986.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 2: COVENANT FOUNDATIONS (The 1986 spark)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-28 px-6 md:px-16 bg-[#FAF6EE] text-[#1E1B16] texture-paper overflow-hidden">
        
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: Historic photo (Polaroid) */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-md aspect-[3/4] border border-black/10 shadow-2xl bg-white overflow-hidden rotate-[-2deg] transition-transform duration-500 hover:rotate-0 rounded-2xl p-2.5 active-press cursor-pointer">
              <div className="relative w-full h-[85%] overflow-hidden rounded-xl">
                <Image
                  src="/pictures/Image 14.jpg"
                  alt="1986 foundations"
                  fill
                  className="object-cover filter sepia-[0.4] brightness-[0.88] contrast-[1.05]"
                />
              </div>
              <div className="absolute bottom-6 left-6 bg-[#0B0907] text-[#FAF6EE] font-mono text-[9px] font-bold px-3 py-1 uppercase rounded-sm">
                LAGOS STATE BSF FOUNDING MOMENT · 1986
              </div>
            </div>
          </div>

          {/* Right: History narrative */}
          <div className="lg:col-span-6 flex flex-col items-start gap-6 text-left text-[#0B0907]">
            <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#E05320] uppercase">
              OUR SPARK
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light tracking-tight leading-none uppercase text-[#0B0907]">
              FORTY YEARS OF <br />
              <span className="font-serif italic font-extralight text-primary-dark">unbroken</span> covenant.
            </h2>
            <div className="h-[1px] w-20 bg-[#E05320] my-2" />
            <p className="font-sans text-[#7A7062] text-sm leading-relaxed font-light">
              Lagos State Baptist Student Fellowship (LSBSF) was established to organize, coordinate, and empower campus student fellowships across Lagos State higher institutions. What began as a scattered network of campus prayers ignited into a unified movement.
            </p>
            <p className="font-sans text-[#7A7062] text-sm leading-relaxed font-light">
              Refreshing represents the central furnace of this fellowship. Annually, students from Lagos East, Lagos West, and Lagos Central associations gather to receive training, study the scriptures in discipleship cohorts, and experience fresh outpourings of revival.
            </p>
            <p className="font-sans text-[#7A7062] text-sm leading-relaxed font-light">
              As we step into 2026, marking the 40th anniversary, the theme is &ldquo;The Greater Glory&rdquo;. We look back with gratitude, but we look forward with anticipation. The glory of the campus testimonies to come will exceed the milestones of the past.
            </p>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 3: MOVEMENT PILLARS (Extended warmth, Light background, high contrast cards)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-28 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
          
          <span className="font-sans text-[10px] font-bold tracking-[0.3em] text-[#E05320] uppercase block mb-3">
            WHAT DEFINES LSBSF
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-light tracking-tight text-[#0B0907] uppercase leading-none mb-16 text-center">
            THE FOUR <span className="text-[#C25627] font-normal font-serif">Pillars</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full text-left">
            {pillars.map((pil, idx) => (
              <div
                key={idx}
                className="p-8 border border-black/10 bg-white flex flex-col justify-between min-h-[250px] shadow-md transition-transform hover:scale-[1.02] duration-300 active-press cursor-pointer"
              >
                <div className="font-serif text-5xl font-bold text-[#C25627] select-none">
                  0{idx + 1}
                </div>
                <div className="mt-8">
                  <h4 className="font-serif text-xl font-normal text-[#0B0907] uppercase mb-3">
                    {pil.title}
                  </h4>
                  <p className="font-sans text-zinc-600 text-xs leading-relaxed font-light">
                    {pil.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 4: JOIN THE MISSION (CTA stub - Dark card registration overlay)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-24 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6 p-10 bg-[#1A0E12] text-white shadow-2xl rounded-3xl">
          <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#DDB94E] uppercase">
            STAY CONNECTED TO THE REVIVAL
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-white uppercase leading-none">
            Be Part of <span className="font-serif italic font-extralight text-primary-light">History</span>
          </h2>
          <p className="font-sans text-white/60 text-sm leading-relaxed max-w-lg font-light">
            Whether you are a campus student ready to serve, an alumnus eager to support, or a guest seeking encounter, LSBSF fellowships welcome you.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <Link
              href="/programme"
              className="px-6 py-3 border border-white/20 hover:border-white/40 text-white font-sans font-semibold text-[11px] tracking-wider uppercase bg-white/5 hover:bg-white/10 transition-all duration-300 active-press"
            >
              Explore Schedule
            </Link>
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-primary hover:bg-primary-light text-[#0B0907] font-sans font-bold text-[11px] tracking-wider uppercase transition-all duration-300 active-press"
            >
              Register for the Program
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

const pillars = [
  {
    title: "Revival",
    description: "Rekindling the fire of spiritual devotion on Nigerian campuses through prayers, encounters, and worship assemblies."
  },
  {
    title: "Discipleship",
    description: "Deep study of scriptures in intensive seminar tracks led by seasoned alumni leaders to build solid theological foundations."
  },
  {
    title: "Fellowship",
    description: "Unifying campuses across Lagos East, West, and Central associations to foster lifelong covenant relationships among students."
  },
  {
    title: "Campus Mission",
    description: "Deploying trained leaders back to school departments, fellowships, and associations to be witnesses for the Gospel."
  }
];
