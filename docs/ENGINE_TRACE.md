# 🎬 Engine Trace — SelectIA v3.3.1

> Estructura completa del `EngineTrace` y los 36 pasos de la animación. Para que una IA entienda qué dato va en cada capa y paso.

---

## Estructura EngineTrace

```typescript
interface EngineTrace {
  query: string;                    // Query original del usuario
  mode: OperationMode;              // Modo solicitado
  profile: ProfileId | undefined;   // Perfil opcional
  computationTimeMs: number;        // Tiempo total

  capa1: {
    rawQuery: string;               // Query sin normalizar
    normalized: string;             // Lowercase, sin acentos
    tokensRaw: string[];            // Tokens antes de filtrar
    tokensFiltered: string[];       // Después de quitar stopwords
    stemmedTokens: TraceTfIdfStem[];// Con TF, IDF, DF
    totalTokens: number;            // Count
    categoryScores: TraceCategoryScore[]; // 8 categorías con scores
    entities: EntityDetection;      // 6 entidades detectadas
    multiIntent?: { category: TaskCategory; weight: number }[];
    winner: { category: TaskCategory; label: string; score: number };
  };

  capa1_5: {
    requestedMode: OperationMode;   // Modo que el usuario pidió
    manualOverride: boolean;        // Si el usuario forzó el modo
    detectedMode: OperationMode | null; // Modo detectado por keyword
    matchedKeyword: string | null;
    activeMode: OperationMode;      // Modo final usado
    modeSource: "manual" | "profile" | "keyword";
  };

  capa2: {
    totalModels: number;            // Modelos totales en catálogo
    filters: TraceFilterRule[];     // Cada filtro aplicado
    qualityGate: {
      before: number;               // Modelos antes del quality gate
      hasII: number;                // Cuántos tienen II
      hasElo: number;
      hasCoding: number;
      isFree: number;
      after: number;                // Modelos después
      applied: boolean;             // Si se aplicó (≥3 candidatos)
      benchlmConfidenceExcluded?: number; // Excluidos por confidence=1
    };
    finalCandidates: number;        // Candidatos finales para TOPSIS
  };

  capa3: {
    mode: OperationMode;
    category: TaskCategory;
    weights: Array<{ criterion: string; label: string; weight: number }>; // 8 pesos
    sumWeights: number;             // Debe ser 1.0
    nonZeroWeights: number[];       // Pesos > 0
    ahp: {
      n: number;                    // Número de criterios no-cero
      lambdaMax: number;            // Eigenvalue máximo
      CI: number;                   // Consistency Index
      RI: number;                   // Random Index
      CR: number;                   // Consistency Ratio
      passes: boolean;              // CR < 0.1
    };
  };

  capa4: {
    candidates: TraceCandidateMetrics[]; // Métricas de cada candidato
    denominators: Record<string, number>; // Denominadores de normalización
    normalizedMatrix: TraceMatrixRow[];
    weightedMatrix: TraceMatrixRow[];
    idealBest: Record<string, number>;   // A+
    idealWorst: Record<string, number>;  // A-
    distances: TraceDistanceRow[];
    antiFreeBad: {
      applied: boolean;
      bestPaidII: number;
      bestFreeII: number;
      threshold: number;            // 0.7
      triggered: boolean;
    };
    top3: Array<{ rank: number; modelId: string; modelName: string; score: number }>;
  };

  capa5: {
    top3Criteria: Array<{ criterion: string; label: string; weight: number }>;
    winners: Array<{
      rank: number;
      modelName: string;
      score: number;
      reasons: string[];
    }>;
    tie: boolean;
    tieDelta: number;
    explanation: string;
  };
}
```

---

## 36 pasos de la animación

### CAPA 1 — Clasificación TF-IDF (10 pasos)

| Step | ID | Título | Qué muestra | Datos del trace |
|---|---|---|---|---|
| 1.1 | 1 | Consulta | Query original del usuario | `trace.capa1.rawQuery` |
| 1.2 | 2 | Normalización | Lowercase + strip acentos | `trace.capa1.normalized` |
| 1.3 | 3 | Tokenización | Split por espacios | `trace.capa1.tokensRaw`, `tokensFiltered` |
| 1.4 | 4 | Stemming Porter | Stems con TF/IDF/DF | `trace.capa1.stemmedTokens` |
| 1.5 | 5 | TF | Term Frequency por stem | `stemmedTokens[].tf` |
| 1.6 | 6 | IDF | Inverse Document Frequency | `stemmedTokens[].idf` |
| 1.7 | 7 | TF-IDF × categoría | 8 barras con scores | `trace.capa1.categoryScores` |
| 1.8 | 8 | Entidades | 6 entidades detectadas | `trace.capa1.entities` |
| 1.9 | 9 | Boosts | Multiplicadores por entidad | `categoryScores[].entityBoostMultiplier` |
| 1.10 | 10 | Ganador | Categoría ganadora | `trace.capa1.winner` |

### CAPA 1.5 — Detección de modo (1 paso)

| Step | ID | Título | Datos |
|---|---|---|---|
| 5b | — | Modo | `trace.capa1_5.activeMode`, `modeSource` |

### CAPA 2 — Filtros duros (6 pasos)

