# Twitter/X — 6 Hilos para SelectIA

**Proyecto**: SelectIA v3.3.1
**Autor**: José Jesús Alejandro Soria Vásquez — Ing. Industrial (Perú)
**Repo**: github.com/redentor159/selectia

---

## Cómo usar Twitter para mostrar proyectos técnicos

Twitter/X es excelente para construir audiencia técnica antes del lanzamiento. Reglas de oro:

1. **Longitud**: cada tuit ≤ 280 caracteres (límite clásico, portable a cualquier cliente).
2. **Numeración**: empezar con "1/N" en la primera línea.
3. **Hook en el primer tuit**: si no detiene el scroll, el hilo muere.
4. **Gancho al final de cada tuit**: una frase corta que invite al siguiente.
5. **Emojis**: 1-2 máximo por tuit, solo si aportan.
6. **Hilo en bloque**: publica los 8-12 tuits en menos de 3 minutos. Twitter los agrupa visualmente.
7. **Imagen en el primer tuit**: incrementa CTR. Opcional en los demás.
8. **CTA real solo en el último tuit**: pregunta abierta + link del repo.
9. **Pin el primer tuit** del hilo después de publicar (24-48h).
10. **Repost a las 24h** si el primer tuit tiene > 50 likes.

**Estrategia de publicación sugerida (30 días)**:
- Día 1: Hilo 1 (comparador, el más amplio).
- Día 3: Hilo 2 (motor HRE-TOPSIS, para devs).
- Día 5: Hilo 6 (bugs, contenido siempre viraliza).
- Día 7: Hilo 3 (13 APIs, para integradores).
- Día 10: Hilo 4 (4 IAs manual, para builders).
- Día 14: Hilo 5 (Ing. Industrial + IA, ángulo personal).

---

## Hilo 1 — "Construí un comparador de 206 modelos de IA. Así lo hice" (10 tuits)

> **Imagen tuit 1**: screenshot de la vista Resumen en tema Linear Claro.

### 1/10

1/10

Workday (2026, 3,200 líderes): 85% ahorra 1-7h/semana con IA, pero ~40% se pierde en retrabajo por elegir mal modelo.

Construí SelectIA: comparador de 206 modelos de IA con datos en vivo. Te cuento cómo →

### 2/10

2/10

SelectIA es un Command Center para MYPEs LatAm.

Recomienda el modelo óptimo para cada tarea (IPERC, G-code, manual técnico, cotización, traducción) con latencia promedio 0.5 ms.

### 3/10

3/10

13 fuentes en vivo:
• Artificial Analysis
• BenchLM
• ZeroEval
• Arena AI
• LiteLLM
• HuggingFace Hub
• OpenRouter
• Open ER-API
• Groq
• Models.dev
• Helicone
• Aider
• Ollama

Cron diario 2 AM Lima.

### 4/10

4/10

Motor HRE-TOPSIS:

TF-IDF + Porter stemmer español → filtros duros → piso de calidad → AHP (8 criterios) → TOPSIS distancia euclidiana → explicabilidad en español plano.

8 criterios: precio, II, coding, agentic, speed, context, elo, reliability.

### 5/10

5/10

AHP pondera por comparación pareada. El riesgo: inconsistencia (CR alto).

En SelectIA: CR = 0. La matriz es perfectamente consistente.

Sin CR=0 los pesos no son confiables. Es lo primero que verificaría en cualquier motor multi-criterio.

### 6/10

6/10

Latencia medida, no estimada:
• avg 0.5 ms
• max 3 ms
• siempre < 10 ms por recomendación

TOPSIS con 206 modelos en menos de 3ms. El cuello de botella no es el algoritmo, es cargar el JSON maestro (376 KB).

### 7/10

7/10

Para LatAm: 21 monedas de América en el dashboard.
PEN, USD, BRL, MXN, COP, CLP, ARS, CAD + 13 más.

Tipo de cambio en vivo (Open ER-API). Una MYPE en Lima ve precios en soles, una en Bogotá en pesos. Sin conversión mental.

### 8/10

8/10

Glosario: 176 términos, 15 deepDives, 8 categorías.

