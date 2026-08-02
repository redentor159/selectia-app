# SelectIA — Decisiones de Diseño (Architecture Decision Records)

**Proyecto**: SelectIA v3.3.1 — Command Center de Modelos de IA para MYPEs latinoamericanas
**Autor**: José Jesús Alejandro Soria Vásquez — Ingeniería Industrial (Perú)
**Repo**: github.com/redentor159/selectia
**Licencia**: MIT
**Documento**: 20 ADRs (Architecture Decision Records) que registran las decisiones clave del proyecto.

---

## Cómo leer este documento

- Cada **ADR** sigue una estructura fija: **Contexto**, **Decisión**, **Alternativas consideradas**, **Consecuencias**, **Fecha**.
- Los ADRs están numerados secuencialmente (ADR-001 a ADR-020).
- Las fechas son aproximadas, en formato **Año-Mes**.
- Las decisiones **no se revierten**: si una decisión se cambia, se escribe un nuevo ADR que lo supersedes (ej. ADR-008 "8 criterios" supersede un hipotético ADR "7 criterios" anterior).
- Las decisiones son **defendibles**: cada una tiene alternativas consideradas, lo que permite entender por qué se tomó esa opción y no otra.

---

## ADR-001: Next.js 16 App Router

**Fecha**: 2026-04

### Contexto

SelectIA necesita un framework web que soporte:
- Renderizado estático de un JSON grande (376 KB) servido sin servidor en tiempo de ejecución.
- Rutas dinámicas ligeras (`/api/dashboard`, `/api/health`) sin desplegar un backend separado.
- SEO básico (meta tags, sitemap, robots.txt).
- TypeScript estricto.
- Deploy simple en tier gratuito de Vercel.

### Decisión

Usar **Next.js 16.1.3 con App Router**. El App Router permite definir rutas con `app/` directory, server components por defecto, y un sistema de metadata declarativo.

### Alternativas consideradas

- **Remix**. Buen enfoque en web estándar, pero su ecosistema es menor y Vercel free tier está optimizado para Next.
- **SvelteKit**. Excelente DX y bundle más pequeño, pero la biblioteca de componentes (shadcn/ui) no tiene equivalente al mismo nivel.
- **Astro**. Perfecto para contenido estático, pero limitado para estado de cliente complejo como el que SelectIA necesita (Zustand + TanStack Query).
- **Vite + React puro**. Más control, pero se pierde el server components y se complica el deploy.

### Consecuencias

- ✅ Deploy en Vercel free sin configuración.
- ✅ Server components permiten fetch del JSON en build time.
- ✅ Metadata API da SEO sin dependencias adicionales.
- ⚠️ El App Router tiene una curva de aprendizaje y algunos patrones son contraintuitivos (ej. `'use client'` en el momento justo).
- ⚠️ Versiones mayores de Next (15 → 16) rompieron APIs; mantenerse al día requiere trabajo.

---

## ADR-002: TypeScript strict mode

**Fecha**: 2026-04

### Contexto

SelectIA maneja datos heterogéneos (13 fuentes con esquemas distintos) y un motor matemático (HRE-TOPSIS, AHP). Sin tipado estricto, es fácil introducir bugs sutiles (un `null` mal manejado, un campo opcional que se asume obligatorio).

### Decisión

Usar **TypeScript 5 con `strict: true`** en `tsconfig.json`. Adicionalmente, **Zod 4.0.2** para validar esquemas en tiempo de ejecución (especialmente el JSON maestro y las respuestas de APIs externas).

### Alternativas consideradas

- **TypeScript sin strict**. Más rápido de escribir, pero perdía la mitad del valor del tipado.
- **JavaScript con JSDoc**. Posible pero verboso, y el IDE no ayudaba tanto.
- **TypeScript + Yup / Joi**. Zod ganó por mejor inferencia de tipos (`z.infer<typeof schema>`).

### Consecuencias

- ✅ Cero bugs de tipo "undefined is not a function" en producción.
- ✅ Refactors seguros (el compilador avisa).
- ✅ Documentación viva: los tipos son la documentación del JSON.
- ⚠️ Más verbose en algunos archivos.
- ⚠️ Compilación ligeramente más lenta.

