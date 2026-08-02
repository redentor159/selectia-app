# SelectIA — Casos de uso para MYPEs latinoamericanas

**Proyecto**: SelectIA v3.3.1 — Command Center de Modelos de IA para MYPEs latinoamericanas
**Autor**: José Jesús Alejandro Soria Vásquez — Ingeniería Industrial (Perú)
**Repo**: github.com/redentor159/selectia
**Licencia**: MIT
**Documento**: 8 casos de uso detallados para MYPEs LatAm, con perfiles, flujos de trabajo, modelos recomendados y costos.

---

## Cómo leer este documento

- **8 casos de uso** en 8 países distintos de LatAm.
- Cada caso es **verosímil pero hipotético**: nombres inventados, sectores reales, números plausibles.
- Cada caso incluye: contexto del negocio, problema, cómo se usa SelectIA paso a paso, modelos recomendados (según los datos actuales del JSON maestro), costo mensual estimado.
- **No se afirma** que estos casos sean reales ni que SelectIA esté en producción en planta. Son **escenarios de uso** para mostrar el valor del proyecto.
- Las equivalencias de costo (almuerzos, cafés, pintas) son orientativas y se basan en precios promedio urbanos de 2026.

---

## Perfil de MYPEs objetivo

| Variable | Rango |
|---|---|
| Tamaño | 1 a 50 empleados |
| Sector | Industrial, servicios profesionales, agroindustrial, textil, marketing, construcción, contable |
| Presupuesto IA mensual | USD 20 a USD 200 |
| Acceso a tecnología | Laptop/PC decente, internet básico, smartphone |
| Idioma operativo | Español LatAm (algunos bilingües ES/PT o ES/EN) |
| Moneda local | Una de las 21 soportadas por SelectIA |
| Madurez digital | Básica a intermedia: ya usan Excel, WhatsApp Business, Quizá facturador electrónico |
| Equipo técnico | Cero a un empleado con perfil técnico |
| Necesidad principal | Ahorrar tiempo en tareas repetitivas (documentación, cotización, traducción, programación CNC) |

---

## Caso 1 — Taller CNC en Lima (Perú)

### Contexto del negocio

**Taller Mecanizados Soria EIRL**, Lima Sur. 8 empleados. Torno CNC Haas ST-20 + fresadora CNC Haas VF-2. Hace piezas para minería y construcción: ejes, bridas, soportes. Facturación anual ~ USD 180,000. Dueño: ingeniero mecánico peruano, 45 años, sabe G-code básico pero no experto.

### Problema

1. **IPERC** (matriz de riesgo SUNAT) vencido hace 6 meses. SUNAT multa si no está actualizado.
2. **G-code**: cada pieza nueva requiere 4-8 horas de programación. Errores en G-code rompen herramientas (USD 80-200 por fresa rota).
3. **Cotizaciones**: el dueño pasa 2-3 horas por cotización, en soles, desglosando material + mano de obra + overhead + margen.

### Cómo usa SelectIA

1. Abre SelectIA en Linear Oscuro.
2. Selecciona modo **Equilibrado**, moneda **PEN**, categoría **razonamiento** (para IPERC y cotización) o **coding** (para G-code).
3. Para IPERC: SelectIA recomienda un modelo con alto II + reliability (probabilidad de no alucinar procedimientos legales).
4. Para G-code: SelectIA recomienda un modelo con alto coding + agentic (puede usar tools para validar G-code en un simulador).

### Flujo de trabajo paso a paso (IPERC)

1. El dueño pega el texto del procedimiento de trabajo (ej.: "Mecanizado de eje en torno CNC Haas ST-20, material SAE 1045, velocidad de corte 180 m/min").
2. Le pide al modelo recomendado (ej.: Claude 3.5 Sonnet vía API):
   > "Genera matriz IPERC en formato SUNAT para este procedimiento. Identifica peligros, evalúa riesgo (probabilidad × severidad), propón controles. Salida: tabla Markdown."
3. El modelo devuelve una tabla con 8-12 peligros, controles existentes, controles recomendados, y nivel de riesgo residual.
4. El dueño revisa en 20 minutos, ajusta 2-3 controles que conoce mejor, y exporta a Excel.
5. **Tiempo total**: 35 minutos (vs. 4 horas antes).

### Flujo de trabajo paso a paso (G-code)

