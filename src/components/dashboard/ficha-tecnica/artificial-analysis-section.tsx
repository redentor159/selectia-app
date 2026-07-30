import { Brain, FileCode2, Boxes, Trophy, Zap, Timer, Hash, DollarSign } from "lucide-react";
import type { AIModel } from "@/lib/types";
import { MetricCard } from "./metric-card";

export function ArtificialAnalysisSection({ model }: { model: AIModel }) {
  const formatScore = (val: number | null | undefined) => val != null ? val.toFixed(1) : "—";
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MetricCard
          icon={Brain}
          label="Intelligence"
          value={formatScore(model.intelligenceIndex)}
          hint="Score general AA"
          tooltip="Índice de Inteligencia de Artificial Analysis, un meta-score que combina múltiples benchmarks para evaluar el razonamiento general."
        />
        <MetricCard
          icon={FileCode2}
          label="Coding"
          value={formatScore(model.codingIndex)}
          hint="Capacidad programación"
          tooltip="Métrica consolidada que evalúa la habilidad del modelo para generar y corregir código fuente en múltiples lenguajes."
        />
        <MetricCard
          icon={Boxes}
          label="Agentic"
          value={formatScore(model.agenticIndex)}
          hint="Capacidad agente"
          tooltip="Mide la capacidad del modelo para usar herramientas externas (tool use) y completar tareas en múltiples pasos de manera autónoma."
        />
        <MetricCard
          icon={Trophy}
          label="Elo (LMSYS)"
          value={model.elo != null ? Math.round(model.elo).toString() : "—"}
          hint={model.eloVotes != null ? `${model.eloVotes} votos` : "Chatbot Arena"}
          tooltip="Puntaje ELO basado en miles de batallas ciegas (A/B testing) entre humanos y modelos en LMSYS Chatbot Arena."
        />
        
        <MetricCard
          icon={Zap}
          label="Speed"
          value={model.speedTps != null ? `${model.speedTps.toFixed(1)} t/s` : "—"}
          hint="Tokens por segundo"
          tooltip="Velocidad promedio de generación (Tokens por segundo). Determina qué tan rápido el usuario ve aparecer el texto."
        />
        <MetricCard
          icon={Timer}
          label="TTFT"
          value={model.ttftMs != null ? `${(model.ttftMs / 1000).toFixed(2)}s` : "—"}
          hint="Tiempo primera palabra"
          tooltip="Time-To-First-Token: Cuánto tarda el modelo (en segundos) en procesar la solicitud y comenzar a escribir la primera palabra de su respuesta."
        />
        <MetricCard
          icon={Hash}
          label="Context"
          value={model.contextWindow >= 1000 ? `${Math.round(model.contextWindow / 1000)}K` : model.contextWindow.toString()}
          hint="Tokens de contexto"
          tooltip="Tamaño de la ventana de contexto. Define cuánta información (historial o documentos) puede leer el modelo a la vez."
        />
        <MetricCard
          icon={DollarSign}
          label="Price (1M In)"
          value={model.priceInputUsd != null ? `$${model.priceInputUsd.toFixed(2)}` : "—"}
          hint={model.priceOutputUsd != null ? `Out: $${model.priceOutputUsd.toFixed(2)}` : ""}
          tooltip="Costo por cada millón de tokens de entrada (In) y salida (Out)."
        />
      </div>
    </div>
  );
}
