/**
 * @file useResources.ts
 * @description React Query hook for fetching downloadable resource library items.
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
