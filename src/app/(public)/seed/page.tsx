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

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
  const isMock = !apiKey || apiKey.includes("mock") || apiKey.includes("Dummy");

  const handleSeed = async () => {
    setLoading(true);
    setMessage("");
    setCurrentStep("Initializing...");
    try {
      if (isMock) {
        throw new Error(
          "Firebase credentials are not set or are using mock values. Please update .env.local with your real keys and restart your Next.js server."
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
      setMessage("Success! Seeding completed successfully. All data is live.");
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
        <h1 className="text-2xl font-bold mb-2 text-center">Database Seeder</h1>
        
        {isMock && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-xs text-left">
            <span className="font-bold block mb-1">⚠️ Firebase Mock Mode Active</span>
            The app is currently using mock credentials. To seed a real database:
            <ol className="list-decimal list-inside mt-1.5 space-y-1 font-mono">
              <li>Open your <code>.env.local</code> file</li>
              <li>Replace mock values with your real Firebase keys</li>
              <li>Restart your development server (<code>Ctrl+C</code> then <code>npm run dev</code>)</li>
            </ol>
          </div>
        )}

        {!isMock && (
          <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-xs text-left">
            <span className="font-bold block">Connected to Firebase Project:</span>
            <span className="font-mono">{projectId}</span>
          </div>
        )}

        <p className="text-sm text-slate-400 mb-6 text-center">
          Click the button below to seed the Firestore database with the official Refreshing '26 schedule and speaker profile datasets.
        </p>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-md transition duration-200 cursor-pointer"
        >
          {loading ? "Seeding..." : "Seed Database"}
        </button>

        {currentStep && (
          <div className="mt-4 p-3 bg-slate-900/50 border border-slate-700/50 rounded text-xs font-mono text-slate-300 text-center animate-pulse">
            {currentStep}
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 bg-slate-900 border border-slate-750 rounded text-sm text-center">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
