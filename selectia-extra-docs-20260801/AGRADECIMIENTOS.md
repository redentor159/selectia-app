# 🙏 Agradecimientos — SelectIA

> **Créditos y agradecimientos** a personas, modelos, fuentes y comunidades que hicieron posible SelectIA v3.3.1.
>
> **Autor:** José Jesús Alejandro Soria Vásquez
> **Fecha:** 30 de julio de 2026
> **Versión:** v3.3.1
>
> Este documento es la bitácora de deudas intelectuales. Ningún proyecto se construye solo.

---

## 🤖 A las IAs que ayudaron

SelectIA no existiría sin la colaboración de cuatro modelos de IA que usé como asistentes de investigación entre el 24 de junio y el 30 de julio de 2026. No usé un framework de orquestación: yo era el "grafo" manual, copiando y pegando entre interfaces. Cada modelo aportó algo distinto y ninguno fue "el mejor" en todo.

### GLM-5.2 (Z.ai)

**Rol:** ingeniero de implementación.

**Lo que aportó:**
- La mayor parte del código TypeScript del proyecto (motor HRE-TOPSIS, orchestrator, vistas, store Zustand).
- Refinamiento del PRD v3.2 (de 1,800 a 2,584 líneas).
- Implementación de las 6 vistas iniciales en la semana 2.
- Implementación de los fetchers de BenchLM + ZeroEval en la semana 5.
- Iteración rápida en modo Agente Full Stack dentro de Z.ai Code.

**Fortaleza observada:** velocidad y voluntad de iterar. Si algo no funcionaba, GLM lo intentaba de otra forma sin esperar instrucciones detalladas.

**Debilidad observada:** a veces omitía detalles sutiles. Mezclaba `--bg` con `--bg-elevated` en tokens CSS, o usaba II de BenchLM en un lugar y II de AA en otro sin darse cuenta.

### Claude Sonnet 4.6 (Anthropic, en Antigravity)

**Rol:** editor, verificador y auditor.

**Lo que aportó:**
- Verificación de los 13 endpoints de APIs en Antigravity (documento `api_raw_schemas_detailed.md`, 705 líneas).
- Estructuración inicial del PRD (1,800 líneas, demasiado académico, pero base sólida).
- Design system: la propuesta de "Linear + Stripe" en vez de inventar uno propio.
- Auditoría del motor HRE-TOPSIS que encontró el bug del quality gate (modelos con `benchlmScoreConfidence === 1` no excluidos en modo Calidad).
- La solución matemática para añadir BenchLM + ZeroEval sin expandir la dimensionalidad del TOPSIS (mantener 8 criterios, reemplazar II genérico por II por categoría).

**Fortaleza observada:** precisión. Claude encontraba bugs que ni GLM ni yo veíamos, especialmente edge cases y inconsistencias sutiles.

**Debilidad observada:** conservador. A veces se negaba a hacer cambios por "riesgo de romper algo" cuando yo sabía que era necesario.

### Gemini 3.1 Pro (Google)

**Rol:** analista de contexto largo y crítico de fuentes.

**Lo que aportó:**
- Lista de fuentes que **no** usar (con justificación). Por ejemplo, marcó HuggingFace Open LLM Leaderboard como "semi-abandonado" desde mediados de 2025.
- Mención de **Models.dev** y **Aider leaderboards** que las otras IAs no mencionaron.
- Análisis de módulos largos (1,800+ líneas) para entenderlos de un solo vistazo.
- Thresholds para `failure_rate` (5%/15%) basados en literatura SRE.

**Fortaleza observada:** manejo de contextos largos. Leía archivos completos sin perder el hilo.

**Debilidad observada:** respuestas más lentas y a veces demasiado formales. Menos práctico para código.

### Minimax M3

**Rol:** redactor y crítico editorial.

**Lo que aportó:**
- Redacción en español neutro más natural que las otras IAs. Especialmente en strings UI, tooltips, errores.
- Mención de **Open ER-API** para tipos de cambio (las otras IAs la daban por sentada o no la mencionaban).
- Reescritura de frases sensibles. Ejemplo: "Este modelo falla el 10.7% de las veces" → "Confiabilidad de producción: 89.3% (basado en 169 llamadas monitoreadas por ZeroEval — 10.7% failure rate)".
- Crítica de decisiones ("¿estás seguro de que el piso de calidad debe ser II ≥ 30 y no 25?").

