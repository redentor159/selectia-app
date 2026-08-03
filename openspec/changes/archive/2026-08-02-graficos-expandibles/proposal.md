# Proposal: Gráficos Expandibles (graficos-expandibles)

## Intent

Los gráficos de comparación (scatter/timeline) muestran decenas de modelos superpuestos en 300-320px de alto: la magnitud relativa entre modelos es ilegible y no existe forma de ampliar ni explorar zonas densas. Este cambio agrega expansión a modal grande con zoom por dominio en el eje X (Brush nativo de Recharts) en los 6 gráficos objetivo, y establece identidad `data-chart-id` en todos los gráficos del dashboard como base extensible.

## Scope

### In Scope
- `data-chart-id` estable en todos los gráficos del dashboard (base extensible; la expansión se implementa solo en 6).
- Botón expandir (ícono maximize) en la Card de los 6 gráficos objetivo: Inteligencia vs Precio, Adopción vs Calidad, Evolución de Inteligencia (overview); Velocidad vs Ventana de Contexto, Coding Index vs Agentic Index, Eficiencia (analytics).
- Modal grande (Dialog de shadcn/ui, ~70vh) con el mismo contenido a mayor tamaño.
- Zoom por dominio en el eje X con `<Brush>` nativo de Recharts: drag para seleccionar rango, pan para navegar, botón de reset para restaurar la vista completa. Solo eje X. Sin librerías nuevas.
- Click en un punto dentro del modal → ficha técnica del modelo (reusar el patrón de Tabla Maestra si es factible; si no, resolver en diseño).
- El modal hereda `activeProviders` de la vista; `ScatterProviderLegend` disponible dentro del modal para toggle de proveedores.
- Zoom reseteado en cada apertura del modal (no persiste entre aperturas).
- Selector de resolución temporal (Semanal/Mensual/Trimestral/Anual) disponible dentro del modal de Evolución de Inteligencia.

### Out of Scope
- Zoom en el eje Y.
- Persistencia del zoom entre aperturas.
- Librerías de zoom nuevas (d3-zoom, visx, plotly).
- Expansión en gráficos fuera de los 6 (solo identidad `data-chart-id`).
- Contexto compartido de `activeProviders` entre vistas (sigue siendo estado local por vista).

## Capabilities

### New Capabilities
- `graficos-expandibles`: identidad de gráficos (`data-chart-id`), expansión a modal con zoom por dominio en eje X (Brush), click en punto → ficha técnica, herencia de filtros/leyenda/resolución temporal y reset de zoom por apertura.

### Modified Capabilities
- None (no existen specs previas en `openspec/specs/`).

## Approach

- `data-chart-id` como atributo estable en cada gráfico, extensible a futuro.
- El modal reutiliza la configuración de series del gráfico de origen dentro de un `Dialog` shadcn/ui a ~70vh.
- `<Brush>` nativo de Recharts sobre el eje X; el reset re-renderiza sin rango seleccionado.
- Normalizar el zoom ante escalas: Eficiencia usa `scale="log"` nativo; los demás precomputan log10/log2 en el dato. El dominio del Brush debe operar en el espacio de datos real de cada eje.
- Ficha técnica: evaluar en diseño la reutilización del patrón de `tabla-view.tsx` (~L1117) / `gerente-view.tsx`.
- El click actual en puntos hace `toggleProvider` (filtro); dentro del modal pasa a abrir la ficha técnica (definir prioridad de interacciones en diseño).

## Affected Areas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `src/components/dashboard/views/overview-view.tsx` | Modificado | `data-chart-id`, botón y modal en 3 gráficos objetivo |
| `src/components/dashboard/views/analytics-view.tsx` | Modificado | `data-chart-id`, botón y modal en 3 gráficos objetivo; exporta `ScatterProviderLegend` |
| `src/components/dashboard/views/gerente-view.tsx`, `simulador-roi-view.tsx` | Modificado | `data-chart-id` (identidad, sin expansión) |
| `src/components/dashboard/views/tabla-view.tsx` | Referencia | patrón de ficha técnica a reutilizar |
| `src/components/ui/` (nuevo modal de expansión) | Nuevo | componente compartido de expansión de gráficos |

## Risks

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| `<Brush>` sobre datos pre-log (overview) o `scale="log"` (Eficiencia) puede seleccionar rangos en el espacio equivocado | Med | Fijar en diseño el dominio del Brush en el espacio de datos real del eje |
| Click en punto: conflicto entre `toggleProvider` (hoy) y apertura de ficha técnica (en el modal) | Med | Definir la prioridad de interacciones dentro del modal en diseño |
| Doble montaje del gráfico (vista + modal) impacta el rendimiento | Baja | Reutilizar la configuración de series y memoizar |

## Rollback Plan

Cambio aditivo (atributos, botón y modal): revertir el commit/PR del cambio devuelve el dashboard al estado previo sin migraciones ni datos que limpiar. `git revert` del PR de la rama del cambio.

## Dependencies

- Recharts ^2.15.4 (ya instalado; sin dependencias nuevas).
- Dialog de shadcn/ui (ya disponible en el proyecto).

## Success Criteria

- [ ] Los 6 gráficos objetivo abren un modal ~70vh desde el botón expandir.
- [ ] El Brush permite seleccionar rango en X, pan y reset dentro del modal.
- [ ] Click en un punto del modal abre la ficha técnica del modelo.
- [ ] El modal hereda `activeProviders`; la leyenda togglea proveedores en vivo.
- [ ] El zoom se resetea en cada apertura; la resolución temporal funciona dentro del modal de Evolución de Inteligencia.
- [ ] `data-chart-id` presente en todos los gráficos del dashboard.
- [ ] `npm run build` y `npx tsc --noEmit` pasan sin errores.

## Preguntas abiertas (ronda de propuesta)

1. ¿Es factible reutilizar el patrón de ficha técnica de `tabla-view.tsx`/`gerente-view.tsx` tal cual dentro del modal, o se necesita un componente dedicado? (a resolver en diseño)
2. Click en un punto dentro del modal: ¿abre la ficha técnica y reemplaza al `toggleProvider` solo dentro del modal, o se requiere otra estrategia de interacción?
