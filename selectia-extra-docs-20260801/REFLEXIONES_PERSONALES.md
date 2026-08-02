# 💭 Reflexiones Personales — SelectIA

> **Notas íntimas del autor** sobre lo que significó construir SelectIA v3.3.1 en cinco semanas, sin ser programador profesional, usando cuatro modelos de IA como asistentes.
>
> **Autor:** José Jesús Alejandro Soria Vásquez
> **Carrera:** Ingeniería Industrial (Perú)
> **Fecha:** 30 de julio de 2026
> **Tono:** primera persona, más cercano que los otros documentos del repositorio.

---

## 🌱 Por qué construí SelectIA

La respuesta corta es: porque un gerente de una metalmecánica en Chiclayo me dijo una frase que no se me ha borrado de la cabeza.

> *"Hermano, he probado tres. Uno me cobraba en dólares y no sé cuánto me va a salir al final. Otro era gratis pero me daba respuestas que no servían. El tercero era bueno pero lento. ¿Cómo sé cuál elegir? No tengo tiempo para investigar."*

La respuesta larga es más personal.

Soy de Chiclayo. Mi familia no es de ingenieros; mi papá tiene un taller pequeño de metalmecánica y mi mamá enseña en un colegio público. Crecí viendo cómo mi papá tomaba decisiones de inversión con poca información: "¿compro este torno o el otro?", "¿contrato a este operario o espero?". Nunca tenía datos, solo intuición y conversaciones con otros dueños de taller.

Cuando entré a Ingeniería Industrial, lo primero que me impactó fue que **existían métodos para tomar decisiones con datos**. TOPSIS, AHP, análisis de sensibilidad, multi-criterio. Eran herramientas que mi papá nunca tuvo.

En 2024 empecé a aprender TypeScript por mi cuenta. No era porvocación académica, era porque quería construir cosas. Cuando en enero de 2026 leí el estudio de Workday Research —3,200 líderes encuestados, 85% ahorra 1-7 horas semanales con IA pero 40% se pierde en retrabajo por elegir mal— me di cuenta de que la brecha no era de tecnología. Era de decisión.

SelectIA es mi forma de aplicar lo que aprendí en la carrera a un problema real. No es un proyecto académico. Es un intento honesto de devolverle a mi papá —y a miles de gerentes como él— una herramienta que le ahorre las 30 horas que él perdía eligiendo mal.

---

## 🤖 Lo que aprendí sobre IA

Antes de SelectIA, pensaba que los modelos de IA eran "mágicos". Ahora los veo como **herramientas con trade-offs**.

Algunos trade-offs que internalicé:

- **Precio vs. calidad.** GPT-5.5 cuesta 10x más que Gemini 3.5 Flash, pero su II es solo ~10% mayor. Para una MYPE que hace 1,000 llamadas al mes, la diferencia es de $50 vs. $5. Para una MYPE que hace 100,000 llamadas, es de $5,000 vs. $500. El trade-off no es absoluto; depende del uso.
- **Calidad vs. velocidad.** Claude Opus 4.7 es mejor en agentic pero tarda 3x más en responder. Para automatizar un flujo de agentes, la velocidad importa tanto como la calidad.
- **Calidad vs. confiabilidad.** Un modelo puede tener II alto y failure rate alto en producción. ZeroEval me enseñó esto: hay modelos con 90%+ II que fallan el 15% de las veces cuando se les manda prompts reales.
- **Context vs. precio.** Un contexto de 1M tokens suena genial hasta que ves que cuesta 5x más por millón de input tokens. La mayoría de MYPEs no necesita 1M; necesita 32K bien aprovechado.
- **Open vs. cerrado.** Llama 3.3 es open y puedes correrlo local. Pero el hardware para correrlo bien cuesta más que pagar la API de GPT-5.5 por un año. Lo "gratis" no siempre lo es.

