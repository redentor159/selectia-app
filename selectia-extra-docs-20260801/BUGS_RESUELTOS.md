# SelectIA — Bugs resueltos en v3.3.1

**Proyecto**: SelectIA v3.3.1 — Command Center de Modelos de IA para MYPEs latinoamericanas
**Autor**: José Jesús Alejandro Soria Vásquez — Ingeniería Industrial (Perú)
**Repo**: github.com/redentor159/selectia
**Licencia**: MIT
**Documento**: Registro detallado de los 16 bugs resueltos en v3.3.1, con síntomas, causa raíz, fix aplicado, archivos modificados, cómo verificar y lección aprendida.

---

## Cómo leer este documento

- Cada bug se documenta con: **ID**, **Título**, **Síntomas**, **Causa raíz**, **Fix aplicado** (con fragmento de código cuando aplica), **Archivos modificados**, **Cómo verificar el fix**, **Lección aprendida**.
- Los IDs siguen la nomenclatura interna del proyecto. Algunos bugs tienen sub-letras (9a, 9b, 10a, 10b) porque se descubrieron relacionados pero se arreglaron por separado.
- La versión de referencia es **v3.3.1**.
- Las métricas mencionadas son verificables (ver `METRICAS_VERIFICABLES.md`).

---

## Tabla resumen

| ID | Título | Severidad | Componente afectado |
|---|---|---|---|
| BUG-01 | Función K invertida | Alta | Motor (BenchLM) |
| BUG-03 | Emojis en headers de tabla | Baja | UI Tabla Maestra |
| BUG-04 | z-index del glosario | Media | UI Glosario |
| BUG-06 | Speed cap (outlier Mercury 2 = 872 tok/s) | Alta | Motor normalización |
| BUG-07 | MYPE price ceiling $1/M | Alta | Motor modo Ahorro |
| BUG-08 | Context cap (outlier Gemini 2.0 = 1M) | Alta | Motor normalización |
| BUG-09a | "7 fuentes" hardcoded | Media | UI Salud del Sistema |
| BUG-09b | Doble estándar II (AA vs BenchLM) | Alta | Motor extractMetrics |
| BUG-10a | computeBlendedPriceUsd modo Calidad | Alta | Motor pricing |
| BUG-10b | effCost = 0 en pesos Calidad | Alta | Motor AHP |
| BUG-11 | Pesos Calidad recalibrados | Alta | Motor AHP |
| BUG-14 | Piso de calidad II ≥ 30 | Alta | Motor restricciones |
| BUG-15 | ContextWindow corrupto (210 modelos con 8K falso) | Crítica | Datos LiteLLM |
| BUG-16 | Matching BenchLM sobreescritura | Alta | Datos BenchLM |
| BUG-17 | React keys duplicadas en glosario | Baja | UI Glosario |
| BUG-18 | 3 errores TSC recharts | Baja | Build |

Total: **16 bugs** resueltos.

---

## BUG-01: Función K invertida

### Síntomas

La Función K (que indica si un modelo está "Vigente" o "Reemplazado por X") mostraba etiquetas invertidas. Modelos que habían sido reemplazados aparecían como "Vigente", y modelos vigentes aparecían como "Reemplazado por {modelo_mucho_mejor}". Esto causaba recomendaciones absurdas: el motor recomendaba modelos obsoletos como si fueran actuales.

### Causa raíz

El campo `supersedesModelKey` de BenchLM fue mal interpretado. Se asumió que significaba "este modelo supersedes (reemplaza) a X", cuando en realidad significa "este modelo es supersedido (reemplazado) por X". La semántica inversa no se detectó en code review.

### Fix aplicado

```typescript
// ANTES (incorrecto):
const isVigente = m.supersedesModelKey !== undefined && m.supersedesModelKey !== null;
const isReemplazado = !isVigente;

// DESPUÉS (correcto):
const isReemplazado = m.supersedesModelKey !== undefined && m.supersedesModelKey !== null && m.supersedesModelKey !== '';
const isVigente = m.benchlmIsCanonicalEntry === true && !isReemplazado;
```

Adicionalmente, se añadió un campo `benchlmIsCanonicalEntry` para distinguir el caso de modelos que son la entrada canónica de su familia (vigentes) de los que son variantes (legacy, alternative).

