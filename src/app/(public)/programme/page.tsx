/**
 * Programme Page Component
 * Renders the static Refreshing 2026 Programme Outline using the tabbed day design.
 */

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { REGISTRATION_URL } from "@/lib/constants";
import { ScrollableTabBar } from "@/components/shared/ScrollableTabBar";

interface DayConfig {
  label: string;
  name: string;
  date: string;
  title: string;
  summary: string;
}

const daysConfig: DayConfig[] = [
  {
    label: "DAY 1",
    name: "Monday",
    date: "August 10, 2026",
    title: "Monday Evening",
    summary: "LEADERS CAMP (Moderator: Bro. Obanimi Ogunbisi)"
  },
  {
    label: "DAY 2",
    name: "Tuesday",
    date: "August 11, 2026",
    title: "Morning, Afternoon & Night",
    summary: "LEADERS CAMP (Morning, Afternoon Session, & Anointing Night)"
  },
  {
    label: "DAY 3",
    name: "Wednesday",
    date: "August 12, 2026",
    title: "Morning & Evening",
    summary: "LEADERS CAMP & GENERAL CAMP (Arrival / Registration)"
  },
  {
    label: "DAY 4",
    name: "Thursday",
    date: "August 13, 2026",
    title: "Morning, Afternoon & Night",
    summary: "GENERAL CAMP (Academic Seminar & Refreshing Night)"
  },
  {
    label: "DAY 5",
    name: "Friday",
    date: "August 14, 2026",
    title: "Relationship & Celebration",
    summary: "GENERAL CAMP (Relationship Seminar, Refreshing @40 Celebration & Thanksgiving Choice Night)"
  }
];

