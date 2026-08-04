"use client";

import { useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScatterProviderLegend } from "@/components/dashboard/views/analytics-view";
import { FichaTecnicaModal } from "@/components/dashboard/ficha-tecnica-modal";
import type { AIModel } from "@/lib/types";

/**
 * ChartDialogContext — contrato del render prop.
 *
 * La vista recibe este contexto y lo aplica a su JSX Recharts:
 * - `xDomain` al XAxis (dominio por defecto; el zoom esta deshabilitado en
 *   este commit punto-limpio y se rehace en el siguiente).
 * - `onPointClick` al click de puntos (ficha tecnica).
 * - `activeProviders`/`onToggleProvider` para leyenda y opacidad.
 *
 * El eje Y nunca se toca.
 */
export interface ChartDialogContext {
  xDomain: [number | string | "auto", number | string | "auto"];
  onPointClick: (modelId: string) => void;
  activeProviders: string[];
  onToggleProvider: (p: string) => void;
}

/** Resolucion temporal del timeline (mismo conjunto de valores que AnalyticsView). */
export type TimeResolution = "week" | "month" | "quarter" | "year";

interface ChartExpandDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  chartId: string;
  data: Record<string, unknown>[];
  /** dataKey del eje X (ej. "x" para scatter, "quarter" para timeline). */
  xDataKey: string;
  models: AIModel[];
  /** Dominio X por defecto (sin zoom). ["auto","auto"] = Recharts calcula. */
  defaultXDomain: [number | string | "auto", number | string | "auto"];
  /** Render prop: la vista pasa su grafico Recharts. */
  renderChart: (ctx: ChartDialogContext) => ReactNode;
  activeProviders: string[];
  onToggle: (p: string) => void;
  timeRes?: TimeResolution;
  onTimeResChange?: (r: TimeResolution) => void;
  legendData?: { provider: string; color: string; z?: number | null }[];
}

/**
 * ChartExpandDialog — modal de pantalla completa para ver un grafico grande.
 *
 * PUNTO LIMPIO: este commit deja el modal SIN control de zoom. Las vistas
 * siguen recibiendo `ctx.xDomain` (igual a `defaultXDomain`) para que el eje
 * X respete el dominio por defecto, pero no hay botones de zoom, ni brush,
 * ni area arrastrable. El siguiente commit rehace el zoom con botones +/- y
 * barra deslizante.
 */
export function ChartExpandDialog({
  open,
  onClose,
  title,
  subtitle,
  chartId,
  models,
  defaultXDomain,
  renderChart,
  activeProviders,
  onToggle,
  timeRes,
  onTimeResChange,
  legendData,
  data,
  xDataKey: _xDataKey,
}: ChartExpandDialogProps) {
  const [fichaModelId, setFichaModelId] = useState<string | null>(null);

  // Leyenda: explicita si viene, sino derivada de data (par provider + color)
  const legendItems = useMemo(() => {
    if (legendData) return legendData;
    const map = new Map<string, { provider: string; color: string; z?: number | null }>();
    for (const row of data) {
      const provider = row["provider"] as string | undefined;
      const color = row["color"] as string | undefined;
      if (typeof provider === "string" && typeof color === "string") {
        if (!map.has(provider)) {
          const z = typeof row["z"] === "number" ? (row["z"] as number) : undefined;
          map.set(provider, { provider, color, z });
        }
      }
    }
    return Array.from(map.values());
  }, [legendData, data]);

  const ctx: ChartDialogContext = useMemo(
    () => ({
      xDomain: defaultXDomain,
      onPointClick: (modelId: string) => setFichaModelId(modelId),
      activeProviders,
      onToggleProvider: onToggle,
    }),
    [defaultXDomain, activeProviders, onToggle]
  );

  const fichaModel = fichaModelId
    ? models.find((m) => m.id === fichaModelId) ?? null
    : null;

  // `data` y `xDataKey` se usan en el siguiente commit para el zoom; por ahora
  // los marcamos como intencionalmente no usados para no romper la firma ni el
  // TS (los callers aun los pasan, y el commit siguiente los reintroduce).
  void data;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[90vw] !max-w-[90vw] xl:!max-w-[1400px] h-[85vh] max-h-[85vh] rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] shadow-[var(--shadow-high)] flex flex-col gap-0 p-0 overflow-hidden"
      >
        {/* Header: titulo + cierre + leyenda + selector temporal */}
        <div className="shrink-0 px-4 pt-3 pb-1 border-b border-[var(--border-strong)]">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
              {title}
            </DialogTitle>
            {/* Boton X de cierre */}
            <button
              onClick={onClose}
              className="ml-auto inline-flex items-center justify-center rounded-md h-7 w-7 text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {subtitle && (
            <DialogDescription className="text-xs text-[var(--text-secondary)] mt-0.5">
              {subtitle}
            </DialogDescription>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
            <ScatterProviderLegend
              data={legendItems}
              activeProviders={activeProviders}
              onToggle={onToggle}
            />
            {timeRes && onTimeResChange && (
              <select
                className="text-xs bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded px-2 py-1 outline-none text-[var(--text-primary)] cursor-pointer"
                value={timeRes}
                onChange={(e) =>
                  onTimeResChange(e.target.value as TimeResolution)
                }
              >
                <option value="week">Semanal</option>
                <option value="month">Mensual</option>
                <option value="quarter">Trimestral (Q)</option>
                <option value="year">Anual</option>
              </select>
            )}
          </div>
        </div>

        {/* Grafico ampliado — sin controles de zoom en este commit punto-limpio */}
        <div className="flex-1 min-h-0 flex flex-col p-2">
          <div data-chart-id={chartId} className="h-[70vh] max-h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* Recharts exige un unico ReactElement; la vista debe pasar
                  exactamente un chart (LineChart/ScatterChart). */}
              {renderChart(ctx) as ReactElement}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ficha tecnica anidada — patron tabla-view.tsx */}
        {fichaModelId && (
          <FichaTecnicaModal
            model={fichaModel}
            onClose={() => setFichaModelId(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
