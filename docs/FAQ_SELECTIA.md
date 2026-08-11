# SelectIA — Preguntas frecuentes (FAQ)

**Proyecto**: SelectIA v3.3.1 — Command Center de Modelos de IA para MYPEs latinoamericanas
**Autor**: José Jesús Alejandro Soria Vásquez — Ingeniería Industrial (Perú)
**Repo**: github.com/redentor159/selectia
**Licencia**: MIT
**Documento**: FAQ extenso con 47 preguntas, agrupadas en 6 categorías.

---

## Cómo leer este documento

- **6 categorías**, **47 preguntas en total**.
- Cada respuesta tiene entre 50 y 150 palabras.
- Las métricas que se mencionan son **verificables** (ver `METRICAS_VERIFICABLES.md` para los comandos).
- **No se afirma** "95 % de ahorro", "orquestación con framework", "producción en planta real" ni "usuarios activos".
- Cuando una pregunta se refiere a futuro, se marca con *[Roadmap]* y se remite a `ROADMAP_FUTURO.md`.

---

## Categoría 1 — Sobre el proyecto (10 preguntas)

### P1. ¿Qué es SelectIA?

SelectIA es un command center open source para elegir modelos de IA desde una sola pantalla. Reúne **206 modelos desde 13 fuentes de datos en vivo**, los normaliza a una canasta común de 8 criterios (precio, II, coding, agentic, speed, context, elo, reliability), y los rankea con un motor **HRE-TOPSIS** de cinco capas con pesos AHP pre-calibrados. Entrega una recomendación explicada en **menos de 10 milisegundos**. Está pensado para MYPEs latinoamericanas y se publica bajo licencia MIT.

### P2. ¿Por qué existe SelectIA?

Existe porque en LatAm la MYPE que quiere usar IA se enfrenta a tres barreras: precios en dólares sin contexto local, benchmarks académicos incompatibles entre sí (Artificial Analysis usa II, Arena usa Elo, BenchLM usa display score, ZeroEval reporta failure rate) y vocabulario técnico en inglés que excluye al dueño del taller. SelectIA resuelve las tres: normaliza precios a 21 monedas locales, integra 13 fuentes en una canasta común, y entrega un glosario en español con 176 términos.

### P3. ¿Para quién es SelectIA?

Para micro y pequeñas empresas latinoamericanas (entre 1 y 50 empleados) que quieren usar IA pero no tienen un equipo de ingeniería para evaluar modelos. Especialmente: talleres CNC, consultoras de traducción técnica, estudios de diseño industrial, startups agroindustriales, firmas contables, agencias de marketing y empresas de construcción. También para profesores y estudiantes de ingeniería que quieran un caso real para enseñar MCDM (Multi-Criteria Decision Making).

### P4. ¿Cuánto cuesta usar SelectIA?

SelectIA es software libre bajo licencia MIT. No tiene costo de licencia. El deploy corre en Vercel gratis. Para consumir los modelos recomendados, sí necesitas pagar las API de los proveedores (OpenAI, Anthropic, Google, etc.) — SelectIA no es un router ni un proxy, es un comparador y recomendador. El precio que muestra es informativo y se actualiza diariamente.

### P5. ¿Quién mantiene SelectIA?

Lo mantiene **José Jesús Alejandro Soria Vásquez**, estudiante de Ingeniería Industrial en Perú. El código es open source y acepta contribuciones externas vía GitHub (github.com/redentor159/selectia). No hay empresa detrás. No hay VC. No hay sponsors. Es un proyecto personal educativo y de portafolio.

### P6. ¿En qué se diferencia SelectIA de otros comparadores?

Tres diferencias concretas: (1) enfoque LatAm / MYPE, con 21 monedas de América y casos de uso industriales reales como IPERC y G-code CNC; (2) motor HRE-TOPSIS de 5 capas con AHP consistente (CR = 0) y 24 vectores de pesos pre-calibrados, lo que da explicabilidad real, no un ranking opaco; (3) glosario en español con 176 términos y 15 deepDives intercorrelacionados. Ningún otro comparador combina estas tres cosas.

### P7. ¿SelectIA es un producto comercial?

No. Es un proyecto open source MIT, educativo y de portafolio. No tiene modelo de negocio. No cobra por uso. No tiene plan premium. No vende datos. El autor no busca monetizarlo directamente; sí busca usarlo como pieza de portafolio y como base para colaboración con la comunidad MYPE y con academia.

