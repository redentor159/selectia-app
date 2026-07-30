# Rediseño de Extrema Densidad: Ficha Técnica (HuggingFace)

El usuario ha solicitado una reestructuración **extrema** de los espacios en blanco, manteniendo la separación de cajas originales (secciones), aplicando la filosofía de diseño "Impeccable" (alta densidad, cero cajas-dentro-de-cajas redundantes, máxima escaneabilidad).

## Objetivo
Eliminar todo espacio en blanco desperdiciado en la Ficha Técnica de HuggingFace (`ficha-tecnica-modal.tsx`), sección por sección, reemplazando el componente obeso `MetricCard` por un diseño de tablas densas (Data Rows) estilo Bloomberg, sin alterar la cantidad de información ni la estructura externa de las secciones.

## Estrategia General (Impeccable Critique)
Actualmente, cada sección utiliza un grid de `MetricCard`s. Cada `MetricCard` tiene:
- `p-3` (padding interno)
- Apilamiento vertical de 3 elementos: Icono/Label, Valor gigante, Hint explicativo.
Esto fuerza a que un simple dato como "Downloads: 156,399" ocupe ~80px de alto. Multiplicado por 5 secciones, empuja el contenido fuera de la pantalla.

**Solución**: Reemplazar `MetricCard` en estas secciones por un `CompactHFRow` (llave a la izquierda, valor a la derecha, en una sola línea de 24-32px de alto, usando Tooltips para mantener la explicación del "hint" accesible sin ensuciar la vista).

---

## Cambios Propuestos Seccion por Seccion

### 1. Actividad del Ecosistema
- **Antes**: 2 `MetricCard` gigantes (Spaces, HF Inference) + lista de enlaces apilada.
- **Después**: 
  - Fila 1: `Spaces: 39 apps` | `HF Inference: Warm` (en una sola línea).
  - Los hints pasarán a Tooltips anclados en el Label.
  - La lista de "Ejemplos de Spaces" usará un flex wrap compacto o lista en línea (`gap-2`), no apilada verticalmente.

### 2. Adopción Comunitaria
- **Antes**: 3 `MetricCard` (Downloads, Likes, Trending) = mucho espacio vertical y horizontal vacío.
- **Después**: Una sola fila dividida en 3 columnas puras o un grid `grid-cols-3 gap-4`. En vez de tarjetas, pares directos de `Label -> Value` con fuente monoespaciada para los números.

### 3. Detalles de Hardware (safetensors)
- **Antes**: 4 `MetricCard` que ocupan gran altura, más un bloque verde debajo.
- **Después**: Transformar en una tabla densa de 2 columnas. 
  - Columna Izq: Parámetros Totales, BF16.
  - Columna Der: F32, Archivos en repo.
  - Se elimina la tarjeta y se usa `CompactHFRow`. El texto extra (ej. "426,993,800,960 parámetros") se integra como subtexto en la misma línea o se va al Tooltip.

### 4. Detalles Técnicos de Implementación
- **Antes**: Grid de 6 tarjetas masivas.
- **Después**: Tabla compacta `grid-cols-2 gap-x-8`. 
  - Fila 1: Library | Auto Model
  - Fila 2: Architecture | Processor
  - Fila 3: Commit SHA | Used Storage
  Todo renderizado en una sola línea por dato, alineación de valores a la derecha. Altura total pasará de ~250px a ~80px.

### 5. Salud y Vigencia del Repo
- **Antes**: 4 tarjetas.
- **Después**: Misma estrategia. Una fila compacta con 4 columnas o 2 filas de 2 columnas, puramente textual.

### 6. Contenedor `<Section>`
- Modificar el `<Section>` original o sobreescribir su padding interno (`p-4 pt-4`) pasándolo a `p-3` para reducir el margen perimetral sin perder la caja delimitadora (borde).

## Plan de Ejecución
1. Crear un componente interno estático `CompactHFRow` dentro de `ficha-tecnica-modal.tsx` que maneje el formato de alta densidad con Tooltips (idéntico en concepto al que hicimos para OpenRouter).
2. Refactorizar **cada una de las 6 secciones** mencionadas para utilizar `CompactHFRow` en lugar de `MetricCard`.
3. Ajustar márgenes y gaps (`space-y-X`) para que las secciones queden apretadas.
4. Validar tipeo (Typescript).

## Aprobación Requerida
¿Estás de acuerdo con este plan de ataque detallado para erradicar el espacio en blanco manteniendo las secciones separadas?
