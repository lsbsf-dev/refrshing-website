/**
 * BottomNavigation Component
 * Persistent mobile bottom tab bar for quick navigation on small screens.
 */

"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Home, Calendar, Users, BookOpen, Search } from "lucide-react";

export default function BottomNavigation() {
  const pathname = usePathname();
  const params = useParams();
  const eventId = (params?.eventId as string) || "";
  const basePath = eventId ? `/${eventId}` : "";

  const tabs = [
    { label: "Home", href: `${basePath}/`, icon: Home },
    { label: "Programme", href: `${basePath}/programme`, icon: Calendar },
    { label: "Ministers", href: `${basePath}/ministers`, icon: Users },
    { label: "Resources", href: `${basePath}/booklet`, icon: BookOpen },
    { label: "Search", href: `${basePath}/search`, icon: Search },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/5 shadow-2xl"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-stretch h-16">
        {tabs.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 active-press ${
                isActive
                  ? "text-[#C25627]"
                  : "text-[#7A7062] hover:text-[#C25627]"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className="font-sans text-[10px] font-bold tracking-tight uppercase">
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 bg-[#C25627] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
