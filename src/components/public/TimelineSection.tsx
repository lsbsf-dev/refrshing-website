"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getTimelineEntries, TimelineEntry } from "@/lib/firebase/cms";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export function TimelineSection() {
  const { data: timeline = [], isLoading } = useQuery({
    queryKey: ["public", "timeline"],
    queryFn: () => getTimelineEntries(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#C25627]" />
      </div>
    );
  }

  const publishedTimeline = timeline.filter(t => t.status === 'published');

  if (publishedTimeline.length === 0) return null;

  return (
    <section className="relative w-full py-20 px-4 sm:px-6 md:px-16 bg-white text-[#0B0907] border-t border-black/5">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-sans text-sm font-bold tracking-[0.3em] text-[#C25627] uppercase block mb-3">
            OUR JOURNEY
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#0B0907] uppercase leading-none">
            Historic <span className="text-[#C25627] font-normal font-serif">Timeline</span>
          </h2>
        </div>

        <div className="relative border-l-2 border-black/10 ml-4 md:ml-1/2 md:translate-x-1/2 space-y-12 pb-8">
          {publishedTimeline.map((item, idx) => (
            <div key={item.id} className="relative pl-8 md:pl-0">
              <div className="absolute -left-[9px] md:left-[-9px] top-1 h-4 w-4 bg-white border-2 border-[#C25627] rounded-full z-10" />
              
              <div className="md:w-1/2 md:-ml-[50%] md:pr-12 md:text-right">
                <span className="font-mono text-xl font-bold text-[#C25627] block mb-2">{item.year}</span>
                <h3 className="font-serif text-2xl font-semibold mb-3">{item.title}</h3>
                <p className="font-sans text-zinc-600 text-sm leading-relaxed font-light whitespace-pre-wrap">
                  {item.description}
                </p>
                {item.photoUrl && (
                  <div className="mt-4 relative w-full h-48 md:w-64 md:ml-auto rounded-xl overflow-hidden border border-black/10 shadow-sm">
                    <Image src={item.photoUrl} alt={item.title} fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