const SCHEDULE = {
  0: [
    { time: "6:00pm - 6:10pm", title: "Opening Prayer", detail: "Moderator" },
    { time: "6:10pm - 6:30pm", title: "Praise and Worship", detail: "Choir" },
    { time: "6:30pm - 6:50pm", title: "Prayer Uproar", detail: "Prayer Secretary" },
    { time: "6:50pm - 7:20pm", title: "Opening Charge", detail: "Bro. Micheal Adeyemo (LWBSF President)" },
    { time: "7:20pm - 7:25pm", title: "Bible Reading", detail: "Moderator" },
    { time: "7:25pm - 8:40pm", title: "Message", detail: "Rev’d. Ben Banjoko" },
    { time: "8:40pm - 8:50pm", title: "Announcement", detail: "Secretariat" },
    { time: "Dinner Break", title: "Dinner!!! Dinner!!! Dinner!!!", detail: "Cafeteria" }
  ],
  1: [
    { time: "MORNING SESSION", title: "Moderator: Sis. Mofiyinfoluwa Bamiduro", detail: "" },
    { time: "7:00am - 8:30am", title: "General Cleaning", detail: "" },
    { time: "9:00am - 9:45am", title: "Open Heaven", detail: "Sis. Mercy Ojo" },
    { time: "9:45am - 10:05am", title: "Praise & Worship", detail: "Choir" },
    { time: "10:05am - 10:25am", title: "Prayer Uproar", detail: "Prayer Secretary" },
    { time: "10:25am - 11:55am", title: "Teaching 1", detail: "Rev'd. Adebisi Ikotun" },
    { time: "11:55am - 12:10pm", title: "Announcement", detail: "Secretariat" },
    { time: "Brunch Break", title: "Brunch!!! Brunch!!! Brunch!!!", detail: "Cafeteria" },
    
    { time: "AFTERNOON SESSION", title: "Moderator: Bro. Peter Okunlola", detail: "" },
    { time: "2:00pm – 2:05pm", title: "Opening Prayer", detail: "Moderator" },
    { time: "2:05pm – 2:25pm", title: "Praise & Worship", detail: "Choir" },
    { time: "2:25pm – 2:45pm", title: "Prayer Session", detail: "Prayer Secretary" },
    { time: "2:45pm – 2:50pm", title: "Bible Reading", detail: "Moderator" },
    { time: "2:50pm – 4:20pm", title: "Orientation", detail: "Rev’d. Alade James" },
    { time: "4:20pm - 4:40pm", title: "Questions & Answers", detail: "Moderator" },
    { time: "4:40pm – 4:50pm", title: "Announcement", detail: "Secretariat \n-Echoes for Refreshing @40 (This is our story, Alumni recollections)" },
    
    { time: "ANOINTING NIGHT", title: "Moderators: Prayer Secretaries", detail: "" },
    { time: "11:00pm - 11:05pm", title: "Opening Prayer", detail: "Moderator" },
    { time: "11:05pm - 11:25pm", title: "Praise & Worship", detail: "Choir" },
    { time: "11:25pm - 11:50pm", title: "Prayer Session", detail: "Prayer Secretary" },
    { time: "11:50pm - 12:15am", title: "Drama Ministration", detail: "Drama Department" },
    { time: "12:15am - 12:25am", title: "Hymn", detail: "Choir" },
    { time: "12:25am - 12:30am", title: "Bible Reading", detail: "Moderator" },
    { time: "12:30am - 12:45am", title: "Choir Ministration", detail: "Choir" },
    { time: "12:45am - 2:20am", title: "Anointing Night", detail: "Rev’d. Victor Kolawole" },
    { time: "2:20am - 2:30am", title: "Announcement", detail: "Secretariat" },
  ],
  2: [
    { time: "MORNING SESSION", title: "Moderator: Sis. Grace Ayo-Akinjole", detail: "" },
    { time: "7:00am - 8:30am", title: "General Cleaning", detail: "" },
    { time: "9:00am - 9:40am", title: "Open Heaven", detail: "Pst. Odunayo Adeyemi" },
    { time: "9:40am - 10:00am", title: "Praise & Worship", detail: "Choir" },
    { time: "10:00am - 10:15am", title: "Prayer Uproar", detail: "Prayer Secretary" },
    { time: "10:15am - 11:50am", title: "Family Hour (Alumni & Students)", detail: "Alumni" },
    { time: "11:50am - 12:05pm", title: "Questions & Answers", detail: "Moderator" },
    { time: "12:05pm - 12:30pm", title: "Stewardship Orientation", detail: "Alumni" },
    { time: "12:30pm - 12:40pm", title: "Announcement", detail: "Secretariat" },
    { time: "Brunch Break", title: "Brunch!!! Brunch!!! Brunch!!!", detail: "Cafeteria" },
    
    { time: "EVENING SESSION", title: "ARRIVAL/REGISTRATION (GENERAL CAMP)\nModerators: Bro. Faith Olanisebe and Sis. Iyanuoluwa Adeyemo", detail: "" },
    { time: "6:00pm – 6:05pm", title: "Opening Prayer", detail: "Moderator" },
    { time: "6:05pm – 6:25pm", title: "Praise & Worship", detail: "Choir" },
    { time: "6:25pm – 6:45pm", title: "Prayer Session", detail: "Prayer Secretary" },
    { time: "6:45pm – 7:10pm", title: "Welcome Charge", detail: "Bro. Bobola Adeyemi (LCBSF President)" },
    { time: "7:10pm – 7:35pm", title: "Drama Ministration", detail: "Drama Department" },
    { time: "7:35pm – 7:40pm", title: "Bible Reading", detail: "Moderator" },
    { time: "7:40pm – 8:55pm", title: "Message", detail: "Rev'd Dr. Julius Oluwole" },
    { time: "8:55pm – 9:10pm", title: "Welcome Song", detail: "Choir" },
    { time: "9:10pm – 9:30pm", title: "Orientation/Announcement", detail: "Secretariat \n-Echoes for Refreshing @40 (BSF Photo galleries and Testimonials about unforgettable Refreshing moments)" },
    { time: "Dinner Break", title: "Dinner!!! Dinner!!! Dinner!!!", detail: "Cafeteria" }
  ],
  3: [
    { time: "MORNING SESSION", title: "Moderators: Bro. Ayomide Abraham and Sis. Imade Ojo", detail: "" },
    { time: "7:00am - 8:30am", title: "General Cleaning", detail: "" },
    { time: "9:00am - 9:30am", title: "Open Heaven", detail: "Pst. Mrs. Adebusola Oguntola" },
    { time: "9:30am - 9:50am", title: "Praise & Worship", detail: "Choir" },
    { time: "9:50am - 9:55am", title: "Bible Reading", detail: "Moderator" },
    { time: "9:55am - 11:20am", title: "Teaching II", detail: "Rev'd. Dr. Enoch Abimbola" },
    { time: "11:20am -11:30am", title: "Announcement", detail: "Secretariat" },
    { time: "Brunch Break", title: "Brunch!!! Brunch!!! Brunch!!!", detail: "Cafeteria" },
    
    { time: "AFTERNOON SESSION", title: "ACADEMIC SEMINAR\nModerators: Bro. Samuel Babajide and Sis. Kofoworola Samson", detail: "" },
    { time: "3:00pm – 3:05pm", title: "Opening Prayer", detail: "Moderator" },
    { time: "3:05pm – 3:25pm", title: "Praise & Worship", detail: "Choir" },
    { time: "3:25pm – 4:50pm", title: "Bible Study", detail: "Bible Study Department" },
    { time: "4:50pm – 5:00pm", title: "Praise Session", detail: "Choir" },
    { time: "5:00pm – 6:00pm", title: "Academic Seminar (Panel Discussions)", detail: "Prof. Yinka Aladesida & Dr. Mrs. Olayanju" },
    { time: "6:00pm – 6:20pm", title: "Questions & Answers", detail: "Moderator" },
    { time: "6:20pm – 6:30pm", title: "Announcement", detail: "Secretariat \n-Echoes for Refreshing @40 (Recollecting the theme songs/favourites choruses)" },
    { time: "Dinner Break", title: "Dinner!!! Dinner!!! Dinner!!!", detail: "Cafeteria" },

    { time: "REFRESHING NIGHT", title: "Moderators: Prayer Secretaries", detail: "" },
    { time: "11:00pm - 11:30pm", title: "Prayer Session", detail: "Prayer Secretary" },
    { time: "11:30pm – 11:40pm", title: "Hymn", detail: "Choir" },
    { time: "11:40pm - 12:25am", title: "Song Ministration", detail: "Min. Rebecca Olowookere" },
    { time: "12:25am - 12:30am", title: "Bible Reading", detail: "Moderator" },
    { time: "12:30am - 12:45am", title: "Choir Ministration", detail: "Choir" },
    { time: "12:45am - 2:45am", title: "Refreshing Hour", detail: "Rev’d. Ebenezer Osundele" },
    { time: "2:45am - 2:55am", title: "Offering", detail: "Moderator" },
    { time: "2:55am - 3:00am", title: "Announcement", detail: "Secretariat" },
  ],
  4: [
    { time: "MORNING SESSION", title: "RELATIONSHIP SEMINAR\nModerators: Bro. Emmanuel Ayobami and Sis. Florence Fatimoju", detail: "" },
    { time: "7:00am - 8:30am", title: "General Cleaning", detail: "" },
    { time: "9:00am - 9:30am", title: "Open Heaven", detail: "Bro. Mayowa Oshunfuyi (President, LEBSF)" },
    { time: "9:30am - 9:45am", title: "Praise & Worship", detail: "Choir" },
    { time: "9:45am - 10:00am", title: "Prayer Session", detail: "Prayer Secretary" },
    { time: "10:00am - 10:10am", title: "Choir Ministration", detail: "Choir" },
    { time: "10:10am - 11:10am", title: "Relationship Seminar", detail: "Mrs. Victoria Olaogun" },
    { time: "11:10am - 11:25am", title: "Question & Answers", detail: "Moderator" },
    { time: "11:25am – 11:30am", title: "Announcement", detail: "Secretariat" },
    { time: "Brunch Break", title: "Brunch!!! Brunch!!! Brunch!!!", detail: "Cafeteria" },
    
    { time: "AFTERNOON SESSION", title: "REFRESHING @40 CELEBRATION!!!", detail: "Duration: 2:00pm - 6:00pm\nMinister: Rev'd. Tunde Babatunde\nModerators: Alumni" },
    { time: "Dinner Break", title: "Dinner!!! Dinner!!! Dinner!!!", detail: "Cafeteria" },

    { time: "EVENING SESSION", title: "ASSOCIATION ON FIRE: 5:30pm --- 7:00pm", detail: "Moderators: Associational Leaders" },
    
    { time: "THANKSGIVING & CHOICE NIGHT", title: "Moderators: Alumni", detail: "" },
    { time: "11:00pm - 11:10pm", title: "Opening Prayer", detail: "Moderator" },
    { time: "11:10pm - 12:00am", title: "Song Ministration", detail: "Min. Ebunolasings, Oladosu Twins" },
    { time: "12:00am - 1:20am", title: "Message", detail: "Mr. Sunday Oguntola" },
    { time: "1:20am - 2:00am", title: "Thanksgiving", detail: "* Conferences Thanksgiving\n* FYB Thanksgiving\n* Alumni Thanksgiving\n* Executives Thanksgiving" },
    { time: "2:00am - 3:50am", title: "Alumni Appreciation/Choice Hour", detail: "Alumni" },
    { time: "3:50am – 4:00am", title: "Announcement", detail: "Secretariat" },
  ]
};

