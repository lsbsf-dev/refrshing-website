/**
 * @file useSessions.ts
 * @description React Query hook for retrieving conference timetable sessions.
 */

import { useQuery } from "@tanstack/react-query";
import { getSessions } from "@/lib/firebase/programme";
import seedSessions from "@/lib/firebase/seedSessions.json";
import { Session } from "@/types/programme";

export function useSessions(eventId: string) {
  return useQuery({
    queryKey: ["sessions", eventId],
    queryFn: () => getSessions(eventId),
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const all = seedSessions as unknown as Session[];
      return all.filter(
        (s) => s.eventId === eventId && s.status === "published"
      );
    },
  });
}