### Archivos modificados

- `src/lib/types.ts` (añadido `benchlmIsCanonicalEntry`)
- `src/lib/orchestrator.ts` (lógica invertida)
- `src/components/dashboard/views/tabla-view.tsx` (Función K badge)
- `src/components/dashboard/views/guia-decision-view.tsx`
- `src/components/dashboard/views/salud-view.tsx`
- `src/components/dashboard/ficha-tecnica-modal.tsx`

### Cómo verificar el fix

1. Abrir la vista Tabla Maestra.
2. Filtrar por familia Gemini (que tiene varios modelos reemplazados).
3. Verificar que "Gemini 3.5 Flash (high)" muestra badge amarillo "Reemplazado por Gemini 3 Flash".
4. Verificar que "Gemini 3 Flash" muestra badge verde "Vigente".

### Lección aprendida

Nunca asumir la semántica de un campo externo. Verificar siempre con la documentación de la API fuente (en este caso, BenchLM) y con un caso de prueba concreto antes de merge.

---

## BUG-03: Emojis en headers de tabla

### Síntomas

La Tabla Maestra usaba emojis directamente en los headers de columna: "🩺 Repo", "⚡ Speed", "💰 Precio", "🧠 II". Los emojis se veían distintos en cada sistema operativo (Windows, macOS, Linux, Android, iOS), rompiendo la consistencia visual. Además, los lectores de pantalla los anunciaban como "image", lo que era un problema de accesibilidad.

### Causa raíz

Decisión inicial de usar emojis por simplicidad. No se consideró consistencia cross-platform ni accesibilidad.

### Fix aplicado

Reemplazar todos los emojis de headers por componentes de **Lucide** (íconos SVG):

```tsx
// ANTES:
<th>🩺 Repo</th>
<th>⚡ Speed</th>

// DESPUÉS:
<Th label="Repo" icon={<Stethoscope className="h-3.5 w-3.5" />} tooltip="..." />
<Th label="Speed" icon={<Zap className="h-3.5 w-3.5" />} tooltip="..." />
```

El componente `Th` ya aceptaba un `icon` prop pero no se usaba. Se extendió para usarlo consistentemente.

### Archivos modificados

- `src/components/dashboard/views/tabla-view.tsx` (todos los headers)
- `src/components/dashboard/views/comparador-view.tsx`
- `src/components/dashboard/views/analytics-view.tsx`

### Cómo verificar el fix

1. Abrir Tabla Maestra en Chrome, Firefox y Safari.
2. Abrir en Windows, macOS y Linux (o emular).
3. Verificar que todos los íconos se renderizan idénticos en los tres SO.
4. Con un lector de pantalla (NVDA, VoiceOver), verificar que cada header se anuncia con su nombre textual.

### Lección aprendida

Emojis son para chat, no para UI profesional. Los íconos SVG (Lucide) son consistentes, accesibles y tematizables. El costo de instalar Lucide es cero (ya estaba en el proyecto).

---

## BUG-04: z-index del glosario

### Síntomas

Al abrir el glosario desde la Tabla Maestra, las columnas de la tabla se seguían viendo a través del overlay del glosario. Específicamente, las columnas "sticky" de la tabla (las primeras dos) tenían `z-index: 50` y el modal del glosario tenía `z-index: 40`, lo que hacía que la tabla se viera por encima del modal.

### Causa raíz

Conflictos de stacking context. La tabla sticky usa `z-index: 50` para que las primeras columnas permanezcan visibles al hacer scroll horizontal. El modal del glosario se creó con `z-index: 40`, asumiento que estaría por encima. Pero por las reglas de stacking context de CSS, el `z-index` solo se respeta dentro del mismo contexto.

### Fix aplicado

Subir el `z-index` del modal del glosario y de todos los modales de la app a `700` (por encima de los stickies que están a 50):

```tsx
// ANTES:
<Dialog className="z-40">

// DESPUÉS:
<Dialog className="z-[700]">
```

Se actualizó también el design system en `MASTER.md` para documentar la escala completa:

| Elemento | z-index |
|---|---|
| Contenido base | 0 |
| Hover cards, popovers | 30-40 |
| Headers/columnas sticky | 50 |
| Tooltips | 60 |
| Drawers | 100 |
| Modales (diálogos) | 700 |
| Toasts | 900 |

