"use client";

import { useMemo, useState } from "react";
import { useEffectiveDashboardData } from "@/hooks/use-effective-dashboard-data";
import { useDashboardStore } from "@/store/dashboard-store";
import { computeBlendedUsd, getIntelligenceColor } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ProviderLogo } from "../provider-logo";
import {
  Zap,
  Scale,
  Rocket,
  Brain,
  Gauge,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Compass,
  Info,
} from "lucide-react";
import type { AIModel } from "@/lib/types";

type Complexity = "simple" | "moderate" | "complex";

interface TierDef {
  id: "fast" | "medium" | "advanced";
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  priceFilter: (blended: number) => boolean;
  iiThreshold: number;
}

const TIERS: TierDef[] = [
  {
    id: "fast",
    label: "Rápido",
    icon: Zap,
    color: "var(--color-success)",
    bgColor: "var(--color-success-bg)",
    borderColor: "var(--color-success-border)",
    description: "Modelos económicos (<$1/M) para tareas simples y alta frecuencia",
    priceFilter: (b) => b < 1,
    iiThreshold: 0,
  },
  {
    id: "medium",
    label: "Medio",
    icon: Scale,
    color: "var(--color-warning)",
    bgColor: "var(--color-warning-bg)",
    borderColor: "var(--color-warning-border)",
    description: "Balance costo-calidad ($1–$15/M) con II≥35 para tareas moderadas",
    priceFilter: (b) => b >= 1 && b <= 15,
    iiThreshold: 35,
  },
  {
    id: "advanced",
    label: "Avanzado",
    icon: Rocket,
    color: "var(--color-indigo)",
    bgColor: "rgba(94, 106, 210, 0.12)",
    borderColor: "rgba(94, 106, 210, 0.25)",
    description: "Modelos premium (>$15/M) con II≥45 para tareas complejas",
    priceFilter: (b) => b > 15,
    iiThreshold: 45,
  },
];

const COMPLEXITY_TO_TIER: Record<Complexity, TierDef["id"]> = {
  simple: "fast",
  moderate: "medium",
  complex: "advanced",
};

