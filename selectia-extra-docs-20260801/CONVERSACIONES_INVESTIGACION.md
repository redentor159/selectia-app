# 🧠 Conversaciones de Investigación — SelectIA

> **Bitácora narrativa del proceso de investigación multi-IA** que dio forma a SelectIA v3.3.1.
>
> **Autor:** José Jesús Alejandro Soria Vásquez
> **Carrera:** Ingeniería Industrial (Perú)
> **Fecha de cierre del documento:** 30 de julio de 2026
> **Versión documentada:** v3.3.1
> **Propósito:** Dejar constancia escrita de cómo se usaron cuatro modelos de IA como asistentes de investigación en paralelo, sin framework de orquestación, para construir un Command Center de 206 modelos de IA dirigido a MYPEs latinoamericanas.

---

## 0. Cómo leer este documento

Este archivo no es un tutorial técnico ni un paper académico. Es una **bitácora de investigación** escrita en primera persona, en la que reconstruyo —con la mayor honestidad posible— las conversaciones que sostuve con cuatro modelos de IA diferentes entre el 24 de junio y el 30 de julio de 2026.

Las métricas que cito son reales y verificables en el repositorio:

| Métrica | Valor |
|---|---|
| Modelos de IA comparados | 206 |
| Fuentes de datos en vivo | 13 |
| Monedas de América soportadas | 21 |
| Términos en glosario | 176 |
| Líneas de TypeScript en `src/` | 31,116 |
| Archivos TypeScript | 111 |
| Criterios del motor HRE-TOPSIS | 8 |
| Vectores AHP recalibrados | 24 |

Las fechas son aproximadas (±1 día) salvo cuando provienen de un commit, del `CHANGELOG.md` o del `worklog.md` del repositorio, en cuyo caso son exactas.

---

## 1. Metodología de investigación multi-IA

### 1.1 Por qué cuatro modelos y no uno

Cuando empecé SelectIA no tenía una opinión formada sobre cuál IA era "la mejor" para programar. Lo que sí tenía era la sospecha, basada en mi lectura de la industria, de que **ningún modelo es óptimo en todas las tareas**. Claude Sonnet 4.6 me parecía más cuidadoso con la estructura larga; Gemini 3.1 Pro manejaba mejor contextos enormes; GLM-5.2 era agresivo y rápido escribiendo código; Minimax M3 tenía una voz editorial que ayudaba a pensar.

Decidí entonces usar los cuatro **en paralelo** como asistentes de investigación, cada uno con un rol informal:

- **GLM-5.2** — *ingeniero de implementación*: el que más código escribía. Lo usé en modo Agente Full Stack dentro de Z.ai Code. Su ventaja era velocidad y voluntad de iterar; su desventaja, que a veces omitía detalles sutiles (por ejemplo, mezclaba `BG` con `BG-elevated` en tokens CSS).
- **Claude Sonnet 4.6** — *editor y verificador*: el que estructuraba documentos largos y verificaba afirmaciones. Lo usé sobre todo en Antigravity. Su ventaja era la precisión; su desventaja, que era más lento y conservador.
- **Gemini 3.1 Pro** — *analista de contexto largo*: el que leía repositorios enteros y me ayudaba a cruzar referencias. Lo usé cuando necesitaba entender un módulo de 1,800 líneas de un solo vistazo.
- **Minimax M3** — *redactor y crítico*: el que mejor redactaba en español neutro y el que más me cuestionaba decisiones ("¿estás seguro de que el piso de calidad debe ser II ≥ 30 y no 25?").

### 1.2 Por qué no usé un framework de orquestación

Existen frameworks como LangGraph, AutoGen, CrewAI o LangChain que permiten orquestar múltiples agentes automáticamente. No los usé, por tres razones:

1. **Curva de aprendizaje vs. tiempo disponible.** Tenía cinco semanas y un objetivo funcional, no un objetivo de arquitectura. Aprender LangGraph + configurar tool-calling + manejar errores de grafo me habría costado fácilmente una semana.
2. **Visibilidad.** Cuando algo falla en un framework de orquestación, debuggear es difícil porque pierdes el hilo de qué agente tomó qué decisión. Haciéndolo manual, yo era el "grafo": pasaba la salida de un modelo a otro copiando y pegando, y podía inspeccionar cada paso.
3. **Costo cero.** Cada modelo tenía su propia interfaz gratuita o con créditos. Un framework habría requerido API keys pagas unificadas, y mi presupuesto era literalmente cero soles.

