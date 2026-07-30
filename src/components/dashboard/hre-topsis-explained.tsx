"use client";

import { useState } from "react";
import { useDashboardStore } from "@/store/dashboard-store";
import { ENGINE_LAYERS, MODE_DOCS } from "@/lib/data/engine-docs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Scale,
  BarChart3,
  MessageSquare,
  Sprout,
  Award,
  Gift,
  Layers as LayersIcon,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const LAYER_ICONS: Record<string, LucideIcon> = {
  Search,
  Filter,
  Scale,
  BarChart3,
  MessageSquare,
};

const MODE_ICONS: Record<string, LucideIcon> = {
  Sprout,
  Award,
  Scale,
  Gift,
};

export function HreTopsisExplained() {
  const { engineExplainedOpen, closeEngineExplained } = useDashboardStore();

  return (
    <Dialog
      open={engineExplainedOpen}
      onOpenChange={(o) => !o && closeEngineExplained()}
    >
      <DialogContent className="max-w-none sm:max-w-none w-[96vw] sm:w-[92vw] lg:w-[88vw] xl:w-[82vw] max-h-[94vh] rounded-xl bg-[var(--bg-surface)] border-[var(--border-default)] overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <LayersIcon className="h-4 w-4 text-[var(--brand-primary)]" />
            <DialogTitle className="text-base font-semibold tracking-tight">
              Motor HRE-TOPSIS explicado
            </DialogTitle>
            <Badge variant="outline" className="text-[10px]">
              5 capas · 4 modos · &lt;100ms
            </Badge>
            <button
              onClick={closeEngineExplained}
              className="ml-auto inline-flex items-center justify-center rounded-md h-7 w-7 text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <DialogDescription className="sr-only">
            Explicación del motor HRE-TOPSIS: capas y modos de operación
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="layers" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="layers" className="text-xs">
              Las 5 Capas
            </TabsTrigger>
            <TabsTrigger value="modes" className="text-xs">
              Modos de Operación
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layers" className="mt-3 space-y-2">
            <Accordion type="single" collapsible defaultValue="layer-1">
              {ENGINE_LAYERS.map((layer) => {
                const Icon = LAYER_ICONS[layer.icon] ?? LayersIcon;
                return (
                  <AccordionItem
                    key={layer.id}
                    value={`layer-${layer.id}`}
                    className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 mb-2 overflow-hidden"
                  >
                    <AccordionTrigger className="text-sm hover:no-underline py-3">
                      <div className="flex items-center gap-2.5 text-left">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-md shrink-0"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${layer.color} 12%, transparent)`,
                          }}
                        >
                          <Icon
                            className="h-3.5 w-3.5"
                            style={{ color: layer.color }}
                          />
                        </span>
                        <div>
                          <div className="font-semibold text-[var(--text-primary)]">
                            <span className="text-[var(--text-secondary)] mr-1">
                              Capa {layer.id}:
                            </span>
                            {layer.name}
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)] font-normal">
                            {layer.description.slice(0, 90)}…
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-3 space-y-3">
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {layer.description}
                      </p>
                      <div>
                        <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                          Pasos
                        </div>
                        <ol className="space-y-1">
                          {layer.steps.map((step, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-xs text-[var(--text-secondary)]"
                            >
                              <span
                                className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded text-[9px] font-mono font-semibold shrink-0 mt-0.5"
                                style={{
                                  backgroundColor: `color-mix(in srgb, ${layer.color} 15%, transparent)`,
                                  color: layer.color,
                                }}
                              >
                                {i + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                          Output
                        </div>
                        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-overlay)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] font-mono">
                          {layer.output}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                          Trazabilidad
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] italic">
                          {layer.traceability}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>

          <TabsContent value="modes" className="mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MODE_DOCS.map((mode) => {
                const Icon = MODE_ICONS[mode.icon] ?? Sprout;
                return (
                  <div
                    key={mode.id}
                    className="rounded-lg border bg-[var(--bg-elevated)] p-3.5"
                    style={{
                      borderColor: `color-mix(in srgb, ${mode.color} 25%, var(--border-default))`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-md shrink-0"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${mode.color} 15%, transparent)`,
                        }}
                      >
                        <Icon
                          className="h-3.5 w-3.5"
                          style={{ color: mode.color }}
                        />
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          {mode.label}
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)]">
                          Peso costo: {mode.costWeightRange}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2.5">
                      {mode.description}
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                          Comportamiento:
                        </span>
                        <p className="text-[var(--text-secondary)] mt-0.5">
                          {mode.behavior}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                          Caso de uso:
                        </span>
                        <p className="text-[var(--text-secondary)] mt-0.5">
                          {mode.useCase}
                        </p>
                      </div>
                      <div className="rounded-md bg-[var(--bg-overlay)] border border-[var(--border-default)] px-2 py-1.5 mt-1.5">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] block mb-0.5">
                          Escenario ejemplo
                        </span>
                        <p className="text-[var(--text-secondary)] italic">
                          {mode.exampleScenario}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
