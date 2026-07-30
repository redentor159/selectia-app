import { ExternalLink, Trophy, Hash, Activity, Library } from "lucide-react";
import type { AIModel } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CompactMetricRow } from "./compact-metric-row";

const BENCHLM_CATEGORY_ROWS: Array<{ key: keyof NonNullable<AIModel["benchlmCategoryScores"]>; label: string }> = [
  { key: "agentic", label: "Agentic" },
  { key: "coding", label: "Coding" },
  { key: "reasoning", label: "Reasoning" },
  { key: "multimodalGrounded", label: "Multimodal Grounded" },
  { key: "knowledge", label: "Knowledge" },
  { key: "multilingual", label: "Multilingual" },
  { key: "instructionFollowing", label: "Instruction Following" },
  { key: "math", label: "Math" },
];

function getScoreColor(score: number | null | undefined): string {
  if (score == null) return "var(--text-disabled)";
  if (score >= 80) return "var(--color-success)";
  if (score >= 60) return "var(--color-warning)";
  return "var(--color-error)";
}

function ConfidenceDots({ confidence }: { confidence: number | null | undefined }) {
  const level = Math.max(1, Math.min(3, confidence ?? 1));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Confianza ${level} de 3`} title={`Score confidence: ${level}/3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: i <= level ? "var(--brand-primary)" : "var(--border)",
            opacity: i <= level ? 1 : 0.5,
          }}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function BenchlmProfileSection({ model }: { model: AIModel }) {
  const scores = model.benchlmCategoryScores;
  const displayScore = model.benchlmDisplayScore;
  const rank = model.benchlmOverallRank;
  const confidence = model.benchlmScoreConfidence;
  const benchCount = model.benchlmTrustedBenchmarkCount;
  const slug = model.benchlmSlug;
  const scorePerDollar = model.benchlmScorePerOutputDollar;
  const pricingNote = model.benchlmPricingNote;

  return (
    <div className="space-y-6">
      {/* Top row: score / rank / confidence / benchmark count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1">
        <CompactMetricRow
          icon={Trophy}
          label="Display Score"
          value={displayScore != null ? `${displayScore}/100` : "—"}
          tooltip={<><div className="font-semibold mb-1">Score principal</div>Puntaje global consolidado por benchlm.ai, ponderado en base a 8 dimensiones de rendimiento.</>}
        />
        <CompactMetricRow
          icon={Hash}
          label="Overall Rank"
          value={rank != null ? `#${rank}` : "—"}
          tooltip={<><div className="font-semibold mb-1">Ranking global</div>Posición en el ranking global de todos los modelos evaluados en benchlm.ai.</>}
        />
        <CompactMetricRow
          icon={Activity}
          label="Confidence"
          value={<div className="flex items-center h-4 mt-1 justify-end"><ConfidenceDots confidence={confidence} /></div>}
          tooltip={<><div className="font-semibold mb-1">Nivel de confianza</div>Nivel de confianza en los resultados (1-3). Depende de la varianza en los benchmarks y cantidad de pruebas realizadas.</>}
        />
        <CompactMetricRow
          icon={Library}
          label="Benchmarks"
          value={benchCount != null ? `${benchCount} verificados` : "—"}
          tooltip={<><div className="font-semibold mb-1">Datasets verificados</div>Cantidad de datasets y tests independientes utilizados para componer el puntaje de este modelo.</>}
        />
      </div>

      {/* 8-category progress bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-[var(--border-default)]">
        {BENCHLM_CATEGORY_ROWS.map((row) => {
          const v = scores?.[row.key] ?? null;
          const color = getScoreColor(v);
          const hasData = v != null;
          return (
            <TooltipProvider delayDuration={200} key={row.key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col gap-1.5 group cursor-help">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[var(--text-secondary)] uppercase tracking-wider group-hover:text-[var(--text-primary)] transition-colors">{row.label}</span>
                      <span className="num font-extrabold" style={{ color: hasData ? color : "var(--text-disabled)" }}>{hasData ? v!.toFixed(1) : "—"}</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
                      {hasData ? (
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${v}%`, 
                            backgroundColor: color
                          }}
                        />
                      ) : (
                        <div className="w-full border-t-2 border-dashed border-[var(--text-disabled)] absolute top-1/2 -translate-y-1/2 opacity-20" />
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-[200px]">
                  Puntaje (0-100) en la categoría {row.label}. Indica el rendimiento específico del modelo en este dominio, evaluado mediante suites de test de benchlm.ai.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Footnotes & Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-col gap-1">
          {scorePerDollar != null && (
            <div className="text-[11px] text-[var(--text-secondary)]">
              Eficiencia de costo: <span className="font-mono text-[var(--text-primary)]">{scorePerDollar.toFixed(2)} score / $1</span> (estimado)
            </div>
          )}
          {pricingNote && (
            <div className="text-[11px] text-[var(--text-disabled)] italic">
              {pricingNote}
            </div>
          )}
        </div>
        
        {slug && (
          <a
            href={`https://benchlm.ai/models/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1 self-start sm:self-auto bg-[var(--bg-overlay)] px-2 py-1 rounded"
          >
            Ver en BenchLM
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
