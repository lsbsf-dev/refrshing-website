/**
 * Admin Announcements Page Component
 *  * Manages announcements for the event.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Megaphone, Plus, Edit2, Trash2, Search, Save, X, Sparkles, AlertCircle, Bell, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAnnouncements, updateAnnouncement, createAnnouncement, deleteAnnouncement } from "@/lib/firebase/announcements";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Announcement } from "@/types/announcement";
import { CustomSelect } from "@/components/shared/CustomSelect";
export default function AdminAnnouncementsPage() {
  const { eventId: ACTIVE_EVENT_ID } = useAdminEvent();
  const queryClient = useQueryClient();

  const { data: announcementsList = [], isLoading } = useQuery({
    queryKey: ["admin", "announcements", ACTIVE_EVENT_ID],
    queryFn: () => getAnnouncements(ACTIVE_EVENT_ID),
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [newAnn, setNewAnn] = useState({
    title: "",
    content: "",
    category: "General",
    priority: "normal" as any,
  });

  useEffect(() => {
    if (editingAnn || isNewModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [editingAnn, isNewModalOpen]);

  const filtered = announcementsList.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: Announcement) => updateAnnouncement(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      setEditingAnn(null);
      triggerSuccessBanner();
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Announcement, "id">) => createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      setIsNewModalOpen(false);
      setNewAnn({ title: "", content: "", category: "General", priority: "normal" });
      triggerSuccessBanner();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      triggerSuccessBanner();
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn || !editingAnn.title.trim()) return;
    updateMutation.mutate(editingAnn);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnn.title.trim()) return;

    createMutation.mutate({
      eventId: ACTIVE_EVENT_ID,
      title: newAnn.title,
      content: newAnn.content,
      publishedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: newAnn.category as any,
      isUrgent: newAnn.priority === "urgent",
      status: "published",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this announcement?")) {
      deleteMutation.mutate(id);
    }
  };

  const triggerSuccessBanner = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs font-bold tracking-[0.3em] text-[#DDB94E] uppercase block mb-1">
            SITE-WIDE ANNOUNCEMENT BROADCASTS
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light uppercase">
            MANAGE <span className="text-[#C25627] font-normal">ANNOUNCEMENTS</span>
          </h1>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-6 py-3.5 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs tracking-wider uppercase rounded-full transition-all active-press flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 text-xs font-sans font-semibold flex items-center gap-2 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>Announcement broadcast saved successfully!</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter announcements..."
          className="w-full bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 focus:border-[#C25627] text-xs font-sans py-3.5 pl-11 pr-10 rounded-xl outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 hover:text-[#C25627] transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Announcements Cards Grid ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#C25627]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 rounded-3xl">
          <AlertCircle className="h-10 w-10 text-zinc-400 mx-auto mb-4" />
          <p className="font-sans text-sm text-zinc-500">No announcements found.</p>
        </div>
      ) : (
      <div className="flex flex-col gap-4">
        {filtered.map((ann) => (
          <div
            key={ann.id}
            className="p-6 bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#C25627]/40 transition-all shadow-sm"
          >
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-3">
                <span className={`font-sans text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  ann.isUrgent
                    ? "bg-red-500/10 text-red-500 border border-red-500/20"
                    : "bg-[#C25627]/10 text-[#C25627] border border-[#C25627]/20"
                }`}>
                  {ann.category}
                </span>
                <span className="font-mono text-[10px] text-zinc-400">
                  {new Date(ann.publishedAt).toLocaleDateString()}
                </span>
                {ann.isUrgent && (
                  <span className="font-sans text-[10px] font-bold text-red-500 flex items-center gap-1 uppercase tracking-wider">
                    <AlertCircle className="h-3 w-3" /> Urgent
                  </span>
                )}
              </div>
              <h3 className="font-serif text-xl font-bold mt-1">
                {ann.title}
              </h3>
              <p className="font-sans text-xs text-zinc-600 dark:text-white/70 font-light leading-relaxed">
                {ann.content}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditingAnn(ann)}
                className="p-3 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Edit Announcement"
              >
                <Edit2 className="h-4 w-4 text-[#C25627]" />
              </button>
              <button
                onClick={() => handleDelete(ann.id)}
                className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors cursor-pointer"
                title="Delete Announcement"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* ── Edit Announcement Modal ── */}
      {editingAnn && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-xl bg-white dark:bg-[#181612] text-[#0B0907] dark:text-[#FCFAF6] border border-black/15 dark:border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <h3 className="font-serif text-2xl font-bold uppercase">
                EDIT ANNOUNCEMENT
              </h3>
              <button
                type="button"
                onClick={() => setEditingAnn(null)}
                className="p-2 text-zinc-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Announcement Headline <span className="text-[#C25627]">*</span>
              </label>
              <input
                type="text"
                required
                value={editingAnn.title}
                onChange={(e) =>
                  setEditingAnn({ ...editingAnn, title: e.target.value })
                }
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editingAnn.category}
                  onChange={(e) =>
                    setEditingAnn({ ...editingAnn, category: e.target.value as any })
                  }
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Urgency Flag <span className="text-[#C25627]">*</span>
                </label>
                <CustomSelect
                  value={editingAnn.isUrgent ? "urgent" : "normal"}
                  onChange={(val) =>
                    setEditingAnn({ ...editingAnn, isUrgent: val === "urgent" })
                  }
                  options={[
                    { value: "normal", label: "Normal Priority" },
                    { value: "urgent", label: "Urgent / Important" },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Content Body <span className="text-[#C25627]">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={editingAnn.content}
                onChange={(e) =>
                  setEditingAnn({ ...editingAnn, content: e.target.value })
                }
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans p-4 rounded-xl outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setEditingAnn(null)}
                className="px-6 py-3 bg-zinc-100 dark:bg-white/5 font-sans font-bold text-xs uppercase rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Create Modal ── */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNew}
            className="w-full max-w-xl bg-white dark:bg-[#181612] text-[#0B0907] dark:text-[#FCFAF6] border border-black/15 dark:border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <h3 className="font-serif text-2xl font-bold uppercase">
                CREATE ANNOUNCEMENT
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-2 text-zinc-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Announcement Headline <span className="text-[#C25627]">*</span>
              </label>
              <input
                type="text"
                required
                value={newAnn.title}
                onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                placeholder="e.g. Refreshing 2026 Registration Notice"
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newAnn.category}
                  onChange={(e) => setNewAnn({ ...newAnn, category: e.target.value as any })}
                  placeholder="General"
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Urgency Flag
                </label>
                <CustomSelect
                  value={newAnn.priority}
                  onChange={(val) => setNewAnn({ ...newAnn, priority: val as any })}
                  options={[
                    { value: "normal", label: "Normal Priority" },
                    { value: "urgent", label: "Urgent / Important" },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Content Body <span className="text-[#C25627]">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={newAnn.content}
                onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                placeholder="Enter announcement text..."
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans p-4 rounded-xl outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-6 py-3 bg-zinc-100 dark:bg-white/5 font-sans font-bold text-xs uppercase rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Broadcast Announcement</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