### P8. ¿Qué versión es la actual?

La versión actual es **v3.3.1** (julio 2026). Esta versión resuelve 16 bugs — entre ellos la Función K invertida, el z-index del glosario, los outliers de speed (Mercury 2 = 872 tok/s), el cap de contexto (Gemini 2.0 = 1M tokens) y el piso de calidad II ≥ 30 en modo Calidad. El changelog completo está en `CHANGELOG.md` y los detalles técnicos en `BUGS_RESUELTOS.md`.

### P9. ¿SelectIA funciona offline?

Parcialmente. La primera carga requiere conexión (descarga el JSON maestro de 376 KB). Una vez cargado, el motor HRE-TOPSIS corre 100 % en el cliente, así que puedes cambiar filtros, modos y categorías sin red. La actualización del JSON (cron diario 2 AM Lima) requiere conexión. *[Roadmap]* una versión PWA con service worker y modo offline completo está planificada para Q1 2027.

### P10. ¿Cómo se pronuncia "SelectIA"?

Se pronuncia "se-lec-TÍ-a", con acento en la "i". El nombre viene de "Select IA" (selecciona IA), pero escrito como una sola palabra para que funcione como marca. La "IA" final mantiene el acento en la "i" porque en español las palabras agudas terminadas en vocal se acentúan.

---

## Categoría 2 — Sobre el motor (10 preguntas)

### P11. ¿Qué es HRE-TOPSIS?

HRE-TOPSIS son dos cosas pegadas. **HRE** = Hierarchical Restricted Evaluation: una jerarquía de restricciones blandas (pesos) y duras (umbrales) que se aplican antes del ranking. **TOPSIS** = Technique for Order of Preference by Similarity to Ideal Solution: un método MCDM clásico que rankea alternativas por su distancia Euclidiana al ideal positivo y al anti-ideal negativo. En SelectIA, HRE-TOPSIS se implementa en 5 capas: normalización, pesos AHP, distancias, restricciones y ranking con explicabilidad.

### P12. ¿Qué es AHP?

AHP = Analytic Hierarchy Process. Es un método de Thomas Saaty (1980) para obtener pesos de criterios por comparación pareada. Cada par de criterios se compara en escala 1-9, se arma una matriz, se calcula el vector de pesos (autovector principal) y se mide la consistencia con el Consistency Ratio (CR). En SelectIA, los 24 vectores AHP (3 modos × 8 categorías) tienen **CR = 0**, es decir, son perfectamente consistentes. La verificación está en `src/lib/engine/ahp-verification.ts`.

### P13. ¿Qué es TF-IDF y para qué se usa?

TF-IDF = Term Frequency – Inverse Document Frequency. Es una técnica clásica de recuperación de texto que mide cuán distintiva es una palabra en un conjunto de documentos. En SelectIA, TF-IDF con Porter stemmer en español mapea el lenguaje natural del usuario ("quiero un modelo barato para programar") a las 8 categorías internas (razonamiento, coding, agentic, etc.). Cada categoría tiene ~30 palabras representativas, con stemming para que "programa", "programar" y "programación" cuenten como la misma raíz.

### P14. ¿Por qué 8 criterios y no más?

Porque 8 cubre las dimensiones que el usuario MYPE realmente usa: **precio** (¿cuánto cuesta?), **II** (¿qué tan inteligente es?), **coding** (¿sirve para programar?), **agentic** (¿puede usar herramientas?), **speed** (¿qué tan rápido responde?), **context** (¿cuánto contexto acepta?), **elo** (¿qué tan bien le va en batallas humanas?), **reliability** (¿qué tan confiable es en producción?). El octavo criterio, reliability, se añadió en v3.3.1 con datos de ZeroEval (failure rate, P95 latencia). Más criterios aumentaría el costo cognitivo sin valor real para la MYPE.

### P15. ¿Qué es el Consistency Ratio y por qué importa?

El Consistency Ratio (CR) mide cuán coherente es una matriz de comparación pareada AHP. Si A es mejor que B, y B es mejor que C, entonces A debe ser mejor que C. Si no, hay inconsistencia. Saaty recomienda CR ≤ 0.10. En SelectIA, los 24 vectores AHP tienen **CR = 0**, lo que significa que las matrices son perfectamente consistentes (fueron construidas de forma deliberada, no derivadas de encuestas). Esto garantiza que los pesos son matemáticamente defendibles.

