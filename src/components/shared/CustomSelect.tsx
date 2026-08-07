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
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

export function CustomSelect({ value, onChange, options, placeholder, disabled, error }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = value ? options.find((o) => o.value === value) : null;

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
        disabled={disabled || options.length === 0}
        className={`w-full bg-zinc-50 dark:bg-[#1A1813] border text-xs font-sans py-3 px-4 rounded-xl outline-none flex items-center justify-between transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-red-500 text-red-500' : 'border-zinc-300 dark:border-white/10 hover:border-[#C25627]/40'
        }`}
      >
        <span className="truncate">{selectedOption?.label || placeholder || "Select..."}</span>
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
