# 🎓 Lecciones Aprendidas — SelectIA

> **Compilación de lecciones técnicas y metodológicas** extraídas del desarrollo de SelectIA v3.3.1 en 5 semanas.
>
> **Autor:** José Jesús Alejandro Soria Vásquez
> **Carrera:** Ingeniería Industrial (Perú)
> **Fecha:** 30 de julio de 2026
> **Formato:** cada lección tiene título, contexto, qué pasó, qué aprendí, cómo aplicarlo.

---

## Sección 1 — Lecciones sobre integración de APIs

### 1.1 — Verifica el endpoint antes de programar el fetcher

**Contexto:** 13 APIs externas, cada una con su propio formato de respuesta.

**Qué pasó:** En la semana 2, GLM-5.2 escribió fetchers para las 11 APIs iniciales sin verificar los endpoints. Tres de ellas fallaron en runtime porque el path había cambiado o el campo esperado no existía.

**Qué aprendí:** Una hora de `curl` manual ahorra un día de debugging. La verificación es barata; la programación a ciegas es cara.

**Cómo aplicarlo:** Antes de escribir cualquier fetcher, hacer una llamada `curl` real al endpoint, capturar la respuesta, y guardarla como `notas/{source}-sample.json`. Solo entonces escribir el fetcher y el schema Zod basado en el JSON real, no en la documentación.

---

### 1.2 — Captura los headers HTTP, no solo el body

**Contexto:** Artificial Analysis expone headers de quota (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `X-AA-Tier`).

**Qué pasó:** El primer fetcher de AA solo leía el body. Cuando el usuario abría la vista "Salud del Sistema", la cuota aparecía vacía. Fix: leer headers y exponerlos como parte del objeto de respuesta.

**Qué aprendí:** Los headers HTTP son datos. Especialmente en APIs freemium, los headers de quota son críticos para mostrar al usuario "cuánto me queda".

**Cómo aplicarlo:** En cada fetcher, loggear los headers además del body. Si hay headers de quota o rate limit, exponerlos en el objeto de respuesta del orchestrator.

---

### 1.3 — `Promise.allSettled`, no `Promise.all`

**Contexto:** 13 fetchers en paralelo en `runAllFetchers()`.

**Qué pasó:** Si una API fallaba (timeout, 500, red), `Promise.all` rechazaba todo el orquestador y el dashboard se caía. Fix: cambiar a `Promise.allSettled` para que un fallo no tire todo.

**Qué aprendí:** En un orchestrator de N APIs, asumir que **al menos una va a fallar siempre**. Diseñar para que el sistema siga funcionando con N-1 APIs.

**Cómo aplicarlo:** Usar `Promise.allSettled` por defecto. Para cada API, capturar el estado (`fulfilled`/`rejected`) y registrar un `SourceHealth` con color (green/yellow/red). El dashboard se sirve con lo que tenga, no falla porque falte una fuente.

---

### 1.4 — Normaliza nombres antes de hacer matching

**Contexto:** Merging de modelos entre Artificial Analysis, LiteLLM, BenchLM y ZeroEval.

**Qué pasó:** 210 modelos aparecían con context window 8K falso. Causa: "Claude Opus 4.7 (Adaptive)" en AA no matcheaba con "Claude Opus 4.7" en LiteLLM. El matching fallaba silenciosamente y se usaba el default 8K.

**Qué aprendí:** Cuando haces merge entre dos datasets que nombran las entidades distinto, **siempre** hay que normalizar. Strippear acentos, sufijos `(high)/(max)/(Adaptive)`, espacios extra, mayúsculas. Y después de normalizar, hacer 2 pasadas: primero sin sufijo, después con sufijo.

**Cómo aplicarlo:** Implementar `normalizeForMatching(name: string): string` que:
1. lowercase
2. NFD para quitar acentos
3. eliminar sufijos entre paréntesis
4. eliminar variantes (`high`, `max`, `xhigh`, `reasoning`, `adaptive`, `non-reasoning`, `minimal`, `standard`)
5. eliminar caracteres no alfanuméricos

Y para casos críticos (BenchLM), hacer 2 pasadas con estrategias distintas.

---

### 1.5 — In-memory cache para reducir carga

**Contexto:** Algunas APIs (especialmente AA) tienen rate limits estrictos (100/día en free tier).

**Qué pasó:** El primer orchestrator hacía fetch en cada request del dashboard. Tras 100 visitas, AA se agotaba y el dashboard caía a fallback.

**Qué aprendí:** Cache server-side con TTL es esencial para APIs freemium. Implementé cache con TTL de 30 minutos: la primera request puebla el cache, las siguientes 30 minutos lo sirven del cache, después se refresca.

**Cómo aplicarlo:** Implementar `cache: Map<string, { data: T, ts: number }>` con TTL configurable. Función `getCached(key, ttl, fetcher)` que retorna del cache si está fresco, o llama al fetcher y actualiza el cache. Para el cron diario, el cache se invalida automáticamente.

---

### 1.6 — User-Agent personalizado en headers

**Contexto:** HuggingFace Hub devuelve 401 sin `User-Agent` personalizado.

**Qué pasó:** El fetcher de HF fallaba en producción con 401. Costó 2 horas darse cuenta que era el User-Agent.

**Qué aprendí:** Algunas APIs rechazan requests sin `User-Agent` o con User-Agents genéricos de Node.js (porque los confunden con bots). Siempre enviar un User-Agent descriptivo.

**Cómo aplicarlo:** En `fetchWithRetry()`, hardcodear `User-Agent: SelectIA/1.0 (https://github.com/redentor159/selectia)`. Para APIs que lo requieran, añadir headers adicionales (`Accept`, `Accept-Language`).

