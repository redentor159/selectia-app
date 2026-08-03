# Design: Gráficos Expandibles (graficos-expandibles)

## 1. Resumen / Decisión de Arquitectura

Un componente compartido `ChartExpandDialog` (nuevo, en `src/components/dashboard/charts/`) envuelve el gráfico ampliado en un `Dialog` de shadcn/ui. La vista de origen conserva su gráfico intacto; el modal **reutiliza la configuración de series** mediante un *render prop*: la vista pasa su propio JSX Recharts al modal, que solo inyecta dominio X, handler de click y estado de proveedores. Esto cumple el alcance estricto: no se modifican dominios/colores/tooltips de las vistas (el tooltip viaja con el JSX tal cual), ni se refactoriza `ScatterProviderLegend`, ni el click de la vista (sigue siendo `toggleProvider`).

**Ubicación del componente: `src/components/dashboard/charts/chart-expand-dialog.tsx`** (no `src/components/ui/`). `ui/` contiene solo primitivos shadcn reutilizables; este componente es de dominio dashboard (usa `ScatterProviderLegend`, `FichaTecnicaModal`, `Brush` de Recharts).

**Botón expandir**: `Button variant="ghost" size="sm"` con `className="h-8"`, ícono `Maximize2` de lucide-react y `title="Expandir gráfico"`, ubicado a la derecha del `CardHeader` de cada Card objetivo (mismo patrón de tamaño que los botones `h-8 text-xs` existentes del proyecto).

**Identidad `data-chart-id`** (kebab-case, estable, en el contenedor de cada gráfico Recharts — `ResponsiveContainer`):

| Vista | Gráfico | data-chart-id |
|---|---|---|
| overview-view | Inteligencia vs Precio | `inteligencia-vs-precio` |
| overview-view | Adopción vs Calidad | `adopcion-vs-calidad` |
| overview-view | Top 10 Elo · Modelos por Modalidad | `top-elo` · `modelos-por-modalidad` |
| analytics-view | Evolución de Inteligencia | `evolucion-inteligencia` |
| analytics-view | Velocidad vs Contexto | `velocidad-vs-contexto` |
| analytics-view | Coding vs Agentic | `coding-vs-agentic` |
| analytics-view | Eficiencia | `eficiencia` |
| analytics-view | Evolución de Precios · Open Weights · Licencias | `evolucion-precios` · `open-weights-vs-propietario` · `distribucion-licencias` |
| gerente-view | Scatter · Top 5 Elo | `gerente-inteligencia-vs-precio` · `gerente-top-elo` |
| simulador-roi-view | Proyección | `simulador-roi-proyeccion` |
| comparador-view | Radar de capacidades | `comparador-radar-capacidades` |

## 2. Diseño del Modal

- `Dialog open={open} onOpenChange={(o) => !o && onClose()}` (Esc nativo de Radix).
- `DialogContent`: `w-[90vw] !max-w-[90vw] xl:!max-w-[1400px] h-[85vh] max-h-[85vh]` — el gráfico ocupa `~70vh` dentro; bordes y fondo con tokens del sistema Blanco Puro: `bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-xl shadow-[var(--shadow-high)]`.
- Header del modal: título del gráfico (`DialogTitle` Inter semibold, `text-[var(--text-primary)]`), subtítulo descriptivo, botón `Reset` (con ícono `RotateCcw`) a la izquierda del cierre, botón `X` (mismo estilo que el de `ficha-tecnica-modal.tsx` L139-145, `showCloseButton={false}`).
- Contenido: `ResponsiveContainer width="100%" height="100%"` dentro de un contenedor `h-[70vh]`, renderizando el JSX Recharts provisto por la vista con **mayor altura** (sustituye el height fijo 300-320px de la Card).
- El gráfico del modal conserva `data-chart-id` del origen (mismo valor, en el contenedor interno).

## 3. Zoom con Brush (eje X)

Estado local del modal (montado de forma condicional → estado fresco por apertura):

