"use client";

import React, { useState } from "react";
import { Plus, Search, Shield, UserX, Loader2, Sparkles, X, Key, ShieldAlert, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, provisionAdminAccount, updateUserAccess } from "@/lib/firebase/users";
import { getEvents } from "@/lib/firebase/events";
import { CustomSelect } from "@/components/shared/CustomSelect";

import { RoleBuilder } from "@/components/admin/RoleBuilder";
import { Toast } from "@/components/admin/Toast";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const { data: usersList = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: getUsers,
  });

  const { data: eventsList = [] } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: getEvents,
  });

  const { data: rolesList = [] } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      // Import dynamically or just rely on the same queryKey
      // RoleBuilder handles fetching too, but we need it here for the filter options and custom role dropdowns
      // Actually we can just fetch it here too since react-query will dedup
      const { collection, getDocs } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase/app");
      const snap = await getDocs(collection(db, "settings", "global", "roles"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" | "warning" | "info" } | null>(null);
  const showToast = (message: string, variant: "success" | "error" | "warning" | "info" = "info") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 5000);
  };

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer" as any,
    allowedEvents: [] as string[],
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    role: "viewer" as any,
    allowedEvents: [] as string[],
  });

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const triggerSuccessBanner = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const provisionMutation = useMutation({
    mutationFn: async (data: typeof newUser) => {
      const result = await provisionAdminAccount({
        displayName: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        allowedEvents: data.allowedEvents,
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setIsProvisionModalOpen(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "viewer",
        allowedEvents: [],
      });
      triggerSuccessBanner();
    },
    onError: (error: any) => {
      showToast(`Error provisioning account: ${error.message}`, "error");
    }
  });

  const toggleAccessMutation = useMutation({
    mutationFn: (data: { uid: string, isActive: boolean }) => updateUserAccess(data.uid, { isActive: data.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      triggerSuccessBanner();
    },
  });

  const editMutation = useMutation({
    mutationFn: (data: typeof editingUser) => updateUserAccess(data.id, { 
      name: data.name, 
      email: data.email,
      password: data.password || undefined,
      role: data.role, 
      allowedEvents: data.allowedEvents 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setIsEditModalOpen(false);
      triggerSuccessBanner();
    },
    onError: (error: any) => {
      showToast(`Error updating account: ${error.message}`, "error");
    }
  });

  const handleProvision = (e: React.FormEvent) => {
    e.preventDefault();
    provisionMutation.mutate(newUser);
  };

  const handleToggleEvent = (eventId: string) => {
    setNewUser(prev => {
      const newEvents = prev.allowedEvents.includes(eventId)
        ? prev.allowedEvents.filter(e => e !== eventId)
        : [...prev.allowedEvents, eventId];
      return { ...prev, allowedEvents: newEvents };
    });
  };

  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");

  const dynamicRoleOptions = [
    { value: "all", label: "All Roles" },
    ...rolesList.map((r: any) => ({ value: r.id, label: r.name || r.id })),
    { value: "superAdmin", label: "Super Administrator" },
    { value: "eventAdmin", label: "Event Administrator" },
    { value: "editor", label: "Editor" },
    { value: "registrationStaff", label: "Registration Staff" },
    { value: "checkinStaff", label: "Check-in Staff" },
    { value: "viewer", label: "Viewer" },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} variant={toast.variant} isVisible={true} onClose={() => setToast(null)} />}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2 uppercase">
            Users & Roles
          </h1>
          <p className="font-sans text-sm text-foreground-muted">
            Provision admin accounts, assign roles, and manage system access.
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg font-sans text-xs font-bold uppercase transition-all ${
              activeTab === "users" ? "bg-surface text-foreground shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 rounded-lg font-sans text-xs font-bold uppercase transition-all ${
              activeTab === "roles" ? "bg-surface text-foreground shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Role Builder
          </button>
        </div>

        {activeTab === "users" && (
          <button
            onClick={() => setIsProvisionModalOpen(true)}
            className="px-6 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Provision Account</span>
          </button>
        )}
      </div>

      {savedSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] animate-fade-in flex items-center gap-3">
          <Sparkles className="h-6 w-6" />
          <span className="font-sans text-base font-bold">Operation completed successfully!</span>
        </div>
      )}

      {/* Users Tab Content */}
      {activeTab === "users" && (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface p-2 border border-border rounded-2xl shadow-sm">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-sm font-sans py-3 pl-10 pr-4 outline-none text-foreground placeholder:text-zinc-500"
              />
            </div>
            <div className="w-full sm:w-64 border-l border-black/5 dark:border-white/5 pl-4">
              <CustomSelect
                value={filterRole}
                onChange={(val) => setFilterRole(val)}
                options={dynamicRoleOptions}
              />
            </div>
          </div>

      {/* Table / List */}
      <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 font-sans text-xs font-bold text-black/50 dark:text-white/50 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-4 font-sans text-xs font-bold text-black/50 dark:text-white/50 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 font-sans text-xs font-bold text-black/50 dark:text-white/50 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 font-sans text-xs font-bold text-black/50 dark:text-white/50 uppercase tracking-wider text-right">
                  Access
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <span className="font-sans text-sm">Loading users...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    <Shield className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <span className="font-sans text-sm">No users found.</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleObj = rolesList.find((r: any) => r.id === user.role);
                  const displayRole = roleObj ? (roleObj as any).name : ({
                    superAdmin: "Super Administrator",
                    eventAdmin: "Event Administrator",
                    editor: "Editor",
                    registrationStaff: "Registration Staff",
                    checkinStaff: "Check-in Staff",
                    viewer: "Viewer",
                  }[user.role as string] || user.role);
                  return (
                  <tr key={user.id} className={`hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group ${!user.isActive ? "opacity-60" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-sans text-sm font-bold text-foreground">
                          {user.name}
                        </span>
                        <span className="font-sans text-xs text-foreground-muted">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-sans text-xs font-bold uppercase text-[#DDB94E]">
                          {displayRole}
                        </span>
                        {user.allowedEvents?.length > 0 && user.role !== "superAdmin" && (
                          <span className="font-sans text-[10px] text-zinc-500">
                            {user.allowedEvents.join(", ")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                        user.isActive 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {user.isActive ? "Active" : "Revoked"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingUser({
                              id: user.id,
                              name: user.name,
                              email: user.email,
                              password: "",
                              role: user.role,
                              allowedEvents: user.allowedEvents || [],
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                          title="Edit User"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleAccessMutation.mutate({ uid: user.id, isActive: !user.isActive })}
                          disabled={toggleAccessMutation.isPending}
                          className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                            user.isActive 
                              ? "hover:bg-red-500/10 text-zinc-500 hover:text-red-500"
                              : "hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-500"
                          }`}
                          title={user.isActive ? "Revoke Access" : "Restore Access"}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Role Builder Tab Content */}
      {activeTab === "roles" && <RoleBuilder usersList={usersList} />}

      {/* ── Provision Modal ── */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={handleProvision}
            className="w-full max-w-2xl bg-surface text-foreground border border-border-strong rounded-3xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-serif text-2xl font-bold uppercase">
                PROVISION ACCOUNT
              </h3>
              <button
                type="button"
                onClick={() => setIsProvisionModalOpen(false)}
                className="p-2 text-zinc-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Full Name <span className="text-[#C25627]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-surface-muted border border-border text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Email Address <span className="text-[#C25627]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-surface-muted border border-border text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1">
                  Role <span className="text-[#C25627]">*</span>
                </label>
                <CustomSelect
                  value={newUser.role}
                  onChange={(val) => setNewUser({ ...newUser, role: val as any, allowedEvents: [] })}
                  options={dynamicRoleOptions.filter(o => o.value !== "all")}
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1 flex items-center gap-2">
                  <Key className="h-3 w-3" /> Temporary Password <span className="text-[#C25627]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-surface-muted border border-border text-xs font-sans py-3 px-4 rounded-xl outline-none font-mono"
                  placeholder="e.g. TempPass123!"
                />
              </div>
            </div>

            {/* Event Scope Selection (Not needed for superAdmin) */}
            {newUser.role !== "superAdmin" && (
              <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-border">
                <label className="block text-xs font-sans font-bold uppercase mb-3">
                  Scope (Allowed Event Editions)
                </label>
                <div className="flex flex-wrap gap-2">
                  {eventsList.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => handleToggleEvent(event.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                        newUser.allowedEvents.includes(event.id)
                          ? "bg-[#C25627] text-white border-[#C25627]"
                          : "bg-surface text-zinc-500 border-black/20 dark:border-white/20 hover:border-[#C25627]"
                      }`}
                    >
                      {event.name}
                    </button>
                  ))}
                </div>
                {newUser.allowedEvents.length === 0 && (
                  <p className="text-[10px] text-red-500 mt-2 font-bold uppercase">
                    Warning: You must select at least one event scope.
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-2">
              <button
                type="button"
                onClick={() => setIsProvisionModalOpen(false)}
                className="px-6 py-3 bg-zinc-100 dark:bg-white/5 font-sans font-bold text-xs uppercase rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={provisionMutation.isPending || (newUser.role !== 'superAdmin' && newUser.allowedEvents.length === 0)}
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {provisionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                <span>Provision User</span>
              </button>
            </div>
          </form>
        </div>
      )}
      {/* ── Edit Modal ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              editMutation.mutate(editingUser);
            }}
            className="bg-background border border-border rounded-3xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-6 animate-slide-up"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground uppercase">Edit User</h2>
                <p className="font-sans text-xs text-black/50 dark:text-white/50 mt-1">Update roles and event scopes</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-black dark:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-sans font-bold uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-surface-muted border border-border text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1 flex items-center gap-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-surface-muted border border-border text-xs font-sans py-3 px-4 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-bold uppercase mb-1 flex items-center gap-2">
                  <Key className="h-3 w-3" /> New Password (Optional)
                </label>
                <input
                  type="text"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full bg-surface-muted border border-border text-xs font-sans py-3 px-4 rounded-xl outline-none font-mono"
                  placeholder="Leave blank to keep current"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-sans font-bold uppercase mb-1">Role / Access Level</label>
                <CustomSelect
                  value={editingUser.role}
                  onChange={(val) => setEditingUser({ ...editingUser, role: val as any, allowedEvents: [] })}
                  options={dynamicRoleOptions.filter(o => o.value !== "all")}
                />
              </div>
            </div>

            {/* Event Scope Selection */}
            {editingUser.role !== "superAdmin" && (
              <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-border">
                <label className="block text-xs font-sans font-bold uppercase mb-3">
                  Scope (Allowed Event Editions)
                </label>
                <div className="flex flex-wrap gap-2">
                  {eventsList.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => {
                        setEditingUser(prev => {
                          const newEvents = prev.allowedEvents.includes(event.id)
                            ? prev.allowedEvents.filter(e => e !== event.id)
                            : [...prev.allowedEvents, event.id];
                          return { ...prev, allowedEvents: newEvents };
                        });
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                        editingUser.allowedEvents.includes(event.id)
                          ? "bg-[#C25627] text-white border-[#C25627]"
                          : "bg-surface text-zinc-500 border-black/20 dark:border-white/20 hover:border-[#C25627]"
                      }`}
                    >
                      {event.name}
                    </button>
                  ))}
                </div>
                {editingUser.allowedEvents.length === 0 && (
                  <p className="text-[10px] text-red-500 mt-2 font-bold uppercase">
                    Warning: You must select at least one event scope.
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-3 bg-zinc-100 dark:bg-white/5 font-sans font-bold text-xs uppercase rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editMutation.isPending || (editingUser.role !== 'superAdmin' && editingUser.allowedEvents.length === 0)}
                className="px-8 py-3 bg-[#C25627] hover:bg-[#E05320] text-white font-sans font-bold text-xs uppercase rounded-full flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {editMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
