/**
 * Gallery Index Page Component
 * Queries and displays the list of photo albums from Firestore via TanStack Query.
 */

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getAlbums } from "@/lib/firebase/gallery";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import seedAlbums from "@/lib/firebase/seedAlbums.json";
import { GalleryAlbum } from "@/types/gallery";

export default function GalleryPage() {
  const { data: albums = [], isLoading, error } = useQuery({
    queryKey: ["galleryAlbums", ACTIVE_EVENT_ID],
    queryFn: () => getAlbums(ACTIVE_EVENT_ID),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    initialData: () => (seedAlbums as GalleryAlbum[]).filter(
      (a) => a.eventId === ACTIVE_EVENT_ID && a.status === "published"
    ),
  });

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
        <div className="w-full h-[45dvh] min-h-[380px] bg-[#0B0907] flex flex-col justify-center pt-40 lg:pt-48 pb-24 px-6 md:px-16 border-b border-white/5" />
        <div className="max-w-7xl mx-auto w-full py-24 px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="aspect-video bg-zinc-200 border border-black/5" />
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
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[300px] bg-[#6B1D2A]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase">
            IMAGING THE ENCOUNTER
          </span>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-[85px] font-bold tracking-tight uppercase select-none leading-[0.95]">
            IMMERSE <br />
            <span className="text-gradient-gold font-normal font-serif">PORTAL</span>
          </h1>
          <p className="font-serif text-base sm:text-lg md:text-xl italic text-white/80 font-light max-w-2xl border-l border-primary/50 pl-6 mt-2">
            A curated collection of albums showcasing worship moments, fellowship captures, and legacy snapshots.
          </p>
        </div>
      </section>

      <section className="relative w-full pt-10 pb-28 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          {albums.length === 0 ? (
            <div className="py-32 text-center font-serif text-2xl italic text-zinc-400">
              No albums published for this event edition.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/gallery/${album.slug}`}
                  className="group w-full flex flex-col text-left border border-black/10 overflow-hidden bg-white transition-all duration-500 hover:border-[#C25627]/30 relative shadow-md hover:scale-[1.01] active-press cursor-pointer block"
                >
                  <div className="relative w-full aspect-video overflow-hidden">
                    <Image
                      src={album.coverImageUrl}
                      alt={album.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-65 pointer-events-none" />
                    
                    <span className="absolute top-4 right-4 font-mono text-[9px] font-bold tracking-widest text-[#E05320] bg-[#E05320]/15 border border-[#E05320]/25 px-2.5 py-0.5 uppercase z-10">
                      {album.photoCount} PHOTOS
                    </span>
                  </div>

                  <div className="p-8 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <h3 className="font-serif text-2xl font-normal text-[#0B0907] mt-1.5 uppercase leading-tight group-hover:text-[#C25627] transition-colors duration-300">
                        {album.title}
                      </h3>
                      <p className="font-sans text-xs text-zinc-500 font-light mt-3 leading-relaxed">
                        {album.description}
                      </p>
                    </div>
                    <span className="font-sans text-[10px] font-bold tracking-widest text-[#0B0907] group-hover:text-[#C25627] transition-colors uppercase mt-6 block">
                      [ OPEN ALBUM ]
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