**Fortaleza observada:** español neutro LatAm. Voz editorial que cuestionaba en vez de solo responder.

**Debilidad observada:** menos hábil para código. Lo usaba solo para redacción y crítica.

### Una nota sobre la colaboración

No hubo framework de orquestación. Yo era el puente: copiaba respuestas de una interfaz a otra, las comparaba, decidía. Esto tomaba ~40% de mi tiempo (overhead de switching), pero me día visibilidad total. Cada decisión la tomaba yo, no un agente automático.

Más detalle en `CONVERSACIONES_INVESTIGACION.md` y `REFLEXIONES_PERSONALES.md`.

---

## 📊 A las fuentes de datos open

SelectIA compara 206 modelos de IA gracias a 13 fuentes de datos que son públicas, semi-públicas o freemium. A cada una, gracias.

### 1. Artificial Analysis

**URL:** `artificialanalysis.ai`

**Lo que aporta:** Intelligence Index (II), Coding Index, Agentic Index, Speed (tokens/s), TTFT, precios blended, headers de quota (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `X-AA-Tier`).

**Cobertura en SelectIA:** 206 modelos (es la fuente primaria).

**Agradecimiento específico:** por estandarizar II en una escala 0-100 que permite comparar modelos cruzados. Sin AA, no hay motor HRE-TOPSIS viable.

### 2. BenchLM

**URL:** `benchlm.ai`

**Lo que aporta:** 5 sub-endpoints (models, price-index, stats, pricing, leaderboard). 8 category scores (math, coding, agentic, knowledge, instruction following, multilingual, multimodal grounded, reasoning), displayScore, overallRank, confidence (1-3), trusted benchmark count, Función K (`supersededBy`), pricing per output dollar.

**Cobertura en SelectIA:** 87 modelos enriquecidos con 8 category scores.

**Agradecimiento específico:** por exponer 5 sub-endpoints públicos sin auth. Esto permitió integrar BenchLM sin costos.

### 3. ZeroEval

**URL:** `api.zeroeval.com/v1/models/metrics`

**Lo que aporta:** failure rate, P95 latency, average throughput, total calls monitoreados. Es decir, **reliability de producción real**, no benchmarks académicos.

**Cobertura en SelectIA:** 36 modelos con métricas de producción.

**Agradecimiento específico:** por ser la única fuente que mide "qué pasa cuando mandas prompts reales a este modelo". Sin ZeroEval, el motor recomendaría sin saber si el modelo falla.

### 4. Arena AI (Chatbot Arena)

**URL:** `api.wulong.dev`

**Lo que aporta:** Elo ratings, intervalo de confianza, número de votos. Solo modelos con ≥100 votos son fiables.

**Cobertura en SelectIA:** 30 modelos con Elo.

**Agradecimiento específico:** por ser la referencia de "preferencia humana". Elo complementa II (que es académico) con datos de uso real.

### 5. LiteLLM

**URL:** `raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json`

**Lo que aporta:** precios por millón de tokens (input, output, cache), `max_input_tokens` (context window), proveedor.

**Cobertura en SelectIA:** 219 modelos con precios y context window.

**Agradecimiento específico:** por mantener un JSON actualizado en GitHub raw. Sin LiteLLM, no habría forma de obtener precios de 200+ modelos sin tocar 50 APIs distintas.

### 6. HuggingFace Hub

**URL:** `huggingface.co/api/models/...`

**Lo que aporta:** downloads, likes, safetensors (tamaño en disco), spaces (cuántas apps lo usan), gated (si requiere aprobación).

**Cobertura en SelectIA:** 65 modelos con metadata completa (100% field coverage).

**Agradecimiento específico:** por ser el hogar de los modelos open. Sin HF, los modelos open-source no tendrían donde vivir.

### 7. OpenRouter

**URL:** `openrouter.ai/api/...`

**Lo que aporta:** status en vivo (up/down/degraded), precios actualizados, proveedores de inferencia disponibles.

**Cobertura en SelectIA:** status de 13+ modelos en tiempo real.

**Agradecimiento específico:** por ser el agregador de inferencia más limpio. Su status page es referencia.

### 8. Open ER-API

**URL:** `open.er-api.com/v6/latest/USD`

**Lo que aporta:** tipos de cambio de 21 monedas de América (PEN, USD, BRL, MXN, COP, CLP, ARS, CAD + 13 más) en una sola llamada.

