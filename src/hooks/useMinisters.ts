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
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import seedMinisters from "@/lib/firebase/seedMinisters.json";
import { Minister } from "@/types/minister";

export function useMinisters() {
  return useQuery({
    queryKey: ["ministers", ACTIVE_EVENT_ID],
    queryFn: () => getMinisters(ACTIVE_EVENT_ID),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    initialData: () =>
      (seedMinisters as Minister[]).filter(
        (m) => m.eventId === ACTIVE_EVENT_ID && m.status === "published"
      ),
  });
}
