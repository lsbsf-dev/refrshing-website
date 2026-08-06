/**
 * useResources Hook
 *
 * Custom React Query hook for fetching resources and booklet articles.
 * Falls back to offline JSON seed data when Firebase is offline.
 *
 * Key exports: useResources
 */

import { useQuery } from "@tanstack/react-query";
import { getResources } from "@/lib/firebase/resources";
import { Resource } from "@/types/resource";

export function useResources(eventId: string) {
  return useQuery({
    queryKey: ["resources", eventId],
    queryFn: () => getResources(eventId),
    staleTime: 5 * 60 * 1000,
    initialData: () => [] as Resource[],
  });
}