---

### 1.7 — Timeout con `AbortController`, no con `setTimeout`

**Contexto:** Algunas APIs (Groq status, Helicone) tardaban >30s en responder.

**Qué pasó:** El primer fetcher usaba `setTimeout` para cancelar. Pero el timeout no cancelaba la request HTTP; solo abortaba la promesa. La conexión seguía abierta consumiendo recursos.

**Qué aprendí:** `AbortController` cancela la request HTTP de verdad. `setTimeout` solo cancela la promesa JavaScript, la conexión TCP sigue.

**Cómo aplicarlo:** 
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 12000);
try {
  const res = await fetch(url, { ...opts, signal: controller.signal });
} finally {
  clearTimeout(timeout);
}
```

---

### 1.8 — Retry con backoff exponencial para 429/500

**Contexto:** APIs públicas a veces devuelven 429 (rate limit) o 500 (server error) transitorio.

**Qué pasó:** Sin retry, una API que devuelve 500 una vez se marcaba como roja y no se intentaba de nuevo hasta el cron siguiente.

**Qué aprendí:** 429 y 500 son a menudo transitorios. Un retry con backoff exponencial (500ms, 1000ms) recupera el 80% de los casos.

**Cómo aplicarlo:** `fetchWithRetry(url, opts, retries = 2)` que en caso de 429 o 5xx, espera 500ms × 2^intent y reintenta. En caso de 4xx (no 429), no reintenta (son errores definitivos).

---

### 1.9 — Fallback a seed data, no a vacío

**Contexto:** Si AA falla, ¿qué hace el dashboard?

**Qué pasó:** La primera versión devolvía un array vacío. El dashboard mostraba "No hay datos". Mala UX.

**Qué aprendí:** Tener un dataset seed (`src/lib/data/models.ts`) con 24 modelos reales y usarlo como fallback. Es mejor mostrar 24 modelos correctos que 0 modelos.

**Cómo aplicarlo:** En el orchestrator, si `fetchAA()` falla tras retries, retornar `MODELS` (el seed). Marcar `sourceHealth.aa = red` para que el usuario sepa que está viendo datos stale, pero el dashboard sigue funcional.

---

### 1.10 — Validate con Zod antes de procesar

**Contexto:** BenchLM y ZeroEval devuelven JSON complejo.

**Qué pasó:** Sin validación, un cambio silencioso en el formato de respuesta rompía el pipeline downstream.

**Qué aprendí:** Zod valida el shape del JSON y da errores descriptivos. Si una API cambia un campo de `number` a `string`, Zod lo detecta antes de que rompa el rendering.

**Cómo aplicarlo:** Para cada API crítica, un schema Zod. Si la validación falla, loggear el error y caer al fallback. No procesar JSON no validado.

---

## Sección 2 — Lecciones sobre el motor HRE-TOPSIS

### 2.1 — El II genérico y el II por categoría no son intercambiables

**Contexto:** 7 criterios iniciales con II de Artificial Analysis como inteligencia general.

**Qué pasó:** Tras añadir BenchLM con 8 category scores, queríamos usar el score específico (e.g. coding) para el criterio "II" en categoría "programacion". Pero si lo usábamos en algunos lugares y el II genérico en otros, los rankings eran inconsistentes.

**Qué aprendí:** Definir claramente qué II se usa en cada capa. `extractMetrics(m, category?)` acepta `category` opcional: cuando se pasa, usa `getCategoryIntelligenceIndex(m, category)` (BenchLM si existe); cuando no, usa `m.intelligenceIndex` (AA). Ambos usan el mismo campo en el output.

**Cómo aplicarlo:** Documentar en cada caller de `extractMetrics` si pasa `category` o no, y por qué. Para TOPSIS, siempre pasar `category` (BenchLM-aware). Para `computeEfficiencyCost()`, no pasar (AA genérico, para consistencia con el cálculo de precio).

---

### 2.2 — AHP CR = 0 no significa que los pesos sean correctos

**Contexto:** 24 vectores de pesos AHP (3 modos × 8 categorías).

**Qué pasó:** Tras añadir reliability como 8º criterio, recalibré 24 vectores. Calculé CR para los 24: todos daban 0. Pensé que estaba todo bien. Pero luego me di cuenta que CR = 0 solo significa consistencia matemática, no que los pesos sean correctos.

**Qué aprendí:** CR < 0.1 es necesario pero no suficiente. Saaty lo plantea como filtro, no como objetivo. Los pesos pueden ser consistentes y equivocados.

**Cómo aplicarlo:** AHP se usa como filtro (si CR > 0.1, recalibrar). La validez de los pesos se valida empíricamente: ¿el motor recomienda modelos sensatos para consultas reales? Si no, ajustar pesos y volver a probar.

---

### 2.3 — Piso de calidad por modo

**Contexto:** Modo "Calidad" debe recomendar modelos buenos aunque sean caros.

**Qué pasó:** Sin piso, el motor recomendaba modelos con II bajísimo en modo Calidad porque su precio era 0. Eran modelos "gratis malos", exactamente lo que el modo Calidad quería evitar.

**Qué aprendí:** Cada modo debe tener un piso de calidad distinto. MYPE: sin piso (precio es lo que importa). Calidad: II ≥ 30 (excepto offline: II ≥ 15). Equilibrado: II ≥ 20. Solo Gratis: II ≥ 15.

**Cómo aplicarlo:** Hardcoded thresholds por modo, no por categoría. El offline es excepción porque los modelos locales suelen tener II bajo pero son útiles sin internet.

---

### 2.4 — TOPSIS requiere normalización vectorial, no lineal

**Contexto:** 8 criterios con magnitudes dispares (precio 0-100, II 0-100, speed 1-500, context 2K-1M, elo 1000-1500, reliability 0-1, coding 0-100, agentic 0-100).

**Qué pasó:** La primera versión usaba normalización lineal (`x / max`). Eso hacía que criterios con outliers (context window de 1M) dominaran. Fix: normalización vectorial (`x / sqrt(sum(x^2))`).

**Qué aprendí:** TOPSIS clásico usa normalización vectorial precisamente porque los criterios tienen magnitudes dispares. Lineal solo funciona si todos los criterios están en la misma escala.

**Cómo aplicarlo:** `topsisNormalize(matrix)` divide cada elemento por la norma euclidiana de su columna. Resultado: cada columna queda en escala comparable.

---

### 2.5 — Detectar empates con threshold de 0.03

**Contexto:** A veces dos modelos tienen coeficiente C casi idéntico (e.g. 0.734 y 0.736).

**Qué pasó:** El motor los ordenaba estrictamente, mostrando #1 y #2 como si fueran distintos. El usuario no entendía por qué #1 era mejor que #2 si las métricas eran casi iguales.

**Qué aprendí:** En TOPSIS, diferencias < 0.03 en C son empates técnicos. El motor debe marcarlos como empates y generar razones que expliquen "son equivalentes, decide por otro criterio (precio, preferencia)".

**Cómo aplicarlo:** En `recommend()`, después de ordenar, comparar C de #1 y #2. Si `|C1 - C2| < 0.03`, añadir flag `isTie: true` a la razón y reformularla: "Equivalente a #2 (diferencia < 0.03 en coeficiente C). Decisión: elige por precio o preferencia personal."

---

### 2.6 — Reliability baseline de 0.95 cuando no hay datos de ZeroEval

**Contexto:** ZeroEval cubre solo 36/206 modelos. ¿Qué hacer con los otros 170?

**Qué pasó:** La primera versión ponía `reliability = 0` cuando no había datos. Eso penalizaba injustamente a los 170 modelos sin data.

**Qué aprendí:** Ausencia de datos no es dato de ausencia. Cuando ZeroEval no tiene info, asumir baseline razonable (0.95 = 95% confiable) y marcarlo como "baseline, no medido".

**Cómo aplicarlo:** `reliability = zeroevalFailureRate != null ? 1 - zeroevalFailureRate : 0.95`. En la UI, mostrar `(baseline)` junto al valor para que el usuario sepa que es asunción, no medición.

---

### 2.7 — Razones en español neutro citando fuentes

**Contexto:** El motor debe explicar por qué recomienda un modelo.

**Qué pasó:** La primera versión decía "Este modelo tiene buen equilibrio precio-calidad". Vago. El usuario no entiende qué significa "buen equilibrio".

**Qué aprendí:** Las razones deben citar métricas específicas y fuentes. "Confiabilidad de producción: 89.3% (basado en 169 llamadas monitoreadas por ZeroEval — 10.7% failure rate)" es mejor que "es confiable".

**Cómo aplicarlo:** `generateReasons(winner, category, weights, metrics)` devuelve 1-3 razones, cada una citando:
- La métrica específica (e.g. failure_rate)
- El valor (e.g. 10.7%)
- La fuente (e.g. ZeroEval)
- Contexto adicional (e.g. "basado en 169 llamadas monitoreadas")

---

### 2.8 — TF-IDF determinista, no LLM

**Contexto:** Clasificar la consulta del usuario en 8 categorías.

**Qué pasó:** Consideré usar un LLM para clasificar (más flexible). Pero añadiría 500ms de latencia y costo. Para una MYPE en 3G desde celular, 500ms es mucho.

**Qué aprendí:** TF-IDF con stemming Porter + stopwords en español es determinista y < 1ms. Para clasificación de intenciones en dominio cerrado (8 categorías), es suficiente.

**Cómo aplicarlo:** Cada categoría tiene un "documento virtual" con ~30 palabras clave. La consulta se vectoriza con TF-IDF contra los 8 documentos, se elige la categoría con mayor score. ~30 palabras por categoría, no ~15 (la expansión mejoró precisión de 78% a 92%).

---

### 2.9 — AHP weights deben sumar exactamente 1.000

**Contexto:** 24 vectores AHP recalibrados tras añadir reliability.

**Qué pasó:** Tras la recalibración, 6 vectores sumaban 0.998 o 1.003 por drift de float. AHP funciona con cualquier suma, pero para que los rankings sean comparables, todos deben sumar 1.

**Qué aprendí:** Float drift es real. `0.15 + 0.20 + 0.10 + 0.05 + 0.10 + 0.15 + 0.15 + 0.10` puede dar 0.9999998 o 1.0000002.

**Cómo aplicarlo:** Fórmula: `newWeight = round(oldWeight × (1 - reliabilityWeight), 3)` para los pesos no-zero, y luego nudge ±0.001 en el peso más grande para absorber drift. DEV-only assertion que verifica suma == 1.000 ± 0.001 en los 24 vectores.

---

### 2.10 — Sensitivity analysis para validar pesos

**Contexto:** ¿Qué pasa si cambio un peso en 5%? ¿Cambia el ranking?

**Qué pasó:** No hice sensitivity analysis formal. Solo verifiqué que los rankings se veían sensatos para 5-10 consultas de prueba.

**Qué aprendí:** Sensitivity analysis es necesario para validar que el motor es robusto. Si un cambio del 5% en un peso cambia el ranking dramáticamente, el motor es frágil.

**Cómo aplicarlo:** Existe `sensitivity-analysis.ts` pero no se ha corrido con datos reales. Para v3.4, correr formalmente: variar cada peso en ±5%, ±10%, ±15%, ver cuántas veces cambia el #1. Publicar resultados.

---

## Sección 3 — Lecciones sobre diseño de UI/UX

### 3.1 — Replicar design systems existentes, no inventar

**Contexto:** Yo no soy diseñador. El proyecto necesita verse profesional.

**Qué pasó:** Linear y Stripe publican sus design systems. Los repliqué (con respeto, no copia literal): Inter tipografía, paleta oscura profunda #08090a base, badges "cristal tintado" con rgba(0.10) bg, hairline borders 1px.

**Qué aprendí:** Replicar un design system profesional ahorró 200 decisiones micro-estéticas. No tengo que decidir qué radius usar para botones; Linear ya decidió (6px). No tengo que decidir qué sombra; Stripe ya decidió.

**Cómo aplicarlo:** Antes de empezar a diseñar, identificar 2-3 referentes profesionales. Estudiar sus design systems en detalle (tokens, componentes, motion). Replicar la estructura, no el look literal.

---

### 3.2 — CSS variables para temas intercambiables

**Contexto:** 4 temas (Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro).

**Qué pasó:** La primera versión tenía colores hardcodeados en Tailwind classes (`bg-indigo-500`). Cambiar tema requería tocar 100 archivos. Fix: CSS variables en `:root` y `var(--brand-primary)` en componentes.

**Qué aprendí:** Cero HEX en componentes. Todo via `var(--*)`. Cambiar tema = editar un solo bloque de variables.

**Cómo aplicarlo:** En `globals.css`, definir `:root` con todas las variables. Componentes referencian solo `var(--brand-primary)`, `var(--bg-elevated)`, etc. Para temas, sobrescribir las variables en `[data-theme="..."]`.

---

### 3.3 — Hairline borders, no bordes gruesos

**Contexto:** Bordes en cards, dividers, etc.

**Qué pasó:** Los bordes 2px se veían "pesados". Los 1px se veían "limpios".

**Qué aprendí:** Linear y Stripe usan bordes 1px hairline con color sutil (`rgba(255,255,255,0.08)` en dark). El borde no debe ser protagonista; debe separar visualmente sin gritar.

**Cómo aplicarlo:** `border-width: 1px` siempre. Color: `var(--border-default)` que en dark es `rgba(255,255,255,0.08)` y en light es `rgba(0,0,0,0.08)`.

---

### 3.4 — Tooltips en todas las métricas técnicas

**Contexto:** Tabla Maestra con 23 columnas, muchas técnicas (II, Coding Index, Agentic, etc.).

**Qué pasó:** Sin tooltips, el usuario no sabe qué significa "Agentic Index". Adivina o ignora.

**Qué aprendí:** Toda métrica técnica necesita tooltip con definición, fuente y rango. `Agentic Index: Índice de capacidad para tareas agentivas (Artificial Analysis, 0-100)`.

**Cómo aplicarlo:** Componente `<Th label="Agentic" tooltip="..." />` que envuelve el header con TooltipProvider. Tooltip con 1-2 líneas máximo, sin jerga.

---

### 3.5 — Colores semánticos, no arbitrarios

**Contexto:** Indicadores de estado (verde/amarillo/rojo).

**Qué pasó:** La primera versión usaba `bg-green-500`, `bg-yellow-500`, `bg-red-500`. Funcionaba pero no era consistente.

**Qué aprendí:** Definir tokens semánticos: `--color-success`, `--color-warning`, `--color-error`. Usarlos siempre. Nunca `bg-green-500` directo.

**Cómo aplicarlo:** En `:root`, definir `--color-success: #10b981` (o similar), `--color-warning: #f59e0b`, `--color-error: #ef4444`. Componentes siempre referencian `var(--color-*)`.

