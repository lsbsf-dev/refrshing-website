/**
 * useAnnouncements Hook
 *
 * Custom React Query hook for fetching announcements and broadcasts.
 * Falls back to offline JSON seed data when Firebase is offline.
 *
 * Key exports: useAnnouncements
 */

import { useQuery } from "@tanstack/react-query";
import { getAnnouncements } from "@/lib/firebase/announcements";
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import seedAnnouncements from "@/lib/firebase/seedAnnouncements.json";
import { Announcement } from "@/types/announcement";

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements", ACTIVE_EVENT_ID],
    queryFn: () => getAnnouncements(ACTIVE_EVENT_ID),
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: () => seedAnnouncements as unknown as Announcement[],
  });
}
