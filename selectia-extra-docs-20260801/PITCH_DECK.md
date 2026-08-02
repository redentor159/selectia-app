# SelectIA — Pitch Deck y Elevator Pitches

**Proyecto**: SelectIA v3.3.1 — Command Center de Modelos de IA para MYPEs latinoamericanas
**Autor**: José Jesús Alejandro Soria Vásquez — Ingeniería Industrial (Perú)
**Repo**: github.com/redentor159/selectia
**Licencia**: MIT
**Documento**: Materiales de presentación (oral y escrita) listos para usar.

---

## Cómo usar este documento

Este documento reúne tres tipos de material de presentación, en orden de longitud creciente:

1. **Tres elevators pitches orales** (30 s, 60 s, 180 s). Pensados para conversaciones, ferias, eventos universitarios y entrevistas.
2. **Pitch deck escrito de 12 slides**. Pensado para enviar por correo, adjuntar a una postulación, o proyectar en una sala.
3. **Reglas de uso**: solo se mencionan métricas verificables del proyecto. No se afirman "ahorro del 95 %", "orquestación con framework", "producción en planta real" ni "usuarios activos".

> **Nota de tono**: el discurso evita el léxico startup de Silicon Valley. Es sobrio, técnico, en español neutro de LatAm. La audiencia natural es una MYPE de habla hispana, un reclutador técnico o un profesor de ingeniería.

---

## 1) Elevator pitch — versión 30 segundos (~80 palabras, oral)

> SelectIA es un command center open source para elegir modelos de IA desde una sola pantalla. Reúne **206 modelos** desde **13 fuentes en vivo** (Artificial Analysis, BenchLM, ZeroEval, Arena, LiteLLM, HuggingFace, OpenRouter, Groq, Ollama, Aider, Helicone, Models.dev y Open ER-API), los ordena con un motor HRE-TOPSIS de cinco capas con AHP consistente, y entrega una recomendación en menos de 10 milisegundos. Está pensado para MYPEs latinoamericanas. MIT, hecho por José Soria, ingeniero industrial en Perú.

---

## 2) Elevator pitch — versión 1 minuto (~160 palabras, oral)

> Soy José Soria, estudiante de Ingeniería Industrial en Perú, y construí **SelectIA**: un command center open source que ayuda a micro y pequeñas empresas latinoamericanas a elegir modelos de IA con criterio.
>
> La idea nace de un problema concreto: en LatAm, una MYPE que quiere usar IA tiene que navegar entre cientos de modelos con precios en dólares, métricas que no entiende y benchmarks que no se comparan entre sí. SelectIA resuelve eso.
>
> Hoy reúne **206 modelos desde 13 fuentes de datos en vivo**, los normaliza a una canasta común de 8 criterios (precio, II, coding, agentic, speed, context, elo, reliability), y los rankea con un motor **HRE-TOPSIS** de cinco capas con AHP — el Analytic Hierarchy Process — cuyo Consistency Ratio es cero. Hay 24 vectores de pesos pre-calibrados, 3 modos de uso y 8 categorías.
>
> La recomendación sale en **menos de 10 milisegundos**. Soporta **21 monedas de América**, tiene glosario en español con 176 términos y 15 deepDives. Es MIT, vive en Vercel gratis, y el código está en github.com/redentor159/selectia.

---

## 3) Elevator pitch — versión 3 minutos (~480 palabras, oral)