Porque una recomendación que usa términos que el equipo no entiende es una opinión disfrazada. "Agentic", "MMLU", "context window" — todo explicado en español.

### 9/10

9/10

Honestidad: NO usé framework de orquestación.

4 IAs (GLM-5.2, Minimax M3, Gemini 3.1 Pro, Claude Sonnet 4.6), contexto pasado manualmente. Descubrimiento en paralelo, verificación con uno, PRD sobre JSON reales, build con agente.

### 10/10

10/10

Métricas finales:
• 206 modelos · 13 fuentes en vivo
• 31,116 LOC TS · 111 archivos · JSON 376 KB
• v3.3.1 · MIT · Vercel gratis
• 21 monedas · 4 temas · glosario 176/15/8

Repo: github.com/redentor159/selectia

¿Cómo eligen modelo de IA hoy? Los leo 👇

---

## Hilo 2 — "El motor HRE-TOPSIS explicado en 8 tuits" (8 tuits)

> **Imagen tuit 1**: screenshot de la vista Motor Explicado en tema Linear Oscuro.

### 1/8

1/8

"Elegir el mejor modelo de IA" es un problema de decisión multi-criterio, no de IA.

8 dimensiones en tensión: precio, II, coding, agentic, speed, context, elo, reliability. Optimizar una degrada otra.

Lo resolví con HRE-TOPSIS. Te lo explico en 8 tuits →

### 2/8

2/8

Paso 1: TF-IDF + Porter stemmer español.

Vectorizo la consulta del usuario y los perfiles de cada modelo. El stemmer reduce "cotizar", "cotización", "cotice" al mismo token.

Sin esto, el motor recomienda por keywords sueltos en vez de por intención.

### 3/8

3/8

Paso 2: Filtros duros.

Descarto lo que no cumple requisitos no negociables: contexto mínimo, modalidad soportada, precio máximo, idioma.

Las alternativas que no cumplen ni llegan a la matriz de decisión.

### 4/8

4/8

Paso 3: Piso de calidad (quality gate).

Umbral mínimo de reliability. Un modelo demasiado inestable no entra al ranking por más barato que sea.

Diferencia HRE-TOPSIS de TOPSIS puro: el ranking solo compara opciones viables, no todas.

### 5/8

5/8

Paso 4: AHP con CR=0.

Comparación pareada de los 8 criterios. Calculo el Consistency Ratio para detectar contradicciones lógicas.

En SelectIA CR=0. La matriz es perfectamente consistente. Sin esto, los pesos no son confiables.

### 6/8

6/8

Paso 5: TOPSIS con distancia euclidiana.

Identifico el ideal positivo (mejor en cada criterio) y el ideal negativo (peor). Calculo distancia euclidiana de cada alternativa a ambos.

Score = d_negativo / (d_positivo + d_negativo). Cercanía relativa al ideal.

### 7/8

7/8

Paso 6: Explicabilidad en español plano.

"Ganó sobre X porque es 3× más barato y su ELO es 12 puntos mayor."

Una recomendación sin justificación es una opinión. El usuario confía cuando entiende el por qué.

### 8/8

8/8

Métricas medidas:
• Latencia avg 0.5 ms, max 3 ms, <10 ms siempre
• 206 modelos · 13 fuentes en vivo
• AHP CR=0
• JSON 376 KB, cron 2 AM Lima
• 31,116 LOC TS · v3.3.1 · MIT

Repo: github.com/redentor159/selectia

¿Cómo deciden multi-criterio ustedes? 👇

---

## Hilo 3 — "13 APIs de IA en vivo: lo que aprendí" (10 tuits)

> **Imagen tuit 1**: logo de las 13 fuentes en collage o screenshot de la vista Salud del Sistema.

### 1/10

1/10

Integré 13 APIs de IA en vivo para SelectIA. Cada una me enseñó algo distinto sobre cómo se construye la capa de datos de un motor de recomendación.

Hilo con lo que aprendí de cada fuente →

### 2/10

2/10

Artificial Analysis: el estándar de facto para precio/latencia/inteligencia. API limpia, datos frescos.

Lección: cuando una fuente es "el estándar", vale la pena tenerla como fuente de verdad y reconciliar las demás contra ella.

### 3/10

3/10

