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
  text: <FileText className="h-3.5 w-3.5" />,
  image: <Eye className="h-3.5 w-3.5" />,
  audio: <Mic className="h-3.5 w-3.5" />,
  video: <Zap className="h-3.5 w-3.5" />,
  file: <Layers className="h-3.5 w-3.5" />,
};

function CompactRow({ label, value, tooltip }: { label: string; value: React.ReactNode; tooltip?: string }) {
  const content = (
    <div className="flex items-baseline justify-between py-1 border-b border-[var(--border-default)] last:border-0 group">
      <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{label}</span>
      <span className="text-sm font-medium text-[var(--text-primary)] text-right">{value}</span>
    </div>
  );

  if (!tooltip) return content;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{content}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[250px]">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function OpenRouterSection({ model }: { model: AIModel }) {
  const orId = model.orModelId;
  if (!orId) return null;

  const isAlias = model.orIsAlias === true;
  const hasReasoning = model.orReasoningMandatory === true || model.orReasoningDefaultEnabled === true || (model.orReasoningEfforts && model.orReasoningEfforts.length > 0);
  const hasPricing = model.orInputPrice != null || model.orOutputPrice != null;
  const hasBenchmarks = model.orBenchmarksAaIntelligence != null || model.orBenchmarksAaCoding != null || model.orBenchmarksAaAgentic != null;
  const hasParams = (model.orSupportedParameters?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Ultra-compact Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-mono font-semibold text-[var(--text-primary)] tracking-tight">{orId}</h4>
          {isAlias && model.orAliasTargetSlug && (
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[var(--bg-overlay)] text-[var(--text-secondary)] border border-[var(--border-default)]">
              Alias: {model.orAliasTargetSlug}
            </span>
          )}
          {model.orExpirationDate && (
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning-border)] flex items-center gap-1">
              <Shield className="h-3 w-3" /> Expira {new Date(model.orExpirationDate).toLocaleDateString("es-PE", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
        <a
          href={`https://openrouter.ai/${orId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 transition-colors"
        >
          Ver en OpenRouter <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* 2. High-Density Data Grid (3 columns on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
        
        {/* Col 1: Core Specs & Modalities */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-disabled)] mb-2">Especificaciones</div>
          
          {model.orContextLength && (
            <CompactRow 
              label="Context Window" 
              value={<span className="font-mono">{(model.orContextLength / 1000).toFixed(0)}K</span>} 
            />
          )}
          {model.orMaxCompletion && (
            <CompactRow 
              label="Max Output" 
              value={<span className="font-mono">{(model.orMaxCompletion / 1000).toFixed(0)}K</span>} 
            />
          )}
          {model.orKnowledgeCutoff && (
            <CompactRow label="Knowledge Cutoff" value={model.orKnowledgeCutoff} />
          )}
          {model.orIsModerated != null && (
            <CompactRow 
              label="Filtros de Seguridad" 
              value={model.orIsModerated ? "Moderado" : "Sin filtros"} 
            />
          )}
          
          <div className="flex items-center justify-between py-1 border-b border-[var(--border-default)]">
            <span className="text-xs text-[var(--text-secondary)]">Input / Output</span>
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <div className="flex items-center">
                {(model.orInputModalities ?? ["text"]).map(m => (
                  <span key={`in-${m}`} className="opacity-80" title={`Input: ${m}`}>{MODALITY_ICONS[m] || <FileText className="h-3.5 w-3.5" />}</span>
                ))}
              </div>
              <span className="text-[var(--text-disabled)] text-xs">→</span>
              <div className="flex items-center">
                {(model.orOutputModalities ?? ["text"]).map(m => (
                  <span key={`out-${m}`} className="opacity-80" title={`Output: ${m}`}>{MODALITY_ICONS[m] || <FileText className="h-3.5 w-3.5" />}</span>
                ))}
              </div>
            </div>
          </div>
          
          {model.orTokenizer && (
            <CompactRow label="Tokenizer" value={<span className="font-mono">{model.orTokenizer}</span>} />
          )}
        </div>

        {/* Col 2: Economics */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-disabled)] mb-2">Economía (USD / 1M)</div>
          
          {hasPricing ? (
            <>
              <CompactRow label="Input (Prompt)" value={<span className="font-mono">${model.orInputPrice?.toFixed(2) ?? "—"}</span>} />
              <CompactRow label="Output (Completion)" value={<span className="font-mono">${model.orOutputPrice?.toFixed(2) ?? "—"}</span>} />
              {model.orCacheReadPrice != null && (
                <CompactRow label="Cache Read" value={<span className="font-mono">${model.orCacheReadPrice.toFixed(2)}</span>} />
              )}
              {model.orCacheWritePrice != null && (
                <CompactRow label="Cache Write" value={<span className="font-mono">${model.orCacheWritePrice.toFixed(2)}</span>} />
              )}
              {model.orWebSearchPrice != null && (
                <CompactRow label="Web Search Fee" value={<span className="font-mono">${model.orWebSearchPrice.toFixed(3)}<span className="text-[10px] text-[var(--text-disabled)] font-sans ml-1">/req</span></span>} />
              )}
            </>
          ) : (
            <div className="text-xs text-[var(--text-disabled)] py-1 italic">Precios no reportados</div>
          )}
        </div>

        {/* Col 3: Capabilities & Benchmarks */}
        <div className="space-y-4">
          {hasBenchmarks && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-disabled)] mb-2">Benchmarks (AA)</div>
              <div className="grid grid-cols-3 gap-1">
                <div className="flex flex-col items-center justify-center p-1.5 bg-[var(--bg-overlay)] rounded-sm">
                  <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">{model.orBenchmarksAaIntelligence?.toFixed(1) ?? "—"}</span>
                  <span className="text-[9px] uppercase text-[var(--text-secondary)]">Intel</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1.5 bg-[var(--bg-overlay)] rounded-sm">
                  <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">{model.orBenchmarksAaCoding?.toFixed(1) ?? "—"}</span>
                  <span className="text-[9px] uppercase text-[var(--text-secondary)]">Code</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1.5 bg-[var(--bg-overlay)] rounded-sm">
                  <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">{model.orBenchmarksAaAgentic?.toFixed(1) ?? "—"}</span>
                  <span className="text-[9px] uppercase text-[var(--text-secondary)]">Agent</span>
                </div>
              </div>
            </div>
          )}

          {hasReasoning && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-disabled)] mb-1.5">Razonamiento</div>
              <div className="flex flex-wrap gap-1.5">
                {model.orReasoningMandatory === true && (
                  <span className="px-1.5 py-0.5 rounded-sm bg-[var(--bg-overlay)] text-[10px] font-medium text-[var(--text-primary)]">Obligatorio</span>
                )}
                {model.orReasoningDefaultEnabled === true && model.orReasoningMandatory !== true && (
                  <span className="px-1.5 py-0.5 rounded-sm bg-[var(--bg-overlay)] text-[10px] font-medium text-[var(--text-primary)]">Por Defecto</span>
                )}
                {(model.orReasoningEfforts ?? []).length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-sm bg-[var(--bg-overlay)] text-[10px] font-medium text-[var(--text-secondary)] font-mono">
                    {(model.orReasoningEfforts ?? []).join("/")}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Footer utilities (Params + HF ID) condensed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[var(--border-default)]">
        {hasParams ? (
          <details className="group relative">
            <summary className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer list-none select-none transition-colors">
              ▶ Parámetros de API Soportados
            </summary>
            <div className="absolute left-0 top-full mt-2 w-[calc(100vw-32px)] max-w-md z-10 p-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-lg rounded-md">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {(model.orSupportedParameters ?? []).map(p => PARAM_LABELS[p] ?? p).join(" • ")}
              </p>
            </div>
          </details>
        ) : <div />}

        {model.orHuggingFaceId && (
          <div className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1.5">
            HF Base: 
            <a href={`https://huggingface.co/${model.orHuggingFaceId}`} target="_blank" rel="noopener noreferrer" className="font-mono hover:text-[var(--text-primary)] underline underline-offset-2">
              {model.orHuggingFaceId}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
