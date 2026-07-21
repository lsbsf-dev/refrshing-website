/**
 * Session Details Loading Component
 * Premium shimmer loader skeleton.
 */

import React from "react";

export default function SessionLoading() {
  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
      <div className="w-full h-[40dvh] min-h-[340px] bg-[#0B0907] flex flex-col justify-center pt-40 lg:pt-48 pb-20 px-6 md:px-16 border-b border-white/5" />
      <div className="max-w-4xl mx-auto w-full py-24 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white border border-black/5" />
          ))}
        </div>
        <div className="h-64 bg-white border border-black/5" />
      </div>
    </div>
  );
}
