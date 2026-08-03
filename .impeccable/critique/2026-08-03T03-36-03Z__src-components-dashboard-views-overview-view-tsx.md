---
target: graficos expandibles en pantalla completa
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
p2_count: 2
timestamp: 2026-08-03T03-36-03Z
slug: src-components-dashboard-views-overview-view-tsx
---
# Critique: Gráficos de comparación de modelos — SelectIA

Method: dual-agent (A: ses_03a54fd42ffeLNPZIbj1gVeIH2 · B: ses_03a54e398ffeFCnzlIsHtNBxws)

## Design Health Score

| # | Heurística | Score | Issue clave |
|---|-----------|-------|-------------|
| 1 | Visibilidad del estado del sistema | 2 | Datos recortados por dominios hardcodeados sin señal; secciones desaparecen si no hay datos |
| 2 | Coincidencia sistema-mundo real | 3 | Cuadrantes excelentes; "II" y "Blended" sin definir en gráficos |
| 3 | Control y libertad del usuario | 2 | Filtro muere al cambiar de vista; sin selección de modelo desde gráficos |
| 4 | Consistencia y estándares | 2 | Color de proveedor cambia entre timeline y scatters; tooltips inconsistentes |
| 5 | Prevención de errores | 2 | Dominios fijos + slice(0,80) recortan datos en silencio |
| 6 | Reconocimiento vs recuerdo | 2 | "+N más" sin expansión; normalización del heatmap no visible |
| 7 | Flexibilidad y eficiencia | 3 | Filtro compartido por vista; sin atajos; Brush planeado ayuda |
| 8 | Estética y minimalismo | 3 | Blanco Puro respetado; leyenda 10px, iconos saturados en chrome |
| 9 | Recuperación de errores | 2 | Sin empty states ni aviso de clipping; confianza (eloCi) no mostrada |
| 10 | Ayuda y documentación | 3 | CardDescription en todos; "i" solo con title |
| **Total** | | **24/40** | **Acceptable (20-27)** |

## Design Specificity Verdict

Contenido profundamente anclado al producto (cuadrantes semánticos, copy LatAm, métricas de dominio II/Elo/tok/s, fuentes citadas) — no intercambiable. La capa de interacción es genérica de cualquier dashboard Recharts: click que filtra, tooltips hover, leyenda cap-12. El detector confirmó 12 findings (advisory): colores de datos no documentados, tamaños off-ramp; hallazgos manuales más profundos: contraste #888888 3.32:1 (falla AA), 11 tooltips duplicados, 10 alturas fijas 300-320px, focus:outline-none sin reemplazo, ticks de ejes sin mono, sin empty states.

## Overall Impression

La base de contenido es sólida y el plan de expansión (modal + brush + ficha) es la dirección correcta. El mayor riesgo es de confianza: un dashboard "data over opinion" que recorta datos en silencio (dominios fijos) contradice su propia promesa. El modal expandible es la oportunidad de resolver esto con dominio derivado de datos.

## What's Working

1. Semántica de cuadrante en cada CardDescription — ningún gráfico se muestra sin instrucción de lectura orientada a decisión.
2. Rigor estadístico (log precomputado documentado, normalización p10-p90).
3. ScatterProviderLegend compartido en 5 scatters — base sólida para heredar filtros al modal.

## Priority Issues

**[P1] Dominios de ejes hardcodeados + slice(0,80) recortan datos en silencio**
- Qué: domain={[20,60]}, [0,200], [30,80]/[20,70], [1200,1600], slice(0,80) en Adopción.
- Por qué: un modelo frontier nuevo queda fuera del gráfico sin aviso — viola "data over opinion".
- Fix: dominios derivados de datos (min/max o percentiles) + chip "N modelos fuera de rango". El modal expandible debe usar dominio derivado.
- Suggested command: /impeccable harden

**[P1] Click en punto filtra por proveedor: affordance mentirosa**
- Qué: puntos con cursor:pointer ejecutan toggleProvider; ningún gráfico lleva a la ficha técnica.
- Por qué: el usuario percibe el punto como el modelo; el filtro es la consecuencia menos esperada.
- Fix: jerarquía explícita — en el modal click = ficha (spec ya lo fija); en la card, hover en punto = pin, leyenda = filtro.
- Suggested command: /impeccable shape

**[P1] Identidad de color del proveedor rota entre gráficos**
- Qué: scatters usan providerColor; timeline usa PROVIDER_PALETTE por índice — OpenAI cambia de color entre gráficos.
- Por qué: el color es la única codificación no textual de identidad.
- Fix: derivar el color del timeline del providerColor; paleta asignada por nombre estable, nunca por índice.
- Suggested command: /impeccable colorize

**[P2] Leyenda cap-12, texto 10px, sin focus visible**
- Qué: slice(0,12) + "+N más" sin expansión; focus:outline-none sin reemplazo; sin aria-pressed; targets ~2px.
- Por qué: proveedores inaccesibles; Sam no puede usar la leyenda por teclado.
- Fix: leyenda expandible, focus-visible:ring, hit area ≥24px, aria-pressed.
- Suggested command: /impeccable audit

**[P2] 11 tooltips inline duplicados e inconsistentes**
- Qué: 11 copias de shell idéntico; algunos tooltips omiten provider, z (II) o el flag free (modelos gratis muestran $0.01).
- Por qué: inconsistencia fuerza re-scan; $0.01 por modelo gratis es información incorrecta.
- Fix: componente ScatterTooltip compartido (provider + nombre + métricas + z + badge "Gratis").
- Suggested command: /impeccable distill

## Persona Red Flags

**Alex (power user):** el modelo frontier nuevo que necesita ver queda recortado por dominios fijos; no puede profundizar (ningún gráfico lleva a ficha); su filtro muere al navegar entre vistas; "+N más" le oculta proveedores.

**Sam (accesibilidad):** botones de leyenda sin foco ni aria-pressed; 10px sobre blanco; puntos SVG no navegables por teclado; contraste #888888 3.32:1 < 4.5:1; burbujas fillOpacity 0.65 sobre blanco dudosas AA.

**Riley (stress tester):** slice(0,80) descarta sin aviso; escala log del Brush (Eficiencia) es el primer caso que romperá; ficha dentro de modal = Dialog anidado con scroll-trap — necesita patrón decidido.

## Minor Observations

- Iconos de título saturados (Trophy/Layers/etc.) vs Colorless Chrome Rule — documentar si son datos o chrome.
- ZAxis [40,400] vs [14,110]: tamaño de burbuja incomparable entre vistas.
- Heatmap con esquema inverso sin leyenda.
- LICENSE_COLORS dead code en analytics-view (existe copia en core-model-section).
- chart.tsx (ChartTooltipContent) sin usar y sin theming a tokens var(--text-*).
- Ticks de ejes en sans en vez de Fira Code/tnum (Monospace Metric Rule).

## Questions to Consider

1. ¿Por qué el gráfico mismo oculta datos (dominios fijos) en un producto "data over opinion"?
2. ¿El click en punto debería abrir la ficha también desde la card, no solo desde el modal?
3. ¿Existe una paleta de proveedores canónica en el producto?
4. ¿Debería activeProviders vivir en un store en vez de morir en la navegación?
5. ¿Dialog anidado (ficha dentro de modal) o panel master-detail?
