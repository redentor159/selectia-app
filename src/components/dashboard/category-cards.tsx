"use client";

import { useState } from "react";
import {
  CATEGORY_DOCS,
  type CategoryDoc,
} from "@/lib/data/engine-docs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PenLine,
  FileText,
  Code2,
  Calculator,
  HardDriveDownload,
  Zap,
  Globe,
  Bot,
  ArrowRight,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboardStore } from "@/store/dashboard-store";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  PenLine,
  FileText,
  Code2,
  Calculator,
  HardDriveDownload,
  Zap,
  Globe,
  Bot,
};

export function CategoryCards() {
  const [selected, setSelected] = useState<CategoryDoc | null>(null);
  const { setRecommendationQuery, setActiveView, openEngineExplained } =
    useDashboardStore();

  const handleUseCategory = (cat: CategoryDoc) => {
    // Open the recomendador with an example query for this category
    setRecommendationQuery(cat.exampleQueries[0] ?? "");
    setActiveView("recomendador");
    setSelected(null);
  };

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORY_DOCS.map((cat) => {
          const Icon = ICON_MAP[cat.icon] ?? Sparkles;
          return (
            <button
              key={cat.id}
              onClick={() => setSelected(cat)}
              className="group text-left rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 hover:border-[var(--brand-primary)] hover:bg-[var(--bg-elevated)] transition-all"
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg mb-2.5"
                style={{
                  backgroundColor: `color-mix(in srgb, ${cat.color} 12%, transparent)`,
                }}
              >
                <Icon className="h-4 w-4" style={{ color: cat.color }} />
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">
                {cat.label}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-snug line-clamp-2">
                {cat.shortDescription}
              </p>
            </button>
          );
        })}
      </section>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl rounded-xl bg-[var(--bg-surface)] border-[var(--border-default)] max-h-[88vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${selected.color} 12%, transparent)`,
                    }}
                  >
                    {(() => {
                      const Icon = ICON_MAP[selected.icon] ?? Sparkles;
                      return (
                        <Icon
                          className="h-5 w-5"
                          style={{ color: selected.color }}
                        />
                      );
                    })()}
                  </span>
                  <div>
                    <DialogTitle className="text-lg font-semibold tracking-tight">
                      Categoría: {selected.label}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      {selected.shortDescription}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <section>
                  <h4 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Descripción
                  </h4>
                  <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                    {selected.fullDescription}
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <section>
                    <h4 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                      Keywords detectadas
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selected.keywords.slice(0, 10).map((k) => (
                        <Badge
                          key={k}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4.5 font-mono"
                        >
                          {k}
                        </Badge>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h4 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                      Entity boosts
                    </h4>
                    <ul className="text-xs text-[var(--text-secondary)] space-y-0.5">
                      {selected.entityBoosts.map((b, i) => (
                        <li key={i}>• {b}</li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section>
                  <h4 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Métricas priorizadas (pesos AHP)
                  </h4>
                  <div className="space-y-1.5">
                    {selected.priorityMetrics.map((m, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-primary)] w-48">
                          {m.metric}
                        </span>
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${m.weight * 100}%`,
                              backgroundColor: selected.color,
                            }}
                          />
                        </div>
                        <span
                          className="num text-xs font-medium w-10 text-right"
                          style={{ color: selected.color }}
                        >
                          {(m.weight * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <section>
                    <h4 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                      Filtros duros
                    </h4>
                    <ul className="text-xs space-y-0.5">
                      {selected.hardFilters.map((f, i) => (
                        <li
                          key={i}
                          className="text-[var(--color-error)] flex items-start gap-1.5"
                        >
                          <X className="h-3 w-3 mt-0.5 shrink-0" />
                          <span className="text-[var(--text-secondary)]">
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h4 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                      Qué incluye / excluye
                    </h4>
                    <ul className="text-xs space-y-0.5">
                      {selected.included.slice(0, 3).map((m, i) => (
                        <li
                          key={`in-${i}`}
                          className="flex items-start gap-1.5"
                        >
                          <Check className="h-3 w-3 mt-0.5 shrink-0 text-[var(--color-success)]" />
                          <span className="text-[var(--text-secondary)]">
                            {m}
                          </span>
                        </li>
                      ))}
                      {selected.excluded.slice(0, 3).map((m, i) => (
                        <li
                          key={`ex-${i}`}
                          className="flex items-start gap-1.5"
                        >
                          <X className="h-3 w-3 mt-0.5 shrink-0 text-[var(--color-error)]" />
                          <span className="text-[var(--text-secondary)]">
                            {m}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section>
                  <h4 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Consultas de ejemplo
                  </h4>
                  <div className="space-y-1">
                    {selected.exampleQueries.map((q, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)] italic"
                      >
                        “{q}”
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-default)]">
                  <Button
                    onClick={() => handleUseCategory(selected)}
                    className="bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--on-accent)]"
                    size="sm"
                  >
                    Usar esta categoría
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                  <Button
                    onClick={() => {
                      setSelected(null);
                      openEngineExplained();
                    }}
                    variant="outline"
                    size="sm"
                    className="border-[var(--border-strong)]"
                  >
                    Ver motor HRE-TOPSIS
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
