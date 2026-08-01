/**
 * Admin Ministers Page Component
 * Manages the directory of speakers and music ministers.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Save, X, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMinisters, updateMinister, createMinister, deleteMinister } from "@/lib/firebase/ministers";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import { Minister } from "@/types/minister";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { CustomSelect } from "@/components/shared/CustomSelect";

export default function AdminMinistersPage() {
  const queryClient = useQueryClient();

  const { data: ministersList = [], isLoading } = useQuery({
    queryKey: ["admin", "ministers", ACTIVE_EVENT_ID],
    queryFn: () => getMinisters(ACTIVE_EVENT_ID),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  
  const [editingMinister, setEditingMinister] = useState<Minister | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [newMinister, setNewMinister] = useState({
    name: "",
    category: "keynote",
    biography: "",
    photoUrl: "",
  });

  // Lock body scroll when modal is open
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

  const filtered = ministersList.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const triggerSuccessBanner = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: Minister) => updateMinister(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ministers"] });
      setEditingMinister(null);
      triggerSuccessBanner();
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Minister, "id" | "slug">) => createMinister(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ministers"] });
      setIsNewModalOpen(false);
      setNewMinister({ name: "", category: "keynote", biography: "", photoUrl: "" });
      triggerSuccessBanner();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMinister(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ministers"] });
      triggerSuccessBanner();
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMinister || !editingMinister.name.trim()) return;
    updateMutation.mutate(editingMinister);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMinister.name.trim()) return;
    createMutation.mutate({
      eventId: ACTIVE_EVENT_ID,
      name: newMinister.name,
      category: newMinister.category as any,
      biography: newMinister.biography,
      photoUrl: newMinister.photoUrl || "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61",
      status: "published",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this minister from the directory?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#C25627] uppercase block mb-2">
            Directory Management
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light uppercase">
            MINISTERS <span className="text-[#C25627] font-normal">& SPEAKERS</span>
          </h1>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-6 py-3.5 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs tracking-wider uppercase rounded-full transition-all active-press shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Minister</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 text-xs font-sans font-semibold flex items-center gap-2 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>Directory updated successfully!</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#14120E] p-4 rounded-2xl border border-black/10 dark:border-white/10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search directory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-[#C25627] text-sm py-2.5 pl-10 pr-10 rounded-xl outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-black dark:hover:text-white rounded-full bg-black/5 dark:bg-white/10"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {["all", "keynote", "music"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider rounded-xl whitespace-nowrap transition-colors ${
                filterCategory === cat
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-black/5 text-black/60 hover:bg-black/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
              }`}
            >
              {cat === "keynote" ? "Speakers" : cat === "music" ? "Music" : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#C25627]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 rounded-3xl">
          <AlertCircle className="h-10 w-10 text-zinc-400 mx-auto mb-4" />
          <p className="font-sans text-sm text-zinc-500">No ministers found.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((minister) => (
          <div
            key={minister.id}
            className="group bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 rounded-3xl p-5 hover:border-[#C25627]/50 transition-all flex flex-col gap-4 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="h-16 w-16 rounded-full overflow-hidden bg-black/5 dark:bg-white/5 relative shrink-0 border border-black/10 dark:border-white/10">
                {minister.photoUrl ? (
                  <img
                    src={minister.photoUrl}
                    alt={minister.name}
                    className="object-cover object-top w-full h-full"
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
                <p className="font-serif text-sm font-medium">{minister.name}</p>
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
      )}

      {/* ── Edit Minister Modal ── */}
      {editingMinister && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
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
                <CustomSelect
                  value={editingMinister.category || "keynote"}
                  onChange={(val) =>
                    setEditingMinister({
                      ...editingMinister,
                      category: val as any,
                    })
                  }
                  options={[
                    { value: "keynote", label: "Speaker" },
                    { value: "music", label: "Gospel Music" },
                  ]}
                />
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
                Official Biography <span className="font-mono text-[10px] font-normal text-zinc-400 lowercase">(optional)</span>
              </label>
              <RichTextEditor
                value={editingMinister.biography || ""}
                onChange={(val) =>
                  setEditingMinister({ ...editingMinister, biography: val })
                }
                placeholder="Enter official biography details..."
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
                disabled={updateMutation.isPending}
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Record</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Create Minister Modal ── */}
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
                <CustomSelect
                  value={newMinister.category}
                  onChange={(val) => setNewMinister({ ...newMinister, category: val as any })}
                  options={[
                    { value: "keynote", label: "Speaker" },
                    { value: "music", label: "Gospel Music" },
                  ]}
                />
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
                disabled={createMutation.isPending}
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Create Minister</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}