BenchLM y ZeroEval: benchmarks múltiples (MMLU, HumanEval, GPQA).

Lección: un solo benchmark es manipulable. Tres benchmarks distintos, cruzados, son menos manipulables. La triangulación es defensa.

### 4/10

4/10

Arena AI (LMSYS): ELO humano. Votación a ciegas entre dos modelos.

Lección: el ELO humano es la métrica menos manipulable de calidad percibida. Las empresas no pueden "estudiar para el examen" como con benchmarks.

### 5/10

5/10

LiteLLM: catálogo más completo de modelos + precios.

Lección: un catálogo grande reduce el riesgo de olvidar modelos. Pero el catálogo es solo el punto de partida, no la verdad final sobre pricing.

### 6/10

6/10

HuggingFace Hub: repositorio más grande de modelos open.

Lección: HF me da "qué modelo existe como peso abierto". OpenRouter (siguiente) me da "qué modelo puedo llamar vía API hoy". Complementarios, no redundantes.

### 7/10

7/10

OpenRouter: un solo endpoint para 200+ modelos.

Lección: OpenRouter valida disponibilidad comercial y precios consistentes. Es el "precio de mercado" cuando las fuentes oficiales discrepan.

### 8/10

8/10

Groq, Models.dev, Helicone, Aider, Ollama:

Groq → latencia real con LPU.
Models.dev → metadatos limpios.
Helicone → observabilidad real.
Aider → benchmark específico de coding.
Ollama → modelos corriendo local.

### 9/10

9/10

Open ER-API: tipo de cambio en vivo.

Lección menor pero crucial: sin esta API, mis 21 monedas de América (PEN, USD, BRL, MXN, COP, CLP, ARS, CAD + 13) serían una mentira. Cada feature depende de una fuente viva.

### 10/10

10/10

Reconciliación final: cuando dos fuentes discrepan en precio, tomo la mediana. Cuando discrepan en ELO, priorizo Arena AI.

Resultado: 206 modelos comparados, JSON 376 KB, cron diario 2 AM Lima.

Repo: github.com/redentor159/selectia

¿Qué fuente usarían? 👇

---

## Hilo 4 — "Cómo usé 4 IAs distintas para construir un producto (sin frameworks)" (9 tuits)

> **Imagen tuit 1**: foto del setup de trabajo del autor o screenshot minimalista del tema Negro Puro.

### 1/9

1/9

Usé 4 IAs distintas para construir SelectIA (206 modelos, 13 fuentes, motor HRE-TOPSIS).

NO usé framework de orquestación. Pasé contexto manualmente entre sesiones.

Crónica de los 5 días →

### 2/9

2/9

Día 1 — Descubrimiento paralelo.

Abrí 3 pestañas: GLM-5.2, Minimax M3, Gemini 3.1 Pro. A cada uno le pedí buscar APIs públicas de datos de modelos de IA.

Cruzaba respuestas manualmente. Diversidad de respuestas = señal de confianza.

### 3/9

3/9

Día 2 — Verificación con Claude Sonnet 4.6.

Llevé la lista consolidada. Le pedí: llama cada API, extrae JSON, documenta schema.

Claude hizo el trabajo sucio. Salí con documento de fuentes verificadas, no opiniones.

### 4/9

4/9

Día 3 — PRD sobre JSON reales.

Claude estructuró el PRD aprovechando esquemas reales. Cada feature mapeaba a un campo existente en alguna de las 13 fuentes.

GLM-5.2 me hizo 5 preguntas que recortaron 2 features. Un PRD sobre datos reales es 10× más concreto.

### 5/9

5/9

Día 4 — Construcción con GLM-5.2 Agente Full Stack.

Le di PRD + JSON verificados + design system. Iteramos hasta llegar al resultado.

Yo decidía cuándo iterar, parar o reescribir. La IA proponía, yo cortaba.

### 6/9

6/9

Día 5 — Bugs y reconciliación.

5 bugs detectados en producción:
1. Función K invertida
2. ContextWindow corrupto (string vs int)
3. Matching BenchLM vs AA
4. Speed outlier rompía TOPSIS
5. Sin piso de calidad recomendaba basura barata

Cada uno con fix concreto.

