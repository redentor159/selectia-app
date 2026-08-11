"use client";

import { useMemo, useState, useEffect } from "react";
import { useEffectiveDashboardData } from "@/hooks/use-effective-dashboard-data";
import { useDashboardStore } from "@/store/dashboard-store";
import {
  recommend,
  formatContext,
  formatVotes,
  TASK_CATEGORIES,
  CATEGORY_CANONICAL_QUERIES,
  CATEGORY_LABELS,
  type TaskCategory,
} from "@/lib/engine/hre-topsis";
import { getCurrencyByCode, formatPrice, computeBlendedUsd, getIntelligenceColor, buildMultiIntentText } from "@/lib/format";
import { ProviderLogo } from "../provider-logo";
import { LicenseBadge, FreeAccessBadge } from "../model-badges";
import {
  Sparkles,
  Search,
  ArrowRight,
  Copy,
  Check,
  GitCompareArrows,
  Clock,
  Target,
  ListFilter,
  Hash,
  DollarSign,
  Timer,
  FileText,
  Globe,
  Layers,
  Brain,
  PenLine,
  Code2,
  Calculator,
  WifiOff,
  Zap,
  Bot,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ENTITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  hasNumbers: Hash,
  hasCurrency: DollarSign,
  hasTimeConstraint: Timer,
  hasDocumentType: FileText,
  hasMaterial: Layers,
  hasLanguage: Globe,
};

const ENTITY_LABELS: Record<string, string> = {
  hasNumbers: "Números detectados",
  hasCurrency: "Moneda mencionada",
  hasTimeConstraint: "Restricción de tiempo",
  hasDocumentType: "Tipo de documento",
  hasMaterial: "Material industrial",
  hasLanguage: "Idioma mencionado",
};

// Icon map for the 8 task category chips. Uses string keys from
// TASK_CATEGORIES so the chips array stays serializable.
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PenLine,
  FileText,
  Code2,
  Calculator,
  WifiOff,
  Zap,
  Globe,
  Bot,
};