### P16. ¿Qué es el "piso de calidad II ≥ 30"?

Es una restricción dura del modo Calidad: cualquier modelo cuyo Intelligence Index (según Artificial Analysis) sea menor a 30 se descarta, sin importar cuán barato sea. Se introdujo en v3.3.1 (BUG-14) porque el motor anterior recomendaba modelos extremadamente baratos pero con II bajísimo, lo que generaba recomendaciones inútiles. Con el piso de calidad, el modo Calidad entrega modelos que sí sirven para tareas exigentes.

### P17. ¿Qué es la Función K?

La Función K es una pieza del motor que etiqueta cada modelo con su **ciclo de vida**: "Vigente" (es la versión canónica actual) o "Reemplazado por X" (fue suplantado por otro modelo). Se basa en el campo `supersedesModelKey` de BenchLM. En v3.3.1 (BUG-01) se corrigió un bug donde la función estaba invertida: decía "Vigente" cuando debía decir "Reemplazado", y viceversa. Es clave para no recomendar modelos obsoletos.

### P18. ¿Qué es la Función L?

La Función L es un set de 8 mini-badges que muestran la cobertura de cada modelo en las 8 categorías BenchLM (math, coding, reasoning, etc.). Un modelo con cobertura en las 8 categorías se considera "generalista"; uno con cobertura en 2-3 categorías es "especialista". Esto se ve en la vista Salud del Sistema y en la Ficha Técnica. Es una forma rápida de entender el perfil del modelo sin leer todo el JSON.

### P19. ¿Por qué la latencia es tan baja (< 10 ms)?

Porque todo el cómputo ocurre en el cliente. El JSON maestro de 376 KB se descarga una vez al cargar la página, y a partir de ahí el motor HRE-TOPSIS corre en JavaScript sobre los datos ya en memoria. No hay llamada a servidor por recomendación. Medición con `performance.now()` en 10 consultas: promedio 0.5 ms, máximo 3 ms. El límite superior de 10 ms es un techo conservador.

### P20. ¿Qué modos de uso hay?

Tres modos, cada uno con 8 vectores AHP (uno por categoría):

- **Ahorro**: maximiza precio. Ideal para MYPEs con presupuesto ajustado.
- **Equilibrado**: pesos parejos. Buen punto de partida.
- **Calidad**: maximiza II, coding, agentic y reliability, con piso II ≥ 30. Para tareas exigentes.

3 modos × 8 categorías = 24 vectores AHP. Cada vector es perfectamente consistente (CR = 0).

---

## Categoría 3 — Sobre los datos (8 preguntas)

### P21. ¿De dónde vienen los datos?

De **13 fuentes de datos en vivo**:

1. Artificial Analysis — Intelligence Index (II), velocidad, contexto.
2. BenchLM — display score por categoría, ciclo de vida (Función K).
3. ZeroEval — failure rate, P95 latencia, total llamadas.
4. Arena AI (lmarena) — Elo humano por batalla.
5. LiteLLM — catálogo de modelos, precios API.
6. HuggingFace Hub — modelos open source, descargas, likes.
7. OpenRouter — disponibilidad y ruteo multi-provider.
8. Open ER-API — tipos de cambio en vivo.
9. Groq — catálogo de modelos en Groq.
10. Models.dev — catálogo extendido.
11. Helicone — observabilidad, latencia real.
12. Aider — polyglot benchmark de coding.
13. Ollama — modelos corribles en local.

### P22. ¿Cada cuánto se actualizan?

Una vez al día, a las **2 AM hora de Lima**, vía un cron job en GitHub Actions. El workflow descarga las 13 fuentes, normaliza, arma el JSON maestro (376 KB), y hace commit al repo. Vercel despliega automáticamente. La razón de un solo refresco diario es que la mayoría de las fuentes (benchmarks, precios API) no cambian significativamente en menos de 24 horas, y un refresco más frecuente saturaría las APIs gratuitas.

### P23. ¿Qué pasa si una API falla?

