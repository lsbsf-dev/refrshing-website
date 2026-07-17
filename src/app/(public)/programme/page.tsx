"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function ProgrammePage() {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <div className="w-full flex flex-col bg-[#0B0907] text-[#FCFAF6] antialiased overflow-hidden selection:bg-primary/20">
      
      {/* ═══════════════════════════════════════
          SCENE 1: PROGRAMME HERO (Unfolding the timeline - Centered & Space aligned)
          ═══════════════════════════════════════ */}
      <section className="relative w-full h-[45dvh] min-h-[380px] flex flex-col justify-center bg-[#0B0907] overflow-hidden pt-36 pb-24 px-6 md:px-16 border-b border-white/5">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Image
            src="/pictures/Image 3.jpg"
            alt="Sanctuary details background"
            fill
            className="object-cover object-center filter grayscale"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/30 to-[#0B0907]/80 pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[600px] h-[400px] bg-[#6B1D2A]/20 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute inset-0 texture-halftone opacity-25 pointer-events-none" />

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

      {/* ═══════════════════════════════════════
          SCENE 2: TABS SELECTOR (Day Navigation - Rounded tab buttons)
          ═══════════════════════════════════════ */}
      <section className="relative w-full bg-[#15130F] border-y border-white/5 py-6 px-6 md:px-16 overflow-hidden z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center overflow-x-auto gap-4 md:gap-8 scrollbar-none">
          {daysData.map((d, idx) => {
            const isActive = idx === activeDay;
            return (
              <button
                key={idx}
                onClick={() => setActiveDay(idx)}
                className={`flex-shrink-0 text-left font-sans py-2 px-5 border transition-all duration-300 rounded-xl ${
                  isActive 
                    ? "border-primary text-primary-light bg-primary/5 shadow-lg" 
                    : "border-transparent text-white/40 hover:text-white/80"
                }`}
              >
                <span className="block font-mono text-[10px] font-bold tracking-widest text-[#E05320] mb-0.5">
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

      {/* ═══════════════════════════════════════
          SCENE 3: THE TIMELINE JOURNEY (Rounded timeline markers)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-28 px-6 md:px-16 bg-[#0B0907] overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#6B1D2A]/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-stretch">
          
          <div className="mb-16 text-left">
            <span className="font-mono text-xs font-bold text-[#E05320] block mb-2 tracking-widest">
              {daysData[activeDay].date.toUpperCase()}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-white uppercase tracking-tight">
              {daysData[activeDay].name} · <span className="font-serif italic font-extralight text-[#DDB94E]">{daysData[activeDay].title}</span>
            </h2>
            <p className="font-sans text-white/50 text-sm font-light mt-3 leading-relaxed max-w-xl">
              {daysData[activeDay].summary}
            </p>
          </div>

          {/* Unfolding Roadmaps */}
          <div className="relative pl-6 md:pl-12 border-l border-white/10 flex flex-col gap-12 text-left">
            
            {daysData[activeDay].sessions.map((sess, idx) => (
              <div key={idx} className="relative group">
                
                {/* Visual node marker - Rounded-full */}
                <div className="absolute -left-[31px] md:-left-[55px] top-1.5 h-4 w-4 bg-[#0B0907] border-2 border-primary-light flex items-center justify-center rounded-full z-10 group-hover:scale-125 transition-transform duration-300">
                  <div className="h-1.5 w-1.5 bg-[#E05320] rounded-full" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[10px] font-extrabold tracking-widest text-[#E05320] bg-[#E05320]/10 border border-[#E05320]/20 px-3 py-1 uppercase rounded-md">
                      {sess.time}
                    </span>
                    <span className="font-sans text-[10px] text-white/40 tracking-wider uppercase font-light">
                      {sess.venue}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-light text-white uppercase group-hover:text-primary-light transition-colors duration-300">
                    {sess.name}
                  </h3>

                  {sess.minister && (
                    <span className="font-sans text-xs text-[#DDB94E] tracking-wider uppercase font-semibold">
                      Minister: {sess.minister}
                    </span>
                  )}

                  <p className="font-sans text-white/60 text-xs sm:text-sm font-light leading-relaxed max-w-2xl mt-1">
                    {sess.description}
                  </p>
                </div>

              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 4: REGISTRATION CTA - Rounded CTA Button, Removed Free copy
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-24 px-6 md:px-16 bg-[#1A0E12] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6B1D2A]/20 to-[#2B0C3F]/15 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
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
            className="px-10 py-5 bg-primary hover:bg-primary-light text-[#0B0907] font-sans font-bold text-[12px] tracking-widest uppercase transition-all duration-300 mt-4 rounded-full"
          >
            Register for the Program
          </a>
        </div>
      </section>

    </div>
  );
}

const daysData = [
  {
    label: "DAY 01",
    name: "Monday",
    date: "August 10, 2026",
    title: "The Altar Commenced",
    summary: "Opening alignment sessions for fellowship leaders, orientation, and setting the revival fire.",
    sessions: [
      {
        time: "10:00 AM - 02:00 PM",
        name: "Chapter Leaders Arrival & Check-In",
        venue: "Baptist Academy Hostel Rooms",
        description: "Registration check-in, room assignments, and material package pick-ups for Lagos East, West, and Central fellowship leaders.",
      },
      {
        time: "04:00 PM - 06:00 PM",
        name: "Leadership Convocation & Alignment",
        venue: "Seminar Room A",
        description: "Prophetic alignment briefing led by the coordinators and alumni team to discuss the five-day flow.",
        minister: "LSBSF Coordinating Committee",
      },
      {
        time: "07:00 PM - 09:30 PM",
        name: "Opening Altar Fire & Prayers",
        venue: "Main Sanctuary Hall",
        description: "Concentrated sessions of prayers, fanning the revival flame for the conference.",
        minister: "Pastor Segun Babalola",
      }
    ]
  },
  {
    label: "DAY 02",
    name: "Tuesday",
    date: "August 11, 2026",
    title: "The Word Exposed",
    summary: "Intensive training, seminar sessions, and theological foundations for fellowship leaders.",
    sessions: [
      {
        time: "07:00 AM - 08:30 AM",
        name: "Morning Covenant Devotions",
        venue: "Sanctuary East Garden",
        description: "Quiet reflection, meditation, and communion moments in the morning light.",
      },
      {
        time: "09:30 AM - 12:00 PM",
        name: "Discipleship Cohort Seminars",
        venue: "Seminar Classrooms 1-4",
        description: "Classrooms split by tracks to study theology, covenant foundations, and campus leadership.",
        minister: "Dr. Helen Adeyemi & Alumni Coordinators",
      },
      {
        time: "04:30 PM - 06:30 PM",
        name: "Campus Strategy Panel",
        venue: "Main Sanctuary Hall",
        description: "Equipping campus chapters on how to maintain active altars and handle conflicts on-site.",
        minister: "Fellowship Panelists",
      },
      {
        time: "07:00 PM - 09:30 PM",
        name: "Revival Encounter Session",
        venue: "Main Sanctuary Hall",
        description: "An evening of corporate praise, worship, and raw scriptural expository.",
        minister: "Pastor Segun Babalola",
      }
    ]
  },
  {
    label: "DAY 03",
    name: "Wednesday",
    date: "August 12, 2026",
    title: "General Gathering Arrival",
    summary: "Arrival of the main delegate body. Corporate gatherings commence with the evening revival fire.",
    sessions: [
      {
        time: "08:00 AM - 03:00 PM",
        name: "General Delegates Arrival & Registration",
        venue: "Main Sanctuary Foyer",
        description: "Check-in rosters open. General delegates check in and download study outlines.",
      },
      {
        time: "04:30 PM - 06:00 PM",
        name: "Anniversary Welcome Briefing",
        venue: "Main Sanctuary Hall",
        description: "Welcoming all chapters and celebrating 40 years of Refreshing history.",
        minister: "LSBSF President",
      },
      {
        time: "07:00 PM - 10:00 PM",
        name: "The First Corporate Altar Meeting",
        venue: "Main Sanctuary Hall",
        description: "General body evening worship and first keynote address on the Greater Glory theme.",
        minister: "Pastor Segun Babalola",
      }
    ]
  },
  {
    label: "DAY 04",
    name: "Thursday",
    date: "August 13, 2026",
    title: "Word Feast & Communion",
    summary: "A heavy concentration of scripture, breakout panels, and corporate communion table.",
    sessions: [
      {
        time: "07:00 AM - 08:30 AM",
        name: "Corporate Morning Devotions",
        venue: "Main Sanctuary Hall",
        description: "Morning praise and scripture readings for all delegates.",
      },
      {
        time: "09:30 AM - 12:00 PM",
        name: "General Discipleship Seminar",
        venue: "Main Sanctuary Hall",
        description: "In-depth study on preserving the covenant foundations in career, school, and marriage.",
        minister: "Dr. Helen Adeyemi",
      },
      {
        time: "03:00 PM - 05:00 PM",
        name: "Q&A Session & Panel Discussions",
        venue: "Main Sanctuary Hall",
        description: "Open floor for campus delegates to ask questions on leadership and ministry.",
      },
      {
        time: "07:00 PM - 10:00 PM",
        name: "Communion Service & Prophetic Night",
        venue: "Main Sanctuary Hall",
        description: "Corporate breaking of bread and prayer sessions for global revival.",
        minister: "Pastor Segun Babalola & Elders",
      }
    ]
  },
  {
    label: "DAY 05",
    name: "Friday",
    date: "August 14, 2026",
    title: "Commissioning & Departure",
    summary: "Final commissioning: sending forth of delegates to campus chapters, and check-out.",
    sessions: [
      {
        time: "07:00 AM - 08:30 AM",
        name: "Consecration Prayers",
        venue: "Main Sanctuary Hall",
        description: "Last morning devotion before campus deployment.",
      },
      {
        time: "09:30 AM - 12:30 PM",
        name: "Commissioning & Sendforth Service",
        venue: "Main Sanctuary Hall",
        description: "Delivering final charges, campus deployment, and sending forth student leaders to campuses.",
        minister: "Pastor Segun Babalola",
      },
      {
        time: "01:30 PM - 04:00 PM",
        name: "Check-Out & Departure",
        venue: "Hostel Rooms",
        description: "Room clearance and room check-out as delegates return to their destinations.",
      }
    ]
  }
];
