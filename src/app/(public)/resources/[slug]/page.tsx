/**
 * Resource Editorial Reader Page Component
 * Loads long-form editorial content from Firestore.
 */

"use client";

import React, { use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Book, User, Calendar, ChevronLeft, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getResourceBySlug } from "@/lib/firebase/resources";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import { logAnalyticsEvent } from "@/lib/analytics";

export default function ResourceSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);

  const { data: resource, isLoading, error } = useQuery({
    queryKey: ["resource", ACTIVE_EVENT_ID, resolvedParams.slug],
    queryFn: () => getResourceBySlug(ACTIVE_EVENT_ID, resolvedParams.slug),
    staleTime: 6 * 60 * 60 * 1000,
  });

  useEffect(() => {
    if (resource) {
      logAnalyticsEvent({
        category: "Resources",
        action: "view_resource",
        label: resource.title,
      });
    }
  }, [resource]);

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
        <div className="w-full h-[40dvh] min-h-[340px] bg-[#0B0907] flex flex-col justify-center pt-40 lg:pt-48 pb-20 px-6 md:px-16 border-b border-white/5" />
        <div className="max-w-3xl mx-auto w-full py-24 px-6 flex flex-col gap-6">
          <div className="h-4 w-48 bg-zinc-200" />
          <div className="h-6 w-96 bg-zinc-300" />
        </div>
      </div>
    );
  }

  if (error) {
    throw error;
  }

  if (!resource) {
    notFound();
  }

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      <section className="relative w-full h-[40dvh] min-h-[340px] flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-40 lg:pt-48 pb-20 px-6 md:px-16 border-b border-white/5">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <Image
            src="/pictures/Image 3.jpg"
            alt="Resource background"
            fill
            className="object-cover object-center filter grayscale"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/30 to-[#0B0907]/80 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <Link 
            href="/resources"
            className="flex items-center gap-1 font-sans text-[10px] font-extrabold tracking-[0.2em] text-[#DDB94E] uppercase hover:text-white transition-colors mb-2"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Library
          </Link>
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase">
            {resource.category}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight uppercase select-none leading-none">
            {resource.title}
          </h1>
        </div>
      </section>

      <section className="relative w-full py-24 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907]">
        <div className="relative z-10 max-w-3xl mx-auto">
          
          <div className="flex flex-wrap items-center gap-6 border-b border-black/5 pb-8 mb-10 text-[#7A7062] font-mono text-[10px] tracking-wider uppercase font-semibold">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#C25627]" />
              <span>BY {resource.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#C25627]" />
              <span>PUBLISHED {new Date(resource.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <article className="prose max-w-none font-sans text-zinc-700 text-sm md:text-base leading-relaxed font-light space-y-6">
            <p>{resource.description}</p>
          </article>

          {resource.fileUrl && (
            <div className="mt-12 border-t border-black/5 pt-10 text-center">
              <a
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#C25627] hover:bg-[#A8451D] text-white font-sans font-bold text-xs tracking-widest uppercase py-4 px-8 transition-colors duration-300 active-press cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download Resource File
              </a>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}


