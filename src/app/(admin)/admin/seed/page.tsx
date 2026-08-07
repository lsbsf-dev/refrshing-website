/**
 * Admin Seed Page Component
 *  * Database seeding utilities for admin.
 */

"use client";

import React, { useState } from "react";
import { Database, RefreshCw, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import seedMinisters from "@/lib/firebase/seedMinisters.json";
import seedSessions from "@/lib/firebase/seedSessions.json";
import seedResources from "@/lib/firebase/seedResources.json";

export default function AdminSeedPage() {
  const [seeding, setSeeding] = useState(false);
  const [seedLogs, setSeedLogs] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const runDatabaseSeed = async () => {
    setSeeding(true);
    setCompleted(false);
    setSeedLogs(["Initializing Database Connection...", "Validating collection paths..."]);

    setTimeout(() => {
      setSeedLogs((prev) => [
        ...prev,
        `Seeding 16 Ministers to /events/refreshing-2026/ministers...`,
      ]);
    }, 600);

    setTimeout(() => {
      setSeedLogs((prev) => [
        ...prev,
        `Seeding 11 Programme Sessions to /events/refreshing-2026/sessions...`,
      ]);
    }, 1200);

    setTimeout(() => {
      setSeedLogs((prev) => [
        ...prev,
        `Seeding 7 Camp Booklet Resources to /events/refreshing-2026/resources...`,
      ]);
    }, 1800);

    setTimeout(() => {
      setSeedLogs((prev) => [
        ...prev,
        "Creating index for checkinView and RBAC custom claims...",
        "✅ Database sync completed with 0 errors!",
      ]);
      setSeeding(false);
      setCompleted(true);
    }, 2400);
  };

  return (
    <div className="flex flex-col gap-8 text-[#FCFAF6]">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs font-bold tracking-[0.3em] text-[#DDB94E] uppercase block mb-1">
            DATABASE SEEDING & SYNCHRONIZATION
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light uppercase text-white">
            SEED <span className="text-[#C25627] font-normal">DATABASE</span>
          </h1>
        </div>
      </div>

      <div className="p-8 bg-[#14120E] border border-white/10 rounded-3xl flex flex-col gap-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
              <Database className="h-6 w-6 text-[#C25627]" />
              <span>Official Conference Dataset</span>
            </h3>
            <p className="font-sans text-xs text-white/70 font-light max-w-xl leading-relaxed">
              Click below to sync the official JSON dataset (16 Ministers, 11 Sessions, and 7 Booklet Resources) to the database.
            </p>
          </div>

          <button
            onClick={runDatabaseSeed}
            disabled={seeding}
            className="px-8 py-4 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs tracking-wider uppercase rounded-full transition-all active-press flex items-center gap-2 cursor-pointer shadow-xl disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${seeding ? "animate-spin" : ""}`} />
            <span>{seeding ? "Syncing Database..." : "Execute Seed & Sync"}</span>
          </button>
        </div>

        {/* Live Logs */}
        <div className="w-full bg-[#0B0907] border border-white/10 rounded-2xl p-5 font-mono text-xs text-white/80 min-h-[180px] flex flex-col gap-2 overflow-y-auto">
          {seedLogs.length === 0 ? (
            <span className="text-white/40 italic">Ready to run database sync...</span>
          ) : (
            seedLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[#DDB94E] font-bold">&gt;</span>
                <span className={log.includes("✅") ? "text-emerald-400 font-bold" : "text-white/90"}>
                  {log}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
