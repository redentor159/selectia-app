// ================================================================
// SELECTIA — Zod validation schemas for external API responses.
// Used by orchestrator.ts fetchers to abort early if a source
// changes its schema (prevents overwriting good JSON with corrupt data).
// ================================================================
// Design principles:
// 1. Each schema validates ONLY the fields SelectIA actually consumes.
//    Extra fields in the API response are silently stripped (Zod default).
// 2. All numeric fields are nullable — BenchLM/ZeroEval use null liberally.
// 3. Schemas are permissive on shape (array lengths, optional fields) but
//    strict on types (string must be string, number must be number).
// 4. validateXxx() wrappers return {success, data?, error?} — callers
//    decide whether to abort or fall back to graceful degradation.
// ================================================================

import { z } from "zod";

// ---------- 1. BenchLM /data/models.json (272 items) ----------
// We consume: slug, model, creator, displayScore, overallRank,
//   scores.displayCategoryScores (8 categories),
//   coverage.scoreConfidence, coverage.trustedBenchmarkCount,
//   releaseDate, family.supersedesModelKey, family.isCanonicalFamilyEntry,
//   family.relatedModelKeys (for Función K).

const BenchlmCategoryScoresSchema = z.object({
  agentic: z.number().nullable(),
  coding: z.number().nullable(),
  reasoning: z.number().nullable(),
  multimodalGrounded: z.number().nullable(),
  knowledge: z.number().nullable(),
  multilingual: z.number().nullable(),
  instructionFollowing: z.number().nullable(),
  math: z.number().nullable(),
});

const BenchlmFamilySchema = z.object({
  familyKey: z.string().optional(),
  familyName: z.string().optional(),
  isCanonicalFamilyEntry: z.boolean().nullable().optional(),
  supersedesModelKey: z.string().nullable().optional(),
  relatedModelKeys: z.array(z.string()).nullable().optional(),
});

