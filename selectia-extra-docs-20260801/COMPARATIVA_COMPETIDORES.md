# SelectIA — Comparativa con otras herramientas

**Proyecto**: SelectIA v3.3.1 — Command Center de Modelos de IA para MYPEs latinoamericanas
**Autor**: José Jesús Alejandro Soria Vásquez — Ingeniería Industrial (Perú)
**Repo**: github.com/redentor159/selectia
**Licencia**: MIT
**Documento**: Análisis honesto de herramientas similares (comparadores, routers, benchmarks) y posicionamiento de SelectIA.

---

## Cómo leer este documento

- **Disclaimer inicial obligatorio**: SelectIA **no busca competir comercialmente**. Es un proyecto open source educativo y de portafolio. Este documento existe para **posicionar** SelectIA en el ecosistema y mostrar diferenciadores, no para desplazar a otras herramientas.
- Cada herramienta se describe con: **qué es**, **para quién es**, **fortalezas**, **debilidades**, **comparación con SelectIA**.
- La comparación es **honesta**: si otra herramienta hace mejor algo que SelectIA, se dice.
- Las herramientas mencionadas son las que existen al momento de escribir (julio 2026).

---

## Disclaimer

SelectIA es un proyecto personal educativo, no un producto comercial. No busca reemplazar ni competir con Artificial Analysis, Chatbot Arena, OpenRouter, LiteLLM, Vellum, Helicone, ZeroEval, BenchLM ni ninguna otra herramienta mencionada en este documento. De hecho, SelectIA **consume datos** de varias de ellas (Artificial Analysis, BenchLM, ZeroEval, Helicone, LiteLLM, OpenRouter) y les debe gran parte de su valor.

El objetivo de este documento es ayudar al lector (potencial usuario, contribuidor o reclutador) a entender **dónde encaja SelectIA** en el ecosistema. No es un documento de marketing competitivo.

---

## Categoría 1 — Comparadores de modelos de IA

### Artificial Analysis (artificialanalysis.ai)

**Qué es**: El comparador de modelos de IA más conocido. Muestra tablas con precios, Intelligence Index (II), velocidad, contexto. Fundado por Sam McNeill.

**Para quién es**: Equipos técnicos que toman decisiones de infraestructura. Startups que eligen su primer modelo. Investigadores que comparan state-of-the-art.

**Fortalezas**:
- Datos muy actualizados (varias veces por semana).
- Intelligence Index (II) es una métrica propia consolidada, respetada en la industria.
- Visualizaciones claras (scatter plots precio vs calidad).
- Newsletter y análisis periódicos de alta calidad.

**Debilidades**:
- Solo en inglés.
- Sin explicabilidad del ranking: muestra datos, pero no dice "este modelo es mejor para tu caso".
- Sin soporte multi-moneda.
- Sin glosario ni material educativo.
- Sin casos de uso industriales (es genérico, no por sector).

**Comparación con SelectIA**:
- AA es fuente de datos de SelectIA (II y algunos precios).
- SelectIA añade: ranking HRE-TOPSIS con pesos AHP explicables, glosario en español, 21 monedas, casos de uso industriales (IPERC, G-code).
- SelectIA no tiene la profundidad analítica de AA (newsletter, deep dives mensuales).
- **Veredicto**: SelectIA complementa AA, no lo reemplaza. Si quieres números frescos, vas a AA. Si quieres una recomendación accionable para tu MYPE, vas a SelectIA.

---

### Chatbot Arena (lmarena.ai)

**Qué es**: Plataforma de LMSYS (UC Berkeley) donde los usuarios comparan dos modelos anónimos en batalla, votan, y se calcula un Elo humano. Es el benchmark más respetado para "qué modelo prefiere la gente".

**Para quién es**: Investigadores, equipos de producto que valoran preferencia humana por encima de benchmarks académicos.

**Fortalezas**:
- Elo basado en preferencia humana real (no auto-reportado).
- Cientos de miles de batallas acumuladas.
- Categorías por idioma, por tipo de tarea (coding, matemática, etc.).
- Open data: puedes descargar el dataset.

**Debilidades**:
- Sin ranking por caso de uso (solo por categoría amplia).
- Sin precios ni disponibilidad.
- Sin glosario, sin multi-moneda, sin casos industriales.
- Elo tiene sesgos (quién participa en Arena no es representativo del usuario promedio).

