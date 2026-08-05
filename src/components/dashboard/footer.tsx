"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Database, RefreshCw, Github, ExternalLink } from "lucide-react";
import { timeAgo, timeUntil } from "@/lib/format";
import { useDashboardStore } from "@/store/dashboard-store";

export function Footer() {
  const { data } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 1000 * 60 * 30,
  });

  // Re-render cada 60 s para que timeUntil recalcule el contador
  // "TC se actualiza" en lugar de quedar congelado.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const generatedAt = data?.generatedAt;
  const nextUpdate = data?.exchangeRateNextUpdate;

  return (
    <footer className="mt-auto border-t border-[var(--border-default)] bg-[var(--bg-elevated)]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 lg:px-6 py-3 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" />
            {generatedAt ? (
              <>JSON maestro: {timeAgo(generatedAt)}</>
            ) : (
              <span className="inline-flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Cargando…
              </span>
            )}
          </span>
          {nextUpdate && (
            <span className="hidden sm:inline">
              · TC se actualiza {timeUntil(nextUpdate)}
            </span>
          )}
          <span className="hidden md:inline">
            · HRE-TOPSIS 100% cliente · &lt;100ms
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/redentor159/selectia-app"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Repo</span>
          </a>
          <button
            type="button"
            onClick={() => useDashboardStore.getState().setActiveView("salud")}
            className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
          >
            <span className="hidden sm:inline">Fuentes verificadas</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
