/**
 * FAQ Page Component
 * Renders a list of frequently asked questions loaded from Firestore with React Query caching.
 * Employs a single-expand accordion layout.
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFAQs } from "@/lib/firebase/faq";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: faqs = [], isLoading, error } = useQuery({
    queryKey: ["faqs", ACTIVE_EVENT_ID],
    queryFn: () => getFAQs(ACTIVE_EVENT_ID),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
  });

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
        <div className="w-full h-[45dvh] min-h-[380px] bg-[#0B0907] flex flex-col justify-center pt-36 pb-24 px-6 md:px-16 border-b border-white/5" />
        <div className="max-w-3xl mx-auto w-full py-28 px-6 flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white border border-black/5" />
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
      <section className="relative w-full h-[45dvh] min-h-[380px] flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-36 pb-24 px-6 md:px-16 border-b border-white/5">
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
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[300px] bg-[#E05320]/15 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase">
            COMMON INQUIRIES
          </span>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-[85px] font-bold tracking-tight uppercase select-none leading-[0.95]">
            QUESTIONS & <br />
            <span className="text-gradient-sunset font-normal font-serif">ANSWERS</span>
          </h1>
          <p className="font-serif text-base sm:text-lg md:text-xl italic text-white/80 font-light max-w-2xl border-l border-primary/50 pl-6 mt-2">
            Clear guidelines on registration guidelines, accommodation options, conference pricing, and venue locations.
          </p>
        </div>
      </section>

      <section className="relative w-full py-28 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto w-full">
          {faqs.length === 0 ? (
            <div className="py-24 text-center font-serif text-xl italic text-zinc-400">
              No questions found at this moment.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {faqs.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <div 
                    key={faq.id} 
                    className="border border-black/10 bg-white hover:border-[#C25627]/30 transition-colors duration-300 shadow-xs"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full flex items-center justify-between text-left p-6 font-serif text-lg md:text-xl text-[#0B0907] transition-colors duration-300 active-press select-none cursor-pointer"
                    >
                      <span className="pr-4 font-normal uppercase leading-tight">{faq.question}</span>
                      <ChevronDown 
                        className={`h-5 w-5 text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#C25627]" : ""}`} 
                      />
                    </button>
                    <div 
                      className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 border-t border-black/5" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div className="overflow-hidden">
                        <div className="p-6 font-sans text-sm text-[#7A7062] leading-relaxed font-light">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
