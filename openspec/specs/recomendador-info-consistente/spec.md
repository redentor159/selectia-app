# Spec: Información del recomendador consistente (recomendador-info-consistente)

## Capability: recomendador-info-consistente

Capa de información del recomendador (razones "por qué", eslogan de gratuidad y badge de multi-intent) consistente con la matemática real del Motor HRE-TOPSIS: valores dinámicos, verificables y sin hardcode de tasa, moneda, caps o imputaciones. El ranking queda intocado.

## Propósito

Toda cifra mostrada por el recomendador debe provenir de los mismos datos que el ranking usó (o de una imputación explícitamente marcada como estimada) y de la tasa de cambio viva del store, respetando la moneda seleccionada por el usuario. Cero hardcode en la capa de presentación: mejor lento pero seguro, con estabilidad y seguridad primero.

## Restricciones duras (intangibilidad del motor)

- MUST NOT modificar: la matemática TOPSIS, los pesos AHP, los caps de scoring (500 tok/s, 256K), los baselines de imputación (Elo 1200, II 30, speed 50, coding/agentic 25, reliability 0.95), los umbrales ni NINGÚN cálculo del ranking.
- MUST NOT introducir randomness: con los mismos datos de entrada, el score y el orden del ranking DEBEN permanecer bit-iguales a los de hoy.
- Solo se permite: presentación/formato de la capa de información y consumo de fuentes dinámicas ya existentes (store de moneda/tasas, `ModelMetrics.hasImputedData`, `freeAccess`, caps ya aplicados por el engine).
- Sin dependencias nuevas: cambios aditivos/sustitutivos de strings y formateo únicamente.
- MUST NOT usar ningún fallback de tasa distinto del actual: el fallback PEN permanece en 3.714 (`rates.PEN ?? 3.714` en `orchestrator.ts`).

## Requirements

### Requirement: Tasa de cambio dinámica en la razón de eficiencia

La razón de eficiencia de costo DEBE mostrar el precio convertido con la tasa viva del store (misma fuente que `orchestrator.ts`/`dashboard-store.ts`) y DEBE respetar la moneda seleccionada por el usuario (S/ o $). El valor fijo `3.714` MUST NOT mostrarse como tasa vigente: solo se permite como fallback cuando la API de tasas no está disponible, y en ese caso DEBE marcarse como "TC estimado". La razón DEBE citar el **precio blended** y el Intelligence Index que el ranking realmente usó.

#### Scenario: Moneda PEN con tasa viva

- GIVEN un usuario con moneda PEN y tasa viva `S/. 3.55` en el store
- WHEN el recomendador genera la razón de eficiencia de costo para un modelo con precio blended de `X USD`
- THEN la razón muestra el precio convertido con `3.55` (no con `3.714`)
- AND muestra la moneda y símbolo seleccionados

#### Scenario: Moneda USD sin hardcode

- GIVEN un usuario con moneda USD
- WHEN se genera la razón de eficiencia de costo
- THEN la razón muestra el precio en USD (sin multiplicar por 3.714 ni forzar S/)

#### Scenario: API de tasas caída (fallback)

- GIVEN que la API de tipo de cambio del store falla
- WHEN el usuario pide una recomendación y la razón cita la eficiencia
- THEN la conversión usa el fallback 3.714 (el mismo de hoy, `rates.PEN ?? 3.714`) y DEBE incluirlo como "TC estimado", no como valor vigente

### Requirement: Velocidad y contexto citados con el cap aplicado

Toda razón que cite velocidad o contexto DEBE mostrar los valores que el ranking realmente usó: velocidad con cap 500 tok/s y contexto con cap 256K. Los datos crudos del modelo PUEDEN mostrarse de forma adicional solo si quedan etiquetados como "crudo (sin cap)". La razón MUST NOT citar `speedTps` ni `contextWindow` crudos como entrada del TOPSIS. La información mostrada DEBE ser consistente con el score.

#### Scenario: Velocidad que excede el cap

- GIVEN un modelo cuya velocidad cruda es 900 tok/s
- WHEN el recomendador muestra la razón de velocidad
- THEN la razón cita 500 tok/s (valor usado en ranking) y, si muestra 900, lo rotula "crudo (sin cap)"
- AND el texto no contradice el score del modelo

#### Scenario: Contexto limitado a 256K

- GIVEN un modelo con ventana de contexto de 1M tokens
- WHEN el recomendador muestra la razón de contexto
- THEN la razón cita 256K (valor con cap usado por engine) con el matiz que corresponda
- AND no presenta 1M como si fuera el valor del ranking

### Requirement: Valores imputados no mostrados como reales

