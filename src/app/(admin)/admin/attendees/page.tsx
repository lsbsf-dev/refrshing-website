"use client";

import React, { useState } from "react";
import { UserCheck, Search, QrCode, CheckCircle2, Clock, Filter, ShieldCheck, Sparkles } from "lucide-react";

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  chapter: string;
  tagNumber: string;
  checkedIn: boolean;
  checkInTime?: string;
  hostelBlock?: string;
}

const mockAttendees: Attendee[] = [
  {
    id: "REF-2026-001",
    name: "Emmanuel Adeleke",
    email: "emmanuel@lasu.edu.ng",
    phone: "+2348012345678",
    chapter: "LASU BSF (Lagos West)",
    tagNumber: "TAG-104",
    checkedIn: true,
    checkInTime: "Aug 10, 09:15 AM",
    hostelBlock: "Block A - Room 12",
  },
  {
    id: "REF-2026-002",
    name: "Timi Idowu",
    email: "timi.idowu@unilag.edu.ng",
    phone: "+2348087654321",
    chapter: "UNILAG BSF (Lagos Central)",
    tagNumber: "TAG-105",
    checkedIn: true,
    checkInTime: "Aug 10, 09:40 AM",
    hostelBlock: "Block B - Room 08",
  },
  {
    id: "REF-2026-003",
    name: "Segun Olawoyin",
    email: "segun@yabatech.edu.ng",
    phone: "+2348033334444",
    chapter: "YABATECH BSF (Lagos Central)",
    tagNumber: "TAG-106",
    checkedIn: false,
  },
  {
    id: "REF-2026-004",
    name: "Helen Olanrewaju",
    email: "helen@fceakoka.edu.ng",
    phone: "+2348055556666",
    chapter: "FCE(T) AKOKA BSF (Lagos Central)",
    tagNumber: "TAG-107",
    checkedIn: false,
  },
  {
    id: "REF-2026-005",
    name: "Victor Ogunleye",
    email: "victor@lasustech.edu.ng",
    phone: "+2348099998888",
    chapter: "LASUSTECH BSF (Lagos East)",
    tagNumber: "TAG-108",
    checkedIn: true,
    checkInTime: "Aug 10, 10:20 AM",
    hostelBlock: "Block C - Room 04",
  },
];

export default function AdminAttendeesPage() {
  const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "checkedIn" | "pending">("all");
  const [lastCheckinName, setLastCheckinName] = useState<string | null>(null);

  const filtered = attendees.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tagNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "checkedIn") return matchesSearch && a.checkedIn;
    if (filterStatus === "pending") return matchesSearch && !a.checkedIn;
    return matchesSearch;
  });

  const handleToggleCheckin = (id: string) => {
    setAttendees((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextState = !a.checkedIn;
          if (nextState) {
            setLastCheckinName(a.name);
            setTimeout(() => setLastCheckinName(null), 3000);
          }
          return {
            ...a,
            checkedIn: nextState,
            checkInTime: nextState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            hostelBlock: nextState ? "Block A - Allocated" : undefined,
          };
        }
        return a;
      })
    );
  };

  const totalCount = attendees.length;
  const checkedInCount = attendees.filter((a) => a.checkedIn).length;
  const pendingCount = totalCount - checkedInCount;

  return (
    <div className="flex flex-col gap-8 text-[#FCFAF6]">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs font-bold tracking-[0.3em] text-[#DDB94E] uppercase block mb-1">
            CAMPER ACCREDITATION & CHECK-IN
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light uppercase text-white">
            ATTENDEES & <span className="text-[#C25627] font-normal">CHECK-IN</span>
          </h1>
        </div>
      </div>

      {lastCheckinName && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-sans font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>{lastCheckinName} has been successfully checked in and tag verified!</span>
        </div>
      )}

      {/* ── Status Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-[#14120E] border border-white/10 rounded-2xl flex flex-col justify-between">
          <span className="font-sans text-xs font-bold text-white/50 uppercase">Total Registrations</span>
          <span className="font-sans text-3xl font-bold text-white mt-2">{totalCount}</span>
        </div>
        <div className="p-5 bg-[#14120E] border border-emerald-500/30 rounded-2xl flex flex-col justify-between">
          <span className="font-sans text-xs font-bold text-emerald-400 uppercase">Checked-In Campers</span>
          <span className="font-sans text-3xl font-bold text-emerald-400 mt-2">{checkedInCount}</span>
        </div>
        <div className="p-5 bg-[#14120E] border border-[#C25627]/30 rounded-2xl flex flex-col justify-between">
          <span className="font-sans text-xs font-bold text-[#C25627] uppercase">Pending Arrival</span>
          <span className="font-sans text-3xl font-bold text-[#C25627] mt-2">{pendingCount}</span>
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Name, Reg ID, Tag, or Chapter..."
            className="w-full bg-[#14120E] border border-white/10 focus:border-[#C25627] text-white text-xs font-sans py-3.5 pl-11 pr-4 rounded-xl outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === "all" ? "bg-[#C25627] text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus("checkedIn")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === "checkedIn" ? "bg-emerald-600 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Checked-In ({checkedInCount})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              filterStatus === "pending" ? "bg-[#DDB94E] text-[#0B0907] font-bold" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      {/* ── Attendee Cards Table ── */}
      <div className="flex flex-col gap-4">
        {filtered.map((attendee) => (
          <div
            key={attendee.id}
            className={`p-6 bg-[#14120E] border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all shadow-md ${
              attendee.checkedIn ? "border-emerald-500/40" : "border-white/10"
            }`}
          >
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#DDB94E] bg-[#DDB94E]/10 border border-[#DDB94E]/20 px-3 py-1 uppercase rounded-full">
                  {attendee.id}
                </span>
                <span className="font-mono text-xs text-white/60 bg-white/5 px-3 py-1 rounded-full">
                  {attendee.tagNumber}
                </span>
                <span className="font-sans text-xs text-white/50">
                  {attendee.chapter}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-white mt-1">
                {attendee.name}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
                <span>Email: <strong className="text-white">{attendee.email}</strong></span>
                <span>Phone: <strong className="text-white">{attendee.phone}</strong></span>
                {attendee.hostelBlock && (
                  <span className="text-emerald-400 font-semibold">{attendee.hostelBlock}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {attendee.checkedIn ? (
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-emerald-400 font-bold uppercase flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Checked-In ({attendee.checkInTime})
                  </span>
                  <button
                    onClick={() => handleToggleCheckin(attendee.id)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl text-xs font-mono uppercase cursor-pointer"
                  >
                    Undo
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleToggleCheckin(attendee.id)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs tracking-wider uppercase rounded-full transition-all active-press flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Mark Checked-In</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
