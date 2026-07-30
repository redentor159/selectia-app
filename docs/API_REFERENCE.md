# 🔌 API Reference — SelectIA v3.3.1

> Toda función exportada con signature exacta, retorno, dependencias y efectos secundarios.

---

## Motor HRE-TOPSIS (`src/lib/engine/hre-topsis.ts`)

### `recommend()`

```typescript
export function recommend(
  query: string,           // Consulta del usuario en español
  models: AIModel[],       // Array de modelos (usualmente data.models)
  mode: OperationMode,     // "mype" | "calidad" | "equilibrado" | "solo-gratis"
  profile?: ProfileId,     // Perfil opcional ("A"-"F") para auto-detectar modo
  options?: RecommendOptions
): RecommendationResultExtended
```

**Retorna**: `RecommendationResultExtended` con winners (top 3), explanation, ahpCR, activeMode, modeSource, categories, intent.

**Dependencias**: `classifyIntent()`, `applyHardFilters()`, `getWeights()`, `topsisRank()`, `generateReasons()`, `generateExplanation()`.

**Efectos**: Ninguno (pure function, no muta models).

**Tiempo**: <10ms para 206 modelos.

---

### `traceRecommendation()`

```typescript
export function traceRecommendation(
  query: string,
  models: AIModel[],
  mode: OperationMode,
  profile?: ProfileId,
  options?: RecommendOptions
): EngineTrace
```

**Retorna**: `EngineTrace` con todas las capas (capa1, capa1_5, capa2, capa3, capa4, capa5) para la animación.

**Usado por**: `engine-animation-view.tsx` (36 pasos).

**Nota**: Llama a `recommend()` internamente para generar los winners reales.

---

### `TASK_CATEGORIES`

```typescript
export const TASK_CATEGORIES: { id: TaskCategory; label: string; icon: string }[]
```

8 categorías con label e icono Lucide. Usado por los chips de categoría en el Recomendador.

---

### `CATEGORY_CANONICAL_QUERIES`

```typescript
export const CATEGORY_CANONICAL_QUERIES: Record<TaskCategory, string>
```

Query representativo por categoría. Ej: `calculos → "calcular costos y presupuesto"`.

---

### `RecommendOptions`

```typescript
export interface RecommendOptions {
  manualModeOverride?: boolean;  // Si true, no detectar modo por keyword
  queryText?: string;            // Texto alternativo para detección de keyword
  hardwareVram?: number;         // Filtro 13: VRAM en GB
}
```

---

## AHP Verification (`src/lib/engine/ahp-verification.ts`)

### `calculateCR()`

```typescript
export function calculateCR(weights: number[]): AHPCrResult
```

**Retorna**: `{ cr: number; passes: boolean; n: number; lambdaMax: number; CI: number; RI: number }`

**Lógica**: Reconstruye matriz pairwise `A[i][j] = w[i]/w[j]`, calcula eigenvalue máximo, CI = (λmax - n)/(n-1), CR = CI/RI.

**RI table**: RI(1)=0, RI(2)=0, RI(3)=0.58, RI(4)=0.90, RI(5)=1.12, RI(6)=1.24, RI(7)=1.32, RI(8)=1.41, RI(9)=1.45, RI(10)=1.49.

**Pasa**: CR < 0.1 (umbral de Saaty).

---

## Orchestrator (`src/lib/orchestrator.ts`)

### `fetchDashboardData()`

```typescript
export async function fetchDashboardData(
  forceRefresh?: boolean,   // Si true, ignora cache
  customKey?: string        // API key custom del usuario
): Promise<DashboardData>
```

**Cache**: 30 min en memoria (CACHE_TTL = 1000 * 60 * 30).

**Llama a**: `runAllFetchers()` que ejecuta 13 fetchers en paralelo.

---

### `forceRefreshDashboardData()`

```typescript
export async function forceRefreshDashboardData(
  customKey?: string
): Promise<DashboardData>
```

Ignora cache, siempre llama a `runAllFetchers()`.

---

### `getHealthStatus()`

```typescript
export async function getHealthStatus(): Promise<{
  status: "green" | "yellow" | "red";
  models: number;
  sources: { green: number; yellow: number; red: number; total: number };
  lastUpdated: string;
  cacheAgeMs: number;
  aaQuota: { limit: number; remaining: number; reset: string; tier: string; retryAfter?: null };
}>
```

---

### `fetchSingleModelById()`

```typescript
export async function fetchSingleModelById(
  modelId: string,
  customKey?: string
): Promise<AARawModel | null>
```

Busca un modelo individual por ID en la API de AA. Usado por `/api/refresh-model`.

---

### `sendNtfyAlert()`

```typescript
export async function sendNtfyAlert(
  title: string,
  message: string
): Promise<void>
```

Envía push notification a `ntfy.sh/{NTFY_TOPIC}`. No falla si no hay internet.

---

### `fetchWithRetry()`

```typescript
export async function fetchWithRetry(
  url: string,
  options?: { retries?: number; headers?: Record<string, string> }
): Promise<Response>
```

Fetch con retry exponencial (500ms, 1000ms). Timeout 12s.

---

### Inferencias (5 funciones)

```typescript
export function inferProvider(name: string): { provider, family, domain, color }
export function inferKnowledgeCutoff(name: string): string | null
export function inferParameters(modelName: string): string | null  // "70B"
export function inferMoE(modelName: string): boolean
export function inferLicense(name: string, provider: string): { license, licenseName }
export function inferCapabilities(modelName: string): Capabilities
export function inferFreeAccess(provider: string, openWeights: boolean, hasPrice: boolean): FreeAccessType
```

---

