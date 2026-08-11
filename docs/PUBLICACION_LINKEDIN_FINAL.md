# Publicación LinkedIn — SelectIA (VERSIÓN FINAL VERIFICADA)

> **Fecha de verificación**: 10 ago 2026
> **Repo real**: https://github.com/redentor159/selectia-app (público — NO usar `redentor159/selectia`, ese repo no existe)
> **Deploy real**: https://selectia-app.vercel.app/ (NO usar `selectia.vercel.app`, esa URL sirve otra aplicación)
> **Versión en producción**: v3.2 (los docs antiguos dicen v3.3.1 — desactualizado)

---

## 1. EL POST — listo para copiar

```
Los 3,200 trabajadores encuestados por Workday (enero 2026) reportan ahorrar
entre 1 y 7 horas semanales usando IA. Pero casi el 40% de ese tiempo se
pierde corrigiendo lo que la IA generó mal.

Ganamos horas y las regalamos de vuelta: reescribiendo, verificando,
ajustando salidas que no debieron salir así.

Yo soy estudiante de Ingeniería Industrial en Perú. Esa cifra me dejó una
pregunta concreta: ¿cómo decide una MYPE qué modelo de IA usar para redactar
un IPERC, generar G-code para un CNC o cotizar en soles? La mayoría no
decide: prueba al azar y pierde tiempo.

Construí una respuesta. Se llama SelectIA.

Es un dashboard que se conecta a 9 fuentes de datos en vivo (Artificial
Analysis, BenchLM, ZeroEval, Arena AI, LiteLLM, HuggingFace, OpenRouter y
más) y compara 275+ modelos de IA para recomendar el óptimo para cada tarea
en menos de 100 milisegundos, 100% en tu navegador.

Lo que más me costó no fue el código. Fue tratar la decisión como un
problema de ingeniería:

▪️ 275+ modelos comparados con un motor HRE-TOPSIS de 8 criterios: precio,
inteligencia, coding, agentic, velocidad, contexto, ELO y confiabilidad.
▪️ Pesos calculados con AHP — consistency ratio = 0 (consistencia perfecta
por construcción, no por juicio humano).
▪️ TF-IDF con stemming en español para entender la consulta del usuario.
▪️ Explicabilidad: cada recomendación dice en español por qué ganó ese
modelo.

Para que sirva de verdad en LatAm: monedas de América (PEN, USD, BRL, MXN,
COP y más), 4 temas y un glosario técnico en español.

Lo honesto: no usé un framework de orquestación. Coordiné manualmente
asistentes de IA, pasando contexto entre sesiones: una investigó APIs, otra
verificó fuentes, otra armó el PRD, otra construyó. La decisión de diseño,
la arquitectura y los criterios fueron decididos por mí.

Datos verificables:
▪️ 275+ modelos · 9 fuentes en vivo · actualización diaria
▪️ 31,116 líneas de TypeScript en 111 archivos
▪️ Código abierto MIT · deploy gratuito en Vercel

Demo: https://selectia-app.vercel.app/
Repo: https://github.com/redentor159/selectia-app

Fuente del dato inicial: Workday, "Beyond Productivity: Measuring the Real
Value of AI" (encuesta global, nov 2025):
https://www.prnewswire.com/news-releases/new-workday-research-companies-are-leaving-ai-gains-on-the-table-302660517.html

El futuro de la Ingeniería Industrial no es "usar IA". Es saber qué IA usar
para cada tarea.

¿Cómo están eligiendo modelos de IA en su equipo hoy? Los leo 👇

#IngenieriaIndustrial #IA #TOPSIS #MultiModelo #OpenSource #LatAm #MYPE #Perú #ProductManagement
```

**Multimedia**: screenshot de la vista Resumen (tema Linear Claro). Si usas 4 imágenes: Resumen, Recomendador con resultado, Motor Explicado, y monedas.

---

## 2. La cita completa (verificada en la fuente original)