---

### 3.6 — Animaciones respetando `prefers-reduced-motion`

**Contexto:** Animaciones en charts, transitions en hover.

**Qué pasó:** Sin respetar `prefers-reduced-motion`, usuarios con vestibular disorders tenían nausea.

**Qué aprendí:** CSS media query `@media (prefers-reduced-motion: reduce)` que desactiva transitions y animations.

**Cómo aplicarlo:** En `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 3.7 — Focus rings accesibles

**Contexto:** Navegación con teclado.

**Qué pasó:** La primera versión no tenía focus rings visibles. Navegar con Tab era imposible.

**Qué aprendí:** Todo elemento clicable debe tener focus ring visible (`outline: 2px solid var(--brand-primary)` o similar).

**Cómo aplicarlo:** `*:focus-visible { outline: 2px solid var(--brand-primary); outline-offset: 2px; }`. No quitar outline en `:focus` (solo en `:focus:not(:focus-visible)` para mouse users).

---

### 3.8 — Mobile-first, 375px mínimo

**Contexto:** MYPEs peruanas acceden mayormente desde celular.

**Qué pasó:** La primera versión era desktop-first. En 375px (iPhone SE), las tablas se cortaban.

**Qué aprendí:** Mobile-first real, no "responsive" decorativo. 375px es el mínimo. Tablas con scroll horizontal si necesitan. KPI cards en grid de 2 columnas en mobile, 4 en desktop.

**Cómo aplicarlo:** En Tailwind, pensar primero en `grid-cols-2` y luego `md:grid-cols-4`. Probar en DevTools con viewport 375x667 antes de cada commit.

---

### 3.9 — Empty states informativos

**Contexto:** ¿Qué muestra el comparador cuando no hay modelos seleccionados?

**Qué pasó:** La primera versión mostraba un div vacío. Mal UX.

**Qué aprendí:** Todo estado vacío debe tener: (1) ícono, (2) título claro, (3) descripción, (4) CTA.

**Cómo aplicarlo:** Componente `<EmptyState icon={Scale} title="Selecciona modelos para comparar" description="Marca hasta 3 modelos en la Tabla Maestra y aparecerán aquí lado a lado." action={<Button>Ir a Tabla</Button>} />`.

---

### 3.10 — Sticky footer con data freshness

**Contexto:** El usuario necesita saber si los datos están frescos.

**Qué pasó:** Sin indicador de freshness, el usuario no sabía si estaba viendo datos de hoy o de hace 2 días.

**Qué aprendí:** Footer sticky con timestamp ("Datos actualizados hace 3 horas · Próximo refresh en 21 horas") + countdown al cron siguiente.

**Cómo aplicarlo:** En el footer, mostrar `lastUpdated` formateado en español neutro ("hace 3 horas"), y countdown al 2 AM Lima siguiente.

---

## Sección 4 — Lecciones sobre multi-IA collaboration

### 4.1 — Cada modelo tiene fortalezas distintas

**Contexto:** 4 modelos en paralelo: GLM-5.2, Claude Sonnet 4.6, Gemini 3.1 Pro, Minimax M3.

**Qué pasó:** Descubrí que cada modelo era mejor en una cosa: GLM escribía código rápido, Claude verificaba, Gemini leía contextos largos, Minimax redactaba.

**Qué aprendí:** No hay un "mejor modelo" universal. Asignar cada modelo a su fortaleza, no usar uno para todo.

**Cómo aplicarlo:** Mapear modelos a roles: GLM = implementación, Claude = verificación, Gemini = análisis de contexto, Minimax = redacción. Documentar las fortalezas observadas para no olvidar.

---

### 4.2 — Cross-audit encuentra bugs que el autor no ve

**Contexto:** Bug sutil en `hre-topsis.ts` (quality gate sin BenchLM confidence check).

**Qué pasó:** GLM no lo encontró (lo escribió). Yo no lo encontré (lo leí 3 veces). Claude lo encontró en una auditoría dirigida.

**Qué aprendí:** Un segundo modelo siempre encuentra lo que el primero no ve. Es como tener un code reviewer.

**Cómo aplicarlo:** Para código crítico (motor, seguridad, pagos), pasar el archivo a otro modelo con prompt "Lee esto completo y dime si hay algún bug sutil". No escribir código, solo diagnósticos.

---

### 4.3 — El humano es el grafo

**Contexto:** Decidí no usar LangGraph ni orquestadores.

**Qué pasó:** Copiar-pegar entre 4 interfaces tomaba ~40% de mi tiempo. Pero tenía visibilidad total: cada decisión la tomaba yo.

**Qué aprendí:** El overhead de switching es real, pero la visibilidad vale la pena para proyectos cortos. Para proyectos largos (>3 meses), evaluar framework.

**Cómo aplicarlo:** Mantener un archivo `notas/rounds.md` con cada ronda de prompts y respuestas. Cada noche, consolidar a `notas/decisions.md` con las decisiones tomadas.

---

### 4.4 — Contexto compartido es crítico

**Contexto:** Pasar info de una IA a otra.

**Qué pasó:** Si pasaba solo la respuesta (sin el prompt original), la IA receptora malinterpretaba.

**Qué aprendí:** Siempre incluir: (1) prompt original, (2) respuesta, (3) mis notas sobre la respuesta. Eso da contexto completo.

**Cómo aplicarlo:** Plantilla de handoff:
```
## Contexto
[Descripción breve]

