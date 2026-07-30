import { Brain, FileCode2, Boxes, Trophy, Zap, Timer, Hash, DollarSign } from "lucide-react";
import type { AIModel } from "@/lib/types";
import { CompactMetricRow } from "./compact-metric-row";

export function ArtificialAnalysisSection({ model }: { model: AIModel }) {
  const formatScore = (val: number | null | undefined) => val != null ? val.toFixed(1) : "—";
  
  return (
    <div className="space-y-3">
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
          tooltip={<><div className="font-semibold mb-1">{model.eloVotes != null ? `${model.eloVotes} votos` : "Chatbot Arena"}</div>Puntaje ELO basado en miles de batallas ciegas (A/B testing) entre humanos y modelos en LMSYS Chatbot Arena.</>}
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
          tooltip={<><div className="font-semibold mb-1">Tiempo primera palabra</div>Time-To-First-Token: Cuánto tarda el modelo (en segundos) en procesar la solicitud y comenzar a escribir la primera palabra de su respuesta.</>}
        />
        <CompactMetricRow
          icon={Hash}
          label="Context"
          value={model.contextWindow >= 1000 ? `${Math.round(model.contextWindow / 1000)}K` : model.contextWindow.toString()}
          tooltip={<><div className="font-semibold mb-1">Tokens de contexto</div>Tamaño de la ventana de contexto. Define cuánta información (historial o documentos) puede leer el modelo a la vez.</>}
        />
        <CompactMetricRow
          icon={DollarSign}
          label="Price (1M In)"
          value={model.priceInputUsd != null ? `$${model.priceInputUsd.toFixed(2)}` : "—"}
          tooltip={<><div className="font-semibold mb-1">{model.priceOutputUsd != null ? `Out: $${model.priceOutputUsd.toFixed(2)}` : "Costo 1M Tokens"}</div>Costo por cada millón de tokens de entrada (In) y salida (Out).</>}
        />
      </div>
    </div>
  );
}