Esta mentalidad de trade-offs es lo que el motor HRE-TOPSIS captura. No hay un "mejor modelo"; hay un mejor modelo **para tu caso específico**.

Lo otro que aprendí, y esto me sorprendió: **las IAs no son científicas, son opinativas**. Cuando le pregunté a las cuatro IAs sobre el threshold de `failure_rate` para considerar un modelo "confiable", me dieron cuatro respuestas distintas. Gemini propuso 5%/15%, Claude propuso 3%/10%, Minimax dijo "depende del caso de uso", GLM no se comprometió. La decisión final (5%/15%, basado en literatura SRE) la tomé yo. Las IAs son asesores, no oráculos.

---

## 🏗️ Lo que aprendí sobre ingeniería

TOPSIS, AHP y TF-IDF los conocía de la carrera. Pero usarlos en un proyecto real me enseñó cosas que las clases no transmiten.

### TOPSIS en serio

En la carrera, TOPSIS se enseña con 3 alternativas y 4 criterios. Es juguete. En SelectIA, son 206 alternativas y 8 criterios. Eso cambia varias cosas:

- La normalización importa muchísimo. Sin normalización vectorial, los criterios con magnitudes grandes (precio en centavos) dominan a los pequeños (II de 0-100).
- Los pesos no son opinables; AHP te da un método para asignarlos y verificar consistencia. CR < 0.1 es Saaty, no invento mío.
- TOPSIS da un coeficiente de cercanía C entre 0 y 1, no un ranking. Ese coeficiente te permite detectar empates (diferencia < 0.03 = empate técnico).

### AHP y el Consistency Ratio

AHP me dio la herramienta para calibrar 24 vectores de pesos (3 modos × 8 categorías). La parte no trivial fue: ¿cómo asigno pesos a "precio" vs. "II" en modo MYPE? Mi primera intuición fue 50/50. Pero AHP te obliga a hacer comparaciones pairwise ("¿precio es moderadamente más importante, fuertemente más importante, o extremadamente más importante que II?") y de ahí derivar los pesos. Llegué a 0.45/0.20 en modo MYPE (precio dominante) y 0.15/0.55 en modo Calidad (II dominante). CR dio 0 en ambos, lo cual es matemáticamente correcto porque derivé la matriz pairwise del vector de pesos, no al revés.

La trampa de AHP es que **CR = 0 no significa que los pesos sean correctos, solo que son consistentes**. Puedes tener pesos consistentes y equivocados. Esa lección es la que más me ha hecho pensar.

### TF-IDF como clasificador

TF-IDF lo conocía de retrieval de documentos. Usarlo como clasificador de intenciones fue una adaptación. La idea: cada categoría (redacción, documentos, programación, cálculos, offline, rápidas, multilingüe, agentes) tiene un "documento" virtual con ~30 palabras clave. La consulta del usuario se compara contra esos documentos virtuales y se elige la categoría con mayor score TF-IDF.

Esto es **determinista y rápido** (< 1 ms). La alternativa sería un LLM para clasificar la intención, pero eso añadiría latencia y costo. Para una MYPE en 3G desde un celular, 1 ms determinista vence a 500 ms con LLM.

---

## 🧑 Lo que aprendí sobre mí mismo

### Paciencia

El 5 de julio estuve a punto de abandonar. Eran las 3 AM, el motor devolvía rankings sin sentido, no encontraba el bug. Me fui a dormir. A las 9 AM, con la cabeza fría, lo encontré en 20 minutos. La lección: **dormir es parte del debugging**.

### Iteración

La primera versión del PRD era 1,800 líneas y "demasiado académica". La segunda era 2,584 líneas y ejecutable. La primera versión del motor tenía 7 criterios; la final tiene 8. La primera versión del glosario tenía 81 términos; la final tiene 176. **Nada salió bien a la primera.** Todo fue iteración. La idea de que un genio programa todo de una sentada es mito.

### No rendirse

