/**
 * Public Landing Page Component — Refreshing 2026
 * 11 Editorial Scenes showcasing theme, ministers, programme roadmap, and registration.
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMinisters } from "@/lib/firebase/ministers";
import { getEventScopedDocs, HomepageSettings, Article } from "@/lib/firebase/cms";
import { getEventById } from "@/lib/firebase/events";
import { useParams } from "next/navigation";
import { REGISTRATION_URL } from "@/lib/constants";
import { Minister } from "@/types/minister";
import { Announcement } from "@/types/announcement";

export default function HomePage() {
  const params = useParams();
  const ACTIVE_EVENT_ID = params?.eventId as string;
  const pageRef = useRef<HTMLDivElement>(null);
  const [daysLeft, setDaysLeft] = useState<number>(0);

  const { data: settingsDocs = [] } = useQuery({
    queryKey: ["public", "homepageSettings", ACTIVE_EVENT_ID],
    queryFn: () => getEventScopedDocs<HomepageSettings>(ACTIVE_EVENT_ID, "homepageSettings"),
    staleTime: 5 * 60 * 1000,
  });
  const settings = settingsDocs[0] || null;

  const { data: ministers = [] } = useQuery({
    queryKey: ["ministers", ACTIVE_EVENT_ID],
    queryFn: () => getMinisters(ACTIVE_EVENT_ID),
    staleTime: 6 * 60 * 60 * 1000,
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["public", "announcements", ACTIVE_EVENT_ID],
    queryFn: () => getEventScopedDocs<Announcement>(ACTIVE_EVENT_ID, "announcements"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["public", "articles", ACTIVE_EVENT_ID],
    queryFn: () => getEventScopedDocs<Article>(ACTIVE_EVENT_ID, "articles"),
    staleTime: 5 * 60 * 1000,
  });

  const testimonies = [
    {
      quote:
        "Refreshing 2018 at Baptist Academy was where my call to ministry became crystal clear. The atmosphere of prayer altered my life direction.",
      name: "Bro. Emmanuel Adeleke",
      role: "Alumni, Class of 2019",
    },
    {
      quote:
        "The fellowship across associations is unmatched. You enter camp as a student and leave as a kingdom leader with clear vision.",
      name: "Sis. Timi Idowu",
      role: "Campus Executive, LASU",
    },
    {
      quote:
        "For 40 years, God has used LSBSF to raise leaders for church and society. Refreshing 2026 will be our greatest convergence yet.",
      name: "Rev'd Dr. Enoch Abimbola",
      role: "ALBA Moderator",
    },
  ];

  const daysConfig = [
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

  const { data: eventData } = useQuery({
    queryKey: ["event", ACTIVE_EVENT_ID],
    queryFn: () => getEventById(ACTIVE_EVENT_ID),
    staleTime: 6 * 60 * 60 * 1000,
  });

  useEffect(() => {
    // Fallback to hardcoded if not loaded/set
    const target = eventData?.startDate 
      ? new Date(eventData.startDate).getTime() 
      : new Date("2026-08-10T08:00:00Z").getTime();
      
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
  }, [eventData?.startDate]);

  const [showMilestoneOverlay, setShowMilestoneOverlay] = useState(false);
  useEffect(() => {
    if (settings?.milestoneOverlayEnabled) {
      const dismissed = localStorage.getItem("milestone_dismissed");
      if (!dismissed) {
        setShowMilestoneOverlay(true);
      }
    }
  }, [settings?.milestoneOverlayEnabled]);

  const dismissMilestone = () => {
    setShowMilestoneOverlay(false);
    localStorage.setItem("milestone_dismissed", "true");
  };

  const isAnniversaryVisible = (() => {
    if (!settings?.anniversaryBannerEnabled || !settings.anniversary) return false;
    const now = new Date().getTime();
    const start = settings.anniversary.displayStart ? new Date(settings.anniversary.displayStart).getTime() : 0;
    const end = settings.anniversary.displayEnd ? new Date(settings.anniversary.displayEnd).getTime() : Infinity;
    return now >= start && now <= end;
  })();

  return (
    <div ref={pageRef} className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      
      {/* MILESTONE OVERLAY MODAL */}
      {showMilestoneOverlay && settings?.milestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0B0907] border border-[#C25627]/30 text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-500">
            <button onClick={dismissMilestone} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-[#C25627] transition-colors">✕</button>
            {settings.milestone.imageUrl && (
              <div className="relative w-full h-48 sm:h-64">
                <Image src={settings.milestone.imageUrl} alt="Milestone Celebration" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] to-transparent" />
              </div>
            )}
            <div className={`p-8 text-center ${settings.milestone.imageUrl ? '-mt-10 relative z-10' : ''}`}>
              <h2 className="font-serif text-3xl font-bold uppercase text-[#DDB94E] mb-4">Celebration!</h2>
              <p className="font-sans text-lg text-white/90 leading-relaxed font-light">{settings.milestone.text}</p>
              <button onClick={dismissMilestone} className="mt-8 px-8 py-3 bg-[#C25627] hover:bg-[#a1451f] text-white font-bold rounded-xl transition-colors uppercase tracking-widest text-sm">
                Enter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          SCENE 1: HERO (Explosive - Dynamic Scale & Entrance)
          ═══════════════════════════════════════ */}
      <section className="relative w-full h-[100dvh] min-h-[650px] hero-landscape flex flex-col justify-between overflow-hidden bg-[#0B0907] text-[#FCFAF6] pt-24 pb-8">
        
        {/* Worship background opacity */}
        <div className="absolute inset-0 w-full h-full opacity-55 pointer-events-none z-0">
          <Image
            src={settings?.heroBackgroundImageUrl || "/pictures/Image 3.jpg"}
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

        {/* Dynamic Image Collage - Rounded 2XL Corners */}
        <div className="absolute inset-y-0 right-12 lg:right-28 hidden md:flex flex-col justify-center items-end gap-0 z-10 w-72 pointer-events-none select-none">
          
          {/* 1. Large Portrait */}
          <div className="relative aspect-[3/4] w-56 border border-white/10 shadow-2xl rotate-[3deg] overflow-hidden bg-white/5 z-20 rounded-2xl">
            <Image
              src="/pictures/Image 6.jpg"
              alt="Dominant worship profile"
              fill
              className="object-cover object-top scale-110 -translate-y-2 filter saturate-[0.85] brightness-95"
            />
          </div>

          {/* 2. Medium Details */}
          <div className="relative aspect-[4/3] w-48 border border-white/10 shadow-xl -translate-x-24 -translate-y-12 rotate-[-6deg] overflow-hidden bg-white/5 z-10 rounded-2xl">
            <Image
              src="/pictures/Image 11.jpg"
              alt="Supporting seminar scene"
              fill
              className="object-cover object-center scale-110 filter saturate-[0.9]"
            />
          </div>

          {/* 3. Accent */}
          <div className="relative aspect-square w-28 border border-white/10 shadow-lg -translate-x-12 -translate-y-20 rotate-[12deg] overflow-hidden bg-white/5 z-0 opacity-75 rounded-2xl">
            <Image
              src="/pictures/Image 9.jpg"
              alt="Sanctuary context details"
              fill
              className="object-cover object-center"
            />
          </div>

        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-16 flex-1 flex flex-col justify-center items-start gap-4">
          
          <span className="font-sans text-sm font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase animate-hero-item delay-100">
            LAGOS STATE BAPTIST STUDENT FELLOWSHIP PRESENTS
          </span>

          <h1 className="font-serif text-2xl xs:text-4xl sm:text-6xl md:text-[95px] lg:text-[115px] font-bold tracking-tight leading-[0.95] text-white uppercase select-none animate-hero-item delay-200">
            {settings?.heroTitle ? (
              settings.heroTitle.split(" ").map((word, i) => (
                <span key={i} className="text-gradient-gold block font-serif">
                  {word}
                </span>
              ))
            ) : (
              <>
                <span className="text-gradient-gold block font-serif">THE GREATER</span>
                <span className="text-gradient-gold block font-serif">GLORY</span>
              </>
            )}
          </h1>

          <div className="max-w-xl border-l-2 border-[#C25627] pl-4 sm:pl-6 my-2 animate-hero-item delay-300">
            <p className="font-serif text-sm sm:text-base md:text-lg italic text-white/95 leading-relaxed font-light">
              {settings?.heroSubtitle || "“The glory of this present house will be greater than the glory of the former house,” says the Lord Almighty."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1 font-mono text-xs tracking-widest text-[#DDB94E] uppercase animate-hero-item delay-400">
            <span>AUGUST 10–14, 2026</span>
            <span>·</span>
            <span>BAPTIST ACADEMY, OBANIKORO, LAGOS</span>
          </div>

        </div>

      </section>

      {/* ANNIVERSARY BANNER (If enabled & within dates) */}
      {isAnniversaryVisible && settings?.anniversary && (
        <section className="relative w-full py-16 px-4 sm:px-6 md:px-16 bg-[#0B0907] text-[#FCFAF6] overflow-hidden border-t border-[#C25627]/20 flex items-center justify-center min-h-[300px]">
          {settings.anniversary.backgroundImageUrl && (
            <div className="absolute inset-0 opacity-30">
              <Image src={settings.anniversary.backgroundImageUrl} alt="Anniversary Background" fill className="object-cover" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-4">
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase text-gradient-gold">
              {settings.anniversary.title}
            </h2>
            {settings.anniversary.subtitle && (
              <p className="font-sans text-lg sm:text-xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed italic">
                {settings.anniversary.subtitle}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          SCENE 2: THEME (Scripture Art Card with Extra Spacing)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-20 px-4 sm:px-6 md:px-16 bg-[#0B0907] text-[#FCFAF6] overflow-hidden border-t border-white/5">
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div data-reveal className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            <span className="font-sans text-sm font-extrabold tracking-[0.3em] text-[#DDB94E] uppercase">
              THE 40TH ANNIVERSARY REVIVAL
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white leading-tight uppercase">
              GREATER <br />
              <span className="text-gradient-sunset font-normal">GLORY</span>
            </h2>
            <div className="h-[1px] w-24 bg-[#C25627] my-2" />
            <p className="font-sans text-white/80 text-base leading-relaxed font-light max-w-xl">
              Refreshing 2026 is a threshold. For forty years, the Lord has gathered students across campuses and churches in revival, faith, and fellowship. But the narrative is not ending. We are being commissioned into a greater weight of His presence and a fuller display of His glory across our churches and campuses.
            </p>
          </div>

          <div data-reveal className="lg:col-span-5 relative flex justify-center">
            {/* Elegant scripture card with extra spacing before ISAIAH 52:1-7 line */}
            <div className="w-full max-w-md py-6 border-y border-[#DDB94E]/25 relative text-left">
              <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#C25627] uppercase block mb-3">
                HAGGAI 2:9
              </span>
              <p className="font-serif text-lg md:text-xl italic font-light text-white/95 leading-relaxed mb-6">
                &ldquo;The glory of this present house shall be greater than of the former, saith the Lord of hosts: and in this place will I give peace, saith the Lord of hosts.&rdquo;
              </p>
              
              {/* Extra spacing & padding before ISAIAH line as requested */}
              <div className="mt-6 pt-6 border-t border-white/15">
                <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#DDB94E] uppercase block mb-1">
                  ISAIAH 52:1–7
                </span>
                <span className="font-sans text-xs font-bold tracking-widest text-[#FFD6C4] uppercase block">
                  ARISE, AWAKE & PUT ON THY STRENGTH
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 3: 40 YEARS (A Legacy of Covenant and Fire)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-24 bg-gradient-to-b from-[#0B0907] via-[#1D1013] to-[#0B0907] text-[#FCFAF6] overflow-hidden border-t border-white/5 min-h-[90vh] flex items-center">
        
        {/* Giant background year watermark */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
          <span className="font-serif text-[180px] md:text-[320px] text-white/[0.015] uppercase tracking-widest font-extrabold rotate-[4deg]">
            1986
          </span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left: Exhibition Gallery Wall (Rounded 2XL photo containers) */}
            <div className="lg:col-span-7 relative flex justify-center z-10 w-full">
              <div data-reveal className="relative w-full max-w-xl h-[420px] sm:h-[550px]">
                
                {/* Photo 1: Image 14 */}
                <div className="absolute left-0 top-0 w-[60%] aspect-[3/4] z-10 border border-black/15 shadow-2xl rotate-[-3deg] transition-transform duration-500 hover:rotate-0 bg-white p-2.5 rounded-2xl overflow-hidden active-press">
                  <div className="relative w-full h-full overflow-hidden rounded-xl">
                    <Image
                      src="/pictures/Image 14.jpg"
                      alt="Archival foundations 1986"
                      fill
                      className="object-cover scale-110 -translate-y-2 filter sepia-[0.35] brightness-[0.85] contrast-[1.05]"
                    />
                  </div>
                </div>

                {/* Photo 2: Image 10 */}
                <div className="absolute right-0 top-16 w-[60%] aspect-[3/4] z-20 border-4 border-[#FAF6EE] shadow-2xl rotate-[3deg] transition-transform duration-500 hover:rotate-0 bg-[#FAF6EE] p-2.5 rounded-2xl overflow-hidden active-press">
                  <div className="relative w-full h-full overflow-hidden rounded-xl">
                    <Image
                      src="/pictures/Image 10.jpg"
                      alt="Alumni Coordination"
                      fill
                      className="object-cover scale-115 -translate-y-3 filter saturate-[0.9]"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Editorial Narrative */}
            <div data-reveal className="lg:col-span-5 flex flex-col items-start gap-6 text-left">
              <span className="font-sans text-sm font-bold tracking-[0.25em] text-[#C25627] uppercase">
                A LEGACY OF COVENANT AND FIRE
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] uppercase">
                40 Years <br />
                of Kingdom <br />
                <span className="font-serif italic font-extralight text-primary-dark">Impact</span>.
              </h2>
              <p className="font-sans text-white/80 text-sm leading-relaxed font-light">
                Since its inception in 1986, the Lagos State Baptist Student Fellowship (LSBSF) has served as a central pillar for student ministry across the state. What began as a passionate network of prayer movements has grown into a unified, transformative force.
              </p>
              <p className="font-sans text-white/70 text-sm leading-relaxed font-light">
                Through our annual Refreshing gathering, generations of students across the Lagos East, Lagos West, and Lagos Central associations have been discipled, equipped, and sent forth.
              </p>
              <Link
                href={`/${ACTIVE_EVENT_ID}/about`}
                className="group inline-flex items-center gap-2 font-sans text-sm font-extrabold tracking-wider text-[#DDB94E] hover:text-white transition-all duration-300 mt-2 active-press"
              >
                <span className="border-b border-[#DDB94E] group-hover:border-white pb-0.5 uppercase">
                  Read Our Full Philosophy & History
                </span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 4: FEATURED MINISTERS (Compact Profile Cards, Controlled Sizes, No Full Bio)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-20 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        
        <div className="relative z-10 max-w-7xl mx-auto">
          
          <div className="mb-16 text-left max-w-3xl">
            <span className="font-sans text-sm font-bold tracking-[0.3em] text-[#C25627] uppercase block mb-3">
              THE ORACLES COMMITTED
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#0B0907] uppercase leading-none">
              FEATURED <span className="text-[#C25627] font-normal font-serif">MINISTERS</span>
            </h2>
            <div className="w-20 h-[1px] bg-[#C25627] mt-4" />
          </div>

          {/* Compact Cards — Controlled Image Size, No Long Bio Paragraph */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(settings?.featuredMinisters?.length 
              ? ministers.filter(m => settings.featuredMinisters.includes(m.id))
              : ministers.slice(0, 3)
            ).map((min) => (
              <Link
                key={min.id}
                href={`/${ACTIVE_EVENT_ID}/ministers/${min.slug}`}
                className="group flex flex-col bg-white border border-black/10 rounded-2xl overflow-hidden hover:border-[#C25627]/40 hover:shadow-xl transition-all duration-300 p-5 active-press"
              >
                <div className="flex items-center gap-4">
                  {/* Controlled Avatar Picture */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#0B0907] flex-shrink-0 border border-black/10">
                    <Image
                      src={min.photoUrl || "/pictures/Image 6.jpg"}
                      alt={min.name}
                      fill
                      className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>

                  {/* Minimal Details */}
                  <div className="flex flex-col text-left justify-center flex-1">
                    <span className="font-sans text-[10px] font-extrabold tracking-widest text-[#C25627] uppercase bg-[#C25627]/10 px-2.5 py-0.5 rounded-full w-fit mb-1">
                      {min.category === "music" ? "GOSPEL MUSIC" : "SPEAKER"}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#0B0907] group-hover:text-[#C25627] transition-colors leading-snug">
                      {min.name}
                    </h3>
                    <span className="font-sans text-xs font-bold text-[#C25627] uppercase mt-2 flex items-center gap-1">
                      View Profile →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div data-reveal className="flex justify-center mt-12">
            <Link
              href={`/${ACTIVE_EVENT_ID}/ministers`}
              className="group inline-flex items-center gap-3 px-8 py-3.5 border border-black/15 hover:border-black/35 text-[#0B0907] font-sans font-bold text-xs tracking-widest uppercase transition-all duration-300 bg-black/5 hover:bg-black/10 rounded-full active-press"
            >
              <span>Explore All Ministers →</span>
            </Link>
          </div>

        </div>
      </section>

      {/* FEATURED ANNOUNCEMENT & ARTICLES */}
      {(settings?.featuredAnnouncement || (settings?.featuredArticles?.length ?? 0) > 0) && (
        <section className="relative w-full py-16 px-4 sm:px-6 md:px-16 bg-[#0B0907] text-[#FCFAF6] overflow-hidden border-t border-white/5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Announcement */}
            {settings?.featuredAnnouncement && (
              <div className="flex flex-col gap-6 border border-white/10 p-8 rounded-3xl bg-white/5">
                <span className="font-sans text-sm font-extrabold tracking-[0.3em] text-[#DDB94E] uppercase">
                  Featured Announcement
                </span>
                {(() => {
                  const ann = announcements.find(a => a.id === settings.featuredAnnouncement);
                  if (!ann) return <p className="text-white/60 text-sm">Announcement not found.</p>;
                  return (
                    <>
                      <h3 className="font-serif text-3xl text-white">{ann.title}</h3>
                      <p className="font-sans text-white/80 leading-relaxed font-light line-clamp-3">{ann.content}</p>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Articles */}
            {settings?.featuredArticles && settings.featuredArticles.length > 0 && (
              <div className="flex flex-col gap-6">
                <span className="font-sans text-sm font-extrabold tracking-[0.3em] text-[#DDB94E] uppercase">
                  Featured Articles
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {settings.featuredArticles.map(articleId => {
                    const art = articles.find(a => a.id === articleId);
                    if (!art) return null;
                    return (
                      <Link key={art.id} href={`/${ACTIVE_EVENT_ID}/programme/articles/${art.slug}`} className="group flex flex-col gap-4 active-press">
                        {art.coverImageUrl && (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/5">
                            <Image src={art.coverImageUrl} alt={art.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-serif text-lg text-white group-hover:text-[#DDB94E] transition-colors">{art.title}</h4>
                          <span className="text-xs text-white/50 block mt-1">{art.author || "Editorial Board"}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          SCENE 5: PROGRAMME JOURNEY
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-20 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <div data-reveal className="lg:col-span-5 flex flex-col items-start gap-6 text-left">
            <span className="font-sans text-sm font-bold tracking-[0.3em] text-[#C25627] uppercase">
              FIVE DAYS IN HIS SANCTUARY
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#0B0907] uppercase leading-none">
              THE FIVE <br />
              <span className="text-[#C25627] font-normal font-serif">DAYS</span>
            </h2>
            
            {/* Countdown Accent Highlight */}
            {(settings?.showCountdown ?? true) && (
              <div className="flex items-center gap-3 mt-4 border-l border-[#C25627]/30 pl-4 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C25627] animate-pulse" />
                <span className="font-serif text-sm italic text-[#4A4032]">
                  We gather in <span className="text-3xl font-bold text-[#C25627] mx-1 align-middle leading-none">{daysLeft}</span> days.
                </span>
              </div>
            )}

            <Link
              href={`/${ACTIVE_EVENT_ID}/programme`}
              className="group inline-flex items-center gap-2 font-sans text-sm font-extrabold tracking-wider text-[#C25627] hover:text-[#0B0907] transition-all duration-300 mt-4 active-press"
            >
              <span className="border-b border-[#C25627] group-hover:border-black pb-0.5 uppercase">
                View Programme Schedule →
              </span>
            </Link>
          </div>

          {/* Unfolded Roadmap */}
          <div className="lg:col-span-7 flex flex-col w-full">
            {daysConfig.map((item, idx) => (
              <Link
                key={idx}
                href={`/${ACTIVE_EVENT_ID}/programme?day=${idx}`}
                data-reveal
                className="group flex flex-col sm:flex-row items-start gap-6 py-6 border-b border-black/10 hover:border-[#C25627]/20 transition-all duration-300 text-left active-press cursor-pointer block"
              >
                <div className="flex-shrink-0 w-auto min-w-[125px] sm:min-w-[145px]">
                  <span className="font-mono text-xs font-bold text-[#C25627] bg-[#C25627]/10 border border-[#C25627]/25 px-3 py-1 uppercase whitespace-nowrap rounded-xl">
                    {item.name.slice(0,3).toUpperCase()} · {item.date.split(",")[0].replace("August ", "AUG ")}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-normal text-[#0B0907] group-hover:text-[#C25627] transition-colors duration-300 uppercase">
                    {item.label} · {item.title}
                  </h3>
                  <p className="font-sans text-[#7A7062] text-sm font-light mt-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 6: MOMENTS OF ENCOUNTER (Rounded 2XL Corners on ALL pictures)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-20 bg-[#0B0907] text-[#FCFAF6] overflow-hidden border-t border-white/5">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-16 flex flex-col items-start text-left">
          
          <span className="font-sans text-sm font-bold tracking-[0.3em] text-[#C25627] uppercase mb-4">
            ENCOUNTER CHRONICLES
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-white uppercase tracking-tight mb-16">
            MOMENTS OF <span className="text-gradient-gold font-normal">ENCOUNTER</span>
          </h2>

          {/* Large photography spreads — Rounded 2XL Corners */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch w-full">
            
            <div data-reveal className="md:col-span-8 relative aspect-video w-full overflow-hidden border border-white/10 group bg-white/5 h-[240px] sm:h-[350px] md:h-auto active-press cursor-pointer rounded-2xl">
              <Image
                src="/pictures/Image 1.jpg"
                alt="Intensive worship moment"
                fill
                className="object-cover object-center scale-105 -translate-y-1 transition-transform duration-[1500ms] group-hover:scale-[1.08] filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 text-left max-w-md">
                <span className="font-mono text-xs text-[#DDB94E] tracking-widest uppercase">CONCENTRATED FIRE</span>
                <p className="font-serif text-lg italic text-white/90 font-light mt-1">
                  &ldquo;Deep worship moments fanning revival flames.&rdquo;
                </p>
              </div>
            </div>

            <div data-reveal className="md:col-span-4 relative aspect-[3/4] md:aspect-auto w-full overflow-hidden border border-white/10 group bg-white/5 h-[240px] sm:h-[350px] md:h-auto active-press cursor-pointer rounded-2xl">
              <Image
                src="/pictures/Image 12.jpg"
                alt="Worship crowd congregation"
                fill
                className="object-cover object-center scale-105 transition-transform duration-[1500ms] group-hover:scale-[1.08] filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 text-left">
                <span className="font-mono text-xs text-[#DDB94E] tracking-widest uppercase">CORPORATE ENCOUNTER</span>
                <p className="font-serif text-base italic text-white/90 font-light mt-1">
                  Over thousands in fellowship lines of praise.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 7: GALLERY PREVIEW (Collage — Rounded 2XL Corners on ALL pictures)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-32 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        
        <div className="relative z-10 max-w-7xl mx-auto text-center flex flex-col items-center">
          
          <span className="font-sans text-sm font-bold tracking-[0.3em] text-[#C25627] uppercase mb-4">
            IMAGING THE ENCOUNTER
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#0B0907] uppercase leading-none mb-16">
            IMMERSE <span className="text-[#C25627] font-normal font-serif">YOURSELF</span>
          </h2>

          {/* Overlapping collage layout — Rounded 2XL Corners */}
          <div className="flex flex-col md:grid md:grid-cols-12 gap-8 w-full items-center">
            
            {/* Image 5 */}
            <div data-reveal className="w-full md:col-span-4 relative aspect-video overflow-hidden border border-black/10 group bg-white md:rotate-[-2deg] transition-transform duration-500 hover:rotate-0 h-[180px] sm:h-[260px] md:h-auto shadow-md active-press cursor-pointer rounded-2xl">
              <Image
                src={settings?.featuredGalleryImages?.[0] || "/pictures/Image 5.jpg"}
                alt="Gallery preview 1"
                fill
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
              />
            </div>

            {/* Image 8 */}
            <div data-reveal className="w-full md:col-span-5 relative aspect-square overflow-hidden border border-black/10 group md:-translate-y-8 z-10 bg-white md:rotate-[1deg] transition-transform duration-500 hover:rotate-0 h-[220px] sm:h-[300px] md:h-auto shadow-lg active-press cursor-pointer rounded-2xl">
              <Image
                src={settings?.featuredGalleryImages?.[1] || "/pictures/Image 8.jpg"}
                alt="Gallery preview 2"
                fill
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
              />
            </div>

            {/* Image 9 & 12 offset stacks */}
            <div className="w-full md:col-span-3 flex flex-col gap-6">
              <div data-reveal className="relative aspect-[4/3] w-full overflow-hidden border border-black/10 group bg-white md:rotate-[3deg] transition-transform duration-500 hover:rotate-0 h-[160px] sm:h-[220px] md:h-auto shadow-md active-press cursor-pointer rounded-2xl">
                <Image
                  src={settings?.featuredGalleryImages?.[2] || "/pictures/Image 9.jpg"}
                  alt="Gallery preview 3"
                  fill
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                />
              </div>
              <div data-reveal className="relative aspect-[3/4] w-[90%] border border-black/10 group bg-white md:rotate-[-4deg] transition-transform duration-500 hover:rotate-0 self-center h-[200px] sm:h-[280px] md:h-auto shadow-md active-press cursor-pointer rounded-2xl overflow-hidden">
                <Image
                  src={settings?.featuredGalleryImages?.[3] || "/pictures/Image 12.jpg"}
                  alt="Gallery preview 4"
                  fill
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                />
              </div>
            </div>

          </div>

          <div data-reveal className="mt-16">
            <Link
              href={`/${ACTIVE_EVENT_ID}/gallery`}
              className="group inline-flex items-center gap-3 px-8 py-3.5 border border-black/15 hover:border-black/35 text-[#0B0907] font-sans font-bold text-xs tracking-widest uppercase transition-all duration-300 bg-black/5 hover:bg-black/10 rounded-full active-press"
            >
              <span>Explore Full Gallery →</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 8: COMMUNITY SECTION (Rounded 2XL Corners on ALL pictures)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-32 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left: Narrative */}
            <div data-reveal className="lg:col-span-5 flex flex-col items-start gap-6 text-left">
              <span className="font-sans text-sm font-bold tracking-[0.25em] text-[#C25627] uppercase">
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

            {/* Right: Overlapping image displays — Rounded 2XL Corners */}
            <div data-reveal className="lg:col-span-7 relative flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-0 h-auto sm:h-[450px] w-full">
              
              {/* Image 5 */}
              <div className="relative sm:absolute sm:left-0 w-full sm:w-[68%] aspect-video border border-black/10 z-10 shadow-2xl sm:rotate-[-2deg] overflow-hidden bg-white h-[220px] sm:h-auto active-press cursor-pointer rounded-2xl">
                <Image
                  src="/pictures/Image 5.jpg"
                  alt="Student fellowship"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Image 13 */}
              <div className="relative sm:absolute sm:right-0 w-full sm:w-[68%] aspect-video border border-black/10 z-20 shadow-2xl sm:translate-y-16 sm:rotate-[3deg] overflow-hidden bg-white h-[220px] sm:h-auto active-press cursor-pointer rounded-2xl">
                <Image
                  src="/pictures/Image 13.jpg"
                  alt="Friends gathering"
                  fill
                  className="object-cover"
                />
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 9: TESTIMONIES (Rounded 2XL Cards)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-28 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          
          <span className="font-sans text-sm font-bold tracking-[0.3em] text-[#C25627] uppercase block mb-3">
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
                className="p-8 border border-black/10 bg-white flex flex-col justify-between min-h-[220px] shadow-sm rounded-2xl active-press cursor-pointer hover:border-[#C25627]/40 transition-all"
              >
                <p className="font-serif text-base italic font-light text-zinc-700 leading-relaxed mb-6">
                  &ldquo;{test.quote}&rdquo;
                </p>
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#C25627] uppercase">
                    {test.name}
                  </h4>
                  <span className="font-sans text-sm text-zinc-500 tracking-wider uppercase mt-0.5 block">
                    {test.role}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 10: REGISTRATION CTA
          ═══════════════════════════════════════ */}
      {(settings?.showRegistrationButton ?? true) && (
        <section className="relative w-full py-24 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
          
          <div className="relative z-10 max-w-2xl mx-auto">
            
            <div data-reveal className="w-full border border-dashed border-[#DDB94E]/40 bg-[#15130F] text-white p-8 sm:p-12 md:p-16 flex flex-col items-center gap-6 text-center shadow-2xl relative rounded-3xl active-press">
              
              <span className="font-sans text-sm font-extrabold tracking-[0.3em] text-[#DDB94E] uppercase">
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
                  href={settings?.registrationLink || REGISTRATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-10 py-4 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs tracking-widest uppercase transition-all duration-300 rounded-full active-press shadow-lg"
                >
                  Register Now
                </a>
              </div>

            </div>

          </div>
        </section>
      )}

    </div>
  );
}
