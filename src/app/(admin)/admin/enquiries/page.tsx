"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEnquiries, deleteEnquiry, EnquiryDoc } from "@/lib/firebase/enquiries";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Loader2, Mailbox, Trash2 } from "lucide-react";

type FilterTab = "All" | "Enquiry" | "Testimony" | "Prayer Request";

export default function EnquiriesAdminPage() {
  const { eventId: selectedEventId } = useAdminEvent();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: enquiries = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin", "enquiries", selectedEventId],
    queryFn: () => getEnquiries(selectedEventId),
    enabled: !!selectedEventId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      await deleteEnquiry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "enquiries", selectedEventId] });
    },
    onSettled: () => {
      setDeletingId(null);
    },
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

  const filteredEnquiries = enquiries.filter((item: EnquiryDoc) => {
    if (activeTab === "All") return true;
    return item.type === activeTab;
  });

  const countForTab = (tab: FilterTab) => {
    if (tab === "All") return enquiries.length;
    return enquiries.filter((item: EnquiryDoc) => item.type === tab).length;
  };

  const tabs: FilterTab[] = ["All", "Enquiry", "Testimony", "Prayer Request"];

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

      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
              activeTab === tab
                ? "bg-[#C25627] text-white"
                : "bg-surface border border-border text-foreground hover:bg-surface-muted"
            }`}
          >
            {tab === "All" ? "All Messages" : tab === "Enquiry" ? "General Enquiries" : tab === "Testimony" ? "Testimonies" : "Prayer Requests"}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab
                  ? "bg-white/20 text-white"
                  : "bg-black/5 dark:bg-white/10 text-foreground-muted"
              }`}
            >
              {countForTab(tab)}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredEnquiries.length === 0 ? (
          <div className="p-12 text-center bg-surface border border-border rounded-2xl">
            <p className="text-zinc-500 text-sm">No {activeTab === "All" ? "messages" : activeTab.toLowerCase() + "s"} found for this event.</p>
          </div>
        ) : (
          filteredEnquiries.map((enquiry: EnquiryDoc) => (
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
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-400 font-mono">
                    {new Date(enquiry.submittedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this message?")) {
                        deleteMutation.mutate(enquiry.id);
                      }
                    }}
                    disabled={deletingId === enquiry.id}
                    className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                    title="Delete message"
                  >
                    {deletingId === enquiry.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
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