### 7/9

7/9

¿Por qué NO framework?

Pasar contexto manualmente entre 4 IAs me dio control total. Cada IA aportó lo suyo sin opacidad. Sabía qué entraba y qué salía de cada sesión.

Un framework automatiza lo que ya entiendes. Manual primero, framework después.

### 8/9

8/9

¿Cuándo SÍ usaría un framework de orquestación?

Cuando el flujo sea repetible y estable. Para un proyecto de exploración como SelectIA (donde cada día era distinto), la coordinación manual fue más rápida y más transparente.

### 9/9

9/9

Métricas: 206 modelos · 13 fuentes · 31,116 LOC TS · 111 archivos · JSON 376 KB · latencia avg 0.5 ms · v3.3.1 · MIT · 21 monedas · 4 temas · glosario 176/15/8.

Repo: github.com/redentor159/selectia

¿Han probado coordinar IAs manualmente? 👇

---

## Hilo 5 — "Ingeniería Industrial + IA = ?" (8 tuits, más personal)

> **Imagen tuit 1**: foto del autor en su setup o en la universidad.

### 1/8

1/8

Soy estudiante de Ingeniería Industrial en Perú. Construí SelectIA (comparador de 206 modelos de IA con motor HRE-TOPSIS).

¿Qué tiene que ver Ing. Industrial con IA? Más de lo que parece →

### 2/8

2/8

Ingeniería Industrial estudia la optimización de sistemas: procesos, recursos, decisiones.

La IA no es magia, es un recurso más del sistema. Y elegir qué modelo usar para cada tarea es un problema clásico de asignación de recursos.

### 3/8

3/8

Workday (2026, 3,200 líderes): 85% ahorra 1-7h/semana con IA, pero ~40% se pierde en retrabajo.

Ese 40% es una pérdida de eficiencia operativa. Y la eficiencia operativa es exactamente lo que estudia la Ing. Industrial.

### 4/8

4/8

TOPSIS es un método de decisión multi-criterio que se enseña en Ing. Industrial desde hace 40 años.

Lo usé en SelectIA para rankear 206 modelos según 8 criterios: precio, II, coding, agentic, speed, context, elo, reliability.

### 5/8

5/8

AHP (Analytic Hierarchy Process) también es clásico en Ing. Industrial.

Lo usé para ponderar los 8 criterios con matriz de comparación pareada. Verifiqué el Consistency Ratio: CR = 0. Matriz perfectamente consistente.

### 6/8

6/8

Casos de uso reales del dashboard, todos con sabor Ing. Industrial:

• IPERC (matriz de riesgo)
• G-code para CNC
• Análisis de manual técnico de 300 páginas
• Cotización
• Traducción técnica

### 7/8

7/8

Lo que aprendí: la IA va a redefinir el rol del ingeniero industrial.

No vamos a "usar IA" como herramienta. Vamos a diseñar sistemas que decidan qué IA usar para cada tarea. La decisión de modelo es la nueva capa de optimización.

### 8/8

8/8

Métricas: 206 modelos · 13 fuentes · 31,116 LOC TS · JSON 376 KB · latencia avg 0.5 ms · v3.3.1 · MIT · 21 monedas · glosario 176 términos.

Repo: github.com/redentor159/selectia

¿La decisión de modelo será función de Ing. Industrial en 5 años? 👇

---

## Hilo 6 — "5 bugs que me volvieron loco (y cómo los resolví)" (10 tuits)

> **Imagen tuit 1**: screenshot del modo traza del motor (17-modo-traza.png o 11e-animacion-modo-traza.png).

### 1/10

1/10

5 bugs en SelectIA me volvieron loco antes del lanzamiento. Cada uno con fix concreto.

Los comparto para que no los repitas si construyes un motor de recomendación multi-fuente →

### 2/10

2/10

Bug 1 — Función K invertida.

La función de penalización estaba multiplicada por -1 en una rama del código. Los modelos más caros aparecían arriba del ranking.

Fix: test de sanity check que verifica correlación precio↔score en casos extremos.

### 3/10

3/10

Bug 2 — ContextWindow corrupto.

