"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/app";
import { Permissions, Permission } from "@/lib/permissions";
import { Loader2, Shield, Sparkles, Plus, Save, Trash2, ShieldAlert } from "lucide-react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase/app";
import { ConfirmModal } from "./ConfirmModal";
import { Toast } from "./Toast";

// Flatten Permissions object for the UI
const availablePermissions = Object.entries(Permissions).flatMap(([module, actions]) => 
  Object.entries(actions).map(([actionName, permValue]) => ({
    id: permValue as string,
    label: `${module} - ${actionName}`
  }))
);

export function RoleBuilder({ usersList = [] }: { usersList?: any[] }) {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" | "warning" | "info" } | null>(null);
  
  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    variant: "danger" | "warning" | "default";
    onConfirm: () => void;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    permissions: [] as string[]
  });

  const { data: roles = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "settings", "global", "roles"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  });

  const showToast = (message: string, variant: "success" | "error" | "warning" | "info" = "info") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 4000);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const ref = doc(db, "settings", "global", "roles", data.id);
      await setDoc(ref, {
        id: data.id,
        name: data.name,
        description: data.description,
        permissions: data.permissions,
        isSystemRole: selectedRole?.isSystemRole || false,
      }, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      showToast("Role saved successfully!", "success");
      setIsCreating(false);
      setSelectedRole(null);
    },
    onError: (err: any) => {
      showToast(`Error saving role: ${err.message}`, "error");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const ref = doc(db, "settings", "global", "roles", roleId);
      await deleteDoc(ref);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
      showToast("Role deleted successfully.", "success");
      setSelectedRole(null);
      setFormData({ id: "", name: "", description: "", permissions: [] });
    },
    onError: (err: any) => {
      showToast(`Error deleting role: ${err.message}`, "error");
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
    if (!formData.id || !formData.name) return;

    if (isCreating) {
      const isDuplicate = roles.some(
        (r: any) => r.id.toLowerCase() === formData.id.toLowerCase() || r.name.toLowerCase() === formData.name.toLowerCase()
      );
      if (isDuplicate) {
        showToast("A role with this ID or Display Name already exists.", "error");
        return;
      }
    }

    if (selectedRole?.isSystemRole && selectedRole?.id !== 'superAdmin') {
      setConfirmModal({
        title: "Modify System Role",
        message: `'${formData.name}' is a core system role.\n\nChanging its permissions could break intended application behavior for users relying on it.\n\nAre you absolutely sure?`,
        confirmLabel: "Modify Role",
        variant: "warning",
        onConfirm: () => {
          setConfirmModal(null);
          saveMutation.mutate(formData);
        }
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (!selectedRole) return;
    
    if (selectedRole.isSystemRole) {
      showToast("System roles cannot be deleted.", "warning");
      return;
    }

    const assignedUsers = usersList?.filter(u => u.role === selectedRole.id).length || 0;

    setConfirmModal({
      title: "Delete Role",
      message: assignedUsers > 0
        ? `This role has ${assignedUsers} user(s) currently assigned to it.\n\nDeleting it will leave those users without a valid role. Are you sure you want to permanently delete '${selectedRole.name}'?`
        : `Are you sure you want to permanently delete the role '${selectedRole.name}'?\n\nThis action cannot be undone.`,
      confirmLabel: "Delete Role",
      variant: "danger",
      onConfirm: () => {
        setConfirmModal(null);
        deleteMutation.mutate(selectedRole.id);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin mb-4" />
        <span className="text-sm font-sans">Loading roles...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-red-500">
        <ShieldAlert className="h-8 w-8 mb-4 opacity-80" />
        <span className="text-sm font-sans font-bold mb-2">Error Loading Roles</span>
        <span className="text-xs font-mono text-red-500/80">{(error as Error)?.message || "Permission Denied"}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          isOpen={true}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          variant={confirmModal.variant}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* Roles List */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-foreground uppercase">Roles</h3>
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
              <div className="flex items-center justify-between">
                <h4 className="font-sans font-bold text-sm text-foreground">{r.name || r.id}</h4>
                {r.isSystemRole && (
                  <span className="text-[9px] font-mono font-bold text-[#DDB94E] bg-[#DDB94E]/10 border border-[#DDB94E]/20 px-2 py-0.5 rounded-full uppercase">
                    System
                  </span>
                )}
              </div>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{r.permissions?.length || 0} Permissions</p>
            </button>
          ))}
          {roles.length === 0 && !isCreating && (
            <div className="p-8 text-center border border-dashed border-black/20 dark:border-white/20 rounded-2xl">
              <ShieldAlert className="h-8 w-8 mx-auto text-zinc-400 mb-2 opacity-50" />
              <p className="font-sans text-xs text-zinc-500">No roles found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="w-full md:w-2/3">
        {(selectedRole || isCreating) ? (
          <form onSubmit={handleSave} className="bg-surface border border-border rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">

            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold uppercase text-foreground">
                  {isCreating ? "Create New Role" : "Edit Role"}
                </h2>
                <p className="font-sans text-xs text-zinc-500 mt-1">
                  Configure access levels for this role.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Delete button — only for non-system, non-creating roles */}
                {!isCreating && selectedRole && !selectedRole.isSystemRole && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 border border-red-500/30 text-red-500 rounded-xl font-bold font-sans text-xs hover:bg-red-500/10 active-press flex items-center gap-2 disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete
                  </button>
                )}
                {isCreating && (
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 border border-border rounded-xl font-bold font-sans text-xs hover:bg-black/5 dark:hover:bg-white/5 active-press"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saveMutation.isPending || formData.id === 'superAdmin'}
                  className="px-6 py-2 bg-[#C25627] text-white rounded-xl font-bold font-sans text-xs disabled:opacity-50 active-press flex items-center gap-2"
                >
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isCreating ? "Create Role" : "Save Changes"}
                </button>
              </div>
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
                  disabled={formData.id === 'superAdmin'}
                  className="w-full bg-surface-muted border border-border text-xs font-sans py-3 px-4 rounded-xl outline-none disabled:opacity-50"
                  placeholder="e.g. Guest Speaker"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-sans font-bold uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  disabled={formData.id === 'superAdmin'}
                  className="w-full bg-surface-muted border border-border text-xs font-sans py-3 px-4 rounded-xl outline-none disabled:opacity-50"
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
                      disabled={formData.id === 'superAdmin'}
                      className="mt-0.5 disabled:opacity-50"
                    />
                    <div className="flex flex-col">
                      <span className="font-sans text-xs font-bold text-foreground leading-tight">{perm.label}</span>
                      <span className="font-mono text-[9px] text-zinc-500">{perm.id}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Assigned Users Section */}
            {formData.id && (
              <div className="space-y-4 pt-6 border-t border-border mt-6">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <label className="block text-xs font-sans font-bold uppercase flex items-center gap-2">
                    Assigned Users
                    <span className="px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-full font-mono text-[10px] text-zinc-500">
                      View Only
                    </span>
                  </label>
                  <span className="text-xs font-mono font-bold text-[#C25627]">
                    {usersList?.filter(u => u.role === formData.id).length || 0} users
                  </span>
                </div>
                <div className="bg-surface-muted rounded-xl border border-border p-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {usersList?.filter(u => u.role === formData.id).length ? (
                    <ul className="space-y-1">
                      {usersList.filter(u => u.role === formData.id).map(u => (
                        <li key={u.id} className="text-xs font-sans flex flex-col sm:flex-row sm:items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg border border-transparent hover:border-black/5">
                          <div>
                            <p className="font-bold">{u.name}</p>
                            <p className="text-zinc-500">{u.email}</p>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 mt-1 sm:mt-0 bg-emerald-500/10 px-2 py-1 rounded-md">
                            Active
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-zinc-500 font-sans italic text-center py-6">No users currently assigned to this role.</p>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 font-sans mt-2">
                  To reassign users, go to the <strong>Users</strong> tab and edit their account profile.
                </p>
              </div>
            )}
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