> Tres minutos. Voy a usarlos en cinco movimientos: el problema, la estadística que nos trajo hasta acá, la solución, cómo funciona por dentro y qué queda por hacer.
>
> **El problema.** En Latinoamérica hay decenas de millones de micro y pequeñas empresas. Muchas quieren usar IA pero se enfrentan a tres barreras: precios en dólares sin contexto local, benchmarks académicos incompatibles entre sí, y un vocabulario técnico en inglés que excluye al dueño del taller. La decisión termina siendo por intuición o por marketing, no por datos.
>
> **La estadística.** Un estudio de Workday de enero de 2026, encuestando a 3,200 líderes de negocio (NASDAQ: WDAY), encontró que el 85 % de los empleados ahorra entre 1 y 7 horas semanales con IA, pero casi el 40 % de ese tiempo se pierde en retrabajo, en parte por elegir mal la herramienta. Esa cifra es la motivación original.
>
> **La solución.** Construí **SelectIA**, un command center open source que reúne, normaliza y rankea **206 modelos de IA** desde **13 fuentes de datos en vivo**: Artificial Analysis, BenchLM, ZeroEval, Arena AI, LiteLLM, HuggingFace Hub, OpenRouter, Open ER-API, Groq, Models.dev, Helicone, Aider y Ollama. Todo se sirve desde un JSON estático de 376 KB que se refresca a las 2 AM hora de Lima con un cron en GitHub Actions. La latencia por recomendación es de **menos de 10 milisegundos** — promedio 0.5 ms, máximo 3 ms.
>
> **Cómo funciona por dentro.** El motor es un HRE-TOPSIS de cinco capas. La primera normaliza las métricas crudas. La segunda aplica pesos AHP — Analytic Hierarchy Process — pre-calibrados en 24 vectores (3 modos × 8 categorías), con Consistency Ratio igual a cero. La tercera calcula distancias Euclideanas al ideal y al anti-ideal. La cuarta aplica restricciones, como el piso de calidad II ≥ 30 en modo Calidad. La quinta rankea y entrega al usuario con un perfil explicable. Hay además un clasificador TF-IDF con Porter stemmer en español que mapea el lenguaje del usuario a las categorías.
>
> **Lo que queda por hacer.** SelectIA es una prueba de concepto, no un producto en producción con planta real. No hay usuarios activos todavía. Lo que sí hay es código limpio, 31,116 líneas de TypeScript en 111 archivos, cuatro temas, 21 monedas, 176 términos de glosario, casos de uso industriales probados (IPERC, G-code CNC, manual técnico, cotización) y una licencia MIT. El siguiente paso es comunidad: contribuidores, casos reales en taller y, eventualmente, una versión mobile-first.

---

## 4) Pitch deck escrito — 12 slides

> Cada slide incluye: título, bullets principales, idea visual y nota de diseño. El deck está pensado para 12 a 15 minutos de presentación. Si se proyecta, una slide por minuto; si se envía por correo, se lee en 5 a 7 minutos.

---

### Slide 1 — Título

**Título**: SelectIA
**Tagline**: El command center de modelos de IA para MYPEs latinoamericanas.
**Subtítulo**: 206 modelos · 13 fuentes en vivo · motor HRE-TOPSIS · open source MIT
**Autoría**: José Jesús Alejandro Soria Vásquez · Ingeniería Industrial · Perú
**Versión**: v3.3.1 · julio 2026

- **Bullets principales**:
  - Nombre del proyecto, tagline de 12 palabras.
  - Versión y fecha.
  - Nombre y filiación del autor.

- **Idea visual**: pantalla de la vista Resumen en tema Linear Oscuro, recortada al 80 % de ancho. Logo SelectIA arriba a la izquierda.

- **Nota de diseño**: fondo `#08090a` (Linear deep dark), título en `var(--text-primary)`, tagline en `var(--text-secondary)`. Sin imagen de stock. Sin gradiente llamativo.

---

### Slide 2 — Problema

**Título**: La brecha de acceso a IA en MYPEs de LatAm

