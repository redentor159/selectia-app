# Tasks: Información del recomendador consistente (hre-topsis-display-consistente)

## Restricciones duras (aplican a TODAS las tareas)

- **Motor HRE-TOPSIS INTOCADO**: matemática TOPSIS, pesos AHP, caps de scoring (500 tok/s, 256K), baselines de imputación (Elo 1200, II 30, speed 50, coding/agentic 25, reliability 0.95) y umbrales NO se modifican. Mismas entradas → ranking bit-igual. Cero randomness.
- **Solo presentación/formato/fuentes dinámicas**: moneda/tasa del store, `ModelMetrics.hasImputedData`, `freeAccess`, caps ya aplicados por `extractMetrics`. Cambios aditivos/sustitutivos de strings y formateo; sin dependencias nuevas.
- **Fallback de tasa**: único fallback permitido `rates.PEN ?? 3.714` (el mismo de `orchestrator.ts:921`). El valor `3.324` NO existe — no citarlo nunca.
- Defaults que preservan comportamiento actual: callers que NO pasan `currency` reciben el texto de hoy (PEN/3.714, sin sufijos).
- Único cambio permitido en `hre-topsis.ts`: `generateReasons` (~L973–1077) + import de `format.ts`. Nada más.
- Verificación de cada unidad: `npm run build` + `npx tsc --noEmit`.
- NO tocar `src/lib/types.ts`, `src/lib/orchestrator.ts`, `src/lib/engine/extractMetrics`/`topsisRank`/`recommend` lógica.

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas cambiadas estimadas | ~185 (rango 150–230) |
| Presupuesto 400 líneas | Bajo |
| PR encadenados recomendados | No |
| Estrategia | PR único |

Líneas exactas del contrato:

```text
Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single
400-line budget risk: Low
```

### Suggested Work Units

| Unit | Goal | Focused test command | Runtime harness | Rollback boundary |
|------|------|----------------------|-----------------|-------------------|
| W1 | Razones dinámicas (tasa+moneda+caps+imputados) | `npm run build` && `npx tsc --noEmit` | Recomendador: consulta real con PEN/USD, TC caído, modelo speed 900, modelo sin Elo | `git revert` de W1 (solo `format.ts` + `generateReasons` + `RecommendOptions`) |
| W2 | Eslogan "100% gratis" verificable | `npm run build` && `npx tsc --noEmit` | Modo `solo-gratis` con `free-limited` vs `free-100`+precio 0 | `git revert` de W2 (solo `sloganForFreeAccess` + bloque L1070–1074) |
| W3 | Badge multi-intent suma 100% y honesto | `npm run build` && `npx tsc --noEmit` | Consulta con multi-intent 33.4/33.3/33.3 y 60/40 | `git revert` de W3 (solo `normalizePercentages`/`buildMultiIntentText` + bloque L305-310) |

## Work Unit 1 — Razones dinámicas (tasa + moneda + caps + imputados)

- [x] **W1-T1** — `src/lib/format.ts` (fin de archivo): añadir `export interface RecommendCurrency { code: string; symbol: string; rateFromUsd: number; isFallback?: boolean }` + `export function costRateLabel(blendedUsd: number, cur: RecommendCurrency): string` que formatea `{symbol} {n} /M tokens blended` con dedo `isFallback` → sufijo ` (TC estimado)`. Sin tocar nada existente; import de `types` ya presente.
  - Criterio: `npx tsc --noEmit` sin errores; export nuevo sin romper callers.
  - Dependencias: ninguna.

- [x] **W1-T2** — `src/lib/engine/hre-topsis.ts` L1155–1162: añadir `currency?: RecommendCurrency` (import de `RecommendCurrency` desde `@/lib/format`) a `RecommendOptions`. Aditivo, opcional.
  - Criterio: `tsc` limpio; los 6 callers de `recommend()` siguen compilando.
  - Dependencias: W1-T1.

- [x] **W1-T3** — `hre-topsis.ts` L974–979: añadir parámetro opcional `currency?: RecommendCurrency` a la firma de `generateReasons`. L1274: pasar `options?.currency` en la llamada desde `recommend()`. `traceRecommendation` (L1954) ya reenvía `options` → el campo fluye solo.
  - Criterio: `tsc --noEmit`; `recommend()` sin currency produce texto idéntico al actual.
  - Dependencias: W1-T2.

