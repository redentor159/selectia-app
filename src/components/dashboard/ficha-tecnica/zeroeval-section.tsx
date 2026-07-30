import { AlertCircle, Activity, Timer, Zap, Gauge } from "lucide-react";
import type { AIModel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ZeroevalReliabilitySection({ model }: { model: AIModel }) {
  const fr = model.zeroevalFailureRate ?? 0;
  const p95 = model.zeroevalP95Latency;
  const throughput = model.zeroevalAvgThroughput;
  const calls = model.zeroevalTotalCalls;

  // Status badge thresholds
  const isHighRisk = fr > 0.15;
  const isMidRisk = fr > 0.05 && fr <= 0.15;

  const statusLabel = isHighRisk
    ? "⚠ Alto riesgo de fallo (>15%)"
    : isMidRisk
      ? "Confiabilidad media (5-15% fallo)"
      : "Confiabilidad alta (≤5% fallo)";

  const variantClass = isHighRisk
    ? "bg-[var(--color-error-bg)] border-[var(--color-error-border)] text-[var(--color-error)]"
    : isMidRisk
      ? "bg-[var(--color-warning-bg)] border-[var(--color-warning-border)] text-[var(--color-warning)]"
      : "bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--color-success)]";

  const frColorClass = isHighRisk ? "text-[var(--color-error)]" : isMidRisk ? "text-[var(--color-warning)]" : "text-[var(--color-success)]";

  // Latency formatting: <1000ms → ms, >=1000ms → seconds
  const formatLatency = (ms: number | null | undefined) => {
    if (ms == null) return "—";
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-3">
      {/* Status badge */}
      <div
        className={cn("rounded-md border px-3 py-2 text-xs font-semibold flex items-center gap-2", variantClass)}
        role="status"
        aria-label={statusLabel}
      >
        <Gauge className="h-3.5 w-3.5 shrink-0" />
        {statusLabel}
      </div>

      {/* 4 metric cards in a 2x2 grid */}
      <div className="grid grid-cols-2 gap-2">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="rounded-lg p-2 cursor-help transition-colors hover:bg-[var(--bg-overlay)] group">
                <div className="flex items-center gap-1 mb-0.5">
                  <AlertCircle className="h-3 w-3 text-[var(--text-secondary)]" />
                  <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Failure rate</span>
                </div>
                <div className={cn("text-base font-bold num", frColorClass)}>
                  {(fr * 100).toFixed(1)}%
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-[200px]">Porcentaje de solicitudes que fallaron (errores de validación, formato JSON incorrecto, o tiempo de espera agotado) en producción real.</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="rounded-lg p-2 cursor-help transition-colors hover:bg-[var(--bg-overlay)] group">
                <div className="flex items-center gap-1 mb-0.5">
                  <Timer className="h-3 w-3 text-[var(--text-secondary)]" />
                  <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">P95 latency</span>
                </div>
                <div className="text-base font-bold num text-[var(--text-primary)]">
                  {formatLatency(p95)}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-[200px]">Latencia del percentil 95. Significa que el 95% de las llamadas a la API se resolvieron en este tiempo o menos.</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="rounded-lg p-2 cursor-help transition-colors hover:bg-[var(--bg-overlay)] group">
                <div className="flex items-center gap-1 mb-0.5">
                  <Zap className="h-3 w-3 text-[var(--text-secondary)]" />
                  <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Avg throughput</span>
                </div>
                <div className="text-base font-bold num text-[var(--text-primary)]">
                  {throughput != null ? `${throughput.toFixed(1)} tok/s` : "—"}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-[200px]">Tasa promedio de generación de tokens por segundo observada en condiciones reales de uso intensivo.</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="rounded-lg p-2 cursor-help transition-colors hover:bg-[var(--bg-overlay)] group">
                <div className="flex items-center gap-1 mb-0.5">
                  <Activity className="h-3 w-3 text-[var(--text-secondary)]" />
                  <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Total calls</span>
                </div>
                <div className="text-base font-bold num text-[var(--text-primary)]">
                  {calls != null ? calls.toLocaleString("es-PE") : "—"}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-[200px]">Número total de llamadas a la API analizadas para calcular estas métricas de confiabilidad.</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Reliability summary line */}
      <div className="rounded-md bg-[var(--bg-overlay)] px-2.5 py-1.5 text-xs font-mono">
        Reliability = 1 − failure_rate ={" "}
        <span className={cn("num font-semibold", frColorClass)}>
          {((1 - fr) * 100).toFixed(1)}%
        </span>
      </div>

      {/* Footnote */}
      <div className="text-xs text-[var(--text-disabled)] italic">
        Fuente: api.zeroeval.com/v1/models/metrics — métricas de producción en tiempo real
      </div>
    </div>
  );
}
