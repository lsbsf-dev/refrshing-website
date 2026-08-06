"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable";
import { getEventScopedDocs, setEventScopedDoc, deleteEventScopedDoc, Advertisement } from "@/lib/firebase/cms";
import { Modal } from "@/components/shared/Modal";
import { FormField } from "@/components/shared/FormField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Loader2 } from "lucide-react";

export default function AdvertisementsAdminPage() {
  const { eventId: selectedEventId } = useAdminEvent();
  const queryClient = useQueryClient();

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["admin", "advertisements", selectedEventId],
    queryFn: () => getEventScopedDocs<Advertisement>(selectedEventId, "advertisements"),
    enabled: !!selectedEventId,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Advertisement | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [order, setOrder] = useState("0");
  const [status, setStatus] = useState<"published" | "draft">("draft");

  const resetForm = () => {
    setTitle("");
    setSponsor("");
    setDescription("");
    setImageUrl("");
    setLinkUrl("");
    setOrder("0");
    setStatus("draft");
    setEditingItem(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (item: Advertisement) => {
    setEditingItem(item);
    setTitle(item.title);
    setSponsor(item.sponsor);
    setDescription(item.description);
    setImageUrl(item.imageUrl);
    setLinkUrl(item.linkUrl);
    setOrder(String(item.order || 0));
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Advertisement = {
        id: editingItem?.id || Date.now().toString(),
        title,
        sponsor,
        description,
        imageUrl,
        linkUrl,
        order: parseInt(order, 10),
        status,
      };
      await setEventScopedDoc(selectedEventId, "advertisements", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "advertisements", selectedEventId] });
      setIsModalOpen(false);
    },
  });

  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsDeletingId(id);
      await deleteEventScopedDoc(selectedEventId, "advertisements", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "advertisements", selectedEventId] });
      setIsDeletingId(null);
    },
    onError: () => {
      setIsDeletingId(null);
    }
  });

  const columns: Column<Advertisement>[] = [
    {
      key: "imageUrl",
      label: "Image",
      render: (item) => (
        item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.title} className="w-16 h-10 rounded-md object-cover" />
        ) : (
          <div className="w-16 h-10 rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">No img</div>
        )
      )
    },
    { key: "title", label: "Title" },
    { key: "sponsor", label: "Sponsor" },
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
        title="Advertisements"
        description="Manage banner ads and sponsor links for the programme."
        data={ads}
        columns={columns}
        isLoading={isLoading}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={(item) => deleteMutation.mutate(item.id)}
        isDeletingId={isDeletingId}
        searchPredicate={(item, term) => 
          item.title.toLowerCase().includes(term) || 
          item.sponsor.toLowerCase().includes(term)
        }
      />

      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? "Edit Advertisement" : "Add Advertisement"}
        >
          <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Title">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl outline-none" />
            </FormField>
            
            <FormField label="Sponsor">
              <input type="text" value={sponsor} onChange={(e) => setSponsor(e.target.value)} className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl outline-none" />
            </FormField>
          </div>

          <FormField label="Description (Plain text)">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl outline-none min-h-[80px]" />
          </FormField>

          <FormField label="Link URL">
            <input type="url" placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl outline-none" />
          </FormField>

          <FormField label="Ad Image">
            <ImageUploader
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
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
              disabled={saveMutation.isPending || !title || !imageUrl}
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
