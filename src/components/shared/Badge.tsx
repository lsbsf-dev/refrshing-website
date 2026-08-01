/**
 * Badge Component
 *  * Reusable UI badge element for status or category display.
 */

import React from "react";

interface BadgeProps {
  variant?: "primary" | "secondary" | "success" | "warning";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "primary", children, className = "" }: BadgeProps) {
  const base = "font-sans text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full w-fit";
  const styles = {
    primary: "bg-[#C25627]/10 text-[#C25627]",
    secondary: "border border-[#DDB94E] text-[#DDB94E] bg-transparent",
    success: "bg-emerald-500/10 text-emerald-500",
    warning: "bg-amber-500/10 text-amber-500"
  };
  return (
    <span className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
