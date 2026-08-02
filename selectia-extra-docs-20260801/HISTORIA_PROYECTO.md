# 📖 Historia del Proyecto — SelectIA

> **Crónica detallada del desarrollo de SelectIA, v1.0 → v3.3.1**, escrita por el autor a partir de commits, notas personales y el `worklog.md` del repositorio.
>
> **Autor:** José Jesús Alejandro Soria Vásquez
> **Carrera:** Ingeniería Industrial (Perú)
> **Periodo cubierto:** 24 de junio – 30 de julio de 2026 (5 semanas)
> **Versión final:** v3.3.1
> **Estado al cierre:** listo para GitHub + Vercel + LinkedIn

---

## 🌅 Prólogo — De dónde viene la idea

Soy estudiante de Ingeniería Industrial en Perú. No soy programador profesional; aprendí TypeScript por mi cuenta durante 2024 mientras trabajaba en un proyecto de mejora de procesos en una pequeña metalmecánica de Chiclayo. Lo que vi en esos meses me marcó.

La empresa tenía 14 operarios, 3 tornos CNC y un gerente que había oído hablar de "ChatGPT" pero no sabía qué hacer con él. Cuando le pregunté por qué no usaba IA para, digamos, generar programas de CNC o traducir manuales técnicos del chino, su respuesta fue:

> *"Hermano, he probado tres. Uno me cobraba en dólares y no sé cuánto me va a salir al final. Otro era gratis pero me daba respuestas que no servían. El tercero era bueno pero lento. ¿Cómo sé cuál elegir? No tengo tiempo para investigar."*

Esa frase es el origen de SelectIA. La brecha no era tecnológica — los modelos existen. La brecha era **de acceso y de decisión**. Las MYPEs peruanas no tienen un equipo de TI que compare 200 modelos. Tienen al gerente que además hace de todo.

La estadística que me dio el empujón final vino de Workday Research, enero 2026: en una encuesta a 3,200 líderes de organizaciones, **el 85% reporta ahorrar entre 1 y 7 horas semanales con IA**, pero **el 40% admite que parte de ese tiempo se pierde en retrabajo** por elegir mal la herramienta. Es decir, el problema no es "falta de IA", es **exceso de opciones sin criterio**.

SelectIA nació para cerrar esa brecha con un motor matemático (TOPSIS + AHP) que yo ya conocía por la carrera, aplicado a una decisión que las MYPEs toman cada semana.

---

## 📅 Semana 1 — Ideación, investigación y primer prototipo (24-30 junio 2026)

### Día 1 — Miércoles 24 de junio

Empecé el día sin código, solo con una libreta. Escribí la pregunta: *"¿Qué tendría que existir para que un gerente MYPE peruano elija un modelo de IA en 30 segundos en vez de 30 minutos?"*

Las respuestas que me di:

1. Una tabla que compare todos los modelos relevantes, no solo los de un proveedor.
2. Precios en soles peruanos (PEN), no solo en dólares.
3. Un motor que recomiende, no solo que filtre.
4. Que cueste cero soles correrlo (la MYPE no va a pagar un SaaS extra para decidir sobre otro SaaS).

Esa noche le pedí a GLM-5.2 un primer diseño del sistema. Me respondió con un diagrama de 3 cajas: "Data Sources → Orchestrator → Dashboard". Simple pero correcto.

### Día 2 — Jueves 25 de junio

Conversé con Claude Sonnet 4.6 sobre la idea. Claude me preguntó: *"¿Por qué TOPSIS y no simplemente un ordenamiento por score?"*. Le expliqué que TOPSIS permite múltiples criterios con pesos distintos y que AHP permite verificar que los pesos sean consistentes. Esto no es trivial: en ingeniería industrial usamos TOPSIS para selección de proveedores y localización de plantas. Aplicarlo a selección de modelos era directo.

Claude me empujó a definir los criterios. Llegamos a 7:

1. Precio (costo blended por millón de tokens)
2. Intelligence Index (II, de Artificial Analysis)
3. Coding Index (también de AA)
4. Agentic Index (también de AA)
5. Speed (tokens por segundo, de AA)
6. Context window (de LiteLLM)
7. Elo (de Arena AI)

### Día 3 — Viernes 26 de junio

