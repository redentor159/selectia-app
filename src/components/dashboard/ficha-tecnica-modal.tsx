"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  X,
  ExternalLink,
  Flame,
  Download,
  Heart,
  TrendingUp,
  Server,
  FileCode2,
  Hash,
  HardDrive,
  Library,
  Beaker,
  MessageSquare,
  Boxes,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trophy,
  Activity,
  RefreshCw,
  Brain,
  Ban,
  Lock,
  Unlock,
  Zap,
  Timer,
  Check,
} from "lucide-react";
import type { AIModel } from "@/lib/types";

// Extracted modules
import { formatBytes, formatParams, formatRelative, resolveHfId } from "./ficha-tecnica/utils";
import { MetricCard } from "./ficha-tecnica/metric-card";
import { ArtificialAnalysisSection } from "./ficha-tecnica/artificial-analysis-section";
import { BenchlmProfileSection } from "./ficha-tecnica/benchlm-section";
import { ZeroevalReliabilitySection } from "./ficha-tecnica/zeroeval-section";
import { ModelLifecycleSection } from "./ficha-tecnica/model-lifecycle-section";

interface HfModelDetails {
  id: string;
  spaces: number;
  spacesSample: string[];
  inference: string | null;
  modelIndex: any;
  widgetData: any[] | null;
  chatTemplate: string | null;
  transformersInfo: { auto_model?: string; processor?: string } | null;
  sha: string | null;
  usedStorage: number | null;
  libraryName: string | null;
  config: { architectures?: string; model_type?: string; tokenizer_config?: any } | null;
  cardData: any;
  tags: string[] | null;
  safetensors: { parameters?: Record<string, number>; total?: number } | null;
  siblings: { count: number; files: string[] } | null;
  downloads: number | null;
  likes: number | null;
  trendingScore: number | null;
  gated: any;
  disabled: boolean | null;
  lastModified: string | null;
  createdAt: string | null;
}

interface FichaTecnicaModalProps {
  model: AIModel | null;
  onClose: () => void;
}

