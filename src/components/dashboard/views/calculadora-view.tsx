"use client";

import { useMemo, useState } from "react";
import { useEffectiveDashboardData } from "@/hooks/use-effective-dashboard-data";
import { useDashboardStore } from "@/store/dashboard-store";
import {
  getCurrencyByCode,
  computeBlendedUsd,
} from "@/lib/format";
import { ProviderLogo } from "../provider-logo";
import { LicenseBadge } from "../model-badges";
import { getEquivalence } from "@/lib/equivalences";
import {
  Calculator,
  Coins,
  Zap,
  TrendingUp,
  AlertTriangle,
  Database,
  Sparkles,
  Search,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// PRD Módulo 2 line 1032 — presets match the 4 PRD usage modes.
const USAGE_PRESETS = [
  { label: "Básico", input: 500_000, output: 150_000, desc: "5 personas, 50 cons/día" },
  { label: "Moderado", input: 2_500_000, output: 750_000, desc: "10 personas, 200 cons/día" },
  { label: "Intensivo", input: 10_000_000, output: 3_000_000, desc: "20 personas, 500 cons/día" },
  { label: "MYPE activa", input: 5_000_000, output: 1_500_000, desc: "Datos típicos metalmecánica" },
];

export function CalculadoraView() {
  const { data, isLoading } = useEffectiveDashboardData();
  const { currency } = useDashboardStore();

  const [inputTokens, setInputTokens] = useState(2_500_000);
  const [outputTokens, setOutputTokens] = useState(750_000);
  const [cacheEnabled, setCacheEnabled] = useState(false);
  const [cacheHitRate, setCacheHitRate] = useState(50);
  const [cacheQueries, setCacheQueries] = useState(5);
  // PRD Módulo 2 line 1040 — "Tabla de costos proyectados para todos los
  // modelos filtrados". The user also wants to pick a specific model to
  // see its detailed cost breakdown. selectedModelId drives the detail card.
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const currencyMeta = data ? getCurrencyByCode(data.currencies, currency) : null;
  const equiv = getEquivalence(currency);
  // Live rate — NEVER hardcode 3.714. PRD Módulo 8 line 1176.
  const rate = currencyMeta?.rateFromUsd ?? 1;
  // PRD line 1511-1513 — budget thresholds in PEN, converted to selected currency.
  const thresholdGreen = 200 * (currency === "PEN" ? 1 : rate);
  const thresholdYellow = 500 * (currency === "PEN" ? 1 : rate);

  const projections = useMemo(() => {
    if (!data) return [];
    const inputM = inputTokens / 1_000_000;
    const outputM = outputTokens / 1_000_000;

    return data.models
      .map((m) => {
        // Free models (verified $0 or freeAccess) have zero cost.
        const isFree = m.freeAccess === "free-100" || m.freeAccess === "free-limited" ||
          (m.priceInputUsd === 0 && m.priceOutputUsd === 0);
        if (m.priceInputUsd === null || m.priceOutputUsd === null) {
          // Unknown price — skip from projection table (can't compute cost).
          return null;
        }
        // Base monthly cost = input_tokens × input_price + output_tokens × output_price
        // PRD Módulo 2 line 1040.
        const baseCostUsd = m.priceInputUsd * inputM + m.priceOutputUsd * outputM;

        // Cache ROI: PRD line 1052-1053. cacheWriteCost = first query (pricier),
        // cacheHitCost = subsequent queries (much cheaper). Savings = normal - cached.
        let cacheSavingsUsd = 0;
        if (cacheEnabled && m.priceCacheHitUsd !== null && m.priceCacheWriteUsd !== null) {
          const cacheWriteCost = m.priceCacheWriteUsd * inputM;
          const cacheHitCost = m.priceCacheHitUsd * inputM * (cacheHitRate / 100);
          const normalCost = m.priceInputUsd * inputM;
          // Weighted average: 1 write + (queries-1) hits, divided by total queries.
          const cachedInputCost = cacheWriteCost + (cacheHitCost * (cacheQueries - 1)) / cacheQueries;
          cacheSavingsUsd = Math.max(0, normalCost - cachedInputCost);
        }

        const finalCostUsd = Math.max(0, baseCostUsd - cacheSavingsUsd);
        const costLocal = finalCostUsd * rate;
        const equivCount = equiv.price > 0 ? Math.round(costLocal / equiv.price) : 0;

        return {
          model: m,
          costUsd: finalCostUsd,
          costLocal,
          equivCount,
          cacheSavingsLocal: cacheSavingsUsd * rate,
          isFree,
          baseCostUsd,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => a.costLocal - b.costLocal);
  }, [data, inputTokens, outputTokens, cacheEnabled, cacheHitRate, cacheQueries, rate, equiv]);

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return projections;
    const q = search.toLowerCase();
    return projections.filter((p) =>
      p.model.name.toLowerCase().includes(q) ||
      p.model.provider.toLowerCase().includes(q)
    );
  }, [projections, search]);

  const selected = selectedModelId
    ? projections.find((p) => p.model.id === selectedModelId) ?? null
    : projections[0] ?? null;

  // PRD line 1511-1513 — alert based on the SELECTED model's cost (not cheapest).
  // If no model selected, use cheapest. Thresholds convert to selected currency.
  const alertModel = selected ?? projections[0];
  const alertLevel = useMemo(() => {
    if (!alertModel) return null;
    if (alertModel.costLocal > thresholdYellow) return { level: "red", cost: alertModel.costLocal };
    if (alertModel.costLocal > thresholdGreen) return { level: "yellow", cost: alertModel.costLocal };
    return { level: "green", cost: alertModel.costLocal };
  }, [alertModel, thresholdGreen, thresholdYellow]);

  if (isLoading || !data || !currencyMeta) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const EquivIcon = equiv.icon;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-[var(--brand-primary)]" />
        <h1 className="text-lg font-semibold tracking-tight">Calculadora de Costos</h1>
        <Badge variant="outline" className="ml-2 text-[10px]">
          TC: 1$ = {currencyMeta.symbol}{rate.toFixed(3)} · {currencyMeta.name}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inputs */}
        <Card className="lg:col-span-1 bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Parámetros de uso</CardTitle>
            <CardDescription className="text-xs">
              Estima tu volumen mensual de tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* PRD line 1037-1039 — presets */}
            <div className="space-y-1">
              <Label className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                Modo de uso (presets)
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {USAGE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setInputTokens(p.input);
                      setOutputTokens(p.output);
                    }}
                    title={p.desc}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs border transition-colors",
                      inputTokens === p.input
                        ? "bg-[var(--brand-primary-subtle)] border-[var(--brand-primary)] text-[var(--brand-primary)]"
                        : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs flex justify-between">
                <span>Tokens de entrada / mes</span>
                <span className="num text-[var(--text-primary)]">{inputTokens.toLocaleString("es-PE")}</span>
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
                <span className="num text-[var(--text-primary)]">{outputTokens.toLocaleString("es-PE")}</span>
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
            </div>

            <div className="rounded-lg bg-[var(--bg-elevated)] p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Equivalente en M tokens</span>
                <span className="num">{(inputTokens / 1_000_000).toFixed(2)}M in · {(outputTokens / 1_000_000).toFixed(2)}M out</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Ratio I/O</span>
                <span className="num">{(inputTokens / Math.max(1, outputTokens)).toFixed(1)} : 1</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Costo/mes si $1/M blended</span>
                <span className="num">{currencyMeta.symbol} {((inputTokens * 0.7 + outputTokens * 0.3) / 1_000_000 * rate).toFixed(2)}</span>
              </div>
            </div>

            {/* PRD line 1052-1053 — cache ROI toggle */}
            <div className="pt-3 border-t border-[var(--border-default)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-[var(--color-teal)]" />
                  <Label className="text-xs font-medium cursor-pointer">Activar caché</Label>
                </div>
                <Switch checked={cacheEnabled} onCheckedChange={setCacheEnabled} />
              </div>
              {cacheEnabled && (
                <div className="mt-3 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] flex justify-between">
                      <span>Cache hit rate</span>
                      <span className="num">{cacheHitRate}%</span>
                    </Label>
                    <input
                      type="range" min={10} max={90} step={5}
                      value={cacheHitRate}
                      onChange={(e) => setCacheHitRate(Number(e.target.value))}
                      className="w-full accent-[var(--color-teal)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] flex justify-between">
                      <span>Consultas sobre el mismo doc</span>
                      <span className="num">{cacheQueries}x</span>
                    </Label>
                    <input
                      type="range" min={2} max={20} step={1}
                      value={cacheQueries}
                      onChange={(e) => setCacheQueries(Number(e.target.value))}
                      className="w-full accent-[var(--color-teal)]"
                    />
                  </div>
                  <div className="rounded-md bg-[var(--color-info-bg)] border border-[var(--color-info-border)] px-2.5 py-1.5 text-[11px] text-[var(--color-info)]">
                    Con {cacheQueries}+ consultas sobre el mismo documento, activar caché ahorra en modelos que lo soportan.
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detail card for selected model + alert */}
        <div className="lg:col-span-2 space-y-4">
          {/* Alert */}
          {alertLevel && alertModel && (
            <div
              className={cn(
                "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
                alertLevel.level === "green" && "bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--color-success)]",
                alertLevel.level === "yellow" && "bg-[var(--color-warning-bg)] border-[var(--color-warning-border)] text-[var(--color-warning)]",
                alertLevel.level === "red" && "bg-[var(--color-error-bg)] border-[var(--color-error-border)] text-[var(--color-error)]"
              )}
            >
              {alertLevel.level === "red" ? <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> : <TrendingUp className="h-4 w-4 mt-0.5 shrink-0" />}
              <span>
                {alertLevel.level === "green" && `${alertModel.model.name}: ${currencyMeta.symbol} ${alertLevel.cost.toFixed(2)}/mes — dentro de presupuesto.`}
                {alertLevel.level === "yellow" && `${alertModel.model.name}: ${currencyMeta.symbol} ${alertLevel.cost.toFixed(2)}/mes — sobre S/. 200. Considera tier gratuito.`}
                {alertLevel.level === "red" && `${alertModel.model.name}: ${currencyMeta.symbol} ${alertLevel.cost.toFixed(2)}/mes — sobre S/. 500. Revisa alternativas más baratas abajo.`}
              </span>
            </div>
          )}

          {/* Selected model detail */}
          {selected && (
            <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Check className="h-4 w-4 text-[var(--color-success)]" />
                      Modelo seleccionado
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Costo detallado con tus parámetros actuales
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <ProviderLogo model={selected.model} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{selected.model.name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{selected.model.provider}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold num" style={selected.isFree ? { color: "var(--color-success)" } : undefined}>
                      {selected.isFree ? `${currencyMeta.symbol} 0.00` : `${currencyMeta.symbol} ${selected.costLocal.toFixed(2)}`}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)]">por mes</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-lg bg-[var(--bg-elevated)] p-2">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Input</div>
                    <div className="num font-medium">{currencyMeta.symbol} {((selected.model.priceInputUsd ?? 0) * rate).toFixed(2)}/M</div>
                  </div>
                  <div className="rounded-lg bg-[var(--bg-elevated)] p-2">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Output</div>
                    <div className="num font-medium">{currencyMeta.symbol} {((selected.model.priceOutputUsd ?? 0) * rate).toFixed(2)}/M</div>
                  </div>
                  <div className="rounded-lg bg-[var(--bg-elevated)] p-2">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Blended</div>
                    <div className="num font-medium">{currencyMeta.symbol} {(computeBlendedUsd(selected.model) * rate).toFixed(2)}/M</div>
                  </div>
                  <div className="rounded-lg bg-[var(--bg-elevated)] p-2">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Año</div>
                    <div className="num font-medium">{currencyMeta.symbol} {(selected.costLocal * 12).toFixed(2)}</div>
                  </div>
                </div>
                {!selected.isFree && selected.equivCount > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <EquivIcon className="h-3 w-3" />
                    Equivalente: <span className="num font-medium text-[var(--text-primary)]">{selected.equivCount} {equiv.label}</span>/mes
                  </div>
                )}
                {selected.cacheSavingsLocal > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--color-teal)]">
                    <Sparkles className="h-3 w-3" />
                    Ahorro caché: <span className="num font-medium">−{currencyMeta.symbol} {selected.cacheSavingsLocal.toFixed(2)}/mes</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* All models table — PRD line 1040 "todos los modelos filtrados" */}
          <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Todos los modelos · costo mensual</CardTitle>
                  <CardDescription className="text-xs">
                    Click en una fila para ver el detalle · {currencyMeta.symbol} {currencyMeta.name}
                  </CardDescription>
                </div>
                <div className="relative w-40 sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar…"
                    className="h-8 pl-8 text-xs bg-[var(--bg-elevated)]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[480px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
                    Sin modelos con precio disponible. {projections.length > 0 && "Prueba con otra búsqueda."}
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border-default)]">
                    {filtered.map((p, i) => {
                      const isSelected = selected?.model.id === p.model.id;
                      return (
                        <button
                          key={p.model.id}
                          onClick={() => setSelectedModelId(p.model.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left",
                            isSelected ? "bg-[var(--brand-primary-subtle)]" : "hover:bg-[var(--bg-overlay)]",
                            p.isFree && "bg-[var(--color-success-bg)]"
                          )}
                        >
                          <span className="num text-xs text-[var(--text-secondary)] w-6 shrink-0">#{i + 1}</span>
                          <ProviderLogo model={p.model} size={26} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{p.model.name}</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                              <LicenseBadge license={p.model.license} licenseName={p.model.licenseName} showLabel={false} />
                              {p.isFree && <span className="text-[var(--color-success)] font-medium">Gratis</span>}
                              {!p.isFree && p.cacheSavingsLocal > 0 && (
                                <span className="text-[var(--color-teal)] flex items-center gap-0.5">
                                  <Sparkles className="h-2.5 w-2.5" /> caché
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="num text-sm font-semibold" style={p.isFree ? { color: "var(--color-success)" } : undefined}>
                              {p.isFree ? `${currencyMeta.symbol} 0.00` : `${currencyMeta.symbol} ${p.costLocal.toFixed(2)}`}
                            </div>
                            <div className="text-[10px] text-[var(--text-secondary)]">/mes</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="h-3.5 w-3.5 text-[var(--color-warning)]" />
                  <span className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">Más barato con pago</span>
                </div>
                {(() => {
                  const paid = projections.find((p) => !p.isFree);
                  if (!paid) return <div className="text-sm text-[var(--text-secondary)] mt-2">Sin modelos de pago</div>;
                  return (
                    <>
                      <div className="text-xl font-bold num" style={{ color: "var(--color-success)" }}>
                        {currencyMeta.symbol} {paid.costLocal.toFixed(2)}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                        {paid.model.name} · /mes
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
            <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Coins className="h-3.5 w-3.5 text-[var(--color-success)]" />
                  <span className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">Mejor opción gratis</span>
                </div>
                {(() => {
                  const free = projections.find((p) => p.isFree);
                  if (!free) return <div className="text-sm text-[var(--text-secondary)] mt-2">No hay opciones 100% gratis</div>;
                  return (
                    <>
                      <div className="text-xl font-bold num" style={{ color: "var(--color-success)" }}>
                        {currencyMeta.symbol} 0.00
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                        {free.model.name}
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
