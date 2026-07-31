"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { REGISTRATION_URL } from "@/lib/constants";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const headerHeightClass = "h-20 lg:h-24";
  const headerBackgroundClass = mobileMenuOpen
    ? "fixed top-0 left-0 right-0 z-50 w-full bg-transparent border-transparent"
    : isScrolled
      ? "fixed top-0 left-0 right-0 z-50 w-full bg-white/95 border-b border-black/5 backdrop-blur-md shadow-sm"
      : "fixed top-0 left-0 right-0 z-50 w-full bg-transparent border-transparent";

  const activeLinkClass = isScrolled
    ? "text-[#C25627] font-semibold border-b-2 border-[#C25627]"
    : "text-[#DDB94E] font-semibold border-b-2 border-[#DDB94E]";

  const defaultLinkClass = isScrolled
    ? "text-[#0B0907]/90 hover:text-[#C25627] transition-colors py-1"
    : "text-white/85 hover:text-white transition-colors py-1";

  const iconColorClass = isMenuVisualDark
    ? "text-white/90 hover:text-white transition-colors"
    : "text-[#0B0907] hover:text-[#C25627] transition-colors";

  return (
    <header className={`flex items-center transition-all duration-300 ${headerBackgroundClass} ${headerHeightClass}`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
        
        {/* Left: Branding Logo (Rounded corners) */}
        <Link href="/" className="flex items-center active-press">
          <div className="relative h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-white p-2 rounded-xl flex items-center justify-center shadow-sm hover:scale-[1.02] transition-transform duration-300">
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
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 ml-4">
          {primaryNavLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`font-sans text-sm font-medium tracking-wide active-press ${isActive ? activeLinkClass : defaultLinkClass}`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* More Dropdown */}
          <div className="relative" onMouseLeave={() => setMoreDropdownOpen(false)}>
            <button
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              className={`flex items-center gap-1 font-sans text-sm font-medium tracking-wide active-press ${defaultLinkClass}`}
            >
              <span>More</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {moreDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-black/10 shadow-2xl overflow-hidden z-50 rounded-xl animate-fade-in p-1.5">
                {secondaryNavLinks.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMoreDropdownOpen(false)}
                      className={`block font-sans text-xs px-3.5 py-2.5 rounded-lg transition-colors active-press ${
                        isActive
                          ? "bg-[#C25627]/10 text-[#C25627] font-semibold"
                          : "text-[#0B0907] hover:bg-black/5"
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
        <div className="hidden lg:flex items-center gap-4 xl:gap-5">
          {/* Search Trigger */}
          <Link href="/search" className={`active-press p-2 rounded-full hover:bg-white/10 transition-colors ${iconColorClass}`}>
            <Search className="h-5 w-5" />
          </Link>

          {/* Register CTA */}
          <a
            href={REGISTRATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-xs font-bold tracking-wider uppercase px-6 py-2.5 bg-[#C25627] hover:bg-[#E05320] text-white transition-all duration-300 rounded-full shadow-sm hover:shadow-md active-press"
          >
            Register
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center gap-3 z-50">
          <Link href="/search" className={`active-press p-2 ${iconColorClass}`}>
            <Search className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`active-press p-2 ${iconColorClass}`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-[#0B0907]/95 backdrop-blur-lg z-40 flex flex-col px-6 pt-24 pb-8 overflow-y-auto animate-fade-in text-white">
          <nav className="flex flex-col gap-4 text-left mb-8">
            {allNavLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-sans text-lg font-medium border-b border-white/10 pb-2.5 active-press ${
                    isActive ? "text-[#DDB94E] font-semibold" : "text-white/85"
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
              className="w-full text-center font-sans font-bold text-sm tracking-wider uppercase py-3.5 bg-[#C25627] hover:bg-[#E05320] text-white transition-all rounded-full active-press shadow-lg"
            >
              Register for the Program
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
