"use client";

import React, { useState, useEffect } from "react";
import { Save, Sparkles, Loader2, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSystemSettings, updateSystemSettings } from "@/lib/firebase/settings";
import { getEvents } from "@/lib/firebase/events";
import { CustomSelect } from "@/components/shared/CustomSelect";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getSystemSettings,
  });

  const { data: eventsList = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: getEvents,
  });

  const [defaultEventId, setDefaultEventId] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setDefaultEventId(settings.defaultEventId);
    }
  }, [settings]);

  const triggerSuccessBanner = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const updateMutation = useMutation({
    mutationFn: (newDefaultId: string) => updateSystemSettings({ defaultEventId: newDefaultId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      triggerSuccessBanner();
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultEventId) return;
    updateMutation.mutate(defaultEventId);
  };

  const eventOptions = eventsList.map((e) => ({
    value: e.id,
    label: `${e.name} (${e.id})`,
  }));

  if (isLoadingSettings || isLoadingEvents) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
        <p className="font-sans text-sm text-zinc-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#0B0907] dark:text-[#FCFAF6] mb-2 uppercase flex items-center gap-3">
          <Settings className="h-8 w-8 text-[#C25627]" />
          System Settings
        </h1>
        <p className="font-sans text-sm text-black/60 dark:text-white/60">
          Global configuration and active edition settings.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
          <Sparkles className="h-5 w-5" />
          <span className="font-sans text-sm font-bold">Settings updated successfully!</span>
        </div>
      )}

      {/* Main Settings Card */}
      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-[#181612] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-8 shadow-sm"
      >
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-xl font-bold uppercase text-[#0B0907] dark:text-[#FCFAF6]">
            Active Conference Edition
          </h2>
          <p className="font-sans text-sm text-black/60 dark:text-white/60">
            Select the default edition that visitors see when they visit the root URL (e.g. refreshing.org.ng).
          </p>
        </div>

        <div className="max-w-md">
          <label className="block text-xs font-sans font-bold uppercase mb-2 text-[#0B0907] dark:text-[#FCFAF6]">
            Default Event ID
          </label>
          <CustomSelect
            value={defaultEventId}
            onChange={(val) => setDefaultEventId(val)}
            options={eventOptions}
          />
        </div>

        <div className="flex items-center pt-6 border-t border-black/5 dark:border-white/5">
          <button
            type="submit"
            disabled={updateMutation.isPending || defaultEventId === settings?.defaultEventId}
            className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 transition-all"
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
