/**
 * @file FormField.tsx
 * @description Form field container component wrapping labels, inputs, and error messages.
 */

import React from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

export function FormField({ label, required, children, className = "", labelClassName = "" }: FormFieldProps) {
  return (
    <div className={className}>
      <label className={`block text-xs font-sans font-bold uppercase mb-1 ${labelClassName}`}>
        {label} {required && <span className="text-[#C25627]">*</span>}
      </label>
      {children}
    </div>
  );
}