## Prompt original
[Prompt que generó la respuesta]

## Respuesta del modelo X
[Respuesta]

## Mis notas
[Lo que pienso de la respuesta, qué falta, qué cambiar]
```

---

### 4.5 — Pide a cada IA su opinión sobre las otras

**Contexto:** 4 respuestas para una misma pregunta.

**Qué pasó:** Si solo las leía, no sacaba valor del cruce. Si les pedía a las IAs que criticaran las respuestas de las otras, encontraban inconsistencias.

**Qué aprendí:** El ensemble de IAs funciona mejor cuando se critican entre sí, no cuando operan en paralelo silencioso.

**Cómo aplicarlo:** "Aquí están las respuestas de los modelos A, B, C a la pregunta X. Dime cuál tiene razón, dónde están equivocados, y qué falta en todas."

---

### 4.6 — Redacción en español neutro: Minimax vence

**Contexto:** Escribir textos UI en español neutro.

**Qué pasó:** Claude tendía al castellano de España ("ordenador", "móvil"). GLM tendía al spanglish. Gemini era aceptable pero formal. Minimax era el más natural en LatAm.

**Qué aprendí:** Para textos面向 usuario en LatAm, Minimax M3 produce español neutro más natural que los otros.

**Cómo aplicarlo:** Usar Minimax para strings UI, headers, tooltips, errores. Para código y lógica, GLM o Claude. Para análisis, Gemini.

---

### 4.7 — Las IAs no proponen preguntas; solo responden

**Contexto:** Yo quería que las IAs me sugirieran qué investigar.

**Qué pasó:** Las IAs respondían lo que se les preguntaba. Rara vez proponían preguntas nuevas.

**Qué aprendí:** La iniciativa es humana. Las IAs son reactivas. Yo sigo siendo necesario para decidir qué preguntar.

**Cómo aplicarlo:** Al final de cada sesión, escribir 3 preguntas nuevas que surjan de las respuestas. Ese es el input de la sesión siguiente.

---

### 4.8 — Documentar prompts efectivos

**Contexto:** Después de 4 semanas, olvidé qué prompts funcionaron.

**Qué pasó:** Tuve que reconstruir de memoria los prompts que dieron buenos resultados.

**Qué aprendí:** Mantener un archivo `notas/prompts-efectivos.md` con los prompts que dieron resultados sobresalientes. Sirve para el próximo proyecto.

**Cómo aplicarlo:** Cada vez que un prompt da una respuesta excepcional, copiarlo al archivo con fecha y contexto. Ver `CONVERSACIONES_INVESTIGACION.md` sección 8 para 8 ejemplos.

---

## Sección 5 — Lecciones sobre performance

### 5.1 — JSON estático > API en runtime

**Contexto:** 206 modelos, 13 fuentes, dashboard rápido.

**Qué pasó:** Si el dashboard llamaba a las 13 APIs en runtime, tardaba 5-10 segundos. Con JSON estático servido por Vercel CDN, tarda <100ms.

**Qué aprendí:** Para datos que cambian diariamente (no segundo a segundo), JSON estático es mejor que API en runtime. Cron diario genera el JSON, Vercel lo sirve.

**Cómo aplicarlo:** GitHub Actions workflow a las 2 AM Lima (07:00 UTC) ejecuta `bun run scripts/generate-static-json.ts` que llama las 13 APIs, genera `master_dashboard_data.json` (376 KB), y commitea al repo. Vercel lo sirve como static file.

---

### 5.2 — <500 KB límite para JSON

**Contexto:** JSON maestro con 206 modelos + 13 fuentes + 21 monedas + 176 términos.

**Qué pasó:** Sin límite, el JSON crecía descontrolado. 1 MB descargaba lento en 3G.

**Qué aprendí:** Imponer límite duro de 500 KB. Si se excede, recortar campos menos usados o paginar.

**Cómo aplicarlo:** En `generate-static-json.ts`, después de generar, verificar `fs.statSync(path).size < 500 * 1024`. Si excede, loggear warning y eliminar campos opcionales (e.g. `benchlmStats` redundantes).

---

### 5.3 — Lint 0 errors antes de cada commit

**Contexto:** Calidad de código.

**Qué pasó:** La primera versión tenía 14 warnings de lint. Cada uno era una deuda técnica.

**Qué aprendí:** Lint 0 es la línea base. No se mergea nada con warnings.

**Cómo aplicarlo:** Pre-commit hook con husky que ejecuta `bun run lint`. Si hay warnings, aborta el commit.

---

### 5.4 — TypeScript estricto desde el día 1

**Contexto:** Tipos en todo el código.

**Qué pasó:** La primera versión tenía `any` en varios lugares. Refactor fue doloroso.

**Qué aprendí:** TypeScript estricto (`strict: true` en tsconfig) desde el día 1. Costó tiempo al inicio, ahorró tiempo en refactor.

**Cómo aplicarlo:** En `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