```ts
const [zoom, setZoom] = useState<{ start: number; end: number } | null>(null);
const xDomain: [number | "auto", number | "auto"] = zoom
  ? computeDomain(data, zoom)   // [min, max] de data.slice(start, end+1) sobre la key "x"
  : defaultXDomain;             // prop: dominio actual del gráfico en la vista
```

- `<Brush dataKey="x" height={28} travellerWidth={10} stroke="var(--border-strong)" fill="var(--bg-overlay)" startIndex={zoom?.start ?? 0} endIndex={zoom?.end ?? data.length - 1} onChange={(r) => r && setZoom({ start: r.startIndex, end: r.endIndex })} />` — Brush controlado (patrón del ejemplo "zoomable chart" oficial de Recharts, sin librerías nuevas).
- `computeDomain` calcula **min/max reales del slice** (no asume datos ordenados por X).
- Pan: los travellers del Brush desplazan la ventana sin cambiar su tamaño (nativo).
- Reset: `setZoom(null)` → Brush vuelve a `0..len-1` y el eje al dominio completo.
- Reset por apertura: la vista renderiza `{open && <ChartExpandDialog … />}` → desmontaje → estado siempre inicial (spec: zoom MUST NOT persistir).
- El dominio restringido se pasa vía `ctx.xDomain` al `XAxis` del render prop (`domain={ctx.xDomain}`); el eje Y nunca se toca.
- Al cambiar `timeRes` (timeline) o al cambiar de modelo abierto, se resetea el zoom (el espacio de índices cambia).
- Timeline (eje categórico): `xDomain` son los valores de categoría `quarter` del primer/último índice; se aplica `domain={[catStart, catEnd]}` en el `XAxis` del timeline.

## 4. CRÍTICO — Escalas mixtas (espacio de datos real)

El Brush trabaja SIEMPRE sobre `dataKey="x"` — los valores que el eje recibe — y el dominio restringido se aplica al eje X. Casos verificados en el código:

| Gráfico | Espacio de `x` en el dato | Eje X | Comportamiento del zoom |
|---|---|---|---|
| Eficiencia (`analytics-view.tsx` L1299-1316) | Valor REAL `blendedPrice` (0.7·input + 0.3·output) | `scale="log"` nativo, `domain={["auto","auto"]}` | El Brush selecciona precios reales (p. ej. $0.3–$15). El dominio restringido se expresa en valores reales positivos; Recharts aplica la escala log **visual** después. Sin distorsión: el rango visible corresponde exactamente a los precios elegidos. |
| Inteligencia vs Precio (`overview-view.tsx` L407-429) | `Math.log10(blended)` precomputado | lineal, `domain={[-2, 2.5]}`, ticks log→$ | El Brush opera en espacio log10: seleccionar el punto en `x=0` equivale a $1. El dominio restringido usa valores log10 (`domain={[minLog, maxLog]}`); el `tickFormatter` (10^v → $) sigue funcionando porque recibe ticks del dominio. |
| Adopción vs Calidad (`overview-view.tsx` L658-674) | `Math.log10(hfDownloads)` precomputado | lineal, `domain={[2, 7]}`, ticks log→K/M | Ídem anterior en espacio log10. |
| Velocidad vs Contexto (`analytics-view.tsx` L1064-1088) | `Math.log2(contextWindow)` precomputado | lineal, `domain={[12, 21]}`, ticks log2→K/M | Ídem en espacio log2. |
| Coding vs Agentic (`analytics-view.tsx` L1189-1204) | `codingIndex` lineal (sin log) | lineal, `domain={[30, 80]}` | Espacio lineal real: el rango seleccionado ES el rango de índices. |
| Evolución de Inteligencia (`analytics-view.tsx` L699-704) | Categorías `quarter` (string) | categórico `dataKey="quarter"` | El dominio se restringe por categorías `[catStart, catEnd]`. |

**Regla unificada**: en los 4 gráficos pre-log, el dominio del Brush se expresa en el espacio log precomputado (los valores que el eje recibe); en Eficiencia, en el espacio real con escala log visual. Ningún gráfico requiere conversión 10^x/log en el dominio — la vista ya normalizó el dato.

