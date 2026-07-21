/**
 * Custom 404 Not Found Page Component
 * Renders consistent editorial empty-state layouts.
 */

import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full flex-1 min-h-[70vh] flex flex-col bg-[#FAF6EE] text-[#0B0907] items-center justify-center py-32 px-6">
      <div className="max-w-md text-center flex flex-col items-center gap-6">
        <span className="font-mono text-[10px] font-bold tracking-[0.35em] text-[#E05320] uppercase animate-hero-item">
          404 ERROR
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light uppercase text-[#0B0907] leading-none select-none">
          PAGE NOT <br />
          <span className="text-[#C25627] font-normal">FOUNDED</span>
        </h1>
        <p className="font-sans text-[#7A7062] text-sm font-light leading-relaxed">
          The requested page is missing or has been relocated to another address. Please check your spelling or search below.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <Link
            href="/search"
            className="font-sans text-xs font-bold tracking-widest uppercase bg-[#C25627] hover:bg-[#A8451D] text-white py-3.5 px-7 transition-all duration-300 active-press"
          >
            SEARCH WEBSITE
          </Link>
          <Link
            href="/"
            className="font-sans text-xs font-bold tracking-widest uppercase border border-black/10 hover:border-black/35 text-[#0B0907] py-3.5 px-7 transition-all duration-300 active-press"
          >
            RETURN HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
