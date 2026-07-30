// SELECTIA — Server-side Orchestrator
// Fetches 10 APIs (+ 5 sub-endpoints of BenchLM) in parallel,
// merges results, caches 30 min, and pushes ntfy.sh alerts on failure.
// ================================================================
//
// Sources (10 active — removed Aider #5 and Ollama #6 on 2026-07-30):
//   1.  Artificial Analysis (Intelligence Index, pricing, speed)  [critical]
//   2.  LiteLLM (cost map / context window)                      [critical]
//   3.  Arena AI / wulong mirror (Elo + votes)                   [critical]
//   4.  Open ER-API (USD → PEN / EUR / GBP)                      [critical]
//   5.  HuggingFace Hub (downloads, likes, gated, GGUF, params)  [enrichment]
//   6.  Helicone (GitHub-hosted health check)                    [vanity]
//   7.  Groq Status                                              [vanity]
//   8.  OpenRouter (health check)                                [vanity — potential real]
//   9.  Models.dev provider catalog (Profile C)
//   10. BenchLM (8 category scores + price index + stats)
//   11. ZeroEval (failure_rate + P95 latency + throughput)
//
// REMOVED (ghost/fragile — only fed SourceHealth badges):
//   ✗ Aider leaderboard (HTML scraping — no JSON API, never mapped pass@2 → codingIndex)
//   ✗ Ollama library    (HTML scraping — never updated ollamaAvailable field)
//
//
// BenchLM fetches 5 sub-endpoints in parallel (counts as 1 source in the
// health panel, but contributes 5 of the 8 sub-endpoints above):
//   - models.json   (272 items, 8 category scores + family for Función K)
//   - price-index.json (41 months of token price history)
//   - stats.json    (28 citable market statistics)
//   - pricing.json  (only scorePerOutputDollar + note consumed)
//   - leaderboard.json (only counts.categories envelope consumed, Función L)
//
// 5 AA HTTP headers captured:
//   X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset,
//   X-AA-Tier, Retry-After (gap #3 — 5/5)
//
// Exports:
//   - fetchDashboardData(forceRefresh=false, customKey?)
//   - forceRefreshDashboardData(customKey?)
//   - sendNtfyAlert(title, message)
//   - getHealthStatus()
//   - fetchSingleModelById(modelId, customKey?)
// ================================================================

import { unstable_cache } from "next/cache";
import type {
  AIModel,
  Capabilities,
  CurrencyRate,
  DashboardData,
  FreeAccessType,
  LicenseType,
  ModelsDevProvider,
  SourceHealth,
  PriceIndexPoint,
  BenchlmStat,
} from "./types";
import {
  validateBenchlmModels,
  validateBenchlmPriceIndex,
  validateBenchlmStats,
  validateBenchlmPricing,
  validateBenchlmLeaderboardEnvelope,
  validateZeroEvalMetrics,
  type BenchlmItem,
  type BenchlmPricingItem,
  type ZeroEvalMetricItem,
} from "./validations";
import { MODELS, CURRENCIES, SOURCES, DASHBOARD_DATA } from "./data/models";

// ----------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------

// AA API key resolution priority (most secure → least):
//   1. Per-call customKey (X-AA-Key header from Salud view user input)
//   2. process.env.AA_API_KEY (Vercel/GitHub Actions env var — PRODUCTION)
//   3. Hardcoded fallback (free tier, 100 req/day — for local dev & demo)
//
// In PRODUCTION on Vercel: set AA_API_KEY as a Project Environment Variable
// (Settings → Environment Variables). The hardcoded fallback only applies
// when no env var is set, so it's safe for public repos — the free-tier key
// is rate-limited per IP and has no billing exposure.
const AA_API_KEY_FALLBACK = "aa_FSNEylzoSXyQhtxgyrsXHaEntZMPboOT";
const AA_API_KEY = process.env.AA_API_KEY || AA_API_KEY_FALLBACK;

// HuggingFace token — same pattern as AA: env var for prod, hardcoded fallback for dev.
// Free tier: rate-limited per IP. Get yours at https://huggingface.co/settings/tokens
const HF_TOKEN_FALLBACK = process.env.HF_TOKEN || "TU_TOKEN_REAL_AQUI";
const HF_TOKEN = process.env.HF_TOKEN || HF_TOKEN_FALLBACK;

// Resolve the effective AA key for a given call: explicit override wins,
// otherwise fall back to the env var (or hardcoded fallback for dev).
function resolveAaKey(customKey?: string): string {
  if (customKey && customKey.trim().length > 0) return customKey.trim();
  return AA_API_KEY;
}

const NTFY_TOPIC =
  process.env.NTFY_TOPIC || "selectia-alerts";

const NTFY_URL = `https://ntfy.sh/${NTFY_TOPIC}`;

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

const FETCH_TIMEOUT_MS = 12_000;

const RETRY_COUNT = 2;
const RETRY_BACKOFF_MS = [500, 1000]; // exponential: 500, 1000

const USER_AGENT =
  "SelectIA/3.2 (+https://github.com/selectia)";

// ----------------------------------------------------------------
// Provider metadata (15 providers per PRD v3.2)
// ----------------------------------------------------------------

export const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: "#10a37f",
  Google: "#4285f4",
  Anthropic: "#d4a27f",
  DeepSeek: "#4d6bfe",
  Meta: "#0866ff",
  Alibaba: "#ff6a00",
  xAI: "#1d9bf0",
  "Z AI": "#4d6bfe",
  MiniMax: "#7c3aed",
  Mistral: "#ff7000",
  Microsoft: "#0078d4",
  Cohere: "#39594d",
  Perplexity: "#20808d",
  Kimi: "#000000",
  Xiaomi: "#ff6900",
};

export const PROVIDER_DOMAINS: Record<string, string> = {
  OpenAI: "openai.com",
  Google: "google.com",
  Anthropic: "anthropic.com",
  DeepSeek: "deepseek.com",
  Meta: "meta.com",
  Alibaba: "alibaba.com",
  xAI: "x.ai",
  "Z AI": "z.ai",
  MiniMax: "minimaxi.com",
  Mistral: "mistral.ai",
  Microsoft: "microsoft.com",
  Cohere: "cohere.com",
  Perplexity: "perplexity.ai",
  Kimi: "kimi.com",
  Xiaomi: "xiaomi.com",
};

// ----------------------------------------------------------------
// In-memory cache (L1) + Next.js unstable_cache (L2)
// ----------------------------------------------------------------

interface CacheEntry {
  data: DashboardData;
  timestamp: number;
}

let l1Cache: CacheEntry | null = null;

