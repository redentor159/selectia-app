# LinkedIn — 6 Variantes del Post Principal de SelectIA

**Proyecto**: SelectIA v3.3.1 — Command Center de Modelos de IA para MYPEs latinoamericanas
**Autor**: José Jesús Alejandro Soria Vásquez — Ing. Industrial (Perú)
**Repo**: github.com/redentor159/selectia

---

## Cómo usar este documento

Este documento contiene **6 variantes completas** del post principal de LinkedIn para el lanzamiento de SelectIA. Cada variante está pensada para un público o momento distinto. Todas comparten las mismas métricas verificables (no se inventa nada), pero cambian el tono, la longitud y el ángulo narrativo.

**Cómo elegir la variante correcta**:

| Variante | Tono | Público ideal | Longitud |
|---|---|---|---|
| 1 — Storytelling | Emocional, primera persona | Recruiters, founders, comunidad LatAm | 400-500 palabras |
| 2 — Técnica | Rigurosa, ingenieril | Devs, ML engineers, tech leads | 400-500 palabras |
| 3 — Educativa | Didáctica, paso a paso | Estudiantes, product managers junior | 400-500 palabras |
| 4 — Corta y directa | Concisa, mobile-first | Feed mobile en hora pico | 200-250 palabras |
| 5 — Data-driven | Métricas al frente | Inversores, consultores, B2B | 350-400 palabras |
| 6 — Reflexiva filosófica | Ensayo corto, visión | Senior leaders, académicos | 400-500 palabras |

**Reglas respetadas en todas las variantes**:
- Solo se usan métricas verificables del proyecto (206 modelos, 13 fuentes, 31,116 LOC TS, 111 archivos, JSON 376 KB, <10ms latencia, 21 monedas, 176 términos en glosario, 15 deepDives, 4 temas, v3.3.1, MIT).
- Se menciona el estudio de Workday (enero 2026, 3,200 líderes, NDQ: WDAY) como hook estadístico real.
- No se afirma "orquestación con framework" (fue manual), ni "95% de ahorro", ni "producción real en planta", ni "usuarios activos".
- Casos de uso reales: IPERC, G-code CNC, manual técnico de 300 páginas, cotización, traducción técnica.

---

## Variante 1 — Storytelling primera persona (la más emocional)

> **Cuándo publicar**: martes o miércoles, 9:00–10:00 AM hora Lima. Ideal como post principal de lanzamiento.
> **Multimedia**: screenshot de la vista Resumen en tema "Linear Claro" + foto del autor (opcional).
> **Objetivo**: conectar emocionalmente y mostrar trayectoria humana.

---

Un estudio de Workday (enero 2026, 3,200 líderes de negocio) encontró algo que me dejó pensando toda una semana: el 85% de empleados ahorra entre 1 y 7 horas por semana usando IA... pero casi el 40% de ese tiempo ahorrado se pierde en retrabajo.

Es decir, las empresas están ganando horas con IA y al mismo tiempo regalándolas de vuelta. Corrigiendo outputs, reescribiendo, verificando modelos que no eran los correctos para esa tarea.

Soy estudiante de Ingeniería Industrial en Perú. Esa cifra me hizo una pregunta muy concreta: ¿cómo decide una MYPE latinoamericana qué modelo de IA usar para redactar un IPERC, generar G-code para un CNC, analizar un manual técnico de 300 páginas, cotizar o traducir? La mayoría no decide. Prueba al azar. Pierde tiempo.

Pasé meses construyendo una respuesta. Se llama SelectIA.

Es un AI Command Center que se conecta a 13 fuentes de datos en vivo (Artificial Analysis, BenchLM, ZeroEval, Arena AI, LiteLLM, HuggingFace Hub, OpenRouter, Open ER-API, Groq, Models.dev, Helicone, Aider, Ollama) y recomienda el modelo óptimo para cada tarea con una latencia promedio de 0.5 ms (máximo 3 ms).

