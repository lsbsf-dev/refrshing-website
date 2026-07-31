"use client";

import React, { useState } from "react";
import { BookOpen, Edit2, Plus, Sparkles, X, Save, FileText, Music } from "lucide-react";
import seedResources from "@/lib/firebase/seedResources.json";
import { Resource } from "@/types/resource";

export default function AdminResourcesPage() {
  const [resourcesList, setResourcesList] = useState<Resource[]>(seedResources as Resource[]);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;
    setResourcesList((prev) =>
      prev.map((r) => (r.id === editingResource.id ? editingResource : r))
    );
    setEditingResource(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 text-[#FCFAF6]">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs font-bold tracking-[0.3em] text-[#DDB94E] uppercase block mb-1">
            CAMP GUIDE BOOKLET CONTROL
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light uppercase text-white">
            MANAGE <span className="text-[#C25627] font-normal">RESOURCES</span>
          </h1>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-sans font-semibold flex items-center gap-2 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>Booklet resource saved successfully!</span>
        </div>
      )}

      {/* ── Resources List ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {resourcesList.map((res) => (
          <div
            key={res.id}
            className="p-6 bg-[#14120E] border border-white/10 rounded-2xl flex flex-col justify-between gap-4 hover:border-white/20 transition-all shadow-md"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold tracking-widest text-[#C25627] uppercase bg-[#C25627]/10 px-3 py-1 rounded-full">
                  {res.category}
                </span>
                <span className="font-mono text-xs text-white/40">
                  Author: {res.author}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-white mt-1">
                {res.title}
              </h3>
              <p className="font-sans text-xs text-white/60 font-light line-clamp-3 leading-relaxed">
                {res.description.replace(/#/g, "")}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="font-mono text-[10px] text-white/40 uppercase">
                slug: {res.slug}
              </span>
              <button
                onClick={() => setEditingResource(res)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active-press"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Resource</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Edit Modal ── */}
      {editingResource && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-2xl bg-[#14120E] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-serif text-2xl font-light text-white uppercase">
                EDIT <span className="text-[#C25627]">RESOURCE</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingResource(null)}
                className="text-white/50 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                Resource Title
              </label>
              <input
                type="text"
                required
                value={editingResource.title}
                onChange={(e) =>
                  setEditingResource({ ...editingResource, title: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editingResource.category}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, category: e.target.value as any })
                  }
                  className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={editingResource.author}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, author: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-white/70 uppercase mb-1">
                Content Body (Markdown formatted)
              </label>
              <textarea
                rows={12}
                value={editingResource.description}
                onChange={(e) =>
                  setEditingResource({ ...editingResource, description: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 text-white text-xs font-mono p-4 rounded-xl outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingResource(null)}
                className="px-6 py-3 bg-white/5 text-white text-xs font-bold uppercase rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white text-xs font-bold uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Resource</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
