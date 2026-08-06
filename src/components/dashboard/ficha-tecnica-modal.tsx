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
  Cpu,
  Info
} from "lucide-react";
import type { AIModel } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Extracted modules
import { CompactMetricRow } from "./ficha-tecnica/compact-metric-row";
import { formatBytes, formatParams, formatRelative, resolveHfId } from "./ficha-tecnica/utils";
import { MetricCard } from "./ficha-tecnica/metric-card";
import { ArtificialAnalysisSection } from "./ficha-tecnica/artificial-analysis-section";
import { BenchlmProfileSection } from "./ficha-tecnica/benchlm-section";
import { ZeroevalReliabilitySection } from "./ficha-tecnica/zeroeval-section";
import { OpenRouterSection } from "./ficha-tecnica/openrouter-section";
import { ModelLifecycleSection } from "./ficha-tecnica/model-lifecycle-section";
import {
  getHfCache,
  prefetchHfDetails,
  subscribeHfCache,
  type HfModelDetails,
} from "./ficha-tecnica/hf-cache";

interface FichaTecnicaModalProps {
  model: AIModel | null;
  onClose: () => void;
}

// Caché en memoria a nivel de módulo: guarda el modelo completo resuelto desde
// /api/dashboard (payload completo) por id, para no repetir el fetch en cada
// apertura de la ficha. No expira (vale para la sesión actual).
const fullModelCache = new Map<string, AIModel>();

// Forma de la respuesta del endpoint /api/dashboard (payload completo).
interface FullDashboardResponse {
  models?: AIModel[];
}

