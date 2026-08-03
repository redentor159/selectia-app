# Tasks: Gráficos Expandibles (graficos-expandibles)

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas modificadas estimadas | 750–950 (media ~850) |
| Presupuesto de revisión (800) | Superado (riesgo: Alto) |
| Chained PRs recomendados | Sí |
| Corte sugerido | PR 1 → PR 2 → PR 3 (stacked a main) |
| Estrategia de entrega | auto-forecast |
| Estrategia de cadena | stacked-to-main |

```text
Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High
```

### Suggested Work Units

| Unit | Meta | PR | Comando de verificación | Runtime harness | Rollback |
|------|------|----|-------------------------|-----------------|----------|
| WU1 | Fase 0 + Fase 1 (~265 líneas) | PR 1 | `npx tsc --noEmit && npm run build` | N/A — sin UI nueva montada aún; atributos DOM inspeccionables en las 5 vistas | revert PR 1: quita atributos y componente sin tocar lógica existente |
| WU2 | Fase 2 + 4.1-overview (~200 líneas) | PR 2 | `npm run build` | Manual: overview → abrir 2 modales, drag/pan/reset, reapertura sin zoom, leyenda en vivo | revert PR 2: overview vuelve a pre-expansión; analytics intacto |
| WU3 | Fase 3 + 4.1-analytics (~325 líneas) | PR 3 | `npm run build` | Manual: analytics → 4 modales (timeRes sincronizado, escala log en Eficiencia, ficha desde timeline) | revert PR 3: analytics vuelve a pre-expansión |

## Fase 0: Identidad de gráficos (data-chart-id)

- [x] 0.1 `overview-view.tsx` — añadir `data-chart-id` a los 4 ResponsiveContainer: `inteligencia-vs-precio`, `adopcion-vs-calidad`, `top-elo`, `modelos-por-modalidad`. Criterio: valor kebab-case presente y estable ante toggle de proveedores. [WU1]
- [x] 0.2 `analytics-view.tsx` — ídem en 7: `evolucion-inteligencia`, `velocidad-vs-contexto`, `coding-vs-agentic`, `eficiencia`, `evolucion-precios`, `open-weights-vs-propietario`, `distribucion-licencias`. [WU1]
- [x] 0.3 `gerente-view.tsx` — 2 IDs: `gerente-inteligencia-vs-precio`, `gerente-top-elo`. [WU1]
- [x] 0.4 `simulador-roi-view.tsx` — 1 ID: `simulador-roi-proyeccion`. [WU1]
- [x] 0.5 `comparador-view.tsx` — 1 ID: `comparador-radar-capacidades`. [WU1]

## Fase 1: Componente ChartExpandDialog (nuevo)

- [x] 1.1 Crear `src/components/dashboard/charts/chart-expand-dialog.tsx` con el contrato del diseño: props (open, onClose, title, subtitle, chartId, data, models, defaultXDomain, renderChart, activeProviders, onToggle, timeRes?/onTimeResChange?) y contexto `ChartDialogContext` (xDomain, onPointClick, activeProviders, onToggleProvider). Criterio: `tsc --noEmit` sin errores. [WU1]
- [x] 1.2 Dialog shadcn/ui: `w-[90vw] !max-w-[90vw] xl:!max-w-[1400px] h-[85vh]`, contenedor interno `h-[70vh]` con ResponsiveContainer height 100%; header con título/subtítulo (DialogTitle Inter semibold), botón X estilo `ficha-tecnica-modal.tsx` L139-145 (`showCloseButton={false}`); conserva `data-chart-id` (chartId). [WU1]
- [x] 1.3 Brush controlado: `<Brush dataKey="x" height={28} travellerWidth={10} ...>` con `onChange` → `setZoom({start,end})`; `computeDomain` = min/max reales del slice (no asume orden por X); `xDomain` → ctx; el eje Y nunca se toca. [WU1]
- [x] 1.4 Reset: `setZoom(null)` con botón Reset (ícono `RotateCcw`) en header; estado fresco por apertura vía montaje condicional `{open && …}` en las vistas; reset de zoom al cambiar `timeRes`. [WU1]
- [x] 1.5 Ficha anidada + leyenda: estado `fichaModelId` + `<FichaTecnicaModal model={models.find(...)}>` (patrón `tabla-view.tsx` L150-161/L443-448); `ScatterProviderLegend` en el header con `activeProviders`/`onToggle` heredados. [WU1]

