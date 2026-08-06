/**
 * useMinisters Hook
 *
 * Custom React Query hook for fetching published ministers data for the active event.
 * Falls back to offline JSON seed data when Firebase is unavailable or offline.
 *
 * Key exports: useMinisters
 */

import { useQuery } from "@tanstack/react-query";
import { getMinisters } from "@/lib/firebase/ministers";
import seedMinisters from "@/lib/firebase/seedMinisters.json";
import { Minister } from "@/types/minister";

export function useMinisters(eventId: string) {
  return useQuery({
    queryKey: ["ministers", eventId],
    queryFn: () => getMinisters(eventId),
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const all = seedMinisters as unknown as Minister[];
      return all.filter(
        (m) => m.eventId === eventId && m.status === "published"
      );
    },
  });
}
