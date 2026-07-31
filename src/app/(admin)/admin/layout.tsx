"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  UserCheck,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Database,
  Sparkles,
} from "lucide-react";
import { QueryProvider } from "@/components/shared/QueryProvider";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    // Check if on login page
    if (pathname === "/admin/login") return;

    const stored = localStorage.getItem("lsbsf_admin_session");
    if (stored) {
      try {
        setAdminUser(JSON.parse(stored));
      } catch (e) {
        setAdminUser({ email: "admin@lsbsf.org", role: "superAdmin" });
      }
    } else {
      // Set default demo admin session so access works smoothly
      const defaultSession = { email: "superadmin@lsbsf.org", role: "superAdmin" };
      localStorage.setItem("lsbsf_admin_session", JSON.stringify(defaultSession));
      setAdminUser(defaultSession);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("lsbsf_admin_session");
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Ministers / Speakers", href: "/admin/ministers", icon: Users },
    { label: "Programme Schedule", href: "/admin/programme", icon: Calendar },
    { label: "Camp Guide Booklet", href: "/admin/resources", icon: BookOpen },
    { label: "Attendees & Check-In", href: "/admin/attendees", icon: UserCheck },
    { label: "Staff & Audit Logs", href: "/admin/users", icon: ShieldCheck },
  ];

  return (
    <QueryProvider>
      <div className="min-h-screen bg-[#0B0907] text-[#FCFAF6] flex font-sans">
        
        {/* ── Sidebar (Desktop) ── */}
        <aside className="hidden lg:flex w-72 flex-col bg-[#14120E] border-r border-white/10 p-6 fixed inset-y-0 left-0 z-40">
          
          {/* Logo Brand */}
          <Link href="/admin" className="flex items-center gap-3.5 mb-8 px-2 active-press">
            <div className="relative h-12 w-12 bg-white p-1.5 rounded-xl flex items-center justify-center shadow-md">
              <Image
                src="/refreshing-logo.png"
                alt="Refreshing 2026 Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-white uppercase leading-none">
                REFRESHING <span className="text-[#C25627]">OS</span>
              </span>
              <span className="font-mono text-[10px] text-[#DDB94E] tracking-widest uppercase mt-1">
                ADMIN PORTAL 2026
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-200 active-press ${
                    isActive
                      ? "bg-[#C25627] text-white shadow-md font-bold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Website Quick Link */}
          <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-sans text-white/80 transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <ExternalLink className="h-3.5 w-3.5 text-[#DDB94E]" />
                Public Website
              </span>
              <span className="text-[10px] text-white/40 font-mono">LIVE</span>
            </Link>

            <div className="flex items-center justify-between px-2 pt-2">
              <div className="flex flex-col">
                <span className="font-sans text-xs font-bold text-white truncate max-w-[150px]">
                  {adminUser?.email || "admin@lsbsf.org"}
                </span>
                <span className="font-mono text-[10px] text-[#DDB94E] uppercase font-semibold">
                  SUPER ADMIN
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-white/50 hover:text-red-400 transition-colors cursor-pointer rounded-lg active-press"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

        </aside>

        {/* ── Mobile Sidebar Drawer ── */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex">
            <div className="w-72 bg-[#14120E] border-r border-white/10 p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 bg-white p-1 rounded-xl">
                    <Image src="/refreshing-logo.png" alt="Logo" fill className="object-contain" />
                  </div>
                  <span className="font-serif text-base font-bold text-white uppercase">
                    REFRESHING <span className="text-[#C25627]">OS</span>
                  </span>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-white/70">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider ${
                        isActive ? "bg-[#C25627] text-white" : "text-white/70 hover:bg-white/5"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={handleLogout}
                className="mt-auto py-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* ── Main Content Area ── */}
        <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
          
          {/* Top Bar */}
          <header className="h-20 bg-[#14120E]/80 border-b border-white/10 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden text-white/80 p-2"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#DDB94E]" />
                <span className="font-mono text-xs font-bold tracking-widest text-white/80 uppercase">
                  CONFERENCE CONTROL SYSTEM
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/admin/seed"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#DDB94E]/10 hover:bg-[#DDB94E]/20 border border-[#DDB94E]/30 text-[#DDB94E] rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all active-press"
              >
                <Database className="h-3.5 w-3.5" />
                <span>Seed Database</span>
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

        </div>

      </div>
    </QueryProvider>
  );
}
