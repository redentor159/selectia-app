# LinkedIn — 5 Hilos Largos para SelectIA

**Proyecto**: SelectIA v3.3.1
**Autor**: José Jesús Alejandro Soria Vásquez — Ing. Industrial (Perú)
**Repo**: github.com/redentor159/selectia

---

## Cómo usar hilos en LinkedIn

LinkedIn permite publicar hilos (varios posts conectados) usando el botón "Agregar otro post" o publicando en secuencia con numeración manual (1/x, 2/x…). Recomendaciones:

1. **Longitud por post**: 100–200 palabras. Ni muy cortos (no enganchan) ni muy largos (se cortan en mobile).
2. **Numeración**: siempre empezar con "1/N" en la primera línea.
3. **Hook en el post 1**: el primer post debe generar detención en scroll.
4. **Gancho al final de cada post**: una frase que invite a leer el siguiente.
5. **Publicar todos en bloque**: en menos de 5 minutos entre post y post, para que LinkedIn los agrupe visualmente.
6. **Imagen solo en el post 1**: aumenta el CTR. Los siguientes pueden ser texto puro o screenshot pequeño.
7. **CTA real solo en el último post**: los anteriores terminan con gancho, el último con pregunta abierta + repo.

**Estrategia recomendada**:
- Hilo 1 o 2 para el lanzamiento (más story-telling).
- Hilo 3 (errores) para el día +3 (cuando ya hay comentarios).
- Hilo 4 (open source) para el día +7.
- Hilo 5 (crónica) para el día +14 (mantiene momentum).

---

## Hilo 1 — "Cómo elegí las 13 fuentes de datos de SelectIA"

> **6 posts** · público: devs, data engineers, founders
> **imagen post 1**: logo de las 13 fuentes en collage

### Post 1/6 — Hook + problema

1/6

Workday (enero 2026, 3,200 líderes): 85% ahorra 1–7 h/semana con IA, pero ~40% se pierde en retrabajo. La causa raíz: elegir el modelo equivocado.

Cuando empecé SelectIA me di cuenta de que el problema no era "recomendar bien". Era "tener datos confiables para recomendar". ¿De dónde saco precio, latencia, ELO, context window y reliability de 200+ modelos — sin depender de una sola fuente?

Una sola fuente siempre miente por omisión. Decidí integrar varias. ¿Pero cuáles y cómo?

Te cuento cómo terminé con 13 fuentes en vivo → 🧵

### Post 2/6 — Bloque 1: Artificial Analysis, BenchLM, ZeroEval

2/6

**Bloque 1 — Benchmarks de inteligencia**:

▪️ **Artificial Analysis**: el estándar de facto para comparar modelos en precio/latencia/inteligencia. API limpia, datos frescos.
▪️ **BenchLM**: agregador de benchmarks múltiples (MMLU, HumanEval, GPQA…). Útil para no depender de un solo test.
▪️ **ZeroEval**: foco en evaluación zero-shot, complementa lo que BenchLM no cubre.

Con estas tres ya tenía la dimensión "qué tan inteligente es el modelo" razonablemente cubierta. Pero la inteligencia sin contexto operativo no alcanza.

Siguiente problema: ¿de dónde saco la percepción real de usuarios en producción? → 3/6

### Post 3/6 — Bloque 2: Arena AI, LiteLLM

3/6

**Bloque 2 — Arena y routing**:

▪️ **Arena AI (LMSYS)**: el ELO humano. Personas votan a ciegas entre dos modelos. Es la métrica menos manipulable que conozco de calidad percibida.
▪️ **LiteLLM**: el catálogo más completo de modelos + precios actualizados. Me sirve como fuente de verdad para pricing y para saber qué modelos existen en cada provider.

Con Arena cubrí "calidad percibida por humanos". Con LiteLLM, "qué existe y cuánto cuesta". Faltaba: ¿dónde están alojados los modelos open y cómo se accede?

