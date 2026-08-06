"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable";
import { getTimelineEntries, setTimelineEntry, deleteTimelineEntry, TimelineEntry } from "@/lib/firebase/cms";
import { Modal } from "@/components/shared/Modal";
import { FormField } from "@/components/shared/FormField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Loader2 } from "lucide-react";

export default function TimelineAdminPage() {
  const queryClient = useQueryClient();

  const { data: timeline = [], isLoading } = useQuery({
    queryKey: ["admin", "timeline"],
    queryFn: () => getTimelineEntries(),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineEntry | null>(null);
  
  // Form State
  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [order, setOrder] = useState("0");
  const [status, setStatus] = useState<"published" | "draft">("draft");

  const resetForm = () => {
    setYear("");
    setTitle("");
    setDescription("");
    setPhotoUrl("");
    setOrder("0");
    setStatus("draft");
    setEditingItem(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (item: TimelineEntry) => {
    setEditingItem(item);
    setYear(item.year);
    setTitle(item.title);
    setDescription(item.description);
    setPhotoUrl(item.photoUrl || "");
    setOrder(String(item.order || 0));
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: TimelineEntry = {
        id: editingItem?.id || Date.now().toString(),
        year,
        title,
        description,
        photoUrl,
        order: parseInt(order, 10),
        status,
      };
      await setTimelineEntry(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "timeline"] });
      setIsModalOpen(false);
    },
  });

  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsDeletingId(id);
      await deleteTimelineEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "timeline"] });
      setIsDeletingId(null);
    },
    onError: () => {
      setIsDeletingId(null);
    }
  });

  const columns: Column<TimelineEntry>[] = [
    { key: "year", label: "Year" },
    { key: "title", label: "Title" },
    { key: "order", label: "Order" },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-zinc-500/10 text-zinc-600'}`}>
          {item.status}
        </span>
      )
    }
  ];

  return (
    <div className="pb-10">
      <AdminDataTable
        title="Timeline Entries"
        description="Manage the global interactive timeline shown on the About page."
        data={timeline}
        columns={columns}
        isLoading={isLoading}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={(item) => deleteMutation.mutate(item.id)}
        isDeletingId={isDeletingId}
        searchPredicate={(item, term) => 
          item.title.toLowerCase().includes(term) || 
          item.year.toLowerCase().includes(term)
        }
      />

      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? "Edit Timeline Entry" : "Add Timeline Entry"}
        >
          <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <FormField label="Year">
                <input type="text" value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl outline-none" />
              </FormField>
            </div>
            <div className="col-span-3">
              <FormField label="Title">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl outline-none" />
              </FormField>
            </div>
          </div>

          <FormField label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl outline-none min-h-[100px]" />
          </FormField>

          <FormField label="Photo (Optional)">
            <ImageUploader
              value={photoUrl}
              onChange={(url) => setPhotoUrl(url)}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Order (Sort)">
              <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl outline-none" />
            </FormField>

            <FormField label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl outline-none">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </FormField>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !year || !title}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C25627] hover:bg-[#a1451f] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save"}
            </button>
          </div>
        </div>
      </Modal>
      )}
    </div>
  );
}