export function FichaTecnicaModal({ model, onClose }: FichaTecnicaModalProps) {
  const hfModelId = model?.hfRepoId || (model?.slug ? resolveHfId(model) : null);
  const noHfId = !hfModelId;

  // Detección de modelo "resumido" (vino del payload ligero /api/dashboard?fields=summary):
  // el payload ligero excluye benchlm* y or* (salvo orInputModalities), así que la
  // ausencia simultánea de ambos campos delata un modelo incompleto. Los modelos que
  // sí los traen (tabla maestra) son completos y no requieren resolución.
  const isSummaryModel =
    !!model && model.benchlmDisplayScore == null && model.orContextLength == null;

  // Modelo completo resuelto bajo demanda; si es null, se usa el modelo original.
  const [fullModel, setFullModel] = useState<AIModel | null>(null);

  useEffect(() => {
    if (!isSummaryModel || !model?.id) return;

    const cached = fullModelCache.get(model.id);
    if (cached) {
      setFullModel(cached);
      return;
    }

    let cancelled = false;
    fetch("/api/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: FullDashboardResponse) => {
        if (cancelled) return;
        const found = data.models?.find((m) => m.id === model.id);
        if (found) {
          fullModelCache.set(model.id, found);
          setFullModel(found);
        }
      })
      .catch(() => {
        // Degradación silenciosa: si el fetch falla, se sigue mostrando el
        // modelo resumido sin romper el modal ni mostrar error.
      });
    return () => {
      cancelled = true;
    };
  }, [isSummaryModel, model?.id]);

  // Modelo efectivo para render: el completo si ya llegó, si no el original.
  const effectiveModel = fullModel ?? model;

  const [details, setDetails] = useState<HfModelDetails | null>(() => {
    const entry = hfModelId ? getHfCache(hfModelId) : undefined;
    return entry?.status === "ready" ? entry.details : null;
  });
  const [error, setError] = useState<string | null>(() => {
    const entry = hfModelId ? getHfCache(hfModelId) : undefined;
    return entry?.status === "ready" ? entry.error : null;
  });
  const [showChatTemplate, setShowChatTemplate] = useState(false);

  useEffect(() => {
    if (!hfModelId) return;
    const entry = getHfCache(hfModelId);
    if (!entry) {
      prefetchHfDetails(hfModelId);
    } else if (entry.status === "ready") {
      // Refresco en segundo plano (stale-while-revalidate); mientras tanto se
      // muestran los datos cacheados.
      setDetails(entry.details);
      setError(null);
      prefetchHfDetails(hfModelId, true);
    } else if (entry.status === "error") {
      setDetails(null);
      setError(entry.error);
    }
    // "loading": no hacer nada, la suscripción actualizará al completar.

    return subscribeHfCache(hfModelId, () => {
      const current = getHfCache(hfModelId);
      if (!current) return;
      if (current.status === "ready") {
        setDetails(current.details);
        setError(null);
      } else if (current.status === "error") {
        setDetails(null);
        setError(current.error);
      }
    });
  }, [hfModelId]);

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
            <div className="relative overflow-hidden rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-4 animate-in fade-in slide-in-from-top-4 duration-500 ease-out fill-mode-both">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transition-transform duration-700 hover:scale-110 hover:-rotate-12">
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
            {effectiveModel && !loading && (
              <Section
                className="delay-75"
                title="Artificial Analysis — Inteligencia y Rendimiento"
                icon={Brain}
                color="var(--brand-primary)"
                description="Métricas core y benchmarks (artificialanalysis.ai + LMSYS Chatbot Arena)"
              >
                <ArtificialAnalysisSection model={effectiveModel} />
              </Section>
            )}

            {/* ====== BENCHLM ====== */}
            {effectiveModel && effectiveModel.benchlmDisplayScore != null && !loading && (
              <Section
                className="delay-100"
                title="BenchLM — Perfil por Categoría"
                icon={Trophy}
                color="var(--brand-primary)"
                description="8 categorías evaluadas independientemente · 5ª fuente de datos (benchlm.ai)"
              >
                <BenchlmProfileSection model={effectiveModel} />
              </Section>
            )}

            {/* ====== ZEROEVAL ====== */}
            {effectiveModel && effectiveModel.zeroevalFailureRate != null && !loading && (
              <Section
                className="delay-150"
                title="ZeroEval — Confiabilidad de Producción"
                icon={Activity}
                color="var(--color-success)"
                description="Métricas en tiempo real de producción · 6ª fuente de datos (api.zeroeval.com)"
              >
                <ZeroevalReliabilitySection model={effectiveModel} />
              </Section>
            )}

            {/* ====== OPENROUTER ====== */}
            {effectiveModel && effectiveModel.orModelId != null && !loading && (
              <Section
                className="delay-200"
                title="OpenRouter — Catálogo y Capacidades"
                icon={Cpu}
                color="var(--brand-primary)"
                description="Pricing, modalities, reasoning, benchmarks · 7ª fuente de datos (openrouter.ai)"
              >
                <OpenRouterSection model={effectiveModel} />
              </Section>
            )}

            {/* ====== CICLO DE VIDA Y HF METRICS GRID (2x2) ====== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* ====== CICLO DE VIDA ====== */}
              {effectiveModel && (effectiveModel.benchlmSupersededBy != null || effectiveModel.benchlmIsCanonicalEntry === true) && !loading && (
                <Section
                  className="delay-300"
                  title="Ciclo de Vida del Modelo"
                  icon={RefreshCw}
                  color="var(--color-warning)"
                  description="Vigencia y sucesión dentro de la familia del modelo · fuente: benchlm.ai"
                >
                  <ModelLifecycleSection model={effectiveModel} />
                </Section>
              )}

              {details && !loading && (
                <>
                  {/* ====== ACTIVIDAD DEL ECOSISTEMA ====== */}
                  <Section
                    className="delay-300"
                    title="Actividad del Ecosistema"
                    icon={Boxes}
                    color="var(--color-success)"
                    description="Adopción de desarrolladores construyendo en el ecosistema HuggingFace"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                      <CompactMetricRow
                        icon={Boxes}
                        label="Spaces"
                        value={details.spaces > 0 ? `${details.spaces} apps` : "—"}
                        tooltip={<><div className="font-semibold mb-1">Aplicaciones demo interactivas que usan este modelo</div>Cantidad de HuggingFace Spaces (aplicaciones web, demos o herramientas) construidas por la comunidad que utilizan directamente este repositorio.</>}
                      />
                      <CompactMetricRow
                        icon={Server}
                        label="HF Inference"
                        value={
                          details.inference === "warm" ? <span className="flex items-center gap-1 justify-end text-[var(--color-warning)]"><Zap className="h-3 w-3" fill="currentColor" /> Warm</span> :
                          details.inference === "cold" ? <span className="flex items-center gap-1 justify-end text-[var(--text-secondary)]"><Timer className="h-3 w-3" /> Cold</span> :
                          "—"
                        }
                        tooltip={<><div className="font-semibold mb-1">Disponibilidad de infraestructura gratuita en HF</div>Indica si HuggingFace provee una API de inferencia sin servidor (Serverless Inference API) para este modelo. 'Warm' significa que está pre-cargado y responde al instante. 'Cold' significa que tomará un momento iniciar el contenedor.</>}
                      />
                    </div>
                    {details.spacesSample && details.spacesSample.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-default)]">
                        <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Ejemplos:</span>
                        {details.spacesSample.map((s, i) => (
                          <a
                            key={i}
                            href={`https://huggingface.co/spaces/${s}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1 bg-[var(--bg-overlay)] px-1.5 py-0.5 rounded border border-[var(--border-default)]"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                            {s}
                          </a>
                        ))}
                      </div>
                    )}
                  </Section>

                  {/* ====== ADOPCIÓN ====== */}
                  <Section
                    className="delay-500"
                    title="Adopción Comunitaria"
                    icon={TrendingUp}
                    color="var(--brand-primary)"
                    description="Descargas (acumulado) vs trendingScore (velocidad reciente)"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                      <CompactMetricRow
                        icon={Download}
                        label="Downloads"
                        value={details.downloads != null ? details.downloads.toLocaleString("es-PE") : "—"}
                        tooltip={<><div className="font-semibold mb-1">Adopción acumulada</div>Número total de veces que este repositorio ha sido descargado en los últimos 30 días. Es un indicador clave de adopción técnica real.</>}
                      />
                      <CompactMetricRow
                        icon={Heart}
                        label="Likes"
                        value={details.likes != null ? details.likes.toLocaleString("es-PE") : "—"}
                        tooltip={<><div className="font-semibold mb-1">Aprobación cualitativa</div>Cantidad de usuarios en HuggingFace que han marcado este repositorio como favorito. Representa la calidad percibida por la comunidad.</>}
                      />
                      <CompactMetricRow
                        icon={Flame}
                        label="Trending Score"
                        value={details.trendingScore != null ? details.trendingScore.toFixed(1) : "—"}
                        tooltip={<><div className="font-semibold mb-1">Velocidad reciente</div>Un puntaje algorítmico de HuggingFace que mide el momentum actual del modelo. Un score alto indica que el modelo es tendencia hoy.</>}
                      />
                    </div>
                  </Section>

                  {/* ====== HARDWARE ====== */}
                  {details.safetensors && (
                    <Section
                      className="delay-500"
                      title="Detalles de Hardware (safetensors)"
                      icon={HardDrive}
                      color="var(--color-warning)"
                      description="Parámetros exactos por tipo de dato — para cálculo de VRAM"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                        <CompactMetricRow
                          icon={Hash}
                          label="Parámetros totales"
                          value={details.safetensors.total ? formatParams(details.safetensors.total) : "—"}
                          tooltip={<><div className="font-semibold mb-1">Conteo exacto (no aproximado)</div>Total acumulado de todos los parámetros dentro de los tensores del modelo (safetensors). Es el tamaño matemático exacto de la red neuronal, fundamental para estimar VRAM.</>}
                        />
                        {details.safetensors.parameters && Object.entries(details.safetensors.parameters).map(([dtype, count]) => (
                          <CompactMetricRow
                            key={dtype}
                            icon={Hash}
                            label={`Precisión ${dtype}`}
                            value={formatParams(count)}
                            tooltip={<><div className="font-semibold mb-1">{count.toLocaleString("es-PE")} parámetros</div>Cantidad de parámetros almacenados específicamente en la precisión '{dtype}'. Sirve para identificar modelos de precisión mixta o cuantizados nativamente.</>}
                          />
                        ))}
                        {details.siblings && (
                          <CompactMetricRow
                            icon={FileCode2}
                            label="Archivos en repo"
                            value={
                              <span className="flex items-center justify-end gap-1.5">
                                {details.siblings.count}
                                {details.siblings.files.some(f => f.endsWith(".gguf")) ? <Check className="h-3 w-3 text-[var(--color-success)]" /> : null}
                              </span>
                            }
                            tooltip={<><div className="font-semibold mb-1">Distribución de archivos</div>Cantidad de archivos y carpetas en este repositorio de HuggingFace. Muchos archivos pueden indicar adaptadores LoRA, versiones cuantizadas o un modelo particionado en múltiples shards.</>}
                          />
                        )}
                      </div>
                      {details.siblings && details.siblings.files.some(f => f.endsWith(".gguf")) && (
                        <div className="mt-2 text-[11px] text-[var(--color-success)] flex items-start gap-1 pt-2 border-t border-[var(--border-default)]">
                          <Check className="h-3 w-3 shrink-0 mt-0.5" />
                          <span>Este repo distribuye versiones GGUF propias: {details.siblings.files.filter(f => f.endsWith(".gguf")).slice(0, 5).join(", ")}</span>
                        </div>
                      )}
                      {details.tags && details.tags.includes("gguf") && !details.siblings?.files.some(f => f.endsWith(".gguf")) && (
                        <div className="mt-2 text-[11px] text-[var(--color-warning)] flex items-start gap-1 pt-2 border-t border-[var(--border-default)]">
                          <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                          <span>Tag "gguf" presente pero sin archivos .gguf — la versión cuantizada puede estar en un repo comunidad.</span>
                        </div>
                      )}
                    </Section>
                  )}
                </>
              )}
            </div>

            {/* No HF repo associated case */}
            {noHfId && !loading && !error && (
              <div className="mt-4 rounded-md border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-3 flex items-center gap-2">
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
              <div className="flex flex-col gap-4 mt-4">
                {/* ====== DETALLES TÉCNICOS ====== */}
                <Section
                  className="delay-700"
                  title="Detalles Técnicos de Implementación"
                  icon={Library}
                  color="var(--color-teal)"
                  description="Para integración directa mediante código"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1">
                    <CompactMetricRow
                      icon={Library}
                      label="Library"
                      value={details.libraryName ?? "—"}
                      tooltip={<><div className="font-semibold mb-1">Framework recomendado</div>La biblioteca de Python predeterminada recomendada para cargar y ejecutar este modelo.</>}
                    />
                    {details.transformersInfo?.processor && (
                      <CompactMetricRow
                        icon={MessageSquare}
                        label="Processor"
                        value={details.transformersInfo.processor}
                        tooltip={<><div className="font-semibold mb-1">Clase del tokenizador</div>El pre-procesador o tokenizador requerido para convertir texto bruto en los tensores de entrada.</>}
                      />
                    )}
                    <CompactMetricRow
                      icon={Hash}
                      label="Commit SHA"
                      valueClassName="text-[11px] font-mono text-[var(--text-primary)] text-right"
                      value={details.sha ? details.sha.slice(0, 12) + "…" : "—"}
                      tooltip={<><div className="font-semibold mb-1">Para fijar versión</div>Commit SHA exacto de la versión principal. Fundamental usarlo como 'revision' al descargar el modelo en producción.</>}
                    />
                    <CompactMetricRow
                      icon={HardDrive}
                      label="Used Storage"
                      value={details.usedStorage != null ? formatBytes(details.usedStorage) : "—"}
                      tooltip={<><div className="font-semibold mb-1">Espacio requerido en disco</div>Tamaño total real (en bytes) que ocuparán los archivos del modelo al descargarse en el disco de tu servidor. No incluye memoria RAM/VRAM de inferencia.</>}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pt-1 mt-1 border-t border-[var(--border-default)]">
                    <CompactMetricRow
                      icon={FileCode2}
                      label="Architecture"
                      valueClassName="text-[13px] font-semibold text-[var(--text-primary)] text-right break-words max-w-[280px]"
                      value={details.config?.architectures?.[0] ?? details.config?.model_type ?? "—"}
                      tooltip={<><div className="font-semibold mb-1">Clase base</div>La arquitectura algorítmica específica definida en config.json. Dicta cómo se estructuran las capas del modelo.</>}
                    />
                    {details.transformersInfo && (
                      <CompactMetricRow
                        icon={FileCode2}
                        label="Auto Model"
                        valueClassName="text-[13px] font-semibold text-[var(--text-primary)] text-right break-words max-w-[280px]"
                        value={details.transformersInfo.auto_model ?? "—"}
                        tooltip={<><div className="font-semibold mb-1">Clase exacta de Transformers</div>La clase específica de HuggingFace Transformers (ej. AutoModelForCausalLM) que debe importarse.</>}
                      />
                    )}
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
                  className="delay-700"
                  title="Salud y Vigencia del Repo"
                  icon={CheckCircle2}
                  color="var(--color-success)"
                  description="Estado del repositorio en HuggingFace Hub"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1">
                    <CompactMetricRow
                      icon={AlertCircle}
                      label="Disabled"
                      value={details.disabled === true ? <span className="flex items-center gap-1 text-[var(--color-error)] justify-end"><Ban className="h-3 w-3" /> Sí</span> : <span className="flex items-center gap-1 text-[var(--color-success)] justify-end"><Check className="h-3 w-3" /> No</span>}
                      tooltip={<><div className="font-semibold mb-1">¿Repo deshabilitado?</div>Si es 'Sí', el autor ha marcado este repositorio como inactivo o roto, o HuggingFace lo ha deshabilitado por razones de seguridad. Nunca usar modelos disabled.</>}
                    />
                    <CompactMetricRow
                      icon={Server}
                      label="Gated"
                      value={
                        details.gated === true || details.gated === "manual" ? <span className="flex items-center gap-1 text-[var(--color-warning)] justify-end"><Lock className="h-3 w-3" /> Manual</span> :
                        details.gated === "auto" ? <span className="flex items-center gap-1 text-[var(--color-info)] justify-end"><Lock className="h-3 w-3" /> Auto</span> :
                        <span className="flex items-center gap-1 text-[var(--color-success)] justify-end"><Unlock className="h-3 w-3" /> Libre</span>
                      }
                      tooltip={<><div className="font-semibold mb-1">Acceso: libre/auto/manual</div>Un modelo 'Gated' requiere que inicies sesión en HuggingFace y aceptes términos de licencia antes de descargarlo. 'Manual' requiere aprobación humana.</>}
                    />
                    <CompactMetricRow
                      icon={CheckCircle2}
                      label="Last Modified"
                      valueClassName="text-[12px] font-medium text-[var(--text-primary)] text-right"
                      value={details.lastModified ? formatRelative(details.lastModified) : "—"}
                      tooltip={<><div className="font-semibold mb-1">{details.lastModified ? new Date(details.lastModified).toLocaleString("es-PE") : ""}</div>Fecha exacta del último commit o cambio en los archivos del repositorio. Modelos sin actualizaciones por más de 6 meses pueden estar obsoletos.</>}
                    />
                    <CompactMetricRow
                      icon={CheckCircle2}
                      label="Created"
                      valueClassName="text-[12px] font-medium text-[var(--text-primary)] text-right"
                      value={details.createdAt ? formatRelative(details.createdAt) : "—"}
                      tooltip={<><div className="font-semibold mb-1">{details.createdAt ? new Date(details.createdAt).toLocaleString("es-PE") : ""}</div>Fecha de creación original del repositorio en HuggingFace Hub.</>}
                    />
                  </div>
                </Section>

                {/* Tags */}
                {details.tags && details.tags.length > 0 && (
                  <Section
                    className="delay-1000"
                    title="Tags del repositorio"
                    icon={Hash}
                    color="var(--text-secondary)"
                    description="Clasificación proporcionada por el autor"
                  >
                    <div className="flex flex-wrap gap-1">
                      {details.tags.slice(0, 30).map((t, i) => (
                        <span key={i} className="rounded px-1.5 py-0.5 text-[11px] font-mono bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                          {t}
                        </span>
                      ))}
                      {details.tags.length > 30 && (
                        <span className="text-[11px] text-[var(--text-disabled)] self-center ml-1">
                          +{details.tags.length - 30} más
                        </span>
                      )}
                    </div>
                  </Section>
                )}
              </div>
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
  className = "",
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative rounded-xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-default)] group transition-all duration-300 hover:shadow-sm hover:border-[var(--border-strong)] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both ${className}`}>
      <div className="px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-elevated)] transition-colors duration-300 group-hover:bg-[var(--bg-overlay)]">
        <div className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-0.5">
          <Icon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" style={{ color }} />
          <span className="eyebrow text-[var(--text-primary)]">{title}</span>
        </div>
        <p className="text-xs text-[var(--text-disabled)] mt-1 transition-colors duration-300 group-hover:text-[var(--text-secondary)]">{description}</p>
      </div>
      <div className="px-4 py-2">{children}</div>
    </div>
  );
}