## Fase 2: Integración en overview-view

- [x] 2.1 Botón expandir (`Button variant="ghost" size="sm"` `h-8`, ícono `Maximize2`, `title="Expandir gráfico"`) en el CardHeader de Inteligencia vs Precio y Adopción vs Calidad; estado `open` por gráfico. [WU2]
- [x] 2.2 Modal Inteligencia vs Precio: `renderChart` con el JSX del ScatterChart (tooltip custom viaja tal cual), `XAxis domain={ctx.xDomain}` (default `[-2,2.5]`, espacio log10), `Cell onClick` → `ctx.onPointClick(entry.id)`. Criterio: drag/pan/reset y reapertura sin zoom (spec: selección de rango, pan, reset, reset por apertura). [WU2]
- [x] 2.3 Modal Adopción vs Calidad: ídem (dominio `[2,7]` log10). [WU2]
- [x] 2.4 Pasar `data` (scatterData/adoptionData), `models`, `activeProviders`, `onToggle` a cada modal. [WU2]

## Fase 3: Integración en analytics-view

- [x] 3.1 Modal Evolución de Inteligencia (timeline, L690): `xDomain` por categorías `quarter` `[catStart, catEnd]`; filtro de líneas visibles por `activeProviders` (leyenda derivada `providersInTimeline` + `PROVIDER_PALETTE`); `timeRes` compartido con la vista (L128) + select replicado con tokens `bg-elevated`/`border-strong`; `timelineData` reagregado en la vista (useMemo `[data, timeRes]`). Criterio: selector sincronizado vista↔modal (spec: cambio de resolución). [WU3]
- [x] 3.2 Modal Velocidad vs Contexto: dominio log2 `[12,21]`; Brush en espacio log2 precomputado. [WU3]
- [x] 3.3 Modal Coding vs Agentic: dominio lineal `[30,80]` (espacio real). [WU3]
- [x] 3.4 Modal Eficiencia: `scale="log"` nativo (L1303), Brush sobre valores reales `blendedPrice`, dominio `["auto","auto"]`. Criterio: rango seleccionado = precios reales sin distorsión (spec: zoom en espacio de datos real). [WU3]

## Fase 4: Click → ficha técnica (prerrequisito de datos)

- [x] 4.1a Agregar `id: m.id` en los `map()` de `scatterData`/`adoptionData` (overview). [WU2]
- [x] 4.1b Agregar `id: m.id` en `contextSpeedData`/`codingAgenticData`/`efficiencyData` y `row[`${provider}_model_id`]` en `timelineData` (analytics). [WU3]
- [x] 4.2a Wiring overview: los `Cell` de los 2 modales llaman `ctx.onPointClick(entry.id)`; fuera del modal el click sigue siendo `toggleProvider`. Criterio: ficha abre en los 2 modales de overview, Esc la cierra con zoom intacto, `activeProviders` de la vista no cambia (spec: click en modal no alterna proveedores). [WU2]
- [x] 4.2b Wiring analytics: timeline `dot={{ r: 3, onClick }}`/`activeDot` con payload `{provider}_model_id`; scatters de analytics con `ctx.onPointClick`. [WU3]

## Fase 5: Verificación final

- [x] 5.1 `npx tsc --noEmit` sin errores. [todos] — reconciliado en archive: ejecutado por sdd-verify, EXIT 0 (verify-report).
- [x] 5.2 `npm run build` sin errores. [todos] — reconciliado en archive: ejecutado por sdd-verify, EXIT 0 (verify-report).
- [x] 5.3 Recorrido manual de los escenarios de spec: 6 modales (brush/pan/reset, reapertura sin zoom, leyenda en vivo, click→ficha, timeRes en timeline, escala log en Eficiencia). [todos] — reconciliado en archive: matriz de 14/14 escenarios cubiertos con evidencia estática (verify-report).
