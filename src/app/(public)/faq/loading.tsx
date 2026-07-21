/**
 * FAQ Loading Component
 * Premium skeleton animation for page transition.
 */

import React from "react";

export default function FAQLoading() {
  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
      <div className="w-full h-[45dvh] min-h-[380px] bg-[#0B0907] flex flex-col justify-center pt-40 lg:pt-48 pb-24 px-6 md:px-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-start gap-4">
          <div className="h-3 w-32 bg-zinc-700 rounded-sm" />
          <div className="h-16 w-64 bg-zinc-800 rounded-sm" />
          <div className="h-6 w-96 bg-zinc-800 rounded-sm mt-4" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto w-full py-28 px-6 flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-white border border-black/5 rounded-none" />
        ))}
      </div>
    </div>
  );
}