### Archivos modificados

- `src/components/dashboard/glossary-dialog.tsx`
- `src/components/dashboard/ficha-tecnica-modal.tsx`
- `src/components/ui/dialog.tsx` (override del z-index default)
- `MASTER.md` (escala documentada)

### Cómo verificar el fix

1. Abrir Tabla Maestra.
2. Hacer scroll horizontal hasta ver las primeras columnas sticky.
3. Abrir el glosario.
4. Verificar que ningún elemento de la tabla se ve a través del overlay.

### Lección aprendida

Los stacking contexts en CSS son difíciles de razonar. Es mejor tener una escala documentada de z-index para toda la app y respetarla estrictamente. El archivo `MASTER.md` (tokens) debe incluir esta escala.

---

## BUG-06: Speed cap (outlier Mercury 2 = 872 tok/s)

### Síntomas

En la normalización de velocidad de generación (tokens por segundo), el modelo Mercury 2 reportaba 872 tok/s. Este outlier distorsionaba la normalización min-max: el rango se volvía [0, 872] en lugar de [0, 500], y la mayoría de modelos quedaban comprimidos en el rango bajo (0.1-0.5), perdiendo resolución.

### Causa raíz

No había un cap explícito en la normalización de speed. Se asumía que los datos crudos eran razonables, pero los labs publican ocasionalmente valores extremos que rompen la distribución.

### Fix aplicado

Añadir un cap explícito de 500 tok/s en la normalización:

```typescript
// ANTES:
const speedNormalized = (m.speed - minSpeed) / (maxSpeed - minSpeed);

// DESPUÉS:
const SPEED_CAP = 500;
const effectiveSpeed = Math.min(m.speed ?? 0, SPEED_CAP);
const speedNormalized = (effectiveSpeed - minSpeed) / (SPEED_CAP - minSpeed);
```

El cap de 500 se eligió porque: (a) cubre la mayoría de modelos (P95 está alrededor de 300 tok/s); (b) Mercury 2 queda saturado en el máximo, lo que es correcto (es el más rápido, pero no rompe la distribución).

### Archivos modificados

- `src/lib/engine/hre-topsis.ts` (constante + normalización)
- `src/lib/orchestrator.ts` (paso del valor capped)
- `src/lib/data/models.ts` (documentación del cap)

### Cómo verificar el fix

1. En la vista Recomendador, modo Equilibrado, categoría "razonamiento".
2. Verificar que Mercury 2 aparece con score de speed normalizado = 1.0 (saturado).
3. Verificar que el resto de modelos no están todos por debajo de 0.3.

### Lección aprendida

Toda normalización basada en min-max debe tener caps explícitos por ambos extremos. Los outliers son inevitables en datos de terceros; lo que sí se puede controlar es cómo los tratamos. Documentar el cap en el código y en el design system.

---

## BUG-07: MYPE price ceiling $1/M

### Síntomas

En modo Ahorro, el motor recomendaba modelos hasta $20 por millón de tokens, que es caro para una MYPE peruana promedio. El modo Ahorro debía entregar modelos realmente económicos, pero el filtro de precio no estaba bien calibrado.

### Causa raíz

El modo Ahorro solo aplicaba un peso alto al precio en el vector AHP, pero no tenía un filtro duro (restricción). Un modelo caro pero excelente en otros criterios podía colarse si su score ponderado era alto.

### Fix aplicado

Añadir una restricción dura en modo Ahorro: modelos con `blendedPriceUsd > 1.0` (USD por millón de tokens, blended input/output al 50/50) se descartan, sin importar el score.

```typescript
// ANTES (solo peso):
const weights = MODO_AHORRO_WEIGHTS; // ya tiene precio alto

// DESPUÉS (peso + restricción):
const MYPE_PRICE_CEILING_USD = 1.0;
const filteredModels = modo === 'ahorro'
  ? allModels.filter(m => m.blendedPriceUsd <= MYPE_PRICE_CEILING_USD)
  : allModels;
const weights = MODO_AHORRO_WEIGHTS;
```

### Archivos modificados

- `src/lib/engine/hre-topsis.ts` (constante + filtro)
- `src/lib/orchestrator.ts` (paso del filtro)

### Cómo verificar el fix