- [x] **W1-T4** — `hre-topsis.ts` L987–996 (criterio `efficiencyCost`): reemplazar la interpolación fija `S/. ${(blended * 3.714).toFixed(2)}` por `costRateLabel(blended, currency??)` con default `{ code:"PEN", symbol:"S/.", rateFromUsd:3.714 }` cuando no hay currency (texto exact como hoy, sin romper callers). Citar `metrics.intelligenceIndex` (el del ranking), no `model.intelligenceIndex`. Si `metrics.hasImputedData && model.intelligenceIndex == null` → prefijo `Eficiencia de costo (II estimado):`. Sufijo ` (TC estimado)` cuando `currency.isFallback`.
  - Criterio: escenarios RE1-1 (PEN 3.405), RE1-2 (USD sin hardcode), RE1-3 (fallback 3.714 con `(TC estimado)`).
  - Dependencias: W1-T3.

- [x] **W1-T5** — `hre-topsis.ts` L1043–1053 (speed/context): citar `metrics.speed` (capped 500) y `metrics.context` (capped 256K) con texts "valor con cap usado en el ranking". Si `model.speedTps > 500` → sufijo ` (crudo: {model.speedTps} sin cap)`; si `model.contextWindow > 256_000` → ` (crudo: {formatContext(model.contextWindow)} sin cap)`. Si `model.speedTps == null` (imputado) → `Velocidad estimada: {metrics.speed} tok/s (baseline del motor)` sin adjetivos "fluidas/sin esperas".
  - Criterio: escenarios RE-2-1 (speed 900 → cita 500 + crudo), RE-2-2 (1M → cita 256K, sin presentar 1M como ranking).
  - Dependencias: W1-T3.

- [x] **W1-T6** — `hre-topsis.ts` razones `elo` (L998–1004), `intelligenceIndex` (L1005–1027), `codingIndex` (L1029–1033), `agenticIndex` (L1035–1040) y `reliability` (L1053–1065): cuando `metrics.hasImputedData` y `model.<campo> == null` → omitir adjetivos "sobresaliente/top/producción/real" y añadir sufijo ` (estimado — sin dato del modelo)`. Reliability SIN ZeroEval (+ `zeroevalFailureRate == null`): emitir rama nueva `Confiabilidad estimada (baseline 0.95 — sin datos ZeroEval)` (hoy no se emite nada). No tocar el resto de las ramas (datos reales se muestran igual).
  - Criterio: escenarios RE-3-1 (Elo imputado 1200 → "estimado", sin "Alta preferencia"), RE-3-2 (reliability baseline → "estimado").
  - Dependencias: W1-T3.

## Work Unit 2 — Eslogan de gratuidad verificable

- [x] **W2-T6** — `src/lib/format.ts`: `export function sloganForFreeAccess(fa: FreeAccessType, verifiedFree: boolean): string | null` — `free-100` && `verifiedFree` → `Disponible 100% gratis — sin tarjeta de crédito requerida`; `free-limited` → `Disponible gratis con límites (free tier)`; `free-registration` → `Disponible gratis con registro`; `paid-only`/no-verificado → `null`.
  - Criterio: `tsc --noEmit`; helper puro sin side effects.
  - Dependencias: ninguna.

- [x] **W2-T7** — `hre-topsis.ts` L1070–1074 (bloque modo `solo-gratis`): sustituir por `const eslogan = sloganForFreeAccess(model.freeAccess, model.priceInputUsd === 0); if (eslogan) reasons.push(eslogan);`. `verifiedFree = model.freeAccess === "free-100" && model.priceInputUsd === 0`. No emitir nada en `paid-only` ni cuando precio != 0. `generateExplanation` queda intacto.
  - Criterio: escenarios RE-4-1 (free-limited → NO "100% gratis"), RE-4-2 (free-100 + precio 0 → texto verificado).
  - Dependencias: W2-T6, W1-T3.

## Work Unit 3 — Badge multi-intent consistente

