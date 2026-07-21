/**
 * Minister Details Loading Component
 * Premium shimmer skeleton loader for minister details page.
 */

import React from "react";

export default function MinisterLoading() {
  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAF6EE] text-[#0B0907] animate-pulse">
      <div className="w-full h-[40dvh] min-h-[340px] bg-[#0B0907] flex flex-col justify-center pt-36 pb-20 px-6 md:px-16 border-b border-white/5" />
      <div className="max-w-7xl mx-auto w-full py-24 px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5 aspect-[3/4] bg-zinc-200 border border-black/5" />
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="h-4 w-48 bg-zinc-200" />
          <div className="h-10 w-96 bg-zinc-300" />
          <div className="h-[1px] w-20 bg-zinc-300 my-2" />
          <div className="h-6 w-full bg-zinc-200" />
          <div className="h-6 w-[90%] bg-zinc-200" />
        </div>
      </div>
    </div>
  );
}