→ 4/6

### Post 4/6 — Bloque 3: HuggingFace Hub, OpenRouter

4/6

**Bloque 3 — Catálogos open y ruteo multi-provider**:

▪️ **HuggingFace Hub**: el repositorio más grande de modelos open. Aquí verifico disponible, variantes quantizadas, licencia real.
▪️ **OpenRouter**: un solo endpoint para 200+ modelos de diferentes providers. Útil para validar disponibilidad comercial y precios consistentes.

HuggingFace me da "qué modelo existe como peso abierto". OpenRouter me da "qué modelo puedo llamar vía API hoy mismo, desde un solo SDK". Son complementarios, no redundantes.

Faltaba cubrir latency real, costos en zonas LatAm y routing inteligente → 5/6

### Post 5/6 — Bloque 4: ER-API, Groq, Models.dev, Helicone, Aider, Ollama

5/6

**Bloque 4 — Especializados y operativos**:

▪️ **Open ER-API**: datos de Exchange Rate en vivo — clave para mis 21 monedas de América (PEN, USD, BRL, MXN, COP, CLP, ARS, CAD + 13).
▪️ **Groq**: latencia real en producción con LPU. Sirve para validar speed claims.
▪️ **Models.dev**: catálogo curado con metadatos limpios.
▪️ **Helicone**: observabilidad real de uso.
▪️ **Aider**: benchmark específico de coding.
▪️ **Ollama**: modelos corriendo local. Clave para perfiles de privacidad.

Con eso cerré las 13 fuentes. Cada una cubre una dimensión distinta. Ninguna se repite.

Métricas finales → 6/6

### Post 6/6 — Síntesis + métricas + CTA

6/6

**Síntesis**:

▪️ 206 modelos comparados desde 13 fuentes en vivo
▪️ Cron diario 2 AM Lima actualiza el JSON maestro de 376 KB
▪️ Latencia < 10 ms por recomendación (avg 0.5 ms, max 3 ms)
▪️ 31,116 LOC TS en 111 archivos · v3.3.1 · MIT
▪️ 21 monedas de América · 4 temas visuales · glosario 176 términos / 15 deepDives

Lección: integrar fuentes múltiples es caro en complejidad, pero barato en confianza. Una sola fuente te hace vulnerable a su sesgo. Trece fuentes te obligan a reconciliar, y reconciliar es donde aparece el dato bueno.

Repo: github.com/redentor159/selectia

¿Qué fuente usan hoy para comparar modelos? ¿Una sola o varias? Los leo 👇

#IngenieriaIndustrial #IA #IntegracionAPIs #MultiModelo #TOPSIS #OpenSource #LatAm #MYPE #Perú

---

## Hilo 2 — "Cómo funciona el motor HRE-TOPSIS en 7 pasos"

> **7 posts** · público: ingenieros, ML engineers, product managers técnicos
> **imagen post 1**: diagrama de flujo del motor (vista Motor Explicado)

### Post 1/7 — Problema de elección multi-criterio

1/7

Workday (enero 2026, 3,200 líderes): 85% ahorra 1–7 h/semana con IA, pero ~40% se pierde en retrabajo por elegir mal el modelo.

¿Por qué elegimos mal? Porque "mejor modelo" no existe. Hay 8 dimensiones en tensión: precio, II, coding, agentic, speed, context, elo, reliability. Optimizar una es degradar otra.

Este es un problema clásico de Ingeniería Industrial: decisión multi-criterio. Lo resolví con HRE-TOPSIS. Te lo cuento en 7 pasos → 🧵

### Post 2/7 — TF-IDF + Porter stemmer

2/7

**Paso 2 — Entender qué quiere el usuario**.

El usuario escribe "necesito cotizar en soles peruanos para mi taller". El motor tiene que mapear eso a perfiles de modelos.