La desventaja, claro, es que **el cuello de botella era yo**. No podía paralelizar tres conversaciones al mismo tiempo sin perder el hilo. Lo resolví con una rutina: cada mañana abría las cuatro interfaces, lanzaba la misma pregunta a las cuatro, y dedicaba la tarde a cruzar respuestas y decidir.

### 1.3 Cómo pasaba información manualmente

El flujo típico era:

1. Escribía un prompt en GLM-5.2.
2. GLM respondía con código o un análisis.
3. Copiaba la respuesta a un archivo `.md` local (por ejemplo, `notas/glm-ronda-1.md`).
4. Abría Claude, le pasaba el archivo y le pedía: *"Revisa esto. ¿Qué falta? ¿Qué está mal?"*
5. Claude respondía con correcciones.
6. Volvía a GLM con las correcciones: *"Aplica estos cambios."*
7. Repetía con Gemini para contexto largo y Minimax para redacción.

Esto suena ineficiente, y lo era. Pero tenía una ventaja inesperada: **cada IA auditaba a las demás**. Cuando GLM decía "esto es correcto", Claude a veces encontraba un bug. Cuando Claude decía "esto está bien estructurado", Minimax a veces encontraba una frase ambigua. El cruce manual era, de hecho, una forma artesanal de ensemble.

---

## 2. Fase 1 — Descubrimiento de APIs (28-30 junio 2026)

### 2.1 La pregunta inicial

El 28 de junio de 2026 abrí las cuatro interfaces con esta pregunta, casi idéntica en cada una:

> *"Estoy construyendo un dashboard que compare modelos de IA (GPT, Claude, Gemini, Llama, etc.) para pequeñas empresas peruanas. ¿Qué APIs públicas o semi-públicas existen para obtener precios, métricas de calidad (benchmarks), velocidad y disponibilidad de modelos LLM? Lista todas las que conozcas, con su endpoint y qué datos ofrecen."*

### 2.2 Lo que encontró cada IA

**GLM-5.2** fue el primero en responder (≈ 40 segundos). Listó 8 fuentes:
- Artificial Analysis
- LiteLLM (GitHub raw)
- OpenRouter
- HuggingFace Hub
- Together AI
- Replicate
- OpenAI / Anthropic / Google (oficiales)
- Ollama (para modelos locales)

Su respuesta fue útil pero **omitió fuentes académicas** como Arena AI (Chatbot Arena) y ZeroEval.

**Claude Sonnet 4.6** tardó más (≈ 90 segundos) pero su lista fue más cuidada. Añadió:
- Arena AI (`api.wulong.dev`) — Elo ratings
- Artificial Analysis (con mención explícita del header `X-RateLimit-Reset`)
- Groq (para inferencia de modelos open)
- Helicone (monitoring)

Claude también mencionó **BenchLM** como "un índice emergente con scores por categoría", aunque admitió que no estaba seguro de si tenía API pública.

**Gemini 3.1 Pro** aportó algo distinto: una lista de **fuentes que NO usar**, con justificación. Por ejemplo, dijo que HuggingFace Open LLM Leaderboard estaba "semi-abandonado" desde mediados de 2025 y que los datos eran poco fiables. También mencionó **Models.dev** y **Aider leaderboards** como opciones técnicas.

**Minimax M3** fue el más conservador. Listó solo 6 fuentes pero con justificación comercial: "Estas son las que tendrían traction sostenida en 2026". Curiosamente, fue el único que mencionó **Open ER-API** para tipos de cambio, una pieza que las otras tres daban por sentada o ni mencionaban.

### 2.3 El cruce manual

Tras las cuatro respuestas, construí una tabla en una hoja de cálculo:

| Fuente | Mencionada por | Endpoint confirmado | Datos clave |
|---|---|---|---|
| Artificial Analysis | GLM, Claude | `artificialanalysis.ai/api/v2/...` | II, coding, agentic, speed, TTFT, precios |
| LiteLLM | GLM, Claude | `raw.githubusercontent.com/BerriAI/...` | Precios, context window |
| HuggingFace Hub | GLM, Claude, Minimax | `huggingface.co/api/models/...` | Downloads, likes, safetensors |
| Arena AI | Claude | `api.wulong.dev/...` | Elo, votos |
| BenchLM | Claude (duda) | (a verificar) | Scores por categoría |
| ZeroEval | (ninguna) | (a verificar) | Reliability |
| Open ER-API | Minimax | `open.er-api.com/v6/latest/USD` | 21 monedas |
| OpenRouter | GLM, Claude | `openrouter.ai/api/...` | Status, precios |
| Groq | Claude | `groq.com/...` | Health, modelos |
| Models.dev | Gemini | `models.dev/...` | Catálogo |
| Helicone | Claude | `helicone.ai/...` | Monitoring |
| Aider | Gemini | `aider.chat/docs/leaderboards/...` | Coding benchmarks |
| Ollama | GLM | `github.com/ollama/...` | Modelos locales |

Las cuatro fuentes mencionadas por solo una IA las marqué como "a verificar en Fase 2". Las tres mencionadas por dos o más las marqué como "confirmadas". ZeroEval, que ninguna mencionó espontáneamente, la añadí yo mismo tras una búsqueda manual en Google Scholar.

### 2.4 Decisiones de integración

Con la tabla arriba, decidí:

- **Integrar las 13 fuentes.** No descarté ninguna, porque cada una aportaba al menos un campo que las demás no tenían. Por ejemplo, aunque OpenRouter y LiteLLM se solapan en precios, OpenRouter aporta status en vivo y LiteLLM aporta `max_input_tokens`.
- **Priorizar Artificial Analysis como fuente primaria.** Era la única con `Intelligence Index` estandarizado y headers de quota (`X-RateLimit-*`).
- **Tratar BenchLM y ZeroEval como "fuentes de cross-validación", no primarias.** Esto se mantuvo hasta la semana 5, cuando las promoví a fuentes de primera clase para el motor HRE-TOPSIS.
- **Usar Open ER-API como única fuente de tipos de cambio.** Era gratuita, no requería key y cubría las 21 monedas que planeaba.

---

## 3. Fase 2 — Verificación (1-2 julio 2026)

### 3.1 El rol de Claude Sonnet 4.6 en Antigravity

Tras el descubrimiento, pasé 48 horas verificando cada endpoint. Para esto usé **Claude Sonnet 4.6 dentro de Antigravity** porque su herramienta de "computer use" le permitía abrir el navegador, navegar a la documentación de cada API y extraer el JSON de ejemplo real.

Le di a Claude una instrucción larga:

> *"Para cada una de las 13 fuentes de la lista, abre la documentación oficial, identifica el endpoint público (sin auth), haz una llamada de prueba con `curl`, captura la respuesta JSON real y devuelve un documento Markdown con: (1) URL del endpoint, (2) método HTTP, (3) headers requeridos, (4) campos disponibles en la respuesta, (5) un ejemplo de respuesta recortado a 30 líneas. Si la API requiere key, anótalo pero no la uses."*

Claude trabajó durante casi dos horas y produjo un documento de 705 líneas (`api_raw_schemas_detailed.md`) que más tarde se convirtió en la base del módulo `validations.ts`.

### 3.2 Hallazgos clave de la verificación

