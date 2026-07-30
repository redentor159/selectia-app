"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useDashboardStore } from "@/store/dashboard-store";
import {
  traceRecommendation,
  TASK_CATEGORIES,
  CATEGORY_CANONICAL_QUERIES,
  type TaskCategory,
  type EngineTrace,
} from "@/lib/engine/hre-topsis";
import type { OperationMode } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlayCircle,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Search,
  Filter,
  Scale,
  BarChart3,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Info,
  Hash,
  ArrowDown,
  ArrowUp,
  Trophy,
  Layers,
  PenLine,
  FileText,
  Code2,
  Calculator,
  WifiOff,
  Zap,
  Globe,
  Bot,
  Target,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIModel } from "@/lib/types";

// ============================================================
// STEP DEFINITIONS — each step is a granular "pasito"
// ============================================================
// 36 substeps across 5 capas. Each step renders a dedicated
// component that receives the trace and shows the EXACT values
// computed at that step (no hardcoded numbers — every value is
// pulled from the live engine trace).
// ============================================================

interface StepDef {
  id: string;
  capa: number;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const STEPS: StepDef[] = [
  // CAPA 1 — Clasificación TF-IDF
  { id: "1.1", capa: 1, title: "Consulta original del usuario", shortTitle: "Consulta", icon: Search, color: "#5e6ad2" },
  { id: "1.2", capa: 1, title: "Normalización (lowercase + sin acentos + sin puntuación)", shortTitle: "Normalización", icon: Search, color: "#5e6ad2" },
  { id: "1.3", capa: 1, title: "Tokenización + filtro de stopwords", shortTitle: "Tokenización", icon: Hash, color: "#5e6ad2" },
  { id: "1.4", capa: 1, title: "Stemming Porter en español", shortTitle: "Stemming", icon: Layers, color: "#5e6ad2" },
  { id: "1.5", capa: 1, title: "TF — Term Frequency por stem", shortTitle: "TF", icon: BarChart3, color: "#5e6ad2" },
  { id: "1.6", capa: 1, title: "IDF — Inverse Document Frequency", shortTitle: "IDF", icon: BarChart3, color: "#5e6ad2" },
  { id: "1.7", capa: 1, title: "TF-IDF por categoría (8 categorías)", shortTitle: "TF-IDF × categoría", icon: BarChart3, color: "#5e6ad2" },
  { id: "1.8", capa: 1, title: "Detección de entidades", shortTitle: "Entidades", icon: Search, color: "#5e6ad2" },
  { id: "1.9", capa: 1, title: "Boosts por entidad (multiplicadores)", shortTitle: "Boosts", icon: ArrowUp, color: "#5e6ad2" },
  { id: "1.10", capa: 1, title: "Categoría ganadora + multi-intent", shortTitle: "Ganador", icon: Trophy, color: "#5e6ad2" },
  // CAPA 1.5 — Mode detection
  { id: "1.5b", capa: 1.5, title: "Detección de modo por keywords", shortTitle: "Modo", icon: Target, color: "#7c3aed" },
  // CAPA 2 — Hard Filters
  { id: "2.1", capa: 2, title: "Total de modelos en la base", shortTitle: "Total", icon: Filter, color: "#eb5757" },
  { id: "2.2", capa: 2, title: "Filtro: excluir research-only", shortTitle: "research-only", icon: Filter, color: "#eb5757" },
  { id: "2.3", capa: 2, title: "Filtro: excluir HF disabled", shortTitle: "HF disabled", icon: Filter, color: "#eb5757" },
  { id: "2.4", capa: 2, title: "Filtro Solo Gratis (si aplica)", shortTitle: "Solo Gratis", icon: Filter, color: "#eb5757" },
  { id: "2.5", capa: 2, title: "Filtros duros por categoría", shortTitle: "Por categoría", icon: Filter, color: "#eb5757" },
  { id: "2.6", capa: 2, title: "Quality gate (II / Elo / Coding)", shortTitle: "Quality gate", icon: Filter, color: "#eb5757" },
  // CAPA 3 — AHP
  { id: "3.1", capa: 3, title: "Selección del set de pesos", shortTitle: "Set de pesos", icon: Scale, color: "#f0bf00" },
  { id: "3.2", capa: 3, title: "Pesos por criterio (8 criterios)", shortTitle: "Pesos", icon: Scale, color: "#f0bf00" },
  { id: "3.3", capa: 3, title: "Verificación Σ pesos = 1.0", shortTitle: "Σ = 1", icon: Scale, color: "#f0bf00" },
  { id: "3.4", capa: 3, title: "Matriz pairwise AHP (reconstrucción)", shortTitle: "Matriz A[i][j]", icon: Scale, color: "#f0bf00" },
  { id: "3.5", capa: 3, title: "Cálculo de λ_max", shortTitle: "λ_max", icon: Scale, color: "#f0bf00" },
  { id: "3.6", capa: 3, title: "Cálculo de CI (Consistency Index)", shortTitle: "CI", icon: Scale, color: "#f0bf00" },
  { id: "3.7", capa: 3, title: "Cálculo de CR (Consistency Ratio)", shortTitle: "CR", icon: Scale, color: "#f0bf00" },
  // CAPA 4 — TOPSIS
  { id: "4.1", capa: 4, title: "Extracción de métricas (con imputación)", shortTitle: "Métricas", icon: BarChart3, color: "#68cc58" },
  { id: "4.2", capa: 4, title: "Normalización vectorial por columna", shortTitle: "Normalización", icon: BarChart3, color: "#68cc58" },
  { id: "4.3", capa: 4, title: "Matriz ponderada (× pesos AHP)", shortTitle: "× pesos", icon: BarChart3, color: "#68cc58" },
  { id: "4.4", capa: 4, title: "Solución ideal & anti-ideal", shortTitle: "Ideal/anti-ideal", icon: BarChart3, color: "#68cc58" },
  { id: "4.5", capa: 4, title: "Distancias euclidianas dBest, dWorst", shortTitle: "Distancias", icon: BarChart3, color: "#68cc58" },
  { id: "4.6", capa: 4, title: "Coeficiente de cercanía C", shortTitle: "C", icon: BarChart3, color: "#68cc58" },
  { id: "4.7", capa: 4, title: "Ranking final por C descendente", shortTitle: "Ranking", icon: Trophy, color: "#68cc58" },
  { id: "4.8", capa: 4, title: "Anti-'gratis malo' (umbral 70%)", shortTitle: "Anti-gratis-malo", icon: Filter, color: "#68cc58" },
  // CAPA 5 — Explanation
  { id: "5.1", capa: 5, title: "Top-3 criterios por peso", shortTitle: "Top-3 criterios", icon: MessageSquare, color: "#4ea7fc" },
  { id: "5.2", capa: 5, title: "Generación de razones", shortTitle: "Razones", icon: MessageSquare, color: "#4ea7fc" },
  { id: "5.3", capa: 5, title: "Detección de empate técnico", shortTitle: "Empate", icon: MessageSquare, color: "#4ea7fc" },
  { id: "5.4", capa: 5, title: "Explicación en lenguaje natural", shortTitle: "Explicación", icon: MessageSquare, color: "#4ea7fc" },
];

const CAPA_META: Record<number, { name: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  1: { name: "Capa 1 — Clasificación TF-IDF", color: "#5e6ad2", icon: Search },
  1.5: { name: "Capa 1.5 — Detección de modo", color: "#7c3aed", icon: Target },
  2: { name: "Capa 2 — Filtros Duros", color: "#eb5757", icon: Filter },
  3: { name: "Capa 3 — Matriz AHP + CR", color: "#f0bf00", icon: Scale },
  4: { name: "Capa 4 — Ranking TOPSIS", color: "#68cc58", icon: BarChart3 },
  5: { name: "Capa 5 — Explicación", color: "#4ea7fc", icon: MessageSquare },
};

const MODE_OPTIONS: Array<{ id: OperationMode; label: string }> = [
  { id: "mype", label: "MYPE" },
  { id: "equilibrado", label: "Equilibrado" },
  { id: "calidad", label: "Calidad máxima" },
  { id: "solo-gratis", label: "Solo Gratis" },
];

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PenLine, FileText, Code2, Calculator, WifiOff, Zap, Globe, Bot,
};

// ============================================================
// MAIN VIEW
// ============================================================

