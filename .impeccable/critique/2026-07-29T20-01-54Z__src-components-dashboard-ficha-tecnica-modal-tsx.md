---
target: Ficha Técnica Modal
total_score: 23
max_score: 32
na_heuristics: 7,9
p0_count: 0
p1_count: 1
timestamp: 2026-07-29T20-01-54Z
slug: src-components-dashboard-ficha-tecnica-modal-tsx
---
⚠️ DEGRADED: single-context (inline run; sub-agents unavailable)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good use of skeletons and badges (Vigente/Reemplazado) |
| 2 | Match System / Real World | 2 | Jerga técnica expuesta sin filtros ("safetensors", "Auto Model") |
| 3 | User Control and Freedom | 4 | El modal se puede cerrar fácilmente; no hay encierros |
| 4 | Consistency and Standards | 3 | Sigue convenciones de Shadcn, pero le falta identidad propia |
| 5 | Error Prevention | 4 | Es de solo lectura, no hay inputs de usuario |
| 6 | Recognition Rather Than Recall | 3 | Tooltips ayudan con los términos, pero hay mucha carga cognitiva |
| 7 | Flexibility and Efficiency | n/a | Es un modal de lectura (Read surface) |
| 8 | Aesthetic and Minimalist Design | 1 | Exceso de bordes grises (Card-ception); diseño sobrecargado |
| 9 | Error Recovery | n/a | Es de solo lectura |
| 10 | Help and Documentation | 3 | Tooltips actúan como documentación en línea |
| **Total** | | **23/32** | **Acceptable** |

#### Design Specificity Verdict

**LLM assessment**: La interfaz actual se siente genérica y puramente utilitaria. Podría ser el panel de configuración de un router o un ERP contable. No tiene la identidad visual "Premium" que se espera de un selector de IA avanzado. Las decisiones de diseño (cajas grises con bordes) son "category-interchangeable" y carecen de asertividad estética.

**Deterministic scan**: El escáner estático (`detect.mjs`) reportó 0 hallazgos estructurales o de tokens rotos. El código subyacente y la accesibilidad base están sanos. No hay superposiciones (overlays) inyectadas dado que estamos en una sesión degradada (single-context).

#### Overall Impression
La ficha técnica está mecánicamente sana y muestra todos los datos requeridos, pero está asfixiada por una estética aburrida y un exceso de "cajas" (bordes rígidos). La mayor oportunidad es aplicar un rediseño "glassmorphism" o similar para elevar los datos y eliminar el ruido estructural.

#### What's Working
- **Badges Semánticos:** Los indicadores de "Vigente" (verde) o "Reemplazado" (amarillo/naranja) son excelentes y rompen la monotonía.
- **Micro-interacciones de ayuda:** Los tooltips en las métricas principales (`TTFT`, `Elo`) solucionan gran parte de la fricción para entender datos abstractos.

#### Priority Issues

- **[P1] La jaula de bordes (Card-ception)**
  - **Why it matters**: Las secciones (`Section`) y las tarjetas de métricas usan gruesos bordes grises y fondos planos. Esto genera alta carga cognitiva y hace que el contenido se sienta "pesado" y anticuado.
  - **Fix**: Eliminar los bordes rígidos. Usar `bg-black/5` o variaciones tonales sutiles para delimitar zonas, y aplicar sombras suaves o "hover effects".
  - **Suggested command**: `$impeccable bolder` o `$impeccable layout`

- **[P2] Visualización plana de BenchLM**
  - **Why it matters**: Mostrar los puntajes (ej. "84.4") en una tabla estándar es aburrido. Los usuarios no sienten la diferencia entre un modelo bueno y uno excepcional.
  - **Fix**: Convertir la tabla en un panel de barras de progreso gruesas, con gradientes (rojo a verde) o colores neón, donde el número flote con peso sobre la barra.
  - **Suggested command**: `$impeccable delight` o `$impeccable overdrive`

- **[P2] Ruido de datos técnicos profundos**
  - **Why it matters**: Mostrar métricas crudas de HuggingFace (`safetensors`, parámetros internos) en la vista principal confunde a perfiles no técnicos (Operarios, Gerentes).
  - **Fix**: Agrupar los datos ultra-técnicos en un acordeón plegable ("Detalles Avanzados") o colapsarlos por defecto.
  - **Suggested command**: `$impeccable distill`

#### Persona Red Flags

**Jordan (First-Timer)**: Al abrir la Ficha Técnica, Jordan se enfrenta a un muro de 25 campos de datos estructurados en múltiples cajas grises. Aunque los tooltips ayudan, el diseño no le guía la mirada hacia lo que realmente importa (Inteligencia vs Precio). Se sentirá abrumado y cerrará el modal.

**Alex (Power User)**: Alex puede encontrar la información, pero sentirá que la interfaz es torpe. La tabla plana de BenchLM requiere que lea todos los números en lugar de poder escanear visualmente colores o barras prominentes para tomar una decisión rápida.

#### Minor Observations
- El contenedor del modal (`DialogContent`) requiere un `max-w` dinámico que responda mejor en monitores ultra anchos (esto ya está en progreso).
- Los íconos de las tarjetas de métrica tienen poco contraste y se pierden visualmente.

#### Questions to Consider
- "¿Qué pasaría si la Ficha Técnica no usara un solo borde de línea en toda su estructura?"
- "¿Cómo se verían los puntajes si usáramos la estética de los perfiles de stats de videojuegos?"
