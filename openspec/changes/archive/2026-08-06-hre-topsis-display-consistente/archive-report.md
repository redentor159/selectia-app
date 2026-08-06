# Archive Report — hre-topsis-display-consistente

- **Fecha de archive**: 2026-08-06
- **Estado de verificación**: PASS WITH WARNINGS — 7/7 requisitos, 14/14 escenarios, 0 CRITICAL, 3 WARNING no bloqueantes (higiene/consistencia).
- **Modo de persistencia**: hybrid (openspec + Engram).
- **Archivado en**: `openspec/changes/archive/2026-08-06-hre-topsis-display-consistente/`

## Sincronización de specs (delta → source of truth)

- La spec delta de `openspec/changes/hre-topsis-display-consistente/spec.md` se copió como **spec principal nueva** en `openspec/specs/recomendador-info-consistente/spec.md` (no existía spec previa en `openspec/specs/`; la delta es una spec completa, no un delta parcial).
- **Contenido fusionado**: 7 requisitos ADDED (14 escenarios en total) — ver sección `## Requirements` de la spec principal.
- **Regla de config.yaml (`archive: Avisar antes de fusionar deltas destructivos`)**: no aplica — el delta es 100% ADDED; no hay requisitos MODIFIED, REMOVED ni RENAMED. No se elimina ni reemplaza ningún contenido existente. Sin riesgo destructivo.
- **Formato del delta en este proyecto**: `spec.md` plano en la raíz del change folder (con `## Capability` y `## ADDED Requirements`); la spec principal se generó con la misma estructura (`## Capability` + `## Requirements`).
- **Restricciones duras registradas en la spec principal**: el motor HRE-TOPSIS queda intocado (matemática TOPSIS, pesos AHP, caps 500 tok/s y 256K, baselines de imputación, umbrales); cero randomness; el fallback de tasa PEN permanece en 3.714 (`rates.PEN ?? 3.714`); sin dependencias nuevas.

## Verificación del archive

- [x] Spec principal actualizada: `openspec/specs/recomendador-info-consistente/spec.md` (7 requisitos, 14 escenarios).
- [x] Change folder movido a `openspec/changes/archive/2026-08-06-hre-topsis-display-consistente/`.
- [x] El archive contiene todos los artefactos: proposal.md, spec.md, design.md, tasks.md, verify-report.md.
- [x] El tasks.md archivado tiene 10/10 checkboxes `[x]`.
- [x] `openspec/changes/` ya no contiene el cambio activo.
- [x] No se borró ningún archivo del directorio de cambio.

## Archivos fuente modificados por el cambio

| Archivo | Acción | Líneas (insert/delete) | Qué se hizo |
|---|---|---|---|
| `src/lib/format.ts` | Modify (aditivo) | +79 / -0 | Nuevos helpers: `RecommendCurrency`, `costRateLabel`, `sloganForFreeAccess`, `normalizePercentages`, `buildMultiIntentText`. Sin tocar exports existentes. |
| `src/lib/engine/hre-topsis.ts` | Modify (solo display) | +66 / -17 | Import de `format.ts`; `RecommendOptions.currency?` (opcional); parámetro opcional `currency?` en `generateReasons`; cuerpo de razones reescrito. Ranking/cálculo intacto. |
| `src/components/dashboard/views/recomendador-view.tsx` | Modify | +30 / -0 | Import de `CATEGORY_LABELS` + `buildMultiIntentText`; selector reactivo `useDashboardStore(s => s.currency)`; `options.currency` con `rateIsFallback`; badge reemplazado por `normalizePercentages`; deps de `useMemo` += `currency`. |

**Diff total del cambio**: 4 archivos fuente, ~175 líneas (incluyendo `orchestrator.ts` no tocado proactivamente en este change pero presente en working tree como cambio ajeno — ver WARNINGs).

## Estado del motor (contrato de no-regresión)

