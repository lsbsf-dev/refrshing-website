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
  Lock,
} from "lucide-react";
import { QueryProvider } from "@/components/shared/QueryProvider";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    // Check auth session
    const stored = localStorage.getItem("lsbsf_admin_session");
    if (!stored) {
      // Redirect to login page if no active session exists
      router.push("/admin/login");
    } else {
      try {
        setAdminUser(JSON.parse(stored));
      } catch (e) {
        setAdminUser({ email: "admin@lsbsf.org", role: "superAdmin" });
      }
      setCheckingAuth(false);
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = () => {
    localStorage.removeItem("lsbsf_admin_session");
    router.push("/admin/login");
  };

  // If on login page, render standalone login view
  if (isLoginPage) {
    return <QueryProvider>{children}</QueryProvider>;
  }

  // Prevent flicker during auth check
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0B0907] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C25627] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs text-white/60 uppercase tracking-widest">
            Verifying Admin Session...
          </span>
        </div>
      </div>
    );
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
      <div className="min-h-screen bg-[#0B0907] text-[#FCFAF6] flex flex-col lg:flex-row font-sans">
        
        {/* ── Bulletproof Flex Left Sidebar (Never Overlaps) ── */}
        <aside className="w-full lg:w-72 bg-[#12100C] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col shrink-0 p-6 z-30">
          
          {/* Header Brand */}
          <div className="flex items-center justify-between lg:justify-start gap-4 mb-8 pb-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-3 active-press">
              <div className="relative h-12 w-12 bg-white p-1 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <Image
                  src="/refreshing-logo.png"
                  alt="Refreshing 2026 Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold text-white uppercase leading-none tracking-tight">
                  REFRESHING <span className="text-[#C25627]">OS</span>
                </span>
                <span className="font-mono text-[10px] text-[#DDB94E] tracking-widest uppercase mt-1">
                  ADMIN PORTAL
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-200 active-press ${
                    isActive
                      ? "bg-[#C25627] text-white shadow-md font-bold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer User Info & Actions */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-sans text-white/80 transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <ExternalLink className="h-3.5 w-3.5 text-[#DDB94E]" />
                Public Website
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">LIVE</span>
            </Link>

            <div className="flex items-center justify-between px-2 pt-2">
              <div className="flex flex-col min-w-0">
                <span className="font-sans text-xs font-bold text-white truncate max-w-[150px]">
                  {adminUser?.email || "superadmin@lsbsf.org"}
                </span>
                <span className="font-mono text-[10px] text-[#DDB94E] uppercase font-semibold">
                  SUPER ADMIN
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer rounded-lg active-press"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

        </aside>

        {/* ── Main Content Area ── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          
          {/* Top Bar Header */}
          <header className="h-20 bg-[#12100C]/90 border-b border-white/10 backdrop-blur-md sticky top-0 z-20 px-6 lg:px-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-[#DDB94E]" />
              <span className="font-mono text-xs font-bold tracking-widest text-white/80 uppercase">
                CONFERENCE OPERATING SYSTEM
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/seed"
                className="flex items-center gap-2 px-4 py-2 bg-[#DDB94E]/10 hover:bg-[#DDB94E]/20 border border-[#DDB94E]/30 text-[#DDB94E] rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all active-press"
              >
                <Database className="h-3.5 w-3.5" />
                <span>Seed Database</span>
              </Link>
            </div>
          </header>

          {/* Main Dashboard Canvas */}
          <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
            {children}
          </main>

        </div>

      </div>
    </QueryProvider>
  );
}