---

## ADR-003: Tailwind CSS 4 + shadcn/ui (variante New York)

**Fecha**: 2026-04

### Contexto

SelectIA necesita:
- Sistema de diseño consistente (botones, cards, tablas, modales, dropdowns).
- Soporte multi-tema (4 temas: Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro).
- Accesibilidad (focus rings, ARIA, keyboard navigation).
- Productividad: no escribir CSS desde cero.

### Decisión

Usar **Tailwind CSS 4** para estilos utilitarios y **shadcn/ui (variante New York)** para componentes base. shadcn/ui no es una dependencia npm: el código de cada componente se copia al repo (`src/components/ui/`), lo que da control total para personalizar.

### Alternativas consideradas

- **Material UI**. Completo pero opinionated y difícil de tematizar fuera de Material.
- **Chakra UI**. Bueno pero con runtime overhead (Emotion) que pesa en bundle.
- **Radix UI puro**. Excelente accesibilidad pero sin estilos; habría que escribir mucho CSS.
- **Mantine**. Sólido pero más cerrado que shadcn/ui.

### Consecuencias

- ✅ Accesibilidad out-of-the-box (Radix por debajo).
- ✅ Multi-tema con CSS variables y `data-theme` attribute.
- ✅ Componentes modificables sin parchear node_modules.
- ⚠️ El bundle de `src/components/ui/` crece (54+ archivos) pero todos son tree-shakeables.
- ⚠️ Actualizar shadcn/ui requiere merge manual.

---

## ADR-004: Zustand para estado del cliente

**Fecha**: 2026-04

### Contexto

SelectIA tiene estado de UI global: filtros activos, categoría seleccionada, modo (Ahorro/Equilibrado/Calidad), moneda, tema, resultado del recomendador. Este estado se comparte entre el sidebar, las vistas, la barra de filtros y el header.

### Decisión

Usar **Zustand 5** para estado del cliente. Store único en `src/store/dashboard-store.ts` con slices por dominio (filtros, UI, recomendador).

### Alternativas consideradas

- **Redux Toolkit**. Maduro pero verbose; SelectIA no necesita devtools avanzados.
- **Jotai / Recoil**. Átomos son elegantes pero el modelo mental es más complejo que un store simple.
- **React Context + useReducer**. Suficiente para cosas pequeñas, pero re-renders innecesarios.
- **useState en componentes**. Inmanejable cuando el estado se comparte entre 5+ vistas.

### Consecuencias

- ✅ API minimalista (`create<State>()`).
- ✅ Selectores finos con `useStore(s => s.x)` para evitar re-renders.
- ✅ Persistencia opcional con middleware `persist`.
- ⚠️ No hay devtools tan ricos como Redux.

---

## ADR-005: TanStack Query para estado del servidor

**Fecha**: 2026-04

### Contexto

SelectIA necesita:
- Cargar el JSON maestro (376 KB) en el cliente.
- Refrescar periódicamente (cada 24 h, dado el cron).
- Cache para evitar refetch innecesario.
- Estados de loading/error/success tipados.

### Decisión

Usar **TanStack Query 5** para todo fetch al servidor. El JSON maestro se carga con `useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard, staleTime: 24h })`.

### Alternativas consideradas

- **SWR**. Más simple pero menos features.
- **fetch + useEffect + useState**. Funciona pero es propenso a bugs (race conditions, cleanup).
- **Apollo Client**. Overkill (no hay GraphQL).

### Consecuencias

- ✅ Cache automática con invalidación por queryKey.
- ✅ Devtools excelentes.
- ✅ Stale-while-revalidate por defecto.
- ⚠️ Bundle adicional (~12 KB gzipped).

---

## ADR-006: JSON estático + cron job (vs API en vivo en cada request)

**Fecha**: 2026-04

### Contexto

SelectIA consume 13 fuentes de datos en vivo. Si cada request del usuario hiciera fetch a las 13 fuentes:
- Latencia del orden de segundos (no milisegundos).
- Agotamiento de rate limits de las APIs gratuitas.
- Costo de servidor elevado (no entraría en Vercel free).