- **Motor HRE-TOPSIS**: ranking bit-igual por construcción. `git diff hre-topsis.ts` muestra hunks SOLO en: import (L29), firma `generateReasons` (L978), cuerpo de razones (L993–1113), `RecommendOptions.currency?` (L1204), llamada en `recommend` (L1319). NO se modificaron `extractMetrics`, `calculateTopsisScore`/`topsisRank`, `getWeights`, `WEIGHTS_*`, caps (500 tok/s, 256K), baselines (Elo 1200, II 30, speed 50, coding/agentic 25, reliability 0.95), ni umbrales de filtros.
- **Mismas entradas → mismo ranking** (sin randomness introducido).
- **Verificado por**: matriz de 14/14 escenarios PASS en `verify-report.md`, `npx tsc --noEmit` EXIT 0, `npm run build` (Next 16.2.12) EXIT 0, y runner Node de `normalizePercentages` (`[0.334,0.333,0.333]→[34,33,33]`, `[0.503,0.497]→[50,50]`, sumas 100 exactas).

## Trazabilidad en Engram (proyecto selectia-app)

| Artefacto | Topic key | Observation ID |
|-----------|-----------|----------------|
| proposal | `sdd/hre-topsis-display-consistente/proposal` | #231 |
| spec (delta) | `sdd/hre-topsis-display-consistente/spec` | #232 |
| hallazgo fallback 3.714 | `discovery/hre-topsis-fallback-3.714` | #233 |
| design | `sdd/hre-topsis-display-consistente/design` | #234 |
| tasks | `sdd/hre-topsis-display-consistente/tasks` | #235 |
| estado del plan (orquestador) | `architecture/plan-sdd-hre-topsis-display-consistente-completado` | #236 |
| verify-report | `sdd/hre-topsis-display-consistente/verify-report` | obs-3cc208b58a913e64 |
| hallazgo working tree | (sin topic) | obs-b098a842a0b8d565 |
| archive-report (este) | `sdd/hre-topsis-display-consistente/archive-report` | (pendiente de guardar) |

## Hallazgos heredados del verify-report (no bloqueantes, follow-ups)

1. **WARNING — Working tree con cambios ajenos al SDD change**: `git status` muestra archivos modificados que NO son parte de este change (`orchestrator.ts` OR_RECENT_DAYS 30→90, `globals.css`, `chart-expand-dialog.tsx`, `analytics-view.tsx`, `overview-view.tsx`, `.atl/`). Si se commitea con `git add .` el PR se contamina. Mitigación: commitear con **staging selectivo** (`git add src/lib/format.ts src/lib/engine/hre-topsis.ts src/components/dashboard/views/recomendador-view.tsx openspec/`) solo los archivos de este cambio.
2. **WARNING — Callers legacy muestran 3.714 sin etiquetar**: `gerente-view`, `comparador`, `operario`, `ingeniero`, `engine-animation-view` no pasan `currency` a `recommend()` → conservan el texto de hoy (`S/. (blended * 3.714)` sin "(TC estimado)"). Es decisión explícita del design (deuda futura aceptada), no es regresión. Follow-up: propagar `currency` a esos callers en un cambio separado si se desea consistencia total.
3. **WARNING — `baseline 0.95` hardcodeado en un string**: la rama nueva de reliability cita "baseline 0.95" como literal en el string en vez de referenciar la constante `RELIABILITY_BASELINE`. Evaluación: el valor coincide con la constante; se acepta por ahora. Follow-up opcional: usar la constante para evitar desync futuro.
4. **SUGGESTION — Condiciones de imputado con `== null` estricto**: el chequeo `model.<campo> == null` discrimina tanto `null` como `undefined` pero también `0` real en algunos campos; el design lo contempla y acepta el trade-off. No requiere acción inmediata.
5. **SUGGESTION — Sin harness de tests permanente**: el repo no tiene `*.test.*` (config.yaml `tdd: false`); la verificacion depende de build/tsc + revisión manual. Follow-up opcional: añadir tests unitarios para `normalizePercentages` y `costRateLabel` en un cambio aparte.

## Cierre

El ciclo SDD del cambio `hre-topsis-display-consistente` está completo: proposal → spec → design → tasks → apply (W1+W2+W3, 10/10 tareas `[x]`) → verify (PASS WITH WARNINGS, 0 CRITICAL) → archive. La información mostrada por el recomendador es ahora 100% dinámica y trazable; el motor HRE-TOPSIS permanece intocado (ranking bit-igual). **No se hicieron commits ni PR** (decisión del usuario); los cambios quedan en working tree listos para commiteo selectivo.
