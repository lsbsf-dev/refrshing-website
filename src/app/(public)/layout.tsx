import React from "react";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Content wrapper with top padding to account for fixed header (72px) */}
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
