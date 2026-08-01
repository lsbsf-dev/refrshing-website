/**
 * About Page Component
 * Showcases NBC Philosophy, 5 Core Pillars, and History of LSBSF.
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { REGISTRATION_URL } from "@/lib/constants";
import { Cross, BookOpen, Building2, GraduationCap, Globe } from "lucide-react";

export const metadata = {
  title: "About Us — Refreshing 2026",
  description:
    "Learn about the Nigerian Baptist Convention philosophy, the 5 core pillars of BSF, and our 40-year legacy of student ministry across Lagos State.",
};

const pillars = [
  {
    icon: Cross,
    title: "Salvation",
    description: "Leading campus students to a personal commitment to Jesus Christ as Savior and Lord."
  },
  {
    icon: BookOpen,
    title: "Discipleship",
    description: "Involving students in the deep study of biblical truth and training them to obey and follow Christ through the Holy Spirit."
  },
  {
    icon: Building2,
    title: "Churchmanship",
    description: "Fostering total commitment and active participation in the programs and life of the local Baptist church."
  },
  {
    icon: GraduationCap,
    title: "Academic Excellence",
    description: "Encouraging a strong balance between spiritual growth and academic success on campus."
  },
  {
    icon: Globe,
    title: "Missions",
    description: "Engaging students in practical local and global outreach for kingdom expansion."
  }
];

export default function AboutPage() {
  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907]">

      {/* ── HERO ── */}
      <section className="relative w-full h-[45dvh] min-h-[380px] hero-landscape flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-40 lg:pt-48 pb-24 px-4 sm:px-6 md:px-16 border-b border-white/5">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Image
            src="/pictures/Image 3.jpg"
            alt="Sanctuary background"
            fill
            className="object-cover object-center filter grayscale"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/30 to-[#0B0907]/80 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <span className="font-sans text-sm font-bold tracking-[0.3em] text-[#DDB94E] uppercase block mb-3">
            REFRESHING 2026 — 40TH ANNIVERSARY
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-light text-white uppercase leading-none mb-6">
            OUR <span className="text-[#C25627] font-normal">HERITAGE</span>
          </h1>
          <p className="font-sans text-white/70 text-sm max-w-xl font-light leading-relaxed">
            The Nigerian Baptist Convention's Christian witness and ministry across Lagos State institutions — forty years of covenant, revival, and leadership.
          </p>
        </div>
      </section>

      {/* ── OUR PHILOSOPHY & HISTORY ── */}
      <section className="relative w-full py-20 sm:py-24 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#1E1B16] overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left: Historic photo frame (No sharp corners, NO incorrect tag) */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-start overflow-hidden py-4">
            <div className="relative w-full max-w-md aspect-[3/4] border border-black/10 shadow-xl bg-white overflow-hidden rotate-[-2deg] hover:rotate-0 transition-transform duration-500 rounded-2xl p-2.5 active-press cursor-pointer">
              <div className="relative w-full h-full overflow-hidden rounded-xl">
                <Image
                  src="/pictures/Image 14.jpg"
                  alt="Historic student fellowship moment"
                  fill
                  className="object-cover filter sepia-[0.3] brightness-[0.9] contrast-[1.05]"
                />
              </div>
            </div>
          </div>
          
          {/* Right: History & Philosophy narrative */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left text-[#0B0907]">
            <span className="font-sans text-sm font-bold tracking-[0.25em] text-[#C25627] uppercase">
              OUR PHILOSOPHY
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-tight leading-tight uppercase text-[#0B0907]">
              CHRISTIAN WITNESS IN <br />
              <span className="font-serif italic font-normal text-[#C25627]">HIGHER EDUCATION</span>
            </h2>
            <div className="h-[1px] w-20 bg-[#C25627] my-1" />
            <p className="font-sans text-zinc-700 text-sm sm:text-base leading-relaxed font-light">
              The Nigerian Baptist Convention’s Christian witness and ministry in institutions of higher learning are in response to the Lord’s command to make the gospel known to all persons.
            </p>
            <p className="font-sans text-zinc-700 text-sm sm:text-base leading-relaxed font-light">
              Because schools are engaged in the quest for knowledge and truth of which God is the Source, the Christian perspective is essential to realize the ultimate in education. The unique nature of the student life and campus community demands a specialized ministry of the church to the individual need of students for redemption and Christian nurture within that community.
            </p>

            <div className="mt-4 pt-6 border-t border-black/10 w-full flex flex-col gap-3">
              <span className="font-sans text-sm font-bold tracking-[0.25em] text-[#C25627] uppercase">
                A LEGACY OF COVENANT AND FIRE
              </span>
              <p className="font-sans text-zinc-700 text-sm sm:text-base leading-relaxed font-light">
                Since its inception in 1986, the Lagos State Baptist Student Fellowship (LSBSF) has served as a central pillar for student ministry across the state. What began as a passionate network of prayer movements has grown into a unified, transformative force.
              </p>
              <p className="font-sans text-zinc-700 text-sm sm:text-base leading-relaxed font-light">
                Through our annual Refreshing gathering, generations of students across the Lagos East, Lagos West, and Lagos Central associations have been discipled, equipped, and sent forth. As we reach this historic 40th anniversary, we celebrate the lives transformed, the ministries birthed, and the enduring global legacy built by those who came before us.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── CORE PILLARS & OBJECTIVES ── */}
      <section className="relative w-full py-20 px-4 sm:px-6 md:px-16 bg-white text-[#0B0907] border-t border-black/5">
        <div className="relative z-10 max-w-7xl mx-auto text-center flex flex-col items-center">

          <span className="font-sans text-sm font-bold tracking-[0.3em] text-[#C25627] uppercase block mb-3">
            FOUNDATIONAL OBJECTIVES
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#0B0907] uppercase leading-none mb-16">
            CORE PILLARS & <span className="text-[#C25627] font-normal font-serif">OBJECTIVES</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
            {pillars.map((pil, idx) => {
              const Icon = pil.icon;
              return (
                <div
                  key={idx}
                  className="p-8 border border-black/10 bg-[#FAF6EE] rounded-2xl flex flex-col justify-between shadow-sm transition-all duration-300 hover:border-[#C25627]/40 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-12 w-12 rounded-xl bg-[#C25627]/10 flex items-center justify-center text-[#C25627]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-xs font-bold text-[#C25627] bg-white border border-[#C25627]/20 px-3 py-1 rounded-full">
                      0{idx + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-[#0B0907] mb-3">
                      {pil.title}
                    </h3>
                    <p className="font-sans text-zinc-600 text-sm leading-relaxed font-light">
                      {pil.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BE PART OF KINGDOM HISTORY ── */}
      <section className="relative w-full py-20 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6 p-5 sm:p-10 sm:p-14 bg-[#0B0907] text-white shadow-2xl rounded-3xl">
          <span className="font-sans text-sm font-bold tracking-[0.25em] text-[#DDB94E] uppercase">
            BE PART OF KINGDOM HISTORY
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-white uppercase leading-none">
            Experience the <span className="font-serif italic font-normal text-[#DDB94E]">Greater Glory</span>
          </h2>
          <p className="font-sans text-white/80 text-sm sm:text-base leading-relaxed max-w-xl font-light">
            Whether you are a student or youth eager to encounter God, an alumnus looking to reconnect and support the vision, or a guest seeking a spiritual awakening, there is a place for you at Refreshing 2026.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <Link
              href="/programme"
              className="px-8 py-3.5 border border-white/20 hover:border-white/40 text-white font-sans font-semibold text-xs tracking-wider uppercase bg-white/5 hover:bg-white/10 transition-all duration-300 active-press rounded-full"
            >
              Explore Schedule
            </Link>
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 active-press rounded-full shadow-lg"
            >
              Register Now
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
