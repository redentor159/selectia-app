"use client";

import { useMemo, useState } from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useDashboardStore } from "@/store/dashboard-store";
import { recommend } from "@/lib/engine/hre-topsis";
import { computeBlendedUsd, getIntelligenceColor } from "@/lib/format";
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
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  ArrowRight,
  PenLine,
  Calculator,
  Code2,
  ChevronDown,
  HelpCircle,
  Trophy,
  Sparkles,
} from "lucide-react";
import type { AIModel, TaskCategory } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

interface QuickCard {
  id: string;
  label: string;
  query: string;
  icon: LucideIcon;
  accent: string;
  category: TaskCategory;
}

const QUICK_CARDS: QuickCard[] = [
  {
    id: "texto",
    label: "Texto / Correos",
    query: "redactar correo profesional a cliente sobre orden de compra",
    icon: PenLine,
    accent: "var(--color-blue)",
    category: "redaccion",
  },
  {
    id: "calculos",
    label: "Cálculos / Análisis",
    query: "calcular roi de implementar ia para automatizar cotizaciones",
    icon: Calculator,
    accent: "var(--color-orange)",
    category: "calculos",
  },
  {
    id: "codigo",
    label: "Código",
    query: "generar g-code paramétrico para fresado de brida circular",
    icon: Code2,
    accent: "var(--color-success)",
    category: "programacion",
  },
];

