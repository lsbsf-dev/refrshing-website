"use client";

import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/app";
import ministers from "@/lib/firebase/seedMinisters.json";
import sessions from "@/lib/firebase/seedSessions.json";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentStep, setCurrentStep] = useState("");

  const keys = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  };

  const isMock = 
    !keys.NEXT_PUBLIC_FIREBASE_API_KEY || 
    keys.NEXT_PUBLIC_FIREBASE_API_KEY.includes("mock") || 
    keys.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Dummy");

  const missingKeys = Object.entries(keys)
    .filter(([_, val]) => !val)
    .map(([key]) => key);

  const handleSeed = async () => {
    setLoading(true);
    setMessage("");
    setCurrentStep("Initializing...");
    try {
      if (isMock) {
        throw new Error(
          "Firebase credentials are using mock/dummy keys. Seeding is disabled until real keys are supplied."
        );
      }
      if (missingKeys.length > 0) {
        throw new Error(
          `Cannot seed. The following configuration keys are missing: ${missingKeys.join(", ")}`
        );
      }

      // 1. Seed ministers
      let index = 1;
      for (const m of ministers) {
        setCurrentStep(`Seeding minister (${index}/${ministers.length}): ${m.name}`);
        const docRef = doc(db, "ministers", m.id);
        await setDoc(docRef, {
          eventId: m.eventId,
          slug: m.slug,
          name: m.name,
          photoUrl: m.photoUrl || "",
          biography: m.biography || "",
          affiliation: m.affiliation || "",
          status: m.status
        });
        index++;
      }
      setMessage("Ministers seeded. Seeding sessions...");

      // 2. Seed sessions
      index = 1;
      for (const s of sessions) {
        setCurrentStep(`Seeding session (${index}/${sessions.length}): ${s.title}`);
        const docRef = doc(db, "sessions", s.id);
        await setDoc(docRef, {
          eventId: s.eventId,
          slug: s.slug,
          day: s.day,
          title: s.title,
          description: s.description || "",
          startTime: s.startTime,
          endTime: s.endTime,
          venue: s.venue || "",
          ministerIds: s.ministerIds || [],
          status: s.status
        });
        index++;
      }

      setCurrentStep("");
      setMessage("Success! Seeding completed successfully. All schedule and speaker profiles are live.");
    } catch (err: any) {
      console.error(err);
      setMessage(`Error: ${err.message || err}`);
      setCurrentStep("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
        <h1 className="text-2xl font-bold mb-4 text-center">Database Seeder</h1>
        
        {/* Verification Checklist */}
        <div className="mb-6 bg-slate-900/50 p-4 border border-slate-700 rounded text-left">
          <span className="font-semibold text-xs block mb-2 text-slate-300">Firebase Configuration Status:</span>
          <div className="space-y-1.5 font-mono text-[11px]">
            {Object.entries(keys).map(([key, val]) => {
              const isConfigured = !!val && !val.includes("mock") && !val.includes("Dummy");
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-slate-400">{key.replace("NEXT_PUBLIC_FIREBASE_", "")}:</span>
                  <span className={isConfigured ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {isConfigured ? "✅ Configured" : "❌ Missing"}
                  </span>
                </div>
              );
            })}
          </div>
          
          {isMock && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-[10px] leading-relaxed">
              <strong>⚠️ Mock Mode Active:</strong> Ensure your <code>.env.local</code> has real values and you have restarted your server (or triggered a new build/redeploy on Netlify).
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-6 text-center">
          Click below to seed your database with the official Refreshing '26 schedule.
        </p>

        <button
          onClick={handleSeed}
          disabled={loading || isMock || missingKeys.length > 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium py-2.5 px-4 rounded-md transition duration-200 cursor-pointer"
        >
          {loading ? "Seeding..." : "Seed Database"}
        </button>

        {currentStep && (
          <div className="mt-4 p-3 bg-slate-900/50 border border-slate-700/50 rounded text-xs font-mono text-slate-300 text-center animate-pulse">
            {currentStep}
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 bg-slate-900 border border-slate-750 rounded text-xs text-center text-rose-300 font-medium">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
