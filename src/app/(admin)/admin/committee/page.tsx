"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable";
import { getEventScopedDocs, setEventScopedDoc, deleteEventScopedDoc, CommitteeMember } from "@/lib/firebase/cms";
import { Modal } from "@/components/shared/Modal";
import { FormField } from "@/components/shared/FormField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Loader2 } from "lucide-react";

export default function CommitteeAdminPage() {
  const { eventId: selectedEventId } = useAdminEvent();
  const queryClient = useQueryClient();

  const { data: committee = [], isLoading } = useQuery({
    queryKey: ["admin", "committee", selectedEventId],
    queryFn: () => getEventScopedDocs<CommitteeMember>(selectedEventId, "committeeMembers"),
    enabled: !!selectedEventId,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CommitteeMember | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [order, setOrder] = useState("0");
  const [status, setStatus] = useState<"published" | "draft">("draft");

  const resetForm = () => {
    setName("");
    setRole("");
    setBio("");
    setPhotoUrl("");
    setOrder("0");
    setStatus("draft");
    setEditingItem(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (item: CommitteeMember) => {
    setEditingItem(item);
    setName(item.name);
    setRole(item.role);
    setBio(item.bio || "");
    setPhotoUrl(item.photoUrl || "");
    setOrder(String(item.order || 0));
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: CommitteeMember = {
        id: editingItem?.id || Date.now().toString(),
        name,
        role,
        bio,
        photoUrl,
        order: parseInt(order, 10),
        status,
      };
      await setEventScopedDoc(selectedEventId, "committeeMembers", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "committee", selectedEventId] });
      setIsModalOpen(false);
    },
  });

  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsDeletingId(id);
      await deleteEventScopedDoc(selectedEventId, "committeeMembers", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "committee", selectedEventId] });
      setIsDeletingId(null);
    },
    onError: () => {
      setIsDeletingId(null);
    }
  });

  const columns: Column<CommitteeMember>[] = [
    {
      key: "photoUrl",
      label: "Photo",
      render: (item) => (
        item.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photoUrl} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">No img</div>
        )
      )
    },
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
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
        title="Committee Members"
        description="Manage the committee members displayed on the About page."
        data={committee}
        columns={columns}
        isLoading={isLoading}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={(item) => deleteMutation.mutate(item.id)}
        isDeletingId={isDeletingId}
        searchPredicate={(item, term) => 
          item.name.toLowerCase().includes(term) || 
          item.role.toLowerCase().includes(term)
        }
      />

      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? "Edit Committee Member" : "Add Committee Member"}
        >
          <div className="space-y-4">
          <FormField label="Name">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl outline-none" />
          </FormField>

          <FormField label="Role">
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl outline-none" />
          </FormField>

          <FormField label="Bio">
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl outline-none min-h-[100px]" />
          </FormField>

          <FormField label="Photo">
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
              disabled={saveMutation.isPending || !name || !role}
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
