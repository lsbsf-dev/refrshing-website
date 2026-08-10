"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminDataTable, Column } from "@/components/admin/AdminDataTable";
import { getEventScopedDocs, setEventScopedDoc, deleteEventScopedDoc, Article } from "@/lib/firebase/cms";
import { Modal } from "@/components/shared/Modal";
import { FormField } from "@/components/shared/FormField";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Loader2 } from "lucide-react";

export default function ArticlesAdminPage() {
  const { eventId: selectedEventId } = useAdminEvent();
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["admin", "articles", selectedEventId],
    queryFn: () => getEventScopedDocs<Article>(selectedEventId, "articles", "publishedDate"),
    enabled: !!selectedEventId,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Article | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("draft");

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setAuthor("");
    setSummary("");
    setContent("");
    setCoverImageUrl("");
    setPublishedDate(new Date().toISOString().split('T')[0]);
    setStatus("draft");
    setEditingItem(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (item: Article) => {
    setEditingItem(item);
    setTitle(item.title);
    setSlug(item.slug);
    setAuthor(item.author);
    setSummary(item.summary);
    setContent(item.content);
    setCoverImageUrl(item.coverImageUrl || "");
    setPublishedDate(item.publishedDate);
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const isDuplicate = articles.some(a => a.slug === generatedSlug && a.id !== editingItem?.id);
      if (isDuplicate) throw new Error("An article with this slug already exists.");

      const payload: Article = {
        id: editingItem?.id || Date.now().toString(),
        title,
        slug: generatedSlug,
        author,
        summary,
        content,
        coverImageUrl,
        publishedDate,
        status,
      };
      await setEventScopedDoc(selectedEventId, "articles", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "articles", selectedEventId] });
      setIsModalOpen(false);
    },
  });

  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsDeletingId(id);
      await deleteEventScopedDoc(selectedEventId, "articles", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "articles", selectedEventId] });
      setIsDeletingId(null);
    },
    onError: () => {
      setIsDeletingId(null);
    }
  });

  const columns: Column<Article>[] = [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "publishedDate", label: "Date" },
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
        title="Articles"
        description="Manage long-form articles for the programme."
        data={articles}
        columns={columns}
        isLoading={isLoading}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={(item) => deleteMutation.mutate(item.id)}
        isDeletingId={isDeletingId}
        searchPredicate={(item, term) => 
          item.title.toLowerCase().includes(term) || 
          item.author.toLowerCase().includes(term)
        }
      />

      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? "Edit Article" : "Add Article"}
        >
          <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Title">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none" />
            </FormField>

            <FormField label="Slug">
              <input type="text" placeholder="Auto-generated if empty" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Author">
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none" />
            </FormField>

            <FormField label="Published Date">
              <input type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none" />
            </FormField>
          </div>

          <FormField label="Summary (Short description)">
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none min-h-[80px]" />
          </FormField>

          <FormField label="Cover Image">
            <ImageUploader
              value={coverImageUrl}
              onChange={(url) => setCoverImageUrl(url)}
            />
          </FormField>

          <FormField label="Content">
            <RichTextEditor value={content} onChange={setContent} />
          </FormField>

          <FormField label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full bg-surface-muted border border-border p-3 rounded-xl outline-none">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </FormField>

          <div className="pt-4 flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !title || !content}
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
