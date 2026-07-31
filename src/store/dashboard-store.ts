"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ProfileId,
  CurrencyCode,
  OperationMode,
  FilterState,
} from "@/lib/types";

export interface ProfileMeta {
  id: ProfileId;
  name: string;
  role: string;
  icon: string;
  description: string;
  defaultMode: OperationMode;
  showCurrencySelector: boolean;
  // Layout hint for the Overview view — each profile renders a distinct
  // hero + KPI + cards layout inside the shared Resumen, instead of being
  // a separate nav item. Per PRD Parte 2: "El dashboard se adapta a quién
  // lo está usando. Cada perfil activa un conjunto específico de columnas,
  // gráficos y KPIs."
  overviewLayout: "search-cards" | "kpis-charts" | "pivot-legal" | "big-cards" | "budget" | "system";
  // When the user picks this profile, the sidebar collapses to only the
  // tools relevant to them (kept simple for now — all profiles still see
  // all tools, but the profile gates which Overview layout renders).
}

export const PROFILES: ProfileMeta[] = [
  {
    id: "A",
    name: "Ingeniero Industrial",
    role: "Usuario primario",
    icon: "HardHat",
    description: "Encuentra el modelo correcto en <30s para tareas cotidianas",
    defaultMode: "mype",
    showCurrencySelector: true,
    overviewLayout: "search-cards",
  },
  {
    id: "B",
    name: "Gerente de Planta",
    role: "Decisiones de inversión",
    icon: "Factory",
    description: "KPIs de costo y calidad en 20 segundos",
    defaultMode: "equilibrado",
    showCurrencySelector: true,
    overviewLayout: "kpis-charts",
  },
  {
    id: "C",
    name: "Consultor Supply Chain",
    role: "Entregables profesionales",
    icon: "Briefcase",
    description: "Propuestas exportables con confianza estadística",
    defaultMode: "calidad",
    showCurrencySelector: true,
    overviewLayout: "pivot-legal",
  },
  {
    id: "D",
    name: "TI / Sysadmin",
    role: "Visibilidad técnica total",
    icon: "ServerCog",
    description: "Salud del sistema, cuotas API, latencias",
    defaultMode: "mype",
    showCurrencySelector: true,
    overviewLayout: "system",
  },
  {
    id: "E",
    name: "Operario de Taller",
    role: "Computación básica / celular",
    icon: "Wrench",
    description: "3 tarjetas grandes y coloridas, cero tablas",
    defaultMode: "mype",
    showCurrencySelector: false,
    overviewLayout: "big-cards",
  },
  {
    id: "F",
    name: "Compras / Costos",
    role: "Control de presupuesto",
    icon: "Calculator",
    description: "Calculadora de costo proyectado y alertas",
    defaultMode: "equilibrado",
    showCurrencySelector: true,
    overviewLayout: "budget",
  },
];

// Profile-specific views (ingeniero/gerente/consultor/operario/compras) were
// REMOVED — per PRD Parte 2, profiles ADAPT the shared Resumen/Overview
// layout instead of being separate nav items. Selecting a profile in the
// header changes the Overview layout + KPIs + cards + default filters.
export type ViewId =
  | "overview"
  | "recomendador"
  | "tabla"
  | "calculadora"
  | "calculadora-hardware"
  | "comparador"
  | "salud"
  | "analytics"
  | "simulador-roi"
  | "qr-generator"
  | "engine-animation";

interface DashboardState {
  // User context
  profile: ProfileId;
  currency: CurrencyCode;
  operationMode: OperationMode;
  activeView: ViewId;
  // Custom exchange rate overrides — user can set their own TC (ej: MYPE que
  // cambia a S/.3.55 en vez del oficial S/.3.40). Persiste en localStorage.
  // Key = currency code (ej: "PEN"), Value = rate from USD (ej: 3.55).
  customExchangeRates: Record<string, number>;

  // Recommendation
  recommendationQuery: string;

  // Compare
  compareIds: string[];

  // Filters (for tabla view)
  filters: FilterState;
  // Capabilities multi-select logic (gap #14) — "and" = model must have
  // ALL selected capabilities, "or" = model must have ANY. Defaults to "and"
  // to preserve the prior behavior of reasoningOnly + extendedThinkingOnly
  // (which was implicit AND).
  capabilitiesLogic: "and" | "or";

  // Engine keyword auto-mode (gap #15 / P1B-ENGINE) — true when the user
  // explicitly toggled the operation mode via the UI, false when the mode
  // was auto-set by a profile switch. The recomendador view passes this to
  // recommend() as `{ manualModeOverride: modeManuallySet }` so the engine
  // knows whether keyword detection should still run.
  modeManuallySet: boolean;

  // Theme — 6 options: dark, light, dark-gray, light-gray, blanco-puro, negro-puro
  theme: "dark" | "light" | "dark-gray" | "light-gray" | "blanco-puro" | "negro-puro";

  // Modals
  glossaryOpen: boolean;
  glossaryInitialTerm: string | null;
  engineExplainedOpen: boolean;

