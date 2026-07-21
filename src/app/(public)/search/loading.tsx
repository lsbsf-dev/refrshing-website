/**
 * Search Loading Component
 * Minimalist shimmer skeleton for search page layout.
 */

import React from "react";

export default function SearchLoading() {
  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
      <div className="w-full h-[35dvh] min-h-[300px] bg-[#0B0907] flex flex-col justify-center pt-36 pb-20 px-6 md:px-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-start gap-4">
          <div className="h-3 w-28 bg-zinc-700 rounded-sm" />
          <div className="h-12 w-64 bg-zinc-800 rounded-sm" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto w-full py-12 px-6 flex flex-col gap-6">
        <div className="h-14 max-w-2xl bg-white border border-black/5" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-24 bg-zinc-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
