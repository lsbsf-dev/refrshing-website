"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center font-sans text-center px-4">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-10 h-10 text-red-500" />
      </div>
      
      <h1 className="text-3xl font-bold font-serif mb-3 dark:text-white text-zinc-900">
        Access Denied
      </h1>
      
      <p className="text-sm dark:text-zinc-400 text-zinc-500 max-w-md mb-8 leading-relaxed">
        You do not have the required permissions to view this page. If you believe this is an error, please contact a Super Administrator.
      </p>
      
      <Link 
        href="/admin"
        className="flex items-center gap-2 px-6 py-3 bg-[#C25627] hover:bg-[#A94A21] text-white rounded-xl font-bold tracking-wide transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}
