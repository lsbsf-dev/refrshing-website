/**
 * Gallery Album Page Component
 * Renders photos of a specific album loaded from Firestore.
 */

"use client";

import React, { useState, use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAlbumBySlug, getPhotos } from "@/lib/firebase/gallery";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import { logAnalyticsEvent } from "@/lib/analytics";

export default function GallerySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const { data: album, isLoading: loadingAlbum, error } = useQuery({
    queryKey: ["galleryAlbum", ACTIVE_EVENT_ID, resolvedParams.slug],
    queryFn: () => getAlbumBySlug(ACTIVE_EVENT_ID, resolvedParams.slug),
    staleTime: 6 * 60 * 60 * 1000,
  });

  useEffect(() => {
    if (album) {
      logAnalyticsEvent({
        category: "Engagement",
        action: "view_album",
        label: album.title,
      });
    }
  }, [album]);

  const { data: photos = [], isLoading: loadingPhotos } = useQuery({
    queryKey: ["photos", ACTIVE_EVENT_ID, album?.id],
    queryFn: () => getPhotos(ACTIVE_EVENT_ID, album?.id || ""),
    enabled: !!album?.id,
    staleTime: 6 * 60 * 60 * 1000,
  });

  if (loadingAlbum) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
        <div className="w-full h-[45dvh] min-h-[380px] bg-[#0B0907] flex flex-col justify-center pt-40 lg:pt-48 pb-24 px-6 md:px-16 border-b border-white/5" />
        <div className="max-w-7xl mx-auto w-full py-24 px-6">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-zinc-200 border border-black/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    throw error;
  }

  if (!album) {
    notFound();
  }

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      <section className="relative w-full h-[45dvh] min-h-[380px] flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-40 lg:pt-48 pb-24 px-6 md:px-16 border-b border-white/5">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Image
            src={album.coverImageUrl}
            alt={album.title}
            fill
            className="object-cover object-center filter grayscale"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/30 to-[#0B0907]/80 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <Link 
            href="/gallery"
            className="flex items-center gap-1 font-sans text-[10px] font-extrabold tracking-[0.2em] text-[#DDB94E] uppercase hover:text-white transition-colors mb-2"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Gallery
          </Link>
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase">
            ALBUM EXPLORE
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight uppercase select-none leading-none">
            {album.title.split(" ")[0]} <span className="text-gradient-gold font-normal font-serif">{album.title.split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="font-serif text-base sm:text-lg italic text-white/80 font-light max-w-2xl border-l border-primary/50 pl-6 mt-2">
            {album.description}
          </p>
        </div>
      </section>

      <section className="relative w-full py-24 px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907]">
        <div className="relative z-10 max-w-7xl mx-auto">
          {loadingPhotos ? (
            <div className="py-24 text-center font-serif text-xl italic text-zinc-400">
              Syncing photos...
            </div>
          ) : photos.length === 0 ? (
            <div className="py-24 text-center font-serif text-xl italic text-zinc-400">
              No photos in this album yet.
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setLightboxImage(photo.url)}
                  className="break-inside-avoid w-full flex flex-col text-left group border border-black/5 overflow-hidden bg-white transition-all duration-500 hover:border-[#C25627]/30 relative shadow-md hover:scale-[1.01] active-press cursor-pointer"
                >
                  <div className="relative w-full overflow-hidden aspect-video">
                    <Image
                      src={photo.url}
                      alt={photo.altText}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-65 pointer-events-none" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-lg font-normal text-[#0B0907] uppercase leading-snug">
                      {photo.altText}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-pointer"
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


