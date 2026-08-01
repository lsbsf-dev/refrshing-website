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
import { ACTIVE_EVENT_ID } from "@/lib/firebase/app";
import seedResources from "@/lib/firebase/seedResources.json";
import { Resource } from "@/types/resource";

export function useResources() {
  return useQuery({
    queryKey: ["resources", ACTIVE_EVENT_ID],
    queryFn: () => getResources(ACTIVE_EVENT_ID),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    initialData: () => seedResources as unknown as Resource[],
  });
}
