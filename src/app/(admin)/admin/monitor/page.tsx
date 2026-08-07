"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSystemSettings } from "@/lib/firebase/settings";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/app";
import { Activity, Users, CheckCircle, Clock } from "lucide-react";
import { Attendee } from "@/lib/firebase/attendees";
import { getAssociationsByConference, getChurchesByAssociation, getChurchesByCampus } from "@/lib/firebase/master-data";
import { ALL_ASSOCIATIONS_BY_CONFERENCE } from "@/lib/constants";
import { CustomSelect } from "@/components/shared/CustomSelect";

export default function AdminMonitorPage() {
  const { data: settings } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getSystemSettings,
  });

  const eventId = settings?.defaultEventId;

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [conference, setConference] = useState("all");
  const [association, setAssociation] = useState("all");
  const [church, setChurch] = useState("all");

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
        return getChurchesByCampus(association);
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

  // Live listener for real-time monitoring
  useEffect(() => {
    if (!eventId) return;
    
    // In a real huge app, we might use aggregation queries, but for < 10k attendees, a direct listener on the collection is manageable for an admin dashboard
    const q = query(collection(db, "events", eventId, "attendees"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendee));
      setAttendees(data);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to attendees:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  const filteredAttendees = attendees.filter(a => {
    if (conference !== "all" && a.conferenceId !== conference) return false;
    if (association !== "all" && a.associationId !== association && a.campusFellowshipId !== association) return false;
    if (church !== "all" && a.churchId !== church) return false;
    return true;
  });

  const totalRegistered = filteredAttendees.length;
  const totalCheckedIn = filteredAttendees.filter(a => a.checkIn?.checkedIn).length;
  const checkInRate = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;
  
  const getCheckInDate = (val: any) => val?.toDate ? val.toDate() : new Date(val);

  // Recent check-ins
  const recentCheckIns = [...filteredAttendees]
    .filter(a => a.checkIn?.checkedIn && a.checkIn?.checkedInAt)
    .sort((a, b) => getCheckInDate(b.checkIn!.checkedInAt).getTime() - getCheckInDate(a.checkIn!.checkedInAt).getTime())
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#0B0907] dark:text-[#FCFAF6] mb-2 uppercase flex items-center gap-3">
            <Activity className="h-8 w-8 text-[#C25627]" />
            Camp Monitor
          </h1>
          <p className="font-sans text-sm text-black/60 dark:text-white/60">
            Real-time live dashboard for registrations and check-ins.
          </p>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-white/5 text-zinc-500 rounded-full text-sm font-bold animate-pulse">
            <span className="relative flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-400"></span>
            </span>
            Connecting...
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-bold">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Live
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-[#181612] p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
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
              ? ALL_ASSOCIATIONS_BY_CONFERENCE[conference].map((name: string) => {
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#181612] p-6 rounded-3xl border border-black/10 dark:border-white/10 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-zinc-500">
            <Users className="h-5 w-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Registrations</h3>
          </div>
          <p className="font-serif text-5xl font-bold text-[#0B0907] dark:text-[#FCFAF6]">
            {totalRegistered.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <CheckCircle className="h-5 w-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Checked In</h3>
          </div>
          <p className="font-serif text-5xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalCheckedIn.toLocaleString()}
          </p>
        </div>

        <div className="bg-blue-500/10 p-6 rounded-3xl border border-blue-500/20 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Activity className="h-5 w-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Check-in Rate</h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="font-serif text-5xl font-bold text-blue-600 dark:text-blue-400">
              {checkInRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="bg-white dark:bg-[#181612] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
        <div className="flex items-center gap-2 text-zinc-500">
          <Clock className="h-5 w-5" />
          <h2 className="font-serif text-xl font-bold text-[#0B0907] dark:text-[#FCFAF6]">Recent Check-ins</h2>
        </div>
        
        {recentCheckIns.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-sm">
            No recent check-ins found for the current filters.
          </div>
        ) : (
          <div className="space-y-4">
            {recentCheckIns.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 animate-fade-in">
                <div>
                  <p className="font-bold text-[#0B0907] dark:text-[#FCFAF6]">{a.fullName}</p>
                  <p className="text-xs text-zinc-500 capitalize">{a.conferenceName || a.conferenceId.replace('_', ' ')} • {a.associationName || a.campusFellowshipName || "-"}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-[#C25627]">{a.id}</p>
                  <p className="text-xs text-zinc-500">
                    {a.checkIn?.checkedInAt ? getCheckInDate(a.checkIn.checkedInAt).toLocaleTimeString() : 'Just now'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