El workflow del cron tiene tolerancia a fallos: si una de las 13 fuentes no responde, se conserva el último snapshot válido de esa fuente y se marca como "yellow" en la vista Salud del Sistema. Si la fuente se recupera al día siguiente, se refresca. Si una fuente falla tres días seguidos, se abre un issue automático. La UI nunca se rompe por un fallo de API — siempre hay datos, aunque puedan estar ligeramente desactualizados.

### P24. ¿Cómo se normalizan los precios?

Los precios crudos vienen en USD por millón de tokens (input/output). SelectIA los convierte a 21 monedas de América usando el tipo de cambio de Open ER-API. La conversión se hace en tiempo de carga del JSON. Para cada modelo se calcula además un "precio blended" (mezcla input/output al 50/50) que es el que se usa en el ranking HRE-TOPSIS. En modo Calidad, los modelos FREE se tratan como su precio API real (no como cero), para evitar sesgos.

### P25. ¿Los datos son 100 % precisos?

No. Son lo mejor disponible al momento del snapshot, pero tienen limitaciones: (1) algunos benchmarks son auto-reportados por los labs (Anthropic reporta II a Artificial Analysis; Google reporta coding a Aider); (2) el failure rate de ZeroEval es una muestra, no la población; (3) el Elo de Arena depende de quién participe en las batallas. SelectIA no promete precisión, promete comparabilidad: todos los modelos se miden con la misma canasta.

### P26. ¿Cómo se manejan los outliers?

Con **caps explícitos** en la normalización:

- **Speed**: cap en 500 tok/s (introducido porque Mercury 2 reportaba 872 tok/s, lo que distorsionaba la normalización).
- **Context**: cap en 256 K tokens (introducido porque Gemini 2.0 reportaba 1M tokens).
- **Precio MYPE**: tope de 1 USD por millón de tokens en modo Ahorro (modelos más caros se descartan en ese modo).

Los caps están documentados en `DECISIONES_DISENIO.md` y se introdujeron como fixes de bugs en v3.3.1.

### P27. ¿Qué es el "JSON maestro"?

Es un único archivo JSON de 376 KB (`public/data/master_dashboard_data.json`) que contiene todos los datos pre-procesados: modelos, métricas normalizadas, tipos de cambio, glosario, AHP, BenchLM stats. La app lo descarga una vez al cargar, y a partir de ahí todo el cómputo es cliente-side. Es el fruto del cron diario y la pieza central de la arquitectura "JSON estático + cron job" (ver ADR-006 en `DECISIONES_DISENIO.md`).

### P28. ¿Puedo usar mis propias fuentes?

*[Roadmap]* Sí, en el roadmap de v3.5 (Q4 2026) se planea una API pública documentada que permitirá alimentar SelectIA con fuentes propias (por ejemplo, precios internos de una empresa, benchmarks internos). Por ahora, para añadir una fuente nueva hay que modificar el script de cron (`scripts/generate-static-json.ts`) y abrir un PR.

---

## Categoría 4 — Sobre el uso (8 preguntas)

### P29. ¿Cómo uso SelectIA paso a paso?

1. Abre la app (deploy en Vercel o clona el repo y corre `bun dev`).
2. En el sidebar, elige una **categoría** (razonamiento, coding, agentic, etc.).
3. Elige un **modo** (Ahorro, Equilibrado, Calidad).
4. Elige una **moneda** (21 disponibles: PEN, USD, BRL, MXN, COP, CLP, ARS, CAD + 13 más).
5. Opcionalmente, ajusta filtros (precio máximo, II mínimo, context mínimo, etc.).
6. Click en **Recomendar**. El motor corre en < 10 ms.
7. Revisa el ganador, los finalistas y el perfil explicable de 8 criterios.
8. Si necesitas contexto técnico, abre el **glosario** (176 términos, 15 deepDives).

### P30. ¿Necesito API keys?

No para usar SelectIA mismo. La app es solo un comparador y recomendador; no consume modelos, solo los compara. Para **ejecutar** el modelo recomendado en tu propia app, necesitas las API keys del proveedor correspondiente (OpenAI, Anthropic, Google, etc.). SelectIA muestra en la Ficha Técnica qué proveedores ofrecen cada modelo y links a su documentación.

### P31. ¿Funciona en celular?

