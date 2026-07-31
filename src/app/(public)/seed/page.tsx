"use client";

import React, { useState } from "react";
import { seedDatabase } from "./actions";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passkey, setPasskey] = useState("");
  const [success, setSuccess] = useState(false);

  const keys = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  };

  const missingKeys = Object.entries(keys)
    .filter(([_, val]) => !val)
    .map(([key]) => key);

  const handleSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey) {
      setMessage("Error: Seeding passkey is required.");
      return;
    }
    setLoading(true);
    setMessage("");
    setSuccess(false);
    try {
      const res = await seedDatabase(passkey);
      setMessage(res.message);
      setSuccess(res.success);
      if (res.success) setPasskey("");
    } catch (err: any) {
      setMessage(`Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
        <h1 className="text-2xl font-bold mb-1 text-center text-indigo-400">
          Database Seeder
        </h1>
        <p className="text-sm text-slate-400 text-center mb-6 uppercase tracking-wider">
          Privileged Server-Side Seeding
        </p>

        {/* Config Status */}
        <div className="mb-5 p-4 bg-slate-900/60 border border-slate-700 rounded text-sm space-y-2">
          {Object.entries(keys).map(([key, val]) => (
            <div key={key} className="flex justify-between gap-4">
              <span className="text-slate-400 truncate">{key.replace("NEXT_PUBLIC_FIREBASE_", "")}:</span>
              <span className={val ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {val ? "✅ Configured" : "❌ Missing"}
              </span>
            </div>
          ))}
        </div>

        {missingKeys.length > 0 && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-sm leading-relaxed">
            <strong>⚠️ Missing Keys:</strong> Add real Firebase credentials to{" "}
            <code>.env.local</code> and restart the server before seeding.
          </div>
        )}

        <p className="text-xs text-slate-400 mb-5 text-center">
          Enter the admin passkey to seed ministers, sessions, and resources into Firestore via the Admin SDK.
        </p>

        <form onSubmit={handleSeed} className="space-y-3">
          <input
            type="password"
            placeholder="Admin passkey"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 focus:border-indigo-500 outline-none text-white text-sm px-4 py-2.5 rounded-md placeholder:text-slate-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || missingKeys.length > 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium py-2.5 px-4 rounded-md transition duration-200 cursor-pointer"
          >
            {loading ? "Seeding database…" : "Seed Database"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-5 p-3 rounded text-xs text-center font-medium border ${
              success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
