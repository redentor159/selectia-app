"use client";

import { useMemo } from "react";
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Grid3x3, LineChart as LineIcon, BarChart3 } from "lucide-react";
import type { LicenseType } from "@/lib/types";

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

export function AnalyticsView() {
  const { data, isLoading } = useDashboardData();

  const heatmapRows = useMemo(() => {
    if (!data) return [];
    const groups = new Map<string, typeof data.models>();
    for (const m of data.models) {
      if (!groups.has(m.provider)) groups.set(m.provider, []);
      groups.get(m.provider)!.push(m);
    }
    const rows: {
      provider: string;
      priceAvg: number;
      iiAvg: number;
      count: number;
      commercialPct: number;
      freePct: number;
      speedAvg: number;
      dlAvg: number;
      likesAvg: number;
    }[] = [];
    for (const [provider, models] of groups) {
      const withPrice = models.filter(
        (m) => m.priceInputUsd !== null && m.priceOutputUsd !== null
      );
      const priceAvg =
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
          ? 0
          : withSpeed.reduce((s, m) => s + (m.speedTps ?? 0), 0) /
            withSpeed.length;
      const withDl = models.filter((m) => m.hfDownloads !== null && m.hfDownloads !== undefined);
      const dlAvg = withDl.length === 0 ? 0 : withDl.reduce((s, m) => s + (m.hfDownloads ?? 0), 0) / withDl.length;
      const withLikes = models.filter((m) => m.hfLikes !== null && m.hfLikes !== undefined);
      const likesAvg = withLikes.length === 0 ? 0 : withLikes.reduce((s, m) => s + (m.hfLikes ?? 0), 0) / withLikes.length;
      rows.push({
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
    return rows.sort((a, b) => b.count - a.count);
  }, [data]);

  // Timeline: II by quarter per provider (from releaseDate)
  const timelineData = useMemo(() => {
    if (!data) return [];
    type Quarter = { quarter: string; sortKey: number; [provider: string]: number | string };
    const map = new Map<string, Quarter>();
    for (const m of data.models) {
      if (!m.releaseDate || m.intelligenceIndex === null) continue;
      const d = new Date(m.releaseDate);
      const q = Math.floor(d.getMonth() / 3) + 1;
      const quarter = `${d.getFullYear()}-Q${q}`;
      const sortKey = d.getFullYear() * 10 + q;
      if (!map.has(quarter)) {
        map.set(quarter, { quarter, sortKey });
      }
      const entry = map.get(quarter)!;
      // Keep max II per provider per quarter
      const current = (entry as any)[m.provider] as number | undefined;
      if (current === undefined || m.intelligenceIndex > current) {
        (entry as any)[m.provider] = m.intelligenceIndex;
      }
    }
    return Array.from(map.values())
      .sort((a, b) => (a.sortKey as number) - (b.sortKey as number))
      .map(({ quarter, ...rest }) => ({ quarter, ...rest }));
  }, [data]);

  // Stacked bar: license distribution per provider (100% stacked)
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
          const count = models.filter((m) => m.license === lt).length;
          row[lt] = (count / models.length) * 100;
        }
        return row;
      })
      .filter((r) => (r as any)["api-paid"] !== undefined)
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

  const providersInTimeline = Array.from(
    new Set(data.models.map((m) => m.provider))
  ).slice(0, 6);

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
          <CardTitle className="text-base flex items-center gap-1.5">
            <Grid3x3 className="h-4 w-4 text-[var(--brand-primary)]" />
            Heatmap de proveedores
          </CardTitle>
          <CardDescription className="text-xs">
            Color intensity = valor relativo por columna · {heatmapRows.length} proveedores
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-default)]">
                <th className="px-3 py-2 text-left font-medium">Proveedor</th>
                <th className="px-3 py-2 text-right font-medium">Precio prom</th>
                <th className="px-3 py-2 text-right font-medium">II prom</th>
                <th className="px-3 py-2 text-right font-medium"># Modelos</th>
                <th className="px-3 py-2 text-right font-medium">% Comercial</th>
                <th className="px-3 py-2 text-right font-medium">% Gratis</th>
                <th className="px-3 py-2 text-right font-medium">Velocidad prom</th>
                <th className="px-3 py-2 text-right font-medium">⬇ DL prom</th>
                <th className="px-3 py-2 text-right font-medium">♥ Likes prom</th>
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
                    format={(v) => (v === 0 ? "Gratis" : `$${v.toFixed(2)}`)}
                    scheme="reverse" // lower = better (green)
                  />
                  <HeatmapCell
                    value={row.iiAvg}
                    format={(v) => v.toFixed(1)}
                    scheme="normal"
                  />
                  <HeatmapCell
                    value={row.count}
                    format={(v) => v.toFixed(0)}
                    scheme="normal"
                  />
                  <HeatmapCell
                    value={row.commercialPct}
                    format={(v) => `${v.toFixed(0)}%`}
                    scheme="normal"
                  />
                  <HeatmapCell
                    value={row.freePct}
                    format={(v) => `${v.toFixed(0)}%`}
                    scheme="normal"
                  />
                  <HeatmapCell
                    value={row.speedAvg}
                    format={(v) => `${v.toFixed(0)}`}
                    scheme="normal"
                  />
                  <HeatmapCell
                    value={row.dlAvg}
                    format={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v.toFixed(0)}`}
                    scheme="normal"
                  />
                  <HeatmapCell
                    value={row.likesAvg}
                    format={(v) => `${v.toFixed(0)}`}
                    scheme="normal"
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 2. Timeline chart */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <LineIcon className="h-4 w-4 text-[var(--color-teal)]" />
            Evolución del Intelligence Index por trimestre
          </CardTitle>
          <CardDescription className="text-xs">
            Máximo II alcanzado por proveedor · desde releaseDate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320} debounce={50}>
            <LineChart data={timelineData} margin={{ top: 10, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" />
              <XAxis
                dataKey="quarter"
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-default)" }}
              />
              <YAxis
                domain={[20, 60]}
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
                          .filter((p) => p.value !== undefined && p.value !== null)
                          .map((p, idx) => (
                            <div key={`${p.name}-${idx}`} className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: p.color }}
                              />
                              <span className="text-[var(--text-secondary)]">{p.name}</span>
                              <span className="num text-[var(--text-primary)] ml-auto">
                                {p.value}
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
              {providersInTimeline.map((p, i) => (
                <Line
                  key={`${p}-${i}`}
                  type="monotone"
                  dataKey={p}
                  stroke={PROVIDER_PALETTE[i % PROVIDER_PALETTE.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. Stacked bar (100%) license distribution */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-[var(--color-warning)]" />
            Distribución de licencias por proveedor
          </CardTitle>
          <CardDescription className="text-xs">
            Stack 100% · qué porcentaje de cada proveedor es comercial / condicional / pago
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320} debounce={50}>
            <BarChart
              data={licenseData}
              margin={{ top: 10, right: 16, bottom: 24, left: 8 }}
             
            >
              <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" vertical={false} />
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
                            <div key={`${p.name}-${idx}`} className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: p.color }}
                              />
                              <span className="text-[var(--text-secondary)]">{p.name}</span>
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
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
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

function HeatmapCell({
  value,
  format,
  scheme,
}: {
  value: number;
  format: (v: number) => string;
  scheme: "normal" | "reverse";
}) {
  // We can't easily know global max here, but parent gives raw values.
  // We'll color-code with thresholds:
  let bg = "transparent";
  let color = "var(--text-primary)";
  if (scheme === "normal") {
    if (value >= 75) {
      bg = "rgba(0, 214, 111, 0.25)";
      color = "var(--color-success)";
    } else if (value >= 50) {
      bg = "rgba(94, 106, 210, 0.18)";
      color = "var(--color-indigo)";
    } else if (value >= 25) {
      bg = "rgba(240, 191, 0, 0.18)";
      color = "var(--color-warning)";
    } else if (value > 0) {
      bg = "rgba(235, 87, 87, 0.15)";
      color = "var(--color-error)";
    }
  } else {
    // reverse: lower = better (green) — for prices
    if (value === 0) {
      bg = "rgba(0, 214, 111, 0.25)";
      color = "var(--color-success)";
    } else if (value < 1) {
      bg = "rgba(0, 214, 111, 0.20)";
      color = "var(--color-success)";
    } else if (value < 10) {
      bg = "rgba(240, 191, 0, 0.18)";
      color = "var(--color-warning)";
    } else if (value < 30) {
      bg = "rgba(252, 120, 64, 0.18)";
      color = "var(--color-orange)";
    } else {
      bg = "rgba(235, 87, 87, 0.18)";
      color = "var(--color-error)";
    }
  }
  return (
    <td
      className="px-3 py-2 text-right num font-medium"
      style={{ backgroundColor: bg, color }}
    >
      {format(value)}
    </td>
  );
}
