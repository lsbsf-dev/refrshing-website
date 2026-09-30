/**
 * @file ScrollableTabBar.tsx
 * @description Horizontal scrollable tab bar component for category navigation.
 */

"use client";


import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScrollableTabBarProps {
  children: React.ReactNode;
  className?: string;
  isDark?: boolean;
}

export function ScrollableTabBar({ children, className = "", isDark = false }: ScrollableTabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener("scroll", updateScrollState, { passive: true });

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);

  const scrollLeft = () => {
    containerRef.current?.scrollBy({ left: -(containerRef.current.offsetWidth * 0.75), behavior: "smooth" });
  };

  const scrollRight = () => {
    containerRef.current?.scrollBy({ left: containerRef.current.offsetWidth * 0.75, behavior: "smooth" });
  };

  const arrowBase = "shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C25627]";

  const arrowActive = "bg-black/[0.08] hover:bg-black/[0.15] text-[#7A7062] hover:text-[#0B0907] dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/60 dark:hover:text-white/90 cursor-pointer";

  const arrowDisabled = "opacity-0 pointer-events-none cursor-default";

  return (
    <div className="relative flex items-center w-full min-w-0 max-w-full">
      {/* Left arrow — disabled attribute removes it from tab order and blocks
          Enter/Space keyboard activation entirely */}
      <button
        disabled={!canScrollLeft}
        aria-hidden={!canScrollLeft}
        aria-label="Scroll left"
        onClick={scrollLeft}
        className={`${arrowBase} ${canScrollLeft ? arrowActive : arrowDisabled}`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Left edge fade mask — only when there's content to the left */}
      {canScrollLeft && (
        <div className="absolute left-[44px] top-0 bottom-0 w-8 pointer-events-none z-10 bg-gradient-to-r from-[#F7F4EE] dark:from-[#0B0907] to-transparent" />
      )}

      {/* Scrollable content */}
      <div
        ref={containerRef}
        className={`flex-1 flex items-center overflow-x-auto scrollbar-hide ${className}`}
      >
        {children}
      </div>

      {/* Right edge fade mask — only when there's content to the right */}
      {canScrollRight && (
        <div className="absolute right-[44px] top-0 bottom-0 w-8 pointer-events-none z-10 bg-gradient-to-l from-[#F7F4EE] dark:from-[#0B0907] to-transparent" />
      )}

      {/* Right arrow */}
      <button
        disabled={!canScrollRight}
        aria-hidden={!canScrollRight}
        aria-label="Scroll right"
        onClick={scrollRight}
        className={`${arrowBase} ${canScrollRight ? arrowActive : arrowDisabled}`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
