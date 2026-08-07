import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HomepageBlock } from "@/lib/firebase/cms";
import { Minister } from "@/types/minister";
import { Announcement } from "@/types/announcement";

export function HomepageBlockRenderer({ 
  block, 
  ministers, 
  announcements, 
  articles,
  eventId
}: { 
  block: HomepageBlock, 
  ministers: Minister[], 
  announcements: Announcement[], 
  articles: any[],
  eventId: string
}) {
  
  if (!block.enabled) return null;

  switch (block.type) {
    case "hero":
      return (
        <section className="relative w-full h-[100dvh] min-h-[650px] hero-landscape flex flex-col justify-between overflow-hidden bg-[#0B0907] text-[#FCFAF6] pt-24 pb-8">
          <div className="absolute inset-0 w-full h-full opacity-55 pointer-events-none z-0">
            <Image
              src={block.config.heroBackgroundImageUrl || "/pictures/Image 3.jpg"}
              alt="Hero Backdrop"
              fill
              priority
              className="object-cover object-[50%_65%] scale-[1.03] animate-slow-zoom"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/15 to-[#0B0907]/75 pointer-events-none z-1" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] light-smokey-glow pointer-events-none z-1" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] light-smokey-glow pointer-events-none z-1" />

          {/* Dynamic Image Collage - Rounded 2XL Corners */}
          <div className="absolute inset-y-0 right-12 lg:right-28 hidden md:flex flex-col justify-center items-end gap-0 z-10 w-72 pointer-events-none select-none">
            <div className="relative aspect-[3/4] w-56 border border-white/10 shadow-2xl rotate-[3deg] overflow-hidden bg-white/5 z-20 rounded-2xl">
              <Image src="/pictures/Image 6.jpg" alt="Hero detail" fill className="object-cover object-top scale-110 -translate-y-2 filter saturate-[0.85] brightness-95" />
            </div>
            <div className="relative aspect-[4/3] w-48 border border-white/10 shadow-xl -translate-x-24 -translate-y-12 rotate-[-6deg] overflow-hidden bg-white/5 z-10 rounded-2xl">
              <Image src="/pictures/Image 11.jpg" alt="Hero detail" fill className="object-cover object-center scale-110 filter saturate-[0.9]" />
            </div>
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-16 flex-1 flex flex-col justify-center items-start gap-4">
            <span className="font-sans text-sm font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase animate-hero-item delay-100">
              LAGOS STATE BAPTIST STUDENT FELLOWSHIP PRESENTS
            </span>
            <h1 className="font-serif text-2xl xs:text-4xl sm:text-6xl md:text-[95px] lg:text-[115px] font-bold tracking-tight leading-[0.95] text-white uppercase select-none animate-hero-item delay-200">
              {block.config.heroTitle ? (
                block.config.heroTitle.split(" ").map((word: string, i: number) => (
                  <span key={i} className="text-gradient-gold block font-serif">{word}</span>
                ))
              ) : (
                <><span className="text-gradient-gold block font-serif">THE GREATER</span><span className="text-gradient-gold block font-serif">GLORY</span></>
              )}
            </h1>
            <div className="max-w-xl border-l-2 border-[#C25627] pl-4 sm:pl-6 my-2 animate-hero-item delay-300">
              <p className="font-serif text-sm sm:text-base md:text-lg italic text-white/95 leading-relaxed font-light">
                {block.config.heroSubtitle || "“The glory of this present house will be greater than the glory of the former house,” says the Lord Almighty."}
              </p>
            </div>
          </div>
        </section>
      );

    case "anniversary":
      const now = new Date().getTime();
      const start = block.config.displayStart ? new Date(block.config.displayStart).getTime() : 0;
      const end = block.config.displayEnd ? new Date(block.config.displayEnd).getTime() : Infinity;
      if (now < start || now > end) return null;

      return (
        <section className="relative w-full py-16 px-4 sm:px-6 md:px-16 bg-[#0B0907] text-[#FCFAF6] overflow-hidden border-t border-[#C25627]/20 flex items-center justify-center min-h-[300px]">
          {block.config.backgroundImageUrl && (
            <div className="absolute inset-0 opacity-30">
              <Image src={block.config.backgroundImageUrl} alt="Anniversary Background" fill className="object-cover" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-4">
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase text-gradient-gold">
              {block.config.title}
            </h2>
            {block.config.subtitle && (
              <p className="font-sans text-lg sm:text-xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed italic">
                {block.config.subtitle}
              </p>
            )}
          </div>
        </section>
      );

    case "featured_ministers":
      const displayedMinisters = ministers.filter(m => block.config.ministerIds?.includes(m.id));
      if (displayedMinisters.length === 0) return null;

      return (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayedMinisters.map((min) => (
                <Link key={min.id} href={`/${eventId}/ministers/${min.slug}`} className="group flex flex-col bg-white border border-black/10 rounded-2xl overflow-hidden hover:border-[#C25627]/40 hover:shadow-xl transition-all duration-300 p-5 active-press">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#0B0907] flex-shrink-0 border border-black/10">
                      <Image src={encodeURI(min.photoUrl || "/pictures/Image 6.jpg")} alt={min.name} fill className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                    <div className="flex flex-col text-left justify-center flex-1">
                      <span className="font-sans text-[10px] font-extrabold tracking-widest text-[#C25627] uppercase bg-[#C25627]/10 px-2.5 py-0.5 rounded-full w-fit mb-1">
                        {min.category === "music" ? "GOSPEL MUSIC" : "SPEAKER"}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#0B0907] group-hover:text-[#C25627] transition-colors leading-snug">{min.name}</h3>
                      <span className="font-sans text-xs font-bold text-[#C25627] uppercase mt-2 flex items-center gap-1">View Profile →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      );

    case "gallery":
      if (!block.config.images || block.config.images.length === 0) return null;
      return (
        <section className="relative w-full py-32 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden border-t border-black/5">
          <div className="relative z-10 max-w-7xl mx-auto text-center flex flex-col items-center">
            <span className="font-sans text-sm font-bold tracking-[0.3em] text-[#C25627] uppercase mb-4">IMAGING THE ENCOUNTER</span>
            <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#0B0907] uppercase leading-none mb-16">
              IMMERSE <span className="text-[#C25627] font-normal font-serif">YOURSELF</span>
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {block.config.images.map((img: string, idx: number) => (
                <div key={idx} className="relative aspect-video w-64 md:w-80 overflow-hidden rounded-2xl shadow-md border border-black/10 hover:scale-105 transition-transform cursor-pointer">
                  <Image src={img} alt="Gallery" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "rich_text":
      return (
        <section className="relative w-full py-16 px-4 sm:px-6 md:px-16 bg-white text-[#0B0907] border-t border-black/5">
          <div 
            className="max-w-4xl mx-auto prose prose-zinc lg:prose-xl" 
            dangerouslySetInnerHTML={{ __html: block.config.contentHtml }} 
          />
        </section>
      );

    default:
      return null;
  }
}