### Decisión

Arquitectura **JSON estático + cron job**: un workflow de GitHub Actions corre a las 2 AM Lima, descarga las 13 fuentes, normaliza, y commitea un único archivo `public/data/master_dashboard_data.json` (376 KB). La app web solo sirve ese archivo vía static hosting.

### Alternativas consideradas

- **API en vivo en cada request**. Inviable por rate limits y costo.
- **Edge function con cache de 1h**. Mejor pero más complejo y sin ganancia real.
- **GraphQL gateway**. Overkill.
- **Webhook push desde las fuentes**. La mayoría no soporta webhooks.

### Consecuencias

- ✅ Latencia < 10 ms por recomendación (todo en cliente).
- ✅ Cero costo de servidor (Vercel free).
- ✅ Tolerancia a fallos: si una API falla, el último snapshot se conserva.
- ⚠️ Datos pueden tener hasta 24 h de antigüedad.
- ⚠️ El cron es un punto único de falla (si GitHub Actions cae, no se actualiza).

---

## ADR-007: HRE-TOPSIS de 5 capas

**Fecha**: 2026-05

### Contexto

El usuario MYPE necesita un ranking de modelos de IA. Requisitos:
- Explicable (no una caja negra).
- Multi-criterio (8 criterios en pugna: precio, II, coding, etc.).
- Con restricciones (piso de calidad, tope de precio).
- Rápido (< 10 ms por query en cliente).

### Decisión

Implementar un motor **HRE-TOPSIS de 5 capas**:
1. Normalización de métricas crudas (min-max y z-score).
2. Aplicación de pesos AHP (24 vectores pre-calibrados).
3. Cálculo de distancias Euclidiana al ideal y anti-ideal.
4. Aplicación de restricciones duras (piso II ≥ 30 en modo Calidad).
5. Ranking con score de cercanía relativa + perfil explicable.

### Alternativas consideradas

- **PROMETHEE**. Más sofisticado pero más difícil de explicar.
- **Simple Additive Weighting (SAW)**. Más simple pero no maneja trade-offs no lineales.
- **Random Forest / ML**. Caja negra, no defendible.
- **LLM as judge**. Caro, lento, no determinista.

### Consecuencias

- ✅ Explicabilidad matemática completa (cada score se descompone).
- ✅ Latencia baja (matemáticas simples, 8 dimensiones).
- ✅ Restricciones explícitas y auditables.
- ⚠️ AHP asume independencia de criterios (no siempre cierto: precio y speed correlacionan).

---

## ADR-008: 8 criterios (añadido reliability en v3.3.1)

**Fecha**: 2026-07 (revisión)

### Contexto

Originalmente SelectIA usaba 7 criterios: precio, II, coding, agentic, speed, context, elo. Pero un modelo puede ser brillante en benchmarks y fallar en producción (rate limits, timeouts, alucinaciones en edge cases). Esto no lo capturaba ningún criterio existente.

### Decisión

Añadir un octavo criterio: **reliability** (confiabilidad), basado en datos de **ZeroEval** (failure rate, P95 latencia, total llamadas). El score de reliability = `1 - failure_rate`. Con esto, los 24 vectores AHP se recalibraron a 8 criterios.

### Alternativas consideradas

- **No añadir nada**. Quedarse con 7. Problema: la brecha entre benchmark y producción no se cubre.
- **Añadir múltiples criterios** (reliability + observability + uptime). Sobrecomplica el modelo; datos no disponibles para todos los modelos.
- **Reemplazar II por reliability**. Pierde inteligencia, que sí es importante.

### Consecuencias

- ✅ Modelos con alta II pero failure rate alto bajan en el ranking (más realista).
- ✅ ZeroEval aporta datos de producción real.
- ⚠️ Coverage parcial: solo ~20 % de los modelos tienen datos de ZeroEval. Los demás se asumen reliability = 0.95 (baseline).
- ⚠️ AHP recalibrado requiere re-verificar CR = 0.

---

## ADR-009: AHP con 24 vectores pre-calibrados

**Fecha**: 2026-05

### Contexto

