/**
 * BottomNavigation Component
 * Persistent mobile bottom tab bar for quick navigation on small screens.
 */

"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Home, Calendar, Users, BookOpen, Search, MoreHorizontal, MessageSquare, Image as ImageIcon, Bell } from "lucide-react";

export default function BottomNavigation() {
  const pathname = usePathname();
  const params = useParams();
  const eventId = (params?.eventId as string) || "";
  const basePath = eventId ? `/${eventId}` : "";
  const [showMore, setShowMore] = React.useState(false);

  // Close more menu on route change
  React.useEffect(() => {
    setShowMore(false);
  }, [pathname]);

  const tabs = [
    { label: "Home", href: basePath || "/", icon: Home },
    { label: "Programme", href: `${basePath}/programme`, icon: Calendar },
    { label: "Ministers", href: `${basePath}/ministers`, icon: Users },
    { label: "Booklet", href: `${basePath}/booklet`, icon: BookOpen },
  ];

  const moreLinks = [
    { label: "Gallery", href: `${basePath}/gallery`, icon: ImageIcon },
    { label: "Announcements", href: `${basePath}/announcements`, icon: Bell },
    { label: "Contact", href: `${basePath}/contact`, icon: MessageSquare },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/5 shadow-2xl"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-stretch h-16">
        {tabs.map(({ label, href, icon: Icon }) => {
          const isHome = href === "/" || href === basePath;
          const isActive = isHome ? (pathname === basePath || pathname === `${basePath}/` || pathname === "/") : pathname.startsWith(href);
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
        
        {/* More Button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 active-press ${
            showMore ? "text-[#C25627]" : "text-[#7A7062] hover:text-[#C25627]"
          }`}
        >
          <MoreHorizontal
            className={`h-5 w-5 transition-transform duration-200 ${showMore ? "scale-110" : ""}`}
            strokeWidth={showMore ? 2.5 : 1.8}
          />
          <span className="font-sans text-[10px] font-bold tracking-tight uppercase">
            More
          </span>
          {showMore && (
            <span className="absolute bottom-0 w-6 h-0.5 bg-[#C25627] rounded-full" />
          )}
        </button>
      </div>

      {/* More Menu Drawer */}
      {showMore && (
        <>
          <div className="fixed inset-0 bg-black/20 z-[-1]" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-16 right-2 bg-white border border-black/10 shadow-xl rounded-2xl overflow-hidden py-2 min-w-[160px] animate-fade-in flex flex-col z-50">
            {moreLinks.map(({ label, href, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 font-sans text-sm active-press ${
                    isActive ? "text-[#C25627] font-bold bg-[#C25627]/5" : "text-[#0B0907] hover:bg-black/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </nav>
  );
}