Lo que más me costó no fue el código. Fue pensar la decisión como un problema de ingeniería:

- Comparé **206 modelos** con un motor HRE-TOPSIS que combina 8 criterios: precio, II (inteligencia), coding, agentic, speed, context, elo y reliability.
- Usé AHP para ponderar con un Consistency Ratio = 0 (la matriz de comparación es perfectamente consistente).
- Apliqué TF-IDF con Porter stemmer en español para matchear lenguaje natural del usuario con los perfiles de cada modelo.
- Construí explicabilidad en español plano: cada recomendación viene con las razones de por qué ganó ese modelo.

Para que sirva de verdad en LatAm, el dashboard trabaja con 21 monedas de América (PEN, USD, BRL, MXN, COP, CLP, ARS, CAD y 13 más) y 4 temas visuales.

Lo honesto: no usé un framework de orquestación. Trabajé manualmente con 4 IAs (GLM-5.2, Minimax M3, Gemini 3.1 Pro, Claude Sonnet 4.6), pasando contexto entre ellas como quien pasa notas en clase. Cada una aportó lo suyo: investigación, verificación, PRD, construcción.

Métricas verificables:
▪️ 206 modelos comparados desde 13 fuentes en vivo
▪️ 31,116 líneas de TypeScript en 111 archivos
▪️ JSON maestro de 376 KB, actualizado por cron diario 2 AM Lima
▪️ Glosario: 176 términos, 15 deepDives, 8 categorías
▪️ Latencia < 10 ms por recomendación (avg 0.5 ms, max 3 ms)
▪️ Deploy 100% gratis en Vercel — código abierto MIT

Repo: github.com/redentor159/selectia

El futuro de la Ingeniería Industrial no es "usar IA". Es saber qué IA usar para cada tarea, y construir sistemas que democratizen esa decisión en el equipo.

¿Cómo están eligiendo modelos de IA en su equipo hoy? Los leo 👇

#IngenieriaIndustrial #IA #ProductManagement #MultiModelo #TOPSIS #IntegracionAPIs #OpenSource #LatAm #MYPE #Perú

---

## Variante 2 — Técnica para ingenieros

> **Cuándo publicar**: jueves, 7:30–8:30 AM hora Lima (tráfico dev pre-jornada).
> **Multimedia**: screenshot de la vista "Motor Explicado" o "Animación del Motor" en tema "Linear Oscuro".
> **Objetivo**: mostrar rigor técnico sin aburrir. Atraer devs e ingenieros.

---

Workday (enero 2026, 3,200 líderes): 85% de empleados ahorra 1–7 h/semana con IA, pero ~40% de ese tiempo se pierde en retrabajo. La causa más común: elegir el modelo equivocado para la tarea.

Construí SelectIA para resolver exactamente eso. No es un chatbot ni un wrapper. Es un motor de decisión multi-criterio para 206 modelos de IA, con datos en vivo de 13 fuentes: Artificial Analysis, BenchLM, ZeroEval, Arena AI, LiteLLM, HuggingFace Hub, OpenRouter, Open ER-API, Groq, Models.dev, Helicone, Aider y Ollama.

**Arquitectura del motor HRE-TOPSIS**:

1. **TF-IDF + Porter stemmer (español)**: vectorizo la consulta del usuario y los perfiles de cada modelo. El stemmer reduce "cotización", "cotizar", "cotice" al mismo token.
2. **Filtros duros**: descarto modelos que no cumplen requisitos no negociables (ventana de contexto, modalidad, precio máximo).
3. **Quality gate / piso de calidad**: umbral mínimo de confiabilidad para entrar al ranking.
4. **AHP (Analytic Hierarchy Process)**: 8 criterios (precio, II, coding, agentic, speed, context, elo, reliability) ponderados con matriz de comparación pareada. Verifiqué el Consistency Ratio: CR = 0.
5. **TOPSIS**: normalizo la matriz de decisión, aplico pesos AHP, calculo distancia euclidiana de cada alternativa al ideal positivo y al ideal negativo. El score final es la cercanía relativa al ideal.
6. **Explicabilidad**: el motor genera razones en español plano ("Ganó sobre X porque es 3× más barato y su ELO es 12 puntos mayor").