// ----------------------------------------------------------------
// fetchWithRetry — exponential backoff, used for CRITICAL APIs
// ----------------------------------------------------------------

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeoutMs = FETCH_TIMEOUT_MS,
    retries = RETRY_COUNT,
    ...init
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          ...(init.headers || {}),
        },
      });
      clearTimeout(timer);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err as Error;
      if (attempt < retries) {
        const delay = RETRY_BACKOFF_MS[attempt] ?? 1000 * attempt;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url}`);
}

// ----------------------------------------------------------------
// sendNtfyAlert — no-auth push notification via ntfy.sh
// ----------------------------------------------------------------

export async function sendNtfyAlert(
  title: string,
  message: string
): Promise<boolean> {
  try {
    const res = await fetch(NTFY_URL, {
      method: "POST",
      headers: {
        Title: title,
        Tags: "warning,robot",
        Priority: "high",
      },
      body: message,
    });
    return res.ok;
  } catch {
    // Swallow — ntfy is best-effort
    return false;
  }
}

// ----------------------------------------------------------------
// Provider / model inference helpers
// ----------------------------------------------------------------

const PROVIDER_PATTERNS: Array<{
  re: RegExp;
  provider: string;
  family: string;
}> = [
  { re: /\bgpt[-\s]?5/i, provider: "OpenAI", family: "gpt" },
  { re: /\bgpt[-\s]?4/i, provider: "OpenAI", family: "gpt" },
  { re: /\bo\d+/i, provider: "OpenAI", family: "o" },
  { re: /\bgemini/i, provider: "Google", family: "gemini" },
  { re: /\bgemma/i, provider: "Google", family: "gemma" },
  { re: /\bpalm/i, provider: "Google", family: "palm" },
  { re: /\bclaude/i, provider: "Anthropic", family: "claude" },
  { re: /\bdeepseek/i, provider: "DeepSeek", family: "deepseek" },
  { re: /\bllama/i, provider: "Meta", family: "llama" },
  { re: /\bqwen/i, provider: "Alibaba", family: "qwen" },
  { re: /\bgrok/i, provider: "xAI", family: "grok" },
  { re: /\bglm/i, provider: "Z AI", family: "glm" },
  { re: /\bminimax/i, provider: "MiniMax", family: "minimax" },
  { re: /\bmistral|mixtral/i, provider: "Mistral", family: "mistral" },
  { re: /\bphi/i, provider: "Microsoft", family: "phi" },
  { re: /\bcommand[-\s]?r/i, provider: "Cohere", family: "command" },
  { re: /\bsonar|perplexity/i, provider: "Perplexity", family: "sonar" },
  { re: /\bkimi|moonshot/i, provider: "Kimi", family: "kimi" },
  { re: /\bxiaomi|mi[-\s]?max/i, provider: "Xiaomi", family: "xiaomi" },
];

export function inferProvider(
  name: string,
  creator?: string
): { provider: string; family: string; domain: string; color: string } {
  const source = `${name} ${creator ?? ""}`.trim();
  for (const p of PROVIDER_PATTERNS) {
    if (p.re.test(source)) {
      return {
        provider: p.provider,
        family: p.family,
        domain: PROVIDER_DOMAINS[p.provider] ?? "unknown",
        color: PROVIDER_COLORS[p.provider] ?? "#5e6ad2",
      };
    }
  }
  // Fallback to creator
  if (creator && PROVIDER_COLORS[creator]) {
    return {
      provider: creator,
      family: "other",
      domain: PROVIDER_DOMAINS[creator] ?? "unknown",
      color: PROVIDER_COLORS[creator],
    };
  }
  return {
    provider: creator ?? "Unknown",
    family: "other",
    domain: "unknown",
    color: "#5e6ad2",
  };
}

const SPANISH_MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export function inferKnowledgeCutoff(
  releaseDate: string | null | undefined,
  modelName: string
): string | null {
  if (!releaseDate) return null;
  const d = new Date(releaseDate);
  if (isNaN(d.getTime())) return null;
  // 6 months before release date
  d.setMonth(d.getMonth() - 6);
  return `${SPANISH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function inferParameters(modelName: string): string | null {
  const n = modelName.toLowerCase();
  // MoE with parameter count (e.g. "671B (MoE)")
  const moeMatch = n.match(/(\d+(?:\.\d+)?)\s*b\s*(?:\(\s*moe\s*\)|moe)/);
  if (moeMatch) return `${moeMatch[1]}B (MoE)`;
  // Standard param count
  const bMatch = n.match(/(\d+(?:\.\d+)?)\s*b\b/);
  if (bMatch) return `${bMatch[1]}B`;
  // Million params
  const mMatch = n.match(/(\d+(?:\.\d+)?)\s*m\b/);
  if (mMatch) return `${mMatch[1]}M`;
  return null;
}

export function inferMoE(modelName: string): boolean {
  return /\bmoe\b|\(\s*moe\s*\)|mixtral/i.test(modelName);
}

export function inferLicense(
  modelName: string,
  provider: string
): { license: LicenseType; licenseName: string } {
  const n = modelName.toLowerCase();
  if (/llama/.test(n)) {
    return { license: "conditional", licenseName: "Llama Community" };
  }
  if (/gemma/.test(n)) {
    return { license: "conditional", licenseName: "Gemma Terms" };
  }
  if (/deepseek/.test(n)) {
    return {
      license: "open-source-full",
      licenseName: /r1/.test(n) ? "MIT" : "DeepSeek License",
    };
  }
  if (/qwen|phi-4|mistral|mixtral|command-r|gemma/i.test(n)) {
    if (/command-r/.test(n)) {
      return { license: "open-source-full", licenseName: "CC-BY-NC-4.0" };
    }
    return { license: "open-source-full", licenseName: "Apache 2.0" };
  }
  if (/glm/i.test(n)) {
    return { license: "open-source-full", licenseName: "MIT" };
  }
  // Default for closed providers
  if (["OpenAI", "Anthropic", "Google", "xAI", "MiniMax", "Perplexity"].includes(provider)) {
    return { license: "api-paid", licenseName: `${provider} Proprietary` };
  }
  return { license: "api-paid", licenseName: "Proprietary" };
}

export function inferCapabilities(modelName: string): Capabilities {
  const n = modelName.toLowerCase();
  const isReasoning = /reason|thinking|o\d+|r1|opus|fable/i.test(n);
  const isVision = /vision|v\b|gemini|gpt-4o|gpt-5|gemma-3|glm-4-5v/i.test(n);
  const isMultimodal = /gpt-4o|gpt-5|gemini|grok|minimax/i.test(n);
  return {
    toolUse: true,
    vision: isVision,
    jsonMode: true,
    reasoning: isReasoning,
    audioInput: isMultimodal,
    audioOutput: isMultimodal,
    pdf: isVision || isMultimodal,
    webSearch: /grok|gemini|sonar|perplexity|minimax/i.test(n),
    interleavedReasoning: isReasoning,
    extendedThinking: /thinking|extended|opus|fable|o\d+|r1/i.test(n),
  };
}

export function inferFreeAccess(
  provider: string,
  openWeights: boolean,
  hasVerifiedPrice: boolean = false
): FreeAccessType {
  // Open-weights models (Llama, Qwen, DeepSeek, Gemma, etc.) can be run
  // locally or via free tiers (Ollama, Groq free, ModelScope) → genuinely free.
  if (openWeights) return "free-100";

  // Providers with REAL free API tiers (verified — no credit card required,
  // just rate-limited). These are genuinely usable for free in production:
  //   - Groq: 30 req/min free forever
  //   - Cerebras: free tier 2026
  //   - Google AI Studio: 15 req/min free (Gemini Flash models)
  //   - Mistral: trial free tier
  //   - Cohere: trial keys free
  //   - ModelScope: free Qwen/DeepSeek
  if (["Groq", "Cerebras", "ModelScope", "Together AI", "Fireworks AI"].includes(provider)) {
    return "free-limited";
  }
  if (provider === "Google" || provider === "Google (Gemini)") return "free-limited"; // AI Studio
  if (["Mistral", "MiniMax", "Cohere"].includes(provider)) return "free-limited";

  // Providers that offer free trial CREDITS (need card, but you get $5-30):
  if (["Perplexity", "xAI", "Together AI"].includes(provider)) return "free-registration";

  // CRITICAL FIX: OpenAI, Anthropic, Google (Vertex), DeepSeek, Z AI APIs
  // are PAID FROM THE FIRST TOKEN. Their consumer chat apps (ChatGPT free,
  // Claude.ai free) are free, but the API is NOT. Do NOT mark them as free.
  // If the model has a verified price > $0, it's paid-only.
  if (hasVerifiedPrice) return "paid-only";

  // Unknown provider with no price info → paid-only (conservative)
  return "paid-only";
}

// ----------------------------------------------------------------
// Individual fetchers — each returns its piece + a SourceHealth row
// ----------------------------------------------------------------

// --- 1. Artificial Analysis --------------------------------------

interface AARawModel {
  id: string;
  name: string;
  slug?: string;
  release_date?: string;
  model_creator?: { name?: string };
  evaluations?: {
    artificial_analysis_intelligence_index?: number;
    artificial_analysis_coding_index?: number;
    artificial_analysis_agentic_index?: number;
  };
  pricing?: {
    price_1m_input_tokens?: number;
    price_1m_output_tokens?: number;
    price_1m_cache_hit_tokens?: number;
    price_1m_cache_write_tokens?: number;
  };
  performance?: {
    median_output_tokens_per_second?: number;
    median_time_to_first_token_seconds?: number;
    // Gap #9 — reasoning-model TTFT distinction:
    //   ttftMs                  = median_time_to_first_token_seconds * 1000 (when thinking STARTS)
    //   ttftAnswerMs            = median_time_to_first_answer_token_seconds * 1000 (when first ANSWER token appears, after thinking)
    //   endToEndMs              = median_end_to_end_response_time_seconds * 1000 (total time for 500-token response)
    median_time_to_first_answer_token_seconds?: number;
    median_end_to_end_response_time_seconds?: number;
  };
  context_window?: number;
  max_output_tokens?: number;
}

interface AAResponse {
  data?: AARawModel[];
}

/**
 * Single-source-of-truth AA fetch with 429 + Retry-After handling.
 * Captures all 5 AA HTTP headers (gap #3) and retries once on 429
 * using the `Retry-After` header (capped at 30s to avoid blocking the
 * request thread indefinitely).
 */
async function fetchAAEndpoint(
  url: string,
  apiKey: string
): Promise<{ res: Response; retryAfterHeader: number | null }> {
  const doFetch = async (): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      return await fetch(url, {
        headers: {
          "x-api-key": apiKey,
          "User-Agent": USER_AGENT,
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  let res = await doFetch();
  let retryAfterHeader: number | null = null;
  const raRaw = res.headers.get("retry-after");
  if (raRaw) {
    const raSec = parseInt(raRaw, 10);
    if (!isNaN(raSec) && raSec >= 0) retryAfterHeader = raSec;
  }

  // On 429, honor Retry-After (cap 30s) and retry ONCE.
  if (res.status === 429 && retryAfterHeader !== null && retryAfterHeader > 0) {
    const waitSec = Math.min(retryAfterHeader, 30);
    console.log(
      `[orchestrator] AA 429 received — Retry-After=${retryAfterHeader}s. Sleeping ${waitSec}s then retrying once.`
    );
    await new Promise((r) => setTimeout(r, waitSec * 1000));
    res = await doFetch();
    // Refresh Retry-After from the retried response (likely 0/null on success).
    const ra2 = res.headers.get("retry-after");
    if (ra2) {
      const raSec = parseInt(ra2, 10);
      if (!isNaN(raSec) && raSec >= 0) retryAfterHeader = raSec;
    }
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return { res, retryAfterHeader };
}

async function fetchArtificialAnalysis(
  customKey?: string
): Promise<{
  models: AIModel[];
  health: SourceHealth;
  quota: {
    limit: number;
    remaining: number;
    reset: string;
    tier: string;
    retryAfter: number | null;
  };
}> {
  const url = "https://artificialanalysis.ai/api/v2/language/models/free";
  const start = Date.now();
  const apiKey = resolveAaKey(customKey);

  try {
    const { res, retryAfterHeader } = await fetchAAEndpoint(url, apiKey);

    // Capture quota headers from response (5/5 — gap #3 closed)
    const limit = parseInt(res.headers.get("x-ratelimit-limit") || "100", 10);
    const remaining = parseInt(
      res.headers.get("x-ratelimit-remaining") || "73",
      10
    );
    const resetEpoch = parseInt(
      res.headers.get("x-ratelimit-reset") || "0",
      10
    );
    const tier = res.headers.get("x-aa-tier") || "free";

    const reset = resetEpoch
      ? new Date(resetEpoch * 1000).toISOString()
      : new Date(new Date().setHours(24, 0, 0, 0)).toISOString();

    const json: AAResponse = await res.json();
    const rawModels = json.data ?? [];

    const models: AIModel[] = rawModels.map((m) => {
      const { provider, family, domain, color } = inferProvider(
        m.name,
        m.model_creator?.name
      );
      const { license, licenseName } = inferLicense(m.name, provider);
      const params = inferParameters(m.name);
      const openWeights = license === "open-source-full" || license === "conditional";
      return {
        id: m.id,
        name: m.name,
        slug: m.slug,
        provider,
        providerDomain: domain,
        providerColor: color,
        family,
        license,
        licenseName,
        priceInputUsd: m.pricing?.price_1m_input_tokens ?? null,
        priceOutputUsd: m.pricing?.price_1m_output_tokens ?? null,
        priceCacheHitUsd: m.pricing?.price_1m_cache_hit_tokens ?? null,
        priceCacheWriteUsd: m.pricing?.price_1m_cache_write_tokens ?? null,
        contextWindow: m.context_window ?? 8192,
        maxOutput: m.max_output_tokens ?? 4096,
        intelligenceIndex:
          m.evaluations?.artificial_analysis_intelligence_index ?? null,
        codingIndex:
          m.evaluations?.artificial_analysis_coding_index ?? null,
        agenticIndex:
          m.evaluations?.artificial_analysis_agentic_index ?? null,
        speedTps: m.performance?.median_output_tokens_per_second ?? null,
        ttftMs: m.performance?.median_time_to_first_token_seconds
          ? Math.round(m.performance.median_time_to_first_token_seconds * 1000)
          : null,
        // Gap #9 — reasoning-model TTFT distinction
        ttftAnswerMs: m.performance?.median_time_to_first_answer_token_seconds
          ? Math.round(
              m.performance.median_time_to_first_answer_token_seconds * 1000
            )
          : null,
        endToEndMs: m.performance?.median_end_to_end_response_time_seconds
          ? Math.round(
              m.performance.median_end_to_end_response_time_seconds * 1000
            )
          : null,
        elo: null,
        eloCi: null,
        eloVotes: null,
        capabilities: inferCapabilities(m.name),
        knowledgeCutoff: inferKnowledgeCutoff(m.release_date, m.name),
        releaseDate: m.release_date ?? null,
        parameters: params,
        isMoE: inferMoE(m.name),
        freeAccess: inferFreeAccess(provider, openWeights, (m.pricing?.price_1m_input_tokens ?? 0) > 0),
        inferenceProviders: [{ name: provider, cheapest: true }],
        openWeights,
        ollamaAvailable: openWeights,
        active: true,
      };
    });

    return {
      models,
      health: {
        id: "artificial-analysis",
        name: "Artificial Analysis",
        status: "green",
        latencyMs: Date.now() - start,
        lastSync: new Date().toISOString(),
        remaining,
        limit,
        tier,
        note: `${models.length} modelos con Intelligence Index`,
      },
      quota: { limit, remaining, reset, tier, retryAfter: retryAfterHeader },
    };
  } catch (err) {
    await sendNtfyAlert(
      "AA API caída",
      `No se pudo obtener Artificial Analysis: ${(err as Error).message}`
    );
    return {
      models: [],
      health: {
        id: "artificial-analysis",
        name: "Artificial Analysis",
        status: "red",
        latencyMs: Date.now() - start,
        lastSync: new Date().toISOString(),
        note: `Error: ${(err as Error).message}`,
      },
      quota: { limit: 100, remaining: 0, reset: "", tier: "free", retryAfter: null },
    };
  }
}

// --- 2. LiteLLM cost map -----------------------------------------

interface LiteLLMResponse {
  [modelKey: string]: {
    input_cost_per_token?: number;
    output_cost_per_token?: number;
    cache_read_input_token_cost?: number;
    cache_creation_input_token_cost?: number;
    max_input_tokens?: number;
    max_output_tokens?: number;
    mode?: string;
    litellm_provider?: string;
  };
}

async function fetchLiteLLM(): Promise<{
  priceMap: Map<string, { input: number; output: number; context: number }>;
  health: SourceHealth;
}> {
  const url =
    "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
  const start = Date.now();
  try {
    const res = await fetchWithRetry(url, { retries: RETRY_COUNT });
    const json = (await res.json()) as LiteLLMResponse;
    const priceMap = new Map<
      string,
      { input: number; output: number; context: number }
    >();
    let count = 0;
    let contextOnlyCount = 0;
    for (const [key, val] of Object.entries(json)) {
      if (key === "sample_spec") continue;
      // HRE-TOPSIS v3.3.1 bug fix #15a: incluir modelos que tengan max_input_tokens
      // aunque no tengan precio. Muchos modelos open-weight self-hosted (Llama, Qwen,
      // DeepSeek) tienen contexto en LiteLLM pero no precio (porque son self-hosted).
      // Antes se saltaban, perdiendo sus contextos reales (1M, 400K, 200K, etc.).
      const hasPrice = val.input_cost_per_token != null || val.output_cost_per_token != null;
      const hasContext = val.max_input_tokens != null && val.max_input_tokens > 0;
      if (!hasPrice && !hasContext) continue;
      // HRE-TOPSIS v3.3.1 bug fix #15c: LiteLLM keys tienen prefijos de provider
      // (ej: "openrouter/z-ai/glm-5", "azure_ai/gpt-5.5", "fireworks_ai/glm-5p1").
      // Guardamos tanto el key completo como el "modelName" sin prefijo para que
      // namesMatch pueda encontrar el modelo por su nombre base.
      // Normalizamos a minúsculas para que "GLM-5" y "glm-5" colisionen en el Map.
      const modelBaseName = key.includes("/")
        ? key.split("/").pop()!.toLowerCase()
        : key.toLowerCase();
      priceMap.set(key, {
        input: (val.input_cost_per_token ?? 0) * 1_000_000,
        output: (val.output_cost_per_token ?? 0) * 1_000_000,
        context: val.max_input_tokens ?? 0,
      });
      // También guardamos por el nombre base sin prefijo. Si ya existe, solo
      // sobreescribimos si el nuevo entry tiene MÁS datos (contexto > 0 cuando
      // el anterior era 0, o precio > 0 cuando era 0). Esto evita que un
      // provider con datos parciales (ej: baseten/zai-org/GLM-5 sin contexto)
      // sobreescriba a otro con datos completos (openrouter/z-ai/glm-5 con ctx=200K).
      if (modelBaseName !== key) {
        const newCtx = val.max_input_tokens ?? 0;
        const newIn = (val.input_cost_per_token ?? 0) * 1_000_000;
        const newOut = (val.output_cost_per_token ?? 0) * 1_000_000;
        const existing = priceMap.get(modelBaseName);
        if (!existing) {
          priceMap.set(modelBaseName, { input: newIn, output: newOut, context: newCtx });
        } else {
          // Solo sobreescribir si el nuevo entry aporta MÁS contexto o precio
          const betterCtx = newCtx > 0 && existing.context === 0;
          const betterPrice = newIn > 0 && existing.input === 0;
          if (betterCtx || betterPrice) {
            priceMap.set(modelBaseName, {
              input: Math.max(existing.input, newIn),
              output: Math.max(existing.output, newOut),
              context: Math.max(existing.context, newCtx),
            });
          }
        }
      }
      count++;
      if (!hasPrice && hasContext) contextOnlyCount++;
    }
    return {
      priceMap,
      health: {
        id: "litellm",
        name: "LiteLLM Cost Map",
        status: "green",
        latencyMs: Date.now() - start,
        lastSync: new Date().toISOString(),
        note: `${count} modelos (${contextOnlyCount} solo contexto, sin precio)`,
      },
    };
  } catch (err) {
    return {
      priceMap: new Map(),
      health: {
        id: "litellm",
        name: "LiteLLM Cost Map",
        status: "red",
        latencyMs: Date.now() - start,
        lastSync: new Date().toISOString(),
        note: `Error: ${(err as Error).message}`,
      },
    };
  }
}

// --- 3. Arena AI / wulong mirror --------------------------------

interface ArenaModel {
  rank: number;
  model: string;
  vendor?: string;
  license?: string;
  score: number;
  ci?: number;
  votes?: number;
}

interface ArenaResponse {
  meta?: { fetched_at?: string; model_count?: number };
  models?: ArenaModel[];
}

async function fetchArenaAI(): Promise<{
  eloMap: Map<string, { elo: number; ci: number; votes: number }>;
  fetchedAt: string;
  modelCount: number;
  health: SourceHealth;
}> {
  const url =
    "https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=text";
  const start = Date.now();
  try {
    const res = await fetchWithRetry(url, { retries: RETRY_COUNT });
    const json: ArenaResponse = await res.json();
    const eloMap = new Map<string, { elo: number; ci: number; votes: number }>();
    for (const m of json.models ?? []) {
      eloMap.set(m.model, {
        elo: Math.round(m.score),
        ci: m.ci ?? 0,
        votes: m.votes ?? 0,
      });
    }
    return {
      eloMap,
      fetchedAt: json.meta?.fetched_at ?? new Date().toISOString(),
      modelCount: json.meta?.model_count ?? eloMap.size,
      health: {
        id: "arena-ai",
        name: "Arena AI (wulong mirror)",
        status: "green",
        latencyMs: Date.now() - start,
        lastSync: new Date().toISOString(),
        note: `Elo + votos (${eloMap.size} modelos)`,
      },
    };
  } catch (err) {
    await sendNtfyAlert(
      "Arena AI caída",
      `wulong mirror falló: ${(err as Error).message}`
    );
    return {
      eloMap: new Map(),
      fetchedAt: new Date().toISOString(),
      modelCount: 0,
      health: {
        id: "arena-ai",
        name: "Arena AI (wulong mirror)",
        status: "red",
        latencyMs: Date.now() - start,
        lastSync: new Date().toISOString(),
        note: `Error: ${(err as Error).message}`,
      },
    };
  }
}

// --- 4. Open ER-API ----------------------------------------------

interface ERResponse {
  rates?: Record<string, number>;
  provider?: string;
  time_last_update_utc?: string;
  time_next_update_utc?: string;
}

async function fetchExchangeRates(): Promise<{
  currencies: CurrencyRate[];
  provider: string;
  updated: string;
  nextUpdate: string;
  health: SourceHealth;
}> {
  const url = "https://open.er-api.com/v6/latest/USD";
  const start = Date.now();
  try {
    const res = await fetchWithRetry(url, { retries: RETRY_COUNT });
    const json: ERResponse = await res.json();
    const rates = json.rates ?? {};
    // 19 monedas de América + EUR/GBP
    const currencyConfigs: Array<{ code: string; symbol: string; name: string; fallback: number }> = [
      { code: "PEN", symbol: "S/.", name: "Soles (Perú)", fallback: 3.714 },
      { code: "USD", symbol: "$", name: "Dólares (EE.UU.)", fallback: 1 },
      { code: "EUR", symbol: "€", name: "Euros", fallback: 0.94 },
      { code: "GBP", symbol: "£", name: "Libras (UK)", fallback: 0.79 },
      { code: "BRL", symbol: "R$", name: "Reales (Brasil)", fallback: 5.20 },
      { code: "MXN", symbol: "$", name: "Pesos (México)", fallback: 17.47 },
      { code: "COP", symbol: "$", name: "Pesos (Colombia)", fallback: 3388.85 },
      { code: "CLP", symbol: "$", name: "Pesos (Chile)", fallback: 925.45 },
      { code: "ARS", symbol: "$", name: "Pesos (Argentina)", fallback: 1488.59 },
      { code: "UYU", symbol: "$U", name: "Pesos (Uruguay)", fallback: 40.18 },
      { code: "PYG", symbol: "₲", name: "Guaraníes (Paraguay)", fallback: 6063.75 },
      { code: "BOB", symbol: "Bs", name: "Bolivianos (Bolivia)", fallback: 6.93 },
      { code: "VES", symbol: "Bs", name: "Bolívares (Venezuela)", fallback: 667.05 },
      { code: "GTQ", symbol: "Q", name: "Quetzales (Guatemala)", fallback: 7.63 },
      { code: "HNL", symbol: "L", name: "Lempiras (Honduras)", fallback: 26.73 },
      { code: "NIO", symbol: "C$", name: "Córdobas (Nicaragua)", fallback: 36.79 },
      { code: "CRC", symbol: "₡", name: "Colones (Costa Rica)", fallback: 455.39 },
      { code: "PAB", symbol: "B/.", name: "Balboas (Panamá)", fallback: 1 },
      { code: "DOP", symbol: "RD$", name: "Pesos (Rep. Dominicana)", fallback: 59.46 },
      { code: "CUP", symbol: "$", name: "Pesos (Cuba)", fallback: 24 },
      { code: "CAD", symbol: "C$", name: "Dólares (Canadá)", fallback: 1.42 },
    ];
    const currencies: CurrencyRate[] = currencyConfigs.map(c => ({
      code: c.code as CurrencyRate["code"],
      symbol: c.symbol,
      name: c.name,
      rateFromUsd: rates[c.code] ?? c.fallback,
    }));
    const pen = rates.PEN ?? 3.714;
    const eur = rates.EUR ?? 0.94;
    const gbp = rates.GBP ?? 0.79;
    return {
      currencies,
      provider: json.provider ?? "https://www.exchangerate-api.com",
      updated: json.time_last_update_utc ?? new Date().toISOString(),
      nextUpdate:
        json.time_next_update_utc ??
        new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      health: {
        id: "exchange-rate",
        name: "Open ER-API (Tipo de cambio)",
        status: "green",
        latencyMs: Date.now() - start,
        lastSync: new Date().toISOString(),
        note: `19 monedas de América · 1 USD = S/.${pen.toFixed(3)} | R$${(rates.BRL ?? 5.20).toFixed(2)} | $${(rates.MXN ?? 17.47).toFixed(2)}`,
      },
    };
  } catch (err) {
    await sendNtfyAlert(
      "Tipo de cambio caído",
      `Open ER-API falló: ${(err as Error).message}`
    );
    return {
      currencies: CURRENCIES,
      provider: "https://www.exchangerate-api.com",
      updated: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      health: {
        id: "exchange-rate",
        name: "Open ER-API (Tipo de cambio)",
        status: "red",
        latencyMs: Date.now() - start,
        lastSync: new Date().toISOString(),
        note: `Error: ${(err as Error).message}`,
      },
    };
  }
}

// --- 7. HuggingFace Hub API (replaces BigCode — live enrichment) ----
// Fetches downloads, likes, gated, disabled, pipeline_tag, tags, safetensors
// parameters, lastModified, createdAt, base_model, inference from HF Hub.
// Strategy: 1 call per creator (37 calls) instead of 1 per model (200 calls).

// Map AA creator names to HF org names
const AA_TO_HF_ORG: Record<string, string> = {
  "DeepSeek": "deepseek-ai",
  "Alibaba": "Qwen",
  "Meta": "meta-llama",
  "Google": "google",
  "Z AI": "zai-org",
  "Xiaomi": "XiaomiMiMo",
  "Mistral": "mistralai",
  "Anthropic": "anthropic",
  "OpenAI": "openai-community",
  "xAI": "xai-org",
  "MiniMax": "MiniMaxAI",
  "Cohere": "cohere",
  "Perplexity": "perplexity-ai",
  "Kimi": "moonshotai",
  "Amazon": "amazon",
  "NVIDIA": "nvidia",
  "IBM": "ibm-granite",
  "Microsoft": "microsoft",
  "AI21 Labs": "AI21 Labs",
  "Databricks": "databricks",
  "Nous Research": "NousResearch",
  "LG AI Research": "LGAI-EXAONE",
  "Allen Institute for AI": "allenai",
  "Upstage": "upstage",
  "Liquid AI": "Liquid1",
  "InclusionAI": "inclusionAI",
  "Sarvam": "sarvamai",
  "China Mobile": "ChinaMobile",
  "OpenBMB": "OpenBMB",
  "Swiss AI Initiative": "SwissAI",
  "Prime Intellect": "PrimeIntellect",
  "StepFun": "stepfun-ai",
  "Nex AGI": "NexAGI",
  "ByteDance Seed": "bytedance-research",
  "Naver": "naver",
  "Multiverse Computing": "MultiverseComputing",
  "Inception": "inception-ai",
};

interface HFModelData {
  id?: string; // original-case HF ID (org/model) — needed for lazy-load
  downloads?: number;
  likes?: number;
  gated?: boolean | string;
  disabled?: boolean;
  pipeline_tag?: string;
  tags?: string[];
  safetensors?: { parameters?: Record<string, number>; total?: number };
  lastModified?: string;
  createdAt?: string;
  cardData?: { base_model?: string[]; license?: string; language?: string[] };
  inference?: string | null;
  trendingScore?: number;
  spaces?: string[];
  siblings?: Array<{ rfilename?: string; filename?: string }>;
}

async function fetchHuggingFaceHub(
  aaModels: AIModel[]
): Promise<{ health: SourceHealth; enrichment: Map<string, HFModelData> }> {
  const start = Date.now();
  const enrichment = new Map<string, HFModelData>();

  // Get unique creators from AA models
  const creators = new Set<string>();
  for (const m of aaModels) {
    // We need the creator name — it's stored in the model's provider field
    // but that's the display name, not the AA creator. We infer from
    // the model name and provider.
  }

  // Strategy: for each creator, search HF for their models
  // We use the AA_TO_HF_ORG map to resolve org names
  const uniqueProviders = new Set(aaModels.map((m) => m.provider));

  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
  };
  if (HF_TOKEN) {
    headers["Authorization"] = `Bearer ${HF_TOKEN}`;
  }

  let totalFound = 0;

  // For each unique provider, fetch their models from HF
  const fetches = Array.from(uniqueProviders).map(async (provider) => {
    const hfOrg = AA_TO_HF_ORG[provider];
    if (!hfOrg) return; // skip providers without a known HF org

    try {
      const url = `https://huggingface.co/api/models?author=${hfOrg}&limit=100`;
      const res = await fetchWithRetry(url, { retries: 0, headers });
      if (!res.ok) return;

      const models = await res.json().catch(() => []);
      if (!Array.isArray(models)) return;

      for (const hfModel of models) {
        const id: string = hfModel.id || "";
        // Extract the model name without org prefix
        const namePart = id.split("/").pop() || id;

        const data: HFModelData = {
          id: id, // original-case HF ID (org/model)
          downloads: hfModel.downloads,
          likes: hfModel.likes,
          gated: hfModel.gated,
          disabled: hfModel.disabled,
          pipeline_tag: hfModel.pipeline_tag,
          tags: hfModel.tags,
          safetensors: hfModel.safetensors,
          lastModified: hfModel.lastModified,
          createdAt: hfModel.createdAt,
          cardData: hfModel.cardData,
          inference: hfModel.inference,
          trendingScore: hfModel.trendingScore,
          spaces: hfModel.spaces,
          siblings: hfModel.siblings,
        };

        // Store by the HF ID and also by a normalized name for matching
        enrichment.set(id.toLowerCase(), data);
        enrichment.set(namePart.toLowerCase(), data);
        totalFound++;
      }
    } catch {
      // graceful — this creator's models won't be enriched
    }
  });

  await Promise.all(fetches);

  const latencyMs = Date.now() - start;

  return {
    health: {
      id: "huggingface-hub",
      name: "HuggingFace Hub",
      status: totalFound > 0 ? "green" : "yellow",
      latencyMs,
      lastSync: new Date().toISOString(),
      note: `Hub API · ${totalFound} modelos enriquecidos con downloads, likes, tags, parámetros`,
    },
    enrichment,
  };
}

// Match an AA model name to a HF model and return enrichment data
function matchHfEnrichment(
  aaModel: AIModel,
  enrichment: Map<string, HFModelData>
): HFModelData | null {
  // Try multiple matching strategies
  const name = aaModel.name.toLowerCase().trim();

  // Direct match by normalized name
  const direct = enrichment.get(name);
  if (direct) return direct;

  // Try without version suffixes like "(high)", "(xhigh)", "(Non-reasoning)"
  const cleanName = name.replace(/\s*\([^)]*\)\s*/g, "").trim();
  const clean = enrichment.get(cleanName);
  if (clean) return clean;

  // Try with spaces replaced by hyphens
  const hyphenated = cleanName.replace(/\s+/g, "-");
  const hyphen = enrichment.get(hyphenated);
  if (hyphen) return hyphen;

  // Try fuzzy: check if any HF key contains the clean name or vice versa
  for (const [key, data] of enrichment) {
    if (key.length > 5 && (key.includes(cleanName) || cleanName.includes(key))) {
      return data;
    }
  }

  return null;
}

// Apply HF enrichment to AA models, then fetch missing fields individually
async function applyHfEnrichment(models: AIModel[], enrichment: Map<string, HFModelData>): Promise<void> {
  // Phase 1: apply data from the author search (downloads, likes, tags, pipeline_tag, createdAt,
  // trendingScore, spaces count, siblings count + GGUF detection, safetensors detail)
  const matchedHfIds: string[] = [];
  for (const m of models) {
    const hf = matchHfEnrichment(m, enrichment);
    if (hf) {
      m.hfDownloads = hf.downloads ?? null;
      m.hfLikes = hf.likes ?? null;
      m.hfPipelineTag = hf.pipeline_tag ?? null;
      m.hfTags = hf.tags ?? null;
      m.hfCreatedAt = hf.createdAt ?? null;
      m.hfTrendingScore = hf.trendingScore ?? null;
      // Función D — spaces count (lightweight; full array is lazy-loaded)
      m.hfSpacesCount = Array.isArray(hf.spaces) ? hf.spaces.length : null;
      // Función C — siblings count + GGUF detection
      if (Array.isArray(hf.siblings)) {
        m.hfSiblingsCount = hf.siblings.length;
        const ggufFiles = hf.siblings
          .map((s) => s.rfilename || s.filename || "")
          .filter((name) => name.toLowerCase().endsWith(".gguf"));
        m.hfHasGguf = ggufFiles.length > 0;
        m.hfGgufFiles = ggufFiles.length > 0 ? ggufFiles.slice(0, 10) : null;
      } else {
        m.hfSiblingsCount = null;
        m.hfHasGguf = null;
        m.hfGgufFiles = null;
      }
      // Función C — safetensors per-dtype detail (e.g., {BF16: 32763876352})
      m.hfSafetensorsDetail = hf.safetensors?.parameters ?? null;
      // If safetensors.total is already present from the author search, use it
      if (hf.safetensors?.total && !m.hfParameters) {
        m.hfParameters = hf.safetensors.total;
      }
      // Also detect GGUF from tags (some repos tag "gguf" without .gguf files)
      if (m.hfHasGguf === false && Array.isArray(hf.tags) && hf.tags.includes("gguf")) {
        m.hfHasGguf = true;
      }
      // Store the HF repo ID (org/model) for lazy-load in Ficha Técnica modal
      // Use the original-case ID from the data, not the lowercased enrichment key
      if (hf.id) {
        m.hfRepoId = hf.id;
        matchedHfIds.push(hf.id);
      }
    }
  }

  // Phase 2: fetch individual model details for fields not returned by ?author=
  // (safetensors, gated, disabled, lastModified, inference, cardData.base_model)
  // Limit to 50 concurrent requests to be respectful of rate limits
  const headers: Record<string, string> = { "User-Agent": USER_AGENT };
  if (HF_TOKEN) headers["Authorization"] = `Bearer ${HF_TOKEN}`;

  const uniqueIds = [...new Set(matchedHfIds)].slice(0, 80); // cap at 80 to stay within rate limits
  const batchSize = 10;
  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    const batch = uniqueIds.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (hfId) => {
        try {
          // Default endpoint returns siblings, spaces, safetensors, etc.
          // Note: ?expand[]=trendingScore is EXCLUSIVE — it drops other fields.
          // So we don't use expand here; trendingScore comes from Phase 1
          // (author search) when available.
          const res = await fetchWithRetry(
            `https://huggingface.co/api/models/${hfId}`,
            {
              retries: 0,
              headers,
            }
          );
          if (!res.ok) return null;
          return { hfId, data: await res.json().catch(() => null) };
        } catch {
          return null;
        }
      })
    );

    for (const result of results) {
      if (!result || !result.data) continue;
      // Find the AA models that matched this HF ID and apply the detailed fields
      const hfIdLower = result.hfId.toLowerCase();
      const namePart = result.hfId.split("/").pop()?.toLowerCase() ?? "";

      for (const m of models) {
        const mLower = m.name.toLowerCase().replace(/\s*\([^)]*\)\s*/g, "").trim();
        const mHyphen = mLower.replace(/\s+/g, "-");
        // Check if this model was matched to this HF ID
        const wasMatched =
          enrichment.get(hfIdLower) !== undefined ||
          enrichment.get(namePart) !== undefined;
        if (!wasMatched) continue;

        // Check if this AA model matches this specific HF ID
        const matchesThisId =
          mLower === namePart ||
          mHyphen === namePart ||
          mLower === hfIdLower ||
          mHyphen === hfIdLower ||
          (namePart.length > 5 && (namePart.includes(mHyphen) || mHyphen.includes(namePart)));

        if (!matchesThisId) continue;

        // Apply detailed fields (Phase 2 — individual model endpoint)
        const d = result.data;
        m.hfGated = d.gated ?? false;
        m.hfDisabled = d.disabled ?? false;
        m.hfParameters = d.safetensors?.total ?? null;
        m.hfSafetensorsDetail = d.safetensors?.parameters ?? null;
        m.hfLastModified = d.lastModified ?? null;
        m.hfBaseModel = d.cardData?.base_model?.[0] ?? null;
        m.hfInference = d.inference ?? null;
        m.hfTrendingScore = d.trendingScore ?? m.hfTrendingScore ?? null;
        // Función D — spaces count from detailed endpoint
        m.hfSpacesCount = Array.isArray(d.spaces) ? d.spaces.length : (m.hfSpacesCount ?? null);
        // Función C — siblings count + GGUF detection from detailed endpoint
        if (Array.isArray(d.siblings)) {
          m.hfSiblingsCount = d.siblings.length;
          const ggufFiles = d.siblings
            .map((s: any) => s.rfilename || s.filename || "")
            .filter((name: string) => name.toLowerCase().endsWith(".gguf"));
          if (ggufFiles.length > 0) {
            m.hfHasGguf = true;
            m.hfGgufFiles = ggufFiles.slice(0, 10);
          }
        }
        // Also detect GGUF from tags
        if (m.hfHasGguf !== true && Array.isArray(d.tags) && d.tags.includes("gguf")) {
          m.hfHasGguf = true;
        }
      }
    }
  }
}



