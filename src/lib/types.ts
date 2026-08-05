// ================================================================
// SELECTIA — Type Definitions
// Based on PRD v3.2 Master Table (21 columns) + 6 data sources
// ================================================================

export type LicenseType =
  | "commercial-open" // 🟢 Apache 2.0, MIT, BSD, CC BY 4.0
  | "conditional" // 🟡 Llama Community, Gemma Terms
  | "api-paid" // 🔴 OpenAI, Anthropic, Google Pro, xAI
  | "research-only" // ⚫ Solo Investigación
  | "open-source-full"; // 🔵 Open Source Completo

export type FreeAccessType =
  | "free-100" // 100% gratis
  | "free-limited" // gratis con límite
  | "free-registration" // gratis con registro/tarjeta
  | "paid-only"; // solo pago

export type ProfileId = "A" | "B" | "C" | "D" | "E" | "F";

export type CurrencyCode =
  | "PEN" | "USD" | "EUR" | "GBP"     // Originales
  | "BRL" | "MXN" | "COP" | "CLP" | "ARS" | "UYU" | "PYG" | "BOB" | "VES"  // LatAm
  | "GTQ" | "HNL" | "NIO" | "CRC" | "PAB" | "DOP" | "CUP"  // Centroamérica + Caribe
  | "CAD";  // Norteamérica

export type OperationMode = "mype" | "calidad" | "equilibrado" | "solo-gratis";

export type TaskCategory =
  | "redaccion"
  | "documentos"
  | "programacion"
  | "calculos"
  | "offline"
  | "rapidas"
  | "multilingue"
  | "agentes";

export interface Capabilities {
  toolUse: boolean;
  vision: boolean;
  jsonMode: boolean;
  reasoning: boolean;
  audioInput: boolean;
  audioOutput: boolean;
  pdf: boolean;
  webSearch: boolean;
  interleavedReasoning: boolean;
  extendedThinking: boolean;
}

export interface InferenceProvider {
  name: string;
  cheapest?: boolean;
  fastest?: boolean;
  offline?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  slug?: string;
  provider: string;
  providerDomain: string;
  providerColor: string;
  family: string;

  // License
  license: LicenseType;
  licenseName: string;

  // Pricing (USD per million tokens — base currency)
  priceInputUsd: number | null;
  priceOutputUsd: number | null;
  priceCacheHitUsd: number | null;
  priceCacheWriteUsd: number | null;

  // Context
  contextWindow: number;
  contextWindowSource?: "aa" | "or" | "litellm" | "arena" | "unknown" | null; // Fuente real del dato de contexto: null/undefined = no auditado; "unknown" = ninguna fuente lo reportó (default 8192 falso)
  maxOutput: number;

  // Benchmarks (Artificial Analysis)
  intelligenceIndex: number | null;
  codingIndex: number | null;
  agenticIndex: number | null;

  // Performance
  speedTps: number | null;
  ttftMs: number | null; // median_time_to_first_token_seconds * 1000 (when thinking STARTS)
  // Reasoning-model TTFT distinction (gap #9)
  ttftAnswerMs?: number | null; // median_time_to_first_answer_token_seconds * 1000 (when first ANSWER token appears, after thinking)
  endToEndMs?: number | null; // median_end_to_end_response_time_seconds * 1000 (total time for 500-token response)

  // Arena AI
  elo: number | null;
  eloCi: number | null;
  eloVotes: number | null;

  // Capabilities
  capabilities: Capabilities;

  // Metadata
  knowledgeCutoff: string | null; // "MMM YYYY"
  releaseDate: string | null; // ISO
  parameters: string | null; // "70B", "405B", "236B (MoE)"
  isMoE: boolean;

  // Access
  freeAccess: FreeAccessType;

  // Inference providers
  inferenceProviders: InferenceProvider[];

  // Open source
  openWeights: boolean;
  ollamaAvailable: boolean;

  // Status
  active: boolean;

