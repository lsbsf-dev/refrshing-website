"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const filteredImages = activeCategory === "All" 
    ? galleryList 
    : galleryList.filter(img => img.category === activeCategory);

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      
      {/* ═══════════════════════════════════════
          SCENE 1: GALLERY HERO (Centered & Balanced Height with staggered load animations)
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
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[300px] bg-[#6B1D2A]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase animate-hero-item delay-100">
            IMAGING THE ENCOUNTER
          </span>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-[85px] font-bold tracking-tight uppercase select-none leading-[0.95] animate-hero-item delay-200">
            IMMERSE <br />
            <span className="text-gradient-gold font-normal font-serif">PORTAL</span>
          </h1>
          <p className="font-serif text-base sm:text-lg md:text-xl italic text-white/80 font-light max-w-2xl border-l border-primary/50 pl-6 mt-2 animate-hero-item delay-300">
            A staggered masonry showcase of worship moments, fellowship captures, and legacy snapshots.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 2: FILTERS (Category Toggles - Light background, sharp buttons, tactile response)
          ═══════════════════════════════════════ */}
      <section className="relative w-full bg-[#FAF6EE] border-b border-black/5 py-6 px-6 md:px-16 overflow-hidden z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center overflow-x-auto gap-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 font-sans text-xs font-bold tracking-widest uppercase py-2.5 px-6 border transition-all duration-300 active-press ${
                activeCategory === cat 
                  ? "border-primary text-[#0B0907] bg-white shadow-sm font-semibold" 
                  : "border-black/10 text-zinc-500 hover:text-[#0B0907]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 3: STAGGERED MASONRY GRID (All 14 Images - Light background, sharp cards, tactile feedback)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-24 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden">
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Staggered masonry layout columns */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            
            {filteredImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxImage(img.src)}
                className="break-inside-avoid w-full flex flex-col text-left group border border-black/5 overflow-hidden bg-white transition-all duration-500 hover:border-[#C25627]/30 relative shadow-md hover:scale-[1.01] active-press cursor-pointer"
              >
                {/* Photo container */}
                <div className={`relative w-full overflow-hidden ${img.aspectClass}`}>
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-65 pointer-events-none" />
                  
                  {/* Category tag */}
                  <span className="absolute top-4 right-4 font-mono text-[9px] font-bold tracking-widest text-[#E05320] bg-[#E05320]/15 border border-[#E05320]/25 px-2 py-0.5 uppercase z-10">
                    {img.category}
                  </span>
                </div>

                {/* Description details */}
                <div className="p-6">
                  <span className="font-mono text-[9px] text-[#C25627] tracking-widest block uppercase font-semibold">
                    {img.edition} EDITION
                  </span>
                  <h3 className="font-serif text-lg font-normal text-[#0B0907] mt-1 uppercase leading-snug">
                    {img.title}
                  </h3>
                </div>
              </button>
            ))}

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          LIGHTBOX MODAL
          ═══════════════════════════════════════ */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <button className="absolute top-6 right-6 text-white hover:text-[#C25627] font-sans text-xs tracking-widest uppercase active-press">
            [ CLOSE PREVIEW ]
          </button>
          <div className="relative w-full max-w-5xl h-[80vh]">
            <Image
              src={lightboxImage}
              alt="Lightbox preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

    </div>
  );
}

const categories = ["All", "Sanctuary", "Fellowship", "Seminar", "Archival"];

const galleryList = [
  {
    src: "/pictures/Image 1.jpg",
    title: "Altar Cry of the Students",
    category: "Sanctuary",
    edition: "2024",
    aspectClass: "aspect-video"
  },
  {
    src: "/pictures/Image 2.jpg",
    title: "Praise & Spiritual Encounters",
    category: "Sanctuary",
    edition: "2024",
    aspectClass: "aspect-square"
  },
  {
    src: "/pictures/Image 3.jpg",
    title: "Hands Raised in Consecration",
    category: "Sanctuary",
    edition: "2025",
    aspectClass: "aspect-[3/4]"
  },
  {
    src: "/pictures/Image 4.jpg",
    title: "Leaders Devotional Strategy Brief",
    category: "Seminar",
    edition: "2025",
    aspectClass: "aspect-video"
  },
  {
    src: "/pictures/Image 5.jpg",
    title: "Fellowship Greetings & Joy",
    category: "Fellowship",
    edition: "2024",
    aspectClass: "aspect-square"
  },
  {
    src: "/pictures/Image 6.jpg",
    title: "Morning Expository Sermon",
    category: "Seminar",
    edition: "2025",
    aspectClass: "aspect-[3/4]"
  },
  {
    src: "/pictures/Image 7.jpg",
    title: "Q&A Discipleship Cohort Study",
    category: "Seminar",
    edition: "2024",
    aspectClass: "aspect-video"
  },
  {
    src: "/pictures/Image 8.jpg",
    title: "Evening Plenary Devotion",
    category: "Sanctuary",
    edition: "2025",
    aspectClass: "aspect-square"
  },
  {
    src: "/pictures/Image 9.jpg",
    title: "Corporate Devotion Gathering",
    category: "Sanctuary",
    edition: "2024",
    aspectClass: "aspect-video"
  },
  {
    src: "/pictures/Image 10.jpg",
    title: "Alumni Reunion Fellowship",
    category: "Fellowship",
    edition: "2024",
    aspectClass: "aspect-square"
  },
  {
    src: "/pictures/Image 11.jpg",
    title: "Lagos West Chapter Briefing",
    category: "Seminar",
    edition: "2025",
    aspectClass: "aspect-[3/4]"
  },
  {
    src: "/pictures/Image 12.jpg",
    title: "Intercessory Prayer Session",
    category: "Sanctuary",
    edition: "2025",
    aspectClass: "aspect-video"
  },
  {
    src: "/pictures/Image 13.jpg",
    title: "Fellowship Smile & Encounter",
    category: "Fellowship",
    edition: "2025",
    aspectClass: "aspect-square"
  },
  {
    src: "/pictures/Image 14.jpg",
    title: "Historic Camp Altar · 1986",
    category: "Archival",
    edition: "40TH REFLECTION",
    aspectClass: "aspect-[3/4]"
  }
];