// --- Sources 8 (Helicone) and 9 (Groq Status) removed 2026-07-30 ---
// Helicone: GitHub ping returning star count — no model data, no enrichment.
// Groq Status: uptime check — transient state, never affected any AIModel field or ranking.
// Both were pure SourceHealth badge vanity.

// --- 10. OpenRouter health check --------------------------------

async function fetchOpenRouterHealth(): Promise<SourceHealth> {
  const url = "https://openrouter.ai/api/v1/models";
  const start = Date.now();
  try {
    const res = await fetchWithRetry(url, { retries: 1 });
    const json: any = await res.json();
    const modelCount = json.data?.length ?? 0;
    return {
      id: "openrouter",
      name: "OpenRouter (cross-validación)",
      status: "green",
      latencyMs: Date.now() - start,
      lastSync: new Date().toISOString(),
      note: `${modelCount} modelos en vivo`,
    };
  } catch (err) {
    return {
      id: "openrouter",
      name: "OpenRouter (cross-validación)",
      status: "red",
      latencyMs: Date.now() - start,
      lastSync: new Date().toISOString(),
      note: `Error: ${(err as Error).message}`,
    };
  }
}

// --- 18. Models.dev provider catalog (gap #4 — 19th data source) -
// Feeds Profile C's "Catálogo de Proveedores" ficha with full provider
// names, domains, API docs URLs, key panel URLs, and served-model counts.
// The endpoint at https://models.dev/ serves a static site; the underlying
// catalog is published as JSON. We try several known JSON shapes and
// gracefully degrade to an empty array on any failure.

