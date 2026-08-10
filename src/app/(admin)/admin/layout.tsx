/**
 * Admin Layout Component
 *  * Shell and navigation layout for the admin portal.
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
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
  QrCode,
  Mailbox,
  ImageIcon,
} from "lucide-react";
import { QueryProvider } from "@/components/shared/QueryProvider";
import { AuthProvider, useAuth } from "@/lib/contexts/AuthContext";
import { hasPermission, Permissions } from "@/lib/permissions";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, activeEvent, setActiveEvent, isLoading, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const savedTheme = localStorage.getItem("admin_theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("admin_theme", nextTheme);
  };

  useEffect(() => {
    if (!profile || isLoginPage || pathname === "/admin/unauthorized" || pathname === "/admin" || pathname === "/admin/seed" || pathname === "/admin/mfa-enroll") return;

    // MFA enforcement removed (no longer required)

    const routePermissions: Record<string, string> = {
      "/admin/ministers": Permissions.Ministers.Read,
      "/admin/programme": Permissions.Programme.Read,
      "/admin/announcements": Permissions.Announcements.Read,
      "/admin/resources": Permissions.Resources.Read,
      "/admin/attendees": Permissions.Registrations.Read,
      "/admin/checkin": Permissions.Registrations.CheckIn,
      "/admin/users": Permissions.Users.Read,
      "/admin/enquiries": Permissions.Enquiries.Read,
      "/admin/gallery": Permissions.Gallery.Read,
    };

    const matchedRoute = Object.keys(routePermissions).find((route) => pathname.startsWith(route));
    if (matchedRoute) {
      const requiredPerm = routePermissions[matchedRoute] as any;
      if (!hasPermission(profile.permissions, requiredPerm)) {
        router.push("/admin/unauthorized");
      }
    }
  }, [pathname, profile, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans bg-background text-foreground ${theme === "dark" ? "dark" : ""}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C25627] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs opacity-60 uppercase tracking-widest">Verifying Admin Session...</span>
        </div>
      </div>
    );
  }

  if (!profile) return null; // handled by AuthProvider redirect

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ...(hasPermission(profile.permissions, Permissions.Ministers.Read) ? [{ label: "Ministers", href: "/admin/ministers", icon: Users }] : []),
    ...(hasPermission(profile.permissions, Permissions.Programme.Read) ? [{ label: "Programme", href: "/admin/programme", icon: Calendar }] : []),
    ...(hasPermission(profile.permissions, Permissions.Announcements.Read) ? [{ label: "Announcements", href: "/admin/announcements", icon: Megaphone }] : []),
    ...(hasPermission(profile.permissions, Permissions.Resources.Read) ? [{ label: "Resources", href: "/admin/resources", icon: BookOpen }] : []),
    ...(hasPermission(profile.permissions, Permissions.Gallery.Read) ? [{ label: "Gallery", href: "/admin/gallery", icon: ImageIcon }] : []),
    ...(hasPermission(profile.permissions, Permissions.Registrations.Read) ? [{ label: "Attendees", href: "/admin/attendees", icon: UserCheck }] : []),
    ...(hasPermission(profile.permissions, Permissions.Registrations.CheckIn) ? [{ label: "Check-In", href: "/admin/checkin", icon: QrCode }] : []),
    ...(hasPermission(profile.permissions, Permissions.Enquiries.Read) ? [{ label: "Inbox", href: "/admin/enquiries", icon: Mailbox }] : []),
    ...(hasPermission(profile.permissions, Permissions.Users.Read) ? [{ label: "Users & Roles", href: "/admin/users", icon: ShieldCheck }] : []),
  ];

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row font-sans transition-colors duration-300 bg-background text-foreground ${isDark ? "dark" : ""}`}>
      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden lg:flex flex-col border-r shrink-0 p-4 transition-all duration-300 z-30 sticky top-0 h-[100dvh] max-h-screen overflow-y-auto overflow-x-hidden ${isCollapsed ? "w-20" : "w-60"} bg-surface border-border shadow-sm`}>
        <div className="flex items-center justify-start gap-3 mb-6 pb-4 border-b border-border px-1 shrink-0">
          <Link href="/admin" className="flex items-center gap-3 active-press min-w-0">
            <div className="relative h-10 w-10 bg-white p-1 rounded-xl flex items-center justify-center shadow-md shrink-0 border border-black/10">
              <Image src="/refreshing-logo.png" alt="LSBSF Logo" fill className="object-contain" priority />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className={`font-serif text-base font-bold uppercase leading-none tracking-tight truncate text-foreground`}>
                  REFRESHING <span className="text-[#C25627]">OS</span>
                </span>
                <span className="font-mono text-[9px] text-[#DDB94E] tracking-widest uppercase mt-1 truncate font-bold">ADMIN PORTAL</span>
              </div>
            )}
          </Link>
        </div>
        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-200 active-press ${isActive ? "bg-[#C25627] text-white shadow-md font-bold" : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"} ${isCollapsed ? "justify-center" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 pt-4 border-t border-border flex flex-col gap-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            title={isCollapsed ? "Public Website" : undefined}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans transition-colors bg-surface-muted hover:bg-surface-hover text-foreground-muted ${isCollapsed ? "justify-center" : "justify-between"}`}
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
                <span className={`font-sans text-xs font-bold truncate max-w-30 text-foreground`}>
                  {profile?.email || "admin@lsbsf.org"}
                </span>
                <span className="font-mono text-[9px] text-[#DDB94E] uppercase font-semibold">
                  {profile?.role.replace(/([A-Z])/g, " $1").trim().toUpperCase()}
                </span>
              </div>
            )}
            <button onClick={logout} title="Sign Out" className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer rounded-lg active-press">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Header & Drawer ── */}
      <div className={`lg:hidden border-b p-4 flex items-center justify-between z-40 sticky top-0 bg-surface border-border shadow-xs`}>
        <Link href="/admin" className="flex items-center gap-2">
          <div className="relative h-9 w-9 bg-white p-1 rounded-xl flex items-center justify-center border border-black/10">
            <Image src="/refreshing-logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className={`font-serif text-base font-bold uppercase text-foreground`}>
            REFRESHING <span className="text-[#C25627]">OS</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg">
            {isDark ? <Sun className="h-5 w-5 text-[#DDB94E]" /> : <Moon className="h-5 w-5 text-zinc-700" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className={`p-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={`lg:hidden fixed inset-0 z-50 backdrop-blur-md flex flex-col p-6 animate-fade-in bg-background text-foreground`}>
          <div className="flex items-center justify-between pb-6 border-b border-border mb-6 shrink-0">
            <span className="font-serif text-lg font-bold uppercase">REFRESHING OS ADMIN</span>
            <button onClick={() => setMobileOpen(false)} className="p-2">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold uppercase ${isActive ? "bg-[#C25627] text-white font-bold" : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"}`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <button onClick={logout} className="py-3.5 bg-red-500/10 text-red-500 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-6 shrink-0">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* ── Main Content Canvas ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className={`h-16 border-b backdrop-blur-md sticky top-0 z-20 px-3 sm:px-6 flex items-center justify-between transition-colors bg-surface border-border shadow-xs`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsCollapsed(!isCollapsed)} className={`hidden lg:flex p-2 rounded-xl transition-colors cursor-pointer text-foreground-muted hover:text-foreground hover:bg-surface-hover`} title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4 text-[#C25627]" /> : <PanelLeftClose className="h-4 w-4 text-[#C25627]" />}
            </button>
            <Sparkles className="h-4 w-4 text-[#DDB94E]" />
            <span className={`font-mono text-xs font-bold tracking-widest uppercase text-foreground-muted`}>
              CONFERENCE CONTROL SYSTEM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden"></div>
            <button onClick={toggleTheme} className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 text-xs font-sans font-bold uppercase bg-surface-muted border-border text-foreground hover:bg-surface-hover`} title="Toggle Light / Dark Mode">
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
            <Link href="/admin/seed" className="flex items-center gap-2 px-3.5 py-2 bg-[#DDB94E]/10 hover:bg-[#DDB94E]/20 border border-[#DDB94E]/30 text-[#DDB94E] rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all active-press">
              <Database className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Seed Database</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto overflow-x-hidden">
          {children}
        </main>
        <Toaster position="top-right" />
      </div>
    </div>
  );
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AuthProvider>
    </QueryProvider>
  );
}
