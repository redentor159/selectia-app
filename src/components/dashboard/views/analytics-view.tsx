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
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  Cell,
  ZAxis,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Columns, Grid3x3, LineChart as LineIcon, BarChart3, TrendingUp } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { LicenseType } from "@/lib/types";
import { computeBlendedUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ScatterProviderLegend({
  data,
  activeProviders,
  onToggle,
}: {
  data: { provider: string; color: string }[];
  activeProviders: string[];
  onToggle: (p: string) => void;
}) {
  if (!data || data.length === 0) return null;
  const uniqueProviders = Array.from(
    new Map(data.map((d) => [d.provider, d.color])).entries()
  ).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-[10px] text-[var(--text-secondary)] px-1">
      {uniqueProviders.slice(0, 12).map(([provider, color]) => {
        const isActive =
          activeProviders.length === 0 || activeProviders.includes(provider);
        return (
          <button
            key={provider}
            onClick={() => onToggle(provider)}
            className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-all focus:outline-none cursor-pointer"
            style={{ opacity: isActive ? 1 : 0.4 }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            {provider}
          </button>
        );
      })}
      {uniqueProviders.length > 12 && (
        <div className="opacity-40">
          +{uniqueProviders.length - 12} más
        </div>
      )}
      {activeProviders.length > 0 && (
        <button
          onClick={() => onToggle("ALL")}
          className="ml-2 text-[10px] underline decoration-dotted hover:text-[var(--text-primary)] transition-colors"
        >
          Limpiar filtro
        </button>
      )}
    </div>
  );
}

const PROVIDER_PALETTE = [
  "#5e6ad2",
  "#00b8cc",
  "#fc7840",
  "#68cc58",
  "#f0bf00",
  "#eb5757",
  "#4ea7fc",
  "#533afd",
  "#00d66f",
  "#c084fc",
  "#fb7185",
  "#22d3ee",
];

const LICENSE_COLORS: Record<string, string> = {
  "commercial-open": "#00d66f",
  "conditional": "#e6b240",
  "api-paid": "#eb5757",
  "research-only": "#8d8d8d",
  "open-source-full": "#4ea7fc",
  "open": "#4ea7fc",
  "closed": "#eb5757",
};

export function AnalyticsView() {
  const { data, isLoading } = useDashboardData();
  const [timeRes, setTimeRes] = useState<"week" | "month" | "quarter" | "year">("quarter");
  const [activeProviders, setActiveProviders] = useState<string[]>([]);
  const [visibleColsHeatmap, setVisibleColsHeatmap] = useState<Record<string, boolean>>({
    priceAvg: true,
    iiAvg: true,
    count: true,
    commercialPct: true,
    freePct: true,
    speedAvg: true,
    dlAvg: true,
    likesAvg: true,
  });

  const heatmapColLabels: Record<string, string> = {
    priceAvg: "Precio prom",
    iiAvg: "II prom",
    count: "# Modelos",
    commercialPct: "% Comercial",
    freePct: "% Gratis",
    speedAvg: "Velocidad prom",
    dlAvg: "⬇ DL prom",
    likesAvg: "♥ Likes prom",
  };

  const toggleProvider = (provider: string) => {
    if (provider === "ALL") {
      setActiveProviders([]);
      return;
    }
    setActiveProviders((prev) => {
      if (prev.includes(provider)) {
        return prev.filter((p) => p !== provider);
      } else {
        return [...prev, provider];
      }
    });
  };

  const getPointOpacity = (provider: string) => {
    if (activeProviders.length === 0) return 0.65;
    return activeProviders.includes(provider) ? 0.9 : 0.1;
  };

  const heatmapRows = useMemo(() => {
    if (!data) return [];
    const groups = new Map<string, typeof data.models>();
    for (const m of data.models) {
      if (!groups.has(m.provider)) groups.set(m.provider, []);
      groups.get(m.provider)!.push(m);
    }
    type HeatmapColumn =
      | "priceAvg"
      | "iiAvg"
      | "count"
      | "commercialPct"
      | "freePct"
      | "speedAvg"
      | "dlAvg"
      | "likesAvg";
    type HeatmapRow = {
      provider: string;
      priceAvg: number | null;
      iiAvg: number | null;
      count: number;
      commercialPct: number;
      freePct: number;
      speedAvg: number | null;
      dlAvg: number | null;
      likesAvg: number | null;
    };
    const rawRows: HeatmapRow[] = [];
    for (const [provider, models] of groups) {
      const withPrice = models.filter(
        (m) => m.priceInputUsd !== null && m.priceOutputUsd !== null
      );
      const priceAvg =
        withPrice.length === 0
          ? null
          : withPrice.reduce((s, m) => s + computeBlendedUsd(m), 0) /
            withPrice.length;
      const withII = models.filter((m) => m.intelligenceIndex !== null);
      const iiAvg =
        withII.length === 0
          ? null
          : withII.reduce((s, m) => s + (m.intelligenceIndex ?? 0), 0) /
            withII.length;
      const commercial = models.filter(
        (m) =>
          m.license === "commercial-open" || m.license === "open-source-full"
      ).length;
      const free = models.filter(
        (m) => m.freeAccess === "free-100" || m.freeAccess === "free-limited"
      ).length;
      const withSpeed = models.filter((m) => m.speedTps !== null);
      const speedAvg =
        withSpeed.length === 0
          ? null
          : withSpeed.reduce((s, m) => s + (m.speedTps ?? 0), 0) /
            withSpeed.length;
      const withDl = models.filter(
        (m) => m.hfDownloads !== null && m.hfDownloads !== undefined
      );
      const dlAvg =
        withDl.length === 0
          ? null
          : withDl.reduce((s, m) => s + (m.hfDownloads ?? 0), 0) /
            withDl.length;
      const withLikes = models.filter(
        (m) => m.hfLikes !== null && m.hfLikes !== undefined
      );
      const likesAvg =
        withLikes.length === 0
          ? null
          : withLikes.reduce((s, m) => s + (m.hfLikes ?? 0), 0) /
            withLikes.length;
      rawRows.push({
        provider,
        priceAvg,
        iiAvg,
        count: models.length,
        commercialPct: (commercial / models.length) * 100,
        freePct: (free / models.length) * 100,
        speedAvg,
        dlAvg,
        likesAvg,
      });
    }
    rawRows.sort((a, b) => b.count - a.count);

    // Normalización relativa por columna: rango robusto p10-p90 por columna
    // para que los outliers extremos (DL/Likes) no aplasten el gradiente.
    const rows = rawRows.map((r) => ({
      ...r,
      norm: {} as Record<HeatmapColumn, number | null>,
    }));
    const columns: HeatmapColumn[] = [
      "priceAvg",
      "iiAvg",
      "count",
      "commercialPct",
      "freePct",
      "speedAvg",
      "dlAvg",
      "likesAvg",
    ];
    for (const key of columns) {
      const values = rows
        .map((r) => r[key])
        .filter((v): v is number => v !== null);
      const normalized = normalizeColumn(values);
      let i = 0;
      for (const r of rows) {
        r.norm[key] = r[key] === null ? null : normalized[i++];
      }
    }
    return rows;
  }, [data]);

  const timelineData = useMemo(() => {
    if (!data) return [];

    type TimeGroup = { sortKey: number; models: typeof data.models };
    const timeGroups = new Map<string, TimeGroup>();

    for (const m of data.models) {
      if (!m.releaseDate || m.intelligenceIndex === null) continue;
      const d = new Date(m.releaseDate);

      let period = "";
      let sortKey = 0;

      if (timeRes === "week") {
        const start = new Date(d.getFullYear(), 0, 1);
        const days = Math.floor(
          (d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
        );
        const week = Math.ceil((d.getDay() + 1 + days) / 7);
        period = `${d.getFullYear()}-W${week.toString().padStart(2, "0")}`;
        sortKey = d.getFullYear() * 100 + week;
      } else if (timeRes === "month") {
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        period = `${d.getFullYear()}-${month}`;
        sortKey = d.getFullYear() * 100 + d.getMonth();
      } else if (timeRes === "quarter") {
        const q = Math.floor(d.getMonth() / 3) + 1;
        period = `${d.getFullYear()}-Q${q}`;
        sortKey = d.getFullYear() * 10 + q;
      } else if (timeRes === "year") {
        period = `${d.getFullYear()}`;
        sortKey = d.getFullYear();
      }

      if (!timeGroups.has(period)) {
        timeGroups.set(period, { sortKey, models: [] });
      }
      timeGroups.get(period)!.models.push(m);
    }

    const sortedQuarters = Array.from(timeGroups.entries()).sort(
      (a, b) => a[1].sortKey - b[1].sortKey
    );

    const result: Record<string, any>[] = [];
    const cumulativeMax = new Map<string, { ii: number; name: string }>();

    for (const [quarter, group] of sortedQuarters) {
      for (const m of group.models) {
        const current = cumulativeMax.get(m.provider);
        const currentMax = current ? current.ii : 0;
        if (m.intelligenceIndex! > currentMax) {
          cumulativeMax.set(m.provider, {
            ii: m.intelligenceIndex!,
            name: m.name,
          });
        }
      }

      const launchedThisPeriod = new Set<string>();
      for (const m of group.models) {
        launchedThisPeriod.add(m.provider);
      }

      const row: Record<string, any> = { quarter };
      for (const [provider, max] of cumulativeMax.entries()) {
        // Solo emitir punto si el proveedor lanzó un modelo en ESTE período.
        // Sin datos del proveedor en esta fecha, no hay punto (hueco en la línea).
        if (launchedThisPeriod.has(provider)) {
          row[provider] = max.ii;
          row[`${provider}_model`] = max.name;
        }
      }
      result.push(row);
    }

    return result;
  }, [data, timeRes]);

  const providersInTimeline = useMemo(() => {
    if (!data) return [];
    const maxIiByProvider = new Map<string, number>();
    for (const m of data.models) {
      if (m.intelligenceIndex !== null && m.intelligenceIndex !== undefined) {
        const current = maxIiByProvider.get(m.provider) || 0;
        if (m.intelligenceIndex > current) {
          maxIiByProvider.set(m.provider, m.intelligenceIndex);
        }
      }
    }
    return Array.from(maxIiByProvider.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map((entry) => entry[0]);
  }, [data]);

  const contextSpeedData = useMemo(() => {
    if (!data) return [];
    return data.models
      .filter(
        (m) =>
          m.contextWindow > 0 &&
          m.speedTps !== null &&
          m.speedTps !== undefined &&
          m.speedTps > 0 &&
          m.intelligenceIndex !== null
      )
      .map((m) => ({
        name: m.name,
        provider: m.provider,
        x: Math.log2(m.contextWindow),
        y: m.speedTps!,
        z: m.intelligenceIndex!,
        rawContext: m.contextWindow,
        color: m.providerColor || "var(--color-indigo)",
      }));
  }, [data]);

  const codingAgenticData = useMemo(() => {
    if (!data) return [];
    return data.models
      .filter(
        (m) =>
          m.codingIndex !== null &&
          m.agenticIndex !== null &&
          m.intelligenceIndex !== null
      )
      .map((m) => ({
        name: m.name,
        provider: m.provider,
        x: m.codingIndex!,
        y: m.agenticIndex!,
        z: m.intelligenceIndex!,
        color: m.providerColor || "var(--color-indigo)",
      }));
  }, [data]);

  const efficiencyData = useMemo(() => {
    if (!data) return [];
    return data.models
      .filter(
        (m) =>
          m.speedTps !== null &&
          m.speedTps !== undefined &&
          m.speedTps > 0 &&
          m.priceInputUsd !== null &&
          m.priceOutputUsd !== null &&
          m.intelligenceIndex !== null &&
          (m.priceInputUsd! * 0.7 + m.priceOutputUsd! * 0.3) > 0
      )
      .map((m) => {
        const blendedPrice = m.priceInputUsd! * 0.7 + m.priceOutputUsd! * 0.3;
        return {
          name: m.name,
          provider: m.provider,
          x: blendedPrice,
          y: m.speedTps!,
          z: m.intelligenceIndex!,
          rawPrice: blendedPrice,
          color: m.providerColor || "var(--color-indigo)",
        };
      });
  }, [data]);

  const openWeightsData = useMemo(() => {
    if (!data) return [];
    const groups = new Map<string, typeof data.models>();
    for (const m of data.models) {
      if (!groups.has(m.provider)) groups.set(m.provider, []);
      groups.get(m.provider)!.push(m);
    }
    return Array.from(groups.entries())
      .map(([provider, models]) => ({
        provider,
        open: models.filter((m) => m.openWeights).length,
        closed: models.filter((m) => !m.openWeights).length,
      }))
      .sort((a, b) => a.provider.localeCompare(b.provider));
  }, [data]);

  const licenseData = useMemo(() => {
    if (!data) return [];
    const LICENSE_TYPES: LicenseType[] = [
      "commercial-open",
      "open-source-full",
      "conditional",
      "api-paid",
      "research-only",
    ];
    const groups = new Map<string, typeof data.models>();
    for (const m of data.models) {
      if (!groups.has(m.provider)) groups.set(m.provider, []);
      groups.get(m.provider)!.push(m);
    }
    return Array.from(groups.entries())
      .map(([provider, models]) => {
        const row: Record<string, number | string> = { provider };
        for (const lt of LICENSE_TYPES) {
          const count = models.filter((model) => model.license === lt).length;
          row[lt] = (count / models.length) * 100;
        }
        return row;
      })
      .sort((a, b) => (a.provider as string).localeCompare(b.provider as string));
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          Analytics · Vista Estratégica
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Heatmap de proveedores · timeline de evolución · distribución de licencias
        </p>
      </header>

      {/* 1. Heatmap of providers */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-1.5">
                <Grid3x3 className="h-4 w-4 text-[var(--brand-primary)]" />
                Heatmap de proveedores
              </CardTitle>
              <CardDescription className="text-xs">
                Color intensity = valor relativo por columna · {heatmapRows.length}{" "}
                proveedores
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <Columns className="h-3.5 w-3.5" />
                  Columnas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 max-h-[300px] overflow-y-auto">
                {Object.entries(heatmapColLabels).map(([key, label]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={visibleColsHeatmap[key]}
                    onCheckedChange={(c) =>
                      setVisibleColsHeatmap((prev) => ({ ...prev, [key]: c }))
                    }
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table
            className={cn(
              "w-full text-sm table-fixed",
              Object.entries(visibleColsHeatmap)
                .filter(([_, v]) => !v)
                .map(([k]) => `hide-col-${k}`)
                .join(" ")
            )}
          >
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-default)]">
                <th className="px-3 py-2 text-left font-medium">Proveedor</th>
                <th className="px-3 py-2 text-right font-medium col-priceAvg">Precio prom</th>
                <th className="px-3 py-2 text-right font-medium col-iiAvg">II prom</th>
                <th className="px-3 py-2 text-right font-medium col-count"># Modelos</th>
                <th className="px-3 py-2 text-right font-medium col-commercialPct">
                  % Comercial
                </th>
                <th className="px-3 py-2 text-right font-medium col-freePct">% Gratis</th>
                <th className="px-3 py-2 text-right font-medium col-speedAvg">
                  Velocidad prom
                </th>
                <th className="px-3 py-2 text-right font-medium col-dlAvg">
                  ⬇ DL prom
                </th>
                <th className="px-3 py-2 text-right font-medium col-likesAvg">
                  ♥ Likes prom
                </th>
              </tr>
            </thead>
            <tbody>
              {heatmapRows.map((row, idx) => (
                <tr
                  key={`${row.provider}-${idx}`}
                  className="border-b border-[var(--border-default)] last:border-0"
                >
                  <td className="px-3 py-2 font-medium text-[var(--text-primary)]">
                    {row.provider}
                  </td>
                  <HeatmapCell
                    value={row.priceAvg}
                    normalized={row.norm.priceAvg}
                    format={(v) =>
                      v === 0 ? "Gratis" : `$${v.toFixed(2)}`
                    }
                    scheme="reverse"
                    colKey="priceAvg"
                  />
                  <HeatmapCell
                    value={row.iiAvg}
                    normalized={row.norm.iiAvg}
                    format={(v) => v.toFixed(1)}
                    scheme="normal"
                    colKey="iiAvg"
                  />
                  <HeatmapCell
                    value={row.count}
                    normalized={row.norm.count}
                    format={(v) => v.toFixed(0)}
                    scheme="normal"
                    colKey="count"
                  />
                  <HeatmapCell
                    value={row.commercialPct}
                    normalized={row.norm.commercialPct}
                    format={(v) => `${v.toFixed(0)}%`}
                    scheme="normal"
                    colKey="commercialPct"
                  />
                  <HeatmapCell
                    value={row.freePct}
                    normalized={row.norm.freePct}
                    format={(v) => `${v.toFixed(0)}%`}
                    scheme="normal"
                    colKey="freePct"
                  />
                  <HeatmapCell
                    value={row.speedAvg}
                    normalized={row.norm.speedAvg}
                    format={(v) => `${v.toFixed(0)}`}
                    scheme="normal"
                    colKey="speedAvg"
                  />
                  <HeatmapCell
                    value={row.dlAvg}
                    normalized={row.norm.dlAvg}
                    format={formatCompact}
                    scheme="normal"
                    colKey="dlAvg"
                  />
                  <HeatmapCell
                    value={row.likesAvg}
                    normalized={row.norm.likesAvg}
                    format={formatCompact}
                    scheme="normal"
                    colKey="likesAvg"
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 2. Timeline chart */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-1.5">
              <LineIcon className="h-4 w-4 text-[var(--color-teal)]" />
              Evolución de Inteligencia
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Máximo II por proveedor · línea más alta = más inteligente · desde
              releaseDate
            </CardDescription>
          </div>
          <select
            className="text-xs bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded px-2 py-1 outline-none text-[var(--text-primary)] cursor-pointer"
            value={timeRes}
            onChange={(e) =>
              setTimeRes(
                e.target.value as "week" | "month" | "quarter" | "year"
              )
            }
          >
            <option value="week">Semanal</option>
            <option value="month">Mensual</option>
            <option value="quarter">Trimestral (Q)</option>
            <option value="year">Anual</option>
          </select>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320} debounce={50}>
            <LineChart
              data={timelineData}
              margin={{ top: 10, right: 16, bottom: 8, left: 8 }}
            >
              <CartesianGrid
                stroke="var(--border-default)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="quarter"
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-default)" }}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-default)" }}
                width={36}
              />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2.5 shadow-lg text-xs">
                      <div className="font-semibold text-[var(--text-primary)] mb-1.5">
                        {label}
                      </div>
                      <div className="space-y-0.5">
                        {payload
                          .filter(
                            (p) =>
                              p.value !== undefined && p.value !== null
                          )
                          .sort(
                            (a, b) =>
                              (b.value as number) - (a.value as number)
                          )
                          .map((p, idx) => {
                            const modelName =
                              p.payload[`${p.name}_model`];
                            return (
                              <div
                                key={`${p.name}-${idx}`}
                                className="flex items-center gap-2"
                              >
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: p.color }}
                                />
                                <span className="text-[var(--text-secondary)]">
                                  {p.name}{" "}
                                  {modelName && (
                                    <span className="text-[10px] opacity-70">
                                      ({modelName})
                                    </span>
                                  )}
                                </span>
                                <span className="num text-[var(--text-primary)] ml-auto">
                                  {p.value}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                iconType="circle"
                iconSize={8}
              />
              {providersInTimeline.map((p, i) => (
                <Line
                  key={`${p}-${i}`}
                  type="monotone"
                  dataKey={p}
                  stroke={PROVIDER_PALETTE[i % PROVIDER_PALETTE.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 2.5 Evolución de Precios de LLMs */}
      {data.priceIndex && data.priceIndex.length > 0 && (
        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-[var(--brand-primary)]" />
                  Evolución de Precios de LLMs (BenchLM Token Price Index)
                  <span
                    className="inline-flex items-center justify-center h-4 w-4 rounded-full text-[9px] font-bold cursor-help"
                    style={{
                      backgroundColor: "var(--bg-overlay)",
                      color: "var(--text-secondary)",
                    }}
                    title="Frontier = modelos top-tier más caros (GPT-5.5, Claude Opus) · Mid = gama media (Claude Sonnet, Gemini Pro) · Budget = económicos (<$1/M). El índice base es marzo 2023 = 100. Frontier ha caído 88%."
                  >
                    i
                  </span>
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Base mar 2023 = 100 · caída = más barato ·{" "}
                  {data.priceIndex.length} meses
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} debounce={50}>
              <LineChart
                data={data.priceIndex}
                margin={{ top: 10, right: 16, bottom: 8, left: 8 }}
              >
                <CartesianGrid
                  stroke="var(--border-default)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-default)" }}
                  minTickGap={20}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-default)" }}
                  width={45}
                />
                <RechartsTooltip
                  isAnimationActive={false}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload as {
                      month: string;
                      frontier: number | null;
                      frontierMedian: number | null;
                      mid: number | null;
                      midMedian: number | null;
                      budget: number | null;
                      budgetMedian: number | null;
                    };
                    if (!d) return null;
                    return (
                      <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2.5 shadow-lg text-xs max-w-[260px]">
                        <div className="font-semibold text-[var(--text-primary)] mb-1.5">
                          {label}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                              <span className="h-2 w-2 rounded-full" aria-label="frontier" title="Tier frontier" style={{ backgroundColor: "var(--color-error)" }} />
                              Frontier
                            </span>
                            <span className="num text-[var(--text-primary)]">
                              {d.frontier != null ? d.frontier.toFixed(1) : "—"}
                              {d.frontierMedian != null && (
                                <span className="text-[var(--text-secondary)] ml-1">
                                  (${d.frontierMedian.toFixed(2)}/M mediana)
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                              <span className="h-2 w-2 rounded-full" aria-label="mid" title="Tier mid" style={{ backgroundColor: "var(--color-warning)" }} />
                              Mid
                            </span>
                            <span className="num text-[var(--text-primary)]">
                              {d.mid != null ? d.mid.toFixed(1) : "—"}
                              {d.midMedian != null && (
                                <span className="text-[var(--text-secondary)] ml-1">
                                  (${d.midMedian.toFixed(2)}/M mediana)
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                              <span className="h-2 w-2 rounded-full" aria-label="budget" title="Tier budget" style={{ backgroundColor: "var(--color-success)" }} />
                              Budget
                            </span>
                            <span className="num text-[var(--text-primary)]">
                              {d.budget != null ? d.budget.toFixed(1) : "—"}
                              {d.budgetMedian != null && (
                                <span className="text-[var(--text-secondary)] ml-1">
                                  (${d.budgetMedian.toFixed(2)}/M mediana)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="frontier"
                  name="Frontier"
                  stroke="var(--color-error)"
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="mid"
                  name="Mid"
                  stroke="var(--color-warning)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="budget"
                  name="Budget"
                  stroke="var(--color-success)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Open Weights vs Propietario */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-0">
          <CardTitle className="text-base flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-[var(--color-warning)]" />
            Open Weights vs Propietario
          </CardTitle>
          <CardDescription className="text-xs">
            Por proveedor: cuántos modelos son open weights vs propietario ·
            barra completa = 100%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={openWeightsData}
              margin={{ top: 20, right: 16, bottom: 0, left: -10 }}
            >
              <CartesianGrid
                stroke="var(--border-default)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="provider"
                tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
                axisLine={{ stroke: "var(--border-default)" }}
                tickLine={false}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--border-default)" }}
                tickLine={false}
                width={30}
              />
              <RechartsTooltip
                cursor={{ fill: "var(--bg-overlay)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as any;
                  return (
                    <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2.5 shadow-lg text-xs min-w-[160px]">
                      <div className="font-semibold text-[var(--text-primary)] mb-1">
                        {d.provider}
                      </div>
                      <div className="text-[var(--text-secondary)] space-y-0.5">
                        <div className="flex justify-between gap-3">
                          <span style={{ color: "#4ea7fc" }}>
                            Open Weights:
                          </span>
                          <span className="num text-[var(--text-primary)]">
                            {d.open}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span style={{ color: "#eb5757" }}>
                            Propietario:
                          </span>
                          <span className="num text-[var(--text-primary)]">
                            {d.closed}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3 mt-1 pt-1 border-t border-[var(--border-default)]">
                          <span>Total:</span>
                          <span className="num text-[var(--text-primary)]">
                            {d.open + d.closed}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              <Bar
                dataKey="open"
                stackId="a"
                name="Open Weights"
                fill="#4ea7fc"
              />
              <Bar
                dataKey="closed"
                stackId="a"
                name="Propietario"
                fill="#eb5757"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grid 2-col: Velocidad vs Contexto | Coding vs Agentic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Velocidad vs Ventana de Contexto */}
        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-0">
            <CardTitle className="text-base flex items-center gap-1.5">
              Velocidad vs Ventana de Contexto
            </CardTitle>
            <CardDescription className="text-xs">
              X = contexto (log) · Y = velocidad (tok/s) · tamaño = Intelligence
              Index · ↑→ = mucho contexto Y rápido → ideal para agentes
            </CardDescription>
            <ScatterProviderLegend
              data={contextSpeedData}
              activeProviders={activeProviders}
              onToggle={toggleProvider}
            />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                margin={{ top: 10, right: 16, bottom: 24, left: 8 }}
              >
                <CartesianGrid
                  stroke="var(--border-default)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Context Window (log2)"
                  domain={[12, 21]}
                  ticks={[13, 15, 17, 19, 21]}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-default)" }}
                  tickFormatter={(v) => {
                    const real = Math.pow(2, v);
                    if (real >= 1048576)
                      return `${(real / 1048576).toFixed(0)}M`;
                    if (real >= 1024)
                      return `${(real / 1024).toFixed(0)}K`;
                    return String(real);
                  }}
                  label={{
                    value: "Ventana de Contexto",
                    position: "insideBottom",
                    offset: -10,
                    fill: "var(--text-secondary)",
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Speed (TPS)"
                  domain={[0, 200]}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-default)" }}
                  width={30}
                />
                <ZAxis
                  type="number"
                  dataKey="z"
                  range={[14, 110]}
                />
                <RechartsTooltip
                  cursor={{
                    strokeDasharray: "3 3",
                    stroke: "var(--border-strong)",
                  }}
                  isAnimationActive={false}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as any;
                    const formatTokens = (val: number) => {
                      if (val >= 1000000)
                        return `${(val / 1000000).toFixed(1).replace(".0", "")}M`;
                      if (val >= 1000)
                        return `${(val / 1000).toFixed(0)}K`;
                      return String(val);
                    };
                    return (
                      <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2.5 shadow-lg text-xs max-w-[220px]">
                        <div className="font-semibold text-[var(--text-primary)] mb-1">
                          {d.name}
                        </div>
                        <div className="text-[var(--text-secondary)] space-y-0.5">
                          <div>
                            Ventana:{" "}
                            <span className="num text-[var(--text-primary)]">
                              {formatTokens(d.rawContext)}
                            </span>
                          </div>
                          <div>
                            Velocidad:{" "}
                            <span className="num text-[var(--text-primary)]">
                              {d.y} TPS
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter
                  data={contextSpeedData}
                  isAnimationActive={false}
                >
                  {contextSpeedData.map((entry: any, i: number) => (
                    <Cell
                      key={i}
                      fill={entry.color}
                      fillOpacity={getPointOpacity(entry.provider)}
                      stroke={entry.color}
                      strokeOpacity={getPointOpacity(entry.provider)}
                      onClick={() => toggleProvider(entry.provider)}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Coding Index vs Agentic Index */}
        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-0">
            <CardTitle className="text-base flex items-center gap-1.5">
              Coding Index vs Agentic Index
            </CardTitle>
            <CardDescription className="text-xs">
              X = Coding Index · Y = Agentic Index · tamaño = Intelligence Index ·
              ↑→ = programa bien Y razona autónomo → top para agentes de código
            </CardDescription>
            <ScatterProviderLegend
              data={codingAgenticData}
              activeProviders={activeProviders}
              onToggle={toggleProvider}
            />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                margin={{ top: 10, right: 16, bottom: 24, left: 8 }}
              >
                <CartesianGrid
                  stroke="var(--border-default)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Coding Index"
                  domain={[30, 80]}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-default)" }}
                  label={{
                    value: "Coding Index",
                    position: "insideBottom",
                    offset: -10,
                    fill: "var(--text-secondary)",
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Agentic Index"
                  domain={[20, 70]}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-default)" }}
                  width={30}
                />
                <ZAxis
                  type="number"
                  dataKey="z"
                  range={[14, 110]}
                />
                <RechartsTooltip
                  cursor={{
                    strokeDasharray: "3 3",
                    stroke: "var(--border-strong)",
                  }}
                  isAnimationActive={false}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as any;
                    return (
                      <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2.5 shadow-lg text-xs max-w-[220px]">
                        <div className="font-semibold text-[var(--text-primary)] mb-1">
                          {d.name}
                        </div>
                        <div className="text-[var(--text-secondary)] space-y-0.5">
                          <div>
                            Coding Index:{" "}
                            <span className="num text-[var(--text-primary)]">
                              {d.x}
                            </span>
                          </div>
                          <div>
                            Agentic Index:{" "}
                            <span className="num text-[var(--text-primary)]">
                              {d.y}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter
                  data={codingAgenticData}
                  isAnimationActive={false}
                >
                  {codingAgenticData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.color}
                      fillOpacity={getPointOpacity(entry.provider)}
                      stroke={entry.color}
                      strokeOpacity={getPointOpacity(entry.provider)}
                      onClick={() => toggleProvider(entry.provider)}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Eficiencia (Velocidad vs Precio) */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-0">
          <CardTitle className="text-base flex items-center gap-1.5">
            Eficiencia (Velocidad vs Precio)
          </CardTitle>
          <CardDescription className="text-xs">
            X = precio blended USD/M (log) · Y = velocidad (tok/s) · tamaño =
            Intelligence Index · ↑← = rápido y barato → mejor eficiencia
          </CardDescription>
          <ScatterProviderLegend
            data={efficiencyData}
            activeProviders={activeProviders}
            onToggle={toggleProvider}
          />
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart
              margin={{ top: 10, right: 16, bottom: 24, left: 8 }}
            >
              <CartesianGrid
                stroke="var(--border-default)"
                strokeDasharray="3 3"
              />
              <XAxis
                type="number"
                dataKey="x"
                name="Precio por Millón de Tokens ($)"
                scale="log"
                domain={["auto", "auto"]}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-default)" }}
                tickFormatter={(v) => `$${v}`}
                label={{
                  value: "Blended Price USD",
                  position: "insideBottom",
                  offset: -10,
                  fill: "var(--text-secondary)",
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Velocidad (TPS)"
                domain={[0, "auto"]}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-default)" }}
                width={30}
              />
              <ZAxis
                type="number"
                dataKey="z"
                range={[14, 110]}
              />
              <RechartsTooltip
                cursor={{
                  strokeDasharray: "3 3",
                  stroke: "var(--border-strong)",
                }}
                isAnimationActive={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as any;
                  return (
                    <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2.5 shadow-lg text-xs max-w-[220px]">
                      <div className="font-semibold text-[var(--text-primary)] mb-1">
                        {d.name}
                      </div>
                      <div className="text-[var(--text-secondary)] space-y-0.5">
                        <div>
                          Costo Blended:{" "}
                          <span className="num text-[var(--text-primary)]">
                            ${d.x.toFixed(2)}/M
                          </span>
                        </div>
                        <div>
                          Velocidad:{" "}
                          <span className="num text-[var(--text-primary)]">
                            {d.y} TPS
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Scatter
                data={efficiencyData}
                isAnimationActive={false}
              >
                {efficiencyData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.color}
                    fillOpacity={getPointOpacity(entry.provider)}
                    stroke={entry.color}
                    strokeOpacity={getPointOpacity(entry.provider)}
                    onClick={() => toggleProvider(entry.provider)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribución de licencias por proveedor */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-[var(--color-warning)]" />
            Distribución de licencias por proveedor
          </CardTitle>
          <CardDescription className="text-xs">
            100% apilado por proveedor · proporción de licencias open / condicional
            / pago
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320} debounce={50}>
            <BarChart
              data={licenseData}
              margin={{ top: 10, right: 16, bottom: 24, left: 8 }}
            >
              <CartesianGrid
                stroke="var(--border-default)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="provider"
                tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-default)" }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-default)" }}
                tickFormatter={(v) => `${v}%`}
                width={36}
              />
              <RechartsTooltip
                cursor={{ fill: "var(--bg-overlay)" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2.5 shadow-lg text-xs">
                      <div className="font-semibold text-[var(--text-primary)] mb-1.5">
                        {label}
                      </div>
                      <div className="space-y-0.5">
                        {payload
                          .filter((p) => (p.value as number) > 0)
                          .map((p, idx) => (
                            <div
                              key={`${p.name}-${idx}`}
                              className="flex items-center gap-2"
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: p.color,
                                }}
                              />
                              <span className="text-[var(--text-secondary)]">
                                {p.name}
                              </span>
                              <span className="num text-[var(--text-primary)] ml-auto">
                                {(p.value as number).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="commercial-open"
                stackId="a"
                name="Comercial Libre"
                fill="#00d66f"
              />
              <Bar
                dataKey="open-source-full"
                stackId="a"
                name="Open Source"
                fill="#4ea7fc"
              />
              <Bar
                dataKey="conditional"
                stackId="a"
                name="Condicional"
                fill="#f0bf00"
              />
              <Bar
                dataKey="api-paid"
                stackId="a"
                name="Solo API Pago"
                fill="#eb5757"
              />
              <Bar
                dataKey="research-only"
                stackId="a"
                name="Solo Investigación"
                fill="#62666d"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function percentile(sortedValues: number[], p: number): number {
  const idx = Math.min(
    sortedValues.length - 1,
    Math.max(0, Math.floor((p / 100) * (sortedValues.length - 1)))
  );
  return sortedValues[idx];
}

function normalizeColumn(values: number[]): number[] {
  if (values.length === 0) return [];
  const sorted = [...values].sort((a, b) => a - b);
  let lo = percentile(sorted, 10);
  let hi = percentile(sorted, 90);
  if (lo === hi) {
    lo = Math.min(...values);
    hi = Math.max(...values);
  }
  if (lo === hi) return values.map(() => 0.5);
  const span = hi - lo;
  return values.map((v) => Math.max(0, Math.min(1, (v - lo) / span)));
}

function formatCompact(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) {
    const k = v / 1000;
    return `${k >= 100 ? Math.round(k) : k.toFixed(1)}K`;
  }
  return v.toFixed(0);
}

function heatNormalColor(normalized: number): string {
  const t = Math.max(0, Math.min(1, normalized));
  let r: number;
  let g: number;
  let b: number;
  if (t < 0.5) {
    const f = t / 0.5;
    r = 235 + (240 - 235) * f;
    g = 87 + (191 - 87) * f;
    b = 87 + (0 - 87) * f;
  } else {
    const f = (t - 0.5) / 0.5;
    r = 240 + (0 - 240) * f;
    g = 191 + (214 - 191) * f;
    b = 0 + (111 - 0) * f;
  }
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.22)`;
}

function HeatmapCell({
  value,
  normalized,
  format,
  scheme,
  colKey,
}: {
  value: number | null;
  normalized: number | null;
  format: (v: number) => string;
  scheme: "normal" | "reverse";
  colKey?: string;
}) {
  if (value === null || normalized === null) {
    return (
      <td
        className={cn(
          "px-3 py-2 text-right num font-medium text-[var(--text-secondary)]",
          colKey && `col-${colKey}`
        )}
        style={{ backgroundColor: "transparent" }}
      >
        —
      </td>
    );
  }
  const bg =
    scheme === "normal"
      ? heatNormalColor(normalized)
      : heatNormalColor(1 - normalized);
  return (
    <td
      className={cn(
        "px-3 py-2 text-right num font-medium",
        colKey && `col-${colKey}`
      )}
      style={{ backgroundColor: bg, color: "var(--text-primary)" }}
    >
      {format(value)}
    </td>
  );
}