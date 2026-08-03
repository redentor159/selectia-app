"use client";

import {
  useMemo, useState, memo, useCallback, useDeferredValue, useEffect, useRef,
} from "react";
import { useEffectiveDashboardData } from "@/hooks/use-effective-dashboard-data";
import { useDashboardStore } from "@/store/dashboard-store";
import {
  getCurrencyByCode,
  formatPrice,
  formatContext,
  formatVotes,
  formatEloConfidence,
  computeBlendedUsd,
  getIntelligenceColor,
  getEloColor,
  LICENSE_META,
  FREE_ACCESS_META,
  formatMs,
  formatPricePerMillion,
} from "@/lib/format";
import { ProviderLogo } from "../provider-logo";
import { CapabilityIcons } from "../model-badges";
import { FichaTecnicaModal } from "../ficha-tecnica-modal";
import {
  Search, X, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown,
  Copy, Check, GitCompareArrows, Database, RotateCcw, CheckCircle2, Columns,
  Download, Star, FolderOpen, Monitor,
  Wrench, Eye, Braces, Brain, Mic, Volume2, FileText, Globe, RefreshCw, Zap,
  ShieldCheck, Stethoscope, Heart, Flame, TrendingUp, Activity, ChevronDown, Save,
} from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AIModel, FilterState, LicenseType, Capabilities, CurrencyRate } from "@/lib/types";

type SortKey = keyof AIModel | "blendedUsd" | "efficiencyCost";
type SortDir = "asc" | "desc" | null;

// Formats a raw parameter count (from HuggingFace safetensors) into a human-readable string
function formatParamsFromNumber(n: number | null | undefined): string | null {
  if (n == null) return null;
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `${Math.round(n / 1e9)}B`;
  if (n >= 1e6) return `${Math.round(n / 1e6)}M`;
  return String(n);
}

// Derives live capability flags from OpenRouter API data.
// Falls back to static model.capabilities when OR coverage is missing.
function getEffectiveCapabilities(model: AIModel): import("@/lib/types").Capabilities {
  const base = model.capabilities;
  if (!model.orModelId) return base; // No OR coverage — use static
  return {
    toolUse: model.orSupportedParameters?.includes("tools") ?? base.toolUse,
    vision: model.orInputModalities?.includes("image") ?? base.vision,
    jsonMode: (model.orSupportedParameters?.includes("response_format") ||
               model.orSupportedParameters?.includes("structured_outputs")) ?? base.jsonMode,
    reasoning: (model.orReasoningMandatory === true || model.orReasoningDefaultEnabled === true) || base.reasoning,
    audioInput: model.orInputModalities?.includes("audio") ?? base.audioInput,
    audioOutput: model.orOutputModalities?.includes("audio") ?? base.audioOutput,
    pdf: base.pdf, // No OR equivalent
    webSearch: (model.orWebSearchPrice != null) || base.webSearch,
    interleavedReasoning: base.interleavedReasoning, // No OR equivalent
    extendedThinking: ((model.orReasoningEfforts?.length ?? 0) > 0) || base.extendedThinking,
  };
}

// ---------------------------------------------------------------------------
// PERFORMANCE (gap P2A-TABLA) — lightweight inline virtualization.
// 220 rows × 20 columns = 4400 cells; rendering all of them on every filter
// keystroke was the root cause of the "demora demasiado en cargar" complaint.
// We render only the rows inside the viewport ± a buffer of 15 rows.
// ---------------------------------------------------------------------------
const ROW_HEIGHT = 54; // px — compact single-line capabilities + logo + text
const VISIBLE_BUFFER = 15; // rows rendered above & below the viewport to hide scroll flicker
const COLUMN_COUNT = 20; // Modelo… + Confiab. + Downloads + Likes + Ficha + compare button = 20 cells per row

// Full 10-capability multi-select (gap #14). Mirrors CAPABILITY_ITEMS in
// model-badges.tsx so the filter UI shows the same icons/labels as the row.
const FILTER_CAPABILITY_ITEMS: Array<{
  key: keyof Capabilities;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}> = [
  { key: "reasoning", icon: Brain, label: "Solo Reasoning" },
  { key: "extendedThinking", icon: Zap, label: "Solo Extended Thinking" },
  { key: "toolUse", icon: Wrench, label: "Tool Use / Function Calling" },
  { key: "vision", icon: Eye, label: "Visión (imágenes)" },
  { key: "jsonMode", icon: Braces, label: "JSON Mode" },
  { key: "audioInput", icon: Mic, label: "Audio Input" },
  { key: "audioOutput", icon: Volume2, label: "Audio Output" },
  { key: "pdf", icon: FileText, label: "Documentos PDF" },
  { key: "webSearch", icon: Globe, label: "Web Search" },
  { key: "interleavedReasoning", icon: RefreshCw, label: "Interleaved Reasoning" },
];

