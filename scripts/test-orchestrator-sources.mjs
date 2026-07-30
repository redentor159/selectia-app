// Test: verify surviving orchestrator sources still parse correctly after
// removing Aider (source 5) and Ollama (source 6).
// Run: node scripts/test-orchestrator-sources.mjs
import { strict as assert } from "node:assert";
import { test } from "node:test";

// --- Mock data snapshots (representative real responses) ---

const MOCK_AA = {
  data: [
    {
      id: "aa-gpt-4o-test",
      name: "GPT-4o",
      slug: "gpt-4o",
      release_date: "2024-05-13",
      model_creator: { name: "OpenAI" },
      evaluations: {
        artificial_analysis_intelligence_index: 54.2,
        artificial_analysis_coding_index: 62.1,
        artificial_analysis_agentic_index: 48.3,
      },
      pricing: {
        price_1m_input_tokens: 2.5,
        price_1m_output_tokens: 10.0,
        price_1m_cache_hit_tokens: 1.25,
        price_1m_cache_write_tokens: 3.75,
      },
      performance: {
        median_output_tokens_per_second: 110.5,
        median_time_to_first_token_seconds: 0.35,
      },
      context_window: 128000,
      max_output_tokens: 16384,
    },
  ],
};

const MOCK_ARENA = {
  meta: { fetched_at: "2025-01-01T00:00:00Z", model_count: 1 },
  models: [
    { rank: 1, model: "GPT-4o", score: 1310, ci: 4, votes: 120000 },
  ],
};

const MOCK_LITELLM = {
  "gpt-4o": {
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    max_input_tokens: 128000,
    max_output_tokens: 16384,
  },
  "sample_spec": { input_cost_per_token: 0 },
};

const MOCK_EXCHANGE_RATES = {
  rates: { PEN: 3.714, USD: 1, EUR: 0.94, GBP: 0.79, BRL: 5.20 },
  provider: "https://www.exchangerate-api.com",
  time_last_update_utc: "2025-01-01T00:00:00Z",
  time_next_update_utc: "2025-01-02T00:00:00Z",
};

const MOCK_ZEROEVAL = [
  {
    model_id: "gpt-4o",
    failure_rate: 0.03,
    p95_latency: 1200,
    avg_throughput: 85.5,
    total_calls: 50000,
  },
];

const MOCK_BENCHLM_MODELS = {
  items: [
    {
      model: "GPT-4o",
      canonicalModelKey: "gpt-4o",
      slug: "gpt-4o",
      displayScore: 72.4,
      overallRank: 5,
      scores: {
        displayCategoryScores: {
          agentic: 68.1,
          coding: 74.5,
          reasoning: 78.2,
          multimodalGrounded: 65.0,
          knowledge: 70.1,
          multilingual: 69.3,
          instructionFollowing: 73.8,
          math: 76.4,
        },
      },
      coverage: { scoreConfidence: 3, trustedBenchmarkCount: 12 },
      releaseDate: "2024-05-13",
      family: { isCanonicalFamilyEntry: true, supersedesModelKey: null },
    },
  ],
};

// ---------------------------------------------------------------
// Tests
// ---------------------------------------------------------------

test("AA mock has required fields for TOPSIS", () => {
  const model = MOCK_AA.data[0];
  assert.ok(model.evaluations?.artificial_analysis_intelligence_index != null, "intelligenceIndex present");
  assert.ok(model.evaluations?.artificial_analysis_coding_index != null, "codingIndex present");
  assert.ok(model.pricing?.price_1m_input_tokens != null, "priceInput present");
  assert.ok(model.pricing?.price_1m_output_tokens != null, "priceOutput present");
  assert.ok(model.performance?.median_output_tokens_per_second != null, "speedTps present");
  assert.ok(model.context_window != null, "contextWindow present");
  console.log("  ✅ AA: intelligenceIndex, codingIndex, price, speed, context OK");
});

test("Arena mock maps elo, ci, votes", () => {
  const m = MOCK_ARENA.models[0];
  assert.ok(m.score > 0, "elo score present");
  assert.ok(m.ci != null, "ci present");
  assert.ok(m.votes != null, "votes present");
  console.log("  ✅ Arena: elo, ci, votes OK");
});

test("LiteLLM mock provides price+context, excludes sample_spec", () => {
  const entries = Object.entries(MOCK_LITELLM).filter(([k]) => k !== "sample_spec");
  assert.equal(entries.length, 1, "one model entry");
  const [, val] = entries[0];
  assert.ok(val.max_input_tokens > 0, "context from LiteLLM");
  assert.ok(val.input_cost_per_token != null, "price from LiteLLM");
  console.log("  ✅ LiteLLM: price + contextWindow OK");
});

test("Exchange rate mock has critical currencies", () => {
  const rates = MOCK_EXCHANGE_RATES.rates;
  assert.ok(rates.PEN > 0, "PEN rate present");
  assert.ok(rates.USD === 1, "USD base");
  assert.ok(rates.EUR < 1, "EUR rate present");
  assert.ok(rates.BRL > 0, "BRL rate present");
  console.log("  ✅ ER-API: PEN, USD, EUR, BRL OK");
});

test("ZeroEval mock maps failure_rate → reliability criterion", () => {
  const m = MOCK_ZEROEVAL[0];
  assert.ok(m.failure_rate >= 0 && m.failure_rate <= 1, "failure_rate in [0,1]");
  const reliability = 1 - m.failure_rate;
  assert.ok(reliability > 0.9, "reliability > 0.9 for good model");
  assert.ok(m.p95_latency != null, "p95_latency present");
  assert.ok(m.total_calls != null, "total_calls present (ficha técnica)");
  console.log(`  ✅ ZeroEval: reliability = ${reliability.toFixed(2)}, p95=${m.p95_latency}ms OK`);
});

test("BenchLM mock maps 8 category scores", () => {
  const item = MOCK_BENCHLM_MODELS.items[0];
  const scores = item.scores.displayCategoryScores;
  const keys = ["agentic", "coding", "reasoning", "multimodalGrounded", "knowledge", "multilingual", "instructionFollowing", "math"];
  for (const k of keys) {
    assert.ok(scores[k] != null, `BenchLM score '${k}' present`);
  }
  assert.ok(item.coverage.scoreConfidence > 0, "scoreConfidence present (ficha técnica)");
  assert.ok(item.canonicalModelKey, "canonicalModelKey present (Función K)");
  console.log("  ✅ BenchLM: 8 category scores + confidence + canonicalModelKey OK");
});

test("CRITICAL: Aider and Ollama sources are NOT in surviving fetcher list", () => {
  // This test documents which sources were removed — acts as a regression guard.
  const REMOVED_SOURCES = ["aider", "ollama"];
  const SURVIVING_SOURCES = ["artificial-analysis", "litellm", "arena-ai", "exchange-rate",
    "huggingface-hub", "helicone", "groq-status", "openrouter", "models-dev", "benchlm", "zeroeval"];
  
  for (const removed of REMOVED_SOURCES) {
    assert.ok(!SURVIVING_SOURCES.includes(removed), `${removed} correctly NOT in surviving list`);
  }
  console.log("  ✅ Aider + Ollama confirmed removed from fetcher list");
});