El motor necesita pesos por criterio. Estos pesos dependen de:
- El **modo** de uso (Ahorro, Equilibrado, Calidad).
- La **categoría** de la tarea (razonamiento, coding, agentic, matemática, visión, audio, embeddings, multimodal).

3 modos × 8 categorías = 24 vectores de pesos.

### Decisión

Pre-calibrar los 24 vectores AHP manualmente, con matrices de comparación pareada perfectamente consistentes (CR = 0). Verificación automatizada en `src/lib/engine/ahp-verification.ts`.

### Alternativas consideradas

- **Pesos derivados de encuestas a usuarios**. Más democrático pero introduces inconsistencia (CR > 0.10) y ruido.
- **Pesos dinámicos aprendidos por el sistema**. Black box, no defendible.
- **Un solo vector universal**. Pierde la especialización por categoría.
- **AHP Fuzzy**. Más expresivo pero CR se vuelve difuso y difícil de comunicar.

### Consecuencias

- ✅ CR = 0 garantiza consistencia matemática.
- ✅ Cada combinación modo×categoría tiene pesos especializados.
- ✅ Auditables en código.
- ⚠️ 24 vectores es mucho para un humano; el usuario no los ve directamente, solo elija modo y categoría.

---

## ADR-010: TF-IDF + Porter stemmer en español

**Fecha**: 2026-05

### Contexto

El usuario MYPE describe su tarea en lenguaje natural ("quiero un modelo barato para programar"). SelectIA necesita mapear esa frase a una de las 8 categorías internas. Para eso, un clasificador de texto simple.

### Decisión

Implementar un clasificador **TF-IDF con stemming Porter en español**. Cada categoría tiene ~30 palabras representativas, predefinidas. El input del usuario se tokeniza, se stemmiza, se calcula TF-IDF contra los 8 documentos categoría, y se elige el argmax.

### Alternativas consideradas

- **LLM para clasificar**. Caro, lento, no determinista.
- **Embeddings + cosine similarity**. Mejor calidad pero requiere cargar modelo de embeddings (~50 MB) en cliente.
- **Reglas regex**. Frágil.
- **No clasificar**. Forzar al usuario a elegir categoría manualmente.

### Consecuencias

- ✅ Cero costo (corre en cliente, sin API).
- ✅ Determinista (mismo input → misma categoría).
- ✅ Bundle mínimo (~3 KB).
- ⚠️ Precisión limitada (~75 % en pruebas informales). El usuario puede siempre corregir manualmente.

---

## ADR-011: Piso de calidad II ≥ 30 en modo Calidad

**Fecha**: 2026-07

### Contexto

En modo Calidad, antes de v3.3.1, el motor recomendaba modelos extremadamente baratos pero con II bajísimo (modelos legacy como GPT-3.5 con II = 15). El resultado era técnicamente "barato y de calidad" según el vector de pesos, pero en la práctica inútil para tareas exigentes.

### Decisión

Añadir una **restricción dura en modo Calidad**: cualquier modelo con II < 30 se descarta, sin importar cuán bien rankee en el resto. Esto es un piso de calidad, no un peso.

### Alternativas consideradas

- **Subir el peso de II en el vector Calidad**. Suaviza pero no elimina el problema: modelos con II = 20 seguían apareciendo.
- **Piso en otro criterio (coding, agentic)**. II es el más transversal, así que es el mejor piso.
- **Piso dinámico según categoría**. Más complejo, sin ganancia clara.

### Consecuencias

- ✅ Recomendaciones de modo Calidad son realmente útiles.
- ✅ Implementación simple (un filter en la capa 4 del motor).
- ⚠️ Algunos modelos legacy quedan excluidos del modo Calidad (esperado).

---

## ADR-012: 4 temas (Linear Claro/Oscuro, Blanco/Negro Puro)

**Fecha**: 2026-06

### Contexto

La audiencia de SelectIA es variada: reclutadores técnicos (prefieren oscuro), ferias universitarias (claro para proyectar), inversores (claro para leer), uso en planta con sol (blanco puro con alto contraste).

### Decisión