- **Bullets principales**:
  - La MYPE latinoamericana quiere usar IA, pero choca con tres barreras.
  - **Barrera 1 — precios en dólares sin contexto local**. Un modelo a 0.50 USD por millón de tokens es opaco para un taller en Lima que cotiza en soles.
  - **Barrera 2 — benchmarks académicos incompatibles**. Artificial Analysis usa un índice propio (II), Arena usa Elo, BenchLM usa un display score, ZeroEval reporta failure rate. Comparar requiere normalización manual.
  - **Barrera 3 — vocabulario técnico en inglés**. "Context window", "agentic", "tool use", "MMLU" son opacos para el dueño del taller.
  - La decisión final termina siendo por intuición o por marketing.

- **Idea visual**: tres columnas verticales con íconos (dólar, balanza, libro), cada una con una micro-descripción.

- **Nota de diseño**: usar `var(--color-warning)` para los íconos. No usar emojis. Tres tarjetas con borde hairline 1px y fondo `var(--bg-elevated)`.

---

### Slide 3 — Estadística del hook

**Título**: La motivación: un dato de Workday

- **Bullets principales**:
  - Estudio de Workday, enero 2026 (NASDAQ: WDAY).
  - Muestra: 3,200 líderes de negocio.
  - 85 % de los empleados ahorra entre 1 y 7 horas por semana usando IA.
  - Cerca del 40 % de ese tiempo ahorrado se pierde en retrabajo, en parte por elegir mal la herramienta.
  - Fuentes verificadas: Workday IR, TheNextWeb, PRNewswire, StockTitan (4 independientes).
  - **Lectura**: el problema no es acceder a IA. Es elegir bien.

- **Idea visual**: número grande "85 %" en izquierda, número "40 %" en derecha, con etiquetas debajo. Línea con flecha que conecta ambos mostrando la pérdida.

- **Nota de diseño**: tipografía serif para el número (Tiempos Headline fallback), color `var(--color-success)` para el 85 % y `var(--color-warning)` para el 40 %. Sin gráfico de pie.

---

### Slide 4 — Solución

**Título**: SelectIA: un command center, no un comparador más

- **Bullets principales**:
  - Un solo panel que reúne **206 modelos** desde **13 fuentes de datos en vivo**.
  - Normaliza todo a una canasta común de **8 criterios**: precio, II, coding, agentic, speed, context, elo, reliability.
  - Rankea con motor **HRE-TOPSIS de 5 capas** y pesos **AHP** pre-calibrados.
  - Entrega una recomendación explicada, no un ranking opaco.
  - 21 monedas de América, 4 temas, glosario en español.
  - Open source MIT. Deploy en Vercel gratis.

- **Idea visual**: mockup de la vista Recomendador mostrando un ganador, tres finalistas y un perfil de explained scores.

- **Nota de diseño**: fondo claro (Linear Claro o Blanco Puro) para variar respecto al slide 1. Tarjeta del ganador con borde `var(--color-success)` hairline.

---

### Slide 5 — Cómo funciona (diagrama simplificado)

**Título**: Cinco capas, una recomendación

- **Bullets principales**:
  - **Capa 1 — Normalización**. Métricas crudas → escala comparable.
  - **Capa 2 — Pesos AHP**. 24 vectores pre-calibrados (3 modos × 8 categorías). Consistency Ratio = 0.
  - **Capa 3 — Distancias HRE-TOPSIS**. Euclidiana al ideal y al anti-ideal.
  - **Capa 4 — Restricciones**. Piso de calidad II ≥ 30 en modo Calidad, tope de precio según modo.
  - **Capa 5 — Ranking y explicabilidad**. Score final, perfil de 8 criterios, justificación textual.
  - Latencia total: < 10 ms por recomendación (avg 0.5 ms, max 3 ms).

- **Idea visual**: flujo horizontal de cinco cajas conectadas por flechas. Bajo cada caja, una etiqueta de tiempo (0.1 ms, 0.2 ms, 3 ms, 0.1 ms, 0.1 ms).

- **Nota de diseño**: usar `var(--color-success)` para las flechas. Tipografía mono (Fira Code) para los tiempos. Sin animación en el deck estático.

---

### Slide 6 — 13 fuentes de datos

