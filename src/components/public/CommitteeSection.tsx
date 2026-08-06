"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getEventScopedDocs, CommitteeMember } from "@/lib/firebase/cms";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export function CommitteeSection({ eventId }: { eventId: string }) {
  const { data: committee = [], isLoading } = useQuery({
    queryKey: ["public", "committee", eventId],
    queryFn: () => getEventScopedDocs<CommitteeMember>(eventId, "committeeMembers"),
    enabled: !!eventId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#C25627]" />
      </div>
    );
  }

  const publishedCommittee = committee.filter(m => m.status === 'published');

  if (publishedCommittee.length === 0) return null;

  return (
    <section className="relative w-full py-20 px-4 sm:px-6 md:px-16 bg-[#FAF6EE] text-[#0B0907] border-t border-black/5">
      <div className="relative z-10 max-w-7xl mx-auto text-center flex flex-col items-center">
        <span className="font-sans text-sm font-bold tracking-[0.3em] text-[#C25627] uppercase block mb-3">
          STEWARDSHIP & LEADERSHIP
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#0B0907] uppercase leading-none mb-16">
          Central Planning <span className="text-[#C25627] font-normal font-serif">Committee</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full text-left">
          {publishedCommittee.map((member) => (
            <div key={member.id} className="flex flex-col gap-4 group">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-black/10 bg-black/5 shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                {member.photoUrl ? (
                  <Image src={member.photoUrl} alt={member.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 text-black/40 font-serif text-3xl">
                    {member.name.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white font-sans text-xs font-medium tracking-wide">
                    {member.bio || member.role}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#0B0907]">{member.name}</h3>
                <p className="font-sans text-[#C25627] font-semibold text-xs tracking-wider uppercase mt-1">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