1. Abrir el Recomendador en modo Ahorro, cualquier categoría.
2. Verificar que todos los modelos en el resultado tienen `blendedPriceUsd ≤ 1.0`.
3. Probar con un tope de $0.50: deben aparecer menos modelos, todos por debajo de $0.50.

### Lección aprendida

Los modos de uso deben tener tanto pesos (restricciones blandas) como filtros duros. El usuario espera que "modo Ahorro" sea categórico, no una sugerencia suave.

---

## BUG-08: Context cap (outlier Gemini 2.0 = 1M)

### Síntomas

Similar a BUG-06 pero con contexto. Gemini 2.0 reporta 1,000,000 tokens de contexto. Esto destrozaba la normalización: la mayoría de modelos (con 32K-128K) quedaban comprimidos en [0, 0.13], perdiendo toda resolución.

### Causa raíz

Sin cap explícito, el outlier 1M dominaba el rango de normalización.

### Fix aplicado

Cap de 256K tokens:

```typescript
const CONTEXT_CAP = 256_000;
const effectiveContext = Math.min(m.context ?? 0, CONTEXT_CAP);
const contextNormalized = (effectiveContext - minContext) / (CONTEXT_CAP - minContext);
```

Gemini 2.0 con 1M queda saturado en 1.0 (es el más alto), pero no distorsiona el resto.

### Archivos modificados

- `src/lib/engine/hre-topsis.ts`
- `src/lib/orchestrator.ts`

### Cómo verificar el fix

1. En Tabla Maestra, columna Contexto.
2. Verificar que Gemini 2.0 muestra "1M (cap)" o similar.
3. En Recomendador modo Equilibrado, verificar que la distribución de scores de contexto no está toda comprimida en el rango bajo.

### Lección aprendida

La misma lección que BUG-06. Caps en toda normalización. Y considerar además mostrar al usuario el cap visualmente ("cap 256K aplicado").

---

## BUG-09a: "7 fuentes" hardcoded

### Síntomas

La vista Salud del Sistema mostraba un texto "7 fuentes integradas" que estaba hardcoded. En realidad, SelectIA ya integra 13 fuentes. El número no se actualizaba al añadir fuentes nuevas, lo que hacía que la UI siempre mostrara información desactualizada.

### Causa raíz

Texto hardcoded en el componente en lugar de derivarse del estado. Originalmente eran 7 fuentes, se añadieron 6 más, pero nadie actualizó el string.

### Fix aplicado

Reemplazar el string hardcoded por la longitud del array de fuentes dinámico:

```tsx
// ANTES:
<p>7 fuentes integradas</p>

// DESPUÉS:
<p>{data.sources.length} fuentes integradas</p>
```

Y para evitar futuros descuidos, añadir un test que verifica que `data.sources.length` es siempre > 0 y que el texto no contiene números hardcoded de fuentes.

### Archivos modificados

- `src/components/dashboard/views/salud-view.tsx`
- (adición de test en `src/lib/__tests__/sources.test.ts`)

### Cómo verificar el fix

1. Abrir Salud del Sistema.
2. El número mostrado debe coincidir con `data.sources.length` (inspeccionar con React DevTools).
3. Añadir una fuente de prueba en el JSON y recargar; el número debe subir.

### Lección aprendida

Nunca hardcodear valores que derivan del estado. Si una métrica es "n fuentes", debe calcularse dinámicamente. Strings mágicos como "7" son una trampa a futuro.

---

## BUG-09b: Doble estándar II (AA vs BenchLM)

### Síntomas

La función `extractMetrics()` usaba el II de BenchLM para algunos modelos y el II de Artificial Analysis para otros, lo que generaba inconsistencias. Dos modelos con el mismo II real aparecían con valores distintos según la fuente. El motor HRE-TOPSIS los trataba como diferentes, lo que afectaba el ranking.

### Causa raíz

`extractMetrics()` mezclaba fuentes en el mismo campo `ii`. La normalización ocurría antes de la fusión, así que el rango quedaba inconsistente.

### Fix aplicado

Estandarizar: usar siempre el II de **Artificial Analysis** para el campo `ii` en el motor. El II de BenchLM se guarda en campo separado `benchlmDisplayScore` para fines de visualización (no entra al HRE-TOPSIS).

