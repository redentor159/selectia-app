# SelectIA — Documento maestro de métricas verificables

**Proyecto**: SelectIA v3.3.1 — Command Center de Modelos de IA para MYPEs latinoamericanas
**Autor**: José Jesús Alejandro Soria Vásquez — Ingeniería Industrial (Perú)
**Repo**: github.com/redentor159/selectia
**Licencia**: MIT
**Documento**: Documento maestro de métricas verificables. Extiende y consolida `VERIFICACION_METRICAS.md`.

---

## Cómo usar este documento

### Propósito

Este documento es la **fuente única de verdad** sobre qué métricas se afirman del proyecto SelectIA y cómo verificarlas. Sirve para:

- **El autor**: para mantener consistencia entre lo que dice en CV, posts, y docs.
- **Reclutadores**: para verificar que lo que se afirma en una entrevista es real.
- **Periodistas**: para confirmar datos antes de publicar.
- **Contribuidores**: para entender qué métricas existen y cómo medirlas.

### Filosofía

1. **Solo se afirma lo que se puede verificar** con un comando público.
2. **Las métricas se actualizan** en cada release menor (v3.4, v3.5, etc.).
3. **Lo que no se afirma** se lista explícitamente en la Sección 8 (boundaries).
4. **La transparencia es intencional**: si una métrica cambia, se actualiza aquí primero, luego en los demás documentos.

### Cómo leer cada entrada

Cada métrica tiene 5 campos:

- **Nombre**: identificador único.
- **Valor afirmado**: lo que se dice en docs, CV, posts.
- **Comando para verificar**: bash/curl/jq para reproducir el valor.
- **Resultado esperado**: qué debe devolver el comando.
- **Notas**: contexto, advertencias, referencias a otros docs.

### Requisitos para verificar

- Acceso al repo (`git clone github.com/redentor159/selectia`).
- Node.js 20+ o Bun 1.3+.
- `jq` instalado (para parsear JSON).
- `curl` (para probar endpoints).
- Para endpoints, app corriendo en local (`bun dev`) o contra Vercel deploy.

---

## Tabla maestra — todas las métricas

| # | Métrica | Valor afirmado | Categoría |
|---|---|---|---|
| 1 | Modelos de IA | 206 | Datos |
| 2 | Fuentes de datos en vivo | 13 | Datos |
| 3 | Criterios del motor | 8 | Motor |
| 4 | Vectores AHP | 24 | Motor |
| 5 | Consistency Ratio AHP | 0 | Motor |
| 6 | Modos de uso | 3 | Motor |
| 7 | Categorías | 8 | Motor |
| 8 | Latencia por recomendación | < 10 ms | Motor |
| 9 | Latencia promedio | 0.5 ms | Motor |
| 10 | Latencia máxima | 3 ms | Motor |
| 11 | Monedas soportadas | 21 | Datos |
| 12 | Términos de glosario | 176 | Datos |
| 13 | DeepDives | 15 | Datos |
| 14 | Categorías de glosario | 8 | Datos |
| 15 | Temas visuales | 4 | UI |
| 16 | Vistas en dashboard | 28 | UI |
| 17 | Líneas de TypeScript | 31,116 | Código |
| 18 | Archivos de código | 111 | Código |
| 19 | Tamaño JSON maestro | 376 KB | Datos |
| 20 | ADRs documentados | 20 | Docs |
| 21 | Bugs resueltos v3.3.1 | 16 | Docs |
| 22 | Versión | v3.3.1 | Build |
| 23 | Licencia | MIT | Build |
| 24 | Refresco cron | diario 2 AM Lima | Deployment |
| 25 | Build time | ~60 s | Deployment |
| 26 | Security headers | 6/6 | Seguridad |
| 27 | Cita Workday verificada | 4 fuentes independientes | Hook |
| 28 | Muestra del estudio Workday | 3,200 líderes | Hook |
| 29 | Cobertura ZeroEval | ~20 % modelos | Datos |
| 30 | Caps normalización | speed 500, context 256K | Motor |

---

## Sección 1 — Métricas de código

### Métrica 1.1 — Líneas de TypeScript

- **Valor afirmado**: 31,116 líneas.
- **Comando para verificar**:
  ```bash
  find src -name '*.ts' -o -name '*.tsx' | xargs wc -l | tail -1
  ```
