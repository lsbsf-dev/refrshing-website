"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventScopedDocs, setEventScopedDoc, AboutSettings, ThemeArchiveEntry } from "@/lib/firebase/cms";
import { FormField } from "@/components/shared/FormField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { Toast } from "@/components/admin/Toast";

export default function AboutAdminPage() {
  const { eventId: selectedEventId } = useAdminEvent();
  const queryClient = useQueryClient();

  const { data: settingsDocs = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin", "aboutSettings", selectedEventId],
    queryFn: () => getEventScopedDocs<AboutSettings>(selectedEventId, "aboutSettings"),
    enabled: !!selectedEventId,
  });

  const defaultSettings: AboutSettings = {
    id: "settings",
    status: "published",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    historyHtml: "",
    visionHtml: "",
    missionHtml: "",
    aboutLsbsfHtml: "",
    themeArchive: []
  };

  const [form, setForm] = useState<AboutSettings>(defaultSettings);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" | "warning" | "info" } | null>(null);
  const showToast = (message: string, variant: "success" | "error" | "warning" | "info" = "info") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (settingsDocs.length > 0) {
      setForm({ ...defaultSettings, ...settingsDocs[0] });
    }
  }, [settingsDocs]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await setEventScopedDoc(selectedEventId, "aboutSettings", form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "aboutSettings", selectedEventId] });
      showToast("About Page Settings saved successfully!", "success");
    }
  });

  const addTheme = () => {
    setForm({
      ...form,
      themeArchive: [
        ...form.themeArchive,
        { id: Date.now().toString(), year: "", theme: "", scripture: "", description: "", imageUrl: "" }
      ]
    });
  };

  const updateTheme = (id: string, updates: Partial<ThemeArchiveEntry>) => {
    setForm({
      ...form,
      themeArchive: form.themeArchive.map(t => (t.id === id ? { ...t, ...updates } : t))
    });
  };

  const removeTheme = (id: string) => {
    setForm({
      ...form,
      themeArchive: form.themeArchive.filter(t => t.id !== id)
    });
  };

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
          <p className="font-sans font-bold text-lg mb-2">Failed to load about settings</p>
          <p className="text-sm">{(error as Error)?.message || "Permission Denied or Unknown Error"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-4xl">
      {toast && <Toast message={toast.message} variant={toast.variant} isVisible={true} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground uppercase mb-1">
            About Page Settings
          </h1>
          <p className="font-sans text-sm text-foreground-muted">
            Configure the history, vision, and theme archives for the About page.
          </p>
        </div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C25627] hover:bg-[#a1451f] text-white font-bold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Settings
        </button>
      </div>

      <div className="space-y-12">
        {/* SECTION 1: CORE CONTENT */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold mb-6 text-foreground">1. Core Content</h2>
          <div className="space-y-8">
            <FormField label="History of the Fellowship (Rich Text)">
              <div className="bg-surface-muted border border-border rounded-xl">
                <TipTapEditor content={form.historyHtml} onChange={val => setForm({...form, historyHtml: val})} />
              </div>
            </FormField>

            <FormField label="Our Vision (Rich Text)">
              <div className="bg-surface-muted border border-border rounded-xl">
                <TipTapEditor content={form.visionHtml} onChange={val => setForm({...form, visionHtml: val})} />
              </div>
            </FormField>

            <FormField label="Our Mission (Rich Text)">
              <div className="bg-surface-muted border border-border rounded-xl">
                <TipTapEditor content={form.missionHtml} onChange={val => setForm({...form, missionHtml: val})} />
              </div>
            </FormField>

            <FormField label="About LSBSF (Rich Text)">
              <div className="bg-surface-muted border border-border rounded-xl">
                <TipTapEditor content={form.aboutLsbsfHtml} onChange={val => setForm({...form, aboutLsbsfHtml: val})} />
              </div>
            </FormField>
          </div>
        </section>

        {/* SECTION 2: THEME ARCHIVE */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">2. Previous Themes Archive</h2>
            <button
              onClick={addTheme}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-foreground rounded-lg text-sm font-bold transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Theme
            </button>
          </div>

          <div className="space-y-6">
            {form.themeArchive.length === 0 ? (
              <p className="text-zinc-500 text-sm">No themes added yet. Click "Add Theme" to create one.</p>
            ) : (
              form.themeArchive.map((theme, index) => (
                <div key={theme.id} className="p-4 sm:p-6 border border-border rounded-xl bg-zinc-50/50 dark:bg-white/5 relative group">
                  <button
                    onClick={() => removeTheme(theme.id)}
                    className="absolute top-4 right-4 text-red-500 opacity-50 hover:opacity-100 transition-opacity"
                    title="Remove Theme"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <h3 className="text-sm font-bold uppercase text-zinc-400 mb-4 tracking-widest">Theme #{index + 1}</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="Year">
                        <input type="text" value={theme.year} onChange={e => updateTheme(theme.id, { year: e.target.value })} className="w-full bg-white dark:bg-black/20 border border-border p-3 rounded-xl outline-none" placeholder="e.g. 2024" />
                      </FormField>
                      <FormField label="Theme Title">
                        <input type="text" value={theme.theme} onChange={e => updateTheme(theme.id, { theme: e.target.value })} className="w-full bg-white dark:bg-black/20 border border-border p-3 rounded-xl outline-none" placeholder="e.g. The Outpouring" />
                      </FormField>
                    </div>
                    <FormField label="Scripture">
                      <input type="text" value={theme.scripture} onChange={e => updateTheme(theme.id, { scripture: e.target.value })} className="w-full bg-white dark:bg-black/20 border border-border p-3 rounded-xl outline-none" placeholder="e.g. Joel 2:28" />
                    </FormField>
                    <FormField label="Description">
                      <textarea value={theme.description} onChange={e => updateTheme(theme.id, { description: e.target.value })} className="w-full bg-white dark:bg-black/20 border border-border p-3 rounded-xl outline-none min-h-[80px]" placeholder="Brief description of the event..." />
                    </FormField>
                    <FormField label="Representative Image (Optional)">
                      <ImageUploader value={theme.imageUrl || ""} onChange={url => updateTheme(theme.id, { imageUrl: url })} />
                    </FormField>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