```typescript
// ANTES:
const ii = m.benchlmDisplayScore ?? m.aaIi ?? 0; // mezcla

// DESPUÉS:
const ii = m.aaIi ?? 0; // AA es la fuente canónica para II
const benchlmDisplayScore = m.benchlmDisplayScore ?? null; // solo visualización
```

### Archivos modificados

- `src/lib/orchestrator.ts` (extractMetrics refactorizado)
- `src/lib/types.ts` (campo `benchlmDisplayScore` separado)
- `src/lib/engine/hre-topsis.ts` (documentación de fuente canónica)

### Cómo verificar el fix

1. En la vista Tabla Maestra, columna II, debe mostrar el II de AA.
2. Comparar con la vista Ficha Técnica: debe mostrar ambos (II de AA como canónico, II de BenchLM como referencia).
3. En dos modelos con mismo II real, los valores mostrados deben ser idénticos.

### Lección aprendida

Cada métrica del motor debe tener una fuente canónica única. Si hay múltiples fuentes que aportan la misma métrica (para fines de visualización), guardarlas en campos separados y solo una entra al motor.

---

## BUG-10a: computeBlendedPriceUsd modo Calidad

### Síntomas

En modo Calidad, los modelos "FREE" (precio API cero) se trataban como blendedPriceUsd = 0. Esto los hacía ganar en el ranking de Calidad porque el vector AHP del modo Calidad tenía un peso no-cero para precio, y cero siempre gana. El resultado: el motor recomendaba modelos gratuitos pero irrelevantes para tareas exigentes.

### Causa raíz

`computeBlendedPriceUsd()` devolvía 0 si el modelo era FREE. Pero en modo Calidad, el usuario prefiere pagar por un buen modelo antes que usar uno gratis inútil. El motor no debería favorecer FREE en modo Calidad.

### Fix aplicado

En modo Calidad, los modelos FREE usan su precio API real (no cero). Si no tienen precio API (realmente gratis), se les asigna un precio simbólico de $0.50/M (para no romper el ranking):

```typescript
// ANTES:
const blendedPriceUsd = m.isFree ? 0 : (m.priceInput + m.priceOutput) / 2;

// DESPUÉS:
const computeBlendedPriceUsd = (m: Model, modo: Modo) => {
  if (m.isFree) {
    if (modo === 'calidad') {
      return m.realApiPriceUsd ?? 0.50; // precio real o simbólico
    }
    return 0;
  }
  return (m.priceInput + m.priceOutput) / 2;
};
```

### Archivos modificados

- `src/lib/orchestrator.ts` (computeBlendedPriceUsd con parámetro modo)
- `src/lib/engine/hre-topsis.ts` (paso del modo)
- `src/lib/data/models.ts` (campo `realApiPriceUsd` añadido a modelos FREE)

### Cómo verificar el fix

1. En Recomendador modo Calidad, categoría coding.
2. Verificar que modelos FREE no aparecen en el top 3 si hay modelos pagados mejores.
3. En modo Ahorro, los FREE siguen apareciendo como esperado (precio 0).

### Lección aprendida

El precio "cero" no siempre significa gratis para el motor. El contexto del modo importa. Las funciones de pricing deben saber el modo en que se están usando.

---

## BUG-10b: effCost = 0 en pesos Calidad

### Síntomas

Relacionado con BUG-10a pero en el costo efectivo usado por los vectores AHP de Calidad. Los pesos del modo Calidad tenían un componente de costo (effCost) que se calculaba como `1 / blendedPriceUsd`. Si blendedPriceUsd era 0 (FREE), effCost era Infinity, lo que rompía el ranking.

### Causa raíz

División por cero no manejada en el cálculo de effCost.

### Fix aplicado

En modo Calidad, effCost = 0 para todos los modelos (no se considera costo en ese modo). El componente de precio en el vector AHP de Calidad se reduce a 0, y se redistribuye a II, coding, agentic, reliability.

```typescript
// ANTES:
const effCost = 1 / blendedPriceUsd; // Infinity si blendedPriceUsd = 0

// DESPUÉS:
const effCost = modo === 'calidad' ? 0 : (1 / Math.max(blendedPriceUsd, 0.001));
```

### Archivos modificados

- `src/lib/engine/hre-topsis.ts` (cálculo de effCost)
- `src/lib/engine/ahp-verification.ts` (recalibración de pesos Calidad, ver BUG-11)