1. El dueño sube el plano DXF de la pieza al modelo recomendado (ej.: DeepSeek V3 vía OpenRouter).
2. Le pide:
   > "Genera G-code para torno Haas ST-20. Material: SAE 1045. Operaciones: refrentado, cilindrado, roscado M20×2.5. Incluir ciclos G71/G76. Comentarios en español."
3. El modelo entrega G-code comentado en español.
4. El dueño lo pega en el simulador (NCViewer o similar), valida en 10 minutos.
5. Si hay errores, le pide al modelo corregir con contexto.
6. **Tiempo total**: 1.5 horas (vs. 6 horas antes).

### Modelos recomendados (json maestro actual)

| Tarea | Modelo sugerido | Por qué |
|---|---|---|
| IPERC | Claude 3.5 Sonnet | Alto II, reliability alto, comprende regulación peruana |
| G-code | DeepSeek V3 o Claude 3.5 Sonnet | Coding score alto, agentic |
| Cotización | GPT-4o-mini o Gemini 2.0 Flash | Razonamiento decente + precio muy bajo |

### Costo mensual estimado

- API Claude 3.5 Sonnet: ~50 USD/mes (PEN 190) para IPERC + cotizaciones
- API DeepSeek V3: ~10 USD/mes (PEN 38) para G-code
- API GPT-4o-mini: ~5 USD/mes (PEN 19) para cotizaciones rápidas
- **Total: ~65 USD/mes (PEN 247)** ≈ 13 almuerzos menu en Lima.

---

## Caso 2 — Consultora de traducción técnica en Bogotá (Colombia)

### Contexto del negocio

**Traducciones Técnicas Andinas SAS**, Bogotá. 6 empleados. Traducción ES ⇄ EN de manuales de maquinaria industrial, fichas técnicas de proveedores chinos/alemanes, y procedimientos de seguridad minero. Facturación anual ~ USD 120,000.

### Problema

1. Volumen creciente (5-10 manuales por mes, 30-100 páginas cada uno).
2. Terminología técnica inconsistente entre traductores (3 traductores humanos + 2 editores).
3. Necesidad de mantener glosarios cliente por cliente.

### Cómo usa SelectIA

1. Modo **Calidad**, moneda **COP**, categoría **razonamiento** (traducción = comprensión profunda).
2. SelectIA recomienda modelos con alto II + context (manuales largos) + reliability (no alucinar términos técnicos).
3. Para glosarios cliente, modo **Equilibrado**, categoría **agentic** (puede usar tools para mantener glosario actualizado).

### Flujo de trabajo paso a paso

1. Subir el PDF del manual (50-100 páginas) al modelo recomendado (ej.: Claude 3.5 Sonnet con context 200K).
2. Prompt:
   > "Traduce el siguiente manual técnico del inglés al español neutro. Mantén terminología técnica de ingeniería mecánica. Para términos ambiguos, propuesta + nota al pie. Salida: documento Markdown con índice."
3. El modelo entrega traducción en ~5 minutos (1M tokens output).
4. Editor humano revisa en 2-3 horas, marca términos a verificar.
5. Para glosario: prompt separado:
   > "Extrae los 50 términos técnicos clave del manual. Salida: tabla (EN, ES propuesto, contexto,alternativas)."
6. El glosario se guarda en el cliente, sirve para futuros manuales del mismo cliente.

### Modelos recomendados

| Tarea | Modelo sugerido | Por qué |
|---|---|---|
| Traducción manual | Claude 3.5 Sonnet | Context 200K, alta fidelidad terminológica |
| Extracción glosario | GPT-4o | Razonamiento metalingüístico |
| Revisión final | Gemini 2.0 Flash | Rápido + barato para segundo pase |

### Costo mensual estimado

- Claude 3.5 Sonnet: ~120 USD/mes (COP 480,000) para traducción
- GPT-4o: ~30 USD/mes (COP 120,000) para glosarios
- Gemini 2.0 Flash: ~15 USD/mes (COP 60,000) para revisión
- **Total: ~165 USD/mes (COP 660,000)** ≈ 8 manuales de mecanografía cliente.

---

## Caso 3 — Estudio de diseño industrial en CDMX (México)

### Contexto del negocio

**Diseño Industrial González Studio**, Ciudad de México. 4 personas. Diseño de mobiliario urbano, exhibidores para retail, y prototipos para startups. Facturación anual ~ USD 95,000.

