# SelectIA — Press Kit

**Proyecto**: SelectIA v3.3.1 — Command Center de Modelos de IA para MYPEs latinoamericanas
**Autor**: José Jesús Alejandro Soria Vásquez — Ingeniería Industrial (Perú)
**Repo**: github.com/redentor159/selectia
**Licencia**: MIT
**Documento**: Kit de prensa listo para enviar a medios de tecnología, educación y emprendimiento en LatAm.

---

## Cómo usar este documento

Este kit de prensa está pensado para enviarse a:

- Medios de tecnología en LatAm (TechLatam, Bitbol, Hipertextual, Genbeta en Español).
- Medios de educación en ingeniería (revistas universitarias, blogs de facultades de ingeniería).
- Medios de emprendimiento MYPE ( portals de SUNAT, gremios industriales).
- Podcasts sobre IA y software libre en LatAm.

El kit incluye: **press release** (1 página), **fact sheet**, **bio del autor**, **quotes disponibles**, **boilerplate**, **recursos multimedia**, **preguntas frecuentes para prensa**, **datos curiosos**, **contacto** y **condiciones de uso**.

---

## 1. Press release

> **Para publicación inmediata** — julio 2026

### SelectIA: un command center open source para que las MYPEs latinoamericanas elijan modelos de IA sin depender de un equipo técnico

**Lima, Perú — julio 2026.** El estudiante de Ingeniería Industrial José Jesús Alejandro Soria Vásquez publica **SelectIA v3.3.1**, un command center open source que reúne **206 modelos de IA** desde **13 fuentes de datos en vivo** y los rankea con un motor HRE-TOPSIS de cinco capas con pesos AHP pre-calibrados, para que micro y pequeñas empresas latinoamericanas puedan elegir modelo sin necesidad de un equipo técnico interno.

La plataforma soporta **21 monedas de América** (PEN, USD, BRL, MXN, COP, CLP, ARS, CAD y 13 más), ofrece **glosario en español LatAm** con 176 términos y 15 deepDives, y documenta **casos de uso industriales concretos** como IPERC (matriz de riesgo SUNAT peruana), programación G-code para CNC, manuales técnicos extensos y cotización.

La motivación del proyecto nace de un estudio de Workday (enero 2026, NASDAQ: WDAY) que encuestó a 3,200 líderes de negocio: el 85 % de los empleados ahorra entre 1 y 7 horas por semana usando IA, pero casi el 40 % de ese tiempo se pierde en retrabajo, en parte por elegir mal la herramienta.

"SelectIA no es un comparador más", explica Soria. "Es un motor de decisión multicriterio con explicabilidad real: cada recomendación se descompone en cinco capas que el usuario puede auditar, paso a paso, en una animación de 36 pasos. Y está pensado desde el primer día para el dueño del taller en Lima, no para el ingeniero de Silicon Valley".

El proyecto se publica bajo licencia **MIT** en github.com/redentor159/selectia y se despliega en Vercel free tier. Toda la arquitectura es **JSON estático + cron job**: un workflow de GitHub Actions corre a las 2 AM hora de Lima, descarga las 13 fuentes, normaliza y arma un JSON maestro de 376 KB que se sirve estáticamente. Esto permite una **latencia por recomendación de menos de 10 milisegundos** (promedio 0.5 ms, máximo 3 ms), ya que todo el cómputo ocurre en el cliente.

SelectIA está construido con Next.js 16.1.3, TypeScript 5 strict, Tailwind CSS 4, shadcn/ui (variante New York), Zustand 5, TanStack Query 5, Zod 4.0.2, Recharts y Lucide. El design system se extrajo de Stripe.com y Linear.app. El código totaliza **31,116 líneas de TypeScript en 111 archivos**.

"Esto no es un producto comercial", aclara Soria. "No tiene modelo de negocio. No cobra. No busca levantar capital. Es un proyecto educativo y de portafolio: si una sola MYPE ahorra una hora a la semana gracias a esto, ya valió la pena".

El roadmap futuro incluye autenticación con NextAuth.js (Q3 2026), API pública (Q4 2026), versión mobile-first PWA (Q1 2027) y self-hosting con Docker (Q4 2027).

**Contacto para prensa**: [placeholder para email del autor]
**Repo público**: github.com/redentor159/selectia
**Licencia**: MIT

— *Fin del press release.*

---

## 2. Fact sheet