Uso **TF-IDF** para vectorizar tanto la consulta como los perfiles de cada modelo. Pero TF-IDF puro falla en español: "cotización", "cotizar", "cotice" son tokens distintos.

Solución: **Porter stemmer en español**. Reduce cada palabra a su raíz. Ahora "cotizar" y "cotización" matchean.

Sin este paso, el motor recomendaría por keywords sueltos. Con este paso, entiende intención.

Siguiente: descartar lo que no sirve → 3/7

### Post 3/7 — Filtros duros + quality gate

3/7

**Paso 3 — Filtros duros y piso de calidad**.

Antes de rankear, descarto lo que no cumple requisitos no negociables:

▪️ **Filtros duros**: contexto mínimo, modalidad soportada, precio máximo, idioma.
▪️ **Piso de calidad (quality gate)**: umbral mínimo de reliability. Un modelo demasiado inestable no entra al ranking por más barato que sea.

Esto es lo que diferencia HRE-TOPSIS de TOPSIS puro: las alternativas que no cumplen los umbrales operativos ni siquiera llegan a la matriz de decisión. El ranking solo compara opciones viables.

¿Cómo peso los 8 criterios entre sí? → 4/7

### Post 4/7 — AHP + Consistency Ratio

4/7

**Paso 4 — Ponderar con AHP**.

Tengo 8 criterios. ¿Cuánto pesa cada uno? No puedo inventarme los pesos. Uso **AHP (Analytic Hierarchy Process)**: comparo cada par de criterios en escala 1–9, construyo la matriz de comparación pareada, y obtengo el vector de pesos.

Pero AHP tiene una trampa: si tus comparaciones son inconsistentes ("precio es 3× más importante que speed", "speed es 5× más importante que context", "context es 3× más importante que precio" — contradicción lógica), los pesos dejan de ser confiables.

Por eso calculé el **Consistency Ratio (CR)**. En SelectIA: **CR = 0**. La matriz es perfectamente consistente.

Cómo rankeo con esos pesos → 5/7

### Post 5/7 — TOPSIS + distancia euclidiana

5/7

**Paso 5 — TOPSIS**.

Con los pesos AHP aplico TOPSIS:

1. Construyo matriz de decisión (alternativas × criterios).
2. Normalizo.
3. Multiplico por pesos AHP.
4. Identifico el **ideal positivo** (mejor valor en cada criterio) y el **ideal negativo** (peor valor).
5. Calculo **distancia euclidiana** de cada alternativa a ambos ideales.
6. El score final es la cercanía relativa al ideal positivo: `d_negativo / (d_positivo + d_negativo)`.

El modelo con score más alto es el más cercano al ideal ponderado. No es el mejor en nada absoluto — es el mejor balance.

Pero un número sin explicación no sirve → 6/7

### Post 6/7 — Explicabilidad

6/7

**Paso 6 — Explicabilidad en español plano**.

Una recomendación sin justificación es una opinión. SelectIA genera razones automáticas:

▪️ "Ganó sobre X porque es 3× más barato y su ELO es 12 puntos mayor."
▪️ "Fue filtrado por piso de calidad: reliability < 0.7."
▪️ "Perdió contra Y porque, aunque su coding es mejor, su contexto de 8k no cubre tu manual de 300 páginas."

Esto es crítico para adopción: el usuario confía en la recomendación cuando entiende por qué se hizo. Y confía en el motor cuando ve que las alternativas descartadas lo fueron por razones claras.

Métricas finales → 7/7

### Post 7/7 — Métricas finales + CTA

7/7

**Métricas medidas**:

▪️ Latencia avg **0.5 ms**, max **3 ms**, siempre < 10 ms por recomendación
▪️ 206 modelos comparados desde 13 fuentes en vivo
▪️ AHP con **CR = 0**
▪️ JSON maestro 376 KB, cron diario 2 AM Lima
▪️ 31,116 LOC TS · 111 archivos · v3.3.1 · MIT
▪️ 21 monedas · 4 temas · glosario 176 términos / 15 deepDives

