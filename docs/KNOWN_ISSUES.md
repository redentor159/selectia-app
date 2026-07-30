# ⚠️ Known Issues & Gotchas — SelectIA v3.3.1

> Cosas que una IA DEBE saber antes de modificar el código. Qué NO tocar, qué es esperado, qué es bug conocido.

---

## 🟢 Comportamiento esperado (NO bugs)

### 1. Ficha Técnica 404 en modelos propietarios
- **Síntoma**: Al abrir Ficha Técnica de GPT-5.5 o Claude Sonnet 5, muestra "HTTP 404"
- **Causa**: Modelos propietarios (OpenAI, Anthropic) NO tienen repo en HuggingFace Hub
- **Comportamiento**: El modal muestra el error 404, PERO las secciones BenchLM/ZeroEval/Ciclo de Vida sí se renderizan (están fuera del bloque `details`)
- **NO arreglar**: Es esperado. El 404 es de la API de HuggingFace, no de SelectIA.

### 2. Modelos con contextWindow = 8192
- **Síntoma**: Algunos modelos muestran 8K de contexto
- **Causa**: La API de Artificial Analysis NO devuelve `context_window` para esos modelos. LiteLLM lo rellena cuando puede. Si tampoco está en LiteLLM, queda en 8192 (default)
- **Comportamiento**: 90/206 modelos aún tienen 8K. El resto tiene contexto real (1M, 256K, 128K, etc.)
- **NO arreglar**: Es limitación de la API. No se puede inventar el dato.

### 3. BenchLM/ZeroEval no en todos los modelos
- **BenchLM**: 87/206 modelos (42%) — solo modelos que matchean por nombre normalizado
- **ZeroEval**: 36/206 modelos (17%) — solo modelos monitoreados en producción
- **Comportamiento**: Modelos sin BenchLM usan AA II. Modelos sin ZeroEval usan baseline 0.95.
- **NO arreglar**: Es limitación de las APIs. El fallback es graceful.

### 4. 3 errores TSC de recharts (ELIMINADOS en v3.3.1)
- **Estado**: ARREGLADOS. Se eliminó `isAnimationActive` y se arregló `style` prop.
- **TSC actual**: 0 errores ✅

### 5. JSON size varía entre regeneraciones
- **Rango**: 340-380 KB según cuántos modelos matcheen BenchLM/ZeroEval ese día
- **Límite**: 500 KB (PRD). Siempre debajo.
- **NO arreglar**: Es esperado, depende de la disponibilidad de las APIs.

### 6. Mercury 2 siempre gana en Rápidas
- **Síntoma**: Mercury 2 (speed=872) gana Rápidas en los 3 modos
- **Causa**: Su velocidad es tan dominante que incluso con cap 500 tok/s gana
- **NO arreglar**: Es correcto. Mercury 2 ES el modelo más rápido del mercado.

### 7. Gemini 3.5 Flash domina MYPE
- **Síntoma**: Gemini 3.5 Flash aparece en 4-5 categorías en modo MYPE
- **Causa**: Es FREE (Google AI Studio), tiene II=50.2 (mejor FREE), elo=1479, reliability=99.5%
- **NO arreglar**: Es correcto. Es objetivamente el mejor modelo FREE.

---

## 🟡 Bugs conocidos aceptados

### 8. `mapa-proveedores-view.tsx` y `routing-llm-view.tsx` no se usan
- **Estado**: Existen pero no aparecen en el sidebar
- **Decisión**: Se removieron del sidebar en una iteración anterior
- **NO eliminar**: Podrían reactivarse en el futuro

### 9. `compras-view.tsx`, `consultor-view.tsx`, `gerente-view.tsx`, `ingeniero-view.tsx`, `operario-view.tsx`
- **Estado**: Son layouts de perfil que se renderizan dentro de `overview-view.tsx` según `profile`
- **NO confundir**: No son vistas independientes del sidebar

### 10. `prisma/schema.prisma` existe pero no se usa en runtime
- **Estado**: Configurado pero la app es 100% client-side con JSON estático
- **NO eliminar**: Podría usarse si se añaden cuentas de usuario en el futuro

---

## 🔴 Lo que NUNCA debes tocar

### 11. NO cambiar los 24 vectores de pesos AHP
- Los 24 vectores (3 modos × 8 categorías) están cuidadosamente calibrados.
- Cada uno suma EXACTAMENTE 1.0000.
- CR = 0 para todos (verificado).
- Si cambias uno, debes recalcular CR y verificar que siga < 0.1.
- **Archivos**: `src/lib/engine/hre-topsis.ts` líneas 544-602

### 12. NO cambiar el z-index del Dialog
- `src/components/ui/dialog.tsx` usa `z-[700]`
- El header usa `z-[100]`, el thead de la tabla usa `z-[75]`
- Si bajas el z-index del Dialog, la tabla se ve encima del modal
- **Archivo**: `src/components/ui/dialog.tsx`