**Título**: Trece fuentes, una canasta común

- **Tabla**:

| # | Fuente | Qué aporta | Tipo |
|---|---|---|---|
| 1 | Artificial Analysis | Intelligence Index (II), velocidad, contexto | Benchmark + precio |
| 2 | BenchLM | Display score por categoría, ciclo de vida (Función K) | Benchmark |
| 3 | ZeroEval | Failure rate, P95 latencia, total llamadas | Confiabilidad |
| 4 | Arena AI (lmarena) | Elo humano por batalla | Benchmark humano |
| 5 | LiteLLM | Catálogo de modelos, precios API | Router |
| 6 | HuggingFace Hub | Modelos open source, descargas, likes | Repositorio |
| 7 | OpenRouter | Disponibilidad y ruteo multi-provider | Router |
| 8 | Open ER-API | Tipos de cambio en vivo | FX |
| 9 | Groq | Catálogo de modelos en Groq | Provider |
| 10 | Models.dev | Catálogo extendido | Catálogo |
| 11 | Helicone | Observabilidad, latencia real | Observabilidad |
| 12 | Aider | Polyglot benchmark de coding | Benchmark coding |
| 13 | Ollama | Modelos corribles en local | Local LLM |

- **Bullets adicionales**:
  - Refresco: cron diario 2 AM Lima vía GitHub Actions.
  - JSON maestro resultante: 376 KB.
  - Si una API falla, se conserva el último snapshot válido. No se rompe la UI.

- **Idea visual**: tabla limpia con cabecera en `var(--bg-elevated)`. Íconos Lucide a la izquierda de cada fila (Database, Activity, etc.).

- **Nota de diseño**: tabular-nums en la columna # para alinear. Border-bottom hairline entre filas.

---

### Slide 7 — Motor HRE-TOPSIS

**Título**: HRE-TOPSIS de 5 capas, con AHP consistente

- **Bullets principales**:
  - **HRE** = Hierarchical Restricted Evaluation. Restricciones blandas (peso) y duras (umbral) en jerarquía.
  - **TOPSIS** = Technique for Order of Preference by Similarity to Ideal Solution. Distancia al ideal y al anti-ideal.
  - **AHP** = Analytic Hierarchy Process. Pesos por comparación pareada. 24 vectores pre-calibrados (3 modos × 8 categorías). **Consistency Ratio = 0** (matriz perfectamente consistente).
  - **8 criterios**: precio, II (Intelligence Index), coding, agentic, speed, context, elo, reliability (reliability añadido en v3.3.1).
  - **3 modos**: Ahorro (peso a precio), Equilibrado (peso parejo), Calidad (peso a II, coding, agentic, reliability).
  - **8 categorías**: razonamiento, coding, agentic, matemática, visión, audio, embeddings, multimodal.
  - **Restricción blanda adicional**: en modo Calidad, II debe ser ≥ 30 (piso de calidad).

- **Idea visual**: matriz 8×8 con los pesos AHP del modo Equilibrado. A la derecha, barras horizontales con el peso de cada criterio.

- **Nota de diseño**: usar Fira Code para los números en la matriz. Color por celda en escala sequential de un solo matiz (indigo).

---

### Slide 8 — Métricas verificables

**Título**: Lo que sí se puede afirmar (y lo que no)

- **Bullets principales — Métricas verificables**:
  - 206 modelos de IA.
  - 13 fuentes de datos en vivo.
  - 31,116 líneas de TypeScript, 111 archivos.
  - JSON maestro: 376 KB.
  - Latencia por recomendación: < 10 ms (avg 0.5 ms, max 3 ms).
  - 21 monedas de América soportadas.
  - Glosario: 176 términos, 15 deepDives, 8 categorías.
  - 24 vectores AHP, Consistency Ratio = 0.
  - 4 temas: Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro.
  - 16 bugs resueltos en v3.3.1.
  - Versión: v3.3.1.
  - Licencia: MIT.

