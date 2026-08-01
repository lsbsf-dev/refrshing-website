"use client";

/**
 * ScrollableTabBar
 * Wraps a horizontal strip of tab/filter buttons with left/right arrow affordance.
 * Arrows appear only when there is scrollable content in that direction.
 * Arrows are fully inert (disabled + opacity-0 + pointer-events-none) at scroll edges
 * — they are invisible, unreachable by Tab, and cannot be activated by keyboard or mouse.
 *
 * Usage:
 *   <ScrollableTabBar className="gap-3">
 *     <button>Tab A</button>
 *     <button>Tab B</button>
 *   </ScrollableTabBar>
 *
 * For the admin portal dark theme, pass isDark={true}.
 */

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScrollableTabBarProps {
  children: React.ReactNode;
  /** Additional className applied to the inner scrollable flex container (e.g. "gap-3") */
  className?: string;
  /** When true, arrow buttons use the dark/admin colour scheme */
  isDark?: boolean;
}

export function ScrollableTabBar({ children, className = "", isDark = false }: ScrollableTabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    // A 2px threshold avoids false-positives from sub-pixel rounding
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Initial check
    updateScrollState();

    el.addEventListener("scroll", updateScrollState, { passive: true });

    // Recalculate when the container or its children resize
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

  // Arrow button shared base styles — always reserve layout space so the
  // inner content doesn't shift when arrows appear/disappear.
  const arrowBase = "shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C25627]";

  // Active (scrollable) state colours
  const arrowActive = isDark
    ? "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 cursor-pointer"
    : "bg-black/[0.08] hover:bg-black/[0.15] text-[#7A7062] hover:text-[#0B0907] cursor-pointer";

  // Disabled (at edge) state — visually gone, pointer and keyboard inert
  const arrowDisabled = "opacity-0 pointer-events-none cursor-default";

  return (
    <div className="relative flex items-center w-full">
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
        <div
          className="absolute left-[44px] top-0 bottom-0 w-8 pointer-events-none z-10"
          style={{
            background: isDark
              ? "linear-gradient(to right, rgba(18,16,12,0.8), transparent)"
              : "linear-gradient(to right, rgba(255,255,255,0.9), transparent)",
          }}
        />
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
        <div
          className="absolute right-[44px] top-0 bottom-0 w-8 pointer-events-none z-10"
          style={{
            background: isDark
              ? "linear-gradient(to left, rgba(18,16,12,0.8), transparent)"
              : "linear-gradient(to left, rgba(255,255,255,0.9), transparent)",
          }}
        />
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