**Comparación con SelectIA**:
- Arena es fuente de datos de SelectIA (Elo humano).
- SelectIA añade: integración con 12 fuentes más, ranking HRE-TOPSIS con explicabilidad, casos LatAm.
- SelectIA no tiene la base de datos de batallas de Arena.
- **Veredicto**: complementarios. Arena para preferencia humana cruda, SelectIA para recomendación accionable.

---

### Vellum AI

**Qué es**: Plataforma empresarial para evaluar, comparar y monitorear modelos de IA en producción. Incluye prompt engineering, evaluaciones automatizadas, A/B testing, observabilidad.

**Para quién es**: Equipos de producto con presupuesto, en empresas medianas a grandes. Principalmente US/EU.

**Fortalezas**:
- Suite completa (eval + prompt + observability).
- Integración con 40+ proveedores de LLM.
- UI profesional para equipos.
- Soporte de empresa (SLA, onboarding).

**Debilidades**:
- **Caro** (precios enterprise, no publicados, típicamente > USD 1,000/mes).
- **Cerrado** (no open source).
- En inglés.
- Sin enfoque MYPE ni LatAm.
- Requiere equipo técnico dedicado.

**Comparación con SelectIA**:
- Venn muy diferente. Vellum es para equipos de producto con presupuestos; SelectIA es para MYPEs LatAm sin equipo técnico.
- SelectIA no tiene evaluaciones automatizadas en producción ni prompt engineering colaborativo.
- SelectIA es gratis y open source; Vellum es pago y cerrado.
- **Veredicto**: no compiten. Vellum está un nivel arriba en sofisticación pero varios niveles arriba en costo. SelectIA no busca ese segmento.

---

### Helicone

**Qué es**: Plataforma de observabilidad para LLMs. Monitorea llamadas a API de LLMs, da métricas de latencia, costo, tasa de error, y permite reemplazar el endpoint del LLM por un proxy propio.

**Para quién es**: Equipos técnicos que ya usan LLMs en producción y quieren observabilidad.

**Fortalezas**:
- Proxy transparente (drop-in replacement).
- Métricas precisas de producción (latencia real, costo real, errores reales).
- Open source (puedes self-hostear).
- Free tier generoso.

**Debilidades**:
- Es observabilidad, no comparación. No rankea modelos ni recomienda.
- Requiere que ya estés usando LLMs (no te ayuda a elegir).
- Sin multi-moneda, sin glosario, sin casos industriales.

**Comparación con SelectIA**:
- Helicone es fuente de datos de SelectIA (latencia real).
- SelectIA añade ranking y recomendación; Helicone añade observabilidad posterior.
- **Veredicto**: complementarios. SelectIA para elegir, Helicone para monitorear.

---

### Comparación general Categoría 1

| Característica | Artificial Analysis | Chatbot Arena | Vellum | Helicone | **SelectIA** |
|---|---|---|---|---|---|
| Ranking de modelos | Sí (tabular) | Sí (Elo) | Sí (custom evals) | No | Sí (HRE-TOPSIS + AHP) |
| Explicabilidad del ranking | Baja | Baja | Alta | N/A | Alta (5 capas) |
| Multi-moneda | No | No | No | No | Sí (21) |
| Glosario | No | No | No | No | Sí (176 términos, 15 deepDives) |
| Casos industriales | No | No | No | No | Sí (IPERC, G-code) |
| Idioma | EN | EN | EN | EN | ES LatAm |
| Open source | No | No (sí datos) | No | Sí | Sí (MIT) |
| Precio | Free | Free | Caro | Freemium | Free |
| Foco LatAm/MYPE | No | No | No | No | Sí |

---

## Categoría 2 — Routers de IA

### OpenRouter

**Qué es**: API unificada que permite acceder a cientos de modelos de IA con una sola API key y un solo endpoint. Maneja billing, fallback, y enrutamiento.

**Para quién es**: Desarrolladores que quieren integrar múltiples LLMs sin gestionar N providers.

**Fortalezas**:
- Catálogo enorme (mismos modelos que OpenAI, Anthropic, Google, más open source).
- Una sola API key, una sola factura.
- Fallback automático entre modelos.
- Precios a menudo mejores que yendo directo al provider.
- Libre de vendor lock-in.

**Debilidades**:
- No rankea ni recomienda. Te da el catálogo, tú eliges.
- Sin multi-moneda (todo en USD).
- Sin glosario ni casos de uso.
- En inglés.

