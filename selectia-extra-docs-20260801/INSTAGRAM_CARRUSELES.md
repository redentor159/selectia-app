# Instagram — 4 Carruseles para SelectIA

**Proyecto**: SelectIA v3.3.1
**Autor**: José Jesús Alejandro Soria Vásquez — Ing. Industrial (Perú)
**Repo**: github.com/redentor159/selectia

---

## Cómo usar Instagram para contenido técnico B2B

Instagram es visualmente exigente pero funciona muy bien para contenido técnico cuando se diseña como **carrusel educativo**. Reglas de oro:

1. **Formato**: cuadrado 1080×1080 o vertical 1080×1350 (este último ocupa más pantalla en mobile).
2. **Número de slides**: 8–10 es óptimo. Menos de 6 no genera profundidad, más de 12 cansa.
3. **Slide 1 = portada**: tiene que detener el scroll. Tipografía grande, contraste alto, promesa clara.
4. **Slide final = CTA**: "Guarda este post", "Comenta IPERC para el link", "Sígueme para más".
5. **Texto grande**: mínimo 36pt en cuerpo, 80pt en títulos. La gente lee IG con el pulgar en movimiento.
6. **Una idea por slide**: no apilar 5 conceptos en una imagen.
7. **Paleta consistente**: usar los 4 temas del propio SelectIA (Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro) como referencia cromática.
8. **Caption largo**: 300–500 palabras. IG premia el tiempo de permanencia.
9. **Hashtags**: 15–20, mezcla de genéricos (#IA), nicho (#TOPSIS) y locales (#Perú #LatAm).
10. **Primer comentario**: escribirlo tú mismo con el link del repo (IG no permite links clickeables en caption).

**Herramientas recomendadas para diseñar los carruseles**:
- Figma (gratis) con plantilla 1080×1350.
- Canva (gratis) con plantillas de carrusel.
- O directamente en HTML/CSS + screenshot (mantener fidelidad al design system).

**Estrategia de publicación (30 días)**:
- Semana 1: Carrusel 1 (mejor modelo para MYPE).
- Semana 2: Carrusel 2 (TOPSIS explicado).
- Semana 3: Carrusel 3 (21 monedas LatAm).
- Semana 4: Carrusel 4 (proceso con 4 IAs).

---

## Carrusel 1 — "¿Cuál es el mejor modelo de IA para tu MYPE?" (10 slides)

> **Tema visual recomendado**: Blanco Puro (fondo blanco, texto negro, acentos índigo #5e6ad2).
> **Audiencia**: dueños de MYPEs LatAm, gerentes de operaciones, estudiantes de ing. industrial.
> **Objetivo**: que el espectador entienda que existe una forma sistemática de elegir modelo de IA.

### Slide 1 — Portada

- **Texto grande**: "¿Cuál es el MEJOR modelo de IA para tu MYPE?"
- **Subtítulo**: "Spoiler: no existe. Existe el mejor para cada tarea."
- **Idea visual**: icono de una balanza con 3 modelos de IA en cada lado.
- **Color de fondo**: Blanco Puro (#FFFFFF) con título en negro (#0A0A0A) y "MEJOR" en índigo (#5e6ad2).
- **Emoji/icono**: ⚖️

### Slide 2 — El problema

- **Texto grande**: "Hay 200+ modelos de IA."
- **Subtítulo**: "¿Cómo decides cuál usar para cotizar? ¿Y para redactar un IPERC?"
- **Bullets cortos**:
  - GPT, Claude, Gemini, Llama, Qwen, DeepSeek…
  - Cada uno con precios, latencias y capacidades distintas.
  - Elegir mal = perder tiempo en retrabajo.
- **Idea visual**: nube de logos de modelos de IA saturada.
- **Color de fondo**: Blanco Puro con nube de logos en grises claros.
- **Emoji/icono**: 🤯

### Slide 3 — La solución

- **Texto grande**: "Construí SelectIA."
- **Subtítulo**: "Un dashboard que compara 206 modelos desde 13 fuentes en vivo."
- **Bullets cortos**:
  - 206 modelos comparados
  - 13 fuentes de datos reales
  - Recomendación en 0.5 ms
- **Idea visual**: screenshot limpio de la vista Resumen del dashboard.
- **Color de fondo**: Linear Claro (gris muy claro #FAFAFA).
- **Emoji/icono**: 🎯

### Slide 4 — Caso de uso 1: IPERC

- **Texto grande**: "Caso 1: IPERC"
- **Subtítulo**: "Matriz de Identificación de Peligros y Evaluación de Riesgos."
- **Bullets cortos**:
  - Necesitas: razonamiento estructurado + contexto largo.
  - SelectIA recomienda modelos con alto II y context window amplia.
  - Latencia < 10 ms.
- **Idea visual**: icono de casco + matriz de riesgo simplificada.
- **Color de fondo**: Blanco Puro con acentos en verde (#10B981).
- **Emoji/icono**: ⛑️

### Slide 5 — Caso de uso 2: G-code CNC

- **Texto grande**: "Caso 2: G-code para CNC"
- **Subtítulo**: "Generar código de control numérico para máquinas."
- **Bullets cortos**:
  - Necesitas: coding fuerte + precisión.
  - SelectIA prioriza el criterio "coding" y "reliability".
  - Output verificable línea por línea.
- **Idea visual**: icono de engranaje + fragmento de G-code.
- **Color de fondo**: Linear Oscuro (fondo #08090A, texto blanco).
- **Emoji/icono**: ⚙️

### Slide 6 — Caso de uso 3: Manual técnico

- **Texto grande**: "Caso 3: Manual técnico 300 páginas"
- **Subtítulo**: "Análisis y resumen de manuales largos."
- **Bullets cortos**:
  - Necesitas: context window grande + razonamiento.
  - SelectIA filtra por contexto mínimo.
  - Calidad garantizada por piso de calidad.
- **Idea visual**: pila de páginas con una lupa encima.
- **Color de fondo**: Blanco Puro con acentos en índigo.
- **Emoji/icono**: 📚

### Slide 7 — Caso de uso 4: Cotización

- **Texto grande**: "Caso 4: Cotización"
- **Subtítulo**: "Generar cotizaciones en moneda local."
- **Bullets cortos**:
  - Necesitas: precisión + precio bajo.
  - 21 monedas de América soportadas.
  - PEN, USD, BRL, MXN, COP, CLP, ARS, CAD + 13.
- **Idea visual**: billetes de distintas monedas de LatAm.
- **Color de fondo**: Linear Claro.
- **Emoji/icono**: 💵

### Slide 8 — Métricas clave

- **Texto grande**: "SelectIA en números"
- **Subtítulo**: "Métricas verificables, no estimadas."
- **Bullets cortos**:
  - 206 modelos · 13 fuentes en vivo
  - 31,116 LOC TypeScript · 111 archivos
  - JSON 376 KB · latencia avg 0.5 ms
  - v3.3.1 · MIT · Vercel gratis
- **Idea visual**: tipografía grande tipo KPI dashboard.
- **Color de fondo**: Negro Puro (#000000), texto blanco, números en índigo.
- **Emoji/icono**: 📊

### Slide 9 — Cómo acceder

- **Texto grande**: "Cómo acceder"
- **Subtítulo**: "Open source MIT. Deploy gratis en Vercel."
- **Bullets cortos**:
  - Repo: github.com/redentor159/selectia
  - Fork → deploy en Vercel en 5 minutos.
  - Sin tarjeta de crédito, sin trial, sin vendedor.
- **Idea visual**: captura del botón "Deploy to Vercel" + logo GitHub.
- **Color de fondo**: Blanco Puro con acentos en índigo.
- **Emoji/icono**: 🔗

### Slide 10 — CTA

- **Texto grande**: "¿Qué tarea automatizarías primero?"
- **Subtítulo**: "Comenta tu respuesta. Los leo todos."
- **Bullets cortos**:
  - Guarda este post para tu próxima decisión de IA.
  - Sígueme para más contenido de IA + Ingeniería Industrial.
  - Link del repo en el primer comentario.
- **Idea visual**: icono de guardado (bookmark) + flecha.
- **Color de fondo**: Linear Oscuro con CTA en índigo brillante.
- **Emoji/icono**: 💾

### Caption del Carrusel 1

¿Cuál es el mejor modelo de IA para tu MYPE? Spoiler: no existe uno solo. Existe el mejor para cada tarea.

Un estudio de Workday (enero 2026, 3,200 líderes de negocio) encontró algo que me hizo construir SelectIA: 85% de empleados ahorra 1–7 horas por semana con IA, pero casi el 40% de ese tiempo se pierde en retrabajo. La causa más común: elegir el modelo equivocado para la tarea.

Por eso construí SelectIA, un AI Command Center para MYPEs latinoamericanas. Compara 206 modelos de IA desde 13 fuentes de datos en vivo (Artificial Analysis, BenchLM, ZeroEval, Arena AI, LiteLLM, HuggingFace Hub, OpenRouter, Open ER-API, Groq, Models.dev, Helicone, Aider y Ollama) y recomienda el óptimo para cada caso de uso con una latencia promedio de 0.5 ms (máximo 3 ms).

Casos reales que están en el dashboard como botones clicables:
▪️ IPERC (matriz de riesgo)
▪️ G-code para CNC
▪️ Análisis de manual técnico de 300 páginas
▪️ Cotización en moneda local
▪️ Traducción técnica

Detrás hay un motor HRE-TOPSIS con 8 criterios ponderados por AHP (Consistency Ratio = 0). El motor explica en español plano por qué recomienda cada modelo. Sin opacidad.

Para que sirva de verdad en LatAm, soporta 21 monedas de América (PEN, USD, BRL, MXN, COP, CLP, ARS, CAD + 13 más) y 4 temas visuales.

Métricas verificables:
▪️ 206 modelos · 13 fuentes en vivo
▪️ 31,116 LOC TypeScript · 111 archivos · JSON 376 KB
▪️ Cron diario 2 AM Lima · latencia avg 0.5 ms, max 3 ms
▪️ Glosario de 176 términos, 15 deepDives, 8 categorías
▪️ v3.3.1 · MIT · deploy gratis en Vercel

Proceso honesto: usé 4 IAs como asistentes de investigación (GLM-5.2, Minimax M3, Gemini 3.1 Pro, Claude Sonnet 4.6), pasando contexto manualmente entre sesiones. Sin framework de orquestación.

Repo: github.com/redentor159/selectia (link en el primer comentario 👇)

¿Qué tarea automatizarías primero en tu MYPE? Los leo 👇

#IngenieriaIndustrial #IA #TOPSIS #ProductManagement #MultiModelo #MYPE #LatAm #Perú #OpenSource #InteligenciaArtificial #Ingenieria #Productividad #Innovacion #Tecnologia #PyME #Emprendimiento #Industria #CNC #Manufactura #DataScience

### Hashtags del Carrusel 1 (20)
`#IngenieriaIndustrial` `#IA` `#TOPSIS` `#ProductManagement` `#MultiModelo` `#MYPE` `#LatAm` `#Perú` `#OpenSource` `#InteligenciaArtificial` `#Ingenieria` `#Productividad` `#Innovacion` `#Tecnologia` `#PyME` `#Emprendimiento` `#Industria` `#CNC` `#Manufactura` `#DataScience`

---

## Carrusel 2 — "TOPSIS explicado como si tuvieras 15 años" (8 slides)

> **Tema visual recomendado**: Linear Claro (fondo gris claro, texto negro, acentos índigo).
> **Audiencia**: estudiantes secundaria/universitarios, equipos no técnicos de MYPEs.
> **Objetivo**: desmitificar TOPSIS con analogía simple.

### Slide 1 — Portada

- **Texto grande**: "TOPSIS explicado a 15 años"
- **Subtítulo**: "El método que usa SelectIA para recomendar el mejor modelo de IA."
- **Idea visual**: emoji grande de cerebro + chico con cuaderno.
- **Color de fondo**: Blanco Puro con título en negro, "TOPSIS" en índigo.
- **Emoji/icono**: 🧠

### Slide 2 — El problema

- **Texto grande**: "Imagina que eliges pizza."
- **Subtítulo**: "Tienes 8 opciones. Debes considerar precio, tamaño, ingredientes, tiempo de entrega y qué tan rica es."
- **Bullets cortos**:
  - No puedes optimizar todo a la vez.
  - La más barata no es la más rica.
  - La más rápida no tiene los mejores ingredientes.
- **Idea visual**: 8 pizzas pequeñas numeradas.
- **Color de fondo**: Linear Claro.
- **Emoji/icono**: 🍕

### Slide 3 — La idea de TOPSIS

- **Texto grande**: "TOPSIS = la más cercana al ideal."
- **Subtítulo**: "Buscamos la pizza que más se parece a la 'pizza perfecta' y menos se parece a la 'peor pizza posible'."
- **Bullets cortos**:
  - Pizza ideal: barata, grande, rica, rápida.
  - Pizza anti-ideal: cara, chiquita, fea, lenta.
  - TOPSIS mide la cercanía a cada una.
- **Idea visual**: dos pizzas ideales (una brillante, una triste) y una flecha entre ellas.
- **Color de fondo**: Blanco Puro.
- **Emoji/icono**: ⭐

### Slide 4 — Los 8 criterios de SelectIA

- **Texto grande**: "En SelectIA hay 8 criterios."
- **Subtítulo**: "No es pizza, es elegir modelo de IA."
- **Bullets cortos**:
  - Precio
  - II (inteligencia)
  - Coding
  - Agentic
  - Speed
  - Context window
  - ELO
  - Reliability
- **Idea visual**: 8 íconos en grid 4×2, cada uno representando un criterio.
- **Color de fondo**: Linear Claro.
- **Emoji/icono**: 🎯

### Slide 5 — Distancia euclidiana

- **Texto grande**: "Distancia euclidiana = Pitágoras."
- **Subtítulo**: "La misma fórmula que aprendiste en colegio: √(a² + b²)."
- **Bullets cortos**:
  - En 2D: distancia entre dos puntos.
  - En 8D: distancia entre dos modelos.
  - El modelo más cercano al ideal gana.
- **Idea visual**: triángulo rectángulo con fórmula Pitágoras visible.
- **Color de fondo**: Blanco Puro.
- **Emoji/icono**: 📐

### Slide 6 — ¿Cómo decidimos el peso de cada criterio?

- **Texto grande**: "AHP decide los pesos."
- **Subtítulo**: "Comparamos cada criterio contra cada uno (pareado)."
- **Bullets cortos**:
  - "Precio es 3× más importante que speed?"
  - Sí / No / Igual.
  - 28 comparaciones para 8 criterios.
  - Resultado: 8 pesos que suman 1.
- **Idea visual**: tabla de comparación pareada simplificada.
- **Color de fondo**: Linear Claro.
- **Emoji/icono**: ⚖️

### Slide 7 — La magia del CR=0

- **Texto grande**: "CR = 0"
- **Subtítulo**: "Consistency Ratio cero. La matriz es perfectamente consistente."
- **Bullets cortos**:
  - Si A es 2× B, y B es 3× C, entonces A debe ser 6× C.
  - Si no, hay inconsistencia.
  - En SelectIA: CR = 0. Perfecto.
- **Idea visual**: tres círculos con flechas mostrando proporciones consistentes.
- **Color de fondo**: Negro Puro, "CR = 0" en verde brillante.
- **Emoji/icono**: ✅

### Slide 8 — CTA

- **Texto grande**: "¿Lo entenderías a los 15?"
- **Subtítulo**: "Comenta qué parte te costó más. Los leo."
- **Bullets cortos**:
  - Guarda este post para tu próxima clase de Ing. Industrial.
  - Sígueme para más contenido así.
  - Repo de SelectIA en el primer comentario.
- **Idea visual**: icono de marcador + flecha abajo.
- **Color de fondo**: Linear Oscuro.
- **Emoji/icono**: 💾

### Caption del Carrusel 2

TOPSIS explicado como si tuvieras 15 años 🧠

TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution) es un método de decisión multi-criterio que se enseña en Ingeniería Industrial desde hace 40 años. Pero casi nadie lo explica simple.

La idea es elegante: en lugar de buscar "el mejor" en abstracto, identificamos el "ideal positivo" (lo mejor posible en cada criterio) y el "ideal negativo" (lo peor posible). Luego medimos qué tan cerca está cada alternativa al ideal positivo y qué tan lejos del ideal negativo. La más cercana al ideal gana.

La distancia se mide con euclidiana — la misma fórmula de Pitágoras que aprendiste en el colegio, solo que extendida a 8 dimensiones.

En SelectIA uso TOPSIS para recomendar modelos de IA. Los 8 criterios son: precio, II (inteligencia), coding, agentic, speed, context window, ELO y reliability. Para ponderarlos uso AHP (Analytic Hierarchy Process), comparando cada criterio contra cada uno en escala 1-9.

Aquí viene la parte que más me costó: el Consistency Ratio. AHP tiene una trampa: si tus comparaciones son lógicamente contradictorias (A es 2× B, B es 3× C, pero A es solo 4× C — debería ser 6× C), los pesos dejan de ser confiables. Por eso se calcula el CR. En SelectIA: CR = 0. La matriz de comparación es perfectamente consistente.

Métricas del motor HRE-TOPSIS:
▪️ 206 modelos comparados desde 13 fuentes en vivo
▪️ Latencia avg 0.5 ms, max 3 ms, siempre < 10 ms
▪️ AHP con CR = 0
▪️ 31,116 LOC TypeScript · 111 archivos · JSON 376 KB
▪️ Cron diario 2 AM Lima · v3.3.1 · MIT

Casos de uso reales: IPERC, G-code CNC, manual técnico 300 páginas, cotización, traducción técnica.

Repo: github.com/redentor159/selectia (link en el primer comentario 👇)

¿Qué parte de TOPSIS te costó más entender cuando lo estudiaste? Los leo 👇

#TOPSIS #IngenieriaIndustrial #AHP #IA #DecisionMulticriterio #Matematicas #Educacion #Ingenieria #ProductManagement #MultiModelo #LatAm #Perú #OpenSource #InteligenciaArtificial #InvestigacionDeOperaciones #IO #Optimizacion #DataScience #Estudiantes #Universidad

### Hashtags del Carrusel 2 (20)
`#TOPSIS` `#IngenieriaIndustrial` `#AHP` `#IA` `#DecisionMulticriterio` `#Matematicas` `#Educacion` `#Ingenieria` `#ProductManagement` `#MultiModelo` `#LatAm` `#Perú` `#OpenSource` `#InteligenciaArtificial` `#InvestigacionDeOperaciones` `#IO` `#Optimizacion` `#DataScience` `#Estudiantes` `#Universidad`

---

## Carrusel 3 — "21 monedas de América en un dashboard" (9 slides)

> **Tema visual recomendado**: Blanco Puro con acentos en los colores de cada bandera.
> **Audiencia**: founders LatAm, community builders, hacedores de política tech.
> **Objetivo**: posicionar el valor regional de SelectIA.

### Slide 1 — Portada

- **Texto grande**: "21 monedas de América."
- **Subtítulo**: "Un solo dashboard. Para toda la región."
- **Idea visual**: mapa de América con 21 banderitas marcadas.
- **Color de fondo**: Blanco Puro, título negro, "21" en índigo gigante.
- **Emoji/icono**: 🌎

### Slide 2 — El problema LatAm

- **Texto grande**: "LatAm no es un país."
- **Subtítulo**: "Cada país con su moneda, su inflación, su tipo de cambio."
- **Bullets cortos**:
  - PEN (Perú) · USD (EE.UU./Ecuador)
  - BRL (Brasil) · MXN (México)
  - COP (Colombia) · CLP (Chile)
  - ARS (Argentina) · CAD (Canadá)
  - + 13 monedas más.
- **Idea visual**: billetes de distintas monedas LatAm en collage.
- **Color de fondo**: Linear Claro.
- **Emoji/icono**: 💱

### Slide 3 — Por qué importa

- **Texto grande**: "Una MYPE no decide en USD."
- **Subtítulo**: "Decide en su moneda local. Siempre."
- **Bullets cortos**:
  - Comparar precios en USD obliga a conversión mental.
  - Conversión mental introduce errores.
  - Errores = decisiones equivocadas.
- **Idea visual**: cabeza con signos de pregunta + conversión manual tachada.
- **Color de fondo**: Blanco Puro.
- **Emoji/icono**: 🤔

### Slide 4 — La solución

- **Texto grande**: "21 monedas en vivo."
- **Subtítulo**: "Open ER-API alimenta el tipo de cambio cada día."
- **Bullets cortos**:
  - PEN, USD, BRL, MXN, COP, CLP, ARS, CAD
  - BOB, GTQ, HNL, NIO, CRC, PAB, DOP, CUP
  - HTG, JMD, BZD, GTQ, UYU, PYG
  - + actualización diaria 2 AM Lima.
- **Idea visual**: dropdown del dashboard mostrando las 21 monedas.
- **Color de fondo**: Linear Claro con dropdown real del dashboard.
- **Emoji/icono**: 🔢

### Slide 5 — Perú

- **Texto grande**: "PEN — Perú 🇵🇪"
- **Subtítulo**: "SelectIA nació en Lima. El cron corre a las 2 AM hora Lima."
- **Bullets cortos**:
  - Soles peruanos.
  - Verificación local de proveedores.
  - IPERC en español peruano.
- **Idea visual**: bandera del Perú + símbolo S/.
- **Color de fondo**: Blanco Puro con franja roja decorativa.
- **Emoji/icono**: 🇵🇪

### Slide 6 — Brasil y México

- **Texto grande**: "BRL 🇧🇷 + MXN 🇲🇽"
- **Subtítulo**: "Las dos mayores economías de LatAm."
- **Bullets cortos**:
  - Real brasileño y peso mexicano.
  - Tipo de cambio en vivo.
  - Glosario en español neutro para ambos.
- **Idea visual**: banderas de Brasil y México lado a lado.
- **Color de fondo**: Linear Claro.
- **Emoji/icono**: 🇧🇷 🇲🇽

### Slide 7 — Cono Sur y Andina

- **Texto grande**: "ARS · COP · CLP · BOB"
- **Subtítulo**: "Cono Sur + región andina cubiertos."
- **Bullets cortos**:
  - Argentina, Colombia, Chile, Bolivia.
  - Inflación variable → refresh diario clave.
  - Tipo de cambio real, no oficial cuando hay diferencia.
- **Idea visual**: mapa de Sudamérica con estos países resaltados.
- **Color de fondo**: Blanco Puro.
- **Emoji/icono**: 🗺️

### Slide 8 — Métricas

- **Texto grande**: "SelectIA en números"
- **Subtítulo**: "Métricas verificables, no estimadas."
- **Bullets cortos**:
  - 21 monedas · 13 fuentes en vivo
  - 206 modelos comparados
  - 31,116 LOC TS · 111 archivos
  - JSON 376 KB · v3.3.1 · MIT
- **Idea visual**: KPI card estilo dashboard.
- **Color de fondo**: Negro Puro, números en índigo.
- **Emoji/icono**: 📊

### Slide 9 — CTA

- **Texto grande**: "¿Desde qué país estás?"
- **Subtítulo**: "Comenta tu país + tu moneda. Los leo."
- **Bullets cortos**:
  - Guarda este post si trabajas con MYPEs LatAm.
  - Sígueme para más contenido regional.
  - Repo: github.com/redentor159/selectia (link en primer comentario).
- **Idea visual**: mapa de América con marcadores vacíos esperando comentarios.
- **Color de fondo**: Linear Oscuro con CTA en índigo.
- **Emoji/icono**: 💬

### Caption del Carrusel 3

21 monedas de América en un solo dashboard 🌎

Cuando empecé a construir SelectIA, una de las primeras decisiones fue: ¿en qué moneda mostramos los precios de los modelos de IA? La respuesta obvia era USD. La respuesta correcta era: en la moneda local del usuario.

Una MYPE en Lima no decide en USD. Decide en soles. Una en Bogotá decide en pesos colombianos. Una en São Paulo, en reales. Obligarlas a convertir mentalmente es introducir errores en la decisión. Y los errores en decisión de modelo de IA se pagan en retrabajo: el estudio de Workday (enero 2026, 3,200 líderes) encontró que 85% ahorra 1-7h/semana con IA, pero casi 40% se pierde en retrabajo.

Por eso SelectIA soporta 21 monedas de América:
PEN, USD, BRL, MXN, COP, CLP, ARS, CAD + 13 más (BOB, GTQ, HNL, NIO, CRC, PAB, DOP, CUP, HTG, JMD, BZD, UYU, PYG).

El tipo de cambio viene de Open ER-API, una de las 13 fuentes de datos en vivo del dashboard. Se actualiza cada día a las 2 AM hora Lima vía cron.

Detrás del dashboard hay un motor HRE-TOPSIS que compara 206 modelos de IA según 8 criterios ponderados con AHP (Consistency Ratio = 0). Latencia promedio 0.5 ms, máximo 3 ms. Glosario de 176 términos, 15 deepDives. 4 temas visuales. v3.3.1, MIT, deploy gratis en Vercel.

31,116 líneas de TypeScript, 111 archivos, JSON maestro de 376 KB. Proceso honesto: 4 IAs como asistentes de investigación (GLM-5.2, Minimax M3, Gemini 3.1 Pro, Claude Sonnet 4.6), coordinadas manualmente sin framework.

Repo: github.com/redentor159/selectia (link en el primer comentario 👇)

¿Desde qué país estás leyendo esto? ¿Cuál es tu moneda? Los leo 👇

#LatAm #MYPE #Peru #Brasil #Mexico #Colombia #Chile #Argentina #Bolivia #IngenieriaIndustrial #IA #TOPSIS #OpenSource #ProductManagement #MultiModelo #InteligenciaArtificial #Emprendimiento #PyME #Industria #Tecnologia

### Hashtags del Carrusel 3 (20)
`#LatAm` `#MYPE` `#Peru` `#Brasil` `#Mexico` `#Colombia` `#Chile` `#Argentina` `#Bolivia` `#IngenieriaIndustrial` `#IA` `#TOPSIS` `#OpenSource` `#ProductManagement` `#MultiModelo` `#InteligenciaArtificial` `#Emprendimiento` `#PyME` `#Industria` `#Tecnologia`

---

## Carrusel 4 — "Mi proceso creativo con 4 IAs" (10 slides)

> **Tema visual recomendado**: Linear Oscuro (fondo oscuro, texto blanco, acentos índigo y violeta).
> **Audiencia**: builders, devs, comunidad AI, estudiantes de ingeniería.
> **Objetivo**: mostrar autenticidad del proceso y la honestidad metodológica.

### Slide 1 — Portada

- **Texto grande**: "Construí SelectIA con 4 IAs."
- **Subtítulo**: "Sin framework. Sin orquestación automática. Contexto pasado a mano."
- **Idea visual**: 4 logos de IA (GLM, Minimax, Gemini, Claude) conectados por flechas manuales.
- **Color de fondo**: Linear Oscuro, título en blanco, "4 IAs" en índigo brillante.
- **Emoji/icono**: 🤝

### Slide 2 — Por qué 4 y no 1

- **Texto grande**: "¿Por qué 4 IAs?"
- **Subtítulo**: "Porque cada una es fuerte en algo distinto."
- **Bullets cortos**:
  - GLM-5.2: agente full stack.
  - Claude Sonnet 4.6: verificación rigurosa.
  - Gemini 3.1 Pro: descubrimiento amplio.
  - Minimax M3: hallazgos paralelos.
- **Idea visual**: 4 íconos en grid 2×2, cada uno con su fortaleza.
- **Color de fondo**: Linear Oscuro.
- **Emoji/icono**: 🎯

### Slide 3 — Día 1: Descubrimiento paralelo

- **Texto grande**: "Día 1 — Descubrimiento."
- **Subtítulo**: "Abrí 3 pestañas. Pregunta idéntica a cada IA."
- **Bullets cortos**:
  - GLM, Minimax, Gemini en paralelo.
  - Misma pregunta: "busca APIs de datos de modelos de IA".
  - Cruzaba respuestas manualmente.
  - Diversidad = señal de confianza.
- **Idea visual**: 3 ventanas de navegador abiertas.
- **Color de fondo**: Linear Oscuro.
- **Emoji/icono**: 🔍

### Slide 4 — Día 2: Verificación con Claude

- **Texto grande**: "Día 2 — Verificación."
- **Subtítulo**: "Claude Sonnet 4.6 hizo el trabajo sucio."
- **Bullets cortos**:
  - Llamó cada API.
  - Extrajo JSON real.
  - Documentó schema de cada una.
  - Marcó las rotas o con auth.
- **Idea visual**: lista con checks verdes y X rojas.
- **Color de fondo**: Linear Oscuro.
- **Emoji/icono**: ✅

### Slide 5 — Día 3: PRD sobre JSON reales

- **Texto grande**: "Día 3 — PRD."
- **Subtítulo**: "Cada feature mapeaba a un campo existente."
- **Bullets cortos**:
  - Claude estructuró el PRD.
  - GLM-5.2 lo refinó con 5 preguntas.
  - Recortamos 2 features sin fuente.
  - PRD sobre datos reales = 10× más concreto.
- **Idea visual**: documento con anotaciones.
- **Color de fondo**: Linear Oscuro.
- **Emoji/icono**: 📝

### Slide 6 — Día 4: Construcción con agente

- **Texto grande**: "Día 4 — Construcción."
- **Subtítulo**: "GLM-5.2 en modo Agente Full Stack."
- **Bullets cortos**:
  - Le di: PRD + JSON + design system.
  - Iteramos hasta llegar al resultado.
  - Yo decidía iterar/parar/reescribir.
  - La IA proponía, yo cortaba.
- **Idea visual**: editor de código con flecha iterativa.
- **Color de fondo**: Linear Oscuro.
- **Emoji/icono**: 🛠️

### Slide 7 — Día 5: Bugs y reconciliación

- **Texto grande**: "Día 5 — Bugs."
- **Subtítulo**: "5 bugs detectados en producción."
- **Bullets cortos**:
  - Función K invertida.
  - ContextWindow corrupto.
  - Matching BenchLM vs AA.
  - Speed outlier rompía TOPSIS.
  - Sin piso de calidad.
- **Idea visual**: lista de bugs con fixes.
- **Color de fondo**: Linear Oscuro, "5 bugs" en rojo (#EF4444).
- **Emoji/icono**: 🐛

### Slide 8 — Por qué NO framework

- **Texto grande**: "¿Por qué NO framework?"
- **Subtítulo**: "Porque pasé contexto a mano. Control total."
- **Bullets cortos**:
  - Sabía qué entraba y qué salía de cada sesión.
  - Sin opacidad.
  - Framework automatiza lo que ya entiendes.
  - Manual primero, framework después.
- **Idea visual**: flechas manuales entre 4 cajas (vs. framework automático tachado).
- **Color de fondo**: Linear Oscuro.
- **Emoji/icono**: 🎛️

### Slide 9 — Métricas

- **Texto grande**: "Resultado medido."
- **Subtítulo**: "5 días. 4 IAs. 1 dashboard."
- **Bullets cortos**:
  - 206 modelos · 13 fuentes en vivo
  - 31,116 LOC TS · 111 archivos · JSON 376 KB
  - Latencia avg 0.5 ms · max 3 ms
  - v3.3.1 · MIT · 21 monedas · 4 temas
- **Idea visual**: KPI card estilo dashboard.
- **Color de fondo**: Negro Puro, números en índigo.
- **Emoji/icono**: 📊

### Slide 10 — CTA

- **Texto grande**: "¿Han probado coordinar IAs a mano?"
- **Subtítulo**: "Comenta tu experiencia. Los leo."
- **Bullets cortos**:
  - Guarda este post para tu próximo proyecto con IAs.
  - Sígueme para más contenido de IA + Ing. Industrial.
  - Repo: github.com/redentor159/selectia (link en primer comentario).
- **Idea visual**: icono de comentario + flecha.
- **Color de fondo**: Linear Oscuro con CTA en violeta (#533afd).
- **Emoji/icono**: 💬

### Caption del Carrusel 4

Construí SelectIA con 4 IAs. Sin framework. Sin orquestación automática. Pasando contexto a mano entre sesiones 🤝

Workday (enero 2026, 3,200 líderes) encontró que 85% de empleados ahorra 1-7 horas/semana con IA, pero casi 40% se pierde en retrabajo. Construí SelectIA para atacar ese 40%: un Command Center que compara 206 modelos de IA desde 13 fuentes en vivo y recomienda el óptimo en 0.5 ms.

Quiero compartir el proceso honesto. No usé un framework de orquestación tipo LangGraph, AutoGen o CrewAI. Coordiné 4 IAs manualmente, pasando contexto entre sesiones. Así:

Día 1 — Descubrimiento paralelo. Abrí 3 pestañas: GLM-5.2, Minimax M3, Gemini 3.1 Pro. A cada una le pedí lo mismo: "busca APIs públicas de datos de modelos de IA". Cruzaba respuestas a mano. La diversidad de respuestas fue la señal de confianza.

Día 2 — Verificación con Claude Sonnet 4.6. Le llevé la lista consolidada y le pedí: llama cada API, extrae el JSON real, documenta el schema. Claude hizo el trabajo sucio. Salí con un documento de fuentes verificadas, no opiniones.

Día 3 — PRD sobre JSON reales. Claude estructuró el PRD aprovechando los esquemas reales. GLM-5.2 lo refinó con 5 preguntas que me obligaron a recortar 2 features que no tenían fuente de datos.

Día 4 — Construcción con GLM-5.2 en modo Agente Full Stack. Le di PRD + JSON + design system. Iteramos hasta llegar al resultado. Yo decidía cuándo iterar, parar o reescribir. La IA proponía, yo cortaba.

Día 5 — Bugs. 5 bugs detectados en producción (función K invertida, ContextWindow corrupto, matching BenchLM, speed outlier, piso de calidad). Cada uno con fix concreto.

¿Por qué no framework? Pasar contexto manualmente me dio control total. Sabía qué entraba y qué salía de cada sesión. Sin opacidad. Un framework automatiza lo que ya entiendes. Manual primero, framework después.

Métricas verificables: 206 modelos · 13 fuentes en vivo · 31,116 LOC TS · 111 archivos · JSON 376 KB · latencia avg 0.5 ms · v3.3.1 · MIT · 21 monedas · 4 temas · glosario 176/15/8.

Repo: github.com/redentor159/selectia (link en el primer comentario 👇)

¿Han probado coordinar varias IAs manualmente? ¿O prefieren un solo asistente end-to-end? Los leo 👇

#IA #ProductManagement #IngenieriaIndustrial #MultiModelo #TOPSIS #OpenSource #LatAm #Peru #DesarrolloDeSoftware #InteligenciaArtificial #Productividad #Innovacion #Tecnologia #Industria #Emprendimiento #BuildInPublic #IndieHacker #DevTools #AHP #DecisionMulticriterio

### Hashtags del Carrusel 4 (20)
`#IA` `#ProductManagement` `#IngenieriaIndustrial` `#MultiModelo` `#TOPSIS` `#OpenSource` `#LatAm` `#Peru` `#DesarrolloDeSoftware` `#InteligenciaArtificial` `#Productividad` `#Innovacion` `#Tecnologia` `#Industria` `#Emprendimiento` `#BuildInPublic` `#IndieHacker` `#DevTools` `#AHP` `#DecisionMulticriterio`

---

## Notas transversales para los 4 carruseles

### Sobre la paleta cromática
SelectIA tiene 4 temas oficiales. Úsalos como paleta de los carruseles para mantener coherencia visual con el producto:

| Tema | Fondo | Texto | Acento |
|---|---|---|---|
| Linear Claro | #FAFAFA | #0A0A0A | #5e6ad2 (índigo) |
| Linear Oscuro | #08090A | #FFFFFF | #5e6ad2 (índigo) / #533afd (violeta) |
| Blanco Puro | #FFFFFF | #0A0A0A | #5e6ad2 (índigo) |
| Negro Puro | #000000 | #FFFFFF | #5e6ad2 (índigo) |

### Sobre el primer comentario (estrategia IG)
IG no permite links clickeables en el caption. Estrategia:
1. Publica el carrusel sin link.
2. Inmediatamente después, publica el primer comentario: "Repo: github.com/redentor159/selectia".
3. En el caption, escribe "(link en el primer comentario 👇)".

### Sobre el formato de exportación
Recomendado: 1080×1350 (vertical 4:5). Ocupa más pantalla en feed mobile y aumenta CTR.

### Lo que NO debes afirmar (en ningún carrusel)
- ❌ "Orquesté con framework" — fue manual
- ❌ "95% de ahorro" — no hay data
- ❌ "Producción en planta real" — es PoC
- ❌ "Usuarios activos" — no hay aún

### Métricas 100% verificables usadas en los 4 carruseles
- 206 modelos · 13 fuentes en vivo · 31,116 LOC TS · 111 archivos
- JSON 376 KB · cron 2 AM Lima · latencia avg 0.5 ms, max 3 ms
- AHP CR = 0 · 21 monedas · 4 temas · glosario 176/15/8
- v3.3.1 · MIT · repo: github.com/redentor159/selectia

### Mejores momentos para publicar en Instagram
- **Lunes a jueves, 18:00–20:00 hora Lima** para LatAm.
- **Domingo 19:00–21:00 hora Lima** para audiencia más reflexiva.
- Evitar sábado completo y viernes después del mediodía.