export function IngenieroView() {
  const { data, isLoading } = useDashboardData();
  const { operationMode, setActiveView, setRecommendationQuery } =
    useDashboardStore();
  const [query, setQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  const quickResults = useMemo(() => {
    if (!data) return {};
    const out: Record<string, AIModel | null> = {};
    for (const card of QUICK_CARDS) {
      const result = recommend(card.query, data.models, operationMode);
      out[card.id] = result.winners[0]?.model ?? null;
    }
    return out;
  }, [data, operationMode]);

  // Top 8 prioritized by Intelligence Index (II)
  const topModels = useMemo(() => {
    if (!data) return [];
    return [...data.models]
      .filter((m) => m.active && m.intelligenceIndex !== null)
      .sort((a, b) => (b.intelligenceIndex ?? 0) - (a.intelligenceIndex ?? 0))
      .slice(0, 8);
  }, [data]);

  const handleSearch = (q?: string) => {
    const final = q ?? query;
    if (!final.trim()) return;
    setRecommendationQuery(final);
    setActiveView("recomendador");
  };

  const handleQuick = (card: QuickCard) => {
    setRecommendationQuery(card.query);
    setActiveView("recomendador");
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-14 w-full max-w-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          Recomendador Rápido · Ingeniero Industrial
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Encuentra el modelo correcto en menos de 30 segundos
        </p>
      </header>

      {/* Search bar */}
      <section className="relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(500px circle at 20% 0%, var(--brand-primary-subtle), transparent 60%)",
          }}
        />
        <div className="relative flex flex-col sm:flex-row gap-2 max-w-3xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Describe tu tarea: redactar, calcular, programar…"
              className="h-11 pl-10 pr-4 bg-[var(--bg-elevated)] border-[var(--border-strong)]"
            />
          </div>
          <Button
            onClick={() => handleSearch()}
            className="h-11 px-5 bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--on-accent)]"
          >
            Recomendar
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* Quick recommendation cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {QUICK_CARDS.map((card) => {
          const model = quickResults[card.id];
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              className="bg-[var(--bg-surface)] border-[var(--border-default)] card-hover cursor-pointer"
              onClick={() => handleQuick(card)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-md"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${card.accent} 12%, transparent)`,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: card.accent }} />
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                    {card.label}
                  </span>
                </div>
                {model ? (
                  <div className="flex items-center gap-2.5">
                    <ProviderLogo model={model} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {model.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] truncate">
                        {model.provider}
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0" />
                  </div>
                ) : (
                  <div className="text-xs text-[var(--text-disabled)]">Sin candidatos</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Prioritized table top 8 by II */}
      <section className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
        <header className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)]">
          <Trophy className="h-4 w-4 text-[var(--color-warning)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Top 8 por Intelligence Index
          </h2>
          <Badge variant="outline" className="ml-auto text-[10px]">
            Ordenado por II descendente
          </Badge>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border-default)]">
              <tr className="text-left text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="px-4 py-2.5 font-medium">Modelo</th>
                <th className="px-4 py-2.5 font-medium">Licencia</th>
                <th className="px-4 py-2.5 font-medium text-right">Precio</th>
                <th className="px-4 py-2.5 font-medium text-right">Intel.</th>
                <th className="px-4 py-2.5 font-medium text-right">Elo</th>
                <th className="px-4 py-2.5 font-medium text-right">Tier</th>
              </tr>
            </thead>
            <tbody>
              {topModels.map((m, idx) => {
                const blended = computeBlendedUsd(m);
                const tier = getTier(m);
                return (
                  <tr
                    key={m.id}
                    className="border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-overlay)] transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono text-[var(--text-disabled)] w-4">
                          {idx + 1}
                        </span>
                        <ProviderLogo model={m} size={24} />
                        <div className="min-w-0">
                          <div className="font-medium text-[var(--text-primary)] truncate">
                            {m.name}
                          </div>
                          <div className="text-[10px] text-[var(--text-secondary)]">
                            {m.provider}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <LicenseBadge
                        license={m.license}
                        licenseName={m.licenseName}
                        showLabel={false}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right num text-[var(--text-primary)]">
                      {blended === 0 ? (
                        <span className="text-[var(--color-success)]">Gratis</span>
                      ) : (
                        `$${blended.toFixed(2)}/M`
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className="num font-semibold"
                        style={{ color: getIntelligenceColor(m.intelligenceIndex) }}
                      >
                        {m.intelligenceIndex?.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right num text-[var(--text-secondary)]">
                      {m.elo ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <TierBadge tier={tier} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Help panel */}
      <Collapsible open={helpOpen} onOpenChange={setHelpOpen}>
        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CollapsibleTrigger asChild>
            <button
              className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[var(--bg-overlay)] transition-colors"
              aria-expanded={helpOpen}
            >
              <HelpCircle className="h-4 w-4 text-[var(--brand-primary)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                ¿Qué significa todo esto?
              </span>
              <ChevronDown
                className={`h-4 w-4 ml-auto text-[var(--text-secondary)] transition-transform ${
                  helpOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                    Inteligencia (II)
                  </h3>
                  <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                    Intelligence Index v4.1 de Artificial Analysis. Combina
                    MMLU-Pro, GPQA, AIME en 0-100. Mayor = mejor razonamiento.
                    Verde/azul = sobresaliente, amarillo = aceptable, rojo =
                    limitado.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-[var(--color-warning)]" />
                    Elo
                  </h3>
                  <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                    Puntuación de preferencia humana en Arena AI. Los humanos
                    votan a ciegas entre dos modelos. &gt;1400 = top, &gt;1300 =
                    bueno, &lt;1300 = básico.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Precio blended
                  </h3>
                  <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                    Promedio 70% input + 30% output en USD/M tokens. "Gratis"
                    significa tier gratuito disponible (Llama, Phi-4, Gemma).
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Tier
                  </h3>
                  <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                    Clasificación de costo-valor: <b>Avanzado</b> (&gt;$15/M con
                    II≥45), <b>Medio</b> ($1-15/M con II≥35), <b>Rápido</b>{" "}
                    (&lt;$1/M). Los tiers guían el routing automático.
                  </p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

function getTier(m: AIModel): "fast" | "medium" | "advanced" {
  const blended = computeBlendedUsd(m);
  const ii = m.intelligenceIndex ?? 0;
  if (blended > 15 && ii >= 45) return "advanced";
  if (blended >= 1 && blended <= 15 && ii >= 35) return "medium";
  if (blended < 1) return "fast";
  if (blended > 15) return "advanced";
  return "medium";
}

function TierBadge({ tier }: { tier: "fast" | "medium" | "advanced" }) {
  const map = {
    fast: {
      label: "Rápido",
      color: "var(--color-success)",
      bg: "var(--color-success-bg)",
      border: "var(--color-success-border)",
    },
    medium: {
      label: "Medio",
      color: "var(--color-warning)",
      bg: "var(--color-warning-bg)",
      border: "var(--color-warning-border)",
    },
    advanced: {
      label: "Avanzado",
      color: "var(--color-indigo)",
      bg: "rgba(94, 106, 210, 0.12)",
      border: "rgba(94, 106, 210, 0.25)",
    },
  } as const;
  const t = map[tier];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{ color: t.color, backgroundColor: t.bg, border: `1px solid ${t.border}` }}
    >
      {t.label}
    </span>
  );
}
