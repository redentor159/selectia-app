"use client";

import { useMemo, useState } from "react";
import { useDashboardStore } from "@/store/dashboard-store";
import {
  GLOSSARY,
  GLOSSARY_CATEGORIES,
  type GlossaryTerm,
  type GlossaryCategory,
  findTerm,
} from "@/lib/data/glossary";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, X, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlossaryDialog() {
  const { glossaryOpen, glossaryInitialTerm, closeGlossary } = useDashboardStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<GlossaryCategory | "all">(
    "all"
  );
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);
  const [lastInitialTerm, setLastInitialTerm] = useState<string | null | undefined>(
    undefined
  );

  // Sync selected term when initialTerm changes (render-time adjustment
  // is the recommended React pattern for "derived state from props").
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  if (glossaryOpen && glossaryInitialTerm !== lastInitialTerm) {
    setLastInitialTerm(glossaryInitialTerm);
    if (glossaryInitialTerm) {
      const found = findTerm(glossaryInitialTerm);
      if (found) {
        setSelectedTerm(found);
        setActiveCategory(found.category);
        setSearch("");
      }
    } else if (!selectedTerm) {
      setSelectedTerm(GLOSSARY[0] ?? null);
    }
  }
  if (!glossaryOpen && lastInitialTerm !== undefined) {
    // Reset tracking when closed
    setLastInitialTerm(undefined);
  }

  const filteredTerms = useMemo(() => {
    let list = GLOSSARY;
    if (activeCategory !== "all") {
      list = list.filter((t) => t.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          (t.aliases ?? []).some((a) => a.toLowerCase().includes(q)) ||
          t.definition.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => a.term.localeCompare(b.term, "es"));
  }, [search, activeCategory]);

  const handleSelectTerm = (term: GlossaryTerm) => {
    setSelectedTerm(term);
  };

  const handleRelated = (related: string) => {
    const found = findTerm(related);
    if (found) {
      setSelectedTerm(found);
      setActiveCategory(found.category);
      setSearch("");
    }
  };

  const handleClose = () => {
    closeGlossary();
    // small delay before resetting to avoid flicker
    setTimeout(() => {
      setSearch("");
      setSelectedTerm(null);
      setActiveCategory("all");
    }, 200);
  };

  return (
    <Dialog open={glossaryOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="flex flex-col gap-0 p-0 max-w-none sm:max-w-none rounded-xl bg-[var(--bg-surface)] border-[var(--border-default)] w-[96vw] sm:w-[92vw] lg:w-[88vw] xl:w-[82vw] h-[94vh] sm:h-[90vh]"
        showCloseButton={false}
      >
        <DialogHeader className="px-5 py-4 border-b border-[var(--border-default)] space-y-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[var(--brand-primary)]" />
            <DialogTitle className="text-base font-semibold tracking-tight">
              Glosario Técnico
            </DialogTitle>
            <Badge variant="outline" className="text-[10px] ml-1">
              {GLOSSARY.length} términos · {GLOSSARY_CATEGORIES.length} categorías
            </Badge>
            <button
              onClick={handleClose}
              className="ml-auto inline-flex items-center justify-center rounded-md h-7 w-7 text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <DialogDescription className="sr-only">
            Glosario de términos técnicos del SelectIA
          </DialogDescription>
        </DialogHeader>

        {/* Search bar */}
        <div className="px-5 py-3 border-b border-[var(--border-default)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar término, alias o definición…"
              className="h-9 pl-9 bg-[var(--bg-elevated)] border-[var(--border-default)]"
            />
          </div>
          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <CategoryChip
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              label="Todas"
              color="var(--text-secondary)"
              bgColor="var(--bg-overlay)"
              borderColor="var(--border-default)"
            />
            {GLOSSARY_CATEGORIES.map((c) => (
              <CategoryChip
                key={c.id}
                active={activeCategory === c.id}
                onClick={() => setActiveCategory(c.id)}
                label={c.label}
                color={c.color}
                bgColor={c.bgColor}
                borderColor={c.borderColor}
              />
            ))}
          </div>
        </div>

        {/* Split panel: list (38%) + detail (62%) */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* List */}
          <div className="w-full md:w-[38%] md:border-r border-[var(--border-default)] overflow-y-auto">
            {filteredTerms.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
                Sin resultados para "{search}"
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-default)]">
                {filteredTerms.map((term) => {
                  const cat = GLOSSARY_CATEGORIES.find(
                    (c) => c.id === term.category
                  )!;
                  const active = selectedTerm?.term === term.term;
                  return (
                    <li key={term.term}>
                      <button
                        onClick={() => handleSelectTerm(term)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 hover:bg-[var(--bg-overlay)] transition-colors flex items-start gap-2",
                          active && "bg-[var(--brand-primary-subtle)]"
                        )}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {term.term}
                          </div>
                          <div className="text-[10px] text-[var(--text-secondary)] truncate">
                            {cat.label}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Detail */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            {selectedTerm ? (
              <TermDetail
                term={selectedTerm}
                onRelated={handleRelated}
              />
            ) : (
              <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
                Selecciona un término para ver su definición
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
  color,
  bgColor,
  borderColor,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition-all",
        active
          ? "scale-105"
          : "opacity-70 hover:opacity-100"
      )}
      style={{
        color,
        backgroundColor: bgColor,
        borderColor: active ? color : borderColor,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </button>
  );
}

function TermDetail({
  term,
  onRelated,
}: {
  term: GlossaryTerm;
  onRelated: (r: string) => void;
}) {
  const cat = GLOSSARY_CATEGORIES.find((c) => c.id === term.category)!;
  return (
    <article className="p-5 lg:p-6 space-y-4">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border"
            style={{
              color: cat.color,
              backgroundColor: cat.bgColor,
              borderColor: cat.borderColor,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            {cat.label}
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {term.term}
        </h2>
        {term.aliases && term.aliases.length > 0 && (
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            <span className="font-medium">También conocido como:</span>{" "}
            {term.aliases.join(" · ")}
          </p>
        )}
      </header>

      <section>
        <h3 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
          Definición
        </h3>
        <p className="text-sm leading-relaxed text-[var(--text-primary)]">
          {term.definition}
        </p>
      </section>

      {term.example && (
        <section>
          <h3 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
            Ejemplo
          </h3>
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3 text-sm text-[var(--text-secondary)] italic leading-relaxed">
            “{term.example}”
          </div>
        </section>
      )}

      {term.deepDive && (
        <section>
          <details className="group">
            <summary className="cursor-pointer text-[10px] font-medium uppercase tracking-wider text-[var(--brand-primary)] mb-1.5 flex items-center gap-1 select-none">
              <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
              ¿Más detalle técnico?
            </summary>
            <div className="mt-2 rounded-lg border border-[var(--brand-primary-subtle)] bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
              {term.deepDive}
            </div>
          </details>
        </section>
      )}

      {term.related && term.related.length > 0 && (
        <section>
          <h3 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
            Términos relacionados
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {term.related.map((r) => {
              const exists = findTerm(r) !== undefined;
              return (
                <button
                  key={r}
                  onClick={() => exists && onRelated(r)}
                  disabled={!exists}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    exists
                      ? "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                      : "border-[var(--border-default)] bg-transparent text-[var(--text-disabled)] cursor-not-allowed"
                  )}
                >
                  {r}
                  {exists && <ArrowRight className="h-2.5 w-2.5" />}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
