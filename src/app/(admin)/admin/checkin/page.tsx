// "use client" directive ensures client-side rendering
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, CheckCircle, AlertCircle, UserCheck, WifiOff, Loader2, Undo2, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { getSystemSettings } from "@/lib/firebase/settings";
import { getEvents } from "@/lib/firebase/events";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { Modal } from "@/components/shared/Modal";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { db } from "@/lib/db";

export default function AdminCheckInPage() {
  // Fetch system settings and events
  const { data: settings, isError: isSettingsError, error: settingsError } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getSystemSettings,
  });

  const { data: eventsList = [], isError: isEventsError, error: eventsError } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: getEvents,
  });

  const [selectedEventId, setSelectedEventId] = useState<string>("refreshing-2026");
  const [searchInput, setSearchInput] = useState("");
  const PAGE_SIZE = 30;
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  // Initialise selected event from settings when available
  useEffect(() => {
    if (settings && !selectedEventId) {
      setSelectedEventId(settings.defaultEventId);
    }
  }, [settings, selectedEventId]);

  // Offline sync hook
  const { isOnline, isSyncing, handleCheckIn, handleUndoCheckIn } = useOfflineSync(selectedEventId);

  // Live query from Dexie (local cache)
  const attendees = useLiveQuery(
    () => db.attendees.where('eventId').equals(selectedEventId).toArray(),
    [selectedEventId],
    []
  );

  // Client‑side filtering based on search input
  const filteredAttendees = attendees.filter((a) => {
    if (!searchInput.trim()) return true;
    const term = searchInput.toLowerCase();
    return (
      a.fullName.toLowerCase().includes(term) ||
      (a.phoneMasked && a.phoneMasked.toLowerCase().includes(term)) ||
      (a.churchName && a.churchName.toLowerCase().includes(term)) ||
      (a.associationName && a.associationName.toLowerCase().includes(term)) ||
      (a.campusFellowshipName && a.campusFellowshipName.toLowerCase().includes(term)) ||
      a.id.toLowerCase().includes(term)
    );
  });

  // Reset displayed count whenever the filtered list changes (new search)
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [filteredAttendees]);

  // Infinite‑scroll sentinel reference
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Load more when sentinel enters viewport
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && displayCount < filteredAttendees.length) {
        setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, filteredAttendees.length));
      }
    });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [displayCount, filteredAttendees]);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [undoAttendeeId, setUndoAttendeeId] = useState<string | null>(null);

  const onCheckIn = async (attendeeId: string) => {
    setProcessingId(attendeeId);
    try {
      await handleCheckIn(attendeeId);
    } finally {
      setProcessingId(null);
      // Clear search to move quickly to next attendee
      setSearchInput("");
    }
  };

  const confirmUndoCheckIn = async () => {
    if (!undoAttendeeId) return;
    const idToUndo = undoAttendeeId;
    setUndoAttendeeId(null);
    setProcessingId(idToUndo);
    try {
      await handleUndoCheckIn(idToUndo);
    } finally {
      setProcessingId(null);
    }
  };

  const totalAttendees = filteredAttendees.length;
  const checkedInCount = filteredAttendees.filter(a => a.checkedInAt).length;

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      {/* Error banners */}
      {(isSettingsError || isEventsError) && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-start gap-3 shadow-sm backdrop-blur-md">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="font-sans text-sm font-medium">
            Failed to load required data: {((settingsError || eventsError) as Error)?.message || "Permission Denied or Unknown Error"}
          </p>
        </div>
      )}

      {/* Connectivity Status */}
      <div className="flex flex-col gap-2">
        {!isOnline && (
          <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 p-4 rounded-2xl flex items-center gap-4 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-4">
            <div className="bg-amber-500/20 p-2 rounded-full"><WifiOff className="h-5 w-5 shrink-0" /></div>
            <div>
              <p className="font-sans font-bold text-sm">Offline Mode Active</p>
              <p className="text-xs mt-1 opacity-80">Check‑ins are saved locally and will automatically sync when connection is restored.</p>
            </div>
          </div>
        )}

        {isSyncing && isOnline && (
          <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400 p-4 rounded-2xl flex items-center gap-4 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-4">
            <div className="bg-blue-500/20 p-2 rounded-full"><Loader2 className="h-5 w-5 shrink-0 animate-spin" /></div>
            <div>
              <p className="font-sans font-bold text-sm">Syncing Records</p>
              <p className="text-xs mt-1 opacity-80">Uploading offline check-ins to the server...</p>
            </div>
          </div>
        )}
      </div>

      {/* Header section with Stats */}
      <div className="bg-white dark:bg-[#181612] rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#C25627]/20 to-transparent rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
        
        <div className="z-10">
          <span className="font-mono text-[10px] text-[#C25627] uppercase tracking-widest block font-bold mb-2">Live Operations</span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#0B0907] dark:text-[#FCFAF6] uppercase flex items-center gap-3">
            Check-In Desk
          </h1>
          <p className="font-sans text-sm text-black/60 dark:text-white/60 mt-3 max-w-md leading-relaxed">
            Quickly find and admit attendees using name, last 4 digits of phone, church, or registration ID.
          </p>
        </div>

        <div className="flex gap-4 z-10 w-full md:w-auto">
           <div className="bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex-1 md:w-32 flex flex-col items-center justify-center text-center shadow-sm">
             <span className="text-3xl font-serif font-light text-[#0B0907] dark:text-[#FCFAF6]">{totalAttendees}</span>
             <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mt-1">Found</span>
           </div>
           <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex-1 md:w-32 flex flex-col items-center justify-center text-center shadow-sm">
             <span className="text-3xl font-serif font-light text-emerald-600 dark:text-emerald-400">{checkedInCount}</span>
             <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-500 tracking-wider mt-1">Checked In</span>
           </div>
        </div>
      </div>

      {/* Search area with premium style */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C25627] to-[#E05320] rounded-[2rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity -z-10" />
        <div className="relative bg-white/80 dark:bg-[#181612]/80 backdrop-blur-xl border-2 border-transparent focus-within:border-[#C25627] rounded-[2rem] p-2 flex items-center transition-colors shadow-lg">
          <div className="pl-6 pr-4">
            <Search className="h-6 w-6 text-zinc-400 group-focus-within:text-[#C25627] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by name, phone, church, or ID…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={!selectedEventId}
            className="w-full bg-transparent text-lg md:text-xl font-sans py-4 outline-none text-[#0B0907] dark:text-[#FCFAF6] placeholder:text-zinc-400"
            autoFocus
          />
        </div>
      </div>

      {/* Results area */}
      <div className="bg-white/60 dark:bg-[#181612]/60 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        {filteredAttendees.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="bg-black/5 dark:bg-white/5 p-6 rounded-full mb-4">
              <Users className="h-10 w-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-serif font-bold text-zinc-700 dark:text-zinc-300">No attendees found</h3>
            <p className="text-sm text-zinc-500 mt-2">No records match "{searchInput}". Try searching with a different term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-zinc-100/50 dark:bg-white/[0.02] border-b border-black/10 dark:border-white/10 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                <tr>
                  <th className="px-8 py-5">Attendee</th>
                  <th className="px-8 py-5">Contact & Church</th>
                  <th className="px-8 py-5">Registration</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredAttendees.slice(0, displayCount).map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-zinc-50/80 dark:hover:bg-white/[0.04] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center shrink-0 border border-white dark:border-zinc-700 shadow-sm">
                           <span className="font-serif font-bold text-zinc-600 dark:text-zinc-400">{attendee.fullName.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-bold text-base text-[#0B0907] dark:text-[#FCFAF6]">{attendee.fullName}</div>
                          <div className="font-mono text-xs text-[#C25627] mt-1 tracking-wider">{attendee.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-zinc-600 dark:text-zinc-400">
                      <div className="font-medium text-zinc-900 dark:text-zinc-300">{attendee.phoneMasked || "No Phone"}</div>
                      <div className="text-xs mt-1 truncate max-w-[200px]" title={attendee.churchName || attendee.associationName || attendee.campusFellowshipName || "No Church listed"}>
                        {attendee.churchName || attendee.associationName || attendee.campusFellowshipName || "-"}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        attendee.memberStatus.toLowerCase().includes('exec') 
                          ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' 
                          : 'bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {attendee.memberStatus}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {attendee.checkedInAt ? (
                        <div className="flex items-center justify-end gap-3">
                          <div className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-sm">
                            <CheckCircle className="h-4 w-4" />
                            Admitted
                          </div>
                          <button
                            onClick={() => setUndoAttendeeId(attendee.id)}
                            disabled={processingId === attendee.id}
                            title="Undo Check-in"
                            className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                          >
                            {processingId === attendee.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Undo2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onCheckIn(attendee.id)}
                          disabled={processingId === attendee.id}
                          className="inline-flex items-center justify-center gap-2 px-8 py-3 min-h-[44px] bg-[#C25627] hover:bg-[#E05320] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                          {processingId === attendee.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Admit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAttendees.length > displayCount && (
              <div className="p-6 text-center text-xs text-zinc-500 bg-zinc-50/50 dark:bg-white/[0.02]">
                Showing <span className="font-bold">{displayCount}</span> of <span className="font-bold">{filteredAttendees.length}</span> results. Keep scrolling to load more.
              </div>
            )}
            {displayCount < filteredAttendees.length && (
              <div ref={loadMoreRef} className="h-12" />
            )}
          </div>
        )}
      </div>

      {!!undoAttendeeId && (
        <Modal onClose={() => setUndoAttendeeId(null)} title="Undo Check-In">
          <div className="space-y-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Are you sure you want to undo the check-in for this attendee? This will remove their admitted status.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setUndoAttendeeId(null)}
                className="px-4 py-2 font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                disabled={undoCheckInMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={() => undoCheckInMutation.mutate()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-2"
                disabled={undoCheckInMutation.isPending}
              >
                {undoCheckInMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Undo Check-In
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