### 13. NO quitar los caps de speed/context
- `speed = Math.min(rawSpeed, 500)` — sin esto, Mercury 2 (872) distorsiona TOPSIS
- `context = Math.min(m.contextWindow, 256_000)` — sin esto, Gemini 2.0 (1M) distorsiona
- **Archivo**: `src/lib/engine/hre-topsis.ts` `extractMetrics()`

### 14. NO cambiar la lógica de Función K (successorMap)
- La lógica de `successorMap` es correcta desde el fix #1
- `supersedesModelKey` significa "este modelo REEMPLAZA al modelo con esa key"
- Si lo inviertes, TODOS los badges de ciclo de vida se muestran al revés
- **Archivo**: `src/lib/orchestrator.ts` `applyBenchlmEnrichment()`

### 15. NO usar BenchLM scores en TOPSIS
- Desde v3.3.1, `extractMetrics()` usa AA `intelligenceIndex` (no BenchLM)
- BenchLM está en escala distinta (avg 61.5 vs AA avg 12-50)
- Si mezclas escalas, modelos con BenchLM data ganan injustamente
- **Archivo**: `src/lib/engine/hre-topsis.ts` `extractMetrics()`

### 16. NO quitar el piso de calidad en modo Calidad
- `if (mode === "calidad") { if (ii < minII) return false; }`
- Sin esto, Gemini 2.0 Flash Think (II=13.3) gana sobre GPT-5.5 (II=54.8)
- **Archivo**: `src/lib/engine/hre-topsis.ts` `applyHardFilters()`

### 17. NO cambiar `computeBlendedPriceUsd(m, mode)` lógica
- MYPE/Equilibrado: FREE = $0 (free tier)
- Calidad: FREE = precio API real (competencia justa)
- Si cambias esto, los modos dejan de funcionar correctamente
- **Archivo**: `src/lib/engine/hre-topsis.ts`

### 18. NO cambiar el matching BenchLM a 1 pasada
- El matching usa 2 pasadas: items sin sufijo primero, con sufijo después
- Si vuelves a 1 pasada, GLM-5 (Reasoning) gets sobrescrito por GLM-5 base
- **Archivo**: `src/lib/orchestrator.ts` `fetchBenchLM()`

---

## 🔵 Gotchas de deployment

### 19. Variables de entorno OBLIGATORIAS
- `AA_API_KEY` — sin esto, AA API falla y usa seed data (24 modelos antiguos)
- `HF_TOKEN` — sin esto, HuggingFace API rate-limits agresivamente
- `NTFY_TOPIC` — sin esto, no hay alertas (no crítico)
- **Fallbacks**: Hay keys hardcoded en el código para dev. En producción, usar env vars.

### 20. Cron job NO está configurado por defecto
- El JSON estático se regenera con `bun run scripts/generate-static-json.ts`
- Sin cron job, los datos envejecen (precios, métricas, nuevos modelos)
- Ver DEPLOYMENT.md para configurar GitHub Actions cron

### 21. Vercel cold start
- Primera visita puede tardar 2-3 segundos (cold start de la Function)
- Visitas subsequentes: <100ms (JSON estático desde CDN)
- NO es bug, es comportamiento normal de serverless

### 22. `bun run build` puede fallar
- El build de producción puede fallar por errores de tipos que `bun run dev` ignora
- **Solución**: Usar `vercel deploy` (Vercel maneja el build)

---

## 🟠 Limitaciones de diseño

### 23. Una sola ruta (`/`)
- Toda la app vive en `src/app/page.tsx`
- Las "vistas" (tabla, recomendador, etc.) son componentes que se renderizan condicionalmente
- NO hay routing del navegador (ej: `/tabla`, `/recomendador`)
- **Razón**: Es una SPA (Single Page Application) por diseño

### 24. No hay cuentas de usuario
- Las preferencias se guardan en localStorage (por navegador)
- Si cambias de computadora, pierdes tus preferencias
- **Razón**: Es open source para la comunidad, no un SaaS

### 25. No hay tests automatizados
- El usuario decidió no escribir tests
- **Riesgo**: Regression al modificar código
- **Mitigación**: Lint + tsc + Agent Browser smoke test después de cada cambio

### 26. Solo modelos de texto (LLM)
- No hay modelos de imagen (DALL-E, Midjourney), video (Sora), ni audio (Whisper)
- **Razón**: El motor HRE-TOPSIS está diseñado para LLMs de texto
- Si se quisiera añadir, sería un producto distinto

### 27. Solo español
- La UI, el motor TF-IDF, stopwords, stemming — todo en español
- **Razón**: Nicho LatAm/Peruano

### 28. `worklog.md` es muy largo (1600+ líneas)
- Contiene el historial completo de todas las sesiones
- Una IA nueva puede tardar en leerlo todo
- **Recomendación**: Leer solo las últimas 200 líneas para contexto reciente