### Constantes exportadas

```typescript
export const PROVIDER_COLORS: Record<string, string>  // { OpenAI: "#10A37F", ... }
export const PROVIDER_DOMAINS: Record<string, string> // { OpenAI: "openai.com", ... }
```

---

## Validations (`src/lib/validations.ts`)

### Schemas Zod

```typescript
export const BenchlmModelsSchema: z.ZodObject        // 272 items
export const BenchlmPriceIndexSchema: z.ZodObject     // 41 meses
export const BenchlmStatsSchema: z.ZodObject           // 28 stats
export const BenchlmPricingSchema: z.ZodObject         // 226 items
export const BenchlmLeaderboardEnvelopeSchema: z.ZodObject // counts.categories
export const ZeroEvalMetricsSchema: z.ZodArray          // 130 items
```

### Validators

```typescript
export function validateBenchlmModels(raw: unknown): ValidationResult<BenchlmModels>
export function validateBenchlmPriceIndex(raw: unknown): ValidationResult<BenchlmPriceIndex>
export function validateBenchlmStats(raw: unknown): ValidationResult<BenchlmStats>
export function validateBenchlmPricing(raw: unknown): ValidationResult<BenchlmPricing>
export function validateBenchlmLeaderboardEnvelope(raw: unknown): ValidationResult<BenchlmLeaderboardEnvelope>
export function validateZeroEvalMetrics(raw: unknown): ValidationResult<ZeroEvalMetrics>
```

Cada uno retorna `{ success: true, data }` o `{ success: false, error }`.

---

## Glosario (`src/lib/data/glossary.ts`)

```typescript
export const GLOSSARY_CATEGORIES: GlossaryCategoryMeta[]  // 8 categorías
export const GLOSSARY: GlossaryTerm[]                      // 176 términos
export function findTerm(term: string): GlossaryTerm | undefined
```

---

## Store (`src/store/dashboard-store.ts`)

```typescript
export const useDashboardStore: UseBoundStore<StoreApi<DashboardState>>
export const PROFILES: ProfileMeta[]  // 6 perfiles A-F
```

### Acciones del store

```typescript
setProfile(p: ProfileId): void
setCurrency(c: CurrencyCode): void
setCustomExchangeRate(code: string, rate: number): void
resetExchangeRate(code: string): void
setOperationMode(m: OperationMode): void
setCapabilitiesLogic(l: "and" | "or"): void
setActiveView(v: ViewId): void
setRecommendationQuery(q: string): void
toggleCompare(id: string): void
clearCompare(): void
setFilters(f: Partial<FilterState>): void
resetFilters(): void
toggleTheme(): void
setTheme(t: Theme): void
openGlossary(term?: string): void
closeGlossary(): void
openEngineExplained(): void
closeEngineExplained(): void
```

---

## Hooks (`src/hooks/`)

### `useDashboardData()`

```typescript
// src/hooks/use-dashboard-data.ts
export function useDashboardData(): UseQueryResult<DashboardData>
// queryKey: ["dashboard-data"]
// staleTime: 5 min, gcTime: 30 min
// refetchOnWindowFocus: false
```

### `useEffectiveDashboardData()`

```typescript
// src/hooks/use-effective-dashboard-data.ts
export function useEffectiveDashboardData(): UseQueryResult<DashboardData>
// Igual que useDashboardData pero mergea customExchangeRates del store
// Reemplaza data.currencies con rates personalizados si existen
```

**Usado por**: header, tabla-view, calculadora-view, simulador-roi-view, recomendador-view, guia-decision-view, overview-view, comparador-view.

---

## API Routes (`src/app/api/`)

### `GET /api/dashboard`
- **Archivo**: `src/app/api/dashboard/route.ts`
- **Retorna**: `DashboardData` JSON
- **Cache**: `force-static` con revalidate 300s (5 min)
- **Usa**: `fetchDashboardData()`

### `GET /api/health`
- **Retorna**: `{ status, models, sources, lastUpdated, cacheAgeMs, aaQuota }`
- **Usa**: `getHealthStatus()`

### `GET /api/hf-model?id={hfRepoId}`
- **Retorna**: Datos de HuggingFace Hub para un modelo específico
- **Usa**: `fetchHuggingFaceHub()` para un solo modelo
- **Lazy-load**: Solo se llama al abrir Ficha Técnica
- **404**: Normal para modelos propietarios (sin repo HF)

### `POST /api/ntfy-test`
- **Envía**: Alerta de prueba a ntfy.sh
- **Usa**: `sendNtfyAlert()`

### `GET /api/refresh-model?id={modelId}`
- **Retorna**: Modelo individual fresco desde AA
- **Usa**: `fetchSingleModelById()`

---

## Format (`src/lib/format.ts`)

```typescript
export function formatPricePerMillion(usd: number, currency: CurrencyRate): string
export function formatPrice(usd: number, currency: CurrencyRate): string
export function formatContext(ctx: number): string
export function formatVotes(v: number | null): string
export function formatMs(ms: number | null): string
export function getIntelligenceColor(ii: number | null): string
export function getEloColor(elo: number | null): string
export function computeBlendedUsd(m: AIModel): number
export function getCurrencyByCode(code: CurrencyCode, currencies: CurrencyRate[]): CurrencyRate | undefined
```

---

## Equivalences (`src/lib/equivalences.ts`)

```typescript
export const EQUIVALENCES: Partial<Record<CurrencyCode, Equivalence>>
export function getEquivalence(currency: CurrencyCode): Equivalence
// Equivalence = { icon, label, price }
// Ej: PEN → { icon: Utensils, label: "almuerzos", price: 18 }
```
