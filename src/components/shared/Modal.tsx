/**
 * Modal Component
 *  * Reusable modal dialog overlay with focus trap and scroll lock.
 */

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

// SSR-safe global modal counter to prevent overlapping modals from clearing locks early
let activeModals = 0;
// Module-level stack to track active modal close wrappers for topmost Escape close
const modalStack: (() => void)[] = [];

interface ModalProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export function Modal({ onClose, title, children, maxWidthClass = "max-w-xl" }: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  // Sync the latest onClose callback to keep it fresh without re-running mount effect
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      activeModals++;
      if (activeModals === 1) {
        document.body.style.overflow = "hidden";
      }
      
      // Focus Trap mount: store active element and focus container
      previousActiveElement.current = document.activeElement as HTMLElement;
      containerRef.current?.focus();
    }
    return () => {
      if (typeof window !== "undefined") {
        activeModals = Math.max(0, activeModals - 1);
        if (activeModals === 0) {
          document.body.style.overflow = "";
        }
        
        // Focus Trap unmount: restore focus
        previousActiveElement.current?.focus();
      }
    };
  }, []);

  // Handle Escape keypress (topmost modal only)
  useEffect(() => {
    const entry = () => {
      onCloseRef.current();
    };
    modalStack.push(entry);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modalStack[modalStack.length - 1] === entry) {
          onCloseRef.current();
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      const idx = modalStack.indexOf(entry);
      if (idx !== -1) {
        modalStack.splice(idx, 1);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Handle Tab keypress to cycle focus within modal (focus trap)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      if (!containerRef.current) return;
      const focusable = containerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]'
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        onKeyDown={handleKeyDown}
        className={`w-full ${maxWidthClass} bg-white dark:bg-[#181612] text-[#0B0907] dark:text-[#FCFAF6] border border-black/15 dark:border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto focus:outline-none`}
      >
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
          <h3 className="font-serif text-2xl font-bold uppercase">{title}</h3>
          <button type="button" onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors cursor-pointer" aria-label="Close modal">
            <X className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
