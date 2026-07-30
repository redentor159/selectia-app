import { Scale, Cpu, Database, Globe, BookOpen, Calendar, Users, Wifi, WifiOff, Package, Check, X, ShieldCheck } from "lucide-react";
import type { AIModel, Capabilities } from "@/lib/types";
import { CompactMetricRow } from "./compact-metric-row";

const FREE_ACCESS_LABELS: Record<string, string> = {
  "free-100": "100% Gratis",
  "free-limited": "Gratis (con límite)",
  "free-registration": "Gratis (con registro)",
  "paid-only": "Solo Pago",
};

const FREE_ACCESS_COLORS: Record<string, string> = {
  "free-100": "var(--color-success)",
  "free-limited": "var(--color-warning)",
  "free-registration": "var(--color-warning)",
  "paid-only": "var(--color-error)",
};

const LICENSE_COLORS: Record<string, string> = {
  "commercial-open": "var(--color-success)",
  "open-source-full": "var(--color-success)",
  "conditional": "var(--color-warning)",
  "api-paid": "var(--color-error)",
  "research-only": "var(--text-disabled)",
};

const CAP_LABELS: Array<{ key: keyof Capabilities; label: string }> = [
  { key: "toolUse", label: "Tool Use" },
  { key: "vision", label: "Vision" },
  { key: "reasoning", label: "Reasoning" },
  { key: "jsonMode", label: "JSON Mode" },
  { key: "audioInput", label: "Audio In" },
  { key: "audioOutput", label: "Audio Out" },
  { key: "pdf", label: "PDF" },
  { key: "webSearch", label: "Web Search" },
  { key: "extendedThinking", label: "Ext. Thinking" },
  { key: "interleavedReasoning", label: "Interleaved" },
];

