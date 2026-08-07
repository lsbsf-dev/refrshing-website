"use client";

import React, { useState, useEffect } from "react";
import { Search, CheckCircle, AlertCircle, UserCheck, WifiOff, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { getSystemSettings } from "@/lib/firebase/settings";
import { getEvents } from "@/lib/firebase/events";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { db } from "@/lib/db";

export default function AdminCheckInPage() {
  const { data: settings } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getSystemSettings,
  });

  const { data: eventsList = [] } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: getEvents,
  });

  const [selectedEventId, setSelectedEventId] = useState<string>("refreshing-2026");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (settings && !selectedEventId) {
      setSelectedEventId(settings.defaultEventId);
    }
  }, [settings, selectedEventId]);

  // Hook into offline sync
  const { isOnline, isSyncing, handleCheckIn } = useOfflineSync(selectedEventId);

  // Live query from Dexie
  const attendees = useLiveQuery(
    () => db.attendees.where('eventId').equals(selectedEventId).toArray(),
    [selectedEventId],
    []
  );

  // Client-side filtering
  const filteredAttendees = attendees.filter((a) => {
    if (!searchInput.trim()) return true;
    const term = searchInput.toLowerCase();
    return (
      a.name.toLowerCase().includes(term) ||
      (a.phoneMasked && a.phoneMasked.toLowerCase().includes(term)) ||
      (a.church && a.church.toLowerCase().includes(term)) ||
      (a.association && a.association.toLowerCase().includes(term)) ||
      a.id.toLowerCase().includes(term)
    );
  });

  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const onCheckIn = async (attendeeId: string) => {
    setCheckingInId(attendeeId);
    try {
      await handleCheckIn(attendeeId);
    } finally {
      setCheckingInId(null);
      setSearchInput(""); // Clear search to quickly move to the next person
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
      
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-3 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
          <WifiOff className="h-5 w-5 shrink-0" />
          <p className="font-sans font-bold text-sm">
            You are offline. Check-ins are being saved locally and will sync automatically when connection is restored.
          </p>
        </div>
      )}

      {isSyncing && isOnline && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 p-3 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
          <p className="font-sans font-bold text-sm">
            Syncing offline check-ins to server...
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#0B0907] dark:text-[#FCFAF6] mb-2 uppercase flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-[#C25627]" />
            Attendee Check-In
          </h1>
          <p className="font-sans text-sm text-black/60 dark:text-white/60">
            Search for attendees by name, phone (last 4), church, or ID.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by name, phone, church, or ID..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={!selectedEventId}
          className="w-full bg-white dark:bg-[#181612] border border-black/10 dark:border-white/10 text-lg font-sans py-4 pl-12 pr-4 rounded-3xl outline-none focus:border-[#C25627] dark:focus:border-[#C25627] transition-colors shadow-sm"
          autoFocus
        />
      </div>

      {/* Results List */}
      <div className="bg-white dark:bg-[#181612] border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        {filteredAttendees.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">
            <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No attendees found matching "{searchInput}"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-zinc-50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-xs uppercase font-bold text-zinc-500">
                <tr>
                  <th className="px-6 py-4">Attendee</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Category & ID</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredAttendees.slice(0, 50).map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0B0907] dark:text-[#FCFAF6]">{attendee.name}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      <div>{attendee.phoneMasked || "-"}</div>
                      <div className="text-xs">{attendee.church || attendee.association || "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#C25627] capitalize">{attendee.ticketStatus}</div>
                      <div className="font-mono text-xs text-zinc-500">{attendee.id}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {attendee.checkedInAt ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <CheckCircle className="h-4 w-4" />
                          Checked In
                        </div>
                      ) : (
                        <button
                          onClick={() => onCheckIn(attendee.id)}
                          disabled={checkingInId === attendee.id}
                          className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#C25627] hover:bg-[#a1451f] text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                        >
                          {checkingInId === attendee.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAttendees.length > 50 && (
              <div className="p-4 text-center text-xs text-zinc-500 bg-zinc-50 dark:bg-white/5">
                Showing 50 of {filteredAttendees.length} results. Please refine your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
