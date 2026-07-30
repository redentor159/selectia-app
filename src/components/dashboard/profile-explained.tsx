"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PROFILES, useDashboardStore } from "@/store/dashboard-store";
import { Badge } from "@/components/ui/badge";
import {
  HardHat,
  Factory,
  Briefcase,
  ServerCog,
  Wrench,
  Calculator,
  Check,
  Minus,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ProfileId } from "@/lib/types";

const PROFILE_ICONS: Record<string, LucideIcon> = {
  HardHat,
  Factory,
  Briefcase,
  ServerCog,
  Wrench,
  Calculator,
};

interface ProfileExplanation {
  id: ProfileId;
  primaryUseCase: string;
  modeExplanation: string;
  sees: string[];
  notSees: string[];
  kpis: string[];
}

const PROFILE_EXPLANATIONS: Record<ProfileId, ProfileExplanation> = {
  A: {
    id: "A",
    primaryUseCase:
      "Ingeniero industrial que necesita elegir modelo de IA en <30s para tareas cotidianas (correos, cálculos, código, manuales).",
    modeExplanation:
      "Modo MYPE por defecto: prioriza costo cero con umbral anti-'gratis malo' del 70%.",
    sees: [
      "Recomendador rápido con búsqueda libre",
      "3 tarjetas de acceso rápido por tipo de tarea",
      "Tabla priorizada top 8 por Intelligence Index",
      "Panel '¿Qué significa esto?' colapsable",
      "Selector de moneda (PEN/USD/EUR/GBP)",
    ],
    notSees: [
      "KPIs de costo agregado (esos son del Gerente)",
      "Tabla pivote por proveedor (esos son del Consultor)",
      "Cuotas API y latencias (esos son de TI)",
      "Calculadora de presupuesto mensual (esos son de Compras)",
    ],
    kpis: [
      "Top 8 modelos por II",
      "Tier de costo (Rápido/Medio/Avanzado)",
      "Categoria detectada por HRE-TOPSIS",
      "Tiempo de cálculo del motor (<100ms)",
    ],
  },
  B: {
    id: "B",
    primaryUseCase:
      "Gerente de planta que aprueba inversión en IA para su equipo. Necesita KPIs financieros y de calidad en 20 segundos.",
    modeExplanation:
      "Modo Equilibrado por defecto: balance justo entre costo y calidad.",
    sees: [
      "4 KPI cards: costo mensual, anual, licencias comerciales, II top",
      "Scatter plot Inteligencia vs Precio",
      "Top 5 por preferencia humana (Elo)",
      "Tarjeta de recomendación para automatizar cotizaciones",
    ],
    notSees: [
      "Tabla maestra completa de 200+ modelos",
      "Cuotas API y latencias por fuente",
      "QR generator (es operacional)",
      "Mapa de proveedores metalmecánicos",
    ],
    kpis: [
      "Costo mensual proyectado por modelo",
      "Costo anual (×12 meses)",
      "% de catálogo con licencia comercial libre",
      "Intelligence Index del modelo más inteligente",
    ],
  },
  C: {
    id: "C",
    primaryUseCase:
      "Consultor de supply chain que prepara propuestas exportables con confianza estadística.",
    modeExplanation:
      "Modo Calidad por defecto: ignora costo, maximiza Elo + II.",
    sees: [
      "Tabla pivote por proveedor (model count, precio prom, II prom, % open)",
      "Notas legales por tipo de licencia (qué puedes/no puedes hacer)",
      "Tags de HuggingFace como links clicables",
      "Exportación CSV de toda la tabla pivote",
    ],
    notSees: [
      "QR generator (es operacional)",
      "Calculadora de presupuesto (es de Compras)",
      "Simulador ROI (es de Gerente)",
      "Cuotas API (es de TI)",
    ],
    kpis: [
      "# de modelos por proveedor",
      "Precio blended promedio por proveedor",
      "% de licencia abierta por proveedor",
      "Velocidad promedio por proveedor",
    ],
  },
  D: {
    id: "D",
    primaryUseCase:
      "Administrador de sistemas que monitorea la salud del orquestador, cuotas API y latencias de las 13 fuentes.",
    modeExplanation:
      "Modo MYPE por defecto: el costo no es relevante para TI.",
    sees: [
      "Banner de estado general del orquestador",
      "Cuota AA con barra de progreso + countdown reset",
      "Tarjetas de tipo de cambio (4 monedas)",
      "13 fuentes con traffic lights, latencia y último sync",
      "Configuración de notificaciones ntfy.sh",
      "Endpoint de health check",
    ],
    notSees: [
      "QR generator (es operacional, no de TI)",
      "Simulador ROI (es de Gerente)",
      "Recomendador de modelos (es de Ingeniero)",
      "Tabla pivote por proveedor (es de Consultor)",
    ],
    kpis: [
      "AA quota: remaining / limit",
      "Latencia por fuente (ms)",
      "Tiempo desde último sync (hace Xh)",
      "Indicadores de calidad de datos (6 métricas)",
    ],
  },
  E: {
    id: "E",
    primaryUseCase:
      "Operario de taller con computación básica o celular. Necesita recomendaciones simples sin tablas.",
    modeExplanation:
      "Modo MYPE con excepción de perfil E: NO aplica el umbral anti-'gratis malo' del 70%, para que el operario siempre vea un modelo gratis arriba.",
    sees: [
      "3 tarjetas GRANDES y coloridas (Escribir/Código/Documentos)",
      "Botón 'COPIAR NOMBRE' grande y obvio",
      "Lenguaje simple sin jerga técnica",
      "Sin sidebar, sin tablas, sin filtros",
    ],
    notSees: [
      "Selector de moneda (siempre PEN)",
      "Selector de modo de operación",
      "Tabla maestra, comparador, calculadora",
      "KPIs de costo (no relevantes para operario)",
      "Toda la metadata técnica (Elo, II, Tier, etc.)",
    ],
    kpis: [
      "Modelo ganador por tarea (1 solo, no top 3)",
      "Solo nombre + proveedor + botón copiar",
    ],
  },
  F: {
    id: "F",
    primaryUseCase:
      "Jefe de compras que controla presupuesto mensual de IA. Necesita alertas y exportación a Excel.",
    modeExplanation:
      "Modo Equilibrado por defecto: costo es lo principal pero sin sacrificar calidad mínima.",
    sees: [
      "Slider de presupuesto mensual en S/.",
      "Sliders de tokens entrada/salida",
      "Lista de modelos DENTRO del presupuesto",
      "Lista de modelos FUERA del presupuesto",
      "Alerta color-coded (verde/amarillo/rojo)",
      "Exportación Excel (CSV) del análisis completo",
    ],
    notSees: [
      "QR generator (es operacional)",
      "Mapa de proveedores metalmecánicos (es industrial)",
      "Cuotas API (es de TI)",
      "Top 8 por II (es de Ingeniero)",
    ],
    kpis: [
      "Costo mensual proyectado por modelo",
      "# de modelos dentro del presupuesto",
      "# de modelos fuera del presupuesto",
      "Nivel de alerta (green/yellow/red)",
    ],
  },
};

