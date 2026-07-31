---
target: src/components/dashboard/views/tabla-view.tsx
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-07-30T23-20-24Z
slug: src-components-dashboard-views-tabla-view-tsx
---
# Critique Report: SelectIA Filters Panel

Method: dual-agent (A: a5479747-8fe7-4645-97b0-fc9f077e90b3 · B: 3221d5ac-93cc-4ce6-a297-09d8f71fc16e)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | El estado de cambios pendientes no es claro debido al desfase de ejecución (búsqueda en tiempo real frente a controles de sliders estáticos). |
| 2 | Match System / Real World | 3 | Métricas como "ZeroEval reliability" y "Elo CI" son avanzadas y no cuentan con etiquetas de explicación o referencias visuales sencillas. |
| 3 | User Control and Freedom | 4 | Excelente soporte de escape con botones para restablecer filtros y gestionar el panel drawer. |
| 4 | Consistency and Standards | 2 | Inconsistencia en la interacción: la barra de búsqueda filtra en tiempo real (debounced), mientras que los sliders y selects requieren confirmación manual mediante "Aplicar filtros". |
| 5 | Error Prevention | 3 | Los sliders y dropdowns restringen la entrada de datos, pero no previenen resultados vacíos en la tabla maestra (cero resultados). |
| 6 | Recognition Rather Than Recall | 2 | Cuando el panel de filtros se oculta, no queda ningún resumen o tag visual de qué filtros están activos, obligando a memorizar el estado del selector. |
| 7 | Flexibility and Efficiency | 3 | Las vistas guardadas aceleran el flujo para usuarios avanzados, pero faltan atajos de teclado (e.g. Ctrl+Enter para aplicar filtros o Esc para salir). |
| 8 | Aesthetic and Minimalist Design | 1 | Sobrecarga de opciones: se presentan más de 30 Knobs/sliders idénticos en un solo panel monolítico sin niveles de colapso. |
| 9 | Error Recovery | 3 | Mensaje de fallback limpio para tablas vacías, aunque no ofrece acciones interactivas para revertir el filtro conflictivo directamente. |
| 10 | Help and Documentation | 3 | Existen tooltips de ayuda contextuales, pero métricas complejas carecen de glosario inline. |
| **Total** | | **27/40** | **Acceptable (Significant improvements needed before users are happy)** |

## Design Specificity Verdict

- **LLM Assessment**: Las opciones de filtro son sumamente específicas para SelectIA (cuantización GGUF para VRAM, confiabilidad ZeroEval, blended price), pero la estructura de la interfaz y su disposición visual son genéricas e intercambiables con cualquier grilla de base de datos técnica. Carece de jerarquía y abusa de los controles deslizantes idénticos.
- **Deterministic Scan**: El detector automático encontró **44 infracciones**:
  - **38 de tipografía (design-system-font-size)**: Uso persistente de tamaños tipográficos de 9px, 10px y 11px fuera de la escala del sistema de diseño.
  - **6 de color (design-system-color)**: Falsos positivos de color semántico (indicadores de estado Vigente y Reemplazado).

## Overall Impression
La interfaz es potente y rica en datos reales de APIs, pero la experiencia se siente abrumadora y monolítica. El contraste entre la búsqueda reactiva instantánea y el resto de los filtros en modo "draft/staged" genera fricción.

## What's Working
1. **Búsqueda reactiva optimizada**: Uso de useDeferredValue y debounce de 300ms para mantener el input fluido frente a grandes volúmenes de datos.
2. **Vistas personalizadas**: Guardado directo en localStorage de combinaciones de filtros frecuentes.
3. **Pills de proveedores**: Flexibles e intuitivas, aunque requieren cuidado con el escalado.

## Priority Issues

### [P1] Inconsistencia en la Aplicación de Filtros (Split State)
- **Why it matters**: El input de texto altera la tabla al instante, mientras que los sliders requieren clickear "Aplicar filtros". Esto divide el modelo mental del usuario.
- **Fix**: Hacer que todos los inputs sean reactivos con debounces cortos o, al revés, incluir el buscador en el botón "Aplicar".
- **Suggested command**: $impeccable polish

### [P1] Jerarquía Visual Plana (Wall of Options)
- **Why it matters**: Las opciones avanzadas (Elo CI, ZeroEval, BenchLM) compiten en peso visual con opciones primarias como el precio o el hardware, abrumando al usuario.
- **Fix**: Separar el panel en filtros básicos y un acordeón colapsable para métricas avanzadas de desarrollo.
- **Suggested command**: $impeccable layout

### [P2] Falta de Resumen de Filtros Activos
- **Why it matters**: Cuando el drawer se oculta, no hay indicaciones de que la tabla está filtrada, lo que puede provocar confusión ("¿por qué no aparece mi modelo?").
- **Fix**: Renderizar tags de filtros activos debajo del botón "Mostrar filtros" cuando el panel esté cerrado.
- **Suggested command**: $impeccable delight

### [P2] Inaccesibilidad en Controles Personalizados
- **Why it matters**: Los inputs visuales de capacidades y proveedores omiten anillos de foco para teclado. El selector de vistas guardadas no tiene roles ARIA (aria-expanded, etc.).
- **Fix**: Implementar focus-visible y añadir roles semánticos correctos para lectores de pantalla.
- **Suggested command**: $impeccable audit

## Minor Observations
- El selector de fecha para Cutoff tiene un renderizado HTML nativo inconsistente entre navegadores.
- El restablecimiento de filtros vacía el buscador de inmediato, provocando un salto brusco en la UI.

## Questions to Consider
- ¿Realmente el desarrollador filtra por intervalos de confianza de Elo (±) y votos acumulados en la vista principal, o podríamos simplificarlo en una sola métrica de "Popularidad/Confianza"?
- ¿Podríamos transformar la grilla gigante de checkboxes de capacidades en una lista compacta de tags autocompletables para liberar un 50% de espacio vertical?