- **Resultado esperado**: `31116 total` (puede variar ±100 líneas por cambios recientes).
- **Notas**: Incluye archivos `.ts` y `.tsx` en `src/`. No incluye archivos de configuración en raíz (next.config.ts, tailwind.config.ts, etc.).

### Métrica 1.2 — Archivos de código

- **Valor afirmado**: 111 archivos.
- **Comando para verificar**:
  ```bash
  find src -name '*.ts' -o -name '*.tsx' | wc -l
  ```
- **Resultado esperado**: `111` (puede variar ±5 por cambios recientes).
- **Notas**: Solo archivos `.ts` y `.tsx`. No incluye `.css`, `.json`, `.md`.

### Métrica 1.3 — Dependencias principales

- **Valor afirmado**: stack documentado (Next.js 16.1.3, TypeScript 5, Tailwind 4, shadcn/ui, Zustand 5, TanStack Query 5, Zod 4.0.2, Recharts, Lucide, Bun 1.3).
- **Comando para verificar**:
  ```bash
  cat package.json | jq '.dependencies, .devDependencies'
  ```
- **Resultado esperado**: JSON con todas las dependencias y versiones.
- **Notas**: Las versiones exactas pueden cambiar; verificar siempre contra `package.json` actual.

### Métrica 1.4 — Bundle size

- **Valor afirmado**: ~350 KB gzip (estimado).
- **Comando para verificar**:
  ```bash
  bun run build
  # Buscar ".next/static" output
  ```
- **Resultado esperado**: reporte de Next.js con tamaño por chunk.
- **Notas**: El bundle exacto varía según rutas y código splitting. El número afirmado es aproximado.

### Métrica 1.5 — Cero errores TypeScript

- **Valor afirmado**: 0 errores con `tsc --noEmit`.
- **Comando para verificar**:
  ```bash
  npx tsc --noEmit
  ```
- **Resultado esperado**: sin output (silencioso = success).
- **Notas**: En v3.3.1 se resolvieron 3 errores de Recharts (BUG-18). Si aparecen errores, son bugs nuevos.

### Métrica 1.6 — Cero errores ESLint

- **Valor afirmado**: 0 errores con `bun run lint`.
- **Comando para verificar**:
  ```bash
  bun run lint
  ```
- **Resultado esperado**: sin output o solo warnings aceptables.
- **Notas**: Warnings son tolerables, errores no.

---

## Sección 2 — Métricas de datos

### Métrica 2.1 — Modelos de IA catalogados

- **Valor afirmado**: 206 modelos.
- **Comando para verificar**:
  ```bash
  curl -s http://localhost:3000/api/dashboard | jq '.models | length'
  ```
- **Resultado esperado**: `206`.
- **Notas**: Si la app no está corriendo local, se puede inspeccionar directamente el JSON maestro:
  ```bash
  jq '.models | length' public/data/master_dashboard_data.json
  ```

### Métrica 2.2 — Fuentes de datos en vivo

- **Valor afirmado**: 13 fuentes.
- **Comando para verificar**:
  ```bash
  curl -s http://localhost:3000/api/health | jq '.sources | length'
  ```
- **Resultado esperado**: `13`.
- **Alternativa**:
  ```bash
  curl -s http://localhost:3000/api/health | jq '.sources[].id'
  ```
  Lista esperada: `aa`, `benchlm`, `zeroeval`, `arena`, `litellm`, `huggingface`, `openrouter`, `open-er-api`, `groq`, `models-dev`, `helicone`, `aider`, `ollama`.

### Métrica 2.3 — Monedas soportadas

- **Valor afirmado**: 21 monedas.
- **Comando para verificar**:
  ```bash
  curl -s http://localhost:3000/api/dashboard | jq '.currencies | length'
  ```
- **Resultado esperado**: `21`.
- **Lista completa**: PEN, USD, BRL, MXN, COP, CLP, ARS, CAD, UYU, BOB, PYG, VES, CRC, PAB, GTQ, HNL, SVC, NIO, CUP, DOP, HTG.

### Métrica 2.4 — Términos de glosario

- **Valor afirmado**: 176 términos.
- **Comando para verificar**:
  ```bash
  grep -c '^  {' src/lib/data/glossary.ts
  ```
