/**
 * Album Error Component
 * Fallback boundary for rendering dynamic gallery albums.
 */

"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function AlbumError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Gallery album rendering error:", error);
  }, [error]);

  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] items-center justify-center py-32 px-6">
      <div className="max-w-md text-center flex flex-col items-center gap-6">
        <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-[#E05320] uppercase">
          ALBUM EXCEPTION
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-light uppercase text-[#0B0907]">
          COULD NOT LOAD <br />
          <span className="text-[#C25627] font-normal">ALBUM</span>
        </h1>
        <p className="font-sans text-[#7A7062] text-sm font-light leading-relaxed">
          An error occurred while loading this gallery album. The requested album details might be offline.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <button
            onClick={() => reset()}
            className="font-sans text-xs font-bold tracking-widest uppercase bg-[#C25627] hover:bg-[#A8451D] text-white py-3 px-6 transition-all duration-300 active-press cursor-pointer"
          >
            TRY RE-LOADING
          </button>
          <Link
            href="/gallery"
            className="font-sans text-xs font-bold tracking-widest uppercase border border-black/10 hover:border-black/35 text-[#0B0907] py-3 px-6 transition-all duration-300 active-press"
          >
            GALLERY PORTAL
          </Link>
        </div>
      </div>
    </div>
  );
}
