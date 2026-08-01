/**
 * Button Component
 *  * Reusable UI button element with variants and states.
 */

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
}

export function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const base = "px-6 py-3 rounded-full font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 active-press select-none cursor-pointer";
  const styles = {
    primary: "bg-[#C25627] hover:bg-[#E05320] text-white shadow-lg",
    secondary: "border border-[#C25627] text-[#C25627] hover:bg-[#C25627]/5 bg-transparent",
    ghost: "bg-black/5 hover:bg-black/10 text-[#7A7062] hover:text-[#0B0907]"
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
