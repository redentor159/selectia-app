# Design: Información del recomendador consistente (hre-topsis-display-consistente)

## Resumen de la decisión

La tasa viva y la moneda se enhebran desde el store hasta `generateReasons` mediante un nuevo campo opcional `options.currency` en `recommend()` (5to parámetro, aditivo) y un 6º parámetro opcional en `generateReasons`. Los valores con cap se toman de `ModelMetrics.speed/context` (ya capeados por `extractMetrics`, sin tocar el motor); los imputados se derivan con la bandera global `metrics.hasImputedData` + chequeo `model.<campo> == null`. Todo el formateo nuevo vive en `src/lib/format.ts` (helpers puros) y el badge usa redondeo por mayor remanente.

**Restricciones duras (repetidas del spec/proposal)**:
- Motor HRE-TOPSIS INTOCADO: misma fórmula TOPSIS, mismos pesos, caps (500 tok/s, 256K), baselines (Elo 1200, II 30, speed 50, coding/agentic 25, reliability 0.95), umbrales. Cero randomness. Mismas entradas → mismo ranking (bit-igual). Único cambio permitido en `hre-topsis.ts`: `generateReasons` + sus strings.
- Solo capa de presentación/explicación + fuentes dinámicas (store de moneda, `ModelMetrics.hasImputedData`, `freeAccess`, caps ya aplicados). Aditivo donde se pueda.
- Sin dependencias nuevas (ni packages).
- Fallback de tasa: único fallback permitido `rates.PEN ?? 3.714` (igual que hoy en `orchestrator.ts`).
- Estabilidad: valores por defecto que preservan el comportamiento actual si falta contexto.

## Flujo de datos

```
recomendador-view (.tsx)
  ├─ useEffectiveDashboardData() → data.currencies (con TC personalizados aplicados)
  ├─ getCurrencyByCode(data.currencies, store.currency) → currencyMeta
  ├─ rateIsFallback = sources["exchange-rate"]?.status !== "green"   (nuevo helper)
  ├─ recommend(q, models, mode, undefined, { ..., currency: { ...currencyMeta, isFallback } })
  │     └─ hre-topsis.recommend() → options.currency (opcional)
  │           └─ generateReasons(model, metrics, category, mode, weights, currency?)
  │                 └─ consume helpers de format.ts (formatPrice…, matiz de cap, imputado, eslogan)
  └─ Badge multi-intent: normalizePercentages(weights) → suma 100% exacto
```

## Mapa de cambio por archivo

| Archivo | Cambio | Firma/función | Impacto |
|---------|--------|---------------|---------|
| `src/lib/format.ts` | Aditivo (5 helpers nuevos, sin tocar nada existente) | `export interface RecommendCurrency { code; symbol; rateFromUsd; isFallback?: boolean }`; `costRateLabel(blendedUsd, cur: RecommendCurrency): string`; `sloganForFreeAccess(fa: FreeAccessType, verifiedFree: boolean): string \| null`; `normalizePercentages(weights: number[]): number[]` (mayor remanente); `buildMultiIntentText(parts: {key;label;weight}[], winnerLabel: string): string` | Cero regresión: solo exports nuevos. `format.ts` importa solo `types`. |
| `src/lib/engine/hre-topsis.ts` | SOLO `generateReasons` (+ import de format.ts) | `generateReasons(model, metrics, category, mode, weights, currency?: RecommendCurrency)` | Ranking bit-igual: nada de `extractMetrics`/`topsisRank`/weights cambia. |
| `src/components/dashboard/views/recomendador-view.tsx` | Derivación de moneda + badge | `const currency = useDashboardStore(s => s.currency)` (reactivo); pasar `options.currency`; reemplazo del bloque L305–310 por `normalizePercentages` + `buildMultiIntentText`; deps del `useMemo` L106–120 | Ragging mismo; solo display. |
| `src/lib/orchestrator.ts` | Ninguno (referencia) | — | Fuente de verdad de `currencies` (L915–923) y fallback `rates.PEN ?? 3.714` (L921). |
| `src/lib/types.ts` | Sin cambios | — | Shapes públicas `RecommendationResult`/`HRETOPSISResult` intactas. |

Nuevo contrato en `RecommendOptions` (hre-topsis.ts L1155):
```ts
export interface RecommendCurrency { code: string; symbol: string; rateFromUsd: number; isFallback?: boolean }
// RecommendOptions += currency?: RecommendCurrency   (opcional, aditivo)
```
Los callers que NO pasan `currency` (gerente, comparador, operario, ingeniero, trace) reciben exactamente el texto de hoy: `S/. (blended * 3.714)`, sin sufijos — comportamiento preservado por default.

## Algoritmo del badge (redondeo compensatorio / largest remainder)

```
function normalizePercentages(weights: number[]): number[] {
  total = Σ weights; if (total === 0) return pesos vacíos;
  raw = weights.map(w => (w / total) * 100);
  floors = raw.map(Math.floor);                        // enteros por defecto
  faltante = 100 - Σ floors;                           // puntos a distribuir (0..n)
  orden = raw.map((r, i) => ({ i, frac: r % 1 })).sort((a, b) => b.frac − a.frac);
  for (k = 0; k < faltante; k++) floors[orden[k % orden.length].i] += 1;  // +1 al de mayor remanente
  return floors; // Σ == 100 siempre
}
```
Los porcentajes mostrados ya NO se obtienen con `.toFixed(0)` por separado. Ej. `0.334/0.333/0.333` → `34/33/33` = 100.

