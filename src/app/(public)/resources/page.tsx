/**
 * Resources Library Index Page Component
 * Queries and filters publications, study guides, and outlines.
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getResources } from "@/lib/firebase/resources";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import seedResources from "@/lib/firebase/seedResources.json";
import { Resource } from "@/types/resource";

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: resources = [], isLoading, error } = useQuery({
    queryKey: ["resources", ACTIVE_EVENT_ID],
    queryFn: () => getResources(ACTIVE_EVENT_ID),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    initialData: () => (seedResources as Resource[]).filter(
      (r) => r.eventId === ACTIVE_EVENT_ID && r.status === "published"
    ),
  });

  const categories = ["All", "Bible Studies", "Devotionals", "Publications", "Downloads"];

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === "All") {
      return matchesSearch;
    }
    
    if (activeCategory === "Downloads") {
      return matchesSearch && (res.category === "Downloads" || res.category === "Presentation Slides" || res.category === "Session Notes");
    }

    return matchesSearch && res.category.toLowerCase() === activeCategory.toLowerCase();
  });

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
        <div className="w-full h-[45dvh] min-h-[380px] bg-[#0B0907] flex flex-col justify-center pt-40 lg:pt-48 pb-24 px-6 md:px-16 border-b border-white/5" />
        <div className="max-w-7xl mx-auto w-full py-24 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-zinc-200 border border-black/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    throw error;
  }

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      <section className="relative w-full h-[45dvh] min-h-[380px] flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-40 lg:pt-48 pb-24 px-6 md:px-16 border-b border-white/5">
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
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[300px] bg-[#C25627]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase">
            KNOWLEDGE AND SCRIPTURE PORTAL
          </span>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-[85px] font-bold tracking-tight uppercase select-none leading-[0.95]">
            RESOURCE <br />
            <span className="text-gradient-gold font-normal font-serif">LIBRARY</span>
          </h1>
          <p className="font-serif text-base sm:text-lg md:text-xl italic text-white/80 font-light max-w-2xl border-l border-primary/50 pl-6 mt-2">
            Access study guides, daily devotions outlines, tertiary governance handbooks, and media archives.
          </p>
        </div>
      </section>

      <section className="relative w-full bg-[#FAF6EE] border-b border-black/5 py-10 px-6 md:px-16 overflow-hidden z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          <div className="flex items-center justify-start overflow-x-auto gap-3 scrollbar-none pb-2 md:pb-0">
            {categories.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 font-sans text-xs font-semibold py-2 px-4 border transition-all duration-300 active-press cursor-pointer uppercase tracking-wider ${
                    isActive 
                      ? "border-primary bg-white text-[#0B0907] shadow-xs" 
                      : "border-transparent text-zinc-400 hover:text-zinc-700"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:max-w-xs flex-shrink-0">
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black/10 focus:border-[#C25627] text-[#0B0907] placeholder-zinc-400 text-xs font-sans py-3 pl-4 pr-10 outline-none transition-all duration-300"
            />
            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </section>

      <section className="relative w-full pt-8 pb-20 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          {filteredResources.length === 0 ? (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-4">
              <span className="font-serif text-2xl italic text-zinc-400">
                No matching resources found
              </span>
              <p className="font-sans text-zinc-500 text-xs font-light max-w-xs leading-relaxed">
                We couldn't find matches for your selection. Try clearing query filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((res) => (
                <div
                  key={res.id}
                  className="p-8 border border-black/5 bg-white flex flex-col justify-between min-h-[300px] shadow-md transition-all duration-300 hover:border-[#C25627]/20 hover:scale-[1.02] text-left active-press"
                >
                  <Link href={`/resources/${res.slug}`} className="block group flex-1 cursor-pointer">
                    <div className="flex items-center justify-between gap-4 font-mono text-[9px] text-[#C25627] tracking-wider uppercase font-semibold">
                      <span>{res.category}</span>
                      <span className="bg-black/5 px-2 py-0.5">ONLINE TEXT</span>
                    </div>

                    <h3 className="font-serif text-2xl font-light text-[#0B0907] uppercase mt-4 leading-tight group-hover:text-[#C25627] transition-colors duration-300">
                      {res.title}
                    </h3>

                    <p className="font-sans text-zinc-600 text-xs font-light leading-relaxed mt-4">
                      {res.description}
                    </p>
                  </Link>

                  <div className="flex items-center justify-between border-t border-black/5 pt-6 mt-8">
                    <span className="font-mono text-[10px] text-[#C25627] tracking-widest font-semibold">
                      BY {res.author.split(" ")[0]}
                    </span>
                    <Link
                      href={`/resources/${res.slug}`}
                      className="group inline-flex items-center gap-1.5 font-sans text-[10px] font-bold tracking-widest text-[#0B0907] hover:text-[#C25627] transition-all uppercase active-press"
                    >
                      <span className="border-b border-black/20 group-hover:border-[#C25627] pb-0.5">
                        READ ONLINE
                      </span>
                      <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                    </Link>
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