Pasé el día entero conversando con las 4 IAs para descubrir APIs. El detalle está en `CONVERSACIONES_INVESTIGACION.md` sección 2. La salida fue una lista de 13 fuentes, listas para verificar.

### Día 4 — Sábado 27 de junio

Día de descanso (parcial). Solo actualicé la libreta y leí un paper de Saaty sobre AHP para refrescar la teoría.

### Día 5-7 — Domingo 28 a martes 30 de junio

Fase de descubrimiento y verificación. El 28 lancé el prompt de descubrimiento a las 4 IAs. El 29 crucé respuestas. El 30 ya tenía el documento `api_raw_schemas_detailed.md` con 705 líneas producido por Claude en Antigravity.

Esa noche escribí en mi libreta: *"Tengo 13 fuentes verificadas. Mañana empiezo el PRD."*

---

## 🚀 Semana 2 — v1.0 → v3.2 (1-6 julio 2026)

Esta fue la semana más intensa. En 6 días pasé de "cero líneas de código" a v3.2 funcional.

### Día 8 — Miércoles 1 de julio

Claude termina la verificación de APIs. Empiezo a conversar la estructura del PRD.

### Día 9 — Jueves 2 de julio

Claude produce la primera versión del PRD (1,800 líneas, demasiado académica). Se la paso a GLM para que la refine a algo ejecutable.

### Día 10 — Viernes 3 de julio

GLM entrega el PRD final: `AI_SUPER_DASHBOARD_PRD_v3.2.md`, 2,584 líneas. Esa misma tarde lanzo a GLM en modo Agente Full Stack con la instrucción de implementar todo. Empieza por `globals.css` (token system Linear + Stripe), `layout.tsx`, `types.ts`.

### Día 11 — Sábado 4 de julio

GLM escribe el motor HRE-TOPSIS: `src/lib/engine/hre-topsis.ts` con 5 capas (TF-IDF, filtros duros, AHP, TOPSIS, explicación). 1,691 líneas al final del día. La versión inicial solo tenía 7 criterios.

Tres bugs serios esa noche:

- **Pesos AHP no sumaban 1** en varios vectores.
- **`extractMetrics()` se llamaba inconsistente** (con II de AA en un lugar, II de BenchLM en otro).
- **ContextWindow corrupto** porque el matching con LiteLLM no normalizaba nombres.

Los tres los dejé para el día siguiente.

### Día 12 — Domingo 5 de julio

Maratón de fixes. Empecé a las 6 AM, terminé a las 2 AM del lunes. Le pasé `hre-topsis.ts` a Claude para auditoría y encontró un cuarto bug: el quality gate no excluía modelos con `benchlmScoreConfidence === 1`. Lo arreglamos.

Ese día también implementé las 6 vistas principales: Overview, Recomendador, Tabla Maestra, Calculadora, Comparador, Salud.

### Día 13 — Lunes 6 de julio

Cerré v3.2 con:

- 24 modelos de IA (dataset seed, no los 206 finales)
- 4 monedas (PEN, USD, EUR, GBP)
- 6 perfiles de usuario (A-F)
- Animación del motor (36 pasos)
- Glosario inicial de 81 términos
- Cron job GitHub Actions
- JSON maestro < 500 KB
- Dark mode

**v3.2 quedó lista el 6 de julio a las 23:42.** Commit: `feat: SelectIA v3.2 ready`. Subí el tag y me fui a dormir.

| v3.2 — Métricas | Valor |
|---|---|
| Modelos | 24 (seed) |
| Fuentes | 11 |
| Monedas | 4 |
| Criterios TOPSIS | 7 |
| Glosario | 81 términos |
| LOC `src/` | ~12,000 |

---

## 🔧 Semana 3-4 — Refinamientos, documentación y backup (7-27 julio 2026)

### Semana 3 (7-13 julio)

Después del sprint de la semana 2,减速. Esta semana fue de limpieza:

- **Documentación.** Escribí `ARCHITECTURE.md` (18,238 bytes), `DEPLOYMENT.md`, `CONTRIBUTING.md`, `CHANGELOG.md`. Otro agente extrajo `MASTER.md` (el design system).
- **Refactor.** Eliminé duplicados. El `dashboard-store.ts` tenía 3 lugares distintos que seteaban la moneda; los consolidé.
- **Lint.** Pasé de 14 warnings a 0. Principio: `bun run lint` tiene que dar 0 errores antes de cada commit.
- **TypeScript.** Pasé de 5 errores TSC a 0.