export function FichaTecnicaModal({ model, onClose }: FichaTecnicaModalProps) {
  const [details, setDetails] = useState<HfModelDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showChatTemplate, setShowChatTemplate] = useState(false);
  const [fetchKey, setFetchKey] = useState<string | null>(null);

  const hfModelId = model?.hfRepoId || (model?.slug ? resolveHfId(model) : null);
  const noHfId = !hfModelId;

  if (hfModelId && fetchKey !== hfModelId) {
    setFetchKey(hfModelId);
  }

  useEffect(() => {
    if (!fetchKey) return;
    let cancelled = false;
    fetch(`/api/hf-model?id=${encodeURIComponent(fetchKey)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: HfModelDetails) => {
        if (cancelled) return;
        setDetails(data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Error al cargar la ficha técnica");
        setDetails(null);
      });
    return () => { cancelled = true; };
  }, [fetchKey]);

  const loading = !!hfModelId && !error && (!details || details.id !== hfModelId);

  return (
    <Dialog open={!!model} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[96vw] !max-w-[96vw] sm:w-[92vw] sm:!max-w-[92vw] lg:w-[88vw] lg:!max-w-[88vw] xl:w-[82vw] xl:!max-w-[1200px] max-h-[96vh] rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] shadow-[var(--shadow-high)] overflow-y-auto p-4 sm:p-6" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-[var(--brand-primary)]" />
            <DialogTitle className="text-base font-semibold tracking-tight">
              Ficha Técnica · HuggingFace Hub
            </DialogTitle>
            <Badge variant="outline" className="text-xs gap-1 text-[var(--text-secondary)]">
              <ExternalLink className="h-2.5 w-2.5" />
              Datos en vivo
            </Badge>
            <button
              onClick={onClose}
              className="ml-auto inline-flex items-center justify-center rounded-md h-7 w-7 text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <DialogDescription className="sr-only">
            Ficha técnica completa del modelo desde HuggingFace Hub
          </DialogDescription>
        </DialogHeader>

        {model && (
          <div className="space-y-4">
            {/* Model header */}
            <div className="relative overflow-hidden rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-4">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <FileCode2 className="w-24 h-24 text-[var(--text-primary)]" />
              </div>
              <div className="relative flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">{model.name}</span>
                <Badge variant="outline" className="text-xs font-semibold bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-secondary)]">{model.provider}</Badge>
                {hfModelId && (
                  <a
                    href={`https://huggingface.co/${hfModelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] border border-[var(--border-default)] inline-flex items-center gap-1.5 ml-auto sm:ml-2 px-2 py-1 rounded transition-colors"
                  >
                    {hfModelId} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="relative text-xs text-[var(--text-secondary)] max-w-[85%] leading-relaxed">
                Ficha técnica completa — 25 campos de HuggingFace Hub (Métricas de la comunidad e implementación técnica).
                Datos cargados en vivo bajo demanda desde <code className="font-mono text-[var(--text-primary)] bg-[var(--bg-overlay)] px-1 py-0.5 rounded border border-[var(--border-default)]">/api/hf-model</code>.
              </p>
            </div>

            {loading && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Cargando ficha técnica desde HuggingFace Hub…
                </div>
                <Skeleton className="h-8" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            )}

            {error && !loading && (
              <div className="rounded-md border border-[var(--color-error-border)] bg-[var(--color-error-bg)] p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[var(--color-error)] shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-[var(--color-error)]">No se pudo cargar la ficha técnica</div>
                  <div className="text-[var(--text-secondary)] mt-0.5">{error}</div>
                  <div className="text-xs text-[var(--text-disabled)] mt-1">
                    El modelo puede no tener un repo de HuggingFace asociado, o la API de HF está temporalmente no disponible.
                  </div>
                </div>
              </div>
            )}

            {/* ====== ARTIFICIAL ANALYSIS ====== */}
            {model && !loading && (
              <Section
                title="Artificial Analysis — Inteligencia y Rendimiento"
                icon={Brain}
                color="var(--brand-primary)"
                description="Métricas core y benchmarks (artificialanalysis.ai + LMSYS Chatbot Arena)"
              >
                <ArtificialAnalysisSection model={model} />
              </Section>
            )}

            {/* ====== BENCHLM ====== */}
            {model && model.benchlmDisplayScore != null && !loading && (
              <Section
                title="BenchLM — Perfil por Categoría"
                icon={Trophy}
                color="var(--brand-primary)"
                description="8 categorías evaluadas independientemente · 5ª fuente de datos (benchlm.ai)"
              >
                <BenchlmProfileSection model={model} />
              </Section>
            )}

            {/* ====== ZEROEVAL ====== */}
            {model && model.zeroevalFailureRate != null && !loading && (
              <Section
                title="ZeroEval — Confiabilidad de Producción"
                icon={Activity}
                color="var(--color-success)"
                description="Métricas en tiempo real de producción · 6ª fuente de datos (api.zeroeval.com)"
              >
                <ZeroevalReliabilitySection model={model} />
              </Section>
            )}

            {/* ====== CICLO DE VIDA ====== */}
            {model && (model.benchlmSupersededBy != null || model.benchlmIsCanonicalEntry === true) && !loading && (
              <Section
                title="Ciclo de Vida del Modelo"
                icon={RefreshCw}
                color="var(--color-warning)"
                description="Estado de recomendación y vigencia de este modelo en su familia"
              >
                <ModelLifecycleSection model={model} />
              </Section>
            )}

            {/* No HF repo associated case */}
            {noHfId && !loading && !error && (
              <div className="rounded-md border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[var(--color-warning)] shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-[var(--color-warning)]">Sin repositorio de HuggingFace</div>
                  <div className="text-[var(--text-secondary)] mt-0.5">
                    Este modelo ({model?.provider}) no tiene un repo de HuggingFace Hub asociado en el mapa de proveedores.
                    La ficha técnica solo aplica a modelos open source publicados en HF.
                  </div>
                </div>
              </div>
            )}

            {details && !loading && (
              <>
                {/* ====== ACTIVIDAD DEL ECOSISTEMA ====== */}
                <Section
                  title="Actividad del Ecosistema"
                  icon={Boxes}
                  color="var(--color-success)"
                  description="Adopción de desarrolladores construyendo en el ecosistema HuggingFace"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <MetricCard
                      icon={Boxes}
                      label="Spaces de HuggingFace"
                      value={details.spaces > 0 ? `${details.spaces} apps` : "—"}
                      hint="Aplicaciones demo interactivas que usan este modelo"
                      tooltip="Cantidad de HuggingFace Spaces (aplicaciones web, demos o herramientas) construidas por la comunidad que utilizan directamente este repositorio."
                    />
                    <MetricCard
                      icon={Server}
                      label="HF Inference"
                      value={
                        details.inference === "warm" ? <span className="flex items-center gap-1 text-[var(--color-warning)]"><Zap className="h-4 w-4" fill="currentColor" /> Warm (inmediato)</span> :
                        details.inference === "cold" ? <span className="flex items-center gap-1 text-[var(--text-secondary)]"><Timer className="h-4 w-4" /> Cold (delay arranque)</span> :
                        "— No disponible"
                      }
                      hint="Disponibilidad de infraestructura gratuita en HF"
                      tooltip="Indica si HuggingFace provee una API de inferencia sin servidor (Serverless Inference API) para este modelo. 'Warm' significa que está pre-cargado y responde al instante. 'Cold' significa que tomará un momento iniciar el contenedor."
                    />
                  </div>
                  {details.spacesSample && details.spacesSample.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                        Ejemplos de Spaces
                      </div>
                      <div className="space-y-1">
                        {details.spacesSample.map((s, i) => (
                          <a
                            key={i}
                            href={`https://huggingface.co/spaces/${s}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-[var(--brand-primary)] hover:underline truncate"
                          >
                            <ExternalLink className="h-3 w-3 inline mr-1" />
                            {s}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>

                {/* ====== ADOPCIÓN ====== */}
                <Section
                  title="Adopción Comunitaria"
                  icon={TrendingUp}
                  color="var(--brand-primary)"
                  description="Descargas (acumulado) vs trendingScore (velocidad reciente)"
                >
                  <div className="grid grid-cols-3 gap-2">
                    <MetricCard
                      icon={Download}
                      label="Downloads"
                      value={details.downloads != null ? details.downloads.toLocaleString("es-PE") : "—"}
                      hint="Adopción acumulada"
                      tooltip="Número total de veces que este repositorio ha sido descargado en los últimos 30 días. Es un indicador clave de adopción técnica real."
                    />
                    <MetricCard
                      icon={Heart}
                      label="Likes"
                      value={details.likes != null ? details.likes.toLocaleString("es-PE") : "—"}
                      hint="Aprobación cualitativa"
                      tooltip="Cantidad de usuarios en HuggingFace que han marcado este repositorio como favorito. Representa la calidad percibida por la comunidad."
                    />
                    <MetricCard
                      icon={Flame}
                      label="Trending Score"
                      value={details.trendingScore != null ? details.trendingScore.toFixed(1) : "—"}
                      hint={details.trendingScore != null && details.trendingScore > 50 ? <span className="flex items-center gap-1 text-[var(--color-warning)]"><Zap className="h-3 w-3" fill="currentColor" /> Alta velocidad</span> : "Velocidad normal"}
                      tooltip="Un puntaje algorítmico de HuggingFace que mide el 'momentum' actual del modelo (descargas y likes recientes relativos al histórico). Un score alto indica que el modelo es tendencia hoy."
                    />
                  </div>
                </Section>

                {/* ====== HARDWARE ====== */}
                {details.safetensors && (
                  <Section
                    title="Detalles de Hardware (safetensors)"
                    icon={HardDrive}
                    color="var(--color-warning)"
                    description="Parámetros exactos por tipo de dato — para cálculo de VRAM"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <MetricCard
                        icon={Hash}
                        label="Parámetros totales"
                        value={details.safetensors.total ? formatParams(details.safetensors.total) : "—"}
                        hint="Conteo exacto (no aproximado)"
                        tooltip="Total acumulado de todos los parámetros dentro de los tensores del modelo (safetensors). Es el tamaño matemático exacto de la red neuronal, fundamental para estimar VRAM."
                      />
                      {details.safetensors.parameters && Object.entries(details.safetensors.parameters).map(([dtype, count]) => (
                        <MetricCard
                          key={dtype}
                          icon={Hash}
                          label={`Precisión ${dtype}`}
                          value={formatParams(count)}
                          hint={`${count.toLocaleString("es-PE")} parámetros`}
                          tooltip={`Cantidad de parámetros almacenados específicamente en la precisión '${dtype}' (ej. F32, F16, BF16). Sirve para identificar modelos de precisión mixta o cuantizados nativamente.`}
                        />
                      ))}
                      {details.siblings && (
                        <MetricCard
                          icon={FileCode2}
                          label="Archivos en repo"
                          value={String(details.siblings.count)}
                          hint={details.siblings.files.some(f => f.endsWith(".gguf")) ? <span className="flex items-center gap-1 text-[var(--color-success)]"><Check className="h-3 w-3" /> Incluye .gguf</span> : "Sin .gguf propios"}
                          tooltip="Cantidad de archivos y carpetas en este repositorio de HuggingFace. Muchos archivos pueden indicar adaptadores LoRA, versiones cuantizadas o un modelo particionado en múltiples shards."
                        />
                      )}
                    </div>
                    {details.siblings && details.siblings.files.some(f => f.endsWith(".gguf")) && (
                      <div className="mt-2 rounded-md border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-2 text-xs text-[var(--color-success)] flex items-start gap-1">
                        <Check className="h-4 w-4 shrink-0" />
                        <span>Este repo distribuye versiones GGUF propias: {details.siblings.files.filter(f => f.endsWith(".gguf")).slice(0, 5).join(", ")}</span>
                      </div>
                    )}
                    {details.tags && details.tags.includes("gguf") && !details.siblings?.files.some(f => f.endsWith(".gguf")) && (
                      <div className="mt-2 rounded-md border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-2 text-xs text-[var(--color-warning)] flex items-start gap-1">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Tag "gguf" presente pero sin archivos .gguf — la versión cuantizada puede estar en un repo comunidad (busca bartowski/{hfModelId}-GGUF)</span>
                      </div>
                    )}
                  </Section>
                )}

                {/* ====== EVALUACION DEL AUTOR ====== */}
                <Section
                  title="Evaluación del Autor (Benchmarks Nativos)"
                  icon={Beaker}
                  color="var(--color-indigo)"
                  description="Benchmarks publicados por el propio creador en el formato model-index"
                >
                  {details.modelIndex && Array.isArray(details.modelIndex) && details.modelIndex.length > 0 ? (
                    <div className="space-y-1.5">
                      {details.modelIndex.flatMap((entry: any) =>
                        (entry.results || []).map((r: any, i: number) => (
                          <div key={i} className="flex items-center justify-between rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] px-2 py-1.5 text-xs">
                            <span className="text-[var(--text-primary)] truncate">{r.dataset?.name ?? r.task?.name ?? "—"}</span>
                            <span className="num font-mono font-semibold text-[var(--brand-primary)] shrink-0 ml-2">
                              {r.metrics?.[0]?.value != null ? `${r.metrics[0].value}${r.metrics[0].type?.includes("acc") || r.metrics[0].type?.includes("score") ? "%" : ""}` : "—"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-[var(--text-disabled)] italic">
                      El autor no publicó benchmarks en formato nativo. Apóyate exclusivamente en Artificial Analysis para comparar el rendimiento.
                    </div>
                  )}
                  {details.widgetData && details.widgetData.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                        Prompts de ejemplo del autor
                      </div>
                      <div className="space-y-1">
                        {details.widgetData.slice(0, 3).map((w, i) => (
                          <div key={i} className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] px-2 py-1.5 text-xs font-mono text-[var(--text-primary)]">
                            {w.text || w.content || JSON.stringify(w).slice(0, 100)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>

                {/* ====== DETALLES TÉCNICOS ====== */}
                <Section
                  title="Detalles Técnicos de Implementación"
                  icon={Library}
                  color="var(--color-teal)"
                  description="Para integración directa mediante código"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <MetricCard
                      icon={Library}
                      label="Library"
                      value={details.libraryName ?? "—"}
                      hint="Framework recomendado"
                      tooltip="La biblioteca de Python predeterminada recomendada para cargar y ejecutar este modelo (usualmente 'transformers', 'sentence-transformers' o 'diffusers')."
                    />
                    <MetricCard
                      icon={FileCode2}
                      label="Architecture"
                      value={details.config?.architectures?.[0] ?? details.config?.model_type ?? "—"}
                      hint="Clase base para cargar el modelo"
                      tooltip="La arquitectura algorítmica específica definida en config.json (por ejemplo, LlamaForCausalLM, MistralForCausalLM). Dicta cómo se estructuran las capas del modelo."
                    />
                    {details.transformersInfo && (
                      <MetricCard
                        icon={FileCode2}
                        label="Auto Model"
                        value={details.transformersInfo.auto_model ?? "—"}
                        hint="Clase exacta de Transformers"
                        tooltip="La clase específica de HuggingFace Transformers (ej. AutoModelForCausalLM) que debe importarse para cargar los pesos correctamente en código Python."
                      />
                    )}
                    {details.transformersInfo?.processor && (
                      <MetricCard
                        icon={MessageSquare}
                        label="Processor"
                        value={details.transformersInfo.processor}
                        hint="Clase del tokenizador"
                        tooltip="El pre-procesador o tokenizador (ej. AutoTokenizer o ChatTemplateProcessor) requerido para convertir texto bruto en los tensores de entrada que espera la arquitectura."
                      />
                    )}
                    <MetricCard
                      icon={Hash}
                      label="Commit SHA"
                      value={details.sha ? details.sha.slice(0, 12) + "…" : "—"}
                      hint={details.sha ? `Hash completo: ${details.sha}` : "Para fijar versión"}
                      tooltip="Commit SHA exacto de la versión principal (main) del repositorio. Fundamental usarlo como 'revision' al descargar el modelo en producción para evitar que actualizaciones inesperadas rompan el sistema."
                    />
                    <MetricCard
                      icon={HardDrive}
                      label="Used Storage"
                      value={details.usedStorage != null ? formatBytes(details.usedStorage) : "—"}
                      hint="Espacio requerido en disco"
                      tooltip="Tamaño total real (en bytes) que ocuparán los archivos del modelo al descargarse en el disco de tu servidor. No incluye memoria RAM/VRAM de inferencia."
                    />
                  </div>

                  {/* chat_template */}
                  {details.chatTemplate && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowChatTemplate(!showChatTemplate)}
                        className="h-8 text-xs"
                      >
                        <MessageSquare className="h-3 w-3 mr-2" />
                        {showChatTemplate ? "Ocultar" : "Ver"} formato exacto de prompt (chat_template Jinja)
                      </Button>
                      {showChatTemplate && (
                        <pre className="mt-2 rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] p-2 text-xs font-mono text-[var(--text-primary)] overflow-x-auto max-h-64 overflow-y-auto">
                          {details.chatTemplate}
                        </pre>
                      )}
                      <div className="text-xs text-[var(--text-disabled)] mt-1">
                        Requerido para integración cruda: formatea la conversación exactamente como el modelo fue entrenado para recibirla.
                      </div>
                    </div>
                  )}
                </Section>

                {/* ====== SALUD DEL REPO ====== */}
                <Section
                  title="Salud y Vigencia del Repo"
                  icon={CheckCircle2}
                  color="var(--color-success)"
                  description="Estado del repositorio en HuggingFace Hub"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <MetricCard
                      icon={AlertCircle}
                      label="Disabled"
                      value={details.disabled === true ? <span className="flex items-center gap-1 text-[var(--color-error)]"><Ban className="h-4 w-4" /> Sí</span> : <span className="flex items-center gap-1 text-[var(--color-success)]"><Check className="h-4 w-4" /> No</span>}
                      hint="¿Repo deshabilitado?"
                      tooltip="Si es 'Sí', el autor ha marcado este repositorio como inactivo o roto, o HuggingFace lo ha deshabilitado por razones de seguridad. Nunca usar modelos disabled."
                    />
                    <MetricCard
                      icon={Server}
                      label="Gated"
                      value={
                        details.gated === true || details.gated === "manual" ? <span className="flex items-center gap-1 text-[var(--color-warning)]"><Lock className="h-4 w-4" /> Manual</span> :
                        details.gated === "auto" ? <span className="flex items-center gap-1 text-[var(--color-info)]"><Lock className="h-4 w-4" /> Auto</span> :
                        <span className="flex items-center gap-1 text-[var(--color-success)]"><Unlock className="h-4 w-4" /> Libre</span>
                      }
                      hint="Acceso: libre/auto/manual"
                      tooltip="Un modelo 'Gated' requiere que inicies sesión en HuggingFace y aceptes términos de licencia antes de descargarlo (ej. modelos de Meta o Google). 'Manual' requiere aprobación humana del creador."
                    />
                    <MetricCard
                      icon={CheckCircle2}
                      label="Last Modified"
                      value={details.lastModified ? formatRelative(details.lastModified) : "—"}
                      hint={details.lastModified ? new Date(details.lastModified).toLocaleString("es-PE") : ""}
                      tooltip="Fecha exacta del último commit o cambio en los archivos del repositorio. Modelos sin actualizaciones por más de 6 meses pueden estar obsoletos."
                    />
                    <MetricCard
                      icon={CheckCircle2}
                      label="Created"
                      value={details.createdAt ? formatRelative(details.createdAt) : "—"}
                      hint={details.createdAt ? new Date(details.createdAt).toLocaleString("es-PE") : ""}
                      tooltip="Fecha de creación original del repositorio en HuggingFace Hub."
                    />
                  </div>
                </Section>

                {/* Tags */}
                {details.tags && details.tags.length > 0 && (
                  <Section
                    title="Tags del repositorio"
                    icon={Hash}
                    color="var(--text-secondary)"
                    description="Clasificación proporcionada por el autor"
                  >
                    <div className="flex flex-wrap gap-1">
                      {details.tags.slice(0, 30).map((t, i) => (
                        <span key={i} className="rounded px-2 py-1 text-xs font-mono bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                          {t}
                        </span>
                      ))}
                      {details.tags.length > 30 && (
                        <span className="text-xs text-[var(--text-disabled)] self-center ml-1">
                          +{details.tags.length - 30} más
                        </span>
                      )}
                    </div>
                  </Section>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  icon: Icon,
  color,
  description,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-default)]">
      <div className="px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" style={{ color }} />
          <span className="eyebrow text-[var(--text-primary)]">{title}</span>
        </div>
        <p className="text-xs text-[var(--text-disabled)] mt-1">{description}</p>
      </div>
      <div className="p-4 pt-4">{children}</div>
    </div>
  );
}