- [x] **W3-T7** — `src/lib/format.ts`: `export function normalizePercentages(weights: number[]): number[]` (largest remainder: total 0 → `[]`; `raw = w/total*100`; floors; repartir puntos faltantes papricat al mayor remanente; retornar enteros que suman 100) y `export function buildMultiIntentText(parts: {key: string; label: string; weight: number}[], winnerLabel: string): string` con textos del design (ganadora clara vs. empate aparente < 0.5%).
  - [x] Criterios: `normalizePercentages([0.334,0.333,0.333]) → [34,33,33]`; `([0.503,0.497]) → [50,50]` (suma exacta 100).
  - Dependencias: ninguna.

- [x] **W3-T8** — `src/components/dashboard/views/recomendador-view.tsx` L505–310: sustituir el mapa `(0).toFixed(0) … "" join` por `const pct = normalizePercentages(result.multiIntent.map(m => m.weight))` y renderizar `buildMultiIntentText([{ key, label: CATEGORY_LABELS[m.category], weight }…], result.intent?.label)` dentro del `Badge`. El texto aclara que la categoría ganadora define el ranking (multi-intent NO mezcla el ranking).
  - Criterio: escenarios RE-5-1 (iguales 100), RE-5-2 (50 +- 50, nunca 101%), RE-6-1 (60/40 → ganadora), RE-6-2 (50/50 → desempate).
  - Dependencies: W3-T7; requiere `CATEGORY_LABELS` importado en la vista.

- [x] **W3-T9** — `src/components/dashboard/views/recomendador-view.tsx` L106–124 (useMemo de recommend) y L130: añadir `const currency = useDashboardStore(s => s.currency)` reactivo; resolver `currencyMeta` desde `getCurrencyByCode(data.currencies, currency)`; derivar `rateIsFallback = data.sources?.some(s => s.id === "exchange-rate" && s.status !== "green")`; pasar `options.currency = { code, symbol, rateFromUsd, isFallback }` en la llamada a `recommend` y añadir `currency` a las deps del `useMemo` (sin re-renders innecesarios).
  - Criterio: `build` pasa; deps completas sin efectos de escape; cambios de moneda re-derivan razones.
  - Dependencias: W1-W2 y W3-T7 (habilita razones dinámicas reales en la vista).

## Orden de verificación

| Unidad | Comando de verificación | Escenarios de spec cubiertos |
|--------|--------------------------|------------------------------|
| W1 | `npm run build` && `npx tsc --noEmit` | RE-1-1 (PEN viva 3.405), RE-1-2 (USD sin hardcode), RE-1-3 (fallback 3.714 + "TC estimado"), RE-2-1 (speed 900→500+crudo), RE-2-2 (1M→256K+matiz), RE-3-1 (Elo imputado), RE-3-2 (reliability), RE-7 (auditoría de cifras) |
| W2 | `npm run build` && `npx tsc --noEmit` | RE-4-1 (free-limited → sin eslogan "100% gratis"), RE-4-2 (free-100 + precio 0 → verificado) |
| W3 | `npm run build` && `npx tsc --noEmit` | RE-5-1 (33.4/33.3/33.3 → 100), RE-5-2 (50.3/49.7 → 100, no 101), RE-6-1 (60/40 ganadora), RE-6-2 (50/50 desempate) |

Verificación manual adicional (propuesta/design): cambiar moneda PEN↔USD en el store, simular TC caído, consultas con modelo `free-limited` y `free-100` + precio 0, un modelo con `speedTps` alto (p. ej. 900) y un modelo sin Elo.

## Nota de riesgos para apply

- NO tocar: caps 500 tok/s / 256K, baselines (Elo 1200, II 30, speed 50, coding/agentic 25, reliability 0.95), pesos AHP, umbrales, la matemática del ranking ni `extractMetrics`/`topsisRank`.
- Fallback de tétula: **solo 3.714** y como `TC estimado` (`isFallback`); el 3.324 no existe — no citarlo en casi ningún texto.
- Default por defecto: callers que no pasan `currency` (gerente, comparador, operario, ingeniero, trace) conservan exactamente el texto de hoy — no es regresión, es el contrato de compatibilidad del design.
- `winners[].metrics.speed/context` siguen siendo crudos (no los usa `generateReasons`); citar siempre `metrics` del ranking.
- Diff limitado a líneas de display; toda unidad pasa `npm run build` + `npx tsc --noEmit` antes de cerrarse; rollback por `git revert` por unidad.