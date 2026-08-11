"use client";

import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  isVisible: boolean;
  onClose: () => void;
}

const variantConfig = {
  success: {
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-500",
    Icon: CheckCircle,
  },
  error: {
    bg: "bg-red-500/10 border-red-500/20",
    text: "text-red-500",
    Icon: XCircle,
  },
  warning: {
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "text-amber-500",
    Icon: AlertTriangle,
  },
  info: {
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-500",
    Icon: Info,
  },
};

export function Toast({ message, variant = "info", isVisible, onClose }: ToastProps) {
  if (!isVisible) return null;

  const config = variantConfig[variant];
  const Icon = config.Icon;

  return (
    <div className={`fixed top-4 right-4 z-[150] ${config.bg} border px-6 py-4 rounded-2xl shadow-2xl animate-fade-in flex items-center gap-3 max-w-md`}>
      <Icon className={`h-6 w-6 shrink-0 ${config.text}`} />
      <span className={`font-sans text-sm font-bold ${config.text}`}>{message}</span>
      <button onClick={onClose} className={`shrink-0 ml-2 ${config.text} opacity-60 hover:opacity-100 transition-opacity`}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