Hubo tres momentos en los que pensé "esto no vale la pena". El primero fue el bug de las 3 AM. El segundo fue la semana 3, cuando parecía que el proyecto se había estancado. El tercero fue cuando el matching BenchLM dio solo 93/225. En los tres casos, una noche de sueño bastó para volver con energía. **La diferencia entre terminar y no terminar un proyecto no es talento, es terquedad.**

### Pedir ayuda (a las IAs)

Soy malo pidiendo ayuda a personas. Pero a las IAs les pedí todo. Les pregunté cosas tontas ("¿cómo se llama la función que divide dos números en JavaScript?"), cosas complejas ("¿cómo recalibro 24 vectores AHP manteniendo CR < 0.1?"), y cosas subjetivas ("¿esta frase suena alarmista?"). Las IAs no me juzgaron. Esa falta de juicio me permitió aprender más rápido.

### Aceptar mis límites

No soy diseñador. No soy experto en TypeScript. No soy experto en LLMs. Lo acepté desde el día 1. Por eso copié Linear + Stripe en vez de inventar. Por eso delegué a sub-agentes tareas que un experto haría mejor. Aceptar límites no es debilidad; es eficiencia.

---

## 🌍 Sobre el open source

Elegí MIT por tres razones.

**Primera: maximiza adopción.** Una MYPE no va a leer la licencia MIT. Pero si fuera GPL, su abogado (si tiene uno) le diría "ten cuidado, esto puede contaminar tu código". Si fuera comercial, no la usarían. MIT es la opción más simple y la menos intimidante.

**Segunda: por LatAm.** En Latinoamérica, el software libre tiene una tradición fuerte (GNU, Debian, gobiernos que promueven Linux). Dar algo gratis a la comunidad hispanohablante de desarrolladores me parece ético. Vivimos en una región donde el SaaS en dólares es caro. Si yo puedo ahorrarle $50/mes a una MYPE dándole una herramienta gratis, lo hago.

**Tercera: por la carrera.** Ingeniería Industrial me enseñó que el conocimiento debe circular. Cuando un proceso mejora, se documenta y se comparte. SelectIA es un proceso de decisión; documentarlo y abrirlo es la extensión natural.

No estoy en contra del software comercial. Si SelectIA crece y alguien quiere construir un SaaS encima, perfecto. El MIT lo permite. Lo que no quiero es que **mi trabajo encierre un conocimiento que podría ayudar a otros**.

---

## 🌎 Sobre el futuro de la IA en LatAm

Tengo tres reflexiones sobre esto.

**1. El acceso no es el problema; la decisión sí.**

En 2024, había 5 modelos de IA relevantes. En 2026, hay 206. La pregunta ya no es "¿tengo acceso a IA?" sino "¿a cuál IA accedo?". Las MYPEs peruanas tienen acceso a GPT-5.5, Claude, Gemini, Llama — todos. Lo que no tienen es tiempo para compararlos. Esa es la brecha que SelectIA cierra.

**2. El idioma importa.**

La mayoría de leaderboards están en inglés. Cuando un gerente peruano le pregunta a un modelo "¿cuánto cuesta un torno CNC?", no está haciendo una pregunta técnica compleja. Está probando si el modelo "entiende" su contexto. Y los modelos que mejor entienden español neutro no son los mismos que los que mejor responden en inglés. BenchLM me enseñó esto: hay modelos con score multilingual bajo que en inglés son excelentes. Para LatAm, multilingual es un criterio clave, no decorativo.

**3. El costo no es absoluto; es relativo al uso.**

Un modelo que cuesta $5 por millón de tokens es caro si haces 100 llamadas al mes. Es barato si haces 100,000. La calculadora de tokens de SelectIA existe precisamente para esto: traducir "tokens" a "soles" para que el gerente entienda el costo real en su contexto. La equivalencia en almuerzos/cafés/pintas/bus no es un chiste; es la forma en que un peruano entiende el valor del dinero.

