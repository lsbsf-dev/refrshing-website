/**
 * Custom 404 Not Found Page Component
 * Renders consistent editorial layout with hero backdrop.
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF6EE] text-[#0B0907]">
      <Header />
      <main className="flex-1 flex flex-col">
        {/* Dark Hero Section so Header links are 100% crisp & readable */}
        <section className="relative w-full h-[50dvh] min-h-[420px] flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-36 lg:pt-48 pb-20 px-4 sm:px-6 md:px-16 border-b border-white/5">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <Image
              src="/pictures/Image 3.jpg"
              alt="Sanctuary details background"
              fill
              className="object-cover object-center filter grayscale"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/40 to-[#0B0907]/80 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto w-full text-center flex flex-col items-center gap-4">
            <span className="font-mono text-sm font-bold tracking-[0.35em] text-[#DDB94E] uppercase">
              404 — PAGE NOT FOUND
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight uppercase leading-none text-white">
              LOOKING FOR <span className="text-gradient-gold font-normal">SOMETHING?</span>
            </h1>
            <p className="font-sans text-white/70 text-sm font-light leading-relaxed max-w-lg">
              The requested page is missing or has been relocated to another address. Please check your URL or navigate using the buttons below.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <Link
                href="/search"
                className="font-sans text-xs font-bold tracking-wider uppercase bg-[#C25627] hover:bg-[#E05320] text-white py-3.5 px-8 transition-all duration-300 rounded-full active-press shadow-md"
              >
                Search Website
              </Link>
              <Link
                href="/"
                className="font-sans text-xs font-bold tracking-wider uppercase border border-white/20 hover:border-white/50 text-white py-3.5 px-8 transition-all duration-300 rounded-full active-press"
              >
                Return Home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