- **Bullets — Lo que NO se afirma (boundaries honestos)**:
  - "Orquesté IAs con un framework" — fue manual, modelo por modelo.
  - "95 % de ahorro" — no hay data real que lo respalde.
  - "Producción en planta real" — es una prueba de concepto.
  - "Usuarios activos" — todavía no los hay.

- **Idea visual**: dos columnas. Izquierda en `var(--color-success)`, derecha en `var(--color-warning)`. Cada métrica con un ícono check o x.

- **Nota de diseño**: este slide es el más importante para construir confianza con un reclutador o inversor. La columna derecha se titula "Lo que no afirmo" en cursiva.

---

### Slide 9 — Casos de uso

**Título**: Cuatro casos de uso industriales reales

- **Bullets principales**:
  - **Caso 1 — IPERC (matriz de riesgo peruana)**. Generación de matriz IPERC para taller CNC en Lima. El modelo razona sobre peligros, expone controles y entrega la tabla en formato SUNAT.
  - **Caso 2 — G-code (CNC)**. Generación y depuración de código G para torno y fresadora. Validación de ciclos y corrección de sintaxis.
  - **Caso 3 — Manual técnico de 300 páginas**. Toma de un PDF técnico extenso y producción de manual operativo en español neutro, con índice, glosario y diagramas.
  - **Caso 4 — Cotización y traducción técnica**. Cotización en soles con desglose, y traducción técnica ES ⇄ EN para catálogos de proveedores.

- **Idea visual**: cuatro tarjetas en grid 2×2, cada una con ícono (ClipboardList, Cpu, BookOpen, Languages), título y una línea de descripción.

- **Nota de diseño**: borde superior hairline 1px en `var(--color-success)` para cada tarjeta. Sin íconos emoji.

---

### Slide 10 — Tech stack

**Título**: Stack técnico

- **Bullets principales**:
  - **Framework**: Next.js 16.1.3 (App Router).
  - **Lenguaje**: TypeScript 5, modo strict.
  - **Estilos**: Tailwind CSS 4.
  - **Componentes**: shadcn/ui (variante New York).
  - **Estado cliente**: Zustand 5.
  - **Estado servidor**: TanStack Query 5.
  - **Validación**: Zod 4.0.2.
  - **Gráficos**: Recharts.
  - **Íconos**: Lucide.
  - **Runtime/paquetes**: Bun 1.3.
  - **Deploy**: Vercel (tier gratis).
  - **Design system**: extraído de Stripe.com + Linear.app (2026-06-29).
  - **Tamaño del JSON maestro**: 376 KB.

- **Idea visual**: tabla de 2 columnas (capa, tecnología). No logos de proveedores.

- **Nota de diseño**: tipografía mono para los nombres de paquetes. No usar gradientes ni colores de marca de los proveedores.

---

### Slide 11 — Open source MIT y roadmap

**Título**: MIT, comunidad, y hacia dónde va

- **Bullets principales**:
  - **Licencia**: MIT. Uso comercial permitido, atribución requerida.
  - **Repo público**: github.com/redentor159/selectia.
  - **Cron diario**: 2 AM Lima vía GitHub Actions, snapshot del JSON maestro.
  - **Roadmap corto** (Q3 2026):
    - Auth con NextAuth.js.
    - Guardar recomendaciones favoritas.
    - Historial de uso.
  - **Roadmap medio** (Q1 2027):
    - Versión mobile-first PWA.
    - Notificaciones push.
    - Modo offline con service worker.
  - **Roadmap largo** (Q4 2027):
    - Marketplace de prompts.
    - Self-hosted con Docker.
    - Análisis de uso con dashboards.

- **Idea visual**: línea de tiempo horizontal con hitos. Cada hito con su versión y una línea de descripción.