---

## 🏭 Sobre el rol del ingeniero industrial

Hay un prejuicio en LatAm de que el ingeniero industrial "solo hace procesos físicos". Layout de planta, balance de línea, MRP, control estadístico de procesos. Eso es importante, pero no es todo.

El ingeniero industrial, en su esencia, **diseña procesos de decisión**. TOPSIS, AHP, análisis multi-criterio son herramientas para decidir. Y decidir es lo que hace una empresa: qué proveedor elegir, qué producto lanzar, qué modelo de IA contratar.

SelectIA es un proyecto de ingeniería industrial aunque no toque una fábrica. El "proceso" es la decisión de elegir un modelo de IA. Los "inputs" son los criterios. El "output" es la recomendación. El "control estadístico" es el Consistency Ratio de AHP. El "balance de línea" es la calibración de pesos.

Creo que la carrera tiene mucho que aportar al mundo del software. No como programadores (otros lo hacen mejor), sino como **diseñadores de procesos de decisión**. Ese es mi aporte.

---

## 🔁 Lo que haría diferente

Si empezara SelectIA de nuevo, cambiaría cinco cosas.

**1. Escribiría tests desde el día 1.**

No escribí tests. Confié en el `bun run lint` y el `npx tsc --noEmit`. Para v3.4, lo primero que voy a añadir es una suite de tests con Vitest para el motor HRE-TOPSIS. Específicamente: snapshots de rankings para las 24 combinaciones (3 modos × 8 categorías), y tests de regresión para cada bug que he encontrado.

**2. Diseñaría la UX antes que el código.**

Empecé por el código. Debería haber empezado por wireframes en Figma. Habría ahorrado iteraciones.

**3. Usaría un único archivo de tipos desde el inicio.**

`types.ts` lo refactoré 4 veces. Si lo hubiera diseñado bien la primera vez, habría ahorrado 2 días.

**4. Documentaría las decisiones a medida que las tomo.**

Mantuve un `worklog.md` pero lo empecé tarde. Las decisiones de la semana 1 las reconstruí de memoria en la semana 4. Para el próximo proyecto, abriré el worklog el día 1.

**5. Buscaría feedback externo antes.**

No le enseñé SelectIA a nadie hasta la semana 4. Debería haberlo mostrado desde la semana 2, aunque estuviera feo. El feedback temprano corrige errores baratos; el feedback tardío corrige errores caros.

---

## ✅ Lo que mantendría

Cinco cosas volvería a hacer igual.

**1. Usar 4 IAs en paralelo.**

Aunque el overhead fue alto (40% de mi tiempo), el cruce de respuestas encontró bugs que ninguna IA habría encontrado sola. Repetiría esa metodología.

**2. No usar framework de orquestación.**

La curva de aprendizaje no lo valía. Yo era el grafo manual, y eso me dio visibilidad total.

**3. Replicar Linear + Stripe.**

No inventar design system me ahorró tiempo y me dio un resultado profesional. Lo volvería a hacer.

**4. Empezar por el PRD.**

Dos días de PRD ahorraron dos semanas de código. Lo volvería a hacer.

**5. Publicar como MIT.**

No cambiaría la licencia. Maximiza adopción y alinea con mi ética.

---

## 👥 Mensaje a otros estudiantes

Si eres estudiante de ingeniería (industrial, sistemas, lo que sea) y estás leyendo esto, tres consejos:

**1. No esperes a "saber suficiente".**

Empecé SelectIA sin saber TypeScript a fondo. Lo aprendí construyendo. Si hubiera esperado a "saber suficiente", no habría empezado nunca. El conocimiento se construye haciendo, no leyendo.

**2. Usa las IAs como asistentes, no como sustitutos.**

Las IAs te dan código, pero tú decides qué código entra. Tú mantienes la coherencia. Tú eres el arquitecto. Si dejas que la IA decida todo, terminas con un proyecto sin voz propia.

