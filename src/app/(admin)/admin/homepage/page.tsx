"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventScopedDocs, setEventScopedDoc, HomepageSettings, Article } from "@/lib/firebase/cms";
import { FormField } from "@/components/shared/FormField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Loader2, Save } from "lucide-react";
import { getMinisters } from "@/lib/firebase/ministers";
import { Minister } from "@/types/minister";
import { Announcement } from "@/types/announcement";

export default function HomepageAdminPage() {
  const { eventId: selectedEventId } = useAdminEvent();
  const queryClient = useQueryClient();

  const { data: settingsDocs = [], isLoading: isLoadingSettings } = useQuery({
    queryKey: ["admin", "homepageSettings", selectedEventId],
    queryFn: () => getEventScopedDocs<HomepageSettings>(selectedEventId, "homepageSettings"),
    enabled: !!selectedEventId,
  });

  const { data: ministers = [] } = useQuery({
    queryKey: ["admin", "ministers", selectedEventId],
    queryFn: () => getEventScopedDocs<Minister>(selectedEventId, "ministers"),
    enabled: !!selectedEventId,
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["admin", "announcements", selectedEventId],
    queryFn: () => getEventScopedDocs<Announcement>(selectedEventId, "announcements"),
    enabled: !!selectedEventId,
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["admin", "articles", selectedEventId],
    queryFn: () => getEventScopedDocs<Article>(selectedEventId, "articles"),
    enabled: !!selectedEventId,
  });

  const defaultSettings: HomepageSettings = {
    id: "settings",
    status: "published",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    heroTitle: "",
    heroSubtitle: "",
    heroBackgroundImageUrl: "",
    showRegistrationButton: false,
    registrationLink: "",
    showCountdown: false,
    anniversaryBannerEnabled: false,
    anniversary: { title: "", subtitle: "", backgroundImageUrl: "", displayStart: "", displayEnd: "" },
    milestoneOverlayEnabled: false,
    milestone: { text: "", imageUrl: "" },
    featuredMinisters: [],
    featuredAnnouncement: "",
    featuredGalleryImages: [],
    featuredArticles: []
  };

  const [form, setForm] = useState<HomepageSettings>(defaultSettings);

  useEffect(() => {
    if (settingsDocs.length > 0) {
      setForm(settingsDocs[0]);
    }
  }, [settingsDocs]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await setEventScopedDoc(selectedEventId, "homepageSettings", form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "homepageSettings", selectedEventId] });
      alert("Settings saved successfully!");
    }
  });

  if (!selectedEventId) return null;

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground uppercase mb-1">
            Homepage Settings
          </h1>
          <p className="font-sans text-sm text-foreground-muted">
            Configure the content and layout of the public homepage.
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
        {/* SECTION 1: HERO */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold mb-6 text-foreground">1. Hero Content</h2>
          <div className="space-y-6">
            <FormField label="Hero Title">
              <input type="text" value={form.heroTitle} onChange={e => setForm({...form, heroTitle: e.target.value})} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none" placeholder="e.g. LSBSF REFRESHING 2026" />
            </FormField>
            <FormField label="Hero Subtitle">
              <input type="text" value={form.heroSubtitle} onChange={e => setForm({...form, heroSubtitle: e.target.value})} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none" placeholder="e.g. Join us for a transformative experience" />
            </FormField>
            <FormField label="Hero Background Image">
              <ImageUploader value={form.heroBackgroundImageUrl} onChange={url => setForm({...form, heroBackgroundImageUrl: url})} />
            </FormField>
          </div>
        </section>

        {/* SECTION 2: TOGGLES */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold mb-6 text-foreground">2. Action & Timing</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <input type="checkbox" id="showReg" checked={form.showRegistrationButton} onChange={e => setForm({...form, showRegistrationButton: e.target.checked})} className="h-5 w-5 accent-[#C25627]" />
              <label htmlFor="showReg" className="font-bold text-sm">Show Registration Button</label>
            </div>
            {form.showRegistrationButton && (
              <FormField label="Registration Link URL">
                <input type="url" value={form.registrationLink || ""} onChange={e => setForm({...form, registrationLink: e.target.value})} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none" placeholder="https://..." />
              </FormField>
            )}
            <div className="flex items-center gap-4">
              <input type="checkbox" id="showCount" checked={form.showCountdown} onChange={e => setForm({...form, showCountdown: e.target.checked})} className="h-5 w-5 accent-[#C25627]" />
              <label htmlFor="showCount" className="font-bold text-sm">Show Countdown to Event</label>
            </div>
          </div>
        </section>

        {/* SECTION 3: ANNIVERSARY */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold mb-6 text-foreground">3. Anniversary Banner</h2>
          <p className="text-sm text-zinc-500 mb-6">A persistent section on the homepage celebrating a major anniversary.</p>
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <input type="checkbox" id="annivEnabled" checked={form.anniversaryBannerEnabled} onChange={e => setForm({...form, anniversaryBannerEnabled: e.target.checked})} className="h-5 w-5 accent-[#C25627]" />
              <label htmlFor="annivEnabled" className="font-bold text-sm">Enable Anniversary Banner</label>
            </div>
            {form.anniversaryBannerEnabled && (
              <div className="space-y-4 p-4 border border-black/10 rounded-xl bg-zinc-50/50 dark:bg-white/5">
                <FormField label="Title">
                  <input type="text" value={form.anniversary?.title || ""} onChange={e => setForm({...form, anniversary: {...form.anniversary, title: e.target.value}})} className="w-full bg-white dark:bg-black/20 border border-border p-3 rounded-xl outline-none" />
                </FormField>
                <FormField label="Subtitle">
                  <input type="text" value={form.anniversary?.subtitle || ""} onChange={e => setForm({...form, anniversary: {...form.anniversary, subtitle: e.target.value}})} className="w-full bg-white dark:bg-black/20 border border-border p-3 rounded-xl outline-none" />
                </FormField>
                <FormField label="Background Image">
                  <ImageUploader value={form.anniversary?.backgroundImageUrl || ""} onChange={url => setForm({...form, anniversary: {...form.anniversary, backgroundImageUrl: url}})} />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Display Start Date">
                    <input type="datetime-local" value={form.anniversary?.displayStart || ""} onChange={e => setForm({...form, anniversary: {...form.anniversary, displayStart: e.target.value}})} className="w-full bg-white dark:bg-black/20 border border-border p-3 rounded-xl outline-none" />
                  </FormField>
                  <FormField label="Display End Date">
                    <input type="datetime-local" value={form.anniversary?.displayEnd || ""} onChange={e => setForm({...form, anniversary: {...form.anniversary, displayEnd: e.target.value}})} className="w-full bg-white dark:bg-black/20 border border-border p-3 rounded-xl outline-none" />
                  </FormField>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 4: MILESTONE */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold mb-6 text-foreground">4. Milestone Overlay</h2>
          <p className="text-sm text-zinc-500 mb-6">A celebratory modal overlay that appears once on a visitor's first visit.</p>
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <input type="checkbox" id="mileEnabled" checked={form.milestoneOverlayEnabled} onChange={e => setForm({...form, milestoneOverlayEnabled: e.target.checked})} className="h-5 w-5 accent-[#C25627]" />
              <label htmlFor="mileEnabled" className="font-bold text-sm">Enable Milestone Overlay</label>
            </div>
            {form.milestoneOverlayEnabled && (
              <div className="space-y-4 p-4 border border-black/10 rounded-xl bg-zinc-50/50 dark:bg-white/5">
                <FormField label="Overlay Text">
                  <textarea value={form.milestone?.text || ""} onChange={e => setForm({...form, milestone: {...form.milestone, text: e.target.value}})} className="w-full bg-white dark:bg-black/20 border border-border p-3 rounded-xl outline-none min-h-[80px]" />
                </FormField>
                <FormField label="Overlay Image">
                  <ImageUploader value={form.milestone?.imageUrl || ""} onChange={url => setForm({...form, milestone: {...form.milestone, imageUrl: url}})} />
                </FormField>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 5: FEATURED CONTENT */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold mb-6 text-foreground">5. Featured Content</h2>
          <div className="space-y-6">
            
            <FormField label="Featured Ministers (Multi-select by ID or name)">
              <div className="flex flex-col gap-2">
                {ministers.map(m => (
                  <label key={m.id} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={(form.featuredMinisters || []).includes(m.id)}
                      onChange={(e) => {
                        const current = form.featuredMinisters || [];
                        if (e.target.checked) setForm({...form, featuredMinisters: [...current, m.id]});
                        else setForm({...form, featuredMinisters: current.filter(id => id !== m.id)});
                      }}
                      className="accent-[#C25627]"
                    />
                    <span className="text-sm">{m.name}</span>
                  </label>
                ))}
              </div>
            </FormField>

            <FormField label="Featured Announcement">
              <select 
                value={form.featuredAnnouncement || ""} 
                onChange={e => setForm({...form, featuredAnnouncement: e.target.value})}
                className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none"
              >
                <option value="">-- Select Announcement --</option>
                {announcements.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Featured Articles">
              <div className="flex flex-col gap-2 border border-black/10 rounded-xl p-4 max-h-48 overflow-y-auto bg-zinc-50/50">
                {articles.map(a => (
                  <label key={a.id} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={(form.featuredArticles || []).includes(a.id)}
                      onChange={(e) => {
                        const current = form.featuredArticles || [];
                        if (e.target.checked) setForm({...form, featuredArticles: [...current, a.id]});
                        else setForm({...form, featuredArticles: current.filter(id => id !== a.id)});
                      }}
                      className="accent-[#C25627]"
                    />
                    <span className="text-sm">{a.title}</span>
                  </label>
                ))}
              </div>
            </FormField>

            <FormField label="Featured Gallery Images (Image URLs)">
              {/* For now, just allow uploading a few images directly since Gallery isn't built yet */}
              <div className="space-y-4">
                {(form.featuredGalleryImages || []).map((url, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-zinc-50 p-2 rounded-xl border border-black/10">
                    <img src={url} alt="featured" className="w-16 h-12 object-cover rounded-md" />
                    <button 
                      onClick={() => {
                        const current = [...form.featuredGalleryImages];
                        current.splice(idx, 1);
                        setForm({...form, featuredGalleryImages: current});
                      }}
                      className="text-red-500 text-sm font-bold px-4"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="border border-dashed border-black/20 p-4 rounded-xl">
                  <span className="text-sm font-bold mb-2 block">Add New Gallery Image</span>
                  <ImageUploader 
                    value="" 
                    onChange={url => {
                      if(url) setForm({...form, featuredGalleryImages: [...(form.featuredGalleryImages || []), url]});
                    }} 
                  />
                </div>
              </div>
            </FormField>

          </div>
        </section>

      </div>
    </div>
  );
}