---

### 5.5 — Code splitting por vista

**Contexto:** 19 vistas, muchas pesadas (Recharts).

**Qué pasó:** La primera versión cargaba todas las vistas en el bundle inicial. Lento.

**Qué aprendí:** `next/dynamic` con `ssr: false` para vistas pesadas. Solo se cargan cuando el usuario las abre.

**Cómo aplicarlo:** `const OverviewView = dynamic(() => import('./overview-view'), { ssr: false })`. Reduce bundle inicial de 800 KB a 250 KB.

---

### 5.6 — TanStack Query para cache de cliente

**Contexto:** El dashboard carga datos del JSON estático.

**Qué pasó:** Sin cache, cada cambio de vista volvía a fetchear el JSON.

**Qué aprendí:** TanStack Query cachea el JSON en cliente. Solo refresca cuando el usuario lo pide o cuando el `staleTime` expira.

**Cómo aplicarlo:** `useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard, staleTime: 1000 * 60 * 60 })` (1 hora de cache).

---

### 5.7 — Zustand + persist para estado de UI

**Contexto:** Filtros, moneda seleccionada, tema, modo.

**Qué pasó:** Sin persistencia, el usuario perdía sus preferencias al refresh.

**Qué aprendí:** Zustand con middleware `persist` guarda en localStorage. Restaurar al cargar.