Si `hasImputedData` es true para una métrica (Elo, II, speed, coding, agentic, reliability con baseline), la razón DEBE omitir la afirmación absoluta sobre esa métrica o marcarla explícitamente como "estimado". Los adjetivos "sobresaliente", "top", "real" o "producción" no se aplicarán a valores imputados.

#### Scenario: Modelo sin Elo (baseline imputado)

- GIVEN un modelo cuya métrica Elo fue imputada a 1200 por el motor
- WHEN se generan las razones y la de "preferencia humana" es candidata
- THEN la razón omite "Alta preferencia de Elo 1200" o la muestra como "estimado"
- AND el texto no usa "sobresaliente"/"real" para el Elo

#### Scenario: Modelo sin datos de reliability

- GIVEN un modelo sin evidencia ZeroEval (reliability = baseline 0.95)
- WHEN se genera la razón de confiabilidad
- THEN la afirmación se muestra como estimado (no como dato observado)

### Requirement: Eslogan "100% gratis" verificable

El eslogan "Disponible 100% gratis — sin tarjeta de crédito requerida" DEBE mostrarse solo cuando el modelo tiene soporte gratuito verificable: `freeAccess == "free-100"` Y (`pricing == 0` o precio de entrada 0). La existencia del modo `solo-gratis` por sí sola MUST NOT disparar el texto. Para `free-limited` o `free-registration`, la capa DEBE mostrar un texto matizado ("gratis con límites", "gratis con registro") o mejor: omitir la etiqueta.

#### Scenario: solo-gratis con modelo free-limited

- GIVEN el modo `solo-gratis` y un modelo con `freeAccess = "free-limited"`
- WHEN se generan las razones
- THEN el eslogan "100% gratis" NO aparece
- AND, si se muestra algo, es un texto matizado (tier con límites) sin afirmar gratuidad total

#### Scenario: Sin tarjeta solo si realmente gratis

- GIVEN un modo `solo-gratis` y un modelo con `free-100` y precio 0
- WHEN se generan las razones
- THEN el texto verificado se muestra

### Requirement: Badge multi-intent con porcentajes que suman 100%

El badge multi-intent (en `recomendador-view.tsx`) DEBE calcular los porcentajes de modo que la suma de los pesos mostrados sea exactamente 100.0% en cualquier combinación (p. ej. un redondeo compensatorio). Los porcentajes individuales DEBEN seguir la proporción de los pesos reales.

#### Scenario: Pesos 33.4% / 33.3% / 33.3%

- GIVEN pesos de multi-intent 0.334, 0.333, 0.333
- WHEN se formatea el badge
- THEN los tres porcentajes mostrados suman exactamente 100%
- AND ningún valor individual queda redondeado por separado en exceso (p. ej. no hay 34% para un peso de 33.3%)

#### Scenario: Combinación 50.3% / 49.7%

- GIVEN dos pesos 0.503 y 0.497
- WHEN se formatea el badge
- THEN los porcentajes mostrados suman exactamente 100% (nunca 101%)
- AND cada porcentaje se desprende del peso real sin inventar

### Requirement: Multi-intent honesto (la categoría ganadora domina)

El mensaje de multi-intent MUST NOT sugerir que el ranking proviene de una mezcla ponderada: el ranking usa la categoría ganadora. El texto DEBE aclarar que la categoría ganadora domina el ranking y que las demás son intenciones secundarias detectadas, mostrando el peso mayoritario como el que manda.

#### Scenario: 60% redacción / 40% programación

- GIVEN un resultado con multi-intent (redacción 60%, programación 40%)
- WHEN se muestra el badge
- THEN el texto dice que redacción es la categoría ganadora del ranking
- AND no afirma que el ranking es una "mezcla de ambas"

#### Scenario: Límite 50/50

- GIVEN un resultado con dos intenciones igualadas (50/50)
- WHEN se muestra el badge
- THEN el texto indica que el desempate (o la primera ubicación) define el ranking
- AND no sugiere un resultado de ranking ponderado simultáneo

### Requirement: Trazabilidad de toda cifra mostrada

Todo valor citado en la capa de información DEBE tener una fuente identificable: campo del modelo usado por ranking, imputación marcada como estimada o tasa viva del store. MUST NOT generar cifras nuevas sin fuente.

#### Scenario: Auditoría de cifras

- GIVEN una razón visible en el recomendador
- WHEN se audita cada cifra de la razón (tasa, cap, imputación)
- THEN cada cifra corresponde a un dato en `ModelMetrics`, el store o la tasa viva
- AND, si hubo imputación o cap, la razón lo indica
