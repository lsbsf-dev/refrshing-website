"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable";
import { getEventScopedDocs, setEventScopedDoc, deleteEventScopedDoc, Devotional } from "@/lib/firebase/cms";
import { Modal } from "@/components/shared/Modal";
import { FormField } from "@/components/shared/FormField";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Loader2 } from "lucide-react";

export default function DevotionalsAdminPage() {
  const { eventId: selectedEventId } = useAdminEvent();
  const queryClient = useQueryClient();

  const { data: devotionals = [], isLoading } = useQuery({
    queryKey: ["admin", "devotionals", selectedEventId],
    queryFn: () => getEventScopedDocs<Devotional>(selectedEventId, "devotionals"),
    enabled: !!selectedEventId,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Devotional | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [day, setDay] = useState("");
  const [scripture, setScripture] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState("0");
  const [status, setStatus] = useState<"published" | "draft">("draft");

  const resetForm = () => {
    setTitle("");
    setDay("");
    setScripture("");
    setAuthor("");
    setContent("");
    setOrder("0");
    setStatus("draft");
    setEditingItem(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (item: Devotional) => {
    setEditingItem(item);
    setTitle(item.title);
    setDay(item.day);
    setScripture(item.scripture);
    setAuthor(item.author);
    setContent(item.content);
    setOrder(String(item.order || 0));
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Devotional = {
        id: editingItem?.id || Date.now().toString(),
        title,
        day,
        scripture,
        author,
        content,
        order: parseInt(order, 10),
        status,
      };
      await setEventScopedDoc(selectedEventId, "devotionals", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "devotionals", selectedEventId] });
      setIsModalOpen(false);
    },
  });

  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsDeletingId(id);
      await deleteEventScopedDoc(selectedEventId, "devotionals", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "devotionals", selectedEventId] });
      setIsDeletingId(null);
    },
    onError: () => {
      setIsDeletingId(null);
    }
  });

  const columns: Column<Devotional>[] = [
    { key: "day", label: "Day" },
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
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

  if (!selectedEventId) return null;

  return (
    <div className="pb-10">
      <AdminDataTable
        title="Devotionals"
        description="Manage daily devotionals for the programme."
        data={devotionals}
        columns={columns}
        isLoading={isLoading}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={(item) => deleteMutation.mutate(item.id)}
        isDeletingId={isDeletingId}
        searchPredicate={(item, term) => 
          item.title.toLowerCase().includes(term) || 
          item.day.toLowerCase().includes(term) ||
          item.author.toLowerCase().includes(term)
        }
      />

      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? "Edit Devotional" : "Add Devotional"}
        >
          <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <FormField label="Day">
                <input type="text" placeholder="e.g. Day 1" value={day} onChange={(e) => setDay(e.target.value)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none" />
              </FormField>
            </div>
            <div className="col-span-2">
              <FormField label="Title">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none" />
              </FormField>
            </div>
          </div>

          <FormField label="Author">
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none" />
          </FormField>

          <FormField label="Scripture Reference">
            <input type="text" placeholder="e.g. John 3:16" value={scripture} onChange={(e) => setScripture(e.target.value)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none" />
          </FormField>

          <FormField label="Content">
            <RichTextEditor value={content} onChange={setContent} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Order (Sort)">
              <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none" />
            </FormField>

            <FormField label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none">
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
              disabled={saveMutation.isPending || !title || !day}
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
