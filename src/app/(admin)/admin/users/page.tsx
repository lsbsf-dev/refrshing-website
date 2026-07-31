"use client";

import React, { useState } from "react";
import { ShieldCheck, UserPlus, KeyRound, Clock, CheckCircle2, AlertTriangle, Sparkles, Mail } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "superAdmin" | "eventAdmin" | "registrationStaff" | "checkinStaff";
  mfaEnrolled: boolean;
  status: "active" | "invited";
  assignedEvent: string;
}

const mockStaff: StaffMember[] = [
  {
    id: "user-01",
    name: "Rev. Tunde Babatunde",
    email: "superadmin@lsbsf.org",
    role: "superAdmin",
    mfaEnrolled: true,
    status: "active",
    assignedEvent: "refreshing-2026",
  },
  {
    id: "user-02",
    name: "Bro. Sunday Oguntola",
    email: "sunday.oguntola@lsbsf.org",
    role: "eventAdmin",
    mfaEnrolled: true,
    status: "active",
    assignedEvent: "refreshing-2026",
  },
  {
    id: "user-03",
    name: "Sis. Timi Idowu",
    email: "timi.idowu@lsbsf.org",
    role: "registrationStaff",
    mfaEnrolled: true,
    status: "active",
    assignedEvent: "refreshing-2026",
  },
  {
    id: "user-04",
    name: "Bro. Emmanuel Adeleke",
    email: "emmanuel@lsbsf.org",
    role: "checkinStaff",
    mfaEnrolled: false,
    status: "active",
    assignedEvent: "refreshing-2026",
  },
];

export default function AdminUsersPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>(mockStaff);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"superAdmin" | "eventAdmin" | "registrationStaff" | "checkinStaff">("checkinStaff");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newStaff: StaffMember = {
      id: `user-${Date.now()}`,
      name: inviteEmail.split("@")[0].toUpperCase(),
      email: inviteEmail,
      role: inviteRole,
      mfaEnrolled: false,
      status: "invited",
      assignedEvent: "refreshing-2026",
    };

    setStaffList((prev) => [newStaff, ...prev]);
    setInviteEmail("");
    setSuccessMsg(`Invite link generated & sent to ${inviteEmail}! Audit log updated.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleRoleChange = (id: string, newRole: StaffMember["role"]) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, role: newRole } : s))
    );
    setSuccessMsg("User Custom Claims updated on Firebase Auth!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="flex flex-col gap-8 text-[#FCFAF6]">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs font-bold tracking-[0.3em] text-[#DDB94E] uppercase block mb-1">
            RBAC CUSTOM CLAIMS & AUDIT LOGS
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light uppercase text-white">
            STAFF & <span className="text-[#C25627] font-normal">SECURITY</span>
          </h1>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-sans font-semibold flex items-center gap-2 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Invite Staff Form ── */}
      <div className="p-6 bg-[#14120E] border border-white/10 rounded-2xl flex flex-col gap-5">
        <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-[#C25627]" />
          <span>Invite New Staff Member</span>
        </h3>

        <form onSubmit={handleSendInvite} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6">
            <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
              Staff Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="staff@lsbsf.org"
                className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 pl-10 pr-4 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
              Assign Role (Custom Claims)
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full bg-[#1A1813] border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
            >
              <option value="superAdmin">Super Admin (Full Control)</option>
              <option value="eventAdmin">Event Admin (Content & Schedule)</option>
              <option value="registrationStaff">Registration Staff</option>
              <option value="checkinStaff">Check-in Staff (QR Scanner)</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-md active-press"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>

      {/* ── Active Staff Table ── */}
      <div className="flex flex-col gap-4">
        <h3 className="font-serif text-xl font-bold text-white">
          Active Staff & Roles
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {staffList.map((member) => (
            <div
              key={member.id}
              className="p-6 bg-[#14120E] border border-white/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <h4 className="font-serif text-lg font-bold text-white">
                    {member.name}
                  </h4>
                  <span
                    className={`font-mono text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full ${
                      member.role === "superAdmin"
                        ? "bg-[#C25627]/20 text-[#C25627] border border-[#C25627]/30"
                        : member.role === "eventAdmin"
                        ? "bg-[#DDB94E]/20 text-[#DDB94E] border border-[#DDB94E]/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {member.role}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-white/60">
                  <span>Email: <strong className="text-white">{member.email}</strong></span>
                  <span className="flex items-center gap-1">
                    MFA Enrolled:
                    {member.mfaEnrolled ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> YES
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> NO
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                  className="bg-[#1A1813] border border-white/10 text-white text-xs font-sans py-2.5 px-4 rounded-xl outline-none"
                >
                  <option value="superAdmin">superAdmin</option>
                  <option value="eventAdmin">eventAdmin</option>
                  <option value="registrationStaff">registrationStaff</option>
                  <option value="checkinStaff">checkinStaff</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
