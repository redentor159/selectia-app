"use client";

import { useMemo, useState } from "react";
import { useEffectiveDashboardSummary } from "@/hooks/use-effective-dashboard-summary";
import { useDashboardStore, PROFILES } from "@/store/dashboard-store";
import { getCurrencyByCode, formatPrice, getEloColor, formatVotes } from "@/lib/format";
import { computeBlendedUsd } from "@/lib/format";
import { ProviderLogo } from "../provider-logo";
import {
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Brain,
  Trophy,
  Zap,
  Database,
  Clock,
  ArrowUpRight,
  Activity,
  ExternalLink,
  Layers,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn } from "@/lib/utils";
import type { AIModel, CurrencyRate } from "@/lib/types";
import { OperarioView } from "./operario-view";
import { CalculadoraView } from "./calculadora-view";
import { SaludView } from "./salud-view";
import { GerenteView } from "./gerente-view";
import { AnalyticsView, ScatterProviderLegend, makeScatterShape } from "./analytics-view";
import { ChartExpandDialog } from "../charts/chart-expand-dialog";
import { FichaTecnicaModal } from "../ficha-tecnica-modal";
import { prefetchFichaForModel } from "../ficha-tecnica/hf-cache";

const EXAMPLE_QUERIES = [
  "Redactar correo a cliente sobre demora en entrega",
  "Analizar manual técnico CNC de 300 páginas",
  "Generar G-code para fresado de bridas",
  "Calcular ROI de automatizar cotizaciones",
  "Traducir especificación técnica al inglés",
];

export function OverviewView() {
  const { profile } = useDashboardStore();
  const currentProfile = PROFILES.find((p) => p.id === profile)!;

  // PRD Parte 2: "El dashboard se adapta a quién lo está usando. Cada perfil
  // activa un conjunto específico de columnas, gráficos y KPIs." The Resumen
  // (Overview) re-renders with a profile-specific layout instead of being a
  // separate nav item. Layouts:
  //   A Ingeniero      → search-cards (hero search + 3 quick recs + KPIs + scatter)
  //   B Gerente        → kpis-charts (4 KPIs + scatter + Top 5 Elo bars)
  //   C Consultor      → pivot-legal (provider pivot + legal notes + export)
  //   D TI              → system (status banner + AA quota + sources + offline)
  //   E Operario       → big-cards (3 huge colorful cards, zero tables)
  //   F Compras        → budget (budget calculator + cost table + alerts)
  const layout = currentProfile.overviewLayout;

  // Defer to the profile-specific component for layouts that have a dedicated
  // implementation. The default "search-cards" (Ingeniero) renders inline below.
  if (layout === "big-cards") return <OperarioOverview />;
  if (layout === "budget") return <ComprasOverview />;
  // Perfil C (Consultor): no tiene Resumen propio, el transcript documentó que
  // se redirige al Heatmap de Analytics (Pasos 4301-4304). Se renderiza
  // AnalyticsView directamente, sin salto de frame: el usuario percibe la
  // vista de Analytics al instante, sin pantalla en blanco ni parpadeo.
  if (layout === "pivot-legal") return <AnalyticsView />;
  if (layout === "system") return <SystemOverview />;
  if (layout === "kpis-charts") return <GerenteOverview />;
  // "search-cards" (A Ingeniero) renders inline below.
  return <IngenieroOverview />;
}