  // HuggingFace Hub enrichment (replaces BigCode — full 25-field coverage)
  hfRepoId?: string | null;              // full HF ID (org/model) — populated by orchestrator when matched
  // Función A — Salud y Vigencia (lightweight, in main JSON)
  hfGated?: boolean | string | null;    // false | "manual" | "auto"
  hfDisabled?: boolean | null;          // HF disabled the repo
  hfLastModified?: string | null;       // ISO timestamp
  hfCreatedAt?: string | null;          // ISO timestamp
  // Función B — Termómetro de Adopción (lightweight, in main JSON)
  hfDownloads?: number | null;          // total downloads on HF (acumulado)
  hfLikes?: number | null;              // community likes (aprobación)
  hfTrendingScore?: number | null;      // velocidad reciente de adopción (via expand)
  // Función C — Calculadora de Hardware (lightweight, in main JSON)
  hfParameters?: number | null;         // exact param count from safetensors.total
  hfSafetensorsDetail?: Record<string, number> | null; // per-dtype breakdown {BF16: 32B, ...}
  hfTags?: string[] | null;             // tags array (for GGUF detection)
  hfHasGguf?: boolean | null;           // true if tags include "gguf" or siblings include .gguf
  hfSiblingsCount?: number | null;      // number of files in the repo
  hfGgufFiles?: string[] | null;        // names of .gguf files if any
  // Función D — Actividad del Ecosistema (lightweight count in main JSON; full array lazy-load)
  hfInference?: string | null;          // "warm" | "cold" | null
  hfSpacesCount?: number | null;        // count of HF Spaces using this model
  // Other HF fields (kept from prior schema)
  hfPipelineTag?: string | null;        // text-generation, fill-mask, etc.
  hfBaseModel?: string | null;          // parent model if fine-tune

  // Función D+E — Lazy-load only (NOT in main JSON — fetched on-demand via /api/hf-model)
  // These fields are heavy (spaces[] array, siblings[] array, model-index, chat_template,
  // widgetData, transformersInfo) and would bloat the JSON past the 500KB PRD limit.
  // They're populated ONLY when the user opens the Ficha Técnica modal.
  hfSpacesSample?: string[] | null;     // 3 sample Space names (lazy-load)
  hfModelIndex?: any | null;            // author-published benchmarks (lazy-load)
  hfWidgetData?: any[] | null;          // author-suggested prompt examples (lazy-load)
  hfChatTemplate?: string | null;       // exact Jinja prompt template (lazy-load)
  hfTransformersInfo?: { auto_model?: string; processor?: string } | null; // lazy-load
  hfSha?: string | null;                // commit hash for version pinning (lazy-load)
  hfUsedStorage?: number | null;        // bytes used in repo (lazy-load)
  hfLibraryName?: string | null;        // "transformers" | "diffusers" | etc. (lazy-load)

  // ============================================================
  // BenchLM enrichment (8 category scores + coverage + family + pricing extras)
  // Source: https://benchlm.ai/data/models.json (+ pricing.json for 2 fields)
  // Filled by applyBenchlmEnrichment() in orchestrator.ts after matching.
  // All fields optional — models that don't match BenchLM stay null and the
  // engine falls back to Artificial Analysis intelligenceIndex (graceful degradation).
  // ============================================================
  benchlmSlug?: string | null;                       // BenchLM slug (e.g. "claude-opus-4-8")
  benchlmDisplayScore?: number | null;               // 0-100 overall score
  benchlmOverallRank?: number | null;                // 1-based rank among rankingEligible models
  benchlmCategoryScores?: {                          // 8 category-specific scores (0-100, null if category not covered)
    agentic: number | null;
    coding: number | null;
    reasoning: number | null;
    multimodalGrounded: number | null;
    knowledge: number | null;
    multilingual: number | null;
    instructionFollowing: number | null;
    math: number | null;
  } | null;
  benchlmScoreConfidence?: number | null;            // 1-3 (1=few benchmarks, 3=many). Used by quality gate.
  benchlmTrustedBenchmarkCount?: number | null;      // count of trusted benchmarks verified
  benchlmReleaseDate?: string | null;                // ISO date from BenchLM

  // Función K — Ciclo de Vida del Modelo (Sección 4.6 del plan v2.0)
  // Source: family.supersedesModelKey + family.isCanonicalFamilyEntry from models.json
  // 34/272 models (12.5%) have supersedesModelKey != null — enough signal to implement.
  // When benchlmSupersededBy is set, this model has a newer variant in the same family.
  benchlmSupersededBy?: string | null;               // slug of the successor model (if any)
  benchlmSupersededByName?: string | null;           // display name of the successor (for the badge tooltip)
  benchlmIsCanonicalEntry?: boolean | null;          // true = this is the canonical/latest entry of its family

