/**
/**
 * Contact Page Component
 *  * Public contact form and general information.
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { submitEnquiry } from "@/lib/firebase/enquiries";
import { useQuery } from "@tanstack/react-query";
import { getEventScopedDocs, ContactSettings } from "@/lib/firebase/cms";
import { CustomSelect } from "@/components/shared/CustomSelect";

export default function ContactPage() {
  const params = useParams();
  const ACTIVE_EVENT_ID = params?.eventId as string;
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [type, setType] = useState<"Enquiry" | "Testimony" | "Prayer Request">("Enquiry");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { data: settingsDocs = [] } = useQuery({
    queryKey: ["public", "contactSettings", ACTIVE_EVENT_ID],
    queryFn: () => getEventScopedDocs<ContactSettings>(ACTIVE_EVENT_ID, "aboutSettings"),
    enabled: !!ACTIVE_EVENT_ID,
  });

  const contactSettings = settingsDocs.find(doc => doc.id === "contact") || {
    address: "Baptist Academy Hall, Obanikoro, Ikorodu Road, Lagos, Nigeria.",
    contacts: [
      { id: "1", name: "Mr Sunday Oguntola", role: "Alumni President", phone: "08034309265" },
      { id: "2", name: "Emmanuel Adeyemi", role: "Contact Person", phone: "09020537794" },
      { id: "3", name: "Idowu Oluwatimilehin", role: "Contact Person", phone: "07019819340" }
    ]
  };

  const currentContacts = contactSettings.contacts;
  const currentAddress = contactSettings.address;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit
    const lastSubmitStr = localStorage.getItem("last_enquiry_time");
    if (lastSubmitStr) {
      const lastSubmit = new Date(lastSubmitStr).getTime();
      if (Date.now() - lastSubmit < 1000 * 60 * 60) {
         setSubmitError("You can only submit one message per hour. Please try again later.");
         return;
      }
    }

    if (message.length < 10) {
      setSubmitError("Message must be at least 10 characters long.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      await submitEnquiry({ type, name, email, message }, ACTIVE_EVENT_ID);
      localStorage.setItem("last_enquiry_time", new Date().toISOString());
      setFormSubmitted(true);
    } catch (err: any) {
      console.error(err);
      let errorMsg = err.message || "Failed to submit. Please try again.";
      if (err instanceof Error && err.name === "ZodError") {
        errorMsg = "Please check your inputs and try again.";
      }
      setSubmitError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      
      {/* ═══════════════════════════════════════
          SCENE 1: CONTACT HERO (Centered & Balanced Height with staggered load animations)
          ═══════════════════════════════════════ */}
      <section className="relative w-full h-[45dvh] min-h-[460px] hero-landscape flex flex-col justify-end bg-[#0B0907] text-white overflow-hidden pt-52 lg:pt-64 pb-16 px-4 sm:px-6 md:px-16 border-b border-white/5">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Image
            src="/pictures/Image 3.jpg"
            alt="Sanctuary details background"
            fill
            className="object-cover object-center filter grayscale"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0907] via-[#0B0907]/30 to-[#0B0907]/80 pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[300px] bg-[#6B1D2A]/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col items-start gap-4">
          <span className="font-sans text-sm font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase animate-hero-item delay-100">
            REFRESHING ENQUIRY CHANNELS
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-[85px] font-bold tracking-tight uppercase select-none leading-[0.95] animate-hero-item delay-200">
            CONTACT <br />
            <span className="text-gradient-gold font-normal font-serif">PORTAL</span>
          </h1>
          <p className="font-serif text-base sm:text-lg md:text-xl italic text-white/80 font-light max-w-2xl border-l border-primary/50 pl-6 mt-2 animate-hero-item delay-300">
            Connect with BSF coordinators across Lagos East, West, and Central student chapters.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 2: COORDINATING CHANNELS (Grid details - sharp corners, tactile response)
          ═══════════════════════════════════════ */}
      <section className="relative w-full py-28 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#1E1B16] texture-paper overflow-hidden">
        
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left: Contact Channels */}
          <div className="lg:col-span-6 flex flex-col items-start gap-8 text-left w-full">
            <div>
              <span className="font-sans text-sm font-bold tracking-[0.25em] text-[#E05320] uppercase block mb-2">
                MAIN FELLOWSHIP ALIGNMENT
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-light tracking-tight leading-none uppercase text-[#0B0907]">
                FELLOWSHIP <br />
                <span className="font-serif italic font-extralight text-primary-dark font-serif">chapters</span>
              </h2>
              <div className="h-[1px] w-20 bg-[#E05320] my-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
              {currentContacts.map((chap, idx) => (
                <div key={chap.id || idx} className="flex flex-col gap-2 p-5 bg-white border border-black/5 shadow-sm hover:border-[#C25627]/10 transition-colors active-press cursor-pointer">
                  <h4 className="font-sans text-xs font-bold text-[#0B0907] uppercase tracking-wider">
                    {chap.name}
                  </h4>
                  <span className="font-sans text-xs text-zinc-500 font-light leading-relaxed">
                    Role: {chap.role}
                  </span>
                  <a href={`tel:${chap.phone}`} className="font-mono text-xs text-primary-dark hover:underline mt-1 font-semibold active-press inline-block">
                    {chap.phone}
                  </a>
                  {chap.email && (
                    <a href={`mailto:${chap.email}`} className="font-sans text-xs text-zinc-500 hover:text-[#0B0907] transition-colors break-all break-words active-press inline-block">
                      {chap.email}
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="h-[1px] w-full bg-black/10 my-4" />

            {/* Venue info */}
            <div>
              <h4 className="font-sans text-xs font-bold text-[#0B0907] uppercase tracking-wider mb-2">
                CONFERENCE VENUE
              </h4>
              <p className="font-sans text-[#7A7062] text-sm leading-relaxed font-light whitespace-pre-line">
                {currentAddress}
              </p>
            </div>
          </div>

          {/* Right: Email Form */}
          <div className="lg:col-span-6 w-full">
            <div className="p-5 sm:p-8 md:p-12 border border-black/10 bg-white relative shadow-xl">
              <span className="font-sans text-sm font-bold tracking-[0.25em] text-[#E05320] uppercase block mb-6 text-left">
                SUBMIT A MESSAGE
              </span>

              {formSubmitted ? (
                <div className="py-12 text-center font-serif text-xl italic text-[#C25627]">
                  Thank you. Your message has been received.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-sm font-bold text-[#0B0907] tracking-wider uppercase">SUBMISSION TYPE</label>
                    <CustomSelect
                      value={type}
                      onChange={(val) => setType(val as any)}
                      options={[
                        { value: "Enquiry", label: "General Enquiry" },
                        { value: "Testimony", label: "Share a Testimony" },
                        { value: "Prayer Request", label: "Prayer Request" }
                      ]}
                      disabled={submitting}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-sm font-bold text-[#0B0907] tracking-wider uppercase">FULL NAME (OPTIONAL)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={submitting}
                      className="w-full bg-transparent border-b border-black/15 focus:border-primary-dark py-2 text-sm text-[#0B0907] outline-none transition-colors"
                      placeholder="e.g. Bro. Samuel Ade"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-sm font-bold text-[#0B0907] tracking-wider uppercase">EMAIL ADDRESS (OPTIONAL)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting}
                      className="w-full bg-transparent border-b border-black/15 focus:border-primary-dark py-2 text-sm text-[#0B0907] outline-none transition-colors"
                      placeholder="e.g. samuel@gmail.com"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-sm font-bold text-[#0B0907] tracking-wider uppercase">MESSAGE <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={submitting}
                      className="w-full bg-transparent border-b border-black/15 focus:border-primary-dark py-2 text-sm text-[#0B0907] outline-none transition-colors resize-none"
                      placeholder={
                        type === "Enquiry" ? "Specify chapter details or hostel enquiries..." :
                        type === "Testimony" ? "Share what God has done..." :
                        "Share your prayer request..."
                      }
                    />
                    <div className="flex justify-between items-center mt-1">
                      {message.length > 0 && message.length < 10 ? (
                        <span className="text-xs text-rose-500 font-medium">Message is too short</span>
                      ) : (
                        <span className="text-xs text-zinc-500"></span>
                      )}
                      {message.length >= 10 && (
                        <span className="text-xs text-zinc-500 font-mono">{message.length} characters</span>
                      )}
                    </div>
                  </div>

                  {submitError && (
                    <span className="font-sans text-xs text-rose-500 font-medium">
                      {submitError}
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#0B0907] hover:bg-primary-dark disabled:bg-zinc-300 disabled:text-zinc-600 text-white hover:text-[#0B0907] font-sans font-bold text-sm tracking-widest uppercase transition-all duration-300 mt-4 text-center cursor-pointer active-press"
                  >
                    {submitting ? "Sending..." : "Send message"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