export function CoreModelSection({ model }: { model: AIModel }) {
  const caps = model.capabilities;
  const activeCaps = CAP_LABELS.filter(c => caps[c.key]);
  const inactiveCaps = CAP_LABELS.filter(c => !caps[c.key]);

  return (
    <div className="space-y-5">
      {/* Identidad y acceso */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1">
        {model.parameters && (
          <CompactMetricRow
            icon={Cpu}
            label="Parámetros"
            value={<span className="font-mono">{model.parameters}{model.isMoE ? <span className="text-[10px] ml-1 text-[var(--color-info)] font-sans">(MoE)</span> : null}</span>}
            tooltip={<><div className="font-semibold mb-1">Tamaño del modelo</div>Número de parámetros del modelo. MoE (Mixture of Experts) significa que el modelo activa solo una fracción de ellos por inferencia, haciéndolo más eficiente de lo que su tamaño total sugiere.</>}
          />
        )}
        {model.family && (
          <CompactMetricRow
            icon={Database}
            label="Familia"
            value={model.family}
            tooltip={<><div className="font-semibold mb-1">Familia del modelo</div>La línea o familia arquitectónica a la que pertenece este modelo (ej. GPT, Claude, Llama, Gemma). Útil para inferir comportamientos compartidos y compatibilidad de prompts.</>}
          />
        )}
        {model.knowledgeCutoff && (
          <CompactMetricRow
            icon={BookOpen}
            label="Knowledge Cutoff"
            value={model.knowledgeCutoff}
            tooltip={<><div className="font-semibold mb-1">Corte de conocimiento</div>Hasta qué fecha el modelo fue entrenado con datos del mundo real. Eventos posteriores a esta fecha son desconocidos para el modelo a menos que los proveas en el contexto.</>}
          />
        )}
        {model.releaseDate && (
          <CompactMetricRow
            icon={Calendar}
            label="Lanzamiento"
            value={new Date(model.releaseDate).toLocaleDateString("es-PE", { month: "short", year: "numeric" })}
            tooltip={<><div className="font-semibold mb-1">Fecha de lanzamiento</div>Cuándo fue publicado oficialmente el modelo. Junto al Knowledge Cutoff indica qué tan reciente es su conocimiento.</>}
          />
        )}
        <CompactMetricRow
          icon={Scale}
          label="Licencia"
          value={<span style={{ color: LICENSE_COLORS[model.license] ?? "var(--text-primary)" }}>{model.licenseName}</span>}
          tooltip={<><div className="font-semibold mb-1">Tipo de licencia</div>
            {model.license === "commercial-open" && "Licencia abierta que permite uso comercial sin restricciones (Apache 2.0, MIT, BSD). El más favorable para equipos de producto."}
            {model.license === "open-source-full" && "Open source completo sin restricciones."}
            {model.license === "conditional" && "Licencia con condiciones: puede requerir aceptar términos específicos del proveedor (Llama Community, Gemma Terms). Verificar antes de usar en producción comercial."}
            {model.license === "api-paid" && "Modelo propietario accesible solo mediante API de pago. No hay pesos disponibles."}
            {model.license === "research-only" && "Solo para investigación académica. No puede usarse en producción comercial."}
          </>}
        />
        <CompactMetricRow
          icon={Globe}
          label="Acceso Gratuito"
          value={<span style={{ color: FREE_ACCESS_COLORS[model.freeAccess] ?? "var(--text-primary)" }}>{FREE_ACCESS_LABELS[model.freeAccess] ?? model.freeAccess}</span>}
          tooltip={<><div className="font-semibold mb-1">Nivel de acceso gratuito</div>Indica si existe una tier gratuita para usar el modelo. Fundamental para equipos con presupuesto limitado o que quieren prototipar antes de comprometerse con costos.</>}
        />
        <CompactMetricRow
          icon={model.openWeights ? ShieldCheck : Package}
          label="Pesos Abiertos"
          value={
            <span className={`flex items-center gap-1 justify-end ${model.openWeights ? "text-[var(--color-success)]" : "text-[var(--text-disabled)]"}`}>
              {model.openWeights ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {model.openWeights ? "Sí" : "No"}
            </span>
          }
          tooltip={<><div className="font-semibold mb-1">Disponibilidad de pesos</div>Si los pesos del modelo son públicos, pueden descargarse y ejecutarse localmente (en servidores propios o en la nube) sin depender de la API del proveedor.</>}
        />
        <CompactMetricRow
          icon={model.ollamaAvailable ? Wifi : WifiOff}
          label="Ollama"
          value={
            <span className={`flex items-center gap-1 justify-end ${model.ollamaAvailable ? "text-[var(--color-success)]" : "text-[var(--text-disabled)]"}`}>
              {model.ollamaAvailable ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {model.ollamaAvailable ? "Disponible" : "No disponible"}
            </span>
          }
          tooltip={<><div className="font-semibold mb-1">Disponibilidad en Ollama</div>Si este modelo puede descargarse y ejecutarse localmente con Ollama (<code>ollama run {model.slug ?? model.name}</code>). Permite inferencia sin latencia de red, privacidad total de datos, y costo cero de API.</>}
        />
      </div>

      {/* Capabilities */}
      <div className="pt-3 border-t border-[var(--border-default)]">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-disabled)] mb-3">Capacidades</div>
        <div className="flex flex-wrap gap-1.5">
          {activeCaps.map(c => (
            <span key={c.key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success-border)]">
              <Check className="h-2.5 w-2.5" />
              {c.label}
            </span>
          ))}
          {inactiveCaps.map(c => (
            <span key={c.key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--bg-overlay)] text-[var(--text-disabled)] border border-[var(--border-default)] opacity-50">
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* Inference Providers */}
      {model.inferenceProviders && model.inferenceProviders.length > 0 && (
        <div className="pt-3 border-t border-[var(--border-default)]">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-disabled)] mb-2">Proveedores de Inferencia</div>
          <div className="flex flex-wrap gap-2">
            {model.inferenceProviders.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium bg-[var(--bg-overlay)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                <Users className="h-3 w-3" />
                {p.name}
                {p.cheapest && <span className="text-[9px] text-[var(--color-success)] font-bold">MÁS BARATO</span>}
                {p.fastest && <span className="text-[9px] text-[var(--color-warning)] font-bold">MÁS RÁPIDO</span>}
                {p.offline && <span className="text-[9px] text-[var(--text-disabled)] font-bold">OFFLINE</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