Casos de uso reales: IPERC, G-code CNC, manual técnico 300 páginas, cotización, traducción técnica.

Proceso honesto: 4 IAs como asistentes (GLM-5.2, Minimax M3, Gemini 3.1 Pro, Claude Sonnet 4.6), coordinadas manualmente. Sin framework.

Repo: github.com/redentor159/selectia

¿Cómo están tomando decisiones multi-criterio en sus equipos hoy? ¿AHP, scoring manual, intuición? Los leo 👇

#IngenieriaIndustrial #IA #TOPSIS #AHP #MultiModelo #ProductManagement #OpenSource #LatAm #MYPE #Perú

---

## Hilo 3 — "5 errores que cometí construyendo SelectIA y cómo los resolví"

> **6 posts** · público: devs, builders, estudiantes de ingeniería
> **imagen post 1**: screenshot del modo traza del motor

### Post 1/6 — Hook

1/6

Trabajé meses en SelectIA (206 modelos de IA comparados, 13 fuentes en vivo, motor HRE-TOPSIS). Antes de publicarlo cometí 5 errores técnicos que estuvieron a punto de arruinar el proyecto.

Los comparto para que no los repitas. Cada uno con su fix concreto → 🧵

### Post 2/6 — Error 1: Función K al revés

2/6

**Error 1 — La función K estaba invertida**.

La "función K" (función de similaridad/penalización del motor) estaba calibrada para que un modelo más caro tuviera MENOR score. Pero en una rama del código, la estaba multiplicando por -1 sin darme cuenta. Resultado: los modelos más caros aparecían arriba del ranking.

**Fix**: agregué un test de sanity check que verifica correlación precio↔score en casos extremos. Hoy cualquier inversión de signo se detecta en CI antes de subir a producción.

Siguiente error → 3/6

### Post 3/6 — Error 2: ContextWindow corrupto

3/6

**Error 2 — El campo ContextWindow llegaba corrupto**.

Una de las 13 fuentes devuelve context_window como string ("128k") en vez de número. TOPSIS normalizaba esto como NaN, y NaN contamina toda la matriz de decisión: el ranking se volvía aleatorio.

**Fix**: función de coerce robusta que parsea "128k", "128,000", "128000" al mismo entero. Y log explícito cuando un campo no se puede coerce — para detectar la fuente que cambia de schema.

Error 3 → 4/6

### Post 4/6 — Error 3: Matching BenchLM

4/6

**Error 3 — No podía matchear BenchLM con Artificial Analysis**.

BenchLM reporta "GPT-4o" pero Artificial Analysis reporta "gpt-4o-2024-08-06". Mismo modelo, naming distinto. La unión por string fallaba y perdía datos de mitad de los modelos.

**Fix**: construí una capa de **aliasing** con normalización agresiva (lowercase, sin versión, sin fecha, sin guiones). Luego un diccionario manual para los casos que la normalización no resuelve. Hoy matchea 100% de los 206 modelos.

Error 4 → 5/6

### Post 5/6 — Error 4: Speed cap

5/6

**Error 4 — Speed sin tope rompía TOPSIS**.

Un modelo nuevo reportó speed = 9999 tokens/segundo (dato erróneo de una fuente). TOPSIS normaliza dividiendo por el máximo, así que ese outlier convertía todos los demás scores de speed en ~0. El ranking perdía la dimensión speed completa.

**Fix**: **winsorización**. Todo valor por encima del percentil 99 se trunca al percentil 99. Ahora un outlier no puede arrastrar toda la matriz. Aplicado a las 8 dimensiones.

Último error → 6/6

### Post 6/6 — Error 5: Piso de calidad + síntesis

6/6

**Error 5 — Sin piso de calidad, el ranking recomendaba basura barata**.

Sin piso de calidad, los modelos más baratos pero inestables ganaban en categoría "precio" y aparecían arriba. Era matemáticamente correcto pero operativamente desastroso.

