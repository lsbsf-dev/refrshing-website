"use client";

import Link from "next/link";

export default function BookletSlugError() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center bg-[#FAF6EE] px-4 sm:px-6 py-16 sm:py-24 text-center">
      <span className="font-sans text-sm font-bold tracking-widest text-[#C25627] uppercase block mb-4">
        CAMP GUIDE — ERROR
      </span>
      <h1 className="font-serif text-4xl font-light text-[#0B0907] uppercase mb-4">
        Section Not Available
      </h1>
      <p className="font-sans text-[#7A7062] text-sm mb-8">
        This section could not be loaded. Please try again or return to the Camp Guide.
      </p>
      <Link
        href="/booklet"
        className="font-sans text-xs font-bold tracking-widest text-white uppercase px-8 py-3 bg-[#C25627] hover:bg-[#A8451D] transition-colors active-press"
      >
        Back to Camp Guide
      </Link>
    </div>
  );
}
