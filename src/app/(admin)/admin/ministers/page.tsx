"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, Search, Save, X, Users, Sparkles } from "lucide-react";
import seedMinisters from "@/lib/firebase/seedMinisters.json";
import { Minister } from "@/types/minister";

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

  const filteredMinisters = ministersList.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.affiliation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMinister) return;

    setMinistersList((prev) =>
      prev.map((m) => (m.id === editingMinister.id ? editingMinister : m))
    );
    setEditingMinister(null);
    triggerSuccessBanner();
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Minister = {
      id: `minister-${Date.now()}`,
      eventId: "refreshing-2026",
      slug: newMinister.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: newMinister.name,
      photoUrl: newMinister.photoUrl,
      biography: newMinister.biography,
      affiliation: newMinister.affiliation || "Minister of God",
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
    <div className="flex flex-col gap-8 text-[#FCFAF6]">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs font-bold tracking-[0.3em] text-[#DDB94E] uppercase block mb-1">
            MINISTERS DIRECTORY MANAGEMENT
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light uppercase text-white">
            MANAGE <span className="text-[#C25627] font-normal">MINISTERS</span>
          </h1>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-6 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs tracking-wider uppercase rounded-full transition-all active-press flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Minister</span>
        </button>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-sans font-semibold flex items-center gap-2 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>Changes saved successfully to Firestore database index!</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by minister name or affiliation..."
          className="w-full bg-[#14120E] border border-white/10 focus:border-[#C25627] text-white text-xs font-sans py-3.5 pl-11 pr-4 rounded-xl outline-none transition-all"
        />
      </div>

      {/* ── Ministers Table / Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMinisters.map((minister) => (
          <div
            key={minister.id}
            className="p-5 bg-[#14120E] border border-white/10 rounded-2xl flex flex-col justify-between gap-4 hover:border-white/20 transition-all shadow-md"
          >
            <div className="flex items-start gap-4">
              {/* Photo */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#0B0907] flex-shrink-0 border border-white/10">
                {minister.photoUrl ? (
                  <Image
                    src={minister.photoUrl}
                    alt={minister.name}
                    fill
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl text-white/30">
                    {minister.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col text-left flex-1 min-w-0">
                <span className="font-sans text-[10px] font-extrabold tracking-widest text-[#C25627] uppercase bg-[#C25627]/10 px-2 py-0.5 rounded-full w-fit mb-1">
                  {minister.category === "music" ? "GOSPEL MUSIC" : "SPEAKER"}
                </span>
                <h3 className="font-serif text-lg font-bold text-white truncate">
                  {minister.name}
                </h3>
                <p className="font-sans text-xs text-white/60 font-light truncate mt-0.5">
                  {minister.affiliation}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="font-mono text-[10px] text-white/40 uppercase">
                ID: {minister.slug}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingMinister(minister)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors cursor-pointer active-press"
                  title="Edit Minister"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(minister.id)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer active-press"
                  title="Delete Minister"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Edit Modal ── */}
      {editingMinister && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-xl bg-[#14120E] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-serif text-2xl font-light text-white uppercase">
                EDIT <span className="text-[#C25627]">MINISTER</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingMinister(null)}
                className="text-white/50 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingMinister.name}
                  onChange={(e) =>
                    setEditingMinister({ ...editingMinister, name: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                  Category
                </label>
                <select
                  value={editingMinister.category || "keynote"}
                  onChange={(e) =>
                    setEditingMinister({
                      ...editingMinister,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full bg-[#1A1813] border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
                >
                  <option value="keynote">Speaker</option>
                  <option value="music">Gospel Music</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                Photo URL Path
              </label>
              <input
                type="text"
                value={editingMinister.photoUrl || ""}
                onChange={(e) =>
                  setEditingMinister({ ...editingMinister, photoUrl: e.target.value })
                }
                placeholder="/ministers/Rev. Tunde Babatunde.jpg"
                className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                Affiliation / Role Title
              </label>
              <input
                type="text"
                value={editingMinister.affiliation || ""}
                onChange={(e) =>
                  setEditingMinister({ ...editingMinister, affiliation: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                Official Biography
              </label>
              <textarea
                rows={5}
                value={editingMinister.biography || ""}
                onChange={(e) =>
                  setEditingMinister({ ...editingMinister, biography: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans p-4 rounded-xl outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingMinister(null)}
                className="px-6 py-3 bg-white/5 text-white text-xs font-bold uppercase rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white text-xs font-bold uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNew}
            className="w-full max-w-xl bg-[#14120E] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-serif text-2xl font-light text-white uppercase">
                ADD NEW <span className="text-[#C25627]">MINISTER</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-white/50 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newMinister.name}
                  onChange={(e) => setNewMinister({ ...newMinister, name: e.target.value })}
                  placeholder="e.g. Rev'd. John Doe"
                  className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                  Category
                </label>
                <select
                  value={newMinister.category}
                  onChange={(e) => setNewMinister({ ...newMinister, category: e.target.value })}
                  className="w-full bg-[#1A1813] border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
                >
                  <option value="keynote">Speaker</option>
                  <option value="music">Gospel Music</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                Photo URL Path
              </label>
              <input
                type="text"
                value={newMinister.photoUrl}
                onChange={(e) => setNewMinister({ ...newMinister, photoUrl: e.target.value })}
                placeholder="/ministers/photo.jpg"
                className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                Affiliation / Title
              </label>
              <input
                type="text"
                value={newMinister.affiliation}
                onChange={(e) => setNewMinister({ ...newMinister, affiliation: e.target.value })}
                placeholder="e.g. Pastor, Golden Gate Baptist Church"
                className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                Biography
              </label>
              <textarea
                rows={4}
                value={newMinister.biography}
                onChange={(e) => setNewMinister({ ...newMinister, biography: e.target.value })}
                placeholder="Enter official biography..."
                className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans p-4 rounded-xl outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-6 py-3 bg-white/5 text-white text-xs font-bold uppercase rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white text-xs font-bold uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer"
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
