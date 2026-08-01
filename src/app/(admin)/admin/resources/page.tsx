/**
 * Admin Resources Page Component
 *  * Manages booklet resources and digital materials.
 */

"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Edit2, Plus, Sparkles, X, Save, FileText, Music, Search, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getResources, updateResource } from "@/lib/firebase/resources";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import { Resource } from "@/types/resource";
import { RichTextEditor } from "@/components/shared/RichTextEditor";

export default function AdminResourcesPage() {
  const queryClient = useQueryClient();

  const { data: resourcesList = [], isLoading } = useQuery({
    queryKey: ["admin", "resources", ACTIVE_EVENT_ID],
    queryFn: () => getResources(ACTIVE_EVENT_ID),
  });
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (editingResource) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [editingResource]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: Resource) => updateResource(data.id || data.slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resources"] });
      setEditingResource(null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource || !editingResource.title.trim()) return;
    updateMutation.mutate(editingResource);
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs font-bold tracking-[0.3em] text-[#DDB94E] uppercase block mb-1">
            RESOURCES BOOKLET CONTROL
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light uppercase">
            MANAGE <span className="text-[#C25627] font-normal">RESOURCES</span>
          </h1>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 text-xs font-sans font-semibold flex items-center gap-2 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>Booklet resource saved successfully!</span>
        </div>
      )}

      {/* ── Resources List ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#C25627]" />
        </div>
      ) : resourcesList.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 rounded-3xl">
          <p className="font-sans text-sm text-zinc-500">No resources found.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resourcesList.map((res) => (
          <div
            key={res.id}
            className="p-6 bg-white dark:bg-[#14120E] border border-black/10 dark:border-white/10 rounded-2xl flex flex-col justify-between gap-5 hover:border-[#C25627]/40 transition-all shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold tracking-widest text-[#C25627] uppercase bg-[#C25627]/10 px-3 py-1 rounded-full">
                  {res.category}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  Author: {res.author}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold mt-1">
                {res.title}
              </h3>
              <p className="font-sans text-xs text-zinc-600 dark:text-white/60 font-light line-clamp-3 leading-relaxed">
                {res.description.replace(/#/g, "")}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10">
              <span className="font-mono text-[10px] text-zinc-400 uppercase">
                slug: {res.slug}
              </span>
              <button
                onClick={() => setEditingResource(res)}
                className="px-4 py-2 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5 text-[#C25627]" />
                <span>Edit Resource</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* ── Edit Resource Modal ── */}
      {editingResource && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-2xl bg-white dark:bg-[#181612] text-[#0B0907] dark:text-[#FCFAF6] border border-black/15 dark:border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <h3 className="font-serif text-2xl font-bold uppercase">
                EDIT RESOURCE
              </h3>
              <button
                type="button"
                onClick={() => setEditingResource(null)}
                className="p-2 text-zinc-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Resource Title <span className="text-[#C25627]">*</span>
              </label>
              <input
                type="text"
                required
                value={editingResource.title}
                onChange={(e) =>
                  setEditingResource({ ...editingResource, title: e.target.value })
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
                  value={editingResource.category}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, category: e.target.value as any })
                  }
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={editingResource.author}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, author: e.target.value })
                  }
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Content Body (Rich Text) <span className="text-[#C25627]">*</span>
              </label>
              <RichTextEditor
                value={editingResource.description}
                onChange={(val) =>
                  setEditingResource({ ...editingResource, description: val })
                }
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setEditingResource(null)}
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
                <span>Save Resource</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
