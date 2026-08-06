"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

export function CustomSelect({ value, onChange, options }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0] || { label: "Select...", value: "" };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={options.length === 0}
        className="w-full bg-zinc-50 dark:bg-[#1A1813] border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none flex items-center justify-between hover:border-[#C25627]/40 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate">{selectedOption?.label || "Select..."}</span>
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1A1813] border border-black/10 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-slide-up" style={{ animationDuration: "150ms" }}>
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-xs font-sans cursor-pointer transition-colors ${
                  value === option.value
                    ? "bg-[#C25627]/10 text-[#C25627] font-bold"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