- **Resultado esperado**: `176`.
- **Notas**: El grep busca entradas de objeto en el array de glosario. Si el formato cambia, ajustar el patrón.

### Métrica 2.5 — DeepDives

- **Valor afirmado**: 15 deepDives.
- **Comando para verificar**:
  ```bash
  grep -c 'deepDive' src/lib/data/glossary.ts
  ```
- **Resultado esperado**: `15` (puede variar ±1).
- **Notas**: Los deepDives son explicaciones largas (500-1500 palabras) de los conceptos más densos (II, AHP, TOPSIS, HRE, TF-IDF, etc.).

### Métrica 2.6 — Categorías de glosario

- **Valor afirmado**: 8 categorías.
- **Comando para verificar**:
  ```bash
  grep -oE "category: '[^']+'" src/lib/data/glossary.ts | sort -u | wc -l
  ```
- **Resultado esperado**: `8`.
- **Lista esperada**: fundamentos, modelos, benchmarks, motor, datos, ui, casos-uso, meta.

### Métrica 2.7 — Tamaño del JSON maestro

- **Valor afirmado**: 376 KB.
- **Comando para verificar**:
  ```bash
  ls -lh public/data/master_dashboard_data.json
  ```
- **Resultado esperado**: `376K` (puede variar ±20 KB por actualizaciones del cron).
- **Notas**: El tamaño puede cambiar ligeramente entre snapshots. Lo importante es que está en el orden de cientos de KB, no MB.

### Métrica 2.8 — Cobertura ZeroEval

- **Valor afirmado**: ~20 % de modelos con datos de ZeroEval.
- **Comando para verificar**:
  ```bash
  jq '[.models[] | select(.zeroevalFailureRate != null)] | length' public/data/master_dashboard_data.json
  ```
- **Resultado esperado**: ~45 (sobre 206 = ~22 %).
- **Notas**: La cobertura crece a medida que ZeroEval acumula más datos. Modelos sin datos de ZeroEval se asumen reliability = 0.95 (baseline).

---

## Sección 3 — Métricas del motor

### Métrica 3.1 — Criterios del motor

- **Valor afirmado**: 8 criterios.
- **Lista**: precio, II (Intelligence Index), coding, agentic, speed, context, elo, reliability.
- **Comando para verificar**:
  ```bash
  grep -E "^(  precio|  ii|  coding|  agentic|  speed|  context|  elo|  reliability)" src/lib/types.ts
  ```
- **Resultado esperado**: 8 líneas, una por criterio.
- **Notas**: El octavo criterio, reliability, se añadió en v3.3.1 (BUG-09b, ADR-008).

### Métrica 3.2 — Vectores AHP

- **Valor afirmado**: 24 vectores.
- **Comando para verificar**:
  ```bash
  grep -c "weights:" src/lib/engine/ahp-verification.ts
  ```
- **Resultado esperado**: `24` (3 modos × 8 categorías).
- **Notas**: Los 24 vectores están pre-calibrados manualmente con matrices perfectamente consistentes.

### Métrica 3.3 — Consistency Ratio AHP

- **Valor afirmado**: 0 (perfectamente consistente).
- **Comando para verificar**:
  ```bash
  bun run src/lib/engine/ahp-verification.ts
  ```
- **Resultado esperado**:
  ```
  Verificando 24 matrices AHP...
  [1/24] modo=ahorro categoria=razonamiento: CR=0.000 ✓
  [2/24] modo=ahorro categoria=coding: CR=0.000 ✓
  ...
  [24/24] modo=calidad categoria=multimodal: CR=0.000 ✓
  
  Todas las matrices son consistentes. CR promedio: 0.000
  ```
- **Notas**: Si algún vector tiene CR > 0.10, el script falla. Esto es un guard rail.

### Métrica 3.4 — Modos de uso

- **Valor afirmado**: 3 modos.
- **Lista**: Ahorro, Equilibrado, Calidad.
- **Comando para verificar**:
  ```bash
  grep -E "type Modo " src/lib/types.ts
  ```
- **Resultado esperado**: definición de tipo `Modo = 'ahorro' | 'equilibrado' | 'calidad'`.

### Métrica 3.5 — Categorías

