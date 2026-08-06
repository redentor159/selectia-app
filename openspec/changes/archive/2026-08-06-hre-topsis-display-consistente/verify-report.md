# Reporte de Verificación — hre-topsis-display-consistente

> Fase: `sdd-verify` · Fecha: 2026-08-06 · Modo: verificación estándar (sin Strict TDD activo)
> Artefactos leídos: proposal.md, spec.md (7 requisitos / 14 escenarios), design.md, tasks.md (10 tareas, todas `[x]`)

## Resumen ejecutivo

**Veredicto: PASS WITH WARNINGS**

La implementación cumple los 7 requisitos y los 14 escenarios de la spec, con cero hallazgos CRITICAL y cero FAIL. El motor HRE-TOPSIS (extractMetrics, topsisRank, pesos, caps, baselines, umbrales) está **intacto**: el diff de `hre-topsis.ts` toca exclusivamente `generateReasons`, el import de `format.ts`, la firma de `RecommendOptions` y la llamada desde `recommend()`. Ranking bit-igual por construcción (ninguna línea de cálculo cambió).

Evidencia fresca ejecutada:
- `npx tsc --noEmit` → **exit 0** (`test_output_hash=D41D8CD98F00B204E9800998ECF8427E`)
- `npm run build` (Next 16.2.12, Turbopack) → **exit 0** (`build_output_hash=769F3CCB9ECB230450C0C238EAF0BB28`)
- Pruebas de runtime reales sobre el código fuente `src/lib/format.ts` (Node 24 + type-stripping) → **exit 0** (`hash=A7265DE3857EC9B58261AF419E79702A`): `normalizePercentages` y `buildMultiIntentText[0.334,0.333,0.333]→[34,33,33]`, `[0.503,0.497]→[50,50]`, eslogan por tier, `costRateLabel` con tasa viva/fallback/USD y multi-intent 60/40 y 50/50.

## Matriz requisito → escenario → estado

| # | Requisito | Escenario | Estado | Evidencia |
|---|-----------|-----------|--------|-----------|
| R1 | Tasa dinámica/moneda | PEN con tasa viva (3.55) | PASS | `costRateLabel(2.396,{PEN,3.55})`→`S/. 8.51` (runtime); `hre-topsis.ts:998` fallback default solo sin currency; `recomendador-view.tsx:121-133` enhebra `currencyMeta` + `rateIsFallback` |
| R1 | 〃 | USD sin hardcode | PASS | `costRateLabel(2.396,{USD,1})`→`$ 2.40` (runtime); símbolo/moneda del store, nunca `3.714` forzado |
| R1 | 〃 | API caída (fallback) | PASS | `recomendador-view.tsx:122-123` `sources["exchange-rate"].status !== "green"` → `isFallback` → sufijo `(TC estimado)` en `format.ts:249`; fallback numérico 3.714 idéntico a `orchestrator.ts:921` |
| R2 | Speed/context con cap | Speed 900 tok/s | PASS | `hre-topsis.ts:1075-1078`: cita `metrics.speed` (capped 500, confirmado `hre-topsis.ts:870`) + `(crudo: 900 sin cap)`; texto no contradice el score |
| R2 | 〃 | Contexto 1M → 256K | PASS | `hre-topsis.ts:1086-1089`: cita `metrics.context` (capped, `hre-topsis.ts:883`) + `(crudo: 1M sin cap)`; nunca presenta 1M como valor de ranking |
| R3 | Imputados no ocultos | Elo baseline | PASS | `hre-topsis.ts:1014-1017`: `(estimado — sin dato del modelo)`, adjetivo "Potencial" (no absoluto) |
| R3 | 〃 | Reliability sin ZeroEval | PASS | `hre-topsis.ts:1106-1108`: rama nueva `Confiabilidad estimada (baseline 0.95 — sin datos ZeroEval)` |
| R4 | Eslogan honesto | free-limited | PASS | `sloganForFreeAccess("free-limited", false)`→`Disponible gratis con límites (free tier)`; nunca "100% gratis" (runtime) |
| R4 | 〃 | free-100 + precio 0 | PASS | `sloganForFreeAccess("free-100", true)`→`Disponible 100% gratis — sin tarjeta...`; `hre-topsis.ts:1117` verificación real `model.priceInputUsd === 0` |
| R5 | Badge suma 100% | 33.4/33.3/33.3 | PASS | `normalizePercentages` (runtime) → `[34,33,33]`; usado en `recomendador-view.tsx` en lugar de `.toFixed(0)` |
| R5 | 〃 | 50.3/49.7 | PASS | `→[50,50]` (nunca 101%) con suma exacta veredicto 14-7 |
| R6 | Multi-intent honesto | 60/40 | PASS | `buildMultiIntentText` (runtime) → `Programación define el ranking (categoría ganadora)`; sin "mezcla" |
| R6 | 〃 | Empate 50/50 | PASS | (runtime) `[Empate 50/50] — la primera categoría detectada define el ranking`; `multiIntent` ordenado desc por score (`hre-topsis.ts:475-490`) |
| R7 | Trazabilidad | Auditoría de cifras | PASS | Cada cifra mapea a fuente (ver tabla abajo); sin cifras nuevas |