**Comparación con SelectIA**:
- OpenRouter es fuente de datos de SelectIA (catálogo + precios).
- SelectIA te dice **qué** modelo usar; OpenRouter te da **cómo** usarlo.
- **Veredicto**: perfectamente complementarios. SelectIA recomienda → OpenRouter ejecuta.

---

### LiteLLM

**Qué es**: Librería open source (Python + JS) que estandariza la API de 100+ LLMs al formato OpenAI. Permite escribir código una vez y cambiar de provider sin tocar código.

**Para quién es**: Desarrolladores que quieren portabilidad entre providers.

**Fortalezas**:
- Open source (MIT).
- Catálogo enorme, muy actualizado.
- Compatible con OpenAI SDK.
- Proxy server opcional para gestión centralizada.
- Comunidad grande.

**Debilidades**:
- Es una librería, no un producto. Requiere integración código.
- No rankea ni recomienda.
- Sin multi-moneda, sin glosario, sin UI.

**Comparación con SelectIA**:
- LiteLLM es fuente de datos de SelectIA (catálogo + precios).
- SelectIA no compite con LiteLLM: son capas distintas.
- **Veredicto**: complementarios. SelectIA usa datos de LiteLLM; los usuarios de SelectIA pueden usar LiteLLM para ejecutar lo recomendado.

---

### Comparación general Categoría 2

| Característica | OpenRouter | LiteLLM | **SelectIA** |
|---|---|---|---|
| Función principal | Router de API | Librería de abstracción | Comparador + recomendador |
| Catálogo | Enorme | Enorme | 206 modelos |
| Ranking / recomendación | No | No | Sí (HRE-TOPSIS) |
| Multi-moneda | No | No | Sí (21) |
| UI | Sí (básica) | No | Sí (4 temas) |
| Glosario | No | No | Sí |
| Open source | No | Sí (MIT) | Sí (MIT) |
| Latencia | N/A (runtime) | N/A (lib) | < 10 ms por recomendación |

---

## Categoría 3 — Benchmarks académicos

### ZeroEval

**Qué es**: Plataforma que mide confiabilidad de modelos en producción. Reporta failure rate, P95 de latencia, total de llamadas, basado en datos reales de usuarios que reportan su uso.

**Para quién es**: Equipos que valoran confiabilidad operacional por encima de benchmarks académicos.

**Fortalezas**:
- Datos de producción real (no laboratorio).
- Métricas accionables: failure rate, P95.
- Open data.

**Debilidades**:
- Cobertura parcial: no todos los modelos están evaluados.
- Sin ranking ni recomendación.
- Sin multi-moneda, sin glosario, sin casos industriales.

**Comparación con SelectIA**:
- ZeroEval es fuente de datos de SelectIA (reliability).
- SelectIA integra ZeroEval como uno de los 8 criterios del HRE-TOPSIS.
- **Veredicto**: complementarios.

---

### BenchLM

**Qué es**: Plataforma que mantiene un índice de precios de tokens y un display score por categoría para modelos de IA. Publica periódicamente análisis de tendencias de precios (Token Price Index).

**Para quién es**: Equipos que monitorean evolución de precios y calidad en el tiempo.

**Fortalezas**:
- Display score por categoría (math, coding, reasoning, etc.).
- Ciclo de vida de modelos (Función K): qué modelo reemplaza a cuál.
- Token Price Index con 41 meses de historia (marzo 2023 - julio 2026).
- Estadísticas de mercado (fronteras de precio, caídas).

**Debilidades**:
- Sin multi-moneda.
- Sin ranking HRE-TOPSIS ni AHP.
- Sin glosario en español.
- Cobertura limitada a modelos "mainstream" (no incluye muchos open source).

**Comparación con SelectIA**:
- BenchLM es fuente de datos de SelectIA (display score, Función K, stats).
- SelectIA usa BenchLM para visualización (Función L: 8 mini-badges por categoría) y para el ciclo de vida.
- **Veredicto**: complementarios. BenchLM produce datos, SelectIA los consume y los presenta para MYPEs LatAm.

---

### HuggingFace Open LLM Leaderboard

**Qué es**: Leaderboard mantenido por HuggingFace que rankea modelos open source en varios benchmarks (MMLU, ARC, HellaSwag, GSM8K, etc.).

**Para quién es**: Investigadores y equipos que valoran modelos open source y benchmarks académicos.

**Fortalezas**:
- Cobertura enorme de modelos open source.
- Benchmarks académicos estándar.
- Open data, puedes descargar todos los resultados.
- Comunidad grande.

