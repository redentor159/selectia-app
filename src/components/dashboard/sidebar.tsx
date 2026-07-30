"use client";

import { useDashboardStore, type ViewId } from "@/store/dashboard-store";
import {
  LayoutDashboard,
  Sparkles,
  Table2,
  Calculator,
  GitCompareArrows,
  HeartPulse,
  BookOpen,
  LineChart,
  TrendingUp,
  QrCode,
  Compass,
  Layers,
  Cpu,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  id: ViewId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "General",
    items: [
      {
        id: "overview",
        label: "Resumen",
        icon: LayoutDashboard,
        description: "Se adapta a tu perfil activo",
      },
      {
        id: "recomendador",
        label: "Recomendador",
        icon: Sparkles,
        description: "Motor HRE-TOPSIS por tarea",
      },
      {
        id: "tabla",
        label: "Tabla Maestra",
        icon: Table2,
        description: "Modelos comparados",
      },
      {
        id: "comparador",
        label: "Comparador",
        icon: GitCompareArrows,
        description: "Lado a lado 2-4 modelos",
      },
    ],
  },
  {
    label: "Análisis y herramientas",
    items: [
      {
        id: "analytics",
        label: "Analytics",
        icon: LineChart,
        description: "Heatmap + timeline + licencias",
      },
      {
        id: "simulador-roi",
        label: "Simulador ROI",
        icon: TrendingUp,
        description: "Calcula retorno de adopción IA",
      },
      {
        id: "calculadora",
        label: "Calculadora",
        icon: Calculator,
        description: "Costo proyectado y ROI",
      },
      {
        id: "calculadora-hardware",
        label: "Hardware IA",
        icon: Cpu,
        description: "¿Corre en mi GPU?",
      },
      {
        id: "qr-generator",
        label: "QR Generator",
        icon: QrCode,
        description: "Códigos QR para órdenes de trabajo",
      },
      {
        id: "salud",
        label: "Salud del Sistema",
        icon: HeartPulse,
        description: "Fuentes, cuotas, latencias",
      },
    ],
  },
  {
    label: "Educación",
    items: [
      {
        id: "engine-animation",
        label: "Animación del Motor",
        icon: PlayCircle,
        description: "Paso a paso: cómo decide el motor",
      },
      {
        id: "guia-decision",
        label: "Guía de Decisión",
        icon: Compass,
        description: "Tiers de costo-calidad (informativo)",
      },
    ],
  },
];

export function Sidebar() {
  const { activeView, setActiveView, compareIds, openGlossary, openEngineExplained } =
    useDashboardStore();

  return (
    <TooltipProvider delayDuration={200}>
      <nav className="flex lg:flex-col items-center lg:items-stretch gap-1 p-2 lg:p-3 lg:w-[240px] shrink-0 lg:border-r border-[var(--border-default)] lg:bg-[var(--bg-elevated)] overflow-x-auto lg:overflow-y-auto lg:overflow-x-visible">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={section.label} className="flex lg:flex-col items-center lg:items-stretch gap-1">
            {/* Section separator on desktop, spacer on mobile */}
            {sIdx > 0 && (
              <div className="hidden lg:block h-px bg-[var(--border-default)] my-2 mx-2" />
            )}
            <div className="hidden lg:block px-2 pb-1 pt-1">
              <div className="eyebrow text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                {section.label}
              </div>
            </div>
            {section.items.map((item) => {
              const active = activeView === item.id;
              const Icon = item.icon;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setActiveView(item.id)}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all shrink-0",
                        "lg:w-full",
                        active
                          ? "bg-[var(--brand-primary-subtle)] text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-[var(--brand-primary)]" />
                      )}
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active && "text-[var(--brand-primary)]"
                        )}
                      />
                      <span className="hidden lg:block">{item.label}</span>
                      {item.id === "comparador" && compareIds.length > 0 && (
                        <span className="hidden lg:flex ml-auto h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-accent)] px-1.5 text-[10px] font-semibold text-[var(--on-accent)]">
                          {compareIds.length}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}

        {/* Help / Glossary / Engine modals — always visible (mobile + desktop)
            Per user request: glossary + engine explanation must ALWAYS be accessible. */}
        <div className="flex lg:flex-col items-center lg:items-stretch gap-1 lg:mt-auto lg:pt-3 lg:space-y-1 lg:border-t lg:border-[var(--border-default)] lg:mt-2 shrink-0 lg:w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => openGlossary()}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-colors lg:w-full shrink-0"
                aria-label="Glosario"
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="hidden lg:block">Glosario</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="lg:hidden">Glosario</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => openEngineExplained()}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-colors lg:w-full shrink-0"
                aria-label="Motor HRE-TOPSIS explicado"
              >
                <Layers className="h-4 w-4 shrink-0" />
                <span className="hidden lg:block">Motor HRE-TOPSIS</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="lg:hidden">Motor HRE-TOPSIS</TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </TooltipProvider>
  );
}
