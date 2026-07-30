"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useDashboardStore } from "@/store/dashboard-store";
import { computeBlendedUsd, getCurrencyByCode } from "@/lib/format";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProviderLogo } from "../provider-logo";
import { LicenseBadge, FreeAccessBadge } from "../model-badges";
import {
  Download,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AlertLevel = "green" | "yellow" | "red";

export function ComprasView() {
  const { data, isLoading } = useDashboardData();
  const { currency } = useDashboardStore();

  // Budget slider in PEN (base currency for thresholds per PRD line 1511-1513).
  // Display converts to selected currency via live rate.
  const [budgetPen, setBudgetPen] = useState(500);
  const [inputTokens, setInputTokens] = useState(2_000_000);
  const [outputTokens, setOutputTokens] = useState(500_000);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null); // S/.5 quick filter
  const [search, setSearch] = useState("");

  const currencyMeta = useMemo(
    () => (data ? getCurrencyByCode(data.currencies, currency) : null),
    [data, currency]
  );
  // LIVE rate — never hardcode 3.714. PRD Módulo 8 line 1176.
  const rate = currencyMeta?.rateFromUsd ?? 1;
  const budgetLocal = budgetPen * (currency === "PEN" ? 1 : rate);

  // PRD line 407 — "los 5 modelos más baratos" + table of ALL models with costs.
  // Compute projected cost for EVERY model that has a price. Free models = 0.
  const allModelsWithCost = useMemo(() => {
    if (!data) return [];
    const inputM = inputTokens / 1_000_000;
    const outputM = outputTokens / 1_000_000;
    return data.models
      .filter((m) => m.active)
      .map((m) => {
        const isFree =
          m.freeAccess === "free-100" ||
          m.freeAccess === "free-limited" ||
          (m.priceInputUsd === 0 && m.priceOutputUsd === 0);
        let costUsd = 0;
        if (!isFree && m.priceInputUsd !== null && m.priceOutputUsd !== null) {
          costUsd = m.priceInputUsd * inputM + m.priceOutputUsd * outputM;
        }
        const costLocal = costUsd * rate;
        return {
          model: m,
          costUsd,
          costLocal,
          isFree,
          blendedUsd: computeBlendedUsd(m),
          blendedLocal: computeBlendedUsd(m) * rate,
          inputLocal: (m.priceInputUsd ?? 0) * rate,
          outputLocal: (m.priceOutputUsd ?? 0) * rate,
        };
      })
      .sort((a, b) => a.costLocal - b.costLocal);
  }, [data, inputTokens, outputTokens, rate]);

  // PRD line 423 — quick filter "solo modelos bajo S/.5 / millón de tokens"
  const filtered = useMemo(() => {
    let list = allModelsWithCost;
    if (maxPriceFilter !== null) {
      list = list.filter((r) => r.isFree || r.blendedLocal <= maxPriceFilter * (currency === "PEN" ? 1 : rate));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.model.name.toLowerCase().includes(q) || r.model.provider.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allModelsWithCost, maxPriceFilter, search, currency, rate]);

  const top5 = filtered.slice(0, 5);
  const underBudget = filtered.filter((r) => r.costLocal <= budgetLocal);
  const overBudget = filtered.filter((r) => r.costLocal > budgetLocal);

  // PRD line 1511-1513 — alert based on cheapest model cost vs S/.200/S/.500 thresholds.
  const cheapest = allModelsWithCost[0];
  const alertLevel: AlertLevel = useMemo(() => {
    if (!cheapest) return "red";
    // Convert thresholds to selected currency
    const tGreen = 200 * (currency === "PEN" ? 1 : rate);
    const tYellow = 500 * (currency === "PEN" ? 1 : rate);
    if (cheapest.costLocal > tYellow) return "red";
    if (cheapest.costLocal > tGreen) return "yellow";
    return "green";
  }, [cheapest, currency, rate]);

  if (isLoading || !data || !currencyMeta) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-72" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Find 3 cheaper alternatives for red alert (PRD line 1513)
  const cheaperAlternatives = cheapest
    ? allModelsWithCost.filter((r) => r.costLocal < cheapest.costLocal && !r.isFree).slice(0, 3)
    : [];

  return (
    <div className="space-y-5 animate-fade-in">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          Compras · Calculadora de Presupuesto
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Estima costo mensual por modelo · {currencyMeta.symbol} {currencyMeta.name} · TC: 1$ = {currencyMeta.symbol}{rate.toFixed(3)}
        </p>
      </header>

      {/* Budget calculator inputs */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-[var(--color-success)]" />
            Parámetros de presupuesto
          </CardTitle>
          <CardDescription className="text-xs">
            Ajusta los sliders para ver qué modelos caben en tu presupuesto mensual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs flex justify-between">
                <span>Presupuesto mensual (S/.)</span>
                <span className="num text-[var(--text-primary)] font-semibold">
                  {currencyMeta.symbol} {budgetLocal.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
                </span>
              </Label>
              <input
                type="range"
                min={0}
                max={5000}
                step={50}
                value={budgetPen}
                onChange={(e) => setBudgetPen(Number(e.target.value))}
                className="w-full accent-[var(--brand-accent)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-disabled)]">
                <span>{currencyMeta.symbol} 0</span>
                <span>{currencyMeta.symbol} {(5000 * (currency === "PEN" ? 1 : rate)).toLocaleString("es-PE", { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs flex justify-between">
                <span>Tokens de entrada / mes</span>
                <span className="num text-[var(--text-primary)] font-semibold">
                  {inputTokens.toLocaleString("es-PE")} ({(inputTokens / 1_000_000).toFixed(2)}M)
                </span>
              </Label>
              <input
                type="range"
                min={100_000}
                max={50_000_000}
                step={100_000}
                value={inputTokens}
                onChange={(e) => setInputTokens(Number(e.target.value))}
                className="w-full accent-[var(--brand-accent)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-disabled)]">
                <span>100K</span><span>50M</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs flex justify-between">
                <span>Tokens de salida / mes</span>
                <span className="num text-[var(--text-primary)] font-semibold">
                  {outputTokens.toLocaleString("es-PE")} ({(outputTokens / 1_000_000).toFixed(2)}M)
                </span>
              </Label>
              <input
                type="range"
                min={30_000}
                max={15_000_000}
                step={30_000}
                value={outputTokens}
                onChange={(e) => setOutputTokens(Number(e.target.value))}
                className="w-full accent-[var(--brand-accent)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-disabled)]">
                <span>30K</span><span>15M</span>
              </div>
            </div>
          </div>

          {/* PRD line 423 — quick filter button */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">Filtro rápido:</span>
            <button
              onClick={() => setMaxPriceFilter(maxPriceFilter === 5 ? null : 5)}
              className={cn(
                "rounded-full px-3 py-1 text-xs border transition-colors",
                maxPriceFilter === 5
                  ? "bg-[var(--brand-primary-subtle)] border-[var(--brand-primary)] text-[var(--brand-primary)]"
                  : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Solo bajo {currencyMeta.symbol} 5/M
            </button>
            <button
              onClick={() => setMaxPriceFilter(null)}
              className={cn(
                "rounded-full px-3 py-1 text-xs border transition-colors",
                maxPriceFilter === null
                  ? "bg-[var(--brand-primary-subtle)] border-[var(--brand-primary)] text-[var(--brand-primary)]"
                  : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Todos
            </button>
            <div className="relative w-40 sm:w-56 ml-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar modelo…"
                className="h-8 pl-8 text-xs bg-[var(--bg-elevated)]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget alert — PRD line 1511-1513 */}
      <div
        className={cn(
          "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
          alertLevel === "green" && "bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--color-success)]",
          alertLevel === "yellow" && "bg-[var(--color-warning-bg)] border-[var(--color-warning-border)] text-[var(--color-warning)]",
          alertLevel === "red" && "bg-[var(--color-error-bg)] border-[var(--color-error-border)] text-[var(--color-error)]"
        )}
      >
        {alertLevel === "red" ? <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> : <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />}
        <span>
          {alertLevel === "green" && `Modelo más barato: ${cheapest?.model.name ?? "—"} a ${currencyMeta.symbol} ${cheapest?.costLocal.toFixed(2)}/mes — dentro de presupuesto.`}
          {alertLevel === "yellow" && `${cheapest?.model.name}: ${currencyMeta.symbol} ${cheapest?.costLocal.toFixed(2)}/mes — sobre ${currencyMeta.symbol} ${(200 * (currency === "PEN" ? 1 : rate)).toFixed(0)}. Considera tier gratuito.`}
          {alertLevel === "red" && `Modelo más barato: ${currencyMeta.symbol} ${cheapest?.costLocal.toFixed(2)}/mes — sobre ${currencyMeta.symbol} ${(500 * (currency === "PEN" ? 1 : rate)).toFixed(0)}. Alternativas más baratas abajo.`}
        </span>
      </div>

      {/* PRD line 407 — "los 5 modelos más baratos" */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top 5 modelos más baratos</CardTitle>
          <CardDescription className="text-xs">
            Con tu uso de {inputTokens.toLocaleString("es-PE")} in + {outputTokens.toLocaleString("es-PE")} out tokens/mes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {top5.map((item, i) => (
            <div
              key={item.model.id}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5",
                i === 0 ? "bg-[var(--color-success-bg)] border border-[var(--color-success-border)]" : "hover:bg-[var(--bg-overlay)]"
              )}
            >
              <span className="num text-xs text-[var(--text-secondary)] w-5">#{i + 1}</span>
              <ProviderLogo model={item.model} size={28} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.model.name}</div>
                <div className="text-[11px] text-[var(--text-secondary)]">{item.model.provider}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="num text-sm font-semibold" style={item.isFree ? { color: "var(--color-success)" } : undefined}>
                  {item.isFree ? `${currencyMeta.symbol} 0.00` : `${currencyMeta.symbol} ${item.costLocal.toFixed(2)}`}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">/mes</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* PRD line 415 — full table with cost columns, ALL models */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Todos los modelos · tabla de costos</CardTitle>
              <CardDescription className="text-xs">
                {filtered.length} modelos · {underBudget.length} dentro / {overBudget.length} sobre presupuesto
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() =>
                exportBudgetExcel(filtered, {
                  budget: budgetLocal,
                  inputTokens,
                  outputTokens,
                  currency: currencyMeta.code,
                  rate,
                  symbol: currencyMeta.symbol,
                })
              }
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Exportar Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10 bg-[var(--bg-surface)] border-b border-[var(--border-default)]">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium text-[var(--text-secondary)]">MODELO</th>
                  <th className="px-3 py-2 font-medium text-[var(--text-secondary)] text-right">INPUT {currencyMeta.symbol}/M</th>
                  <th className="px-3 py-2 font-medium text-[var(--text-secondary)] text-right">OUTPUT {currencyMeta.symbol}/M</th>
                  <th className="px-3 py-2 font-medium text-[var(--text-secondary)] text-right">BLENDED {currencyMeta.symbol}/M</th>
                  <th className="px-3 py-2 font-medium text-[var(--text-secondary)] text-right">COSTO/MES</th>
                  <th className="px-3 py-2 font-medium text-[var(--text-secondary)] text-center">TIER</th>
                  <th className="px-3 py-2 font-medium text-[var(--text-secondary)] text-center">PRESUP.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const isUnder = item.costLocal <= budgetLocal;
                  return (
                    <tr key={item.model.id} className="border-b border-[var(--border-default)] hover:bg-[var(--bg-overlay)]">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <ProviderLogo model={item.model} size={22} />
                          <div className="min-w-0">
                            <div className="font-medium truncate max-w-[200px]">{item.model.name}</div>
                            <div className="text-[10px] text-[var(--text-secondary)]">{item.model.provider}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right num">
                        {item.isFree ? "—" : `${currencyMeta.symbol} ${item.inputLocal.toFixed(2)}`}
                      </td>
                      <td className="px-3 py-2 text-right num">
                        {item.isFree ? "—" : `${currencyMeta.symbol} ${item.outputLocal.toFixed(2)}`}
                      </td>
                      <td className="px-3 py-2 text-right num">
                        {item.isFree ? "Gratis" : `${currencyMeta.symbol} ${item.blendedLocal.toFixed(2)}`}
                      </td>
                      <td className="px-3 py-2 text-right num font-semibold" style={item.isFree ? { color: "var(--color-success)" } : undefined}>
                        {item.isFree ? `${currencyMeta.symbol} 0.00` : `${currencyMeta.symbol} ${item.costLocal.toFixed(2)}`}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <FreeAccessBadge freeAccess={item.model.freeAccess} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        {isUnder ? (
                          <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-[var(--color-error)] inline" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * REAL .xlsx export using SheetJS. Two sheets: "Top 5" and "Todos los modelos".
 * Header rows with budget parameters for context.
 */
function exportBudgetExcel(
  items: {
    model: any;
    costUsd: number;
    costLocal: number;
    isFree: boolean;
    blendedUsd: number;
    blendedLocal: number;
    inputLocal: number;
    outputLocal: number;
  }[],
  params: {
    budget: number;
    inputTokens: number;
    outputTokens: number;
    currency: string;
    rate: number;
    symbol: string;
  }
) {
  const headerRows: (string | number)[][] = [
    ["Parámetro", "Valor"],
    ["Presupuesto mensual", `${params.symbol} ${params.budget.toFixed(2)}`],
    ["Tokens de entrada / mes", params.inputTokens],
    ["Tokens de salida / mes", params.outputTokens],
    ["Moneda", params.currency],
    ["Tasa USD→moneda", params.rate.toFixed(4)],
    ["Generado", new Date().toLocaleString("es-PE")],
    [],
  ];

  const tableHeader = [
    "Modelo",
    "Proveedor",
    "Licencia",
    `Precio Input (${params.symbol}/M)`,
    `Precio Output (${params.symbol}/M)`,
    `Blended (${params.symbol}/M)`,
    `Costo Mensual (${params.symbol})`,
    "Tier",
  ];

  const toRow = (it: (typeof items)[number]) => [
    it.model.name,
    it.model.provider,
    it.model.licenseName ?? it.model.license,
    it.isFree ? 0 : Number(it.inputLocal.toFixed(4)),
    it.isFree ? 0 : Number(it.outputLocal.toFixed(4)),
    it.isFree ? 0 : Number(it.blendedLocal.toFixed(4)),
    it.isFree ? 0 : Number(it.costLocal.toFixed(2)),
    it.isFree ? "Gratis" : it.model.freeAccess ?? "paid",
  ];

  const allRows = [tableHeader, ...items.map(toRow)];
  const wsAll = XLSX.utils.aoa_to_sheet([...headerRows, ...allRows]);
  const wsTop = XLSX.utils.aoa_to_sheet([
    ...headerRows,
    tableHeader,
    ...items.slice(0, 5).map(toRow),
  ]);

  // Column widths
  wsAll["!cols"] = [{ wch: 40 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 }];
  wsTop["!cols"] = wsAll["!cols"];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTop, "Top 5 más baratos");
  XLSX.utils.book_append_sheet(wb, wsAll, "Todos los modelos");
  XLSX.writeFile(wb, "presupuesto-IA.xlsx");
}