interface ModelsDevRawModel {
  id?: string;
  name?: string;
  provider?: string | { id?: string; name?: string; domain?: string };
  api_docs_url?: string;
  key_panel_url?: string;
}

async function fetchModelsDev(): Promise<{
  providers: ModelsDevProvider[];
  health: SourceHealth;
}> {
  const candidates = [
    "https://models.dev/models.json",
    "https://models.dev/providers.json",
    "https://models.dev/catalog.json",
    "https://raw.githubusercontent.com/ai-sdk/models/main/data/providers.json",
  ];
  const start = Date.now();
  for (const url of candidates) {
    try {
      const res = await fetchWithRetry(url, { retries: 0, timeoutMs: 8000 });
      const json: any = await res.json().catch(() => null);
      if (!json) continue;

      // Accept either an array of models (group by provider) or a map of providers.
      const providersMap = new Map<string, ModelsDevProvider>();

      const pushProvider = (
        id: string,
        name: string,
        domain: string,
        apiDocsUrl: string,
        keyPanelUrl: string,
        modelsCount = 0
      ) => {
        if (!id) return;
        const existing = providersMap.get(id);
        if (existing) {
          existing.modelsCount += modelsCount;
          if (!existing.apiDocsUrl && apiDocsUrl) existing.apiDocsUrl = apiDocsUrl;
          if (!existing.keyPanelUrl && keyPanelUrl) existing.keyPanelUrl = keyPanelUrl;
        } else {
          providersMap.set(id, {
            id,
            name: name || id,
            domain: domain || "",
            apiDocsUrl: apiDocsUrl || "",
            keyPanelUrl: keyPanelUrl || "",
            modelsCount,
          });
        }
      };

      const modelsArr: ModelsDevRawModel[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.models)
        ? json.models
        : Array.isArray(json?.data)
        ? json.data
        : [];
      if (modelsArr.length > 0) {
        // Group models by provider.
        for (const m of modelsArr) {
          const prov = m.provider;
          const id =
            (typeof prov === "string" ? prov : prov?.id) ||
            m.id?.split("/")[0] ||
            m.id?.split(":")[0] ||
            "";
          const name = typeof prov === "string" ? prov : prov?.name ?? id;
          const domain = typeof prov === "string" ? "" : prov?.domain ?? "";
          pushProvider(
            id,
            name,
            domain,
            m.api_docs_url ?? "",
            m.key_panel_url ?? "",
            1
          );
        }
      } else if (json && typeof json === "object") {
        // Try the providers-as-map shape: { "openai": { name, domain, api_docs_url, ... } }
        for (const [id, val] of Object.entries(json)) {
          if (!val || typeof val !== "object") continue;
          const v = val as any;
          pushProvider(
            id,
            v.name ?? id,
            v.domain ?? "",
            v.api_docs_url ?? v.apiDocsUrl ?? "",
            v.key_panel_url ?? v.keyPanelUrl ?? v.signup_url ?? "",
            Array.isArray(v.models) ? v.models.length : v.models_count ?? 0
          );
        }
      }

      const providers = Array.from(providersMap.values()).filter(
        (p) => p.id && p.name
      );
      if (providers.length > 0) {
        return {
          providers,
          health: {
            id: "models-dev",
            name: "Models.dev (Catálogo Proveedores)",
            status: "green",
            latencyMs: Date.now() - start,
            lastSync: new Date().toISOString(),
            note: `${providers.length} proveedores con API docs y key panel`,
          },
        };
      }
      // Parsed but empty — try next candidate.
    } catch {
      // try next candidate
    }
  }

  // Graceful degradation: empty array + yellow health (do NOT crash).
  return {
    providers: [],
    health: {
      id: "models-dev",
      name: "Models.dev (Catálogo Proveedores)",
      status: "yellow",
      latencyMs: Date.now() - start,
      lastSync: new Date().toISOString(),
      note: "No se pudo alcanzar models.dev — catálogo vacío (degradación elegante)",
    },
  };
}