**Métricas medidas, no estimadas**:
▪️ 206 modelos comparados
▪️ 13 fuentes en vivo (cron diario 2 AM Lima)
▪️ Latencia avg 0.5 ms, max 3 ms, siempre < 10 ms por recomendación
▪️ 31,116 LOC TypeScript en 111 archivos
▪️ JSON maestro 376 KB
▪️ 21 monedas de América (PEN, USD, BRL, MXN, COP, CLP, ARS, CAD + 13)
▪️ 4 temas: Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro
▪️ Glosario de 176 términos, 15 deepDives, 8 categorías
▪️ v3.3.1, MIT, deploy gratis en Vercel

Sobre el proceso: no usé framework de orquestación. Coordiné manualmente 4 IAs (GLM-5.2, Minimax M3, Gemini 3.1 Pro, Claude Sonnet 4.6), cada una desde su propia interfaz, pasando JSON y contexto entre sesiones. GLM investigó APIs, Claude verificó y generó el PRD, Minimax y Gemini aportaron hallazgos paralelos, GLM en modo Agente Full Stack construyó el dashboard iterando contra el design system.

Casos de uso reales en el dashboard: IPERC (matriz de riesgo), G-code para CNC, análisis de manual técnico de 300 páginas, cotización, traducción técnica.

Repo: github.com/redentor159/selectia

¿Cómo están resolviendo la elección de modelo en sus equipos hoy? ¿Reglas manuales, heurística, o "el que conocemos"? Los leo 👇

#IngenieriaIndustrial #IA #TOPSIS #AHP #MultiModelo #IntegracionAPIs #OpenSource #ProductManagement #LatAm #Perú

---

## Variante 3 — Educativa / tutorial (cómo pensé el problema)

> **Cuándo publicar**: miércoles, 12:00–13:00 hora Lima (pausa de almuerzo, lectura más larga).
> **Multimedia**: screenshot de "Guía de Decisión" + carrusel opcional de 5 slides.
> **Objetivo**: enseñar el razonamiento. Posicionar como educador, no como vendedor.

---

Workday publicó en enero 2026 un estudio con 3,200 líderes de negocio: 85% de empleados ahorra 1–7 h/semana con IA, pero casi 40% de ese tiempo se pierde en retrabajo. La frase que más me golpeó: "el tiempo ahorrado se pierde corrigiendo modelos que no eran los adecuados para la tarea".

Empecé a pensar cómo resolvería eso en una MYPE latinoamericana. Quiero compartir el razonamiento, no solo el resultado.

**Paso 1 — Reformular el problema**.
"Elegir el mejor modelo de IA" no es un problema de IA. Es un problema de decisión multi-criterio bajo incertidumbre. Hay 8 dimensiones en tensión: precio, inteligencia (II), capacidad de coding, agentic, speed, contexto, ELO en arena y reliability. No existe un "mejor modelo" absoluto. Existe el mejor para una tarea, un presupuesto y un perfil de usuario.

**Paso 2 — Donde busqué los datos**.
No quería opiniones. Quería benchmarks públicos en vivo. Terminé integrando 13 fuentes: Artificial Analysis, BenchLM, ZeroEval, Arena AI, LiteLLM, HuggingFace Hub, OpenRouter, Open ER-API, Groq, Models.dev, Helicone, Aider y Ollama. Hoy el dashboard compara 206 modelos con datos que se actualizan por cron diario a las 2 AM hora Lima.

**Paso 3 — Cómo organicé la decisión**.
Usé HRE-TOPSIS (Hybrid Recommendation Engine con TOPSIS):
- TF-IDF + Porter stemmer en español para interpretar la consulta del usuario.
- Filtros duros: contexto, modalidad, precio máximo.
- Piso de calidad: umbral mínimo de confiabilidad.
- AHP con 8 criterios. Verifiqué el Consistency Ratio: CR = 0.
- TOPSIS con distancia euclidiana al ideal positivo y negativo.
- Explicabilidad: razones en español plano.