**Fix**: quality gate obligatorio — reliability ≥ 0.7. Las alternativas que no cumplen no entran a la matriz de decisión. El ranking solo compara opciones viables.

**Síntesis de los 5 errores**: la mayoría no fueron de algoritmo, fueron de **datos y edge cases**. La lección: en sistemas multi-fuente, el 80% del trabajo no es el modelo, es limpiar y reconciliar inputs.

Métricas: 206 modelos · 13 fuentes · 31,116 LOC TS · 111 archivos · JSON 376 KB · latencia avg 0.5 ms · v3.3.1 · MIT.

Repo: github.com/redentor159/selectia

¿Qué bug técnico les ha costado más horas? Los leo 👇

#IngenieriaIndustrial #IA #ProductManagement #TOPSIS #MultiModelo #OpenSource #LatAm #Perú

---

## Hilo 4 — "Por qué open source para LatAm"

> **5 posts** · público: founders LatAm, hacedores de políticas, comunidad open source
> **imagen post 1**: mapa de América con las 21 monedas

### Post 1/5 — Hook

1/5

Workday (enero 2026, 3,200 líderes): 85% ahorra 1–7 h/semana con IA, pero ~40% se pierde en retrabajo por elegir mal el modelo.

En LatAm ese 40% pesa más: las MYPEs no tienen equipo de ML, no tienen consultor, y no pueden pagar 20 USD/mes por un SaaS de recomendación de IA.

Por eso SelectIA es **MIT, no SaaS**. Te explico la decisión → 🧵

### Post 2/5 — Argumento 1: democratización

2/5

**Argumento 1 — Democratización**.

Si una MYPE en Bolivia, Colombia o Argentina no puede pagar 20 USD/mes, eso no debe ser razón para que decida mal su modelo de IA. La decisión de modelo es hoy un factor de productividad tan básico que cerrarla detrás de un paywall es crear una nueva brecha digital.

Open source mitiga eso. Cualquiera puede hacer fork, hostearlo en Vercel gratis, y tener su propio recomendador. Sin tarjeta de crédito, sin trial, sin vendedor.

Siguiente argumento → 3/5

### Post 3/5 — Argumento 2: auditoría

3/5

**Argumento 2 — Auditoría pública**.

Cuando recomiendas un modelo de IA para redactar un IPERC (matriz de riesgo) en una operación industrial, la recomendación tiene consecuencias. Si sale mal, alguien debe poder responder "¿por qué este modelo y no otro?".

Con SaaS cerrado: "trust me". Con open source: el código está ahí. El motor HRE-TOPSIS, los pesos AHP (CR = 0), los filtros duros, el piso de calidad, todo es auditable. Y la explicabilidad en español plano está en el propio output.

La transparencia no es marketing, es requisito de seguridad operativa.

Siguiente → 4/5

### Post 4/5 — Argumento 3: adaptación local

4/5

**Argumento 3 — Adaptación local**.

Un SaaS global no va a priorizar 21 monedas de América. No va a soportar cron a las 2 AM hora Lima. No va a tener glosario en español con 176 términos y 15 deepDives. No va a diseñar 4 temas visuales pensando en un taller con monitor viejo y poca luz.

SelectIA sí. Porque lo construí desde LatAm para LatAm. Y porque es MIT, cualquier otro en la región puede adaptarlo a su contexto sin pedir permiso.

Cierre → 5/5

### Post 5/5 — Cierre + CTA

5/5

**Síntesis**:

Open source en LatAm no es ideología, es estrategia. Tres razones:
1. **Democratización**: la decisión de modelo de IA no debe ser privilegio de quien puede pagar SaaS.
2. **Auditoría**: las recomendaciones con impacto operativo deben ser auditable.
3. **Adaptación local**: ningún SaaS global priorizará nuestras monedas, horarios y contextos como nosotros.