Implementar 4 temas:
- **Linear Claro** — fondo blanco, acentos indigo (extraído de Linear.app).
- **Linear Oscuro** — fondo `#08090a`, acentos indigo (default).
- **Blanco Puro** — máximo contraste, sin colores de marca (accesibilidad).
- **Negro Puro** — máximo contraste invertido.

### Alternativas consideradas

- **Solo 2 (light/dark)**. No cubre los casos extremos.
- **10+ temas configurables**. Overkill y complicado de mantener.
- **Solo tema de marca**. No profesional para presentaciones.

### Consecuencias

- ✅ Cobertura de todos los escenarios de uso.
- ✅ Implementación con CSS variables y `data-theme` attribute.
- ⚠️ 4 juegos de tokens para mantener.

---

## ADR-013: Multi-moneda 21 países de América

**Fecha**: 2026-05

### Contexto

La MYPE LatAm opera en moneda local. Mostrar precios solo en USD excluye al dueño del taller que cotiza en soles, pesos, reales. Necesitamos al menos las monedas de los 21 países de América.

### Decisión

Soportar **21 monedas**: PEN (Perú), USD (USA), BRL (Brasil), MXN (México), COP (Colombia), CLP (Chile), ARS (Argentina), CAD (Canadá), y 13 más. Tipos de cambio desde **Open ER-API**, refrescados diariamente en el cron.

### Alternativas consideradas

- **Solo USD + PEN**. Insuficiente.
- **Todo en USD con conversión mental**. Mala UX.
- **Integrar con APIs de banco central de cada país**. Muy complejo, 21 integraciones.
- **Solo monedas principales (10)**. Pierde países centroamericanos y caribeños.

### Consecuencias

- ✅ Cobertura continental.
- ✅ Conversión transparente (el usuario ve "USD 0.50 → PEN 1.85").
- ⚠️ Open ER-API es la única fuente de FX; si cae, tipos de cambio se desactualizan.

---

## ADR-014: Design system extraído de Stripe + Linear

**Fecha**: 2026-06-29

### Contexto

SelectIA necesita un design system profesional, no improvisado. Las referencias más sólidas en B2B SaaS son **Stripe.com** (claro, denso, tipografía cuidada) y **Linear.app** (oscuro, hairlines, espaciado generoso).

### Decisión

Extraer tokens de ambos: de **Linear.app** la paleta oscura (`#08090a` base, indigo `#5e6ad2` brand), las hairlines 1px y los radius pequeños. De **Stripe.com** la tipografía (Inter Variable + Fira Code), las sombras `rgba(50,50,93,...)` y los badges "cristal tintado".

### Alternativas consideradas

- **Material Design 3**. Muy reconocible pero opinionated.
- **Fluent (Microsoft)**. Poco común en LatAm.
- **Sistema propio desde cero**. Lento y propenso a inconsistencia.

### Consecuencias

- ✅ Aspecto profesional B2B desde día 1.
- ✅ Documentación extensa en `MASTER.md` (924 líneas).
- ⚠️ Riesgo de "parecer demasiado a Linear" si no se diferencia con casos de uso propios.

---

## ADR-015: Open source MIT

**Fecha**: 2026-04

### Contexto

SelectIA es un proyecto personal educativo y de portafolio. La decisión de licencia afecta adopción, contribuciones y posibles usos comerciales derivados.

### Decisión

Publicar bajo **licencia MIT**. Es la más permisiva: uso comercial, modificación, distribución y uso privado, con única condición de mantener aviso de copyright y licencia.

### Alternativas consideradas

- **GPL v3**. Copyleft fuerte: cualquier derivado debe ser GPL. Restringe uso comercial.
- **Apache 2.0**. Similar a MIT pero con cláusulas de patentes. Más complejo.
- **Propietario / Source-available**. Cierra la puerta a comunidad.
- **CC BY-SA**. Para contenido, no para código.

### Consecuencias

- ✅ Adopción máxima.
- ✅ Forks comerciales permitidos.
- ✅ Compatible con cualquier otra licencia open source.
- ⚠️ Alguien puede fork + monetizar sin dar nada a cambio (aceptado).

---

## ADR-016: Deploy en Vercel (tier gratis)

