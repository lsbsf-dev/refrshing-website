/**
 * Admin Dashboard Page Component
 *  * Overview, metrics, and quick actions for the admin portal.
 */

"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Database,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  QrCode,
  Flame,
  Megaphone,
} from "lucide-react";
import seedMinisters from "@/lib/firebase/seedMinisters.json";
import seedSessions from "@/lib/firebase/seedSessions.json";
import seedResources from "@/lib/firebase/seedResources.json";
import seedAnnouncements from "@/lib/firebase/seedAnnouncements.json";

export default function AdminDashboardHome() {
  const ministerCount = seedMinisters.length;
  const sessionCount = seedSessions.length;
  const resourceCount = seedResources.length;
  const announcementCount = seedAnnouncements.length;

  const metrics = [
    {
      title: "Featured Ministers",
      count: ministerCount,
      subtitle: "Speakers & Music Ministers",
      href: "/admin/ministers",
      icon: Users,
      color: "text-[#C25627]",
      bg: "bg-[#C25627]/10",
    },
    {
      title: "5-Day Sessions",
      count: sessionCount,
      subtitle: "August 10–14 Schedule",
      href: "/admin/programme",
      icon: Calendar,
      color: "text-[#DDB94E]",
      bg: "bg-[#DDB94E]/10",
    },
    {
      title: "Announcements",
      count: announcementCount,
      subtitle: "Site-Wide Notices",
      href: "/admin/announcements",
      icon: Megaphone,
      color: "text-[#E05320]",
      bg: "bg-[#E05320]/10",
    },
    {
      title: "Camp Guide Booklet",
      count: resourceCount,
      subtitle: "Hymns, Rules & Songs",
      href: "/admin/resources",
      icon: BookOpen,
      color: "text-[#C25627]",
      bg: "bg-[#C25627]/10",
    },
    {
      title: "Registered Campers",
      count: 540,
      subtitle: "Hostels & Tags Allocated",
      href: "/admin/attendees",
      icon: UserCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      
      {/* ── Welcome Banner ── */}
      <div className="relative w-full p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#1A0E12] via-[#241318] to-[#14120E] text-white border border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C25627]/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-bold tracking-[0.3em] text-[#DDB94E] uppercase flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#C25627]" />
              REFRESHING 2026 — 40TH ANNIVERSARY
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-light uppercase leading-none">
              WELCOME TO THE <span className="text-[#C25627] font-normal">ADMIN PORTAL</span>
            </h1>
            <p className="font-sans text-white/70 text-sm max-w-xl font-light mt-1">
              Full control over ministers, programme sessions, announcements, booklet resources, camper check-ins, and security claims.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/attendees"
              className="px-6 py-3.5 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs tracking-wider uppercase rounded-full transition-all active-press shadow-lg flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              <span>Camp Check-In</span>
            </Link>
            <Link
              href="/admin/seed"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-sans font-bold text-xs tracking-wider uppercase rounded-full transition-all active-press flex items-center gap-2"
            >
              <Database className="h-4 w-4 text-[#DDB94E]" />
              <span>Sync Database</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Metric Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Link
              key={idx}
              href={m.href}
              className="group p-6 bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 hover:border-[#C25627]/40 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 active-press flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${m.bg} ${m.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-[#C25627] transition-colors" />
              </div>
              <div>
                <span className="font-sans text-3xl font-bold tracking-tight">
                  {m.count}
                </span>
                <h3 className="font-serif text-base font-bold mt-1">
                  {m.title}
                </h3>
                <p className="font-sans text-[11px] text-zinc-500 dark:text-white/50 font-light mt-0.5">
                  {m.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Management Modules & Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Quick Actions Grid */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-light uppercase">
              MANAGEMENT <span className="text-[#C25627] font-normal">MODULES</span>
            </h2>
            <span className="font-mono text-xs text-[#DDB94E] font-bold">6 ACTIVE MODULES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Module 1: Ministers */}
            <Link
              href="/admin/ministers"
              className="p-6 bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 hover:border-[#C25627]/40 rounded-2xl transition-all group active-press flex flex-col gap-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold tracking-widest text-[#C25627] uppercase bg-[#C25627]/10 px-2.5 py-1 rounded-full">
                  DIRECTORY
                </span>
                <Users className="h-5 w-5 text-zinc-400 group-hover:text-[#C25627] transition-colors" />
              </div>
              <h3 className="font-serif text-xl font-bold group-hover:text-[#C25627] transition-colors">
                Ministers & Speakers
              </h3>
              <p className="font-sans text-xs text-zinc-600 dark:text-white/60 font-light leading-relaxed">
                Add, edit bios, photos, affiliations, and category tags for all 16 conference speakers.
              </p>
            </Link>

            {/* Module 2: Programme */}
            <Link
              href="/admin/programme"
              className="p-6 bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 hover:border-[#C25627]/40 rounded-2xl transition-all group active-press flex flex-col gap-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold tracking-widest text-[#DDB94E] uppercase bg-[#DDB94E]/10 px-2.5 py-1 rounded-full">
                  SCHEDULE
                </span>
                <Calendar className="h-5 w-5 text-zinc-400 group-hover:text-[#DDB94E] transition-colors" />
              </div>
              <h3 className="font-serif text-xl font-bold group-hover:text-[#DDB94E] transition-colors">
                Programme Sessions
              </h3>
              <p className="font-sans text-xs text-zinc-600 dark:text-white/60 font-light leading-relaxed">
                Manage 5-day schedule sessions, assign speakers, scripture texts, and venues.
              </p>
            </Link>

            {/* Module 3: Announcements */}
            <Link
              href="/admin/announcements"
              className="p-6 bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 hover:border-[#C25627]/40 rounded-2xl transition-all group active-press flex flex-col gap-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold tracking-widest text-[#E05320] uppercase bg-[#E05320]/10 px-2.5 py-1 rounded-full">
                  BROADCASTS
                </span>
                <Megaphone className="h-5 w-5 text-zinc-400 group-hover:text-[#E05320] transition-colors" />
              </div>
              <h3 className="font-serif text-xl font-bold group-hover:text-[#E05320] transition-colors">
                Announcements & News
              </h3>
              <p className="font-sans text-xs text-zinc-600 dark:text-white/60 font-light leading-relaxed">
                Broadcast urgent announcements, registration reminders, and logistics notices.
              </p>
            </Link>

            {/* Module 4: Camp Guide */}
            <Link
              href="/admin/resources"
              className="p-6 bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 hover:border-[#C25627]/40 rounded-2xl transition-all group active-press flex flex-col gap-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold tracking-widest text-[#C25627] uppercase bg-[#C25627]/10 px-2.5 py-1 rounded-full">
                  BOOKLET
                </span>
                <BookOpen className="h-5 w-5 text-zinc-400 group-hover:text-[#C25627] transition-colors" />
              </div>
              <h3 className="font-serif text-xl font-bold group-hover:text-[#C25627] transition-colors">
                Camp Guide Booklet
              </h3>
              <p className="font-sans text-xs text-zinc-600 dark:text-white/60 font-light leading-relaxed">
                Update 13 camp rules, 5 hymnal pages, and camp worship & praise songs.
              </p>
            </Link>

          </div>
        </div>

        {/* Right: Live System Audit */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-light uppercase">
              SYSTEM <span className="text-[#DDB94E] font-normal">AUDIT</span>
            </h2>
            <span className="font-mono text-xs text-emerald-500 flex items-center gap-1 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" /> LIVE
            </span>
          </div>

          <div className="p-6 bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 rounded-2xl flex flex-col gap-4 shadow-sm">
            <div className="flex items-start gap-3 text-xs border-b border-black/10 dark:border-white/5 pb-3">
              <Clock className="h-4 w-4 text-[#DDB94E] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-sans font-semibold block">Official Copy Synced</span>
                <span className="font-sans text-zinc-500 dark:text-white/50 text-[11px]">Updated 16 Ministers & 11 Sessions</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs border-b border-black/10 dark:border-white/5 pb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-sans font-semibold block">Custom Claims Active</span>
                <span className="font-sans text-zinc-500 dark:text-white/50 text-[11px]">RBAC rules enforced across endpoints</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/admin/users"
                className="w-full py-3 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 font-sans font-semibold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-1 active-press"
              >
                <span>View Staff & Audit Log →</span>
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