### Cómo verificar el fix

1. En modo Calidad, ningún modelo FREE debe dominar el ranking por tener effCost = Infinity.
2. Verificar en la Animación del Motor (paso donde se calcula effCost) que el valor es 0 en modo Calidad.

### Lección aprendida

Toda división en el motor debe tener un piso en el denominador. Y el "costo efectivo" no siempre aplica: en modo Calidad el usuario acepta pagar, así que el costo no debe entrar al ranking.

---

## BUG-11: Pesos Calidad recalibrados

### Síntomas

Los pesos AHP del modo Calidad tenían un peso demasiado bajo para II (alrededor de 0.20), lo que hacía que el modo Calidad no se diferenciara del modo Equilibrado. El usuario esperaba que modo Calidad premiara claramente la inteligencia.

### Causa raíz

Los pesos originales fueron calibrados con énfasis en equilibrio entre criterios, no en maximizar II. Esto no reflejaba la intención semántica del modo Calidad.

### Fix aplicado

Recalibrar los 8 vectores AHP del modo Calidad para que II tenga peso dominante (0.50-0.60 según categoría). Los criterios coding, agentic y reliability reciben pesos secundarios (0.10-0.15 cada uno). Precio, speed y context reciben pesos mínimos (0.02-0.05).

```typescript
// Modo Calidad, categoría "razonamiento" (ejemplo):
const CALIDAD_RAZONAMIENTO_WEIGHTS = {
  precio: 0.03,
  ii: 0.55,        // dominante
  coding: 0.10,
  agentic: 0.12,
  speed: 0.05,
  context: 0.05,
  elo: 0.05,
  reliability: 0.05,
};
```

CR = 0 mantenido (matriz recalibrada perfectamente consistente).

### Archivos modificados

- `src/lib/engine/ahp-verification.ts` (8 nuevos vectores)
- `src/lib/data/engine-docs.ts` (documentación actualizada)

### Cómo verificar el fix

1. En Recomendador modo Calidad, cualquier categoría.
2. El ganador debe ser el modelo con II más alto entre los que cumplen el piso II ≥ 30.
3. Comparar con modo Equilibrado: el ranking debe ser notablemente distinto.

### Lección aprendida

Cada modo debe tener una identidad semántica clara. Modo Calidad = II dominante. Modo Ahorro = precio dominante + restricción dura de tope. Modo Equilibrado = pesos parejos. Los vectores AHP deben reflejar esto.

---

## BUG-14: Piso de calidad II ≥ 30 en modo Calidad

### Síntomas

Antes del fix, el modo Calidad recomendaba modelos con II = 15-20 (modelos legacy como GPT-3.5), porque el vector de pesos no tenía un piso. El usuario esperaba que "Calidad" significara "modelos realmente capaces", no "lo mejor dentro de los baratos".

### Causa raíz

Sin restricción dura, el motor podía recomendar cualquier modelo con un score ponderado alto. Pero el score ponderado no garantizaba un II mínimo absoluto.

### Fix aplicado

Añadir restricción dura: en modo Calidad, modelos con II < 30 se descartan antes del ranking.

```typescript
const MODO_CALIDAD_II_PISO = 30;
const filtered = modo === 'calidad'
  ? models.filter(m => (m.ii ?? 0) >= MODO_CALIDAD_II_PISO)
  : models;
```

Ver también ADR-011 en `DECISIONES_DISENIO.md`.

### Archivos modificados

- `src/lib/engine/hre-topsis.ts` (constante + filtro)
- `src/lib/orchestrator.ts` (paso del filtro)

### Cómo verificar el fix

1. Recomendador modo Calidad, categoría "razonamiento".
2. En la Animación del Motor, paso "Restricciones", debe mostrar "Modelos descartados por II < 30: N".
3. Verificar que ningún modelo en el resultado tiene II < 30.

### Lección aprendida

Las restricciones duras son más efectivas que subir pesos. Un piso categórico comunica mejor la intención del modo que un vector de pesos opaco. Combinar ambos (peso + piso) es ideal.

---

## BUG-15: ContextWindow corrupto (210 modelos con 8K falso)

### Síntomas