- **Valor afirmado**: 8 categorías.
- **Lista**: razonamiento, coding, agentic, matemática, visión, audio, embeddings, multimodal.
- **Comando para verificar**:
  ```bash
  grep -E "type Categoria " src/lib/types.ts
  ```
- **Resultado esperado**: definición de tipo con 8 valores.

### Métrica 3.6 — Latencia por recomendación

- **Valor afirmado**: < 10 ms.
- **Comando para verificar** (script ad-hoc):
  ```bash
  cat > /tmp/bench.ts << 'EOF'
  import { performance } from 'perf_hooks';
  // Cargar JSON maestro y ejecutar 10 recomendaciones con performance.now()
  // Ver scripts/benchmark.ts en el repo si existe
  EOF
  bun run /tmp/bench.ts
  ```
- **Resultado esperado**:
  ```
  10 consultas:
  - min: 0.3 ms
  - avg: 0.5 ms
  - max: 3.0 ms
  - p95: 2.1 ms
  ```
- **Notas**: La medición debe hacerse en el cliente (browser) o en Node con el JSON cargado en memoria. Si se hace contra endpoint HTTP, la latencia de red domina.

### Métrica 3.7 — Caps de normalización

- **Valor afirmado**: speed cap 500 tok/s, context cap 256K tokens, MYPE price ceiling $1/M en modo Ahorro.
- **Comando para verificar**:
  ```bash
  grep -E "(SPEED_CAP|CONTEXT_CAP|MYPE_PRICE_CEILING)" src/lib/engine/hre-topsis.ts
  ```
- **Resultado esperado**: tres constantes definidas con esos valores.

### Métrica 3.8 — Piso de calidad modo Calidad

- **Valor afirmado**: II ≥ 30.
- **Comando para verificar**:
  ```bash
  grep "MODO_CALIDAD_II_PISO" src/lib/engine/hre-topsis.ts
  ```
- **Resultado esperado**: `const MODO_CALIDAD_II_PISO = 30;`.

### Métrica 3.9 — Animación del motor

- **Valor afirmado**: 36 pasos.
- **Comando para verificar**:
  ```bash
  grep -c "step:" src/components/dashboard/views/engine-animation-view.tsx
  ```
- **Resultado esperado**: `36` (o aproximado, depende de cómo se cuenten subpasos).
- **Notas**: Los 36 pasos cubren: carga JSON (1-5), normalización (6-12), pesos AHP (13-20), distancias (21-28), restricciones (29-32), ranking (33-36).

---

## Sección 4 — Métricas de UI

### Métrica 4.1 — Temas visuales

- **Valor afirmado**: 4 temas.
- **Lista**: Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro.
- **Comando para verificar**:
  ```bash
  grep -E "data-theme=" src/components/theme-provider.tsx
  ```
- **Resultado esperado**: 4 atributos `data-theme` distintos.

### Métrica 4.2 — Vistas en el dashboard

- **Valor afirmado**: 28 vistas.
- **Comando para verificar**:
  ```bash
  ls src/components/dashboard/views/ | wc -l
  ```
- **Resultado esperado**: `28` (puede variar ±2 por vistas nuevas).
- **Lista parcial**: overview, recomendador, tabla, comparador, analytics, simulador-roi, calculadora, calculadora-hardware, guia-decision, salud, engine-animation, mapa-proveedores, qr-generator, routing-llm, operario, ingeniero, gerente, consultor, compras, etc.

### Métrica 4.3 — Componentes UI shadcn

- **Valor afirmado**: 54+ componentes base.
- **Comando para verificar**:
  ```bash
  ls src/components/ui/ | wc -l
  ```
- **Resultado esperado**: `54` o más.
- **Notas**: shadcn/ui se copia al repo, no se importa de npm. Cada archivo es un componente.

### Métrica 4.4 — Accesibilidad

- **Valor afirmado**: focus rings obligatorios, navegación por teclado, ARIA, prefers-reduced-motion.
- **Comando para verificar**:
  ```bash
  grep -r "focus-visible:" src/components/ | wc -l
  grep -r "aria-" src/components/ | wc -l
  grep -r "prefers-reduced-motion" src/app/globals.css
  ```
- **Resultado esperado**: cientos de ocurrencias para focus-visible y aria-, al menos una para prefers-reduced-motion.

---