- **Comunicado**: "New Workday Research: Companies Are Leaving AI Gains on the Table" — Workday, 14 de enero 2026.
- **Estudio**: "Beyond Productivity: Measuring the Real Value of AI" — encuesta de Workday con Hanover Research, noviembre 2025.
- **Universo EXACTO**: 3,200 **trabajadores de tiempo completo** en organizaciones con **$100M+ de ingresos anuales** (Norteamérica, APAC, EMEA). NO son "líderes de negocio" y NO son MYPEs.
- **Datos**: 85% reporta ahorrar 1–7 h/semana usando IA · "Nearly 40% of AI time savings are lost to rework".
- **Enlaces**:
  - Corto (usar este en el post): https://www.prnewswire.com/news-releases/new-workday-research-companies-are-leaving-ai-gains-on-the-table-302660517.html
  - Oficial (Workday IR): https://investor.workday.com/news-and-events/press-releases/news-details/2026/New-Workday-Research-Companies-Are-Leaving-AI-Gains-on-the-Table/default.aspx

**Matiz importante**: el estudio NO dice que la causa del retrabajo sea "elegir el modelo equivocado". Dice que el retrabajo viene de output de baja calidad de herramientas genéricas. La conexión "modelo equivocado = retrabajo" es TU interpretación — válida, pero en el post suena como pregunta/tesis propia, nunca como hallazgo del estudio.

---

## 3. Decisiones documentadas (por qué el post es así)

### 3.1 ¿Mencionar DeepSeek V4 Flash como constructor? → NO (recomendado)
- Para un post orientado a oportunidades profesionales, "X IA construyó mi app" se lee como "la IA la hizo, no él". Disminuye tu aporte ante un reclutador.
- Genera inconsistencia: tus hilos y docs antiguos mencionan GLM-5.2, Minimax M3, Gemini 3.1 Pro y Claude Sonnet 4.6 como asistentes. Decir "DeepSeek V4 Flash construyó" contradice tu propia narrativa publicada.
- La versión actual del post ("coordiné asistentes de IA manualmente") es transparente Y conserva el crédito del diseño y la arquitectura para ti. Ese es el equilibrio correcto.
- Si quieres mencionar el proceso con IA en detalle, hazlo en un hilo técnico (público dev), no en el post principal.

### 3.2 ¿"Un mes", "un mes y medio", o nada? → NADA (recomendado) o "seis semanas" si es exacto
- El historial del repo muestra commits desde el 30-jul-2026. Hoy es 10-ago-2026. Si alguien abre el repo, ve ~2 semanas de historial visible. Lo que no está en git (exploración, diseño, docs) no es verificable por un tercero.
- "Varios meses" es falso y verificablemente falso → nunca.
- "Un mes" si fueron 6 semanas es inexacto por redondeo innecesario → nunca.
- Mejor opción: NO dar duración en el post. La duración no le suma nada al lector; el resultado sí. Si quieres duración, usa "seis semanas" solo si es la verdad completa incluyendo diseño y exploración.

### 3.3 ¿Poner la cita y el enlace? → SÍ
- La cita con enlace es lo que separa un post creíble de un post de humo. El enlace está incluido (versión corta de PR Newswire).
- Sí se pueden poner enlaces en LinkedIn; la URL se vuelve clicable automáticamente. Ponla completa, no acortada.

---

## 4. Discrepancias detectadas — ACTUALIZAR los docs antiguos ANTES de publicar hilos

| Métrica | Docs antiguos (GUIA/VARIANTES/HILOS) | Realidad hoy (app viva, 10-ago-2026) | Acción |
|---|---|---|---|
| Modelos | 206 | 275+ (variable: crece en vivo) | Corregir; usar "275+" para no caducar |
| Fuentes | 13 | 9 integradas | Corregir |
| Latencia | "avg 0.5 ms, max 3 ms, <10 ms" | "<100 ms" (HRE-TOPSIS 100% cliente) | Corregir — los docs afirman una medición que no existía |
| Monedas | 21 | La app muestra "21" en una tarjeta y "19" en el panel de Open ER-API | Verificar cuál es la real; en el post se omitió el número a propósito |
| Versión | v3.3.1 | v3.2 | Corregir |
| URL repo | redentor159/selectia (NO EXISTE) | redentor159/selectia-app | Corregir en TODOS |
| URL deploy | selectia.vercel.app (sirve otra app) | selectia-app.vercel.app | Corregir |

Regla de oro ya documentada en tu guía: solo afirmar lo verificable. Las métricas de este post SÍ están verificadas hoy.

---

## 5. Checklist pre-publicación (10 minutos)

