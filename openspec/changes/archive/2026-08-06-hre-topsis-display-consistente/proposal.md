# Proposal: Información del recomendador consistente (hre-topsis-display-consistente)

## Contexto

Auditoría solo-lectura del Motor de Recomendación (TF-IDF → filtros → pesos AHP → TOPSIS): el RANKING es 100% dinámico y determinista — NO se toca. La capa de INFORMACIÓN mostrada al usuario contiene valores hardcodeados o inconsistentes con los datos reales del modelo y del store.

## Problema

1. `hre-topsis.ts:993` interpola tasa fija `S/. 3.714` en la razón de eficiencia; el resto del proyecto usa la tasa viva (`orchestrator.ts:921`, fallback 3.714) y la moneda del store (`dashboard-store.ts`). Además siempre muestra S/ sin respetar la moneda del usuario.
2. `hre-topsis.ts:1046/1052` citan speed/contexto SIN cap, aunque el ranking los capea (500 tok/s, 256K).
3. Valores imputados (Elo=1200, II=30, speed=50, coding=25, reliability=0.95) se presentan como reales; `generateReasons` ignora `hasImputedData` (`:836`, anotado en `:898`).
4. Eslogan `Disponible 100% gratis — sin tarjeta` se emite siempre en `solo-gratis` (`:1072-1074`) sin verificar `freeAccess` (p. ej. `free-limited`) ni rate limits.
5. Badge multi-intent (`recomendador-view.tsx:308`) redondea cada peso por separado y puede sumar 101%.
6. Multi-intent es solo display: sugiere un ranking mixto que la matemática no produjo (el ranking usa solo la categoría ganadora).

## Intención

Lograr que TODA cifra mostrada por el recomendador sea dinámica (cero hardcodeado), confiable y verificable contra los datos reales del modelo y la tasa de cambio viva. Estabilidad y seguridad primero: mejor lento pero seguro. El motor y su ranking quedan intangibles.

## Alcance

### In Scope

- Razones ("porqués") con tasa viva del store + moneda del usuario, caps aplicados inline (500 tok/s, 256K), y valores imputados explícitamente marcados como estimados.
- Eslogan de `solo-gratis` condicionado a `freeAccess` real del modelo (y rate limits cuando aplique).
- Badge multi-intent honesto: redondeo consistente que suma 100% en vivo y redacción que no afirme un ranking mixto inexistente.
- Solo capa de presentación/format; verificaciones `npm run build` + `npx tsc --noEmit` por unidad.

### Out of Scope (no-goals explícitos)

- NO tocar el motor HRE-TOPSIS: ni matemática, ni fórmula TOPSIS, ni cálculo del ranking.
- NO editar constantes de scoring: pesos AHP, caps (500 tok/s, 256K), baselines (Elo, II, speed, coding, reliability=0.95), umbrales.
- NO cambiar el comportamiento del ranking ni introducir randomness.
- NO modificar modelo de datos (`AIModel`) ni fuentes de datos.

## Enfoque

- Refactor de la capa de información únicamente: razones consumen datos ya presentes en `ModelMetrics`/`AIModel` (imputado, caps) y formateo por tasa/moneda viva; no se recalcula nada.
- Unidades de trabajo (commits por work unit, sin mezclar): (1) razones dinámicas (tasa+moneda+caps+imputado); (2) eslogan honesto por `freeAccess`; (3) badge multi-intent consistente; (4) build/verificación final. Cada unidad con verificación y rollback propios.
- Si toca `recomendador-view.tsx`, seguir prácticas Vercel React (memo/derived state, sin waterfalls ni re-renders innecesarios).

## Precauciones de estabilidad (explícitas)

- Cambios limitados a archivos de presentación; el pipeline `extractMetrics → topsisRank → score` queda intacto.
- La tasa se lee del store con el MISMO fallback actual (3.714) si el servicio cae: comportamiento idéntico al de hoy.
- Dato indisponible → se muestra como "estimado"; NUNCA se inventa cifras ni se omite el ranking.
- Sin dependencias nuevas; cambios aditivos/sustitutivos de strings y formateo.
- `npm run build` y `npx tsc --noEmit` deben pasar antes de cerrar CADA unidad de trabajo.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `src/lib/engine/hre-topsis.ts` (solo `generateReasons`, ~973-1077) | Modificado | Razones dinámicas; cálculo intacto |
| `src/lib/format.ts` | Modificado | Formateo con tasa/moneda del store |
| `src/components/dashboard/views/recomendador-view.tsx` (~L308) | Modificado | Badge multi-intent honesto |
| `src/lib/orchestrator.ts` | Referencia | Tasa viva (fuente) — sin cambios |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Alterar cálculo al tocar `generateReasons` | Baja | Diff solo en líneas de display + build/tsc por unidad |
| Fallback de tasa si API cae | Baja | Se usa el mismo fallback actual (3.714); comportamiento idéntico al de hoy |
| Regresión visual del badge o razones | Baja | Verificación manual del recomendador en vistas |

## Rollback Plan

Cambio aditivo/display: `git revert` del commit/PR de la rama restaura texto y formato previos; sin migraciones ni datos que limpiar. Rollback independiente por unidad de trabajo (W1-W3), de acuerdo con la convención work-unit-commits.

## Dependencias

- Store de moneda/tasas (`dashboard-store.ts`, `format.ts`) — ya existe. Sin dependencias nuevas.

## Success Criteria

- [ ] Ninguna razón cita tasa hardcodeada; respeta la moneda del usuario.
- [ ] No hay razón formateada con velocidad/contexto sin exponer el cap.
- [ ] Valores imputados marcados como estimados en las razones.
- [ ] Eslogan de `solo-gratis` solo cuando `freeAccess`/rate limits lo sustentan.
- [ ] Badge multi-intent suma 100% y no afirma ranking mixto inexistente.
- [ ] `npm run build` y `npx tsc --noEmit` pasan; verificación manual de la vista recomendador.

## Ronda de preguntas de propuesta (para diseño)

1. ¿Eslogan en `solo-gratis`: eliminar, matizar ("gratis con límites") u oculto solo a `free-100`?
2. ¿Marcado de imputados: sufijo "estimado" en la razón, tooltip, o ambos?
3. ¿Badge multi-intent: validar suma 100% o además aclarar que el ranking usa solo la categoría ganadora?