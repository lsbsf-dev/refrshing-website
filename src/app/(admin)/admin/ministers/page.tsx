"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, Search, Save, X, Users, Sparkles, AlertCircle } from "lucide-react";
import seedMinisters from "@/lib/firebase/seedMinisters.json";
import { Minister } from "@/types/minister";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function AdminMinistersPage() {
  const [ministersList, setMinistersList] = useState<Minister[]>(seedMinisters as Minister[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMinister, setEditingMinister] = useState<Minister | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New minister draft state
  const [newMinister, setNewMinister] = useState({
    name: "",
    photoUrl: "",
    category: "keynote",
    affiliation: "",
    biography: "",
  });

  // Lock body scroll when modal is active
  useEffect(() => {
    if (editingMinister || isNewModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [editingMinister, isNewModalOpen]);

  const filteredMinisters = ministersList.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.affiliation && m.affiliation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMinister || !editingMinister.name.trim()) return;

    setMinistersList((prev) =>
      prev.map((m) => (m.id === editingMinister.id ? editingMinister : m))
    );
    setEditingMinister(null);
    triggerSuccessBanner();
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMinister.name.trim()) return;

    const created: Minister = {
      id: `minister-${Date.now()}`,
      eventId: "refreshing-2026",
      slug: newMinister.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: newMinister.name,
      photoUrl: newMinister.photoUrl || "/pictures/Image 6.jpg",
      biography: newMinister.biography || "",
      affiliation: newMinister.affiliation || "",
      status: "published",
      category: newMinister.category as any,
    };

    setMinistersList((prev) => [created, ...prev]);
    setIsNewModalOpen(false);
    setNewMinister({ name: "", photoUrl: "", category: "keynote", affiliation: "", biography: "" });
    triggerSuccessBanner();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this minister?")) {
      setMinistersList((prev) => prev.filter((m) => m.id !== id));
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
            MINISTERS DIRECTORY MANAGEMENT
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light uppercase">
            MANAGE <span className="text-[#C25627] font-normal">MINISTERS</span>
          </h1>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-6 py-3.5 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs tracking-wider uppercase rounded-full transition-all active-press flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Minister</span>
        </button>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 text-xs font-sans font-semibold flex items-center gap-2 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>Minister record updated successfully!</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by minister name or affiliation..."
          className="w-full bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 focus:border-[#C25627] text-xs font-sans py-3.5 pl-11 pr-4 rounded-xl outline-none transition-all"
        />
      </div>

      {/* ── Ministers Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMinisters.map((minister) => (
          <div
            key={minister.id}
            className="p-6 bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 rounded-2xl flex flex-col justify-between gap-5 hover:border-[#C25627]/40 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-start gap-4 min-w-0">
              {/* Photo */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-black/10 shrink-0 border border-black/10 dark:border-white/10">
                {minister.photoUrl ? (
                  <Image
                    src={minister.photoUrl}
                    alt={minister.name}
                    fill
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl text-zinc-400">
                    {minister.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col text-left flex-1 min-w-0">
                <span className="font-sans text-[10px] font-extrabold tracking-widest text-[#C25627] uppercase bg-[#C25627]/10 px-2.5 py-0.5 rounded-full w-fit mb-1.5">
                  {minister.category === "music" ? "GOSPEL MUSIC" : "SPEAKER"}
                </span>
                <h3 className="font-serif text-lg font-bold truncate">
                  {minister.name}
                </h3>
                <p className="font-sans text-xs text-zinc-500 dark:text-white/60 font-light truncate mt-1">
                  {minister.affiliation || "Minister of God"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10">
              <span className="font-mono text-[10px] text-zinc-400 uppercase truncate max-w-[140px]">
                ID: {minister.slug}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditingMinister(minister)}
                  className="p-3 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer active-press"
                  title="Edit Minister"
                >
                  <Edit2 className="h-4 w-4 text-[#C25627]" />
                </button>
                <button
                  onClick={() => handleDelete(minister.id)}
                  className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors cursor-pointer active-press"
                  title="Delete Minister"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Edit Minister Modal (Solid Opaque Background, Scroll Locked) ── */}
      {editingMinister && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-xl bg-white dark:bg-[#181612] text-[#0B0907] dark:text-[#FCFAF6] border border-black/15 dark:border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div>
                <span className="font-mono text-[10px] text-[#C25627] uppercase tracking-widest block font-bold">
                  MINISTER MANAGEMENT
                </span>
                <h3 className="font-serif text-2xl font-bold uppercase">
                  EDIT MINISTER
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMinister(null)}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Full Name <span className="text-[#C25627]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingMinister.name}
                  onChange={(e) =>
                    setEditingMinister({ ...editingMinister, name: e.target.value })
                  }
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Category <span className="text-[#C25627]">*</span>
                </label>
                <select
                  value={editingMinister.category || "keynote"}
                  onChange={(e) =>
                    setEditingMinister({
                      ...editingMinister,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full bg-zinc-50 dark:bg-[#1A1813] border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                >
                  <option value="keynote">Speaker</option>
                  <option value="music">Gospel Music</option>
                </select>
              </div>
            </div>

            {/* Photo Upload Component */}
            <ImageUploader
              value={editingMinister.photoUrl || ""}
              onChange={(url) => setEditingMinister({ ...editingMinister, photoUrl: url })}
              label="Photo Image Upload"
            />

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Affiliation / Church Title <span className="font-mono text-[10px] font-normal text-zinc-400 lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={editingMinister.affiliation || ""}
                onChange={(e) =>
                  setEditingMinister({ ...editingMinister, affiliation: e.target.value })
                }
                placeholder="e.g. Pastor, Golden Gate Baptist Church"
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Official Biography <span className="font-mono text-[10px] font-normal text-zinc-400 lowercase">(optional)</span>
              </label>
              <textarea
                rows={5}
                value={editingMinister.biography || ""}
                onChange={(e) =>
                  setEditingMinister({ ...editingMinister, biography: e.target.value })
                }
                placeholder="Enter official biography details..."
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans p-4 rounded-xl outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setEditingMinister(null)}
                className="px-6 py-3 bg-zinc-100 dark:bg-white/5 font-sans font-bold text-xs uppercase rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer active-press"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Create Minister Modal (Solid Opaque Background) ── */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNew}
            className="w-full max-w-xl bg-white dark:bg-[#181612] text-[#0B0907] dark:text-[#FCFAF6] border border-black/15 dark:border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div>
                <span className="font-mono text-[10px] text-[#C25627] uppercase tracking-widest block font-bold">
                  DIRECTORY ENTRY
                </span>
                <h3 className="font-serif text-2xl font-bold uppercase">
                  ADD NEW MINISTER
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Full Name <span className="text-[#C25627]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newMinister.name}
                  onChange={(e) => setNewMinister({ ...newMinister, name: e.target.value })}
                  placeholder="e.g. Rev'd. John Doe"
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Category <span className="text-[#C25627]">*</span>
                </label>
                <select
                  value={newMinister.category}
                  onChange={(e) => setNewMinister({ ...newMinister, category: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-[#1A1813] border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                >
                  <option value="keynote">Speaker</option>
                  <option value="music">Gospel Music</option>
                </select>
              </div>
            </div>

            {/* Photo Upload Component */}
            <ImageUploader
              value={newMinister.photoUrl}
              onChange={(url) => setNewMinister({ ...newMinister, photoUrl: url })}
              label="Photo Image Upload"
            />

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Affiliation / Title <span className="font-mono text-[10px] font-normal text-zinc-400 lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={newMinister.affiliation}
                onChange={(e) => setNewMinister({ ...newMinister, affiliation: e.target.value })}
                placeholder="e.g. Pastor, Baptist Church Obanikoro"
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Biography <span className="font-mono text-[10px] font-normal text-zinc-400 lowercase">(optional)</span>
              </label>
              <textarea
                rows={4}
                value={newMinister.biography}
                onChange={(e) => setNewMinister({ ...newMinister, biography: e.target.value })}
                placeholder="Enter official biography..."
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans p-4 rounded-xl outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-6 py-3 bg-zinc-100 dark:bg-white/5 font-sans font-bold text-xs uppercase rounded-full cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer active-press"
              >
                <Plus className="h-4 w-4" />
                <span>Create Minister</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
