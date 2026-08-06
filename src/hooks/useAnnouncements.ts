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
import seedAnnouncements from "@/lib/firebase/seedAnnouncements.json";
import { Announcement } from "@/types/announcement";


export function useAnnouncements(eventId: string) {
  return useQuery({
    queryKey: ["announcements", eventId],
    queryFn: () => getAnnouncements(eventId),
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      const all = seedAnnouncements as unknown as Announcement[];
      return all
        .filter((a) => a.eventId === eventId && a.status === "published")
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    },
  });
}