### Datos clave

- **Nombre**: SelectIA
- **Versión**: v3.3.1 (julio 2026)
- **Tipo**: Command center para elegir modelos de IA
- **Audiencia**: MYPEs latinoamericanas (1 a 50 empleados)
- **Autor**: José Jesús Alejandro Soria Vásquez, Ingeniería Industrial, Perú
- **Licencia**: MIT (uso comercial permitido)
- **Repo**: github.com/redentor159/selectia
- **Deploy**: Vercel free tier
- **Costo**: Gratis

### Métricas técnicas verificables

- **206** modelos de IA catalogados.
- **13** fuentes de datos en vivo integradas.
- **8** criterios de evaluación (precio, II, coding, agentic, speed, context, elo, reliability).
- **24** vectores AHP pre-calibrados (3 modos × 8 categorías).
- **0** Consistency Ratio (CR = 0, perfectamente consistente).
- **21** monedas de América soportadas.
- **176** términos de glosario en español.
- **15** deepDives explicativos.
- **4** temas visuales (Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro).
- **31,116** líneas de TypeScript.
- **111** archivos de código.
- **376 KB** tamaño del JSON maestro.
- **< 10 ms** latencia por recomendación (avg 0.5 ms, max 3 ms).
- **16** bugs resueltos en v3.3.1.

### Stack técnico

- Next.js 16.1.3 (App Router).
- TypeScript 5 strict.
- Tailwind CSS 4.
- shadcn/ui (variante New York).
- Zustand 5.
- TanStack Query 5.
- Zod 4.0.2.
- Recharts.
- Lucide.
- Bun 1.3 (runtime / package manager).
- Vercel (deploy).
- GitHub Actions (cron diario 2 AM Lima).

### Casos de uso documentados

1. IPERC (matriz de riesgo SUNAT, Perú).
2. G-code CNC (torno y fresadora Haas).
3. Manual técnico de 300 páginas en español neutro.
4. Cotización y traducción técnica ES ⇄ EN.

### Fuentes de datos integradas (13)

Artificial Analysis, BenchLM, ZeroEval, Arena AI (lmarena), LiteLLM, HuggingFace Hub, OpenRouter, Open ER-API, Groq, Models.dev, Helicone, Aider, Ollama.

---

## 3. Bio del autor (150 palabras)

**José Jesús Alejandro Soria Vásquez** es estudiante de Ingeniería Industrial en Perú. Su nicho industrial es CNC, metalmecánica y MYPE peruana, con experiencia práctica en taller (programación G-code, IPERC, cotización) y trato con SUNAT. Construyó SelectIA como proyecto personal educativo y de portafolio para combinar tres intereses: investigación de modelos de IA, diseño de sistemas de decisión multicriterio y casos de uso industriales reales en LatAm. Aprendió desarrollo web de forma autodidacta, con la guía de Cursor, Claude y la documentación oficial de Next.js, TypeScript, Tailwind y shadcn/ui. No busca levantar capital ni fundar startup; busca aprender en público, abrir puertas profesionales y servir a la MYPE LatAm. SelectIA es su primer proyecto open source de escala media, publicado bajo licencia MIT en julio 2026. Contacto: [placeholder para email].

---

## 4. Quotes disponibles (5 frases citables del autor)

> **Quote 1 — Sobre la motivación**: "Un estudio de Workday encontró que el 85 % de empleados ahorra entre 1 y 7 horas semanales con IA, pero casi el 40 % de ese tiempo se pierde en retrabajo por elegir mal. SelectIA existe para cerrar esa brecha en la MYPE LatAm."

> **Quote 2 — Sobre el diferenciador**: "SelectIA no es un comparador más. Es un motor de decisión multicriterio con explicabilidad real: cada recomendación se descompone en cinco capas que el usuario puede auditar."

> **Quote 3 — Sobre la audiencia**: "Está pensado desde el primer día para el dueño del taller en Lima, no para el ingeniero de Silicon Valley. Por eso soportamos 21 monedas de América y tenemos un glosario en español."

> **Quote 4 — Sobre open source**: "Esto no es un producto comercial. No tiene modelo de negocio. No cobra. No busca levantar capital. Si una sola MYPE ahorra una hora a la semana gracias a esto, ya valió la pena."