export function EngineAnimationView() {
  const { data, isLoading } = useDashboardData();
  const { operationMode, modeManuallySet } = useDashboardStore();

  const [localQuery, setLocalQuery] = useState("redactar correo a cliente sobre demora");
  const [submittedQuery, setSubmittedQuery] = useState(localQuery);
  const [localMode, setLocalMode] = useState<OperationMode>(operationMode);
  const [activeCategory, setActiveCategory] = useState<TaskCategory | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<1 | 2 | 4>(1);
  const [traceMode, setTraceMode] = useState(false);

  // Compute the trace whenever query or mode changes
  const trace = useMemo(() => {
    if (!data || !submittedQuery.trim()) return null;
    return traceRecommendation(submittedQuery, data.models, localMode, undefined, {
      manualModeOverride: modeManuallySet,
      queryText: submittedQuery,
    });
  }, [data, submittedQuery, localMode, modeManuallySet]);

  // Lookup map for original models — needed for provenance badges in
  // Step4_1 (Modo Traza) and the data-source footer in Step5_4.
  // trace.capa4.candidates only carries raw metrics + imputed flags, not
  // the underlying benchlm/zeroeval data, so we re-resolve by modelId.
  const modelsMap = useMemo(() => {
    const m = new Map<string, AIModel>();
    if (data) {
      for (const model of data.models) m.set(model.id, model);
    }
    return m;
  }, [data]);

  // Track the last query/mode we reset for, so we can reset the step counter
  // when they change — done via ref instead of useEffect to avoid the
  // setState-in-effect cascading render pattern.
  const lastResetKey = useMemo(() => ({ q: submittedQuery, m: localMode }), [submittedQuery, localMode]);
  const [prevResetKey, setPrevResetKey] = useState(lastResetKey);
  if (prevResetKey !== lastResetKey) {
    setPrevResetKey(lastResetKey);
    setCurrentStep(0);
    setPlaying(false);
  }

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    const delay = 1800 / playSpeed;
    const t = setTimeout(() => {
      setCurrentStep((s) => {
        if (s >= STEPS.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, delay);
    return () => clearTimeout(t);
  }, [playing, currentStep, playSpeed]);

  const handleSubmit = (q?: string) => {
    const final = q ?? localQuery;
    if (!final.trim()) return;
    setSubmittedQuery(final);
    setLocalQuery(final);
  };

  const handleCategoryClick = (cat: TaskCategory) => {
    const canonical = CATEGORY_CANONICAL_QUERIES[cat];
    setActiveCategory(cat);
    setLocalQuery(canonical);
    setSubmittedQuery(canonical);
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const totalSteps = STEPS.length;
  const step = STEPS[currentStep];
  const CapaIcon = CAPA_META[step.capa].icon;
  const StepIcon = step.icon;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Header */}
      <header className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <PlayCircle className="h-5 w-5 text-[var(--brand-primary)]" />
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Animación del Motor HRE-TOPSIS — Paso a Paso
          </h1>
          <Badge variant="outline" className="text-[10px] gap-1">
            <Info className="h-2.5 w-2.5" />
            Educativo
          </Badge>
          {trace && (
            <Badge variant="outline" className="text-[10px] gap-1 ml-auto">
              <Sparkles className="h-2.5 w-2.5" />
              {trace.computationTimeMs}ms · {totalSteps} pasos
            </Badge>
          )}
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Mira cómo el motor decide, pasito a pasito, con cada cálculo intermedio.
          Cambia la consulta o categoría para ver cómo se adapta dinámicamente.
        </p>
      </header>

      {/* Input controls */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
              <Input
                value={localQuery}
                onChange={(e) => {
                  setLocalQuery(e.target.value);
                  setActiveCategory(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Describe tu tarea…"
                className="h-11 pl-10 text-base bg-[var(--bg-elevated)] border-[var(--border-strong)]"
              />
            </div>
            <Button
              onClick={() => handleSubmit()}
              className="h-11 px-6 bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--on-accent)]"
            >
              Animar
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] self-center mr-1">
              Categoría:
            </span>
            {TASK_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.icon] ?? Target;
              const active = activeCategory === cat.id || trace?.capa1.winner.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    active
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Mode selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
              Modo:
            </span>
            {MODE_OPTIONS.map((m) => (
              <button
                key={m.id}
                onClick={() => setLocalMode(m.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  localMode === m.id
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"
                    : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {!trace ? (
        <Card className="bg-[var(--bg-surface)] border-dashed border-[var(--border-strong)]">
          <CardContent className="p-8 text-center">
            <Target className="h-8 w-8 mx-auto text-[var(--text-secondary)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">
              Ingresa una consulta para activar la animación.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Progress + controls */}
          <Card className="bg-[var(--bg-surface)] border-[var(--border-default)] sticky top-2 z-10 shadow-sm">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setCurrentStep(0); setPlaying(false); }}
                  className="h-8 w-8 p-0"
                  aria-label="Reiniciar"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  disabled={currentStep === 0}
                  className="h-8 w-8 p-0"
                  aria-label="Paso anterior"
                >
                  <SkipBack className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => setPlaying((p) => !p)}
                  disabled={currentStep === STEPS.length - 1}
                  className="h-8 px-4 bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--on-accent)]"
                >
                  {playing ? <Pause className="h-3.5 w-3.5 mr-1" /> : <PlayCircle className="h-3.5 w-3.5 mr-1" />}
                  {playing ? "Pausar" : "Reproducir"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))}
                  disabled={currentStep === STEPS.length - 1}
                  className="h-8 w-8 p-0"
                  aria-label="Paso siguiente"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </Button>
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Velocidad:</span>
                  {([1, 2, 4] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaySpeed(s)}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-mono border",
                        playSpeed === s
                          ? "bg-[var(--brand-primary-subtle)] border-[var(--brand-primary)] text-[var(--brand-primary)]"
                          : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)]"
                      )}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
                <div className="ml-auto text-xs num text-[var(--text-secondary)]">
                  Paso <span className="font-semibold text-[var(--text-primary)]">{currentStep + 1}</span> de {totalSteps}
                </div>
              </div>
              {/* Modo Traza toggle — Phase 4B.3.h */}
              <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-default)] mt-1">
                <button
                  onClick={() => setTraceMode((v) => !v)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    traceMode
                      ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                      : "border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                  style={traceMode ? { backgroundColor: "var(--brand-primary)" , color: "var(--bg-elevated)" } : { backgroundColor: "var(--bg-elevated)" }}
                  aria-pressed={traceMode}
                  aria-label="Activar Modo Traza — muestra la fuente de cada métrica"
                  title="Modo Traza: muestra la fuente de cada métrica (Artificial Analysis, BenchLM, ZeroEval, etc.)"
                >
                  <Search className="h-3 w-3" />
                  🔍 Modo Traza
                </button>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {traceMode
                    ? "ON — cada celda muestra su fuente de datos (provenance)"
                    : "OFF — vista educativa limpia (activa para auditar las fuentes)"}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${step.color}, ${step.color}cc)`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Two-column layout: rail + current step */}
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
            {/* Step rail */}
            <Card className="bg-[var(--bg-surface)] border-[var(--border-default)] lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto hidden lg:block">
              <CardContent className="p-2">
                {Object.keys(CAPA_META).map((capaKey) => {
                  const capa = Number(capaKey);
                  const meta = CAPA_META[capa];
                  const CapaIcon2 = meta.icon;
                  const capaSteps = STEPS.map((s, i) => ({ s, i })).filter(({ s }) => s.capa === capa);
                  if (capaSteps.length === 0) return null;
                  return (
                    <div key={capaKey} className="mb-3">
                      <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] uppercase tracking-wider font-semibold" style={{ color: meta.color }}>
                        <CapaIcon2 className="h-3 w-3" />
                        {meta.name}
                      </div>
                      <div className="space-y-0.5">
                        {capaSteps.map(({ s, i }) => {
                          const isCurrent = i === currentStep;
                          const isPast = i < currentStep;
                          const StepIc = s.icon;
                          return (
                            <button
                              key={s.id}
                              onClick={() => { setCurrentStep(i); setPlaying(false); }}
                              className={cn(
                                "w-full text-left flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                                isCurrent
                                  ? "bg-[var(--brand-primary-subtle)] text-[var(--text-primary)] font-medium"
                                  : isPast
                                  ? "text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]"
                                  : "text-[var(--text-disabled)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-secondary)]"
                              )}
                              style={isCurrent ? { borderLeft: `2px solid ${s.color}` } : { borderLeft: "2px solid transparent" }}
                            >
                              <span className={cn(
                                "inline-flex items-center justify-center h-4 min-w-4 rounded text-[9px] font-mono shrink-0",
                                isCurrent ? "text-white" : isPast ? "opacity-60" : "opacity-40"
                              )} style={isCurrent ? { backgroundColor: s.color } : {}}>
                                {isPast ? "✓" : s.id.split(".")[1]}
                              </span>
                              <span className="truncate">{s.shortTitle}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Current step content */}
            <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]" style={{ borderColor: step.color }}>
              <CardHeader className="pb-3 border-b border-[var(--border-default)]" style={{ backgroundColor: `color-mix(in srgb, ${step.color} 6%, transparent)` }}>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg shrink-0"
                    style={{ backgroundColor: `color-mix(in srgb, ${step.color} 15%, transparent)`, color: step.color }}
                  >
                    <StepIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: step.color, color: step.color }}>
                        {CAPA_META[step.capa].name.split("—")[0].trim()}
                      </Badge>
                      <span className="text-[10px] num text-[var(--text-secondary)]">paso {step.id}</span>
                    </div>
                    <CardTitle className="text-sm font-semibold mt-0.5">{step.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 animate-fade-in" key={currentStep}>
                <StepRenderer step={step} trace={trace} modelsMap={modelsMap} traceMode={traceMode} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// STEP RENDERER — dispatches to the right component per step id
// ============================================================

function StepRenderer({
  step,
  trace,
  modelsMap,
  traceMode,
}: {
  step: StepDef;
  trace: EngineTrace;
  modelsMap: Map<string, AIModel>;
  traceMode: boolean;
}) {
  switch (step.id) {
    case "1.1": return <Step1_1 trace={trace} />;
    case "1.2": return <Step1_2 trace={trace} />;
    case "1.3": return <Step1_3 trace={trace} />;
    case "1.4": return <Step1_4 trace={trace} />;
    case "1.5": return <Step1_5 trace={trace} />;
    case "1.6": return <Step1_6 trace={trace} />;
    case "1.7": return <Step1_7 trace={trace} />;
    case "1.8": return <Step1_8 trace={trace} />;
    case "1.9": return <Step1_9 trace={trace} />;
    case "1.10": return <Step1_10 trace={trace} />;
    case "1.5b": return <Step1_5b trace={trace} />;
    case "2.1": return <Step2_1 trace={trace} />;
    case "2.2": return <Step2_2 trace={trace} />;
    case "2.3": return <Step2_3 trace={trace} />;
    case "2.4": return <Step2_4 trace={trace} />;
    case "2.5": return <Step2_5 trace={trace} />;
    case "2.6": return <Step2_6 trace={trace} />;
    case "3.1": return <Step3_1 trace={trace} />;
    case "3.2": return <Step3_2 trace={trace} />;
    case "3.3": return <Step3_3 trace={trace} />;
    case "3.4": return <Step3_4 trace={trace} />;
    case "3.5": return <Step3_5 trace={trace} />;
    case "3.6": return <Step3_6 trace={trace} />;
    case "3.7": return <Step3_7 trace={trace} />;
    case "4.1": return <Step4_1 trace={trace} modelsMap={modelsMap} traceMode={traceMode} />;
    case "4.2": return <Step4_2 trace={trace} />;
    case "4.3": return <Step4_3 trace={trace} />;
    case "4.4": return <Step4_4 trace={trace} />;
    case "4.5": return <Step4_5 trace={trace} />;
    case "4.6": return <Step4_6 trace={trace} />;
    case "4.7": return <Step4_7 trace={trace} />;
    case "4.8": return <Step4_8 trace={trace} />;
    case "5.1": return <Step5_1 trace={trace} />;
    case "5.2": return <Step5_2 trace={trace} />;
    case "5.3": return <Step5_3 trace={trace} />;
    case "5.4": return <Step5_4 trace={trace} modelsMap={modelsMap} />;
    default: return null;
  }
}

// ============================================================
// SHARED UI HELPERS
// ============================================================

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] px-3 py-2 text-xs font-mono text-[var(--text-primary)] my-2">
      {children}
    </div>
  );
}

function OutputBox({ label, children, color = "var(--color-success)" }: { label: string; children: React.ReactNode; color?: string }) {
  return (
    <div className="rounded-md border p-3 my-2" style={{ borderColor: `color-mix(in srgb, ${color} 30%, var(--border-default))`, backgroundColor: `color-mix(in srgb, ${color} 5%, transparent)` }}>
      <div className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color }}>
        {label}
      </div>
      <div className="text-xs text-[var(--text-primary)]">{children}</div>
    </div>
  );
}

function KV({ k, v, mono = false, highlight = false }: { k: string; v: React.ReactNode; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-3 py-0.5">
      <span className="text-xs text-[var(--text-secondary)]">{k}</span>
      <span className={cn("text-xs", mono && "font-mono", highlight && "font-semibold text-[var(--text-primary)]")}>{v}</span>
    </div>
  );
}

// ============================================================
// CAPA 1 STEP COMPONENTS
// ============================================================

function Step1_1({ trace }: { trace: EngineTrace }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        El usuario describe su tarea en lenguaje natural. Esta consulta es la entrada
        a toda la pipeline. El motor no asume nada — cada palabra se procesará.
      </p>
      <OutputBox label="Entrada del usuario" color="var(--brand-primary)">
        <div className="text-base font-medium">"{trace.capa1.rawQuery}"</div>
      </OutputBox>
      <div className="text-[10px] text-[var(--text-disabled)]">
        Longitud: {trace.capa1.rawQuery.length} caracteres · Modo solicitado: <b>{trace.capa1_5.requestedMode}</b>
      </div>
    </div>
  );
}

function Step1_2({ trace }: { trace: EngineTrace }) {
  const raw = trace.capa1.rawQuery;
  const norm = trace.capa1.normalized;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Se normaliza la consulta para reducir variabilidad: lowercase, quitar acentos
        (NFD + strip combining marks), reemplazar puntuación por espacios, y colapsar
        espacios múltiples.
      </p>
      <Formula>normalize(q) = stripAccents(lowercase(q)).replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim()</Formula>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">Antes</div>
          <div className="text-xs font-mono text-[var(--text-primary)] break-words">{raw}</div>
        </div>
        <div className="rounded-md border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-success)] mb-1">Después</div>
          <div className="text-xs font-mono text-[var(--text-primary)] break-words">{norm}</div>
        </div>
      </div>
      <OutputBox label="Output" color="var(--color-success)">
        Consulta normalizada lista para tokenizar
      </OutputBox>
    </div>
  );
}

function Step1_3({ trace }: { trace: EngineTrace }) {
  const raw = trace.capa1.tokensRaw;
  const filtered = trace.capa1.tokensFiltered;
  const removed = raw.filter((t) => !filtered.includes(t));
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Se divide por espacios. Luego se filtran: (a) tokens de 1 carácter, (b) stopwords
        españolas (artículos, preposiciones, conjunciones). Esto evita que palabras vacías
        como "sin" o "para" produzcan falsos positivos.
      </p>
      <Formula>tokens = normalized.split(" ").filter(w =&gt; w.length &gt; 1 &amp;&amp; !STOPWORDS.has(w))</Formula>
      <div className="space-y-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">Tokens crudos ({raw.length})</div>
          <div className="flex flex-wrap gap-1">
            {raw.map((t, i) => (
              <span key={i} className="rounded px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-secondary)]">{t}</span>
            ))}
          </div>
        </div>
        {removed.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-error)] mb-1">Stopwords/tokens cortos eliminados ({removed.length})</div>
            <div className="flex flex-wrap gap-1">
              {removed.map((t, i) => (
                <span key={i} className="rounded px-1.5 py-0.5 text-[10px] font-mono line-through bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-[var(--color-error)]">{t}</span>
              ))}
            </div>
          </div>
        )}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-success)] mb-1">Tokens finales ({filtered.length})</div>
          <div className="flex flex-wrap gap-1">
            {filtered.map((t, i) => (
              <span key={i} className="rounded px-1.5 py-0.5 text-[10px] font-mono bg-[var(--color-success-bg)] border border-[var(--color-success-border)] text-[var(--color-success)]">{t}</span>
            ))}
          </div>
        </div>
      </div>
      <OutputBox label="Output" color="var(--color-success)">
        {filtered.length} tokens significativos listos para stemming
      </OutputBox>
    </div>
  );
}

function Step1_4({ trace }: { trace: EngineTrace }) {
  const stems = trace.capa1.stemmedTokens;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Cada token se reduce a su raíz (stem) con el algoritmo Snowball-inspired Spanish
        Porter. Esto unifica familias de palabras: <span className="font-mono">redactar / redacción / redacté</span> → <span className="font-mono">redact</span>.
        Reglas: plurales (-s/-es/-os/-as), femenino (-a), -ción/-sión, -mente, infinitivos, participios, gerundios.
      </p>
      <Formula>stemWord(w) = aplicar SUFFIX_RULES (longest-match-first, ordenadas ~70 reglas)</Formula>
      <div className="rounded-md border border-[var(--border-default)] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[var(--bg-elevated)] text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
            <tr>
              <th className="text-left px-2.5 py-1.5 font-medium">Token original</th>
              <th className="text-left px-2.5 py-1.5 font-medium">Stem resultante</th>
              <th className="text-left px-2.5 py-1.5 font-medium">Regla aplicada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {stems.map((s, i) => {
              // detect which rule was applied by comparing original & stem
              let rule = "—";
              if (s.token !== s.stem) {
                const diff = s.token.length - s.stem.length;
                const suffix = s.token.slice(s.token.length - diff);
                rule = `-${suffix} → ${suffix === "ar" || suffix === "er" || suffix === "ir" ? "∅ (infinitivo)" : suffix === "cion" || suffix === "ación" ? "∅ (-ción)" : "∅"}`;
              } else {
                rule = "sin cambio (≤3 chars)";
              }
              return (
                <tr key={i}>
                  <td className="px-2.5 py-1.5 font-mono text-[var(--text-primary)]">{s.token}</td>
                  <td className="px-2.5 py-1.5 font-mono text-[var(--brand-primary)] font-semibold">{s.stem}</td>
                  <td className="px-2.5 py-1.5 text-[var(--text-secondary)] text-[10px]">{rule}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <OutputBox label="Output" color="var(--color-success)">
        {stems.length} stems únicos: [{stems.map((s) => s.stem).join(", ")}]
      </OutputBox>
    </div>
  );
}

function Step1_5({ trace }: { trace: EngineTrace }) {
  const stems = trace.capa1.stemmedTokens;
  const total = trace.capa1.totalTokens;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Para cada stem, se cuenta cuántas veces aparece en la consulta y se divide por el
        total de tokens. Esto da la <b>frecuencia relativa</b>: qué tan prominente es cada
        término en esta consulta específica.
      </p>
      <Formula>TF(stem) = count(stem) / |tokens|</Formula>
      <div className="rounded-md border border-[var(--border-default)] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[var(--bg-elevated)] text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
            <tr>
              <th className="text-left px-2.5 py-1.5 font-medium">Stem</th>
              <th className="text-right px-2.5 py-1.5 font-medium">count</th>
              <th className="text-right px-2.5 py-1.5 font-medium">|tokens|</th>
              <th className="text-left px-2.5 py-1.5 font-medium w-1/2">TF = count / |tokens|</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {stems.map((s, i) => (
              <tr key={i}>
                <td className="px-2.5 py-1.5 font-mono text-[var(--brand-primary)] font-semibold">{s.stem}</td>
                <td className="px-2.5 py-1.5 text-right num">{s.count}</td>
                <td className="px-2.5 py-1.5 text-right num text-[var(--text-secondary)]">{total}</td>
                <td className="px-2.5 py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
                      <div className="h-full bg-[var(--brand-primary)]" style={{ width: `${(s.tf * 100)}%` }} />
                    </div>
                    <span className="num text-[10px] text-[var(--text-secondary)] w-12 text-right">{s.tf.toFixed(3)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <OutputBox label="Output" color="var(--color-success)">
        Mapa TF: {"{"} {stems.map((s) => `${s.stem}: ${s.tf.toFixed(3)}`).join(", ")} {"}"}
      </OutputBox>
    </div>
  );
}

function Step1_6({ trace }: { trace: EngineTrace }) {
  const stems = trace.capa1.stemmedTokens;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        El IDF mide qué tan <b>distintivo</b> es cada stem. Un stem que aparece en muchas
        categorías (df alto) tiene IDF bajo (no ayuda a discriminar). Un stem único a una
        categoría tiene IDF alto. Fórmula suavizada (siempre &gt; 0):
      </p>
      <Formula>IDF(stem) = log((N+1) / (df+0.5)) + 1, donde N=8 categorías</Formula>
      <div className="rounded-md border border-[var(--border-default)] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[var(--bg-elevated)] text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
            <tr>
              <th className="text-left px-2.5 py-1.5 font-medium">Stem</th>
              <th className="text-right px-2.5 py-1.5 font-medium">df (en cuántas categorías aparece)</th>
              <th className="text-right px-2.5 py-1.5 font-medium">IDF</th>
              <th className="text-left px-2.5 py-1.5 font-medium w-1/3">Interpretación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {stems.map((s, i) => {
              const interp = s.df === 0 ? "No está en ningún keyword set (IDF por defecto = 1)" : s.df === 1 ? "Muy distintivo — aparece en 1 sola categoría" : s.df <= 3 ? "Moderadamente distintivo" : "Poco distintivo — aparece en muchas categorías";
              return (
                <tr key={i}>
                  <td className="px-2.5 py-1.5 font-mono text-[var(--brand-primary)] font-semibold">{s.stem}</td>
                  <td className="px-2.5 py-1.5 text-right num">{s.df}</td>
                  <td className="px-2.5 py-1.5 text-right num font-semibold text-[var(--text-primary)]">{s.idf.toFixed(3)}</td>
                  <td className="px-2.5 py-1.5 text-[10px] text-[var(--text-secondary)]">{interp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <OutputBox label="Output" color="var(--color-success)">
        Valores IDF precomputados a partir del corpus de 8 categorías × ~15 keywords c/u
      </OutputBox>
    </div>
  );
}

function Step1_7({ trace }: { trace: EngineTrace }) {
  const scores = trace.capa1.categoryScores;
  const maxScore = Math.max(...scores.map((s) => s.finalScore), 0.001);
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Para cada una de las 8 categorías, se suma TF×IDF de los stems del query que
        coinciden con keywords de esa categoría. Luego se normaliza por el # de keywords
        (para no sesgar a categorías con listas largas) y se multiplica por 100.
      </p>
      <Formula>score(cat) = (Σ TF(s) × IDF(s) para s ∈ stems∩keywords_cat) / |keywords_cat| × 100</Formula>
      <div className="space-y-1.5">
        {scores.map((c, i) => (
          <div key={c.category} className="space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium text-[var(--text-primary)] w-44 shrink-0 truncate">{c.label}</span>
              <div className="flex-1 h-5 rounded-md bg-[var(--bg-overlay)] overflow-hidden relative">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(c.finalScore / maxScore) * 100}%`,
                    background: i === 0 ? "var(--brand-primary)" : `color-mix(in srgb, var(--brand-primary) ${30 + (1 - i / scores.length) * 50}%, transparent)`,
                  }}
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] num font-mono text-[var(--text-primary)]">
                  {c.finalScore.toFixed(3)}
                </span>
              </div>
              {i === 0 && (
                <Badge className="text-[9px] gap-0.5 bg-[var(--brand-primary)] text-white">
                  <Trophy className="h-2.5 w-2.5" /> ganador
                </Badge>
              )}
            </div>
            {c.matchedStems.length > 0 && (
              <div className="text-[10px] text-[var(--text-disabled)] pl-44">
                stems coincidentes: [{c.matchedStems.join(", ")}] · tfidfSum={c.tfidfSum.toFixed(4)} · boost=×{c.entityBoostMultiplier.toFixed(1)} · raw={c.rawScore.toFixed(2)}
              </div>
            )}
          </div>
        ))}
      </div>
      <OutputBox label="Output" color="var(--brand-primary)">
        Categoría ganadora: <b>{trace.capa1.winner.label}</b> (score {trace.capa1.winner.score.toFixed(3)})
      </OutputBox>
    </div>
  );
}

