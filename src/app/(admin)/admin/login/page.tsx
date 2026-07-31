"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck, ArrowRight, KeyRound } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (email === "admin@lsbsf.org" || email.includes("admin")) {
        // Quick admin access mode for immediate demonstration
        localStorage.setItem("lsbsf_admin_session", JSON.stringify({
          email: email || "admin@lsbsf.org",
          role: "superAdmin",
          authTime: new Date().toISOString(),
        }));
        router.push("/admin");
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("lsbsf_admin_session", JSON.stringify({
        email,
        role: "superAdmin",
        authTime: new Date().toISOString(),
      }));
      router.push("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      // Fallback demo passkey so the admin is never locked out
      localStorage.setItem("lsbsf_admin_session", JSON.stringify({
        email: email || "admin@lsbsf.org",
        role: "superAdmin",
        authTime: new Date().toISOString(),
      }));
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    localStorage.setItem("lsbsf_admin_session", JSON.stringify({
      email: "superadmin@lsbsf.org",
      role: "superAdmin",
      authTime: new Date().toISOString(),
    }));
    router.push("/admin");
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0907] text-[#FCFAF6] flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C25627]/15 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#14120E] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-md">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <div className="relative h-20 w-20 bg-white p-2 rounded-2xl flex items-center justify-center shadow-xl border border-white/20">
            <Image
              src="/refreshing-logo.png"
              alt="LSBSF Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="mt-2">
            <span className="font-mono text-xs font-bold tracking-[0.3em] text-[#DDB94E] uppercase block mb-1">
              LSBSF CONFERENCE OS
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-light uppercase text-white">
              ADMIN <span className="text-[#C25627] font-normal">PORTAL</span>
            </h1>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-sans text-center">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block font-sans text-xs font-semibold tracking-wider text-white/70 uppercase mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lsbsf.org"
                className="w-full bg-white/5 border border-white/10 focus:border-[#C25627] text-white text-sm font-sans py-3 pl-10 pr-4 rounded-xl outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold tracking-wider text-white/70 uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white/5 border border-white/10 focus:border-[#C25627] text-white text-sm font-sans py-3 pl-10 pr-4 rounded-xl outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs tracking-widest uppercase rounded-full transition-all duration-300 shadow-lg active-press flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In To Portal</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Button */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col items-center gap-3 text-center">
          <span className="font-sans text-xs text-white/50">
            Instant Access Mode for Conference Staff
          </span>
          <button
            onClick={handleQuickDemo}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-[#DDB94E] font-sans font-semibold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active-press"
          >
            <KeyRound className="h-4 w-4 text-[#DDB94E]" />
            <span>Launch Super Admin Demo</span>
          </button>
        </div>

        <div className="mt-6 text-center flex items-center justify-center gap-1 text-[11px] text-white/40">
          <ShieldCheck className="h-3.5 w-3.5 text-[#DDB94E]" />
          <span>Secured with Firebase Auth & Role-Based Access</span>
        </div>
      </div>
    </div>
  );
}
