/**
 * Public Landing Page Component — Refreshing 2026
 */
"use client";

import React, { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMinisters } from "@/lib/firebase/ministers";
import { getEventScopedDocs, HomepageSettings } from "@/lib/firebase/cms";
import { useParams } from "next/navigation";
import seedMinisters from "@/lib/firebase/seedMinisters.json";
import { Minister } from "@/types/minister";
import { Announcement } from "@/types/announcement";
import { HomepageBlockRenderer } from "@/components/public/HomepageBlockRenderer";
import { Preloader } from "@/components/shared/Preloader";

export default function HomePage() {
  const params = useParams();
  const ACTIVE_EVENT_ID = params?.eventId as string;
  const pageRef = useRef<HTMLDivElement>(null);

  const { data: settingsDocs = [] } = useQuery({
    queryKey: ["public", "homepageSettings", ACTIVE_EVENT_ID],
    queryFn: () => getEventScopedDocs<HomepageSettings>(ACTIVE_EVENT_ID, "homepageSettings"),
    staleTime: 5 * 60 * 1000,
  });
  // Use the published version for public view, unless preview=true (handled in a real app via router searchParams, but for now we'll just take the first doc)
  const settings = settingsDocs[0] || null;

  const { data: ministers = [] } = useQuery({
    queryKey: ["ministers", ACTIVE_EVENT_ID],
    queryFn: () => getMinisters(ACTIVE_EVENT_ID),
    staleTime: 6 * 60 * 60 * 1000,
    initialData: () =>
      (seedMinisters as Minister[]).filter(
        (m) => m.eventId === ACTIVE_EVENT_ID && m.status === "published"
      ),
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["public", "announcements", ACTIVE_EVENT_ID],
    queryFn: () => getEventScopedDocs<Announcement>(ACTIVE_EVENT_ID, "announcements"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["public", "articles", ACTIVE_EVENT_ID],
    queryFn: () => getEventScopedDocs<any>(ACTIVE_EVENT_ID, "articles"),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div ref={pageRef} className="w-full flex flex-col bg-[#FAF6EE] text-[#0B0907] antialiased overflow-hidden selection:bg-primary/20 min-h-[50vh]">
      <Preloader />
      {!settings || !settings.blocks || settings.blocks.length === 0 ? null : (
        settings.blocks.map((block) => (
          <HomepageBlockRenderer 
            key={block.id} 
            block={block} 
            ministers={ministers} 
            announcements={announcements} 
            articles={articles} 
            eventId={ACTIVE_EVENT_ID} 
          />
        ))
      )}
    </div>
  );
}
