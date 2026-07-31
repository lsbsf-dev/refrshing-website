"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { REGISTRATION_URL } from "@/lib/constants";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      setMoreDropdownOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const primaryNavLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Programme", href: "/programme" },
    { label: "Ministers", href: "/ministers" },
    { label: "Camp Guide", href: "/booklet" },
    { label: "Gallery", href: "/gallery" },
  ];

  const secondaryNavLinks = [
    { label: "Announcements", href: "/announcements" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ];

  const allNavLinks = [...primaryNavLinks, ...secondaryNavLinks];

  const isMenuVisualDark = mobileMenuOpen || !isScrolled;

  const headerHeightClass = "h-24 lg:h-32";
  const headerBackgroundClass = mobileMenuOpen
    ? "fixed top-0 left-0 right-0 z-50 w-full bg-transparent border-transparent"
    : isScrolled
      ? "fixed top-0 left-0 right-0 z-50 w-full bg-white/95 border-b border-black/10 backdrop-blur-md shadow-md transition-all duration-300"
      : "fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-b from-black/85 via-black/40 to-transparent border-transparent transition-all duration-300";

  const activeLinkClass = isScrolled
    ? "text-[#C25627] font-bold border-b-2 border-[#C25627]"
    : "text-[#DDB94E] font-bold border-b-2 border-[#DDB94E] drop-shadow-md";

  const defaultLinkClass = isScrolled
    ? "text-[#0B0907] hover:text-[#C25627] font-semibold transition-colors py-1"
    : "text-white hover:text-[#DDB94E] font-semibold transition-colors py-1 drop-shadow-sm";

  const iconColorClass = isMenuVisualDark
    ? "text-white hover:text-[#DDB94E] transition-colors drop-shadow-sm"
    : "text-[#0B0907] hover:text-[#C25627] transition-colors";

  return (
    <header className={`flex items-center ${headerBackgroundClass} ${headerHeightClass}`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
        
        {/* Left: Extra Large & Prominent Branding Logo */}
        <Link href="/" className="flex items-center active-press">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 bg-white p-1 sm:p-1.5 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/60 hover:scale-[1.05] transition-transform duration-300">
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

        {/* Center: Streamlined Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 ml-6">
          {primaryNavLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`font-sans text-base tracking-wide active-press ${isActive ? activeLinkClass : defaultLinkClass}`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* More Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              className={`flex items-center gap-1.5 font-sans text-base tracking-wide active-press cursor-pointer ${defaultLinkClass}`}
            >
              <span>More</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${moreDropdownOpen ? "rotate-180 text-[#C25627]" : ""}`} />
            </button>
            {moreDropdownOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white border border-black/10 shadow-2xl overflow-hidden z-50 rounded-2xl animate-fade-in p-2.5 flex flex-col gap-1">
                {secondaryNavLinks.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMoreDropdownOpen(false)}
                      className={`block font-sans text-xs px-4 py-3 rounded-xl transition-all duration-200 active-press ${
                        isActive
                          ? "bg-[#C25627]/10 text-[#C25627] font-bold"
                          : "text-[#0B0907] font-medium hover:bg-black/5 hover:text-[#C25627]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-6">
          {/* Search Trigger */}
          <Link href="/search" className={`active-press p-2.5 rounded-full hover:bg-white/10 transition-colors ${iconColorClass}`}>
            <Search className="h-6 w-6" />
          </Link>

          {/* Register CTA */}
          <a
            href={REGISTRATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-xs font-bold tracking-wider uppercase px-7 py-3 bg-[#C25627] hover:bg-[#E05320] text-white transition-all duration-300 rounded-full shadow-md hover:shadow-lg active-press"
          >
            Register
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center gap-3 z-50">
          <Link href="/search" className={`active-press p-2 ${iconColorClass}`}>
            <Search className="h-6 w-6" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`active-press p-2 ${iconColorClass}`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-[#0B0907]/95 backdrop-blur-lg z-40 flex flex-col px-6 pt-32 pb-8 overflow-y-auto animate-fade-in text-white">
          <nav className="flex flex-col gap-5 text-left mb-8">
            {allNavLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-sans text-lg font-medium border-b border-white/10 pb-3 active-press ${
                    isActive ? "text-[#DDB94E] font-bold" : "text-white/90"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex flex-col gap-4 mt-auto font-sans">
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center font-sans font-bold text-sm tracking-wider uppercase py-4 bg-[#C25627] hover:bg-[#E05320] text-white transition-all rounded-full active-press shadow-xl"
            >
              Register for the Program
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