## 5. Click en punto → Ficha Técnica

**Decisión: Dialog anidado** — el modal del gráfico renderiza `FichaTecnicaModal` tal cual (propia raíz Radix, portal separado, overlay `z-[700]`; el último montado queda encima por orden de montaje, Esc cierra la ficha y vuelve al gráfico con el zoom intacto).

- Patrón reutilizado de `tabla-view.tsx` L150-161/L443-448: estado `fichaModelId: string | null` + `<FichaTecnicaModal model={models.find((m) => m.id === fichaModelId) ?? null} onClose={...} />`. El modal recibe `models: AIModel[]` para resolver.
- El click en puntos **dentro del modal** llama `onPointClick(id)` (reemplaza `toggleProvider`, según spec); la vista pasa `(id) => setFichaModelId(id)`. Fuera del modal, el click sigue siendo `toggleProvider` — sin cambios.
- **Prerrequisito de datos**: los datos derivados de los 6 gráficos no incluyen `m.id`. Se agrega `id: m.id` a cada `map()` de series objetivo (`scatterData`/`adoptionData` en overview; `contextSpeedData`/`codingAgenticData`/`efficiencyData` en analytics) y `row[`${provider}_model_id`]` en `timelineData` (hoy solo guarda el nombre en `*_model`). El `Cell onClick` del modal usa `entry.id`.
- Timeline (líneas con huecos `connectNulls`): el click usa `dot={{ r: 3, onClick }}`/`activeDot` en cada `Line` — el payload expone `{provider}_model_id` para abrir la ficha.
- Alternativa descartada: reemplazar el contenido del modal por la ficha (botón "volver") — duplicaría el montaje de `FichaTecnicaModal`, re-renderizaría el gráfico y perdería el zoom al volver.

## 6. Herencia de Filtros

- El modal recibe `activeProviders` y `onToggle` (el `toggleProvider` existente de la vista) como props, y `ScatterProviderLegend` se renderiza dentro del modal (header del Dialog) con la misma data derivada y el mismo estado — sin refactor del componente.
- Opacidad de puntos: se reutiliza `getPointOpacity` de la vista vía ctx.
- Timeline: el modal deriva la leyenda de `providersInTimeline` + `PROVIDER_PALETTE` (`{ provider, color, z }`) y filtra las líneas visibles por `activeProviders` (la vista no filtra hoy; el modal sí, según spec).

## 7. Selector Temporal (timeline)

**Decisión: estado compartido con la vista** — `AnalyticsView` ya posee `timeRes` + `setTimeRes` (L128) y el `select` Semanal/Mensual/Trimestral/Anual (L674-687). El modal recibe `timeRes` y `onTimeResChange={setTimeRes}`; `timelineData` se reagrega en la vista (useMemo `[data, timeRes]`) y se pasa al modal.

Justificación: un solo *source of truth* (mismo patrón que `activeProviders` heredado); el selector de la vista y del modal siempre muestran el mismo valor; cero estado duplicado; la vista no necesita lógica de agregación duplicada. Costo: cambiar resolución en el modal re-renderiza también la vista — comportamiento consistente, no un bug. El modal replica el `select` con el mismo estilo (`bg-[var(--bg-elevated)] border-[var(--border-strong)]`).

## 8. Decisiones de Arquitectura

