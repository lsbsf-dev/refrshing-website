"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAttendees, Attendee, getAttendeePayment, AttendeePayment } from "@/lib/firebase/attendees";
import { getAssociationsByConference, getChurchesByAssociation, getChurchesByCampus } from "@/lib/firebase/master-data";
import { ALL_ASSOCIATIONS_BY_CONFERENCE } from "@/lib/constants";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { Search, ChevronRight, X, FileCheck, FileX, Loader2 } from "lucide-react";

export function AttendeeDirectory({ eventId }: { eventId: string }) {
  const { data: attendees = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin", "attendees", eventId],
    queryFn: () => getAttendees(eventId),
    enabled: !!eventId
  });

  const [search, setSearch] = useState("");
  const [conference, setConference] = useState("all");
  const [association, setAssociation] = useState("all");
  const [church, setChurch] = useState("all");

  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);

  // Fetch associations based on conference
  const { data: associations = [] } = useQuery({
    queryKey: ["admin", "associations", conference],
    queryFn: () => getAssociationsByConference(conference),
    enabled: conference !== "all" && conference !== "other",
  });

  // Fetch churches based on association or campus
  const { data: churches = [] } = useQuery({
    queryKey: ["admin", "churches", conference, association],
    queryFn: () => {
      if (conference === "campus_fellowship") {
        return getChurchesByCampus(association); // for campus, association holds the campusId
      }
      return getChurchesByAssociation(association);
    },
    enabled: association !== "all",
  });

  // Reset dependent filters when parent changes
  useEffect(() => {
    setAssociation("all");
    setChurch("all");
  }, [conference]);

  useEffect(() => {
    setChurch("all");
  }, [association]);

  const filteredAttendees = attendees.filter(a => {
    if (conference !== "all" && a.conferenceId !== conference) return false;
    if (association !== "all" && a.associationId !== association && a.campusFellowshipId !== association) return false;
    if (church !== "all" && a.churchId !== church) return false;

    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        a.fullName.toLowerCase().includes(term) ||
        a.email.toLowerCase().includes(term) ||
        a.phoneNumber.includes(term) ||
        a.id.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search attendees..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#181612] border border-black/10 dark:border-white/10 text-sm font-sans py-2.5 pl-10 pr-4 rounded-xl outline-none focus:border-[#C25627]"
          />
        </div>
        
        <CustomSelect
          options={[
            { value: "all", label: "All Conferences" },
            { value: "lagos_east", label: "Lagos East" },
            { value: "lagos_west", label: "Lagos West" },
            { value: "lagos_central", label: "Lagos Central" },
            { value: "campus_fellowship", label: "Campus Fellowship" },
            { value: "other", label: "Other" }
          ]}
          value={conference}
          onChange={setConference}
          placeholder="Conference"
        />

        <CustomSelect
          options={[
            { value: "all", label: conference === "campus_fellowship" ? "All Campuses" : "All Associations" },
            ...(conference !== "all" && conference !== "other" && ALL_ASSOCIATIONS_BY_CONFERENCE[conference]
              ? ALL_ASSOCIATIONS_BY_CONFERENCE[conference].map(name => {
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  const id = `${conference}_${slug}`;
                  return { value: id, label: name };
                })
              : [])
          ]}
          value={association}
          onChange={setAssociation}
          disabled={conference === "all" || conference === "other"}
          placeholder="Association"
        />

        <CustomSelect
          options={[
            { value: "all", label: "All Churches" },
            ...churches.map(c => ({ value: c.id, label: c.canonicalName }))
          ]}
          value={church}
          onChange={setChurch}
          disabled={association === "all"}
          placeholder="Church"
        />
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-[#181612] border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-zinc-50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-xs uppercase font-bold text-zinc-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Conference</th>
                <th className="px-6 py-4">Association/Campus</th>
                <th className="px-6 py-4">Church</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Check-in</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading attendees...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-500 bg-red-500/10 border border-red-500/20 font-bold">
                    Failed to load attendees: {(error as Error)?.message || "Permission Denied or Unknown Error"}
                  </td>
                </tr>
              ) : filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    No attendees found.
                  </td>
                </tr>
              ) : (
                filteredAttendees.slice(0, 100).map(a => (
                  <tr key={a.id} onClick={() => setSelectedAttendee(a)} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0B0907] dark:text-[#FCFAF6]">{a.fullName}</div>
                      <div className="text-xs text-zinc-500">{a.email || a.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 capitalize">{a.conferenceName || a.conferenceId?.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{a.associationName || a.campusFellowshipName || "-"}</td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{a.churchName || "-"}</td>
                    <td className="px-6 py-4 font-bold text-zinc-600 dark:text-zinc-400">{a.memberStatus}</td>
                    <td className="px-6 py-4">
                      {a.checkIn?.checkedIn ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg text-xs">Yes</span>
                      ) : (
                        <span className="text-zinc-500 font-bold bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded-lg text-xs">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="h-4 w-4 text-zinc-400 inline-block" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {filteredAttendees.length > 100 && (
             <div className="p-4 text-center text-xs text-zinc-500 bg-zinc-50 dark:bg-white/5">
                Showing 100 of {filteredAttendees.length} results. Please use filters to narrow down.
             </div>
          )}
        </div>
      </div>

      {/* Side Panel for Details */}
      {selectedAttendee && (
        <AttendeeDetailPanel attendee={selectedAttendee} onClose={() => setSelectedAttendee(null)} />
      )}
    </div>
  );
}

function AttendeeDetailPanel({ attendee, onClose }: { attendee: Attendee, onClose: () => void }) {
  const { data: payment, isLoading } = useQuery({
    queryKey: ["admin", "attendees", attendee.eventId, attendee.id, "payment"],
    queryFn: () => getAttendeePayment(attendee.eventId, attendee.id)
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-[#12100C] h-full shadow-2xl border-l border-black/10 dark:border-white/10 flex flex-col animate-slide-in-right overflow-hidden">
        
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-zinc-50 dark:bg-white/5">
          <div>
            <h2 className="font-serif text-2xl font-bold">{attendee.fullName}</h2>
            <p className="font-mono text-xs text-[#C25627] mt-1">{attendee.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8">
          
          {/* Identity */}
          <section>
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-3">Identity</h3>
            <div className="space-y-3 font-sans text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Email</span><span className="font-bold">{attendee.email || "-"}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Phone</span><span className="font-bold">{attendee.phoneNumber || "-"}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Role</span><span className="font-bold">{attendee.memberStatus}</span></div>
            </div>
          </section>

          {/* Registration Info */}
          <section>
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-3">Registration</h3>
            <div className="space-y-3 font-sans text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Conference</span><span className="font-bold capitalize">{attendee.conferenceName || attendee.conferenceId?.replace('_', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Association/Campus</span><span className="font-bold">{attendee.associationName || attendee.campusFellowshipName || "-"}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Church</span><span className="font-bold">{attendee.churchName || "-"}</span></div>
              {attendee.otherSchool && (
                <div className="flex justify-between"><span className="text-zinc-500">Other School</span><span className="font-bold">{attendee.otherSchool}</span></div>
              )}
            </div>
          </section>

          {/* Payment Evidence (Protected) */}
          <section className="bg-zinc-50 dark:bg-white/5 -mx-6 px-6 py-6 border-y border-black/5 dark:border-white/5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-3">Payment Evidence</h3>
            {isLoading ? (
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying permissions...
              </div>
            ) : payment ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-sm">
                  <FileCheck className="h-5 w-5" /> Payment record accessible
                </div>
                <div className="space-y-2 font-sans text-sm">
                  <div className="flex justify-between"><span className="text-zinc-500">Declared Transfer</span><span className="font-bold">{payment.hasPaid ? 'Yes' : 'No'}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Verification</span><span className="font-bold capitalize">{payment.verificationStatus}</span></div>
                </div>
                {payment.receiptUrl ? (
                  <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="block text-center mt-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-xl">
                    View Receipt Image
                  </a>
                ) : (
                  <div className="text-center p-4 border border-dashed border-black/20 dark:border-white/20 rounded-xl text-zinc-500 text-sm mt-2">
                    No receipt image uploaded
                  </div>
                )}
              </div>
            ) : (
               <div className="flex items-center gap-2 text-red-500 font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-sm">
                 <FileX className="h-5 w-5" /> No payment record found or access denied.
               </div>
            )}
          </section>

          {/* Attendance */}
          <section>
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-3">Check-in Status</h3>
            <div className="space-y-3 font-sans text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Status</span>
                <span className={`font-bold ${attendee.checkIn?.checkedIn ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {attendee.checkIn?.checkedIn ? 'Checked In' : 'Yet to Arrive'}
                </span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
