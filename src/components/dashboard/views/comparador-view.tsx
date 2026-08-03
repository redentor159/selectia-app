"use client";

import { useMemo, useState } from "react";
import { useEffectiveDashboardData } from "@/hooks/use-effective-dashboard-data";
import { useDashboardStore } from "@/store/dashboard-store";
import {
  getCurrencyByCode,
  formatPrice,
  formatContext,
  formatVotes,
  computeBlendedUsd,
  getIntelligenceColor,
  getEloColor,
} from "@/lib/format";
import { recommend } from "@/lib/engine/hre-topsis";
import { ProviderLogo } from "../provider-logo";
import { LicenseBadge, FreeAccessBadge, CapabilityIcons } from "../model-badges";
import {
  GitCompareArrows,
  X,
  Trophy,
  Plus,
  Sparkles,
  Table2,
  Check,
  Minus,
  ExternalLink,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatMs } from "@/lib/format";
import { exportToPDF } from "@/lib/pdf-export";

export function ComparadorView() {
  const { data, isLoading } = useEffectiveDashboardData();
  const { compareIds, toggleCompare, clearCompare, currency, setActiveView } = useDashboardStore();
  const { toast } = useToast();
  const [winnerQuery, setWinnerQuery] = useState("");

  const currencyMeta = data ? getCurrencyByCode(data.currencies, currency) : null;

  const models = useMemo(() => {
    if (!data) return [];
    return compareIds
      .map((id) => data.models.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => !!m);
  }, [data, compareIds]);

  const radarData = useMemo(() => {
    if (models.length === 0) return [];
    const axes = [
      { key: "intelligenceIndex", label: "Inteligencia", max: 60 },
      { key: "codingIndex", label: "Coding", max: 80 },
      { key: "agenticIndex", label: "Agentic", max: 50 },
      { key: "speedTps", label: "Velocidad", max: 350 },
      { key: "elo", label: "Preferencia", max: 1550 },
      { key: "contextWindow", label: "Contexto", max: 2000000 },
    ];
    return axes.map((axis) => {
      const row: any = { axis: axis.label };
      models.forEach((m) => {
        const val = (m as any)[axis.key];
        row[m.name] = val !== null ? (val / axis.max) * 100 : 0;
      });
      return row;
    });
  }, [models]);

  const winner = useMemo(() => {
    if (!data || !winnerQuery.trim() || models.length < 2) return null;
    const result = recommend(winnerQuery, models, useDashboardStore.getState().operationMode);
    return result;
  }, [data, winnerQuery, models]);

  if (isLoading || !data || !currencyMeta) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4 text-[var(--brand-primary)]" />
          <h1 className="text-lg font-semibold tracking-tight">Comparador lado a lado</h1>
        </div>
        <Card className="bg-[var(--bg-surface)] border-dashed border-[var(--border-strong)]">
          <CardContent className="p-12 text-center">
            <GitCompareArrows className="h-10 w-10 mx-auto text-[var(--text-secondary)] mb-4" />
            <h3 className="text-base font-semibold mb-1">No hay modelos seleccionados</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-md mx-auto">
              Agrega modelos desde la Tabla Maestra usando el botón de comparar. Puedes comparar de 2 a 4 modelos.
            </p>
            <Button onClick={() => setActiveView("tabla")}>
              <Table2 className="h-4 w-4" />
              Ir a la Tabla Maestra
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics: { label: string; getValue: (m: typeof models[0]) => { value: string; raw: number | null; goodHigh?: boolean }; format?: (v: number) => string }[] = [
    {
      label: "Precio Input",
      getValue: (m) => ({ value: formatPrice(m.priceInputUsd, currencyMeta), raw: m.priceInputUsd, goodHigh: false }),
    },
    {
      label: "Precio Output",
      getValue: (m) => ({ value: formatPrice(m.priceOutputUsd, currencyMeta), raw: m.priceOutputUsd, goodHigh: false }),
    },
    {
      label: "Blended (70/30)",
      getValue: (m) => ({ value: computeBlendedUsd(m) === 0 ? "Gratis" : formatPrice(computeBlendedUsd(m), currencyMeta), raw: computeBlendedUsd(m) || 0.001, goodHigh: false }),
    },
    {
      label: "Contexto",
      getValue: (m) => ({ value: formatContext(m.contextWindow), raw: m.contextWindow, goodHigh: true }),
    },
    {
      label: "Intelligence Index",
      getValue: (m) => ({ value: m.intelligenceIndex?.toFixed(1) ?? "—", raw: m.intelligenceIndex, goodHigh: true }),
    },
    {
      label: "Coding Index",
      getValue: (m) => ({ value: m.codingIndex?.toFixed(1) ?? "—", raw: m.codingIndex, goodHigh: true }),
    },
    {
      label: "Agentic Index",
      getValue: (m) => ({ value: m.agenticIndex?.toFixed(1) ?? "—", raw: m.agenticIndex, goodHigh: true }),
    },
    {
      label: "Velocidad (tok/s)",
      getValue: (m) => ({ value: m.speedTps?.toString() ?? "—", raw: m.speedTps, goodHigh: true }),
    },
    // gap #9 — TTFT distinction for reasoning models. If ttftAnswerMs is
    // present AND meaningfully larger than ttftMs (the model “thinks” before
    // answering), render BOTH rows: "TTFT (pensar)" and "TTFT (responder)".
    // Otherwise, just show the single "TTFT" row as before.
    {
      label: "TTFT (pensar)",
      getValue: (m) => ({
        value: m.ttftMs !== null ? formatMs(m.ttftMs) : "—",
        raw: m.ttftMs,
        goodHigh: false,
      }),
    },
    {
      label: "TTFT (responder)",
      getValue: (m) => ({
        value:
          m.ttftAnswerMs !== null && m.ttftAnswerMs !== undefined
            ? formatMs(m.ttftAnswerMs)
            : (m.ttftMs !== null ? formatMs(m.ttftMs) : "—"),
        raw: m.ttftAnswerMs ?? m.ttftMs,
        goodHigh: false,
      }),
    },
    {
      label: "Elo Arena",
      getValue: (m) => ({ value: m.elo?.toString() ?? "—", raw: m.elo, goodHigh: true }),
    },
    {
      label: "Votos",
      getValue: (m) => ({ value: formatVotes(m.eloVotes), raw: m.eloVotes, goodHigh: true }),
    },
    {
      label: "Parámetros",
      getValue: (m) => ({ value: m.parameters ?? "—", raw: m.parameters ? 0 : null, goodHigh: true }),
    },
  ];

  // gap #1 — PDF export for the comparador (uses the shared exportToPDF
  // helper exported from consultor-view). Includes the side-by-side table
  // with best/worst highlighting and the "¿Cuál elegir?" recommendation.
  const handleExportPDF = () => {
    if (!data || models.length === 0) return;
    const headerCells = models
      .map((m) => `<th>${escapeHtmlLocal(m.name)}<br/><span class="muted">${escapeHtmlLocal(m.provider)}</span></th>`)
      .join("");
    const rowsHtml = metrics
      .map((metric) => {
        const values = models.map((m) => metric.getValue(m));
        const validVals = values.filter((v) => v.raw !== null).map((v) => v.raw!);
        const best =
          validVals.length > 0
            ? metric.getValue(models[0]).goodHigh
              ? Math.max(...validVals)
              : Math.min(...validVals)
            : null;
        const worst =
          validVals.length > 0
            ? metric.getValue(models[0]).goodHigh
              ? Math.min(...validVals)
              : Math.max(...validVals)
            : null;
        const cells = values
          .map((v) => {
            const isBest = v.raw !== null && v.raw === best && best !== worst;
            const isWorst = v.raw !== null && v.raw === worst && best !== worst && models.length > 1;
            const cls = isBest ? "best" : isWorst ? "worst" : "";
            const mark = isBest ? " &#10003;" : isWorst ? " &#8722;" : "";
            return `<td class="num ${cls}">${escapeHtmlLocal(v.value)}${mark}</td>`;
          })
          .join("");
        return `<tr><td>${escapeHtmlLocal(metric.label)}</td>${cells}</tr>`;
      })
      .join("");

    const winnerHtml =
      winner && winner.winners.length > 0
        ? `<h2>¿Cuál elegir?</h2>
           <p><strong>Ganador:</strong> ${escapeHtmlLocal(winner.winners[0].model.name)} (score ${winner.winners[0].score.toFixed(3)})</p>
           <p>${escapeHtmlLocal(winner.explanation)}</p>
           <p class="muted">Consulta: &quot;${escapeHtmlLocal(winnerQuery)}&quot; · ${winner.computationTimeMs}ms · categoría ${escapeHtmlLocal(winner.categoryLabel)}</p>`
        : "";

    const contentHtml = `
      <h2>Comparación lado a lado</h2>
      <p class="meta">${models.length} modelos · generado ${new Date(data.generatedAt).toLocaleString("es-PE")}</p>
      <table>
        <thead><tr><th>Métrica</th>${headerCells}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <p class="muted"><span class="best">✓ Mejor</span> · <span class="worst">− Peor</span> · Las celdas con un solo valor (sin marca) indican un único modelo o un empate.</p>
      ${winnerHtml}
    `;
    exportToPDF("Comparador de Modelos IA — Lado a Lado", contentHtml);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4 text-[var(--brand-primary)]" />
          <h1 className="text-lg font-semibold tracking-tight">Comparador lado a lado</h1>
          <Badge variant="outline" className="num">{models.length}/4</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-8 text-xs">
            <FileDown className="h-3.5 w-3.5" />
            Exportar PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={clearCompare} className="h-8 text-xs">
            <X className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Comparison table */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)]">
                <th className="text-left p-3 text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold sticky left-0 bg-[var(--bg-surface)] z-10 min-w-[140px]">
                  Métrica
                </th>
                {models.map((m) => (
                  <th key={m.id} className="p-3 text-left min-w-[180px]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <ProviderLogo model={m} size={28} />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{m.name}</div>
                          <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5">
                            {m.provider}
                            {m.slug && (
                              <a href={`https://artificialanalysis.ai/models/${m.slug}`} target="_blank" rel="noreferrer" className="text-[var(--brand-primary)] hover:underline" title="Ver en Artificial Analysis">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleCompare(m.id)}
                        className="text-[var(--text-secondary)] hover:text-[var(--color-error)] shrink-0"
                        title="Quitar"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, i) => {
                const values = models.map((m) => metric.getValue(m));
                const validVals = values.filter((v) => v.raw !== null).map((v) => v.raw!);
                const best = validVals.length > 0 ? (metric.getValue(models[0]).goodHigh ? Math.max(...validVals) : Math.min(...validVals)) : null;
                const worst = validVals.length > 0 ? (metric.getValue(models[0]).goodHigh ? Math.min(...validVals) : Math.max(...validVals)) : null;
                return (
                  <tr key={i} className="border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-overlay)]">
                    <td className="p-3 text-xs font-medium text-[var(--text-secondary)] sticky left-0 bg-[var(--bg-surface)]">
                      {metric.label}
                    </td>
                    {values.map((v, j) => {
                      const isBest = v.raw !== null && v.raw === best && best !== worst;
                      const isWorst = v.raw !== null && v.raw === worst && best !== worst && models.length > 1;
                      return (
                        <td key={j} className="p-3">
                          <span
                            className={cn(
                              "num text-sm inline-flex items-center gap-1",
                              isBest && "text-[var(--color-success)] font-semibold",
                              isWorst && "text-[var(--text-secondary)]"
                            )}
                          >
                            {isBest && <Check className="h-3 w-3" />}
                            {isWorst && <Minus className="h-3 w-3 opacity-50" />}
                            {v.value}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {/* Capabilities row */}
              <tr className="border-b border-[var(--border-default)] last:border-0">
                <td className="p-3 text-xs font-medium text-[var(--text-secondary)] sticky left-0 bg-[var(--bg-surface)]">
                  Capacidades
                </td>
                {models.map((m) => (
                  <td key={m.id} className="p-3"><CapabilityIcons model={m} /></td>
                ))}
              </tr>
              {/* License row */}
              <tr className="border-b border-[var(--border-default)] last:border-0">
                <td className="p-3 text-xs font-medium text-[var(--text-secondary)] sticky left-0 bg-[var(--bg-surface)]">
                  Licencia
                </td>
                {models.map((m) => (
                  <td key={m.id} className="p-3"><LicenseBadge license={m.license} licenseName={m.licenseName} /></td>
                ))}
              </tr>
              {/* Free access row */}
              <tr>
                <td className="p-3 text-xs font-medium text-[var(--text-secondary)] sticky left-0 bg-[var(--bg-surface)]">
                  Acceso
                </td>
                {models.map((m) => (
                  <td key={m.id} className="p-3"><FreeAccessBadge freeAccess={m.freeAccess} /></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Radar + "Which to choose" */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Radar de capacidades</CardTitle>
            <CardDescription className="text-xs">Normalizado 0-100% del máximo de cada eje</CardDescription>
          </CardHeader>
          <CardContent>
            <div data-chart-id="comparador-radar-capacidades">
            <ResponsiveContainer width="100%" height={320} debounce={50}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-default)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--text-secondary)", fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "var(--text-disabled)", fontSize: 9 }} stroke="var(--border-default)" />
                {models.map((m, i) => (
                  <Radar
                    key={m.id}
                    name={m.name}
                    dataKey={m.name}
                    stroke={m.providerColor}
                    fill={m.providerColor}
                    fillOpacity={0.15}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                ))}
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                {models.length <= 3 && <Legend wrapperStyle={{ fontSize: 10 }} />}
              </RadarChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[var(--brand-primary)]" />
              ¿Cuál elegir?
            </CardTitle>
            <CardDescription className="text-xs">
              Describe tu tarea y el motor HRE-TOPSIS decide entre los modelos comparados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <input
                value={winnerQuery}
                onChange={(e) => setWinnerQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && winnerQuery.trim()}
                placeholder="Ej: redactar correos profesionales…"
                className="flex-1 h-9 rounded-md border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 text-sm outline-none focus:border-[var(--brand-primary)]"
              />
              <Button
                size="sm"
                className="h-9 bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)]"
                disabled={!winnerQuery.trim() || models.length < 2}
              >
                Decidir
              </Button>
            </div>
            {winner && winner.winners.length > 0 && (
              <div className="rounded-lg border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[var(--color-warning)]" />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    Ganador: {winner.winners[0].model.name}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {winner.explanation}
                </p>
                <div className="text-[10px] text-[var(--text-disabled)] num">
                  Categoría: {winner.categoryLabel} · {winner.computationTimeMs}ms · Score: {winner.winners[0].score.toFixed(3)}
                </div>
              </div>
            )}
            {!winner && (
              <div className="text-xs text-[var(--text-secondary)] text-center py-4">
                Ingresa tu tarea para que el motor decida.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {models.length < 4 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setActiveView("tabla")}>
            <Plus className="h-4 w-4" />
            Agregar más modelos ({models.length}/4)
          </Button>
        </div>
      )}
    </div>
  );
}

// Local HTML-escape for the PDF export builder (the consultor-view helper
// `exportToPDF` accepts pre-built HTML strings; we sanitize cell content here
// to prevent stray < > & characters from breaking the print document).
function escapeHtmlLocal(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
