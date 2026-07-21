"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20">
      
      {/* ═══════════════════════════════════════
          SCENE 1: CONTACT HERO (Centered & Balanced Height with staggered load animations)
          ═══════════════════════════════════════ */}
      <section className="relative w-full h-[45dvh] min-h-[380px] flex flex-col justify-center bg-[#0B0907] text-white overflow-hidden pt-40 lg:pt-48 pb-24 px-6 md:px-16 border-b border-white/5">
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
          <span className="font-sans text-[10px] font-extrabold tracking-[0.35em] text-[#DDB94E] uppercase animate-hero-item delay-100">
            REFRESHING ENQUIRY CHANNELS
          </span>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-[85px] font-bold tracking-tight uppercase select-none leading-[0.95] animate-hero-item delay-200">
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
      <section className="relative w-full py-28 px-6 md:px-16 bg-[#FAF6EE] text-[#1E1B16] texture-paper overflow-hidden">
        
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left: Contact Channels */}
          <div className="lg:col-span-6 flex flex-col items-start gap-8 text-left w-full">
            <div>
              <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#E05320] uppercase block mb-2">
                MAIN FELLOWSHIP ALIGNMENT
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-light tracking-tight leading-none uppercase text-[#0B0907]">
                FELLOWSHIP <br />
                <span className="font-serif italic font-extralight text-primary-dark font-serif">chapters</span>
              </h2>
              <div className="h-[1px] w-20 bg-[#E05320] my-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
              {contactList.map((chap, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-5 bg-white border border-black/5 shadow-sm hover:border-[#C25627]/10 transition-colors active-press cursor-pointer">
                  <h4 className="font-sans text-xs font-bold text-[#0B0907] uppercase tracking-wider">
                    {chap.chapter}
                  </h4>
                  <span className="font-sans text-xs text-zinc-500 font-light leading-relaxed">
                    Leader: {chap.leader}
                  </span>
                  <a href={`tel:${chap.phone}`} className="font-mono text-xs text-primary-dark hover:underline mt-1 font-semibold active-press inline-block">
                    {chap.phone}
                  </a>
                  <a href={`mailto:${chap.email}`} className="font-sans text-xs text-zinc-500 hover:text-[#0B0907] transition-colors break-all active-press inline-block">
                    {chap.email}
                  </a>
                </div>
              ))}
            </div>

            <div className="h-[1px] w-full bg-black/10 my-4" />

            {/* Venue info */}
            <div>
              <h4 className="font-sans text-xs font-bold text-[#0B0907] uppercase tracking-wider mb-2">
                CONFERENCE VENUE
              </h4>
              <p className="font-sans text-[#7A7062] text-xs leading-relaxed font-light">
                Baptist Academy Hall, Obanikoro, Ikorodu Road, Lagos, Nigeria.
              </p>
            </div>
          </div>

          {/* Right: Email Form */}
          <div className="lg:col-span-6 w-full">
            <div className="p-8 md:p-12 border border-black/10 bg-white relative shadow-xl">
              <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#E05320] uppercase block mb-6 text-left">
                SUBMIT AN ENQUIRY
              </span>

              {formSubmitted ? (
                <div className="py-12 text-center font-serif text-xl italic text-[#C25627]">
                  Thank you. Your message has been received. Our leadership team will align shortly.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] font-bold text-[#0B0907] tracking-wider uppercase">FULL NAME</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-transparent border-b border-black/15 focus:border-primary-dark py-2 text-sm text-[#0B0907] outline-none transition-colors"
                      placeholder="e.g. Bro. Samuel Ade"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] font-bold text-[#0B0907] tracking-wider uppercase">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-transparent border-b border-black/15 focus:border-primary-dark py-2 text-sm text-[#0B0907] outline-none transition-colors"
                      placeholder="e.g. samuel@gmail.com"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] font-bold text-[#0B0907] tracking-wider uppercase">ENQUIRY DETAILS</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full bg-transparent border-b border-black/15 focus:border-primary-dark py-2 text-sm text-[#0B0907] outline-none transition-colors resize-none"
                      placeholder="Specify chapter details or hostel enquiries..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#0B0907] hover:bg-primary-dark text-white hover:text-[#0B0907] font-sans font-bold text-[12px] tracking-widest uppercase transition-all duration-300 mt-4 text-center cursor-pointer active-press"
                  >
                    Send message
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

const contactList = [
  {
    chapter: "Lagos East Chapter",
    leader: "Bro. Tunde Samuel",
    phone: "+234 812 345 6789",
    email: "east@lsbsf.org"
  },
  {
    chapter: "Lagos West Chapter",
    leader: "Sis. Shade Adebayo",
    phone: "+234 803 111 2222",
    email: "west@lsbsf.org"
  },
  {
    chapter: "Lagos Central Chapter",
    leader: "Bro. Chidi Nwosu",
    phone: "+234 815 444 5555",
    email: "central@lsbsf.org"
  },
  {
    chapter: "Alumni Coordinator Office",
    leader: "Dr. Helen Adeyemi",
    phone: "+234 802 999 8888",
    email: "alumni@lsbsf.org"
  }
];
