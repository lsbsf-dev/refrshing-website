"use client";

import { useQuery } from "@tanstack/react-query";
import { getSystemSettings } from "@/lib/firebase/settings";

export function useAdminEvent() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getSystemSettings,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    eventId: settings?.defaultEventId || "refreshing-2026",
    isLoading,
  };
}