**Cobertura en SelectIA:** 21 monedas actualizadas diariamente.

**Agradecimiento específico:** por ser gratuito, sin auth, sin rate limit abusivo. Permite a SelectIA mostrar precios en soles peruanos sin costo.

### 9. Groq

**URL:** `groq.com` (status page + API)

**Lo que aporta:** status de la API de Groq, modelos disponibles para inferencia.

**Cobertura en SelectIA:** health check de Groq.

**Agradecimiento específico:** por ser el proveedor de inferencia más rápido (LPU). Si un modelo corre en Groq, sabes que es lo más rápido disponible.

### 10. Models.dev

**URL:** `models.dev`

**Lo que aporta:** catálogo de modelos con metadata estandarizada (parámetros, licencia, context window).

**Cobertura en SelectIA:** catálogo de referencia.

**Agradecimiento específico:** por mantener un catálogo limpio y actualizado. Sirve como cross-validación de AA y LiteLLM.

### 11. Helicone

**URL:** `helicone.ai`

**Lo que aporta:** monitoring de LLMs en producción (latencia, costo, errores).

**Cobertura en SelectIA:** referencia de monitoring. No se integra directamente pero inspira la vista "Salud del Sistema".

**Agradecimiento específico:** por demostrar que el monitoring de LLMs es un problema real y digno de UI dedicada.

### 12. Aider Leaderboards

**URL:** `aider.chat/docs/leaderboards/`

**Lo que aporta:** benchmarks de código específicos (SWE-bench, etc.).

**Cobertura en SelectIA:** cross-validación de Coding Index.

**Agradecimiento específico:** por mantener benchmarks de código serios. Coding Index de AA es bueno, pero Aider le da profundidad.

### 13. Ollama

**URL:** `github.com/ollama/...` + `ollama.com`

**Lo que aporta:** catálogo de modelos locales que se pueden correr sin internet.

**Cobertura en SelectIA:** modelos offline.

**Agradecimiento específico:** por hacer trivial correr modelos locales. Si una MYPE no tiene internet estable (común en zonas rurales de LatAm), Ollama es la opción.

---

## 🌐 A la comunidad open source

SelectIA se construye sobre hombros de gigantes. Cada dependencia en `package.json` es un proyecto open source mantenido por personas que no conozco pero a las que debo mucho.

### Next.js

**Versión usada:** 16.1.3 (App Router, Turbopack).

**Por qué importa:** framework React full-stack. App Router + Server Components + Static Generation son la base. Sin Next.js, SelectIA no tendría la arquitectura de JSON estático + cron GitHub Actions + Vercel.

**Agradecimiento:** al equipo de Vercel y a la comunidad de contributors. Especialmente por mantener backwards compat en releases mayores.

### Vercel

**Versión usada:** free tier.

**Por qué importa:** hosting gratis, deploy automático desde GitHub, CDN global, serverless functions. SelectIA entero corre en free tier.

**Agradecimiento:** por hacer que "deploy a producción" sea un comando. Sin Vercel, el deploy sería una barrera técnica enorme.

### Tailwind CSS

**Versión usada:** 4.x.

**Por qué importa:** utilidades CSS para no escribir CSS. Tailwind 4 introduce el engine nativo (Rust-based) que es 10x más rápido.

**Agradecimiento:** a Adam Wathan y equipo. Tailwind cambió cómo pienso el CSS.

### shadcn/ui

**Estilo usado:** New York.

**Por qué importa:** componentes accesibles, customizables, sin lock-in. "Copia el código a tu repo, no es una dependencia".

**Agradecimiento:** a shadcn por la filosofía de "ownership del código". Es lo que hace que shadcn/ui sea distinto a Material UI o Chakra.

### Recharts

**Versión usada:** última estable.

**Por qué importa:** 6 charts (scatter, bar, radar, line, area, composed). Reactive, declarativo.

**Agradecimiento:** al equipo de Recharts. Es la dependencia más pesada del bundle pero la más útil.

### Zustand

**Versión usada:** 5.x.

**Por qué importa:** state management minimalista. Con middleware `persist`, guarda en localStorage sin boilerplate.

**Agradecimiento:** a Poimandres por mantener Zustand ligero y potente. Redux es overkill; Zustand es justo.

### TanStack Query

