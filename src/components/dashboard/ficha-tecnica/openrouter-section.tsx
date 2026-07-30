import { ExternalLink, Cpu, Brain, Code, Bot, Eye, Mic, FileText, Zap, Clock, Shield, Layers } from "lucide-react";
import type { AIModel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PARAM_LABELS: Record<string, string> = {
  temperature: "Temperature",
  top_p: "Top-P",
  top_k: "Top-K",
  tools: "Tools / Functions",
  tool_choice: "Tool Choice",
  response_format: "Structured Output",
  reasoning: "Reasoning",
  include_reasoning: "Reasoning Traces",
  reasoning_effort: "Reasoning Effort",
  seed: "Seed",
  logprobs: "Log Probs",
  top_logprobs: "Top Log Probs",
  max_tokens: "Max Tokens",
  stop: "Stop Sequences",
  stream: "Streaming",
  presence_penalty: "Presence Penalty",
  frequency_penalty: "Frequency Penalty",
  repetition_penalty: "Repetition Penalty",
  structured_outputs: "Structured Outputs",
};

const MODALITY_ICONS: Record<string, React.ReactNode> = {
  text: <FileText className="h-3 w-3" />,
  image: <Eye className="h-3 w-3" />,
  audio: <Mic className="h-3 w-3" />,
  video: <Zap className="h-3 w-3" />,
  file: <Layers className="h-3 w-3" />,
};

function PriceRow({ label, value, note }: { label: string; value: number | null | undefined; note?: string }) {
  if (value == null) return null;
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-mono font-semibold text-[var(--text-primary)] num">
          ${value < 0.01 ? value.toFixed(4) : value.toFixed(2)}/1M
        </span>
        {note && <span className="text-[10px] text-[var(--text-disabled)]">{note}</span>}
      </div>
    </div>
  );
}

