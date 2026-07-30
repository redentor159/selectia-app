# 📖 Data Dictionary — SelectIA v3.3.1

> Referencia exhaustiva de todos los campos de datos. Diseñada para que una IA entienda cada campo sin leer el código fuente.

---

## AIModel (80+ campos)

### Identidad (8 campos)

| Campo | Tipo | Origen | Null behavior | Descripción |
|---|---|---|---|---|
| `id` | `string` | Artificial Analysis (UUID) | Nunca null | UUID único del modelo en AA |
| `name` | `string` | Artificial Analysis | Nunca null | Nombre display (ej: "GPT-5.5 (xhigh)") |
| `slug?` | `string` | Artificial Analysis | Si null, no se usa | Slug legible (ej: "gpt-5-5") |
| `provider` | `string` | `inferProvider(name)` | Nunca null | Nombre del proveedor (ej: "OpenAI") |
| `providerDomain` | `string` | `PROVIDER_DOMAINS[provider]` | Nunca null | Dominio web (ej: "openai.com") |
| `providerColor` | `string` | `PROVIDER_COLORS[provider]` | Nunca null | Color hex para UI (ej: "#10A37F") |
| `family` | `string` | `inferProvider(name)` | Nunca null | Familia del modelo (ej: "GPT") |
| `active` | `boolean` | Artificial Analysis | `true` por defecto | Si el modelo está activo en el mercado |

### Licencia (2 campos)

| Campo | Tipo | Origen | Null behavior | Descripción |
|---|---|---|---|---|
| `license` | `LicenseType` | `inferLicense(name, provider)` | Nunca null | Tipo: `commercial-open`, `conditional`, `api-paid`, `research-only`, `open-source-full` |
| `licenseName` | `string` | `inferLicense()` | Nunca null | Nombre legible (ej: "MIT", "Apache 2.0") |

### Precios (4 campos, todos USD por millón de tokens)

| Campo | Tipo | Origen | Null behavior | Descripción |
|---|---|---|---|---|
| `priceInputUsd` | `number \| null` | Artificial Analysis → LiteLLM fallback | Si null, `computeBlendedPriceUsd()` usa $5 estimado | Precio por 1M tokens de input |
| `priceOutputUsd` | `number \| null` | Artificial Analysis → LiteLLM fallback | Si null, estimado | Precio por 1M tokens de output |
| `priceCacheHitUsd` | `number \| null` | Artificial Analysis | Si null, no se muestra tooltip | Precio por 1M tokens cache hit (50-90% más barato) |
| `priceCacheWriteUsd` | `number \| null` | Artificial Analysis | Si null, no se muestra | Precio por 1M tokens cache write (~1.25x input) |

**Blended Price**: `priceInputUsd * 0.7 + priceOutputUsd * 0.3`. Si `isModelFree(m)` → 0. Si null → 5 (estimado conservador).

### Contexto (2 campos)

| Campo | Tipo | Origen | Null behavior | Descripción |
|---|---|---|---|---|
| `contextWindow` | `number` | AA `context_window ?? 8192` → LiteLLM `max_input_tokens` | Default 8192, LiteLLM lo rellena | Ventana de contexto en tokens. **Cap 256K** en TOPSIS. |
| `maxOutput` | `number` | AA `max_output_tokens ?? 4096` | Default 4096 | Máximo tokens de output |

### Benchmarks Artificial Analysis (3 campos)

| Campo | Tipo | Origen | Null behavior | TOPSIS baseline | Descripción |
|---|---|---|---|---|---|
| `intelligenceIndex` | `number \| null` | AA `evaluations.artificial_analysis_intelligence_index` | → 30 (II_BASELINE) | Intelligence Index v4.1 (0-100) |
| `codingIndex` | `number \| null` | AA `evaluations.artificial_analysis_coding_index` | → 25 (CODING_BASELINE) | Coding Index (0-100) |
| `agenticIndex` | `number \| null` | AA `evaluations.artificial_analysis_agentic_index` | → 25 (AGENTIC_BASELINE) | Agentic Index (0-100) |

### Performance (4 campos)