**Cómo aplicarlo:** `const useStore = create(persist((set) => ({ ... }), { name: 'selectia-store' }))`. Cuidado: no persistir datos sensibles.

---

### 5.8 — Recharts es pesado; considerar alternativas

**Contexto:** 6 charts (scatter, bar, radar, line, etc.).

**Qué pasó:** Recharts añade ~150 KB al bundle. Es mucho para unos charts.

**Qué aprendí:** Para v3.4, evaluar Visx o D3 directamente. Más código pero menos bundle.

**Cómo aplicarlo:** Por ahora, acceptar Recharts. Para v3.4, spike de migración a Visx. Si el bundle cae >30%, migrar.

---

## Sección 6 — Lecciones sobre open source

### 6.1 — LICENSE MIT maximiza adopción

**Contexto:** Elegir licencia.

**Qué pasó:** Consideré GPL (viral) y Apache 2.0 (patent clause). MIT fue la opción más simple y menos intimidante.

**Qué aprendí:** MIT es la licencia más permisiva. Cualquiera puede usar, modificar, distribuir, incluso comercialmente, sin contaminar su código. Maximiza adopción.

**Cómo aplicarlo:** Archivo `LICENSE` con texto MIT estándar. Badge en README: `[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]`.

---

### 6.2 — README es el primer contacto

**Contexto:** GitHub: 90% de visitors leen solo README.

**Qué pasó:** La primera versión del README era técnico y aburrido. Pocos llegaban al final.

**Qué aprendí:** README debe responder en 30 segundos: (1) qué es, (2) por qué usarlo, (3) cómo empezar, (4) cómo contribuir. Badges, screenshot, quick start, métricas.

