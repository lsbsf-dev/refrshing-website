"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { REGISTRATION_URL } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">

      {/* ── HERO ── */}
      <section className="relative w-full h-[45dvh] min-h-[380px] flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-40 lg:pt-48 pb-24 px-4 sm:px-6 md:px-16 border-b border-white/5">
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
          <span className="font-sans text-sm font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase animate-hero-item delay-100">
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

      {/* ── OUR PHILOSOPHY & HISTORY ── */}
      <section className="relative w-full py-24 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#1E1B16] texture-paper overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* Left: Historic photo (Polaroid) */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-md aspect-[3/4] border border-black/10 shadow-2xl bg-white overflow-hidden rotate-[-2deg] transition-transform duration-500 hover:rotate-0 rounded-2xl p-2.5 active-press cursor-pointer">
              <div className="relative w-full h-[85%] overflow-hidden rounded-xl">
                <Image
                  src="/pictures/Image 14.jpg"
                  alt="1986 foundations"
                  fill
                  className="object-cover filter sepia-[0.4] brightness-[0.88] contrast-[1.05]"
                />
              </div>
              <div className="absolute bottom-6 left-6 bg-[#0B0907] text-[#FAF6EE] font-mono text-xs font-bold px-3 py-1 uppercase rounded-sm">
                LAGOS STATE BSF FOUNDING MOMENT · 1986
              </div>
            </div>
          </div>

          {/* Right: History narrative */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left text-[#0B0907]">
            <span className="font-sans text-sm font-bold tracking-[0.25em] text-[#E05320] uppercase">
              OUR PHILOSOPHY
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-tight leading-none uppercase text-[#0B0907]">
              CHRISTIAN WITNESS IN <br />
              <span className="font-serif italic font-extralight text-primary-dark">HIGHER EDUCATION</span>
            </h2>
            <div className="h-[1px] w-20 bg-[#E05320] my-1" />
            <p className="font-sans text-zinc-700 text-sm leading-relaxed font-light">
              The Nigerian Baptist Convention’s Christian witness and ministry in institutions of higher learning are in response to the Lord’s command to make the gospel known to all persons.
            </p>
            <p className="font-sans text-zinc-700 text-sm leading-relaxed font-light">
              Because schools are engaged in the quest for knowledge and truth of which God is the Source, the Christian perspective is essential to realize the ultimate in education. The unique nature of the student life and campus community demands a specialized ministry of the church to the individual need of students for redemption and Christian nurture within that community.
            </p>

            <div className="mt-4 pt-6 border-t border-black/10 w-full flex flex-col gap-3">
              <span className="font-sans text-sm font-bold tracking-[0.25em] text-[#C25627] uppercase">
                A LEGACY OF COVENANT AND FIRE
              </span>
              <p className="font-sans text-zinc-700 text-sm leading-relaxed font-light">
                Since its inception in 1986, the Lagos State Baptist Student Fellowship (LSBSF) has served as a central pillar for student ministry across the state. What began as a passionate network of prayer movements has grown into a unified, transformative force.
              </p>
              <p className="font-sans text-zinc-700 text-sm leading-relaxed font-light">
                Through our annual Refreshing gathering, generations of students across the Lagos East, Lagos West, and Lagos Central associations have been discipled, equipped, and sent forth. As we reach this historic 40th anniversary, we celebrate the lives transformed, the ministries birthed, and the enduring global legacy built by those who came before us.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── CORE PILLARS & OBJECTIVES ── */}
      <section className="relative w-full py-24 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
          <span className="font-sans text-sm font-bold tracking-[0.3em] text-[#E05320] uppercase block mb-3">
            WHAT DEFINES LSBSF
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#0B0907] uppercase leading-none mb-16 text-center">
            CORE PILLARS & <span className="text-[#C25627] font-normal font-serif">OBJECTIVES</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
            {pillars.map((pil, idx) => (
              <div
                key={idx}
                className="p-8 border border-black/10 bg-white flex flex-col justify-between min-h-[240px] shadow-sm transition-all duration-300 hover:border-[#C25627]/40 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[#C25627] bg-[#C25627]/10 px-3 py-1 rounded">
                    PILLAR 0{idx + 1}
                  </span>
                </div>
                <div className="mt-6">
                  <h3 className="font-serif text-xl font-normal text-[#0B0907] uppercase mb-2">
                    {pil.title}
                  </h3>
                  <p className="font-sans text-zinc-600 text-sm leading-relaxed font-light">
                    {pil.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BE PART OF KINGDOM HISTORY ── */}
      <section className="relative w-full py-20 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6 p-10 bg-[#1A0E12] text-white shadow-2xl rounded-3xl">
          <span className="font-sans text-sm font-bold tracking-[0.25em] text-[#DDB94E] uppercase">
            BE PART OF KINGDOM HISTORY
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-white uppercase leading-none">
            Experience the <span className="font-serif italic font-extralight text-primary-light">Greater Glory</span>
          </h2>
          <p className="font-sans text-white/70 text-sm leading-relaxed max-w-xl font-light">
            Whether you are a student or youth eager to encounter God, an alumnus looking to reconnect and support the vision, or a guest seeking a spiritual awakening, there is a place for you at Refreshing 2026.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <Link
              href="/programme"
              className="px-6 py-3 border border-white/20 hover:border-white/40 text-white font-sans font-semibold text-sm tracking-wider uppercase bg-white/5 hover:bg-white/10 transition-all duration-300 active-press"
            >
              Explore Schedule
            </Link>
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-primary hover:bg-primary-light text-[#0B0907] font-sans font-bold text-sm tracking-wider uppercase transition-all duration-300 active-press"
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
    title: "1. Salvation",
    description: "Leading campus students to a personal commitment to Jesus Christ as Savior and Lord."
  },
  {
    title: "2. Discipleship",
    description: "Involving students in the deep study of biblical truth and training them to obey and follow Christ through the Holy Spirit."
  },
  {
    title: "3. Churchmanship",
    description: "Fostering total commitment and active participation in the programs and life of the local Baptist church."
  },
  {
    title: "4. Academic Excellence",
    description: "Encouraging a strong balance between spiritual growth and academic success on campus."
  },
  {
    title: "5. Missions",
    description: "Engaging students in practical local and global outreach for kingdom expansion."
  }
];