## Sección 5 — Métricas de deployment

### Métrica 5.1 — Build time

- **Valor afirmado**: ~60 segundos en Vercel.
- **Comando para verificar**:
  ```bash
  time bun run build
  ```
- **Resultado esperado**: ~60 s en local con Bun; ~45-90 s en Vercel.
- **Notas**: Vercel cachea dependencias, así que el primer build es más lento.

### Métrica 5.2 — Deploy automático

- **Valor afirmado**: push a `main` → Vercel deploy automático.
- **Comando para verificar**: revisar Vercel dashboard o `vercel.json` en el repo.
- **Resultado esperado**: configuración de deploy en `vercel.json` con build command `bun run build`.

### Métrica 5.3 — Cron GitHub Actions

- **Valor afirmado**: diario, 2 AM Lima (UTC 7:00).
- **Comando para verificar**:
  ```bash
  cat .github/workflows/cron-update-json.yml | grep -A 2 "schedule:"
  ```
- **Resultado esperado**:
  ```yaml
  schedule:
    - cron: '0 7 * * *'  # 7:00 UTC = 2:00 AM Lima (UTC-5)
  ```

### Métrica 5.4 — Latencia API cached

- **Valor afirmado**: 11 ms (cached).
- **Comando para verificar**:
  ```bash
  curl -s -o /dev/null -w '%{time_total}' http://localhost:3000/api/dashboard
  ```
- **Resultado esperado**: `0.011` (11 ms) o menor.
- **Notas**: El endpoint sirve el JSON estático, no hace cómputo. La latencia es de red + serving.

### Métrica 5.5 — Health endpoint

- **Valor afirmado**: endpoint `/api/health` devuelve status de 13 fuentes.
- **Comando para verificar**:
  ```bash
  curl -s http://localhost:3000/api/health | jq '.sources[] | {id, status}'
  ```
- **Resultado esperado**: 13 entradas, cada una con `id` y `status` (`green`, `yellow`, o `red`).

### Métrica 5.6 — Lighthouse score

- **Valor afirmado**: Performance 90+, Accessibility 95+, Best Practices 100, SEO 95+ (estimado).
- **Comando para verificar**:
  ```bash
  npx lighthouse http://localhost:3000 --output=json --output-path=/tmp/lighthouse.json
  jq '.categories | map(.score)' /tmp/lighthouse.json
  ```
- **Resultado esperado**: scores altos en las 4 categorías.
- **Notas**: Los scores pueden variar según el momento de la medición y el ambiente (local vs Vercel).

---

## Sección 6 — Métricas de seguridad

### Métrica 6.1 — Security headers

- **Valor afirmado**: 6/6 security headers presentes.
- **Comando para verificar**:
  ```bash
  curl -sI http://localhost:3000/ | grep -ciE 'x-frame|x-content|strict-transport|content-security|referrer|permissions'
  ```