### Semana 4 (14-27 julio)

Aquí pasaron dos cosas grandes:

1. **HuggingFace Hub al 100%.** Sub-agente dedicado cubrió todos los campos de la API de HF: `downloads`, `likes`, `safetensors`, `spaces`, `gated`. La cobertura pasó de ~30% a 100%.
2. **Fetchers de Fase 2.** Otro sub-agente implementó fetchers adicionales para los perfiles C/E/F (Consultor, Operario, Compras), añadiendo vistas como Mapa de Proveedores, Routing LLM, Calculadora Hardware, QR Generator.

A nivel personal, fue una semana de dudas. Estaba tentado a declarar el proyecto "terminado" y publicarlo. Pero algo me incomodaba: el motor HRE-TOPSIS se sentía **precio-céntrico**. Si dos modelos costaban lo mismo, el ranking dependía solo de II, que es un promedio de benchmarks académicos. No estaba capturando la pregunta que el gerente de Chiclayo me había hecho: *"¿este modelo falla en producción?"*

Esa incomodidad me llevó a planear la semana 5.

### 27 de julio — Backup

Generé `selectia-v3.3.1-ULTIMO-20260728-052142.tar.gz` (50.4 MB) con todo el estado actual. Esto fue un punto de no retorno: si la semana 5 rompía algo, podía restaurar.

---

## 🎯 Semana 5 — v3.3.1: BenchLM, ZeroEval y el motor de 8 criterios (28-30 julio 2026)

Tres días. Cinco fases. Cero horas de sueño perdidas (a diferencia de la semana 2).

### Fase 1 — Lunes 28 de julio (mañana)

**Tipos + schemas.** Añadí a `types.ts` los campos BenchLM (8 category scores, displayScore, rank, confidence, Función K `supersededBy`) y ZeroEval (`failureRate`, `p95Latency`, `avgThroughput`, `totalCalls`). Creé `validations.ts` con 6 schemas Zod para validar las respuestas de BenchLM (5 sub-endpoints) y ZeroEval (1 endpoint).

### Fase 2 — Lunes 28 de julio (tarde)

**Fetchers.** Implementé `fetchBenchLM()` que dispara 5 sub-endpoints en paralelo vía `Promise.allSettled`, y `fetchZeroEvalMetrics()` para el endpoint único. Añadí `normalizeForMatching()` para normalizar nombres antes del matching (sin él, "Claude Opus 4.7 (Adaptive)" no matcheaba con "Claude Opus 4.7"). Y `applyBenchlmEnrichment()` que muta cada `AIModel` in-place con los datos de BenchLM y ZeroEval.

Resultado tras regenerar el JSON: **93/225 modelos BenchLM-enriquecidos, 45/225 ZeroEval-enriquecidos**. 13 fuentes, todas en verde. JSON: 367.6 KB (bien por debajo del límite de 500 KB).

### Fase 3 — Martes 29 de julio (mañana)

**Motor de 8 criterios.** La fase más delicada. Claude me había propuesto: mantener 8 criterios reemplazando el II genérico por un II por categoría (tomado de BenchLM cuando existe) y añadiendo `reliability` (1 − `failure_rate` de ZeroEval) como criterio nuevo. Implementé:

- `WeightSet` extendido con `reliability: number`.
- 24 vectores AHP recalibrados (3 modos × 8 categorías), cada uno sumando **exactamente 1.000**.
- `getCategoryIntelligenceIndex(model, category)` — devuelve el score BenchLM específico cuando existe, fallback a `intelligenceIndex`.
- `extractMetrics()` extendido con `reliability = 1 − zeroevalFailureRate` (con baseline 0.95 cuando no hay datos).
- `topsisRank(models, weights, category?)` — la firma cambió para aceptar `category` opcional.
- AHP CR verificado: **24/24 combinaciones dan CR = 0** (porque la matriz pairwise se deriva del vector de pesos, que es consistente por construcción).

### Fase 4 — Martes 29 de julio (tarde) y miércoles 30

**UI.** Cinco tareas en paralelo (delegué a sub-agentes):