export function OpenRouterSection({ model }: { model: AIModel }) {
  const orId = model.orModelId;
  const hasData = orId != null;

  if (!hasData) return null;

  const orUrl = `https://openrouter.ai/${orId}`;
  const isAlias = model.orIsAlias === true;
  const hasReasoning = model.orReasoningMandatory != null || model.orReasoningDefaultEnabled != null;
  const hasPricing = model.orInputPrice != null || model.orOutputPrice != null;
  const hasModalities = (model.orInputModalities?.length ?? 0) > 0;
  const hasParams = (model.orSupportedParameters?.length ?? 0) > 0;
  const hasBenchmarks = model.orBenchmarksAaIntelligence != null || model.orBenchmarksAaCoding != null;

  const effortColorMap: Record<string, string> = {
    high: "text-[var(--color-error)]",
    medium: "text-[var(--color-warning)]",
    low: "text-[var(--color-success)]",
  };

  return (
    <div className="space-y-4">

      {/* Header — OR identity + link */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="text-xs font-mono text-[var(--text-secondary)] tracking-wide">{orId}</div>
          {model.orCanonicalSlug && model.orCanonicalSlug !== orId && (
            <div className="text-[10px] text-[var(--text-disabled)]">
              Slug canónico: {model.orCanonicalSlug}
            </div>
          )}
          {isAlias && model.orAliasTargetSlug && (
            <div className="rounded px-1.5 py-0.5 text-[10px] bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)] inline-block">
              Alias → {model.orAliasTargetSlug}
            </div>
          )}
        </div>
        <a
          href={orUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium bg-[var(--bg-overlay)] hover:bg-[var(--bg-surface-raised)] text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
        >
          Ver en OpenRouter <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Description */}
      {model.orDescription && (
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
          {model.orDescription}
        </p>
      )}

      {/* Context + Completion grid */}
      <div className="grid grid-cols-2 gap-2">
        {model.orContextLength && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-lg p-2 cursor-help hover:bg-[var(--bg-overlay)] transition-colors">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Brain className="h-3 w-3 text-[var(--text-secondary)]" />
                    <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Context</span>
                  </div>
                  <div className="text-base font-bold num text-[var(--text-primary)]">
                    {(model.orContextLength / 1000).toFixed(0)}K
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[200px]">
                Ventana de contexto máxima según OpenRouter.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {model.orMaxCompletion && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-lg p-2 cursor-help hover:bg-[var(--bg-overlay)] transition-colors">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Code className="h-3 w-3 text-[var(--text-secondary)]" />
                    <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Max output</span>
                  </div>
                  <div className="text-base font-bold num text-[var(--text-primary)]">
                    {(model.orMaxCompletion / 1000).toFixed(0)}K
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[200px]">
                Tokens máximos de salida por request según OpenRouter.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {model.orKnowledgeCutoff && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-lg p-2 cursor-help hover:bg-[var(--bg-overlay)] transition-colors">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Clock className="h-3 w-3 text-[var(--text-secondary)]" />
                    <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Knowledge cutoff</span>
                  </div>
                  <div className="text-base font-bold num text-[var(--text-primary)]">
                    {model.orKnowledgeCutoff}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[200px]">
                Fecha de corte del conocimiento de entrenamiento según OpenRouter.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {model.orIsModerated != null && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-lg p-2 cursor-help hover:bg-[var(--bg-overlay)] transition-colors">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Shield className="h-3 w-3 text-[var(--text-secondary)]" />
                    <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Moderación</span>
                  </div>
                  <div className={cn("text-sm font-bold", model.orIsModerated ? "text-[var(--color-warning)]" : "text-[var(--color-success)]")}>
                    {model.orIsModerated ? "Activa" : "Sin filtros"}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[200px]">
                Indica si OpenRouter aplica filtrado de contenido (content moderation) a este modelo.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Pricing table */}
      {hasPricing && (
        <div className="rounded-md bg-[var(--bg-overlay)] px-3 py-2 space-y-0.5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-disabled)] mb-1.5 font-medium">Precios (OpenRouter)</div>
          <PriceRow label="Input" value={model.orInputPrice} />
          <PriceRow label="Output" value={model.orOutputPrice} />
          <PriceRow label="Cache read" value={model.orCacheReadPrice} />
          <PriceRow label="Cache write" value={model.orCacheWritePrice} />
          {model.orWebSearchPrice != null && (
            <div className="flex items-center justify-between py-0.5">
              <span className="text-xs text-[var(--text-secondary)]">Web search</span>
              <span className="text-xs font-mono font-semibold text-[var(--text-primary)] num">
                ${model.orWebSearchPrice.toFixed(3)}/búsqueda
              </span>
            </div>
          )}
        </div>
      )}

      {/* Reasoning block */}
      {hasReasoning && (
        <div className="rounded-md border border-[var(--border-subtle)] px-3 py-2 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-disabled)] mb-1 font-medium">Razonamiento</div>
          <div className="flex flex-wrap gap-1.5">
            {model.orReasoningMandatory === true && (
              <span className="rounded px-1.5 py-0.5 text-[10px] bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error-border)]">
                Obligatorio
              </span>
            )}
            {model.orReasoningDefaultEnabled === true && model.orReasoningMandatory !== true && (
              <span className="rounded px-1.5 py-0.5 text-[10px] bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]">
                Activado por defecto
              </span>
            )}
            {(model.orReasoningEfforts ?? []).map(e => (
              <span key={e} className={cn("rounded px-1.5 py-0.5 text-[10px] border", effortColorMap[e] ?? "text-[var(--text-secondary)]",
                e === "high" ? "bg-[var(--color-error-bg)] border-[var(--color-error-border)]" :
                e === "medium" ? "bg-[var(--color-warning-bg)] border-[var(--color-warning-border)]" :
                "bg-[var(--color-success-bg)] border-[var(--color-success-border)]"
              )}>
                effort: {e}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Input/Output modalities */}
      {hasModalities && (
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-disabled)] font-medium">Modalidades</div>
          <div className="flex flex-wrap gap-1">
            {(model.orInputModalities ?? []).map(m => (
              <span key={`in-${m}`} className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] bg-[var(--bg-overlay)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                {MODALITY_ICONS[m] ?? null}
                {m} in
              </span>
            ))}
            {(model.orOutputModalities ?? []).map(m => (
              <span key={`out-${m}`} className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20">
                {MODALITY_ICONS[m] ?? null}
                {m} out
              </span>
            ))}
          </div>
          {model.orTokenizer && (
            <div className="text-[10px] text-[var(--text-disabled)]">
              Tokenizer: <span className="font-mono">{model.orTokenizer}</span>
              {model.orInstructType && <> · Instruct: <span className="font-mono">{model.orInstructType}</span></>}
            </div>
          )}
        </div>
      )}

      {/* Benchmarks from OR */}
      {hasBenchmarks && (
        <div className="rounded-md bg-[var(--bg-overlay)] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-disabled)] mb-1.5 font-medium">Benchmarks (via OpenRouter)</div>
          <div className="grid grid-cols-3 gap-1">
            {model.orBenchmarksAaIntelligence != null && (
              <div className="text-center">
                <div className="text-base font-bold num text-[var(--text-primary)]">{model.orBenchmarksAaIntelligence.toFixed(1)}</div>
                <div className="text-[9px] uppercase tracking-wider text-[var(--text-disabled)]">Intelligence</div>
              </div>
            )}
            {model.orBenchmarksAaCoding != null && (
              <div className="text-center">
                <div className="text-base font-bold num text-[var(--text-primary)]">{model.orBenchmarksAaCoding.toFixed(1)}</div>
                <div className="text-[9px] uppercase tracking-wider text-[var(--text-disabled)]">Coding</div>
              </div>
            )}
            {model.orBenchmarksAaAgentic != null && (
              <div className="text-center">
                <div className="text-base font-bold num text-[var(--text-primary)]">{model.orBenchmarksAaAgentic.toFixed(1)}</div>
                <div className="text-[9px] uppercase tracking-wider text-[var(--text-disabled)]">Agentic</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supported parameters */}
      {hasParams && (
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-disabled)] font-medium">Parámetros soportados</div>
          <div className="flex flex-wrap gap-1">
            {(model.orSupportedParameters ?? []).map(p => (
              <span key={p} className="rounded px-1.5 py-0.5 text-[10px] bg-[var(--bg-overlay)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-mono">
                {PARAM_LABELS[p] ?? p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expiration warning */}
      {model.orExpirationDate && (
        <div className="rounded-md border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-3 py-2">
          <div className="text-xs font-semibold text-[var(--color-error)]">⚠ Deprecación programada</div>
          <div className="text-xs text-[var(--text-secondary)] mt-0.5">
            Este modelo expira el {new Date(model.orExpirationDate).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}.
          </div>
        </div>
      )}

      {/* HF ID from OR */}
      {model.orHuggingFaceId && (
        <div className="text-xs text-[var(--text-disabled)]">
          HuggingFace ID (OpenRouter):{" "}
          <a href={`https://huggingface.co/${model.orHuggingFaceId}`} target="_blank" rel="noopener noreferrer"
            className="font-mono underline hover:text-[var(--text-secondary)] transition-colors">
            {model.orHuggingFaceId}
          </a>
        </div>
      )}

      {/* Footnote */}
      <div className="text-xs text-[var(--text-disabled)] italic">
        Fuente: openrouter.ai/api/v1/models — catálogo público sin autenticación
      </div>
    </div>
  );
}