function IngenieroOverview() {
  // Payload ligero (?fields=summary): misma API que useEffectiveDashboardData,
  // solo cambia la fuente. El filtrado de la vista sigue usando useDashboardStore.
  const { data, isLoading } = useEffectiveDashboardSummary();
  const {
    profile,
    currency,
    operationMode,
    setActiveView,
    setRecommendationQuery,
  } = useDashboardStore();

  const [query, setQuery] = useState("");

  const currencyMeta = data ? getCurrencyByCode(data.currencies, currency) : null;
  const currentProfile = PROFILES.find((p) => p.id === profile)!;

  const kpis = useMemo(() => {
    if (!data) return null;
    const models = data.models;
    const commercialOpen = models.filter(
      (m) => m.license === "commercial-open" || m.license === "open-source-full"
    ).length;
    const mostIntelligent = [...models]
      .filter((m) => m.intelligenceIndex !== null)
      .sort((a, b) => (b.intelligenceIndex ?? 0) - (a.intelligenceIndex ?? 0))[0];
    const cheapest = [...models]
      .filter((m) => m.priceInputUsd !== null && m.priceInputUsd > 0)
      .sort((a, b) => (a.priceInputUsd ?? 0) - (b.priceInputUsd ?? 0))[0];
    const fastest = [...models]
      .filter((m) => m.speedTps !== null)
      .sort((a, b) => (b.speedTps ?? 0) - (a.speedTps ?? 0))[0];
    return {
      total: models.length,
      commercialOpen,
      mostIntelligent,
      cheapest,
      fastest,
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
          rawPrice: blended, // keep raw for tooltip
          z: m.speedTps ?? 50,
          name: m.name,
          id: m.id,
          provider: m.provider,
          color: m.providerColor || "#5e6ad2",
          free: m.freeAccess === "free-100" || blended === 0,
        };
      });
  }, [data]);

  // Gráfico 7: Adopción vs Calidad scatter data
  // Pre-compute log10 of downloads — Recharts log scale on ScatterChart is buggy
  // (points render outside the viewport or don't render at all). Using a linear
  // axis with pre-computed log10 values is the reliable approach.
  const adoptionData = useMemo(() => {
    if (!data) return [];
    return data.models
      .filter((m) => m.hfDownloads != null && m.hfDownloads > 0 && m.intelligenceIndex != null)
      .map((m) => ({
        x: Math.log10(m.hfDownloads!), // log10 for linear axis
        rawDownloads: m.hfDownloads!, // keep raw for tooltip
        y: m.intelligenceIndex!,
        z: m.hfLikes ?? 10,
        name: m.name,
        id: m.id,
        provider: m.provider,
        color: m.providerColor || "#5e6ad2", // fallback color
        likes: m.hfLikes ?? 0,
      }))
      .sort((a, b) => b.rawDownloads - a.rawDownloads)
      .slice(0, 80);
  }, [data]);

  /**
   * Variantes ORDENADAS por X para los modales con <Brush> (mismo motivo que
   * brushSpeedData en analytics): el Brush recorta por índice ordinal, y con
   * los datos ordenados un slice de índices ES un rango contiguo de valor del
   * eje; el ChartExpandDialog traduce los índices a valores reales y
   * allowDataOverflow=true corta los puntos fuera del rango.
   */
  const brushScatterData = useMemo(
    () => [...scatterData].sort((a, b) => a.x - b.x),
    [scatterData]
  );
  const brushAdoptionData = useMemo(
    () => [...adoptionData].sort((a, b) => a.x - b.x),
    [adoptionData]
  );

  const eloData = useMemo(() => {
    if (!data) return [];
    return [...data.models]
      .filter((m) => m.elo !== null)
      .sort((a, b) => (b.elo ?? 0) - (a.elo ?? 0))
      .slice(0, 10)
      .map((m) => ({
        name: m.name.length > 22 ? m.name.slice(0, 20) + "…" : m.name,
        fullName: m.name,
        elo: m.elo,
        votes: m.eloVotes,
        color: getEloColor(m.elo),
      }));
  }, [data]);

  // Provider filter state shared by both Overview scatters (Inteligencia vs
  // Precio & Adopción vs Calidad). Mirrors the pattern in analytics-view.tsx:116-156.
  const [activeProviders, setActiveProviders] = useState<string[]>([]);

  // Gráfico abierto en modal (null = ninguno). Un único estado por gráfico:
  // el montaje condicional `{open && <ChartExpandDialog … />}` desmonta el
  // modal al cerrar, garantizando estado fresco (zoom reseteado) por apertura.
  const [openChart, setOpenChart] = useState<
    "inteligencia-vs-precio" | "adopcion-vs-calidad" | null
  >(null);
  // Ficha técnica abierta en modo NO expandido (doble click sobre un punto
  // de un chart no expandido). null = ficha cerrada. El modal expandido
  // mantiene su propio estado fichaModelId local dentro del ChartExpandDialog.
  const [fichaModelIdNoExpandido, setFichaModelIdNoExpandido] =
    useState<string | null>(null);

  const toggleProvider = (provider: string) => {
    if (provider === "ALL") {
      setActiveProviders([]);
      return;
    }
    setActiveProviders((prev) =>
      prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider]
    );
  };
  const getPointOpacity = (provider: string) => {
    if (activeProviders.length === 0) return 0.65;
    return activeProviders.includes(provider) ? 0.9 : 0.1;
  };

  // Provider × color pairs derived from the models actually present in each
  // scatter (a superset is fine for the legend — duplicates are deduped inside
  // ScatterProviderLegend by provider name). We use scatterData here because it
  // already carries provider + color for every point drawn on the first chart;
  // the Adopción legend gets its own derivation below from adoptionData.
  const allProvidersData = useMemo(() => {
    return scatterData.map((d) => ({ provider: d.provider, color: d.color, z: d.y }));
  }, [scatterData]);
  const adoptionProvidersData = useMemo(() => {
    return adoptionData.map((d) => ({ provider: d.provider, color: d.color, z: d.y }));
  }, [adoptionData]);

  // Modelos por Modalidad — counts how many models support each input modality
  // (text/image/file/video/audio) using m.orInputModalities. Stable color per
  // modality; order matches the documented tier list. orInputModalities viaja
  // en el payload ligero (único campo or* conservado en SUMMARY_MODEL_PICK_KEYS).
  const modalitiesData = useMemo(() => {
    if (!data) return [];
    const counts: Record<string, number> = {};
    for (const m of data.models) {
      if (m.orInputModalities && Array.isArray(m.orInputModalities)) {
        for (const mod of m.orInputModalities) {
          counts[mod] = (counts[mod] || 0) + 1;
        }
      }
    }
    const order = ["text", "image", "file", "video", "audio"];
    const palette: Record<string, string> = {
      text: "var(--brand-primary)",
      image: "var(--color-indigo)",
      file: "var(--color-warning)",
      video: "var(--color-orange)",
      audio: "var(--color-success)",
    };
    return order
      .filter((mod) => counts[mod])
      .map((mod) => ({
        name: mod.charAt(0).toUpperCase() + mod.slice(1),
        value: counts[mod],
        color: palette[mod] ?? "var(--brand-primary)",
      }));
  }, [data]);

  const benchlmStats = useMemo(
    () => data?.benchlmStats ?? [],
    [data]
  );

  const handleSearch = (q?: string) => {
    const finalQuery = q ?? query;
    if (!finalQuery.trim()) return;
    setRecommendationQuery(finalQuery);
    setActiveView("recomendador");
  };

  if (isLoading || !data || !currencyMeta) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero search */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 lg:p-8">
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            background:
              "radial-gradient(600px circle at 15% 0%, var(--brand-primary-subtle), transparent 50%), radial-gradient(500px circle at 85% 100%, var(--brand-accent-glow), transparent 50%)",
          }}
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge
              variant="outline"
              className="gap-1 border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]"
            >
              <Sparkles className="h-3 w-3" />
              Motor HRE-TOPSIS · 5 capas
            </Badge>
            <span className="text-xs text-[var(--text-secondary)]">
              Clasifica tu tarea, filtra, pondera con AHP y rankea con TOPSIS en &lt;100ms
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-[-0.022em] text-[var(--text-primary)] mb-2">
            ¿Qué quieres hacer hoy?
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-5 max-w-2xl">
            Describe tu tarea en lenguaje natural. El motor recomienda los 3 mejores modelos
            de IA para tu perfil ({currentProfile.name}) y modo ({operationMode}).
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ej: redactar correo, calcular costos, analizar planos…"
                className="h-12 pl-10 pr-4 text-base bg-[var(--bg-elevated)] border-[var(--border-strong)] rounded-xl"
              />
            </div>
            <Button
              onClick={() => handleSearch()}
              size="lg"
              className="h-12 px-6 bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--on-accent)]"
            >
              Recomendar
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {EXAMPLE_QUERIES.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setQuery(ex);
                  handleSearch(ex);
                }}
                className="rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KpiCard
          icon={Database}
          label="Modelos comparados"
          value={kpis!.total.toString()}
          sub={`${data?.sources?.length ?? 13} fuentes combinadas`}
          color="var(--brand-primary)"
        />
        <KpiCard
          icon={Brain}
          label="Más inteligente hoy"
          value={kpis!.mostIntelligent?.intelligenceIndex?.toFixed(1) ?? "—"}
          sub={kpis!.mostIntelligent?.name ?? ""}
          color="var(--color-indigo)"
          isIndex
        />
        <KpiCard
          icon={Zap}
          label="Más rápido"
          value={kpis!.fastest ? `${kpis!.fastest.speedTps}` : "—"}
          sub={kpis!.fastest?.name ?? ""}
          color="var(--color-warning)"
          unit="tok/s"
        />
        <KpiCard
          icon={TrendingUp}
          label="Licencia comercial libre"
          value={kpis!.commercialOpen.toString()}
          sub={`de ${kpis!.total} modelos`}
          color="var(--color-success)"
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3 bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold tracking-tight">
                  Inteligencia vs Precio
                </CardTitle>
                <CardDescription className="text-xs">
                  Cada punto = modelo · X = precio USD/M (log) · Y = inteligencia ·
                  tamaño = velocidad (tok/s) · ↑← = barato e inteligente → mejor
                  valor
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 shrink-0"
                title="Expandir gráfico"
                aria-label="Expandir gráfico"
                onClick={() => setOpenChart("inteligencia-vs-precio")}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
            <ScatterProviderLegend data={allProvidersData} activeProviders={activeProviders} onToggle={toggleProvider} />
          </CardHeader>
          <CardContent>
            <div data-chart-id="inteligencia-vs-precio">
            <ResponsiveContainer width="100%" height={320} debounce={50}>
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
                <ZAxis type="number" dataKey="z" range={[40, 400]} />
                <RechartsTooltip
                  cursor={{ strokeDasharray: "3 3", stroke: "var(--border-strong)" }}
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
                          <div>Vel: <span className="num text-[var(--text-primary)]">{d.z} tok/s</span></div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} isAnimationActive={false}>
                  {scatterData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.color}
                      fillOpacity={getPointOpacity(entry.provider)}
                      stroke={entry.color}
                      strokeOpacity={getPointOpacity(entry.provider)}
                      strokeWidth={1}
                      onClick={() => toggleProvider(entry.provider)}
                      onDoubleClick={() =>
                        setFichaModelIdNoExpandido(entry.id)
                      }
                      onMouseEnter={() => {
                        const m =
                          data.models.find((mm) => mm.id === entry.id) ?? null;
                        prefetchFichaForModel(m);
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-[var(--color-warning)]" />
              Top 10 por preferencia humana
            </CardTitle>
            <CardDescription className="text-xs">
              Elo Arena AI · votación ciega humana · barra más larga = más preferido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div data-chart-id="top-elo">
            <ResponsiveContainer width="100%" height={320} debounce={50}>
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
                  isAnimationActive={false}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as (typeof eloData)[0];
                    return (
                      <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2.5 shadow-lg text-xs">
                        <div className="font-semibold text-[var(--text-primary)]">{d.fullName}</div>
                        <div className="text-[var(--text-secondary)] mt-0.5">
                          Elo <span className="num text-[var(--text-primary)]">{d.elo}</span> ·{" "}
                          <span className="num">{formatVotes(d.votes)}</span> votos
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="elo" radius={[0, 3, 3, 0]} barSize={18} isAnimationActive={false}>
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
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick stats (1/3) + Modelos por Modalidad (2/3) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column (1/3): Quick stats stacked vertically */}
        <div className="flex flex-col gap-4">
          <QuickModelCard
            title="Más económico con pago"
            icon={DollarSign}
            color="var(--color-success)"
            model={kpis!.cheapest}
            currencyMeta={currencyMeta}
          />
          <QuickModelCard
            title="Más rápido en inferencia"
            icon={Zap}
            color="var(--color-warning)"
            model={kpis!.fastest}
            currencyMeta={currencyMeta}
          />
        </div>

        {/* Right column (2/3): Modalidades chart */}
        {modalitiesData.length > 0 && (
          <div className="lg:col-span-2 flex flex-col h-full">
            <Card className="bg-[var(--bg-surface)] border-[var(--border-default)] flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-[var(--color-indigo)]" />
                  Modelos por Modalidad
                </CardTitle>
                <CardDescription className="text-xs">
                  Capacidades de input soportadas a través de {data.models.filter(m => (m.orInputModalities?.length ?? 0) > 0).length} modelos (OpenRouter)
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center min-h-[220px]">
                <div data-chart-id="modelos-por-modalidad" className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <BarChart
                    data={modalitiesData}
                    layout="vertical"
                    margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: "var(--border-default)" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: "var(--border-default)" }}
                      width={60}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "var(--bg-overlay)" }}
                      isAnimationActive={false}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as { name: string; value: number };
                        return (
                          <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2.5 shadow-lg text-xs">
                            <div className="font-semibold text-[var(--text-primary)]">{d.name}</div>
                            <div className="text-[var(--text-secondary)] mt-0.5">
                              <span className="num text-[var(--text-primary)]">{d.value}</span> modelos
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={20} isAnimationActive={false}>
                      {modalitiesData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="right"
                        style={{ fill: "var(--text-secondary)", fontSize: 11 }}
                        className="num"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Gráfico 7: Adopción vs Calidad — scatter downloads (log) vs Intelligence Index */}
      {adoptionData.length > 0 && (
        <section className="grid grid-cols-1 gap-4">
          <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold tracking-tight">
                    Adopción vs Calidad
                  </CardTitle>
                  <CardDescription className="text-xs">
                    X = descargas HF (log) · Y = Intelligence Index · tamaño = likes
                    HF · ↑→ = "Zona de Confianza": populares Y muy inteligentes
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 shrink-0"
                  title="Expandir gráfico"
                  aria-label="Expandir gráfico"
                  onClick={() => setOpenChart("adopcion-vs-calidad")}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
              <ScatterProviderLegend data={adoptionProvidersData} activeProviders={activeProviders} onToggle={toggleProvider} />
            </CardHeader>
            <CardContent>
              <div data-chart-id="adopcion-vs-calidad">
              <ResponsiveContainer width="100%" height={300} debounce={50}>
                <ScatterChart margin={{ top: 10, right: 16, bottom: 24, left: 8 }}>
                  <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Downloads (log10)"
                    domain={[2, 7]}
                    ticks={[2, 3, 4, 5, 6, 7]}
                    tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border-default)" }}
                    tickFormatter={(v) => {
                      const real = Math.pow(10, v);
                      if (real >= 1000000) return `${(real / 1000000).toFixed(0)}M`;
                      if (real >= 1000) return `${(real / 1000).toFixed(0)}K`;
                      return String(real);
                    }}
                    label={{ value: "Downloads (escala log)", position: "insideBottom", offset: -10, fill: "var(--text-secondary)", fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Intelligence Index"
                    domain={[0, 60]}
                    tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border-default)" }}
                    width={40}
                  />
                  <ZAxis type="number" dataKey="z" range={[40, 400]} />
                  <RechartsTooltip
                    cursor={{ strokeDasharray: "3 3", stroke: "var(--border-strong)" }}
                    isAnimationActive={false}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as { name: string; provider: string; color: string; rawDownloads: number; y: number; likes: number };
                      return (
                        <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2.5 shadow-lg text-xs max-w-[220px]">
                          <div className="font-semibold text-[var(--text-primary)] mb-1">{d.name}</div>
                          <div className="text-[var(--text-secondary)]">{d.provider}</div>
                          <div className="num mt-1">⬇ {d.rawDownloads >= 1000 ? `${(d.rawDownloads / 1000).toFixed(1)}K` : d.rawDownloads} downloads</div>
                          <div className="num">♥ {d.likes} likes</div>
                          <div className="num">II: {d.y}</div>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={adoptionData} isAnimationActive={false}>
                    {adoptionData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.color}
                        fillOpacity={getPointOpacity(entry.provider)}
                        stroke={entry.color}
                        strokeOpacity={getPointOpacity(entry.provider)}
                        strokeWidth={1}
                        onClick={() => toggleProvider(entry.provider)}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* BenchLM Stats Panel (Titulares del Mercado) — sin Card, variante FINAL.
          Debajo de Adopción vs Calidad, antes de Data freshness (C1, CODIGO_LISTO_PARA_PEGAR.md:489-521).
          benchlmStats viaja en el payload ligero (?fields=summary). */}
      {benchlmStats.length > 0 && (
        <section className="flex flex-col gap-3 mt-4 mb-4">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1.5 px-1">
            <Activity className="h-4 w-4" />
            Titulares del Mercado (BenchLM Stats)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {benchlmStats.map(stat => (
              <a
                key={stat.statId}
                href={stat.anchorUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative flex flex-col justify-between rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 hover:border-[var(--brand-primary-subtle)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <div className="text-xs font-medium text-[var(--text-secondary)] mb-2 line-clamp-1 pr-4">
                  {stat.label}
                </div>
                <div className="text-lg font-semibold text-[var(--text-primary)] mb-1 leading-tight">
                  {stat.value}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] line-clamp-2">
                  {stat.sentence}
                </div>
                <ExternalLink className="absolute top-4 right-4 h-3 w-3 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Data freshness */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <Clock className="h-3.5 w-3.5" />
          Última sincronización del orquestador:{" "}
          <span className="num text-[var(--text-primary)]">
            {new Date(data.generatedAt).toLocaleString("es-PE", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
        <button
          onClick={() => setActiveView("salud")}
          className="flex items-center gap-1 text-xs font-medium text-[var(--brand-primary)] hover:underline"
        >
          Ver salud del sistema
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </section>

      {/* Modal expandido: Inteligencia vs Precio. Montaje condicional para
          reset de zoom por apertura (spec). El JSX del ScatterChart viaja tal
          cual (tooltip custom incluido, alcance estricto); solo cambian el
          dominio X (ctx.xDomain, espacio log10, default [-2,2.5]) y el click
          de puntos: dentro del modal abre la ficha técnica, NO alterna
          proveedores (spec). Fuera del modal el click sigue siendo toggleProvider. */}
      {openChart === "inteligencia-vs-precio" && (
        <ChartExpandDialog
          open
          onClose={() => setOpenChart(null)}
          title="Inteligencia vs Precio"
          subtitle="Cada punto = modelo · X = precio USD/M (log) · Y = inteligencia · tamaño = velocidad (tok/s) · click en un punto abre la ficha técnica"
          chartId="inteligencia-vs-precio"
          data={brushScatterData}
          models={data.models}
          defaultXDomain={["auto", "auto"]}
          xDataKey="x"
          activeProviders={activeProviders}
          onToggle={toggleProvider}
          interactionMode="brush"
          renderChart={(ctx) => (
            <ScatterChart
              margin={{ top: 10, right: 16, bottom: 24, left: 8 }}
              data={brushScatterData}
              onMouseDown={ctx.onMouseDown}
              onMouseMove={ctx.onMouseMove}
              onMouseUp={ctx.onMouseUp}
            >
              <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name="Precio USD/M (log10)"
                domain={ctx.xDomain}
                allowDataOverflow={ctx.allowXOverflow}
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
              <ZAxis type="number" dataKey="z" range={[40, 400]} />
              <RechartsTooltip
                cursor={{ strokeDasharray: "3 3", stroke: "var(--border-strong)" }}
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
                        <div>Vel: <span className="num text-[var(--text-primary)]">{d.z} tok/s</span></div>
                      </div>
                    </div>
                  );
                }}
              />
              <Scatter isAnimationActive={false} shape={makeScatterShape(getPointOpacity) as any}
                onClick={(pt: any) => ctx.onToggleProvider(pt?.payload?.provider ?? pt?.provider)}
                onDoubleClick={(pt: any) => ctx.onPointClick(pt?.payload?.id ?? pt?.id)}
                onMouseEnter={(pt: any) => {
                  const id = pt?.payload?.id ?? pt?.id;
                  const m = id ? (data.models.find((mm) => mm.id === id) ?? null) : null;
                  prefetchFichaForModel(m);
                }}
                style={{ cursor: "pointer" }}
              />
              {ctx.brush}
            </ScatterChart>
          )}
        />
      )}

      {/* Modal expandido: Adopción vs Calidad. Ídem anterior; dominio log10
          default [2,7] (descargas HF) e Y = Intelligence Index. */}
      {openChart === "adopcion-vs-calidad" && (
        <ChartExpandDialog
          open
          onClose={() => setOpenChart(null)}
          title="Adopción vs Calidad"
          subtitle="X = descargas HF (log) · Y = Intelligence Index · tamaño = likes HF · click en un punto abre la ficha técnica"
          chartId="adopcion-vs-calidad"
          data={brushAdoptionData}
          models={data.models}
          defaultXDomain={["auto", "auto"]}
          xDataKey="x"
          activeProviders={activeProviders}
          onToggle={toggleProvider}
          interactionMode="brush"
          renderChart={(ctx) => (
            <ScatterChart
              margin={{ top: 10, right: 16, bottom: 24, left: 8 }}
              data={brushAdoptionData}
              onMouseDown={ctx.onMouseDown}
              onMouseMove={ctx.onMouseMove}
              onMouseUp={ctx.onMouseUp}
            >
              <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name="Downloads (log10)"
                domain={ctx.xDomain}
                allowDataOverflow={ctx.allowXOverflow}
                ticks={[2, 3, 4, 5, 6, 7]}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-default)" }}
                tickFormatter={(v) => {
                  const real = Math.pow(10, v);
                  if (real >= 1000000) return `${(real / 1000000).toFixed(0)}M`;
                  if (real >= 1000) return `${(real / 1000).toFixed(0)}K`;
                  return String(real);
                }}
                label={{ value: "Downloads (escala log)", position: "insideBottom", offset: -10, fill: "var(--text-secondary)", fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Intelligence Index"
                domain={[0, 60]}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-default)" }}
                width={40}
              />
              <ZAxis type="number" dataKey="z" range={[40, 400]} />
              <RechartsTooltip
                cursor={{ strokeDasharray: "3 3", stroke: "var(--border-strong)" }}
                isAnimationActive={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as { name: string; provider: string; color: string; rawDownloads: number; y: number; likes: number };
                  return (
                    <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2.5 shadow-lg text-xs max-w-[220px]">
                      <div className="font-semibold text-[var(--text-primary)] mb-1">{d.name}</div>
                      <div className="text-[var(--text-secondary)]">{d.provider}</div>
                      <div className="num mt-1">⬇ {d.rawDownloads >= 1000 ? `${(d.rawDownloads / 1000).toFixed(1)}K` : d.rawDownloads} downloads</div>
                      <div className="num">♥ {d.likes} likes</div>
                      <div className="num">II: {d.y}</div>
                    </div>
                  );
                }}
              />
              <Scatter isAnimationActive={false} shape={makeScatterShape(getPointOpacity) as any}
                onClick={(pt: any) => ctx.onToggleProvider(pt?.payload?.provider ?? pt?.provider)}
                onDoubleClick={(pt: any) => ctx.onPointClick(pt?.payload?.id ?? pt?.id)}
                onMouseEnter={(pt: any) => {
                  const id = pt?.payload?.id ?? pt?.id;
                  const m = id ? (data.models.find((mm) => mm.id === id) ?? null) : null;
                  prefetchFichaForModel(m);
                }}
                style={{ cursor: "pointer" }}
              />
              {ctx.brush}
            </ScatterChart>
          )}
        />
      )}

      {/* Ficha técnica (doble click en modo NO expandido). Los ScatterCharts
          no modales no comparten el fichaModelId del ChartExpandDialog, así
          que este modal se renderiza fuera del layout cuando el usuario
          hace doble click en un punto del chart no expandido. */}
      {fichaModelIdNoExpandido && (
        <FichaTecnicaModal
          model={data.models.find((m) => m.id === fichaModelIdNoExpandido) ?? null}
          onClose={() => setFichaModelIdNoExpandido(null)}
        />
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
  unit,
  isIndex,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  sub: string;
  color: string;
  unit?: string;
  isIndex?: boolean;
}) {
  return (
    <Card className="bg-[var(--bg-surface)] border-[var(--border-default)] card-hover overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </span>
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1">
          {label}
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className={cn("kpi-value num", isIndex && "text-[var(--color-indigo)]")}
            style={!isIndex ? { color } : undefined}
          >
            {value}
          </span>
          {unit && (
            <span className="text-xs text-[var(--text-secondary)]">{unit}</span>
          )}
        </div>
        <div className="text-xs text-[var(--text-secondary)] mt-1 truncate" title={sub}>
          {sub}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickModelCard({
  title,
  icon: Icon,
  color,
  model,
  currencyMeta,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  model: AIModel | undefined;
  currencyMeta: CurrencyRate;
}) {
  if (!model) return null;
  return (
    <Card className="bg-[var(--bg-surface)] border-[var(--border-default)] card-hover">
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Icon className="h-3.5 w-3.5" style={{ color }} />
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ProviderLogo model={model} size={36} />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{model.name}</div>
            <div className="text-xs text-[var(--text-secondary)]">{model.provider}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          {model.priceInputUsd !== null && (
            <span className="num">
              {formatPrice(model.priceInputUsd, currencyMeta)} /M input
            </span>
          )}
          {model.speedTps !== null && (
            <span className="num text-[var(--text-secondary)]">
              {model.speedTps} tok/s
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Profile-specific Overview wrappers.
// PRD Parte 2: "El dashboard se adapta a quién lo está usando." Each profile
// gets a distinct Resumen layout. These wrappers delegate to the existing
// profile components (which were previously separate nav items) so we reuse
// all their logic without duplication.
// ---------------------------------------------------------------------------

function OperarioOverview() {
  return <OperarioView />;
}

function ComprasOverview() {
  // Perfil F (Compras / Costos) — per user request, the Compras profile
  // redirects to the Calculadora view (which already has model selection,
  // budget projection, cache ROI, and budget alerts). The Compras view
  // (full cost table dominated by $0 free models) is no longer the default
  // landing for this profile. If the user clicks "Resumen" while on the
  // Compras profile, we still show the Calculadora for consistency.
  return <CalculadoraView />;
}

function SystemOverview() {
  // Perfil D (TI) — the Salud view IS the system overview. Delegate to it.
  return <SaludView />;
}

function GerenteOverview() {
  // Perfil B (Gerente) — KPIs + scatter + Top 5 Elo bars layout.
  return <GerenteView />;
}
