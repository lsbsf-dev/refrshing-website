/**
 * useSessions Hook
 *
 * Custom React Query hook for fetching published program sessions/events data.
 * Falls back to offline JSON seed data when Firebase is unavailable or offline.
 *
 * Key exports: useSessions
 */

import { useQuery } from "@tanstack/react-query";
import { getSessions } from "@/lib/firebase/programme";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import seedSessions from "@/lib/firebase/seedSessions.json";
import { Session } from "@/types/programme";

export function useSessions() {
  return useQuery({
    queryKey: ["sessions", ACTIVE_EVENT_ID],
    queryFn: () => getSessions(ACTIVE_EVENT_ID),
    staleTime: 30 * 60 * 1000, // 30 minutes
    initialData: () =>
      (seedSessions as Session[]).filter(
        (s) => s.eventId === ACTIVE_EVENT_ID && s.status === "published"
      ),
  });
}
