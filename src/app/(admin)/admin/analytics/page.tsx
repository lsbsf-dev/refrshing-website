"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSystemSettings } from "@/lib/firebase/settings";
import { getAttendees, Attendee } from "@/lib/firebase/attendees";
import { BarChart3, RefreshCw, Loader2, Users } from "lucide-react";

export default function AdminAnalyticsPage() {
  const { data: settings, isError: isSettingsError, error: settingsError } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getSystemSettings,
  });

  const eventId = settings?.defaultEventId;

  const { data: attendees = [], isLoading, isFetching, refetch, isError: isAttendeesError, error: attendeesError } = useQuery({
    queryKey: ["admin", "analytics", eventId],
    queryFn: () => getAttendees(eventId as string),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes, avoids auto-refetching constantly
  });

  // Calculate breakdowns
  const conferenceCounts: Record<string, number> = {};
  const associationCounts: Record<string, number> = {};
  const churchCounts: Record<string, number> = {};
  const campusCounts: Record<string, number> = {};

  let totalMembers = 0;
  let totalExecutives = 0;

  attendees.forEach(a => {
    // Conference
    const confName = a.conferenceName || a.conferenceId.replace('_', ' ');
    conferenceCounts[confName] = (conferenceCounts[confName] || 0) + 1;

    // Association / Campus
    if (a.conferenceId === 'campus_fellowship') {
      const campName = a.campusFellowshipName || 'Unknown Campus';
      campusCounts[campName] = (campusCounts[campName] || 0) + 1;
    } else {
      const assocName = a.associationName || 'Unknown Association';
      associationCounts[assocName] = (associationCounts[assocName] || 0) + 1;
      
      const churchName = a.churchName || 'Unknown Church';
      churchCounts[churchName] = (churchCounts[churchName] || 0) + 1;
    }

    if (a.memberStatus === 'Executive') totalExecutives++;
    else totalMembers++;
  });

  const sortByCount = (obj: Record<string, number>) => {
    return Object.entries(obj).sort((a, b) => b[1] - a[1]);
  };

  const conferenceData = sortByCount(conferenceCounts);
  const associationData = sortByCount(associationCounts).slice(0, 15); // Top 15
  const churchData = sortByCount(churchCounts).slice(0, 15); // Top 15
  const campusData = sortByCount(campusCounts);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#0B0907] dark:text-[#FCFAF6] mb-2 uppercase flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-[#C25627]" />
            Analytics & Reports
          </h1>
          <p className="font-sans text-sm text-black/60 dark:text-white/60">
            Historical and snapshot data for registrations.
          </p>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-zinc-500 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Analyzing registration data...</p>
        </div>
      ) : (isSettingsError || isAttendeesError) ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-3xl flex flex-col items-center justify-center py-20 text-center">
          <p className="font-sans font-bold text-lg mb-2">Failed to load analytics</p>
          <p className="text-sm">
            {((settingsError || attendeesError) as Error)?.message || "Permission Denied or Unknown Error"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          
          {/* Top Level KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#181612] p-6 rounded-3xl border border-black/10 dark:border-white/10 shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 text-zinc-500">
                <Users className="h-5 w-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Total Registrations</h3>
              </div>
              <p className="font-serif text-5xl font-bold text-[#0B0907] dark:text-[#FCFAF6]">
                {attendees.length.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-[#181612] p-6 rounded-3xl border border-black/10 dark:border-white/10 shadow-sm flex flex-col gap-2">
               <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-500 mb-1">Role Breakdown</h3>
               <div className="flex justify-between items-center mt-2">
                 <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Members</span>
                 <span className="font-mono font-bold text-lg">{totalMembers.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm font-bold text-[#C25627]">Executives</span>
                 <span className="font-mono font-bold text-lg text-[#C25627]">{totalExecutives.toLocaleString()}</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conference Breakdown */}
            <div className="bg-white dark:bg-[#181612] border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold mb-4 uppercase">By Conference</h2>
              <div className="space-y-3">
                {conferenceData.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 capitalize">{name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C25627]" style={{ width: `${(count / attendees.length) * 100}%` }}></div>
                      </div>
                      <span className="font-mono font-bold text-sm w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campus Breakdown */}
            <div className="bg-white dark:bg-[#181612] border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold mb-4 uppercase">Campus Fellowships</h2>
              {campusData.length === 0 ? (
                <p className="text-sm text-zinc-500">No campus registrations yet.</p>
              ) : (
                <div className="space-y-3">
                  {campusData.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{name}</span>
                      <span className="font-mono font-bold text-sm">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Associations */}
            <div className="bg-white dark:bg-[#181612] border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold mb-4 uppercase">Top Associations</h2>
              <div className="space-y-3">
                {associationData.map(([name, count], i) => (
                  <div key={name} className="flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-zinc-400 w-4">{i + 1}.</span>
                      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{name}</span>
                    </div>
                    <span className="font-mono font-bold text-sm">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Churches */}
            <div className="bg-white dark:bg-[#181612] border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold mb-4 uppercase">Top Churches</h2>
              <div className="space-y-3">
                {churchData.map(([name, count], i) => (
                  <div key={name} className="flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-zinc-400 w-4">{i + 1}.</span>
                      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{name}</span>
                    </div>
                    <span className="font-mono font-bold text-sm">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
