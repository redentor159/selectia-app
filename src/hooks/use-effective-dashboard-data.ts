"use client";

import { useMemo } from "react";
import { useDashboardData } from "./use-dashboard-data";
import { useDashboardStore } from "@/store/dashboard-store";

/**
 * v3.3.1: Wrapper around useDashboardData that applies custom exchange rate
 * overrides from the user's localStorage. When a user sets "mi propio TC"
 * (ej: S/.3.55 en vez del oficial S/.3.40), ALL views that read
 * data.currencies will automatically use the custom rate.
 *
 * This hook is a drop-in replacement for useDashboardData() — same return
 * type, same query behavior, just with currencies patched.
 */
export function useEffectiveDashboardData() {
  const queryResult = useDashboardData();
  const customExchangeRates = useDashboardStore((s) => s.customExchangeRates);

  const effectiveData = useMemo(() => {
    if (!queryResult.data) return queryResult.data;
    // If no custom rates, return original data (no copy needed)
    if (Object.keys(customExchangeRates).length === 0) return queryResult.data;

    // Apply custom rates to currencies array
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
