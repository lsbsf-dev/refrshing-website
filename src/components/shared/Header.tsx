"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Menu, X, ChevronDown } from "lucide-react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editionDropdownOpen, setEditionDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scrolling on mobile when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Programme", href: "/programme" },
    { label: "Ministers", href: "/ministers" },
    { label: "Gallery", href: "/gallery" },
    { label: "Resources", href: "/resources" },
    { label: "Contact", href: "/contact" },
  ];

  const editions = ["2026", "2025", "2024"];

  const headerHeightClass = "h-20";
  const headerBackgroundClass = isScrolled
    ? "fixed top-0 left-0 right-0 z-50 w-full bg-white/95 border-b border-black/5 backdrop-blur-xs shadow-xs"
    : "fixed top-0 left-0 right-0 z-50 w-full bg-transparent border-transparent";

  const activeLinkClass = isScrolled
    ? "text-[#C25627] border-b border-[#C25627] font-semibold"
    : "text-[#DDB94E] border-b border-[#DDB94E] font-semibold";

  const defaultLinkClass = isScrolled
    ? "text-[#0B0907] hover:text-[#C25627] transition-colors py-1"
    : "text-white/80 hover:text-white transition-colors py-1";

  const iconColorClass = isScrolled
    ? "text-[#0B0907] hover:text-[#C25627] transition-colors"
    : "text-white/90 hover:text-white transition-colors";

  const switcherBorderClass = isScrolled
    ? "border-black/10 text-[#0B0907] hover:bg-black/5"
    : "border-white/20 text-white hover:bg-white/5";

  return (
    <header className={`flex items-center transition-all duration-300 ${headerBackgroundClass} ${headerHeightClass}`}>
      <div className="w-full max-w-7xl mx-auto px-6 md:px-16 flex items-center justify-between">
        
        {/* Left: Branding with local light backing plate to keep wordmark legible on dark hero */}
        <Link href="/" className="flex items-center">
          <div className="relative h-14 w-40 sm:h-16 sm:w-48 bg-white px-3 py-1.5 rounded-lg flex items-center justify-center shadow-sm hover:scale-[1.02] transition-transform duration-300">
            <div className="relative w-full h-full">
              <Image
                src="/refreshing-logo.png"
                alt="Refreshing 2026 Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`font-sans text-[15px] font-medium tracking-wide ${isActive ? activeLinkClass : defaultLinkClass}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Edition Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setEditionDropdownOpen(!editionDropdownOpen)}
              className={`flex items-center gap-1 font-sans text-xs font-semibold px-3 py-1.5 border transition-all rounded-lg ${switcherBorderClass}`}
            >
              <span>2026</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {editionDropdownOpen && (
              <div className="absolute right-0 mt-2 w-28 bg-white border border-black/10 shadow-2xl overflow-hidden z-50 rounded-lg">
                {editions.map((ed) => (
                  <button
                    key={ed}
                    onClick={() => {
                      setEditionDropdownOpen(false);
                    }}
                    className="w-full text-left font-sans text-xs text-[#0B0907] px-4 py-2 hover:bg-black/5 transition-colors"
                  >
                    Edition {ed}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Trigger */}
          <Link href="/search" className={iconColorClass}>
            <Search className="h-5 w-5" />
          </Link>

          {/* Register CTA */}
          <a
            href="https://forms.gle/DSW4CVMXWK61BHT96"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-xs font-semibold px-6 py-2.5 bg-[#C25627] hover:bg-[#E05320] text-white transition-all rounded-full"
          >
            Register
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center gap-4">
          <Link href="/search" className={iconColorClass}>
            <Search className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={iconColorClass}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 top-20 bg-[#FAF6EE]/98 backdrop-blur-md z-40 flex flex-col px-6 py-8 border-t border-black/5 overflow-y-auto animate-fade-in">
          <nav className="flex flex-col gap-5 text-left mb-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-sans text-lg font-semibold border-b border-black/5 pb-2 ${isActive ? "text-[#C25627]" : "text-[#0B0907]"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex flex-col gap-4 mt-auto">
            {/* Edition Switcher inside mobile drawer */}
            <div className="flex items-center justify-between px-2 py-3 border-y border-black/5">
              <span className="font-sans text-sm font-medium text-[#0B0907]/60">Select Edition</span>
              <select className="font-sans text-xs font-semibold bg-transparent border border-black/10 px-3 py-1.5 text-[#0B0907] outline-none rounded-md">
                {editions.map((ed) => (
                  <option key={ed} value={ed} className="bg-white text-[#0B0907]">Edition {ed}</option>
                ))}
              </select>
            </div>

            <a
              href="https://forms.gle/DSW4CVMXWK61BHT96"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center font-sans font-semibold py-3 bg-[#C25627] hover:bg-[#E05320] text-white transition-all rounded-full"
            >
              Register for the Program
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
