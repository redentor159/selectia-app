# Spec: Gráficos Expandibles (graficos-expandibles)

## Capability: graficos-expandibles

Identidad de gráficos (`data-chart-id`), expansión a modal con zoom por dominio en eje X (Brush), click en punto a ficha técnica, herencia de filtros y leyenda, resolución temporal y reset de zoom por apertura.

## Requirements

### Requirement: Identidad estable de gráficos (data-chart-id)

Todo gráfico Recharts del dashboard (overview-view, analytics-view, gerente-view, simulador-roi-view, comparador-view y vistas futuras con gráficos) DEBE exponer `data-chart-id` con valor estable, semántico y en kebab-case. El valor MUST NOT cambiar entre renders ni al alternar filtros.

#### Scenario: Identidad presente en todos los gráficos

- GIVEN una vista del dashboard que renderiza un gráfico Recharts
- WHEN la vista se renderiza
- THEN el contenedor del gráfico incluye `data-chart-id` con valor kebab-case semántico
- AND el valor identifica de forma única al gráfico dentro de la vista

#### Scenario: Identidad estable ante re-render

- GIVEN un gráfico con `data-chart-id` definido
- WHEN el usuario alterna `activeProviders` u otro filtro que re-renderiza la vista
- THEN el valor de `data-chart-id` permanece idéntico

### Requirement: Expansión a modal en los 6 gráficos objetivo

La Card de cada gráfico objetivo (Inteligencia vs Precio, Adopción vs Calidad, Evolución de Inteligencia; Velocidad vs Ventana de Contexto, Coding Index vs Agentic Index, Eficiencia) DEBE incluir un botón expandir (ícono maximize). Al activarlo, el sistema DEBE abrir un modal (Dialog shadcn/ui, ~70vh) con el mismo gráfico a mayor tamaño, reutilizando la configuración de series del gráfico de origen.

#### Scenario: Abrir modal desde el botón expandir

- GIVEN un gráfico objetivo con su Card visible
- WHEN el usuario hace click en el botón expandir
- THEN se abre un modal de ~70vh con el gráfico ampliado
- AND el modal reutiliza las series y colores del gráfico de origen

### Requirement: Zoom por dominio en el eje X con Brush

El modal DEBE ofrecer zoom por dominio en el eje X mediante `<Brush>` de Recharts: arrastrar selecciona un rango, pan desplaza la ventana dentro del rango y un botón de reset restaura la vista completa. El zoom MUST NOT aplicar sobre el eje Y y MUST NOT requerir librerías nuevas.

#### Scenario: Selección de rango con drag

- GIVEN un modal abierto con un gráfico ampliado
- WHEN el usuario arrastra el Brush sobre un subrango del eje X
- THEN el dominio X del gráfico se restringe al rango seleccionado

#### Scenario: Pan dentro del rango seleccionado

- GIVEN un rango seleccionado con el Brush
- WHEN el usuario navega (pan) sobre el rango
- THEN la ventana visible se desplaza sin modificar el tamaño del rango

#### Scenario: Reset del zoom

- GIVEN un zoom aplicado dentro del modal
- WHEN el usuario activa el botón de reset
- THEN el gráfico restaura el dominio X completo

### Requirement: Ficha técnica del modelo desde el modal

Dentro del modal, el click en un punto DEBE abrir la ficha técnica del modelo correspondiente, reutilizando el patrón de `tabla-view.tsx`. Dentro del modal, el click en un punto MUST NOT ejecutar `toggleProvider`.

#### Scenario: Click en punto abre la ficha técnica

- GIVEN un modal abierto con puntos de modelos visibles
- WHEN el usuario hace click en un punto
- THEN se muestra la ficha técnica del modelo asociado

#### Scenario: El click en el modal no alterna proveedores

- GIVEN un modal abierto
- WHEN el usuario hace click en un punto
- THEN `activeProviders` de la vista no se modifica

### Requirement: Herencia de filtros y leyenda en el modal

El modal DEBE heredar `activeProviders` de la vista de origen y DEBE incluir `ScatterProviderLegend` para alternar proveedores en vivo.

#### Scenario: Herencia de filtros de proveedores

- GIVEN una vista con ciertos proveedores activos y otros ocultos
- WHEN el usuario abre el modal
- THEN el modal muestra el mismo conjunto de proveedores activos

#### Scenario: Toggle de proveedor desde la leyenda del modal

- GIVEN un modal abierto con leyenda visible
- WHEN el usuario alterna un proveedor en `ScatterProviderLegend`
- THEN la serie del proveedor se muestra u oculta en vivo dentro del modal

### Requirement: Reset de zoom por apertura

El modal DEBE abrirse siempre con el zoom reseteado; el estado de zoom MUST NOT persistir entre aperturas.

#### Scenario: Zoom reseteado al cerrar y reabrir

- GIVEN un modal con zoom aplicado sobre el eje X
- WHEN el usuario cierra y vuelve a abrir el modal
- THEN el gráfico se muestra con el dominio X completo

### Requirement: Resolución temporal en el modal de Evolución de Inteligencia

El modal de Evolución de Inteligencia DEBE incluir un selector de resolución temporal (Semanal, Mensual, Trimestral, Anual) que reagrega los datos del gráfico dentro del modal.

#### Scenario: Cambio de resolución temporal

- GIVEN el modal de Evolución de Inteligencia abierto
- WHEN el usuario selecciona una resolución distinta a la actual
- THEN el gráfico del modal se actualiza con los datos reagregados a esa resolución

### Requirement: Zoom en el espacio de datos real de cada eje

El dominio del Brush DEBE operar en el espacio de datos real del eje X. El gráfico Eficiencia DEBE usar `scale="log"` nativo; los demás gráficos DEBEN precomputar log10/log2 en el dato cuando corresponda, y el zoom DEBE interpretar el rango sobre los valores reales del eje.

#### Scenario: Zoom correcto en Eficiencia con escala log

- GIVEN el modal de Eficiencia abierto con escala logarítmica
- WHEN el usuario selecciona un rango con el Brush
- THEN el rango se aplica sobre los valores reales del eje sin distorsión por la escala visual

#### Scenario: Zoom con datos precomputados en el resto de gráficos

- GIVEN un modal de un gráfico cuyos datos usan log10/log2 precomputado
- WHEN el usuario selecciona un rango con el Brush
- THEN el rango corresponde a los valores reales del dato, no a la escala transformada