> **Quote 5 — Sobre el futuro**: "El roadmap es claro: auth y favoritos en Q3, API pública en Q4, PWA mobile-first en Q1 2027. Pero lo que no cambiará es la licencia MIT, el enfoque LatAm y la honestidad sobre lo que se afirma y lo que no."

---

## 5. Boilerplate (descripción estándar del proyecto, 100 palabras)

**SelectIA** es un command center open source para elegir modelos de IA desde una sola pantalla. Reúne 206 modelos desde 13 fuentes de datos en vivo (Artificial Analysis, BenchLM, ZeroEval, Arena, LiteLLM, HuggingFace, OpenRouter, Open ER-API, Groq, Models.dev, Helicone, Aider, Ollama), los normaliza a 8 criterios y los rankea con un motor HRE-TOPSIS de 5 capas con pesos AHP pre-calibrados. Soporta 21 monedas de América, ofrece glosario en español con 176 términos y 15 deepDives, y documenta casos de uso industriales como IPERC y G-code CNC. Publicado bajo licencia MIT por José Soria, ingeniero industrial peruano.

---

## 6. Recursos multimedia disponibles

### 6.1 Screenshots (lista, qué muestra cada uno)

Todos los screenshots están en la carpeta `screenshots/` del repo.

| Archivo | Qué muestra | Uso recomendado |
|---|---|---|
| `00-inicio.png` | Pantalla de carga / splash | Hero de artículo |
| `01-resumen.png` | Vista Resumen (overview) | Demo principal |
| `02-recomendador-mype.png` | Recomendador modo MYPE | Caso de uso MYPE |
| `03-recomendador-calidad.png` | Recomendador modo Calidad | Diferenciación de modos |
| `04-tabla-maestra.png` | Tabla Maestra completa | Profundidad de datos |
| `04b-tabla-scroll.png` | Tabla Maestra con scroll | UI responsive |
| `05-comparador.png` | Comparador lado a lado | Feature de comparación |
| `06-analytics.png` | Vista Analytics | Análisis de mercado |
| `07-simulador-roi.png` | Simulador ROI | Caso de uso financiero |
| `08-calculadora.png` | Calculadora de costos | Equivalencias de costo |
| `09-hardware-ia.png` | Calculadora de hardware | Recomendación hardware |
| `10-salud-sistema.png` | Salud del Sistema | Monitoreo de fuentes |
| `10b-salud-funcion-l.png` | Función L (8 mini-badges) | Feature distintivo |
| `11-animacion-inicio.png` | Animación del Motor (inicio) | Explicabilidad |
| `11b-animacion-piso-calidad.png` | Animación: piso de calidad | Restriction HRE |
| `11c-animacion-filosofia.png` | Animación: filosofía del motor | Storytelling |
| `11d-animacion-metricas.png` | Animación: métricas | Datos verificables |
| `11e-animacion-modo-traza.png` | Animación: modo traza | Debug / dev |
| `11f-animacion-footer.png` | Animación: footer | Cierre visual |
| `12-glosario.png` | Glosario abierto | Feature educativa |
| `13-glosario-deepdive.png` | Glosario: deepDive | Profundidad de contenido |
| `13-motor-explicado.png` | Motor explicado | Documentación |
| `14-ficha-tecnica.png` | Ficha Técnica de modelo | Detalle por modelo |
| `14b-ficha-zeroeval-ciclovida.png` | Ficha: ZeroEval + ciclo vida | Datos de confiabilidad |
| `14c-ficha-ciclo-vida.png` | Ficha: Función K | Ciclo de vida |
| `15-recomendador-resultado.png` | Recomendador: resultado final | Output del motor |
| `15-dropdown-monedas-21.png` | Dropdown 21 monedas | Feature multi-moneda |
| `16-motor-explicado.png` | Motor explicado (full) | Diagrama |
| `16-animacion-step41.png` | Animación paso 41 | Detalle del motor |
| `17-recomendador-equilibrado.png` | Recomendador modo Equilibrado | Modo por defecto |
| `17-modo-traza.png` | Modo traza activo | Dev feature |
| `18-dropdown-monedas.png` | Dropdown monedas (close-up) | UI detalle |

### 6.2 Logo (descripción)