**3. Termina lo que empiezas.**

El 80% de los proyectos mueren en el 80%. Lo difícil no es empezar, es terminar. Si llegas al 100%, ya eres minoría. Si lo publicas en GitHub con README, CHANGELOG y LICENSE, eres top 5%. SelectIA no es perfecto, pero está terminado. Eso vale.

---

## 💼 Mensaje a reclutadores

Si llegaste hasta aquí desde mi CV o LinkedIn, lo que busco con SelectIA:

**Profesionalmente:** una posición donde pueda aplicar pensamiento de ingeniería industrial a problemas de software y datos. No busco ser "programador senior" — hay mejores programadores que yo. Busco ser **el puente** entre el problema de negocio y la solución técnica. SelectIA es mi prueba de que puedo hacer ese puente: entendí un problema de negocio (MYPEs eligiendo mal modelo de IA), lo traduje a un modelo matemático (HRE-TOPSIS con 8 criterios), lo implementé técnicamente (Next.js 16 + TypeScript + 13 APIs), y lo documenté para que otros lo entiendan.

**Lo que ofrezco:**

- Capacidad de aprender herramientas nuevas en semanas (aprendí TypeScript en 2024, Next.js 16 en 2026).
- Mentalidad de procesos (topsis, AHP, control estadístico) aplicada a problemas técnicos.
- Comunicación clara (este documento y los 5 del repositorio son muestra).
- Orientación a terminar (SelectIA v3.3.1 está completo, no es PoC eterno).

**Lo que no ofrezco:**

- 10 años de experiencia como dev senior. Tengo lo que tengo.
- Conocimiento profundo de un stack específico. Aprendo rápido, pero no soy experto en ninguno.
- Disposición a "hacer lo que sea". Quiero trabajar en cosas que importen.

Si esto encaja con lo que buscas, mi correo está en mi CV. Si no encaja, gracias por leer hasta aquí.

---

## 🙏 Agradecimientos

Este proyecto no habría sido posible sin:

- **Las 4 IAs** — GLM-5.2, Claude Sonnet 4.6, Gemini 3.1 Pro, Minimax M3. Cada una aportó algo distinto. Detalle completo en `AGRADECIMIENTOS.md`.
- **Las 13 fuentes open** — Artificial Analysis, BenchLM, ZeroEval, Arena AI, LiteLLM, HuggingFace, OpenRouter, Open ER-API, Groq, Models.dev, Helicone, Aider, Ollama. Sin ellas, no hay datos.
- **La comunidad open source** — Next.js, Vercel, Tailwind, shadcn/ui, Recharts, Zustand, TanStack Query, Zod, Lucide. Sobre sus hombros construí.
- **Linear y Stripe** — por publicar sus design systems. Los repliqué con respeto.
- **Mi familia** — mi papá por inspirarme el problema, mi mamá por la paciencia de verme programar hasta tarde, mi hermano por las cenas que me traía cuando me olvidaba de comer.
- **Mis profesores de Ingeniería Industrial** — por enseñarme TOPSIS, AHP y la mentalidad de procesos. Sin ellos, SelectIA no sería lo que es.
- **Workday Research** — por el estudio de enero 2026 (3,200 líderes, 85% ahorra 1-7 hrs/semana, 40% se pierde en retrabajo) que validó mi intuición con data.
- **Las MYPEs peruanas** — por existir y por ser la razón de todo esto.

---

## Cierre

SelectIA v3.3.1 está terminado. Es un PoC, no un producto con usuarios reales. No afirma "95% de ahorro" porque no tengo data para afirmarlo. Lo que afirma es más modesto: **existen métodos matemáticos para decidir mejor, y aplicarlos a la elección de modelos de IA es posible y útil**.

Si esto te sirvió, úsalo. Si no, gracias por leer.

*José Jesús Alejandro Soria Vásquez*
*Chiclayo, Perú, 30 de julio de 2026.*
