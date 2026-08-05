"use client";

import { useMemo, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { Brush, ReferenceArea, ResponsiveContainer } from "recharts";
import { ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";
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
 * - `xDomain` al XAxis (dominio actual tras zoom; igual a default si no hay)
 * - `refArea` lo inserta como <ReferenceArea> dentro del chart (área visual
 *   de selección durante el drag). Recharts exige que ReferenceArea sea hijo
 *   directo del chart, por eso viaja por contexto, igual que el Brush antes.
 * - `onMouseDown`, `onMouseMove`, `onMouseUp` los engancha al chart via las
 *   props del mismo nombre del chart (LineChart/ScatterChart los soportan).
 * - `onPointClick` al click de puntos (ficha técnica).
 * - `activeProviders`/`onToggleProvider` para leyenda y opacidad.
 *
 * El eje Y nunca se toca: el zoom es exclusivo del eje X.
 */
export interface ChartDialogContext {
  /** Dominio actual del eje X (restablecido tras zoom; igual a default si no hay). */
  xDomain: [number | string | "auto", number | string | "auto"];
  /** Área de drag visual durante la selección (null si no hay drag activo).
   *  En modo "brush" siempre es null (no se usa ReferenceArea). */
  refArea: ReactNode;
  /** Elemento <Brush> para insertar como hijo del chart (solo modo "brush").
   *  En modo "drag" es null. Recharts exige que <Brush> sea hijo directo del
   *  chart, por eso viaja por contexto. */
  brush: ReactNode | null;
  onMouseDown: (e: any) => void;
  onMouseMove: (e: any) => void;
  /** mouseUp recibe el evento de Recharts (puede ser null). En modo "drag"
   *  se usa para distinguir click (< 5px) de drag (>= 5px). */
  onMouseUp: (e: any) => void;
  onPointClick: (modelId: string) => void;
  activeProviders: string[];
  onToggleProvider: (p: string) => void;
  /** True cuando hay zoom aplicado (muestra los botones de pan y reset). */
  isZoomed: boolean;
}

/** Resolución temporal del timeline (mismo conjunto de valores que AnalyticsView). */
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
  /** Render prop: la vista pasa su gráfico Recharts. */
  renderChart: (ctx: ChartDialogContext) => ReactNode;
  activeProviders: string[];
  onToggle: (p: string) => void;
  /**
   * Modo de interacción del zoom:
   * - "drag" (default): ReferenceArea + arrastrar sobre el gráfico.
   * - "brush": <Brush> nativo de Recharts como barra inferior del chart.
   * Mutuamente excluyentes; controla qué estado y handlers se exponen.
   */
  interactionMode?: "brush" | "drag";
  timeRes?: TimeResolution;
  onTimeResChange?: (r: TimeResolution) => void;
  legendData?: { provider: string; color: string; z?: number | null }[];
}

/** Tipo interno: dominio numérico o de string (categorías del timeline). */
type DomainValue = number | string;
type Domain = [DomainValue | "auto", DomainValue | "auto"];

/** True si el dominio es numérico (no categórico ni "auto"). */
function isNumericDomain(d: Domain | undefined): d is [number, number] {
  return (
    !!d &&
    d[0] !== "auto" &&
    d[1] !== "auto" &&
    typeof d[0] === "number" &&
    typeof d[1] === "number"
  );
}

/** Convierte un valor del eje (número o string) a número si es posible. */
function toNumber(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
  return null;
}

/**
 * ChartExpandDialog — modal de pantalla completa para explorar un gráfico.
 * Zoom por área arrastrable + paneo + reinicio. Sin Brush (Recharts no lo
 * renderiza de forma fiable en ScatterChart).
 *
 * Interacción:
 * 1. Click y arrastrar sobre el gráfico → área sombreada (ReferenceArea)
 *    marca la selección.
 * 2. Al soltar, si el rango seleccionado es significativo (> 5% del ancho
 *    total para numérico, o al menos 2 categorías para el timeline), se aplica
 *    el zoom por dominio.
 * 3. Botones de pan ←/→ desplazan la ventana 20% del ancho actual.
 * 4. Botón Reiniciar vuelve al dominio por defecto.
 *
 * El estado de zoom (zoomedDomain) se reinicia al cerrar el modal gracias
 * al montaje condicional ({open && <ChartExpandDialog .../>}) de las vistas.
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
  interactionMode = "drag",
  timeRes,
  onTimeResChange,
  legendData,
}: ChartExpandDialogProps) {
  /**
   * Dominio activo del eje X. null = no hay zoom, usar defaultXDomain.
   * Durante el arrastrar, los extremos se guardan en refAreaLeft/Right.
   */
  const [zoomedDomain, setZoomedDomain] = useState<Domain | null>(null);
  /** Marcadores del drag actual durante onMouseMove. Tipo mixto:
   * Eje numérico: numbers. Eje categórico: string (activeLabel). null = no arrastrando. */
  const [refAreaLeft, setRefAreaLeft] = useState<DomainValue | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<DomainValue | null>(null);
  const [fichaModelId, setFichaModelId] = useState<string | null>(null);

  /**
   * Ref con las coordenadas iniciales (en píxeles) del button-down sobre el
   * chart, en modo "drag". Se usa para distinguir un CLICK puro (sin
   * movimiento apreciable) de un DRAG real (arrastre desde un punto a otro).
   * - Click (< 5px): NO aplica zoom; limpia refAreaLeft/Right para que el
   *   onClick del <Cell> (toggleProvider) se dispare sin que quede un área
   *   visual de selección residual.
   * - Drag (>= 5px): aplica zoom vía applyZoomFromDrag() (que a su vez
   *   valida su propio umbral del 5% del dominio).
   * Se usa useRef (no state) para no disparar re-render en cada mousemove y
   * porque no afecta el render: solo vive entre mouseDown y mouseUp.
   * Solo aplica a interactionMode === "drag"; el modo "brush" no se toca.
   */
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  /**
   * Estado de zoom del Brush (modo "brush"). Indices [start, end] del array
   * data. INDEPENDIENTE del estado de drag (zoomedDomain) — no se mezclan.
   * - null = rango completo (sin zoom aplicado).
   * - Se pasa al Brush via startIndex/endIndex (controlado).
   * - Solo se usa cuando interactionMode === "brush"; en "drag" queda null.
   */
  const [zoom, setZoom] = useState<{ start: number; end: number } | null>(null);
  /** Último índice válido del array data (para el Brush y para detectar
   *  si el rango actual equivale al dominio completo). */
  const lastIndex = Math.max(0, data.length - 1);

  // Reset de zoom al cambiar la resolución temporal: el espacio de datos
  // cambia (reagrupación en la vista), un dominio viejo no tiene sentido.
  // (A diferencia del approach anterior con useEffect, esto se espera que
  // la vista lo propague re-mounte via key prop si fuera necesario; aquí
  // simplemente reiniciamos internamente si timeRes cambia.)
  // Para evitar imports de useEffect, asumimos que al cambiar timeRes la
  // vista desmonta y remonta el modal (patrón observado en analytics-view).

  /**
   * Dominio base actual: zoomed si hay zoom, sino defaultXDomain.
   * Recharts quiere [start,end] en escala numérica, o [catStart,catEnd]
   * para eje categórico (timeline). "auto" lo dejamos intacto.
   */
  const currentDomain: Domain =
    zoomedDomain ?? (defaultXDomain as Domain);

  /** true cuando hay un zoom aplicado ( guía botones de pan/reset).
   *  - modo "drag": zoomedDomain !== null (igual que antes).
   *  - modo "brush": zoom !== null y el rango no equivale al dominio
   *    completo (start=0 && end=lastIndex significa "sin zoom"). */
  const isZoomed =
    interactionMode === "brush"
      ? zoom !== null && !(zoom.start === 0 && zoom.end === lastIndex)
      : zoomedDomain !== null;

  /** Extremos mín/máx del dominio base (para validación y paneo numérico). */
  const baseBounds = useMemo(() => {
    // Solo válido para eje numérico. Para eje categórico, trabajaremos con
    // índices del array data (cada elemento tiene su categoría en xDataKey).
    if (!isNumericDomain(defaultXDomain as Domain)) {
      // Categórico: bounds = [índice 0, índice N-1] del array data
      return { isNumeric: false as const, lo: 0, hi: Math.max(0, data.length - 1) };
    }
    const [lo, hi] = defaultXDomain as [number, number];
    return { isNumeric: true as const, lo, hi };
  }, [defaultXDomain, data]);

  /** Ancho actual del viewport (para paneo). Numérico: hi-lo. Categórico: cantidad de índices. */
  const currentViewportWidth = useMemo(() => {
    if (!isNumericDomain(currentDomain)) {
      // Categórico: amount de categorías entre start y end
      // currentDomain puede ser ["auto","auto"] o [catStart, catEnd]
      // Para timeline siempre son strings de quarter
      const start = currentDomain[0];
      const end = currentDomain[1];
      const startIndex =
        typeof start === "string" ? data.findIndex((d) => d[xDataKey] === start) : 0;
      const endIndex =
        typeof end === "string"
          ? data.findIndex((d) => d[xDataKey] === end)
          : data.length - 1;
      return Math.max(1, endIndex - startIndex);
    }
    const [lo, hi] = currentDomain as [number, number];
    return Math.abs(hi - lo);
  }, [currentDomain, data, xDataKey]);

  /**
   * Aplica el zoom a partir del drag actual.
   * - Eje numérico: ordena [left,right] → nuevo dominio numérico.
   * - Eje categórico: traduce strings a índices y, si el rango tiene >= 2
   *   categorías, aplica [catStart, catEnd] como dominio categórico.
   * - Ignora drags triviales (< 5% numérico, o < 2 categorías).
   */
  const applyZoomFromDrag = () => {
    const left = refAreaLeft;
    const right = refAreaRight;
    setRefAreaLeft(null);
    setRefAreaRight(null);
    if (left === null || right === null || left === right) return;

    if (baseBounds.isNumeric) {
      const lN = toNumber(left);
      const rN = toNumber(right);
      if (lN === null || rN === null) return;
      const lo = Math.min(lN, rN);
      const hi = Math.max(lN, rN);
      const totalWidth = Math.abs(baseBounds.hi - baseBounds.lo);
      // Ignorar drag trivial: < 5% del total
      if (Math.abs(hi - lo) < totalWidth * 0.05) return;
      setZoomedDomain([lo, hi]);
    } else {
      // Categórico (timeline por quarter)
      const startIdx = data.findIndex((d) => d[xDataKey] === left);
      const endIdx = data.findIndex((d) => d[xDataKey] === right);
      if (startIdx === -1 || endIdx === -1) return;
      const loIdx = Math.min(startIdx, endIdx);
      const hiIdx = Math.max(startIdx, endIdx);
      // Ignorar drag trivial: < 2 categorías
      if (hiIdx - loIdx < 1) return;
      const startCat = data[loIdx]?.[xDataKey] as DomainValue;
      const endCat = data[hiIdx]?.[xDataKey] as DomainValue;
      if (startCat === undefined || endCat === undefined) return;
      setZoomedDomain([startCat, endCat]);
    }
  };

  /** Paneo horizontal: desplaza el viewport 20% del ancho actual. dir = -1 | +1. */
  const pan = (dir: -1 | 1) => {
    if (!isZoomed) return;
    if (!isNumericDomain(currentDomain)) {
      // Categórico: desplazamos por índices
      const startIdx = data.findIndex((d) => d[xDataKey] === currentDomain[0]);
      const endIdx = data.findIndex((d) => d[xDataKey] === currentDomain[1]);
      if (startIdx === -1 || endIdx === -1) return;
      const span = endIdx - startIdx;
      const offset = Math.max(1, Math.round(span * 0.2) * dir);
      const newStart = Math.max(0, startIdx + offset);
      const newEnd = Math.min(data.length - 1, endIdx + offset);
      if (newStart === startIdx) return; // no se puede pan más allá del borde
      const s = data[newStart]?.[xDataKey] as DomainValue;
      const e = data[newEnd]?.[xDataKey] as DomainValue;
      if (s !== undefined && e !== undefined) setZoomedDomain([s, e]);
      return;
    }
    // Numérico
    const [lo, hi] = currentDomain as [number, number];
    const span = hi - lo;
    const step = span * 0.2 * dir;
    let newLo = lo + step;
    let newHi = hi + step;
    // Respetar bounds del dominio base
    if (newLo < baseBounds.lo) {
      newLo = baseBounds.lo;
      newHi = newLo + span;
    }
    if (newHi > baseBounds.hi) {
      newHi = baseBounds.hi;
      newLo = newHi - span;
    }
    setZoomedDomain([newLo, newHi]);
  };

  /** Extrae el valor X del evento de Recharts (compatible numérico y categórico). */
  const extractX = (e: any): DomainValue | null => {
    // activeLabel = String para eje categórico (timeline). activeCoordinate.x = pixel.
    // Para numérico, Recharts expone activeLabel como String del valor. Preferimos
    // activeCoordinate.x que es el pixel, pero necesitamos el valor del dominio, no el
    // pixel. Recharts usa `e.activePayload[0].payload[xDataKey]` o `e.activeLabel`.
    if (!e) return null;
    // Categórico (timeline): activeLabel es la categoría String (ej. "2023-Q1")
    if (typeof e.activeLabel === "string") return e.activeLabel;
    // Numérico: activeLabel puede ser el valor como string
    const p = e.activePayload?.[0]?.payload;
    if (p && p[xDataKey] !== undefined) {
      const v = p[xDataKey];
      if (typeof v === "number" || typeof v === "string") return v as DomainValue;
    }
    // Fallback: activeCoordinate.x convertido a valor del dominio no es trivial,
    // así que si llegamos aquí, ignoramos
    return null;
  };

  const handleMouseDown = (e: any) => {
    // En modo "brush" no hacemos nada: el zoom vive en el Brush nativo.
    if (interactionMode === "brush") return;
    if (!e) return;
    // Guardar coordenadas iniciales del mouse en píxeles (Recharts expone
    // e.activeCoordinate?.x/y). Se usan en mouseUp para decidir click vs
    // drag. Si el evento no trae coordenadas (p. ej. el click cae fuera del
    // plot), no podemos medir el umbral, así que dejamos el ref en null y
    // seguimos el path histórico para no romper el zoom existente.
    const px = e.activeCoordinate?.x;
    const py = e.activeCoordinate?.y;
    if (typeof px === "number" && typeof py === "number") {
      dragStartRef.current = { x: px, y: py };
    } else {
      dragStartRef.current = null;
    }
    // Comportamiento histórico: marca el extremo inicial del área de drag.
    const x = extractX(e);
    if (x === null) return;
    setRefAreaLeft(x);
    setRefAreaRight(x);
  };

  const handleMouseMove = (e: any) => {
    // En modo "brush" no hacemos nada.
    if (interactionMode === "brush") return;
    if (refAreaLeft === null) return; // solo actualiza si está arrastrando
    const x = extractX(e);
    if (x === null) return;
    setRefAreaRight(x);
  };

  const handleMouseUp = (e: any) => {
    // En modo "brush" no hacemos nada.
    if (interactionMode === "brush") return;
    // Umbral de movimiento en píxeles para distinguir click de drag.
    // - >= 5px → DRAG → applyZoomFromDrag() (que tiene su propio umbral del
    //   5% del dominio y decide si el rango es significativo).
    // - < 5px → CLICK → NO aplica zoom. Limpia refAreaLeft/Right para que no
    //   quede área visual residual de selección. El onClick del <Cell>
    //   (toggleProvider) se dispara después naturalmente sobre el punto.
    const UMBRAL_PIX = 5;
    const start = dragStartRef.current;
    const px = e?.activeCoordinate?.x;
    const py = e?.activeCoordinate?.y;
    if (
      start !== null &&
      typeof px === "number" &&
      typeof py === "number"
    ) {
      const dx = px - start.x;
      const dy = py - start.y;
      const distancia = Math.sqrt(dx * dx + dy * dy);
      if (distancia < UMBRAL_PIX) {
        // Click puro: descartar selección y no aplicar zoom.
        setRefAreaLeft(null);
        setRefAreaRight(null);
        dragStartRef.current = null;
        return;
      }
    }
    // Side note: si start es null (sin coordenadas al hacer down), cae aquí
    // y conserva el comportamiento histórico (applyZoomFromDrag). Es lo más
    // seguro para no romper el zoom existente en casos atípicos.
    dragStartRef.current = null;
    applyZoomFromDrag();
  };

  // ReferenceArea para visualizar el arrastrar. x1 < x2 siempre (estético).
  // En modo "brush" siempre es null: no se usa ReferenceArea.
  const refArea: ReactNode =
    interactionMode === "brush"
      ? null
      : refAreaLeft !== null && refAreaRight !== null && refAreaLeft !== refAreaRight ? (
        <ReferenceArea
          x1={(refAreaLeft as any) <= (refAreaRight as any) ? refAreaLeft : refAreaRight}
          x2={(refAreaLeft as any) <= (refAreaRight as any) ? refAreaRight : refAreaLeft}
          strokeOpacity={0.4}
          fill="var(--brand-primary)"
          fillOpacity={0.18}
        />
      ) : null;

  /**
   * Brush nativo de Recharts (modo "brush"). Configuración recuperada del
   * commit 1a3aa99, donde funcionaba perfecto para el LineChart de Evolución.
   * Recharts EXIGE que <Brush> sea hijo directo del chart (no hermano del
   * ResponsiveContainer), por eso viaja por contexto para que la vista lo
   * inserte dentro de su <LineChart>.
   * El Brush controla la escala del eje X vía startIndex/endIndex sobre el
   * array data del chart; el dominio se recalcula solo. Estado controlado:
   * - s=0 && e=lastIndex → setZoom(null) (rango completo = sin zoom)
   * - otro rango → setZoom({start, end})
   * En modo "drag" es null.
   */
  const brush: ReactNode | null =
    interactionMode === "brush" ? (
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
          if (s === 0 && e === lastIndex) {
            setZoom(null);
          } else {
            setZoom({ start: s, end: e });
          }
        }}
      />
    ) : null;

  const ctx: ChartDialogContext = useMemo(
    () => ({
      xDomain: currentDomain as [number | string | "auto", number | string | "auto"],
      refArea,
      brush,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onPointClick: (modelId: string) => setFichaModelId(modelId),
      activeProviders,
      onToggleProvider: onToggle,
      isZoomed,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currentDomain,
      refAreaLeft,
      refAreaRight,
      brush,
      activeProviders,
      onToggle,
      isZoomed,
    ]
  );

  // Leyenda: explícita si viene, sino derivada de data (par provider + color)
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

  /** Reinicia el zoom según el modo activo.
   *  - modo "drag": limpia zoomedDomain (dominio completo).
   *  - modo "brush": limpia zoom → el Brush vuelve a [0, lastIndex] porque
   *    startIndex/endIndex derivan de zoom ?? 0/lastIndex. */
  const resetZoom = () => {
    if (interactionMode === "brush") {
      setZoom(null);
    } else {
      setZoomedDomain(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[90vw] !max-w-[90vw] xl:!max-w-[1400px] h-[85vh] max-h-[85vh] rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] shadow-[var(--shadow-high)] flex flex-col gap-0 p-0 overflow-hidden"
      >
        {/* Header: título + controles de zoom + cierre + leyenda + selector temporal */}
        <div className="shrink-0 px-4 pt-3 pb-1 border-b border-[var(--border-strong)]">
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
              {title}
            </DialogTitle>
            {/* Controles de zoom — visibles solo cuando hay zoom aplicado.
                En modo "brush" NO se muestran los botones de pan (el usuario
                arrastra las manijas del Brush directamente); el botón Reiniciar
                sí aparece en ambos modos. */}
            {isZoomed && (
              <div className="flex items-center gap-1 ml-2">
                {interactionMode !== "brush" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => pan(-1)}
                      title="Desplazar a la izquierda"
                      aria-label="Desplazar a la izquierda"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => pan(1)}
                      title="Desplazar a la derecha"
                      aria-label="Desplazar a la derecha"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
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
              </div>
            )}
            {/* Botón X de cierre */}
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
          {/* Hint de interacción cuando no hay zoom — distinto por modo */}
          {!isZoomed && (
            <div className="text-[10px] text-[var(--text-secondary)] opacity-70 mt-0.5">
              {interactionMode === "brush"
                ? "Arrastrá las manijas de la barra inferior para hacer zoom en el eje X"
                : "Click y arrastrar sobre el gráfico para hacer zoom en el eje X"}
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

        {/* Gráfico ampliado — el contexto inyecta ReferenceArea y onMouseDown
            onMouseMove onMouseUp que cada vista engancha a su chart Recharts. */}
        <div className="flex-1 min-h-0 flex flex-col p-2">
          <div data-chart-id={chartId} className="h-[70vh] max-h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* Recharts exige un único ReactElement; la vista debe pasar
                  exactamente un chart (LineChart/ScatterChart). */}
              {renderChart(ctx) as ReactElement}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ficha técnica anidada — patrón tabla-view.tsx */}
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