| Campo | Tipo | Origen | Null behavior | Descripción |
|---|---|---|---|---|
| `speedTps` | `number \| null` | AA `performance.median_output_tokens_per_second` | → 50 (SPEED_BASELINE). **Cap 500** en TOPSIS. | Tokens por segundo |
| `ttftMs` | `number \| null` | AA `performance.median_time_to_first_token_seconds * 1000` | Si null, no se muestra | Time to First Token en ms |
| `ttftAnswerMs?` | `number \| null` | AA (gap #9) | Si null, no se muestra | TTFT del primer token de respuesta (después del thinking) |
| `endToEndMs?` | `number \| null` | AA (gap #9) | Si null, no se muestra | Tiempo total 500-token response en ms |

### Arena AI Elo (3 campos)

| Campo | Tipo | Origen | Null behavior | TOPSIS baseline | Descripción |
|---|---|---|---|---|---|
| `elo` | `number \| null` | Arena AI (`arenaEloMap`) | → 1200 (ELO_BASELINE) | Rating Elo humano |
| `eloCi` | `number \| null` | Arena AI | Si null, no se muestra | Intervalo de confianza (±) |
| `eloVotes` | `number \| null` | Arena AI | Si null, no se muestra | Número de votos en Arena |

### Capabilities (1 campo, 10 sub-campos)

| Campo | Tipo | Origen | Descripción |
|---|---|---|---|
| `capabilities` | `Capabilities` | `inferCapabilities(name)` + AA | 10 booleanos |

| Sub-campo | Default | Inferencia |
|---|---|---|
| `toolUse` | `false` | Si nombre contiene "function" o "tool" |
| `vision` | `false` | Si nombre contiene "vision" o "vl" o "omni" |
| `jsonMode` | `false` | Si nombre contiene "json" |
| `reasoning` | `false` | Si nombre contiene "reasoning" o "thinking" o "o1" o "o3" |
| `audioInput` | `false` | Si nombre contiene "audio" o "voice" |
| `audioOutput` | `false` | Si nombre contiene "audio" o "voice" |
| `pdf` | `false` | Si nombre contiene "pdf" |
| `webSearch` | `false` | Si nombre contiene "web" o "search" |
| `interleavedReasoning` | `false` | Manual |
| `extendedThinking` | `false` | Si nombre contiene "thinking" o "extended" |

### Metadata (3 campos)

| Campo | Tipo | Origen | Null behavior | Descripción |
|---|---|---|---|---|
| `knowledgeCutoff` | `string \| null` | `inferKnowledgeCutoff(name)` | Si null, no se muestra | Fecha límite datos (ej: "Apr 2025") |
| `releaseDate` | `string \| null` | Artificial Analysis | Si null, no se muestra | Fecha de lanzamiento ISO |
| `parameters` | `string \| null` | `inferParameters(name)` | Si null, no se muestra | Tamaño (ej: "70B", "236B (MoE)") |

### Acceso (4 campos)

| Campo | Tipo | Origen | Descripción |
|---|---|---|---|
| `freeAccess` | `FreeAccessType` | `inferFreeAccess(provider, openWeights, hasPrice)` | `free-100`, `free-limited`, `free-registration`, `paid-only` |
| `inferenceProviders` | `InferenceProvider[]` | AA + inferencia | Proveedores que sirven el modelo |
| `openWeights` | `boolean` | `inferLicense()` | Si los pesos son descargables |
| `ollamaAvailable` | `boolean` | `openWeights` | Si está en Ollama (para uso offline) |
| `isMoE` | `boolean` | `inferMoE(name)` | Si es Mixture of Experts |

### HuggingFace Hub (17 campos)

| Campo | Tipo | Origen | Lazy-load | Descripción |
|---|---|---|---|---|
| `hfRepoId?` | `string \| null` | `matchHfEnrichment()` | No | ID del repo (ej: "google/gemini-3-5-flash") |
| `hfGated?` | `boolean \| string \| null` | HF API | No | `false` / `"manual"` / `"auto"` |
| `hfDisabled?` | `boolean \| null` | HF API | No | Si HF deshabilitó el repo |
| `hfLastModified?` | `string \| null` | HF API | No | ISO timestamp última modificación |
| `hfCreatedAt?` | `string \| null` | HF API | No | ISO timestamp creación |
| `hfDownloads?` | `number \| null` | HF API | No | Downloads acumulados |
| `hfLikes?` | `number \| null` | HF API | No | Likes de la comunidad |
| `hfTrendingScore?` | `number \| null` | HF API (expand) | No | Velocidad reciente de adopción |
| `hfParameters?` | `number \| null` | HF safetensors | No | Parámetros exactos |
| `hfSafetensorsDetail?` | `Record<string, number> \| null` | HF API | No | {BF16: 32B, F8_E4M3: 680B, ...} |
| `hfTags?` | `string[] \| null` | HF API | No | Tags del repo (para GGUF detection) |
| `hfHasGguf?` | `boolean \| null` | Tags + siblings | No | Si tiene archivos .gguf |
| `hfSiblingsCount?` | `number \| null` | HF API | No | Número de archivos en repo |
| `hfGgufFiles?` | `string[] \| null` | HF API | No | Nombres de archivos .gguf |
| `hfInference?` | `string \| null` | HF API | No | "warm" / "cold" / null |
| `hfSpacesCount?` | `number \| null` | HF API | No | Número de HF Spaces |
| `hfPipelineTag?` | `string \| null` | HF API | No | "text-generation", "fill-mask", etc. |
| `hfBaseModel?` | `string \| null` | HF API | No | Modelo padre si es fine-tune |

**Lazy-load (solo al abrir Ficha Técnica)**:

| Campo | Tipo | Origen | Descripción |
|---|---|---|---|
| `hfSpacesSample?` | `string[] \| null` | `/api/hf-model` | 3 nombres de Spaces |
| `hfModelIndex?` | `any \| null` | `/api/hf-model` | Benchmarks publicados por el autor |
| `hfWidgetData?` | `any[] \| null` | `/api/hf-model` | Prompts de ejemplo |
| `hfChatTemplate?` | `string \| null` | `/api/hf-model` | Template Jinja exacto |
| `hfTransformersInfo?` | `{ auto_model?: string; processor?: string } \| null` | `/api/hf-model` | Info de transformers |
| `hfSha?` | `string \| null` | `/api/hf-model` | Commit hash |
| `hfUsedStorage?` | `number \| null` | `/api/hf-model` | Bytes usados |
| `hfLibraryName?` | `string \| null` | `/api/hf-model` | "transformers", "diffusers", etc. |

### BenchLM (15 campos)

| Campo | Tipo | Origen | Null behavior | Descripción |
|---|---|---|---|---|
| `benchlmSlug?` | `string \| null` | BenchLM `models.json` → `item.slug` | Si null, no hay match BenchLM | Slug en BenchLM (ej: "gpt-5-5") |
| `benchlmDisplayScore?` | `number \| null` | BenchLM `item.displayScore` | Si null, no se muestra | Score overall 0-100 |
| `benchlmOverallRank?` | `number \| null` | BenchLM `item.overallRank` | Si null, no se muestra | Rank entre rankingEligible |
| `benchlmCategoryScores?` | `{8 campos} \| null` | BenchLM `scores.displayCategoryScores` | Si null, fallback a AA II | 8 scores: agentic, coding, reasoning, multimodalGrounded, knowledge, multilingual, instructionFollowing, math |
| `benchlmScoreConfidence?` | `number \| null` | BenchLM `coverage.scoreConfidence` | Si null, no se aplica gate | 1-3 (1=baja, 3=alta). Gate excluye paid con confidence=1 |
| `benchlmTrustedBenchmarkCount?` | `number \| null` | BenchLM `coverage.trustedBenchmarkCount` | Si null, no se muestra | Número de benchmarks verificados |
| `benchlmReleaseDate?` | `string \| null` | BenchLM `item.releaseDate` | Si null, no se muestra | Fecha de lanzamiento ISO |
| `benchlmSupersededBy?` | `string \| null` | Calculado de `successorMap` | Si null, es vigente | Slug del sucesor (Función K) |
| `benchlmSupersededByName?` | `string \| null` | Calculado de `successorMap` | Si null, es vigente | Nombre del sucesor |
| `benchlmIsCanonicalEntry?` | `boolean \| null` | BenchLM `family.isCanonicalFamilyEntry` | Si null, no se muestra | True = entrada canónica de familia |
| `benchlmScorePerOutputDollar?` | `number \| null` | BenchLM `pricing.json` | Si null, no se muestra | Score por $ de output (cross-validación) |
| `benchlmPricingNote?` | `string \| null` | BenchLM `pricing.json` | Si null, no se muestra | Nota citable sobre fuente del precio |

**Nota**: BenchLM category scores son **display-only** desde v3.3.1. NO afectan el ranking TOPSIS. El motor usa AA `intelligenceIndex` para consistencia de escala.

### ZeroEval (4 campos)

| Campo | Tipo | Origen | Null behavior | TOPSIS behavior | Descripción |
|---|---|---|---|---|---|
| `zeroevalFailureRate?` | `number \| null` | ZeroEval `/v1/models/metrics` → `failure_rate` | → 0.05 (baseline) | `reliability = 1 - FR` | 0-1 (0.107 = 10.7% fallo) |
| `zeroevalP95Latency?` | `number \| null` | ZeroEval → `p95_latency` | Si null, no se muestra | No afecta TOPSIS | P95 latency en ms |
| `zeroevalAvgThroughput?` | `number \| null` | ZeroEval → `avg_throughput` | Si null, no se muestra | No afecta TOPSIS | Tokens/seg en producción |
| `zeroevalTotalCalls?` | `number \| null` | ZeroEval → `total_calls` | Si null, no se muestra | No afecta TOPSIS | Total llamadas monitoreadas |

**Reliability en TOPSIS**: `1 - zeroevalFailureRate` si hay datos, sino `0.95` (RELIABILITY_BASELINE). No se marca como imputado (es asunción razonable, no gap de datos).

---

## DashboardData (campos de nivel dashboard)

| Campo | Tipo | Origen | Descripción |
|---|---|---|---|
| `models` | `AIModel[]` | Orchestrator | Array de 206 modelos |
| `currencies` | `CurrencyRate[]` | Open ER-API | 21 monedas con `rateFromUsd` |
| `exchangeRateProvider` | `string` | Open ER-API | URL del proveedor |
| `exchangeRateUpdated` | `string` | Open ER-API | ISO timestamp |
| `exchangeRateNextUpdate` | `string` | Open ER-API | ISO timestamp |
| `sources` | `SourceHealth[]` | Orchestrator | 13 fuentes con status/latency |
| `aaQuota` | `{limit, remaining, reset, tier, retryAfter?}` | AA HTTP headers | Cuota de la API |
| `generatedAt` | `string` | Orchestrator | ISO timestamp generación |
| `arenaFetchedAt` | `string` | Arena AI | ISO timestamp |
| `arenaModelCount` | `number` | Arena AI | Número de modelos con Elo |
| `priceIndex?` | `PriceIndexPoint[]` | BenchLM `price-index.json` | 41 meses de historia de precios |
| `benchlmStats?` | `BenchlmStat[]` | BenchLM `stats.json` | 28 estadísticas citables |
| `benchlmCategoryCoverage?` | `Record<string, number>` | BenchLM `leaderboard.json` envelope | {agentic: 103, coding: 101, ...} |

---

## WeightSet (8 criterios TOPSIS)

```typescript
interface WeightSet {
  efficiencyCost: number;   // 0-0.45 (MYPE dominante, Calidad=0)
  elo: number;              // 0-0.50 (Calidad redacción dominante)
  intelligenceIndex: number;// 0.05-0.60 (Calidad cálculos dominante)
  codingIndex: number;      // 0-0.55 (programación)
  agenticIndex: number;     // 0-0.55 (agentes)
  speed: number;            // 0.05-0.55 (rapidas)
  context: number;          // 0-0.30 (documentos, offline)
  reliability: number;      // 0.05-0.20 (offline crítico)
}
```

**Regla**: Los 8 valores SIEMPRE suman 1.0000. Verificado en runtime (DEV-only assertion).

---

## FilterState (14 filtros)

| Filtro | Tipo | Default | Descripción |
|---|---|---|---|
| `search` | `string` | `""` | Búsqueda por nombre |
| `providers` | `string[]` | `[]` | Filtrar por proveedor |
| `licenses` | `LicenseType[]` | `[]` | Filtrar por licencia |
| `capabilities` | `string[]` | `[]` | Filtrar por capacidades |
| `freeAccess` | `FreeAccessType \| "all"` | `"all"` | Tipo de acceso |
| `maxPrice` | `number` | `0` (sin límite) | Precio blended máximo |
| `minContext` | `number` | `0` | Contexto mínimo |
| `minIntelligence` | `number` | `0` | II mínimo |
| `minSpeed` | `number` | `0` | Speed mínimo |
| `minKnowledgeCutoff` | `string` | `""` | Cutoff mínimo |
| `reasoningOnly` | `boolean` | `false` | Solo modelos con reasoning |
| `extendedThinkingOnly` | `boolean` | `false` | Solo extended thinking |
| `minEloVotes` | `number` | `0` | Votos Elo mínimos |
| `maxEloCi` | `number` | `0` | Confianza Elo máxima |
| `hardwareFilterVram?` | `number` | `0` | Filtro 13: VRAM GPU |
| `minReliability?` | `number` | `0` | Filtro 14: Confiabilidad mínima |

---

## PriceIndexPoint

```typescript
interface PriceIndexPoint {
  month: string;                  // "2023-03" ... "2026-07"
  frontier: number | null;        // Índice (base 2023-03 = 100)
  frontierMedian: number | null;  // Mediana blended USD/M
  mid: number | null;
  midMedian: number | null;
  budget: number | null;
  budgetMedian: number | null;
}
```

---

## BenchlmStat

```typescript
interface BenchlmStat {
  statId: string;       // "frontier-price-drop"
  label: string;        // "Frontier price drop since March 2023"
  value: string;        // "−88% (index: 12)"
  sentence: string;     // "Frontier LLM token prices are 88% below..."
  anchorUrl: string;    // https://benchlm.ai/stats/llm-pricing#frontier-price-drop
}
```

---

## SourceHealth

```typescript
interface SourceHealth {
  id: string;           // "artificial-analysis"
  name: string;         // "Artificial Analysis"
  status: "green" | "yellow" | "red";
  latencyMs: number;    // Tiempo de respuesta
  lastSync: string;     // ISO timestamp
  remaining?: number;   // Rate limit remaining
  limit?: number;       // Rate limit total
  tier?: string;        // Tier de la API
  note?: string;        // Nota informativa
}
```

---

## HRETOPSISResult

```typescript
interface HRETOPSISResult {
  model: AIModel;
  score: number;         // 0-1 (Coeficiente de Cercanía C)
  rank: number;          // 1, 2, 3
  reasons: string[];     // 3 razones en español
  metrics: {
    efficiencyCost: number;
    elo: number | null;
    intelligenceIndex: number | null;  // AA II (no BenchLM)
    codingIndex: number | null;
    agenticIndex: number | null;
    speed: number | null;
    context: number;
    reliability: number | null;        // 1 - FR, o 0.95 baseline
  };
}
```

---

## Tipos enumerados

### LicenseType
```typescript
type LicenseType =
  | "commercial-open"    // Apache 2.0, MIT, BSD, CC BY 4.0
  | "conditional"        // Llama Community, Gemma Terms
  | "api-paid"           // OpenAI, Anthropic, Google Pro
  | "research-only"      // Solo investigación
  | "open-source-full";  // Open Source completo
```

### FreeAccessType
```typescript
type FreeAccessType =
  | "free-100"           // 100% gratis
  | "free-limited"       // Gratis con límite
  | "free-registration"  // Gratis con registro/tarjeta
  | "paid-only";         // Solo pago
```

### OperationMode
```typescript
type OperationMode =
  | "mype"               // Presupuesto cero (effCost dominante 0.45)
  | "calidad"            // Calidad máxima (effCost=0, II dominante 0.50-0.60)
  | "equilibrado"        // Balance (effCost 0.15, II 0.35-0.45)
  | "solo-gratis";       // Solo modelos gratis (hereda pesos MYPE)
```

### TaskCategory
```typescript
type TaskCategory =
  | "redaccion"          // → BenchLM instructionFollowing
  | "documentos"         // → BenchLM knowledge
  | "programacion"       // → BenchLM coding
  | "calculos"           // → BenchLM math
  | "offline"            // → BenchLM knowledge (proxy)
  | "rapidas"            // → BenchLM instructionFollowing (proxy)
  | "multilingue"        // → BenchLM multilingual
  | "agentes";           // → BenchLM agentic
```

### CurrencyCode (21 monedas)
```typescript
type CurrencyCode =
  | "PEN" | "USD" | "EUR" | "GBP"     // Originales
  | "BRL" | "MXN" | "COP" | "CLP" | "ARS" | "UYU" | "PYG" | "BOB" | "VES"  // LatAm
  | "GTQ" | "HNL" | "NIO" | "CRC" | "PAB" | "DOP" | "CUP"  // Centroamérica + Caribe
  | "CAD";  // Norteamérica
```

### Theme
```typescript
type Theme = "dark" | "light" | "blanco-puro" | "negro-puro";
// "dark" = Linear Oscuro
// "light" = Linear Claro
// "blanco-puro" = Blanco minimalista
// "negro-puro" = Negro minimalista
```