  // Actions
  setProfile: (p: ProfileId) => void;
  setCurrency: (c: CurrencyCode) => void;
  setCustomExchangeRate: (code: string, rate: number) => void;
  resetExchangeRate: (code: string) => void;
  setOperationMode: (m: OperationMode) => void;
  setCapabilitiesLogic: (l: "and" | "or") => void;
  setActiveView: (v: ViewId) => void;
  setRecommendationQuery: (q: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  setFilters: (f: Partial<FilterState>) => void;
  resetFilters: () => void;
  toggleTheme: () => void;
  setTheme: (t: "dark" | "light" | "dark-gray" | "light-gray" | "blanco-puro" | "negro-puro") => void;
  openGlossary: (term?: string) => void;
  closeGlossary: () => void;
  openEngineExplained: () => void;
  closeEngineExplained: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  providers: [],
  licenses: [],
  capabilities: [],
  freeAccess: "all",
  maxPrice: 1000,
  minContext: 0,
  minIntelligence: 0,
  minSpeed: 0,
  minKnowledgeCutoff: "2020-01",
  reasoningOnly: false,
  extendedThinkingOnly: false,
  minEloVotes: 0,
  maxEloCi: 30,
  hardwareFilterVram: 0, // Filtro 13 disabled by default
  minReliability: 0,     // Filtro 14 disabled by default (0 = sin filtro)
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      profile: "A",
      currency: "PEN",
      customExchangeRates: {},
      operationMode: "mype",
      activeView: "overview",
      recommendationQuery: "",
      compareIds: [],
      filters: DEFAULT_FILTERS,
      capabilitiesLogic: "and",
      modeManuallySet: false,
      theme: "light-gray",
      glossaryOpen: false,
      glossaryInitialTerm: null,
      engineExplainedOpen: false,

      setProfile: (p) => {
        const meta = PROFILES.find((x) => x.id === p);
        const mode = meta?.defaultMode ?? "mype";
        const next: Partial<DashboardState> = {
          profile: p,
          operationMode: mode,
          // Profile switch auto-sets the mode → engine keyword detection
          // should still run (modeManuallySet = false).
          modeManuallySet: false,
        };
        // Per PRD Parte 2: the dashboard ADAPTS to the profile. The Resumen
        // (Overview) re-renders with profile-specific KPIs/cards/layout.
        //
        // Special case: Perfil F (Compras / Costos) — the user explicitly
        // requested that selecting this profile redirect to the Calculadora
        // view, because the Compras view (full cost table) is dominated by
        // free models ($0) and doesn't help with budget planning. The
        // Calculadora view lets the user pick a specific model, see the
        // detailed cost breakdown (input/output/blended/year), cache ROI,
        // and budget alerts — exactly what a Compras profile needs.
        // Free-model discovery is handled by Tabla Maestra filters.
        if (p === "F") {
          next.activeView = "calculadora";
        }
        if (meta && !meta.showCurrencySelector) {
          next.currency = "PEN";
        }
        set(next);
      },
      setCurrency: (c) => set({ currency: c }),
      setCustomExchangeRate: (code, rate) =>
        set((state) => ({
          customExchangeRates: { ...state.customExchangeRates, [code]: rate },
        })),
      resetExchangeRate: (code) =>
        set((state) => {
          const next = { ...state.customExchangeRates };
          delete next[code];
          return { customExchangeRates: next };
        }),
      // User explicitly toggled the mode → suppress engine keyword detection.
      setOperationMode: (m) => set({ operationMode: m, modeManuallySet: true }),
      setCapabilitiesLogic: (l) => set({ capabilitiesLogic: l }),
      setActiveView: (v) => set({ activeView: v }),
      setRecommendationQuery: (q) => set({ recommendationQuery: q }),
      toggleCompare: (id) => {
        const { compareIds } = get();
        if (compareIds.includes(id)) {
          set({ compareIds: compareIds.filter((x) => x !== id) });
        } else if (compareIds.length < 4) {
          set({ compareIds: [...compareIds, id] });
        }
      },
      clearCompare: () => set({ compareIds: [] }),
      setFilters: (f) => set({ filters: { ...get().filters, ...f } }),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),
      toggleTheme: () => {
        const order = ["light-gray", "dark", "light", "dark-gray", "blanco-puro", "negro-puro"] as const;
        const currentIdx = order.indexOf(get().theme);
        const next = order[(currentIdx + 1) % order.length];
        set({ theme: next });
        if (typeof document !== "undefined") {
          const root = document.documentElement;
          root.classList.remove("dark", "light", "dark-gray", "light-gray", "blanco-puro", "negro-puro");
          root.classList.add(next);
        }
      },
      setTheme: (t) => {
        set({ theme: t });
        if (typeof document !== "undefined") {
          const root = document.documentElement;
          root.classList.remove("dark", "light", "dark-gray", "light-gray", "blanco-puro", "negro-puro");
          root.classList.add(t);
        }
      },
      openGlossary: (term) =>
        set({ glossaryOpen: true, glossaryInitialTerm: term ?? null }),
      closeGlossary: () =>
        set({ glossaryOpen: false, glossaryInitialTerm: null }),
      openEngineExplained: () => set({ engineExplainedOpen: true }),
      closeEngineExplained: () => set({ engineExplainedOpen: false }),
    }),
    {
      name: "ai-dashboard-store",
      partialize: (state) => ({
        profile: state.profile,
        currency: state.currency,
        operationMode: state.operationMode,
        activeView: state.activeView,
        theme: state.theme,
        customExchangeRates: state.customExchangeRates,
      }),
    }
  )
);