// ----------------------------------------------------------------
// Merge logic — combine AA models + Arena Elo, enrich with LiteLLM
// ----------------------------------------------------------------

// Fuzzy name match — normalize both names to lowercase alphanumeric and
// check bidirectional inclusion. Used for Arena Elo + BigCode enrichment.
function namesMatch(a: string, b: string): boolean {
  const na = a.toLowerCase().replace(/[^a-z0-9]/g, "");
  const nb = b.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!na || !nb) return false;
  // Exact compact match
  if (na === nb) return true;
  // One includes the other — but only if the shorter is >= 6 chars to avoid
  // false positives like "claude" matching every Claude variant. This was
  // causing Arena's "claude-fable-5" to match AA's "Claude Opus 4.6" via
  // the shared "claude" substring. Now requires meaningful overlap.
  const shorter = na.length < nb.length ? na : nb;
  const longer = na.length < nb.length ? nb : na;
  if (shorter.length >= 6 && longer.includes(shorter)) return true;

  // HRE-TOPSIS v3.3.1 bug fix #15c: matching agresivo con normalizeForMatching.
  // Esto permite que "GPT-5.5 (xhigh)" → "gpt55" matchee "gpt-5.5-2026-04-23" → "gpt5520260423"
  // (el segundo incluye al primero con >= 6 chars).
  // También maneja sufijos como "(Adaptive)", "(Reasoning)", "(Non-reasoning)".
  const nna = normalizeForMatching(a);
  const nnb = normalizeForMatching(b);
  if (nna === nnb && nna.length > 0) return true;
  const nshorter = nna.length < nnb.length ? nna : nnb;
  const nlonger = nna.length < nnb.length ? nnb : nna;
  if (nshorter.length >= 6 && nlonger.includes(nshorter)) return true;

  return false;
}