// Format helpers for HF enrichment
function formatCompact(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

const DEFAULT_FILTERS: FilterState = {
  search: "", providers: [], licenses: [], capabilities: [],
  freeAccess: "all", maxPrice: 1000, minContext: 0,
  minIntelligence: 0, minSpeed: 0, minKnowledgeCutoff: "2020-01",
  reasoningOnly: false, extendedThinkingOnly: false,
  minEloVotes: 0, maxEloCi: 30,
  hardwareFilterVram: 0,
  minReliability: 0,
  minBenchLmScore: 0,
  hideAbandoned: false,
  architecture: "all",
};

export function TablaView() {
  const { data, isLoading } = useEffectiveDashboardData();
  const { currency, filters, setFilters, resetFilters, toggleCompare, compareIds, capabilitiesLogic, setCapabilitiesLogic, openGlossary } = useDashboardStore();
  const { toast } = useToast();
  const [sortKey, setSortKey] = useState<SortKey>("intelligenceIndex");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(true);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
    contextWindow: true, intelligenceIndex: true, codingIndex: true, agenticIndex: true,
    speedTps: true, ttftMs: true, elo: true, eloCi: false, knowledgeCutoff: false,
    hfParameters: false, capabilities: true, reliability: true, hfHealth: false,
    hfDownloads: false, hfLikes: false,
  });

  const COL_LABELS: Record<string, string> = {
    contextWindow: "Contexto", intelligenceIndex: "Intel. Index", codingIndex: "Coding Index",
    agenticIndex: "Agentic Index", speedTps: "Velocidad (TPS)", ttftMs: "TTFT", elo: "Elo",
    eloCi: "Confianza Elo", knowledgeCutoff: "Cutoff", hfParameters: "Parámetros",
    capabilities: "Capacidades", reliability: "Confiab. ZeroEval", hfHealth: "Salud Repo",
    hfDownloads: "Descargas HF", hfLikes: "Likes HF",
  };

  // Ficha Técnica modal state (Funciones D + E — lazy-load HF details)
  const [fichaTecnicaModelId, setFichaTecnicaModelId] = useState<string | null>(null);
  const handleOpenFichaTecnica = useCallback((modelId: string) => setFichaTecnicaModelId(modelId), []);
  const handleCloseFichaTecnica = useCallback(() => setFichaTecnicaModelId(null), []);
  // Función K — opens the Ficha Técnica modal of the BenchLM successor model
  // (looked up by benchlmSlug === benchlmSupersededBy). When the successor
  // model is not present in our DB (e.g. it was filtered out), the ModelRow
  // falls back to a static tooltip instead of opening the modal.
  const handleOpenSuccessorFicha = useCallback((slug: string) => {
    if (!data) return;
    const successor = data.models.find((x) => x.benchlmSlug === slug);
    if (successor) setFichaTecnicaModelId(successor.id);
  }, [data]);

  const currencyMeta = data ? getCurrencyByCode(data.currencies, currency) : null;

  // Live search callback (no toast) — used by FilterPanel's debounced search effect.
  const handleLiveSearch = useCallback((search: string) => {
    setFilters({ search });
  }, [setFilters]);

  const filteredModels = useMemo(() => {
    if (!data) return [];
    let result = data.models.filter((m) => m.active);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        m.family.toLowerCase().includes(q)
      );
    }
    if (filters.providers.length > 0) result = result.filter((m) => filters.providers.includes(m.provider));
    if (filters.licenses.length > 0) result = result.filter((m) => filters.licenses.includes(m.license));
    if (filters.freeAccess !== "all") result = result.filter((m) => m.freeAccess === filters.freeAccess);
    if (filters.maxPrice < 1000) result = result.filter((m) => { const b = computeBlendedUsd(m); return b === 0 || b <= filters.maxPrice; });
    if (filters.minContext > 0) result = result.filter((m) => (m.orContextLength ?? m.contextWindow) >= filters.minContext);
    if (filters.minIntelligence > 0) result = result.filter((m) => (m.intelligenceIndex ?? 0) >= filters.minIntelligence);
    if (filters.minSpeed > 0) result = result.filter((m) => (m.speedTps ?? 0) >= filters.minSpeed);
    // Capabilities multi-select (gap #14) — replaces the old reasoningOnly /
    // extendedThinkingOnly booleans. The first two checkboxes in the UI
    // ("Solo Reasoning", "Solo Extended Thinking") are the legacy quick
    // toggles and now simply toggle the corresponding capability.
    if (filters.capabilities.length > 0) {
      const caps = filters.capabilities as (keyof Capabilities)[];
      if (capabilitiesLogic === "and") {
        result = result.filter((m) => { const ec = getEffectiveCapabilities(m); return caps.every((c) => ec[c]); });
      } else {
        result = result.filter((m) => { const ec = getEffectiveCapabilities(m); return caps.some((c) => ec[c]); });
      }
    }
    if (filters.minEloVotes > 0) result = result.filter((m) => (m.eloVotes ?? 0) >= filters.minEloVotes);
    if (filters.maxEloCi < 30) result = result.filter((m) => m.eloCi === null || m.eloCi <= filters.maxEloCi);
    if ((filters.minBenchLmScore ?? 0) > 0) result = result.filter((m) => (m.benchlmDisplayScore ?? 0) >= filters.minBenchLmScore!);
    if (filters.hideAbandoned) {
      const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      result = result.filter((m) => {
        if (m.benchlmSupersededBy) return false;
        if (m.hfLastModified) {
          const modDate = new Date(m.hfLastModified).getTime();
          if (now - modDate > ONE_YEAR_MS) return false;
        }
        return true;
      });
    }
    if (filters.architecture && filters.architecture !== "all") {
      if (filters.architecture === "moe") result = result.filter((m) => m.isMoE === true);
      if (filters.architecture === "dense") result = result.filter((m) => !m.isMoE);
    }
    // Filtro 13 — Cabe en Mi Hardware (Función C del MD de HuggingFace)
    // When active (hardwareFilterVram > 0), exclude models whose most aggressive
    // reasonable quantization (Q2_K = 0.35 bytes/param × 1.2 overhead) still
    // exceeds the user's VRAM. Models without hfParameters are kept (unknown).
    if (filters.hardwareFilterVram && filters.hardwareFilterVram > 0) {
      const minVramBytes = filters.hardwareFilterVram * 1e9;
      result = result.filter((m) => {
        if (!m.hfParameters || m.hfParameters <= 0) return true; // unknown → keep
        const q2KBytes = m.hfParameters * 0.35 * 1.2;
        return q2KBytes <= minVramBytes;
      });
    }
    // Filtro 14 — Confiabilidad mínima (ZeroEval, Función K del plan v2.0)
    // reliability = 1 − zeroevalFailureRate when ZeroEval data exists;
    // models without ZeroEval data use a 0.95 baseline (same assumption as
    // the HRE-TOPSIS engine). When minReliability > 0, filter accordingly.
    if (filters.minReliability && filters.minReliability > 0) {
      const minRel = filters.minReliability / 100;
      result = result.filter((m) => {
        const rel = 1 - (m.zeroevalFailureRate ?? 0.05);
        return rel >= minRel;
      });
    }
    return result;
  }, [data, filters, capabilitiesLogic]);

  const sortedModels = useMemo(() => {
    if (!sortDir) return filteredModels;
    return [...filteredModels].sort((a, b) => {
      let av: any, bv: any;
      if (sortKey === "blendedUsd") { av = computeBlendedUsd(a); bv = computeBlendedUsd(b); }
      else if (sortKey === "efficiencyCost") {
        const ba = computeBlendedUsd(a), bb = computeBlendedUsd(b);
        av = (a.intelligenceIndex && ba > 0) ? ba / a.intelligenceIndex : 999;
        bv = (b.intelligenceIndex && bb > 0) ? bb / b.intelligenceIndex : 999;
      } else { av = a[sortKey]; bv = b[sortKey]; }
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [filteredModels, sortKey, sortDir]);

  // Proveedores únicos ordenados por su Intelligence Index máximo (descendente),
  // para que los más relevantes aparezcan primero en el filtro.
  const providersByII = useMemo(() => {
    if (!data) return [];
    const maxII = new Map<string, number>();
    for (const m of data.models) {
      if (m.intelligenceIndex != null) {
        const curr = maxII.get(m.provider) ?? 0;
        if (m.intelligenceIndex > curr) maxII.set(m.provider, m.intelligenceIndex);
      }
    }
    return [...new Set(data.models.map((m) => m.provider))].sort(
      (a, b) => (maxII.get(b) ?? 0) - (maxII.get(a) ?? 0)
    );
  }, [data]);

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      else setSortDir("desc");
      return key;
    });
  }, []);

  const handleApplyFilters = useCallback((newFilters: FilterState) => { setFilters(newFilters); toast({ title: "Filtros aplicados" }); }, [setFilters, toast]);
  const handleResetFilters = useCallback(() => { setFilters(DEFAULT_FILTERS); toast({ title: "Filtros restablecidos" }); }, [setFilters, toast]);

  const handleExportCSV = useCallback(() => {
    if (!sortedModels.length) return;
    const headers = ["Modelo","Proveedor","Licencia","Input USD/M","Output USD/M","Blended USD/M","Contexto","II","Coding","Agentic","Velocidad","TTFT","Elo","Votos","Acceso","Downloads","Likes"];
    const rows = sortedModels.map((m) => [m.name,m.provider,m.licenseName,m.priceInputUsd ?? "",m.priceOutputUsd ?? "",computeBlendedUsd(m).toFixed(4),m.contextWindow,m.intelligenceIndex ?? "",m.codingIndex ?? "",m.agenticIndex ?? "",m.speedTps ?? "",m.ttftMs ?? "",m.elo ?? "",m.eloVotes ?? "",m.freeAccess,m.hfDownloads ?? "",m.hfLikes ?? ""]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ai-dashboard-modelos-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "✓ CSV exportado", description: `${sortedModels.length} modelos` });
  }, [sortedModels, toast]);

  // ----- Virtual scroll state -----
  const scrollRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ top: 0, height: 600 });

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setView({ top: el.scrollTop, height: el.clientHeight });
  }, []);

  // Reset scroll position when the row count shrinks dramatically (e.g. filter
  // applied) so the user doesn't see a blank viewport.
  useEffect(() => {
    if (scrollRef.current && view.top > sortedModels.length * ROW_HEIGHT) {
      scrollRef.current.scrollTop = 0;
      setView({ top: 0, height: scrollRef.current.clientHeight });
    }
  }, [sortedModels.length, view.top]);

  const totalRows = sortedModels.length;
  const startIdx = Math.max(0, Math.floor(view.top / ROW_HEIGHT) - VISIBLE_BUFFER);
  const endIdx = Math.min(totalRows, Math.ceil((view.top + view.height) / ROW_HEIGHT) + VISIBLE_BUFFER);
  const visibleModels = sortedModels.slice(startIdx, endIdx);
  const topSpacer = startIdx * ROW_HEIGHT;
  const bottomSpacer = Math.max(0, (totalRows - endIdx) * ROW_HEIGHT);

  if (isLoading || !data || !currencyMeta) {
    return (<div className="space-y-4"><Skeleton className="h-10" /><Skeleton className="h-96" /></div>);
  }

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-[var(--brand-primary)]" />
          <h1 className="text-lg font-semibold tracking-tight">Tabla Maestra</h1>
          <Badge variant="outline" className="num">{sortedModels.length} / {data.models.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-8">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8" title="Mostrar/ocultar columnas">
                <Columns className="h-3.5 w-3.5" /><span className="hidden sm:inline">Columnas</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 max-h-[300px] overflow-y-auto">
              {Object.keys(COL_LABELS).map((col) => (
                <DropdownMenuCheckboxItem key={col} checked={visibleCols[col]} onCheckedChange={(c) => setVisibleCols(p => ({ ...p, [col]: c }))}>
                  {COL_LABELS[col]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-8" title="Exportar CSV">
            <Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">CSV</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <FilterPanel
          appliedFilters={filters}
          providers={providersByII}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          onLiveSearch={handleLiveSearch}
          capabilitiesLogic={capabilitiesLogic}
          onCapabilitiesLogicChange={setCapabilitiesLogic}
        />
      )}

      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)] overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-auto"
          style={{ maxHeight: "calc(100vh - 220px)", minHeight: "320px" }}
        >
          {/* @ts-ignore */}
          <table className={cn("w-full table-dense", Object.entries(visibleCols).filter(([_, v]) => !v).map(([k]) => `hide-col-${k}`).join(" "))}>
            <thead className="bg-[var(--bg-elevated)] sticky top-0 z-40">
              <tr>
                <Th label="Modelo" sortKey="name" currentSort={sortKey} dir={sortDir} onSort={handleSort} sticky />
                <Th label="Blended" sortKey="blendedUsd" currentSort={sortKey} dir={sortDir} onSort={handleSort} align="right" />
                <Th label="Eficiencia" sortKey="efficiencyCost" currentSort={sortKey} dir={sortDir} onSort={handleSort} align="right" />
                <Th label="Contexto" sortKey="contextWindow" currentSort={sortKey} dir={sortDir} onSort={handleSort} align="right" className="col-contextWindow" />
                <Th label="Intel." sortKey="intelligenceIndex" currentSort={sortKey} dir={sortDir} onSort={handleSort} align="right" className="col-intelligenceIndex" />
                <Th label="Coding" sortKey="codingIndex" currentSort={sortKey} dir={sortDir} onSort={handleSort} align="right" className="col-codingIndex" />
                <Th label="Agentic" sortKey="agenticIndex" currentSort={sortKey} dir={sortDir} onSort={handleSort} align="right" className="col-agenticIndex" />
                <Th label="Vel." sortKey="speedTps" currentSort={sortKey} dir={sortDir} onSort={handleSort} align="right" className="col-speedTps" />
                <Th label="TTFT" sortKey="ttftMs" currentSort={sortKey} dir={sortDir} onSort={handleSort} align="right" className="col-ttftMs" />
                <Th label="Elo" sortKey="elo" currentSort={sortKey} dir={sortDir} onSort={handleSort} align="right" className="col-elo" />
                <Th label="Confianza" className="col-eloCi" />
                <Th label="Cutoff" className="col-knowledgeCutoff" />
                <Th label="Params" className="col-hfParameters" />
                <Th label="Capacidades" className="col-capabilities" />
                <Th label="Confiab." align="center" tooltip="Confiabilidad de producción (ZeroEval): 🟢 ≥95% · 🟡 ≥85% · 🔴 <85% — basado en failure rate de llamadas reales monitoreadas" className="col-reliability" onClickGlossary={() => openGlossary("Confiabilidad ZeroEval")} />
                <Th className="col-hfHealth" label={<span className="inline-flex items-center gap-1"><Stethoscope className="h-3 w-3" /> Repo</span>} tooltip="Salud del repositorio HuggingFace. ✓ activo · ⚠ gated · ✗ disabled" onClickGlossary={() => openGlossary("Salud del Repo")} />
                <Th className="col-hfDownloads" label={<span className="inline-flex items-center gap-1"><Download className="h-3 w-3" /> DL <Flame className="h-3 w-3" /></span>} sortKey="hfDownloads" currentSort={sortKey} dir={sortDir} onSort={handleSort} align="right" tooltip="Descargas acumuladas + trending (velocidad reciente)" onClickGlossary={() => openGlossary("Descargas HF")} />
                <Th className="col-hfLikes" label={<span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" /> LK</span>} sortKey="hfLikes" currentSort={sortKey} dir={sortDir} onSort={handleSort} align="right" tooltip="Likes en HuggingFace Hub (señal de calidad)" onClickGlossary={() => openGlossary("Likes HF")} />
                <Th label={<span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Ficha</span>} tooltip="Ver ficha técnica completa (HuggingFace): spaces, model-index, chat_template, sha, usedStorage, library_name" />
                <Th label="Comp." />
              </tr>
            </thead>
            <tbody>
              {topSpacer > 0 && (
                <tr aria-hidden style={{ height: topSpacer }}>
                  <td colSpan={COLUMN_COUNT} style={{ height: topSpacer, padding: 0, border: "none", lineHeight: 0, fontSize: 0 }} />
                </tr>
              )}
              {visibleModels.map((m) => (
                <ModelRow
                  key={m.id}
                  model={m}
                  currency={currencyMeta}
                  inCompare={compareIds.includes(m.id)}
                  onToggleCompare={toggleCompare}
                  canAddCompare={compareIds.length < 4}
                  onOpenFichaTecnica={handleOpenFichaTecnica}
                  onOpenSuccessorFicha={handleOpenSuccessorFicha}
                />
              ))}
              {bottomSpacer > 0 && (
                <tr aria-hidden style={{ height: bottomSpacer }}>
                  <td colSpan={COLUMN_COUNT} style={{ height: bottomSpacer, padding: 0, border: "none", lineHeight: 0, fontSize: 0 }} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {sortedModels.length === 0 && (<div className="text-center py-12 text-sm text-[var(--text-secondary)]">Ningún modelo coincide con los filtros.</div>)}

      {/* Ficha Técnica modal — Funciones D + E (lazy-load from /api/hf-model) */}
      {fichaTecnicaModelId && data && (
        <FichaTecnicaModal
          model={data.models.find((m) => m.id === fichaTecnicaModelId) ?? null}
          onClose={handleCloseFichaTecnica}
        />
      )}
    </div>
  );
}

// ============ FILTER PANEL (memoized, draft state) ============

interface FilterPanelProps {
  appliedFilters: FilterState;
  providers: string[];
  onApply: (f: FilterState) => void;
  onReset: () => void;
  onLiveSearch: (s: string) => void;
  capabilitiesLogic: "and" | "or";
  onCapabilitiesLogicChange: (l: "and" | "or") => void;
}

const ProviderMultiSelect = ({ providers, selected, onChange }: { providers: string[], selected: string[], onChange: (s: string[]) => void }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = providers.filter(p => p.toLowerCase().includes(search.toLowerCase()));
  
  return (
    <div className="relative w-full">
      <Button 
        variant="outline" 
        className="w-full justify-between h-8 text-xs bg-[var(--bg-elevated)]"
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">
          {selected.length === 0 ? "Todos los proveedores" : `${selected.length} seleccionados`}
        </span>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 w-full sm:w-64 z-50 rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-md p-2">
            <Input 
              placeholder="Buscar proveedor..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="h-7 text-xs mb-2 bg-[var(--bg-overlay)] border-none" 
            />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filtered.map(p => {
                const isActive = selected.includes(p);
                return (
                  <label key={p} className="flex items-center gap-2 text-xs p-1 hover:bg-[var(--bg-overlay)] rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isActive} 
                      onChange={() => onChange(isActive ? selected.filter(x => x !== p) : [...selected, p])} 
                      className="accent-[var(--brand-accent)]"
                    />
                    {p}
                  </label>
                );
              })}
              {filtered.length === 0 && <div className="text-xs text-[var(--text-secondary)] p-1">No hay resultados</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const FilterPanel = memo(function FilterPanel({
  appliedFilters, providers, onApply, onReset, onLiveSearch, capabilitiesLogic, onCapabilitiesLogicChange,
}: FilterPanelProps) {
  const [draft, setDraft] = useState<FilterState>(appliedFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const update = useCallback((patch: Partial<FilterState>) => { setDraft((prev) => ({ ...prev, ...patch })); }, []);

  // ----- Live search: useDeferredValue keeps the input responsive while the
  // expensive filter + sort + virtualization runs in the background. A 300ms
  // debounce prevents spamming the store on every keystroke. (gap P2A-TABLA)
  const deferredSearch = useDeferredValue(draft.search);
  useEffect(() => {
    if (deferredSearch === appliedFilters.search) return;
    const t = setTimeout(() => onLiveSearch(deferredSearch), 300);
    return () => clearTimeout(t);
  }, [deferredSearch, appliedFilters.search, onLiveSearch]);

  const pendingCount = useMemo(() => {
    let c = 0;
    // NOTE: search is excluded — it's applied live via onLiveSearch.
    if (draft.maxPrice !== appliedFilters.maxPrice) c++;
    if (draft.minIntelligence !== appliedFilters.minIntelligence) c++;
    if (draft.minContext !== appliedFilters.minContext) c++;
    if (draft.minSpeed !== appliedFilters.minSpeed) c++;
    if (draft.minEloVotes !== appliedFilters.minEloVotes) c++;
    if (draft.maxEloCi !== appliedFilters.maxEloCi) c++;
    if ((draft.hardwareFilterVram ?? 0) !== (appliedFilters.hardwareFilterVram ?? 0)) c++;
    if ((draft.minReliability ?? 0) !== (appliedFilters.minReliability ?? 0)) c++;
    if ((draft.minBenchLmScore ?? 0) !== (appliedFilters.minBenchLmScore ?? 0)) c++;
    if ((draft.hideAbandoned ?? false) !== (appliedFilters.hideAbandoned ?? false)) c++;
    if ((draft.architecture ?? "all") !== (appliedFilters.architecture ?? "all")) c++;
    if (draft.minKnowledgeCutoff !== appliedFilters.minKnowledgeCutoff) c++;
    if (JSON.stringify([...draft.providers].sort()) !== JSON.stringify([...appliedFilters.providers].sort())) c++;
    if (JSON.stringify([...draft.capabilities].sort()) !== JSON.stringify([...appliedFilters.capabilities].sort())) c++;
    return c;
  }, [draft, appliedFilters]);

  const [savedFilters, setSavedFilters] = useState<{name:string;filters:FilterState}[]>(() => {
    try { const r = localStorage.getItem("ai-dashboard-saved-filters"); return r ? JSON.parse(r) : []; } catch { return []; }
  });
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);

  const handleSave = useCallback(() => {
    if (!filterName.trim()) return;
    const ns = [...savedFilters, { name: filterName.trim(), filters: draft }];
    setSavedFilters(ns);
    try { localStorage.setItem("ai-dashboard-saved-filters", JSON.stringify(ns)); } catch {}
    setFilterName(""); setShowSaveInput(false);
  }, [filterName, draft, savedFilters]);

  const handleLoad = useCallback((s: {name:string;filters:FilterState}) => { setDraft(s.filters); onApply(s.filters); setShowSavedDropdown(false); }, [onApply]);
  const handleDelete = useCallback((name: string) => { const ns = savedFilters.filter((f) => f.name !== name); setSavedFilters(ns); try { localStorage.setItem("ai-dashboard-saved-filters", JSON.stringify(ns)); } catch {} }, [savedFilters]);

  // Capabilities multi-select helpers (gap #14).
  const toggleCapability = useCallback((key: keyof Capabilities) => {
    setDraft((prev) => {
      const has = prev.capabilities.includes(key);
      const nextCaps = has ? prev.capabilities.filter((c) => c !== key) : [...prev.capabilities, key];
      return {
        ...prev,
        capabilities: nextCaps,
        // Keep legacy quick-toggle booleans in sync (for saved-filter compat).
        reasoningOnly: key === "reasoning" ? !has : prev.reasoningOnly,
        extendedThinkingOnly: key === "extendedThinking" ? !has : prev.extendedThinkingOnly,
      };
    });
  }, []);

  return (
    <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
      <CardContent className="px-3 pt-1.5 pb-1.5">
        {/* === FILTROS BÁSICOS === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] flex justify-between"><span>Búsqueda</span></label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <Input value={draft.search} onChange={(e) => update({ search: e.target.value })} placeholder="Nombre, proveedor… (en vivo)" className="h-7 pl-8 text-xs bg-[var(--bg-elevated)]" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] flex justify-between"><span>Precio blended máx.</span></label>
            <div className="flex items-center justify-between space-x-4">
            <Slider 
              min={0} 
              max={1000} 
              step={5} 
              value={[draft.maxPrice]} 
              onValueChange={([val]) => update({ maxPrice: val })} 
              className="flex-1" 
            />
            <span className="text-[var(--text-primary)] font-mono text-xs w-8 text-right shrink-0">
              {draft.maxPrice === 1000 ? '∞' : `$${draft.maxPrice}`}
            </span>
          </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] flex justify-between"><span>Intelligence mín.</span></label>
            <div className="flex items-center justify-between space-x-4">
            <Slider 
              min={0} 
              max={100} 
              step={5} 
              value={[draft.minIntelligence]} 
              onValueChange={([val]) => update({ minIntelligence: val })} 
              className="flex-1" 
            />
            <span className="text-[var(--text-primary)] font-mono text-xs w-8 text-right shrink-0">
              {draft.minIntelligence === 0 ? '-' : draft.minIntelligence}
            </span>
          </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] flex justify-between"><span>Contexto mín.</span></label>
            <div className="flex items-center justify-between space-x-4">
              <Slider 
                min={0} 
                max={2000000} 
                step={16000} 
                value={[draft.minContext]} 
                onValueChange={([val]) => update({ minContext: val })} 
                className="flex-1" 
              />
              <span className="text-[var(--text-primary)] font-mono text-xs w-14 text-right shrink-0">
                {draft.minContext === 0 ? '-' : formatContext(draft.minContext)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2 mt-2">
          <div className="space-y-1">
             <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] flex justify-between"><span>Proveedores</span></label>
             <ProviderMultiSelect providers={providers} selected={draft.providers} onChange={(s) => update({ providers: s })} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] flex justify-between"><span>Cutoff mínimo</span></label>
            <input type="month" value={draft.minKnowledgeCutoff} onChange={(e) => update({ minKnowledgeCutoff: e.target.value })} className="h-7 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]" />
          </div>
        </div>

        {/* CAPABILITIES multi-select (Básico) */}
        <div className="mt-2 pt-2 border-t border-[var(--border-default)]">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-medium">
              Capacidades {draft.capabilities.length > 0 && <span className="num text-[var(--brand-primary)]">({draft.capabilities.length})</span>}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[var(--text-secondary)]">Lógica:</span>
              <button
                onClick={() => onCapabilitiesLogicChange("and")}
                className={cn("rounded px-2 py-0.5 text-[10px] border transition-colors", capabilitiesLogic === "and" ? "bg-[var(--brand-primary-subtle)] border-[var(--brand-primary)] text-[var(--brand-primary)]" : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}
                title="El modelo debe tener TODAS las capacidades seleccionadas"
              >Todas (AND)</button>
              <button
                onClick={() => onCapabilitiesLogicChange("or")}
                className={cn("rounded px-2 py-0.5 text-[10px] border transition-colors", capabilitiesLogic === "or" ? "bg-[var(--brand-primary-subtle)] border-[var(--brand-primary)] text-[var(--brand-primary)]" : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}
                title="El modelo debe tener AL MENOS UNA de las capacidades seleccionadas"
              >Cualquiera (OR)</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTER_CAPABILITY_ITEMS.map((item) => {
              const checked = draft.capabilities.includes(item.key);
              const Icon = item.icon;
              return (
                <label key={item.key} className={cn("flex items-center gap-1.5 cursor-pointer text-xs rounded-md px-2 py-1 border transition-colors", checked ? "bg-[var(--brand-primary-subtle)] border-[var(--brand-primary)] text-[var(--brand-primary)]" : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}>
                  <input type="checkbox" checked={checked} onChange={() => toggleCapability(item.key)} className="accent-[var(--brand-accent)]" />
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.label}</span>
                </label>
              );
            })}
          </div>

        </div>

        {/* Toggle Avanzado */}
        <div className="mt-1 flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]" 
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Ocultar filtros avanzados" : "Mostrar filtros avanzados"}
            <ChevronDown className={cn("ml-1 h-3 w-3 transition-transform", showAdvanced && "rotate-180")} />
          </Button>
        </div>

        {/* === FILTROS AVANZADOS === */}
        {showAdvanced && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-3 mt-1 pt-2 border-t border-[var(--border-default)]">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] flex justify-between" title="Velocidad de generación en tokens por segundo (basado en benchmarks)"><span>Velocidad mín. <span className="cursor-help opacity-50">(?)</span></span></label>
                <div className="flex items-center justify-between space-x-4">
                  <Slider min={0} max={100} step={5} value={[draft.minSpeed]} onValueChange={([val]) => update({ minSpeed: val })} className="flex-1" />
                  <span className="text-[var(--text-primary)] font-mono text-xs w-8 text-right shrink-0">{draft.minSpeed === 0 ? '-' : draft.minSpeed}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] flex justify-between" title="Número mínimo de batallas evaluadas en Chatbot Arena"><span>Votos Elo mín. <span className="cursor-help opacity-50">(?)</span></span></label>
                <div className="flex items-center justify-between space-x-4">
                  <Slider min={0} max={100000} step={1000} value={[draft.minEloVotes]} onValueChange={([val]) => update({ minEloVotes: val })} className="flex-1" />
                  <span className="text-[var(--text-primary)] font-mono text-xs w-10 text-right shrink-0">{draft.minEloVotes === 0 ? '-' : `${(draft.minEloVotes/1000).toFixed(0)}k`}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] flex justify-between" title="Margen de error del puntaje Elo (menor = más confiable)"><span>Confianza Elo máx. (±) <span className="cursor-help opacity-50">(?)</span></span></label>
                <div className="flex items-center justify-between space-x-4">
                  <Slider min={3} max={30} step={1} value={[draft.maxEloCi]} onValueChange={([val]) => update({ maxEloCi: val })} className="flex-1" />
                  <span className="text-[var(--text-primary)] font-mono text-xs w-8 text-right shrink-0">{draft.maxEloCi >= 30 ? '-' : `±${draft.maxEloCi}`}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] flex justify-between" title="Filtra modelos por reliability = 1 − failure_rate (ZeroEval). Modelos sin datos se tratan como 95% (baseline).">
                  <span>ZeroEval mín. <span className="cursor-help opacity-50">(?)</span></span>
                </label>
                <div className="flex items-center justify-between space-x-4">
                  <Slider min={0} max={99} step={1} value={[draft.minReliability ?? 0]} onValueChange={([val]) => update({ minReliability: val })} className="flex-1" />
                  <span className="text-[var(--text-primary)] font-mono text-xs w-10 text-right shrink-0">{(draft.minReliability ?? 0) === 0 ? '-' : `≥${(draft.minReliability ?? 0)}%`}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] flex justify-between" title="Excluye modelos cuyo cálculo en cuantización agresiva aún supera tu VRAM.">
                  <span>Hardware (VRAM) <span className="cursor-help opacity-50">(?)</span></span>
                </label>
                <select
                  value={String(draft.hardwareFilterVram ?? 0)}
                  onChange={(e) => update({ hardwareFilterVram: Number(e.target.value) })}
                  className="w-full h-7 rounded border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="0">— Filtro desactivado —</option>
                  <option value="8">8 GB (RTX 3060/4060)</option>
                  <option value="12">12 GB (RTX 3060 12GB)</option>
                  <option value="16">16 GB (RTX 4060 Ti)</option>
                  <option value="24">24 GB (RTX 3090/4090)</option>
                  <option value="48">48 GB (A6000)</option>
                  <option value="80">80 GB (A100/H100)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] flex justify-between">
                  <span>BenchLM mín.</span>
                </label>
                <div className="flex items-center justify-between space-x-4">
                  <Slider min={0} max={90} step={5} value={[draft.minBenchLmScore ?? 0]} onValueChange={([val]) => update({ minBenchLmScore: val })} className="flex-1" />
                  <span className="text-[var(--text-primary)] font-mono text-xs w-10 text-right shrink-0">{(draft.minBenchLmScore ?? 0) === 0 ? '-' : `≥${(draft.minBenchLmScore ?? 0)}`}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] flex justify-between">
                  <span>Arquitectura</span>
                </label>
                <select
                  value={draft.architecture ?? "all"}
                  onChange={(e) => update({ architecture: e.target.value as "all" | "dense" | "moe" })}
                  className="w-full h-7 rounded border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="all">Todas</option>
                  <option value="dense">Solo Denso</option>
                  <option value="moe">Solo MoE</option>
                </select>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="flex items-center gap-2 h-7 cursor-pointer text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  <input
                    type="checkbox"
                    checked={draft.hideAbandoned ?? false}
                    onChange={(e) => update({ hideAbandoned: e.target.checked })}
                    className="accent-[var(--brand-accent)] h-3.5 w-3.5 rounded border-[var(--border-default)] bg-[var(--bg-elevated)]"
                  />
                  Ocultar modelos obsoletos/abandonados
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-1 flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-default)]">
          <div className="flex items-center gap-2 flex-wrap">
            {pendingCount > 0 ? <Badge className="bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning-border)] text-xxs">{pendingCount} cambio{pendingCount !== 1 ? "s" : ""} sin aplicar</Badge> : <span className="flex items-center gap-1 text-xxs text-[var(--color-success)]"><CheckCircle2 className="h-3 w-3" />Filtros aplicados</span>}
            <Button variant="ghost" size="sm" onClick={() => { setDraft(DEFAULT_FILTERS); onReset(); }} className="h-7 text-xs"><RotateCcw className="h-3 w-3" />Restablecer</Button>
            {showSaveInput ? (
              <div className="flex items-center gap-1"><input type="text" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="Nombre de vista" className="h-7 w-28 rounded-md border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-2 text-xs outline-none focus:border-[var(--brand-primary)]" onKeyDown={(e) => e.key === "Enter" && handleSave()} autoFocus /><Button size="sm" onClick={handleSave} className="h-7 px-2 text-xs bg-[var(--color-success)] text-white"><Check className="h-3 w-3" /></Button><Button size="sm" variant="ghost" onClick={() => setShowSaveInput(false)} className="h-7 px-2 text-xs"><X className="h-3 w-3" /></Button></div>
            ) : <Button variant="ghost" size="sm" onClick={() => setShowSaveInput(true)} className="h-7 text-xs"><Star className="h-3 w-3" />Guardar</Button>}
            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => setShowSavedDropdown(!showSavedDropdown)} className="h-7 text-xs"><FolderOpen className="h-3 w-3" />Vistas ({savedFilters.length})</Button>
              {showSavedDropdown && (
                <div className="absolute bottom-full mb-1 left-0 w-48 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-lg z-50 max-h-64 overflow-y-auto">
                  {savedFilters.length === 0 ? <div className="px-3 py-2 text-xs text-[var(--text-secondary)]">Sin vistas guardadas</div> : savedFilters.map((sf) => (<div key={sf.name} className="flex items-center justify-between hover:bg-[var(--bg-overlay)] group"><button onClick={() => handleLoad(sf)} className="flex-1 text-left px-3 py-2 text-xs">{sf.name}</button><button onClick={() => handleDelete(sf.name)} className="px-2 py-2 text-[var(--text-disabled)] hover:text-[var(--color-error)] opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button></div>))}
                </div>
              )}
            </div>
          </div>
          <Button size="sm" onClick={() => onApply(draft)} disabled={pendingCount === 0} className="h-8 bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-white disabled:opacity-40"><CheckCircle2 className="h-3.5 w-3.5" />Aplicar filtros</Button>
        </div>
      </CardContent>
    </Card>
  );
});

