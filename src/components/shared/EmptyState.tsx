/**
 * Empty State Component
 *  * Reusable UI placeholder for empty data views.
 */

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ title, description, icon: Icon, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`w-full p-8 md:p-12 flex flex-col items-center justify-center text-center bg-white dark:bg-[#14120E] border border-black/5 dark:border-white/5 rounded-2xl ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6">
          <Icon className="h-8 w-8 text-zinc-400" />
        </div>
      )}
      <h3 className="font-serif text-xl font-bold uppercase mb-2">{title}</h3>
      <p className="font-sans text-sm text-zinc-500 dark:text-white/60 font-light max-w-sm mx-auto mb-6">
        {description}
      </p>
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
