"use client";

import { useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { Brush, ResponsiveContainer } from "recharts";
import { RotateCcw, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScatterProviderLegend } from "@/components/dashboard/views/analytics-view";
import { FichaTecnicaModal } from "@/components/dashboard/ficha-tecnica-modal";
import type { AIModel } from "@/lib/types";

/**
 * ChartDialogContext — contrato del render prop.
 *
 * La vista recibe este contexto y lo aplica a su JSX Recharts:
 * - `xDomain` al XAxis (dominio por defecto; sin zoom porque el Brush nativo
 *   controla la escala del eje directamente).
 * - `brush` — elemento <Brush> preconfigurado. Recharts EXIGE que <Brush>
 *   sea hijo directo del chart (LineChart/ScatterChart), NO hermano del
 *   ResponsiveContainer ni fuera de un chart. Por eso viaja por contexto:
 *   la vista lo inserta como hijo de su chart con {ctx.brush}.
 * - `onPointClick` al click de puntos (ficha tecnica).
 * - `activeProviders`/`onToggleProvider` para leyenda y opacidad.
 *
 * El Brush nativo de Recharts es el estandar de dashboards (Plotly, ECharts,
 * D3, Recharts usan este patron). Trabaja con la escala del eje, no con
 * indices del array, por lo que es universal: funciona igual si los datos
 * estan ordenados o no por X (eso era lo que rompia el approach custom).
 *
 * El eje Y nunca se toca.
 */
export interface ChartDialogContext {
  xDomain: [number | string | "auto", number | string | "auto"];
  /** Elemento <Brush> para insertar como hijo del chart. */
  brush: ReactNode;
  onPointClick: (modelId: string) => void;
  activeProviders: string[];
  onToggleProvider: (p: string) => void;
  /**
   * true cuando hay zoom aplicado (Brush con rango != completo). Las vistas
   * no lo necesitan; lo usa el modal para mostrar/ocultar el boton Reiniciar.
   */
  isZoomed: boolean;
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
 * ChartExpandDialog — modal de pantalla completa con zoom por Brush nativo
 * de Recharts (estandar de dashboards). Sin scrollbar custom ni botones +/-.
 *
 * Interaccion:
 * - Arrastrar las manijas del Brush ↓ recorta el rango visible del eje X.
 * - Arrastrar el centro del Brush desplaza la ventana (pan nativo).
 * - Teclado: tab al Brush, flechas izq/der ajustan las manijas.
 * - Boton Reiniciar (solo visible cuando hay zoom) vuelve al dominio completo.
 *
 * El Brush controla la escala del eje X directamente, asi que funciona igual
 * en LineChart (timeline categórico) y en ScatterChart (numerico/log) sin
 * tocar la logica de datos. Es el approach universal.
 *
 * El estado zoomed se reinicia al cerrar el modal (montaje condicional).
 */
export function ChartExpandDialog({
  open,
  onClose,
  title,
  subtitle,
  chartId,
  data,
  xDataKey,
  models,
  defaultXDomain,
  renderChart,
  activeProviders,
  onToggle,
  timeRes,
  onTimeResChange,
  legendData,
}: ChartExpandDialogProps) {
  const lastIndex = Math.max(0, data.length - 1);

  /**
   * Estado de zoom del Brush: indices [start, end] del array data. El Brush
   * nativo maneja su propia UI y los recortes del eje; nosotros solo
   * mantenemos este estado para:
   * 1. Pasarselo al Brush via startIndex/endIndex (controlado).
   * 2. Saber si hay zoom aplicado (mostrar el boton Reiniciar).
   * 3. Resetear el Brush al Reiniciar (volviendo a [0, lastIndex]).
   */
  const [zoom, setZoom] = useState<{ start: number; end: number } | null>(null);
  const isZoomed = zoom !== null && (zoom.start > 0 || zoom.end < lastIndex);
  const [fichaModelId, setFichaModelId] = useState<string | null>(null);

  /**
   * Brush preconfigurado. La vista lo inserta dentro de su chart como hijo
   * directo. El `dataKey` es el del eje X (x o quarter). El Brush controla
   * la escala del eje del chart al que pertenece: cambia el dominio visible
   * instantaneamente, sin que tengamos que traducir indices a valores.
   */
  const brush: ReactNode = (
    <Brush
      dataKey={xDataKey}
      height={28}
      travellerWidth={10}
      stroke="var(--border-strong)"
      fill="var(--bg-overlay)"
      startIndex={zoom?.start ?? 0}
      endIndex={zoom?.end ?? lastIndex}
      onChange={(r) => {
        if (!r) return;
        const s = r.startIndex ?? 0;
        const e = r.endIndex ?? lastIndex;
        // Ignorar cambios triviales (mismo rango) para no marcar zoomed por error
        if (s === 0 && e === lastIndex) {
          setZoom(null);
        } else {
          setZoom({ start: s, end: e });
        }
      }}
    />
  );

  const ctx: ChartDialogContext = useMemo(
    () => ({
      xDomain: defaultXDomain,
      brush,
      onPointClick: (modelId: string) => setFichaModelId(modelId),
      activeProviders,
      onToggleProvider: onToggle,
      isZoomed,
    }),
    // brush es estable por render salvo que cambien sus inputs; lo listamos
    // indirectamente via zoom+lastIndex+xDataKey para forzar el recalculo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [defaultXDomain, activeProviders, onToggle, isZoomed, zoom, lastIndex, xDataKey, data]
  );

  /** Reiniciar: vuelve el Brush al dominio completo. */
  const resetZoom = () => setZoom(null);

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

  const fichaModel = fichaModelId
    ? models.find((m) => m.id === fichaModelId) ?? null
    : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[90vw] !max-w-[90vw] xl:!max-w-[1400px] h-[85vh] max-h-[85vh] rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] shadow-[var(--shadow-high)] flex flex-col gap-0 p-0 overflow-hidden"
      >
        {/* Header: titulo + reinicio + cierre + leyenda + selector temporal */}
        <div className="shrink-0 px-4 pt-3 pb-1 border-b border-[var(--border-strong)]">
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
              {title}
            </DialogTitle>
            {/* Boton Reiniciar — visible solo cuando hay zoom aplicado */}
            {isZoomed && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-[var(--text-secondary)]"
                onClick={resetZoom}
                title="Reiniciar zoom"
                aria-label="Reiniciar zoom"
              >
                <RotateCcw className="h-3 w-3" />
                Reiniciar
              </Button>
            )}
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
          {!isZoomed && (
            <div className="text-[10px] text-[var(--text-secondary)] opacity-70 mt-0.5">
              Arrastrá las manijas de la barra inferior para hacer zoom en el eje X
            </div>
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

        {/* Grafico ampliado: el contexto inyecta <Brush> como hijo del chart. */}
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
