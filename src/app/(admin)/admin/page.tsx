"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Calendar,
  BookOpen,
  UserCheck,
  Megaphone,
  ArrowUpRight,
  Flame,
  RefreshCw,
  Loader2,
  Settings,
  Image as ImageIcon,
  QrCode
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { hasPermission, Permissions } from "@/lib/permissions";
import { getEventScopedDocs } from "@/lib/firebase/cms";
import { getMinisters } from "@/lib/firebase/ministers";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

export default function AdminDashboardHome() {
  const { profile } = useAuth();
  const { eventId } = useAdminEvent();
  const queryClient = useQueryClient();

  const role = profile?.role || "viewer";
  const permissions = profile?.permissions || [];

  // Check permissions
  const canReadMinisters = hasPermission(permissions, Permissions.Ministers.Read);
  const canReadProgramme = hasPermission(permissions, Permissions.Programme.Read);
  const canReadAnnouncements = hasPermission(permissions, Permissions.Announcements.Read);
  const canReadResources = hasPermission(permissions, Permissions.Resources.Read);
  const canReadRegistrations = hasPermission(permissions, Permissions.Registrations.Read);
  const canReadHomepage = hasPermission(permissions, Permissions.Homepage.Read);
  const canReadUsers = hasPermission(permissions, Permissions.Users.Read);

  // Queries (fetch-on-load, no realtime listeners)
  const { data: ministers = [], isFetching: isFetchingMinisters } = useQuery({
    queryKey: ["dashboard", "ministers", eventId],
    queryFn: () => getMinisters(eventId),
    enabled: !!eventId && canReadMinisters,
    staleTime: Infinity // Only refetch manually
  });

  const { data: announcements = [], isFetching: isFetchingAnnouncements } = useQuery({
    queryKey: ["dashboard", "announcements", eventId],
    queryFn: () => getEventScopedDocs(eventId, "announcements"),
    enabled: !!eventId && canReadAnnouncements,
    staleTime: Infinity
  });

  const canReadAnalytics = hasPermission(permissions, Permissions.Analytics.Read);

  const isFetching = isFetchingMinisters || isFetchingAnnouncements;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20">
      
      {/* ── Welcome Banner (Editorial Design) ── */}
      <div className="relative w-full p-8 sm:p-10 rounded-2xl bg-surface text-foreground border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-sans text-[10px] font-bold tracking-[0.3em] text-[#C25627] uppercase flex items-center gap-2">
            <Flame className="h-4 w-4" />
            MISSION CONTROL
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase leading-none">
            Welcome back, {profile?.name || "Admin"}
          </h1>
          <p className="font-sans text-zinc-600 text-sm max-w-xl mt-1">
            Role: <span className="font-bold text-[#C25627]">{role.toUpperCase()}</span>. Access level dictates available widgets and actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasPermission(permissions, Permissions.Registrations.CheckIn) && (
            <Link
              href="/admin/checkin"
              className="px-4 py-2 bg-[#C25627] hover:bg-[#a1451f] text-white font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              Check-In
            </Link>
          )}
          <button 
            onClick={handleRefresh}
            disabled={isFetching}
            className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh Data
          </button>
        </div>
      </div>

      {/* ── Role-Specific Widgets Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">



        {canReadMinisters && (
          <div className="p-6 bg-white border border-zinc-200 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#FAF6EE] text-[#C25627]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-zinc-900 leading-none">Ministers</h3>
                  <span className="font-sans text-[10px] uppercase tracking-widest text-zinc-400">Directory Roster</span>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="font-serif text-5xl font-light text-zinc-900">{ministers.length}</span>
              <Link href="/admin/ministers" className="text-xs font-bold text-[#C25627] hover:text-[#9c431d] uppercase tracking-wider flex items-center gap-1">
                Manage <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {canReadAnnouncements && (
          <div className="p-6 bg-white border border-zinc-200 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-zinc-900 leading-none">Broadcasts</h3>
                  <span className="font-sans text-[10px] uppercase tracking-widest text-zinc-400">Live Announcements</span>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="font-serif text-5xl font-light text-zinc-900">{announcements.length}</span>
              <Link href="/admin/announcements" className="text-xs font-bold text-[#C25627] hover:text-[#9c431d] uppercase tracking-wider flex items-center gap-1">
                Manage <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* ── Quick Actions / CMS Navigation ── */}
      <div>
         <h2 className="font-sans font-bold text-xs uppercase tracking-widest text-zinc-400 mb-4">Content Management</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {canReadHomepage && (
              <Link href="/admin/homepage" className="p-5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl flex items-center gap-4 group transition-all shadow-sm hover:shadow">
                 <div className="p-3 bg-zinc-50 group-hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors">
                    <ImageIcon className="h-5 w-5" />
                 </div>
                 <div>
                    <span className="block font-serif font-bold text-zinc-900">Homepage CMS</span>
                    <span className="text-xs text-zinc-500 font-sans">Edit blocks & layout</span>
                 </div>
              </Link>
            )}

            {canReadProgramme && (
              <Link href="/admin/programme" className="p-5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl flex items-center gap-4 group transition-all shadow-sm hover:shadow">
                 <div className="p-3 bg-zinc-50 group-hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors">
                    <Calendar className="h-5 w-5" />
                 </div>
                 <div>
                    <span className="block font-serif font-bold text-zinc-900">Programme</span>
                    <span className="text-xs text-zinc-500 font-sans">Sessions & schedule</span>
                 </div>
              </Link>
            )}

            {canReadResources && (
              <Link href="/admin/resources" className="p-5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl flex items-center gap-4 group transition-all shadow-sm hover:shadow">
                 <div className="p-3 bg-zinc-50 group-hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors">
                    <BookOpen className="h-5 w-5" />
                 </div>
                 <div>
                    <span className="block font-serif font-bold text-zinc-900">Resources</span>
                    <span className="text-xs text-zinc-500 font-sans">Hymns & booklets</span>
                 </div>
              </Link>
            )}

            {canReadUsers && (
              <Link href="/admin/users" className="p-5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl flex items-center gap-4 group transition-all shadow-sm hover:shadow">
                 <div className="p-3 bg-zinc-50 group-hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors">
                    <Settings className="h-5 w-5" />
                 </div>
                 <div>
                    <span className="block font-serif font-bold text-zinc-900">Users & Roles</span>
                    <span className="text-xs text-zinc-500 font-sans">Access management</span>
                 </div>
              </Link>
            )}

         </div>
      </div>

      {/* ── Advanced Analytics ── */}
      {canReadAnalytics && (
        <div className="mt-4 pt-8 border-t border-border">
           <div className="flex items-center justify-between mb-6">
              <div>
                 <span className="font-sans text-[10px] font-bold tracking-[0.2em] text-[#C25627] uppercase block mb-1">
                   Telemetry & Insights
                 </span>
                 <h2 className="font-serif text-2xl font-bold uppercase text-zinc-900 dark:text-white">
                   Attendance Analytics
                 </h2>
              </div>
           </div>
           <AnalyticsDashboard />
        </div>
      )}

    </div>
  );
}