### Problema

1. Generación de especificaciones técnicas para fabricación (materiales, tolerancias, acabados).
2. Documentación para cliente (catálogo, ficha técnica, manual de armado).
3. Análisis de competencia (benchmarking de productos similares en mercado).

### Cómo usa SelectIA

1. Modo **Equilibrado**, moneda **MXN**, categoría **razonamiento** para specs y docs, **visión** (modelos multimodales) para benchmarking.
2. SelectIA recomienda modelos con alto II + context + (para visión) capacidades multimodales.

### Flujo de trabajo paso a paso

1. Diseñador sube render del producto (imagen) + lista de materiales al modelo (ej.: GPT-4o).
2. Prompt:
   > "Genera especificación técnica de fabricación para el producto en la imagen. Incluye: materiales recomendados, tolerancias dimensionales, acabados, proceso de fabricación sugerido, lista de proveedores potenciales en México. Salida: PDF Markdown."
3. El modelo entrega spec en 3-5 minutos.
4. Para manual de armado: prompt separado con foto del prototipo desarmado.
5. Para benchmarking: prompt con URL de producto competidor:
   > "Compara este producto con [URL]. Diferencias clave en materiales, funcionalidad, precio estimado. Tabla comparativa."
6. **Tiempo total por proyecto**: 6 horas (vs. 18 horas antes).

### Modelos recomendados

| Tarea | Modelo sugerido | Por qué |
|---|---|---|
| Specs técnicas | GPT-4o | Multimodal, alto II |
| Manual armado | Claude 3.5 Sonnet | Estructura clara |
| Benchmarking | Gemini 2.0 Pro | Búsqueda web + multimodal |

### Costo mensual estimado

- GPT-4o: ~80 USD/mes (MXN 1,400)
- Claude 3.5 Sonnet: ~40 USD/mes (MXN 700)
- Gemini 2.0 Pro: ~25 USD/mes (MXN 440)
- **Total: ~145 USD/mes (MXN 2,540)** ≈ 10 cenas en CDMX centro.

---

## Caso 4 — StartUp agroindustrial en Quito (Ecuador)

### Contexto del negocio

**AndesAgro Tech**, Quito. 5 personas. Procesadora de quinoa y amaranto para exportación a EU. Maneja trazabilidad de campo a puerto. Facturación anual ~ USD 220,000.

### Problema

1. Documentación de calidad para certificaciones orgánicas (USDA Organic, EU Organic).
2. Comunicación con compradores europeos en inglés.
3. Análisis de datos de cosecha (Excel + Python básico).

### Cómo usa SelectIA

1. Modo **Calidad**, moneda **USD** (Ecuador usa USD), categoría **razonamiento** para documentación.
2. SelectIA recomienda modelos con alto II + reliability + coding (para Python cuando se necesita análisis de datos).

### Flujo de trabajo paso a paso

1. Para certificación orgánica: prompt con procedimiento de cultivo en español.
   > "Genera documentación para certificación USDA Organic. Incluye: plan de manejo de plagas (sin sintéticos), registro de campo, declaración de no-contaminación cruzada. Salida: PDF en inglés."
2. Para comunicación con compradores: prompt con resumen del pedido.
   > "Redacta email formal a comprador alemán. Tono: profesional, conciso. Detalles: 2 toneladas de quinoa orgánica, FOB Guayaquil, USD 3,200/ton, pago LC 60 días. Salida: email + PDF proforma."
3. Para análisis de cosecha: prompt con datos CSV.
   > "Analiza este CSV de rendimientos por parcela. Identifica las 3 parcelas con menor rendimiento. Sugiere 5 hipótesis de causa. Código Python con pandas."

### Modelos recomendados

| Tarea | Modelo sugerido | Por qué |
|---|---|---|
| Certificación | Claude 3.5 Sonnet | Alto II, comprende regulación USDA |
| Email + proforma | GPT-4o-mini | Suficiente para comunicación formal |
| Análisis datos | DeepSeek V3 | Coding alto, barato |

### Costo mensual estimado

- Claude 3.5 Sonnet: ~60 USD/mes
- GPT-4o-mini: ~10 USD/mes
- DeepSeek V3: ~15 USD/mes
- **Total: ~85 USD/mes** ≈ 17 almuerzos ejecutivos en Quito.

---

## Caso 5 — Firma contable en Santiago (Chile)