**Fecha**: 2026-04

### Contexto

SelectIA tiene:
- Estático (JSON + assets) que vive en `public/`.
- Rutas API ligeras (`/api/dashboard`, `/api/health`) para futuro.
- Tráfico esperado bajo (< 1000 visitas/día al inicio).

### Decisión

Desplegar en **Vercel free tier**. Compatible nativo con Next.js 16, deploy automático desde GitHub, dominio custom opcional, SSL incluido.

### Alternativas consideradas

- **Netlify**. Equivalente, pero Vercel está más optimizado para Next.
- **Cloudflare Pages**. Más barato en escala, pero menos features para Next App Router.
- **VPS propio (DigitalOcean / Hetzner)**. Más control pero más trabajo de ops.
- **On-premise**. Overkill para un proyecto personal.

### Consecuencias

- ✅ Cero costo actual.
- ✅ Deploy automático en cada push.
- ✅ Edge network global.
- ⚠️ Límites de free tier (100 GB bandwidth/mes). Si crece, hay que pagar.

---

## ADR-017: Cron diario 2 AM Lima vía GitHub Actions

**Fecha**: 2026-05

### Contexto

El JSON maestro necesita refresco periódico. 2 AM Lima es el momento de menor tráfico en LatAm y coincide con horas no-pico de las APIs externas.

### Decisión

Workflow de **GitHub Actions** programado con `cron: '0 7 * * *'` (UTC 7:00 = Lima 2:00 AM, UTC-5). El workflow:
1. Corre `bun run scripts/generate-static-json.ts`.
2. Si hay cambios, hace commit + push.
3. Vercel despliega automáticamente.

### Alternativas consideradas

- **Vercel Cron Jobs**. Más simple pero free tier limitado a 1 job por día (suficiente, pero sin margen).
- **Cron externo (cron-job.org)**. Más frágil.
- **Refresco continuo (cada hora)**. Saturaría APIs gratuitas.
- **Refresco on-demand (manual)**. Olvidable.

### Consecuencias

- ✅ Refresco automático, sin intervención.
- ✅ GitHub Actions free tier suficiente.
- ⚠️ Si GitHub Actions cae, no se actualiza ese día (raro pero posible).
- ⚠️ El commit automático ensucia el git log (mitigado con `[skip ci]`).

---

## ADR-018: Glosario intercorrelacionado con deepDives

**Fecha**: 2026-06

### Contexto

El usuario MYPE necesita entender términos técnicos (II, agentic, context window, tool use, MMLU). Un glosario plano no es suficiente: hay términos que se relacionan entre sí y que ameritan una explicación profunda.

### Decisión

Implementar un glosario con:
- **176 términos** organizados en **8 categorías**.
- **15 deepDives**: explicaciones largas (500-1500 palabras) de los conceptos más importantes (II, AHP, TOPSIS, HRE, TF-IDF, etc.).
- **Intercorrelación**: cada término tiene `seeAlso: ['term1', 'term2']` que el UI renderiza como links clicables.

### Alternativas consideradas

- **Solo glosario plano sin deepDives**. Suficiente para definiciones cortas pero no para conceptos densos.
- **Wiki externa (GitBook, Notion)**. Pierde integración con la app.
- **LLM in-app para explicar términos**. Caro, lento, no determinista.

### Consecuencias

- ✅ Auto-contenido (no sales de la app para entender).
- ✅ Navegación fluida entre términos.
- ⚠️ Mantener 176 + 15 requiere trabajo continuo.

---

## ADR-019: Animación del motor 36 pasos

**Fecha**: 2026-06

### Contexto

Para que el usuario entienda **cómo** se llega a una recomendación (no solo el resultado), se necesita una visualización paso a paso del motor. Esto es valioso para educación, demo y confianza.

### Decisión

Implementar una vista **Animación del Motor** que recorre los 36 pasos del HRE-TOPSIS:
- Pasos 1-5: carga del JSON.
- Pasos 6-12: normalización.
- Pasos 13-20: aplicación de pesos AHP.
- Pasos 21-28: cálculo de distancias.
- Pasos 29-32: aplicación de restricciones.
- Pasos 33-36: ranking y explicabilidad.