Una fuente devolvía "128k" como string. TOPSIS normalizaba como NaN. NaN contamina toda la matriz: ranking aleatorio.

Fix: función de coerce robusta (parsea "128k", "128,000", "128000"). Log cuando un campo no se puede coerce.

### 4/10

4/10

Bug 3 — Matching BenchLM vs Artificial Analysis.

BenchLM reporta "GPT-4o". AA reporta "gpt-4o-2024-08-06". Mismo modelo, naming distinto. Unión por string fallaba.

Fix: capa de aliasing con normalización agresiva + diccionario manual para casos especiales.

### 5/10

5/10

Bug 4 — Speed outlier rompía TOPSIS.

Un modelo reportó speed = 9999 tokens/seg (dato erróneo). TOPSIS normaliza dividiendo por el máximo. Ese outlier convertía todos los demás scores en ~0.

Fix: winsorización. Todo valor > percentil 99 se trunca al p99.

### 6/10

6/10

Bug 5 — Sin piso de calidad.

Los modelos más baratos pero inestables ganaban en "precio" y aparecían arriba. Matemáticamente correcto, operativamente desastroso.

Fix: quality gate obligatorio — reliability ≥ 0.7. El ranking solo compara opciones viables.

### 7/10

7/10

Patrón común a los 5 bugs: ninguno fue del algoritmo TOPSIS en sí. Todos fueron de datos y edge cases.

Lección: en sistemas multi-fuente, el 80% del trabajo no es el modelo. Es limpiar y reconciliar inputs.

### 8/10

8/10

Testing que agregué post-bugs:
• Sanity check de correlación precio↔score
• Tests de coerce para campos numéricos con formatos raros
• Tests de matching entre fuentes con naming distinto
• Winsorización automática en todas las dimensiones

### 9/10

9/10

Instrumentación: cada recomendación guarda en log el tiempo, los filtros aplicados, las alternativas descartadas y las razones.

Esto es lo que permite que el modo traza del dashboard muestre exactamente qué pasó en cada recomendación. Auditable.

### 10/10

10/10

Métricas finales:
• 206 modelos · 13 fuentes en vivo
• 31,116 LOC TS · 111 archivos · JSON 376 KB
• Latencia avg 0.5 ms, max 3 ms
• v3.3.1 · MIT · Vercel gratis
• 21 monedas · 4 temas · glosario 176/15/8

Repo: github.com/redentor159/selectia

¿Qué bug les costó más horas? 👇

---

## Notas transversales para los 6 hilos

### Verificación de longitud
Todos los tuits están por debajo de 280 caracteres (incluida la numeración "N/M"). Verificar antes de publicar pegando en el cliente de Twitter.

### Lo que NO debes afirmar (en ningún tuit)
- ❌ "Orquesté con framework" — fue manual
- ❌ "95% de ahorro" — no hay data
- ❌ "Producción en planta real" — es PoC
- ❌ "Usuarios activos" — no hay aún

### Métricas 100% verificables usadas
- 206 modelos · 13 fuentes en vivo
- 31,116 LOC TS · 111 archivos · JSON 376 KB
- Latencia avg 0.5 ms, max 3 ms, siempre < 10 ms
- AHP CR = 0
- 21 monedas de América · 4 temas · glosario 176/15/8
- v3.3.1 · MIT · repo: github.com/redentor159/selectia

### Hooks estadísticos reales (alternativos al de Workday)
Si quieres variar el hook, estos también son verificables:
- **13 fuentes integradas** (no es una opinión, es un número)
- **CR = 0 en AHP** (matriz perfectamente consistente)
- **Latencia max 3 ms** con 206 modelos (TOPSIS en <3ms es notable)

### Mejores momentos para publicar en Twitter (audiencia LatAm)
- **Martes a jueves, 8:00–10:00 AM hora Lima** para B2B LatAm.
- **Domingo 18:00–20:00 hora Lima** para audiencia dev internacional (timezone US East despierta).
- Evitar viernes después del mediodía y sábado completo.

### Estrategia de respuestas
- Responder los primeros 5 comentarios en menos de 30 minutos.
- Para preguntas técnicas, responder con un tuit del hilo ampliado.
- Para "¿cómo lo deployo?", responder con link directo al README del repo.
