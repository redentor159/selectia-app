"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardSummary } from "@/lib/types";

/**
 * Hook del payload ligero del dashboard (?fields=summary).
 *
 * Misma estrategia de cache que useDashboardData (staleTime 5 min alineado
 * con el ISR del servidor, gcTime 30 min para mantener la respuesta en
 * memoria al cambiar de vista, refetchOnWindowFocus desactivado), pero con
 * una queryKey propia ["dashboard-summary"] porque el payload es distinto
 * (solo campos base — los or* de OpenRouter no viajan aquí).
 *
 * Las vistas Resumen y Analytics consumen este hook; la vista Salud sigue
 * usando el payload completo (useDashboardData) porque necesita los campos
 * or* (OpenRouter) y hf*, además de los indicadores del orquestador.
 */
export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard?fields=summary");
      if (!res.ok) throw new Error("No se pudo obtener el resumen del dashboard");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 min — alineado con el SIR del servidor
    gcTime: 30 * 60 * 1000, // 30 min — en memoria al cambiar de vista
    refetchOnWindowFocus: false,
  });
}