**Debilidades**:
- Solo modelos open source (no GPT, Claude, Gemini).
- Sin precios, sin disponibilidad.
- Benchmarks académicos no siempre correlacionan con rendimiento en producción.
- Sin multi-moneda, sin glosario, sin casos industriales.

**Comparación con SelectIA**:
- HuggingFace Hub es fuente de datos de SelectIA (catálogo open source).
- SelectIA incluye modelos open source Y cerrados, lo que es más útil para una MYPE que no tiene opinion sobre open vs cerrado.
- **Veredicto**: complementarios. HuggingFace para investigación open source, SelectIA para recomendación MYPE.

---

### Comparación general Categoría 3

| Característica | ZeroEval | BenchLM | HuggingFace Leaderboard | **SelectIA** |
|---|---|---|---|---|
| Métrica principal | Failure rate | Display score + precio | Benchmarks académicos | 8 criterios combinados |
| Cobertura | Parcial | Mainstream | Open source | Mixto (206 modelos) |
| Histórico | No | 41 meses de precios | Snapshots | Daily snapshot |
| Multi-moneda | No | No | No | Sí (21) |
| Casos industriales | No | No | No | Sí |
| Open source | Sí (datos) | Parcial | Sí (datos) | Sí (MIT) |

---

## Tabla comparativa maestra (todas las herramientas)

| Característica | AA | Arena | Vellum | Helicone | OpenRouter | LiteLLM | ZeroEval | BenchLM | HF LB | **SelectIA** |
|---|---|---|---|---|---|---|---|---|---|---|
| Tipo | Comparador | Benchmark | Plataforma | Observabilidad | Router | Librería | Confiabilidad | Índice | Leaderboard | **Comparador + Recomendador** |
| Rankea | Tabular | Elo | Custom | No | No | No | No | Display score | Sí | **HRE-TOPSIS** |
| Explicabilidad | Baja | Baja | Alta | N/A | N/A | N/A | N/A | Baja | Baja | **Alta (5 capas + AHP)** |
| Multi-moneda | No | No | No | No | No | No | No | No | No | **Sí (21)** |
| Glosario ES | No | No | No | No | No | No | No | No | No | **Sí (176 + 15)** |
| Casos MYPE LatAm | No | No | No | No | No | No | No | No | No | **Sí (IPERC, G-code)** |
| Open source | No | No (datos sí) | No | Sí | No | Sí (MIT) | Sí (datos) | Parcial | Sí (datos) | **Sí (MIT)** |
| Precio | Free | Free | Caro | Freemium | Uso + margin | Free | Free | Free | Free | **Free** |
| Idioma UI | EN | EN | EN | EN | EN | EN | EN | EN | EN | **ES LatAm** |
| Latencia | Sí (web) | Sí (web) | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **< 10 ms por recomendación** |

---

## Diferenciadores de SelectIA

### Diferenciador 1 — Enfoque LatAm / MYPE

SelectIA es el único comparador que se diseñó desde el primer día para MYPEs latinoamericanas. Esto no es marketing: afecta decisiones de diseño.

- **Multi-moneda 21 países**: una MYPE peruana ve precios en soles, una mexicana en pesos, una brasileña en reales. Ningún otro comparador hace esto.
- **Glosario en español LatAm**: 176 términos, 15 deepDives. La MYPE no necesita saber inglés para entender II, agentic, tool use, MMLU.
- **Equivalencias de costo**: el precio se muestra no solo en moneda local sino en "almuerzos menu", "cafés", "pintas". El dueño del taller entiende mejor "13 almuerzos al mes" que "USD 50 al mes".
- **Casos de uso industriales LatAm**: IPERC (matriz de riesgo SUNAT peruana), G-code CNC, manual técnico en español neutro. No hay comparador que documente estos casos.

### Diferenciador 2 — Motor HRE-TOPSIS con explicabilidad

Otros comparadores muestran tablas con datos crudos y dejan al usuario el trabajo de decidir. SelectIA hace la decisión y la explica.

- **5 capas visibles**: normalización → pesos AHP → distancias → restricciones → ranking.
- **AHP con CR = 0**: 24 vectores de pesos matemáticamente consistentes, auditables en código.
- **Animación del motor de 36 pasos**: el usuario puede ver exactamente cómo se llega a la recomendación, paso a paso, con valores numéricos intermedios.
- **Perfil explicable**: cada recomendación viene con un perfil de 8 criterios que muestra por qué ganó.

