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
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    const stored = localStorage.getItem("lsbsf_admin_session");
    if (!stored) {
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

  if (isLoginPage) {
    return <QueryProvider>{children}</QueryProvider>;
  }

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
    { label: "Ministers", href: "/admin/ministers", icon: Users },
    { label: "Programme", href: "/admin/programme", icon: Calendar },
    { label: "Camp Guide", href: "/admin/resources", icon: BookOpen },
    { label: "Attendees", href: "/admin/attendees", icon: UserCheck },
    { label: "Staff & Audit", href: "/admin/users", icon: ShieldCheck },
  ];

  return (
    <QueryProvider>
      <div className="min-h-screen bg-[#0B0907] text-[#FCFAF6] flex flex-col lg:flex-row font-sans overflow-x-hidden">
        
        {/* ── Desktop Collapsible Sidebar (Width: w-64 expanded, w-20 collapsed) ── */}
        <aside
          className={`hidden lg:flex flex-col bg-[#12100C] border-r border-white/10 shrink-0 p-4 transition-all duration-300 z-30 ${
            isCollapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Header Brand + Collapse Button */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 px-2">
            <Link href="/admin" className="flex items-center gap-3 active-press min-w-0">
              <div className="relative h-10 w-10 bg-white p-1 rounded-xl flex items-center justify-center shadow-md shrink-0">
                <Image
                  src="/refreshing-logo.png"
                  alt="Refreshing 2026 Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-serif text-base font-bold text-white uppercase leading-none tracking-tight truncate">
                    REFRESHING <span className="text-[#C25627]">OS</span>
                  </span>
                  <span className="font-mono text-[9px] text-[#DDB94E] tracking-widest uppercase mt-1 truncate">
                    ADMIN PORTAL
                  </span>
                </div>
              )}
            </Link>

            {/* Collapse Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-200 active-press ${
                    isActive
                      ? "bg-[#C25627] text-white shadow-md font-bold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer User Info */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/"
              target="_blank"
              title={isCollapsed ? "Public Website" : undefined}
              className={`flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-sans text-white/80 transition-colors ${
                isCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#DDB94E] shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="font-medium truncate">Public Website</span>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold">LIVE</span>
                </>
              )}
            </Link>

            <div className={`flex items-center gap-2 px-1 pt-1 ${isCollapsed ? "justify-center" : "justify-between"}`}>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-sans text-xs font-bold text-white truncate max-w-[130px]">
                    {adminUser?.email || "admin@lsbsf.org"}
                  </span>
                  <span className="font-mono text-[9px] text-[#DDB94E] uppercase font-semibold">
                    SUPER ADMIN
                  </span>
                </div>
              )}
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

        {/* ── Mobile Sidebar Drawer ── */}
        <div className="lg:hidden bg-[#12100C] border-b border-white/10 p-4 flex items-center justify-between z-30">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="relative h-9 w-9 bg-white p-1 rounded-xl flex items-center justify-center">
              <Image src="/refreshing-logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-serif text-base font-bold text-white uppercase">
              REFRESHING <span className="text-[#C25627]">OS</span>
            </span>
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-white/80 hover:text-white"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-6 text-white animate-fade-in">
            <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
              <span className="font-serif text-lg font-bold uppercase">REFRESHING OS ADMIN</span>
              <button onClick={() => setMobileOpen(false)} className="p-2">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-3 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold uppercase ${
                      isActive ? "bg-[#C25627] text-white font-bold" : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="py-3.5 bg-red-500/10 text-red-400 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-auto"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* ── Main Content Canvas ── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          
          {/* Top Bar Header */}
          <header className="h-16 bg-[#12100C]/90 border-b border-white/10 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
              <Sparkles className="h-4 w-4 text-[#DDB94E]" />
              <span className="font-mono text-xs font-bold tracking-widest text-white/80 uppercase">
                CONFERENCE OPERATING SYSTEM
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/seed"
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#DDB94E]/10 hover:bg-[#DDB94E]/20 border border-[#DDB94E]/30 text-[#DDB94E] rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all active-press"
              >
                <Database className="h-3.5 w-3.5" />
                <span>Seed Database</span>
              </Link>
            </div>
          </header>

          {/* Main Content Dashboard */}
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

        </div>

      </div>
    </QueryProvider>
  );
}