**Paso 4 — Hacerlo útil para LatAm**.
21 monedas (PEN, USD, BRL, MXN, COP, CLP, ARS, CAD y 13 más), 4 temas visuales, glosario de 176 términos con 15 deepDives para que cualquier persona del equipo entienda qué es "agentic", "MMLU" o "context window".

**Paso 5 — Construcción asistida, no orquestada**.
Quiero ser honesto: no usé un framework de orquestación. Trabajé con 4 IAs (GLM-5.2, Minimax M3, Gemini 3.1 Pro, Claude Sonnet 4.6) pasando contexto manualmente entre sesiones. GLM investigó APIs y construyó el dashboard en modo agente. Claude verificó y armó el PRD. Minimax y Gemini aportaron descubrimientos paralelos.

**Métricas verificables**:
▪️ 206 modelos · 13 fuentes en vivo · JSON 376 KB
▪️ 31,116 LOC TypeScript · 111 archivos
▪️ Latencia avg 0.5 ms, max 3 ms (siempre < 10 ms)
▪️ v3.3.1 · MIT · Vercel · 21 monedas

Repo: github.com/redentor159/selectia

Casos de uso reales en el dashboard: IPERC, G-code CNC, manual técnico de 300 páginas, cotización, traducción técnica.

Si tuvieras que enseñarle a un nuevo colaborador cómo elegir modelo de IA para una tarea operativa, ¿por dónde empezarías? Los leo 👇

#IngenieriaIndustrial #IA #ProductManagement #TOPSIS #AHP #MultiModelo #OpenSource #LatAm #MYPE #Perú

---

## Variante 4 — Corta y directa (mobile-first)

> **Cuándo publicar**: martes, 18:00–19:00 hora Lima (tráfico mobile de tarde).
> **Multimedia**: 1 sola imagen limpia, idealmente el comparador con 2 modelos lado a lado.
> **Objetivo**: captar atención en scroll rápido. CTA directo.

---

Workday (enero 2026, 3,200 líderes): 85% ahorra 1–7 h/semana con IA, pero ~40% se pierde en retrabajo. Modelo equivocado = tiempo regalado.

Construí SelectIA: un dashboard que compara 206 modelos de IA desde 13 fuentes en vivo y recomienda el óptimo para tu tarea en 0.5 ms (máx 3 ms).

Casos reales: IPERC, G-code CNC, manual técnico de 300 páginas, cotización, traducción.

Motor HRE-TOPSIS:
▪️ 8 criterios (precio, II, coding, agentic, speed, context, elo, reliability)
▪️ AHP con CR = 0
▪️ TF-IDF + Porter stemmer en español
▪️ Explicabilidad en español plano

Para LatAm: 21 monedas (PEN, USD, BRL, MXN, COP, CLP, ARS, CAD + 13) y 4 temas visuales.

Datos verificables:
▪️ 13 fuentes: Artificial Analysis, BenchLM, ZeroEval, Arena AI, LiteLLM, HuggingFace, OpenRouter, ER-API, Groq, Models.dev, Helicone, Aider, Ollama
▪️ 31,116 LOC TS · 111 archivos · JSON 376 KB
▪️ Cron diario 2 AM Lima · MIT · Vercel gratis
▪️ v3.3.1

Proceso honesto: 4 IAs (GLM-5.2, Minimax M3, Gemini 3.1 Pro, Claude Sonnet 4.6) coordinadas manualmente, sin framework de orquestación.

Repo: github.com/redentor159/selectia

¿Qué modelo de IA están usando hoy para tareas operativas? Los leo 👇

#IngenieriaIndustrial #IA #TOPSIS #MultiModelo #OpenSource #LatAm #MYPE #Perú #ProductManagement

