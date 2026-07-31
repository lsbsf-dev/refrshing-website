"use client";

import React, { useState } from "react";
import { Calendar, Clock, MapPin, Edit2, Plus, Sparkles, X, Save, User } from "lucide-react";
import seedSessions from "@/lib/firebase/seedSessions.json";
import seedMinisters from "@/lib/firebase/seedMinisters.json";
import { Session } from "@/types/programme";

export default function AdminProgrammePage() {
  const [sessionsList, setSessionsList] = useState<Session[]>(seedSessions as Session[]);
  const [selectedDayFilter, setSelectedDayFilter] = useState("all");
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    if (!editingSession) return;
    setSessionsList((prev) =>
      prev.map((s) => (s.id === editingSession.id ? editingSession : s))
    );
    setEditingSession(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 text-[#FCFAF6]">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs font-bold tracking-[0.3em] text-[#DDB94E] uppercase block mb-1">
            5-DAY SCHEDULE CONTROL
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light uppercase text-white">
            PROGRAMME <span className="text-[#C25627] font-normal">SESSIONS</span>
          </h1>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-sans font-semibold flex items-center gap-2 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>Session schedule updated successfully!</span>
        </div>
      )}

      {/* Day Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {daysConfig.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDayFilter(d.id)}
            className={`px-5 py-2.5 rounded-xl font-sans text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
              selectedDayFilter === d.id
                ? "bg-[#C25627] text-white shadow-md font-bold"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* ── Sessions List ── */}
      <div className="flex flex-col gap-4">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="p-6 bg-[#14120E] border border-white/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/20 transition-all shadow-md"
          >
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs font-bold tracking-widest text-[#DDB94E] bg-[#DDB94E]/10 border border-[#DDB94E]/20 px-3 py-1 uppercase rounded-full">
                  {session.day}
                </span>
                <span className="font-mono text-xs text-[#C25627] flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {session.startTime} – {session.endTime}
                </span>
                {session.venue && (
                  <span className="font-sans text-xs text-white/50 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {session.venue}
                  </span>
                )}
              </div>

              <h3 className="font-serif text-xl font-bold text-white mt-1">
                {session.title}
              </h3>

              {session.scriptureText && (
                <p className="font-mono text-xs text-[#C25627] tracking-wider uppercase">
                  Text: {session.scriptureText}
                </p>
              )}

              {session.ministerNames && session.ministerNames.length > 0 && (
                <div className="flex items-center gap-2 mt-1 text-xs text-white/70">
                  <User className="h-3.5 w-3.5 text-[#DDB94E]" />
                  <span>Minister: <strong className="text-white font-semibold">{session.ministerNames.join(", ")}</strong></span>
                </div>
              )}
            </div>

            <button
              onClick={() => setEditingSession(session)}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active-press"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Session</span>
            </button>
          </div>
        ))}
      </div>

      {/* ── Edit Session Modal ── */}
      {editingSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-xl bg-[#14120E] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-serif text-2xl font-light text-white uppercase">
                EDIT <span className="text-[#C25627]">SESSION</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingSession(null)}
                className="text-white/50 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                Session Topic Title
              </label>
              <input
                type="text"
                required
                value={editingSession.title}
                onChange={(e) =>
                  setEditingSession({ ...editingSession, title: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                  Start Time
                </label>
                <input
                  type="text"
                  value={editingSession.startTime}
                  onChange={(e) =>
                    setEditingSession({ ...editingSession, startTime: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                  End Time
                </label>
                <input
                  type="text"
                  value={editingSession.endTime}
                  onChange={(e) =>
                    setEditingSession({ ...editingSession, endTime: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                Scripture Text
              </label>
              <input
                type="text"
                value={editingSession.scriptureText || ""}
                onChange={(e) =>
                  setEditingSession({ ...editingSession, scriptureText: e.target.value })
                }
                placeholder="e.g. 2 Corinthians 3:18"
                className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                Venue
              </label>
              <input
                type="text"
                value={editingSession.venue || ""}
                onChange={(e) =>
                  setEditingSession({ ...editingSession, venue: e.target.value })
                }
                placeholder="Baptist Academy Auditorium"
                className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingSession(null)}
                className="px-6 py-3 bg-white/5 text-white text-xs font-bold uppercase rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white text-xs font-bold uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer"
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
