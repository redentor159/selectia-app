"use client";

import { useMemo } from "react";
import { useDashboardSummary } from "./use-dashboard-summary";
import { useDashboardStore } from "@/store/dashboard-store";

/**
 * Wrapper de useDashboardSummary que aplica los overrides de tipo de cambio
 * personalizado del usuario (localStorage). Cuando el usuario configura
 * "mi propio TC" (ej: S/.3.55 en vez del oficial), todas las vistas que leen
 * data.currencies usan automáticamente el tipo personalizado.
 *
 * Es un reemplazo directo de useEffectiveDashboardData: misma API, mismo
 * comportamiento de query, solo cambia la fuente (payload ligero summary).
 */
export function useEffectiveDashboardSummary() {
  const queryResult = useDashboardSummary();
  const customExchangeRates = useDashboardStore((s) => s.customExchangeRates);

  const effectiveData = useMemo(() => {
    if (!queryResult.data) return queryResult.data;
    // Sin tipos personalizados, se devuelve el dato original (sin copia)
    if (Object.keys(customExchangeRates).length === 0) return queryResult.data;

    // Aplica los tipos personalizados al array de monedas
    return {
      ...queryResult.data,
      currencies: queryResult.data.currencies.map((c) => {
        const custom = customExchangeRates[c.code];
        return custom != null ? { ...c, rateFromUsd: custom } : c;
      }),
    };
  }, [queryResult.data, customExchangeRates]);

  return { ...queryResult, data: effectiveData };
}