  // pricing.json — 2 specific fields (Sección 2.2 del plan v2.0)
  // NOT the full pricing.json (LiteLLM already covers that). Just these 2 non-price fields:
  benchlmScorePerOutputDollar?: number | null;       // quality score per output $ — cross-validates our efficiencyCost
  benchlmPricingNote?: string | null;                // citable context about the price source

  // ============================================================
  // ZeroEval enrichment (production reliability metrics)
  // Source: https://api.zeroeval.com/v1/models/metrics (130 items)
  // Matched by normalize(model_id) → normalize(model.name). ~16% of catalog has data.
  // All optional — when null, engine uses RELIABILITY_BASELINE = 0.95.
  // ============================================================
  zeroevalFailureRate?: number | null;               // 0-1 (e.g. 0.044 = 4.4% failure rate)
  zeroevalP95Latency?: number | null;                // milliseconds, p95 latency
  zeroevalAvgThroughput?: number | null;             // tokens/sec average
  zeroevalTotalCalls?: number | null;                // total calls monitored (confidence in the failure_rate)

  // ============================================================
  // OpenRouter enrichment
  // Source: https://openrouter.ai/api/v1/models (public, 367 models)
  // Matched by normalize(orId split('/')[1]) → normalize(model.name). ~50% coverage.
  // Pricing: stored as $/1M tokens (multiply raw $/token × 1_000_000).
  // All optional — never blocks TOPSIS (no criterion uses OR-exclusive fields).
  // ============================================================
  orModelId?: string | null;                 // "openai/gpt-4o" — canonical OR ID
  orCanonicalSlug?: string | null;           // "openai/gpt-4o-2024-11-20" — versioned slug
  orName?: string | null;                    // Display name from OR ("OpenAI: GPT-4o")
  orDescription?: string | null;             // Rich text description from OR
  orCreatedAt?: number | null;               // Unix timestamp of model release on OR
  orContextLength?: number | null;           // Context window per OR
  orMaxCompletion?: number | null;           // max_completion_tokens per OR top_provider
  orIsModerated?: boolean | null;            // Content moderation applied
  orInputPrice?: number | null;              // $/1M input tokens (prompt * 1_000_000)
  orOutputPrice?: number | null;             // $/1M output tokens (completion * 1_000_000)
  orCacheReadPrice?: number | null;          // $/1M cache read tokens
  orCacheWritePrice?: number | null;         // $/1M cache write tokens
  orWebSearchPrice?: number | null;          // $/web search (flat fee)
  orHuggingFaceId?: string | null;           // HF repo ID when OR knows it (152/367 have it)
  orKnowledgeCutoff?: string | null;         // "2024-04" — knowledge cutoff from OR
  orExpirationDate?: string | null;          // ISO date when model is deprecated
  orInputModalities?: string[] | null;       // ["text", "image", "video"]
  orOutputModalities?: string[] | null;      // ["text"]
  orTokenizer?: string | null;               // "GPT", "Qwen", etc.
  orInstructType?: string | null;            // "gpt", "llama", etc. or null
  orSupportedParameters?: string[] | null;   // ["temperature", "tools", ...]
  orReasoningMandatory?: boolean | null;     // true = always thinks before answering
  orReasoningDefaultEnabled?: boolean | null; // true = reasoning on by default
  orReasoningEfforts?: string[] | null;      // ["high", "medium", "low"] if variable
  orIsAlias?: boolean | null;               // true if this model is an alias to another
  orAliasTargetSlug?: string | null;        // slug of the model this alias points to
  orBenchmarksAaIntelligence?: number | null; // AA intelligence_index from OR benchmarks
  orBenchmarksAaCoding?: number | null;       // AA coding_index from OR benchmarks
  orBenchmarksAaAgentic?: number | null;      // AA agentic_index from OR benchmarks
}

export interface CurrencyRate {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromUsd: number; // multiply USD by this to get target
}

export interface SourceHealth {
  id: string;
  name: string;
  status: "green" | "yellow" | "red";
  latencyMs: number;
  lastSync: string;
  remaining?: number;
  limit?: number;
  tier?: string;
  note?: string;
}

// Commodity prices (metals.dev / others) — Phase 3 industrial context
export interface CommodityPrice {
  code: string; // "gold" | "silver" | "platinum" | "palladium" | "rhodium"
  name: string; // Spanish display name
  priceUsd: number; // USD per troy ounce
  unit: string; // "toz"
  changePct?: number; // 24h % change (optional)
}

