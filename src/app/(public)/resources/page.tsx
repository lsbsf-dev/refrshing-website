"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredResources = resourceList.filter((res) => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || res.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      
      {/* ═══════════════════════════════════════
          SCENE 1: RESOURCES HERO (Opening the library - Centered & Balanced Height)
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
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[300px] bg-[#6B1D2A]/25 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase">
            DIGITAL BOOKLETS & FILES
          </span>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-[85px] font-bold tracking-tight uppercase select-none leading-[0.95]">
            THE <br />
            <span className="text-gradient-sunset font-normal font-serif">LIBRARY</span>
          </h1>
          <p className="font-serif text-base sm:text-lg md:text-xl italic text-white/80 font-light max-w-2xl border-l border-primary/50 pl-6 mt-2">
            Search and download devotionals, Bible Study outlines, and anniversary publications.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 2: SEARCH & FILTER BAR (Light background, sharp inputs & tabs, no rounded corners)
          ═══════════════════════════════════════ */}
      <section className="relative w-full bg-[#FAF6EE] border-b border-black/5 py-8 px-6 md:px-16 overflow-hidden z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          
          {/* Outlined Search Field - Sharp corners */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search resource titles or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black/10 focus:border-[#C25627] py-3 px-5 text-sm text-[#0B0907] outline-none transition-colors font-sans rounded-none shadow-xs"
            />
          </div>

          {/* Filter Pills - Sharp corners */}
          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`font-sans text-xs font-semibold px-5 py-2.5 transition-all duration-300 ${
                    isActive 
                      ? "bg-[#C25627] text-white font-bold shadow-md" 
                      : "bg-black/5 text-[#0B0907]/60 hover:text-[#0B0907] hover:bg-black/10"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 3: RESOURCE LISTING (Light background, sharp cards, no glow)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-28 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden">
        
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          {filteredResources.length === 0 ? (
            <div className="py-24 text-center font-serif text-2xl italic text-zinc-400">
              No digital files match your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((res, idx) => (
                <div
                  key={idx}
                  className="p-8 border border-black/5 bg-white flex flex-col justify-between min-h-[300px] shadow-md transition-all duration-300 hover:border-[#C25627]/20 hover:scale-[1.02] text-left"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 font-mono text-[9px] text-[#C25627] tracking-wider uppercase font-semibold">
                      <span>{res.category}</span>
                      <span className="bg-black/5 px-2 py-0.5">{res.format}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-2xl font-light text-[#0B0907] uppercase mt-4 leading-tight">
                      {res.title}
                    </h3>

                    {/* Description */}
                    <p className="font-sans text-zinc-600 text-xs font-light leading-relaxed mt-4">
                      {res.description}
                    </p>
                  </div>

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between border-t border-black/5 pt-6 mt-8">
                    <span className="font-mono text-[10px] text-[#C25627] tracking-widest font-semibold">{res.size}</span>
                    <a
                      href={res.downloadUrl}
                      className="group inline-flex items-center gap-1.5 font-sans text-[10px] font-bold tracking-widest text-[#0B0907] hover:text-[#C25627] transition-all uppercase"
                    >
                      <span className="border-b border-black/20 group-hover:border-[#C25627] pb-0.5">
                        DOWNLOAD FILE
                      </span>
                      <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    </a>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

const categories = ["All", "Study Outlines", "Devotionals", "Publications"];

const resourceList = [
  {
    title: "The Greater Glory Study Guide",
    category: "Study Outlines",
    format: "PDF DOCUMENT",
    size: "1.4 MB",
    description: "The official interactive study outline booklet for Wednesday and Thursday seminar tracks.",
    downloadUrl: "#"
  },
  {
    title: "40th Anniversary Remembrance Devotional",
    category: "Devotionals",
    format: "EBOOK EPUB",
    size: "4.8 MB",
    description: "Thirty days of reflective scriptural devotionals compiled by Lagos State BSF alumni coordinators.",
    downloadUrl: "#"
  },
  {
    title: "Campus Leaders Handbook",
    category: "Publications",
    format: "PDF DOCUMENT",
    size: "2.1 MB",
    description: "Orientation guides, deployment checklists, and organizational charts for Lagos East, West, and Central chapters.",
    downloadUrl: "#"
  },
  {
    title: "Isaiah 52 Expository Lectures Outline",
    category: "Study Outlines",
    format: "DOCX FILE",
    size: "820 KB",
    description: "Sermon outlines and background references for Dr. Helen Adeyemi's discipleship study classes.",
    downloadUrl: "#"
  },
  {
    title: "Covenant Seeds Daily Devotional Guide",
    category: "Devotionals",
    format: "PDF DOCUMENT",
    size: "3.2 MB",
    description: "Selected morning devotion readings on building prayer altars and managing campus ministry teams.",
    downloadUrl: "#"
  }
];