export function GuiaDecisionView() {
  const { data, isLoading } = useEffectiveDashboardData();
  const { currency } = useDashboardStore();
  const currencyMeta = data?.currencies.find((c) => c.code === currency);
  // LIVE rate — never hardcode. PRD Módulo 8 line 1176.
  const rate = currencyMeta?.rateFromUsd ?? 1;
  const symbol = currencyMeta?.symbol ?? "$";
  const [complexity, setComplexity] = useState<Complexity>("moderate");
  const [contextTokens, setContextTokens] = useState(8000);

  // Auto-scaling: context >20K → upgrade complexity
  const autoScale = useMemo(() => {
    if (contextTokens > 20_000) {
      const order: Complexity[] = ["simple", "moderate", "complex"];
      const nextIdx = Math.min(order.indexOf(complexity) + 1, order.length - 1);
      return {
        upgraded: nextIdx > order.indexOf(complexity),
        effective: order[nextIdx],
      };
    }
    return { upgraded: false, effective: complexity };
  }, [complexity, contextTokens]);

  // Compute top models per tier (best II in each tier, max 3)
  const tierModels = useMemo(() => {
    if (!data) return { fast: [], medium: [], advanced: [] };
    const out: Record<TierDef["id"], AIModel[]> = {
      fast: [],
      medium: [],
      advanced: [],
    };
    for (const tier of TIERS) {
      out[tier.id] = data.models
        .filter((m) => {
          const blended = computeBlendedUsd(m);
          const ii = m.intelligenceIndex ?? 0;
          return (
            tier.priceFilter(blended) &&
            ii >= tier.iiThreshold &&
            m.active &&
            m.license !== "research-only"
          );
        })
        .sort((a, b) => (b.intelligenceIndex ?? 0) - (a.intelligenceIndex ?? 0))
        .slice(0, 3);
    }
    return out;
  }, [data]);

  // Recommended tier based on (effective) complexity
  const recommendedTier = COMPLEXITY_TO_TIER[autoScale.effective];

  // Savings calculation: always-route-to-advanced vs smart routing
  const savings = useMemo(() => {
    if (!data) return { advancedCost: 0, smartCost: 0, savingsPct: 0, savingsUsd: 0 };
    const advancedModels = data.models.filter((m) => {
      const b = computeBlendedUsd(m);
      return b > 15 && (m.intelligenceIndex ?? 0) >= 45;
    });
    const smartModel = tierModels[recommendedTier]?.[0];
    const advancedAvg =
      advancedModels.length === 0
        ? 0
        : advancedModels.reduce((s, m) => s + computeBlendedUsd(m), 0) /
          advancedModels.length;
    const smartCost = smartModel ? computeBlendedUsd(smartModel) : 0;
    const savingsUsd = Math.max(0, advancedAvg - smartCost);
    const savingsPct =
      advancedAvg === 0 ? 0 : (savingsUsd / advancedAvg) * 100;
    return {
      advancedCost: advancedAvg,
      smartCost,
      savingsPct,
      savingsUsd,
    };
  }, [data, tierModels, recommendedTier]);

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-32" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <header className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-[var(--brand-primary)]" />
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Guía de Decisión · Tiers de Costo-Calidad
          </h1>
          <Badge variant="outline" className="text-[10px] gap-1">
            <Info className="h-2.5 w-2.5" />
            Informativo
          </Badge>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Una referencia visual de los tres tiers de modelos (Rápido / Medio /
          Avanzado) según complejidad de tarea. Para una recomendación
          personalizada usa el <b>Recomendador</b>; para comparar modelos
          específicos lado a lado usa el <b>Comparador</b>.
        </p>
      </header>

      {/* Complexity + context inputs */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Gauge className="h-4 w-4 text-[var(--brand-primary)]" />
            Configuración de la tarea
          </CardTitle>
          <CardDescription className="text-xs">
            El motor ajusta automáticamente el tier según el contexto
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-xs">Complejidad de la tarea</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["simple", "moderate", "complex"] as Complexity[]).map((c) => {
                const active = complexity === c;
                return (
                  <button
                    key={c}
                    onClick={() => setComplexity(c)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? "bg-[var(--brand-primary-subtle)] border-[var(--brand-primary)] text-[var(--brand-primary)]"
                        : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {c === "simple" && "Simple"}
                    {c === "moderate" && "Moderada"}
                    {c === "complex" && "Compleja"}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-[var(--text-secondary)]">
              {complexity === "simple" &&
                "Tareas breves: clasificación, resumen corto, Q&A factual"}
              {complexity === "moderate" &&
                "Tareas estándar: redacción profesional, cálculos, análisis de documento medio"}
              {complexity === "complex" &&
                "Tareas avanzadas: razonamiento multi-paso, código complejo, análisis estratégico"}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs flex justify-between">
              <span>Contexto de la solicitud (tokens)</span>
              <span className="num text-[var(--text-primary)] font-semibold">
                {contextTokens.toLocaleString("es-PE")}
              </span>
            </Label>
            <input
              type="range"
              min={500}
              max={200_000}
              step={500}
              value={contextTokens}
              onChange={(e) => setContextTokens(Number(e.target.value))}
              className="w-full accent-[var(--brand-accent)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-disabled)]">
              <span>500</span>
              <span>200K</span>
            </div>
            {autoScale.upgraded ? (
              <div className="rounded-md border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-2.5 py-1.5 text-xs text-[var(--color-warning)] flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3" />
                Auto-escalado: contexto &gt;20K → sube a tier{" "}
                <b>{autoScale.effective}</b>
              </div>
            ) : (
              <div className="rounded-md border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-2.5 py-1.5 text-xs text-[var(--color-success)] flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                Tier sugerido: <b>{recommendedTier}</b> (sin escalamiento)
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Savings summary */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-success-bg)]">
              <TrendingDown className="h-5 w-5 text-[var(--color-success)]" />
            </span>
            <div>
              <div className="text-xs text-[var(--text-secondary)]">
                Ahorro vs siempre usar tier Avanzado
              </div>
              <div className="kpi-value num text-xl text-[var(--color-success)]">
                {savings.savingsPct.toFixed(0)}%
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-4">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                Costo Avanzado prom
              </div>
              <div className="num text-sm text-[var(--text-error)]">
                {symbol} {(savings.advancedCost * rate).toFixed(2)}/M
              </div>
            </div>
            <div className="text-[var(--text-disabled)]">→</div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                Costo smart routing
              </div>
              <div className="num text-sm text-[var(--color-success)]">
                {symbol} {(savings.smartCost * rate).toFixed(2)}/M
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                Ahorro /M
              </div>
              <div className="num text-sm font-semibold text-[var(--text-primary)]">
                {symbol} {(savings.savingsUsd * rate).toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((tier) => {
          const models = tierModels[tier.id];
          const isRecommended = tier.id === recommendedTier;
          const Icon = tier.icon;
          return (
            <Card
              key={tier.id}
              className="bg-[var(--bg-surface)] border-[var(--border-default)] relative overflow-hidden"
              style={{
                borderColor: isRecommended
                  ? tier.color
                  : "var(--border-default)",
                boxShadow: isRecommended
                  ? `0 0 0 2px ${tier.color}`
                  : "none",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: tier.color }}
              />
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: tier.bgColor }}
                    >
                      <Icon className="h-4 w-4" style={{ color: tier.color }} />
                    </span>
                    <div>
                      <CardTitle className="text-base">{tier.label}</CardTitle>
                      <CardDescription className="text-[10px]">
                        {tier.id === "fast" && "<$1/M · sin umbral II"}
                        {tier.id === "medium" && "$1–15/M · II≥35"}
                        {tier.id === "advanced" && ">$15/M · II≥45"}
                      </CardDescription>
                    </div>
                  </div>
                  {isRecommended && (
                    <Badge
                      className="text-[10px] text-white"
                      style={{ backgroundColor: tier.color }}
                    >
                      <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                      Recomendado
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                  {tier.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {models.length === 0 ? (
                  <div className="text-center text-xs text-[var(--text-disabled)] py-4 border border-dashed border-[var(--border-default)] rounded-lg">
                    Sin modelos en este tier
                  </div>
                ) : (
                  models.map((m, idx) => {
                    const blended = computeBlendedUsd(m);
                    // Phase 4A.3 — ZeroEval reliability dot + BenchLM superseded badge
                    const zeroevalReliability =
                      m.zeroevalFailureRate != null ? 1 - m.zeroevalFailureRate : null;
                    const relDotColor =
                      zeroevalReliability == null
                        ? null
                        : zeroevalReliability >= 0.95
                          ? "var(--color-success)"
                          : zeroevalReliability >= 0.85
                            ? "var(--color-warning)"
                            : "var(--color-error)";
                    const relDotLabel =
                      zeroevalReliability == null
                        ? null
                        : zeroevalReliability >= 0.95
                          ? "Confiabilidad alta"
                          : zeroevalReliability >= 0.85
                            ? "Confiabilidad media"
                            : "Confiabilidad baja";
                    return (
                      <div
                        key={m.id}
                        className="flex items-center gap-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] p-2.5"
                      >
                        <ProviderLogo model={m} size={28} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-[var(--text-primary)] truncate flex items-center gap-1.5">
                            <span className="truncate">{m.name}</span>
                            {relDotColor && relDotLabel && (
                              <span
                                className="inline-flex h-2 w-2 rounded-full shrink-0 cursor-help"
                                style={{ backgroundColor: relDotColor }}
                                role="img"
                                aria-label={`${relDotLabel}: ${(zeroevalReliability! * 100).toFixed(1)}% confiabilidad (${(m.zeroevalFailureRate! * 100).toFixed(1)}% failure rate, ${m.zeroevalTotalCalls ?? 0} llamadas)`}
                                title={`Confiabilidad ZeroEval: ${(zeroevalReliability! * 100).toFixed(1)}% (${(m.zeroevalFailureRate! * 100).toFixed(1)}% failure rate · ${m.zeroevalTotalCalls ?? 0} llamadas)`}
                              />
                            )}
                            {m.benchlmSupersededBy && (
                              <span
                                className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] leading-tight shrink-0 cursor-help"
                                style={{
                                  backgroundColor: "color-mix(in srgb, var(--color-warning) 12%, transparent)",
                                  color: "var(--color-warning)",
                                  border: "1px solid var(--color-warning-border)",
                                }}
                                role="img"
                                aria-label={`Reemplazado por ${m.benchlmSupersededByName ?? "modelo más nuevo"}`}
                                title={`→ ${m.benchlmSupersededByName ?? m.benchlmSupersededBy}`}
                              >
                                → {m.benchlmSupersededByName ?? "Reemplazado"}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[var(--text-secondary)]">
                            {m.provider}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="num text-xs font-semibold text-[var(--text-primary)]">
                            {blended === 0 ? "Gratis" : `$${blended.toFixed(2)}/M`}
                          </div>
                          {m.intelligenceIndex !== null && (
                            <div
                              className="num text-[10px]"
                              style={{
                                color: getIntelligenceColor(m.intelligenceIndex),
                              }}
                            >
                              II {m.intelligenceIndex}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* How it works — educational note */}
      <Card className="bg-[var(--bg-elevated)] border-[var(--border-default)]">
        <CardContent className="p-4 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
          <div className="flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
            <span className="font-medium text-[var(--text-primary)]">
              Cómo usar esta guía
            </span>
          </div>
          <p>
            Esta guía es <b>informativa</b>: muestra los tres tiers de modelos
            según precio blended (<b>Rápido</b> &lt;$1/M, <b>Medio</b> $1–$15/M
            con II≥35, <b>Avanzado</b> &gt;$15/M con II≥45) y te ayuda a
            entender en qué tier cae tu tarea según su complejidad. El
            <b> auto-escalado</b> sube un nivel si tu contexto excede 20K
            tokens. Para una recomendación específica basada en tu consulta y
            modo de operación, usa el <b>Recomendador</b> (motor HRE-TOPSIS
            completo con 5 capas).
          </p>
          <p className="text-[var(--text-disabled)] italic">
            Los precios y II mostrados se cargan en tiempo real desde la API
            (Artificial Analysis + LiteLLM). Ningún valor es estático.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