Métricas: 206 modelos · 13 fuentes en vivo · 21 monedas · 176 términos en glosario · 4 temas · v3.3.1 · MIT · deploy gratis en Vercel · 31,116 LOC TS · 111 archivos · JSON 376 KB · latencia avg 0.5 ms.

Repo: github.com/redentor159/selectia

¿Creen que el open source es la vía para cerrar la brecha de adopción de IA en MYPEs LatAm? Los leo 👇

#IngenieriaIndustrial #IA #OpenSource #LatAm #MYPE #Perú #ProductManagement #TOPSIS #MultiModelo

---

## Hilo 5 — "Una semana construyendo SelectIA con 4 IAs (sin framework)"

> **7 posts** · público: builders, devs, comunidad AI
> **imagen post 1**: foto del setup de trabajo del autor o screenshot minimalista

### Post 1/7 — Hook

1/7

Workday (enero 2026, 3,200 líderes): 85% ahorra 1–7 h/semana con IA, pero ~40% se pierde en retrabajo. La causa: elegir mal el modelo.

Esta semana construí SelectIA para atacar eso. Usé 4 IAs como asistentes de investigación. Sin framework de orquestación. Pasando contexto manualmente entre sesiones.

Crónica día a día → 🧵

### Post 2/7 — Día 1: Investigación paralela

2/7

**Día 1 — Investigación paralela**.

Abrí 3 pestañas: GLM-5.2, Minimax M3, Gemini 3.1 Pro. A cada uno le pedí lo mismo: "busca todas las APIs públicas que devuelven datos de modelos de IA (precios, benchmarks, latencia, ELO)".

Cruzaba respuestas manualmente:
▪️ GLM encontró APIs de logos y varias que no conocía.
▪️ Minimax identificó fuentes similares a Artificial Analysis.
▪️ Gemini acertó con las principales (Arena, HF, OpenRouter).

La diversidad de respuestas fue la señal: cuando 3 IAs distintas convergen en una fuente, esa fuente es confiable.

Día 2 → 3/7

### Post 3/7 — Día 2: Verificación

3/7

**Día 2 — Verificación con Claude Sonnet 4.6**.

Llevé la lista consolidada del Día 1 a Claude (en Antigravity). Le pedí: para cada fuente, llama la API, extrae el JSON real, documenta el schema, identifica campos faltantes.

Claude hizo el trabajo sucio: probó cada endpoint, mapeó respuestas, marcó cuáles estaban rotas o requerían auth. Salí del Día 2 con un documento de fuentes verificadas — no opiniones, datos.

Lección: la verificación es un rol distinto al descubrimiento. Descubrimiento lo hacen varios IAs en paralelo. Verificación la hace uno solo, con foco.

Día 3 → 4/7

### Post 4/7 — Día 3: PRD

4/7

**Día 3 — PRD con Claude, refina con GLM**.

Con los JSON reales en mano, Claude estructuró un Product Requirements Document aprovechando los esquemas reales (no hipótesis). Cada feature del PRD mapeaba a un campo que ya existía en alguna de las 13 fuentes.

Después llevé el PRD a GLM-5.2 para refinar: "¿qué falta? ¿qué está sobrediseñado?". GLM me hizo 5 preguntas que me obligaron a aclarar el scope. Recorté dos features que no tenían fuente de datos.

Lección: un PRD escrito sobre JSON reales es 10× más concreto que uno escrito sobre intuición.

Día 4 → 5/7

### Post 5/7 — Día 4: Construcción con GLM Agente

5/7

**Día 4 — Construcción con GLM-5.2 Agente Full Stack**.

Le di a GLM en modo Agente: el PRD + los JSON verificados + el design system (tokens, componentes, reglas). Y le pedí que construyera el dashboard iterando.

Esto fue lo más intenso. Cada iteración:
1. GLM proponía implementación.
2. Yo revisaba contra el PRD.
3. Iterábamos.
4. Subía a Vercel para verificar deploy.

