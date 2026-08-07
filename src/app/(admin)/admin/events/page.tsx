"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Save, X, Sparkles, Loader2, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEvents, updateEvent, createEvent, deleteEvent } from "@/lib/firebase/events";
import { AppEvent } from "@/types/event";
import { CustomSelect } from "@/components/shared/CustomSelect";

export default function AdminEventsPage() {
  const queryClient = useQueryClient();

  const { data: eventsList = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: getEvents,
  });

  const [searchQuery, setSearchQuery] = useState("");
  
  const [editingEvent, setEditingEvent] = useState<AppEvent | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [newEvent, setNewEvent] = useState({
    id: "",
    name: "",
    theme: "",
    scripture: "",
    startDate: "",
    endDate: "",
    venue: "Baptist Academy, Obanikoro, Lagos",
    status: "upcoming" as const,
    isMilestone: false,
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (editingEvent || isNewModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [editingEvent, isNewModalOpen]);

  const filtered = eventsList.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.theme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const triggerSuccessBanner = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const updateMutation = useMutation({
    mutationFn: (data: AppEvent) => updateEvent(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      setEditingEvent(null);
      triggerSuccessBanner();
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<AppEvent, "createdAt" | "updatedAt">) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      setIsNewModalOpen(false);
      setNewEvent({
        id: "",
        name: "",
        theme: "",
        scripture: "",
        startDate: "",
        endDate: "",
        venue: "Baptist Academy, Obanikoro, Lagos",
        status: "upcoming",
        isMilestone: false,
      });
      triggerSuccessBanner();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      triggerSuccessBanner();
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editingEvent.name.trim()) return;
    updateMutation.mutate(editingEvent);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.id.trim() || !newEvent.name.trim()) return;
    createMutation.mutate(newEvent);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this event edition?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#0B0907] dark:text-[#FCFAF6] mb-2 uppercase">
            Event Editions
          </h1>
          <p className="font-sans text-sm text-black/60 dark:text-white/60">
            Manage all conference editions, themes, and schedules.
          </p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-6 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>New Edition</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
          <Sparkles className="h-5 w-5" />
          <span className="font-sans text-sm font-bold">Changes saved successfully!</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-[#181612] p-2 border border-black/10 dark:border-white/10 rounded-2xl shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name or theme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-sm font-sans py-3 pl-10 pr-4 outline-none text-[#0B0907] dark:text-[#FCFAF6] placeholder:text-zinc-500"
          />
          {searchQuery && (
             <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
             >
               <X className="h-4 w-4" />
             </button>
          )}
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white dark:bg-[#181612] border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="px-6 py-4 font-sans text-xs font-bold text-black/50 dark:text-white/50 uppercase tracking-wider">
                  Event Details
                </th>
                <th className="px-6 py-4 font-sans text-xs font-bold text-black/50 dark:text-white/50 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-4 font-sans text-xs font-bold text-black/50 dark:text-white/50 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 font-sans text-xs font-bold text-black/50 dark:text-white/50 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <span className="font-sans text-sm">Loading events...</span>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-red-500 bg-red-500/10 border-y border-red-500/20">
                    <span className="font-sans text-sm font-bold">Failed to load events: {(error as Error)?.message || "Permission Denied or Unknown Error"}</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    <Calendar className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <span className="font-sans text-sm">No events found.</span>
                  </td>
                </tr>
              ) : (
                filtered.map((event) => (
                  <tr key={event.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-serif text-lg font-bold text-[#0B0907] dark:text-[#FCFAF6]">
                          {event.name}
                        </span>
                        <span className="font-sans text-xs text-black/60 dark:text-white/60 flex items-center gap-2">
                          <span className="font-bold text-[#DDB94E]">THEME:</span> {event.theme}
                          {event.isMilestone && (
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase rounded-full">
                              Milestone
                            </span>
                          )}
                        </span>
                        <span className="font-sans text-xs text-black/40 dark:text-white/40">
                          ID: {event.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-sans text-sm text-black/80 dark:text-white/80">
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                        event.status === 'ongoing' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : event.status === 'upcoming'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="p-2 hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 hover:text-[#0B0907] dark:hover:text-[#FCFAF6] rounded-full transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-full transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-2xl bg-white dark:bg-[#181612] text-[#0B0907] dark:text-[#FCFAF6] border border-black/15 dark:border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <h3 className="font-serif text-2xl font-bold uppercase">
                EDIT EVENT
              </h3>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="p-2 text-zinc-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Event Name <span className="text-[#C25627]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingEvent.name}
                  onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Event ID (Slug)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingEvent.id}
                  className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-xs font-sans py-3 px-4 rounded-xl outline-none opacity-60 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Theme <span className="text-[#C25627]">*</span>
              </label>
              <input
                type="text"
                required
                value={editingEvent.theme}
                onChange={(e) => setEditingEvent({ ...editingEvent, theme: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Scripture Reference <span className="text-[#C25627]">*</span>
              </label>
              <input
                type="text"
                required
                value={editingEvent.scripture}
                onChange={(e) => setEditingEvent({ ...editingEvent, scripture: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Start Date <span className="text-[#C25627]">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={editingEvent.startDate}
                  onChange={(e) => setEditingEvent({ ...editingEvent, startDate: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  End Date <span className="text-[#C25627]">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={editingEvent.endDate}
                  onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Venue <span className="text-[#C25627]">*</span>
              </label>
              <input
                type="text"
                required
                value={editingEvent.venue}
                onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Status
                </label>
                <CustomSelect
                  value={editingEvent.status}
                  onChange={(val) => setEditingEvent({ ...editingEvent, status: val as any })}
                  options={[
                    { value: "upcoming", label: "Upcoming" },
                    { value: "ongoing", label: "Ongoing" },
                    { value: "completed", label: "Completed" },
                  ]}
                />
              </div>
              <div className="flex items-center gap-3 mt-6">
                <input
                  type="checkbox"
                  id="editMilestone"
                  checked={editingEvent.isMilestone}
                  onChange={(e) => setEditingEvent({ ...editingEvent, isMilestone: e.target.checked })}
                  className="w-4 h-4 rounded bg-white/5 border-white/10"
                />
                <label htmlFor="editMilestone" className="text-xs font-sans font-bold uppercase cursor-pointer">
                  Is Milestone Event (e.g. 40th Anniversary)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10 mt-2">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-6 py-3 bg-zinc-100 dark:bg-white/5 font-sans font-bold text-xs uppercase rounded-full transition-colors"
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
            className="w-full max-w-2xl bg-white dark:bg-[#181612] text-[#0B0907] dark:text-[#FCFAF6] border border-black/15 dark:border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <h3 className="font-serif text-2xl font-bold uppercase">
                CREATE EVENT
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-2 text-zinc-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Event Name <span className="text-[#C25627]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Refreshing 2026"
                  value={newEvent.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    setNewEvent({ ...newEvent, name, id });
                  }}
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Event ID (Slug) <span className="text-[#C25627]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. refreshing-2026"
                  value={newEvent.id}
                  onChange={(e) => setNewEvent({ ...newEvent, id: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Theme <span className="text-[#C25627]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Greater Glory"
                value={newEvent.theme}
                onChange={(e) => setNewEvent({ ...newEvent, theme: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Scripture Reference <span className="text-[#C25627]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Haggai 2:9"
                value={newEvent.scripture}
                onChange={(e) => setNewEvent({ ...newEvent, scripture: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Start Date <span className="text-[#C25627]">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  End Date <span className="text-[#C25627]">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase mb-1">
                Venue <span className="text-[#C25627]">*</span>
              </label>
              <input
                type="text"
                required
                value={newEvent.venue}
                onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-xs font-sans py-3 px-4 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Status
                </label>
                <CustomSelect
                  value={newEvent.status}
                  onChange={(val) => setNewEvent({ ...newEvent, status: val as any })}
                  options={[
                    { value: "upcoming", label: "Upcoming" },
                    { value: "ongoing", label: "Ongoing" },
                    { value: "completed", label: "Completed" },
                  ]}
                />
              </div>
              <div className="flex items-center gap-3 mt-6">
                <input
                  type="checkbox"
                  id="newMilestone"
                  checked={newEvent.isMilestone}
                  onChange={(e) => setNewEvent({ ...newEvent, isMilestone: e.target.checked })}
                  className="w-4 h-4 rounded bg-white/5 border-white/10"
                />
                <label htmlFor="newMilestone" className="text-xs font-sans font-bold uppercase cursor-pointer">
                  Is Milestone Event (e.g. 40th Anniversary)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10 mt-2">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-6 py-3 bg-zinc-100 dark:bg-white/5 font-sans font-bold text-xs uppercase rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Create Edition</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
