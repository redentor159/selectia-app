"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardData } from "@/lib/types";

/**
 * Dashboard data hook backed by react-query.
 *
 * Performance tuning (gap P2A-TABLA / user complaint "Tabla Maestra demora
 * demasiado en cargar"):
 *   - staleTime 5 min — matches the server-side ISR `revalidate = 300`, so a
 *     cached client response is considered fresh for the same window the
 *     server keeps it fresh. Avoids re-fetching when switching views.
 *   - gcTime 30 min — even after the data goes stale, react-query keeps the
 *     last successful response in memory for 30 min so switching back to the
 *     Tabla renders instantly while a background revalidation runs.
 *   - Stable queryKey `["dashboard-data"]` — view switches never trigger a
 *     new fetch (the same key is reused across all 16 views).
 *   - refetchOnWindowFocus false — prevents refetches when the user alt-tabs.
 */
export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 min — aligned with server ISR
    gcTime: 30 * 60 * 1000, // 30 min — keep in memory across view switches
    refetchOnWindowFocus: false,
  });
}