**Versión usada:** 5.x.

**Por qué importa:** cache de datos en cliente. `useQuery` con `staleTime` evita refetch innecesario.

**Agradecimiento:** a Tanner Linsley. TanStack Query es el estándar de server state en React.

### Zod

**Versión usada:** 4.0.2.

**Por qué importa:** validación de schemas en runtime. 6 schemas Zod validan las respuestas de BenchLM y ZeroEval.

**Agradecimiento:** a Colin McDonnell. Zod hizo que la validación de APIs externas sea declarativa.

### Lucide React

**Versión usada:** última.

**Por qué importa:** iconos SVG consistentes. 50+ iconos usados en SelectIA.

**Agradecimiento:** al equipo de Lucide. Iconos gratis, consistentes, accesibles.

### Otras dependencias

- `next-themes` (cambio de tema sin flash)
- `clsx` + `tailwind-merge` (composición de classes)
- `cmdk` (command palette)
- `sonner` (toasts)
- `next/font` (optimización de fuentes)
- `bun` (runtime y package manager)

A todas, gracias.

---

## 🎨 A referencias de diseño

### Linear

**URL:** `linear.app`

**Lo que se replicó:** tipografía Inter, paleta oscura profunda (#08090a base), hairline borders, "cristal tintado" badges con `rgba(0.10)` bg y `rgba(0.20)` border, motion easing, sistema de tokens.

**Agradecimiento específico:** por publicar su design system implícitamente (vía CSS inspectable). Linear es referente en B2B SaaS.

### Stripe

**URL:** `stripe.com`

**Lo que se replicó:** densidad de información (tablas con 20+ columnas legibles), shadow system multilayer con `rgba(50,50,93,...)`, sistemas de tabs y disclosure.

**Agradecimiento específico:** por demostrar que B2B no tiene que ser feo. Stripe Dashboard es master class de densidad + claridad.

### Otras inspiraciones

- **Vercel** — por la estética minimalista.
- **GitHub** — por el system de dark mode.
- **Notion** — por la sensación "limpia" sin bordes pesados.

---

## 🌎 A la comunidad peruana y latinoamericana

### A las MYPEs peruanas

Especialmente a las metalmecánicas de Chiclayo, Lambayeque, que me inspiraron el problema. La frase *"¿cómo sé cuál elegir? No tengo tiempo para investigar"* es real y es el origen de SelectIA.

Este proyecto es para ustedes. Si les sirve, úsenlo. Si no, díganme qué falta.

### A los ingenieros industriales del Perú

A mis profesores, que me enseñaron TOPSIS, AHP y la mentalidad de procesos. Especialmente a quien me dijo: *"la ingeniería industrial no es solo procesos físicos, es procesos de decisión"*.

### A la comunidad de desarrolladores LatAm

A los devs en español que comparten conocimiento en Discord, YouTube, blogs. A los que responden preguntas en Stack Overflow en español. A los que mantienen documentación traducida.

Especialmente a:
- **midudev** (YouTube) — por enseñar Next.js en español.
- **goncy** (Twitch) — por mostrar el día a día de un dev.
- Comunidad **React en Español** (Discord).

### A las comunidades open source en español

- **Python Perú**
- **JavaScript Perú**
- **Lima JS**
- **Buenos Aires Meetup**

A todas, gracias por crear espacio para aprender.

---

## 🛠️ A las plataformas

### Z.ai

**Lo que aportó:** acceso a GLM-5.2 en modo Agente Full Stack. La interfaz de Z.ai Code permitió iterar código rapidamente con el modelo.

**Agradecimiento específico:** por el tier free. Sin él, SelectIA habría costado dinero real en API calls.

### Antigravity

**Lo que aportó:** acceso a Claude Sonnet 4.6 con herramienta de "computer use". Permitió a Claude navegar documentación de APIs y capturar JSON reales.

**Agradecimiento específico:** por permitir verificación de endpoints sin que yo tuviera que hacer 200 llamadas `curl` manuales.

### Google AI Studio

**Lo que aportó:** acceso a Gemini 3.1 Pro con contexto largo (1M tokens).

**Agradecimiento específico:** por el contexto largo. Leer 1,800 líneas de código de un solo vistazo es algo que solo Gemini hace bien.

### Minimax Platform

**Lo que aportó:** acceso a Minimax M3.

**Agradecimiento específico:** por la calidad de redacción en español neutro. Minimax tiene una voz editorial propia.

### GitHub

**Lo que aportó:** repositorio público, GitHub Actions (cron diario), Issues, Pages.

**Agradecimiento específico:** por GitHub Actions free tier. El cron diario a las 2 AM Lima corre gratis.

### Vercel

**Lo que aportó:** hosting, CDN, serverless functions, deploy automático.

**Agradecimiento específico:** por el free tier generoso. SelectIA entero (con 13 fetchers + 4 serverless routes) corre gratis hasta 100K visitas/mes.

---

## 👨‍👩‍👦 A la familia y amigos

### A mi papá

Por inspirarme el problema. Tu taller de metalmecánica en Chiclayo es el origen de SelectIA. La frase "¿cómo sé cuál elegir?" me dio la pregunta de investigación. Tu forma de tomar decisiones con poca información me enseñó lo importante que es la decisión, no solo la información.

### A mi mamá

Por la paciencia. Por las cenas que me traías cuando me olvidaba de comer programando. Por no preguntar "¿cuándo vas a terminar?" cuando sabías que la respuesta era "pronto".

### A mi hermano

Por las cenas. Por escuchar mis explicaciones técnicas largas sobre TOPSIS sin entender nada pero asintiendo. Eso me ayudó a clarificar ideas.

### A mis amigos

A los que me aguantaron hablar de "modelos de IA" durante 5 semanas seguidas. A los que probaron el dashboard y me dieron feedback honesto. A los que no entendieron nada pero dijeron "se ve bonito".

### A mi pareja (si la tuve durante estas 5 semanas)

Por entender que "5 minutos más" significaba 3 horas. Por no quejarte cuando llegaba tarde.

### A mis profesores

A los que me enseñaron Ingeniería Industrial. TOPSIS, AHP, control estadístico, mejora continua. Sin esa formación, SelectIA no habría sido posible.

Especialmente al profesor que me dijo: *"la diferencia entre un buen ingeniero y un excelente ingeniero no es lo que sabe, es cómo decide con lo que sabe"*. Esa frase es el espíritu de SelectIA.

### A mis compañeros de carrera

A los que discutieron conmigo ideas en cafetería. A los que me preguntaron "¿y para qué sirve esto?" obligándome a clarificar. A los que me dijeron "hazlo, no lo pienses tanto" cuando dudaba.

---

## 📚 A las referencias académicas

### A Thomas L. Saaty

Por desarrollar AHP (Analytic Hierarchy Process) y el Consistency Ratio. Sin Saaty, no hay forma matemática de verificar que los pesos asignados a criterios son consistentes. Su libro *The Analytic Hierarchy Process* (1980) sigue siendo referencia.

### A C.L. Hwang y K. Yoon

Por desarrollar TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution) en 1981. Su libro *Multiple Attribute Decision Making* es la base teórica del motor HRE-TOPSIS.