No hubo orquestación automática. Fui yo el que decidía cuándo iterar, cuándo parar, cuándo reescribir. La IA proponía, yo cortaba.

Día 5 → 6/7

### Post 6/7 — Día 5: Bugs y reconciliación

6/7

**Día 5 — Bugs, reconciliación de fuentes, métricas finales**.

Aquí aparecieron los 5 errores del hilo anterior: función K invertida, ContextWindow corrupto, matching BenchLM, speed outlier, piso de calidad faltante. Cada uno detectado en producción, cada uno con fix aplicado.

También reconcilié las 13 fuentes: cuando dos fuentes discrepaban en el precio de un modelo, tomé la mediana. Cuando discrepaban en ELO, prioricé Arena AI.

Al final del día: 206 modelos, 31,116 LOC TS, 111 archivos, JSON 376 KB, latencia avg 0.5 ms.

Síntesis → 7/7

### Post 7/7 — Síntesis + CTA

7/7

**Síntesis de la semana**:

1. **Descubrimiento**: múltiples IAs en paralelo, respuestas cruzadas manualmente.
2. **Verificación**: un solo IA con foco en validar cada fuente.
3. **PRD**: sobre JSON reales, no hipótesis.
4. **Construcción**: un IA en modo agente full stack, iterando contra design system.
5. **Bugs y reconciliación**: trabajo humano de calidad, no delegable.

**No usé framework de orquestación.** Pasar contexto manualmente entre 4 IAs fue más lento pero más controlable. Cada IA aportó lo suyo sin opacidad.

Métricas finales: 206 modelos · 13 fuentes · 31,116 LOC TS · 111 archivos · JSON 376 KB · latencia avg 0.5 ms · v3.3.1 · MIT · 21 monedas · 4 temas · glosario 176 términos / 15 deepDives.

Repo: github.com/redentor159/selectia

¿Han probado coordinar varias IAs manualmente? ¿O prefieren un solo asistente end-to-end? Los leo 👇

#IngenieriaIndustrial #IA #ProductManagement #MultiModelo #TOPSIS #OpenSource #LatAm #Perú #MYPE #IntegracionAPIs

---

## Notas transversales para los 5 hilos

### Orden de publicación recomendado (30 días)
- **Día 1**: Hilo 1 (fuentes) o Hilo 2 (motor) como lanzamiento.
- **Día 3**: Hilo 3 (errores) — capitaliza comentarios del lanzamiento.
- **Día 7**: Hilo 4 (open source) — ángulo filosófico, alcance senior.
- **Día 14**: Hilo 5 (crónica con IAs) — ángulo personal, recalienta el feed.
- **Día 21 y 28**: repost del hilo con mejor performance + nuevo gancho.

### Multimedias sugeridas (en carpeta `/screenshots/` del repo)
- Hilo 1: `00-inicio.png` o `01-resumen.png`
- Hilo 2: `13-motor-explicado.png` o `16-animacion-step41.png`
- Hilo 3: `17-modo-traza.png` o `11e-animacion-modo-traza.png`
- Hilo 4: `15-dropdown-monedas-21.png` o `18-dropdown-monedas.png`
- Hilo 5: `00-inicio.png` o screenshot del setup del autor

### Lo que NO debes afirmar
- ❌ "Orquesté con framework" — fue manual
- ❌ "95% de ahorro" — no hay data
- ❌ "Producción en planta real" — es PoC
- ❌ "Usuarios activos" — no hay aún

### Métricas 100% verificables (todas usadas en los hilos)
- 206 modelos · 13 fuentes en vivo · 31,116 LOC TS · 111 archivos
- JSON 376 KB · cron 2 AM Lima · latencia avg 0.5 ms, max 3 ms
- 21 monedas · 4 temas · glosario 176 términos / 15 deepDives
- v3.3.1 · MIT · repo: github.com/redentor159/selectia