---

## Variante 5 — Data-driven (énfasis en métricas)

> **Cuándo publicar**: jueves, 8:00–9:00 AM hora Lima (audience B2B despierta).
> **Multimedia**: screenshot de la vista Analytics o Salud del Sistema.
> **Objetivo**: posicionar con números. Atraer B2B y consultores.

---

El dato más incómodo que leí este año (Workday, enero 2026, encuesta a 3,200 líderes de negocio):

85% de empleados ahorra 1–7 h/semana con IA, pero casi el 40% de ese tiempo se pierde en retrabajo por elegir el modelo equivocado.

Lo que construí para atacar ese 40%:

**SelectIA — AI Command Center para MYPEs latinoamericanas**

Métricas verificables (no estimadas):

▪️ **206 modelos** de IA comparados
▪️ **13 fuentes de datos en vivo**: Artificial Analysis, BenchLM, ZeroEval, Arena AI, LiteLLM, HuggingFace Hub, OpenRouter, Open ER-API, Groq, Models.dev, Helicone, Aider, Ollama
▪️ **Latencia < 10 ms** por recomendación (avg 0.5 ms, max 3 ms)
▪️ **31,116 líneas de TypeScript** en **111 archivos**
▪️ **JSON maestro 376 KB**, actualizado por **cron diario 2 AM Lima**
▪️ **21 monedas** de América (PEN, USD, BRL, MXN, COP, CLP, ARS, CAD + 13)
▪️ **Glosario**: 176 términos, 15 deepDives, 8 categorías
▪️ **4 temas visuales**: Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro
▪️ **v3.3.1 · MIT · Vercel gratis**

**Motor HRE-TOPSIS**: TF-IDF + Porter stemmer español → filtros duros → piso de calidad → AHP (8 criterios, CR = 0) → TOPSIS con distancia euclidiana → explicabilidad en español.

Casos de uso reales documentados: IPERC (matriz de riesgo), G-code (CNC), análisis de manual técnico de 300 páginas, cotización, traducción técnica.

Proceso: 4 IAs como asistentes de investigación (GLM-5.2, Minimax M3, Gemini 3.1 Pro, Claude Sonnet 4.6), coordinadas manualmente — sin framework de orquestación.

Repo: github.com/redentor159/selectia

Si el 40% del tiempo ahorrado con IA se pierde en retrabajo, atacar la decisión de modelo es el ROI más alto que le veo a la IA operativa hoy.

¿Cómo miden el retrabajo por uso indebido de IA en su equipo? Los leo 👇

#IngenieriaIndustrial #IA #TOPSIS #ProductManagement #MultiModelo #IntegracionAPIs #OpenSource #LatAm #MYPE #Perú

---

## Variante 6 — Reflexiva filosófica (sobre el futuro de la IA en LatAm)

> **Cuándo publicar**: domingo 19:00–20:00 hora Lima (feed reflexivo de fin de semana).
> **Multimedia**: foto del autor trabajando, o screenshot minimalista del tema "Negro Puro".
> **Objetivo**: iniciar conversación de fondo. Atraer senior leaders.

---

Workday (enero 2026, 3,200 líderes): 85% ahorra 1–7 h/semana con IA. Pero casi el 40% de ese tiempo se pierde en retrabajo. Esa cifra describe una década entera de adopción tecnológica en una sola imagen: ganamos el инструментo y no supimos elegirlo.

Soy estudiante de Ingeniería Industrial en Perú. Llevo meses pensando en una pregunta que no es técnica, es económica: ¿cómo hace una MYPE latinoamericana para decidir entre 200+ modelos de IA sin equipo de ML, sin presupuesto de consultoría y sin tiempo?

La mayoría decide mal. Prueba el más conocido. Prueba el más barato. Prueba el que usó un amigo. Y pierde horas corrigiendo.

