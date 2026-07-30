import { AlertCircle, Activity, Timer, Zap, Gauge } from "lucide-react";
import type { AIModel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CompactMetricRow } from "./compact-metric-row";

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
    <div className="space-y-4">
      {/* Status badge */}
      <div
        className={cn("rounded-md border px-3 py-2 text-xs font-semibold flex items-center justify-between", variantClass)}
        role="status"
        aria-label={statusLabel}
      >
        <div className="flex items-center gap-2">
          <Gauge className="h-3.5 w-3.5 shrink-0" />
          {statusLabel}
        </div>
        <div className="text-[11px] font-mono opacity-80">
          Uptime: {((1 - fr) * 100).toFixed(1)}%
        </div>
      </div>

      {/* 4 metric cards in a 2x2 grid using CompactMetricRow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
        <CompactMetricRow
          icon={AlertCircle}
          label="Failure rate"
          value={<span className={frColorClass}>{(fr * 100).toFixed(1)}%</span>}
          tooltip={<><div className="font-semibold mb-1">Tasa de fallo</div>Porcentaje de solicitudes que fallaron (errores de validación, formato JSON incorrecto, o tiempo de espera agotado) en producción real.</>}
        />
        <CompactMetricRow
          icon={Timer}
          label="P95 Latency"
          value={formatLatency(p95)}
          tooltip={<><div className="font-semibold mb-1">Latencia percentil 95</div>Latencia del percentil 95. Significa que el 95% de las llamadas a la API se resolvieron en este tiempo o menos.</>}
        />
        <CompactMetricRow
          icon={Zap}
          label="Avg Throughput"
          value={throughput != null ? `${throughput.toFixed(1)} tok/s` : "—"}
          tooltip={<><div className="font-semibold mb-1">Velocidad media</div>Tasa promedio de generación de tokens por segundo observada en condiciones reales de uso intensivo.</>}
        />
        <CompactMetricRow
          icon={Activity}
          label="Total Calls"
          value={calls != null ? calls.toLocaleString("es-PE") : "—"}
          tooltip={<><div className="font-semibold mb-1">Llamadas medidas</div>Número total de llamadas a la API analizadas para calcular estas métricas de confiabilidad.</>}
        />
      </div>

      {/* Footnote */}
      <div className="text-[11px] text-[var(--text-disabled)] italic pt-2 border-t border-[var(--border-default)]">
        Fuente: api.zeroeval.com/v1/models/metrics — métricas de producción en tiempo real
      </div>
    </div>
  );
}