| Step | ID | Título | Datos |
|---|---|---|---|
| 2.1 | 1 | Total | `trace.capa2.totalModels` |
| 2.2 | 2 | research-only | Filter rule: eliminated, remaining |
| 2.3 | 3 | HF disabled | Filter rule |
| 2.4 | 4 | Solo Gratis | Filter rule (si modo solo-gratis) |
| 2.5 | 5 | Por categoría | Filter rule (jsonMode, ollama, speed≥30) |
| 2.6 | 6 | Quality gate | `qualityGate.hasII/hasElo/hasCoding/isFree` + piso de calidad |

### CAPA 3 — AHP + CR (7 pasos)

| Step | ID | Título | Datos |
|---|---|---|---|
| 3.1 | 1 | Set de pesos | `trace.capa3.mode`, `category` |
| 3.2 | 2 | Pesos | 8 barras con `weights[].weight` |
| 3.3 | 3 | Σ = 1 | `trace.capa3.sumWeights` |
| 3.4 | 4 | Matriz A[i][j] | Matriz pairwise reconstruida |
| 3.5 | 5 | λ_max | `trace.capa3.ahp.lambdaMax` |
| 3.6 | 6 | CI | `trace.capa3.ahp.CI` |
| 3.7 | 7 | CR | `trace.capa3.ahp.CR`, `passes` |

### CAPA 4 — Ranking TOPSIS (8 pasos)

| Step | ID | Título | Datos |
|---|---|---|---|
| 4.1 | 1 | Métricas | `candidates[].raw` (8 valores × N candidatos) |
| 4.2 | 2 | Normalización | `normalizedMatrix[].values` |
| 4.3 | 3 | × pesos | `weightedMatrix[].values` |
| 4.4 | 4 | Ideal/anti-ideal | `idealBest`, `idealWorst` |
| 4.5 | 5 | Distancias | `distances[].dBest`, `dWorst` |
| 4.6 | 6 | C | `distances[].C` (closeness coefficient) |
| 4.7 | 7 | Ranking | `distances` sorted by C desc |
| 4.8 | 8 | Anti-gratis-malo | `antiFreeBad.triggered` |

### CAPA 5 — Explicación (4 pasos)

| Step | ID | Título | Datos |
|---|---|---|---|
| 5.1 | 1 | Top-3 criterios | `top3Criteria` |
| 5.2 | 2 | Razones | `winners[].reasons` |
| 5.3 | 3 | Empate | `tie`, `tieDelta` |
| 5.4 | 4 | Explicación | `explanation` + footer "Fuentes de datos usadas" |

---

## TraceCandidateMetrics

```typescript
interface TraceCandidateMetrics {
  modelId: string;
  modelName: string;
  provider: string;
  raw: {
    efficiencyCost: number;    // blendedPrice / II (0 si FREE en MYPE)
    elo: number;                // 1200 baseline
    intelligenceIndex: number;  // AA II (no BenchLM desde v3.3.1)
    codingIndex: number;        // 25 baseline
    agenticIndex: number;       // 25 baseline
    speed: number;              // 50 baseline, cap 500
    context: number;            // cap 256K
    reliability: number;        // 1 - FR, o 0.95 baseline
  };
  imputed: {
    elo: boolean;
    intelligenceIndex: boolean;
    codingIndex: boolean;
    agenticIndex: boolean;
    speed: boolean;
    reliability: boolean;       // Siempre false (baseline no es imputación)
  };
  isImputed: boolean;            // true si cualquier imputed es true
}
```

---

## TraceFilterRule

```typescript
interface TraceFilterRule {
  rule: string;          // "license !== 'research-only'"
  description: string;   // "Excluye modelos solo de investigación"
  eliminated: number;    // Cuántos eliminó
  remaining: number;     // Cuántos quedan
}
```

**Filtros que aparecen en trace.capa2.filters**:
1. `license !== 'research-only'`
2. `hfDisabled !== true`
3. `mode === 'solo-gratis'` (si aplica)
4. `mode === 'mype'` → ceiling $1/M (si aplica)
5. `category-specific (${winnerCat})`
6. `quality-floor (calidad, II ≥ 30)` (si modo calidad)

---

## Modo Traza — Badges de proveniencia

Cuando `traceMode === true` en Step 4.1, cada celda muestra un badge con la fuente:

| Métrica | Badge si tiene dato | Badge si imputado |
|---|---|---|
| effCost | "LiteLLM" | — (nunca imputado) |
| elo | "Arena AI" | "imputado" |
| intelligenceIndex | "Artificial Analysis" | "imputado" |
| codingIndex | "Artificial Analysis" | "imputado" |
| agenticIndex | "Artificial Analysis" | "imputado" |
| speed | "Artificial Analysis" | "imputado" |
| context | "provider" | — |
| reliability | "ZeroEval" | "imputado" (baseline 0.95) |

**Nota**: Desde v3.3.1, II NUNCA dice "BenchLM" porque BenchLM es display-only. El motor usa AA II para ranking.

---

## Step 5.4 — Footer "Fuentes de datos usadas"

Siempre visible (no solo en Modo Traza). Muestra conteos:

| Fuente | Qué aporta | Cómo se cuenta |
|---|---|---|
| Artificial Analysis | II, Coding, Agentic, Speed | `candidates.filter(c => !c.imputed.intelligenceIndex).length` |
| BenchLM | Scores por categoría (display only) | `candidates.filter(c => modelsMap.get(c.modelId)?.benchlmCategoryScores != null).length` |
| ZeroEval | Reliability (1 - FR) | `candidates.filter(c => c.raw.reliability !== 0.95).length` |
| Arena AI | Elo | `candidates.filter(c => !c.imputed.elo).length` |
| LiteLLM | Precios blended | `candidates.length` (todos) |
