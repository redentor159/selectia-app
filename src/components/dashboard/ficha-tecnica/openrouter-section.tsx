import { ExternalLink, Cpu, Brain, Code, Bot, Eye, Mic, FileText, Zap, Clock, Shield, Layers, Settings2, Sparkles, CheckCircle2 } from "lucide-react";
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
  text: <FileText className="h-4 w-4" />,
  image: <Eye className="h-4 w-4" />,
  audio: <Mic className="h-4 w-4" />,
  video: <Zap className="h-4 w-4" />,
  file: <Layers className="h-4 w-4" />,
};

function PriceRow({ label, value, note }: { label: string; value: number | null | undefined; note?: string }) {
  if (value == null) return null;
  return (
    <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)] last:border-0">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-mono font-medium text-[var(--text-primary)]">
          ${value < 0.01 ? value.toFixed(4) : value.toFixed(2)}
          <span className="text-xs text-[var(--text-disabled)] font-sans font-normal ml-0.5">/1M</span>
        </span>
        {note && <span className="text-xs text-[var(--text-disabled)]">{note}</span>}
      </div>
    </div>
  );
}

function SpecBox({ label, value, icon: Icon, tooltip }: { label: string; value: React.ReactNode; icon: React.ElementType; tooltip?: string }) {
  const content = (
    <div className="flex flex-col p-3 rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-subtle)] transition-colors hover:border-[var(--border-strong)] group">
      <div className="flex items-center gap-1.5 mb-1 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-medium text-[var(--text-primary)]">{value}</div>
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">{content}</div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs max-w-[250px]">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return content;
}

export function OpenRouterSection({ model }: { model: AIModel }) {
  const orId = model.orModelId;
  if (!orId) return null;

  const isAlias = model.orIsAlias === true;
  // Solo consideramos que hay razonamiento si hay banderas activas o si hay un arreglo de esfuerzos con al menos un elemento.
  const hasReasoning = model.orReasoningMandatory === true || model.orReasoningDefaultEnabled === true || (model.orReasoningEfforts && model.orReasoningEfforts.length > 0);
  const hasPricing = model.orInputPrice != null || model.orOutputPrice != null;
  const hasModalities = (model.orInputModalities?.length ?? 0) > 0;
  const hasParams = (model.orSupportedParameters?.length ?? 0) > 0;
  const hasBenchmarks = model.orBenchmarksAaIntelligence != null || model.orBenchmarksAaCoding != null || model.orBenchmarksAaAgentic != null;

  return (
    <div className="space-y-6">
      {/* Header — OR identity + link */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-mono font-semibold text-[var(--text-primary)] tracking-wide">{orId}</h4>
            {isAlias && model.orAliasTargetSlug && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)]">
                Alias de {model.orAliasTargetSlug}
              </span>
            )}
          </div>
          {model.orCanonicalSlug && model.orCanonicalSlug !== orId && (
            <div className="text-xs text-[var(--text-disabled)]">
              Slug canónico: <span className="font-mono">{model.orCanonicalSlug}</span>
            </div>
          )}
        </div>
        <a
          href={`https://openrouter.ai/${orId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-[var(--brand-primary)]/10 hover:bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] transition-colors border border-[var(--brand-primary)]/20"
        >
          Ver catálogo <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Description */}
      {model.orDescription && (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed border-l-2 border-[var(--border-strong)] pl-3">
          {model.orDescription}
        </p>
      )}

      {/* Specs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {model.orContextLength && (
          <SpecBox
            label="Context Window"
            icon={Brain}
            value={<span className="font-mono text-base">{(model.orContextLength / 1000).toFixed(0)}K</span>}
            tooltip="Ventana de contexto máxima certificada por OpenRouter."
          />
        )}
        {model.orMaxCompletion && (
          <SpecBox
            label="Max Output"
            icon={Code}
            value={<span className="font-mono text-base">{(model.orMaxCompletion / 1000).toFixed(0)}K</span>}
            tooltip="Límite máximo de tokens generados por respuesta."
          />
        )}
        {model.orKnowledgeCutoff && (
          <SpecBox
            label="Knowledge"
            icon={Clock}
            value={model.orKnowledgeCutoff}
            tooltip="Fecha de corte del entrenamiento base."
          />
        )}
        {model.orIsModerated != null && (
          <SpecBox
            label="Filtros (Safety)"
            icon={Shield}
            value={
              <span className={cn(model.orIsModerated ? "text-[var(--color-warning)]" : "text-[var(--color-success)]")}>
                {model.orIsModerated ? "Moderado" : "Sin filtros"}
              </span>
            }
            tooltip="Indica si el proveedor aplica capas de moderación de contenido (NSFW/Violence)."
          />
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Pricing Block */}
        {hasPricing && (
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
            <div className="bg-[var(--bg-overlay)] px-4 py-2 border-b border-[var(--border-subtle)] flex items-center gap-2">
              <Zap className="h-4 w-4 text-[var(--text-secondary)]" />
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">Esquema de Precios</h5>
            </div>
            <div className="p-4 space-y-1">
              <PriceRow label="Input (Prompt)" value={model.orInputPrice} />
              <PriceRow label="Output (Completion)" value={model.orOutputPrice} />
              <PriceRow label="Cache Read" value={model.orCacheReadPrice} />
              <PriceRow label="Cache Write" value={model.orCacheWritePrice} />
              {model.orWebSearchPrice != null && (
                <div className="flex items-center justify-between py-1 pt-2 mt-1 border-t border-[var(--border-subtle)]">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Web search (Fee plano)</span>
                  <span className="text-sm font-mono font-medium text-[var(--brand-primary)]">
                    ${model.orWebSearchPrice.toFixed(3)}
                    <span className="text-xs font-sans text-[var(--text-disabled)] ml-0.5">/req</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Benchmarks Block */}
          {hasBenchmarks && (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
              <div className="bg-[var(--bg-overlay)] px-4 py-2 border-b border-[var(--border-subtle)] flex items-center gap-2">
                <Bot className="h-4 w-4 text-[var(--text-secondary)]" />
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">Benchmarks Destacados</h5>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[var(--border-subtle)]">
                {model.orBenchmarksAaIntelligence != null && (
                  <div className="p-3 text-center flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-[var(--text-primary)] font-mono">{model.orBenchmarksAaIntelligence.toFixed(1)}</span>
                    <span className="text-xs text-[var(--text-secondary)] mt-1">Intelligence</span>
                  </div>
                )}
                {model.orBenchmarksAaCoding != null && (
                  <div className="p-3 text-center flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-[var(--text-primary)] font-mono">{model.orBenchmarksAaCoding.toFixed(1)}</span>
                    <span className="text-xs text-[var(--text-secondary)] mt-1">Coding</span>
                  </div>
                )}
                {model.orBenchmarksAaAgentic != null && (
                  <div className="p-3 text-center flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-[var(--text-primary)] font-mono">{model.orBenchmarksAaAgentic.toFixed(1)}</span>
                    <span className="text-xs text-[var(--text-secondary)] mt-1">Agentic</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reasoning Capabilities */}
          {hasReasoning && (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[var(--brand-primary)]" />
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">Capacidades de Razonamiento</h5>
              </div>
              <div className="flex flex-wrap gap-2">
                {model.orReasoningMandatory === true && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error-border)]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Razonamiento Obligatorio
                  </span>
                )}
                {model.orReasoningDefaultEnabled === true && model.orReasoningMandatory !== true && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Activado por Defecto
                  </span>
                )}
                {(model.orReasoningEfforts ?? []).length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] ml-1">
                    <span className="font-medium">Niveles soportados:</span>
                    {(model.orReasoningEfforts ?? []).join(", ")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modalities & Architecture */}
      {hasModalities && (
        <div className="rounded-xl bg-[var(--bg-overlay)] p-4 space-y-3">
          <div className="flex items-center gap-2 text-[var(--text-primary)]">
            <Layers className="h-4 w-4" />
            <h5 className="text-xs font-semibold uppercase tracking-wider">Arquitectura y Modalidades</h5>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="space-y-1.5">
              <span className="text-xs text-[var(--text-disabled)] block">Input Modalities</span>
              <div className="flex items-center gap-2">
                {(model.orInputModalities ?? []).map(m => (
                  <TooltipProvider key={`in-${m}`} delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                          {MODALITY_ICONS[m] || <FileText className="h-4 w-4" />}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs capitalize">{m}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-[var(--text-disabled)] block">Output Modalities</span>
              <div className="flex items-center gap-2">
                {(model.orOutputModalities ?? []).map(m => (
                  <TooltipProvider key={`out-${m}`} delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded-md bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 text-[var(--brand-primary)]">
                          {MODALITY_ICONS[m] || <FileText className="h-4 w-4" />}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs capitalize">{m}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>

            {model.orTokenizer && (
              <div className="space-y-0.5 ml-auto text-right">
                <span className="text-xs text-[var(--text-disabled)] block">Tokenizer</span>
                <span className="text-sm font-mono font-medium text-[var(--text-primary)]">{model.orTokenizer}</span>
              </div>
            )}
            {model.orInstructType && (
              <div className="space-y-0.5 ml-4 text-right border-l border-[var(--border-subtle)] pl-4">
                <span className="text-xs text-[var(--text-disabled)] block">Instruct Type</span>
                <span className="text-sm font-mono font-medium text-[var(--text-primary)]">{model.orInstructType}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supported Parameters (Redesigned as clean text list) */}
      {hasParams && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-[var(--text-secondary)]" />
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">Parámetros Soportados</h5>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {(model.orSupportedParameters ?? []).map(p => PARAM_LABELS[p] ?? p).join(" • ")}
          </p>
        </div>
      )}

      {/* Meta Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)]">
        {model.orHuggingFaceId ? (
          <div className="text-xs text-[var(--text-secondary)]">
            HuggingFace Repositorio:{" "}
            <a href={`https://huggingface.co/${model.orHuggingFaceId}`} target="_blank" rel="noopener noreferrer"
              className="font-mono text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors underline underline-offset-2">
              {model.orHuggingFaceId}
            </a>
          </div>
        ) : (
          <div /> // spacer
        )}
        <div className="text-xs text-[var(--text-disabled)] text-right">
          Sincronizado vía OpenRouter API
        </div>
      </div>

      {/* Expiration warning */}
      {model.orExpirationDate && (
        <div className="rounded-lg border border-[var(--color-error-border)] bg-[var(--color-error-bg)] p-3 flex items-start gap-3">
          <Shield className="h-5 w-5 text-[var(--color-error)] shrink-0" />
          <div>
            <div className="text-sm font-semibold text-[var(--color-error)]">⚠ Deprecación Programada</div>
            <div className="text-xs text-[var(--color-error)]/80 mt-0.5">
              Este modelo expira y será retirado de OpenRouter el {new Date(model.orExpirationDate).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