**Crítico**. Alrededor de 210 modelos mostraban context window de 8K tokens, lo que era claramente falso (modelos modernos tienen 32K-1M). Esto distorsionaba gravemente el ranking: modelos con contexto real de 200K aparecían con 8K, lo que los penalizaba erróneamente.

### Causa raíz

El matching entre LiteLLM y los modelos internos fallaba para 210 modelos. LiteLLM usa nombres como `claude-3-5-sonnet-20241022`, pero el campo interno `modelKey` usaba `claude-3.5-sonnet`. El matching por substring fallaba, y el fallback era 8K (un default antiguo).

### Fix aplicado

Refactor del matching LiteLLM:

```typescript
// ANTES:
const match = litellmModels.find(l => l.model_name.includes(model.key));

// DESPUÉS (3 estrategias, en orden):
const match =
  litellmModels.find(l => l.model_name === model.key) ||  // exacto
  litellmModels.find(l => normalizeKey(l.model_name) === normalizeKey(model.key)) ||  // normalizado
  litellmModels.find(l => l.model_name.includes(model.key) || model.key.includes(l.model_name));  // substring bidireccional

function normalizeKey(k: string): string {
  return k.toLowerCase()
    .replace(/[-_.]/g, '')
    .replace(/(\d+)\.(\d+)/g, '$1$2');  // 3.5 -> 35
}
```

Adicionalmente, si ninguna estrategia matchea, se conserva el valor anterior del modelo en lugar de fallback a 8K.

### Archivos modificados

- `scripts/generate-static-json.ts` (matching LiteLLM)
- `src/lib/data/models.ts` (campo `context` ahora respeta valor anterior si no hay match)

### Cómo verificar el fix

1. Cargar el JSON maestro.
2. Contar modelos con context = 8000: debe ser significativamente menor a 210 (idealmente cero, salvo modelos legacy reales con 8K).
3. Verificar modelos específicos: `claude-3.5-sonnet` debe mostrar 200K, `gpt-4o` debe mostrar 128K, etc.

### Lección aprendida

Cuando se integran múltiples fuentes, el matching de claves es crítico. Probar con casos límite antes de deploy. Y nunca usar un fallback numérico (8K, 0, etc.) sin una justificación clara; es mejor conservar el valor anterior.

---

## BUG-16: Matching BenchLM sobreescritura

### Síntomas

El matching de BenchLM sobreescritura (que modelo reemplaza a cuál) fallaba para varios modelos. El campo `supersedesModelKey` se sobreescribía con un valor incorrecto, lo que interactuaba con BUG-01 (Función K invertida) y producía etiquetas de "Reemplazado por X" totalmente erróneas.

### Causa raíz

El cron job hacía una sola pasada de matching. Si un modelo A reemplaza a B, y B reemplaza a C, una sola pasada podía asignar el reemplazo de B a A como "A reemplaza a B", pero fallaba al asignar la cadena completa.

### Fix aplicado

Dos pasadas de matching:

1. **Pasada 1**: matching directo (modelo → reemplazante).
2. **Pasada 2**: matching transitivo (si A reemplaza a B, y B tiene `supersedesModelKey = C`, entonces A también se marca como reemplazante transitivo de C).

```typescript
// Pasada 1:
models.forEach(m => {
  const replacement = litellmModels.find(l => l.supersedes === m.key);
  if (replacement) {
    m.supersedesModelKey = replacement.key;
  }
});

// Pasada 2 (transitiva):
let changed = true;
while (changed) {
  changed = false;
  models.forEach(m => {
    if (m.supersedesModelKey) {
      const replaced = models.find(x => x.key === m.supersedesModelKey);
      if (replaced?.supersedesModelKey && !m.supersedesModelKeyChain?.includes(replaced.supersedesModelKey)) {
        m.supersedesModelKeyChain = [...(m.supersedesModelKeyChain ?? []), replaced.supersedesModelKey];
        changed = true;
      }
    }
  });
}
```

### Archivos modificados

- `scripts/generate-static-json.ts` (matching BenchLM con 2 pasadas)
- `src/lib/types.ts` (campo `supersedesModelKeyChain` añadido)

### Cómo verificar el fix

1. En Tabla Maestra, familia Gemini.
2. "Gemini 3.5 Flash (high)" debe mostrar "Reemplazado por Gemini 3 Flash".
3. "Gemini 3 Flash" debe mostrar "Vigente".
4. Si existe un "Gemini 2.5" (hipotético), debe mostrar "Reemplazado por Gemini 3 Flash" (transitivo).

