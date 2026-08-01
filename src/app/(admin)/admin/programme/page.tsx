/**
 * Admin Programme Page Component
 *  * Manages event schedules and sessions.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Edit2, Plus, Sparkles, X, Save, User } from "lucide-react";
import seedSessions from "@/lib/firebase/seedSessions.json";
import { Session } from "@/types/programme";
import { ScrollableTabBar } from "@/components/shared/ScrollableTabBar";

export default function AdminProgrammePage() {
  const [sessionsList, setSessionsList] = useState<Session[]>(seedSessions as Session[]);
  const [selectedDayFilter, setSelectedDayFilter] = useState("all");
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (editingSession) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [editingSession]);

  const daysConfig = [
    { id: "all", label: "All Days" },
    { id: "DAY ONE", label: "Monday (Day 1)" },
    { id: "DAY TWO", label: "Tuesday (Day 2)" },
    { id: "DAY THREE", label: "Wednesday (Day 3)" },
    { id: "DAY FOUR", label: "Thursday (Day 4)" },
    { id: "DAY FIVE", label: "Friday (Day 5)" },
  ];

  const filteredSessions = sessionsList.filter((s) => {
    if (selectedDayFilter === "all") return true;
    return s.day.toUpperCase() === selectedDayFilter.toUpperCase();
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession || !editingSession.title.trim()) return;
    setSessionsList((prev) =>
      prev.map((s) => (s.id === editingSession.id ? editingSession : s))
    );
    setEditingSession(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs font-bold tracking-[0.3em] text-[#DDB94E] uppercase block mb-1">
            5-DAY SCHEDULE CONTROL
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light uppercase">
            PROGRAMME <span className="text-[#C25627] font-normal">SESSIONS</span>
          </h1>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 text-xs font-sans font-semibold flex items-center gap-2 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>Session schedule updated successfully!</span>
        </div>
      )}

      {/* Day Filter Bar */}
      <div className="overflow-hidden">
        <ScrollableTabBar className="gap-2" isDark={true}>
          {daysConfig.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDayFilter(d.id)}
              className={`flex-shrink-0 whitespace-nowrap px-5 py-2.5 rounded-xl font-sans text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                selectedDayFilter === d.id
                  ? "bg-[#C25627] text-white shadow-md font-bold"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {d.label}
            </button>
          ))}
        </ScrollableTabBar>
      </div>

      {/* ── Sessions List ── */}
      <div className="flex flex-col gap-4">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="p-6 bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#C25627]/40 transition-all shadow-sm"
          >
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs font-bold tracking-widest text-[#DDB94E] bg-[#DDB94E]/10 border border-[#DDB94E]/20 px-3 py-1 uppercase rounded-full">
                  {session.day}
                </span>
                <span className="font-mono text-xs text-[#C25627] font-bold flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {session.startTime} – {session.endTime}
                </span>
                {session.venue && (
                  <span className="font-sans text-xs text-zinc-500 dark:text-white/50 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {session.venue}
                  </span>
                )}
              </div>

              <h3 className="font-serif text-xl font-bold mt-1 truncate">
                {session.title}
              </h3>

              {session.scriptureText && (
                <p className="font-mono text-xs text-[#C25627] tracking-wider uppercase font-semibold">
                  Text: {session.scriptureText}
                </p>
              )}

              {session.ministerNames && session.ministerNames.length > 0 && (
                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-600 dark:text-white/70">
                  <User className="h-3.5 w-3.5 text-[#DDB94E]" />
                  <span>Minister: <strong className="font-semibold">{session.ministerNames.join(", ")}</strong></span>
                </div>
              )}
            </div>

            <button
              onClick={() => setEditingSession(session)}
              className="px-5 py-2.5 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Edit2 className="h-3.5 w-3.5 text-[#C25627]" />
              <span>Edit Session</span>
            </button>
          </div>
        ))}
      </div>

      {/* ── Edit Session Modal (Solid Opaque Background, Scroll Locked) ── */}
      {editingSession && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-xl bg-white dark:bg-[#181612] text-[#0B0907] dark:text-[#FCFAF6] border border-black/15 dark:border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <h3 className="font-serif text-2xl font-bold uppercase">
                EDIT SESSION
              </h3>
              <button
                type="button"
                onClick={() => setEditingSession(null)}
                className="p-2 text-zinc-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Session Topic Title <span className="text-[#C25627]">*</span>
              </label>
              <input
                type="text"
                required
                value={editingSession.title}
                onChange={(e) =>
                  setEditingSession({ ...editingSession, title: e.target.value })
                }
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Start Time
                </label>
                <input
                  type="text"
                  value={editingSession.startTime}
                  onChange={(e) =>
                    setEditingSession({ ...editingSession, startTime: e.target.value })
                  }
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  End Time
                </label>
                <input
                  type="text"
                  value={editingSession.endTime}
                  onChange={(e) =>
                    setEditingSession({ ...editingSession, endTime: e.target.value })
                  }
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Scripture Text <span className="font-mono text-[10px] font-normal text-zinc-400 lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={editingSession.scriptureText || ""}
                onChange={(e) =>
                  setEditingSession({ ...editingSession, scriptureText: e.target.value })
                }
                placeholder="e.g. 2 Corinthians 3:18"
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Venue <span className="font-mono text-[10px] font-normal text-zinc-400 lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={editingSession.venue || ""}
                onChange={(e) =>
                  setEditingSession({ ...editingSession, venue: e.target.value })
                }
                placeholder="Baptist Academy Auditorium"
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setEditingSession(null)}
                className="px-6 py-3 bg-zinc-100 dark:bg-white/5 font-sans font-bold text-xs uppercase rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Session</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
