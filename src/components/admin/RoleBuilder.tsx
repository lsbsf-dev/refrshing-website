"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/app";
import { Permissions, Permission } from "@/lib/permissions";
import { Loader2, Shield, Sparkles, Plus, Save, Trash2, ShieldAlert } from "lucide-react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase/app";

// Flatten Permissions object for the UI
const availablePermissions = Object.entries(Permissions).flatMap(([module, actions]) => 
  Object.entries(actions).map(([actionName, permValue]) => ({
    id: permValue as string,
    label: `${module} - ${actionName}`
  }))
);

export function RoleBuilder() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    permissions: [] as string[]
  });

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "settings", "global", "roles"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  });

  const triggerSuccessBanner = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const functions = getFunctions(app);
      const updateRole = httpsCallable<any, any>(functions, "updateRole");
      await updateRole({
        roleId: data.id,
        name: data.name,
        description: data.description,
        permissions: data.permissions
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      triggerSuccessBanner();
      setIsCreating(false);
      setSelectedRole(null);
    },
    onError: (err: any) => {
      alert(`Error saving role: ${err.message}`);
    }
  });

  const handleSelectRole = (role: any) => {
    setSelectedRole(role);
    setIsCreating(false);
    setFormData({
      id: role.id,
      name: role.name || role.id,
      description: role.description || "",
      permissions: role.permissions || []
    });
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedRole(null);
    setFormData({
      id: "",
      name: "",
      description: "",
      permissions: []
    });
  };

  const handleTogglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.trim()) {
      alert("Role ID is required.");
      return;
    }
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin mb-4" />
        <span className="text-sm font-sans">Loading roles...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Roles List */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-foreground uppercase">Custom Roles</h3>
          <button 
            onClick={handleCreateNew}
            className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors text-zinc-600 dark:text-zinc-300"
            title="Create New Role"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex flex-col gap-2">
          {roles.map((r: any) => (
            <button
              key={r.id}
              onClick={() => handleSelectRole(r)}
              className={`text-left p-4 rounded-2xl border transition-all ${
                selectedRole?.id === r.id && !isCreating
                  ? "bg-[#FAF6EE] dark:bg-white/5 border-[#C25627] shadow-sm"
                  : "bg-surface border-border hover:border-black/30 dark:hover:border-white/30"
              }`}
            >
              <h4 className="font-sans font-bold text-sm text-foreground">{r.name || r.id}</h4>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{r.permissions?.length || 0} Permissions</p>
            </button>
          ))}
          {roles.length === 0 && !isCreating && (
            <div className="p-8 text-center border border-dashed border-black/20 dark:border-white/20 rounded-2xl">
              <ShieldAlert className="h-8 w-8 mx-auto text-zinc-400 mb-2 opacity-50" />
              <p className="font-sans text-xs text-zinc-500">No custom roles found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="w-full md:w-2/3">
        {(selectedRole || isCreating) ? (
          <form onSubmit={handleSave} className="bg-surface border border-border rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
            
            {savedSuccess && (
              <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
                <Sparkles className="h-5 w-5" />
                <span className="font-sans text-sm font-bold">Role updated successfully!</span>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold uppercase text-foreground">
                  {isCreating ? "Create New Role" : "Edit Role"}
                </h2>
                <p className="font-sans text-xs text-zinc-500 mt-1">
                  Configure access levels for this role.
                </p>
              </div>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-6 py-2.5 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-colors"
              >
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Role</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">Role ID (Internal) <span className="text-[#C25627]">*</span></label>
                <input
                  type="text"
                  required
                  disabled={!isCreating}
                  value={formData.id}
                  onChange={e => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="w-full bg-surface-muted border border-border text-xs font-sans py-3 px-4 rounded-xl outline-none disabled:opacity-60"
                  placeholder="e.g. guest-speaker"
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">Display Name <span className="text-[#C25627]">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-muted border border-border text-xs font-sans py-3 px-4 rounded-xl outline-none"
                  placeholder="e.g. Guest Speaker"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-sans font-bold uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-surface-muted border border-border text-xs font-sans py-3 px-4 rounded-xl outline-none"
                  placeholder="What is this role for?"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <label className="block text-xs font-sans font-bold uppercase">Permissions</label>
                <span className="text-xs font-mono font-bold text-[#C25627]">{formData.permissions.length} selected</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {availablePermissions.map(perm => (
                  <label key={perm.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    formData.permissions.includes(perm.id)
                      ? "bg-[#C25627]/5 border-[#C25627]/30"
                      : "bg-surface-muted border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20"
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm.id)}
                      onChange={() => handleTogglePermission(perm.id)}
                      className="mt-0.5"
                    />
                    <div className="flex flex-col">
                      <span className="font-sans text-xs font-bold text-foreground leading-tight">{perm.label}</span>
                      <span className="font-mono text-[9px] text-zinc-500">{perm.id}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </form>
        ) : (
          <div className="h-full bg-black/5 dark:bg-white/5 border border-border border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
            <Shield className="h-12 w-12 text-zinc-400 opacity-50 mb-4" />
            <p className="font-sans text-sm text-zinc-500 font-medium">Select a role to edit or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