### A Karen Spärck Jones

Por desarrollar TF-IDF en 1972. La capa 1 del motor (clasificación de intenciones) usa TF-IDF con stemming Porter en español. Sin Spärck Jones, no hay clasificación determinista <1ms.

### A Workday Research

Por el estudio de enero 2026 (3,200 líderes encuestados) que validó mi intuición con data real: 85% ahorra 1-7 horas semanales con IA, pero 40% se pierde en retrabajo por elegir mal. Sin ese número, SelectIA sería "un proyecto sin justificación empírica".

### A la comunidad SRE

Por los thresholds de reliability (99.9%, 99.5%, 99%). Los tiers de ZeroEval (>15% failure = alto riesgo, 5-15% = medio, ≤5% = confiable) están basados en práctica SRE.

---

## 🎓 A las personas que influenciaron mi pensamiento

### A personas que sigo y admiro

Sin nombrar a todos, agradezco a los creadores de contenido en español e inglés que me enseñaron sobre ingeniería de software, IA y diseño en los últimos dos años. Algunos los sigo desde 2024; otros los descubrí en 2026. A todos, gracias por compartir conocimiento públicamente.

### A la comunidad de ingeniería industrial

A los colegas que aplican métodos multi-criterio a problemas reales (selección de proveedores, localización de plantas, evaluación de proyectos). Su trabajo es la base teórica de lo que hago.

---

## 📖 A los libros y papers que leí

Lista no exhaustiva, pero los más influyentes:

- *The Analytic Hierarchy Process* — Thomas L. Saaty (1980).
- *Multiple Attribute Decision Making: Methods and Applications* — Hwang & Yoon (1981).
- *Designing Data-Intensive Applications* — Martin Kleppmann.
- *Refactoring UI* — Adam Wathan & Steve Schoger.
- *The Pragmatic Programmer* — Andy Hunt & Dave Thomas.
- Papers de Artificial Analysis sobre Intelligence Index (2025-2026).
- Paper de ZeroEval sobre métricas de producción (2026).
- Blog posts de Linear sobre su design system.
- Blog posts de Stripe sobre densidad de información.

---

## 🌟 A las personas que probaron SelectIA en beta

A las 3-4 personas (familia y amigos cercanos) que probaron el dashboard antes de publicarlo. Su feedback honesto ("no entiendo qué es TOPSIS", "el glosario es muy técnico", "los botones se ven pequeños en móvil") mejoró el producto.

### A los futuros contribuidores

Si llegaste hasta aquí y estás considerando contribuir al repositorio, gracias de antemano. Tu contribución (un bug report, un fix, una traducción, una feature nueva) es bienvenida.

Lee `CONTRIBUTING.md` para empezar. Abre un issue si tienes dudas. Sé respetuoso con los demás contribuidores.

---

## 🕯️ A las personas que me dijeron "no se puede"

A los que dijeron "no eres programador, ¿cómo vas a construir esto?". A los que dijeron "el mercado de IA ya está saturado". A los que dijeron "una MYPE no va a usar esto".

Cada "no se puede" me dio más razones para intentarlo. La incomprensión es combustible.

(No confundir con críticas constructivas. Esas también las recibí y las valoré. Me refiero al escepticismo gratuito, que tiene otra función: confirmar que vale la pena.)

---

## 🧉 Cierre — Invitación a contribuir

SelectIA es open source bajo licencia MIT. Esto significa que:

- ✅ Puedes usarlo libremente, incluso comercialmente.
- ✅ Puedes modificarlo.
- ✅ Puedes redistribuirlo.
- ✅ Puedes hacer un SaaS encima.
- ✅ Puedes aprender de él.

Lo único que pido es:

1. **Que mantengas el crédito** al autor original (el archivo `LICENSE` MIT lo exige).
2. **Que compartas mejoras** si las haces (pull request en GitHub).
3. **Que reportes bugs** si los encuentras (issue en GitHub).
4. **Que seas respetuoso** en las interacciones (código de conducta implícito).

### Cómo contribuir

- **Bug reports:** abre un issue con descripción, pasos para reproducir, ambiente.
- **Feature requests:** abre un issue describiendo el caso de uso.
- **Pull requests:** fork → branch → commit → PR. Sigue el formato de `CONTRIBUTING.md`.
- **Traducciones:** el proyecto está en español neutro. Si quieres traducirlo a portugués brasileño o inglés, abre un issue primero.
- **Divulgación:** si escribes sobre SelectIA en tu blog o redes, menciona el repo.

### Roadmap futuro

Para v3.4 y más allá:

- Suite de tests con Vitest para el motor HRE-TOPSIS.
- Sensitivity analysis formal (variación de pesos ±5%, ±10%).
- Integración de leaderboards académicos (SWE-bench, GPQA, MMLU-Pro).
- Estudio con usuarios reales MYPE (5-10 empresas, 2 semanas de uso).
- Dashboard de administrador (métricas de uso, feedback).
- API pública para que otros construyan encima.

Si alguno de estos te interesa, abre un issue diciendo "quiero ayudar con X".

---

## Última palabra

Construir SelectIA fue de lo más difícil y de lo más satisfactorio que he hecho en mi carrera hasta ahora. No es perfecto. Es un PoC. No tiene usuarios reales (todavía). Pero está terminado, documentado y publicado como MIT.

A todos los que hicieron posible que llegara hasta aquí: gracias.

A los que vendrán: bienvenidos.

*José Jesús Alejandro Soria Vásquez*
*Chiclayo, Perú, 30 de julio de 2026.*

---

**SelectIA v3.3.1** — Command Center de Modelos de IA para MYPEs latinoamericanas.
**Repositorio:** `github.com/redentor159/selectia`
**Licencia:** MIT.
**Live demo:** `selectia.vercel.app` (próximamente).