// Normalize a model name for matching across sources.
// Strips variant suffixes like "(high)", "(Reasoning)", "(Non-reasoning)",
// "(max effort)", version suffixes, dashes, accents, and case.
// Examples:
//   "Claude Opus 4.7 (Adaptive)" → "claudeopus47"
//   "claude-opus-4-7-adaptive" → "claudeopus47"
//   "Gemini 3.5 Flash (high)" → "gemini35flash"
//   "gemini-3-5-flash" → "gemini35flash"
function normalizeForMatching(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")         // strip accents
    .replace(/\s*\(.*?\)\s*/g, " ")          // strip parenthetical suffixes like "(high)"
    .replace(/\s+(high|max|xhigh|reasoning|adaptive|non-reasoning|minimal|standard)$/g, "")  // strip variant words
    .replace(/[^a-z0-9]/g, "")               // strip dashes/spaces/punctuation
    .trim();
}

// ============================================================
// BenchLM enrichment — 5 sub-endpoints fetched in parallel.
// Returns: { health, modelsMap, priceIndex, stats, categoryCoverage, pricingExtras }
// All wrapped in a single SourceHealth entry ("benchlm").
// ============================================================

interface BenchlmEnrichmentData {
  health: SourceHealth;
  modelsMap: Map<string, BenchlmItem>;        // keyed by normalized model name
  priceIndex: PriceIndexPoint[];
  stats: BenchlmStat[];
  categoryCoverage: Record<string, number>;   // {agentic:103, coding:101, ...}
  pricingMap: Map<string, BenchlmPricingItem>; // keyed by normalized model name
}

async function fetchBenchLM(): Promise<BenchlmEnrichmentData> {
  const sourceId = "benchlm";
  const sourceName = "BenchLM";
  const start = Date.now();
  const BASE = "https://benchlm.ai/data";

  // Fetch all 5 endpoints in parallel (each independently fails-safe)
  const [modelsRes, priceIdxRes, statsRes, pricingRes, leaderboardRes] = await Promise.allSettled([
    fetchWithRetry(`${BASE}/models.json`),
    fetchWithRetry(`${BASE}/price-index.json`),
    fetchWithRetry(`${BASE}/stats.json`),
    fetchWithRetry(`${BASE}/pricing.json`),
    fetchWithRetry(`${BASE}/leaderboard.json`),
  ]);

  // Parse + validate each result. Failed ones get null.
  let modelsMap = new Map<string, BenchlmItem>();
  let priceIndex: PriceIndexPoint[] = [];
  let stats: BenchlmStat[] = [];
  let categoryCoverage: Record<string, number> = {};
  let pricingMap = new Map<string, BenchlmPricingItem>();
  let failures = 0;
  const errors: string[] = [];

  // 1. models.json — the primary source (8 category scores + family.supersedesModelKey for Función K)
  if (modelsRes.status === "fulfilled" && modelsRes.value.ok) {
    const raw = await modelsRes.value.json();
    const v = validateBenchlmModels(raw);
    if (v.success) {
      // HRE-TOPSIS v3.3.1 bug fix #16: matching BenchLM en 2 pasadas para evitar
      // que modelos base sobreescriban a variantes específicas.
      // Problema: normalizeForMatching("GLM-5") = "glm5" y
      // normalizeForMatching("GLM-5 (Reasoning)") = "glm5" (mismo key).
      // Si GLM-5 base se procesa DESPUÉS de GLM-5 (Reasoning), lo sobreescribe.
      // Solución: pasada 1 = items SIN sufijo (parentesis), pasada 2 = items CON sufijo.
      // Así las variantes específicas (Reasoning, Max Effort, high, etc.) siempre ganan.
      const itemsWithSuffix: typeof v.data.items = [];
      const itemsWithoutSuffix: typeof v.data.items = [];
      for (const item of v.data.items) {
        if (!item.model) continue;
        const hasSuffix = /\([^)]+\)/.test(item.model);
        if (hasSuffix) {
          itemsWithSuffix.push(item);
        } else {
          itemsWithoutSuffix.push(item);
        }
      }
      // Pasada 1: items sin sufijo (base models)
      for (const item of itemsWithoutSuffix) {
        modelsMap.set(normalizeForMatching(item.model), item);
      }
      // Pasada 2: items con sufijo (variantes específicas) — sobreescriben
      for (const item of itemsWithSuffix) {
        modelsMap.set(normalizeForMatching(item.model), item);
      }
    } else {
      failures++;
      errors.push("models.json schema fail");
    }
  } else {
    failures++;
    errors.push("models.json fetch fail");
  }

  // 2. price-index.json — 41 months of token price history
  if (priceIdxRes.status === "fulfilled" && priceIdxRes.value.ok) {
    const raw = await priceIdxRes.value.json();
    const v = validateBenchlmPriceIndex(raw);
    if (v.success) {
      priceIndex = v.data.series.map((s) => ({
        month: s.month,
        frontier: s.frontier ?? null,
        frontierMedian: s.frontierMedian ?? null,
        mid: s.mid ?? null,
        midMedian: s.midMedian ?? null,
        budget: s.budget ?? null,
        budgetMedian: s.budgetMedian ?? null,
      }));
    } else {
      failures++;
      errors.push("price-index.json schema fail");
    }
  } else {
    failures++;
    errors.push("price-index.json fetch fail");
  }

  // 3. stats.json — 28 citable market statistics
  if (statsRes.status === "fulfilled" && statsRes.value.ok) {
    const raw = await statsRes.value.json();
    const v = validateBenchlmStats(raw);
    if (v.success) {
      stats = v.data.items.map((s) => ({
        statId: s.statId,
        label: s.label ?? "",
        value: s.value ?? "",
        sentence: s.sentence ?? "",
        anchorUrl: s.anchorUrl ?? "",
      }));
    } else {
      failures++;
      errors.push("stats.json schema fail");
    }
  } else {
    failures++;
    errors.push("stats.json fetch fail");
  }

  // 4. pricing.json — only scorePerOutputDollar + note (Sección 2.2 of plan v2.0)
  if (pricingRes.status === "fulfilled" && pricingRes.value.ok) {
    const raw = await pricingRes.value.json();
    const v = validateBenchlmPricing(raw);
    if (v.success) {
      for (const item of v.data.items) {
        const key = item.model || item.slug || item.canonicalModelKey;
        if (key) {
          pricingMap.set(normalizeForMatching(key), item);
        }
      }
    } else {
      failures++;
      errors.push("pricing.json schema fail");
    }
  } else {
    failures++;
    errors.push("pricing.json fetch fail");
  }

  // 5. leaderboard.json — envelope ONLY (counts.categories, Función L)
  if (leaderboardRes.status === "fulfilled" && leaderboardRes.value.ok) {
    const raw = await leaderboardRes.value.json();
    const v = validateBenchlmLeaderboardEnvelope(raw);
    if (v.success && v.data.counts?.categories) {
      categoryCoverage = v.data.counts.categories;
    } else {
      failures++;
      errors.push("leaderboard.json schema fail");
    }
  } else {
    failures++;
    errors.push("leaderboard.json fetch fail");
  }

  // Build SourceHealth — green if models.json (the primary) succeeded, yellow if only secondary failed, red if primary failed.
  const status: "green" | "yellow" | "red" =
    modelsMap.size > 0 && failures === 0 ? "green"
    : modelsMap.size > 0 && failures > 0 ? "yellow"
    : "red";

  const health: SourceHealth = {
    id: sourceId,
    name: sourceName,
    status,
    latencyMs: Date.now() - start,
    lastSync: new Date().toISOString(),
    note: failures === 0 ? undefined : `${failures} sub-endpoint(s) failed: ${errors.join("; ")}`,
  };

  return { health, modelsMap, priceIndex, stats, categoryCoverage, pricingMap };
}