### Contexto del negocio

**Contabilidad & Asociados SpA**, Santiago. 12 empleados. Servicios contables para 80 pequeñas empresas. Maneja declaraciones de IVA, renta, libros contables, y asesoría tributaria. Facturación anual ~ USD 280,000.

### Problema

1. Volumen creciente de clientes: el SII (Servicio de Impuestos Internos) exige declaraciones mensuales.
2. Consultas repetitivas de clientes ("¿puedo deducir X?").
3. Mantenerse al día con cambios tributarios.

### Cómo usa SelectIA

1. Modo **Calidad**, moneda **CLP**, categoría **razonamiento** para consultas tributarias.
2. Modo **Equilibrado**, categoría **agentic** para automatizar declaraciones con tools (APIs del SII).

### Flujo de trabajo paso a paso

1. Cliente pregunta por WhatsApp: "¿Puedo deducir el arriendo de mi oficina como gasto?"
2. Contador lo pega en SelectIA-recomendado (Claude 3.5 Sonnet):
   > "Responde como contador chileno. ¿Es deducible el arriendo de oficina para una SpA? Cita artículo del SII. Tono: profesional pero claro para no-contador."
3. Modelo responde en 30 segundos con cita.
4. Contador revisa y reenvía al cliente.
5. Para declaraciones mensuales: integración con API SII vía agentic.
6. **Tiempo ahorrado**: 30 min por consulta (vs. 1.5 horas antes).

### Modelos recomendados

| Tarea | Modelo sugerido | Por qué |
|---|---|---|
| Consultas tributarias | Claude 3.5 Sonnet | Alto II, buen razonamiento legal |
| Declaraciones automatizadas | GPT-4o + tools | Agentic |
| Resumen libros contables | Gemini 2.0 Flash | Barato, suficiente |

### Costo mensual estimado

- Claude 3.5 Sonnet: ~150 USD/mes (CLP 140,000)
- GPT-4o: ~50 USD/mes (CLP 47,000)
- Gemini 2.0 Flash: ~20 USD/mes (CLP 19,000)
- **Total: ~220 USD/mes (CLP 206,000)** ≈ 6 consultas de un CPA en Santiago.

---

## Caso 6 — Agencia de marketing en Buenos Aires (Argentina)

### Contexto del negocio

**Marketing Pampa SRL**, Buenos Aires. 9 empleados. Social media, copywriting, SEO, y diseño para 25 clientes PYME. Facturación anual ~ USD 95,000 (impactada por cepo cambiario).

### Problema

1. Volumen de contenido (100+ posts/mes para 25 clientes).
2. Adaptación a cada cliente (tono, voz, sector).
3. SEO en español rioplatense vs. neutral.

### Cómo usa SelectIA

1. Modo **Equilibrado**, moneda **ARS**, categoría **razonamiento** para copywriting, **multimodal** para briefs visuales.
2. Para SEO, modo **Calidad** (necesita alta calidad de razonamiento sobre intención de búsqueda).

### Flujo de trabajo paso a paso

1. Brief de cliente: "5 posts para Instagram, marca de ropa sustentable, tono jovial pero comprometido."
2. SelectIA recomienda Claude 3.5 Sonnet (alto II, buena voz).
3. Prompt:
   > "Genera 5 posts de Instagram para marca de ropa sustentable argentina. Tono: jovial pero comprometido. Cada post: caption (max 150 palabras), 5 hashtags, idea de imagen (sin generar). Salida: tabla."
4. Para SEO blog post: prompt separado con keyword objetivo.
5. Diseñador usa la idea de imagen para generar visual en otro tool.

### Modelos recomendados

| Tarea | Modelo sugerido | Por qué |
|---|---|---|
| Copywriting social | Claude 3.5 Sonnet | Voz natural |
| SEO blog | GPT-4o | Razonamiento SEO |
| Adaptación a clientes | Gemini 2.0 Flash | Rápido y barato |

### Costo mensual estimado

- Claude 3.5 Sonnet: ~100 USD/mes (ARS 110,000 al cambio oficial)
- GPT-4o: ~30 USD/mes (ARS 33,000)
- Gemini 2.0 Flash: ~10 USD/mes (ARS 11,000)
- **Total: ~140 USD/mes (ARS 154,000)** ≈ 4 sueldos de community manager junior por hora.

---

