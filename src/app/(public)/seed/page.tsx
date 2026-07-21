"use client";

import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/app";
import ministers from "@/lib/firebase/seedMinisters.json";
import sessions from "@/lib/firebase/seedSessions.json";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeed = async () => {
    setLoading(true);
    setMessage("Starting seeding...");
    try {
      // 1. Seed ministers
      for (const m of ministers) {
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
      }
      setMessage("Ministers seeded. Seeding sessions...");

      // 2. Seed sessions
      for (const s of sessions) {
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
      }

      setMessage("Success! Seeding completed successfully.");
    } catch (err: any) {
      console.error(err);
      setMessage(`Error seeding database: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
        <h1 className="text-2xl font-bold mb-4 text-center">Database Seeder</h1>
        <p className="text-sm text-slate-400 mb-6 text-center">
          Click the button below to seed the Firestore database with the official Refreshing '26 schedule and speaker profile datasets.
        </p>
        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-md transition duration-200"
        >
          {loading ? "Seeding..." : "Seed Database"}
        </button>
        {message && (
          <div className="mt-4 p-3 bg-slate-900 border border-slate-700 rounded text-sm font-mono text-center">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
