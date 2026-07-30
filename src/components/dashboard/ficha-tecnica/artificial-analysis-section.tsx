import { Brain, FileCode2, Boxes, Trophy, Zap, Timer, Hash, DollarSign, Clock, ArrowRight } from "lucide-react";
import type { AIModel } from "@/lib/types";
import { CompactMetricRow } from "./compact-metric-row";

export function ArtificialAnalysisSection({ model }: { model: AIModel }) {
  const formatScore = (val: number | null | undefined) => val != null ? val.toFixed(1) : "—";
  const hasReasoningMetrics = model.ttftAnswerMs != null || model.endToEndMs != null;
  const hasCachePricing = model.priceCacheHitUsd != null || model.priceCacheWriteUsd != null;
  
  return (
    <div className="space-y-3">
      {/* Intelligence & Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1">
        <CompactMetricRow
          icon={Brain}
          label="Intelligence"
          value={formatScore(model.intelligenceIndex)}
          tooltip={<><div className="font-semibold mb-1">Score general AA</div>Índice de Inteligencia de Artificial Analysis, un meta-score que combina múltiples benchmarks para evaluar el razonamiento general.</>}
        />
        <CompactMetricRow
          icon={FileCode2}
          label="Coding"
          value={formatScore(model.codingIndex)}
          tooltip={<><div className="font-semibold mb-1">Capacidad programación</div>Métrica consolidada que evalúa la habilidad del modelo para generar y corregir código fuente en múltiples lenguajes.</>}
        />
        <CompactMetricRow
          icon={Boxes}
          label="Agentic"
          value={formatScore(model.agenticIndex)}
          tooltip={<><div className="font-semibold mb-1">Capacidad agente</div>Mide la capacidad del modelo para usar herramientas externas (tool use) y completar tareas en múltiples pasos de manera autónoma.</>}
        />
        <CompactMetricRow
          icon={Trophy}
          label="Elo (LMSYS)"
          value={model.elo != null ? Math.round(model.elo).toString() : "—"}
          tooltip={<><div className="font-semibold mb-1">{model.eloVotes != null ? `${model.eloVotes.toLocaleString()} votos` : "Chatbot Arena"}</div>Puntaje ELO basado en miles de batallas ciegas (A/B testing) entre humanos y modelos en LMSYS Chatbot Arena.{model.eloCi != null ? <><br /><span className="font-mono text-xs">IC 95%: ±{model.eloCi.toFixed(0)}</span></> : null}</>}
        />
        <CompactMetricRow
          icon={Zap}
          label="Speed"
          value={model.speedTps != null ? `${model.speedTps.toFixed(1)} t/s` : "—"}
          tooltip={<><div className="font-semibold mb-1">Tokens por segundo</div>Velocidad promedio de generación (Tokens por segundo). Determina qué tan rápido el usuario ve aparecer el texto.</>}
        />
        <CompactMetricRow
          icon={Timer}
          label="TTFT"
          value={model.ttftMs != null ? `${(model.ttftMs / 1000).toFixed(2)}s` : "—"}
          tooltip={<><div className="font-semibold mb-1">Tiempo primera respuesta</div>Time-To-First-Token: Cuánto tarda el modelo en procesar la solicitud y comenzar a escribir. En modelos de razonamiento, esta es la latencia antes de que empiece a "pensar".</>}
        />
        <CompactMetricRow
          icon={Hash}
          label="Context"
          value={model.contextWindow >= 1000 ? `${Math.round(model.contextWindow / 1000)}K` : model.contextWindow.toString()}
          tooltip={<><div className="font-semibold mb-1">Tokens de contexto</div>Tamaño de la ventana de contexto. Define cuánta información (historial o documentos) puede leer el modelo a la vez.</>}
        />
        <CompactMetricRow
          icon={ArrowRight}
          label="Max Output"
          value={model.maxOutput >= 1000 ? `${Math.round(model.maxOutput / 1000)}K` : model.maxOutput.toString()}
          tooltip={<><div className="font-semibold mb-1">Línea máxima de salida</div>Número máximo de tokens que el modelo puede generar en una sola respuesta. Crítico para tareas de generación larga (informes, código extenso).</>}
        />
      </div>

      {/* Reasoning-specific timing (conditional) */}
      {hasReasoningMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pt-3 border-t border-[var(--border-default)]">
          <div className="col-span-full text-[10px] font-bold uppercase tracking-widest text-[var(--text-disabled)] mb-1">Tiempos de Razonamiento</div>
          {model.ttftAnswerMs != null && (
            <CompactMetricRow
              icon={Timer}
              label="TTFT (Respuesta real)"
              value={`${(model.ttftAnswerMs / 1000).toFixed(2)}s`}
              tooltip={<><div className="font-semibold mb-1">Primera palabra de respuesta</div>En modelos de razonamiento (o1, DeepSeek R1, etc.), el TTFT inicial solo mide cuándo empieza a "pensar". Este campo mide cuándo aparece la primera palabra de la respuesta real al usuario.</>}
            />
          )}
          {model.endToEndMs != null && (
            <CompactMetricRow
              icon={Clock}
              label="End-to-End (500 tok)"
              value={`${(model.endToEndMs / 1000).toFixed(2)}s`}
              tooltip={<><div className="font-semibold mb-1">Tiempo total de respuesta</div>Cuánto tarda el modelo en completar una respuesta de 500 tokens desde cero. Es la métrica más cercana a la experiencia real del usuario en producción.</>}
            />
          )}
        </div>
      )}

      {/* Pricing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 pt-3 border-t border-[var(--border-default)]">
        <div className="col-span-full text-[10px] font-bold uppercase tracking-widest text-[var(--text-disabled)] mb-1">Precios (USD / 1M tokens)</div>
        <CompactMetricRow
          icon={DollarSign}
          label="Input (Prompt)"
          value={model.priceInputUsd != null ? `$${model.priceInputUsd.toFixed(2)}` : "—"}
          tooltip={<><div className="font-semibold mb-1">Costo por 1M tokens de entrada</div>Lo que se cobra por cada millón de tokens que envías al modelo (tu prompt, historial, documentos adjuntos).</>}
        />
        <CompactMetricRow
          icon={DollarSign}
          label="Output (Completion)"
          value={model.priceOutputUsd != null ? `$${model.priceOutputUsd.toFixed(2)}` : "—"}
          tooltip={<><div className="font-semibold mb-1">Costo por 1M tokens de salida</div>Lo que se cobra por cada millón de tokens que el modelo genera en su respuesta. Suele ser 2-5x más caro que el precio de entrada.</>}
        />
        {model.priceCacheHitUsd != null && (
          <CompactMetricRow
            icon={DollarSign}
            label="Cache Hit"
            value={`$${model.priceCacheHitUsd.toFixed(2)}`}
            tooltip={<><div className="font-semibold mb-1">Ahorro por caché</div>Precio reducido para tokens leidos desde el caché (prompt caching). En pipelines de RAG o agentes con mucho contexto repetido, puede reducir el costo un 90%.</>}
          />
        )}
        {model.priceCacheWriteUsd != null && (
          <CompactMetricRow
            icon={DollarSign}
            label="Cache Write"
            value={`$${model.priceCacheWriteUsd.toFixed(2)}`}
            tooltip={<><div className="font-semibold mb-1">Costo de escribir caché</div>Precio para almacenar tokens en caché (suele cobrarse una sola vez). El ROI del caching se calcula comparando este costo contra los ahorros de "Cache Hit" en solicitudes futuras.</>}
          />
        )}
      </div>
    </div>
  );
}