### Lección aprendida

Cuando hay relaciones de reemplazo, una sola pasada nunca es suficiente. Las cadenas transitivas son comunes. Implementar siempre un loop while-changed o un BFS/DFS para resolver las relaciones completas.

---

## BUG-17: React keys duplicadas en glosario

### Síntomas

La consola de React mostraba warnings de "duplicate keys" en el componente del glosario. Esto no rompía funcionalidad pero indicaba un bug subyacente: dos términos del glosario tenían el mismo ID, lo que podía causar render incorrecto al filtrar.

### Causa raíz

El campo `termId` (usado como key) tenía dos entradas con el mismo slug en distintos deepDives. React distingue keys por string exacto, no por contenido.

### Fix aplicado

Hacer el key único combinando `termId` + índice del array:

```tsx
// ANTES:
{terms.map(t => <Term key={t.termId} term={t} />)}

// DESPUÉS:
{terms.map((t, idx) => <Term key={`${t.termId}-${idx}`} term={t} />)}
```

Y limpiar los `termId` duplicados en el archivo de datos.

### Archivos modificados

- `src/components/dashboard/glossary-dialog.tsx`
- `src/lib/data/glossary.ts` (limpieza de duplicados)

### Cómo verificar el fix

1. Abrir el glosario.
2. Filtrar por cualquier término.
3. La consola de React no debe mostrar warnings de "duplicate keys".

### Lección aprendida

React warnings sobre keys no son cosméticos: indican bugs. Si hay keys duplicadas, algo en los datos está mal. Siempre arreglar los warnings de keys.

---

## BUG-18: 3 errores TSC recharts

### Síntomas

`npx tsc --noEmit` reportaba 3 errores en archivos que usaban Recharts:
1. `analytics-view.tsx`: `isAnimationActive` no aceptado como prop en `<BarChart>`.
2. `engine-animation-view.tsx`: `style` no aceptado como prop en `<Line>`.
3. `simulador-roi-view.tsx`: `isAnimationActive` no aceptado como prop en `<AreaChart>`.

### Causa raíz

Recharts cambió sus tipos en una versión menor. Props que antes se aceptaban como `any` ahora están tipados estrictamente.

### Fix aplicado

Para cada uno:
- Eliminar la prop ofensiva (las animaciones por defecto ya están desactivadas en el design system).
- O pasar las props por el prop genérico `wrapperStyle` / `style` según el componente lo permita.

```tsx
// ANTES:
<BarChart isAnimationActive={false} data={data}>

// DESPUÉS:
<BarChart data={data}>
```

(El design system ya desactiva animaciones globalmente vía CSS `prefers-reduced-motion`.)

### Archivos modificados

- `src/components/dashboard/views/analytics-view.tsx`
- `src/components/dashboard/views/engine-animation-view.tsx`
- `src/components/dashboard/views/simulador-roi-view.tsx`

### Cómo verificar el fix

```bash
npx tsc --noEmit
```

Resultado esperado: **0 errores**.

### Lección aprendida

Mantener dependencias actualizadas implica lidiar con cambios de tipos. `tsc --noEmit` debe ser cero errores antes de cada release.

---

## Resumen estadístico

| Categoría | Cantidad |
|---|---|
| Bugs críticos | 1 (BUG-15) |
| Bugs altos | 11 |
| Bugs medios | 2 |
| Bugs bajos | 2 |
| **Total** | **16** |

| Componente afectado | Bugs |
|---|---|
| Motor HRE-TOPSIS / AHP | 7 |
| Datos (LiteLLM, BenchLM) | 3 |
| UI (tabla, glosario, salud) | 4 |
| Build / TSC | 1 |
| Pricing | 1 |

---

## Cierre

Estos 16 bugs fueron detectados y resueltos en la iteración v3.3.1 (julio 2026). Cada uno está documentado con causa raíz y lección aprendida para evitar reincidencia. El changelog completo está en `CHANGELOG.md`. Para ver los ADRs que formalizan algunas de estas decisiones (piso de calidad, caps, etc.), ver `DECISIONES_DISENIO.md`.

— *Fin del documento.*
