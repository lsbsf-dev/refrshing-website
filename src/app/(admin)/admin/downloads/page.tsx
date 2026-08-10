"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable";
import { getEventScopedDocs, setEventScopedDoc, deleteEventScopedDoc, Download } from "@/lib/firebase/cms";
import { Modal } from "@/components/shared/Modal";
import { FormField } from "@/components/shared/FormField";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Loader2, UploadCloud, FileText } from "lucide-react";

export default function DownloadsAdminPage() {
  const { eventId: selectedEventId } = useAdminEvent();
  const queryClient = useQueryClient();

  const { data: downloads = [], isLoading } = useQuery({
    queryKey: ["admin", "downloads", selectedEventId],
    queryFn: () => getEventScopedDocs<Download>(selectedEventId, "downloads"),
    enabled: !!selectedEventId,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Download | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("pdf");
  const [order, setOrder] = useState("0");
  const [status, setStatus] = useState<"published" | "draft">("draft");

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFileUrl("");
    setFileType("pdf");
    setOrder("0");
    setStatus("draft");
    setEditingItem(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (item: Download) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setFileUrl(item.fileUrl);
    setFileType(item.fileType);
    setOrder(String(item.order || 0));
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Download = {
        id: editingItem?.id || Date.now().toString(),
        title,
        description,
        fileUrl,
        fileType,
        order: parseInt(order, 10),
        status,
      };
      await setEventScopedDoc(selectedEventId, "downloads", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "downloads", selectedEventId] });
      setIsModalOpen(false);
    },
  });

  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsDeletingId(id);
      await deleteEventScopedDoc(selectedEventId, "downloads", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "downloads", selectedEventId] });
      setIsDeletingId(null);
    },
    onError: () => {
      setIsDeletingId(null);
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_DOWNLOAD_PRESET;
      
      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary configuration is missing.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      // We use XMLHttpRequest here to allow Cloudinary to accept non-image files via 'auto' or 'raw'
      const xhr = new XMLHttpRequest();
      
      // Cloudinary recommends using 'auto' for resource type so it can handle pdf/docs
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
      
      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            setFileUrl(data.secure_url);
            const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown';
            setFileType(ext);
            resolve();
          } else {
            reject(new Error("Cloudinary upload failed: " + xhr.responseText));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
      });
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const columns: Column<Download>[] = [
    { key: "title", label: "Title" },
    { key: "fileType", label: "Type" },
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
        title="Downloads"
        description="Manage downloadable files and resources for the programme."
        data={downloads}
        columns={columns}
        isLoading={isLoading}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={(item) => deleteMutation.mutate(item.id)}
        isDeletingId={isDeletingId}
        searchPredicate={(item, term) => 
          item.title.toLowerCase().includes(term) || 
          item.description.toLowerCase().includes(term)
        }
      />

      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? "Edit Download" : "Add Download"}
        >
          <div className="space-y-4">
          <FormField label="Title">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none" />
          </FormField>

          <FormField label="Description (Plain text)">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none min-h-[80px]" />
          </FormField>

          <FormField label="File Upload">
            <div className="flex flex-col gap-3">
              {fileUrl ? (
                <div className="flex items-center gap-3 p-4 bg-surface-muted rounded-xl border border-border">
                  <FileText className="h-6 w-6 text-zinc-400" />
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#C25627] hover:underline break-all line-clamp-1">
                    {fileUrl}
                  </a>
                  <button onClick={() => setFileUrl("")} className="ml-auto text-xs font-bold text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex flex-col items-center gap-2 text-zinc-500 pointer-events-none">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-[#C25627]" />
                        <span className="font-bold text-sm">Uploading file...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-8 w-8" />
                        <span className="font-bold text-sm">Click or drag file to upload</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="File Type (Auto-detected)">
              <input type="text" value={fileType} onChange={(e) => setFileType(e.target.value)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none uppercase font-mono text-sm" />
            </FormField>
          </div>

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
              disabled={saveMutation.isPending || !title || !fileUrl}
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