const BenchlmItemSchema = z.object({
  slug: z.string(),
  canonicalModelKey: z.string().optional(),
  model: z.string(),
  creator: z.string().optional(),
  displayScore: z.number().nullable().optional(),
  overallRank: z.number().nullable().optional(),
  releaseDate: z.string().nullable().optional(),
  scores: z
    .object({
      displayCategoryScores: BenchlmCategoryScoresSchema.nullable().optional(),
    })
    .nullable()
    .optional(),
  coverage: z
    .object({
      scoreConfidence: z.number().nullable().optional(),
      trustedBenchmarkCount: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
  family: BenchlmFamilySchema.nullable().optional(),
});

export const BenchlmModelsSchema = z.object({
  schemaVersion: z.string().optional(),
  generatedAt: z.string().optional(),
  items: z.array(BenchlmItemSchema),
});

export type BenchlmItem = z.infer<typeof BenchlmItemSchema>;

// ---------- 2. BenchLM /data/price-index.json (41 months) ----------
// We consume: series[] (the monthly index values for frontier/mid/budget).
// The envelope (headline, subIndexes, constituents) is informative only.

const PriceIndexSeriesPointSchema = z.object({
  month: z.string(), // "2023-03"
  frontier: z.number().nullable().optional(),
  frontierMedian: z.number().nullable().optional(),
  mid: z.number().nullable().optional(),
  midMedian: z.number().nullable().optional(),
  budget: z.number().nullable().optional(),
  budgetMedian: z.number().nullable().optional(),
});

export const BenchlmPriceIndexSchema = z.object({
  schemaVersion: z.string().optional(),
  baseMonth: z.string().optional(),
  series: z.array(PriceIndexSeriesPointSchema),
});

export type PriceIndexSeriesPoint = z.infer<typeof PriceIndexSeriesPointSchema>;

// ---------- 3. BenchLM /data/stats.json (28 citable stats) ----------
const BenchlmStatItemSchema = z.object({
  statId: z.string(),
  label: z.string().optional(),
  value: z.string().optional(),
  sentence: z.string().optional(),
  anchorUrl: z.string().optional(),
});

export const BenchlmStatsSchema = z.object({
  schemaVersion: z.string().optional(),
  items: z.array(BenchlmStatItemSchema),
});

export type BenchlmStatItem = z.infer<typeof BenchlmStatItemSchema>;

// ---------- 4. BenchLM /data/pricing.json — only 2 fields consumed ----------
// Sección 2.2 of plan v2.0: scorePerOutputDollar + note.
// We do NOT bring the full pricing.json (LiteLLM already covers prices).

const BenchlmPricingItemSchema = z.object({
  canonicalModelKey: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  scorePerOutputDollar: z.number().nullable().optional(),
  note: z.string().nullable().optional(),
});

export const BenchlmPricingSchema = z.object({
  schemaVersion: z.string().optional(),
  items: z.array(BenchlmPricingItemSchema),
});

export type BenchlmPricingItem = z.infer<typeof BenchlmPricingItemSchema>;

// ---------- 5. BenchLM /data/leaderboard.json — envelope only (Función L) ----------
// Sección 2.3 of plan v2.0: only counts.categories (8 numbers). NOT the 124 items.
export const BenchlmLeaderboardEnvelopeSchema = z.object({
  schemaVersion: z.string().optional(),
  counts: z.object({
    overall: z.number().optional(),
    categories: z.record(z.string(), z.number()).optional(),
  }).optional(),
});

// ---------- 6. ZeroEval /v1/models/metrics (130 items) ----------
// We consume: model_id, failure_rate, p95_latency, avg_throughput, total_calls.

const ZeroEvalMetricItemSchema = z.object({
  model_id: z.string(),
  total_calls: z.number().optional(),
  failed_calls: z.number().optional(),
  failure_rate: z.number().optional(),
  avg_throughput: z.number().optional().nullable(),
  p95_latency: z.number().optional().nullable(),
  avg_latency: z.number().optional().nullable(),
  avg_ttft: z.number().optional().nullable(),
});

// The API returns a bare array (not wrapped in {data: [...]}).
export const ZeroEvalMetricsSchema = z.array(ZeroEvalMetricItemSchema);

export type ZeroEvalMetricItem = z.infer<typeof ZeroEvalMetricItemSchema>;

// ================================================================
// Validation wrappers — return {success, data?, error?}
// Callers can decide: abort (cron) vs fall back (runtime dashboard).
// ================================================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function validateBenchlmModels(raw: unknown): ValidationResult<z.infer<typeof BenchlmModelsSchema>> {
  const r = BenchlmModelsSchema.safeParse(raw);
  return r.success ? { success: true, data: r.data } : { success: false, error: r.error.message };
}

export function validateBenchlmPriceIndex(raw: unknown): ValidationResult<z.infer<typeof BenchlmPriceIndexSchema>> {
  const r = BenchlmPriceIndexSchema.safeParse(raw);
  return r.success ? { success: true, data: r.data } : { success: false, error: r.error.message };
}

export function validateBenchlmStats(raw: unknown): ValidationResult<z.infer<typeof BenchlmStatsSchema>> {
  const r = BenchlmStatsSchema.safeParse(raw);
  return r.success ? { success: true, data: r.data } : { success: false, error: r.error.message };
}

export function validateBenchlmPricing(raw: unknown): ValidationResult<z.infer<typeof BenchlmPricingSchema>> {
  const r = BenchlmPricingSchema.safeParse(raw);
  return r.success ? { success: true, data: r.data } : { success: false, error: r.error.message };
}

export function validateBenchlmLeaderboardEnvelope(raw: unknown): ValidationResult<z.infer<typeof BenchlmLeaderboardEnvelopeSchema>> {
  const r = BenchlmLeaderboardEnvelopeSchema.safeParse(raw);
  return r.success ? { success: true, data: r.data } : { success: false, error: r.error.message };
}

export function validateZeroEvalMetrics(raw: unknown): ValidationResult<z.infer<typeof ZeroEvalMetricsSchema>> {
  const r = ZeroEvalMetricsSchema.safeParse(raw);
  return r.success ? { success: true, data: r.data } : { success: false, error: r.error.message };
}
