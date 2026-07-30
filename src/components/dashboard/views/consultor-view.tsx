"use client";

import { useMemo, useState } from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Search,
  Scale,
  ExternalLink,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  FileDown,
  GitCompareArrows,
} from "lucide-react";
import type { LicenseType } from "@/lib/types";
import { useDashboardStore } from "@/store/dashboard-store";

interface ProviderRow {
  provider: string;
  providerColor: string;
  modelCount: number;
  avgPriceUsd: number;
  avgII: number;
  openLicensePct: number;
  avgSpeed: number;
}

export function ConsultorView() {
  const { data, isLoading } = useDashboardData();
  const { setActiveView, compareIds } = useDashboardStore();
  const [search, setSearch] = useState("");

  const pivot = useMemo<ProviderRow[]>(() => {
    if (!data) return [];
    const groups = new Map<string, typeof data.models>();
    for (const m of data.models) {
      if (!groups.has(m.provider)) groups.set(m.provider, []);
      groups.get(m.provider)!.push(m);
    }
    const rows: ProviderRow[] = [];
    for (const [provider, models] of groups) {
      const withPrice = models.filter(
        (m) => m.priceInputUsd !== null && m.priceOutputUsd !== null
      );
      const blendedAvg =
        withPrice.length === 0
          ? 0
          : withPrice.reduce(
              (s, m) => s + (m.priceInputUsd! * 0.7 + m.priceOutputUsd! * 0.3),
              0
            ) / withPrice.length;
      const withII = models.filter((m) => m.intelligenceIndex !== null);
      const iiAvg =
        withII.length === 0
          ? 0
          : withII.reduce((s, m) => s + (m.intelligenceIndex ?? 0), 0) /
            withII.length;
      const openCount = models.filter(
        (m) =>
          m.license === "commercial-open" || m.license === "open-source-full"
      ).length;
      const withSpeed = models.filter((m) => m.speedTps !== null);
      const speedAvg =
        withSpeed.length === 0
          ? 0
          : withSpeed.reduce((s, m) => s + (m.speedTps ?? 0), 0) /
            withSpeed.length;
      rows.push({
        provider,
        providerColor: models[0]?.providerColor ?? "#8a8f98",
        modelCount: models.length,
        avgPriceUsd: blendedAvg,
        avgII: iiAvg,
        openLicensePct: (openCount / models.length) * 100,
        avgSpeed: speedAvg,
      });
    }
    return rows.sort((a, b) => b.modelCount - a.modelCount);
  }, [data]);

  const filteredPivot = useMemo(() => {
    if (!search.trim()) return pivot;
    const q = search.toLowerCase();
    return pivot.filter((p) => p.provider.toLowerCase().includes(q));
  }, [pivot, search]);

  // All HF tags across models, deduped
  const allTags = useMemo(() => {
    if (!data) return [];
    const tagSet = new Map<string, number>();
    for (const m of data.models) {
      for (const t of m.hfTags ?? []) {
        tagSet.set(t, (tagSet.get(t) ?? 0) + 1);
      }
    }
    return Array.from(tagSet.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [data]);

  const handleExportCSV = () => {
    if (!data) return;
    const headers = [
      "Provider",
      "Model Count",
      "Avg Blended Price (USD/M)",
      "Avg Intelligence Index",
      "% Open License",
      "Avg Speed (tok/s)",
    ];
    const lines = [headers.join(",")];
    for (const row of pivot) {
      lines.push(
        [
          `"${row.provider}"`,
          row.modelCount,
          row.avgPriceUsd.toFixed(2),
          row.avgII.toFixed(1),
          row.openLicensePct.toFixed(0),
          row.avgSpeed.toFixed(0),
        ].join(",")
      );
    }
    downloadCSV(lines.join("\n"), "consultor-pivot-providers.csv");
  };

  // gap #1 — PDF export (window.print with print-optimized layout, zero deps).
  // Includes the provider pivot, legal notes summary, and a statistical
  // confidence note explaining the Elo CI ± based on Arena AI votes.
  const handleExportPDF = () => {
    if (!data) return;
    const totalElo = data.models.filter((m) => m.elo !== null).length;
    const totalVotes = data.models.reduce((s, m) => s + (m.eloVotes ?? 0), 0);
    const withCi = data.models.filter((m) => m.eloCi !== null);
    const avgCi =
      withCi.length === 0
        ? 0
        : withCi.reduce((s, m) => s + (m.eloCi ?? 0), 0) / withCi.length;

    // Pivot table HTML
    const pivotRows = pivot
      .map(
        (r) => `<tr>
          <td>${escapeHtml(r.provider)}</td>
          <td class="num">${r.modelCount}</td>
          <td class="num">${r.avgPriceUsd === 0 ? "Gratis" : "$" + r.avgPriceUsd.toFixed(2) + "/M"}</td>
          <td class="num">${r.avgII.toFixed(1)}</td>
          <td class="num">${r.openLicensePct.toFixed(0)}%</td>
          <td class="num">${r.avgSpeed.toFixed(0)} tok/s</td>
        </tr>`
      )
      .join("");

    // Legal notes summary
    const licenseRows = [
      {
        title: "Comercial Libre",
        examples: "Apache 2.0, MIT, BSD, CC BY 4.0",
        canDo: "Uso comercial sin restricciones, modificar y distribuir, integrar en producto cerrado.",
        cantDo: "Quitar atribución al autor original, usar marcas registradas.",
      },
      {
        title: "Open Source Completo",
        examples: "Open weights + Apache 2.0 / MIT",
        canDo: "Descargar pesos, fine-tuning, servir localmente con Ollama, uso comercial.",
        cantDo: "Redistribuir sin aviso de cambios, usar marcas del proveedor.",
      },
      {
        title: "Condicional",
        examples: "Llama Community, Gemma Terms",
        canDo: "Uso comercial hasta 700M usuarios (Llama), modificar con aviso, servir en MYPE.",
        cantDo: "Usar marca implícita, superar 700M usuarios sin acuerdo.",
      },
      {
        title: "Solo API Pago",
        examples: "OpenAI, Anthropic, Google Pro, xAI",
        canDo: "Consumir vía API oficial, usar respuestas en producto propio, cachear outputs.",
        cantDo: "Descargar pesos, crear modelo competidor, revelar registros a terceros.",
      },
    ];
    const legalRowsHtml = licenseRows
      .map(
        (l) => `<tr>
          <td><strong>${l.title}</strong><br/><span class="muted">${l.examples}</span></td>
          <td>${l.canDo}</td>
          <td>${l.cantDo}</td>
        </tr>`
      )
      .join("");

    const contentHtml = `
      <h2>1. Tabla pivote por proveedor</h2>
      <p class="meta">${pivot.length} proveedores · ${data.models.length} modelos en catálogo · generado ${new Date(data.generatedAt).toLocaleString("es-PE")}</p>
      <table>
        <thead><tr>
          <th>Proveedor</th><th># Modelos</th><th>Precio prom</th><th>II prom</th><th>% Lic. abierta</th><th>Velocidad prom</th>
        </tr></thead>
        <tbody>${pivotRows}</tbody>
      </table>

      <h2>2. Notas legales por tipo de licencia</h2>
      <table>
        <thead><tr><th>Licencia</th><th>Permite</th><th>Restricciones</th></tr></thead>
        <tbody>${legalRowsHtml}</tbody>
      </table>

      <h2>3. Nota de confianza estadística</h2>
      <p>
        Las cifras de Elo (preferencia del usuario) provienen de <strong>Arena AI</strong> (LMSYS Chatbot Arena).
        Cada modelo rankeado presenta un <strong>intervalo de confianza ±${avgCi.toFixed(1)} puntos Elo</strong>
        basado en <strong>${totalVotes.toLocaleString("es-PE")} votos pareados</strong> distribuidos entre
        <strong> ${totalElo} modelos rankeados</strong>. Modelos con menos de 1.000 votos presentan IC más amplio
        (hasta ±30 puntos). La columna &quot;% Licencia abierta&quot; mide la proporción de modelos del proveedor
        con licencia Apache 2.0, MIT, BSD o pesos abiertos con licencia permisiva.
      </p>
      <p class="muted">
        Intelligence Index (II) es un compuesto de Artificial Analysis que agrega MMLU-Pro, GPQA, AIME y otros
        benchmarks estandarizados. Velocidad promedio en tokens/segundo medida a 25 °C ambiente, lote 1.
      </p>
    `;

    exportToPDF("Consultor Supply Chain — Tabla Pivote por Proveedor", contentHtml);
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-80" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Consultor Supply Chain · Tabla Pivote
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Compara proveedores con confianza estadística · exportable a CSV / PDF
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="border-[var(--border-strong)]"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Exportar CSV
          </Button>
          <Button
            onClick={handleExportPDF}
            variant="outline"
            size="sm"
            className="border-[var(--border-strong)]"
          >
            <FileDown className="h-3.5 w-3.5 mr-1" />
            Exportar PDF
          </Button>
        </div>
      </header>

      {/* Pivot table */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)] overflow-hidden">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-[var(--brand-primary)]" />
              Análisis comparativo por proveedor
            </CardTitle>
            <CardDescription className="text-xs">
              {pivot.length} proveedores · {data.models.length} modelos en catálogo
            </CardDescription>
          </div>
          <div className="relative w-44">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar proveedor…"
              className="h-8 pl-8 text-xs bg-[var(--bg-elevated)]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-[var(--border-default)]">
                  <TableHead className="text-[11px] uppercase tracking-wider">
                    Proveedor
                  </TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-wider">
                    # Modelos
                  </TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-wider">
                    Precio prom
                  </TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-wider">
                    II prom
                  </TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-wider">
                    % Licencia abierta
                  </TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-wider">
                    Velocidad prom
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPivot.map((row, idx) => (
                  <TableRow
                    key={`${row.provider}-${idx}`}
                    className="border-[var(--border-default)]"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: row.providerColor }}
                        />
                        <span className="font-medium text-[var(--text-primary)]">
                          {row.provider}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right num text-[var(--text-primary)]">
                      {row.modelCount}
                    </TableCell>
                    <TableCell className="text-right num">
                      <PriceCell usd={row.avgPriceUsd} />
                    </TableCell>
                    <TableCell className="text-right num">
                      <IICell ii={row.avgII} />
                    </TableCell>
                    <TableCell className="text-right">
                      <PercentBar pct={row.openLicensePct} />
                    </TableCell>
                    <TableCell className="text-right num text-[var(--text-secondary)]">
                      {row.avgSpeed.toFixed(0)} tok/s
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPivot.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-xs text-[var(--text-secondary)] py-6">
                      Sin coincidencias para "{search}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* gap #12 — Profile C Comparador link */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setActiveView("comparador")}
          className="border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary-subtle)]"
        >
          <GitCompareArrows className="h-4 w-4 mr-1.5" />
          Comparar modelos lado a lado
          {compareIds.length > 0 && (
            <Badge variant="outline" className="ml-2 text-[10px]">{compareIds.length}/4</Badge>
          )}
        </Button>
      </div>

      {/* Legal notes panel */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-[var(--color-warning)]" />
            Notas legales por tipo de licencia
          </CardTitle>
          <CardDescription className="text-xs">
            Lo que puedes y no puedes hacer con cada categoría · siempre validar el licenseName específico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <LicenseNote
              license="commercial-open"
              icon={ShieldCheck}
              color="var(--color-success)"
              title="Comercial Libre"
              examples="Apache 2.0, MIT, BSD, CC BY 4.0"
              canDo={[
                "Uso comercial sin restricciones",
                "Modificar y distribuir",
                "Integrar en producto cerrado",
                "Servir vía API propia o de terceros",
              ]}
              cantDo={[
                "Quitar atribución al autor original",
                "Usar marcas registradas del autor",
              ]}
            />
            <LicenseNote
              license="open-source-full"
              icon={ShieldCheck}
              color="var(--color-blue)"
              title="Open Source Completo"
              examples="Open weights + Apache 2.0 / MIT"
              canDo={[
                "Descargar pesos del modelo",
                "Fine-tuning para uso interno",
                "Servir localmente con Ollama",
                "Uso comercial",
              ]}
              cantDo={[
                "Redistribuir sin aviso de cambios (Apache)",
                "Usar marcas registradas del proveedor",
              ]}
            />
            <LicenseNote
              license="conditional"
              icon={ShieldAlert}
              color="var(--color-warning)"
              title="Condicional"
              examples="Llama Community, Gemma Terms"
              canDo={[
                "Uso comercial hasta 700M usuarios (Llama)",
                "Modificar y distribuir con aviso",
                "Servir en producción MYPE",
              ]}
              cantDo={[
                "Usar 'Built with Meta' implícito en marca",
                "Superar 700M usuarios sin acuerdo",
                "Retirar avisos de propiedad",
              ]}
            />
            <LicenseNote
              license="api-paid"
              icon={ShieldX}
              color="var(--color-error)"
              title="Solo API Pago"
              examples="OpenAI, Anthropic, Google Pro, xAI"
              canDo={[
                "Consumir vía API oficial",
                "Usar respuestas en producto propio",
                "Almacenar outputs en cache",
              ]}
              cantDo={[
                "Descargar pesos del modelo",
                "Crear modelo competidor con sus outputs",
                "Revelar registros del sistema a terceros",
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* HuggingFace tags */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <ExternalLink className="h-4 w-4 text-[var(--color-orange)]" />
            Tags de HuggingFace
          </CardTitle>
          <CardDescription className="text-xs">
            Click para abrir la búsqueda en HuggingFace Hub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(({ tag, count }) => (
              <a
                key={tag}
                href={`https://huggingface.co/models?other=${encodeURIComponent(tag)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors"
              >
                <span>#{tag}</span>
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 h-3.5 font-mono"
                >
                  {count}
                </Badge>
              </a>
            ))}
            {allTags.length === 0 && (
              <p className="text-xs text-[var(--text-secondary)]">
                No hay tags disponibles en el dataset actual.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PriceCell({ usd }: { usd: number }) {
  // Color-coded: green if < $1, yellow if < $10, red if > $30
  let color = "var(--text-primary)";
  if (usd === 0) color = "var(--color-success)";
  else if (usd < 1) color = "var(--color-success)";
  else if (usd < 10) color = "var(--color-warning)";
  else if (usd > 30) color = "var(--color-error)";
  return (
    <span style={{ color }}>
      {usd === 0 ? "Gratis" : `$${usd.toFixed(2)}/M`}
    </span>
  );
}

function IICell({ ii }: { ii: number }) {
  let color = "var(--text-secondary)";
  if (ii >= 50) color = "var(--color-indigo)";
  else if (ii >= 40) color = "var(--color-success)";
  else if (ii >= 30) color = "var(--color-warning)";
  else color = "var(--color-error)";
  return <span style={{ color }}>{ii.toFixed(1)}</span>;
}

function PercentBar({ pct }: { pct: number }) {
  const color =
    pct >= 75
      ? "var(--color-success)"
      : pct >= 40
        ? "var(--color-warning)"
        : "var(--color-error)";
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="w-16 h-1.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="num text-xs w-8 text-right" style={{ color }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

function LicenseNote({
  icon: Icon,
  color,
  title,
  examples,
  canDo,
  cantDo,
}: {
  license: LicenseType;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  title: string;
  examples: string;
  canDo: string[];
  cantDo: string[];
}) {
  return (
    <div
      className="rounded-lg border p-3"
      style={{
        borderColor: `color-mix(in srgb, ${color} 25%, var(--border-default))`,
        backgroundColor: `color-mix(in srgb, ${color} 5%, var(--bg-elevated))`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="font-medium text-sm text-[var(--text-primary)]">{title}</span>
      </div>
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
        {examples}
      </p>
      <div className="space-y-1">
        {canDo.map((d, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
            <span className="text-[var(--color-success)] mt-0.5">✓</span>
            <span>{d}</span>
          </div>
        ))}
        {cantDo.map((d, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
            <span className="text-[var(--color-error)] mt-0.5">✗</span>
            <span>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * gap #1 — PDF export helper (zero dependencies).
 * Opens a new window, writes a print-optimized HTML document (white background,
 * black text, proper table styling, page breaks), then triggers window.print().
 * After printing (or canceling) the new window is closed.
 */
export function exportToPDF(title: string, contentHtml: string) {
  if (typeof window === "undefined") return;
  const win = window.open("", "_blank");
  if (!win) {
    alert("Permití las ventanas emergentes para exportar a PDF.");
    return;
  }
  const ts = new Date().toLocaleString("es-PE");
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    @page { margin: 18mm 14mm; size: A4; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, sans-serif;
      color: #0b0c0e;
      background: #fff;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.45;
    }
    .header {
      border-bottom: 2px solid #0b0c0e;
      padding-bottom: 8px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .header h1 { font-size: 16pt; margin: 0; letter-spacing: -0.01em; }
    .header .ts { font-size: 9pt; color: #555; }
    h2 {
      font-size: 12pt;
      margin-top: 22px;
      margin-bottom: 8px;
      letter-spacing: -0.005em;
      page-break-after: avoid;
    }
    p.meta { font-size: 9pt; color: #555; margin: 2px 0 8px; }
    .muted { color: #555; font-size: 9pt; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      page-break-inside: avoid;
      margin-bottom: 12px;
    }
    th, td {
      border: 1px solid #c8ccd2;
      padding: 5px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f4f5f7;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.04em;
    }
    td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
    td.best { background: #e6f4ea !important; color: #1a7a3a; font-weight: 600; }
    td.worst { background: #fce8e6 !important; color: #a50e0e; }
    .best { color: #1a7a3a; font-weight: 600; }
    .worst { color: #a50e0e; }
    tr:nth-child(even) td { background: #fafbfc; }
    .footer {
      margin-top: 28px;
      padding-top: 8px;
      border-top: 1px solid #c8ccd2;
      font-size: 8pt;
      color: #777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(title)}</h1>
    <span class="ts">Generado: ${ts}</span>
  </div>
  ${contentHtml}
  <div class="footer">
    SelectIA · Consultor Supply Chain · Generado automáticamente · ${ts}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
        // Close after a short delay so the print dialog has time to render.
        setTimeout(function() { window.close(); }, 250);
      }, 200);
    };
  </script>
</body>
</html>`;
  win.document.open();
  win.document.write(html);
  win.document.close();
}