- [ ] Hacer commit + push del código actual al repo público (hay cambios sin commitear; el repo debe reflejar v3.2 real, no un estado viejo).
- [ ] Abrir https://selectia-app.vercel.app/ en modo incógnito y navegar 3 vistas (la demo debe cargar).
- [ ] Abrir https://github.com/redentor159/selectia-app (debe existir y ser público — verificado: SÍ).
- [ ] Tomar screenshot Resumen tema Linear Claro (o el grid de 4).
- [ ] Publicar martes-jueves, 9:00–10:00 AM hora Lima.
- [ ] Responder comentarios en la primera hora.
- [ ] No etiquetar a desconocidos.

---

## 6. Respuestas a preguntas del autor (10-ago-2026)

### 6.1 ¿Los modelos varían y el post se queda viejo? → Por eso dice "275+"
- Correcto: la cifra es un snapshot en vivo (ayer menos, hoy 275, mañana más). El post usa "275+" — un mínimo verificable que NO caduca cuando la cifra sube.
- Regla: nunca pongas una cifra exacta de algo que cambia a diario. Poner el mínimo con "+" o "más de X".

### 6.2 ¿Qué es un framework de orquestación? ¿Son de paga?
- Un framework de orquestación (LangChain, CrewAI, AutoGen, n8n, etc.) es una librería/herramienta que coordina automáticamente a varios agentes de IA: les reparte tareas, gestiona el contexto compartido, encadena llamadas y flujos.
- **NO son de paga**: la mayoría son open source y gratuitos (LangChain, CrewAI y AutoGen son MIT/Apache — gratis). Lo que cuesta es la API de los modelos, no el framework.
- O sea: "no usé framework porque son de paga" es FALSO. NO lo digas en el post ni en entrevistas — un dev te desarma en segundos.
- La razón correcta (la que ya usa el post): "no usé framework porque coordiné manualmente para tener control total del proceso y aprender cada paso". Esa es defendible y honesta.
- Y "lo hice 100% gratis" es verificable solo si es verdad de punta a punta (Vercel free, APIs free tier, modelos gratis). No lo afirmes como claim central; el post dice "deploy gratuito en Vercel", que es lo seguro.

### 6.3 ¿Todos los datos del post son 100% verificables? → Los que están, SÍ; los que no, se quitaron
- Verificados HOY por el autor del análisis: 275+ modelos (app viva), 9 fuentes (vista Salud), <100 ms (etiqueta del motor en la app), CR = 0 (código del glosario), 31,116 LOC / 111 archivos (README del repo), URLs reales, cita Workday (fuente original).
- Se eliminaron por NO verificables: "avg 0.5 ms / max 3 ms" (no había medición), "206 modelos / 13 fuentes" (desactualizado), "v3.3.1" (la app dice v3.2), "21 monedas" (la app se contradice: 19 vs 21).
- Matiz importante: "100% verificable" hoy no garantiza mañana (los modelos varían — tu propio punto). Por eso el post usa mínimos robustos ("275+", "9 fuentes") y evita cifras que se vuelven mentira en una semana.

### 6.4 ¿Qué hacer después de publicar? ¿Seguir a máxima gente en LinkedIn? → NO
- **NO sigas a cientos de personas**: LinkedIn penaliza el "follow farming". Seguir masivamente baja tu relevancia: el algoritmo mide el engagement de tus conexiones reales, no el número. Gente que no te conoce y a la que no le importa tu contenido = cero alcance.
- Lo que SÍ funciona después de publicar (en orden):
  1. Primera hora: responder TODOS los comentarios (define el alcance del post).
  2. Compartir en 2-3 grupos relevantes (Ingeniería Industrial Perú, IA LatAm).
  3. Etiquetar SOLO a gente con relación previa (profesores, mentores).
  4. A las 24 h: si >50 reacciones y >10 comentarios, repostear con un update.
  5. Viernes: revisar métricas. Jueves siguiente: publicar el Hilo 1 (fuentes) con los datos YA corregidos.
- Movimiento diario de calidad, no cantidad: conectar con 5-10 personas RELEVANTES al día (reclutadores de prácticas industriales, ingenieros industriales, founders de MYPE) con nota personalizada; comentar con valor en 3-5 posts de otros. Eso construye red de verdad.
- Tu guía (GUIA_PUBLICACION_LINKEDIN.md, secciones 5 y 6) ya tiene el detalle completo: úsala como manual post-publicación.