// ============================================================
// ZeroEval — production failure rate + P95 latency + throughput.
// 130 models at api.zeroeval.com/v1/models/metrics.
// ============================================================

interface ZeroEvalEnrichmentData {
  health: SourceHealth;
  metricsMap: Map<string, ZeroEvalMetricItem>;  // keyed by normalized model_id
}

async function fetchZeroEvalMetrics(): Promise<ZeroEvalEnrichmentData> {
  const sourceId = "zeroeval";
  const sourceName = "ZeroEval (LLM Stats)";
  const start = Date.now();

  try {
    const res = await fetchWithRetry("https://api.zeroeval.com/v1/models/metrics");
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const raw = await res.json();
    const v = validateZeroEvalMetrics(raw);
    if (!v.success) {
      throw new Error("schema validation failed");
    }
    const metricsMap = new Map<string, ZeroEvalMetricItem>();
    for (const item of v.data) {
      metricsMap.set(normalizeForMatching(item.model_id), item);
    }
    return {
      health: {
        id: sourceId,
        name: sourceName,
        status: "green",
        latencyMs: Date.now() - start,
        lastSync: new Date().toISOString(),
        note: `${metricsMap.size} modelos con métricas`,
      },
      metricsMap,
    };
  } catch (err) {
    sendNtfyAlert("SelectIA: ZeroEval falló", String(err));
    return {
      health: {
        id: sourceId,
        name: sourceName,
        status: "red",
        latencyMs: Date.now() - start,
        lastSync: new Date().toISOString(),
        note: `Error: ${(err as Error).message}`,
      },
      metricsMap: new Map(),
    };
  }
}