## Strings nuevos propuestos (español neutro)

Razón de costo (con tasa viva, moneda del usuario, II que el ranking usó):
- Con tasa vigente: "Excelente eficiencia de costo: `{formatPrice(blended, currency)}`/M tokens blended con Intelligence Index de `{metrics.intelligenceIndex}`".
- Con fallback: mismo texto + sufijo ` (TC estimado)` — `isFallback === true`.
- Imputado en II: sustituir "Excelente eficiencia" por `Eficiencia de costo (II estimado): ...`.

Velocidad/contexto:
- Capped: `Velocidad de {metrics.speed} tok/s — valor con cap usado en el ranking` (o `Ventana de contexto de {formatContext(metrics.context)} — valor con cap (256K)`).
- Si el crudo excede el cap: ` (crudo: {model.speedTps} sin cap)` / ` (crudo: {formatContext(model.contextWindow)} sin cap)`.
- Imputado (sin dato del modelo): `Velocidad estimada: {metrics.speed} tok/s (baseline del motor)` — sin adjetivos "fluidas/sin esperas".

Imputados (elo/II/coding/agentic): sufijo ` (estimado — sin dato del modelo)`; adjetivos "sobresaliente/top/producción/real" → "potencial/estimada".
Reliability sin datos ZeroEval: `Confiabilidad estimada (baseline 0.95 — sin datos ZeroEval)` (rama nueva; hoy no se emite nada).

Eslogan (mode `solo-gratis`) — en `sloganForFreeAccess`:
- `free-100` Y precio real 0 (`priceInputUsd === 0`): `Disponible 100% gratis — sin tarjeta de crédito requerida` (verificado).
- `free-limited`: `Disponible gratis con límites (free tier)`.
- `free-registration`: `Disponible gratis con registro`.
- `paid-only` / sin precio 0: no se emite ningún eslogan.

Multi-intent (badge):
- Con ganadora clara: `Multi-intento: [Programación 60% + Redacción 40%] — Programación define el ranking (categoría ganadora)`, usando `result.intent?.label`.
- Empate aparente (≥ 2 con igual % mostrado; los reales difieren < 0.5%): `Multi-intento: [Empate 50/50] — la primera categoría detectada define el ranking`.

## Compatibilidad y mitigaciones

- `generateReasons` es **privado** y tiene una sola llamada (`recommend()` L1274 y, vía trace, `recommend()` L1954 → mismo camino). El 6º parámetro opcional rompe cero call sites.
- `RecommendOptions.currency` es aditivo-optativo; los 5 callers restantes de `recommend()` que no lo pasan siguen igual.
- Shapes públicas (`RecommendationResult`, `HRETOPSISResult`, `AIModel`) NO cambian: la razón cita `metrics.*`, no mide a `winners[].metrics.speed/context` (siguen crudos con la forma actual, uso trace).
- No hay tests `*.test.*` en el repo (solo `scripts/test-orchestrator-sources.mjs`); riesgo de romper pruebas: nulo. Verificación por build.
- Riesgo residual: `gerente-view` y `engine-animation-view` muestran `winners[].reasons` SIN pasar `currency` → conservan texto hoy (PEN/3.714). No es regresión, queda fuera del scope de la propuesta (decisión explícita del equipo).
- Mitigación de regresiones visuales: diff limitado a líneas de display + revisión manual de recomendador-view.

## Tabla de fuente por cifra (trazabilidad, req 7)

| Cifra mostrada | Fuente |
|----------------|--------|
| Precio blended /M | `computeBlendedPriceUsd(model, mode)` → `formatCostLabel` (mismo dato del ranking) |
| Moneda + símbolo | `currencyMeta` = `getCurrencyByCode(data.currencies, store.currency)` (TC efectivo ya con override del usuario) |
| Tasa | `currencyMeta.rateFromUsd` (fallback 3.714 = el mismo del orchestrator) |
| Intelligence Index | `metrics.intelligenceIndex` (el que usó TOPSIS) |
| Velocidad / contexto | `metrics.speed` / `metrics.context` (capped) |
| Imputado | `metrics.hasImputedData` + `model.<campo> == null` |
| Eslogan gratis | `model.freeAccess` + precio |
| % multi-intent | `multiIntent[].weight` → `normalizePercentages` |

## Prerrequisitos / verificación

- `npm run build` y `npx tsc --noEmit` deben pasar por unidad de trabajo (4 WUs de la propuesta).
- Verificación manual del recomendador: cambio de moneda PEN↔USD, TC fallback (levantaetro de red), modelo free-100/free-limited, modelo con speed 900, modelo sin Elo.
- Sin dependencias nuevas; sin migraciones. `git revert` por unidad restaura strings/formato.

## Open Questions

- [ ] ¿Matiz de rate limits del eslogan ("con límites") se limita a `free-limited` o hay rate limits específicos por modelo? La spec solo exige free-100 + precio 0 → se implementa eso (no se inventan datos).