**Cómo aplicarlo:** Estructura: badge row → screenshot → 1-paragraph description → features table → architecture diagram → quick start → tech stack → métricas → links. Nada de teoría al inicio.

---

### 6.3 — CONTRIBUTING.md baja la barrera

**Contexto:** Quiero que otros contribuyan.

**Qué pasó:** Sin CONTRIBUTING.md, los contributors potenciales no sabían por dónde empezar.

**Qué aprendí:** CONTRIBUTING.md debe explicar: (1) setup local, (2) estructura del código, (3) convenciones (commits, branches), (4) cómo reportar bugs, (5) cómo proponer features.

**Cómo aplicarlo:** 100-200 líneas, con ejemplos de comandos. Linkear desde README.

---

### 6.4 — CHANGELOG con versionado semántico

**Contexto:** Versionar releases.

**Qué pasó:** Empecé sin changelog. Tras 3 versiones, no recordaba qué cambió en cada una.

**Qué aprendí:** CHANGELOG.md siguiendo "Keep a Changelog" con versionado semántico (major.minor.patch).

**Cómo aplicarlo:** Cada release: `## [3.3.1] - 2026-07-30` con secciones `### ✨ Features`, `### 🐛 Bugs`, `### 📊 Métricas`. Ver `CHANGELOG.md` actual.

---

### 6.5 — Privacy Policy + Terms of Service obligatorios

**Contexto:** El dashboard muestra datos externos y tipos de cambio.

**Qué pasó:** Sin Privacy/Terms, los usuarios desconfían. Vercel lo recomienda.

**Qué aprendí:** Aunque sea un PoC, tener `/privacy` y `/terms` da seriedad. Texto simple, no legal-tech denso.

**Cómo aplicarlo:** Páginas Next.js en `app/privacy/page.tsx` y `app/terms/page.tsx`. Texto en español neutro, 200-300 palabras cada uno. Linkear desde footer.

---

### 6.6 — Issues templates y PR template

**Contexto:** Recibir bugs y PRs organizados.

**Qué pasó:** Sin templates, los issues llegan sin info ("no funciona"). Los PRs sin descripción.

**Qué aprendí:** `.github/ISSUE_TEMPLATE/bug_report.md` y `feature_request.md` + `.github/PULL_REQUEST_TEMPLATE.md`.

**Cómo aplicarlo:** Templates con campos: descripción, pasos para reproducir, comportamiento esperado, comportamiento actual, ambiente (OS, navegador, versión). PR template con: qué cambia, por qué, cómo testear.

---

## Sección 7 — Lecciones sobre documentación

### 7.1 — Documentar decisiones, no solo código

**Contexto:** `worklog.md` con 1,300+ líneas.

**Qué pasó:** Solo documentaba "qué hice". Olvidé "por qué lo hice". Al volver 2 semanas después, no recordaba por qué cierta decisión.

**Qué aprendí:** Documentar decisiones con contexto. No solo "añadí X", sino "añadí X porque Y, descarté Z porque W".

**Cómo aplicarlo:** Plantilla: `Decisión: [qué] · Contexto: [por qué] · Alternativas descartadas: [cuáles] · Consecuencias: [qué cambia]`.

---

### 7.2 — Diagramas Mermaid > texto

**Contexto:** README con arquitectura.

**Qué pasó:** Describir arquitectura en párrafos era ilegible. Diagrama Mermaid en 10 líneas lo explicó mejor que 200 palabras.

**Qué aprendí:** Mermaid es soportado nativamente por GitHub. Diagramas > texto para arquitectura, flujos, estados.

**Cómo aplicarlo:** En README y docs, usar ```mermaid para flowcharts, sequence diagrams, class diagrams. Renderiza en GitHub sin plugins.

---

### 7.3 — Métricas visibles en README

**Contexto:** Mostrar el tamaño del proyecto.

**Qué pasó:** Sin métricas, el lector no capta la magnitud. Con tabla de métricas (31,116 LOC, 206 modelos, 13 fuentes, etc.), entiende en 5 segundos.

**Qué aprendí:** Tabla de métricas al final del README. Números concretos, no adjetivos.

**Cómo aplicarlo:** `## 📈 Métricas del proyecto` con tabla de 10-15 métricas. Actualizar en cada release.

---

### 7.4 — Ejemplos de código ejecutables

**Contexto:** Mostrar cómo usar el proyecto.

**Qué pasó:** Ejemplos abstractos ("`SelectIA.recommend(query)`") no ayudaban. Ejemplos con bash real (`bun run dev`) sí.

**Qué aprendí:** Quick start con bash commands reales que el usuario puede copiar-pegar y ejecutar.

**Cómo aplicarlo:** Bloques ```bash con comandos completos. Comentarios `# 1. Clonar`, `# 2. Instalar`, etc.

---

### 7.5 — Glosario integrado

**Contexto:** Términos técnicos que el usuario no conoce.

**Qué pasó:** Sin glosario, el usuario abandonaba cuando leía "TOPSIS" o "AHP" sin saber qué era.

**Qué aprendí:** Glosario integrado en el producto (modal), no solo en docs externas. 176 términos con deepDives.

**Cómo aplicarlo:** En el header, botón "📚 Glosario" que abre modal. Términos intercorrelacionados (links entre ellos). 15 deepDives expandibles para conceptos densos.

---

### 7.6 — Documentación para diferentes audiencias

**Contexto:** README es para usuarios; ARCHITECTURE es para devs; DEPLOYMENT es para ops.

**Qué pasó:** La primera versión mezclaba todo en README. 500 líneas confusas.

**Qué aprendí:** Separar docs por audiencia. README: usuarios. ARCHITECTURE: devs. DEPLOYMENT: ops. CONTRIBUTING: contributors.

