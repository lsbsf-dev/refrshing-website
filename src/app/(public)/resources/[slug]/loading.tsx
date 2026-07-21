/**
 * Resource Details Loading Component
 * Premium shimmer loading state.
 */

import React from "react";

export default function ResourceLoading() {
  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
      <div className="w-full h-[40dvh] min-h-[340px] bg-[#0B0907] flex flex-col justify-center pt-36 pb-20 px-6 md:px-16 border-b border-white/5" />
      <div className="max-w-3xl mx-auto w-full py-24 px-6 flex flex-col gap-6">
        <div className="h-4 w-48 bg-zinc-200" />
        <div className="h-6 w-96 bg-zinc-300" />
        <div className="h-[1px] w-full bg-zinc-300 my-4" />
        <div className="h-32 bg-white border border-black/5" />
      </div>
    </div>
  );
}