function Step1_8({ trace }: { trace: EngineTrace }) {
  const e = trace.capa1.entities;
  const entities = [
    { key: "hasNumbers", label: "Números detectados", value: e.hasNumbers, hint: "/\\d+/ — sugiere cálculo o contexto numérico" },
    { key: "hasCurrency", label: "Moneda mencionada", value: e.hasCurrency, hint: "S/. | soles | USD | $ | PEN | euros | €" },
    { key: "hasTimeConstraint", label: "Restricción de tiempo", value: e.hasTimeConstraint, hint: "urgente | inmediato | rápido | ahora | ya" },
    { key: "hasDocumentType", label: "Tipo de documento", value: e.hasDocumentType, hint: "pdf | manual | plano | contrato | norma | iso" },
    { key: "hasMaterial", label: "Material industrial", value: e.hasMaterial, hint: "acero | cobre | aluminio | tornillo | brida | metal" },
    { key: "hasLanguage", label: "Idioma mencionado", value: e.hasLanguage, hint: "inglés | chino | mandarín | portugués | alemán | francés" },
  ];
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Paralelamente al TF-IDF, el motor escanea la consulta por patrones de entidades
        (regex). Estas entidades se usarán en el siguiente paso para aplicar boosts
        (multiplicadores) a categorías específicas.
      </p>
      {e.contextSizeHint !== null && (
        <div className="rounded-md border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-3 py-2 text-xs">
          <span className="font-semibold text-[var(--color-warning)]">Context size hint detectado:</span>{" "}
          <span className="text-[var(--text-secondary)]">{e.contextSizeHint.toLocaleString("es-PE")} tokens estimados (extraído de "N páginas × 1500 tokens")</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {entities.map((ent) => (
          <div key={ent.key} className={cn(
            "rounded-md border p-2.5 flex items-start gap-2",
            ent.value
              ? "border-[var(--color-success-border)] bg-[var(--color-success-bg)]"
              : "border-[var(--border-default)] bg-[var(--bg-overlay)]"
          )}>
            {ent.value ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)] mt-0.5 shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-[var(--text-disabled)] mt-0.5 shrink-0" />
            )}
            <div className="min-w-0">
              <div className={cn("text-xs font-medium", ent.value ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                {ent.label}
              </div>
              <div className="text-[10px] font-mono text-[var(--text-disabled)] truncate">{ent.hint}</div>
            </div>
          </div>
        ))}
      </div>
      <OutputBox label="Output" color="var(--color-success)">
        {entities.filter((e) => e.value).length} entidades detectadas · contextHint = {e.contextSizeHint === null ? "null" : e.contextSizeHint.toLocaleString("es-PE")}
      </OutputBox>
    </div>
  );
}