// Metal suppliers in Peru (Nominatim / OpenStreetMap) — Phase 3 industrial context
export interface MetalSupplier {
  id: string;
  name: string;
  type: string; // shop, industrial_supplier, etc.
  city: string; // Lima | Arequipa | Chiclayo
  lat: number;
  lon: number;
  displayName: string;
  address?: string;
  countryCode?: string;
}

// Models.dev provider catalog (gap #4 — 19th data source)
// Feeds Profile C "Catálogo de Proveedores" ficha.
export interface ModelsDevProvider {
  id: string; // e.g. "openai"
  name: string; // e.g. "OpenAI"
  domain: string; // e.g. "openai.com"
  apiDocsUrl: string;
  keyPanelUrl: string;
  modelsCount: number;
}

// ============================================================
// BenchLM price-index series point (1 of 41 months)
// Source: https://benchlm.ai/data/price-index.json → series[]
// ============================================================
export interface PriceIndexPoint {
  month: string;                  // "2023-03" ... "2026-07"
  frontier: number | null;        // index value (base 2023-03 = 100), null if no data that month
  frontierMedian: number | null;  // median blended price USD/M tokens
  mid: number | null;
  midMedian: number | null;
  budget: number | null;
  budgetMedian: number | null;
}

// ============================================================
// BenchLM citable market statistic (1 of 28)
// Source: https://benchlm.ai/data/stats.json → items[]
// Each stat has an anchorUrl for citation in tooltips/banners.
// ============================================================
export interface BenchlmStat {
  statId: string;       // "frontier-price-drop", "releases-12mo", etc.
  label: string;        // short label
  value: string;        // "−88% (index: 12)"
  sentence: string;     // full citable sentence
  anchorUrl: string;    // https://benchlm.ai/stats/...#statId
}

export interface DashboardData {
  models: AIModel[];
  currencies: CurrencyRate[];
  exchangeRateProvider: string;
  exchangeRateUpdated: string;
  exchangeRateNextUpdate: string;
  sources: SourceHealth[];
  aaQuota: {
    limit: number;
    remaining: number;
    reset: string;
    tier: string;
    // 5th AA HTTP header (gap #3) — seconds to wait before retrying, present on 429 responses
    retryAfter?: number | null;
    // B3 — true cuando los headers x-ratelimit-* provienen de la respuesta real
    // de AA; false cuando se usó un fallback/seed (la UI no debe mostrar los
    // números como datos reales).
    quotaFromHeaders?: boolean;
  };
  generatedAt: string;
  arenaFetchedAt: string;
  arenaModelCount: number;
  // Phase 3 (RECREATE-1) — industrial context
  commodities?: CommodityPrice[];
  metalSuppliers?: MetalSupplier[];
  // Gap #4 — 19th data source (Models.dev provider catalog)
  modelsDevProviders?: ModelsDevProvider[];

  // ============================================================
  // BenchLM dashboard-level data (price history + citable stats + category coverage)
  // ============================================================
  // 41 months of LLM token price history (frontier/mid/budget index, base 2023-03=100)
  // Source: https://benchlm.ai/data/price-index.json → series[]
  priceIndex?: PriceIndexPoint[];
  // 28 citable market statistics (each with anchorUrl for attribution)
  // Source: https://benchlm.ai/data/stats.json → items[]
  benchlmStats?: BenchlmStat[];
  // Función L — per-category coverage counts (envelope of leaderboard.json, ~200 bytes)
  // Source: https://benchlm.ai/data/leaderboard.json → counts.categories
  // Shows how many rankingEligible models have data per category: {agentic:103, coding:101, ...}
  benchlmCategoryCoverage?: Record<string, number>;
}