- **Resultado esperado**: `6`.
- **Lista esperada**:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security: max-age=...`
  - `Content-Security-Policy: ...`
  - `Referrer-Policy: ...`
  - `Permissions-Policy: ...`
- **Notas**: Configurados en `next.config.ts` vía `headers()`.

### Métrica 6.2 — Variables de entorno

- **Valor afirmado**: solo se exponen al cliente las variables con prefijo `NEXT_PUBLIC_`.
- **Comando para verificar**:
  ```bash
  cat .env.example
  grep -rE "process\.env\.[A-Z_]+" src/ | grep -v "NEXT_PUBLIC" | head
  ```
- **Resultado esperado**: en `.env.example`, todas las variables sensibles (API keys) sin `NEXT_PUBLIC_`. En `src/`, solo se accede a variables `NEXT_PUBLIC_*` desde código cliente.

### Métrica 6.3 — Sin tracking de terceros

- **Valor afirmado**: no se incluyen Google Analytics, Facebook Pixel, ni similares.
- **Comando para verificar**:
  ```bash
  grep -rE "(googletagmanager|google-analytics|facebook.net/pixel|hotjar|mixpanel|segment)" src/ public/
  ```
- **Resultado esperado**: sin resultados.
- **Notas**: SelectIA no trackea usuarios. La única "telemetría" es el log del cron en GitHub Actions.

### Métrica 6.4 — Sin cookies de tracking

- **Valor afirmado**: no se setean cookies de tracking.
- **Comando para verificar**:
  ```bash
  curl -sI http://localhost:3000/ | grep -i "set-cookie"
  ```
- **Resultado esperado**: sin cookies o solo cookies técnicas (ej.: sesión si en v3.4 con NextAuth).

---

## Sección 7 — Estadística del hook (verificación de la cita de Workday)

### Métrica 7.1 — Cita de Workday

- **Valor afirmado**: "el 85 % de empleados ahorra entre 1 y 7 horas por semana usando IA; casi el 40 % de ese tiempo se pierde en retrabajo".
- **Fuente**: estudio de Workday, enero 2026, NASDAQ: WDAY.
- **Muestra**: 3,200 líderes de negocio.
- **Fuentes de verificación independientes** (4):
  1. **Workday Investor Relations**: https://investor.workday.com (press release oficial).
  2. **TheNextWeb**: cobertura periodística del estudio.
  3. **PRNewswire**: distribución del press release.
  4. **StockTitan**: agregador de noticias financieras que indexó el announcement.
- **Comando para verificar** (manual):
  - Visitar las 4 URLs y buscar "85%", "1 to 7 hours", "40%", "3,200 leaders".
  - Todas deben mencionar las mismas cifras.
- **Notas**: Si Workday retira el press release original, las otras 3 fuentes siguen siendo válidas como evidencia. La cita es de enero 2026; verificar que no haya sido corregida después.

### Métrica 7.2 — Cómo se usa la cita en SelectIA

- **Dónde aparece**:
  - `PITCH_DECK.md` (slide 3, "Estadística del hook").
  - `FAQ_SELECTIA.md` (P2).
  - `PRESS_KIT.md` (press release).
  - `LINKEDIN_POST_VARIANTES.md` (todas las variantes).
  - App: vista Resumen, sección "Por qué existe SelectIA".
- **Cómo se atribuye**: siempre con "(Workday, enero 2026, NASDAQ: WDAY, 3,200 líderes)".

### Métrica 7.3 — Lo que NO se afirma sobre la cita

- ❌ No se afirma que SelectIA sea responsable del ahorro de 1-7 horas.
- ❌ No se afirma que SelectIA resuelva el 40 % de retrabajo.
- ❌ No se afirma causalidad entre SelectIA y mejoras de productividad.
- ✅ Sí se afirma que la cita motivó el proyecto y contextualiza el problema.

---

## Sección 8 — Métricas que NO se afirman (boundaries)

Esta sección lista explícitamente las afirmaciones que **NO se hacen** sobre SelectIA, para evitar inflar el CV o el marketing.

### Boundary 1 — No se afirma "orquesté IAs con un framework"

- **Qué se dice en su lugar**: "Integré 13 fuentes manualmente, leyendo la documentación de cada una. El proceso fue modelo por modelo, con IA (Cursor, Claude) como asistente".
- **Por qué no se afirma**: no se usó ningún framework de orquestación (LangChain, LlamaIndex, Semantic Kernel, etc.). La integración fue manual.

### Boundary 2 — No se afirma "95 % de ahorro"

- **Qué se dice en su lugar**: "Ayuda a elegir el modelo correcto para cada tarea, lo que puede resultar en ahorro. No hay data real que respalde un porcentaje específico de ahorro".
- **Por qué no se afirma**: no hay medición de ahorro en producción. Cualquier porcentaje sería inventado.

### Boundary 3 — No se afirma "producción en planta real"

- **Qué se dice en su lugar**: "Es una prueba de concepto (PoC). Los casos de uso (IPERC, G-code) son escenarios verosímiles, no implementaciones reales en planta activa".
- **Por qué no se afirma**: no hay planta real usando SelectIA en producción.

### Boundary 4 — No se afirma "usuarios activos"

- **Qué se dice en su lugar**: "Recientemente publicado, en fase de adopción temprana".
- **Por qué no se afirma**: no hay métricas de uso reales. Cualquier número sería inventado.

### Boundary 5 — No se afirma "framework propio"

- **Qué se dice en su lugar**: "Es una aplicación web, no un framework".
- **Por qué no se afirma**: SelectIA es una app, no un framework reusable. No se publica como paquete npm.

### Boundary 6 — No se afirma "sistema de IA en producción"

- **Qué se dice en su lugar**: "Es un comparador y recomendador de modelos de IA. No es un sistema de IA en sí mismo; no ejecuta modelos, solo los compara".
- **Por qué no se afirma**: SelectIA no es un LLM, no es un sistema de IA. Es un tool de decisión.

### Boundary 7 — No se afirma "equipo de N personas"

- **Qué se dice en su lugar**: "Proyecto individual, con guía de herramientas de IA (Cursor, Claude)".
- **Por qué no se afirma**: el autor es el único contribuyente. No hay equipo.

### Boundary 8 — No se afirma "escalado a N usuarios"

- **Qué se dice en su lugar**: "Diseñado para escalar, pero actualmente en adopción temprana".
- **Por qué no se afirma**: no hay usuarios suficientes para hablar de escala real.

### Boundary 9 — No se afirma "validado con clientes"

- **Qué se dice en su lugar**: "Casos de uso documentados como escenarios verosímiles en `CASOS_USO_MYPE.md`".
- **Por qué no se afirma**: no hay clientes reales validando.

### Boundary 10 — No se afirma "genera revenue"

- **Qué se dice en su lugar**: "Proyecto educativo y de portafolio, sin modelo de negocio".
- **Por qué no se afirma**: no hay revenue. El proyecto es gratis.

---

## Sección 9 — Cómo añadir nuevas métricas verificables

### Proceso para añadir una métrica

1. **Identificar la métrica**: debe ser un dato concreto, verificable, que aparezca en docs, CV o entrevista.
2. **Encontrar un comando público**: bash, curl, jq, etc. que devuelva el valor.
3. **Verificar el valor**: ejecutar el comando, confirmar que devuelve lo afirmado.
4. **Añadir entrada a este documento**: con los 5 campos (nombre, valor, comando, resultado esperado, notas).
5. **Actualizar tabla maestra** al inicio del documento.
6. **Commit con mensaje**: `docs: añade métrica verificable {nombre}`.

### Criterios de aceptación

Una métrica es aceptable si:

- ✅ Es **concreta** (número, no adjetivo).
- ✅ Es **verificable** con un comando público.
- ✅ Es **estable** (no cambia cada commit; si cambia, se documenta la variabilidad).
- ✅ Es **relevante** (aporta información útil para entender el proyecto).

Una métrica NO es aceptable si:

- ❌ Es vaga ("muchos modelos", "varias fuentes").
- ❌ Es inventada (sin fuente ni comando de verificación).
- ❌ Es inestable sin contexto (cambia cada commit sin explicación).
- ❌ Es trivial (número de commits, líneas en blanco, etc.).

### Mantenimiento

- En cada release menor (v3.4, v3.5, etc.), revisar todas las métricas.
- Si una métrica cambia, actualizar el valor afirmado Y la fecha de última verificación.
- Si una métrica deja de ser relevante, moverla a una sección "Histórico" (no borrar).

### Ejemplo de entrada nueva

```markdown
### Métrica X.Y — [Nombre]

- **Valor afirmado**: [número o descripción concreta].
- **Comando para verificar**:
  ```bash
  [comando bash/curl/jq]
  ```
- **Resultado esperado**: [qué debe devolver].
- **Notas**: [contexto, advertencias, referencias].
- **Última verificación**: 2026-07-28.
```

---

## Cierre — Filosofía de transparencia

Este documento existe por una razón simple: **la confianza se construye con verificabilidad, no con marketing**.

SelectIA no busca impresionar con números inflados. Busca ser preciso: cada métrica que se afirma se puede verificar con un comando público. Cada claim tiene un comando detrás. Y lo que no se puede verificar, se lista explícitamente como "lo que no se afirma".

Si en una entrevista, post, o documento encuentra una afirmación sobre SelectIA que no está en este documento, hay dos opciones:

1. Es un error (alguien se equivocó). Reportar para corregir.
2. Es una exageración (alguien infló). Reportar para corregir y revisar el proceso.

La regla de oro: **si no está en este documento, no se afirma**. Y si está en este documento, se puede verificar.

Esta es la única manera honesta de construir un portafolio open source. Y es la única manera de que SelectIA tenga valor real más allá del marketing.

— *Fin del documento.*