- **4A.1 — Tabla Maestra:** nueva columna "Confiab." + Filtro 14 (minReliability) + badge Función K (Vigente / Reemplazado).
- **4A.2 — Recomendador:** alert cuando el ganador tiene `failure_rate > 10%`.
- **4A.3 — Guía de Decisión:** dots de confiabilidad + pill "→ {successor}".
- **4A.4 — Salud del Sistema:** 8 mini-badges de cobertura BenchLM + 2 quality rows (BenchLM y ZeroEval coverage).
- **4A.5 — Simulador ROI:** banner con "frontier price drop" de BenchLM stats.
- **4B.1 — Overview:** LineChart con 41 meses del BenchLM Token Price Index (3 tiers: frontier, mid, budget).
- **4B.2 — Ficha Técnica:** 3 secciones nuevas (BenchLM 8 categorías, ZeroEval 4 métricas, Ciclo de Vida Función K).
- **4B.3 — Animación del Motor:** actualizado a 8 criterios + Modo Traza con badges de proveniencia.

### Fase 5 — Miércoles 30 de julio

**Cierre.** Cuatro tareas finales:

- **21 monedas de América.** Extendí el sistema de 4 monedas a 21: PEN, USD, BRL, MXN, COP, CLP, ARS, CAD + 13 más. Tipo de cambio customizable con override en localStorage.
- **Glosario a 176 términos.** Empezó con 81 en v3.2. Añadí 95 términos más 15 deepDives expandibles, en 8 categorías. Verifiqué 0 intercorrelaciones rotas.
- **4 temas.** Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro.
- **Privacy Policy + Terms of Service + LICENSE MIT.** Las páginas `/privacy` y `/terms`. Archivo `LICENSE` MIT.

### Tabla resumen — v3.2 → v3.3.1

| Métrica | v3.2 (6 jul) | v3.3.1 (30 jul) | Δ |
|---|:---:|:---:|---|
| Modelos de IA | 24 (seed) | 206 | +182 |
| Fuentes de datos | 11 | 13 | +2 (BenchLM, ZeroEval) |
| Monedas | 4 | 21 | +17 |
| Criterios TOPSIS | 7 | 8 | +1 (reliability) |
| Glosario términos | 81 | 176 | +95 |
| BenchLM modelos | 0 | 87 | — |
| ZeroEval modelos | 0 | 36 | — |
| LOC `src/` | ~12,000 | 31,116 | +~19,000 |
| Archivos TypeScript | ~70 | 111 | +~40 |
| Temas | 2 (dark/light) | 4 | +2 |
| TSC errors | 3 | 0 | −3 |
| Lint errors | 0 | 0 | — |
| JSON maestro | ~250 KB | 376 KB | +126 KB |

---

## 🏆 Hitos clave

1. **24 junio 2026** — Idea escrita en la libreta. Pregunta de investigación formulada.
2. **28 junio 2026** — Prompts de descubrimiento lanzados a las 4 IAs en paralelo.
3. **30 junio 2026** — `api_raw_schemas_detailed.md` completado (705 líneas, 13 fuentes verificadas).
4. **2 julio 2026** — Primera versión del PRD por Claude (1,800 líneas).
5. **3 julio 2026** — PRD final v3.2 por GLM (2,584 líneas). Inicio de implementación.
6. **5 julio 2026** — Bugs serios encontrados y resueltos. Auditoría de Claude encuentra bug del quality gate.
7. **6 julio 2026, 23:42** — v3.2 lista. Commit `feat: SelectIA v3.2 ready`. Primer tag.
8. **20 julio 2026** — HuggingFace Hub al 100% de cobertura de campos.
9. **27 julio 2026, 05:21** — Backup `selectia-v3.3.1-ULTIMO-20260728-052142.tar.gz` generado (50.4 MB).
10. **28 julio 2026** — Fase 1 (tipos + schemas) + Fase 2 (fetchers BenchLM + ZeroEval) completadas.
11. **29 julio 2026** — Fase 3 (motor 8 criterios) + Fase 4 (UI 8 tareas) completadas.
12. **30 julio 2026** — v3.3.1 cerrada. 21 monedas, 176 términos, 4 temas, LICENSE MIT, Privacy + Terms.

---

## 🧭 Decisiones críticas

Diez decisiones que cambiaron el rumbo del proyecto:

1. **Usar 4 IAs en paralelo en vez de 1.** Más lento en overhead, pero cada IA auditaba a las demás. Tres bugs serios se encontraron así.
2. **No usar framework de orquestación.** Curva de aprendizaje vs. tiempo disponible. Yo era el "grafo" manual.
3. **Replicar Linear + Stripe en vez de inventar un design system.** No soy diseñador. Replicar tokens profesionales me ahorró 200 decisiones micro-estéticas.
4. **Priorizar Artificial Analysis como fuente primaria.** Era la única con II estandarizado y headers de quota confiables.
5. **Mantener 8 criterios en vez de 9 al añadir BenchLM y ZeroEval.** Reemplazar II genérico por II por categoría + añadir reliability era más elegante que expandir la dimensionalidad.
6. **Piso de calidad II ≥ 30 en modo Calidad.** Evita que el motor recomiende modelos malos solo por ser baratos.
7. **JSON estático servido por Vercel + cron GitHub Actions.** Cero costo de hosting, cero latencia de runtime, 2 AM Lima.
8. **Basar el design system en CSS variables, no en Tailwind classes hardcodeadas.** Permitió intercambiar 4 temas cambiando un solo bloque de variables.
9. **Hacer MIT la licencia.** Maximiza adopción. Una MYPE no va a leer una licencia MIT, pero si fuera GPL o comercial, sí se asustaría.
10. **Cero dependencias nuevas en la Fase 5.** Usé solo componentes shadcn/ui existentes (Alert, Tooltip) y Lucide icons (AlertTriangle, ShieldCheck, TrendingDown). Mantuvo el bundle estable.

---

## 😰 Momentos difíciles

### 5 de julio, 3 AM — "No funciona nada"

Tras 14 horas programando, el motor HRE-TOPSIS devolvía rankings sin sentido. El ganador para "calculos" era un modelo de visión. Revisé y revisé sin encontrar el bug. Casi abandono. Lo dejé, me fui a dormir, y a las 9 AM del día siguiente, con la cabeza fría, encontré en 20 minutos: el peso `precio` en modo Calidad era 0.05 (casi nulo), lo que permitía que modelos caros pero con II alto ganaran incluso cuando el usuario pedía "calculos" baratos. Fix: recalibrar pesos en modo Calidad para que `precio` tuviera 0.15 mínimo.

### 15 de julio — "¿Esto es realmente útil?"

Semanas de refactor sin nuevas features. Me pregunté si SelectIA era un proyecto útil o solo un ejercicio académico. La respuesta que me di: si lo uso yo, alguien más lo va a usar. La utilidad no se mide en usuarios, se mide en si resuelve una pregunta real. Y la pregunta —"¿qué modelo elijo?"— era real.

### 28 de julio, noche — "Pesos que no suman 1"

Tras añadir el 8º criterio, 6 vectores de pesos sumaban 0.998 o 1.003. Pensé que era un error de cálculo. Resultó ser drift de float. Fix: nudge ±0.001 en el peso más grande. Pareció trivial, pero me tomó 2 horas porque no creía que flotantes pudieran fallar en algo tan simple.

### 29 de julio, tarde — "El matching BenchLM no matchea"

Esperaba 225/225 modelos BenchLM-enriquecidos. Obtuve 93/225. La causa: los nombres en BenchLM venían sin sufijos (`Claude Opus 4.7`) mientras que AA los traía con (`Claude Opus 4.7 (Adaptive)`). Fix: 2 pasadas — primero sin sufijo, después con sufijo normalizado. Subió a 93 (la cobertura real, no 225, porque BenchLM solo tiene 87 modelos en su leaderboard).

---

## 🎉 Momentos satisfactorios

### 6 de julio, 23:42 — Primer tag

Cuando subí el tag v3.2 a GitHub me quedé mirando la pantalla 5 minutos. No era un proyecto trivial. Era un proyecto que **funcionaba**. Lo abrí en el navegador, hice una recomendación para "redactar correo comercial", y GLM-5.2 apareció como ganador. Cerré el laptop y me fui a dormir 10 horas.

### 20 de julio — HuggingFace al 100%

Tras 3 días de trabajo, el sub-agente reportó 100% de cobertura de campos de la API de HuggingFace. Verificar cada campo (downloads, likes, safetensors, spaces, gated) en la UI y que todos estuvieran poblados fue una sensación de "esto está bien hecho".

### 29 de julio, mañana — "El motor habla con tres voces"