export function RecomendadorView() {
  const { data, isLoading } = useEffectiveDashboardData();
  const {
    recommendationQuery,
    setRecommendationQuery,
    operationMode,
    toggleCompare,
    compareIds,
    openGlossary,
  } = useDashboardStore();
  // Moneda reactiva del store: las razones del motor derivan la tasa viva de
  // aquí, así un cambio de moneda re-deriva el texto sin re-renders extra.
  const currency = useDashboardStore((s) => s.currency);
  const { toast } = useToast();

  const [localQuery, setLocalQuery] = useState(recommendationQuery);
  const [submittedQuery, setSubmittedQuery] = useState(recommendationQuery);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (recommendationQuery) {
      setLocalQuery(recommendationQuery);
      setSubmittedQuery(recommendationQuery);
    }
  }, [recommendationQuery]);

  const result = useMemo(() => {
    if (!data || !submittedQuery.trim()) return null;
    // P1B-ENGINE — pass the 5th `options` arg so keyword auto-mode detection
    // runs (unless the user explicitly toggled the mode → manual override).
    // `queryText` mirrors `submittedQuery` so detectModeFromQuery sees the
    // current query even if recommend() uses a different internal entry.
    // Also pass `hardwareVram` from Filtro 13 so the offline category hard
    // filter (Capa 2) can refine "exists in Ollama?" → "fits in MY GPU?".
    // Display consistente: la moneda del store + tasa viva viajan en
    // `options.currency` para que las razones usen la misma tasa que el UI.
    const store = useDashboardStore.getState();
    const currencyMeta = getCurrencyByCode(data.currencies, store.currency);
    const rateIsFallback =
      data.sources?.some((s) => s.id === "exchange-rate" && s.status !== "green") ?? false;
    return recommend(submittedQuery, data.models, operationMode, undefined, {
      manualModeOverride: store.modeManuallySet,
      queryText: submittedQuery,
      hardwareVram: store.filters.hardwareFilterVram,
      currency: {
        code: currencyMeta.code,
        symbol: currencyMeta.symbol,
        rateFromUsd: currencyMeta.rateFromUsd,
        isFallback: rateIsFallback,
      },
    });
  }, [data, submittedQuery, operationMode, currency]);

  const [activeCategory, setActiveCategory] = useState<TaskCategory | null>(null);

  // Sync the active category chip with the engine's classified intent —
  // when the user types a query, highlight the chip matching the winner.
  useEffect(() => {
    if (result?.intent?.category) {
      setActiveCategory(result.intent.category as TaskCategory);
    }
  }, [result?.intent?.category]);

  const currencyMeta = data ? getCurrencyByCode(data.currencies, currency) : null;

  const handleSubmit = (q?: string) => {
    const final = q ?? localQuery;
    if (!final.trim()) return;
    setRecommendationQuery(final);
    setSubmittedQuery(final);
  };

  // Direct category click — runs the engine with a canonical query that
  // maps to the selected category. This lets users get recommendations
  // without typing, just by picking what they want to do.
  const handleCategoryClick = (cat: TaskCategory) => {
    const canonical = CATEGORY_CANONICAL_QUERIES[cat];
    setActiveCategory(cat);
    setLocalQuery(canonical);
    setRecommendationQuery(canonical);
    setSubmittedQuery(canonical);
  };

  const handleCopy = async (name: string, id: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedId(id);
      toast({
        title: "Nombre copiado",
        description: name,
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: "No se pudo copiar", variant: "destructive" });
    }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Search bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--brand-primary)]" />
          <h1 className="text-lg font-semibold tracking-tight">Motor de Recomendación HRE-TOPSIS</h1>
        </div>
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
              placeholder="Describe tu tarea en lenguaje natural…"
              className="h-11 pl-10 text-base bg-[var(--bg-elevated)] border-[var(--border-strong)]"
              autoFocus
            />
          </div>
          <Button
            onClick={() => handleSubmit()}
            className="h-11 px-6 bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--on-accent)]"
          >
            Recomendar
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Direct category chips — click to get recommendations without typing.
            PRD Parte 3 Módulo 1: the 8 task categories should be accessible
            directly, not only via free-text query classification. */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-xxs uppercase tracking-wider text-[var(--text-secondary)] self-center mr-1">
            O elige una categoría:
          </span>
          {TASK_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.icon] ?? Target;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  active
                    ? "border-[var(--border-default)] bg-[var(--bg-overlay)] text-[var(--text-primary)] shadow-sm"
                    : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {!result && (
        <Card className="bg-[var(--bg-surface)] border-dashed border-[var(--border-strong)]">
          <CardContent className="p-8 text-center">
            <Target className="h-8 w-8 mx-auto text-[var(--text-secondary)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">
              Ingresa una consulta para activar el motor. Se ejecutarán las 5 capas:
              clasificación de intención, filtros duros, matriz AHP, ranking TOPSIS y explicación.
            </p>
          </CardContent>
        </Card>
      )}

      {result && currencyMeta && (
        <>
      {/* Meta bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3">
        <Badge className="bg-[var(--bg-overlay)] text-[var(--text-primary)] border-[var(--border-default)] gap-1 shadow-sm">
          <Target className="h-3 w-3" />
          {/* P1B-ENGINE — prefer intent.label over the raw category key */}
          {result.intent?.label ?? result.categoryLabel}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          {result.computationTimeMs}ms
        </Badge>
        {/* P1B-ENGINE — active mode + modeSource badge */}
        <Badge
          variant="outline"
          className="gap-1 capitalize"
          style={
            result.modeSource === "keyword"
              ? { color: "var(--color-warning)", borderColor: "var(--color-warning-border)", backgroundColor: "var(--color-warning-bg)" }
              : result.modeSource === "manual"
                ? { color: "var(--brand-primary)", borderColor: "var(--brand-primary)", backgroundColor: "var(--brand-primary-subtle)" }
                : undefined
          }
          title={
            result.modeSource === "keyword"
              ? "Detectado por keywords en la consulta"
              : result.modeSource === "manual"
                ? "Modo fijado manualmente por el usuario"
                : "Modo heredado del perfil activo"
          }
        >
          <Brain className="h-3 w-3" />
          Modo: {modeLabel(result.activeMode ?? result.mode)}{" "}
          (
          {result.modeSource === "keyword"
            ? "detectado por keywords"
            : result.modeSource === "manual"
              ? "manual"
              : "perfil"}
          )
        </Badge>
        {/* AHP Consistency Ratio badge — Saaty 1980 */}
        {result.ahpCR && (
          <Badge
            variant="outline"
            className="gap-1"
            style={
              result.ahpCR.passes
                ? { color: "var(--color-success)", borderColor: "var(--color-success-border)", backgroundColor: "var(--color-success-bg)" }
                : { color: "var(--color-error)", borderColor: "var(--color-error-border)", backgroundColor: "var(--color-error-bg)" }
            }
            title={`AHP Consistency Ratio (Saaty 1980): CR = ${result.ahpCR.cr} | n = ${result.ahpCR.n} criterios | Umbral: < 0.1`}
          >
            <CheckCircle2 className="h-3 w-3" />
            Consistencia: {result.ahpCR.passes ? "Alta" : "Baja"}
          </Badge>
        )}
        {result.multiIntent && (
          <Badge variant="outline" className="gap-1 text-[var(--color-warning)] border-[var(--color-warning-border)]">
            <Layers className="h-3 w-3" />
            {buildMultiIntentText(
              result.multiIntent.map((m) => ({
                key: m.category,
                label: CATEGORY_LABELS[m.category],
                weight: m.weight,
              })),
              result.intent?.label ?? result.categoryLabel
            )}
          </Badge>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {Object.entries(result.detectedEntities).map(([key, val]) => {
            if (!val || key === "contextSizeHint") return null;
            const Icon = ENTITY_ICONS[key];
            const label = ENTITY_LABELS[key];
            if (!Icon || !label) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-overlay)] px-2 py-0.5 text-xxs text-[var(--text-secondary)]"
                title={label}
              >
                <Icon className="h-3 w-3" />
                {label}
              </span>
            );
          })}
          {typeof result.detectedEntities.contextSizeHint === "number" && result.detectedEntities.contextSizeHint > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-info-bg)] px-2 py-0.5 text-xxs text-[var(--color-info)] border border-[var(--color-info-border)]">
              <FileText className="h-3 w-3" />
              Contexto estimado: ~{formatContext(result.detectedEntities.contextSizeHint)}
            </span>
          )}
        </div>
      </div>

      {/* P1B-ENGINE — Top-3 categories mini bar chart (TF-IDF scores) */}
      {result.categories && result.categories.length > 0 && (
        <details className="mb-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Layers className="h-4 w-4 text-[var(--text-secondary)]" />
            Top 3 intenciones detectadas
          </summary>
          <div className="mt-3 space-y-1.5">
            {result.categories.map((cat, i) => {
              const maxScore = result.categories![0].score || 1;
              const pct = (cat.score / maxScore) * 100;
              const isTop = i === 0;
              return (
                <div key={cat.category} className="flex items-center gap-2">
                  <span className="text-xs w-44 shrink-0 truncate" title={cat.label}>
                    {isTop && <span className="text-[var(--brand-primary)] mr-1">●</span>}
                    {cat.label}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isTop
                          ? "var(--brand-primary)"
                          : "var(--text-secondary)",
                      }}
                    />
                  </div>
                  <span className="num text-xxs w-12 text-right text-[var(--text-secondary)]">
                    {cat.score.toFixed(3)}
                  </span>
                </div>
              );
            })}
          </div>
        </details>
      )}

          {/* Explanation */}
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 shadow-sm">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 mt-0.5 text-[var(--text-primary)] shrink-0" />
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {result.explanation}
              </p>
            </div>
          </div>

          {/* Phase 4A.2 — Yellow alert when #1 winner has high failure_rate */}
          {result.winners[0]?.model.zeroevalFailureRate != null &&
            result.winners[0].model.zeroevalFailureRate > 0.10 && (
            <Alert
              className="mb-4"
              style={{
                backgroundColor: "color-mix(in srgb, var(--color-warning) 10%, transparent)",
                borderColor: "var(--color-warning)",
              }}
            >
              <AlertTriangle
                className="h-4 w-4"
                style={{ color: "var(--color-warning)" }}
              />
              <AlertTitle>Confiabilidad baja detectada</AlertTitle>
              <AlertDescription>
                Este modelo falla{" "}
                {((result.winners[0].model.zeroevalFailureRate) * 100).toFixed(1)}%
                de las veces en producción (basado en{" "}
                {result.winners[0].model.zeroevalTotalCalls ?? 0} llamadas
                monitoreadas por ZeroEval). Considera el #2 si necesitas mayor
                disponibilidad.
              </AlertDescription>
            </Alert>
          )}

          {/* Winner cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {result.winners.map((winner) => {
              const medal = winner.rank === 1 ? "🥇" : winner.rank === 2 ? "🥈" : "🥉";
              const medalColor =
                winner.rank === 1 ? "var(--color-warning)" :
                winner.rank === 2 ? "var(--text-secondary)" :
                "var(--color-orange)";
              const m = winner.model;
              const isCopied = copiedId === m.id;
              const inCompare = compareIds.includes(m.id);
              const blended = computeBlendedUsd(m);

              return (
                <Card
                  key={m.id}
                  className={cn(
                    "relative bg-[var(--bg-surface)] border-[var(--border-default)] card-hover overflow-hidden",
                    winner.rank === 1 && "border-[var(--color-warning-border)]"
                  )}
                >
                  {winner.rank === 1 && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--color-warning)] via-[var(--color-warning)] to-transparent" />
                  )}
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl" aria-hidden>{medal}</span>
                        <div>
                          <div className="text-xxs uppercase tracking-wider text-[var(--text-secondary)]">
                            Recomendación #{winner.rank}
                          </div>
                          <div className="text-xs font-mono text-[var(--text-secondary)]">
                            Score: {winner.score.toFixed(3)}
                          </div>
                        </div>
                      </div>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: medalColor }}
                        title={`Rank ${winner.rank}`}
                      />
                    </div>

                    {/* Model identity */}
                    <div className="flex items-center gap-3 mb-4">
                      <ProviderLogo model={m} size={40} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm leading-tight truncate">{m.name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{m.provider}</div>
                      </div>
                    </div>

                    {/* Key metrics grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <Metric
                        label="Precio blended"
                        value={blended === 0 ? "Gratis" : formatPrice(blended, currencyMeta) + "/M"}
                        highlight={blended === 0 ? "var(--color-success)" : undefined}
                      />
                      <Metric
                        label="Intelligence"
                        value={m.intelligenceIndex?.toFixed(1) ?? "—"}
                        highlight={getIntelligenceColor(m.intelligenceIndex)}
                      />
                      <Metric
                        label="Elo Arena"
                        value={m.elo ? `${m.elo}` : "—"}
                        sub={m.elo ? `±${m.eloCi} · ${formatVotes(m.eloVotes)}` : undefined}
                      />
                      <Metric
                        label="Velocidad"
                        value={m.speedTps ? `${m.speedTps}` : "—"}
                        sub={m.speedTps ? "tok/s" : undefined}
                      />
                    </div>

                    {/* Reasons */}
                    <div className="space-y-1 mb-4">
                      <div className="flex items-center gap-1 text-xxs uppercase tracking-wider text-[var(--text-secondary)]">
                        <ListFilter className="h-3 w-3" />
                        Por qué
                      </div>
                      {winner.reasons.map((reason, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-[var(--text-primary)]">
                          <span className="text-[var(--brand-primary)] mt-0.5">→</span>
                          <span className="leading-tight">{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <LicenseBadge license={m.license} licenseName={m.licenseName} />
                      <FreeAccessBadge freeAccess={m.freeAccess} />
                      {m.ollamaAvailable && (
                        <Badge variant="outline" className="text-[var(--color-teal)] border-[var(--color-teal)]">
                          Offline
                        </Badge>
                      )}
                      {/* HuggingFace repo health badge — click to open glossary */}
                      {m.hfDisabled !== null && m.hfDisabled !== undefined && (
                        <button
                          type="button"
                          onClick={() => openGlossary("Salud del Repo")}
                          className="focus:outline-none"
                          title="Salud del repositorio HuggingFace — click para glosario"
                        >
                          <Badge
                            variant="outline"
                            className="text-xxs gap-0.5 cursor-help"
                            style={
                              m.hfDisabled === true
                                ? { color: "var(--color-error)", borderColor: "var(--color-error-border)" }
                                : (m.hfGated as any) === "manual"
                                  ? { color: "var(--color-warning)", borderColor: "var(--color-warning-border)" }
                                  : { color: "var(--color-success)", borderColor: "var(--color-success-border)" }
                            }
                          >
                            {m.hfDisabled === true ? "🚫 Disabled" : (m.hfGated as any) === "manual" ? "🔒 Gated" : "🟢 Repo OK"}
                          </Badge>
                        </button>
                      )}
                    </div>

                    {/* HuggingFace adoption stats — click to open glossary */}
                    {(m.hfDownloads !== null && m.hfDownloads !== undefined) && (
                      <div className="flex items-center gap-3 text-xxs text-[var(--text-secondary)] mb-3 num">
                        <button
                          type="button"
                          onClick={() => openGlossary("Descargas HF")}
                          className="flex items-center gap-1 hover:text-[var(--brand-primary)] transition-colors"
                          title="Descargas en HuggingFace Hub — click para glosario"
                        >
                          <ArrowRight className="h-3 w-3" />
                          {m.hfDownloads >= 1000000
                            ? `${(m.hfDownloads / 1000000).toFixed(1)}M descargas`
                            : m.hfDownloads >= 1000
                              ? `${(m.hfDownloads / 1000).toFixed(1)}K descargas`
                              : `${m.hfDownloads} descargas`}
                        </button>
                        {m.hfLikes !== null && m.hfLikes !== undefined && (
                          <button
                            type="button"
                            onClick={() => openGlossary("Likes HF")}
                            className="hover:text-[var(--brand-primary)] transition-colors"
                            title="Likes en HuggingFace Hub — click para glosario"
                          >
                            ♥ {m.hfLikes >= 1000 ? `${(m.hfLikes / 1000).toFixed(1)}K` : m.hfLikes} likes
                          </button>
                        )}
                        {m.hfInference && (
                          <span title="Disponibilidad en HF Inference">
                            {m.hfInference === "warm" ? "🔥 Warm" : "❄️ Cold"}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={() => handleCopy(m.name, m.id)}
                      >
                        {isCopied ? (
                          <><Check className="h-3 w-3" /> Copiado</>
                        ) : (
                          <><Copy className="h-3 w-3" /> Copiar nombre</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant={inCompare ? "default" : "outline"}
                        className="h-8 text-xs"
                        onClick={() => toggleCompare(m.id)}
                        disabled={!inCompare && compareIds.length >= 4}
                      >
                        <GitCompareArrows className="h-3 w-3" />
                        {inCompare ? "En comparador" : "Comparar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* TOPSIS explanation */}
          <details className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
              <Brain className="h-4 w-4 text-[var(--brand-primary)]" />
              ¿Cómo se calculó este ranking? (Auditoría TOPSIS)
            </summary>
            <div className="mt-3 space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
              <p>
                <strong className="text-[var(--text-primary)]">Capa 1 — Clasificación:</strong> Tu consulta fue
                normalizada con Stemmer Porter en español y comparada por TF-IDF contra las 8 categorías.
                Se detectaron entidades (números, moneda, documentos, etc.) que ajustaron los pesos.
                Resultado: categoría <strong className="text-[var(--brand-primary)]">{result.intent?.label ?? result.categoryLabel}</strong>.
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">Capa 1.5 — Detección de modo:</strong> El motor revisó keywords en la consulta para detectar si el modo debería cambiar ("gratis", "calidad máxima", "equilibrado").
                {result.modeSource === "keyword" && (
                  <> <strong className="text-[var(--color-warning)]">Se detectó modo {modeLabel(result.activeMode ?? result.mode)} por keywords</strong> (override temporal, no muta el store).</>
                )}
                {result.modeSource === "manual" && (
                  <> <strong className="text-[var(--brand-primary)]">Modo respetado manualmente</strong> (el usuario lo fijó explícitamente).</>
                )}
                {result.modeSource === "profile" && (
                  <> <strong className="text-[var(--text-primary)]">Modo heredado del perfil</strong> (sin keywords detectadas).</>
                )}
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">Capa 2 — Filtros duros:</strong> Se eliminaron
                modelos objetivamente incapaces (licencia solo-investigación, sin capacidad offline si se requiere, etc.).
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">Capa 3 — Matriz AHP:</strong> Pesos generados con
                Analytic Hierarchy Process (Saaty 1980), consistencia verificada. En modo{" "}
                <strong className="text-[var(--text-primary)]">{result.activeMode ?? result.mode}</strong>, los criterios se ponderan
                según la prioridad del perfil.
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">Capa 4 — TOPSIS:</strong> Cada modelo se evalúa por
                su distancia geométrica al ideal perfecto y al peor caso. El score de cercanía va de 0 a 1.
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">Capa 5 — Explicación:</strong> Se generan razones en
                español basadas en los 2-3 criterios donde el ganador tuvo mejor desempeño relativo.
                Detección de empate si diferencia &lt; 0.03.
              </p>
            </div>
          </details>
        </>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: string;
}) {
  return (
    <div className="rounded-lg bg-[var(--bg-elevated)] px-2.5 py-2">
      <div className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-0.5">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="num text-base font-semibold"
          style={highlight ? { color: highlight } : undefined}
        >
          {value}
        </span>
        {sub && <span className="text-[9px] text-[var(--text-secondary)]">{sub}</span>}
      </div>
    </div>
  );
}

// P1B-ENGINE — display label for an OperationMode (Spanish, capitalized).
function modeLabel(m: string): string {
  if (m === "solo-gratis") return "Solo Gratis";
  if (m === "calidad") return "Calidad";
  if (m === "equilibrado") return "Equilibrado";
  if (m === "mype") return "MYPE";
  return m;
}