Sí, está diseñado mobile-first. Todas las vistas se adaptan a 375 px de ancho. El sidebar se convierte en drawer, las tablas hacen scroll horizontal, los gráficos se redimensionan. Hay capturas de mobile en `screenshots/verify-mobile.png` y `verify-mobile-375.png`. *[Roadmap]* una versión PWA con notificaciones push está planificada para Q1 2027.

### P32. ¿Puedo exportar las recomendaciones?

Actualmente puedes copiar el JSON de la recomendación con un botón en la Ficha Técnica. *[Roadmap]* exportación a PDF, CSV y Markdown está planificada para v3.4 (Q3 2026). Mientras tanto, la forma más simple es screenshot.

### P33. ¿Cómo se compara con usar ChatGPT directamente?

ChatGPT es un solo modelo (GPT-4o o el que toque). SelectIA no reemplaza a ChatGPT; te ayuda a **elegir** qué modelo usar para cada tarea. Una vez que SelectIA te recomienda, digamos, "Claude 3.5 Sonnet para tu tarea de coding", abres Claude o tu cliente favorito y usas ese modelo. SelectIA es el paso previo, no el sustituto.

### P34. ¿Sirve para modelos locales (Ollama)?

Sí. Una de las 13 fuentes es **Ollama**, que aporta el catálogo de modelos corribles en local. Estos modelos tienen precio cero (asumiendo que ya tienes el hardware), lo que los hace ideales para el modo Ahorro. La Ficha Técnica muestra cuánta VRAM requieren, lo que ayuda a decidir si tu máquina los puede correr.

### P35. ¿Qué casos de uso industriales tiene?

Cuatro casos documentados:

1. **IPERC** (matriz de riesgo peruana SUNAT) para taller CNC.
2. **G-code** (programación CNC para torno y fresadora).
3. **Manual técnico** de 300 páginas en español neutro.
4. **Cotización y traducción técnica** ES ⇄ EN.

Ver `CASOS_USO_MYPE.md` para 8 casos detallados paso a paso, con nombres hipotéticos, números reales y modelos recomendados.

### P36. ¿Puedo contribuir con un caso de uso?

Sí, por favor. Abre un issue en GitHub con etiqueta "case study" describiendo: tu MYPE, el problema, el modelo que SelectIA recomendó, y cómo te fue. Si es reproducible, lo incorporaremos a `CASOS_USO_MYPE.md` con atribución.

---

## Categoría 5 — Sobre open source (6 preguntas)

### P37. ¿Bajo qué licencia se publica?

**MIT**. Es la licencia más permisiva del ecosistema open source: permite uso comercial, modificación, distribución y uso privado, con la única condición de mantener el aviso de copyright y la licencia. No hay cláusula de "copyleft" (como GPL) ni restricciones sobre modelos de negocio derivados. El archivo `LICENSE` en la raíz del repo contiene el texto completo.

### P38. ¿Cómo contribuyo?

1. Fork el repo (github.com/redentor159/selectia).
2. Lee `CONTRIBUTING.md` y `ARCHITECTURE.md`.
3. Busca issues con etiqueta "good first issue" para empezar.
4. Abre un PR con tests si aplica.
5. Espera review. Tiempo objetivo de respuesta: 72 horas.

Áreas donde se necesita ayuda: integración de nuevas fuentes, traducción del glosario a portugués, casos de uso en países específicos, y cobertura de tests.

### P39. ¿Puedo hacer fork y monetizarlo?

Sí, la licencia MIT lo permite. Puedes hacer fork, modificar, cerrar el código de tus modificaciones y venderlo como SaaS. Lo único que debes mantener es el aviso de copyright y la licencia MIT originales en tu distribución. Si lo haces, te agradecería un aviso (no es obligatorio, pero construye comunidad).

### P40. ¿Puedo usar SelectIA internamente en mi empresa?

Sí. MIT permite uso comercial e interno sin restricciones. Puedes desplegarlo en tu propio Vercel, en tu propio servidor, o incluso self-hostearlo con Docker *[Roadmap] Q4 2027 para la versión self-hosted con Docker completa*. Si necesitas integración con sistemas internos (SSO, ERP), la arquitectura de Next.js 16 lo facilita.

### P41. ¿Quién es el dueño del código?

El copyright lo tiene José Jesús Alejandro Soria Vásquez. La licencia MIT cede derechos de uso a quien reciba el código, pero el copyright permanece con el autor. Esto es estándar en proyectos open source personales.

