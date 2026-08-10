"use client";

import React, { useState } from "react";
import { Search, Plus, Edit2, Trash2, Loader2, AlertCircle } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface AdminDataTableProps<T> {
  title: string;
  description: string;
  data: T[];
  columns: Column<T>[];
  isLoading: boolean;
  onAddNew: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  searchPredicate?: (item: T, term: string) => boolean;
  isDeletingId?: string | null;
}

export function AdminDataTable<T extends { id: string }>({
  title,
  description,
  data,
  columns,
  isLoading,
  onAddNew,
  onEdit,
  onDelete,
  searchPredicate,
  isDeletingId
}: AdminDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = React.useMemo(() => {
    if (!searchTerm || !searchPredicate) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item => searchPredicate(item, term));
  }, [data, searchTerm, searchPredicate]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-1 uppercase">
            {title}
          </h1>
          <p className="font-sans text-sm text-foreground-muted">
            {description}
          </p>
        </div>
        <button
          onClick={onAddNew}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C25627] hover:bg-[#a1451f] text-white font-bold text-sm rounded-xl transition-colors shrink-0 shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Add New
        </button>
      </div>

      {/* Toolbar */}
      {searchPredicate && (
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border text-sm font-sans py-3 pl-11 pr-4 rounded-xl outline-none focus:border-[#C25627] dark:focus:border-[#C25627] transition-colors shadow-sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading {title.toLowerCase()}...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <AlertCircle className="h-10 w-10 mx-auto mb-4 opacity-20" />
            <p>No records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-surface-muted border-b border-border text-xs uppercase font-bold text-zinc-500">
                <tr>
                  {columns.map((col, i) => (
                    <th key={col.key || i} className="px-6 py-4">{col.label}</th>
                  ))}
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                    {columns.map((col, i) => (
                      <td key={col.key || i} className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                        {col.render ? col.render(item) : String((item as any)[col.key] || '')}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 text-zinc-500 hover:text-[#C25627] hover:bg-[#C25627]/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
                              onDelete(item);
                            }
                          }}
                          disabled={isDeletingId === item.id}
                          className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {isDeletingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