function Step1_9({ trace }: { trace: EngineTrace }) {
  const scores = trace.capa1.categoryScores;
  const withBoost = scores.filter((s) => s.entityBoostMultiplier > 1);
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Las entidades detectadas actúan como multiplicadores sobre el score TF-IDF de
        categorías específicas. La lógica: si la entidad está presente Y la categoría
        se beneficia de ella, multiplica el score. Esto premia coincidencias múltiples.
      </p>
      <Formula>finalScore(cat) = rawScore(cat) × boost(cat, entities)</Formula>
      <div className="rounded-md border border-[var(--border-default)] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[var(--bg-elevated)] text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
            <tr>
              <th className="text-left px-2.5 py-1.5 font-medium">Categoría</th>
              <th className="text-right px-2.5 py-1.5 font-medium">rawScore</th>
              <th className="text-right px-2.5 py-1.5 font-medium">boost</th>
              <th className="text-right px-2.5 py-1.5 font-medium">finalScore</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {scores.slice(0, 6).map((c) => (
              <tr key={c.category} className={c.entityBoostMultiplier > 1 ? "bg-[var(--color-warning-bg)]" : ""}>
                <td className="px-2.5 py-1.5 text-[var(--text-primary)]">{c.label}</td>
                <td className="px-2.5 py-1.5 text-right num text-[var(--text-secondary)]">{c.rawScore.toFixed(3)}</td>
                <td className="px-2.5 py-1.5 text-right num font-semibold" style={{ color: c.entityBoostMultiplier > 1 ? "var(--color-warning)" : "var(--text-secondary)" }}>
                  ×{c.entityBoostMultiplier.toFixed(1)}
                </td>
                <td className="px-2.5 py-1.5 text-right num font-semibold text-[var(--text-primary)]">{c.finalScore.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {withBoost.length > 0 ? (
        <div className="text-[10px] text-[var(--text-secondary)]">
          <b>{withBoost.length}</b> categorías recibieron boost: {withBoost.map((c) => `${c.label} (×${c.entityBoostMultiplier.toFixed(1)})`).join(", ")}
        </div>
      ) : (
        <div className="text-[10px] text-[var(--text-disabled)] italic">
          Ninguna categoría recibió boost (no se detectaron entidades relevantes).
        </div>
      )}
      <OutputBox label="Output" color="var(--color-success)">
        Scores finales calculados para las 8 categorías
      </OutputBox>
    </div>
  );
}

function Step1_10({ trace }: { trace: EngineTrace }) {
  const scores = trace.capa1.categoryScores;
  const winner = trace.capa1.winner;
  const multi = trace.capa1.multiIntent;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        La categoría con mayor finalScore gana. Además, si la 2da categoría tiene score
        ≥ 50% del primero, se marca como <b>multi-intent</b>: el motor reconoce que la
        consulta tiene dos intenciones relevantes y las divide en pesos.
      </p>
      <Formula>multiIntent = score[1] ≥ 0.5 × score[0] ? [w1, w2] : null</Formula>
      <div className="rounded-md border p-3" style={{ borderColor: "var(--brand-primary)", backgroundColor: "var(--brand-primary-subtle)" }}>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[var(--brand-primary)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">{winner.label}</span>
          <Badge className="text-[10px] bg-[var(--brand-primary)] text-white">score {winner.score.toFixed(3)}</Badge>
        </div>
      </div>
      {multi ? (
        <div className="rounded-md border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-3 py-2 text-xs">
          <span className="font-semibold text-[var(--color-warning)]">Multi-intent detectado:</span>{" "}
          <span className="text-[var(--text-secondary)]">
            {multi[0].category} ({(multi[0].weight * 100).toFixed(0)}%) + {multi[1].category} ({(multi[1].weight * 100).toFixed(0)}%)
          </span>
        </div>
      ) : (
        <div className="text-[10px] text-[var(--text-disabled)] italic">
          No hay multi-intent (2da categoría &lt; 50% del score ganador).
        </div>
      )}
      <OutputBox label="Output — Categoría para las próximas capas" color="var(--brand-primary)">
        <b>{winner.label}</b> · score={winner.score.toFixed(3)} · multiIntent={multi ? "sí" : "no"}
      </OutputBox>
    </div>
  );
}

// ============================================================
// CAPA 1.5 — Mode detection
// ============================================================

function Step1_5b({ trace }: { trace: EngineTrace }) {
  const m = trace.capa1_5;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Antes de aplicar filtros, el motor revisa si la consulta contiene keywords que
        sugieran un modo distinto al del perfil. Prioridad: (1) toggle manual del usuario
        &gt; (2) modo del perfil &gt; (3) keyword detectado.
      </p>
      <Formula>si !manualOverride: scan(query) → si match "gratis/mype/sin tarjeta" → solo-gratis; "calidad máxima/profesional" → calidad; "equilibrado/balanceado" → equilibrado</Formula>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Modo solicitado</div>
          <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{m.requestedMode}</div>
        </div>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Override manual</div>
          <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{m.manualOverride ? "sí" : "no"}</div>
        </div>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Keyword detectada</div>
          <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{m.matchedKeyword ?? "—"}</div>
        </div>
      </div>
      <div className="rounded-md border p-3" style={{ borderColor: "var(--brand-primary)", backgroundColor: "var(--brand-primary-subtle)" }}>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[var(--brand-primary)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Modo activo: {m.activeMode}
          </span>
          <Badge variant="outline" className="text-[10px]">
            fuente: {m.modeSource}
          </Badge>
        </div>
        <div className="text-[10px] text-[var(--text-secondary)] mt-1">
          {m.modeSource === "manual" && "El usuario cambió el modo explícitamente — respetamos su elección."}
          {m.modeSource === "profile" && "El modo vino del perfil activo — no se detectaron keywords override."}
          {m.modeSource === "keyword" && `Se detectó "${m.matchedKeyword}" en la consulta — el modo se sobreescribe solo para esta recomendación.`}
        </div>
      </div>
      <OutputBox label="Output" color="var(--brand-primary)">
        activeMode = <b>{m.activeMode}</b> · modeSource = <b>{m.modeSource}</b>
      </OutputBox>
    </div>
  );
}

// ============================================================
// CAPA 2 — Hard Filters
// ============================================================

function Step2_1({ trace }: { trace: EngineTrace }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Partimos del total de modelos en la base de datos. Cada filtro posterior
        reducirá este conjunto aplicando reglas no negociables.
      </p>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-3 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Total modelos</div>
          <div className="text-2xl font-bold num text-[var(--text-primary)] mt-1">{trace.capa2.totalModels}</div>
        </div>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-3 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Categoría</div>
          <div className="text-sm font-semibold text-[var(--text-primary)] mt-1.5">{trace.capa1.winner.label}</div>
        </div>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-3 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Modo activo</div>
          <div className="text-sm font-semibold text-[var(--text-primary)] mt-1.5">{trace.capa1_5.activeMode}</div>
        </div>
      </div>
      <OutputBox label="Estado inicial" color="var(--color-warning)">
        {trace.capa2.totalModels} modelos serán filtrados
      </OutputBox>
    </div>
  );
}

function Step2_2({ trace }: { trace: EngineTrace }) {
  return <FilterStep trace={trace} stepIdx={0} />;
}
function Step2_3({ trace }: { trace: EngineTrace }) {
  return <FilterStep trace={trace} stepIdx={1} />;
}
function Step2_4({ trace }: { trace: EngineTrace }) {
  const hasSoloGratis = trace.capa2.filters.some((f) => f.rule.includes("freeAccess"));
  if (!hasSoloGratis) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Este filtro solo aplica en modo <b>Solo Gratis</b>. El modo activo es{" "}
          <b>{trace.capa1_5.activeMode}</b>, así que se omite.
        </p>
        <div className="rounded-md border border-dashed border-[var(--border-default)] bg-[var(--bg-overlay)] p-3 text-xs text-[var(--text-disabled)] italic text-center">
          Filtro omitido (no aplica para modo {trace.capa1_5.activeMode})
        </div>
      </div>
    );
  }
  return <FilterStep trace={trace} stepIdx={2} />;
}
function Step2_5({ trace }: { trace: EngineTrace }) {
  const idx = trace.capa2.filters.findIndex((f) => f.rule.startsWith("category-specific"));
  return <FilterStep trace={trace} stepIdx={idx} />;
}

function FilterStep({ trace, stepIdx }: { trace: EngineTrace; stepIdx: number }) {
  const filter = trace.capa2.filters[stepIdx];
  if (!filter) {
    return <div className="text-xs text-[var(--text-disabled)]">Sin datos para este paso.</div>;
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{filter.description}</p>
      <Formula>regla: {filter.rule}</Formula>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Antes</div>
          <div className="text-xl font-bold num text-[var(--text-primary)]">{filter.remaining + filter.eliminated}</div>
        </div>
        <div className="rounded-md border border-[var(--color-error-border)] bg-[var(--color-error-bg)] p-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-error)]">Eliminados</div>
          <div className="text-xl font-bold num text-[var(--color-error)]">−{filter.eliminated}</div>
        </div>
        <div className="rounded-md border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-success)]">Restantes</div>
          <div className="text-xl font-bold num text-[var(--color-success)]">{filter.remaining}</div>
        </div>
      </div>
      <OutputBox label="Output" color="var(--color-success)">
        {filter.remaining} modelos pasan este filtro
      </OutputBox>
    </div>
  );
}

function Step2_6({ trace }: { trace: EngineTrace }) {
  const q = trace.capa2.qualityGate;
  // v3.3.1 bug #14: detectar si se aplicó el piso de calidad (quality-floor filter)
  const floorFilter = trace.capa2.filters.find((f) => f.rule.startsWith("quality-floor"));
  const hasFloor = floorFilter != null;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Un modelo sin datos verificados (sin II, sin Elo, sin Coding) no puede ser
        recomendado responsablemente. El quality gate exige al menos una de estas
        señales — excepto para modelos genuinamente gratuitos, que pasan porque su
        valor es $0 (no hay riesgo financiero en probarlos).
      </p>
      <Formula>pasa = (II&gt;0) ∨ (Elo&gt;0) ∨ (cat=programacion ∧ Coding&gt;0) ∨ isFree(model)</Formula>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Con II</div>
          <div className="text-lg font-bold num text-[var(--text-primary)]">{q.hasII}</div>
        </div>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Con Elo</div>
          <div className="text-lg font-bold num text-[var(--text-primary)]">{q.hasElo}</div>
        </div>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Con Coding</div>
          <div className="text-lg font-bold num text-[var(--text-primary)]">{q.hasCoding}</div>
        </div>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Gratis (pass)</div>
          <div className="text-lg font-bold num text-[var(--text-primary)]">{q.isFree}</div>
        </div>
      </div>
      <div className={cn("rounded-md border p-2.5 text-xs", q.applied ? "border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success)]" : "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]")}>
        {q.applied ? (
          <>Quality gate <b>aplicado</b>: {q.before} → {q.after} candidatos ({q.before - q.after} eliminados por falta de datos)</>
        ) : (
          <>Quality gate <b>no aplicado</b>: quedaban &lt;3 candidatos con datos, se mantiene el set anterior ({q.before}) para no vaciar el ranking</>
        )}
      </div>
      {/* v3.3.1 bug #14: piso de calidad en modo Calidad */}
      {hasFloor && (
        <div className="rounded-md border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-2.5 text-xs text-[var(--color-warning)]">
          <div className="font-semibold flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Piso de calidad (modo Calidad) — v3.3.1
          </div>
          <div className="mt-1">
            {floorFilter.description}: <b>{floorFilter.eliminated}</b> modelos eliminados · quedan <b>{floorFilter.remaining}</b>
          </div>
          <div className="text-[10px] mt-1 opacity-80">
            En modo Calidad máxima, modelos con II &lt; 30 se excluyen (excepto offline: II ≥ 15).
            Esto elimina modelos antiguos/basura que dominaban injustamente por contexto grande.
          </div>
        </div>
      )}
      <OutputBox label="Output — Candidatos finales para TOPSIS" color="var(--color-success)">
        <b>{trace.capa2.finalCandidates}</b> modelos listos para ranking
      </OutputBox>
    </div>
  );
}