- **Archivo**: `public/logo.svg`
- **Descripción**: Logo de SelectIA. Composición minimalista con la palabra "SelectIA" en tipografía Inter Variable, peso semibold. A la izquierda, un glyph abstracto que combina un cursor de selección con un símbolo de objetivo (target). Color: `var(--text-primary)` (tematizable). SVG vectorial, escalable a cualquier tamaño.
- **Versiones disponibles**: SVG (default), favicon 32x32 PNG (generado), favicon 180x180 para iOS (generado).
- **Uso permitido**: bajo licencia MIT, con atribución a "José Soria / SelectIA".

### 6.3 Video demo (descripción)

- **Duración objetivo**: 2-3 minutos.
- **Estructura**:
  1. **(0:00-0:15) Hook**: cita de Workday + pregunta "¿cómo elige una MYPE su modelo de IA?".
  2. **(0:15-0:45) Problema**: 3 barreras (precio en USD, benchmarks incompatibles, vocabulario en inglés).
  3. **(0:45-1:30) Solución**: demo de la vista Resumen + Recomendador en modo Equilibrado, en Linear Oscuro.
  4. **(1:30-2:00) Motor**: Animación del Motor en 36 pasos, explicando las 5 capas.
  5. **(2:00-2:30) Caso de uso**: IPERC en taller CNC, prompt → respuesta → tabla.
  6. **(2:30-2:45) Open source**: repo GitHub, licencia MIT.
  7. **(2:45-3:00) CTA**: github.com/redentor159/selectia.
- **Formato**: MP4 1080p, sin música (o música libre de royalty, ambient minimal).
- **Subtítulos**: español LatAm + inglés.
- **Voiceover**: preferentemente voz del autor.

---

## 7. Preguntas frecuentes para prensa

### Q1. ¿SelectIA es una startup?

No. Es un proyecto personal open source, sin modelo de negocio, sin VC, sin empleados. El autor no busca monetizarlo.

### Q2. ¿Cuántos usuarios tiene SelectIA?

No se afirman usuarios activos todavía. El proyecto se publicó en julio 2026 y está en fase de adopción temprana. Cualquier cifra de "usuarios" sería inventada.

### Q3. ¿SelectIA ahorra 95 % de costos?

No se afirma eso. Lo que se afirma es que ayuda a la MYPE a elegir el modelo correcto para cada tarea, lo que puede resultar en ahorro. Pero no hay data real que respalde un porcentaje específico de ahorro.

### Q4. ¿Está en producción en planta real?

No. Es una prueba de concepto. Los casos de uso (IPERC, G-code) son escenarios verosímiles, no implementaciones reales en planta activa.

### Q5. ¿Cómo se financia?

No se financia. Vercel free tier, GitHub free, Open ER-API free, todas las fuentes de datos son gratuitas. El autor no recibe compensación económica por el proyecto.

### Q6. ¿Cómo se compara con ChatGPT?

ChatGPT es un solo modelo. SelectIA es un comparador y recomendador que ayuda a elegir entre 206 modelos, incluyendo GPT-4o, Claude 3.5 Sonnet, Gemini 2.0, y muchos más.

### Q7. ¿Es de confianza?

El código es 100 % open source MIT. Todas las decisiones de diseño están documentadas en 20 ADRs. Todos los bugs resueltos están documentados con causa raíz. Las métricas son verificables con comandos públicos (ver `METRICAS_VERIFICABLES.md`). La transparencia es intencional.

### Q8. ¿Qué pasa si una de las 13 fuentes falla?

El cron diario tiene tolerancia a fallos. Si una fuente no responde, se conserva el último snapshot válido y se marca como "yellow" en la vista Salud del Sistema. La UI no se rompe.

### Q9. ¿Cómo se pueden verificar las métricas?

Todas las métricas (206 modelos, 13 fuentes, 31,116 LOC TS, etc.) tienen un comando de verificación público en `METRICAS_VERIFICABLES.md`. Cualquiera puede clonar el repo y verificar.

### Q10. ¿Cómo se pronuncia "SelectIA"?

"Se-lec-TÍ-a", con acento en la "i". Viene de "Select IA" escrito como una sola palabra.

---

## 8. Datos curiosos (5 datos para hacer el proyecto interesante)

### Dato curioso 1 — La latencia es menor que un parpadeo

El motor HRE-TOPSIS de SelectIA corre en **menos de 10 milisegundos** por recomendación, con promedio de **0.5 ms** y máximo de **3 ms**. Un parpadeo humano dura entre 100 y 400 ms. SelectIA entrega ~200 recomendaciones en el tiempo que tardas en parpadear una vez.