## Caso 7 — Empresa de construcción en São Paulo (Brasil)

### Contexto del negocio

**Construções Tatuapé LTDA**, São Paulo. 35 empleados. Obras de pequeña escala (locales comerciales, viviendas hasta 200 m²). Facturación anual ~ USD 450,000.

### Problema

1. Cronogramas de obra (PERT/Gantt) que se desactualizan.
2. Documentación para licitaciones (editais) — burocrática.
3. Comunicación con fornecedores (muchos en China, Italia).

### Cómo usa SelectIA

1. Modo **Equilibrado**, moneda **BRL**, categoría **razonamiento** para cronogramas y licitaciones.
2. Modo **Calidad**, categoría **coding** para scripts de Project Management.
3. Para comunicación con fornecedores chinos, traducción ES/PT ⇄ ZH.

### Flujo de trabajo paso a paso

1. Engenheiro sube la lista de tarefas de la obra.
2. SelectIA recomienda Claude 3.5 Sonnet.
3. Prompt:
   > "Genera cronograma PERT para obra de reforma de local comercial 120m². Lista de tarefas: demolición, hidráulica, eléctrica, paredes, piso, pintura, entrega. Plazo objetivo: 45 días. Salida: tabla PERT + Gantt en Mermaid."
4. Para licitação: prompt con edital completo (PDF 30 páginas).
5. Para fornecedor chino: prompt con catálogo PDF en ZH.

### Modelos recomendados

| Tarea | Modelo sugerido | Por qué |
|---|---|---|
| Cronograma | Claude 3.5 Sonnet | Alto II, razonamiento project management |
| Licitação | GPT-4o | Context largo |
| Traducción ZH | DeepSeek V3 | Multilingüe, barato |

### Costo mensual estimado

- Claude 3.5 Sonnet: ~120 USD/mes (BRL 600)
- GPT-4o: ~40 USD/mes (BRL 200)
- DeepSeek V3: ~15 USD/mes (BRL 75)
- **Total: ~175 USD/mes (BRL 875)** ≈ 6 almuerços executivos na Paulista.

---

## Caso 8 — Taller textil en Lima (Perú)

### Contexto del negocio

**Textiles Los Andes SAC**, Lima. 18 empleados. Confección de polos, casacas, uniformes para empresas. Especialidad: algodón pima peruano. Facturación anual ~ USD 200,000.

### Problema

1. Cotizaciones de grandes pedidos (500-5000 unidades).
2. Manual de calidad para exportación.
3. Adaptación de patrones para tallas internacionales (US, EU, Asia).

### Cómo usa SelectIA

1. Modo **Equilibrado**, moneda **PEN**, categoría **razonamiento** para cotizaciones y manuales.
2. Para patrones, modo **Calidad**, categoría **razonamiento** (conversión de tallas requiere alta precisión).

### Flujo de trabajo paso a paso

1. Para cotización: prompt con specs del pedido.
   > "Cotización para 2000 polos pima, color blanco, estampado 1 color frente, etiqueta tejida. Material: algodón pima 100%. Costo actual: S/ 18 por polo en bruto. Margen objetivo: 35%. Salida: tabla con desglose material, MO, overhead, margen, precio final, precio por unidad."
2. Para manual de calidad: prompt con procedimiento interno.
3. Para conversión de tallas: prompt con tabla de medidas base.
   > "Convierte esta tabla de medidas talla Perú a tallas US, EU, Asia. Justifica conversiones. Salida: tabla 4 columnas."

### Modelos recomendados

| Tarea | Modelo sugerido | Por qué |
|---|---|---|
| Cotización | GPT-4o-mini | Suficiente para cálculos |
| Manual calidad | Claude 3.5 Sonnet | Documentación técnica |
| Conversión tallas | GPT-4o | Alto razonamiento |

### Costo mensual estimado

- GPT-4o-mini: ~15 USD/mes (PEN 57)
- Claude 3.5 Sonnet: ~50 USD/mes (PEN 190)
- GPT-4o: ~30 USD/mes (PEN 114)
- **Total: ~95 USD/mes (PEN 361)** ≈ 19 almuerzos menu en Lima.

---

## Patrones transversales — 5 patrones de uso que se repiten

### Patrón 1 — "El modelo correcto para la tarea correcta"