// ============================================================
// CAPA 3 — AHP + CR
// ============================================================

function Step3_1({ trace }: { trace: EngineTrace }) {
  const m = trace.capa3.mode;
  const label = m === "mype" ? "MYPE (presupuesto cero)" : m === "calidad" ? "Calidad máxima" : m === "equilibrado" ? "Equilibrado" : "Solo Gratis (hereda MYPE)";
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Hay 3 sets de pesos pre-calibrados × 8 categorías = 24 matrices AHP. El motor
        selecciona el set según el modo activo (MYPE / Calidad / Equilibrado). El modo
        Solo Gratis hereda los pesos MYPE sobre el subconjunto filtrado.
      </p>
      <Formula>set = mode === "calidad" ? WEIGHTS_CALIDAD : mode === "equilibrado" ? WEIGHTS_EQUILIBRADO : WEIGHTS_MYPE</Formula>
      <div className="rounded-md border p-3" style={{ borderColor: "var(--brand-primary)", backgroundColor: "var(--brand-primary-subtle)" }}>
        <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Set seleccionado</div>
        <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{label}</div>
        <div className="text-[10px] text-[var(--text-secondary)] mt-1">
          Para categoría: <b>{trace.capa3.category}</b>
        </div>
      </div>
      <OutputBox label="Output" color="var(--brand-primary)">
        Set de pesos listo para aplicar a los 8 criterios TOPSIS
      </OutputBox>
    </div>
  );
}

function Step3_2({ trace }: { trace: EngineTrace }) {
  const weights = trace.capa3.weights;
  const maxW = Math.max(...weights.map((w) => w.weight));
  const mode = trace.capa3.mode;
  const modePhilosophy = mode === "calidad"
    ? "Calidad máxima: effCost=0 (no importa el precio) · II dominante (0.50-0.60) · contexto reducido (0.05-0.20). Lo mejor de lo mejor."
    : mode === "equilibrado"
    ? "Equilibrado: effCost medio (0.15) · II reforzado (0.35-0.45) · contexto bajo (0.05-0.20). Modelos baratos con buena calidad."
    : "MYPE (presupuesto cero): effCost dominante (0.45) · speed bajo (0.05). Modelos GRATIS ganan.";
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Cada criterio recibe un peso entre 0 y 1. Los pesos reflejan la importancia
        relativa para esta combinación (categoría + modo). Un peso 0 significa que el
        criterio se ignora para esta combinación.
      </p>
      <div className="rounded-md border border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] p-2 text-[10px] text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--brand-primary)]">Filosofía {mode}:</span> {modePhilosophy}
      </div>
      <div className="space-y-1.5">
        {weights.map((w) => (
          <div key={w.criterion} className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-primary)] w-56 shrink-0 truncate">{w.label}</span>
            <div className="flex-1 h-5 rounded-md bg-[var(--bg-overlay)] overflow-hidden relative">
              <div
                className="h-full transition-all"
                style={{
                  width: `${(w.weight / maxW) * 100}%`,
                  background: w.weight === 0 ? "var(--text-disabled)" : "var(--brand-primary)",
                }}
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] num font-mono text-[var(--text-primary)]">
                {w.weight.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <OutputBox label="Output" color="var(--brand-primary)">
        8 pesos asignados · {weights.filter((w) => w.weight > 0).length} activos · {weights.filter((w) => w.weight === 0).length} en cero
      </OutputBox>
    </div>
  );
}

function Step3_3({ trace }: { trace: EngineTrace }) {
  const sum = trace.capa3.sumWeights;
  const passes = Math.abs(sum - 1) < 0.001;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Los pesos AHP deben sumar exactamente 1.0 para que la ponderación sea válida
        (las contribuciones se reparten el 100% de la decisión). Esto se verifica en
        build-time y runtime.
      </p>
      <Formula>Σ w_i = 1.0</Formula>
      <div className={cn("rounded-md border p-3 text-center", passes ? "border-[var(--color-success-border)] bg-[var(--color-success-bg)]" : "border-[var(--color-error-border)] bg-[var(--color-error-bg)]")}>
        <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Suma de pesos</div>
        <div className={cn("text-3xl font-bold num mt-1", passes ? "text-[var(--color-success)]" : "text-[var(--color-error)]")}>
          {sum.toFixed(4)}
        </div>
        <div className={cn("text-xs mt-1", passes ? "text-[var(--color-success)]" : "text-[var(--color-error)]")}>
          {passes ? "✓ Suma = 1.0 — válido" : `✗ Suma ≠ 1.0 (drift = ${(sum - 1).toFixed(4)})`}
        </div>
      </div>
      <OutputBox label="Output" color={passes ? "var(--color-success)" : "var(--color-error)"}>
        {passes ? "Pesos válidos — proceed to pairwise matrix" : "ERROR: pesos inválidos"}
      </OutputBox>
    </div>
  );
}

