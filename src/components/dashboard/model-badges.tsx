"use client";

import {
  Wrench,
  Eye,
  Braces,
  Brain,
  Mic,
  Volume2,
  FileText,
  Globe,
  RefreshCw,
  Zap,
  HardDriveDownload,
  Shield,
  Award,
  Activity,
} from "lucide-react";
import type { AIModel, Capabilities } from "@/lib/types";
import { LICENSE_META, FREE_ACCESS_META } from "@/lib/format";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CapabilityItem {
  key: keyof Capabilities;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

const CAPABILITY_ITEMS: CapabilityItem[] = [
  { key: "toolUse", icon: Wrench, label: "Tool Use", description: "Puede llamar funciones externas (APIs, calculadoras, bases de datos)" },
  { key: "vision", icon: Eye, label: "Visión", description: "Puede analizar imágenes, fotos, diagramas o planos" },
  { key: "jsonMode", icon: Braces, label: "JSON Mode", description: "Puede generar respuestas en formato estructurado (JSON)" },
  { key: "reasoning", icon: Brain, label: "Razonamiento", description: "Puede pensar paso a paso antes de responder" },
  { key: "audioInput", icon: Mic, label: "Audio Input", description: "Puede recibir audio como entrada (voz)" },
  { key: "audioOutput", icon: Volume2, label: "Audio Output", description: "Puede generar audio como respuesta (voz)" },
  { key: "pdf", icon: FileText, label: "Documentos", description: "Puede leer y analizar PDFs y documentos" },
  { key: "webSearch", icon: Globe, label: "Web Search", description: "Puede buscar en internet en tiempo real" },
  { key: "interleavedReasoning", icon: RefreshCw, label: "Interleaved", description: "Puede alternar entre pensar y responder en partes" },
  { key: "extendedThinking", icon: Zap, label: "Extended Thinking", description: "Puede 'pensar' más tiempo para tareas complejas" },
];

interface CapabilityIconsProps {
  model: AIModel;
  size?: "sm" | "md";
  effectiveCaps?: Capabilities;
}

export function CapabilityIcons({ model, size = "sm", effectiveCaps }: CapabilityIconsProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const caps = effectiveCaps ?? model.capabilities;
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex flex-nowrap items-center gap-0.5 overflow-hidden">
        {CAPABILITY_ITEMS.map((item) => {
          const active = caps[item.key];
          const Icon = item.icon;
          return (
            <Tooltip key={item.key}>
              <TooltipTrigger asChild>
                <span
                  className={`inline-flex items-center justify-center rounded p-0.5 transition-colors cursor-help ${
                    active
                      ? "text-[var(--brand-primary)] bg-[var(--brand-primary-subtle)]"
                      : "text-[var(--text-disabled)] opacity-40"
                  }`}
                >
                  <Icon className={iconSize} />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[200px]">
                <div className="font-semibold mb-0.5">{item.label} {active ? "✓" : "—"}</div>
                <div className="text-[10px] opacity-80">{item.description}</div>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {model.ollamaAvailable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center justify-center rounded p-1 text-[var(--color-teal)] bg-[rgba(0,184,204,0.12)]">
                <HardDriveDownload className={iconSize} />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Disponible offline (Ollama)
            </TooltipContent>
          </Tooltip>
        )}
        {model.speedTps !== null && model.speedTps >= 150 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center justify-center rounded p-1 text-[var(--color-warning)] bg-[var(--color-warning-bg)]">
                <Zap className={iconSize} />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Alta velocidad ({model.speedTps} tok/s)
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// ---------- License Badge ----------

interface LicenseBadgeProps {
  license: AIModel["license"];
  licenseName: string;
  showLabel?: boolean;
}

export function LicenseBadge({ license, licenseName, showLabel = true }: LicenseBadgeProps) {
  const meta = LICENSE_META[license];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap"
          style={{
            color: meta.color,
            backgroundColor: meta.bgColor,
            border: `1px solid ${meta.borderColor}`,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
          {showLabel ? meta.label : licenseName}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {licenseName}
      </TooltipContent>
    </Tooltip>
  );
}

// ---------- Free Access Badge ----------

interface FreeAccessBadgeProps {
  freeAccess: AIModel["freeAccess"];
}

export function FreeAccessBadge({ freeAccess }: FreeAccessBadgeProps) {
  const meta = FREE_ACCESS_META[freeAccess];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap"
      style={{
        color: meta.color,
        backgroundColor: meta.bgColor,
        border: `1px solid ${meta.borderColor}`,
      }}
    >
      {meta.label}
    </span>
  );
}

// ---------- Inference Providers ----------

interface InferenceProvidersProps {
  model: AIModel;
}

export function InferenceProviders({ model }: InferenceProvidersProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {model.inferenceProviders.slice(0, 5).map((p, idx) => {
        let cls = "text-[var(--text-secondary)] bg-[var(--bg-overlay)] border-[var(--border-default)]";
        if (p.cheapest) cls = "text-[var(--color-success)] bg-[var(--color-success-bg)] border-[var(--color-success-border)]";
        else if (p.fastest) cls = "text-[var(--color-warning)] bg-[var(--color-warning-bg)] border-[var(--color-warning-border)]";
        else if (p.offline) cls = "text-[var(--color-teal)] bg-[rgba(0,184,204,0.12)] border-[rgba(0,184,204,0.25)]";
        return (
          <span
            key={`${p.name}-${idx}`}
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border ${cls}`}
          >
            {p.name}
          </span>
        );
      })}
    </div>
  );
}

// ---------- Model Status Badge ----------

export function ModelStatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-success)]">
        <Activity className="h-3 w-3" /> Activo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-disabled)]">
      <Shield className="h-3 w-3" /> Descontinuado
    </span>
  );
}

export { Award };
