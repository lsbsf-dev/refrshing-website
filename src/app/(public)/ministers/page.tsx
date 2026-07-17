"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function MinistersPage() {
  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      
      {/* ═══════════════════════════════════════
          SCENE 1: MINISTERS HERO (Opening the stage - Centered & Balanced Height)
          ═══════════════════════════════════════ */}
      <section className="relative w-full h-[45dvh] min-h-[380px] flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-36 pb-24 px-6 md:px-16 border-b border-white/5">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Image
            src="/pictures/Image 3.jpg"
            alt="Sanctuary details background"
            fill
            className="object-cover object-center filter grayscale"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/30 to-[#0B0907]/80 pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[300px] bg-[#6B1D2A]/20 rounded-full blur-[120px] pointer-events-none" />

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

      {/* ═══════════════════════════════════════
          SCENE 2: SPEAKER 1 — PASTOR SEGUN (Featured Artist - Light background, sharp corners, no glow)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-28 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-b border-black/5">
        
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: Asymmetric Full Aspect Image - Sharp corners */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full aspect-[3/4] overflow-hidden border border-black/10 bg-[#15130F] shadow-2xl group">
              <Image
                src="/pictures/Image 6.jpg"
                alt="Pastor Segun Babalola"
                fill
                className="object-cover object-top scale-120 -translate-y-6 transition-transform duration-[1200ms] group-hover:scale-[1.22]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-65 pointer-events-none" />
              
              {/* Overlapping text on photo */}
              <div className="absolute bottom-6 left-6 text-left">
                <span className="font-sans text-[9px] font-extrabold tracking-widest text-[#E05320] uppercase bg-[#E05320]/15 border border-[#E05320]/30 px-3 py-1">
                  KEYNOTE SPEAKER
                </span>
              </div>
            </div>
          </div>

          {/* Right: Detailed Biography */}
          <div className="lg:col-span-6 flex flex-col items-start gap-6 text-left">
            <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#E05320] uppercase">
              COVENANT VOICE
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light tracking-tight text-[#0B0907] leading-none uppercase">
              Pastor Segun <br />
              <span className="font-serif italic font-extralight text-primary-dark">Babalola</span>
            </h2>
            <div className="h-[1px] w-20 bg-primary-dark my-2" />
            <p className="font-sans text-zinc-600 text-sm leading-relaxed font-light">
              Pastor Segun Babalola serves as the Superintendent of the Lagos Baptist Association. He has been a foundational pillar of the Lagos State Baptist Student Fellowship since its early decades, guiding campus revival altars for over thirty years.
            </p>
            <p className="font-sans text-zinc-600 text-sm leading-relaxed font-light">
              Known for his depth in expository teaching and prayer coordination, his ministry focus is centering young students back onto scriptural foundations and campus missions deployment.
            </p>
            <p className="font-serif text-lg italic text-[#C25627] font-light border-l border-[#C25627]/40 pl-4 my-2">
              &ldquo;We are not calling for a return to what has been, but an entry into a greater weight of His covenant presence.&rdquo;
            </p>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 3: SPEAKER 2 — DR. HELEN (Featured Artist - Light background, sharp corners, no glow)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-28 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-b border-black/5">
        
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: Detailed Biography (Asymmetric flip) */}
          <div className="lg:col-span-6 flex flex-col items-start gap-6 text-left order-2 lg:order-1">
            <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#E05320] uppercase">
              DISCIPLESHIP STUDY LEAD
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light tracking-tight text-[#0B0907] leading-none uppercase">
              Dr. Helen <br />
              <span className="font-serif italic font-extralight text-primary-dark">Adeyemi</span>
            </h2>
            <div className="h-[1px] w-20 bg-primary-dark my-2" />
            <p className="font-sans text-zinc-600 text-sm leading-relaxed font-light">
              Dr. Helen Adeyemi is the LSBSF Alumni Coordinator. She oversees alumni partnerships, chapter support structures, and student mentorship streams across Lagos East, West, and Central Chapters.
            </p>
            <p className="font-sans text-zinc-600 text-sm leading-relaxed font-light">
              Her teaching ministry focuses on career paths, financial stewardship, and the preservation of covenant foundations in professional sectors.
            </p>
            <p className="font-serif text-lg italic text-[#C25627] font-light border-l border-[#C25627]/40 pl-4 my-2">
              &ldquo;The spheres of school and career are not fields of secular escape; they are the altars of campus deployment.&rdquo;
            </p>
          </div>

          {/* Right: Asymmetric Portrait (Wide 4/3 Aspect, Sharp corners) */}
          <div className="lg:col-span-6 relative flex justify-center order-1 lg:order-2">
            <div className="relative w-full aspect-[4/3] overflow-hidden border border-black/10 bg-[#0B0907] shadow-2xl group">
              <Image
                src="/pictures/Image 11.jpg"
                alt="Dr. Helen Adeyemi"
                fill
                className="object-cover object-top scale-120 -translate-y-4 transition-transform duration-[1200ms] group-hover:scale-[1.22]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-65 pointer-events-none" />
              
              {/* Overlapping tag on photo */}
              <div className="absolute bottom-6 left-6 text-left">
                <span className="font-sans text-[9px] font-extrabold tracking-widest text-[#E05320] bg-[#E05320]/15 border border-[#E05320]/30 px-3 py-1">
                  SEMINAR LEADER
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          REGISTRATION CTA - Dark card contrast overlay, no free copy, sharp button
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-24 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6 p-10 bg-[#1A0E12] text-white shadow-2xl rounded-3xl">
          <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#DDB94E] uppercase">
            MEET THE MINISTERS LIVE IN AUGUST
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-white uppercase leading-none">
            Register to <span className="font-serif italic font-extralight text-primary-light">Join Us</span>
          </h2>
          <p className="font-sans text-white/60 text-sm leading-relaxed max-w-lg font-light">
            Register to attend Pastor Segun and Dr. Helen's breakout seminars. Camp registration is required for all attendees.
          </p>
          <a
            href="https://forms.gle/DSW4CVMXWK61BHT96"
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 bg-primary hover:bg-primary-light text-[#0B0907] font-sans font-bold text-[12px] tracking-widest uppercase transition-all duration-300 mt-4"
          >
            Register for the Program
          </a>
        </div>
      </section>

    </div>
  );
}
