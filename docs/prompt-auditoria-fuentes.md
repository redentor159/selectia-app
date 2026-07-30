# Prompt: Auditoría Exhaustiva y Extirpación de Fuentes de Datos

**Contexto para la IA:**
Eres un Arquitecto de Software Senior y experto en Integración de Datos. Estás auditando el motor principal de un dashboard de IA (`SelectIA`) que ingesta datos de múltiples fuentes en paralelo (`src/lib/orchestrator.ts`).

**Objetivo de la Tarea:**
Identificar y proponer la ELIMINACIÓN TOTAL de cualquier fuente de datos que no se esté usando de forma REAL Y TRAZABLE hasta la lógica de negocio central. Debes presentar un informe de diagnóstico y esperar autorización expresa antes de alterar el código.

---

## Instrucciones Obligatorias (Strict Rules)

### Regla 0 — SEGURIDAD ANTES QUE TODO
Antes de modificar cualquier archivo, DEBES ejecutar `git add -A && git commit -m "chore: pre-audit snapshot"`. Confirma que el commit existe. Si git no está disponible, crea un backup del archivo en `/tmp/orchestrator.backup.ts`. No hay excusa para saltarte este paso.

### Regla 1 — LECTURA OBLIGATORIA (sin asumir nada)
Usa tus herramientas para leer en su totalidad:
- `src/lib/orchestrator.ts` — el pipeline de ingesta
- `src/lib/types.ts` — la interfaz `AIModel` completa (todos los campos)
- `src/lib/engine/hre-topsis.ts` — el motor de ranking (funciones `recommend()`, `topsisRank()`, `applyHardFilters()`, `WeightSet`)

### Regla 2 — RASTREO DE USO REAL (Dead Code Analysis de tres capas)

Para cada fuente de datos en `orchestrator.ts`, aplicá este criterio de tres capas en orden. Una fuente es REAL solo si supera las tres:

**Capa A — Mapeo a `AIModel`:**
¿Los datos que extrae esa fuente se mapean a campos del objeto `AIModel` definido en `types.ts`?
Si NO → **MUERTO EN CAPA A**.

**Capa B — Uso en lógica de ranking (TOPSIS):**
¿Esos campos de `AIModel` aparecen en alguna de estas funciones críticas en `hre-topsis.ts`?
- `WeightSet` (los 8 criterios: `efficiencyCost`, `elo`, `intelligenceIndex`, `codingIndex`, `agenticIndex`, `speed`, `context`, `reliability`)
- `topsisRank()` — normalización vectorial y ponderación
- `applyHardFilters()` — filtros duros de la Capa 2

Si NO → **MUERTO EN CAPA B** (pasa a auditoría de capas C y D).

**Capa C — Uso en Tabla Maestra (`tabla-view.tsx`):**
¿Los campos aparecen como columnas visibles en la tabla maestra de modelos? Verificá `src/components/dashboard/views/tabla-view.tsx`.
Si NO → **MUERTO EN CAPA C**.

**Capa D — Uso en Ficha Técnica (`ficha-tecnica-modal.tsx` y subcarpeta `ficha-tecnica/`):**
¿Los campos aparecen en la ficha técnica del modelo? Verificá `src/components/dashboard/ficha-tecnica-modal.tsx` y todos los archivos en `src/components/dashboard/ficha-tecnica/`.
Si NO → **MUERTO EN CAPA D**.

> **VANITY METRIC / CÓDIGO FANTASMA:** Una fuente que solo alimenta el array `SourceHealth` (para mostrar badges verdes/rojos de estado en el panel de salud del sistema) SIN pasar ninguna de las 4 capas anteriores es código vanidad. Declarala como tal aunque "se vea linda" en la UI.

> **FUENTES FRÁGILES:** Una fuente que usa scraping HTML con regex (ej. `/<td>.../<\/td>/`) en lugar de una JSON API oficial debe marcarse como FRÁGIL independientemente de si pasa las capas. El riesgo de ruptura silenciosa es alto.

### Regla 3 — INFORME Y PAUSA TOTAL (STOP RULE)

Genera el siguiente informe estructurado:

```
## INFORME DE AUDITORÍA — FUENTES DE DATOS

### ✅ FUENTES REALES (pasan las 4 capas)
| Fuente | Campos que aporta | Usada en TOPSIS | Usada en Tabla | Usada en Ficha |
|--------|------------------|-----------------|----------------|----------------|
| ...    | ...              | Sí/No           | Sí/No          | Sí/No          |

### ☠️ CÓDIGO FANTASMA / VANITY METRICS (fallan Capa A, B, C y D)
| Fuente | Razón de eliminación |
|--------|---------------------|
| ...    | ...                 |

### ⚠️ FUENTES FRÁGILES (scraping HTML / regex)
| Fuente | Riesgo | Recomendación |
|--------|--------|---------------|
| ...    | ...    | ...           |

### 💡 IMPACTO ESTIMADO DE LA LIMPIEZA
- Latencia ahorrada en cada request: X ms (eliminar promesas paralelas de fuentes muertas)
- Líneas de código eliminadas: ~X
- Riesgo de regresión: Bajo / Medio / Alto
```

**⛔ DETENTE AQUÍ. NO EJECUTES NINGÚN CAMBIO.**
Esperá a que el usuario lea el informe y te dé autorización explícita con las palabras "procede" o "autorizado".

### Regla 4 — MICRO TDD OBLIGATORIO (solo al ser autorizado)

Una vez autorizado a eliminar código:

**4.1 — Crea el test ANTES de modificar nada:**
Crea `scripts/test-orchestrator-sources.mjs` usando `node:test` + `node:assert`. El test debe cubrir obligatoriamente:
- **Parseo JSON** de cada fuente REAL sobreviviente (mockear con datos reales de ejemplo)
- **Campos críticos para TOPSIS no nulos**: `intelligenceIndex`, `elo`, `speedTps`, `contextWindow`, `efficiencyCost`
- **Campos críticos para Tabla Maestra**: verificar que el orchestrator los mapea correctamente
- **Campos críticos para Ficha Técnica**: `benchlmScore`, `zeroevalFailureRate`, `license`, `openWeights`

**4.2 — Ejecuta el test:**
```bash
node scripts/test-orchestrator-sources.mjs
```
Si falla → corregí el test o tu comprensión del código. NO procedas.
Si pasa → continúa.

**4.3 — Elimina las fuentes muertas:**
- Quita los `fetch()` / `Promise.allSettled()` de fuentes FANTASMA
- Elimina el mapeo en el orchestrator
- Elimina los tipos asociados si quedaron huérfanos en `types.ts`
- Vuelve a ejecutar el test. Si sigue verde, hacé commit.

**4.4 — Commit final:**
```bash
git add -A && git commit -m "perf: remove dead data sources from orchestrator"
```

---

**Entregable Inmediato:**
Lee los archivos indicados en la Regla 1, ejecutá el análisis forense de las 4 capas, entregá el informe de la Regla 3 y **QUÉDATE A LA ESPERA DE AUTORIZACIÓN.**
