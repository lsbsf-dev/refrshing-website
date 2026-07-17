import React from "react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white text-[#0B0907] border-t border-black/10 pt-20 pb-10">
      <div className="mx-auto w-full max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Column 1: Brand details */}
        <div className="flex flex-col gap-5">
          <div className="relative h-16 w-48 sm:h-20 sm:w-56">
            <Image
              src="/refreshing-logo.png"
              alt="Refreshing Logo"
              fill
              className="object-contain"
            />
          </div>

          <p className="font-sans text-xs text-zinc-600 leading-relaxed max-w-xs">
            Celebrating forty years of spiritual renewal, academic excellence, and student fellowship.
          </p>
          <div className="flex items-center gap-4 mt-2 text-zinc-400">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C25627] transition-colors">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C25627] transition-colors">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C25627] transition-colors">
              <svg className="h-4 w-4 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C25627] transition-colors">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Column 2: Explore links */}
        <div className="flex flex-col gap-4">
          <span className="font-sans text-[11px] font-extrabold tracking-widest text-[#0B0907]">EXPLORE</span>
          <div className="flex flex-col gap-2.5 font-sans text-xs">
            <Link href="/about" className="hover:text-[#C25627] text-zinc-600 transition-colors">About Refreshing</Link>
            <Link href="/programme" className="hover:text-[#C25627] text-zinc-600 transition-colors">Daily Programme</Link>
            <Link href="/ministers" className="hover:text-[#C25627] text-zinc-600 transition-colors">Featured Ministers</Link>
            <Link href="/gallery" className="hover:text-[#C25627] text-zinc-600 transition-colors">Photo Gallery</Link>
            <Link href="/resources" className="hover:text-[#C25627] text-zinc-600 transition-colors">Resource Library</Link>
          </div>
        </div>

        {/* Column 3: Information Links */}
        <div className="flex flex-col gap-4">
          <span className="font-sans text-[11px] font-extrabold tracking-widest text-[#0B0907]">INFORMATION</span>
          <div className="flex flex-col gap-2.5 font-sans text-xs">
            <Link href="/faq" className="hover:text-[#C25627] text-zinc-600 transition-colors">Frequently Asked Questions</Link>
            <Link href="/contact" className="hover:text-[#C25627] text-zinc-600 transition-colors">Venue & Directions</Link>
            <Link href="/admin/login" className="hover:text-[#C25627] text-zinc-600 transition-colors">Administrative Login</Link>
          </div>
        </div>

        {/* Column 4: Organized By Seal details */}
        <div className="flex flex-col gap-4">
          <span className="font-sans text-[11px] font-extrabold tracking-widest text-[#0B0907]">ORGANIZED BY</span>
          <div className="flex flex-col gap-4">
            {/* Big and sharp BSF Logo - removed circle border and opacity */}
            <div className="relative h-20 w-20 transition-transform hover:scale-105 duration-300">
              <Image
                src="/bsf-logo.png"
                alt="Lagos State Baptist Student Fellowship Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <p className="font-sans text-[10px] text-zinc-500 leading-relaxed">
              A program of Lagos State Baptist Student Fellowship, coordinating Lagos East, Lagos West, and Lagos Central chapters.
            </p>
          </div>
        </div>
      </div>
 
      {/* Bottom bar */}
      <div className="mx-auto w-full max-w-7xl px-6 border-t border-black/5 mt-16 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-[11px] text-zinc-500">
        <span>
          Copyright (c) {currentYear} LSBSF. All rights reserved.
        </span>
        <div className="flex items-center gap-2">
          <span>A Lagos State Baptist Student Fellowship Program</span>
          {/* Institutional green accent dot */}
          <span className="h-2 w-2 rounded-full bg-[#1E5631] inline-block shadow-sm" />
        </div>
      </div>
    </footer>
  );
}
