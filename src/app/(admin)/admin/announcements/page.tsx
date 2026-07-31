"use client";

import React, { useState, useEffect } from "react";
import { Megaphone, Plus, Edit2, Trash2, Search, Save, X, Sparkles, AlertCircle, Bell } from "lucide-react";
import seedAnnouncements from "@/lib/firebase/seedAnnouncements.json";

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  priority: "urgent" | "high" | "medium" | "normal";
  status: "published" | "draft";
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(seedAnnouncements as unknown as Announcement[]);
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

  const filtered = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn || !editingAnn.title.trim()) return;

    setAnnouncements((prev) =>
      prev.map((a) => (a.id === editingAnn.id ? editingAnn : a))
    );
    setEditingAnn(null);
    triggerSuccessBanner();
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnn.title.trim()) return;

    const created: Announcement = {
      id: `ann-${Date.now()}`,
      title: newAnn.title,
      content: newAnn.content,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      category: newAnn.category,
      priority: newAnn.priority,
      status: "published",
    };

    setAnnouncements((prev) => [created, ...prev]);
    setIsNewModalOpen(false);
    setNewAnn({ title: "", content: "", category: "General", priority: "normal" });
    triggerSuccessBanner();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this announcement?")) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      triggerSuccessBanner();
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
          className="w-full bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 focus:border-[#C25627] text-xs font-sans py-3.5 pl-11 pr-4 rounded-xl outline-none transition-all"
        />
      </div>

      {/* ── Announcements Cards Grid ── */}
      <div className="flex flex-col gap-4">
        {filtered.map((ann) => (
          <div
            key={ann.id}
            className="p-6 bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#C25627]/40 transition-all shadow-sm"
          >
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-sans text-[10px] font-extrabold tracking-widest text-[#C25627] uppercase bg-[#C25627]/10 px-3 py-1 rounded-full">
                  {ann.category}
                </span>
                <span
                  className={`font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    ann.priority === "urgent"
                      ? "bg-red-500/10 text-red-500 border border-red-500/20"
                      : "bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {ann.priority} priority
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  {ann.date}
                </span>
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
                className="p-2.5 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Edit Announcement"
              >
                <Edit2 className="h-4 w-4 text-[#C25627]" />
              </button>
              <button
                onClick={() => handleDelete(ann.id)}
                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors cursor-pointer"
                title="Delete Announcement"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Edit Modal ── */}
      {editingAnn && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
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
                    setEditingAnn({ ...editingAnn, category: e.target.value })
                  }
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Priority
                </label>
                <select
                  value={editingAnn.priority}
                  onChange={(e) =>
                    setEditingAnn({ ...editingAnn, priority: e.target.value as any })
                  }
                  className="w-full bg-zinc-50 dark:bg-[#1A1813] border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
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
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Save className="h-4 w-4" />
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
                  onChange={(e) => setNewAnn({ ...newAnn, category: e.target.value })}
                  placeholder="General"
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Priority
                </label>
                <select
                  value={newAnn.priority}
                  onChange={(e) => setNewAnn({ ...newAnn, priority: e.target.value as any })}
                  className="w-full bg-zinc-50 dark:bg-[#1A1813] border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
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
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Publish Announcement</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