### Diferenciador 3 — Casos de uso industriales concretos

Otros comparadores son genéricos. SelectIA documenta 4 casos industriales concretos con prompts, flujos de trabajo, y modelos recomendados:

- **IPERC** (matriz de riesgo SUNAT).
- **G-code CNC** (torno Haas, fresadora Haas).
- **Manual técnico de 300 páginas** (PDF input, manual output).
- **Cotización y traducción técnica** (ES ⇄ EN).

Estos casos resuenan con la MYPE industrial LatAm de una manera que ningún comparador genérico logra.

### Diferenciador 4 — Glosario en español intercorrelacionado

176 términos con 15 deepDives no es un glosario cualquiera. Es un mini-curso de fundamentos de LLMs en español, con links entre términos para navegación fluida. La MYPE puede entrar por "¿qué es II?" y terminar en "¿qué es AHP?" sin salir de la app.

### Diferenciador 5 — Open source MIT

- **Código abierto**: todo en github.com/redentor159/selectia.
- **MIT**: uso comercial permitido, modificación permitida, fork permitido.
- **Sin vendor lock-in**: puedes self-hostear, puedes fork, puedes modificar.
- **Transparente**: las decisiones de diseño están documentadas en 20 ADRs (`DECISIONES_DISENIO.md`), los bugs resueltos en 16 entradas (`BUGS_RESUELTOS.md`), las métricas verificables en `METRICAS_VERIFICABLES.md`.

### Diferenciador 6 — Diseño profesional

El design system se extrajo de Stripe.com y Linear.app (referencias B2B SaaS). 4 temas. Accesibilidad (focus rings, ARIA, keyboard nav). Tipografía cuidada (Inter Variable + Fira Code). No parece un proyecto de hobby; parece un producto profesional. Esto importa para la MYPE: la primera impresión de seriedad se traduce en confianza.

---

## Limitaciones honestas de SelectIA

Para que el posicionamiento sea creíble, hay que reconocer limitaciones:

1. **No es un router ni un proxy**. SelectIA no ejecuta modelos; solo recomienda. Para ejecutar, necesitas OpenRouter, LiteLLM, o directamente la API del proveedor.

2. **No es una plataforma de evaluación en producción**. Si quieres evaluar modelos con tus propios datos y métricas, necesitas Vellum, LangSmith, o similar. SelectIA usa datos de terceros (AA, BenchLM, ZeroEval).

3. **No tiene datos en tiempo real**. El JSON maestro se refresca una vez al día (cron 2 AM Lima). Si un modelo cambia de precio a las 10 AM, no se ve hasta el día siguiente. Para datos en tiempo real, vas directo a la fuente.

4. **Cobertura parcial de algunos criterios**. Solo ~20 % de los modelos tienen datos de ZeroEval (reliability). El resto usa baseline 0.95. Esto irá mejorando conforme ZeroEval crezca.

5. **TF-IDF classifier es aproximado**. El mapeo de lenguaje natural del usuario a categoría tiene ~75 % de precisión. El usuario puede corregir manualmente, pero no es perfecto.

6. **No tiene modelo de negocio**. Es gratis, no se monetiza. Si esperabas un SaaS con soporte 24/7, no es este proyecto.

7. **No está en producción en planta real**. Es una prueba de concepto. No hay usuarios activos todavía. Si esperabas casos de estudio con números de impacto real, no los hay.

8. **El autor no es ingeniero de software de formación**. Es ingeniero industrial. El código sigue buenas prácticas pero no tiene el nivel de un equipo senior de producto.

---

## Cierre — Posicionamiento

SelectIA se posiciona en un hueco específico del ecosistema:

- **Arriba**: plataformas empresariales como Vellum (caras, en inglés, para equipos técnicos).
- **Al lado**: comparadores como Artificial Analysis y Chatbot Arena (genéricos, en inglés, sin recomendación accionable).
- **Abajo**: nada. Para MYPEs LatAm sin equipo técnico, no hay alternativa open source que combine multi-moneda, glosario en español, casos industriales y motor explicable.

La promesa de SelectIA es: **"Si eres una MYPE en LatAm y quieres usar IA pero no sabes cuál modelo elegir, esta herramienta te da una recomendación explicada en menos de 10 milisegundos, en tu moneda, en español, con casos de uso industriales que reconoces."**

No busca desplazar a Artificial Analysis ni a OpenRouter. Busca ser el puente entre ellos y la MYPE LatAm.

— *Fin del documento.*
