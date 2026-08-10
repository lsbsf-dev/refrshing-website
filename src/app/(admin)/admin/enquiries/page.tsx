"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getEnquiries } from "@/lib/firebase/enquiries";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Loader2, Mailbox } from "lucide-react";

export default function EnquiriesAdminPage() {
  const { eventId: selectedEventId } = useAdminEvent();

  const { data: enquiries = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin", "enquiries", selectedEventId],
    queryFn: () => getEnquiries(selectedEventId),
    enabled: !!selectedEventId,
  });

  if (!selectedEventId) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-3xl flex flex-col items-center justify-center text-center max-w-md">
          <p className="font-sans font-bold text-lg mb-2">Failed to load enquiries</p>
          <p className="text-sm">{(error as Error)?.message || "Permission Denied"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground uppercase mb-1 flex items-center gap-3">
            <Mailbox className="h-8 w-8 text-[#C25627]" />
            Inbox
          </h1>
          <p className="font-sans text-sm text-foreground-muted">
            View all enquiries, testimonies, and prayer requests submitted through the contact page.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {enquiries.length === 0 ? (
          <div className="p-12 text-center bg-surface border border-border rounded-2xl">
            <p className="text-zinc-500 text-sm">No messages found for this event.</p>
          </div>
        ) : (
          enquiries.map((enquiry) => (
            <div key={enquiry.id} className="p-6 bg-surface border border-border rounded-2xl shadow-sm">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    enquiry.type === "Testimony" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                    enquiry.type === "Prayer Request" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                    "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  }`}>
                    {enquiry.type}
                  </span>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      {enquiry.name || "Anonymous"}
                    </h3>
                    {enquiry.email && (
                      <p className="text-xs text-zinc-500">{enquiry.email}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-400 font-mono">
                    {new Date(enquiry.submittedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {enquiry.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
