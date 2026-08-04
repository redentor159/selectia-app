"use client";

import { useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
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
 * - `xDomain` al XAxis (dominio visible tras el zoom, traducido a valores del
 *   eje: numeros para ejes numericos, categorias string para el timeline).
 * - `visibleStartIndex` / `visibleEndIndex` — indices del array `data` que
 *   forman parte de la ventana visible. El timeline lo usa para slice.
 * - `onPointClick` al click de puntos (ficha tecnica).
 * - `activeProviders`/`onToggleProvider` para leyenda y opacidad.
 *
 * El eje Y nunca se toca.
 */
export interface ChartDialogContext {
  xDomain: [number | string | "auto", number | string | "auto"];
  /** Indices [start, end] del array data que caen dentro de la ventana. */
  visibleStartIndex: number;
  visibleEndIndex: number;
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
 * ChartExpandDialog — modal de pantalla completa para ver un grafico grande
 * con zoom simple: botones +/- (zoom por pasos) y un slider de pan (barra
 * deslizante horizontal nativa). Boton Reiniciar vuelve al dominio completo.
 *
 * Toda la logica opera en INDICES del array `data` (0..N-1). El dominio
 * visible son los indices `[start, end]`. La traduccion a valores del
 * dominio X (numeros o categorias) se hace una sola vez al construir
 * `ctx.xDomain`. Esto unifica el ejes numericos y categoricos sin bifurcar.
 *
 * Interaccion:
 * - Boton `+`: reduce el ancho de la ventana a x0.8 (centrado en el centro
 *   de la ventana actual). Si el ancho resultante seria < 2 elementos, no
 *   hace nada (zoom maximo).
 * - Boton `-`: amplia el ancho de la ventana a x1.25. Si llega a >= N,
 *   vuelve al dominio completo (sin zoom).
 * - Slider de pan: desplaza la ventana horizontalmente dentro de los
 *   bounds [0, N - windowHeight]. value 0 = ventana pegada al inicio,
 *   value 100 = pegada al final. Se deshabilita cuando no hay zoom.
 * - Boton Reiniciar: ventana = [0, N-1] (dominio completo).
 *
 * El estado se reinicia al cerrar gracias al montaje condicional de las
 * vistas ({open && <ChartExpandDialog .../>}).
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
  const N = data.length;

  /**
   * Ventana visible en indices del array data: [start, end] inclusivos.
   * null = sin zoom, equivalente a [0, N-1]. Lo mantenemos como estado
   * unico porque todo se deriva de aca.
   */
  const [windowStart, setWindowStart] = useState<number>(0);
  const [windowEnd, setWindowEnd] = useState<number>(Math.max(0, N - 1));
  /** true cuando hay zoom aplicado (ventana != [0, N-1]). */
  const isZoomed = windowStart > 0 || windowEnd < N - 1;

  const [fichaModelId, setFichaModelId] = useState<string | null>(null);

  // --- Logica de zoom (todo en indices) ---

  /** Ancho actual de la ventana en elementos. */
  const windowWidth = Math.max(1, windowEnd - windowStart + 1);

  /** centra el zoom en el centro de la ventana actual. nuevo ancho en indices. */
  const applyZoom = (newWidthRaw: number) => {
    if (N <= 1) return;
    const newWidth = Math.min(N, Math.max(2, Math.round(newWidthRaw)));
    if (newWidth >= N) {
      // Vuelve al dominio completo
      setWindowStart(0);
      setWindowEnd(N - 1);
      return;
    }
    const center = (windowStart + windowEnd) / 2;
    let newStart = Math.round(center - newWidth / 2);
    let newEnd = newStart + newWidth - 1;
    // Clamp a los bounds del array
    if (newStart < 0) {
      newStart = 0;
      newEnd = newWidth - 1;
    }
    if (newEnd > N - 1) {
      newEnd = N - 1;
      newStart = N - newWidth;
    }
    setWindowStart(newStart);
    setWindowEnd(newEnd);
  };

  /** Boton +: reduce ancho a x0.8 (acercar). */
  const zoomIn = () => applyZoom(windowWidth * 0.8);

  /** Boton -: amplia ancho a x1.25 (alejar). */
  const zoomOut = () => applyZoom(windowWidth * 1.25);

  /** Boton Reiniciar: dominio completo. */
  const resetZoom = () => {
    setWindowStart(0);
    setWindowEnd(Math.max(0, N - 1));
  };

  /**
   * Slider de pan: el thumb desplaza la ventana. value 0..100 => start
   * en [0, N - windowWidth]. Solo activo cuando hay zoom.
   */
  const panMax = Math.max(0, N - windowWidth);
  const panValue = panMax > 0 ? (windowStart / panMax) * 100 : 0;
  const onPanChange = (pct: number) => {
    if (panMax === 0) return;
    const newStart = Math.round((pct / 100) * panMax);
    setWindowStart(newStart);
    setWindowEnd(newStart + windowWidth - 1);
  };

  // --- Traduccion indices -> dominio X para la vista ---

  const xDomain = useMemo<
    [number | string | "auto", number | string | "auto"]
  >(() => {
    if (N === 0) return defaultXDomain;
    const startValue = data[windowStart]?.[xDataKey];
    const endValue = data[windowEnd]?.[xDataKey];
    if (startValue === undefined || endValue === undefined) return defaultXDomain;
    // Si defaultXDomain era ["auto","auto"], respetamos el auto para que
    // Recharts calcule ticks; pasamos los valores concretos igual porque
    // el eje espera el dominio que mostramos.
    return [startValue as number | string, endValue as number | string];
  }, [data, xDataKey, windowStart, windowEnd, defaultXDomain, N]);

  const ctx: ChartDialogContext = useMemo(
    () => ({
      xDomain,
      visibleStartIndex: windowStart,
      visibleEndIndex: windowEnd,
      onPointClick: (modelId: string) => setFichaModelId(modelId),
      activeProviders,
      onToggleProvider: onToggle,
    }),
    [xDomain, windowStart, windowEnd, activeProviders, onToggle]
  );

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
        {/* Header: titulo + controles de zoom + cierre + leyenda + selector temporal */}
        <div className="shrink-0 px-4 pt-3 pb-1 border-b border-[var(--border-strong)]">
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
              {title}
            </DialogTitle>
            {/* Controles de zoom: siempre visibles (+ y -), Reiniciar solo con zoom */}
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={zoomIn}
                disabled={N <= 1 || windowWidth <= 2}
                title="Acercar (zoom +)"
                aria-label="Acercar (zoom +)"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={zoomOut}
                disabled={N <= 1 || !isZoomed}
                title="Alejar (zoom -)"
                aria-label="Alejar (zoom -)"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
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
            </div>
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

        {/* Grafico ampliado */}
        <div className="flex-1 min-h-0 flex flex-col p-2">
          <div data-chart-id={chartId} className="h-[70vh] max-h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* Recharts exige un unico ReactElement; la vista debe pasar
                  exactamente un chart (LineChart/ScatterChart). */}
              {renderChart(ctx) as ReactElement}
            </ResponsiveContainer>
          </div>

          {/* Barra deslizante de pan — input range nativo. Se deshabilita
              cuando no hay zoom (la ventana ya cubre todo el dominio). */}
          <div className="shrink-0 pt-2 px-1">
            <input
              type="range"
              min={0}
              max={100}
              value={panValue}
              onChange={(e) => onPanChange(Number(e.target.value))}
              disabled={!isZoomed}
              aria-label="Desplazar el gráfico horizontalmente"
              className="w-full h-2 cursor-pointer disabled:cursor-default disabled:opacity-30"
              style={{ accentColor: "var(--brand-primary)" }}
            />
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