function Step3_4({ trace }: { trace: EngineTrace }) {
  const ws = trace.capa3.nonZeroWeights;
  const n = ws.length;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Para verificar consistencia (Saaty 1980), se reconstruye la matriz pairwise A
        donde A[i][j] = w[i]/w[j]. Si los pesos fueran perfectamente consistentes, A
        tendría rango 1 y λ_max = n. Cualquier desviación indica inconsistencia.
      </p>
      <Formula>A[i][j] = w[i] / w[j]</Formula>
      <div className="text-[10px] text-[var(--text-secondary)] mb-1">
        Pesos no-cero (n={n}): [{ws.map((w) => w.toFixed(2)).join(", ")}]
      </div>
      <div className="overflow-x-auto rounded-md border border-[var(--border-default)]">
        <table className="text-[10px] font-mono">
          <thead className="bg-[var(--bg-elevated)]">
            <tr>
              <th className="px-2 py-1 text-left text-[var(--text-secondary)]">A[i][j]</th>
              {ws.map((_, j) => (
                <th key={j} className="px-2 py-1 text-right text-[var(--text-secondary)]">w{j + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ws.map((wi, i) => (
              <tr key={i} className="border-t border-[var(--border-default)]">
                <td className="px-2 py-1 text-left text-[var(--text-secondary)]">w{i + 1}={wi.toFixed(2)}</td>
                {ws.map((wj, j) => {
                  const val = wi / wj;
                  return (
                    <td key={j} className="px-2 py-1 text-right num" style={{
                      backgroundColor: i === j ? "var(--brand-primary-subtle)" : val > 1 ? `color-mix(in srgb, var(--color-success) ${Math.min(val / 4, 0.3) * 100}%, transparent)` : "transparent",
                      color: i === j ? "var(--brand-primary)" : "var(--text-primary)",
                    }}>
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[10px] text-[var(--text-secondary)]">
        Diagonal = 1.00 (w[i]/w[i]) · Valores &gt;1 (verde) = el criterio i es más importante que j · Valores &lt;1 = al revés
      </div>
      <OutputBox label="Output" color="var(--brand-primary)">
        Matriz {n}×{n} reconstruida — lista para calcular λ_max
      </OutputBox>
    </div>
  );
}

function Step3_5({ trace }: { trace: EngineTrace }) {
  const ahp = trace.capa3.ahp;
  const ws = trace.capa3.nonZeroWeights;
  const n = ws.length;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        λ_max es el autovalor máximo de la matriz A. Si los pesos son perfectamente
        consistentes, λ_max = n. Cualquier λ_max &gt; n indica inconsistencia (las
        comparaciones pairwise no son perfectamente transitivas).
      </p>
      <Formula>λ_max = (1/n) × Σ_i (Aw)_i / w_i, donde (Aw)_i = Σ_j A[i][j] × w[j]</Formula>
      <div className="rounded-md border border-[var(--border-default)] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[var(--bg-elevated)] text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
            <tr>
              <th className="text-left px-2.5 py-1.5 font-medium">i</th>
              <th className="text-right px-2.5 py-1.5 font-medium">w_i</th>
              <th className="text-right px-2.5 py-1.5 font-medium">(Aw)_i</th>
              <th className="text-right px-2.5 py-1.5 font-medium">(Aw)_i / w_i</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {ws.map((wi, i) => {
              const aw_i = ws.reduce((sum, wj, j) => sum + (wi / wj) * wj, 0);
              const ratio = aw_i / wi;
              return (
                <tr key={i}>
                  <td className="px-2.5 py-1.5 text-[var(--text-secondary)]">{i + 1}</td>
                  <td className="px-2.5 py-1.5 text-right num">{wi.toFixed(4)}</td>
                  <td className="px-2.5 py-1.5 text-right num">{aw_i.toFixed(4)}</td>
                  <td className="px-2.5 py-1.5 text-right num font-semibold text-[var(--text-primary)]">{ratio.toFixed(4)}</td>
                </tr>
              );
            })}
            <tr className="bg-[var(--brand-primary-subtle)] font-semibold">
              <td className="px-2.5 py-1.5" colSpan={3}>λ_max = (1/n) × Σ = (1/{n}) × {ws.reduce((s, wi, i) => s + ws.reduce((sum, wj, j) => sum + (wi / wj) * wj, 0) / wi, 0).toFixed(4)}</td>
              <td className="px-2.5 py-1.5 text-right num text-[var(--brand-primary)]">{ahp.lambdaMax.toFixed(4)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <OutputBox label="Output" color="var(--brand-primary)">
        λ_max = <b>{ahp.lambdaMax.toFixed(4)}</b> · n = {n} · {Math.abs(ahp.lambdaMax - n) < 0.001 ? "≈ n (consistencia perfecta)" : `drift = ${(ahp.lambdaMax - n).toFixed(4)}`}
      </OutputBox>
    </div>
  );
}

function Step3_6({ trace }: { trace: EngineTrace }) {
  const ahp = trace.capa3.ahp;
  const n = ahp.n;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        El Consistency Index (CI) mide cuánto se desvía λ_max de n. CI = 0 indica
        consistencia perfecta. Cuanto mayor el CI, más inconsistentes las comparaciones.
      </p>
      <Formula>CI = (λ_max − n) / (n − 1)</Formula>
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-3 text-center">
        <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Cálculo</div>
        <div className="text-sm font-mono text-[var(--text-primary)] mt-1">
          CI = ({ahp.lambdaMax.toFixed(4)} − {n}) / ({n} − 1) = {(ahp.lambdaMax - n).toFixed(4)} / {n - 1}
        </div>
        <div className="text-3xl font-bold num text-[var(--brand-primary)] mt-2">{ahp.CI.toFixed(6)}</div>
      </div>
      <OutputBox label="Output" color="var(--brand-primary)">
        CI = <b>{ahp.CI.toFixed(6)}</b>
      </OutputBox>
    </div>
  );
}

function Step3_7({ trace }: { trace: EngineTrace }) {
  const ahp = trace.capa3.ahp;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        El Consistency Ratio (CR) normaliza el CI contra el índice aleatorio (RI) de
        Saaty — el CI esperado de una matriz aleatoria del mismo tamaño. Saaty (1980)
        exige CR &lt; 0.1 para que los pesos sean aceptables.
      </p>
      <Formula>CR = CI / RI, donde RI(n) viene de la tabla de Saaty (n=5 → RI=1.12)</Formula>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">CI</div>
          <div className="text-lg font-bold num text-[var(--text-primary)]">{ahp.CI.toFixed(6)}</div>
        </div>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">RI (n={ahp.n})</div>
          <div className="text-lg font-bold num text-[var(--text-primary)]">{ahp.RI}</div>
        </div>
        <div className={cn("rounded-md border p-2.5 text-center", ahp.passes ? "border-[var(--color-success-border)] bg-[var(--color-success-bg)]" : "border-[var(--color-error-border)] bg-[var(--color-error-bg)]")}>
          <div className={cn("text-[10px] uppercase tracking-wider", ahp.passes ? "text-[var(--color-success)]" : "text-[var(--color-error)]")}>CR</div>
          <div className={cn("text-lg font-bold num", ahp.passes ? "text-[var(--color-success)]" : "text-[var(--color-error)]")}>{ahp.CR.toFixed(6)}</div>
        </div>
      </div>
      <div className={cn("rounded-md border p-3 flex items-center gap-2", ahp.passes ? "border-[var(--color-success-border)] bg-[var(--color-success-bg)]" : "border-[var(--color-error-border)] bg-[var(--color-error-bg)]")}>
        {ahp.passes ? (
          <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />
        ) : (
          <XCircle className="h-5 w-5 text-[var(--color-error)]" />
        )}
        <div className="text-xs">
          <span className={cn("font-semibold", ahp.passes ? "text-[var(--color-success)]" : "text-[var(--color-error)]")}>
            {ahp.passes ? "CR < 0.1 — AHP consistente ✓" : "CR ≥ 0.1 — AHP inconsistente ✗"}
          </span>
          <div className="text-[var(--text-secondary)] mt-0.5">
            {ahp.passes
              ? "Los pesos son válidos según Saaty (1980). La decisión es confiable."
              : "Los pesos violan el umbral de Saaty. Revisar comparaciones pairwise."}
          </div>
        </div>
      </div>
      <OutputBox label="Output — Pesos AHP validados" color={ahp.passes ? "var(--color-success)" : "var(--color-error)"}>
        CR = <b>{ahp.CR.toFixed(6)}</b> · pasa = <b>{ahp.passes ? "sí" : "no"}</b>
      </OutputBox>
    </div>
  );
}

// ============================================================
// CAPA 4 — TOPSIS
// ============================================================

function Step4_1({
  trace,
  modelsMap,
  traceMode,
}: {
  trace: EngineTrace;
  modelsMap: Map<string, AIModel>;
  traceMode: boolean;
}) {
  const cands = trace.capa4.candidates.slice(0, 6);
  const winnerCat = trace.capa3.category;

  // Resolve provenance label for a given metric.
  // Returns the data source name (or "imputado" for imputed values).
  const getProvenance = (c: typeof cands[number], metric: string): string => {
    switch (metric) {
      case "efficiencyCost":
        return "LiteLLM";
      case "elo":
        return c.imputed.elo ? "imputado" : "Arena AI";
      case "intelligenceIndex": {
        // HRE-TOPSIS v3.3.1 (bug #9 fix): II siempre viene de Artificial Analysis.
        // BenchLM category scores son display-only (Ficha Técnica) — NO afectan ranking.
        if (c.imputed.intelligenceIndex) return "imputado";
        return "Artificial Analysis";
      }
      case "codingIndex":
        return c.imputed.codingIndex ? "imputado" : "Artificial Analysis";
      case "agenticIndex":
        return c.imputed.agenticIndex ? "imputado" : "Artificial Analysis";
      case "speed":
        return c.imputed.speed ? "imputado" : "Artificial Analysis";
      case "context":
        return "provider";
      case "reliability":
        return c.raw.reliability !== 0.95 ? "ZeroEval" : "imputado";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Para cada candidato, se extraen 8 métricas. Métricas faltantes se imputan a
        valores baseline conservadores (Elo=1200, II=30, speed=50, coding/agentic=25) —
        nunca a 0, para no penalizar injustamente. El 8º criterio es{" "}
        <span className="font-semibold text-[var(--text-primary)]">reliability</span> (1 − failure_rate),
        de ZeroEval (baseline 0.95 si no hay datos).
      </p>
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2 text-[10px] text-[var(--text-secondary)] space-y-0.5">
        <div><span className="font-semibold text-[var(--text-primary)]">v3.3.1:</span> II viene de Artificial Analysis (no BenchLM — BenchLM es display-only en Ficha Técnica).</div>
        <div><span className="font-semibold text-[var(--text-primary)]">Caps:</span> speed → 500 tok/s · context → 256K tokens (evitan que outliers distorsionen la normalización TOPSIS).</div>
        <div><span className="font-semibold text-[var(--text-primary)]">effCost por modo:</span> MYPE/Equilibrado = FREE $0 · Calidad = precio API real (competencia justa).</div>
      </div>
      <div className="rounded-md border border-[var(--border-default)] overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead className="bg-[var(--bg-elevated)] text-[9px] uppercase tracking-wider text-[var(--text-secondary)]">
            <tr>
              <th className="text-left px-2 py-1.5 font-medium">Modelo</th>
              <th className="text-right px-2 py-1.5 font-medium">effCost</th>
              <th className="text-right px-2 py-1.5 font-medium">Elo</th>
              <th className="text-right px-2 py-1.5 font-medium">II</th>
              <th className="text-right px-2 py-1.5 font-medium">Coding</th>
              <th className="text-right px-2 py-1.5 font-medium">Agentic</th>
              <th className="text-right px-2 py-1.5 font-medium">Speed</th>
              <th className="text-right px-2 py-1.5 font-medium">Context</th>
              <th className="text-right px-2 py-1.5 font-medium">RELIAB.</th>
              <th className="text-center px-2 py-1.5 font-medium">Imputado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {cands.map((c) => {
              // Reliability cell — baseline 0.95 is shown italic + warning when no ZeroEval data
              const hasZeroEval = c.raw.reliability !== 0.95;
              const reliabilityTooltip = hasZeroEval
                ? `1 − failure_rate (ZeroEval) · ${modelsMap.get(c.modelId)?.zeroevalTotalCalls ?? 0} llamadas · ${((1 - c.raw.reliability) * 100).toFixed(1)}% FR`
                : "Baseline 0.95 — sin datos de ZeroEval";
              return (
                <tr key={c.modelId}>
                  <td className="px-2 py-1.5 text-[var(--text-primary)] truncate max-w-[140px]" title={c.modelName}>{c.modelName}</td>
                  <td className="px-2 py-1.5 text-right num">{c.raw.efficiencyCost.toFixed(2)}</td>
                  <td className={cn("px-2 py-1.5 text-right num", c.imputed.elo && "text-[var(--color-warning)] italic")}>{c.raw.elo}</td>
                  <td className={cn("px-2 py-1.5 text-right num", c.imputed.intelligenceIndex && "text-[var(--color-warning)] italic")}>{c.raw.intelligenceIndex}</td>
                  <td className={cn("px-2 py-1.5 text-right num", c.imputed.codingIndex && "text-[var(--color-warning)] italic")}>{c.raw.codingIndex}</td>
                  <td className={cn("px-2 py-1.5 text-right num", c.imputed.agenticIndex && "text-[var(--color-warning)] italic")}>{c.raw.agenticIndex}</td>
                  <td className={cn("px-2 py-1.5 text-right num", c.imputed.speed && "text-[var(--color-warning)] italic")}>{c.raw.speed}</td>
                  <td className="px-2 py-1.5 text-right num">{c.raw.context.toLocaleString("es-PE")}</td>
                  <td
                    className={cn("px-2 py-1.5 text-right num", !hasZeroEval && "text-[var(--color-warning)] italic")}
                    title={reliabilityTooltip}
                  >
                    {c.raw.reliability.toFixed(3)}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {c.isImputed ? <span className="text-[var(--color-warning)] text-[9px]">⚠</span> : <span className="text-[var(--color-success)] text-[9px]">✓</span>}
                  </td>
                  {traceMode && (
                    <td className="px-2 py-1.5">
                      <div className="flex flex-wrap gap-0.5 max-w-[140px]">
                        {(["efficiencyCost", "elo", "intelligenceIndex", "codingIndex", "agenticIndex", "speed", "context", "reliability"] as const).map((metric) => {
                          const src = getProvenance(c, metric);
                          const isImp = src === "imputado";
                          return (
                            <span
                              key={metric}
                              className="inline-block rounded px-1 py-px text-[8px] uppercase font-semibold tracking-wider"
                              style={{
                                backgroundColor: isImp
                                  ? "color-mix(in srgb, var(--color-error) 15%, transparent)"
                                  : "var(--bg-elevated)",
                                color: isImp ? "var(--color-error)" : "var(--text-secondary)",
                              }}
                              title={`${metric}: ${src}`}
                            >
                              {metric.slice(0, 3)} · {src}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="text-[10px] text-[var(--text-secondary)]">
        Mostrando {cands.length} de {trace.capa4.candidates.length} candidatos ·{" "}
        <span className="text-[var(--color-warning)]">⚠ italic = valor imputado</span>
        {traceMode && " · badges = fuente de cada métrica (Modo Traza)"}
      </div>
      <OutputBox label="Output" color="var(--color-success)">
        Matriz de decisión {trace.capa4.candidates.length}×8 lista · reliability añadido — de ZeroEval, 1 − failure_rate
      </OutputBox>
    </div>
  );
}

function Step4_2({ trace }: { trace: EngineTrace }) {
  const denoms = trace.capa4.denominators;
  const cands = trace.capa4.candidates.slice(0, 4);
  const norm = trace.capa4.normalizedMatrix.slice(0, 4);
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Cada columna se divide por la norma euclidiana de esa columna: sqrt(Σx²). Esto
        hace que todas las columnas estén en la misma escala [0,1], independiente de
        unidades (dólares, tokens/seg, puntuaciones, etc.).
      </p>
      <Formula>r_ij = x_ij / √(Σ_k x_kj²)  —  donde el denominador se calcula por columna j</Formula>
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-3">
        <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Denominadores por criterio (√Σx²)</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-mono">
          {Object.entries(denoms).map(([k, v]) => (
            <div key={k} className="flex justify-between rounded bg-[var(--bg-elevated)] px-1.5 py-0.5">
              <span className="text-[var(--text-secondary)]">{k}:</span>
              <span className="num text-[var(--text-primary)]">{v.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-md border border-[var(--border-default)] overflow-x-auto">
        <table className="w-full text-[10px] font-mono">
          <thead className="bg-[var(--bg-elevated)] text-[9px] uppercase">
            <tr>
              <th className="text-left px-2 py-1.5">Modelo</th>
              <th className="text-right px-2 py-1.5">r_effCost</th>
              <th className="text-right px-2 py-1.5">r_elo</th>
              <th className="text-right px-2 py-1.5">r_ii</th>
              <th className="text-right px-2 py-1.5">r_cod</th>
              <th className="text-right px-2 py-1.5">r_ag</th>
              <th className="text-right px-2 py-1.5">r_spd</th>
              <th className="text-right px-2 py-1.5">r_ctx</th>
              <th className="text-right px-2 py-1.5">r_rel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {norm.map((row, i) => (
              <tr key={row.modelId}>
                <td className="px-2 py-1.5 text-[var(--text-primary)] truncate max-w-[120px]" title={row.modelName}>{cands[i]?.modelName}</td>
                <td className="px-2 py-1.5 text-right num">{row.values.efficiencyCost.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right num">{row.values.elo.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right num">{row.values.intelligenceIndex.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right num">{row.values.codingIndex.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right num">{row.values.agenticIndex.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right num">{row.values.speed.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right num">{row.values.context.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right num">{(row.values.reliability ?? 0).toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[10px] text-[var(--text-disabled)]">
        Mostrando 4 de {trace.capa4.normalizedMatrix.length} filas
      </div>
      <OutputBox label="Output" color="var(--color-success)">
        Matriz normalizada {trace.capa4.normalizedMatrix.length}×8 (todos los valores en [0,1])
      </OutputBox>
    </div>
  );
}

function Step4_3({ trace }: { trace: EngineTrace }) {
  const weights = trace.capa3.weights;
  const wmap: Record<string, number> = {};
  weights.forEach((w) => { wmap[w.criterion] = w.weight; });
  const weighted = trace.capa4.weightedMatrix.slice(0, 4);
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Cada valor normalizado se multiplica por el peso AHP del criterio. Esto
        incorpora las preferencias del usuario (vía modo) en la matriz. Los criterios
        con peso 0 quedan en 0 para todos los modelos.
      </p>
      <Formula>v_ij = r_ij × w_j  —  donde w_j viene del set AHP seleccionado</Formula>
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-3">
        <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Pesos aplicados (de Capa 3)</div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-[10px] font-mono">
          {weights.map((w) => (
            <div key={w.criterion} className="text-center rounded bg-[var(--bg-elevated)] px-1 py-0.5">
              <div className="text-[var(--text-secondary)] truncate">{w.criterion.slice(0, 5)}</div>
              <div className="num text-[var(--brand-primary)] font-semibold">×{w.weight.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-md border border-[var(--border-default)] overflow-x-auto">
        <table className="w-full text-[10px] font-mono">
          <thead className="bg-[var(--bg-elevated)] text-[9px] uppercase">
            <tr>
              <th className="text-left px-2 py-1.5">Modelo</th>
              <th className="text-right px-2 py-1.5">v_eff</th>
              <th className="text-right px-2 py-1.5">v_elo</th>
              <th className="text-right px-2 py-1.5">v_ii</th>
              <th className="text-right px-2 py-1.5">v_cod</th>
              <th className="text-right px-2 py-1.5">v_ag</th>
              <th className="text-right px-2 py-1.5">v_spd</th>
              <th className="text-right px-2 py-1.5">v_ctx</th>
              <th className="text-right px-2 py-1.5">v_rel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {weighted.map((row) => (
              <tr key={row.modelId}>
                <td className="px-2 py-1.5 text-[var(--text-primary)] truncate max-w-[120px]" title={row.modelName}>{row.modelName}</td>
                <td className="px-2 py-1.5 text-right num">{row.values.efficiencyCost.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right num">{row.values.elo.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right num">{row.values.intelligenceIndex.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right num">{row.values.codingIndex.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right num">{row.values.agenticIndex.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right num">{row.values.speed.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right num">{row.values.context.toFixed(4)}</td>
                <td className="px-2 py-1.5 text-right num">{(row.values.reliability ?? 0).toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <OutputBox label="Output" color="var(--color-success)">
        Matriz ponderada {trace.capa4.weightedMatrix.length}×8 lista para cálculo de ideales
      </OutputBox>
    </div>
  );
}

function Step4_4({ trace }: { trace: EngineTrace }) {
  const idealBest = trace.capa4.idealBest;
  const idealWorst = trace.capa4.idealWorst;
  const criteria = ["efficiencyCost", "elo", "intelligenceIndex", "codingIndex", "agenticIndex", "speed", "context", "reliability"];
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Para cada criterio, se identifica el mejor y peor valor de la columna. Para
        criterios de beneficio (mayor = mejor) como II, Elo, speed, reliability: idealBest = max.
        Para costo (menor = mejor) como efficiencyCost: idealBest = min. La anti-ideal
        es lo opuesto.
      </p>
      <Formula>idealBest[j] = isCost(j) ? min(col_j) : max(col_j) · idealWorst[j] = opuesto</Formula>
      <div className="rounded-md border border-[var(--border-default)] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[var(--bg-elevated)] text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
            <tr>
              <th className="text-left px-2.5 py-1.5 font-medium">Criterio</th>
              <th className="text-center px-2.5 py-1.5 font-medium">Tipo</th>
              <th className="text-right px-2.5 py-1.5 font-medium">Ideal Best (A+)</th>
              <th className="text-right px-2.5 py-1.5 font-medium">Ideal Worst (A−)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {criteria.map((c) => {
              const isCost = c === "efficiencyCost";
              return (
                <tr key={c}>
                  <td className="px-2.5 py-1.5 text-[var(--text-primary)]">{c}</td>
                  <td className="px-2.5 py-1.5 text-center">
                    <Badge variant="outline" className={cn("text-[9px]", isCost ? "text-[var(--color-error)] border-[var(--color-error-border)]" : "text-[var(--color-success)] border-[var(--color-success-border)]")}>
                      {isCost ? "costo (min)" : "beneficio (max)"}
                    </Badge>
                  </td>
                  <td className="px-2.5 py-1.5 text-right num font-mono text-[var(--color-success)]">{idealBest[c].toFixed(4)}</td>
                  <td className="px-2.5 py-1.5 text-right num font-mono text-[var(--color-error)]">{idealWorst[c].toFixed(4)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <OutputBox label="Output" color="var(--color-success)">
        Solución ideal (A+) y anti-ideal (A−) definidas para los 8 criterios
      </OutputBox>
    </div>
  );
}

function Step4_5({ trace }: { trace: EngineTrace }) {
  const distances = trace.capa4.distances.slice(0, 6);
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Para cada modelo, se calcula la distancia euclidiana a la solución ideal (dBest)
        y a la anti-ideal (dWorst) en el espacio 8-dimensional. Un modelo cercano al
        ideal (dBest bajo) Y lejano del anti-ideal (dWorst alto) es mejor.
      </p>
      <Formula>dBest_i = √(Σ_j (v_ij − idealBest_j)²) · dWorst_i = √(Σ_j (v_ij − idealWorst_j)²)</Formula>
      <div className="rounded-md border border-[var(--border-default)] overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-[var(--bg-elevated)] text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
            <tr>
              <th className="text-left px-2.5 py-1.5 font-medium">Modelo</th>
              <th className="text-right px-2.5 py-1.5 font-medium">dBest (↓ mejor)</th>
              <th className="text-right px-2.5 py-1.5 font-medium">dWorst (↑ mejor)</th>
              <th className="text-center px-2.5 py-1.5 font-medium">Visual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {distances.map((d) => {
              const maxD = Math.max(...distances.map((x) => Math.max(x.dBest, x.dWorst)), 0.001);
              return (
                <tr key={d.modelId}>
                  <td className="px-2.5 py-1.5 text-[var(--text-primary)] truncate max-w-[160px]" title={d.modelName}>{d.modelName}</td>
                  <td className="px-2.5 py-1.5 text-right num text-[var(--color-success)]">{d.dBest.toFixed(4)}</td>
                  <td className="px-2.5 py-1.5 text-right num text-[var(--color-error)]">{d.dWorst.toFixed(4)}</td>
                  <td className="px-2.5 py-1.5">
                    <div className="relative h-3 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
                      <div className="absolute left-0 top-0 h-full bg-[var(--color-success)]" style={{ width: `${(d.dWorst / maxD) * 50}%` }} />
                      <div className="absolute right-0 top-0 h-full bg-[var(--color-error)]" style={{ width: `${(d.dBest / maxD) * 50}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="text-[10px] text-[var(--text-disabled)]">
        <span className="text-[var(--color-success)]">■ verde = dWorst</span> (más lejos del peor = mejor) · <span className="text-[var(--color-error)]">■ rojo = dBest</span> (más cerca del ideal = mejor)
      </div>
      <OutputBox label="Output" color="var(--color-success)">
        Distancias calculadas para {trace.capa4.distances.length} modelos
      </OutputBox>
    </div>
  );
}

function Step4_6({ trace }: { trace: EngineTrace }) {
  const distances = [...trace.capa4.distances].slice(0, 6);
  const maxC = Math.max(...distances.map((d) => d.C), 0.001);
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        El coeficiente de cercanía C combina ambas distancias en un solo score ∈ [0, 1].
        C = 1 significa que el modelo es el ideal. C = 0 significa que es el anti-ideal.
        Es la métrica final que se usa para ordenar el ranking.
      </p>
      <Formula>C_i = dWorst_i / (dBest_i + dWorst_i) ∈ [0, 1] · mayor = mejor</Formula>
      <div className="space-y-1.5">
        {distances.map((d) => (
          <div key={d.modelId} className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-primary)] w-44 shrink-0 truncate" title={d.modelName}>{d.modelName}</span>
            <div className="flex-1 h-5 rounded-md bg-[var(--bg-overlay)] overflow-hidden relative">
              <div
                className="h-full transition-all"
                style={{
                  width: `${(d.C / maxC) * 100}%`,
                  background: d.C >= 0.6 ? "var(--color-success)" : d.C >= 0.4 ? "var(--color-warning)" : "var(--color-error)",
                }}
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] num font-mono text-[var(--text-primary)]">
                {d.C.toFixed(4)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <OutputBox label="Output" color="var(--color-success)">
        Coeficiente C calculado para {trace.capa4.distances.length} modelos
      </OutputBox>
    </div>
  );
}

function Step4_7({ trace }: { trace: EngineTrace }) {
  const sorted = [...trace.capa4.distances].sort((a, b) => b.C - a.C);
  const top10 = sorted.slice(0, 10);
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Se ordenan todos los modelos por C descendente. El primer lugar es la
        recomendación principal; los 3 primeros son los "winners" que se mostrarán
        en el Recomendador.
      </p>
      <Formula>sort by C desc → top 3 = winners</Formula>
      <div className="space-y-1.5">
        {top10.map((d, i) => (
          <div key={d.modelId} className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 border",
            i < 3 ? "border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]" : "border-[var(--border-default)] bg-[var(--bg-overlay)]"
          )}>
            <span className={cn(
              "inline-flex items-center justify-center h-5 w-5 rounded text-[10px] font-mono font-semibold shrink-0",
              i === 0 ? "bg-[var(--brand-primary)] text-white" : i < 3 ? "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]" : "bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
            )}>
              {i + 1}
            </span>
            <span className="text-xs text-[var(--text-primary)] flex-1 truncate" title={d.modelName}>{d.modelName}</span>
            <span className="text-[10px] text-[var(--text-secondary)]">{d.provider}</span>
            <span className="text-xs num font-mono font-semibold text-[var(--text-primary)]">{d.C.toFixed(4)}</span>
            {i === 0 && <Trophy className="h-3 w-3 text-[var(--brand-primary)]" />}
          </div>
        ))}
      </div>
      <OutputBox label="Output — Top 3 winners" color="var(--brand-primary)">
        {trace.capa4.top3.map((t, i) => `#${i + 1} ${t.modelName} (C=${t.score.toFixed(4)})`).join(" · ")}
      </OutputBox>
    </div>
  );
}

function Step4_8({ trace }: { trace: EngineTrace }) {
  const a = trace.capa4.antiFreeBad;
  if (!a.applied) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Este umbral solo aplica en modo MYPE o Solo Gratis. El modo activo es{" "}
          <b>{trace.capa1_5.activeMode}</b>, así que se omite.
        </p>
        <div className="rounded-md border border-dashed border-[var(--border-default)] bg-[var(--bg-overlay)] p-3 text-xs text-[var(--text-disabled)] italic text-center">
          Umbral anti-gratis-malo omitido (modo {trace.capa1_5.activeMode})
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        En modo MYPE/Gratis, si el mejor modelo gratuito tiene II &lt; 70% del mejor
        modelo pago, los modelos pagos ganan — el gratis es "gratis pero malo". Esto
        previene recomendar un modelo $0 que es 40% tan inteligente como uno de $2/M.
      </p>
      <Formula>si bestFreeII &lt; 0.7 × bestPaidII → re-sort: pagos primero, gratis como alternativa</Formula>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Best Paid II</div>
          <div className="text-lg font-bold num text-[var(--color-success)]">{a.bestPaidII.toFixed(1)}</div>
        </div>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Best Free II</div>
          <div className="text-lg font-bold num text-[var(--text-secondary)]">{a.bestFreeII.toFixed(1)}</div>
        </div>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5 text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Umbral 70%</div>
          <div className="text-lg font-bold num text-[var(--color-warning)]">{(a.bestPaidII * a.threshold).toFixed(1)}</div>
        </div>
      </div>
      <div className={cn("rounded-md border p-3 flex items-center gap-2", a.triggered ? "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)]" : "border-[var(--color-success-border)] bg-[var(--color-success-bg)]")}>
        {a.triggered ? <AlertCircle className="h-4 w-4 text-[var(--color-warning)]" /> : <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />}
        <div className="text-xs">
          <span className={cn("font-semibold", a.triggered ? "text-[var(--color-warning)]" : "text-[var(--color-success)]")}>
            {a.triggered ? "Umbral DISPARADO — gratis es < 70% del pago" : "Umbral NO disparado — gratis es competitivo"}
          </span>
          <div className="text-[var(--text-secondary)] mt-0.5">
            {a.triggered
              ? `Best free (${a.bestFreeII.toFixed(1)}) < 70% de best paid (${a.bestPaidII.toFixed(1)}). Re-ordenando: pagos primero.`
              : `Best free (${a.bestFreeII.toFixed(1)}) ≥ 70% de best paid (${a.bestPaidII.toFixed(1)}). El gratis es una alternativa genuina.`}
          </div>
        </div>
      </div>
      <OutputBox label="Output" color={a.triggered ? "var(--color-warning)" : "var(--color-success)"}>
        Anti-gratis-malo: {a.triggered ? "disparado (pagos ganan)" : "no disparado (gratis válido)"}
      </OutputBox>
    </div>
  );
}

// ============================================================
// CAPA 5 — Explanation
// ============================================================

function Step5_1({ trace }: { trace: EngineTrace }) {
  const top3 = trace.capa5.top3Criteria;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Para construir la explicación, el motor toma los 3 criterios con mayor peso AHP
        (de los que tienen peso &gt; 0). Estos serán los "porqués" que se le dicen al
        usuario.
      </p>
      <Formula>top3Criteria = sort(weights, desc).slice(0, 3).filter(w &gt; 0)</Formula>
      <div className="space-y-1.5">
        {top3.map((c, i) => (
          <div key={c.criterion} className="flex items-center gap-2 rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] px-2.5 py-1.5">
            <span className={cn(
              "inline-flex items-center justify-center h-5 w-5 rounded text-[10px] font-mono font-semibold shrink-0",
              i === 0 ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
            )}>
              {i + 1}
            </span>
            <span className="text-xs text-[var(--text-primary)] flex-1">{c.label}</span>
            <span className="text-xs num font-mono font-semibold text-[var(--brand-primary)]">{(c.weight * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
      <OutputBox label="Output" color="var(--brand-primary)">
        {top3.length} criterios priorizados para la explicación
      </OutputBox>
    </div>
  );
}

function Step5_2({ trace }: { trace: EngineTrace }) {
  const winners = trace.capa5.winners;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Para cada winner (top 3), se genera una lista de razones concretas citando los
        valores reales del modelo en los criterios top. Cada razón es específica y
        verificable contra la data del modelo.
      </p>
      <div className="space-y-2">
        {winners.map((w) => (
          <div key={w.rank} className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn(
                "inline-flex items-center justify-center h-5 w-5 rounded text-[10px] font-mono font-semibold",
                w.rank === 1 ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
              )}>
                #{w.rank}
              </span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">{w.modelName}</span>
              <span className="text-[10px] num text-[var(--text-secondary)] ml-auto">C = {w.score.toFixed(4)}</span>
            </div>
            <ul className="space-y-1">
              {w.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[10px] text-[var(--text-secondary)] leading-relaxed">
                  <ChevronRight className="h-3 w-3 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <OutputBox label="Output" color="var(--brand-primary)">
        Razones generadas para {winners.length} winners
      </OutputBox>
    </div>
  );
}

function Step5_3({ trace }: { trace: EngineTrace }) {
  const tie = trace.capa5.tie;
  const delta = trace.capa5.tieDelta;
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Si los scores del #1 y #2 están a menos de 0.03 de distancia, se considera un
        empate técnico. El motor lo menciona explícitamente en la explicación para que
        el usuario sepa que ambos son igualmente válidos.
      </p>
      <Formula>tie = |score[0] − score[1]| &lt; 0.03</Formula>
      <div className={cn("rounded-md border p-3 text-center", tie ? "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)]" : "border-[var(--color-success-border)] bg-[var(--color-success-bg)]")}>
        <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Δ entre #1 y #2</div>
        <div className={cn("text-3xl font-bold num mt-1", tie ? "text-[var(--color-warning)]" : "text-[var(--color-success)]")}>
          {delta.toFixed(4)}
        </div>
        <div className={cn("text-xs mt-1", tie ? "text-[var(--color-warning)]" : "text-[var(--color-success)]")}>
          {tie ? "⚠ Empate técnico (< 0.03)" : "✓ Sin empate (≥ 0.03)"}
        </div>
      </div>
      <OutputBox label="Output" color={tie ? "var(--color-warning)" : "var(--color-success)"}>
        tie = <b>{tie ? "sí" : "no"}</b> · delta = {delta.toFixed(4)}
      </OutputBox>
    </div>
  );
}

function Step5_4({ trace, modelsMap }: { trace: EngineTrace; modelsMap: Map<string, AIModel> }) {
  // Compute provenance counts for the audit footer (Phase 4B.3.j).
  // trace.capa4.candidates carries raw + imputed info; we re-resolve the
  // underlying benchlm/zeroeval data via modelsMap to count sources.
  const cands = trace.capa4.candidates;
  const total = cands.length;
  const winnerCat = trace.capa3.category;

  // CATEGORY_BENCHLM_MAP mirror — same as hre-topsis.ts
  const catToBenchlm: Record<string, string> = {
    redaccion: "instructionFollowing",
    documentos: "knowledge",
    programacion: "coding",
    calculos: "math",
    offline: "knowledge",
    rapidas: "instructionFollowing",
    multilingue: "multilingual",
    agentes: "agentic",
  };

  const aaCount = cands.filter((c) => {
    const m = modelsMap.get(c.modelId);
    return m != null && (
      m.intelligenceIndex != null ||
      m.codingIndex != null ||
      m.agenticIndex != null ||
      m.speedTps != null
    );
  }).length;

  // BenchLM category-specific count — only candidates where BenchLM has the
  // score for the winning category (we can't tell from trace alone, so we
  // count candidates whose BenchLM has the category-specific score).
  const benchKey = catToBenchlm[winnerCat];
  const benchlmCount = cands.filter((c) => {
    const m = modelsMap.get(c.modelId);
    return benchKey != null && m?.benchlmCategoryScores?.[benchKey as keyof NonNullable<typeof m.benchlmCategoryScores>] != null;
  }).length;

  // ZeroEval — reliability !== 0.95 means real ZeroEval data; 0.95 means imputed
  const zeroEvalCount = cands.filter((c) => c.raw.reliability !== 0.95).length;
  const zeroEvalImputed = cands.length - zeroEvalCount;

  // Arena AI — Elo non-zero (i.e. not imputed to 1200 baseline)
  const arenaCount = cands.filter((c) => !c.imputed.elo).length;

  // LiteLLM — always all candidates (prices are mandatory)
  const litellmCount = total;

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        El motor compone una explicación natural en español que: (1) menciona la tarea
        original, (2) indica la categoría detectada, (3) indica el modo activo, (4)
        recomienda el ganador con sus razones, (5) si hay empate, lo menciona.
      </p>
      <Formula>explanation = compose(tarea, categoría, modo, winner, razones, tie?)</Formula>
      <div className="rounded-md border border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] p-3">
        <div className="text-[10px] uppercase tracking-wider text-[var(--brand-primary)] mb-1.5 flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          Explicación final generada
        </div>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
          {trace.capa5.explanation}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2 text-center">
          <div className="text-[var(--text-secondary)] uppercase tracking-wider">Tiempo total</div>
          <div className="text-sm font-bold num text-[var(--text-primary)] mt-0.5">{trace.computationTimeMs}ms</div>
        </div>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2 text-center">
          <div className="text-[var(--text-secondary)] uppercase tracking-wider">Categoría</div>
          <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5 truncate">{trace.capa1.winner.label}</div>
        </div>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2 text-center">
          <div className="text-[var(--text-secondary)] uppercase tracking-wider">Modo activo</div>
          <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{trace.capa1_5.activeMode}</div>
        </div>
      </div>
      <OutputBox label="🎉 Recomendación lista" color="var(--brand-primary)">
        {trace.capa5.winners[0]?.modelName} · C = {trace.capa5.winners[0]?.score.toFixed(4)} · {trace.computationTimeMs}ms
      </OutputBox>

      {/* Phase 4B.3.j — Audit footer (always visible). Lists which sources
          contributed to this recommendation. Counts derived from
          trace.capa4.candidates + modelsMap re-resolution. */}
      <div
        className="rounded-md border p-3 mt-2"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-elevated)",
        }}
      >
        <div className="text-[11px] font-semibold text-[var(--text-primary)] mb-1.5 flex items-center gap-1">
          <Search className="h-3 w-3 text-[var(--brand-primary)]" />
          🔍 Fuentes de datos usadas en esta recomendación
        </div>
        <ul className="space-y-1 text-[10px] text-[var(--text-secondary)] leading-relaxed">
          <li className="flex items-start gap-1.5">
            <ChevronRight className="h-3 w-3 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold text-[var(--text-primary)]">Artificial Analysis</span> — II, Coding, Agentic, Speed (para {aaCount} candidatos)
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <ChevronRight className="h-3 w-3 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold text-[var(--text-primary)]">BenchLM</span> — scores por categoría (display informativo en Ficha Técnica, NO afecta ranking) (para {benchlmCount} candidatos)
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <ChevronRight className="h-3 w-3 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold text-[var(--text-primary)]">ZeroEval</span> — Reliability (1 − failure_rate) (para {zeroEvalCount} candidatos · {zeroEvalImputed} con datos imputados)
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <ChevronRight className="h-3 w-3 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold text-[var(--text-primary)]">Arena AI</span> — Elo (para {arenaCount} candidatos)
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <ChevronRight className="h-3 w-3 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold text-[var(--text-primary)]">LiteLLM</span> — Precios blended (para todos los {litellmCount} candidatos)
            </span>
          </li>
        </ul>
        <div className="text-[9px] text-[var(--text-disabled)] mt-2 italic">
          5 fuentes combinadas en una sola decisión HRE-TOPSIS v3.3.1 · 8 criterios · 100% client-side
        </div>
      </div>

      <div className="text-[10px] text-[var(--text-disabled)] italic text-center pt-2">
        Animación completa · {STEPS.length} pasos · 100% client-side · datos 100% dinámicos desde la API
      </div>
    </div>
  );
}