// ============ MODEL ROW (memoized with custom comparison) ============

interface ModelRowProps {
  model: AIModel;
  currency: CurrencyRate;
  inCompare: boolean;
  onToggleCompare: (id: string) => void;
  canAddCompare: boolean;
  onOpenFichaTecnica?: (modelId: string) => void;
  // Función K — opens the Ficha Técnica modal of the BenchLM successor model
  // (looked up by slug). Optional — when undefined, the "Reemplazado por" badge
  // is shown as a static tooltip instead of a clickable element.
  onOpenSuccessorFicha?: (slug: string) => void;
}

// Custom comparison: only re-render when the model identity, compare state, or
// currency changes. Filter-relevant props (search/capabilities) are captured
// upstream in the visibleModels slice, so we don't need to re-check them here.
function modelRowPropsAreEqual(prev: ModelRowProps, next: ModelRowProps): boolean {
  return (
    prev.model.id === next.model.id &&
    prev.inCompare === next.inCompare &&
    prev.canAddCompare === next.canAddCompare &&
    prev.currency.code === next.currency.code &&
    prev.model === next.model // referential equality — sortedModels is rebuilt on filter change
  );
}

const ModelRow = memo(function ModelRow({ model: m, currency, inCompare, onToggleCompare, canAddCompare, onOpenFichaTecnica, onOpenSuccessorFicha }: ModelRowProps) {
  const [copied, setCopied] = useState(false);
  const blended = computeBlendedUsd(m);
  const handleCopy = useCallback(async () => { try { await navigator.clipboard.writeText(m.name); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} }, [m.name]);
  const fmtPrice = (v: number | null) => v === null ? "—" : formatPrice(v, currency);

  return (
    <tr
      className="group cursor-pointer"
      onDoubleClick={() => onOpenFichaTecnica?.(m.id)}
      title="Doble click para ver ficha técnica"
    >
      <td className="sticky left-0 z-10 bg-[var(--bg-surface)] group-hover:bg-[var(--bg-overlay)] transition-colors">
        <div className="flex items-center gap-2 min-w-[180px]">
          <ProviderLogo model={m} size={24} />
          <div className="min-w-0">
            <button onClick={handleCopy} className="flex items-center gap-1 text-left hover:text-[var(--brand-primary)] transition-colors" title="Copiar nombre">
              <span className="text-sm font-medium truncate">{m.name}</span>
              {/* PRD Col 6 — cache badge (gap #8): show 💾 when prompt caching is available */}
              {m.priceCacheHitUsd != null && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center justify-center translate-y-[2px]">
                        <Save className="h-3.5 w-3.5 text-[var(--brand-primary)] opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Caching de prompts disponible (cache hit)
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {copied ? <Check className="h-3 w-3 text-[var(--color-success)]" /> : <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 text-[var(--text-secondary)]" />}
            </button>
            <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1 flex-wrap">
              <span className="truncate">{m.provider}</span>
              {/* Función K — BenchLM superseded-by / canonical-entry badge */}
              {m.benchlmSupersededBy ? (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenSuccessorFicha) onOpenSuccessorFicha(m.benchlmSupersededBy!);
                        }}
                        className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-xxs leading-tight cursor-help transition-colors"
                        style={{
                          backgroundColor: "rgba(245, 166, 35, 0.10)",
                          color: "var(--color-warning)",
                          border: "1px solid rgba(245, 166, 35, 0.20)",
                        }}
                        aria-label={`Reemplazado por ${m.benchlmSupersededByName ?? "modelo más nuevo"}`}
                        title={`Reemplazado por ${m.benchlmSupersededByName ?? "modelo más nuevo"}${onOpenSuccessorFicha ? " — click para ver ficha técnica" : ""}`}
                      >
                        <span className="h-1 w-1 rounded-full" style={{ backgroundColor: "var(--color-warning)" }} aria-hidden />
                        Reemplazado{m.benchlmSupersededByName ? ` por ${m.benchlmSupersededByName}` : ""}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[220px]">
                      <div className="font-medium">Reemplazado por modelo más nuevo</div>
                      <div className="text-xxs opacity-80">
                        BenchLM marca este modelo como reemplazado por
                        {" "}{m.benchlmSupersededByName ?? m.benchlmSupersededBy}
                        {onOpenSuccessorFicha ? ". Click para abrir la ficha técnica del sucesor." : "."}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : m.benchlmIsCanonicalEntry === true ? (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-xxs leading-tight cursor-help"
                        style={{
                          backgroundColor: "var(--color-success-bg)",
                          color: "var(--color-success)",
                          border: "1px solid var(--color-success-border)",
                        }}
                        aria-label="Vigente — entrada canónica según BenchLM"
                        title="Vigente — entrada canónica según BenchLM"
                      >
                        <span className="h-1 w-1 rounded-full" style={{ backgroundColor: "var(--color-success)" }} aria-hidden />
                        Vigente
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[220px]">
                      <div className="font-medium">Entrada canónica</div>
                      <div className="text-xxs opacity-80">
                        BenchLM confirma que este modelo es la versión vigente de su familia.
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null}
            </div>
          </div>
        </div>
      </td>
      <td className="col-intelligenceIndex text-right num font-medium" style={blended === 0 ? { color: "var(--color-success)" } : undefined}>
        {blended === 0 ? "Gratis" : <BlendedCell model={m} blended={blended} currency={currency} />}
      </td>
      <td className="text-right num text-[var(--text-secondary)]">{blended > 0 && m.intelligenceIndex ? (blended / m.intelligenceIndex).toFixed(3) : "—"}</td>
      <td className="col-contextWindow text-right num text-[var(--text-secondary)]">{formatContext(m.orContextLength ?? m.contextWindow)}</td>
      <td className="text-right num font-semibold" style={{ color: getIntelligenceColor(m.intelligenceIndex) }}>{m.intelligenceIndex?.toFixed(1) ?? "—"}</td>
      <td className="col-codingIndex text-right num">{m.codingIndex?.toFixed(1) ?? "—"}</td>
      <td className="col-agenticIndex text-right num">{m.agenticIndex?.toFixed(1) ?? "—"}</td>
      <td className="col-speedTps text-right num">{m.speedTps ?? "—"}</td>
      <td className="col-ttftMs text-right num text-[var(--text-secondary)]"><TtftCell ttftMs={m.ttftMs} ttftAnswerMs={m.ttftAnswerMs ?? null} endToEndMs={m.endToEndMs ?? null} /></td>
      <td className="col-elo text-right">{m.elo ? (<TooltipProvider delayDuration={200}><Tooltip><TooltipTrigger asChild><span className="num font-medium cursor-help" style={{ color: getEloColor(m.elo) }}>{m.elo}</span></TooltipTrigger><TooltipContent side="top" className="text-xs">{formatEloConfidence(m.elo, m.eloCi, m.eloVotes)}</TooltipContent></Tooltip></TooltipProvider>) : <span className="text-[var(--text-disabled)]">—</span>}</td>
      <td className="col-eloCi text-right num text-[var(--text-secondary)] text-[11px]">{m.eloCi ? `±${m.eloCi}` : "—"}{m.eloVotes ? <div className="text-xxs text-[var(--text-disabled)]">{formatVotes(m.eloVotes)} votos</div> : null}</td>
      <td className="col-knowledgeCutoff text-right num text-[var(--text-secondary)] text-[11px]">{m.orKnowledgeCutoff ?? m.knowledgeCutoff ?? "—"}</td>
      <td className="col-hfParameters text-right num text-[var(--text-secondary)] text-[11px]">
        {(() => {
          const fromHf = formatParamsFromNumber(m.hfParameters);
          const display = fromHf ?? m.parameters;
          return display ? <span>{display}{m.isMoE ? " MoE" : ""}</span> : <span className="text-[var(--text-disabled)]">—</span>;
        })()}
      </td>
      <td className="col-capabilities"><CapabilityIcons model={m} effectiveCaps={getEffectiveCapabilities(m)} /></td>
      {/* Confiab. — ZeroEval production reliability dot (Función K, Phase 4A.1.a) */}
      <td className="col-reliability text-center">
        {m.zeroevalFailureRate != null ? (
          (() => {
            const reliability = 1 - m.zeroevalFailureRate!;
            const relPct = (reliability * 100).toFixed(1);
            const frPct = (m.zeroevalFailureRate! * 100).toFixed(1);
            const p95 = m.zeroevalP95Latency != null ? `${Math.round(m.zeroevalP95Latency)}ms` : "—";
            const n = m.zeroevalTotalCalls ?? 0;
            const dotColor =
              reliability >= 0.95 ? "var(--color-success)" :
              reliability >= 0.85 ? "var(--color-warning)" :
              "var(--color-error)";
            const dotLabel =
              reliability >= 0.95 ? "Confiabilidad alta" :
              reliability >= 0.85 ? "Confiabilidad media" :
              "Confiabilidad baja";
            const tooltipText = `Confiabilidad ZeroEval: ${relPct}% · Failure rate: ${frPct}% · P95: ${p95} · N llamadas: ${n}`;
            return (
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="inline-flex h-2.5 w-2.5 rounded-full cursor-help"
                      style={{ backgroundColor: dotColor }}
                      role="img"
                      aria-label={`${dotLabel}: ${relPct}% confiabilidad (${frPct}% failure rate, ${n} llamadas)`}
                      title={tooltipText}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[260px]">
                    <div className="font-semibold mb-0.5">{dotLabel}</div>
                    <div className="text-xxs opacity-80 space-y-0.5">
                      <div>Confiabilidad: <span className="num font-medium">{relPct}%</span></div>
                      <div>Failure rate: <span className="num font-medium">{frPct}%</span></div>
                      <div>P95 latencia: <span className="num font-medium">{p95}</span></div>
                      <div>Llamadas monitoreadas: <span className="num font-medium">{n.toLocaleString("es-PE")}</span></div>
                      <div className="opacity-70 italic">Fuente: ZeroEval (LLM Stats)</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })()
        ) : (
          <span className="text-[var(--text-disabled)] text-xxs" title="Sin datos de ZeroEval">—</span>
        )}
      </td>
      {/* Salud del Repo — HuggingFace health indicator (Función A: disabled, gated 3 estados, lastModified, createdAt + 18m threshold) */}
      <td className="col-hfHealth text-center">
        {m.hfDisabled !== null && m.hfDisabled !== undefined ? (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center justify-center cursor-help">
                  {m.hfDisabled === true ? (
                    <span className="h-2 w-2 rounded-full bg-[var(--color-error)]" />
                  ) : (m.hfGated as any) === "manual" ? (
                    <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
                  ) : isRepoStale(m.hfLastModified) ? (
                    <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[240px]">
                <div className="font-semibold mb-0.5">Salud del Repo HF</div>
                <div className="text-xxs opacity-80 space-y-0.5">
                  <div>
                    {m.hfDisabled === true ? "🚫 Deshabilitado por HF" :
                     (m.hfGated as any) === "manual" ? "🔒 Gated (aprobación manual)" :
                     (m.hfGated as any) === "auto" ? "🔐 Gated (auto-aprobado)" :
                     "✓ Operativo"}
                  </div>
                  {m.hfLastModified && (
                    <div>Actualizado: {formatRelativeDate(m.hfLastModified)}{isRepoStale(m.hfLastModified) ? " · ⚠ >18 meses" : ""}</div>
                  )}
                  {m.hfCreatedAt && (
                    <div>Creado: {formatRelativeDate(m.hfCreatedAt)}</div>
                  )}
                  {m.hfCreatedAt && m.hfLastModified && (
                    <div className="opacity-70">Vigencia: {formatVigencia(m.hfCreatedAt, m.hfLastModified)}</div>
                  )}
                  {m.hfInference && (
                    <div>Inference HF: {m.hfInference === "warm" ? "🔥 Disponible" : m.hfInference === "cold" ? "⏳ Cold start" : "—"}</div>
                  )}
                  {m.hfSpacesCount != null && m.hfSpacesCount > 0 && (
                    <div>Spaces: {m.hfSpacesCount} apps</div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-[var(--text-disabled)] text-xxs">—</span>
        )}
      </td>
      <td className="col-hfDownloads text-right num text-xs whitespace-nowrap">
        {m.hfDownloads != null ? (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help inline-flex items-center gap-0.5">
                  {formatCompact(m.hfDownloads)}
                  {m.hfTrendingScore != null && m.hfTrendingScore > 50 && (
                    <span title="En tendencia (alta velocidad reciente de adopción)">
                      <Flame className="h-3 w-3 text-[#ff7b00]" />
                    </span>
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[220px]">
                <div className="font-semibold mb-0.5">Adopción HF</div>
                <div className="text-xxs opacity-80 space-y-0.5">
                  <div>{m.hfDownloads.toLocaleString("es-PE")} descargas (acumulado)</div>
                  {m.hfTrendingScore != null && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" /> Trending score: {m.hfTrendingScore.toFixed(1)} {m.hfTrendingScore > 50 ? <span className="flex items-center gap-0.5 text-[#ff7b00]"><Flame className="h-3 w-3" /> (alta velocidad)</span> : "(velocidad normal)"}
                    </div>
                  )}
                  <div className="opacity-70 italic">Downloads = adopción acumulada · Trending = velocidad reciente</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : <span className="text-[var(--text-disabled)]">—</span>}
      </td>
      <td className="col-hfLikes text-right num text-xs whitespace-nowrap">
        {m.hfLikes != null ? formatCompact(m.hfLikes) : <span className="text-[var(--text-disabled)]">—</span>}
      </td>
      <td className="text-center">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => onOpenFichaTecnica?.(m.id)}
          title="Ver ficha técnica completa (HF)"
        >
          <FileText className="h-3.5 w-3.5" />
        </Button>
      </td>
      <td><Button size="sm" variant={inCompare ? "default" : "ghost"} className="h-7 w-7 p-0" onClick={() => onToggleCompare(m.id)} disabled={!inCompare && !canAddCompare} title={inCompare ? "Quitar" : "Comparar"}><GitCompareArrows className="h-3.5 w-3.5" /></Button></td>
    </tr>
  );
}, modelRowPropsAreEqual);

// ============ BLENDED CELL with cache tooltip (gap #8) ============

function BlendedCell({ model, blended, currency }: { model: AIModel; blended: number; currency: CurrencyRate }) {
  const hasCache = (model.priceCacheHitUsd != null && model.priceCacheHitUsd > 0) || (model.priceCacheWriteUsd != null && model.priceCacheWriteUsd > 0);
  const text = formatPricePerMillion(blended, currency);
  if (!hasCache) return <span>{text}</span>;

  const lines: React.ReactNode[] = [];
  lines.push(<div key="in">Input: {formatPricePerMillion(model.priceInputUsd, currency)}</div>);
  lines.push(<div key="out">Output: {formatPricePerMillion(model.priceOutputUsd, currency)}</div>);
  lines.push(<div key="bl">Blended (70/30): {formatPricePerMillion(blended, currency)}</div>);
  lines.push(<div key="sep" className="border-t border-[var(--border-default)] my-1" />);
  if (model.priceCacheHitUsd != null && model.priceCacheHitUsd > 0 && blended > 0) {
    const pct = ((blended - model.priceCacheHitUsd) / blended) * 100;
    lines.push(
      <div key="hit" style={{ color: "var(--color-success)" }}>
        Cache hit: {formatPricePerMillion(model.priceCacheHitUsd, currency)} ({pct.toFixed(0)}% más barato)
      </div>
    );
  }
  if (model.priceCacheWriteUsd != null && model.priceCacheWriteUsd > 0 && blended > 0) {
    const pct = ((model.priceCacheWriteUsd - blended) / blended) * 100;
    lines.push(
      <div key="wr" style={{ color: "var(--color-warning)" }}>
        Cache write: {formatPricePerMillion(model.priceCacheWriteUsd, currency)} ({pct.toFixed(0)}% más caro)
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{text}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {lines}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============ TTFT CELL with reasoning distinction (gap #9) ============

function TtftCell({ ttftMs, ttftAnswerMs, endToEndMs }: { ttftMs: number | null; ttftAnswerMs: number | null; endToEndMs: number | null }) {
  if (ttftMs == null) return <span className="text-[var(--text-disabled)]">—</span>;
  // Show dual values only when the model spends meaningful time "thinking"
  // before producing the first ANSWER token (>2x the time-to-first-token).
  const showDual = ttftAnswerMs != null && ttftAnswerMs > 2 * ttftMs;
  if (!showDual) {
    return <span>{formatMs(ttftMs)}</span>;
  }
  const thinkS = (ttftMs / 1000).toFixed(1);
  const answerS = (ttftAnswerMs! / 1000).toFixed(1);
  const totalPart = endToEndMs != null ? ` / Total (500 tok): ${(endToEndMs / 1000).toFixed(1)}s` : "";
  const tooltip = `Empieza a pensar: ${thinkS}s / Empieza a responder: ${answerS}s${totalPart}`;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help inline-flex flex-col items-end leading-tight">
            <span className="inline-flex items-center gap-0.5">
              <Zap className="h-2.5 w-2.5 text-[var(--brand-primary)]" />
              {formatMs(ttftMs)}
            </span>
            <span className="text-xxs inline-flex items-center gap-0.5" style={{ color: "var(--color-warning)" }}>
              <Brain className="h-2.5 w-2.5" />
              {formatMs(ttftAnswerMs!)}
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============ TH ============

function Th({ label, sortKey, currentSort, dir, onSort, align = "left", tooltip, onClickGlossary, sticky, className }: { label: React.ReactNode; sortKey?: SortKey; currentSort?: SortKey; dir?: SortDir; onSort?: (k: SortKey) => void; align?: "left" | "right" | "center"; tooltip?: string; onClickGlossary?: () => void; sticky?: boolean; className?: string; }) {
  const isSortable = !!sortKey; const isActive = sortKey === currentSort;
  const content = (
    <span className={cn("inline-flex items-center gap-1", align === "right" && "flex-row-reverse")}>
      {label}
      {isSortable && <span className="opacity-60">{isActive && dir === "asc" ? <ArrowUp className="h-3 w-3" /> : isActive && dir === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-40" />}</span>}
      {tooltip && <span className="text-[var(--text-disabled)] hover:text-[var(--brand-primary)] cursor-help" onClick={(e) => { e.stopPropagation(); onClickGlossary?.(); }}>ⓘ</span>}
    </span>
  );
  return (
    <th
      className={cn("whitespace-nowrap", isSortable && "cursor-pointer hover:text-[var(--text-primary)]", sticky && "sticky left-0 z-30 bg-[var(--bg-elevated)]", className)}
      onClick={() => isSortable && onSort?.(sortKey!)}
      style={{ textAlign: align }}
    >
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>{content}</span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs pointer-events-none flex flex-col gap-1.5">
            <div>{tooltip}</div>
            {onClickGlossary && (
              <div className="opacity-75 font-medium">Click ⓘ para más en el glosario</div>
            )}
          </TooltipContent>
        </Tooltip>
      ) : content}
    </th>
  );
}

// ============ HF REPO HEALTH HELPERS (Función A) ============

// 18-month threshold per MD Parte 6: "Badge amarillo si lastModified tiene más de 12 meses"
// (we use 18 months as the MD suggests in Parte 19 checklist as a calibration point)
const STALE_MONTHS = 18;

function isRepoStale(lastModified: string | null | undefined): boolean {
  if (!lastModified) return false;
  const d = new Date(lastModified);
  const monthsAgo = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return monthsAgo > STALE_MONTHS;
}

function formatRelativeDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "hoy";
  if (days < 7) return `hace ${days} días`;
  if (days < 30) return `hace ${Math.floor(days / 7)} semanas`;
  if (days < 365) return `hace ${Math.floor(days / 30)} meses`;
  return `hace ${Math.floor(days / 365)} años`;
}

// Distinguish "modelo nuevo sin updates" vs "modelo viejo con mantenimiento activo" vs "modelo abandonado"
function formatVigencia(createdAt: string, lastModified: string): string {
  const c = new Date(createdAt);
  const l = new Date(lastModified);
  const gapDays = (l.getTime() - c.getTime()) / (1000 * 60 * 60 * 24);
  const ageDays = (Date.now() - c.getTime()) / (1000 * 60 * 60 * 24);
  if (gapDays < 7 && ageDays < 60) return "Nuevo (sin updates aún)";
  if (gapDays < 30 && ageDays > 365) return "⚠ Posible abandono";
  if (ageDays > 365 && gapDays > 30) return "Viejo + mantenido ✓";
  return "Mantenido activamente";
}
