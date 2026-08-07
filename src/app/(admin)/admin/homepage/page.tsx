"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventScopedDocs, setHomepageSettings, HomepageSettings, HomepageBlock, BlockVariant } from "@/lib/firebase/cms";
import { FormField } from "@/components/shared/FormField";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Loader2, Save, Eye, Send, ArrowUp, ArrowDown, Trash2, Plus, GripVertical } from "lucide-react";
import { getMinisters } from "@/lib/firebase/ministers";
import { Minister } from "@/types/minister";

export default function HomepageAdminPage() {
  const { eventId: selectedEventId } = useAdminEvent();
  const queryClient = useQueryClient();

  const { data: settingsDocs = [], isLoading: isLoadingSettings, isError: isSettingsError, error: settingsError } = useQuery({
    queryKey: ["admin", "homepageSettings", selectedEventId],
    queryFn: () => getEventScopedDocs<HomepageSettings>(selectedEventId, "homepageSettings"),
    enabled: !!selectedEventId,
  });

  const { data: ministers = [], isError: isMinistersError, error: ministersError } = useQuery({
    queryKey: ["admin", "ministers", selectedEventId],
    queryFn: () => getEventScopedDocs<Minister>(selectedEventId, "ministers"),
    enabled: !!selectedEventId,
  });

  const defaultSettings: HomepageSettings = {
    id: "settings",
    status: "draft",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    showRegistrationButton: false,
    registrationLink: "",
    showCountdown: false,
    blocks: []
  };

  // Show a short loading spinner for up to 3 seconds, then reveal the UI regardless of data state
  const [showSpinner, setShowSpinner] = React.useState(true);
  React.useEffect(() => {
    const timer = setTimeout(() => setShowSpinner(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const [form, setForm] = useState<HomepageSettings>(defaultSettings);
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    if (settingsDocs.length > 0) {
      setForm(settingsDocs[0]);
    }
  }, [settingsDocs]);

  const saveMutation = useMutation({
    mutationFn: async ({ status, saveVersion = false }: { status: 'draft' | 'published', saveVersion?: boolean }) => {
      const payload: HomepageSettings = { ...form, status };
      await setHomepageSettings(selectedEventId, payload, saveVersion);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "homepageSettings", selectedEventId] });
      alert("Settings saved successfully!");
    }
  });

  const handleAddBlock = (type: HomepageBlock['type']) => {
    const newBlock = generateEmptyBlock(type);
    setForm({ ...form, blocks: [...(form.blocks || []), newBlock] });
    setShowAddMenu(false);
  };

  const handleUpdateBlock = (index: number, updatedBlock: HomepageBlock) => {
    const newBlocks = [...(form.blocks || [])];
    newBlocks[index] = updatedBlock;
    setForm({ ...form, blocks: newBlocks });
  };

  const handleRemoveBlock = (index: number) => {
    const newBlocks = [...(form.blocks || [])];
    newBlocks.splice(index, 1);
    setForm({ ...form, blocks: newBlocks });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...(form.blocks || [])];
    if (direction === 'up' && index > 0) {
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    } else if (direction === 'down' && index < newBlocks.length - 1) {
      [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
    }
    setForm({ ...form, blocks: newBlocks });
  };

  if (!selectedEventId) return null;

  if (showSpinner && isLoadingSettings) {
    return (
      <div className="flex items-center justify-center p-12 bg-[#FAF9F6] min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (isSettingsError || isMinistersError) {
    return (
      <div className="flex items-center justify-center p-12 bg-[#FAF9F6] min-h-[50vh]">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-3xl flex flex-col items-center justify-center text-center max-w-md">
          <p className="font-sans font-bold text-lg mb-2">Failed to load homepage settings</p>
          <p className="text-sm">
            {((settingsError || ministersError) as Error)?.message || "Permission Denied or Unknown Error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 max-w-5xl mx-auto bg-[#FAF9F6] min-h-screen">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1C1A17] uppercase mb-1">
            Homepage Content
          </h1>
          <div className="flex items-center gap-3">
             <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${form.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
               {form.status}
             </span>
             <p className="font-sans text-sm text-zinc-500">
               Last updated: {form.updatedAt ? new Date(form.updatedAt.toDate ? form.updatedAt.toDate() : form.updatedAt).toLocaleString() : 'Never'}
             </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => window.open(`/?preview=true`, '_blank')}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 font-bold text-sm rounded-xl transition-colors"
          >
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button
            onClick={() => saveMutation.mutate({ status: 'draft' })}
            disabled={saveMutation.isPending}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </button>
          <button
            onClick={() => {
               if(window.confirm("Are you sure you want to publish these changes live?")) {
                 saveMutation.mutate({ status: 'published', saveVersion: true });
               }
            }}
            disabled={saveMutation.isPending}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1C1A17] hover:bg-[#333] text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> Publish
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* MAIN PAGE BUILDER */}
        <div className="flex-1 space-y-6">
          <h2 className="font-sans font-bold text-sm uppercase tracking-widest text-zinc-400 mb-2">Page Blocks</h2>
          
          {(form.blocks || []).length === 0 ? (
            <div className="bg-white border border-dashed border-zinc-300 rounded-2xl p-12 text-center">
               <p className="text-zinc-500 mb-4">No blocks have been added yet.</p>
            </div>
          ) : (
            (form.blocks || []).map((block, idx) => (
              <div key={block.id} className={`bg-white border ${block.enabled ? 'border-zinc-200' : 'border-dashed border-zinc-300 bg-zinc-50 opacity-75'} rounded-2xl shadow-sm overflow-hidden transition-all`}>
                {/* Block Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-b border-zinc-100">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-zinc-400" />
                    <div>
                      <input 
                        type="text" 
                        value={block.label} 
                        onChange={e => handleUpdateBlock(idx, { ...block, label: e.target.value })}
                        className="font-bold text-[#1C1A17] bg-transparent outline-none hover:bg-zinc-100 px-2 py-1 rounded-md"
                        placeholder="Block Label..."
                      />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-2">{block.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 mr-4 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={block.enabled} 
                        onChange={e => handleUpdateBlock(idx, { ...block, enabled: e.target.checked })}
                        className="accent-[#C25627]" 
                      /> Enabled
                    </label>
                    <button onClick={() => handleMoveBlock(idx, 'up')} disabled={idx === 0} className="p-1.5 text-zinc-400 hover:text-zinc-800 disabled:opacity-30 rounded-md hover:bg-zinc-200">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleMoveBlock(idx, 'down')} disabled={idx === form.blocks.length - 1} className="p-1.5 text-zinc-400 hover:text-zinc-800 disabled:opacity-30 rounded-md hover:bg-zinc-200">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleRemoveBlock(idx)} className="p-1.5 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50 ml-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Block Content */}
                <div className="p-6">
                   <BlockEditor 
                     block={block} 
                     onChange={(newBlock) => handleUpdateBlock(idx, newBlock)} 
                     ministers={ministers}
                   />
                </div>
              </div>
            ))
          )}

          {/* Add Block Button */}
          <div className="relative mt-8">
            <button 
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-full py-4 border-2 border-dashed border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100 text-zinc-600 font-bold text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="h-5 w-5" /> Add Block
            </button>
            
            {showAddMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 shadow-xl rounded-xl p-2 z-10 grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { type: 'hero', label: 'Hero Section' },
                  { type: 'anniversary', label: 'Anniversary Banner' },
                  { type: 'gallery', label: 'Gallery Grid' },
                  { type: 'featured_ministers', label: 'Featured Ministers' },
                  { type: 'rich_text', label: 'Rich Text' },
                ].map((b) => (
                  <button 
                    key={b.type}
                    onClick={() => handleAddBlock(b.type as any)}
                    className="p-3 text-left hover:bg-zinc-50 rounded-lg text-sm font-bold text-zinc-700 transition-colors"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR SETTINGS */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
            <h2 className="font-sans font-bold text-sm uppercase tracking-widest text-zinc-400 mb-4">Global Settings</h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.showRegistrationButton} 
                  onChange={e => setForm({...form, showRegistrationButton: e.target.checked})} 
                  className="h-5 w-5 accent-[#C25627]" 
                />
                <span className="font-bold text-sm text-[#1C1A17]">Show Registration CTA</span>
              </label>

              {form.showRegistrationButton && (
                <FormField label="Registration URL">
                  <input 
                    type="url" 
                    value={form.registrationLink || ""} 
                    onChange={e => setForm({...form, registrationLink: e.target.value})} 
                    className="w-full bg-zinc-50 border border-zinc-200 p-2.5 text-sm rounded-xl outline-none focus:border-zinc-400 focus:bg-white" 
                    placeholder="https://..." 
                  />
                </FormField>
              )}

              <label className="flex items-center gap-3 cursor-pointer mt-4">
                <input 
                  type="checkbox" 
                  checked={form.showCountdown} 
                  onChange={e => setForm({...form, showCountdown: e.target.checked})} 
                  className="h-5 w-5 accent-[#C25627]" 
                />
                <span className="font-bold text-sm text-[#1C1A17]">Show Countdown Timer</span>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


// --- Helper Components for Block Editing ---

function BlockEditor({ block, onChange, ministers }: { block: HomepageBlock, onChange: (b: HomepageBlock) => void, ministers: Minister[] }) {
  
  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...block, variant: e.target.value as BlockVariant });
  };

  const VariantSelector = () => (
    <div className="mb-6 pb-6 border-b border-zinc-100">
      <FormField label="Block Variant (Design Style)">
        <select 
          value={block.variant || 'default'} 
          onChange={handleVariantChange}
          className="w-full bg-zinc-50 border border-zinc-200 p-2.5 text-sm rounded-xl outline-none focus:border-zinc-400"
        >
          <option value="default">Default</option>
          <option value="editorial">Editorial (Minimal)</option>
          <option value="immersive">Immersive (Dark/Image heavy)</option>
        </select>
      </FormField>
    </div>
  );

  if (block.type === 'hero') {
    return (
      <div>
        <VariantSelector />
        <div className="space-y-4">
          <FormField label="Hero Title">
            <input type="text" value={block.config.heroTitle} onChange={e => onChange({ ...block, config: { ...block.config, heroTitle: e.target.value }})} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-zinc-400" />
          </FormField>
          <FormField label="Hero Subtitle">
            <input type="text" value={block.config.heroSubtitle} onChange={e => onChange({ ...block, config: { ...block.config, heroSubtitle: e.target.value }})} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-zinc-400" />
          </FormField>
          <FormField label="Background Image">
            <ImageUploader value={block.config.heroBackgroundImageUrl} onChange={url => onChange({ ...block, config: { ...block.config, heroBackgroundImageUrl: url }})} />
          </FormField>
        </div>
      </div>
    );
  }

  if (block.type === 'anniversary') {
    return (
      <div>
        <VariantSelector />
        <div className="space-y-4">
          <FormField label="Title">
            <input type="text" value={block.config.title} onChange={e => onChange({ ...block, config: { ...block.config, title: e.target.value }})} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-zinc-400" />
          </FormField>
          <FormField label="Subtitle">
            <input type="text" value={block.config.subtitle} onChange={e => onChange({ ...block, config: { ...block.config, subtitle: e.target.value }})} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-zinc-400" />
          </FormField>
          <FormField label="Background Image">
            <ImageUploader value={block.config.backgroundImageUrl} onChange={url => onChange({ ...block, config: { ...block.config, backgroundImageUrl: url }})} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Display Start Date">
              <input type="datetime-local" value={block.config.displayStart} onChange={e => onChange({ ...block, config: { ...block.config, displayStart: e.target.value }})} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-zinc-400" />
            </FormField>
            <FormField label="Display End Date">
              <input type="datetime-local" value={block.config.displayEnd} onChange={e => onChange({ ...block, config: { ...block.config, displayEnd: e.target.value }})} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-zinc-400" />
            </FormField>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === 'gallery') {
    return (
      <div>
        <VariantSelector />
        <FormField label="Gallery Images">
          <div className="space-y-4">
            {(block.config.images || []).map((url, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-zinc-50 p-2 rounded-xl border border-zinc-200">
                <img src={url} alt="featured" className="w-16 h-12 object-cover rounded-md" />
                <button 
                  onClick={() => {
                    const current = [...block.config.images];
                    current.splice(idx, 1);
                    onChange({ ...block, config: { ...block.config, images: current }});
                  }}
                  className="text-red-500 text-sm font-bold px-4 hover:bg-red-50 rounded-lg py-2 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="border border-dashed border-zinc-300 p-4 rounded-xl text-center">
              <ImageUploader 
                value="" 
                onChange={url => {
                  if(url) onChange({ ...block, config: { ...block.config, images: [...(block.config.images || []), url] }});
                }} 
              />
            </div>
          </div>
        </FormField>
      </div>
    );
  }

  if (block.type === 'featured_ministers') {
    return (
      <div>
        <VariantSelector />
        <FormField label="Select Ministers to Feature">
          <div className="flex flex-col gap-2 border border-zinc-200 rounded-xl p-4 max-h-64 overflow-y-auto bg-white shadow-inner">
            {ministers.map(m => (
              <label key={m.id} className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={(block.config.ministerIds || []).includes(m.id)}
                  onChange={(e) => {
                    const current = block.config.ministerIds || [];
                    if (e.target.checked) onChange({ ...block, config: { ministerIds: [...current, m.id] } });
                    else onChange({ ...block, config: { ministerIds: current.filter(id => id !== m.id) } });
                  }}
                  className="h-4 w-4 accent-[#C25627]"
                />
                <img src={m.photoUrl || 'https://via.placeholder.com/40'} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                <span className="font-bold text-sm text-zinc-800">{m.name}</span>
                <span className="text-xs text-zinc-400 ml-auto">{m.category}</span>
              </label>
            ))}
            {ministers.length === 0 && <p className="text-sm text-zinc-500 text-center py-4">No ministers found. Add them in the Ministers section.</p>}
          </div>
        </FormField>
      </div>
    );
  }

  if (block.type === 'rich_text') {
    return (
      <div>
        <VariantSelector />
        <FormField label="HTML Content">
          <textarea 
            value={block.config.contentHtml} 
            onChange={e => onChange({ ...block, config: { contentHtml: e.target.value }})} 
            className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-zinc-400 min-h-[200px] font-mono text-sm" 
            placeholder="<p>Enter valid HTML here...</p>"
          />
        </FormField>
      </div>
    );
  }

  return <p>Unknown block type.</p>;
}

// Generate empty state based on block type
function generateEmptyBlock(type: HomepageBlock['type']): HomepageBlock {
  const base = {
    id: `${type}-${Date.now()}`,
    label: `New ${type.replace('_', ' ')} block`,
    enabled: true,
    variant: 'default' as BlockVariant
  };
  
  switch(type) {
    case 'hero': return { ...base, type, config: { heroTitle: '', heroSubtitle: '', heroBackgroundImageUrl: '' } };
    case 'anniversary': return { ...base, type, config: { title: '', subtitle: '', backgroundImageUrl: '', displayStart: '', displayEnd: '' } };
    case 'gallery': return { ...base, type, config: { images: [] } };
    case 'featured_ministers': return { ...base, type, config: { ministerIds: [] } };
    case 'rich_text': return { ...base, type, config: { contentHtml: '' } };
  }
}
