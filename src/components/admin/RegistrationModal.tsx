"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { ALL_ASSOCIATIONS_BY_CONFERENCE } from "@/lib/constants";
import { getChurchesByAssociation, getChurchesByCampus } from "@/lib/firebase/master-data";
import { createAndCheckInAttendee } from "@/lib/firebase/attendees";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";

const registrationSchema = z.object({
  fullName: z.string().min(2, "Full Name is required"),
  email: z.string().email("Invalid email").or(z.literal("")).optional(), // Make it optional by allowing empty string
  phoneNumber: z.string().min(10, "Phone number is required"),
  memberStatus: z.enum(["Member", "Executive"]),
  conferenceId: z.enum(["lagos_east", "lagos_west", "lagos_central", "campus_fellowship", "other"]),
  associationId: z.string().optional(),
  churchId: z.string().optional(),
  otherSchool: z.string().optional(),
  expectation: z.string().optional(),
  hasPaid: z.boolean(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export function RegistrationModal({ isOpen, onClose, eventId }: RegistrationModalProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      memberStatus: "Member",
      conferenceId: "lagos_east",
      associationId: "",
      churchId: "",
      otherSchool: "",
      expectation: "",
      hasPaid: true, // assume on-site people usually pay or have paid
    },
  });

  const conferenceId = watch("conferenceId");
  const associationId = watch("associationId");

  // Fetch associations based on conference
  const associations = conferenceId !== "other" && conferenceId !== "campus_fellowship" 
    ? ALL_ASSOCIATIONS_BY_CONFERENCE[conferenceId] || []
    : [];

  // Fetch churches based on association or campus
  const { data: churches = [] } = useQuery({
    queryKey: ["admin", "churches", conferenceId, associationId],
    queryFn: () => {
      if (conferenceId === "campus_fellowship" && associationId) {
        return getChurchesByCampus(associationId); 
      }
      if (associationId) {
        return getChurchesByAssociation(associationId);
      }
      return Promise.resolve([]);
    },
    enabled: !!associationId,
  });

  useEffect(() => {
    setValue("associationId", "");
    setValue("churchId", "");
  }, [conferenceId, setValue]);

  useEffect(() => {
    setValue("churchId", "");
  }, [associationId, setValue]);

  const onSubmit = async (data: RegistrationFormData) => {
    // Defensive reopening if closed
    if (!db.isOpen()) {
      try { await db.open(); } catch(e) { console.error(e); }
    }

    // Check for duplicates locally
    const possibleDuplicates = await db.attendees
      .where("eventId").equals(eventId)
      .and(a => {
        const samePhone = a.phoneMasked && data.phoneNumber && a.phoneMasked === data.phoneNumber;
        const sameName = a.fullName.toLowerCase().trim() === data.fullName.toLowerCase().trim();
        return samePhone || sameName;
      })
      .toArray();

    if (possibleDuplicates.length > 0 && !duplicateWarning) {
      setDuplicateWarning(possibleDuplicates);
      setPendingData(data);
      return;
    }

    await processRegistration(data);
  };

  const processRegistration = async (data: RegistrationFormData) => {
    if (!profile) return;
    setIsSubmitting(true);
    try {
      const code = await createAndCheckInAttendee(
        eventId as "refreshing-2026",
        {
          fullName: data.fullName,
          email: data.email || "", // Fallback to empty string if omitted
          phoneNumber: data.phoneNumber,
          memberStatus: data.memberStatus as "Member" | "Executive",
          conferenceId: data.conferenceId as any,
          conferenceName: 
            data.conferenceId === "lagos_east" ? "Lagos East Baptist Conference" :
            data.conferenceId === "lagos_west" ? "Lagos West Baptist Conference" :
            data.conferenceId === "lagos_central" ? "Lagos Central Baptist Conference" :
            data.conferenceId === "campus_fellowship" ? "Campus Fellowship" : "Other",
          associationId: data.associationId || undefined,
          associationName: data.associationId ? (
            conferenceId === "campus_fellowship" ? data.associationId : ALL_ASSOCIATIONS_BY_CONFERENCE[data.conferenceId as keyof typeof ALL_ASSOCIATIONS_BY_CONFERENCE]?.find(a => a.toLowerCase().replace(/[^a-z0-9]+/g, '-') === data.associationId?.replace(/.*?_/, '')) || data.associationId 
          ) : undefined, // simplified for on the spot, we could look up the name properly
          churchId: data.churchId || undefined,
          churchName: churches.find(c => c.id === data.churchId)?.canonicalName || undefined,
          campusFellowshipId: conferenceId === "campus_fellowship" ? data.associationId : undefined,
          campusFellowshipName: conferenceId === "campus_fellowship" ? data.associationId : undefined,
          otherSchool: data.otherSchool || undefined,
          expectation: data.expectation || undefined,
        },
        profile.uid,
        data.hasPaid
      );

      setSuccessCode(code);
      
      // Invalidate queries so the directory updates instantly
      queryClient.invalidateQueries({ queryKey: ["admin", "attendees", eventId] });
      // Trigger offline sync update if needed by invalidating the offline view
      queryClient.invalidateQueries({ queryKey: ["admin", "offline-attendees", eventId] });

    } catch (error) {
      console.error("Failed to register attendee on spot", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setSuccessCode(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-2xl rounded-3xl shadow-xl flex flex-col max-h-[90vh] animate-fade-in relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-zinc-50 dark:bg-white/5">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">On-the-Spot Registration</h2>
            <p className="text-sm text-foreground-muted">Register and check-in an attendee instantly.</p>
          </div>
          <button onClick={handleClose} disabled={isSubmitting} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {successCode ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
              <div className="bg-emerald-500/20 p-6 rounded-full mb-6">
                <CheckCircle className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-foreground mb-2">Registration Complete!</h3>
              <p className="text-foreground-muted mb-6 max-w-sm">
                The attendee has been registered and is <span className="font-bold text-emerald-600">checked in</span>.
              </p>
              <div className="bg-zinc-100 dark:bg-black/40 border border-border px-6 py-4 rounded-2xl flex flex-col items-center gap-1">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Registration Code</span>
                <span className="font-mono text-2xl font-bold text-[#C25627]">{successCode}</span>
              </div>
              <button onClick={handleClose} className="mt-8 px-8 py-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-bold rounded-xl transition-colors">
                Close & Return
              </button>
            </div>
          ) : duplicateWarning ? (
            <div className="flex flex-col animate-fade-in">
              <div className="bg-amber-500/20 border border-amber-500/30 p-6 rounded-2xl mb-6 text-amber-700 dark:text-amber-400">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6" />
                  <h3 className="font-bold text-lg">Potential Duplicate Found</h3>
                </div>
                <p className="mb-4 text-sm text-foreground">
                  We found existing records that look similar to the one you are creating. Are you sure you want to create a new registration?
                </p>
                <div className="space-y-2">
                  {duplicateWarning.map(dup => (
                    <div key={dup.id} className="bg-white/50 dark:bg-black/20 p-3 rounded-lg text-sm flex justify-between items-center">
                      <div>
                        <div className="font-bold">{dup.fullName}</div>
                        <div className="text-xs opacity-80">{dup.phoneMasked || dup.email || "No contact info"}</div>
                      </div>
                      <div className="font-mono text-xs font-bold text-[#C25627]">{dup.id}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setDuplicateWarning(null); setPendingData(null); }}
                  className="flex-1 px-6 py-3 bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-foreground font-bold rounded-xl transition-colors"
                >
                  Cancel & Edit
                </button>
                <button 
                  onClick={() => pendingData && processRegistration(pendingData)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-[#C25627] text-white hover:bg-[#a1451f] font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Anyway"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Full Name *</label>
                  <Controller
                    name="fullName"
                    control={control}
                    render={({ field }) => (
                      <input {...field} type="text" className={`w-full bg-transparent border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${errors.fullName ? "border-red-500 focus:border-red-500" : "border-border focus:border-[#C25627]"}`} placeholder="e.g. Jane Doe" />
                    )}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1 font-bold">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Phone Number *</label>
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                      <input {...field} type="tel" className={`w-full bg-transparent border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${errors.phoneNumber ? "border-red-500 focus:border-red-500" : "border-border focus:border-[#C25627]"}`} placeholder="e.g. 08012345678" />
                    )}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 font-bold">{errors.phoneNumber.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Email (Optional)</label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <input {...field} type="email" className={`w-full bg-transparent border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${errors.email ? "border-red-500 focus:border-red-500" : "border-border focus:border-[#C25627]"}`} placeholder="e.g. jane@example.com" />
                    )}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Member Status</label>
                  <Controller
                    name="memberStatus"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: "Member", label: "Member" },
                          { value: "Executive", label: "Executive" }
                        ]}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="border-t border-border pt-6 mt-2">
                <h3 className="font-bold text-sm mb-4">Church Information</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Conference *</label>
                    <Controller
                      name="conferenceId"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { value: "lagos_east", label: "Lagos East" },
                            { value: "lagos_west", label: "Lagos West" },
                            { value: "lagos_central", label: "Lagos Central" },
                            { value: "campus_fellowship", label: "Campus Fellowship" },
                            { value: "other", label: "Other" }
                          ]}
                        />
                      )}
                    />
                  </div>

                  {conferenceId !== "other" && conferenceId !== "campus_fellowship" && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Association *</label>
                      <Controller
                        name="associationId"
                        control={control}
                        render={({ field }) => (
                          <CustomSelect
                            value={field.value || ""}
                            onChange={field.onChange}
                            options={associations.map(name => {
                              const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                              return { value: `${conferenceId}_${slug}`, label: name };
                            })}
                            placeholder="Select Association"
                          />
                        )}
                      />
                    </div>
                  )}

                  {conferenceId === "campus_fellowship" && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Campus Fellowship / School *</label>
                      <Controller
                        name="associationId"
                        control={control}
                        render={({ field }) => (
                          <input {...field} type="text" className="w-full bg-transparent border border-border focus:border-[#C25627] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors" placeholder="e.g. UNILAG BSF" />
                        )}
                      />
                    </div>
                  )}

                  {associationId && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Church</label>
                      <Controller
                        name="churchId"
                        control={control}
                        render={({ field }) => (
                          <CustomSelect
                            value={field.value || ""}
                            onChange={field.onChange}
                            options={churches.map(c => ({ value: c.id, label: c.canonicalName }))}
                            placeholder="Select Church (Optional)"
                          />
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-6 mt-2">
                 <div className="flex items-center gap-3">
                   <Controller
                     name="hasPaid"
                     control={control}
                     render={({ field }) => (
                       <input 
                         type="checkbox" 
                         id="hasPaid"
                         checked={field.value} 
                         onChange={field.onChange} 
                         className="h-5 w-5 rounded border-gray-300 text-[#C25627] focus:ring-[#C25627]"
                       />
                     )}
                   />
                   <label htmlFor="hasPaid" className="text-sm font-bold cursor-pointer select-none">
                     Attendee has completed payment
                   </label>
                 </div>
              </div>

            </form>
          )}
        </div>

        {/* Footer */}
        {!successCode && (
          <div className="p-4 border-t border-border bg-zinc-50 dark:bg-white/5 flex justify-end gap-3">
            <button type="button" onClick={handleClose} disabled={isSubmitting} className="px-5 py-2.5 font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button 
              onClick={handleSubmit(onSubmit)} 
              disabled={isSubmitting} 
              className="px-6 py-2.5 bg-[#C25627] hover:bg-[#a1451f] text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Register & Check-in
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