### P42. ¿Aceptan sponsors?

No activamente. El proyecto cuesta poco (Vercel free, GitHub free, Open ER-API free, las fuentes de benchmarks free). Si el tráfico creciera mucho, se aceptarían sponsors para cubrir costos de hosting, pero no hay modelo de sponsorship formal.

---

## Categoría 6 — Sobre el autor (5 preguntas)

### P43. ¿Quién es el autor?

**José Jesús Alejandro Soria Vásquez**, estudiante de Ingeniería Industrial en Perú. Su nicho industrial es CNC, metalmecánica y MYPE peruana. Construyó SelectIA como proyecto de portafolio para combinar tres intereses: investigación de modelos de IA, diseño de sistemas de decisión multicriterio, y casos de uso industriales reales en LatAm. Contacto: placeholder para email (ver `PRESS_KIT.md`).

### P44. ¿Qué estudia el autor?

Ingeniería Industrial, con énfasis en procesos productivos, mantenimiento, y gestión de operaciones. Su experiencia práctica incluye taller CNC (programación G-code, IPERC, cotización), trato con SUNAT, y atención a MYPEs peruanas. SelectIA es la intersección de su formación industrial con su interés autodidacta en IA y desarrollo web.

### P45. ¿Qué busca el autor con SelectIA?

Tres cosas:

1. **Aprender en público**. Construir algo completo y útil, no un tutorial más.
2. **Abrir puerta laboral**. Mostrar a reclutadores técnicos que puede llevar un proyecto real de principio a fin: diseño, código, datos, doc, deploy.
3. **Servir a la MYPE**. Si una sola MYPE ahorra una hora a la semana gracias a SelectIA, ya valió la pena.

No busca levantar capital. No busca fundar startup. No busca monetizar.

### P46. ¿Es el autor ingeniero de software?

No por formación. Es ingeniero industrial. Aprendió desarrollo web de forma autodidacta, con la guía de Cursor, Claude y la documentación oficial de Next.js, TypeScript, Tailwind y shadcn/ui. El código de SelectIA no es perfecto, pero sigue buenas prácticas (TypeScript strict, Zod para validación, TanStack Query para estado servidor, Zustand para estado cliente, linting con ESLint).

### P47. ¿Cómo contacto al autor?

Por ahora, las vías son:

- **GitHub**: abrir issue en github.com/redentor159/selectia.
- **LinkedIn**: búsqueda por nombre (placeholder para URL).
- **Email**: placeholder para email (ver `PRESS_KIT.md`).

Responde en 72 horas hábiles. Para temas de contribución técnica, preferir issue en GitHub sobre mensaje directo.

---

## Apéndice — Mapa rápido de preguntas por categoría

| Categoría | Rango | Cantidad |
|---|---|---|
| Sobre el proyecto | P1 – P10 | 10 |
| Sobre el motor | P11 – P20 | 10 |
| Sobre los datos | P21 – P28 | 8 |
| Sobre el uso | P29 – P36 | 8 |
| Sobre open source | P37 – P42 | 6 |
| Sobre el autor | P43 – P47 | 5 |
| **Total** | | **47 preguntas** |

## Documentos relacionados

- `PITCH_DECK.md` — pitch deck de 12 slides + 3 elevators pitches.
- `DECISIONES_DISENIO.md` — 20 ADRs de decisiones de diseño.
- `BUGS_RESUELTOS.md` — 16 bugs resueltos en v3.3.1 con causa raíz.
- `CASOS_USO_MYPE.md` — 8 casos de uso para MYPEs LatAm.
- `COMPARATIVA_COMPETIDORES.md` — análisis honesto de 9 herramientas similares.
- `ROADMAP_FUTURO.md` — roadmap a 12 meses (v3.4 a v5.0).
- `PRESS_KIT.md` — kit de prensa listo para medios.
- `CARTA_RECLUTADORES.md` — guía para presentar el proyecto a reclutadores.
- `METRICAS_VERIFICABLES.md` — documento maestro de métricas verificables.

## Cierre

Este FAQ se actualizará conforme evolucione el proyecto. Si tienes una pregunta que no está aquí, abre un issue con etiqueta "question" en el repo. Las preguntas frecuentes se incorporarán a este documento en cada release menor (v3.4, v3.5, etc.).

— *Fin del documento.*
