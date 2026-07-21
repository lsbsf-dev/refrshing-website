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
    { label: "Announcements", href: "/announcements" },
    { label: "Contact", href: "/contact" },
  ];

  const editions = ["2026"];

  const isMenuVisualDark = mobileMenuOpen || !isScrolled;

  const headerHeightClass = "lg:h-24 h-20";
  const headerBackgroundClass = mobileMenuOpen
    ? "fixed top-0 left-0 right-0 z-50 w-full bg-transparent border-transparent"
    : isScrolled
      ? "fixed top-0 left-0 right-0 z-50 w-full bg-white/95 border-b border-black/5 backdrop-blur-xs shadow-xs"
      : "fixed top-0 left-0 right-0 z-50 w-full bg-transparent border-transparent";

  const activeLinkClass = isScrolled
    ? "text-[#C25627] border-b border-[#C25627] font-semibold"
    : "text-[#DDB94E] border-b border-[#DDB94E] font-semibold";

  const defaultLinkClass = isScrolled
    ? "text-[#0B0907] hover:text-[#C25627] transition-colors py-1"
    : "text-white/80 hover:text-white transition-colors py-1";

  const iconColorClass = isMenuVisualDark
    ? "text-white/90 hover:text-white transition-colors"
    : "text-[#0B0907] hover:text-[#C25627] transition-colors";

  const switcherBorderClass = isMenuVisualDark
    ? "border-white/20 text-white hover:bg-white/5"
    : "border-black/10 text-[#0B0907] hover:bg-black/5";

  return (
    <header className={`flex items-center transition-all duration-300 ${headerBackgroundClass} ${headerHeightClass}`}>
      <div className="w-full max-w-7xl mx-auto px-6 md:px-16 flex items-center justify-between">
        
        {/* Left: Branding with local light backing plate - square shaped to fit the logo beautifully */}
        <Link href="/" className="flex items-center active-press">
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 lg:h-18 lg:w-18 bg-white p-2 rounded-lg flex items-center justify-center shadow-sm hover:scale-[1.02] transition-transform duration-300">
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
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 ml-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`font-sans text-[15px] font-medium tracking-wide active-press ${isActive ? activeLinkClass : defaultLinkClass}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          {/* Edition Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setEditionDropdownOpen(!editionDropdownOpen)}
              className={`flex items-center gap-1 font-sans text-xs font-semibold px-3 py-1.5 border transition-all rounded-lg active-press ${switcherBorderClass}`}
            >
              <span>2026</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {editionDropdownOpen && (
              <div className="absolute right-0 mt-2 w-28 bg-white border border-black/10 shadow-2xl overflow-hidden z-50 rounded-lg animate-fade-in">
                {editions.map((ed) => (
                  <button
                    key={ed}
                    onClick={() => {
                      setEditionDropdownOpen(false);
                    }}
                    className="w-full text-left font-sans text-xs text-[#0B0907] px-4 py-2 hover:bg-black/5 transition-colors active-press"
                  >
                    Edition {ed}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Trigger */}
          <Link href="/search" className={`active-press ${iconColorClass}`}>
            <Search className="h-5 w-5" />
          </Link>

          {/* Register CTA */}
          <a
            href="https://forms.gle/DSW4CVMXWK61BHT96"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-xs font-semibold px-6 py-2.5 bg-[#C25627] hover:bg-[#E05320] text-white transition-all rounded-full active-press"
          >
            Register
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center gap-4 z-50">
          <Link href="/search" className={`active-press ${iconColorClass}`}>
            <Search className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`active-press ${iconColorClass}`}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay - Full page dark glassy backdrop */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-[#0B0907]/90 backdrop-blur-md z-40 flex flex-col px-8 pt-28 pb-10 overflow-y-auto animate-fade-in text-white">
          <nav className="flex flex-col gap-5 text-left mb-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-sans text-lg font-semibold border-b border-white/10 pb-2 active-press ${isActive ? "text-[#DDB94E]" : "text-white/80"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex flex-col gap-4 mt-auto font-sans">
            {/* Edition Switcher inside mobile drawer */}
            <div className="flex items-center justify-between px-2 py-3 border-y border-white/10">
              <span className="font-sans text-sm font-medium text-white/60">Select Edition</span>
              <select className="font-sans text-xs font-semibold bg-transparent border border-white/20 px-3 py-1.5 text-white outline-none rounded-md">
                {editions.map((ed) => (
                  <option key={ed} value={ed} className="bg-[#0B0907] text-white">Edition {ed}</option>
                ))}
              </select>
            </div>

            <a
              href="https://forms.gle/DSW4CVMXWK61BHT96"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center font-sans font-semibold py-3 bg-[#C25627] hover:bg-[#E05320] text-white transition-all rounded-full active-press"
            >
              Register for the Program
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