En todos los casos, el usuario tiene múltiples tareas (IPERC + G-code + cotización, o traducción + glosario + revisión). SelectIA no entrega un solo modelo: entrega el modelo correcto para cada tarea. Esto es más eficiente que usar GPT-4o para todo (caro) o GPT-4o-mini para todo (insuficiente para tareas complejas).

### Patrón 2 — "Primera pasada con IA, segunda pasada humana"

Ningún caso asume que la IA reemplaza al humano. La IA hace la primera versión (borrador, traducción, código G), y el humano revisa. El ahorro está en el tiempo de revisión (3 horas vs. 6 horas para producir desde cero).

### Patrón 3 — "Equivalencias de costo para comunicar valor"

El costo mensual en USD es opaco para la MYPE. Convertir a "13 almuerzos menu" o "8 manuales de mecanografía" comunica el valor en términos que el dueño entiende. SelectIA soporta esta conversión (ver `equivalences.ts` y el ADR correspondiente en `DECISIONES_DISENIO.md`).

### Patrón 4 — "Modo Calidad para lo crítico, Equilibrado para lo rutinario"

Las tareas críticas (IPERC legal, traducción de manual técnico, conversión de tallas para exportación) usan modo Calidad con piso II ≥ 30. Las tareas rutinarias (cotización rápida, email genérico) usan modo Equilibrado. Ahorro extrema solo para tareas de volumen alto y baja complejidad.

### Patrón 5 — "Glosario como puerta de entrada"

El glosario de 176 términos con 15 deepDives sirve como puerta de entrada para usuarios que no entienden II, AHP, TF-IDF, reliability. En cada caso, los usuarios consultan el glosario en su primera sesión y luego no necesitan volver a consultarlo.

---

## Equivalencias de costo útiles por país

> Las equivalencias son orientativas, basadas en precios promedio urbanos de 2026. SelectIA calcula estas equivalencias dinámicamente en la vista Calculadora.

| País | Moneda | 1 almuerzo menu | 1 café | 1 pinta | 1 hora profesional |
|---|---|---|---|---|---|
| Perú | PEN | 18 | 8 | 15 | 35 |
| México | MXN | 120 | 35 | 70 | 180 |
| Colombia | COP | 12,000 | 4,500 | 8,000 | 25,000 |
| Chile | CLP | 5,500 | 2,000 | 3,500 | 12,000 |
| Argentina | ARS | 8,000 | 2,500 | 4,500 | 18,000 |
| Brasil | BRL | 30 | 10 | 18 | 60 |
| Ecuador | USD | 5 | 2 | 4 | 12 |
| Uruguay | UYU | 350 | 120 | 200 | 600 |
| Bolivia | BOB | 35 | 12 | 25 | 70 |
| Paraguay | PYG | 35,000 | 12,000 | 22,000 | 80,000 |
| Venezuela | USD | 6 | 2.5 | 5 | 10 |
| Costa Rica | CRC | 3,500 | 1,200 | 2,200 | 7,000 |
| Panamá | USD | 7 | 3 | 5 | 15 |
| Guatemala | GTQ | 35 | 12 | 25 | 70 |
| Honduras | HNL | 130 | 50 | 90 | 280 |
| El Salvador | USD | 5 | 2 | 4 | 12 |
| Nicaragua | NIO | 200 | 70 | 130 | 400 |
| Cuba | USD | 8 | 3 | 6 | 15 |
| Rep. Dominicana | DOP | 350 | 120 | 220 | 700 |
| Haití | HTG | 800 | 300 | 550 | 1,500 |
| Canadá | CAD | 18 | 6 | 11 | 35 |

Equivalencia de $50 USD/mes (presupuesto IA típico) por país:

| País | $50 USD equivale a |
|---|---|
| Perú | ~2.8 almuerzos por día |
| México | ~4 almuerzos |
| Chile | ~9 almuerzos |
| Brasil | ~1.7 almuerzos |
| Argentina | ~6 almuerzos (al blue) |

---

## Cierre

Estos 8 casos son escenarios verosímiles de uso. No son casos reales en producción. Sirven para mostrar el rango de aplicaciones de SelectIA en MYPEs LatAm y para que un dueño de MYPE se reconozca en al menos uno de los perfiles.

Si tienes un caso real (tuya o de un conocido) que quieras compartir, abre un issue en el repo con etiqueta "case study". Lo incorporaremos a este documento con atribución (o anónimo si prefieres).

— *Fin del documento.*
