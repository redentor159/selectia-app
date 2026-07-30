"use client";

import { useMemo, useState } from "react";
import { useEffectiveDashboardData } from "@/hooks/use-effective-dashboard-data";
import { useDashboardStore } from "@/store/dashboard-store";
import { computeBlendedUsd } from "@/lib/format";
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
import {
  Users,
  Clock,
  DollarSign,
  Bot,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Wallet,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function SimuladorRoiView() {
  const { data, isLoading } = useEffectiveDashboardData();
  const { currency } = useDashboardStore();
  const currencyMeta = data?.currencies.find((c) => c.code === currency);
  // LIVE rate — never hardcode 3.714. PRD Módulo 8 line 1176.
  const rate = currencyMeta?.rateFromUsd ?? 1;
  const symbol = currencyMeta?.symbol ?? "S/.";

  const [teamSize, setTeamSize] = useState(10);
  const [weeklyHoursPerPerson, setWeeklyHoursPerPerson] = useState(8);
  // Hourly cost entered in the SELECTED currency (not hardcoded to PEN).
  const [hourlyCost, setHourlyCost] = useState(45);
  const [automationPct, setAutomationPct] = useState(60); // %
  // IA monthly cost per seat in the selected currency.
  const [iaCostPerSeat, setIaCostPerSeat] = useState(120);

  const calc = useMemo(() => {
    const totalWeeklyHours = teamSize * weeklyHoursPerPerson;
    const totalMonthlyHours = totalWeeklyHours * 4.33; // weeks/month
    // PRD line 1085: "Horas liberadas por mes" = totalMonthlyHours × automationPct
    const hoursFreed = totalMonthlyHours * (automationPct / 100);
    // PRD line 1086: "Valor económico de esas horas en Soles por mes"
    const economicValue = hoursFreed * hourlyCost;
    // PRD line 1087: "Costo de la IA por mes (del modelo seleccionado)"
    const iaMonthlyCost = teamSize * iaCostPerSeat;
    // PRD line 1088: "ROI = (Horas liberadas × Costo hora × Factor de automatización) / Costo IA"
    // hoursFreed already includes the automation factor, so ROI = economicValue / iaCost.
    const roiPct = iaMonthlyCost === 0 ? 0 : (economicValue / iaMonthlyCost) * 100;
    // Net monthly value (for payback + projection)
    const netMonthly = economicValue - iaMonthlyCost;
    // PRD line 1089: "Tiempo de recuperación de inversión en meses"
    const paybackMonths = netMonthly <= 0 ? Infinity : iaMonthlyCost / netMonthly;
    return {
      totalWeeklyHours,
      totalMonthlyHours,
      hoursFreed,
      economicValue,
      iaMonthlyCost,
      netMonthly,
      roiPct,
      paybackMonths,
    };
  }, [teamSize, weeklyHoursPerPerson, hourlyCost, automationPct, iaCostPerSeat]);

  const projectionData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      // Modest learning curve: economic value scales +2%/mes as team adopts IA
      const rampUp = 1 + 0.02 * i;
      const savings = calc.economicValue * rampUp;
      const cost = calc.iaMonthlyCost;
      const net = savings - cost;
      const cumulative = Array.from({ length: month }, (_, j) => {
        const r = 1 + 0.02 * j;
        return calc.economicValue * r - calc.iaMonthlyCost;
      }).reduce((a, b) => a + b, 0);
      return {
        month: `M${month}`,
        savings: Number(savings.toFixed(0)),
        cost: Number(cost.toFixed(0)),
        net: Number(net.toFixed(0)),
        cumulative: Number(cumulative.toFixed(0)),
      };
    });
  }, [calc]);

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-80" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          Simulador de ROI · Adopción de IA
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Calcula horas liberadas, valor económico y período de recuperación
        </p>
      </header>

      {/* Phase 4A.5 — BenchLM frontier price-drop banner (Función J del plan v2.0) */}
      {(() => {
        const stat = data.benchlmStats?.find((s) => s.statId === "frontier-price-drop");
        if (!stat) return null;
        return (
          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: "color-mix(in srgb, var(--color-success) 5%, transparent)",
              borderColor: "var(--color-success)",
            }}
          >
            <div className="flex items-start gap-3">
              <TrendingDown
                className="h-5 w-5 mt-0.5 flex-shrink-0"
                style={{ color: "var(--color-success)" }}
              />
              <div className="flex-1">
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {stat.sentence}
                </p>
                <a
                  href={stat.anchorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs underline"
                  style={{ color: "var(--brand-primary)" }}
                >
                  Fuente: BenchLM Token Price Index →
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Inputs */}
        <Card className="lg:col-span-2 bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-[var(--brand-primary)]" />
              Parámetros de tu equipo
            </CardTitle>
            <CardDescription className="text-xs">
              Ajusta según tu realidad operativa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <SliderInput
              icon={Users}
              label="Tamaño del equipo"
              value={teamSize}
              onChange={setTeamSize}
              min={1}
              max={200}
              step={1}
              unit="personas"
            />
            <SliderInput
              icon={Clock}
              label="Horas semanales en tareas IA-automatizables"
              value={weeklyHoursPerPerson}
              onChange={setWeeklyHoursPerPerson}
              min={1}
              max={40}
              step={1}
              unit="h/sol × persona"
            />
            <SliderInput
              icon={DollarSign}
              label={`Costo horario (${symbol})`}
              value={hourlyCost}
              onChange={setHourlyCost}
              min={15}
              max={250}
              step={5}
              unit={`${symbol} / h`}
            />
            <SliderInput
              icon={Bot}
              label="% de automatización con IA"
              value={automationPct}
              onChange={setAutomationPct}
              min={10}
              max={95}
              step={5}
              unit="%"
            />
            <SliderInput
              icon={Wallet}
              label={`Costo mensual de IA por persona (${symbol})`}
              value={iaCostPerSeat}
              onChange={setIaCostPerSeat}
              min={0}
              max={800}
              step={20}
              unit={`${symbol} / mes`}
            />
          </CardContent>
        </Card>

        {/* Outputs */}
        <Card className="lg:col-span-3 bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-[var(--color-success)]" />
              Resultados proyectados
            </CardTitle>
            <CardDescription className="text-xs">
              Cálculo mensual · no incluye impuestos ni depreciación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <OutputCard
                label="Horas liberadas / mes"
                value={calc.hoursFreed.toFixed(0)}
                unit="h"
                color="var(--color-teal)"
                icon={Clock}
              />
              <OutputCard
                label="Valor económico / mes"
                value={`${symbol} ${calc.economicValue.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`}
                color="var(--color-success)"
                icon={DollarSign}
              />
              <OutputCard
                label="Costo IA / mes"
                value={`${symbol} ${calc.iaMonthlyCost.toLocaleString("es-PE")}`}
                color="var(--color-error)"
                icon={Wallet}
              />
              <OutputCard
                label="Ganancia neta / mes"
                value={`${symbol} ${calc.netMonthly.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`}
                color={calc.netMonthly >= 0 ? "var(--color-success)" : "var(--color-error)"}
                icon={TrendingUp}
              />
              <OutputCard
                label="ROI mensual"
                value={`${calc.roiPct.toFixed(0)}%`}
                color={calc.roiPct >= 100 ? "var(--color-success)" : calc.roiPct >= 0 ? "var(--color-warning)" : "var(--color-error)"}
                icon={TrendingUp}
                big
              />
              <OutputCard
                label="Payback"
                value={
                  calc.paybackMonths === Infinity
                    ? "∞"
                    : `${calc.paybackMonths.toFixed(1)} m`
                }
                color={calc.paybackMonths <= 3 ? "var(--color-success)" : calc.paybackMonths <= 12 ? "var(--color-warning)" : "var(--color-error)"}
                icon={CalendarClock}
                big
              />
            </div>

            {/* Insight banner */}
            <div
              className="mt-4 rounded-lg border p-3 text-xs"
              style={{
                backgroundColor:
                  calc.netMonthly >= 0
                    ? "var(--color-success-bg)"
                    : "var(--color-error-bg)",
                borderColor:
                  calc.netMonthly >= 0
                    ? "var(--color-success-border)"
                    : "var(--color-error-border)",
                color:
                  calc.netMonthly >= 0
                    ? "var(--color-success)"
                    : "var(--color-error)",
              }}
            >
              {calc.netMonthly >= 0 ? (
                <>
                  ✅ Con esta configuración, la IA se paga sola en{" "}
                  <b>{calc.paybackMonths.toFixed(1)} meses</b> y genera un valor
                  neto de <b>{symbol} {calc.netMonthly.toLocaleString("es-PE", { maximumFractionDigits: 0 })}/mes</b>{" "}
                  (ROI {calc.roiPct.toFixed(0)}%).
                </>
              ) : (
                <>
                  ⚠️ Con esta configuración, el costo de IA supera al valor
                  liberado. Reduce el costo por persona o aumenta el % de
                  automatización.
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 12-month projection */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4 text-[var(--color-warning)]" />
            Proyección a 12 meses
          </CardTitle>
          <CardDescription className="text-xs">
            Ahorros (curva de aprendizaje +2%/mes) vs costo IA vs ganancia acumulada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={340} debounce={50}>
            <LineChart data={projectionData} margin={{ top: 10, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-default)" }}
              />
              <YAxis
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-default)" }}
                width={56}
                tickFormatter={(v) => `S/${(v / 1000).toFixed(0)}K`}
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
                        {payload.map((p, idx) => (
                          <div key={`${p.name}-${idx}`} className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: p.color }}
                            />
                            <span className="text-[var(--text-secondary)]">{p.name}</span>
                            <span className="num text-[var(--text-primary)] ml-auto">
                              {symbol} {(p.value as number).toLocaleString("es-PE")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
              <Line
                type="monotone"
                dataKey="savings"
                name="Ahorros"
                stroke="var(--color-success)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="cost"
                name="Costo IA"
                stroke="var(--color-error)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                name="Ganancia acumulada"
                stroke="var(--color-indigo)"
                strokeWidth={2.5}
                strokeDasharray="5 4"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function SliderInput({
  icon: Icon,
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs flex justify-between items-center">
        <span className="flex items-center gap-1.5">
          <Icon className="h-3 w-3 text-[var(--text-secondary)]" />
          {label}
        </span>
        <span className="num text-[var(--text-primary)] font-semibold">
          {value.toLocaleString("es-PE")} {unit}
        </span>
      </Label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--brand-accent)]"
      />
    </div>
  );
}

function OutputCard({
  label,
  value,
  unit,
  color,
  icon: Icon,
  big,
}: {
  label: string;
  value: string;
  unit?: string;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  big?: boolean;
}) {
  return (
    <div
      className="rounded-lg border p-3"
      style={{
        borderColor: `color-mix(in srgb, ${color} 25%, var(--border-default))`,
        backgroundColor: `color-mix(in srgb, ${color} 6%, var(--bg-elevated))`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3 w-3" style={{ color }} />
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
        </span>
      </div>
      <div
        className={`num font-bold ${big ? "text-2xl" : "text-lg"}`}
        style={{ color }}
      >
        {value}
        {unit && (
          <span className="text-xs text-[var(--text-secondary)] ml-1 font-normal">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
