"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventScopedDocs, setEventScopedDoc, ContactSettings, ContactPerson } from "@/lib/firebase/cms";
import { FormField } from "@/components/shared/FormField";
import { useAdminEvent } from "@/hooks/useAdminEvent";
import { Loader2, Save, Plus, Trash2, Phone } from "lucide-react";
import { Toast } from "@/components/admin/Toast";

export default function ContactSettingsAdminPage() {
  const { eventId: selectedEventId } = useAdminEvent();
  const queryClient = useQueryClient();

  const { data: settingsDocs = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin", "aboutSettings", selectedEventId, "contact"],
    queryFn: () => getEventScopedDocs<ContactSettings>(selectedEventId, "aboutSettings"),
    enabled: !!selectedEventId,
  });

  const defaultSettings: ContactSettings = {
    id: "contact",
    status: "published",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    address: "Shepherd Hill Baptist Church, Obanikoro Road, Lagos, Nigeria.",
    contacts: [
      { id: "1", name: "Mr Sunday Oguntola", role: "Alumni President", phone: "08034309265" },
      { id: "2", name: "Emmanuel Adeyemi", role: "Contact Person", phone: "09020537794" },
      { id: "3", name: "Idowu Oluwatimilehin", role: "Contact Person", phone: "07019819340" }
    ]
  };

  const [form, setForm] = useState<ContactSettings>(defaultSettings);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" | "warning" | "info" } | null>(null);
  const showToast = (message: string, variant: "success" | "error" | "warning" | "info" = "info") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    // Filter to find the contact settings doc specifically, since getEventScopedDocs returns all docs in aboutSettings
    const contactDoc = settingsDocs.find(doc => doc.id === "contact");
    if (contactDoc) {
      setForm({ ...defaultSettings, ...contactDoc });
    }
  }, [settingsDocs]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await setEventScopedDoc(selectedEventId, "aboutSettings", form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "aboutSettings", selectedEventId, "contact"] });
      showToast("Contact Settings saved successfully!", "success");
    }
  });

  const addContact = () => {
    setForm({
      ...form,
      contacts: [
        ...form.contacts,
        { id: Date.now().toString(), name: "", role: "", phone: "", email: "" }
      ]
    });
  };

  const updateContact = (id: string, updates: Partial<ContactPerson>) => {
    setForm({
      ...form,
      contacts: form.contacts.map(c => (c.id === id ? { ...c, ...updates } : c))
    });
  };

  const removeContact = (id: string) => {
    setForm({
      ...form,
      contacts: form.contacts.filter(c => c.id !== id)
    });
  };

  if (!selectedEventId) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-3xl flex flex-col items-center justify-center text-center max-w-md">
          <p className="font-sans font-bold text-lg mb-2">Failed to load contact settings</p>
          <p className="text-sm">{(error as Error)?.message || "Permission Denied or Unknown Error"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-4xl">
      {toast && <Toast message={toast.message} variant={toast.variant} isVisible={true} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground uppercase mb-1 flex items-center gap-3">
            <Phone className="h-8 w-8 text-[#C25627]" />
            Contact Page Settings
          </h1>
          <p className="font-sans text-sm text-foreground-muted">
            Configure the physical address and coordinating contacts shown on the Contact page.
          </p>
        </div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C25627] hover:bg-[#a1451f] text-white font-bold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Settings
        </button>
      </div>

      <div className="space-y-12">
        {/* SECTION 1: VENUE / ADDRESS */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold mb-6 text-foreground">1. Physical Venue</h2>
          <FormField label="Conference Venue Address">
            <textarea 
              value={form.address} 
              onChange={e => setForm({...form, address: e.target.value})} 
              className="w-full bg-white dark:bg-black/20 border border-border p-3 rounded-xl outline-none min-h-[80px]" 
              placeholder="Enter the full venue address..." 
            />
          </FormField>
        </section>

        {/* SECTION 2: CONTACT PERSONS */}
        <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">2. Contact Channels</h2>
            <button
              onClick={addContact}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-foreground rounded-lg text-sm font-bold transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Contact
            </button>
          </div>

          <div className="space-y-6">
            {form.contacts.length === 0 ? (
              <p className="text-zinc-500 text-sm">No contacts added yet. Click "Add Contact" to create one.</p>
            ) : (
              form.contacts.map((contact, index) => (
                <div key={contact.id} className="p-4 sm:p-6 border border-border rounded-xl bg-zinc-50/50 dark:bg-white/5 relative group">
                  <button
                    onClick={() => removeContact(contact.id)}
                    className="absolute top-4 right-4 text-red-500 opacity-50 hover:opacity-100 transition-opacity"
                    title="Remove Contact"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <h3 className="text-sm font-bold uppercase text-zinc-400 mb-4 tracking-widest">Contact #{index + 1}</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="Full Name">
                        <input type="text" value={contact.name} onChange={e => updateContact(contact.id, { name: e.target.value })} className="w-full bg-white dark:bg-black/20 border border-border p-3 rounded-xl outline-none" placeholder="e.g. Mr Sunday Oguntola" />
                      </FormField>
                      <FormField label="Role / Title">
                        <input type="text" value={contact.role} onChange={e => updateContact(contact.id, { role: e.target.value })} className="w-full bg-white dark:bg-black/20 border border-border p-3 rounded-xl outline-none" placeholder="e.g. Alumni President" />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="Phone Number">
                        <input type="text" value={contact.phone} onChange={e => updateContact(contact.id, { phone: e.target.value })} className="w-full bg-white dark:bg-black/20 border border-border p-3 rounded-xl outline-none" placeholder="e.g. 08034309265" />
                      </FormField>
                      <FormField label="Email Address (Optional)">
                        <input type="email" value={contact.email || ""} onChange={e => updateContact(contact.id, { email: e.target.value })} className="w-full bg-white dark:bg-black/20 border border-border p-3 rounded-xl outline-none" placeholder="e.g. contact@example.com" />
                      </FormField>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