| Decisión | Opciones | Elegida | Justificación |
|---|---|---|---|
| Ubicación del componente | `dashboard/charts/` vs `ui/` | `src/components/dashboard/charts/chart-expand-dialog.tsx` | Dominio del dashboard (Brush, leyenda, ficha); `ui/` es solo primitivos shadcn |
| Reutilización de series | Render prop vs extraer series a componentes compartidos | **Render prop** (`renderChart(ctx)`) | Cero refactor de tooltips/colores/dominios existentes (alcance estricto); la vista conserva su JSX |
| Ficha técnica en modal | Dialog anidado vs reemplazo de contenido | **Anidado** (`FichaTecnicaModal` tal cual) | Reutiliza el componente sin cambios; preserva zoom; Esc/foco de Radix correctos |
| `timeRes` | Compartido vs local al modal | **Compartido** | Source of truth único; patrón heredado; sin lógica duplicada |
| Reset de zoom por apertura | Desmontaje condicional vs `key`/effect | **Desmontaje** (`{open && …}`) | Estado fresco garantizado sin lógica de limpieza |
| Dominio desde Brush | `data[start].x` vs min/max del slice | **min/max del slice** | No asume orden por X (scatterData no está ordenado) |
| Click modal | `toggleProvider` vs ficha | **Ficha** (spec) | La vista conserva `toggleProvider`; el modal abre ficha |
| Botón expandir | ghost vs outline | **ghost, size sm, h-8** | Coherente con botones `h-8 text-xs` del proyecto; no compite con la Card |

## Flujo de datos

```
Card (vista) ── botón Maximize2 ──► open=true
   └─► {open && <ChartExpandDialog data defaultXDomain activeProviders onToggle models renderChart>}
            │  estado: zoom (Brush) · fichaModelId
            ├─► XAxis domain={ctx.xDomain}   (Brush onChange → computeDomain)
            ├─► Scatter/Line onClick ──► fichaModelId ──► <FichaTecnicaModal> (anidado)
            ├─► ScatterProviderLegend (activeProviders heredados)
            └─► (timeline) timeRes heredado → timelineData reagregado
```

## Archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `src/components/dashboard/charts/chart-expand-dialog.tsx` | Crear | Dialog + Brush + reset + render prop + ficha anidada |
| `src/components/dashboard/views/overview-view.tsx` | Modificar | `data-chart-id` en 4 gráficos; `id` en datos; botón + modal en 2 objetivo |
| `src/components/dashboard/views/analytics-view.tsx` | Modificar | `data-chart-id` en 7; `id` en datos; `*_model_id` en timeline; botón + modal en 3 objetivo; pasar `timeRes` |
| `src/components/dashboard/views/gerente-view.tsx` | Modificar | Solo `data-chart-id` (2 gráficos) |
| `src/components/dashboard/views/simulador-roi-view.tsx` | Modificar | Solo `data-chart-id` |
| `src/components/dashboard/views/comparador-view.tsx` | Modificar | Solo `data-chart-id` |

## Interfaces / Contratos

```tsx
// chart-expand-dialog.tsx
export interface ChartDialogContext {
  xDomain: [number | "auto", number | "auto"];
  onPointClick: (modelId: string) => void;
  activeProviders: string[];
  onToggleProvider: (p: string) => void;
}
interface ChartExpandDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  chartId: string;                       // data-chart-id (mismo valor en el modal)
  data: Record<string, unknown>[];       // datos del gráfico de origen (para Brush)
  models: AIModel[];                     // resolución de la ficha técnica
  defaultXDomain: [number | "auto", number | "auto"];
  renderChart: (ctx: ChartDialogContext) => ReactNode;
  activeProviders: string[];
  onToggle: (p: string) => void;
  // timeline (opcional): timeRes?: "week" | "month" | "quarter" | "year";
  // onTimeResChange?: (r: ...) => void;
}
```

## Estrategia de Pruebas

Sin runner configurado (config.yaml: `tdd: false`, `test_command: ""`). Verificación manual + build:

| Capa | Qué | Cómo |
|---|---|---|
| Manual | Brush (drag/pan/reset), zoom por apertura, escalas (Eficiencia vs pre-log), click→ficha, toggle leyenda, timeRes en modal | Navegación por los 6 modales; comparar rango seleccionado vs ticks del eje |
| Compile | Tipos | `npx tsc --noEmit` |
| Build | Build completo | `npm run build` |

## Migración / Rollout

No requiere migración. Cambio aditivo; rollback = `git revert` del PR (proposal).

## Preguntas abiertas

- [ ] Ninguna bloqueante. Validar en apply: dominio categórico del Brush en el timeline (Recharts 2.15.4) — si el rango de categorías no restringe, alternativa: filtrar `timelineData` por índices (mismo estado de zoom) en lugar de `domain`.
