/**
 * Admin Root Layout Component
 *  * Top-level layout wrapper for admin routes.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Operating System — Refreshing 2026",
  description: "Official conference administration portal for Refreshing 2026.",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#0B0907] text-[#FCFAF6] font-sans antialiased">
      {children}
    </div>
  );
}
