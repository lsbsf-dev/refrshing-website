/**
 * Album Loading Component
 * Shimmer layout for individual gallery albums.
 */

import React from "react";

export default function AlbumLoading() {
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
