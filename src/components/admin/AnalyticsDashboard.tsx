"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsSummary, getAssociationAnalytics, AnalyticsSummary, AssociationAnalytics } from "@/lib/firebase/analytics";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Loader2, AlertCircle, ChevronDown, ChevronRight, BarChart3, Users, QrCode } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell, CartesianGrid } from "recharts";

const CONFERENCE_LABELS: Record<string, string> = {
  "lagos_east": "Lagos East",
  "lagos_west": "Lagos West",
  "lagos_central": "Lagos Central",
  "campus_fellowship": "Campus Fellowship",
  "other": "Others"
};

export function AnalyticsDashboard() {
  const { eventId, isLoading: isEventLoading } = useAdminEvent();

  const { data: summary, isLoading: isLoadingSummary, isError: isErrorSummary } = useQuery({
    queryKey: ["analytics", "summary", eventId],
    queryFn: () => getAnalyticsSummary(eventId!),
    enabled: !isEventLoading && !!eventId,
  });

  const { data: associations = [], isLoading: isLoadingAssoc, isError: isErrorAssoc } = useQuery({
    queryKey: ["analytics", "associations", eventId],
    queryFn: () => getAssociationAnalytics(eventId!),
    enabled: !isEventLoading && !!eventId,
  });

  const [expandedConference, setExpandedConference] = useState<string | null>(null);

  const conferenceChartData = useMemo(() => {
    if (!summary?.conferences) return [];
    return Object.entries(summary.conferences)
      .map(([confId, stats]) => ({
        name: CONFERENCE_LABELS[confId] || confId,
        registered: stats.registered,
        checkedIn: stats.checkedIn,
      }))
      .sort((a, b) => b.registered - a.registered);
  }, [summary]);

  const toggleConference = (confId: string) => {
    setExpandedConference(expandedConference === confId ? null : confId);
  };

  if (isLoadingSummary || isLoadingAssoc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-2xl border border-border shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[#C25627] mb-4" />
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">Loading Analytics...</span>
      </div>
    );
  }

  if (isErrorSummary || isErrorAssoc) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-8 rounded-2xl text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <p className="font-serif font-bold text-lg text-red-600 dark:text-red-400">Failed to load analytics</p>
        <p className="text-sm text-red-500/80">Please check your network and try again.</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-20 bg-surface rounded-2xl border border-border shadow-sm">
        <BarChart3 className="h-10 w-10 text-zinc-300 mx-auto mb-4" />
        <p className="font-serif text-lg font-medium">No analytics data available yet.</p>
      </div>
    );
  }

  const { totalRegistered, totalCheckedIn } = summary;
  const attendanceRate = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* ── Global Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-foreground-muted">Total Registered</h3>
          </div>
          <span className="font-serif text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white relative z-10">
            {totalRegistered.toLocaleString()}
          </span>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity z-0 pointer-events-none">
            <Users className="h-32 w-32" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-foreground-muted">Total Checked-In</h3>
          </div>
          <span className="font-serif text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white relative z-10">
            {totalCheckedIn.toLocaleString()}
          </span>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity z-0 pointer-events-none">
            <QrCode className="h-32 w-32" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#C25627] to-[#e46b38] text-white rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-white/90">Turnout Rate</h3>
          </div>
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="font-serif text-4xl sm:text-5xl font-bold">
              {attendanceRate}
            </span>
            <span className="font-serif text-2xl">%</span>
          </div>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        </div>
      </div>

      {/* ── Main Chart ── */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="font-serif text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
          CONFERENCE BREAKDOWN
        </h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={conferenceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fill: '#888888', fontSize: 12, fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#888888', fontSize: 12, fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              <Bar dataKey="registered" name="Registered" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="checkedIn" name="Checked In" fill="#C25627" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Detailed Accordion Breakdown ── */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border">
           <h2 className="font-serif text-xl font-bold">ASSOCIATION & CAMPUS DETAILS</h2>
           <p className="font-sans text-xs text-zinc-500 mt-1">Click a conference to view its breakdown</p>
        </div>
        
        <div className="flex flex-col divide-y divide-zinc-100 dark:divide-white/5">
          {Object.entries(summary.conferences)
            .sort(([, a], [, b]) => b.registered - a.registered)
            .map(([confId, stats]) => {
              const isExpanded = expandedConference === confId;
              const confAssocs = associations
                .filter((a) => a.conferenceId === confId)
                .sort((a, b) => b.registered - a.registered);

              return (
                <div key={confId} className="flex flex-col">
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleConference(confId)}
                    className={`flex items-center justify-between p-4 sm:p-5 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors text-left ${isExpanded ? "bg-surface-muted" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-full transition-transform ${isExpanded ? "rotate-90 bg-zinc-200 dark:bg-white/10" : "bg-transparent text-zinc-400"}`}>
                        <ChevronRight className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-sans font-bold text-sm sm:text-base text-zinc-900 dark:text-white uppercase tracking-wider block">
                          {CONFERENCE_LABELS[confId] || confId}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500 uppercase mt-0.5 block">
                          {confAssocs.length} sub-groups
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-right">
                      <div className="hidden sm:block">
                        <span className="block font-sans text-xs font-bold text-zinc-500 uppercase">Reg</span>
                        <span className="block font-serif font-medium text-lg">{stats.registered}</span>
                      </div>
                      <div className="hidden sm:block">
                        <span className="block font-sans text-xs font-bold text-zinc-500 uppercase">In</span>
                        <span className="block font-serif font-medium text-lg text-emerald-600 dark:text-emerald-400">{stats.checkedIn}</span>
                      </div>
                      {/* Mobile unified stat */}
                      <div className="sm:hidden font-serif font-medium text-lg">
                        {stats.checkedIn} / {stats.registered}
                      </div>
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 bg-zinc-50/50 dark:bg-black/20 border-t border-zinc-100 dark:border-white/5 shadow-inner">
                      {confAssocs.length === 0 ? (
                        <p className="text-center font-sans text-sm text-zinc-500 py-4">No data available for this conference yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {confAssocs.map((assoc) => {
                            const rate = assoc.registered > 0 ? Math.round((assoc.checkedIn / assoc.registered) * 100) : 0;
                            return (
                              <div key={assoc.id} className="bg-white dark:bg-[#1A1813] border border-border p-3.5 rounded-xl shadow-sm flex items-center justify-between gap-3">
                                <div className="flex flex-col min-w-0">
                                  <span className="font-sans text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate" title={assoc.name}>
                                    {assoc.name}
                                  </span>
                                  <span className="font-mono text-[10px] text-zinc-400 uppercase mt-1">
                                    Turnout: {rate}%
                                  </span>
                                </div>
                                <div className="flex items-end gap-1.5 shrink-0 bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                                  <span className="font-serif font-bold text-sm text-emerald-600 dark:text-emerald-400">{assoc.checkedIn}</span>
                                  <span className="font-sans text-[10px] font-bold text-zinc-400 mb-[2px]">/</span>
                                  <span className="font-serif font-medium text-xs text-zinc-500 mb-[1px]">{assoc.registered}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
      
    </div>
  );
}