- **Artificial Analysis** requiere API key pero tiene un tier free con 100 requests/día. Los headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` y `X-AA-Tier` existen y son confiables.
- **BenchLM** expone 5 sub-endpoints públicos sin auth: `models.json`, `price-index.json`, `stats.json`, `pricing.json` y `leaderboard.json`. Esto fue una sorpresa: en Fase 1 dudábamos de su existencia.
- **ZeroEval** responde en `api.zeroeval.com/v1/models/metrics` con un arreglo plano de métricas por modelo. Sin auth, sin rate limit documentado (lo treat como "no garantizado").
- **HuggingFace Hub** exige `User-Agent` personalizado; sin él devuelve 401.
- **LiteLLM** en GitHub raw no tiene rate limit propiamente dicho pero sí `X-RateLimit-Remaining` heredado de GitHub.
- **Open ER-API** devuelve todas las monedas en una sola llamada a `v6/latest/USD`. Perfecto para 21 monedas.
- **Arena AI** (`api.wulong.dev`) devuelve Elo con intervalo de confianza y número de votos. Solo modelos con ≥100 votos son fiables.
- **Ollama**, **Aider**, **Helicone**, **Groq**, **Models.dev** y **OpenRouter** son todos endpoints REST simples, sin auth (salvo Helicone).

### 3.3 El documento de fuentes verificadas

El resultado fue un archivo `api_raw_schemas_detailed.md` con 705 líneas. Claude no solo capturó los JSON sino que **anotó para cada campo si era nullable, su tipo y un ejemplo de valor**. Este documento después alimentó:

1. Los tipos TypeScript en `src/lib/types.ts` (381 líneas).
2. Los schemas Zod en `src/lib/validations.ts` (199 líneas, 6 schemas para BenchLM y ZeroEval).
3. La función `mergeModels()` en `src/lib/orchestrator.ts`.

Sin esa verificación previa, habría programado a ciegas y perdido horas depurando respuestas inesperadas.

---

## 4. Fase 3 — PRD y diseño (2-3 julio 2026)

### 4.1 Claude estructura el PRD

El 2 de julio le pedí a Claude que tomara todas las notas acumuladas (esquemas de APIs, mis propias ideas sobre perfiles de usuario, la idea del motor HRE-TOPSIS) y produjera un **Product Requirements Document** estructurado.

Le di estos lineamientos:

> *"Escribe un PRD en español neutro para un dashboard web llamado SelectIA. Audiencia: MYPEs latinoamericanas (metalmecánica, retail pequeño, consultorías). Stack: Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui. Debe tener: (1) 6 perfiles de usuario (Ingeniero, Gerente, Consultor, TI, Operario, Compras), (2) un motor de recomendación llamado HRE-TOPSIS con 5 capas (TF-IDF, filtros duros, AHP, TOPSIS, explicación), (3) 4 modos de operación (MYPE, Calidad, Equilibrado, Solo Gratis), (4) multi-moneda con PEN por defecto, (5) deploy 100% gratis en Vercel, (6) cron diario a las 2 AM hora Lima vía GitHub Actions, (7) JSON maestro < 500 KB. Sé exhaustivo: incluye tablas, fórmulas y ejemplos."*

Claude produjo una primera versión de 1,800 líneas. Era sólida pero **demasiado académica**. La sensación era que estaba leyendo un paper, no un PRD ejecutable.

### 4.2 GLM refina el PRD

Pasé el PRD a GLM-5.2 con la instrucción:

> *"Toma este PRD y conviértelo en algo que un desarrollador pueda ejecutar en 5 semanas. Reescribe las secciones vagas en pasos concretos. Añade un glosario de 20 términos mínimo. Añade una sección de 'Definición de listo' por cada módulo."*

GLM lo reescribió, lo expandió a 2,584 líneas, añadió un glosario inicial de 81 términos (semilla del actual de 176) y propuso la estructura de 6 perfiles (A-F) con KPIs concretos por cada uno. La versión final del PRD (`AI_SUPER_DASHBOARD_PRD_v3.2.md`) quedó lista el 3 de julio a las 23:00.

### 4.3 Decisiones de design system

En paralelo al PRD, conversé con las cuatro IAs sobre el design system. La pregunta era: **¿qué estética queremos?**

- **Minimax M3** propuso una estética "industrial peruana": tierra, ocre, marrón. Bonito pero poco serio para B2B.
- **Gemini 3.1 Pro** sugirió "Material Design 3". Funcional pero genérico.
- **GLM-5.2** dijo "copia Linear, es lo que usan los devs ahora".
- **Claude Sonnet 4.6** fue más específico: "Linear para estructura + Stripe para densidad de información. Ambos usan tipografía Inter, paleta oscura profunda (#08090a base), bordes hairline 1px, badges 'cristal tintado' con rgba(0.10) bg y rgba(0.20) border. Sigue su sistema de tokens, no inventes el tuyo."

Claude ganó esa decisión. El argumento decisivo fue: **no soy diseñador**. Replicar el sistema de Linear + Stripe me daba una base profesional sin tener que tomar 200 decisiones micro-estéticas. El documento `MASTER.md` (924 líneas) —que otra IA extrajo luego— captura ese design system.

Las cuatro paletas finales (Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro) surgieron de pedirle a Claude "dame 4 variantes que se sientan cohesivas, no un arcoíris".

---

## 5. Fase 4 — Construcción (3-6 julio 2026)

### 5.1 GLM-5.2 en modo Agente Full Stack

El 3 de julio lancé GLM-5.2 en Z.ai Code con modo "Agente Full Stack" y un único prompt:

> *"Implementa SelectIA según el PRD v3.2 (2,584 líneas, te lo paso como contexto) y el design system de MASTER.md (924 líneas). Stack: Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui. Empieza por globals.css, layout.tsx, types.ts, luego el motor HRE-TOPSIS, luego las 6 vistas. Verifica con `bun run lint` y `npx tsc --noEmit` después de cada archivo. Si hay errores, arréglalos antes de seguir."*

Lo que siguió fueron cuatro días de iteración intensa. GLM trabajaba en bloques de 30-60 minutos, yo revisaba cada bloque y daba feedback.

### 5.2 Bugs encontrados y fixes

Algunos bugs fueron detectados por GLM mismo; otros, por mí al probar; otros, por Claude al auditar.

- **Bug A — `extractMetrics()` usado inconsistente.** GLM lo llamaba con el `intelligenceIndex` de AA en un lugar y con el de BenchLM en otro. Resultado: el `efficiencyCost` y el ranking TOPSIS usaban II diferentes. Fix: estandarizar todo a AA II (BenchLM solo se usa en `getCategoryIntelligenceIndex` para el modo Calidad).
- **Bug B — Pesos AHP no sumaban 1.** Tras añadir el 8º criterio (reliability), varios vectores sumaban 0.998 o 1.003. Fix: fórmula `newWeight = round(oldWeight × (1 − reliabilityWeight), 3)` + nudge ±0.001 para absorber drift. Verificado con assertion DEV-only.
- **Bug C — ContextWindow corrupto.** 210 modelos aparecían con context 8K cuando en realidad tenían 128K o 200K. Causa: el matching contra LiteLLM estaba pasando el `name` sin normalizar. Fix: `normalizeForMatching()` que strippea acentos, sufijos `(high)/(max)` y caracteres no alfanuméricos.
- **Bug D — Matching BenchLM sobreescritura.** Cuando un modelo AA tenía el mismo nombre que un BenchLM, pero BenchLM tenía una variante con sufijo, se sobrescribía. Fix: 2 pasadas — primero sin sufijo, después con sufijo.
- **Bug E — `isAnimationActive` en Recharts.** Tres archivos tenían este prop deprecado que causaba errores TSC. Fix: eliminarlo.
- **Bug F — React keys duplicadas.** `key={p.name}` colisionaba cuando dos proveedores se llamaban igual. Fix: `key={`${p.name}-${idx}`}` en 4 archivos.

### 5.3 El momento en que Claude encontró un bug que GLM no veía

El 5 de julio, tras una maratón de 8 horas programando, le pasé a Claude el archivo `hre-topsis.ts` (1,691 líneas en ese momento) y le dije: *"Lee esto completo y dime si hay algún bug sutil."*

Claude tardó 4 minutos y regresó con un bug que ni GLM ni yo habíamos visto: **la capa de filtros duros no estaba excluyendo modelos con `benchlmScoreConfidence === 1` cuando estaban en modo Calidad**. Esto significaba que el motor podía recomendar un modelo con pocos benchmarks solo porque su precio era bajo, justamente lo que el modo Calidad quería evitar.

La corrección fue añadir una cuarta condición en el quality gate:

```typescript
// exclude paid models with low BenchLM confidence AND no AA II/Elo to back it up
if (m.benchlmScoreConfidence === 1 && m.intelligenceIndex == null && m.elo == null && !isFree) {
  return false;
}
```

Ese bug, de haber llegado a producción, habría hecho que el modo Calidad recomendara modelos poco fiables. La lección que me quedó: **un segundo modelo siempre encuentra lo que el primero no ve**.

---

## 6. Fase 5 — Integración BenchLM + ZeroEval (28-29 julio 2026)

### 6.1 Por qué se añadieron

Tras tres semanas de refinamiento (semanas 3-4), decidí que el motor HRE-TOPSIS era "demasiado precio-céntrico". La crítica que yo mismo me hacía era:

> *"Si dos modelos cuestan lo mismo, el motor los ordena por II. Pero II es un promedio de benchmarks académicos. Lo que una MYPE peruana necesita saber es: ¿este modelo falla en producción? ¿Tiene score específico en la tarea que yo hago?"*

Estas dos preguntas apuntaban a dos fuentes concretas:

- **BenchLM** — scores por categoría (math, coding, agentic, knowledge, instruction following, multilingual, multimodal grounded, reasoning).
- **ZeroEval** — reliability en producción (failure rate, P95, throughput, total calls).

La conversación clave la tuve con Claude. Le pregunté:

> *"Si añado BenchLM y ZeroEval como criterios 8 y 9 del TOPSIS, ¿cómo recalibro los pesos AHP sin romper la consistencia (CR < 0.1)?"*

Claude respondió con una propuesta matemática: en lugar de 9 criterios, **mantener 8** reemplazando el "II genérico" por un "II por categoría" (tomado de BenchLM cuando existe) y añadiendo `reliability` (1 − `failure_rate` de ZeroEval) como criterio nuevo. Esto me pareció elegante: no ampliaba la dimensionalidad del espacio TOPSIS, solo enriquecía la entrada.

### 6.2 Conversaciones sobre qué métricas incluir

Con GLM conversé sobre qué campos de BenchLM incluir. Mi primera idea era traer solo `displayScore` (el agregado). GLM sugirió traer también los 8 scores por categoría porque, citando textualmente: *"sin las 8 categorías, no puedes hacer el II por categoría; y sin II por categoría, pierdes la ventaja de BenchLM"*. Acepté.

Con Minimax conversé sobre cómo comunicar `failure_rate` al usuario sin asustarlo. La frase original que yo tenía era "Este modelo falla el 10.7% de las veces". Minimax la reescribió como "Confiabilidad de producción: 89.3% (basado en 169 llamadas monitoreadas por ZeroEval — 10.7% failure rate)". La versión de Minimax es más informativa y menos alarmista: **el número de llamadas da contexto** (169 es bajo; 10,000 sería alta confianza en el dato).

Con Gemini conversé sobre el threshold. ¿Cuándo `failure_rate` es "aceptable"? Gemini me dio tres tiers basados en literatura SRE:

| Tier | failure_rate | Color | Acción |
|---|---|---|---|
| Alto riesgo | > 15% | 🔴 | No recomendar en producción |
| Medio | 5% - 15% | 🟡 | Recomendar con advertencia |
| Confiable | ≤ 5% | 🟢 | Recomendar sin reservas |

Estos thresholds se implementaron en `ficha-tecnica-modal.tsx` y en el alert del recomendador.

### 6.3 Bugs de matching

La integración no fue trivial. Los tres bugs más serios:

- **Bug #15 — ContextWindow corrupto.** Lo mencioné antes. 210 modelos aparecían con context 8K falso. La causa raíz fue que `mergeModels()` no estaba normalizando nombres antes de buscar en LiteLLM. Solución: `normalizeForMatching()` + merge inteligente.
- **Bug #16 — Matching BenchLM sobreescritura.** Cuando AA tenía "Claude Opus 4.7 (Adaptive)" y BenchLM tenía "Claude Opus 4.7", el matching fallaba por el sufijo `(Adaptive)`. Solución: dos pasadas — la primera busca sin normalizar sufijos; la segunda normaliza y busca de nuevo.
- **Bug de pesos no sumando 1.** Tras añadir reliability, varios vectores sumaban 0.998 o 1.003. Solución: nudge ±0.001 absorbido en el peso más grande.

Cada uno de estos bugs requirió una conversación con Claude para diagnosticar y otra con GLM para implementar el fix.

---

## 7. Lecciones sobre colaboración humano-IA

### 7.1 El humano no es redundante

La ilusión popular es que las IAs "hacen el trabajo por ti". La realidad que viví es distinta: las IAs **amplifican mi capacidad**, pero no me reemplazan. Yo seguía siendo necesario para:

- **Decidir qué preguntas hacer.** Las IAs responden lo que se les pregunta; rara vez proponen preguntas nuevas.
- **Cruzar respuestas.** Cuando GLM y Claude decían cosas distintas, yo era el árbitro.
- **Detectar inconsistencias sutiles.** El bug del `intelligenceIndex` inconsistente solo lo encontró Claude porque le pedí expresamente que lo buscara. Sin mi insistencia, habría llegado a producción.
- **Mantener coherencia de visión.** Cada IA tiene su "voz". Si las dejaba a todas escribir, el código perdía estilo. Yo imponía la voz unificada.

### 7.2 La importancia del "contexto compartido"

Un patrón que se repitió: cuando pasaba información de una IA a otra, **siempre incluía el contexto**. No era suficiente copiar la respuesta; tenía que copiar también el prompt que la generó y las decisiones previas. Si no, la IA receptora tomaba la respuesta fuera de contexto y la malinterpretaba.

Por ejemplo, cuando pasé la lista de fuentes de GLM a Claude para verificación, no copié solo la lista: copié también el prompt original de GLM y mi nota "GLM omitió fuentes académicas". Claude entendió entonces que su tarea era **completar la lista**, no solo verificarla.

### 7.3 Las IAs no "mejoran" monótonamente

Una idea equivocada sería que Claude > GLM > Gemini > Minimax en todos los casos. La realidad es que cada modelo tenía fortalezas distintas, y a veces el "peor" modelo daba la mejor respuesta para una tarea concreta. Minimax M3, por ejemplo, fue el más útil para **redacción en español neutro** — mejor que Claude, que tendía al castellano de España, y mejor que GLM, que tendía al spanglish.

### 7.4 El costo oculto: tiempo de switching

Cambiar de una interfaz a otra, pegar contexto, esperar respuesta, copiar de vuelta — todo eso toma tiempo. Calculo que **el 40% de mi tiempo de investigación fue overhead de switching**, no pensamiento productivo. Si tuviera que hacerlo de nuevo, buscaría una interfaz unificada (como OpenRouter para IAs, no para modelos), pero en 2026 no existía una opción razonablemente buena y gratuita.

---

## 8. Prompts clave usados

Reproduzco aquí 8 prompts que resultaron particularmente efectivos, con la sintaxis original pero sin información sensible (API keys, datos personales, etc.).

### Prompt 8.1 — Descubrimiento inicial (GLM-5.2, 28 junio 2026)

> *"Estoy construyendo un dashboard que compare modelos de IA (GPT, Claude, Gemini, Llama, etc.) para pequeñas empresas peruanas. ¿Qué APIs públicas o semi-públicas existen para obtener precios, métricas de calidad (benchmarks), velocidad y disponibilidad de modelos LLM? Lista todas las que conozcas, con su endpoint y qué datos ofrecen. Para cada una, dime: (a) requiere API key, (b) tier free, (c) campos disponibles en la respuesta. Sé exhaustivo."*

### Prompt 8.2 — Verificación de endpoints (Claude Sonnet 4.6, 1 julio 2026)

> *"Para cada una de las 13 fuentes de la lista adjunta, abre la documentación oficial, identifica el endpoint público (sin auth), haz una llamada de prueba con curl, captura la respuesta JSON real y devuelve un documento Markdown con: (1) URL del endpoint, (2) método HTTP, (3) headers requeridos, (4) campos disponibles en la respuesta, (5) un ejemplo de respuesta recortado a 30 líneas. Si la API requiere key, anótalo pero no la uses."*

### Prompt 8.3 — Estructuración del PRD (Claude, 2 julio 2026)

> *"Escribe un PRD en español neutro para un dashboard web llamado SelectIA. Audiencia: MYPEs latinoamericanas. Stack: Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui. Debe tener 6 perfiles de usuario, un motor HRE-TOPSIS con 5 capas, 4 modos de operación, multi-moneda con PEN por defecto, deploy gratis en Vercel, cron diario 2 AM Lima vía GitHub Actions, JSON maestro < 500 KB. Sé exhaustivo: incluye tablas, fórmulas y ejemplos. Longitud objetivo: 2,000+ líneas."*

### Prompt 8.4 — Refinamiento ejecutable (GLM-5.2, 3 julio 2026)

> *"Toma este PRD [adjunto] y conviértelo en algo que un desarrollador pueda ejecutar en 5 semanas. Reescribe las secciones vagas en pasos concretos. Añade un glosario de 20 términos mínimo. Añade una sección de 'Definición de listo' por cada módulo. Elimina los párrafos retóricos."*

### Prompt 8.5 — Implementación full-stack (GLM-5.2, 3 julio 2026)

> *"Implementa SelectIA según el PRD v3.2 [adjunto] y el design system de MASTER.md [adjunto]. Stack: Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui. Empieza por globals.css, layout.tsx, types.ts, luego el motor HRE-TOPSIS, luego las 6 vistas. Verifica con `bun run lint` y `npx tsc --noEmit` después de cada archivo. Si hay errores, arréglalos antes de seguir. No inventes APIs; usa exactamente las 13 verificadas en api_raw_schemas_detailed.md."*

### Prompt 8.6 — Auditoría de bug sutil (Claude, 5 julio 2026)

> *"Lee este archivo hre-topsis.ts (1,691 líneas) completo y dime si hay algún bug sutil, especialmente: (1) uso inconsistente de funciones, (2) edge cases no manejados, (3) criterios que se anulan entre sí. No escribas código, solo diagnósticos."*

### Prompt 8.7 — Recalibración AHP (Claude, 28 julio 2026)

> *"Si añado BenchLM y ZeroEval como criterios del TOPSIS, ¿cómo recalibro los pesos AHP sin romper la consistencia (CR < 0.1)? Recuerda: actualmente hay 7 criterios (precio, II, coding, agentic, speed, context, elo) en 3 modos × 8 categorías = 24 vectores. Propón una solución que mantenga 8 criterios (no 9) y use BenchLM para reemplazar II genérico por II por categoría, y ZeroEval para añadir reliability."*

### Prompt 8.8 — Redacción de frase sensible (Minimax M3, 29 julio 2026)

> *"Tengo la métrica failure_rate de ZeroEval. La frase original 'Este modelo falla el 10.7% de las veces' me suena alarmista. Reescríbela en español neutro de forma que sea informativa pero no asuste al usuario. Incluye el número de llamadas como contexto para que se entienda la confianza en el dato. Dame 3 variantes."*

---

## 9. Cierre — Próximos pasos de investigación

SelectIA v3.3.1 está funcionalmente completo, pero el proceso de investigación no termina aquí. Los próximos pasos que planeo son:

1. **Estudio con usuarios reales MYPE.** Hasta ahora todo es PoC. Necesito al menos 5 MYPEs peruanas (idealmente metalmecánicas) usando el dashboard durante 2 semanas, midiéndose el tiempo que tardan en elegir un modelo antes vs. después.
2. **Sensitivity analysis formal del HRE-TOPSIS.** Ya existe un módulo `sensitivity-analysis.ts` pero no lo he corrido con datos reales. Quiero publicar los resultados.
3. **Comparación de los 4 modelos como asistentes.** Tengo suficientes conversaciones documentadas para escribir un post empírico sobre qué modelo fue más útil en qué fase. Sería un aporte a la comunidad.
4. **Evaluar frameworks de orquestación.** Para SelectIA v4.0 probablemente sí use LangGraph o similar, ahora que entiendo el problema mejor. Pero no antes.
5. **Integración de fuentes académicas.** ZeroEval y BenchLM son buenas, pero faltan leaderboards académicos (MMLU-Pro actualizado, GPQA, SWE-bench Verified). Hay que investigar si tienen API.

Cualquier persona interesada en colaborar en alguno de estos puntos es bienvenida a abrir un issue en el repositorio.

---

## Apéndice — Mapa de conversaciones por fase

| Fase | Fechas | IAs principales | Producto |
|---|---|---|---|
| 1 — Descubrimiento | 28-30 jun 2026 | GLM, Claude, Gemini, Minimax | Lista de 13 fuentes |
| 2 — Verificación | 1-2 jul 2026 | Claude (Antigravity) | `api_raw_schemas_detailed.md` (705 líneas) |
| 3 — PRD y diseño | 2-3 jul 2026 | Claude (estructura), GLM (refinamiento) | `AI_SUPER_DASHBOARD_PRD_v3.2.md` (2,584 líneas), `MASTER.md` (924 líneas) |
| 4 — Construcción | 3-6 jul 2026 | GLM (implementación), Claude (auditoría) | v1.0 → v3.2 funcional |
| 5 — BenchLM + ZeroEval | 28-29 jul 2026 | Claude (matemática), GLM (implementación), Minimax (redacción), Gemini (thresholds) | v3.3.1 con 8 criterios |

---

*Documento cerrado el 30 de julio de 2026. SelectIA v3.3.1.*