// ================================================================
// Modo summary — payload ligero para las vistas Resumen y Analytics
// ================================================================
// El endpoint /api/dashboard?fields=summary devuelve solo estas claves
// por modelo (más el envoltorio DashboardSummary). Excluye los campos
// or* pesados (descripciones, precios por proveedor, etc.), benchlm*,
// zeroeval* y los hf* pesados (gated, safetensors, gguf, etc.) que las
// dos vistas no consumen. Única excepción: orInputModalities, el único
// campo or* que la vista Resumen usa de verdad (gráfico Modelos por
// Modalidad) y es barato (~3 KB). Si una vista necesita un campo nuevo,
// se agrega aquí y el pick se propaga al endpoint y a la proyección
// client-side.
export const SUMMARY_MODEL_PICK_KEYS = [
  "name",
  "id",
  "provider",
  "providerDomain",
  "providerColor",
  "family",
  "license",
  "licenseName",
  "priceInputUsd",
  "priceOutputUsd",
  "priceCacheHitUsd",
  "priceCacheWriteUsd",
  "contextWindow",
  "contextWindowSource",
  "maxOutput",
  "intelligenceIndex",
  "codingIndex",
  "agenticIndex",
  "speedTps",
  "ttftMs",
  "elo",
  "eloCi",
  "eloVotes",
  "capabilities",
  "knowledgeCutoff",
  "releaseDate",
  "parameters",
  "isMoE",
  "freeAccess",
  "inferenceProviders",
  "openWeights",
  "ollamaAvailable",
  "active",
  "hfRepoId",
  "hfDownloads",
  "hfLikes",
  // Único campo or* conservado: alimenta el gráfico "Modelos por Modalidad"
  // de la vista Resumen (arrays cortos de strings, ~3 KB en total).
  "orInputModalities",
] as const satisfies readonly (keyof AIModel)[];

export type SummaryAIModel = Pick<
  AIModel,
  (typeof SUMMARY_MODEL_PICK_KEYS)[number]
>;

export interface DashboardSummary {
  models: SummaryAIModel[];
  currencies: CurrencyRate[];
  exchangeRateProvider: string;
  exchangeRateUpdated: string;
  exchangeRateNextUpdate: string;
  sources: SourceHealth[];
  aaQuota: DashboardData["aaQuota"];
  generatedAt: string;
  arenaFetchedAt: string;
  // Series de 41 meses del índice de precios BenchLM (chart "Evolución de
  // Precios de LLMs" de Analytics) — opcional, igual que en DashboardData.
  priceIndex?: PriceIndexPoint[];
  // 28 estadísticas citables de mercado (panel "Titulares del Mercado" de
  // Resumen) — opcional, igual que en DashboardData.
  benchlmStats?: BenchlmStat[];
}

export interface HRETOPSISResult {
  model: AIModel;
  score: number; // 0-1 closeness
  rank: number;
  reasons: string[];
  metrics: {
    efficiencyCost: number;
    elo: number | null;
    intelligenceIndex: number | null;
    codingIndex: number | null;
    agenticIndex: number | null;
    speed: number | null;
    context: number;
    // 8th criterion (HRE-TOPSIS v3.3) — reliability from ZeroEval
    // 1 - zeroevalFailureRate when data exists; RELIABILITY_BASELINE (0.95) when null.
    reliability: number | null;
  };
}

export interface RecommendationResult {
  query: string;
  category: TaskCategory;
  categoryLabel: string;
  mode: OperationMode;
  detectedEntities: Record<string, boolean | number>;
  multiIntent?: { category: TaskCategory; weight: number }[];
  winners: HRETOPSISResult[];
  explanation: string;
  computationTimeMs: number;
}

export interface FilterState {
  search: string;
  providers: string[];
  licenses: LicenseType[];
  capabilities: string[];
  freeAccess: FreeAccessType | "all";
  maxPrice: number;
  minContext: number;
  minIntelligence: number;
  minSpeed: number;
  minKnowledgeCutoff: string;
  reasoningOnly: boolean;
  extendedThinkingOnly: boolean;
  minEloVotes: number;
  maxEloCi: number;
  // Filtro 13 — Cabe en Mi Hardware (Función C del MD de HuggingFace)
  // When hardwareFilterVram > 0, only show models that fit in that VRAM
  // at some quantization level (Q2_K or better). 0 = filter disabled.
  hardwareFilterVram?: number;
  // Filtro 14 — Confiabilidad mínima (ZeroEval)
  // When minReliability > 0, only show models with reliability >= minReliability.
  // Reliability = 1 - failure_rate (when ZeroEval has data) or 0.95 baseline (when null).
  // 0 = filter disabled. Range: 0 to 0.99 (0.95 = green, 0.85 = yellow, <0.85 = red).
  minReliability?: number;
  minBenchLmScore?: number;
  hideAbandoned?: boolean;
  architecture?: "all" | "dense" | "moe";
}