**Cómo aplicarlo:** Index en `docs/INDEX.md` que linkea a los demás. Cada archivo dice al inicio "Audiencia: ...".

---

## Sección 8 — Anti-lecciones (errores a evitar)

### 8.1 — NO uses II de BenchLM y II de AA mezclados

**Contexto:** Bug #9 del CHANGELOG.

**Qué pasó:** `extractMetrics()` usaba II de BenchLM, `computeEfficiencyCost()` usaba II de AA. El ranking se basaba en uno, el cálculo de eficiencia en otro. Inconsistencia.

**Qué aprendí:** Definir claramente qué II se usa en cada capa. Documentarlo.

**Cómo evitarlo:** Comentario en `extractMetrics` explicando cuándo usa BenchLM y cuándo AA. Tests que verifiquen consistencia.

---

### 8.2 — NO asumas que los nombres matchean entre APIs

**Contexto:** Bug #15 (ContextWindow corrupto, 210 modelos con 8K falso).

**Qué pasó:** Asumí que "Claude Opus 4.7" en AA == "Claude Opus 4.7" en LiteLLM. Falso: AA trae sufijos `(Adaptive)`, `(High)`, etc.

**Qué aprendí:** Siempre normalizar antes de matching. 2 pasadas (sin sufijo, con sufijo).

**Cómo evitarlo:** `normalizeForMatching()` obligatorio para cualquier matching cross-API. Tests con nombres reales de las APIs.

---

### 8.3 — NO dejes `isAnimationActive` en Recharts

**Contexto:** 3 errores TSC.

**Qué pasó:** Recharts deprecó `isAnimationActive` y `style` en ciertas props. 3 archivos no compilaban.

**Qué aprendí:** Mantenerse al día con breaking changes de dependencias. Leer changelog de cada release.

**Cómo evitarlo:** `bun upgrade` periódico. Verificar `npx tsc --noEmit` después de cada upgrade.

---

### 8.4 — NO uses `key={p.name}` si hay chance de duplicados

**Contexto:** React keys duplicadas en 4 archivos.

**Qué pasó:** Dos proveedores con el mismo nombre (raro pero posible) causaban keys duplicadas. React warning feo.

**Qué aprendí:** Keys siempre con identificador único. Si no hay id natural, usar `${name}-${index}`.

**Cómo evitarlo:** Linting custom que detecte `key={...name}` sin index. O simplemente usar ids siempre.

---

### 8.5 — NO publishes sin Privacy Policy y Terms

**Contexto:** Consideré saltármelos por ser PoC.

**Qué pasó:** Lo consideré. Después pensé: si alguien lo va a usar, debe haber reglas claras. Lo escribí.

**Qué aprendí:** Aunque sea PoC, Privacy + Terms da seriedad y protege legalmente.

**Cómo evitarlo:** Templates de TermsHub o similar. 200 palabras cada uno. Páginas `/privacy` y `/terms`.

---

### 8.6 — NO añadas dependencias nuevas para una sola feature

**Contexto:** Fase 5 (BenchLM + ZeroEval).

**Qué pasó:** Consideré añadir `react-query-devtools` para debugging. Decidí no hacerlo. La feature (8 criterios) se implementó con componentes existentes (Alert, Tooltip).

**Qué aprendí:** Cada dependencia nueva añade tamaño al bundle y riesgo de rotura. Preferir composición sobre dependencia.

**Cómo evitarlo:** Antes de `bun add`, preguntar: ¿puedo hacerlo con lo que tengo? 9/10 veces la respuesta es sí.

---

### 8.7 — NO hagas `console.log` en producción

**Contexto:** Debugging.

**Qué pasó:** Dejé varios `console.log` en el orchestrator. En producción, llenaba los logs de Vercel.

**Qué aprendí:** Usar logger con niveles. En producción, solo warnings y errors.

**Cómo evitarlo:** Wrapper `log.debug()`, `log.info()`, `log.warn()`, `log.error()` que respeta `NODE_ENV`. Borrar `console.log` antes de commit (lint rule).

---

### 8.8 — NO asumas que el cron funciona sin monitoreo

**Contexto:** GitHub Actions cron a las 2 AM Lima.

**Qué pasó:** Si el cron falla (API caída, JSON muy grande, etc.), nadie se entera hasta que un usuario reporta datos stale.

**Qué aprendí:** Monitorear el cron. Enviar alerta (ntfy.sh) si falla.

**Cómo evitarlo:** En el workflow de GitHub Actions, step final que hace `curl` a `ntfy.sh/selectia-alerts` con `high` priority si el paso anterior falla. `if: failure()`.

---

## Cierre — Síntesis

56 lecciones en 8 secciones. Si tuviera que destilarlas en 5 principios:

1. **Verifica antes de programar.** Una hora de `curl` y `cat` ahorra un día de debugging.
2. **Diseña para el fallo.** Si tienes 13 APIs, asume que 1 va a fallar siempre. `Promise.allSettled` + fallback + `SourceHealth`.
3. **Cada modelo es un especialista, no un generalista.** Asignar por fortaleza, no usar uno para todo.
4. **Documenta decisiones, no solo código.** El "por qué" importa más que el "qué".
5. **Termina lo que empiezas.** El 80% de los proyectos mueren en el 80%. Llegar al 100% (aunque sea imperfecto) vale más que 5 proyectos al 80%.

SelectIA v3.3.1 es la materialización de estas lecciones. No es perfecto. Pero está terminado, documentado, y publicado como MIT. Eso, en mi opinión, ya es una victoria.

---

*Documento cerrado el 30 de julio de 2026. SelectIA v3.3.1.*
