"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "text-red-500",
      iconBg: "bg-red-500/10",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "text-amber-500",
      iconBg: "bg-amber-500/10",
      button: "bg-amber-600 hover:bg-amber-700",
    },
    default: {
      icon: "text-[#C25627]",
      iconBg: "bg-[#C25627]/10",
      button: "bg-[#C25627] hover:bg-[#E05320]",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-[#14120E] border border-white/10 rounded-3xl shadow-2xl max-w-md w-full p-8 flex flex-col gap-6 animate-fade-in">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className={`h-14 w-14 rounded-2xl ${styles.iconBg} flex items-center justify-center`}>
            <AlertTriangle className={`h-7 w-7 ${styles.icon}`} />
          </div>
          <h3 className="font-serif text-xl font-bold text-white uppercase">
            {title}
          </h3>
          <p className="font-sans text-sm text-white/70 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-white/10 hover:border-white/30 text-white font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all active-press"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 ${styles.button} text-white font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all active-press shadow-lg`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