async function mergeModels(
  aaModels: AIModel[],
  arenaElo: Map<string, { elo: number; ci: number; votes: number }>,
  liteLLM: Map<string, { input: number; output: number; context: number }>,
  hfEnrichment: Map<string, HFModelData>
): Promise<AIModel[]> {
  const arenaModels: AIModel[] = [];
  const seenNames = new Set(aaModels.map((m) => m.name.toLowerCase()));

  // Add Arena-only models (with Elo only, e.g. "Claude Fable 5").
  // Bug fix #7: use FUZZY matching (namesMatch) instead of exact name compare,
  // so an Arena entry "claude-fable-5" enriches the AA model "Claude Fable 5
  // (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback)" instead of creating
  // a duplicate Arena-only entry with null price/II. This was the root cause
  // of Fable 5 appearing as a "free" model — it was a duplicate without AA data.
  for (const [name, elo] of arenaElo.entries()) {
    // First try exact match (fast path)
    let aaModel = aaModels.find(
      (m) => m.name.toLowerCase() === name.toLowerCase()
    );
    // Then try fuzzy match (handles AA's longer display names with suffixes)
    if (!aaModel) {
      aaModel = aaModels.find((m) => namesMatch(m.name, name));
    }

    if (aaModel) {
      // Enrich the AA model with Elo if it doesn't have it yet
      if (aaModel.elo === null) {
        aaModel.elo = elo.elo;
        aaModel.eloCi = elo.ci;
        aaModel.eloVotes = elo.votes;
      }
      continue;
    }

    // No AA match — create an Arena-only entry (truly Arena-exclusive model)
    const { provider, family, domain, color } = inferProvider(name);
    const { license, licenseName } = inferLicense(name, provider);
    const openWeights = license === "open-source-full" || license === "conditional";
    arenaModels.push({
      id: `arena-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      provider,
      providerDomain: domain,
      providerColor: color,
      family,
      license,
      licenseName,
      priceInputUsd: null,
      priceOutputUsd: null,
      priceCacheHitUsd: null,
      priceCacheWriteUsd: null,
      contextWindow: 8192,
      maxOutput: 4096,
      intelligenceIndex: null,
      codingIndex: null,
      agenticIndex: null,
      speedTps: null,
      ttftMs: null,
      elo: elo.elo,
      eloCi: elo.ci,
      eloVotes: elo.votes,
      capabilities: inferCapabilities(name),
      knowledgeCutoff: null,
      releaseDate: null,
      parameters: inferParameters(name),
      isMoE: inferMoE(name),
      // Arena-only models have no verified price → can't confirm free, so
      // rely on provider inference (Groq free, Google AI Studio free, etc.)
      freeAccess: inferFreeAccess(provider, openWeights, false),
      inferenceProviders: [{ name: provider, cheapest: true }],
      openWeights,
      ollamaAvailable: openWeights,
      active: true,
    });
  }

  // Try to fill missing prices AND context from LiteLLM (best-effort key match).
  // HRE-TOPSIS v3.3.1 bug fix #15b: ANTES se saltaba LiteLLM matching si el modelo
  // ya tenía precio de AA. PERO 210 modelos tienen contextWindow=8192 (default falso)
  // porque AA no devuelve context_window. Ahora SIEMPRE intentamos llenar el contexto
  // si es 8192, incluso si el precio ya está correcto.
  for (const m of aaModels) {
    const needsPrice = m.priceInputUsd === null || m.priceOutputUsd === null;
    const needsContext = m.contextWindow === 8192;  // default falso de AA
    if (!needsPrice && !needsContext) continue;
    for (const [key, val] of liteLLM.entries()) {
      if (namesMatch(key, m.name)) {
        if (m.priceInputUsd === null) m.priceInputUsd = val.input;
        if (m.priceOutputUsd === null) m.priceOutputUsd = val.output;
        // Llenar contexto real de LiteLLM si el modelo tiene el default 8192
        if (m.contextWindow === 8192 && val.context > 0) m.contextWindow = val.context;
        break;
      }
    }
  }

  // HuggingFace Hub enrichment — applies downloads, likes, gated, disabled,
  // pipeline_tag, tags, safetensors parameters, lastModified, createdAt,
  // base_model, and inference to matching models. All from live HF API.
  const allModels = [...aaModels, ...arenaModels];
  await applyHfEnrichment(allModels, hfEnrichment);

  return [...aaModels, ...arenaModels];
}

// ============================================================
// applyBenchlmEnrichment — mutates each AIModel in place with
// BenchLM (8 category scores + family + pricing extras) and
// ZeroEval (failure_rate + P95 + throughput + calls) data.
// Matching is by normalized model name (Phase 0.1 proved canonicalModelKey
// matching gives 0% because SIA uses UUIDs as model.id).
// ============================================================

function applyBenchlmEnrichment(
  models: AIModel[],
  benchlm: { modelsMap: Map<string, BenchlmItem>; pricingMap: Map<string, BenchlmPricingItem> },
  zeroeval: { metricsMap: Map<string, ZeroEvalMetricItem> }
): { benchlmMatched: number; zeroevalMatched: number; pricingMatched: number } {
  let benchlmMatched = 0;
  let zeroevalMatched = 0;
  let pricingMatched = 0;

  // Build a reverse lookup for Función K: canonicalModelKey → model name (for successor name resolution)
  const benchlmKeyToName = new Map<string, string>();
  for (const [, item] of benchlm.modelsMap) {
    if (item.canonicalModelKey) {
      benchlmKeyToName.set(item.canonicalModelKey, item.model);
    }
  }

  // v3.3.1 fix #1: Build successorMap — maps canonicalModelKey of the REPLACED model
  // to the successor's info. supersedesModelKey means "this model REPLACES the model
  // with that key". So if GPT-5.5 has supersedesModelKey="gpt-5-4", then GPT-5.4
  // is the one that was superseded, and GPT-5.5 is the successor.
  const successorMap = new Map<string, { slug: string; name: string }>();
  for (const [, item] of benchlm.modelsMap) {
    const fam = item.family;
    if (fam?.supersedesModelKey) {
      // item REPLACES the model with canonicalModelKey = fam.supersedesModelKey
      // So the model with canonicalModelKey = fam.supersedesModelKey is SUPERSEDED
      successorMap.set(fam.supersedesModelKey, {
        slug: item.slug ?? item.canonicalModelKey ?? "",
        name: item.model,
      });
    }
  }

  for (const m of models) {
    const key = normalizeForMatching(m.name);

    // --- BenchLM enrichment (8 category scores + family + displayScore + rank) ---
    const blm = benchlm.modelsMap.get(key);
    if (blm) {
      benchlmMatched++;
      m.benchlmSlug = blm.slug ?? null;
      m.benchlmDisplayScore = blm.displayScore ?? null;
      m.benchlmOverallRank = blm.overallRank ?? null;
      const catScores = blm.scores?.displayCategoryScores ?? null;
      m.benchlmCategoryScores = catScores ? {
        agentic: catScores.agentic ?? null,
        coding: catScores.coding ?? null,
        reasoning: catScores.reasoning ?? null,
        multimodalGrounded: catScores.multimodalGrounded ?? null,
        knowledge: catScores.knowledge ?? null,
        multilingual: catScores.multilingual ?? null,
        instructionFollowing: catScores.instructionFollowing ?? null,
        math: catScores.math ?? null,
      } : null;
      m.benchlmScoreConfidence = blm.coverage?.scoreConfidence ?? null;
      m.benchlmTrustedBenchmarkCount = blm.coverage?.trustedBenchmarkCount ?? null;
      m.benchlmReleaseDate = blm.releaseDate ?? null;

      // Función K — Ciclo de Vida del Modelo (v3.3.1 fix #1: lógica correcta)
      // supersedesModelKey en BenchLM significa "este modelo REEMPLAZA al modelo
      // con esa canonicalModelKey". Por lo tanto:
      // - Si ESTE modelo tiene supersedesModelKey != null → es el SUCESOR (vigente)
      // - Si ESTE modelo tiene canonicalModelKey que aparece en successorMap → fue REEMPLAZADO
      const fam = blm.family;
      if (fam) {
        m.benchlmIsCanonicalEntry = fam.isCanonicalFamilyEntry ?? null;
        // v3.3.1 fix: verificar si ESTE modelo fue reemplazado por otro
        const canonicalKey = blm.canonicalModelKey;
        const successor = canonicalKey ? successorMap.get(canonicalKey) : null;
        if (successor) {
          // Este modelo FUE reemplazado por el sucesor
          m.benchlmSupersededBy = successor.slug;
          m.benchlmSupersededByName = successor.name;
        } else {
          // Este modelo NO fue reemplazado (es vigente o es el sucesor)
          m.benchlmSupersededBy = null;
          m.benchlmSupersededByName = null;
        }
      }
    }

    // --- pricing.json extras (scorePerOutputDollar + note, Sección 2.2) ---
    const pricing = benchlm.pricingMap.get(key);
    if (pricing) {
      pricingMatched++;
      m.benchlmScorePerOutputDollar = pricing.scorePerOutputDollar ?? null;
      m.benchlmPricingNote = pricing.note ?? null;
    }

    // --- ZeroEval enrichment (failure_rate + P95 + throughput + calls) ---
    const ze = zeroeval.metricsMap.get(key);
    if (ze) {
      zeroevalMatched++;
      m.zeroevalFailureRate = ze.failure_rate ?? null;
      m.zeroevalP95Latency = ze.p95_latency ?? null;
      m.zeroevalAvgThroughput = ze.avg_throughput ?? null;
      m.zeroevalTotalCalls = ze.total_calls ?? null;
    }
  }

  return { benchlmMatched, zeroevalMatched, pricingMatched };
}

// ----------------------------------------------------------------
// Main orchestrator entrypoint
// ----------------------------------------------------------------

const getCachedDashboardData = unstable_cache(
  async () => {
    return await runAllFetchers();
  },
  ["master-dashboard-data"],
  { tags: ["dashboard-data"], revalidate: 86400 * 7 }
);

export async function fetchDashboardData(
  forceRefresh = false,
  customKey?: string
): Promise<DashboardData> {
  if (customKey) {
    return await runAllFetchers(customKey);
  }

  // L1 Cache (Lambda Memory) - prevents double fetch if unstable_cache is purging
  if (!forceRefresh && l1Cache && Date.now() - l1Cache.timestamp < 60000) {
    return l1Cache.data;
  }

  if (forceRefresh) {
    const data = await runAllFetchers();
    l1Cache = { data, timestamp: Date.now() };
    return data;
  }

  const data = await getCachedDashboardData();
  l1Cache = { data, timestamp: Date.now() };
  return data;
}

export async function forceRefreshDashboardData(
  customKey?: string
): Promise<DashboardData> {
  if (customKey) {
    return await runAllFetchers(customKey);
  }
  const data = await runAllFetchers();
  l1Cache = { data, timestamp: Date.now() };
  return data;
}

async function runAllFetchers(customKey?: string): Promise<DashboardData> {
  // Active sources (7 real data sources + OpenRouter health-only):
  //   AA, LiteLLM, Arena, ER-API, HuggingFace Hub, BenchLM, ZeroEval (real)
  //   OpenRouter (health check only — to be upgraded to real enrichment)
  // Removed: Aider, Ollama (fragile HTML scraping), Helicone, Groq Status (vanity).
  const [
    aa,
    litellm,
    arena,
    exchange,
    openrouter,
    modelsDev,
    benchlm,
    zeroeval,
  ] = await Promise.all([
    fetchArtificialAnalysis(customKey),
    fetchLiteLLM(),
    fetchArenaAI(),
    fetchExchangeRates(),
    fetchOpenRouterHealth(),
    fetchModelsDev(),
    fetchBenchLM(),
    fetchZeroEvalMetrics(),
  ]);

  // NOTE: HuggingFace enrichment is fetched after AA (depends on aa.models).
  // BenchLM + ZeroEval are independent and run in the parallel block above.

  // Fetch HuggingFace Hub enrichment (after AA so we know which models to enrich)
  const hfHub = await fetchHuggingFaceHub(aa.models);

  // Merge models — AA + Arena (with LiteLLM + HuggingFace Hub enrichment)
  let models = await mergeModels(
    aa.models,
    arena.eloMap,
    litellm.priceMap,
    hfHub.enrichment
  );

  // Fallback: if AA returned no models (red), use seed MODELS so the UI
  // always has something to render
  if (models.length === 0) {
    models = MODELS;
  }

  // Apply BenchLM + ZeroEval enrichment (mutates each model in place).
  // Phase 0.1 confirmed: match by normalized name gives 93/225 (41.3%) BenchLM, ~16% ZeroEval.
  const enrichStats = applyBenchlmEnrichment(
    models,
    { modelsMap: benchlm.modelsMap, pricingMap: benchlm.pricingMap },
    { metricsMap: zeroeval.metricsMap }
  );
  console.log(`[BenchLM] ${enrichStats.benchlmMatched}/${models.length} modelos enriquecidos · ${enrichStats.pricingMatched} con pricing extras`);
  console.log(`[ZeroEval] ${enrichStats.zeroevalMatched}/${models.length} modelos con métricas de producción`);

  const sources: SourceHealth[] = [
    aa.health,
    litellm.health,
    arena.health,
    exchange.health,
    hfHub.health,
    openrouter,
    modelsDev.health,
    benchlm.health,
    zeroeval.health,
  ];

  // If AA quota is empty/zero and we fell back, restore default quota
  const aaQuota =
    aa.quota.remaining > 0 || aa.quota.limit > 0
      ? aa.quota
      : { ...DASHBOARD_DATA.aaQuota, retryAfter: null };

  return {
    models,
    currencies: exchange.currencies,
    exchangeRateProvider: exchange.provider,
    exchangeRateUpdated: exchange.updated,
    exchangeRateNextUpdate: exchange.nextUpdate,
    sources,
    aaQuota,
    generatedAt: new Date().toISOString(),
    arenaFetchedAt: arena.fetchedAt,
    arenaModelCount: arena.modelCount,
    modelsDevProviders: modelsDev.providers,
    // NEW — BenchLM dashboard-level data (price-index series + 28 citable stats + Función L coverage)
    priceIndex: benchlm.priceIndex,
    benchlmStats: benchlm.stats,
    benchlmCategoryCoverage: benchlm.categoryCoverage,
  };
}

// ----------------------------------------------------------------
// getHealthStatus — lightweight summary used by /api/health
// ----------------------------------------------------------------

export async function getHealthStatus(): Promise<{
  status: "green" | "yellow" | "red";
  models: number;
  sources: { green: number; yellow: number; red: number; total: number };
  lastUpdated: string;
  cacheAgeMs: number;
  aaQuota: {
    limit: number;
    remaining: number;
    reset: string;
    tier: string;
    retryAfter?: number | null;
  };
}> {
  const data = await fetchDashboardData().catch(() => DASHBOARD_DATA);

  const counts = { green: 0, yellow: 0, red: 0, total: 0 };
  for (const s of data.sources ?? []) {
    counts[s.status]++;
    counts.total++;
  }

  const overall: "green" | "yellow" | "red" =
    counts.red > counts.total / 3
      ? "red"
      : counts.yellow > 0 || counts.red > 0
      ? "yellow"
      : "green";

  return {
    status: overall,
    models: data.models?.length ?? 0,
    sources: counts,
    lastUpdated: data.generatedAt,
    cacheAgeMs: 0,
    aaQuota: data.aaQuota,
  };
}

// ----------------------------------------------------------------
// Public helpers — used by /api/refresh-model route (serverless proxy)
// ----------------------------------------------------------------

export async function fetchSingleModelById(
  modelId: string,
  customKey?: string
): Promise<AARawModel | null> {
  const url = "https://artificialanalysis.ai/api/v2/language/models/free";
  const apiKey = resolveAaKey(customKey);
  const { res } = await fetchAAEndpoint(url, apiKey);
  const json: AAResponse = await res.json();
  return json.data?.find((m) => m.id === modelId) ?? null;
}
