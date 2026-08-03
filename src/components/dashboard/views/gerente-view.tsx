"use client";

import { useMemo } from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useDashboardStore, PROFILES } from "@/store/dashboard-store";
import { recommend } from "@/lib/engine/hre-topsis";
import {
  getCurrencyByCode,
  computeBlendedUsd,
  formatPrice,
  getIntelligenceColor,
  getEloColor,
} from "@/lib/format";
import { ProviderLogo } from "../provider-logo";
import { LicenseBadge } from "../model-badges";
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
import {
  DollarSign,
  CalendarDays,
  ShieldCheck,
  Brain,
  Trophy,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList,
} from "recharts";

export function GerenteView() {
  const { data, isLoading } = useDashboardData();
  const { currency, operationMode, setActiveView, setRecommendationQuery } =
    useDashboardStore();
  const currentProfile = PROFILES.find((p) => p.id === "B")!;

  const currencyMeta = data ? getCurrencyByCode(data.currencies, currency) : null;

  const kpis = useMemo(() => {
    if (!data) return null;
    const models = data.models;
    const active = models.filter((m) => m.active);

    // Monthly cost: assume 5M input + 1.5M output blended for a mid-size team
    const monthlyUsageInput = 5_000_000;
    const monthlyUsageOutput = 1_500_000;
    const monthlyCostUsd = active.reduce((sum, m) => {
      const blended = computeBlendedUsd(m);
      // Assume each model contributes proportional to a typical mix
      return sum + blended * (monthlyUsageInput / 1_000_000);
    }, 0) / active.length; // average monthly cost per model if used as primary

    const annualCostUsd = monthlyCostUsd * 12;

    const commercialLicenseCount = active.filter(
      (m) =>
        m.license === "commercial-open" || m.license === "open-source-full"
    ).length;

    const mostIntelligent = [...active]
      .filter((m) => m.intelligenceIndex !== null)
      .sort((a, b) => (b.intelligenceIndex ?? 0) - (a.intelligenceIndex ?? 0))[0];

    return {
      monthlyCostUsd,
      annualCostUsd,
      commercialLicenseCount,
      commercialLicensePct: (commercialLicenseCount / active.length) * 100,
      mostIntelligent,
      totalModels: active.length,
    };
  }, [data]);

  const scatterData = useMemo(() => {
    if (!data) return [];
    return data.models
      .filter(
        (m) =>
          m.intelligenceIndex !== null &&
          (m.priceInputUsd !== null || m.freeAccess === "free-100")
      )
      .map((m) => {
        const blended = computeBlendedUsd(m) || 0.01;
        return {
          x: Math.log10(blended), // pre-compute log10 — Recharts log scale is buggy
          y: m.intelligenceIndex,
          rawPrice: blended,
          z: m.speedTps ?? 50,
          name: m.name,
          provider: m.provider,
          color: m.providerColor || "#5e6ad2",
          free: m.freeAccess === "free-100" || blended === 0,
        };
      });
  }, [data]);

  const eloData = useMemo(() => {
    if (!data) return [];
    return [...data.models]
      .filter((m) => m.elo !== null)
      .sort((a, b) => (b.elo ?? 0) - (a.elo ?? 0))
      .slice(0, 5)
      .map((m) => ({
        name: m.name.length > 18 ? m.name.slice(0, 16) + "…" : m.name,
        fullName: m.name,
        elo: m.elo,
        votes: m.eloVotes,
        color: getEloColor(m.elo),
      }));
  }, [data]);

  // Recommendation for "ROI de automatizar cotizaciones" — typical gerente query
  const recommendation = useMemo(() => {
    if (!data) return null;
    return recommend(
      "calcular roi de automatizar cotizaciones con ia para planta",
      data.models,
      operationMode
    );
  }, [data, operationMode]);

  if (isLoading || !data || !currencyMeta || !kpis) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const winner = recommendation?.winners[0];

  return (
    <div className="space-y-5 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Panel Gerencial · {currentProfile.name}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            KPIs de costo y calidad para decisiones de inversión en IA
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]"
        >
          Modo: {operationMode}
        </Badge>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KpiCard
          icon={DollarSign}
          label="Costo mensual estimado"
          value={formatPrice(kpis.monthlyCostUsd, currencyMeta)}
          sub="Por modelo · equipo 5M tokens/mes"
          color="var(--color-success)"
        />
        <KpiCard
          icon={CalendarDays}
          label="Costo anual proyectado"
          value={formatPrice(kpis.annualCostUsd, currencyMeta)}
          sub={`×12 meses · ${kpis.totalModels} modelos`}
          color="var(--color-warning)"
        />
        <KpiCard
          icon={ShieldCheck}
          label="Licencias comerciales libres"
          value={kpis.commercialLicenseCount.toString()}
          sub={`${kpis.commercialLicensePct.toFixed(0)}% del catálogo`}
          color="var(--color-teal)"
        />
        <KpiCard
          icon={Brain}
          label="Modelo más inteligente"
          value={kpis.mostIntelligent?.intelligenceIndex?.toFixed(1) ?? "—"}
          sub={kpis.mostIntelligent?.name ?? ""}
          color="var(--color-indigo)"
          isIndex
        />
      </section>

      {/* Scatter + Top 5 Elo */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3 bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--brand-primary)]" />
              Inteligencia vs Precio
            </CardTitle>
            <CardDescription className="text-xs">
              Cada punto = modelo · X = precio USD/M (log) · Y = inteligencia ·
              tamaño = velocidad (tok/s) · ↑← = barato e inteligente → mejor valor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} debounce={50}>
              <ScatterChart margin={{ top: 10, right: 16, bottom: 24, left: 8 }}>
                <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Precio USD/M (log10)"
                  domain={[-2, 2.5]}
                  ticks={[-2, -1, 0, 1, 2]}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-default)" }}
                  tickFormatter={(v) => {
                    const real = Math.pow(10, v);
                    if (real >= 10) return `$${real.toFixed(0)}`;
                    if (real >= 1) return `$${real.toFixed(0)}`;
                    return real.toFixed(2);
                  }}
                  label={{
                    value: "Precio USD/M (log)",
                    position: "insideBottom",
                    offset: -10,
                    fill: "var(--text-secondary)",
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Intelligence Index"
                  domain={[20, 60]}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-default)" }}
                  width={40}
                />
                <ZAxis type="number" dataKey="z" range={[10, 80]} />
                <RechartsTooltip
                  cursor={{ strokeDasharray: "3 3", stroke: "var(--border-strong)" }}
                  isAnimationActive={false}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as (typeof scatterData)[0];
                    return (
                      <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2.5 shadow-lg text-xs max-w-[220px]">
                        <div className="font-semibold text-[var(--text-primary)] mb-1">
                          {d.name}
                        </div>
                        <div className="text-[var(--text-secondary)] space-y-0.5">
                          <div>II: <span className="num text-[var(--text-primary)]">{d.y}</span></div>
                          <div>Blended: <span className="num text-[var(--text-primary)]">${d.rawPrice.toFixed(2)}/M</span></div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} isAnimationActive={false}>
                  {scatterData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.free ? "var(--color-success)" : entry.color}
                      fillOpacity={0.7}
                      stroke={entry.free ? "var(--color-success)" : entry.color}
                      strokeWidth={1}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-[var(--color-warning)]" />
              Top 5 por preferencia humana
            </CardTitle>
            <CardDescription className="text-xs">
              Elo Arena AI · votación ciega
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} debounce={50}>
              <BarChart
                data={eloData}
                layout="vertical"
                margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
              >
                <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[1200, 1600]}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-default)" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-default)" }}
                  width={120}
                />
                <RechartsTooltip
                  cursor={{ fill: "var(--bg-overlay)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as (typeof eloData)[0];
                    return (
                      <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2.5 shadow-lg text-xs">
                        <div className="font-semibold text-[var(--text-primary)]">{d.fullName}</div>
                        <div className="text-[var(--text-secondary)] mt-0.5">
                          Elo <span className="num text-[var(--text-primary)]">{d.elo}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="elo" radius={[0, 3, 3, 0]} barSize={20} isAnimationActive={false}>
                  {eloData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="elo"
                    position="right"
                    style={{ fill: "var(--text-secondary)", fontSize: 10 }}
                    className="num"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Recommendation card */}
      {winner && (
        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)]" />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--brand-primary)]" />
              <CardTitle className="text-base font-semibold tracking-tight">
                Recomendación para automatizar cotizaciones
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Generada por motor HRE-TOPSIS en {recommendation!.computationTimeMs}ms · modo {operationMode}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="flex items-center gap-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] p-3 w-full md:w-auto">
                <ProviderLogo model={winner.model} size={40} />
                <div className="min-w-0">
                  <div className="font-semibold text-[var(--text-primary)]">
                    {winner.model.name}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {winner.model.provider}
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {recommendation!.explanation}
                </p>
                <ul className="space-y-1">
                  {winner.reasons.map((r, i) => (
                    <li key={i} className="text-xs text-[var(--text-secondary)] flex gap-1.5">
                      <span className="text-[var(--color-success)]">▸</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <LicenseBadge
                    license={winner.model.license}
                    licenseName={winner.model.licenseName}
                  />
                  {winner.model.intelligenceIndex !== null && (
                    <Badge variant="outline" className="text-[10px]">
                      II: {winner.model.intelligenceIndex}
                    </Badge>
                  )}
                  {winner.model.elo !== null && (
                    <Badge variant="outline" className="text-[10px]">
                      Elo: {winner.model.elo}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={() => {
                  setRecommendationQuery(
                    "calcular roi de automatizar cotizaciones con ia para planta"
                  );
                  setActiveView("recomendador");
                }}
                size="sm"
                className="bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--on-accent)] shrink-0"
              >
                Ver detalle
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  isIndex,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  sub: string;
  color: string;
  isIndex?: boolean;
}) {
  return (
    <Card className="bg-[var(--bg-surface)] border-[var(--border-default)] card-hover overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
            }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </span>
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1">
          {label}
        </div>
        <div
          className="kpi-value num text-lg"
          style={!isIndex ? { color } : { color: "var(--color-indigo)" }}
        >
          {value}
        </div>
        <div className="text-xs text-[var(--text-secondary)] mt-1 truncate" title={sub}>
          {sub}
        </div>
      </CardContent>
    </Card>
  );
}
