"use client";

import { useQuery } from "@tanstack/react-query";
import { getEvents } from "@/lib/firebase/events";
import { useParams, useRouter } from "next/navigation";
import { CustomSelect } from "./CustomSelect";

export function EventSwitcher() {
  const router = useRouter();
  const params = useParams();
  
  const currentEventId = (params?.eventId as string) || "refreshing-2026";

  const { data: eventsList = [] } = useQuery({
    queryKey: ["public", "events"],
    queryFn: getEvents,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  if (eventsList.length <= 1) return null; // Don't show if there's only 1 event

  const options = eventsList.map((e) => ({
    value: e.id,
    label: e.name,
  }));

  const handleSwitch = (newId: string) => {
    // Save preference to cookie so middleware knows what the user prefers on bare URLs
    document.cookie = `currentEventId=${newId}; path=/; max-age=31536000`;
    router.push(`/${newId}`);
  };

  return (
    <div className="w-48">
      <CustomSelect
        value={currentEventId}
        onChange={handleSwitch}
        options={options}
      />
    </div>
  );
}
