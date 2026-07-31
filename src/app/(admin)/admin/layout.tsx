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
  Megaphone,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Database,
  Sparkles,
  Sun,
  Moon,
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
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem("admin_theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

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

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("admin_theme", nextTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("lsbsf_admin_session");
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <QueryProvider>{children}</QueryProvider>;
  }

  if (checkingAuth) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${theme === "dark" ? "bg-[#0B0907] text-white" : "bg-[#FAF6EE] text-[#0B0907]"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C25627] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs opacity-60 uppercase tracking-widest">
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
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Camp Guide", href: "/admin/resources", icon: BookOpen },
    { label: "Attendees", href: "/admin/attendees", icon: UserCheck },
    { label: "Staff & Security", href: "/admin/users", icon: ShieldCheck },
  ];

  const isDark = theme === "dark";

  return (
    <QueryProvider>
      <div className={`min-h-screen flex flex-col lg:flex-row font-sans transition-colors duration-300 ${
        isDark ? "bg-[#0B0907] text-[#FCFAF6]" : "bg-[#F7F4EE] text-[#0B0907]"
      }`}>
        
        {/* ── Single Clean Collapsible Desktop Sidebar (w-60 expanded, w-20 collapsed) ── */}
        <aside
          className={`hidden lg:flex flex-col border-r shrink-0 p-4 transition-all duration-300 z-30 ${
            isCollapsed ? "w-20" : "w-60"
          } ${
            isDark ? "bg-[#12100C] border-white/10" : "bg-white border-black/10 shadow-sm"
          }`}
        >
          {/* Header Brand */}
          <div className="flex items-center justify-start gap-3 mb-6 pb-4 border-b border-black/10 dark:border-white/10 px-1">
            <Link href="/admin" className="flex items-center gap-3 active-press min-w-0">
              <div className="relative h-10 w-10 bg-white p-1 rounded-xl flex items-center justify-center shadow-md shrink-0 border border-black/10">
                <Image
                  src="/refreshing-logo.png"
                  alt="LSBSF Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className={`font-serif text-base font-bold uppercase leading-none tracking-tight truncate ${isDark ? "text-white" : "text-[#0B0907]"}`}>
                    REFRESHING <span className="text-[#C25627]">OS</span>
                  </span>
                  <span className="font-mono text-[9px] text-[#DDB94E] tracking-widest uppercase mt-1 truncate font-bold">
                    ADMIN PORTAL
                  </span>
                </div>
              )}
            </Link>
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
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-200 active-press ${
                    isActive
                      ? "bg-[#C25627] text-white shadow-md font-bold"
                      : isDark
                      ? "text-white/70 hover:bg-white/5 hover:text-white"
                      : "text-zinc-600 hover:bg-black/5 hover:text-zinc-900"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer User Info & Theme Toggle */}
          <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex flex-col gap-2">
            <Link
              href="/"
              target="_blank"
              title={isCollapsed ? "Public Website" : undefined}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans transition-colors ${
                isDark ? "bg-white/5 hover:bg-white/10 text-white/80" : "bg-black/5 hover:bg-black/10 text-zinc-700"
              } ${isCollapsed ? "justify-center" : "justify-between"}`}
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#DDB94E] shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="font-medium truncate">Public Website</span>
                  <span className="text-[9px] text-emerald-500 font-mono font-bold">LIVE</span>
                </>
              )}
            </Link>

            <div className={`flex items-center gap-2 px-1 pt-1 ${isCollapsed ? "justify-center" : "justify-between"}`}>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className={`font-sans text-xs font-bold truncate max-w-[120px] ${isDark ? "text-white" : "text-zinc-900"}`}>
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
                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer rounded-lg active-press"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ── Mobile Sidebar Header ── */}
        <div className={`lg:hidden border-b p-4 flex items-center justify-between z-30 ${
          isDark ? "bg-[#12100C] border-white/10" : "bg-white border-black/10 shadow-xs"
        }`}>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="relative h-9 w-9 bg-white p-1 rounded-xl flex items-center justify-center border border-black/10">
              <Image src="/refreshing-logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className={`font-serif text-base font-bold uppercase ${isDark ? "text-white" : "text-[#0B0907]"}`}>
              REFRESHING <span className="text-[#C25627]">OS</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg"
            >
              {isDark ? <Sun className="h-5 w-5 text-[#DDB94E]" /> : <Moon className="h-5 w-5 text-zinc-700" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2 ${isDark ? "text-white" : "text-zinc-900"}`}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className={`lg:hidden fixed inset-0 z-50 backdrop-blur-md flex flex-col p-6 animate-fade-in ${
            isDark ? "bg-[#0B0907]/95 text-white" : "bg-white/95 text-[#0B0907]"
          }`}>
            <div className="flex items-center justify-between pb-6 border-b border-black/10 dark:border-white/10 mb-6">
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
                      isActive ? "bg-[#C25627] text-white font-bold" : isDark ? "text-white/70 hover:bg-white/5" : "text-zinc-700 hover:bg-black/5"
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
              className="py-3.5 bg-red-500/10 text-red-500 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-auto"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* ── Main Content Canvas ── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          
          {/* Top Bar Header with SINGLE collapse button & Theme Toggle */}
          <header className={`h-16 border-b backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between transition-colors ${
            isDark ? "bg-[#12100C]/90 border-white/10" : "bg-white/90 border-black/10 shadow-xs"
          }`}>
            <div className="flex items-center gap-3">
              {/* Single Clean Sidebar Collapse Toggle Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`hidden lg:flex p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark ? "text-white/70 hover:text-white hover:bg-white/10" : "text-zinc-600 hover:text-zinc-900 hover:bg-black/5"
                }`}
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <PanelLeftOpen className="h-4 w-4 text-[#C25627]" /> : <PanelLeftClose className="h-4 w-4 text-[#C25627]" />}
              </button>
              
              <Sparkles className="h-4 w-4 text-[#DDB94E]" />
              <span className={`font-mono text-xs font-bold tracking-widest uppercase ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                CONFERENCE CONTROL SYSTEM
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Light / Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 text-xs font-sans font-bold uppercase ${
                  isDark
                    ? "bg-white/5 border-white/15 text-[#DDB94E] hover:bg-white/10"
                    : "bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200"
                }`}
                title="Toggle Light / Dark Mode"
              >
                {isDark ? (
                  <>
                    <Sun className="h-4 w-4 text-[#DDB94E]" />
                    <span className="hidden sm:inline">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 text-zinc-700" />
                    <span className="hidden sm:inline">Dark Mode</span>
                  </>
                )}
              </button>

              <Link
                href="/admin/seed"
                className="flex items-center gap-2 px-3.5 py-2 bg-[#DDB94E]/10 hover:bg-[#DDB94E]/20 border border-[#DDB94E]/30 text-[#DDB94E] rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all active-press"
              >
                <Database className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Seed Database</span>
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
