"use client";

import { useEffect, useMemo, useState } from "react";
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
 * ChartDialogContext — contrato del render prop (design.md, sección "Interfaces
 * / Contratos"). La vista de origen recibe este contexto y lo aplica a su JSX
 * Recharts: `xDomain` al XAxis, `onPointClick` al click de puntos, y el par
 * `activeProviders`/`onToggleProvider` para opacidad y leyenda.
 *
 * El eje Y nunca se toca: el zoom es exclusivo del eje X (spec: "El zoom MUST
 * NOT aplicar sobre el eje Y").
 */
export interface ChartDialogContext {
  /**
   * Dominio restringido del eje X: números (ejes numéricos lineales/log) o
   * categorías string (timeline por quarter). El eje Y nunca se toca.
   */
  xDomain: [number | string | "auto", number | string | "auto"];
  /**
   * Rango de índices del Brush (null = sin zoom). El timeline lo usa para
   * filtrar sus datos por índices (alternativa documentada en design.md:
   * el dominio categórico puede no restringir en Recharts 2.15.4).
   */
  zoomIndices: { start: number; end: number } | null;
  onPointClick: (modelId: string) => void;
  activeProviders: string[];
  onToggleProvider: (p: string) => void;
  /**
   * Elemento <Brush> de Recharts ya configurado por el modal. Recharts
   * exige que <Brush> sea un hijo directo del chart (LineChart, ScatterChart,
   * etc.), NO un hermano del ResponsiveContainer. Por eso viaja por contexto:
   * la vista lo inserta dentro de su chart en el render prop con {ctx.brush}.
   * Sin esto el Brush no renderiza (verificado contra la doc oficial:
   * "designed to be used within specific parent chart components").
   */
  brush: ReactNode;
}

/** Resolución temporal del timeline (mismo conjunto de valores que AnalyticsView). */
export type TimeResolution = "week" | "month" | "quarter" | "year";

interface ChartExpandDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** data-chart-id — el modal conserva el mismo valor del gráfico de origen. */
  chartId: string;
  /** Datos del gráfico de origen (para el Brush y la leyenda derivada). */
  data: Record<string, unknown>[];
  /**
   * dataKey del Brush (default "x"). El timeline usa "quarter": su eje es
   * categórico y los valores de categoría viven en esa clave.
   */
  brushDataKey?: string;
  /** Modelos completos para resolver la ficha técnica por id. */
  models: AIModel[];
  /**
   * Dominio X actual del gráfico en la vista (sin zoom). Acepta números
   * (ejes numéricos) o categorías string (timeline por quarter).
   */
  defaultXDomain: [number | string | "auto", number | string | "auto"];
  /**
   * Render prop: la vista pasa su propio JSX Recharts (series, tooltip,
   * colores y dominios viajan tal cual). El modal solo inyecta el contexto.
   */
  renderChart: (ctx: ChartDialogContext) => ReactNode;
  /** Proveedores activos heredados de la vista (estado compartido). */
  activeProviders: string[];
  /** toggleProvider existente de la vista (mismo estado, sin refactor). */
  onToggle: (p: string) => void;
  /** Timeline (opcional): resolución temporal compartida con la vista. */
  timeRes?: TimeResolution;
  onTimeResChange?: (r: TimeResolution) => void;
  /**
   * Leyenda (opcional): pares provider + color. Si no se provee, el modal la
   * deriva de `data` (claves `provider`/`color` de los puntos). El timeline
   * (WU3) proveerá la derivada de providersInTimeline + PROVIDER_PALETTE.
   */
  legendData?: { provider: string; color: string; z?: number | null }[];
}

/**
 * computeDomain — min/max REALES del slice seleccionado sobre la key "x".
 * No asume datos ordenados por X (scatterData no está ordenado): recorre el
 * slice completo y toma el mínimo y máximo efectivos.
 *
 * Escalas mixtas (design.md sección 4 — CRÍTICO):
 * - Eficiencia (scale="log" nativo): `x` es el precio real blendedPrice
 *   (positivo). El rango seleccionado son precios reales (p. ej. $0.3–$15) y
 *   Recharts aplica la escala log VISUAL después — sin distorsión.
 * - Pre-log precomputado (log10/log2: Inteligencia vs Precio, Adopción vs
 *   Calidad, Velocidad vs Contexto): `x` ya es el valor transformado que el
 *   eje recibe. El dominio restringido opera en ese espacio transformado y el
 *   `tickFormatter` (10^v → $ / 2^v → K/M) sigue funcionando porque recibe
 *   ticks del dominio restringido.
 * - Lineal real (Coding vs Agentic): `x` es el índice; rango = índices.
 * - Timeline categórico (brushDataKey="quarter"): los valores no son
 *   numéricos; se devuelve [catStart, catEnd] — categorías del primer y
 *   último índice del slice — para el `domain` del XAxis. La vista además
 *   filtra sus datos por `ctx.zoomIndices` (alternativa documentada en la
 *   pregunta abierta del design: el dominio categórico puede no restringir
 *   en Recharts 2.15.4).
 */
function computeDomain(
  data: Record<string, unknown>[],
  zoom: { start: number; end: number },
  brushDataKey: string
): [number | string | "auto", number | string | "auto"] {
  const slice = data.slice(zoom.start, zoom.end + 1);
  let min: number | null = null;
  let max: number | null = null;
  for (const row of slice) {
    const v = row[brushDataKey];
    if (typeof v === "number") {
      if (min === null || v < min) min = v;
      if (max === null || v > max) max = v;
    }
  }
  if (min !== null && max !== null) return [min, max];
  // Eje categórico (timeline): dominio por categorías del primer/último
  // índice del slice (design.md sección 3).
  const first = slice[0]?.[brushDataKey];
  const last = slice[slice.length - 1]?.[brushDataKey];
  if (typeof first === "string" && typeof last === "string") {
    return [first, last];
  }
  return ["auto", "auto"];
}

/**
 * ChartExpandDialog — modal de pantalla completa para explorar un gráfico.
 *
 * Estado local (zoom + fichaModelId): fresco por apertura porque las vistas lo
 * montan de forma condicional (`{open && <ChartExpandDialog … />}`) — el
 * desmontaje garantiza que el zoom nunca persiste entre aperturas (spec).
 *
 * Ficha técnica: Dialog anidado (FichaTecnicaModal tal cual, patrón de
 * tabla-view.tsx L150-161/L443-448). Su portal Radix se monta después que el
 * del modal, por lo que queda encima (mismo z-[700]); Esc cierra la ficha y
 * vuelve al gráfico con el zoom intacto.
 */
export function ChartExpandDialog({
  open,
  onClose,
  title,
  subtitle,
  chartId,
  data,
  brushDataKey = "x",
  models,
  defaultXDomain,
  renderChart,
  activeProviders,
  onToggle,
  timeRes,
  onTimeResChange,
  legendData,
}: ChartExpandDialogProps) {
  const [zoom, setZoom] = useState<{ start: number; end: number } | null>(null);
  const [fichaModelId, setFichaModelId] = useState<string | null>(null);

  // Reset de zoom al cambiar la resolución temporal: el espacio de índices de
  // `data` cambia (reagregación en la vista), un rango viejo no tiene sentido.
  useEffect(() => {
    setZoom(null);
  }, [timeRes]);

  const lastIndex = Math.max(0, data.length - 1);

  // Dominio restringido: slice real del Brush, o dominio completo por defecto.
  // En el timeline (eje categórico) el resultado son categorías [catStart,
  // catEnd]; la vista filtra además sus datos por ctx.zoomIndices.
  const xDomain: [number | string | "auto", number | string | "auto"] = zoom
    ? computeDomain(data, zoom, brushDataKey)
    : defaultXDomain;

  // Brush preconfigurado que viaja por ctx.brush. La vista lo inserta como
  // hijo directo de su chart (LineChart/ScatterChart) — Recharts NO renderiza
  // <Brush> como hermano del ResponsiveContainer (verificado en doc oficial).
  const brushElement = (
    <Brush
      dataKey={brushDataKey}
      height={28}
      travellerWidth={10}
      stroke="var(--border-strong)"
      fill="var(--bg-overlay)"
      startIndex={zoom?.start ?? 0}
      endIndex={zoom?.end ?? lastIndex}
      onChange={(r) => {
        if (!r) return;
        setZoom({ start: r.startIndex ?? 0, end: r.endIndex ?? lastIndex });
      }}
    />
  );

  const ctx: ChartDialogContext = useMemo(
    () => ({
      xDomain,
      zoomIndices: zoom,
      onPointClick: (modelId: string) => setFichaModelId(modelId),
      activeProviders,
      onToggleProvider: onToggle,
      brush: brushElement,
    }),
    // brushElement es estable por render (sin deps dinámicas más allá de
    // brushDataKey, lastIndex y zoom que ya están cubiertos); lo incluimos
    // en deps vía el cierre para que useMemo lo recalcule cuando zoom/data
    // cambien. Lo simplificamos listando las entradas reales.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [xDomain, zoom, activeProviders, onToggle, brushDataKey, lastIndex, data]
  );

  // Leyenda: pares únicos provider + color derivados de los puntos del gráfico
  // (ScatterProviderLegend deduplica por proveedor). `legendData` explícito
  // gana cuando la vista lo provee (timeline, WU3).
  const legendItems = useMemo(() => {
    if (legendData) return legendData;
    const map = new Map<
      string,
      { provider: string; color: string; z?: number | null }
    >();
    for (const row of data) {
      const provider = row["provider"];
      const color = row["color"];
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
        {/* Header del modal: título + subtítulo + reset + cierre + leyenda */}
        <div className="shrink-0 px-4 pt-3 pb-1 border-b border-[var(--border-strong)]">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
              {title}
            </DialogTitle>
            {/* Botón Reset: visible solo cuando hay zoom aplicado */}
            {zoom && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-[var(--text-secondary)]"
                onClick={() => setZoom(null)}
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            )}
            {/* Botón X — mismo estilo que ficha-tecnica-modal.tsx L139-145 */}
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

        {/* Gráfico ampliado — el contenedor flex-1 ocupa todo el espacio
            disponible; el Brush viaja por ctx.brush y la vista lo inserta
            DENTRO del chart (Recharts exige que <Brush> sea hijo de
            LineChart/ScatterChart, no hermano del ResponsiveContainer). */}
        <div className="flex-1 min-h-0 flex flex-col p-2">
          <div data-chart-id={chartId} className="h-[70vh] max-h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* Recharts exige un único ReactElement; la vista debe pasar exactamente
                  un gráfico (ScatterChart/LineChart). El contrato de props sigue
                  aceptando ReactNode por diseño. */}
              {renderChart(ctx) as ReactElement}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ficha técnica anidada — patrón tabla-view.tsx L443-448 */}
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