El smoke test más satisfactorio: una consulta para "automatizar flujo con agentes IA" en modo Equilibrado devolvió como ganador a Claude Sonnet 5 con razones que citaban **las tres fuentes de datos**: AA (Agentic Index), BenchLM (score específico de agentic) y ZeroEval (reliability 89.3% basado en 169 llamadas). El motor ya no hablaba con una sola voz; hablaba con tres. Ese fue el momento en que supe que v3.3.1 era una mejora real, no cosmética.

### 30 de julio, tarde — "Lint 0, TSC 0"

Cerré el proyecto con `bun run lint` → 0 errores y `npx tsc --noEmit` → 0 errores. Esa limpieza fue más satisfactoria que cualquier feature nueva.

---

## 📍 Estado actual

SelectIA v3.3.1 está **listo para publicar**:

- ✅ Código: 31,116 LOC, 111 archivos, lint 0, tsc 0.
- ✅ JSON maestro: 376 KB (bajo el límite de 500 KB).
- ✅ 206 modelos, 13 fuentes, 21 monedas, 176 términos, 8 criterios.
- ✅ Deploy gratis en Vercel configurado (`vercel.json`).
- ✅ Cron GitHub Actions diario a las 2 AM Lima (`/.github/workflows/`).
- ✅ Privacy Policy + Terms of Service + LICENSE MIT.
- ✅ 4 temas (Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro).
- ✅ README.md profesional con badges, diagramas mermaid, métricas.
- ✅ CHANGELOG.md, CONTRIBUTING.md, ARCHITECTURE.md, DEPLOYMENT.md.
- ✅ Backup completo en `selectia-v3.3.1-ULTIMO-20260728-052142.tar.gz`.

Lo único que falta es subir el repo a GitHub, conectarlo a Vercel, y escribir el post de LinkedIn.

---

## 🚀 Próximo capítulo

Los siguientes pasos, en orden:

1. **Crear repo público en GitHub** (`github.com/redentor159/selectia`). Push del código + tags.
2. **Conectar Vercel.** Import del repo, configurar variables de entorno (`AA_API_KEY`, `HF_TOKEN`, `NTFY_TOPIC`), deploy. URL objetivo: `selectia.vercel.app`.
3. **Configurar GitHub Actions cron.** Workflow file en `.github/workflows/cron-daily.yml` que a las 2 AM Lima (07:00 UTC) ejecuta `bun run scripts/generate-static-json.ts` y commitea el JSON resultante.
4. **Post de LinkedIn.** Tres párrafos: contexto (MYPEs peruanas, brecha de decisión), solución (HRE-TOPSIS, 13 fuentes, 21 monedas), reflexión (multi-IA collaboration, MIT). Evitar claims sin data; usar el dato real de Workday Research.
5. **Pedir feedback a 5 personas.** Dos ingenieros industriales, dos programadores, un gerente MYPE. Iterar.
6. **Plan v3.4.** Sensitivity analysis formal, integración de leaderboards académicos (SWE-bench, GPQA), estudio con usuarios reales MYPE.

La historia continúa.

---

## Apéndice — Cronología compacta

| Fecha | Evento clave |
|---|---|
| 24 jun 2026 | Idea en la libreta |
| 28 jun 2026 | Descubrimiento de APIs (4 IAs en paralelo) |
| 30 jun 2026 | `api_raw_schemas_detailed.md` completo (705 líneas) |
| 2 jul 2026 | Primera versión del PRD (Claude) |
| 3 jul 2026 | PRD final v3.2 (GLM) + inicio implementación |
| 5 jul 2026 | Bugs serios + auditoría de Claude |
| 6 jul 2026 | **v3.2 lista** (24 modelos, 11 fuentes, 4 monedas) |
| 7-13 jul 2026 | Documentación + refactor + lint 0 |
| 14-20 jul 2026 | HuggingFace 100% + fetchers de Fase 2 |
| 21-27 jul 2026 | Refinamientos + backup 27 jul 05:21 |
| 28 jul 2026 | Fase 1 (tipos + schemas) + Fase 2 (fetchers) |
| 29 jul 2026 | Fase 3 (motor 8 criterios) + Fase 4 (UI) |
| 30 jul 2026 | **v3.3.1 lista** (206 modelos, 13 fuentes, 21 monedas) |

---

*Crónica cerrada el 30 de julio de 2026. SelectIA v3.3.1.*