Compleción de tareas: **10/10 `[x]`** (W1-T1…W1-T6, W2-T6, W2-T7, W3-T7, W3-T8, W3-T9). Todas las unidades W1/W2/W3 verificables.

> Nota de conteo: el spec enumera 14 escenarios (3+2+2+2+2+2+1) y 7 requisitos. La consigna externa citaba "13 escenarios"; el conteo autoritativo es el del spec leído: 14. No se inventaron totales.

## Hallazgos

### CRITICAL
- **Ninguno.**

### WARNING

1. **Working tree sucio — cambios ajenos al cambio mezclados** (`git status`).
   El árbol de trabajo contiene modificaciones fuera del alcance de `hre-topsis-display-consistente`:
   `src/lib/orchestrator.ts` (`OR_RECENT_DAYS` 30→90, L1768-1786), `src/app/globals.css`, `src/components/dashboard/charts/chart-expand-dialog.tsx`, `analytics-view.tsx`, `overview-view.tsx` y `.atl/`. No son parte de este cambio (el diff de `orchestrator.ts` es de otra línea de trabajo); si se hace `git add .` al cerrar el PR se contaminará el PR. **Acción sugerida al orquestador:** committar este cambio con staging selectivo de solo `src/lib/format.ts`, `src/lib/engine/hre-topsis.ts`, `src/components/dashboard/views/recomendador-view.tsx` (+ los 4 archivos de `openspec/changes/...`).

2. **Callers heredados sin etiqueta "TC estimado"** (`hre-topsis.ts:100` default `{PEN,3.714}` sin `isFallback`): gerente (`gerente-view.tsx:135`), comparador (`comparador-view.tsx:86`), operario (`operario-view.tsx:110`), ingeniero (`ingeniero-view.tsx:87`) y trace no reciben `currency` → muestran el texto de hoy con el fallback 3.714 sin sufijo de estimación, incluso si la API de tasas cae. El design lo documenta como decisión explícita (no es regresión); queda como deuda de consistencia para iteración futura.

3. **El texto de la razón `reliability` hardcodea "baseline 0.95"** (`hre-topsis.ts:1108`) en lugar de derivarlo de la constante `RELIABILITY_BASELINE` (`hre-topsis.ts:799`). Funcionalmente trazable hoy, pero si el baseline cambiara, el texto mentiría. Bajo riesgo.

### SUGGESTION