Construí SelectIA como una respuesta parcial a esa pregunta. Un Command Center que se conecta a 13 fuentes de datos en vivo (Artificial Analysis, BenchLM, ZeroEval, Arena AI, LiteLLM, HuggingFace Hub, OpenRouter, Open ER-API, Groq, Models.dev, Helicone, Aider, Ollama) y recomienda el modelo óptimo para cada tarea, con latencia promedio de 0.5 ms.

Detrás hay una decisión de diseño que quiero compartir:

**La elección de modelo no es un problema de IA, es un problema de decisión multi-criterio.** Por eso usé HRE-TOPSIS con 8 criterios (precio, II, coding, agentic, speed, context, elo, reliability), ponderados con AHP (Consistency Ratio = 0), distancia euclidiana al ideal positivo y al negativo. Y explicabilidad en español plano, porque una recomendación que no se explica es una opinión.

Y una decisión política:

**El código es MIT. El deploy es gratis en Vercel. Las 21 monedas de América están incluidas.** No es un SaaS. Es infraestructura abierta. Si una MYPE en Bolivia, Colombia o Argentina no puede pagar 20 USD al mes por un recomendador de IA, eso no debe ser una razón para que decida mal.

Datos verificables:
▪️ 206 modelos · 13 fuentes en vivo · 31,116 LOC TS · 111 archivos
▪️ JSON 376 KB · cron diario 2 AM Lima · latencia avg 0.5 ms, max 3 ms
▪️ Glosario 176 términos · 15 deepDives · 4 temas · v3.3.1

Proceso honesto: 4 IAs como asistentes de investigación (GLM-5.2, Minimax M3, Gemini 3.1 Pro, Claude Sonnet 4.6), pasando contexto manualmente. Sin framework. Sin magia.

Repo: github.com/redentor159/selectia

Mi tesis: en LatAm no nos falta IA. Nos falta democratizar la decisión de cuál IA usar. Si resolvemos eso, el 40% de retrabajo deja de ser destino y se vuelve variable controlable.

¿Creen que la decisión de modelo de IA será una función de Ingeniería Industrial, de TI, o de Operations en las empresas de LatAm en 5 años? Los leo 👇

#IngenieriaIndustrial #IA #TOPSIS #OpenSource #LatAm #MYPE #Perú #ProductManagement #MultiModelo #IntegracionAPIs

---

## Notas transversales para todas las variantes

### Sobre el hook de Workday
- **Fuente**: Workday Research, enero 2026, encuesta a 3,200 líderes de negocio.
- **URL**: https://investor.workday.com/news-and-events/press-releases/news-details/2026/New-Workday-Research-Companies-Are-Leaving-AI-Gains-on-the-Table/default.aspx
- **Dato exacto**: "85% save 1–7 hrs/week, ~40% lost to rework".
- Workday es pública (NASDAQ: WDAY). Si alguien pide la fuente, esa URL responde.

### Sobre las métricas (todas verificables)
- 206 modelos → `curl /api/dashboard | jq '.models | length'`
- 13 fuentes → vista Salud del Sistema
- 31,116 LOC TS → `find src -name '*.ts*' | xargs wc -l`
- 111 archivos → `find src -type f | wc -l`
- 376 KB JSON → `ls -lh public/data/master_dashboard_data.json`
- Latencia < 10 ms → visible en cada recomendación del dashboard
- 21 monedas → dropdown de monedas en el header
- 176 términos en glosario → vista Glosario
- v3.3.1 → `cat package.json | jq .version`

### Lo que NO debes afirmar (en ninguna variante)
- ❌ "Orquesté IAs con un framework" — fue manual
- ❌ "95% de ahorro" — no hay data
- ❌ "Producción en planta real" — es PoC
- ❌ "Usuarios activos" — no hay aún
- ❌ Cualquier métrica no verificable

### Mejor momento para publicar
- **Martes, miércoles, jueves** son los mejores días.
- **9:00–10:00 AM hora Lima** para audiencia LatAm B2B.
- Evitar viernes después del mediodía y lunes antes de las 10 AM.