export default function ProgrammePage() {
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const dayParam = params.get("day");
      if (dayParam) {
        const dayIdx = parseInt(dayParam, 10);
        if (!isNaN(dayIdx) && dayIdx >= 0 && dayIdx < 5) {
          setActiveDay(dayIdx);
        }
      }
    }
  }, []);

  const activeDayLabel = `Day ${activeDay + 1}`;
  const dayItems = SCHEDULE[activeDay as keyof typeof SCHEDULE] || [];

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      <section className="relative w-full h-[45dvh] min-h-[380px] hero-landscape flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-40 lg:pt-48 pb-24 px-4 sm:px-6 md:px-16 border-b border-white/5">
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
          <span className="font-sans text-sm font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase">
            FIVE DAYS IN HIS SANCTUARY
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-[85px] font-bold tracking-tight uppercase select-none leading-[0.95]">
            DAILY <br />
            <span className="text-gradient-gold font-normal font-serif">JOURNEY</span>
          </h1>
          <p className="font-serif text-base sm:text-lg md:text-xl italic text-white/80 font-light max-w-2xl border-l border-primary/50 pl-6 mt-2">
            An unfolding vertical roadmap from covenant devotion to global deployment.
          </p>
        </div>
      </section>

      <section className="relative w-full bg-[#FAF6EE] border-b border-black/5 py-6 px-4 sm:px-6 md:px-16 overflow-hidden z-20">
        <div className="max-w-7xl mx-auto">
          <ScrollableTabBar className="gap-4 md:gap-8 justify-start md:justify-center">
            {daysConfig.map((d, idx) => {
              const isActive = idx === activeDay;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveDay(idx)}
                  className={`flex-shrink-0 text-left font-sans py-3.5 px-6 border rounded-2xl transition-all duration-300 active-press cursor-pointer ${
                    isActive 
                      ? "border-[#C25627] bg-[#C25627] shadow-md" 
                      : "border-black/10 text-zinc-600 hover:text-zinc-900 hover:bg-black/5 bg-white/50"
                  }`}
                >
                  <span className={`block font-mono text-xs font-bold tracking-widest mb-0.5 ${isActive ? "text-[#DDB94E]" : "text-[#C25627]"}`}>
                    {d.label}
                  </span>
                  <span className={`block text-sm font-bold uppercase tracking-wider ${isActive ? "text-white" : "text-[#0B0907]"}`}>
                    {d.name}
                  </span>
                </button>
              );
            })}
          </ScrollableTabBar>
        </div>
      </section>

      <section className="relative w-full pt-8 pb-24 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-stretch">
          <div className="mb-12 text-left">
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

          <div className="relative pl-8 md:pl-12 border-l border-black/10 flex flex-col gap-10 text-left">
            {dayItems.map((sess, idx) => {
              const isSectionHeader = sess.time.includes("SESSION") || sess.time.includes("NIGHT");
              const isBreak = sess.time.includes("Break");
              
              if (isSectionHeader) {
                return (
                  <div key={idx} className="relative block pt-6 pb-2">
                    <div className="absolute -left-[33px] md:-left-[57px] top-8 h-4 w-4 bg-[#FAF6EE] border-2 border-primary-dark flex items-center justify-center z-10">
                      <div className="h-1.5 w-1.5 bg-[#C25627]" />
                    </div>
                    <span className="font-mono text-sm font-extrabold tracking-widest text-[#C25627] uppercase">
                      {sess.time}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-light text-[#0B0907] uppercase mt-2 whitespace-pre-line">
                      {sess.title}
                    </h3>
                    {sess.detail && (
                      <p className="font-sans text-zinc-600 text-sm sm:text-base font-light leading-relaxed max-w-2xl mt-1 whitespace-pre-line">
                        {sess.detail}
                      </p>
                    )}
                  </div>
                );
              }

              if (isBreak) {
                return (
                  <div key={idx} className="relative block py-4 text-center border-y border-black/5 bg-black/5 mt-2 rounded-xl">
                    <h3 className="font-mono text-sm sm:text-base font-bold text-[#6B1D2A] uppercase tracking-[0.2em]">
                      {sess.title}
                    </h3>
                  </div>
                );
              }

              return (
                <div key={idx} className="relative block group">
                  <div className="absolute -left-[32px] md:-left-[56px] top-1.5 h-3 w-3 bg-[#FAF6EE] border border-black/20 rounded-full flex items-center justify-center z-10">
                    <div className="h-1 w-1 bg-black/40 rounded-full" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-xs font-bold tracking-widest text-[#C25627]">
                      {sess.time}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-normal text-[#0B0907]">
                      {sess.title}
                    </h3>
                    {sess.detail && (
                      <p className="font-sans text-zinc-600 text-sm font-light leading-relaxed max-w-2xl whitespace-pre-line">
                        {sess.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative w-full py-24 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6 p-6 sm:p-10 bg-[#1A0E12] text-white shadow-2xl rounded-3xl">
          <span className="font-sans text-sm font-bold tracking-[0.25em] text-[#DDB94E] uppercase">
            SECURE YOUR REGISTRATION NOW
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-white uppercase leading-none">
            Experience the <span className="font-serif italic font-extralight text-primary-light">Refreshing</span>
          </h2>
          <p className="font-sans text-white/60 text-sm leading-relaxed max-w-lg font-light">
            Secure your delegates roster, workshop handouts, and hostel room allocations. Camp registration is required for all delegates.
          </p>
          <a
            href={REGISTRATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 bg-primary hover:bg-primary-light text-[#0B0907] font-sans font-bold text-sm tracking-widest uppercase transition-all duration-300 mt-4 active-press"
          >
            Register for the Program
          </a>
        </div>
      </section>
    </div>
  );
}