interface ProfileExplainedProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialProfileId?: ProfileId;
}

export function ProfileExplained({
  open,
  onOpenChange,
  initialProfileId,
}: ProfileExplainedProps) {
  const [selectedId, setSelectedId] = useState<ProfileId>(
    initialProfileId ?? "A"
  );

  // Update selectedId when dialog opens with a specific profile
  const effectiveSelectedId = open && initialProfileId ? initialProfileId : selectedId;

  const profile = PROFILES.find((p) => p.id === effectiveSelectedId)!;
  const explanation = PROFILE_EXPLANATIONS[effectiveSelectedId];
  const Icon = PROFILE_ICONS[profile.icon] ?? HardHat;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-xl bg-[var(--bg-surface)] border-[var(--border-default)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-semibold tracking-tight">
              Perfiles de usuario
            </DialogTitle>
            <Badge variant="outline" className="text-[10px]">
              6 perfiles · A–F
            </Badge>
            <button
              onClick={() => onOpenChange(false)}
              className="ml-auto inline-flex items-center justify-center rounded-md h-7 w-7 text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <DialogDescription className="sr-only">
            Explicación de los 6 perfiles de usuario del SelectIA
          </DialogDescription>
        </DialogHeader>

        {/* Profile selector chips */}
        <div className="flex flex-wrap gap-1.5">
          {PROFILES.map((p) => {
            const active = p.id === effectiveSelectedId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                  active
                    ? "bg-[var(--brand-primary-subtle)] border-[var(--brand-primary)] text-[var(--brand-primary)]"
                    : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 h-3.5 font-mono"
                >
                  {p.id}
                </Badge>
                {p.name}
              </button>
            );
          })}
        </div>

        {/* Profile detail */}
        <article className="space-y-4">
          <header className="flex items-start gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-primary-subtle)] shrink-0">
              <Icon className="h-6 w-6 text-[var(--brand-primary)]" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                  {profile.name}
                </h3>
                <Badge variant="outline" className="text-[10px]">
                  Perfil {profile.id}
                </Badge>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                {profile.role} · modo {profile.defaultMode}
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                {profile.description}
              </p>
            </div>
          </header>

          <section>
            <h4 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Caso de uso principal
            </h4>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              {explanation.primaryUseCase}
            </p>
          </section>

          <section>
            <h4 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Modo de operación
            </h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
              {explanation.modeExplanation}
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
              <h4 className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-success)] mb-1.5">
                Lo que ve
              </h4>
              <ul className="space-y-1">
                {explanation.sees.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]"
                  >
                    <Check className="h-3 w-3 mt-0.5 shrink-0 text-[var(--color-success)]" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h4 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-disabled)] mb-1.5">
                Lo que NO ve
              </h4>
              <ul className="space-y-1">
                {explanation.notSees.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-1.5 text-xs text-[var(--text-disabled)]"
                  >
                    <Minus className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section>
            <h4 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              KPIs principales
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {explanation.kpis.map((k, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 h-5"
                >
                  {k}
                </Badge>
              ))}
            </div>
          </section>
        </article>
      </DialogContent>
    </Dialog>
  );
}