### Dato curioso 2 — 24 vectores AHP perfectamente consistentes

El Analytic Hierarchy Process normalmente se deriva de encuestas a humanos, lo que produce inconsistencias (Consistency Ratio > 0). Los 24 vectores AHP de SelectIA (3 modos × 8 categorías) tienen **CR = 0**, es decir, son matemáticamente perfectos. Fueron construidos deliberadamente, no derivados de encuestas.

### Dato curioso 3 — El JSON maestro es más liviano que una foto de WhatsApp

El JSON maestro que contiene los 206 modelos, 13 fuentes, tipos de cambio, glosario, AHP y todo lo necesario para funcionar pesa **376 KB**. Una foto típica enviada por WhatsApp pesa entre 200 KB y 500 KB. SelectIA comprime una enorme cantidad de información en menos espacio que una foto.

### Dato curioso 4 — La animación del motor tiene 36 pasos

La vista "Animación del Motor" recorre los **36 pasos** del HRE-TOPSIS uno por uno: desde la carga del JSON hasta el ranking final, mostrando los valores numéricos intermedios en cada paso. Es una de las pocas herramientas que permite ver exactamente cómo se llega a una recomendación, sin caja negra.

### Dato curioso 5 — El glosario creció de 80 a 176 términos

El glosario inicial (v3.0) tenía 80 términos. A medida que el autor se encontraba con conceptos que necesitaba explicar para sí mismo, los iba añadiendo. En v3.3.1 son **176 términos** con **15 deepDives** (explicaciones largas de conceptos densos como II, AHP, TOPSIS, HRE, TF-IDF). Es un mini-curso de fundamentos de LLMs en español, dentro de la app.

---

## 9. Contacto

- **Email**: [placeholder para email del autor]
- **LinkedIn**: [placeholder para URL de LinkedIn del autor]
- **GitHub**: github.com/redentor159/selectia
- **Twitter/X**: [placeholder para handle]
- **Tiempo de respuesta**: 72 horas hábiles.

### Para entrevistas

- **Idiomas**: español (preferido), inglés (limitado).
- **Formato**: video llamada (Google Meet, Zoom) o asíncrono por email.
- **Disponibilidad**: lunes a viernes, 9 AM - 6 PM hora de Lima (UTC-5).
- **Tiempo objetivo de entrevista**: 30-45 minutos.

### Para demos

- Demo en vivo vía Vercel deploy, sin necesidad de instalación.
- Demo local clonando repo + `bun install && bun dev` (5 minutos).
- Demo guiada por el autor vía screen share (15-30 minutos).

---

## 10. Condiciones de uso de material

### Código y texto

- **Licencia**: MIT.
- **Uso comercial**: permitido.
- **Modificación**: permitida.
- **Distribución**: permitida.
- **Atribución**: requerida. Forma sugerida: "SelectIA por José Soria (github.com/redentor159/selectia), licencia MIT".

### Screenshots y logo

- **Licencia**: CC BY 4.0 (Creative Commons Attribution 4.0 International).
- **Uso comercial**: permitido.
- **Modificación**: permitida.
- **Atribución**: requerida. Forma sugerida: "Screenshot/logo de SelectIA por José Soria, usado bajo CC BY 4.0".

### Press release y boilerplate

- **Licencia**: CC BY 4.0.
- Los medios pueden citar, reproducir y adaptar libremente, con atribución.

### Quotes del autor

- Las 5 quotes del autor pueden citarse libremente con atribución "José Soria, autor de SelectIA".
- No se permite alterar el texto de las quotes. Parafrasear está permitido con atribución clara.

### Datos personales del autor

- Nombre, foto, bio y quotes pueden usarse en artículos sobre SelectIA.
- No se permite usar los datos personales del autor para fines no relacionados al proyecto (ej.: marketing de terceros, listas de email, etc.).

---

## Cierre

Este kit de prensa está diseñado para facilitar la cobertura mediática de SelectIA. Si necesitas material adicional (entrevistas, demos, datos específicos), contacta al autor directamente. La filosofía del proyecto es transparencia total: si hay algo que no está en este documento, es probable que esté en otro documento del repo (`METRICAS_VERIFICABLES.md`, `DECISIONES_DISENIO.md`, `BUGS_RESUELTOS.md`, `FAQ_SELECTIA.md`).

— *Fin del documento.*