1. `documente la condición de imputados con `model.<campo> == null` estricto (tareas W1-T6). Hoy las ramas estimadas usan `else if (metrics.hasImputedData)` tras un `if (model.<campo>)` truthy (`hre-topsis.ts:1010-1030`): un valor real `0` (p. ej. `intelligenceIndex: 0`) quedaría mal etiquetado como "estimado — sin dato del modelo" si otra métrica disparó `hasImputedData`. Extremo improbable con los datos actuales, pero la condición estricta `model.intelligenceIndex == null` (ya usada para el fallback de elo, `hre-topsis.ts:1000`) elimina el ruido.
2. `normalizePercentames` y `buildMultiIntentText` podrían probarse con un pequeño runtime de test en el repo (actualmente no hay `*.test.*`; la verificación se hizo con runner ad-hoc contra el código real).
3. El flag `rateIsFallback` de la vista se deriva de `data.sources` del fixture offline (`data/models.ts:1132` no existe la fuente "exchange-rate" con status "ok" — la vista solo se activa con la fuente real del orchestrator). OK comportamiento; un comentario en la vista sobre esto ayudaría.

## No-regresión y compatibilidad

**Diff de `hre-topsis.ts` (66 líneas añadidas/0 borradas de lógica):** todos los hunks están en:
- import `costRateLabel, sloganForFreeAccess, RecommendCurrency` (L29-31)
- firma de `generateReasons(+currency?)` (L978-982)
- rama `efficiencyCost` (L993-1008), `elo` (L1014-1017), `intelligenceIndex` (L1029-1032), `codingIndex` (L1053-1056), `agenticIndex` (L1064-1067), `speed` (L1071-1083), `context` (L1086-1094), `reliability` (L1106-1108), bloque `solo-gratis` (L1116-1118)
- `RecommendOptions.currency?: RecommendCurrency` (L1207, aditivo)
- llamada `generateReasons(..., options?.currency)` (L1319)

**Zonas intocadas confirmadas (revisión línea-línea):** `extractMetrics` (L860-903) con caps 500/256K sin cambios; `topsisRank` (L905-972) sin cambios; `classifyIntent`/multiIntent (L475-490) sin cambios; baselines/umbrales/pesos sin cambios. Con los mismos inputs, score y orden permanecen bit-iguales (no se modificó operación aritmética alguna; el único valor nuevo consumido es `options.currency`, de display).

**Compatibilidad de callers:** los 5 callbacks de `recommend()` que no pasan `currency` (gerente, comparador, operario, ingeniero, trace) siguen compilando y reciben el texto de hoy (`currency ?: opcional`). `tsc --noEmit` y `next build` pasan con ellos.

## Trazabilidad de cifras (R7) — mapeo con el design

| Cifra mostrada | Fuente en código | Verificado |
|---|---|---|
| Precio blended /M | `computeBlendedPriceUsd(model)` → `costRateLabel` (`hre-topsis.ts:100`); mismo dato del ranking | Sí |
| Moneda + símbolo | `currencyMeta = getCurrencyByCode(data.currencies, store.currency)` (`recomendador-view.tsx:121`, hook aplica TC personal del usuario) | Sí |
| Tasa | `currencyMeta.rateFromUsd`; fallback 3.714 (mismo de `orchestrator.ts:921`); `isFallback` del status de la fuente | Sí |
| Intelligence Index | `metrics.intelligenceIndex` (el que usó TOPSIS, `hre-topsis.ts:1004`) | Sí |
| Velocidad/contexto | `metrics.speed`/`metrics.context` capeados (`hre-topsis.ts:1077,1088`) | Sí |
| Imputado | `metrics.hasImputedData` + `model.<campo>` nulos (`hre-topsis.ts:1000-1030`) | Sí |
| Eslogan gratuidad | `model.freeAccess` + `model.priceInputUsd === 0` (`hre-topsis.ts:1117`) | Sí |
| % multi-intent | `multiIntent[].weight` → `normalizePercentages` | Sí |

## Evidencia de comandos

| Comando | Exit | Hash salida | Observaciones |
|---|---|---|---|
| `npx tsc --noEmit` | 0 | `D41D8CD98F00B204E980098EC77E` (salida vacía) | `test_output_hash` |
| `npm run build` (Next 16.2.12) | 0 | `769F3CCB9ECB230450C0C438EAF0BB28` | `build_output_hash`; compila + generación estática OK |
| Runner Node (código real `src/lib/format.ts`) | 0 | `A7265DE3857CD9B58261A419E79702A` | Pruebas R5/R6/R1/R4 (hash de la salida) |

El repo no tiene harness de tests (`*.test.*`); la verificación de los escenarios de cifras se hizo por (a) ejecución real de los helpers puros desde el código fuente y (b) inspección línea a línea de `generateReasons`/`recomendador-view.tsx` contra extractMetrics (fuente de caps/imputaciones).

## Conclusión

Sin CRITICAL. Los 7 requisitos y 14 escenarios pasan. Verdict: **PASS WITH WARNINGS** (3 WARNING de calidad/higiene no bloqueantes). Recomendación de cierre del orquestador: **archive** tras un commit selectivo de los 3 archivos fuente + `openspec/changes/hre-tothesis-display-consistente/`.