- **Nota de diseño**: tipografía sans para hitos, mono para versiones. Sin logo de GitHub en la línea de tiempo (queda en el slide 12).

---

### Slide 12 — Call to action + links

**Título**: Próximos pasos

- **Bullets principales**:
  - **Demo en vivo**: vercel.app/selectia (placeholder).
  - **Código**: github.com/redentor159/selectia.
  - **Licencia**: MIT.
  - **Cómo contribuir**: leer CONTRIBUTING.md, abrir issue con etiqueta "good first issue".
  - **Contacto**: placeholder para email del autor.
  - **Invitación concreta**: ¿tienes una MYPE en LatAm y quieres probar SelectIA con un caso real? Escríbeme.

- **Idea visual**: QR grande que apunta al repo. Debajo, en tipografía mono, la URL en texto plano.

- **Nota de diseño**: el QR va centrado. El resto del texto en columna izquierda, alineado a la izquierda. Sin call-to-action agresivo tipo "¡Únete hoy!".

---

## 5) Reglas de uso del material

1. **No mezclar versiones orales y escritas en una misma presentación**. El deck escrito es para enviar; los elevators son para conversaciones.
2. **Nunca improvisar métricas**. Si no recuerdas una cifra exacta, usa una formulación cualitativa ("cientos de modelos", "más de una decena de fuentes") antes de inventar un número.
3. **Respetar los boundaries**. Si te preguntan por usuarios activos, di "no todavía". Si te preguntan por ahorro, di "es una prueba de concepto, no tengo data real de ahorro todavía".
4. **Adaptar el tema al público**. Para reclutadores técnicos, usar Linear Oscuro. Para ferias universitarias, Blanco Puro. Para inversores, Linear Claro.
5. **Duración recomendada**:
   - Elevator 30 s: una conversación de pasillo.
   - Elevator 1 min: una entrevista de teléfonica inicial.
   - Elevator 3 min: una sala de espera antes de una entrevista larga.
   - Deck 12 slides: una reunión agendada de 15 minutos.

---

## 6) Apéndice — métricas verificables que aparecen en este documento

| Métrica | Valor | Dónde verificar |
|---|---|---|
| Modelos de IA | 206 | `curl -s http://localhost:3000/api/dashboard \| jq '.models \| length'` |
| Fuentes de datos en vivo | 13 | `curl -s http://localhost:3000/api/health \| jq '.sources \| length'` |
| Líneas de TypeScript | 31,116 | `find src -name '*.ts' -o -name '*.tsx' \| xargs wc -l \| tail -1` |
| Archivos | 111 | `find src -name '*.ts' -o -name '*.tsx' \| wc -l` |
| Tamaño JSON maestro | 376 KB | `ls -lh public/data/master_dashboard_data.json` |
| Latencia por recomendación | < 10 ms | Medición con `performance.now()` en 10 consultas |
| Monedas soportadas | 21 | `curl -s http://localhost:3000/api/dashboard \| jq '.currencies \| length'` |
| Términos de glosario | 176 | `grep -c '^  {' src/lib/data/glossary.ts` |
| DeepDives | 15 | `grep -c 'deepDive' src/lib/data/glossary.ts` |
| Vectores AHP | 24 | `grep -c 'weights' src/lib/engine/ahp-verification.ts` (aproximado) |
| Consistency Ratio AHP | 0 | `src/lib/engine/ahp-verification.ts` |
| Temas soportados | 4 | `src/components/theme-provider.tsx` |
| Versión | v3.3.1 | `package.json` |
| Licencia | MIT | `LICENSE` |

---

## 7) Cierre

Este documento es la pieza central de presentación del proyecto. Está pensado para ser usado en entrevistas, ferias, conversaciones con inversores y en la documentación pública del repo. Si se modifica, mantener los boundaries (no afirmar ahorro, no afirmar producción, no afirmar usuarios activos) y actualizar las métricas verificables si cambian.

— *Fin del documento.*