Cada paso muestra: título, descripción, valores numéricos intermedios, y una visualización mini.

### Alternativas consideradas

- **Sin animación**. Pierde valor pedagógico.
- **Video pre-grabado**. No interactivo.
- **Animación genérica**. No específica al motor real.

### Consecuencias

- ✅ Transparencia total del motor.
- ✅ Excelente para demos y clases.
- ⚠️ Mantener 36 pasos alineados con el código real es trabajo.
- ⚠️ Performance: la animación corre en cliente, hay que evitar re-renders.

---

## ADR-020: Casos de uso industriales (IPERC, G-code)

**Fecha**: 2026-06

### Contexto

SelectIA no es un comparador académico; su público es la MYPE industrial. Necesita casos de uso que resuenen con la planta, no con el laboratorio.

### Decisión

Documentar y soportar explícitamente cuatro casos de uso industriales:
1. **IPERC** (matriz de riesgo SUNAT peruana) — categorías de peligro, controles, evaluación.
2. **G-code CNC** — generación y depuración de código para torno/fresadora.
3. **Manual técnico de 300 páginas** — toma de PDF extenso y producción de manual operativo.
4. **Cotización y traducción técnica** — ES ⇄ EN con terminología industrial.

Cada caso tiene su vista en la app, su prompt template, y su documentación en `CASOS_USO_MYPE.md`.

### Alternativas consideradas

- **Solo casos genéricos (chat, resumen, traducción)**. Pierde diferenciación.
- **Casos de uso enterprise (legal, médico)**. Requieren compliance que SelectIA no tiene.
- **Sin casos de uso explícitos**. La app sería un comparador más.

### Consecuencias

- ✅ Diferenciación real frente a competidores.
- ✅ Resuena con la audiencia objetivo (MYPE industrial LatAm).
- ✅ Hooks para partnerships con gremios industriales.
- ⚠️ Mantener prompts y documentación por caso es trabajo continuo.

---

## Apéndice — Mapa de ADRs

| ADR | Título | Fecha |
|---|---|---|
| ADR-001 | Next.js 16 App Router | 2026-04 |
| ADR-002 | TypeScript strict mode | 2026-04 |
| ADR-003 | Tailwind CSS 4 + shadcn/ui New York | 2026-04 |
| ADR-004 | Zustand para estado cliente | 2026-04 |
| ADR-005 | TanStack Query para estado servidor | 2026-04 |
| ADR-006 | JSON estático + cron job | 2026-04 |
| ADR-007 | HRE-TOPSIS de 5 capas | 2026-05 |
| ADR-008 | 8 criterios (añadido reliability) | 2026-07 |
| ADR-009 | AHP con 24 vectores pre-calibrados | 2026-05 |
| ADR-010 | TF-IDF + Porter stemmer español | 2026-05 |
| ADR-011 | Piso de calidad II ≥ 30 modo Calidad | 2026-07 |
| ADR-012 | 4 temas (Linear Claro/Oscuro, Blanco/Negro) | 2026-06 |
| ADR-013 | Multi-moneda 21 países América | 2026-05 |
| ADR-014 | Design system extraído de Stripe + Linear | 2026-06-29 |
| ADR-015 | Open source MIT | 2026-04 |
| ADR-016 | Deploy en Vercel free | 2026-04 |
| ADR-017 | Cron diario 2 AM Lima GitHub Actions | 2026-05 |
| ADR-018 | Glosario intercorrelacionado + deepDives | 2026-06 |
| ADR-019 | Animación del motor 36 pasos | 2026-06 |
| ADR-020 | Casos de uso industriales (IPERC, G-code) | 2026-06 |

---

## Cierre

Estos 20 ADRs cubren las decisiones más importantes del proyecto. Cada uno se mantendrá como registro histórico: si una decisión se cambia, se añadirá un nuevo ADR que lo supersede con referencia al anterior. Las decisiones que aún no se han tomado (ej. elección de NextAuth.js vs Clerk) se documentarán cuando se tomen, en versiones futuras de este archivo.

— *Fin del documento.*
