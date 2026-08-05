// ================================================================
// GLOSARIO TÉCNICO — SelectIA v3.3.1
// 120 términos clave · 8 categorías (incluye Matemáticas del Motor)
// Usado por el componente <GlossaryDialog /> y referenciado en
// modales de explicación del motor HRE-TOPSIS.
// ================================================================

export type GlossaryCategory =
  | "IA"
  | "Benchmark"
  | "Ingeniería"
  | "Costos"
  | "Arquitectura"
  | "Licencias"
  | "Infraestructura"
  | "Matemáticas";

export interface GlossaryTerm {
  term: string;
  category: GlossaryCategory;
  aliases?: string[];
  definition: string;
  example?: string;
  related?: string[];
  deepDive?: string;  // Explicación extendida para términos matemáticos complejos
}

export interface GlossaryCategoryMeta {
  id: GlossaryCategory;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const GLOSSARY_CATEGORIES: GlossaryCategoryMeta[] = [
  {
    id: "IA",
    label: "Inteligencia Artificial",
    color: "var(--color-indigo)",
    bgColor: "color-mix(in srgb, var(--color-indigo) 12%, transparent)",
    borderColor: "color-mix(in srgb, var(--color-indigo) 25%, transparent)",
  },
  {
    id: "Benchmark",
    label: "Benchmarks",
    color: "var(--color-yellow)",
    bgColor: "color-mix(in srgb, var(--color-yellow) 12%, transparent)",
    borderColor: "color-mix(in srgb, var(--color-yellow) 25%, transparent)",
  },
  {
    id: "Ingeniería",
    label: "Ingeniería Industrial",
    color: "var(--color-orange)",
    bgColor: "color-mix(in srgb, var(--color-orange) 12%, transparent)",
    borderColor: "color-mix(in srgb, var(--color-orange) 25%, transparent)",
  },
  {
    id: "Costos",
    label: "Costos y Monedas",
    color: "var(--color-success)",
    bgColor: "color-mix(in srgb, var(--color-success) 12%, transparent)",
    borderColor: "color-mix(in srgb, var(--color-success) 25%, transparent)",
  },
  {
    id: "Arquitectura",
    label: "Arquitectura de Software",
    color: "var(--color-blue)",
    bgColor: "color-mix(in srgb, var(--color-blue) 12%, transparent)",
    borderColor: "color-mix(in srgb, var(--color-blue) 25%, transparent)",
  },
  {
    id: "Licencias",
    label: "Licencias y Uso Comercial",
    color: "var(--color-red)",
    bgColor: "color-mix(in srgb, var(--color-red) 12%, transparent)",
    borderColor: "color-mix(in srgb, var(--color-red) 25%, transparent)",
  },
  {
    id: "Infraestructura",
    label: "Infraestructura y DevOps",
    color: "var(--color-teal)",
    bgColor: "color-mix(in srgb, var(--color-teal) 12%, transparent)",
    borderColor: "color-mix(in srgb, var(--color-teal) 25%, transparent)",
  },
  {
    id: "Matemáticas",
    label: "Matemáticas del Motor",
    color: "var(--brand-primary)",
    bgColor: "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
    borderColor: "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
  },
];

export const GLOSSARY: GlossaryTerm[] = [
  // ---------- IA (13) ----------
  {
    term: "LLM",
    category: "IA",
    aliases: ["Large Language Model", "Modelo de Lenguaje Grande"],
    definition:
      "Modelo de inteligencia artificial entrenado con miles de millones de parámetros para predecir y generar texto coherente. Es la base de asistentes como ChatGPT, Claude o Gemini.",
    example: "GPT-5.5 y Claude Opus 4 son LLMs de última generación.",
    related: ["Token", "Context Window", "Intelligence Index"],
  },
  {
    term: "Token",
    category: "IA",
    definition:
      "Unidad mínima de texto que un LLM procesa. Aproximadamente 1 token = 4 caracteres en inglés o 0.75 palabras; en español suele ser 1 token ≈ 0.5 palabras por los acentos.",
    example: "La frase 'Hola mundo' consume ~4 tokens en un modelo típico.",
    related: ["Context Window", "Blended Price", "Cache Hit/Write"],
  },
  {
    term: "Context Window",
    category: "IA",
    aliases: ["Ventana de Contexto", "Contexto", "Ventana"],
    definition:
      "Cantidad máxima de tokens que un modelo puede procesar en una sola solicitud (input + output). Ventanas grandes permiten analizar manuales extensos o planos completos.",
    example: "Gemini 3 Pro soporta 2M tokens — equivalente a ~1.300 páginas.",
    related: ["Token", "Capacidades"],
  },
  {
    term: "Intelligence Index",
    category: "IA",
    aliases: ["II", "Índice de Inteligencia v4.1", "Intel.", "Índice de Inteligencia"],
    definition:
      "Métrica compuesta de Artificial Analysis que combina MMLU-Pro, GPQA Diamond, AIME y otros benchmarks en una puntuación 0-100. Permite comparar razonamiento entre modelos.",
    example: "GPT-5.5 tiene II=54.8, el más alto del mercado a junio 2026.",
    related: ["Elo Rating", "Coding Index", "Agentic Index"],
  },
  {
    term: "Coding Index",
    category: "IA",
    aliases: ["Índice de Programación", "Coding", "Índice de Código"],
    definition:
      "Puntuación 0-100 que mide la capacidad de un modelo para escribir código, basada en Terminal-Bench, SciCode y SWE-Bench Verified.",
    example: "Claude Fable 5 tiene Coding Index de 78.4 — top en ingeniería de software.",
    related: ["Intelligence Index", "Agentic Index"],
  },
  {
    term: "Agentic Index",
    category: "IA",
    aliases: ["Índice Agéntico", "Agentic"],
    definition:
      "Mide la capacidad del modelo para ejecutar tareas multi-paso autónomas usando herramientas externas (function calling, navegación, ejecución de código).",
    example: "GPT-5.5 (xhigh) tiene Agentic Index de 44.9, ideal para automatización.",
    related: ["Coding Index", "Tool Use", "Agentic Index"],
  },
  {
    term: "Reasoning",
    category: "IA",
    aliases: ["Razonamiento", "Chain-of-Thought"],
    definition:
      "Capacidad del modelo para mostrar su proceso de deducción paso a paso antes de responder. Mejora precisión en cálculos y análisis técnico.",
    example: "Claude Fable 5 'piensa' 30s antes de entregar una cotización.",
    related: ["Extended Thinking", "Intelligence Index"],
  },
  {
    term: "Extended Thinking",
    category: "IA",
    aliases: ["Pensamiento Extendido"],
    definition:
      "Variante de reasoning donde el modelo dedica tokens adicionales a deliberar. Aumenta latencia pero mejora drásticamente la calidad en problemas complejos.",
    example: "Activar extended thinking en cálculo de ROI reduce errores un 40%.",
    related: ["Reasoning", "TTFT"],
  },
  {
    term: "Tool Use",
    category: "IA",
    aliases: ["Function Calling", "Llamada a Funciones"],
    definition:
      "Capacidad del modelo para invocar funciones externas (APIs, calculadoras, bases de datos) y usar el resultado para completar su respuesta.",
    example: "Un agente puede llamar a SUNAT para validar RUC en tiempo real.",
    related: ["Agentic Index", "JSON Mode"],
  },
  {
    term: "JSON Mode",
    category: "IA",
    aliases: ["Structured Output", "Salida Estructurada"],
    definition:
      "Modo en el que el modelo garantiza respuestas en JSON válido, esencial para integraciones programáticas y pipelines automáticos.",
    example: "Para generar G-code desde specs, JSON Mode asegura formato parseable.",
    related: ["Tool Use", "G-code"],
  },
  {
    term: "Vision",
    category: "IA",
    aliases: ["Multimodal", "Visión por Computadora"],
    definition:
      "Capacidad de procesar imágenes además de texto. Permite leer planos, identificar defectos en piezas o interpretar diagramas CAD.",
    example: "Gemini 3 Pro lee un plano CNC y extrae cotas automáticamente.",
    related: ["Capacidades", "Context Window"],
  },
  {
    term: "Hallucination",
    category: "IA",
    aliases: ["Alucinación", "Confabulación"],
    definition:
      "Cuando un modelo genera información plausible pero incorrecta. Se mitiga con RAG, citaciones, y modelos con alto Intelligence Index.",
    example: "Un LLM puede inventar una norma ISO que no existe — siempre validar.",
    related: ["RAG", "Intelligence Index"],
  },
  {
    term: "RAG",
    category: "IA",
    aliases: ["Retrieval Augmented Generation"],
    definition:
      "Técnica que alimenta al modelo con documentos recuperados de una base vectorial antes de responder. Reduce alucinaciones y permite consultar manuales internos.",
    example: "Cargar el manual de un torno CNC en un RAG y preguntar códigos de error.",
    related: ["Hallucination", "RAG"],
  },

  // ---------- Benchmark (8) ----------
  {
    term: "Elo Rating",
    category: "Benchmark",
    aliases: ["Elo", "Puntuación Elo"],
    definition:
      "Sistema de puntuación competitiva de Arena AI donde humanos votan a ciegas entre dos modelos. Mayor Elo = mayor preferencia humana percibida.",
    example: "GPT-5.5 tiene Elo 1492 ±6, consistente con 48K votos.",
    related: ["Elo CI", "Elo Votes", "Intelligence Index"],
  },
  {
    term: "Elo CI",
    category: "Benchmark",
    aliases: ["Confidence Interval", "Intervalo de Confianza", "Confianza", "Confianza Elo"],
    definition:
      "Margen de error del Elo (95% de confianza). Menor CI = más votos y mayor certeza. Modelos nuevos suelen tener CI>20.",
    example: "Elo 1492 ±6 → el valor real está entre 1486 y 1498 con 95% de probabilidad.",
    related: ["Elo Rating", "Elo Votes"],
  },
  {
    term: "Elo Votes",
    category: "Benchmark",
    aliases: ["Votos Arena"],
    definition:
      "Número total de comparaciones humanas que sustentan un Elo. >10K votos indica alta confianza estadística.",
    example: "Llama 3.1 8B tiene 18.904 votos en Arena AI.",
    related: ["Elo Rating", "Elo CI"],
  },
  {
    term: "MMLU-Pro",
    category: "Benchmark",
    definition:
      "Benchmark académico de 12K preguntas multi-asignatura (derecho, medicina, ingeniería, matemáticas). Mide conocimiento factual y razonamiento.",
    example: "Un modelo con 80% en MMLU-Pro superaría a un estudiante de posgrado promedio.",
    related: ["Intelligence Index", "GPQA Diamond"],
  },
  {
    term: "GPQA Diamond",
    category: "Benchmark",
    aliases: ["Google-Proof Q&A"],
    definition:
      "Preguntas de doctorado en física/química/biología que ni siquiera un experto con acceso a Google puede resolver fácilmente. Mide razonamiento profundo.",
    example: "GPT-5.5 resuelve GPQA Diamond con 65% de acierto.",
    related: ["MMLU-Pro", "Intelligence Index"],
  },
  {
    term: "Terminal-Bench",
    category: "Benchmark",
    definition:
      "Evalúa si el modelo puede ejecutar comandos en una terminal real para resolver tareas de ingeniería de software (compilar, debuggear, deployar).",
    example: "Claude Fable 5 supera Terminal-Bench con 78.4 puntos.",
    related: ["Coding Index", "Agentic Index"],
  },
  {
    term: "SWE-Bench Verified",
    category: "Benchmark",
    definition:
      "Conjunto de 500 issues reales de GitHub que el modelo debe resolver generando un PR. Mide capacidad de ingeniería práctica.",
    example: "Resolver SWE-Bench implica entender codebase, escribir fix, y testear.",
    related: ["Coding Index", "Terminal-Bench"],
  },
  {
    term: "Artificial Analysis",
    category: "Benchmark",
    aliases: ["AA"],
    definition:
      "Plataforma independiente que combina múltiples benchmarks en índices comparables (II, Coding, Agentic) y provee datos de velocidad/precio. Fuente primaria del dashboard.",
    example: "AA agrega 19 fuentes para calcular el Intelligence Index v4.1.",
    related: ["Intelligence Index", "Coding Index", "Agentic Index"],
  },

  // ---------- Ingeniería (10) ----------
  {
    term: "CNC",
    category: "Ingeniería",
    aliases: ["Control Numérico Computarizado"],
    definition:
      "Máquina herramienta controlada por computadora que mecaniza piezas con alta precisión siguiendo instrucciones numéricas (G-code).",
    example: "Un torno CNC puede fabricar 500 bridas idénticas con tolerancia ±0.01mm.",
    related: ["G-code", "FMEA", "Plano Técnico"],
  },
  {
    term: "G-code",
    category: "Ingeniería",
    aliases: ["Gcode", "RS-274"],
    definition:
      "Lenguaje de programación que controla movimiento y operación de máquinas CNC. Cada línea indica coordenadas, velocidades y herramientas.",
    example: "G01 X50 Y30 F200 = avance lineal a (50,30) a 200mm/min.",
    related: ["CNC", "Macro CNC", "G-code"],
  },
  {
    term: "FMEA",
    category: "Ingeniería",
    aliases: ["Failure Mode and Effects Analysis"],
    definition:
      "Metodología proactiva para identificar modos de falla potenciales, sus efectos y causas. Prioriza acciones correctivas por NPR (Número de Prioridad de Riesgo).",
    example: "Un FMEA de fresado detecta que la rotura de broca es el riesgo crítico (NPR=320).",
    related: ["IPERC", "ISO", "Plano Técnico"],
  },
  {
    term: "IPERC",
    category: "Ingeniería",
    aliases: ["Identificación de Peligros y Riesgos"],
    definition:
      "Matriz peruana obligatoria (SUNAT/MINEM) para evaluar peligros y riesgos en tareas. Complementa al FMEA con evaluación de exposiciones humanas.",
    example: "Toda tarea crítica en planta requiere IPERC firmado antes de ejecución.",
    related: ["FMEA", "ISO", "SUNAT"],
  },
  {
    term: "ISO",
    category: "Ingeniería",
    aliases: ["Organización Internacional de Normalización"],
    definition:
      "Conjunto de normas internacionales (ISO 9001 calidad, ISO 14001 ambiental, ISO 45001 seguridad). Certificación voluntaria pero exigida por clientes industriales.",
    example: "Una metalmecánica con ISO 9001:2015 puede exportar a OEMs automotrices.",
    related: ["FMEA", "Context Window", "ERP"],
  },
  {
    term: "ERP",
    category: "Ingeniería",
    aliases: ["Enterprise Resource Planning"],
    definition:
      "Sistema que integra todos los procesos de negocio (compras, inventario, contabilidad, ventas). Odoo, SAP y Oracle son los más usados.",
    example: "Odoo 17 ERP conecta cotización → orden de trabajo → factura automáticamente.",
    related: ["MRP", "MTO", "SUNAT"],
  },
  {
    term: "MRP",
    category: "Ingeniería",
    aliases: ["Material Requirements Planning"],
    definition:
      "Módulo que calcula qué materiales comprar, en qué cantidad y cuándo, a partir de órdenes de producción y lista de materiales (BOM).",
    example: "El MRP sugiere comprar 200kg de acero SAE 1045 para cumplir OT-1024.",
    related: ["ERP", "MTO", "ERP"],
  },
  {
    term: "MTO",
    category: "Ingeniería",
    aliases: ["Make To Order", "Fabricar contra Pedido"],
    definition:
      "Estrategia de producción donde cada producto se fabrica solo tras recibir el pedido del cliente. Típico en metalmecánica industrial.",
    example: "Una MYPE metalmecánica es MTO: cotiza, fabrica y entrega por OT única.",
    related: ["ERP", "MRP", "Plano Técnico"],
  },
  {
    term: "Plano Técnico",
    category: "Ingeniería",
    aliases: ["Blueprint", "Drawing"],
    definition:
      "Documento gráfico normalizado (ISO 128) que define geometría, cotas, tolerancias y materiales de una pieza. Base para programar CNC.",
    example: "Un plano de brida indica Ø100H7 con tolerancia +0/-0.035mm.",
    related: ["CNC", "G-code", "Context Window"],
  },
  {
    term: "Macro CNC",
    category: "Ingeniería",
    aliases: ["Macro Paramétrica"],
    definition:
      "Subprograma paramétrico en G-code que acepta variables (#100, #101) y permite reutilizar ciclos para familias de piezas.",
    example: "Una macro puede fresar bridas de cualquier diámetro cambiando #100.",
    related: ["G-code", "CNC", "G-code"],
  },

  // ---------- Costos (9) ----------
  {
    term: "MYPE",
    category: "Costos",
    aliases: ["Micro y Pequeña Empresa"],
    definition:
      "En Perú: hasta 100 trabajadores y S/.820 mil UIT anual. Acceden a regímenes tributarios simplificados. El dashboard prioriza opciones 100% gratuitas para este perfil.",
    example: "Una metalmecánica con 8 tornos es MYPE — usa modo MYPE para modelos gratis.",
    related: ["SUNAT", "PEN", "Modo MYPE"],
  },
  {
    term: "PEN",
    category: "Costos",
    aliases: ["Soles", "S/."],
    definition:
      "Moneda oficial del Perú. El dashboard muestra precios en PEN por defecto (tasa USD→PEN ≈ 3.714 a 2026). Cambiable por el usuario.",
    example: "S/. 1 = US$ 0.27 aproximadamente (jun 2026).",
    related: ["MYPE", "Soles", "USD"],
  },
  {
    term: "Soles",
    category: "Costos",
    aliases: ["Sol Peruano", "PEN"],
    definition:
      "Sinónimo de PEN. Símbolo S/. — usado en facturas peruanas. 1 Sol = 100 céntimos.",
    example: "Una suscripción de ChatGPT Plus cuesta S/. 89.90 mensuales.",
    related: ["PEN", "MYPE", "USD"],
  },
  {
    term: "USD",
    category: "Costos",
    aliases: ["Dólar Estadounidense", "$"],
    definition:
      "Moneda base en que los proveedores de LLMs publican sus precios (por millón de tokens). El dashboard convierte a la moneda activa del usuario.",
    example: "GPT-5.5 cuesta US$ 15/M input → S/. 55.7/M PEN.",
    related: ["PEN", "Blended Price", "Token"],
  },
  {
    term: "Blended Price",
    category: "Costos",
    aliases: ["Precio Blended", "Precio Mixto", "Blended"],
    definition:
      "Promedio ponderado 70% input + 30% output. Es la métrica más realista para comparar costo de modelos, ya que la mayoría de tokens son de entrada.",
    example: "Modelo A: $10 in / $40 out → blended = $10·0.7 + $40·0.3 = $19/M.",
    related: ["Token", "Cache Hit/Write", "ROI"],
  },
  {
    term: "Cache Hit/Write",
    category: "Costos",
    aliases: ["Prompt Caching", "Caché de Prompt"],
    definition:
      "Técnica que reutiliza tokens ya procesados en solicitudes anteriores. Cache Write cuesta 25% más en input pero Cache Hit cuesta 90% menos. Útil en RAG con contexto fijo.",
    example: "Cargar manual de 200K tokens una vez: $4.75 write, luego $0.15/hit por consulta.",
    related: ["Blended Price", "Token", "RAG"],
  },
  {
    term: "ROI",
    category: "Costos",
    aliases: ["Retorno de Inversión"],
    definition:
      "Return On Investment: (Beneficio − Costo) / Costo × 100. El dashboard calcula ROI de adoptar IA vs. horas-mano de obra ahorradas.",
    example: "Si IA ahorra S/. 5.000/mes y cuesta S/. 800/mes → ROI = 525% mensual.",
    related: ["Blended Price", "Payback", "MYPE"],
  },
  {
    term: "Payback",
    category: "Costos",
    aliases: ["Período de Recuperación"],
    definition:
      "Tiempo necesario para recuperar la inversión inicial. Se calcula como Inversión / Ahorro mensual. El dashboard proyecta payback en meses.",
    example: "Inversión S/. 12.000 + ahorro S/. 4.000/mes → payback = 3 meses.",
    related: ["ROI", "MYPE", "Blended Price"],
  },
  {
    term: "Tipo de Cambio",
    category: "Costos",
    aliases: ["Exchange Rate", "TC"],
    definition:
      "Valor de una moneda expresada en otra. El dashboard obtiene TC USD→PEN/EUR/GBP vía Open ER-API cada 24h.",
    example: "TC USD/PEN = 3.714 significa que 1 dólar equivale a 3.714 soles.",
    related: ["PEN", "USD", "Tipo de Cambio"],
  },

  // ---------- Arquitectura (8) ----------
  {
    term: "HRE-TOPSIS",
    category: "Arquitectura",
    aliases: ["Hybrid Rule-Expert TOPSIS"],
    definition:
      "Motor de recomendación del dashboard: 5 capas (Clasificación TF-IDF → Filtros Duros → Matriz AHP → Ranking TOPSIS → Explicación). Corre 100% client-side en <100ms.",
    example: "Al escribir 'redactar correo urgente', HRE-TOPSIS prioriza velocidad en 0.05s.",
    related: ["TOPSIS", "AHP", "TF-IDF"],
  },
  {
    term: "TOPSIS",
    category: "Arquitectura",
    aliases: ["Technique for Order Preference by Similarity to Ideal Solution"],
    definition:
      "Algoritmo MCDM que ranka alternativas por cercanía a la solución ideal y lejanía a la peor. Devuelve un coeficiente 0-1 por alternativa.",
    example: "TOPSIS elige GPT-5.5 con score 0.87 vs Claude 0.85 si priorizas Elo.",
    related: ["HRE-TOPSIS", "AHP", "Intelligence Index"],
  },
  {
    term: "AHP",
    category: "Arquitectura",
    aliases: ["Analytic Hierarchy Process", "Proceso Analítico Jerárquico"],
    definition:
      "Método de Saaty que asigna pesos a criterios comparándolos dos a dos. El dashboard usa 3 set de pesos pre-calibrados: MYPE, Calidad, Equilibrado.",
    example: "Para 'programación', AHP asigna 0.50 a Coding Index y 0.20 a Costo en modo MYPE.",
    related: ["HRE-TOPSIS", "TOPSIS", "TF-IDF"],
  },
  {
    term: "TF-IDF",
    category: "Arquitectura",
    aliases: ["Term Frequency - Inverse Document Frequency"],
    definition:
      "Técnica de clasificación de texto que pondera términos por su frecuencia en la consulta (TF) contra su frecuencia inversa en el corpus de categorías (IDF). El dashboard la usa en la Capa 1 del HRE-TOPSIS: cada token de la consulta se reduce con el Stemmer Porter y se compara con los keywords stemmizados de las 8 categorías; los términos distintivos (que aparecen en pocas categorías) reciben IDF alto.",
    example: "'manual' aparece en varias categorías pero 'G-code' solo en Programación → TF-IDF favorece 'G-code' al clasificar 'generar G-code para fresado'.",
    related: ["HRE-TOPSIS", "AHP", "Stemmer Porter", "Multi-Intent"],
  },
  {
    term: "Multi-Intent",
    category: "Arquitectura",
    aliases: ["Multi-Intención"],
    definition:
      "Cuando una consulta activa 2+ categorías con peso significativo. El dashboard detecta multi-intent y combina pesos para rankear.",
    example: "'traducir manual técnico al inglés' → 50% documentos + 50% multilingüe.",
    related: ["HRE-TOPSIS", "TF-IDF"],
  },
  {
    term: "Hard Filter",
    category: "Arquitectura",
    aliases: ["Filtro Duro"],
    definition:
      "Criterio no negociable que elimina modelos antes del ranking TOPSIS. Ej: offline exige Ollama; programación exige JSON Mode; rápidas exige >30 tok/s.",
    example: "Para 'código', los 4 modelos sin JSON Mode se eliminan antes del ranking.",
    related: ["HRE-TOPSIS", "AHP", "TOPSIS"],
  },
  {
    term: "Stemmer Porter",
    category: "Arquitectura",
    aliases: ["Porter Stemmer", "Algoritmo de Porter", "Snowball Spanish", "Stemmer"],
    definition:
      "Algoritmo que reduce una palabra a su raíz o stem eliminando sufijos (plurales, conjugaciones verbales, género, -ción, -mente, -abilidad, etc.). El motor HRE-TOPSIS lo usa en la Capa 1 para normalizar consultas del usuario, de modo que 'redactar', 'redacción' y 'redacté' se mapeen al mismo intent de Redacción profesional. Es la adaptación al español del algoritmo de Porter (1980), descrita por Snowball.",
    example: "'correos' → 'corre', 'redacción' → 'redact', 'análisis' → 'analiz', 'calcular/cálculo/calculé' → 'calcul'.",
    related: ["TF-IDF", "HRE-TOPSIS"],
  },
  {
    term: "Modo MYPE",
    category: "Arquitectura",
    definition:
      "Modo de operación que prioriza costo cero y aplica el umbral anti-'gratis malo' (si mejor free < 70% del mejor pago, swap). Ideal para microempresas.",
    example: "Modo MYPE rankea Llama 3.1 8B (gratis) por encima de GPT-5.5 si su II ≥ 70%.",
    related: ["MYPE", "Modo Calidad", "Modo Equilibrado"],
  },
  {
    term: "Modo Calidad",
    category: "Arquitectura",
    definition:
      "Modo que ignora precio (peso 0.05) y maximiza Elo + Intelligence Index. Para entregables profesionales de consultor.",
    example: "Consultor redactando propuesta de $50K usa Modo Calidad → siempre Claude Opus 4.",
    related: ["Modo MYPE", "Modo Equilibrado", "Modo Solo Gratis"],
  },
  {
    term: "Modo Equilibrado",
    category: "Arquitectura",
    definition:
      "Balance entre costo y calidad. Pesos intermedios para decisiones informadas de gerencia.",
    example: "Gerente eligiendo modelo para 200 ingenieros: Modo Equilibrado → GPT-5.5 o Claude Sonnet 4.",
    related: ["Modo MYPE", "Modo Calidad"],
  },
  {
    term: "Modo Solo Gratis",
    category: "Arquitectura",
    aliases: ["Free Only"],
    definition:
      "Filtra hard-excluyendo modelos pagos o con registro. Para pruebas sin tarjeta.",
    example: "Modo Solo Gratis solo muestra Llama, Phi-4, Gemma 3, Mistral gratis.",
    related: ["Modo MYPE", "Free Access"],
  },

  // ---------- Licencias (10) ----------
  {
    term: "Apache 2.0",
    category: "Licencias",
    definition:
      "Licencia permisiva: uso comercial, modificación, distribución, sin copyleft. Solo requiere atribución y aviso de cambios. ✅ Comercial Libre en el dashboard.",
    example: "Llama 3.3 y la mayoría de modelos Mistral usan Apache 2.0.",
    related: ["MIT", "Open Source Completo", "MIT"],
  },
  {
    term: "MIT",
    category: "Licencias",
    definition:
      "Licencia permisiva aún más simple que Apache 2.0: usa, copia, modifica, vende, sin restricciones salvo atribución. ✅ Comercial Libre.",
    example: "Phi-4 de Microsoft y Gemma usan variantes tipo MIT.",
    related: ["Apache 2.0", "MIT"],
  },
  {
    term: "Llama Community",
    category: "Licencias",
    aliases: ["Llama 3 Community License"],
    definition:
      "Licencia condicional de Meta: gratis hasta 700M usuarios mensuales del licenciatario. Requiere incluir 'Built with Llama'. 🟡 Condicional.",
    example: "Toda MYPE puede usar Llama 3.3 comercialmente sin pagar a Meta.",
    related: ["Apache 2.0", "Llama Community", "Open Source Completo"],
  },
  {
    term: "Gemma Terms",
    category: "Licencias",
    aliases: ["Gemma Terms of Use"],
    definition:
      "Licencia de Google para Gemma: uso comercial gratuito pero con restricciones aceptadas en T&C. 🟡 Condicional.",
    example: "Gemma 3 27B se puede servir comercialmente vía Ollama.",
    related: ["Llama Community", "Llama Community"],
  },
  {
    term: "CC-BY 4.0",
    category: "Licencias",
    aliases: ["Creative Commons Attribution"],
    definition:
      "Licencia permisiva para contenido y modelos: uso comercial con atribución. ✅ Comercial Libre.",
    example: "Algunos datasets de HuggingFace usan CC-BY 4.0.",
    related: ["Apache 2.0", "MIT", "MIT"],
  },
  {
    term: "CC-BY-NC 4.0",
    category: "Licencias",
    aliases: ["Creative Commons Non-Commercial"],
    definition:
      "Variante CC que prohíbe uso comercial. ⚫ Solo Investigación en el dashboard — excluida por defecto.",
    example: "Command R+ 2 originalmente CC-BY-NC, libre desde 2024.",
    related: ["CC-BY 4.0", "Solo Investigación"],
  },
  {
    term: "Open Source Completo",
    category: "Licencias",
    aliases: ["Open Weights", "Pesos Abiertos"],
    definition:
      "Modelo cuyos pesos están publicados y la licencia permite uso comercial. 🔵 Distinto de 'código abierto' tradicional pero equivalente en práctica.",
    example: "Llama 3.3 70B con Apache 2.0 = Open Source Completo.",
    related: ["Apache 2.0", "MIT", "Open Weights"],
  },
  {
    term: "Solo API Pago",
    category: "Licencias",
    aliases: ["API Paid", "Proprietary"],
    definition:
      "Modelo solo accesible vía API del proveedor con pago por uso. No se pueden descargar pesos. 🔴 Típico de OpenAI, Anthropic, Google Pro.",
    example: "GPT-5.5, Claude Opus 4, Gemini 3 Pro son Solo API Pago.",
    related: ["Inference Provider", "Open Source Completo"],
  },
  {
    term: "Solo Investigación",
    category: "Licencias",
    aliases: ["Research Only", "Non-Commercial"],
    definition:
      "Licencia que prohíbe uso comercial. ⚫ El dashboard los excluye por defecto (hard filter) salvo que el usuario los active.",
    example: "Algunos modelos académicos como Galactica usaban licencia research-only.",
    related: ["CC-BY-NC 4.0", "Hard Filter"],
  },
  {
    term: "Free Access",
    category: "Licencias",
    aliases: ["Acceso Gratuito", "Acceso"],
    definition:
      "Nivel de gratuidad del modelo: 100% gratis / Tier gratis con límite / Gratis con registro / Solo Pago. Distinto de licencia — un modelo puede ser de licencia abierta pero requerir pago en la API.",
    example: "Llama 3.3 es gratis en Groq pero cuesta en AWS Bedrock.",
    related: ["Modo Solo Gratis", "Open Source Completo"],
  },

  // ---------- Infraestructura (10) ----------
  {
    term: "Cerebras",
    category: "Infraestructura",
    definition:
      "Proveedor de inferencia con chips CS-3 wafer-scale (900K núcleos). Ofrece >2000 tok/s en Llama 3.1 8B — el más rápido del mercado.",
    example: "Cerebras sirve Llama 3.1 8B a 2.500 tok/s vs 340 de GPU estándar.",
    related: ["Groq", "Inference Provider", "TTFT"],
  },
  {
    term: "Groq",
    category: "Infraestructura",
    definition:
      "Proveedor de inferencia con LPU (Language Processing Unit). 500-700 tok/s en modelos pequeños. Tier gratis generoso.",
    example: "Groq es la opción gratuita más rápida para Llama 3.3 70B (~350 tok/s).",
    related: ["Cerebras", "Inference Provider", "Ollama"],
  },
  {
    term: "HuggingFace",
    category: "Infraestructura",
    aliases: ["HF", "HF Hub"],
    definition:
      "Plataforma donde se publican modelos open source. Provee métricas de popularidad (downloads, likes), tags, y estado gated (solicitud de acceso requerida).",
    example: "Llama 3.1 8B tiene 2.1M downloads y 3.201 likes en HF.",
    related: ["Open Source Completo", "Repo", "Ollama"],
  },
  {
    term: "LiteLLM",
    category: "Infraestructura",
    definition:
      "Librería Python que unifica 100+ proveedores de LLMs con API OpenAI-compatible. El dashboard usa su Cost Map (2.918 modelos) como fuente de precios.",
    example: "Con LiteLLM, cambiar de OpenAI a Anthropic solo requiere cambiar 1 parámetro.",
    related: ["OpenRouter", "Blended Price", "Inference Provider"],
  },
  {
    term: "OpenRouter",
    category: "Infraestructura",
    definition:
      "Gateway comercial que unifica 338 modelos de 50+ proveedores con una sola API y key. Útil para fallback y enrutamiento dinámico.",
    example: "OpenRouter permite que tu app caiga a Anthropic si OpenAI está caído.",
    related: ["LiteLLM", "Inference Provider", "OpenRouter"],
  },
  {
    term: "Ollama",
    category: "Infraestructura",
    definition:
      "Software open source para correr LLMs localmente en CPU/GPU del usuario. Esencial para Perfil E (taller sin internet) y para confidencialidad.",
    example: "Ollama corre Llama 3.3 8B en un laptop con 8GB RAM — sin internet.",
    related: ["Modo MYPE", "Edge Computing", "Cerebras"],
  },
  {
    term: "ntfy.sh",
    category: "Infraestructura",
    aliases: ["ntfy"],
    definition:
      "Servicio de notificaciones push sin auth (canales públicos). El dashboard lo usa para alertar a Perfil D cuando el cron falla o una API se cae.",
    example: "curl ntfy.sh/ai-dashboard-alert -d 'Cron falló a las 02:00' → push a móvil.",
    related: ["Cron", "Serverless Proxy", "Perfil de Usuario"],
  },
  {
    term: "Cron",
    category: "Infraestructura",
    aliases: ["Cron de Vercel"],
    definition:
      "Tarea programada que corre a las 07:00 UTC diariamente (configurada en vercel.json). Llama a GET /api/dashboard?force=1, que invoca al orquestador server-side para consultar en vivo las 9 fuentes integradas y actualizar la caché.",
    example: "El cron fuerza el refresco de precios LiteLLM, el Intelligence Index de AA, el Elo de Arena y tipo de cambio; el resultado queda cacheado por Next.js.",
    related: ["ntfy.sh", "Orquestador", "Caché"],
  },
  {
    term: "Serverless Proxy",
    category: "Infraestructura",
    aliases: ["Vercel Functions"],
    definition:
      "Endpoint serverless (Vercel Functions) que protege AA_API_KEY para refrescos on-demand sin exponerla al cliente. Solo se usa en Phase 2+.",
    example: "Botón 'Refrescar ahora' llama /api/refresh que usa la key serverless.",
    related: ["Cron", "JSON Estático", "Artificial Analysis"],
  },
  {
    term: "JSON dinámico",
    category: "Infraestructura",
    aliases: ["Orquestador", "Live Data"],
    definition:
      "El dashboard no usa un JSON estático: consume GET /api/dashboard, que ejecuta el orquestador server-side (src/lib/orchestrator.ts) con caché Next.js unstable_cache (revalidate 7 días) y CDN s-maxage=300 / SWR=600, más refresco por cron diario y por el botón Forzar actualización.",
    example: "El orquestador consulta 9 fuentes en vivo (Artificial Analysis, LiteLLM, Arena, HuggingFace, OpenRouter, Models.dev, BenchLM, ZeroEval, Open ER-API) con fallbacks y consolida el payload.",
    related: ["Cron", "Serverless Proxy", "Caché"],
  },
  {
    term: "TTFT",
    category: "Infraestructura",
    aliases: ["Time To First Token"],
    definition:
      "Tiempo hasta que el modelo emite el primer token. Crítico para UX conversacional. <800ms se siente instantáneo.",
    example: "GPT-5.5 tiene TTFT de 680ms — Llama 3.1 8B en Groq solo 180ms.",
    related: ["Speed TPS", "Inference Provider"],
  },
  {
    term: "Speed TPS",
    category: "Infraestructura",
    aliases: ["Tokens Per Second", "Velocidad", "Vel.", "Tokens por Segundo"],
    definition:
      "Tokens generados por segundo una vez iniciada la respuesta. >100 TPS se siente fluido; >200 es ideal para chat en vivo.",
    example: "Cerebras sirve Llama 3.1 8B a 2.500 TPS — streaming casi instantáneo.",
    related: ["TTFT", "Cerebras", "Groq"],
  },
  {
    term: "Repo",
    category: "Infraestructura",
    aliases: ["Repository", "Repositorio", "HF Repo", "Model Repo"],
    definition:
      "Repositorio de HuggingFace Hub donde se publica un modelo open source. Contiene los pesos (safetensors), la config, la tokenizer y el model card. La columna 🩺 Repo del dashboard indica la salud del repo: ✓ verde = activo y accesible, ⚠ amarillo = gated (requiere solicitud de acceso), ✗ rojo = disabled o eliminado.",
    example: "El repo 'meta-llama/Llama-3.3-70B-Instruct' tiene 2.1M descargas y 3.2K likes.",
    related: ["HuggingFace", "Salud del Repo", "Descargas HF", "Likes HF", "Gated"],
  },
  {
    term: "Salud del Repo",
    category: "Infraestructura",
    aliases: ["Repo Health", "🩺 Repo"],
    definition:
      "Indicador 🩺 en la Tabla Maestra que resume el estado del repositorio HuggingFace del modelo. Verde ✓ = activo, descargable, sin restricciones. Amarillo ⚠ = gated (solicita acceso aprobado). Rojo ✗ = disabled o eliminado por el autor. Modelos con repo rojo se excluyen automáticamente de las recomendaciones.",
    example: "Si un modelo muestra 🩺 ✗, no se puede descargar localmente vía Ollama aunque aparezca en la tabla.",
    related: ["Repo", "HuggingFace", "Gated", "Disabled"],
  },
  {
    term: "Descargas HF",
    category: "Infraestructura",
    aliases: ["HF Downloads", "⬇ DL", "Downloads", "DL", "Descargas"],
    definition:
      "Número de descargas acumuladas del repo del modelo en HuggingFace Hub (columna ⬇ DL). Indicador de adopción real: modelos con >1M descargas son ampliamente usados. Modelos con <10K descargas pueden ser experimentales o muy nuevos.",
    example: "Llama 3.1 8B tiene 12M de descargas; un modelo nicho puede tener 800.",
    related: ["Likes HF", "Repo", "HuggingFace", "Descargas HF"],
  },
  {
    term: "Likes HF",
    category: "Infraestructura",
    aliases: ["HF Likes", "♥ LK", "Likes", "LK"],
    definition:
      "Número de usuarios que marcaron el repo del modelo con ♥ en HuggingFace Hub (columna ♥ LK). A diferencia de las descargas, los likes requieren acción activa y sesión iniciada, así que son una señal más fuerte de calidad percibida. Ratio likes/downloads alto = buena recepción.",
    example: "Un modelo con 50K descargas y 800 likes (ratio 1.6%) tiene mejor recepción que uno con 200K descargas y 100 likes (0.05%).",
    related: ["Descargas HF", "Repo", "HuggingFace", "Descargas HF"],
  },
  {
    term: "Gated",
    category: "Infraestructura",
    aliases: ["Gated Access", "Acceso Restringido"],
    definition:
      "Repo de HuggingFace que requiere solicitud de acceso aprobada por el autor antes de poder descargar los pesos. Común en modelos grandes (Llama, Mistral, Gemma) por motivos de seguridad o responsabilidad. El dashboard muestra estos repos con ⚠ en la columna 🩺 Repo.",
    example: "Para descargar Llama 3.3 70B debes solicitar acceso en la web de Meta y esperar aprobación (generalmente minutos).",
    related: ["Repo", "Salud del Repo", "HuggingFace", "Disabled"],
  },
  {
    term: "Disabled",
    category: "Infraestructura",
    aliases: ["HF Disabled", "Repo Disabled"],
    definition:
      "Repo de HuggingFace que fue deshabilitado o eliminado por el autor o por HF (violación de política, deprecated, GDPR takedown, etc.). El dashboard muestra ✗ en la columna 🩺 Repo y excluye automáticamente estos modelos de las recomendaciones.",
    example: "Algunos modelos experimentales de investigadores son deshabilitados al publicarse la versión final.",
    related: ["Repo", "Salud del Repo", "HuggingFace"],
  },

  // ---------- Matemáticas del Motor (16) ----------
  {
    term: "Normalización Vectorial",
    category: "Matemáticas",
    aliases: ["Vector Normalization", "Normalización TOPSIS"],
    definition:
      "Proceso matemático que escala todos los valores de cada criterio a un rango 0-1 para que sean comparables. Se divide cada valor por la raíz cuadrada de la suma de cuadrados de todos los valores en ese criterio. Sin esto, un criterio con valores grandes (ej: contexto=1,000,000) aplastaría a uno con valores pequeños (ej: II=50).",
    example: "Si 3 modelos tienen II de 30, 50, 80 → denominador = √(30² + 50² + 80²) = √(900+2500+6400) = √9800 ≈ 99. Valores normalizados: 0.30, 0.51, 0.81.",
    related: ["TOPSIS", "Matriz de Decisión", "Criterio de Beneficio"],
    deepDive: `Sin normalización, un criterio como 'contexto' (valores 8,000-1,000,000) aplastaría a 'II' (valores 0-100) en el cálculo de distancias. La normalización vectorial (usada en TOPSIS) divide cada valor por la norma euclidiana de la columna: r_ij = x_ij / √(Σ x_ij²). Resultado: todos los valores quedan en [0,1] y son comparables. Alternativas: normalización min-max ((x-min)/(max-min)), normalización por suma (x/Σx). TOPSIS usa vectorial porque preserva la magnitud relativa.`,
  },
  {
    term: "Coeficiente de Cercanía",
    category: "Matemáticas",
    aliases: ["Closeness Coefficient", "C", "Score TOPSIS"],
    definition:
      "Número entre 0 y 1 que indica qué tan cerca está un modelo de la solución ideal. C = d⁻ / (d⁺ + d⁻), donde d⁺ es la distancia a la solución ideal y d⁻ es la distancia a la anti-ideal. C=1 significa que el modelo es la solución ideal; C=0 significa que es la anti-ideal. El modelo con C más alto gana.",
    example: "Si d⁺=0.3 y d⁻=0.7 → C = 0.7/(0.3+0.7) = 0.7. El modelo está más cerca del ideal que del anti-ideal.",
    related: ["TOPSIS", "Solución Ideal", "Solución Anti-ideal", "Distancia Euclidiana"],
    deepDive: `Fórmula completa: C_i = d_i⁻ / (d_i⁺ + d_i⁻), donde d_i⁺ = √(Σ (v_ij - v_j⁺)²) es la distancia euclidiana del modelo i a la solución ideal, y d_i⁻ = √(Σ (v_ij - v_j⁻)²) es la distancia a la anti-ideal. v_ij son los valores normalizados-ponderados. C_i ∈ [0,1]. C=1 → el modelo ES el ideal. C=0 → el modelo ES el anti-ideal. C=0.5 → equidistante. El modelo con C más alto gana. ¿Por qué no usar solo d⁺ (distancia al ideal)? Porque d⁺ solo no distingue entre modelos que están cerca del ideal pero lejos del anti-ideal vs. cerca de ambos. C combina ambas distancias para una clasificación más justa.`,
  },
  {
    term: "Solución Ideal",
    category: "Matemáticas",
    aliases: ["Ideal Solution", "A+", "Best Case"],
    definition:
      "Vector teórico que contiene el MEJOR valor de cada criterio entre todos los candidatos. Para criterios de beneficio (mayor=mejor, ej: II) es el máximo; para criterios de costo (menor=mejor, ej: effCost) es el mínimo. Ningún modelo real es la solución ideal, pero el que más se acerca gana.",
    example: "Si 3 modelos tienen II de 50, 60, 70 → el ideal A+ tiene II=70 (el máximo).",
    related: ["TOPSIS", "Solución Anti-ideal", "Criterio de Beneficio", "Criterio de Costo"],
    deepDive: `La solución ideal A⁺ se construye tomando, para CADA criterio, el mejor valor entre todos los candidatos. Para criterios de beneficio (II, coding, speed, etc.) → el MÁXIMO. Para criterios de costo (effCost) → el MÍNIMO. Ejemplo con 3 modelos y 2 criterios (II=benefit, effCost=cost): Modelo A (II=50, eff=0.10), Modelo B (II=60, eff=0.05), Modelo C (II=40, eff=0.20). A⁺ = (II=60, eff=0.05) — el mejor de cada uno. Ningún modelo real es A⁺ (Modelo B tiene II=60 pero eff=0.05 no es suyo). El que más se ACERCA a A⁺ gana.`,
  },
  {
    term: "Solución Anti-ideal",
    category: "Matemáticas",
    aliases: ["Anti-ideal Solution", "A−", "Worst Case", "Nadir"],
    definition:
      "Vector teórico que contiene el PEOR valor de cada criterio entre todos los candidatos. Para beneficio es el mínimo; para costo es el máximo. Se usa como referencia: un modelo es mejor cuanto más lejos está del anti-ideal.",
    example: "Si 3 modelos tienen effCost de 0.01, 0.05, 0.20 → el anti-ideal A− tiene effCost=0.20 (el máximo, peor).",
    related: ["TOPSIS", "Solución Ideal", "Criterio de Beneficio", "Criterio de Costo"],
    deepDive: `La solución anti-ideal A⁻ se construye tomando, para cada criterio, el PEOR valor. Para beneficio → el MÍNIMO. Para costo → el MÁXIMO. Con el mismo ejemplo: A⁻ = (II=40, eff=0.20). Un modelo es MEJOR cuanto más se aleja de A⁻ (y más se acerca a A⁺). ¿Por qué se necesita A⁻ si ya tenemos A⁺? Porque un modelo puede estar cerca de A⁺ pero también cerca de A⁻ (si los valores están concentrados). El Coeficiente de Cercanía C combina ambas distancias para resolver esto.`,
  },
  {
    term: "Distancia Euclidiana",
    category: "Matemáticas",
    aliases: ["Euclidean Distance", "Distancia"],
    definition:
      "Medida de distancia entre dos puntos en un espacio n-dimensional. En TOPSIS se calcula como d = √(Σ(vi − vi_ideal)²), donde vi es el valor normalizado-ponderado del modelo para el criterio i, y vi_ideal es el valor de la solución ideal. Es la 'distancia en línea recta' entre el modelo y el ideal.",
    example: "Con 8 criterios, cada modelo tiene 8 coordenadas. La distancia al ideal es la raíz cuadrada de la suma de las 8 diferencias al cuadrado.",
    related: ["TOPSIS", "Solución Ideal", "Coeficiente de Cercanía"],
    deepDive: `En TOPSIS con 8 criterios, cada modelo es un punto en un espacio 8-dimensional. La distancia euclidiana al ideal se calcula: d_i⁺ = √((v_i1 - v_1⁺)² + (v_i2 - v_2⁺)² + ... + (v_i8 - v_8⁺)²), donde v_ij es el valor normalizado-ponderado del modelo i en el criterio j, y v_j⁺ es el valor ideal para el criterio j. Cada diferencia se eleva al cuadrado para eliminar signos negativos y penalizar más las desviaciones grandes. La raíz cuadrada final convierte de vuelta a unidades originales. En 8 dimensiones, la 'distancia en línea recta' no se puede visualizar, pero matemáticamente es la generalización de la distancia 2D/3D.`,
  },
  {
    term: "Criterio de Beneficio",
    category: "Matemáticas",
    aliases: ["Benefit Criterion", "Maximización"],
    definition:
      "Criterio donde un valor MÁS ALTO es mejor. En HRE-TOPSIS: Intelligence Index, Coding Index, Agentic Index, Speed, Context, Elo, Reliability. Para estos, la solución ideal toma el valor máximo y la anti-ideal el mínimo.",
    example: "Un II de 60 es mejor que uno de 30 → II es criterio de beneficio.",
    related: ["Criterio de Costo", "Solución Ideal", "TOPSIS"],
  },
  {
    term: "Criterio de Costo",
    category: "Matemáticas",
    aliases: ["Cost Criterion", "Minimización"],
    definition:
      "Criterio donde un valor MÁS BAJO es mejor. En HRE-TOPSIS solo hay uno: Efficiency Cost (effCost = precio/II). Para este, la solución ideal toma el valor mínimo y la anti-ideal el máximo.",
    example: "Un effCost de 0.01 es mejor que uno de 0.20 → effCost es criterio de costo.",
    related: ["Criterio de Beneficio", "Efficiency Cost", "Solución Ideal"],
  },
  {
    term: "Vector de Pesos",
    category: "Matemáticas",
    aliases: ["Weight Vector", "Pesos AHP", "WeightSet"],
    definition:
      "Conjunto de 8 números entre 0 y 1 que indican la importancia relativa de cada criterio. Deben sumar exactamente 1.0. En HRE-TOPSIS hay 24 vectores pre-calibrados (3 modos × 8 categorías). Un peso 0 significa que el criterio se ignora; un peso 0.50 significa que ese criterio aporta el 50% de la decisión.",
    example: "En Calidad/cálculos: II=0.55, context=0.10, effCost=0, reliability=0.10. La II determina más de la mitad de la decisión.",
    related: ["AHP", "TOPSIS", "Matriz Pairwise", "Modo Calidad"],
  },
  {
    term: "Matriz Pairwise",
    category: "Matemáticas",
    aliases: ["Pairwise Comparison Matrix", "Matriz A", "Matriz de Comparaciones"],
    definition:
      "Matriz n×n donde cada celda A[i][j] = w[i]/w[j] (peso del criterio i dividido por el del j). Se usa para verificar consistencia de los pesos. Si los pesos fueran perfectamente consistentes, la matriz tendría rango 1 y su eigenvalor máximo (λ_max) sería igual a n (número de criterios).",
    example: "Con pesos [0.5, 0.3, 0.2]: A[1][2] = 0.5/0.3 = 1.67, A[2][1] = 0.3/0.5 = 0.60.",
    related: ["AHP", "Eigenvalue", "Consistency Index", "Consistency Ratio"],
    deepDive: `Thomas Saaty propuso que los pesos se derivan de comparaciones pairwise humanas. Si un experto dice 'el criterio A es 5x más importante que B', se anota A[1][2]=5 y A[2][1]=1/5. Con n criterios, hay n(n-1)/2 comparaciones. La matriz resultante es recíproca: A[i][j] = 1/A[j][i]. Los pesos se obtienen del eigenvector principal. HRE-TOPSIS NO hace comparaciones humanas — deriva pesos de tablas pre-calibradas. Pero reconstruye la matriz pairwise A[i][j]=w[i]/w[j] para VERIFICAR consistencia (CI/CR). Si los pesos fueran perfectamente consistentes, la matriz tendría rango 1 y λ_max = n.`,
  },
  {
    term: "Eigenvalue",
    category: "Matemáticas",
    aliases: ["λ_max", "Lambda Max", "Valor Propio Máximo"],
    definition:
      "Valor propio máximo de la matriz pairwise. Si los pesos son perfectamente consistentes, λ_max = n (número de criterios). Cualquier desviación indica inconsistencia. Se usa para calcular el Consistency Index (CI = (λ_max − n) / (n − 1)).",
    example: "Con 8 criterios perfectamente consistentes, λ_max = 8.000. Si λ_max = 8.5, hay inconsistencia.",
    related: ["AHP", "Matriz Pairwise", "Consistency Index", "Consistency Ratio"],
    deepDive: `Un eigenvalue (valor propio) λ de una matriz A es un escalar tal que A·v = λ·v para algún vector v (el eigenvector). La matriz pairwise tiene un eigenvalue máximo λ_max que iguala a n si los pesos son consistentes. Si hay inconsistencia, λ_max > n. La diferencia (λ_max - n) mide cuánto se desvían los pesos de la consistencia perfecta. En HRE-TOPSIS, como los pesos se derivan de tablas (no de comparaciones humanas), λ_max = n exactamente y CR = 0. Pero el motor verifica esto en runtime por si los pesos se corrompen.`,
  },
  {
    term: "Consistency Index",
    category: "Matemáticas",
    aliases: ["CI", "Índice de Consistencia"],
    definition:
      "Métrica que mide cuán inconsistentes son los pesos AHP. CI = (λ_max − n) / (n − 1), donde n es el número de criterios. CI = 0 significa consistencia perfecta. Valores altos indican que los pesos se contradicen entre sí.",
    example: "Si λ_max = 8.5 y n = 8 → CI = (8.5 − 8) / (8 − 1) = 0.5/7 ≈ 0.071.",
    related: ["AHP", "Eigenvalue", "Consistency Ratio", "Random Index"],
    deepDive: `CI = (λ_max - n) / (n - 1). Con n=8 criterios: si λ_max = 8.0 (perfecto) → CI = 0. Si λ_max = 9.0 → CI = (9-8)/7 = 0.143. ¿Qué significa? Los pesos se contradicen: ej, si A es 3x B y B es 3x C, entonces A debería ser 9x C. Si el experto dijo A es 5x C, hay inconsistencia. CI mide esta desviación. Pero CI absoluto no es interpretable sin contexto (depende de n), por eso se normaliza con RI para obtener CR.`,
  },
  {
    term: "Consistency Ratio",
    category: "Matemáticas",
    aliases: ["CR", "Razón de Consistencia"],
    definition:
      "Métrica normalizada que compara el CI con el valor esperado para matrices aleatorias del mismo tamaño. CR = CI / RI. Saaty demostró que CR < 0.1 (10%) indica pesos aceptablemente consistentes. En HRE-TOPSIS, los 24 vectores de pesos tienen CR = 0 (consistencia perfecta por construcción).",
    example: "CI = 0.071, RI(8) = 1.41 → CR = 0.071 / 1.41 = 0.050 < 0.1 → ✓ pasa el umbral de Saaty.",
    related: ["AHP", "Consistency Index", "Random Index", "Umbral de Saaty"],
    deepDive: `CR = CI / RI. El RI (Random Index) es el CI promedio de matrices aleatorias de tamaño n, pre-calculadas por Saaty: RI(3)=0.58, RI(8)=1.41, RI(10)=1.49. CR < 0.1 (10%) es aceptable. ¿Por qué 10%? Saaty hizo experimentos con humanos y encontró que 10% es el umbral donde los expertos aún pueden dar comparaciones significativas. Más de 10% indica que los pesos son esencialmente aleatorios. En HRE-TOPSIS, los 24 vectores de pesos tienen CR = 0 porque se derivan de fórmulas matemáticas (no de juicios humanos), por lo que la matriz pairwise es perfectamente consistente por construcción.`,
  },
  {
    term: "Random Index",
    category: "Matemáticas",
    aliases: ["RI", "Índice Aleatorio"],
    definition:
      "Valor pre-calculado por Saaty que representa el CI promedio de una matriz pairwise aleatoria de tamaño n. Se usa para normalizar el CI y obtener el CR. RI(1)=0, RI(2)=0, RI(3)=0.58, RI(4)=0.90, RI(5)=1.12, RI(6)=1.24, RI(7)=1.32, RI(8)=1.41, RI(9)=1.45, RI(10)=1.49.",
    example: "Con 8 criterios, RI = 1.41. Este valor fijo se usa para todos los cálculos CR con n=8.",
    related: ["AHP", "Consistency Ratio", "Consistency Index"],
  },
  {
    term: "Umbral de Saaty",
    category: "Matemáticas",
    aliases: ["Saaty Threshold", "0.1", "10% Rule"],
    definition:
      "Regla empírica de Thomas Saaty (creador de AHP, 1980): si CR < 0.1 (10%), los pesos son suficientemente consistentes para ser usados. Si CR ≥ 0.1, los pesos se contradicen y deben recalibrarse. HRE-TOPSIS verifica esto en runtime para los 24 vectores.",
    example: "CR = 0.05 → 5% < 10% → ✓ pasa. CR = 0.15 → 15% > 10% → ✗ falla, requiere recalibración.",
    related: ["AHP", "Consistency Ratio", "Consistency Index"],
  },
  {
    term: "Matriz de Decisión",
    category: "Matemáticas",
    aliases: ["Decision Matrix", "Matriz de Métricas"],
    definition:
      "Tabla de N modelos × 8 criterios donde cada celda contiene el valor crudo de la métrica (ej: II=50.2, effCost=0.07, speed=184). Es la entrada al algoritmo TOPSIS. En HRE-TOPSIS tiene 8 columnas: effCost, elo, II, coding, agentic, speed, context, reliability.",
    example: "Con 222 candidatos y 8 criterios, la matriz es 222×8 = 1,776 valores numéricos.",
    related: ["TOPSIS", "Normalización Vectorial", "Matriz Normalizada Ponderada"],
  },
  {
    term: "Matriz Normalizada Ponderada",
    category: "Matemáticas",
    aliases: ["Weighted Normalized Matrix", "Matriz V"],
    definition:
      "Matriz resultante de multiplicar cada valor normalizado por su peso AHP. v[i][j] = (x[i][j] / denominador[j]) × w[j]. Esta matriz combina la escala uniforme (normalización) con la importancia relativa (pesos). Es la entrada al cálculo de distancias euclidianas.",
    example: "Si II normalizado = 0.81 y peso II = 0.55 → valor ponderado = 0.81 × 0.55 = 0.446.",
    related: ["TOPSIS", "Normalización Vectorial", "Vector de Pesos", "Matriz de Decisión"],
  },

  // ---------- Engine HRE-TOPSIS (9) ----------
  {
    term: "Efficiency Cost",
    category: "Matemáticas",
    aliases: ["effCost", "Eficiencia de Costo", "Costo por Inteligencia", "Eficiencia"],
    definition:
      "Métrica que combina precio y calidad en un solo número: effCost = blendedPrice / intelligenceIndex. Un valor más bajo es mejor (barato e inteligente). Modelos gratis con II alto tienen effCost = 0 (perfecto). Modelos caros con II bajo tienen effCost alto (malo). Es el único criterio de costo en TOPSIS.",
    example: "Gemini 3.5 Flash: blended $3.75 / II 50.2 = 0.075. GPT-5.5: $12.50 / 54.8 = 0.228. Gemini es 3x más eficiente.",
    related: ["Blended Price", "Intelligence Index", "Criterio de Costo", "TOPSIS"],
    deepDive: `effCost = blendedPrice / II. Es una métrica de 'inteligencia por dólar'. Ejemplos: Modelo FREE con II=50 → effCost = 0/50 = 0 (perfecto, gratis e inteligente). Modelo $10/M con II=50 → effCost = 10/50 = 0.20. Modelo $10/M con II=10 → effCost = 10/10 = 1.0 (caro Y tonto). Casos extremos: II=null → effCost=999 (penalización máxima). II=0 → effCost=999. En modo Calidad, effCost se calcula con el precio API real (FREE no es $0). En MYPE, FREE = $0. El blended price usa 70% input + 30% output porque los prompts suelen ser más largos que las respuestas.`,
  },
  {
    term: "Reliability",
    category: "Matemáticas",
    aliases: ["Confiabilidad", "1 - failure_rate", "Confiab."],
    definition:
      "Métrica de confiabilidad en producción: 1 − failure_rate. Va de 0 a 1 (ej: 0.95 = 95% de éxito). Proviene de ZeroEval, que monitorea llamadas reales a APIs. Cuando no hay datos, se asume baseline 0.95 (95%). Es el 8º criterio TOPSIS, crítico para uso offline y agentes autónomos.",
    example: "Claude Sonnet 5: failure_rate=10.7% → reliability=0.893. GPT-5.5: failure_rate=0.5% → reliability=0.995.",
    related: ["ZeroEval", "Failure Rate", "TOPSIS", "Piso de Calidad"],
    deepDive: `reliability = 1 - failure_rate. Ej: FR=0.107 (10.7%) → reliability=0.893 (89.3% éxito). Baseline 0.95 cuando no hay datos de ZeroEval (asunción: 95% de éxito es razonable para modelos modernos). ¿Por qué 0.95 y no 0.99? Porque los modelos modernos fallan ~5% en promedio (timeouts, rate limits, errores de formato). En modo Calidad, reliability pesa 0.05-0.15 (bajo — la calidad importa más). En offline, pesa 0.15-0.20 (alto — sin fallback en la nube, un fallo es crítico). ZeroEval monitorea llamadas reales, no benchmarks sintéticos.`,
  },
  {
    term: "Failure Rate",
    category: "Matemáticas",
    aliases: ["Tasa de Fallo", "FR", "zeroevalFailureRate"],
    definition:
      "Porcentaje de llamadas a la API que fallan en producción (0-1). Medido por ZeroEval monitoreando miles de llamadas reales. FR=0.107 significa 10.7% de fallo. Se usa para calcular reliability = 1 − FR. Modelos con FR > 15% se consideran de alto riesgo.",
    example: "169 llamadas monitoreadas, 18 fallaron → FR = 18/169 = 0.107 = 10.7%.",
    related: ["ZeroEval", "Reliability", "P95 Latency", "Throughput"],
  },
  {
    term: "P95 Latency",
    category: "Matemáticas",
    aliases: ["P95", "Latencia Percentil 95", "p95_latency"],
    definition:
      "Latencia en milisegundos del 5% más lento de las llamadas. Es el 'peor caso' realista (no el promedio, que oculta picos). P95=10,630ms significa que el 5% de las llamadas tardan más de 10.6 segundos. Crítico para respuestas rápidas y tiempo real.",
    example: "Si 100 llamadas tienen P95=800ms, entonces 95 tardaron ≤800ms y 5 tardaron más.",
    related: ["ZeroEval", "Failure Rate", "Throughput", "TTFT"],
  },
  {
    term: "Throughput",
    category: "Matemáticas",
    aliases: ["avg_throughput", "Tokens por Segundo", "TPS"],
    definition:
      "Promedio de tokens generados por segundo en producción, medido por ZeroEval. Difiere de Speed TPS (que es del benchmark de AA) porque Throughput es de llamadas reales con prompts reales. Throughput=100.4 tok/s significa que genera ~100 tokens por segundo.",
    example: "Gemini 3.5 Flash: throughput=100.4 tok/s (ZeroEval real) vs speed=183.81 tok/s (benchmark AA).",
    related: ["ZeroEval", "Speed TPS", "Failure Rate", "P95 Latency"],
  },
  {
    term: "Quality Gate",
    category: "Matemáticas",
    aliases: ["Puerta de Calidad", "Filtro de Calidad"],
    definition:
      "Filtro de la Capa 2 que elimina modelos sin datos verificados. Un modelo pasa si tiene II>0, o Elo>0, o (programacion ∧ Coding>0), o es gratis. Modelos gratis pasan siempre (no hay riesgo financiero). Además, en modo Calidad, el quality gate aplica un piso de II ≥ 30.",
    example: "Un modelo con II=null, Elo=null, Coding=null y paid-only → FALLA el quality gate. Un modelo gratis con los mismos datos → PASA.",
    related: ["Piso de Calidad", "Hard Filter", "Intelligence Index", "Modo Calidad"],
    deepDive: `Lógica completa: pasa = (II>0) ∨ (Elo>0) ∨ (cat=programacion ∧ Coding>0) ∨ isFree(model) ∧ NOT (benchlmScoreConfidence===1 ∧ !isFree ∧ !hasII ∧ !hasElo). La última condición excluye modelos paid con baja confianza BenchLM y sin respaldo AA. Ejemplo: un modelo con benchlmScoreConfidence=1 (pocos benchmarks), sin II, sin Elo, y paid → FALLA. El mismo modelo pero FREE → PASA (no hay riesgo financiero). En modo Calidad, se añade el Piso de Calidad (II ≥ 30). Si quedan <3 candidatos tras el quality gate, se mantiene el set anterior (graceful degradation).`,
  },
  {
    term: "Piso de Calidad",
    category: "Matemáticas",
    aliases: ["Quality Floor", "II ≥ 30", "v3.3.1"],
    definition:
      "Filtro adicional en modo Calidad máxima (v3.3.1): excluye modelos con Intelligence Index < 30 (excepto offline: II ≥ 15). Esto elimina modelos antiguos/basura que dominaban injustamente por tener contexto grande o effCost bajo. Asegura que Calidad muestre 'lo mejor de lo mejor'.",
    example: "Gemini 2.0 Flash Think (II=13.3) es excluido en modo Calidad. GPT-5.5 (II=54.8) pasa y gana.",
    related: ["Quality Gate", "Modo Calidad", "Intelligence Index", "Hard Filter"],
    deepDive: `Implementación: if (mode === 'calidad') { if (II < minII) return false; }. minII = 30 para la mayoría de categorías, 15 para offline (modelos ollama suelen tener II bajo). El piso se aplica DESPUÉS del quality gate, en applyHardFilters(). Si quedan <3 modelos tras el piso, se relaja (mejor tener 3 que 1). El piso elimina modelos como Gemini 2.0 Flash Think (II=13.3) que dominaban injustamente por contexto grande. Sin el piso, un modelo con II=13.3 podía ganar sobre GPT-5.5 (II=54.8) porque su effCost=0 y context=256K le daban ventaja en TOPSIS.`,
  },
  {
    term: "Anti-gratis Malo",
    category: "Matemáticas",
    aliases: ["Anti-free-bad", "70% Threshold", "Umbral 70%"],
    definition:
      "Mecanismo que evita recomendar un modelo gratis basura sobre uno pago decente. Si el mejor modelo gratis tiene II < 70% del mejor pago, los modelos pagos se reordenan al top. Solo se activa en MYPE y solo-gratis. Ej: si mejor gratis II=20 y mejor pago II=60, 20 < 42 (70% de 60) → el pago gana.",
    example: "Mejor gratis: II=50. Mejor pago: II=55. 50 > 38.5 (70% de 55) → el gratis puede competir. No se dispara.",
    related: ["Modo MYPE", "Modo Solo Gratis", "Quality Gate", "Intelligence Index"],
    deepDive: `Lógica: if (mode === 'mype' || mode === 'solo-gratis') { bestPaidII = max(II de modelos pagos); bestFreeII = max(II de modelos gratis); if (bestFreeII < bestPaidII * 0.7) { reordenar: pagos primero, gratis después } }. El umbral 70% significa: si el mejor modelo gratis es menos del 70% de la calidad del mejor pago, el pago gana. Ej: mejor gratis II=20, mejor pago II=60 → 20 < 42 (70% de 60) → pago gana. Ej: mejor gratis II=50, mejor pago II=55 → 50 > 38.5 → gratis puede competir. Solo se activa en MYPE porque en Calidad el piso de calidad ya filtra lo malo.`,
  },
  {
    term: "Imputación",
    category: "Matemáticas",
    aliases: ["Imputation", "Baseline", "Valor Imputado"],
    definition:
      "Asignar un valor conservador a una métrica faltante para que el modelo pueda competir en TOPSIS. Ej: si un modelo no tiene Elo, se le asigna 1200 (baseline). Si no tiene II, se le asigna 30. Si no tiene ZeroEval, reliability=0.95. Los valores imputados se marcan con ⚠ en la animación.",
    example: "Un modelo con Elo=null recibe Elo=1200 (imputado). Se marca como ⚠ para transparencia.",
    related: ["Valor Baseline", "Cap", "Quality Gate", "TOPSIS"],
  },
  {
    term: "Valor Baseline",
    category: "Matemáticas",
    aliases: ["Baseline", "Valor por Defecto"],
    definition:
      "Valor conservador asignado cuando una métrica falta. Baselines de HRE-TOPSIS: Elo=1200 (competente), II=30 (bajo promedio), speed=50 tok/s (medio), coding=25 (bajo), agentic=25 (bajo), reliability=0.95 (confiable). Nunca 0, para no penalizar injustamente.",
    example: "Un modelo sin datos de Arena AI recibe Elo=1200. No es '0' (odio) ni '1500' (excelente), es 'competente'.",
    related: ["Imputación", "Elo Rating", "Intelligence Index", "Reliability"],
  },
  {
    term: "Cap",
    category: "Matemáticas",
    aliases: ["Límite Superior", "Capping", "Tope"],
    definition:
      "Límite máximo aplicado a valores atípicos (outliers) para evitar que distorsionen la normalización TOPSIS. HRE-TOPSIS aplica dos caps: speed → 500 tok/s (Mercury 2 tiene 872, se cap a 500) y context → 256K tokens (Gemini 2.0 tiene 1M, se cap a 256K). Sin caps, un outlier aplasta al resto.",
    example: "Mercury 2 speed=872 → se usa 500. Gemini 2.0 context=1,048,576 → se usa 262,144.",
    related: ["Normalización Vectorial", "Speed TPS", "Context Window", "TOPSIS"],
    deepDive: `Implementación: speed = Math.min(rawSpeed, 500); context = Math.min(rawContext, 256_000). ¿Por qué 500 tok/s? Mercury 2 tiene 872 tok/s (outlier). Sin cap, en la normalización vectorial, Mercury 2 dominaría el criterio speed incluso con peso bajo. 500 tok/s ≈ 8x velocidad de lectura humana — más allá no aporta UX real. ¿Por qué 256K contexto? Gemini 2.0 Flash Think tiene 1M tokens (outlier). Sin cap, dominaría documentos por contexto. 256K ≈ 500 páginas — más que suficiente para cualquier documento industrial. Los caps NO afectan el dato original mostrado al usuario (la tabla maestra muestra 872 y 1M), solo el cálculo TOPSIS.`,
  },

  // ---------- Fuentes de Datos (4) ----------
  {
    term: "BenchLM",
    category: "Benchmark",
    aliases: ["benchlm.ai"],
    definition:
      "Plataforma independiente que agrega scores de 8 categorías (agentic, coding, reasoning, knowledge, math, multilingual, instructionFollowing, multimodalGrounded) para 272 modelos. SelectIA usa BenchLM para display (Ficha Técnica) — NO para ranking. Sus scores están en escala 0-100 pero con metodología distinta a AA, por lo que no se mezclan.",
    example: "Claude Sonnet 5 en BenchLM: displayScore=79, agentic=89.2, coding=79, knowledge=86.",
    related: ["Artificial Analysis", "Intelligence Index", "Ficha Técnica"],
  },
  {
    term: "ZeroEval",
    category: "Benchmark",
    aliases: ["zeroeval.com", "LLM Stats", "Confiabilidad ZeroEval", "Reliability", "Confiabilidad de producción"],
    definition:
      "Servicio que monitorea llamadas reales a APIs de LLMs en producción y reporta métricas: failure_rate, P95 latency, throughput, total_calls. 130 modelos monitoreados. SelectIA usa estos datos para el criterio 8 (reliability) y para alertas de confiabilidad. Es la única fuente de datos de producción real.",
    example: "Claude Sonnet 5 en ZeroEval: 169 llamadas, 10.7% failure rate, P95=5.4s, 102 tok/s.",
    related: ["Reliability", "Failure Rate", "P95 Latency", "Throughput"],
  },
  {
    term: "Arena AI",
    category: "Benchmark",
    aliases: ["LMSYS Arena", "Chatbot Arena"],
    definition:
      "Plataforma de votación humana donde usuarios comparan dos LLMs ciegamente y eligen el mejor. Genera ratings Elo y intervalos de confianza. SelectIA usa Arena AI para Elo + votos. Es la única fuente de preferencia humana real (no benchmarks automatizados).",
    example: "Gemini 3.5 Flash: Elo=1479 ±6 con 15.3K votos en Arena AI.",
    related: ["Elo Rating", "Elo CI", "Elo Votes"],
  },

  // ---------- Hardware/Modelos (4) ----------
  {
    term: "Mixture of Experts",
    category: "IA",
    aliases: ["MoE", "Mistura de Expertos"],
    definition:
      "Arquitectura de modelo donde solo un subconjunto de 'expertos' (redes neuronales especializadas) se activa para cada token. Permite modelos grandes (ej: 236B parámetros) que son eficientes porque solo activan ej: 22B por token. Indicado por isMoE=true en el catálogo.",
    example: "DeepSeek V3 es MoE 236B con 22B activos. Qwen3.5 122B A10B es MoE con 10B activos.",
    related: ["LLM", "Parámetros"],
  },
  {
    term: "VRAM",
    category: "Infraestructura",
    aliases: ["Video RAM", "Memoria GPU", "Memoria de Video"],
    definition:
      "Memoria de la tarjeta gráfica (GPU) disponible para cargar modelos. Un modelo de 70B parámetros necesita ~40GB VRAM en FP16, o ~10GB en Q2_K. SelectIA tiene el Filtro 13 que excluye modelos que no caben en la VRAM del usuario. Es la restricción principal para uso offline.",
    example: "GPU 8GB (RTX 3060) → solo modelos <8B en Q4_K. GPU 24GB (RTX 4090) → modelos hasta 70B en Q2_K.",
    related: ["Ollama", "Quantization", "Safetensors", "VRAM"],
  },
  {
    term: "Quantization",
    category: "Infraestructura",
    aliases: ["Cuantización", "Q2_K", "Q4_K", "Q8", "FP16"],
    definition:
      "Técnica que reduce la precisión numérica de un modelo para que ocupe menos memoria. FP16 (16 bits) es precisión completa. Q8 (8 bits) reduce a la mitad. Q4_K (4 bits) reduce a 1/4. Q2_K (2 bits) reduce a 1/8 pero con pérdida de calidad. Permite correr modelos grandes en GPUs pequeñas.",
    example: "Llama 70B: FP16=140GB, Q8=70GB, Q4_K=40GB, Q2_K=25GB. Una RTX 3090 (24GB) solo puede correrlo en Q2_K.",
    related: ["VRAM", "Safetensors", "Ollama", "VRAM"],
  },
  {
    term: "Safetensors",
    category: "Infraestructura",
    aliases: ["safetensors", "SafeTensors"],
    definition:
      "Formato de archivo para almacenar pesos de modelos de IA, creado por HuggingFace. Más seguro y rápido que PyTorch (.bin) porque evita ejecución de código arbitrario. SelectIA usa safetensors.parameters para mostrar el desglose por tipo de dato (BF16, F8, F32) en la Ficha Técnica.",
    example: "DeepSeek V3.1: 684.53B parámetros en safetensors. Desglose: BF16=3.92B, F8_E4M3=680.57B, F32=42.6M.",
    related: ["HuggingFace", "VRAM", "Quantization", "Repo"],
  },

  // ---------- Otros (3) ----------
  {
    term: "M Token",
    category: "Costos",
    aliases: ["Millón de Tokens", "1M tokens", "por millón"],
    definition:
      "Unidad de medición de precios de LLMs. Los precios se expresan en USD por millón de tokens ($/M). Un millón de tokens ≈ 750,000 palabras ≈ 2,500 páginas de texto. SelectIA muestra precios en Soles (PEN) usando el tipo de cambio actual.",
    example: "GPT-5.5: $5/M input + $30/M output. Blended (70% input + 30% output) = $12.50/M.",
    related: ["Token", "Blended Price", "USD", "PEN"],
  },
  {
    term: "Modo Traza",
    category: "Arquitectura",
    aliases: ["Trace Mode", "Modo Auditoría", "Provenance Badges"],
    definition:
      "Toggle en la Animación del Motor que, al activarse, muestra un badge con la fuente de datos de cada métrica en el Step 4.1. Badges: 'Artificial Analysis' (II, coding, speed), 'Arena AI' (Elo), 'LiteLLM' (precios), 'ZeroEval' (reliability), 'provider' (context), 'imputado' (baseline). Permite auditar de dónde viene cada número.",
    example: "II=50.2 → badge 'Artificial Analysis'. Reliability=0.995 → badge 'ZeroEval'. Reliability=0.950 → badge 'imputado'.",
    related: ["Modo Traza", "Provenancia de Datos", "Imputación"],
  },
  {
    term: "Provenancia de Datos",
    category: "Arquitectura",
    aliases: ["Data Provenance", "Trazabilidad", "Auditoría de Fuente"],
    definition:
      "Capacidad de saber exactamente de qué fuente proviene cada métrica usada en una recomendación. HRE-TOPSIS v3.3.1 muestra la provenancia en dos lugares: (1) Modo Traza en la animación (badges por celda) y (2) footer 'Fuentes de datos usadas' en Step 5.4 con conteos por fuente.",
    example: "Una recomendación puede citar: AA (197 candidatos), BenchLM (54, display only), ZeroEval (44), Arena AI (30), LiteLLM (222).",
    related: ["Modo Traza", "Artificial Analysis", "BenchLM", "ZeroEval", "Arena AI"],
  },

  // ---------- Matemáticas del Motor — Ampliación (12) ----------
  {
    term: "MCDM",
    category: "Matemáticas",
    aliases: ["Multi-Criteria Decision Making", "Toma de Decisiones Multicriterio"],
    definition:
      "Campo de la investigación de operaciones que estudia cómo tomar decisiones cuando hay múltiples criterios conflictivos. TOPSIS y AHP son dos métodos MCDM. HRE-TOPSIS combina ambos: AHP para los pesos, TOPSIS para el ranking. Otros métodos MCDM: SAW, ELECTRE, PROMETHEE, VIKOR.",
    example: "Elegir un LLM es un problema MCDM: hay 8 criterios (precio, calidad, velocidad, etc.) que conflictúan — más barato suele ser menos inteligente.",
    related: ["TOPSIS", "AHP", "SAW", "Criterio de Beneficio"],
  },
  {
    term: "SAW",
    category: "Matemáticas",
    aliases: ["Simple Additive Weighting", "Weighted Sum Method"],
    definition:
      "Método MCDM más simple: calcula el score de cada alternativa como la suma ponderada de sus criterios normalizados. score = Σ(wi × xi). Más fácil de entender que TOPSIS pero menos preciso porque no considera la distancia al ideal. Se usa como baseline para comparar con TOPSIS.",
    example: "Modelo A: II=50 (peso 0.5) + precio=0.1 (peso 0.5) → SAW = 0.5×0.5 + 0.5×0.1 = 0.30.",
    related: ["MCDM", "TOPSIS", "Vector de Pesos"],
  },
  {
    term: "Nadir",
    category: "Matemáticas",
    aliases: ["Nadir Point", "Punto Nadir", "Anti-ideal"],
    definition:
      "En MCDM, el punto que contiene el PEOR valor posible de cada criterio entre todas las alternativas eficientes. En TOPSIS es equivalente a la solución anti-ideal (A−). El nombre viene del árabe 'nadir' = 'punto más bajo'. Un modelo es mejor cuanto más se aleja del nadir.",
    example: "Si los modelos tienen II de 30-80, el nadir tiene II=30 (el mínimo).",
    related: ["Solución Anti-ideal", "TOPSIS", "MCDM"],
  },
  {
    term: "Escala de Saaty 1-9",
    category: "Matemáticas",
    aliases: ["Saaty Scale", "Escala Fundamental", "1-9 Ratio Scale"],
    definition:
      "Escala de 1 a 9 creada por Thomas Saaty para comparaciones pairwise en AHP. 1=igual importancia, 3=moderada, 5=fuerte, 7=muy fuerte, 9=absoluta. Valores pares (2,4,6,8) son intermedios. HRE-TOPSIS NO usa esta escala directamente (deriva pesos de tablas pre-calibradas), pero la verifica vía Consistency Ratio.",
    example: "Si el criterio A es 'fuertemente más importante' que B → A/B = 5 en la escala de Saaty.",
    related: ["AHP", "Matriz Pairwise", "Consistency Ratio", "Umbral de Saaty"],
  },
  {
    term: "Alternativa",
    category: "Matemáticas",
    aliases: ["Alternative", "Candidato", "Opción"],
    definition:
      "En MCDM, cada una de las opciones que se están evaluando. En HRE-TOPSIS, cada modelo de IA es una alternativa. El motor evalúa 219 alternativas y las rankea. Sinónimo de 'candidato' en el contexto del motor.",
    example: "GPT-5.5, Claude Sonnet 5, Gemini 3.5 Flash son alternativas en el problema de elegir un LLM.",
    related: ["MCDM", "TOPSIS", "Matriz de Decisión"],
  },
  {
    term: "Función de Preferencia",
    category: "Matemáticas",
    aliases: ["Preference Function", "Función de Utilidad"],
    definition:
      "Función matemática que convierte un valor crudo en un score de preferencia (0-1). En TOPSIS, la normalización vectorial cumple este rol. En otros métodos MCDM (PROMETHEE) hay funciones específicas (usual, U-shape, V-shape, level, linear, Gaussian).",
    example: "Una función de preferencia lineal: si II va de 0-100, score = II/100. II=50 → score=0.5.",
    related: ["MCDM", "Normalización Vectorial", "TOPSIS"],
  },
  {
    term: "Pareto Optimal",
    category: "Matemáticas",
    aliases: ["Óptimo de Pareto", "Frontera de Pareto", "Efficient Frontier"],
    definition:
      "Una alternativa es Pareto optimal si ninguna otra la supera en TODOS los criterios simultáneamente. El conjunto de todas las alternativas Pareto optimal forma la 'frontera eficiente'. TOPSIS asume que todas las alternativas que pasan los filtros son candidatas (no filtra por Pareto).",
    example: "Si Modelo A tiene II=50, precio=$1 y Modelo B tiene II=60, precio=$2, ambos son Pareto optimal (A es más barato, B es más inteligente).",
    related: ["MCDM", "TOPSIS", "Alternativa"],
  },
  {
    term: "Trade-off",
    category: "Matemáticas",
    aliases: ["Compromiso", "Intercambio"],
    definition:
      "En MCDM, la situación donde mejorar un criterio empeora otro. Ej: un modelo más inteligente suele ser más caro. HRE-TOPSIS resuelve trade-offs usando los pesos AHP: si II pesa 0.50 y precio 0.05, el motor prefiere el modelo más inteligente aunque sea más caro.",
    example: "GPT-5.5 (II=54.8, $12.50) vs Gemini 3.5 Flash (II=50.2, FREE) — hay un trade-off calidad-precio.",
    related: ["MCDM", "Vector de Pesos", "Pareto Optimal"],
  },
  {
    term: "Sensibilidad",
    category: "Matemáticas",
    aliases: ["Análisis de Sensibilidad", "Sensitivity Analysis"],
    definition:
      "Análisis que mide cómo cambian los resultados cuando se modifican los pesos o los datos. HRE-TOPSIS incluye un módulo de sensitivity-analysis que muestra cómo cambia el ranking si se varían los pesos ±10%. Un ranking robusto no cambia significativamente.",
    example: "Si aumentar el peso de 'precio' de 0.15 a 0.25 cambia el ganador de GPT-5.5 a Gemini 3.5 Flash, el ranking es sensible al precio.",
    related: ["Vector de Pesos", "TOPSIS", "AHP"],
  },
  {
    term: "Stemming",
    category: "Matemáticas",
    aliases: ["Stemmer", "Raíz Léxica", "Lematización"],
    definition:
      "Proceso de reducir palabras a su raíz (stem) para que variantes del mismo concepto coincidan. Ej: 'cotizar', 'cotización', 'cotizando' → 'cotiz'. HRE-TOPSIS usa un stemmer inspirado en Porter para español en la Capa 1 (clasificación TF-IDF). Sin stemming, 'cotizar' y 'cotización' serían palabras distintas.",
    example: "'calcular', 'cálculo', 'calculé' → stem 'calcul'. Los 3 coinciden en el stem.",
    related: ["TF-IDF", "Stemmer Porter", "Normalización Vectorial"],
  },
  {
    term: "Stopwords",
    category: "Matemáticas",
    aliases: ["Palabras Vacías", "Stop Words"],
    definition:
      "Palabras muy comunes que se eliminan antes del análisis TF-IDF porque no aportan significado. En español: 'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'se', 'del'. HRE-TOPSIS mantiene una lista de stopwords en español que se filtran en la Capa 1.",
    example: "'calcular ROI de automatizar' → tras filtrar stopwords: ['calcular', 'roi', 'automatizar']. 'de' se elimina.",
    related: ["TF-IDF", "Stemming", "Tokenización"],
  },
  {
    term: "Tokenización",
    category: "Matemáticas",
    aliases: ["Tokenization", "Segmentación"],
    definition:
      "Proceso de dividir texto en unidades más pequeñas (tokens). En la Capa 1 de HRE-TOPSIS, se divide el query por espacios y se filtran tokens de longitud ≤1 y stopwords. En el contexto de LLMs, 'tokenización' se refiere a dividir texto en sub-palabras (BPE, WordPiece) que el modelo procesa.",
    example: "'calcular ROI de cotizaciones' → tokens: ['calcular', 'ROI', 'de', 'cotizaciones'] → filtrado: ['calcular', 'ROI', 'cotizaciones'].",
    related: ["TF-IDF", "Stopwords", "Token"],
  },

  // ---------- Benchmarks — Ampliación (8) ----------
  {
    term: "HumanEval",
    category: "Benchmark",
    aliases: ["HumanEval", "HumanEval-X"],
    definition:
      "Benchmark de código de OpenAI donde el modelo debe completar funciones Python con docstrings. Mide pass@1 (porcentaje de funciones correctas en el primer intento). Fue el primer benchmark de código widely adoptado pero ahora se considera saturado (los modelos modernos lo resuelven al 95%+). Reemplazado por SWE-bench para tareas más realistas.",
    example: "Un modelo con HumanEval pass@1=85% significa que completa correctamente el 85% de las funciones Python del benchmark.",
    related: ["SWE-Bench Verified", "Coding Index", "Terminal-Bench"],
  },
  {
    term: "GSM8K",
    category: "Benchmark",
    aliases: ["Grade School Math 8K"],
    definition:
      "Benchmark de matemáticas de escuela primaria (hasta 8° grado) con 8,500 problemas de palabra. Mide capacidad de razonamiento matemático básico. Los modelos modernos lo resuelven al 95%+, por lo que se considera saturado. Reemplazado por MATH, AIME, HMMT para matemáticas avanzadas.",
    example: "Problema GSM8K: 'Si Janet tiene 5 manzanas y come 2, ¿cuántas le quedan?' → respuesta: 3.",
    related: ["MMLU-Pro", "Intelligence Index", "HMMT"],
  },
  {
    term: "MT-Bench",
    category: "Benchmark",
    aliases: ["Multi-Turn Benchmark"],
    definition:
      "Benchmark que evalúa modelos en conversaciones multi-turno (varios intercambios). Mide coherencia, seguimiento de instrucciones y capacidad de mantener contexto. Los jueces (humanos o GPT-4) califican las respuestas. Es complementario a Arena AI (que es single-turn ciego).",
    example: "Turn 1: 'Explica qué es el ROI'. Turn 2: 'Dame un ejemplo con números'. El modelo debe recordar el contexto.",
    related: ["Arena AI", "IFEval", "Elo Rating"],
  },
  {
    term: "IFEval",
    category: "Benchmark",
    aliases: ["Instruction Following Evaluation"],
    definition:
      "Benchmark que mide si un modelo sigue instrucciones estructurales precisas (ej: 'responde en menos de 50 palabras', 'usa formato JSON', 'comienza con la palabra X'). Es el benchmark que BenchLM usa para la categoría 'instructionFollowing'. Crítico para automatización donde el formato de salida importa.",
    example: "Instrucción: 'Lista 3 ventajas, cada una en una línea, sin numeración'. IFEval verifica que el formato sea exacto.",
    related: ["BenchLM", "IFEval", "IFBench"],
  },
  {
    term: "IFBench",
    category: "Benchmark",
    aliases: ["Instruction Following Benchmark"],
    definition:
      "Benchmark más reciente que IFEval, con instrucciones más complejas y adversariales. Mide resistencia a 'instruction drift' (cuando el modelo ignora instrucciones en prompts largos). BenchLM usa IFEval + IFBench para el score de instructionFollowing.",
    example: "IFBench puede pedir: 'Responde SOLO con la palabra SÍ o NO, sin puntuación, sin explicación' — mide si el modelo cumple exactamente.",
    related: ["IFEval", "BenchLM", "IFEval"],
  },
  {
    term: "AIME",
    category: "Benchmark",
    aliases: ["American Invitational Mathematics Examination"],
    definition:
      "Examen de matemáticas de la American Mathematical Association para estudiantes destacados de secundaria. 15 problemas, respuesta numérica 0-999. Mucho más difícil que GSM8K. BenchLM lo usa (aime2024, aime2025, aime2026) para la categoría 'math'. Modelos top obtienen 70-90%.",
    example: "Problema AIME típico requiere combinatoria, teoría de números y álgebra avanzada. Respuesta: un entero entre 0 y 999.",
    related: ["HMMT", "MMLU-Pro", "BenchLM"],
  },
  {
    term: "HMMT",
    category: "Benchmark",
    aliases: ["Harvard-MIT Mathematics Tournament"],
    definition:
      "Torneo de matemáticas de Harvard y MIT para estudiantes de secundaria. Problemas extremadamente difíciles (más que AIME). BenchLM usa hmmtFeb2026 para evaluar modelos top en matemáticas de competición. Modelos top obtienen 30-50% — es uno de los benchmarks más discriminativos.",
    example: "Problema HMMT puede requerir teoría de grafos, geometría avanzada y creatividad matemática en 10 minutos.",
    related: ["AIME", "MMLU-Pro", "BenchLM"],
  },
  {
    term: "LiveCodeBench",
    category: "Benchmark",
    aliases: ["LCB"],
    definition:
      "Benchmark de código con problemas nuevos cada semana (anti-contaminación). Mide capacidad de resolver problemas de programación competitiva estilo LeetCode. A diferencia de HumanEval (saturado), LiveCodeBench sigue discriminando entre modelos top. BenchLM lo usa para 'coding'.",
    example: "LiveCodeBench puede pedir: 'Dado un array de enteros, encuentra la subsecuencia más larga con suma par' — un problema LeetCode Hard.",
    related: ["HumanEval", "SWE-Bench Verified", "BenchLM", "Coding Index"],
  },

  // ---------- IA Moderna — Ampliación (6) ----------
  {
    term: "Function Calling",
    category: "IA",
    aliases: ["Tool Use", "Tool Calling", "Function Use"],
    definition:
      "Capacidad de un LLM de invocar funciones externas (APIs, calculadoras, bases de datos) durante su respuesta. El modelo decide cuándo llamar la función, con qué argumentos, y usa el resultado para continuar. Es la base de los agentes autónomos. SelectIA muestra esta capacidad con el icono 🔧 en la tabla.",
    example: "User: '¿Cuál es el clima en Lima?' → LLM llama función getWeather('Lima') → usa el resultado para responder.",
    related: ["Tool Use", "JSON Mode", "Agentic Index"],
  },
  {
    term: "Structured Output",
    category: "IA",
    aliases: ["JSON Schema", "Structured Generation", "Constrained Output"],
    definition:
      "Capacidad de un LLM de generar salida en formato JSON válido que cumple un schema específico. Garantiza que la respuesta sea parseable por código (no texto libre). Crítico para automatización: si el LLM debe devolver {\"roi\": 0.15, \"riesgo\": \"alto\"}, structured output asegura que lo haga.",
    example: "Schema: {roi: number, riesgo: 'alto'|'medio'|'bajo'}. El modelo devuelve exactamente eso, no texto explicativo.",
    related: ["JSON Mode", "Function Calling", "Reasoning"],
  },
  {
    term: "Model Context Protocol",
    category: "IA",
    aliases: ["MCP"],
    definition:
      "Protocolo abierto (2024) que estandariza cómo los LLMs se conectan a fuentes de datos externas (bases de datos, APIs, archivos). Permite que cualquier LLM use cualquier herramienta MCP-compatible. Es la evolución de Function Calling hacia un estándar universal. SelectIA aún no integra MCP pero es relevante para agentes.",
    example: "Un servidor MCP expone 'query_database' → cualquier LLM compatible (Claude, GPT, Gemini) puede usarlo sin configuración especial.",
    related: ["Function Calling", "Tool Use", "Agentic Index"],
  },
  {
    term: "Parámetros",
    category: "IA",
    aliases: ["Parameters", "Pesos", "Tamaño del Modelo", "Params", "Tamaño"],
    definition:
      "Número de valores numéricos ajustables que un modelo tiene. Más parámetros = mayor capacidad pero más costo de inferencia. Modelos modernos: 7B (pequeño), 70B (mediano), 405B (grande), 1T+ (frontier). MoE tiene muchos parámetros totales pero activa pocos por token. SelectIA muestra el tamaño en la columna 'Parámetros'.",
    example: "Llama 3.3 70B tiene 70 mil millones de parámetros. DeepSeek V3 es MoE 236B con 22B activos.",
    related: ["Mixture of Experts", "LLM", "VRAM"],
  },
  {
    term: "Hallucination Rate",
    category: "IA",
    aliases: ["Tasa de Alucinación", "Alucinación"],
    definition:
      "Porcentaje de respuestas donde el LLM inventa información falsa con confianza. Medido por benchmarks como Omniscience (que BenchLM usa). Rate alto = modelo poco confiable. SelectIA muestra este dato en Ficha Técnica vía BenchLM knowledge score. Modelos top: 5-15%, modelos malos: 30%+.",
    example: "Si el modelo dice 'La Torre Eiffel está en Londres' con confianza → alucinación. Omniscience detecta esto.",
    related: ["BenchLM", "Hallucination", "Hallucination"],
  },
  {
    term: "Razonamiento Adaptativo",
    category: "IA",
    aliases: ["Adaptive Reasoning", "Thinking Mode", "Extended Thinking"],
    definition:
      "Capacidad de un modelo de ajustar cuánto 'piensa' antes de responder según la complejidad de la tarea. Modelos como Claude Sonnet 5 (Adaptive Reasoning) pueden pensar más en problemas difíciles y menos en simples. Se indica con variantes '(Reasoning)', '(Adaptive)', '(Max Effort)', '(xhigh)' en el catálogo.",
    example: "Claude Sonnet 5 (Max Effort) piensa más que (Low Effort) para problemas complejos, pero cuesta más por token.",
    related: ["Reasoning", "Extended Thinking", "Modo Calidad"],
  },

  // ---------- Infraestructura — Ampliación (6) ----------
  {
    term: "Together AI",
    category: "Infraestructura",
    aliases: ["Together.ai", "Together"],
    definition:
      "Proveedor de inferencia que sirve modelos open-source (Llama, Qwen, DeepSeek) a precios competitivos. Especializado en fine-tuning y deployment de modelos custom. SelectIA lo lista como inference provider cuando un modelo está disponible ahí. Precios similares a Fireworks AI.",
    example: "Llama 3.3 70B en Together AI: $0.88/M input + $0.88/M output. Más barato que OpenAI para modelos open.",
    related: ["Fireworks AI", "OpenRouter", "Groq", "Inference Provider"],
  },
  {
    term: "Fireworks AI",
    category: "Infraestructura",
    aliases: ["Fireworks", "fireworks.ai"],
    definition:
      "Proveedor de inferencia ultra-rápido para modelos open-source. Usa GPUs optimizadas para baja latencia. Compete con Together AI y Groq. SelectIA lo lista como inference provider. Conocido por servir modelos MoE (Mixture of Experts) eficientemente.",
    example: "DeepSeek V3 en Fireworks: 2x más rápido que en Together AI, mismo precio. Bueno para tareas rápidas.",
    related: ["Together AI", "Groq", "Cerebras", "Inference Provider"],
  },
  {
    term: "Inference Provider",
    category: "Infraestructura",
    aliases: ["Proveedor de Inferencia", "Hosting de Modelos", "Proveedores", "Proveedor"],
    definition:
      "Empresa que sirve modelos de IA via API. Puede ser el propio creador (OpenAI, Anthropic, Google) o un tercero (Together, Fireworks, Groq, Cerebras, OpenRouter). SelectIA muestra qué providers ofrecen cada modelo en la columna 'Inference Providers'. Modelos open-weight suelen tener múltiples providers.",
    example: "DeepSeek V3 está en: DeepSeek oficial, Together AI, Fireworks AI, OpenRouter — el usuario elige el más barato/rápido.",
    related: ["Together AI", "Fireworks AI", "Groq", "Cerebras", "OpenRouter"],
  },
  {
    term: "Edge Computing",
    category: "Infraestructura",
    aliases: ["Edge AI", "Inferencia en el Borde"],
    definition:
      "Ejecutar modelos de IA localmente (laptop, servidor on-premise, teléfono) sin enviar datos a la nube. SelectIA soporta esto via Ollama para modelos open-weight. Ventajas: privacidad, sin costo por token, funciona sin internet. Desventajas: requiere hardware (GPU) y los modelos son más pequeños.",
    example: "Una planta industrial corre Llama 3.3 8B en una RTX 4090 local — sin enviar datos confidenciales a OpenAI.",
    related: ["Ollama", "VRAM", "Quantization", "Modo MYPE"],
  },
  {
    term: "Rate Limit",
    category: "Infraestructura",
    aliases: ["Límite de Tasa", "API Limit", "Throttling"],
    definition:
      "Número máximo de llamadas a una API por unidad de tiempo. Ej: AA API permite 100 req/día en free tier. SelectIA monitorea el rate limit de AA via headers HTTP (X-RateLimit-Remaining) y lo muestra en Salud del Sistema. Cuando se agota, el motor usa JSON estático del día anterior.",
    example: "AA free tier: 100 req/día. Si SelectIA hace 50 consultas, quedan 50. El header X-RateLimit-Remaining: 50.",
    related: ["Artificial Analysis", "JSON Estático", "ntfy.sh"],
  },

  // ---------- Costos — Ampliación (4) ----------
  {
    term: "Input Token",
    category: "Costos",
    aliases: ["Prompt Token", "Token de Entrada"],
    definition:
      "Token que el usuario envía al modelo (el prompt). Siempre más barato que el output token. SelectIA muestra priceInputUsd en la tabla. Modelos gratis (Ollama) tienen priceInput=0. El blended price usa 70% input + 30% output (asumiendo prompts más largos que respuestas).",
    example: "GPT-5.5: input $5/M, output $30/M. Si envías 1000 tokens y recibes 500: costo = 1000×$5/1M + 500×$30/1M = $0.005 + $0.015 = $0.020.",
    related: ["Output Token", "Blended Price", "M Token", "Token"],
  },
  {
    term: "Output Token",
    category: "Costos",
    aliases: ["Completion Token", "Token de Salida"],
    definition:
      "Token que el modelo genera en su respuesta. Siempre más caro que el input token (2x-8x) porque requiere cómputo de generación. SelectIA muestra priceOutputUsd. Modelos con razonamiento extendido generan más output tokens (pensando) → más caros por respuesta.",
    example: "GPT-5.5 output $30/M vs input $5/M = 6x más caro. Una respuesta de 500 tokens cuesta 6x más que el prompt de 500 tokens.",
    related: ["Input Token", "Blended Price", "Reasoning", "M Token"],
  },
  {
    term: "Cache Hit",
    category: "Costos",
    aliases: ["Prompt Cache Hit", "Cached Read", "Cache Read"],
    definition:
      "Cuando el modelo reconoce que parte del prompt ya fue procesado antes y lo sirve desde cache (más barato). Ej: si envías el mismo system prompt repetidamente, la 2da vez es cache hit (50-90% más barato). SelectIA muestra priceCacheHitUsd. Modelos como Claude y GPT-5.5 soportan prompt caching.",
    example: "Claude Sonnet 5: input $3/M, cache hit $0.30/M (90% descuento). Si reusas un system prompt de 10K tokens, ahorras 90% en ese prompt.",
    related: ["Cache Write", "Input Token", "Blended Price"],
  },
  {
    term: "Cache Write",
    category: "Costos",
    aliases: ["Prompt Cache Write", "Cache Storage"],
    definition:
      "Cuando el modelo guarda parte del prompt en cache para futuros cache hits. Cuesta un poco más que un input token normal (ej: 1.25x). SelectIA muestra priceCacheWriteUsd. Solo vale la pena si reusas el mismo prompt múltiples veces en un corto período.",
    example: "GPT-5.5: input $5/M, cache write $6.25/M (1.25x). Si reusas el prompt 10+ veces, el cache write se amortiza.",
    related: ["Cache Hit", "Input Token", "Blended Price"],
  },

  // ---------- Ingeniería Peruana — Ampliación (3) ----------
  {
    term: "SUNAT",
    category: "Ingeniería",
    aliases: ["Superintendencia Nacional de Aduanas y de Administración Tributaria"],
    definition:
      "Entidad del Perú que administra la tributación y aduanas. SelectIA referencia SUNAT en el contexto de cálculos financieros (impuestos, IGV 18%). El Régimen MYPE Tributario (RMT) es un régimen especial para pequeñas empresas peruanas con tasas reducidas. Los modelos de IA pueden ayudar con cálculos tributarios pero no reemplazan a un contador.",
    example: "Una MYPE con ingresos <300 UIT/año puede acogerse al RMT: tasa 1.5% sobre ingresos (vs 29.5% régimen general).",
    related: ["MYPE", "ROI", "Régimen MYPE Tributario"],
  },
  {
    term: "Régimen MYPE Tributario",
    category: "Ingeniería",
    aliases: ["RMT", "Régimen MYPE", "REMYPE"],
    definition:
      "Régimen tributario especial del Perú para micro y pequeñas empresas (hasta 300 UIT de ingresos anuales). Tasas reducidas: 1.5% si ingresos ≤25 UIT, 1.75% si 25-50 UIT, 2% si 50-300 UIT. SelectIA usa 'MYPE' como modo del motor porque representa a empresas con presupuesto cero o ajustado que necesitan IA accesible.",
    example: "MYPE metalmecánica con ingresos de 100 UIT/año → tasa RMT 1.75%. Una herramienta de IA que ahorra 10h/semana a S/.50/hora = S/.2000/mes de ahorro.",
    related: ["MYPE", "SUNAT", "ROI", "Payback"],
  },
  {
    term: "Metalmecánica",
    category: "Ingeniería",
    aliases: ["Metal Mecánica", "Metal-Mecánica", "Industria Metalmecánica"],
    definition:
      "Industria que trabaja con metales para crear productos (piezas, estructuras, maquinaria). Incluye corte, soldadura, fresado, torneado, fundición. Es el nicho principal de SelectIA: MYPE metalmecánicas peruanas que necesitan IA para cotizaciones, planos, G-code, control de calidad, etc. El dashboard tiene equivalencias en 'almuerzos', 'pintas', 'pasajes' para que el costo de IA sea tangible.",
    example: "Una MYPE metalmecánica usa IA para: generar G-code para fresadora, cotizar piezas, traducir manuales técnicos, analizar planos PDF.",
    related: ["MYPE", "G-code", "CNC", "Plano Técnico"],
  },

  // ---------- Arquitectura — Ampliación (3) ----------
  {
    term: "CDN",
    category: "Arquitectura",
    aliases: ["Content Delivery Network", "Red de Distribución de Contenido"],
    definition:
      "Red de servidores distribuidos globalmente que sirve contenido cerca del usuario para baja latencia. SelectIA expone /api/dashboard con cabeceras Cache-Control (s-maxage=300, stale-while-revalidate=600), de modo que Vercel edge cachea la respuesta del orquestador cerca del usuario (Lima, São Paulo, etc.) y la refresca bajo demanda.",
    example: "Usuario en Lima pide /api/dashboard → Vercel CDN entrega la respuesta cacheada desde un servidor cercano; cuando expira, el edge refresca contra el orquestador.",
    related: ["JSON dinámico", "Serverless Proxy", "Serverless"],
  },
  {
    term: "Serverless",
    category: "Arquitectura",
    aliases: ["Serverless Computing", "Function as a Service", "FaaS"],
    definition:
      "Modelo donde el cloud ejecuta código solo cuando se necesita, sin servidores persistentes. SelectIA usa Vercel Functions para el endpoint /api/dashboard (force-refresh) y /api/hf-model (lazy-load Ficha Técnica). Ventajas: costo 0 si no hay tráfico, escala automática. Desventajas: cold start (latencia en 1era request).",
    example: "/api/dashboard se ejecuta solo cuando un usuario pide datos frescos. Si nadie visita, no cuesta nada. Si 1000 usuarios visitan, escala a 1000 instancias automáticamente.",
    related: ["Serverless Proxy", "JSON Estático", "CDN"],
  },
  {
    term: "Webhook",
    category: "Arquitectura",
    aliases: ["HTTP Callback", "Reverse API"],
    definition:
      "Mecanismo donde una aplicación notifica a otra via HTTP POST cuando ocurre un evento. SelectIA usa ntfy.sh (un servicio de webhooks simplificado) para enviar alertas al móvil del administrador cuando: una API cae, el cron falla, el JSON no se puede regenerar, etc. No requiere servidor escuchando.",
    example: "Si la API de AA cae a las 3am → SelectIA envía webhook a ntfy.sh → el admin recibe push notification en su móvil.",
    related: ["ntfy.sh", "Cron", "ntfy.sh"],
  },

  // ---------- Tabla Maestra + Módulos — Ampliación final (12) ----------
  {
    term: "Modelo",
    category: "IA",
    aliases: ["AI Model", "Modelo de IA"],
    definition:
      "Cada modelo de lenguaje (LLM) en el catálogo de SelectIA. La tabla maestra muestra 219 modelos con 23 columnas de datos. Cada modelo tiene: nombre, proveedor, precio, calidad (II, coding, agentic), velocidad, contexto, capacidades, licencia, y estado. El motor HRE-TOPSIS los evalúa como 'alternativas' en el problema MCDM.",
    example: "GPT-5.5, Claude Sonnet 5, Gemini 3.5 Flash son 'modelos' en SelectIA.",
    related: ["LLM", "Intelligence Index", "Proveedor", "Alternativa"],
  },
  {
    term: "Licencia",
    category: "Licencias",
    aliases: ["License", "Tipo de Licencia"],
    definition:
      "Tipo de uso permitido para un modelo. SelectIA clasifica en 5 tipos: Comercial Libre (Apache, MIT), Condicional (Llama, Gemma), Solo API Pago (OpenAI, Anthropic), Solo Investigación, Open Source Completo. Determina si una empresa puede usar el modelo comercialmente. La columna 'Licencia' de la tabla maestra muestra esta clasificación.",
    example: "MIT = usar libremente incluso comercialmente. Solo API Pago = solo via API pagando por tokens.",
    related: ["MIT", "Apache 2.0", "Llama Community", "Solo API Pago", "Open Source Completo"],
  },
  {
    term: "Capacidades",
    category: "IA",
    aliases: ["Capabilities", "Funcionalidades"],
    definition:
      "Conjunto de 10 funcionalidades que un modelo soporta: tool use, vision, JSON mode, reasoning, audio input, audio output, PDF, web search, interleaved reasoning, extended thinking. La columna 'Capacidades' de la tabla maestra muestra iconos para cada una. El filtro por capacidades permite encontrar modelos que soporten ej: vision o JSON mode.",
    example: "Gemini 3.5 Flash soporta: vision, JSON mode, reasoning, tool use, PDF, web search — 6 de 10 capacidades.",
    related: ["Tool Use", "JSON Mode", "Vision", "Reasoning", "Extended Thinking"],
  },
  {
    term: "Estado",
    category: "IA",
    aliases: ["Activo", "Status", "Vigencia"],
    definition:
      "Clasificación del ciclo de vida del modelo: Activo (vigente, recomendable), Reemplazado (existe versión más nueva de la misma familia, mostrar con ⚠), Descontinuado (el proveedor ya no lo ofrece). La columna 'Estado' de la tabla maestra usa la Función K (benchlmSupersededBy) para detectar reemplazos. Los modelos reemplazados siguen apareciendo pero con badge amarillo.",
    example: "GPT-5.4 está 'Reemplazado por GPT-5.5'. Claude Opus 4.6 está 'Activo' (vigente).",
    related: ["Vigente", "Ciclo de Vida", "BenchLM", "Función K"],
  },
  {
    term: "Vigente",
    category: "IA",
    aliases: ["Current", "Canonical", "Activo"],
    definition:
      "Estado de un modelo que es la versión canónica (más reciente) de su familia. BenchLM marca isCanonicalFamilyEntry=true para estos. Un modelo vigente NO tiene supersedesModelKey. La columna 'Vigente' de la tabla maestra muestra 🟢 para vigentes y 🟡 para reemplazados. En modo Calidad, los modelos reemplazados pueden filtrarse.",
    example: "Claude Sonnet 5 (Max Effort) es vigente — es la versión más reciente de la familia Claude Sonnet 5.",
    related: ["Estado", "Ciclo de Vida", "BenchLM", "Piso de Calidad"],
  },
  {
    term: "Ciclo de Vida",
    category: "IA",
    aliases: ["Lifecycle", "Model Lifecycle", "Función K"],
    definition:
      "Estado de un modelo en su familia: Vigente (versión actual), Reemplazado (existe sucesor), Establecido (variante madura). Determinado por family.supersedesModelKey y isCanonicalFamilyEntry de BenchLM. La Ficha Técnica muestra una sección 'Ciclo de Vida del Modelo' con 🟡 (reemplazado) o 🟢 (vigente). 21/219 modelos están reemplazados.",
    example: "Gemini 3.5 Flash está 'Reemplazado por Gemini 3 Flash'. Claude Opus 4.5 está 'Reemplazado por Claude Opus 4.6'.",
    related: ["Vigente", "Estado", "BenchLM", "Ficha Técnica"],
  },
  {
    term: "Knowledge Cutoff",
    category: "IA",
    aliases: ["Cutoff", "Corte de Conocimiento", "Knowledge Cutoff Date"],
    definition:
      "Fecha límite de los datos de entrenamiento del modelo. Un modelo con cutoff 'Jan 2025' no sabe nada que pasó después de enero 2025. La columna 'Cutoff' de la tabla maestra muestra esta fecha. Crítico para tareas que requieren información actualizada (precios, noticias, regulaciones). Modelos con cutoff antiguo pueden alucinar datos recientes.",
    example: "GPT-5.5 cutoff: 'Apr 2025'. No sabe sobre eventos posteriores. Para una consulta sobre precios de julio 2025, puede equivocarse.",
    related: ["LLM", "Hallucination", "Parámetros"],
  },
  {
    term: "Ficha Técnica",
    category: "Arquitectura",
    aliases: ["📋", "Ficha", "Technical Sheet"],
    definition:
      "Modal que muestra información detallada de un modelo desde HuggingFace Hub: actividad del ecosistema (Spaces), adopción (downloads, likes), detalles de hardware (safetensors, GGUF), evaluación del autor (model-index, widgetData), detalles técnicos (chat_template, library_name), salud (disabled, gated), y desde v3.3.1: secciones BenchLM (8 categorías), ZeroEval (reliability), y Ciclo de Vida. Se abre con el botón 📋 en la tabla maestra.",
    example: "Al hacer clic en 📋 junto a Gemini 3.5 Flash → se abre la ficha con: 100 Spaces, 11K downloads, BenchLM 81/100, ZeroEval 99.5% reliability, Ciclo de Vida: Reemplazado por Gemini 3 Flash.",
    related: ["BenchLM", "ZeroEval", "Ciclo de Vida", "HuggingFace", "Safetensors"],
  },
  {
    term: "Tier",
    category: "Costos",
    aliases: ["Nivel", "Categoría de Precio", "Rápido", "Medio", "Avanzado"],
    definition:
      "Clasificación de modelos por precio/calidad usada en la Guía de Decisión. 3 tiers: Rápido (<$1/M, II sin umbral — tareas simples y alta frecuencia), Medio ($1-$15/M, II≥35 — tareas moderadas), Avanzado (>$15/M, II≥45 — tareas complejas). El motor auto-sugiere un tier según la complejidad de la tarea detectada en el query.",
    example: "Mercury 2 ($0.40/M) = Tier Rápido. Gemini 3.5 Flash (FREE) = Tier Rápido/Medio. Claude Sonnet 5 ($6.60/M) = Tier Medio. GPT-5.5 ($12.50/M) = Tier Avanzado.",
    related: ["Modo MYPE", "Modo Equilibrado", "Modo Calidad", "Blended Price", "Tier"],
  },
  {
    term: "Break-even",
    category: "Costos",
    aliases: ["Punto de Equilibrio", "Break-even Point", "BEP"],
    definition:
      "Punto donde los ahorros por usar IA igualan la inversión en IA. Si una MYPE invierte S/.1000/mes en IA y ahorra S/.2000/mes en horas-hombre, el break-even es inmediato. Si invierte S/.5000 en setup + S/.500/mes y ahorra S/.1000/mes, el break-even es a los 10 meses. El Simulador ROI calcula esto automáticamente.",
    example: "Inversión: S/.3000 setup + S/.300/mes IA. Ahorro: S/.800/mes. Break-even = 3000/(800-300) = 6 meses.",
    related: ["ROI", "Payback", "ROI", "MYPE"],
  },
  {
    term: "Equivalencias",
    category: "Costos",
    aliases: ["Almuerzos", "Pintas", "Cafés", "Pasajes"],
    definition:
      "Conversión del costo de IA a unidades tangibles para MYPE peruanas. SelectIA muestra: 1 almuerzo = S/.15, 1 pinta de cerveza = S/.20, 1 café = S/.8, 1 pasaje de bus = S/.2. Si un modelo cuesta S/.30/M tokens, eso equivale a 2 almuerzos o 3.75 pintas. Hace que el costo abstracto de IA sea comprensible.",
    example: "GPT-5.5 a S/.42.53/M = 2.8 almuerzos o 5.3 pintas o 21 pasajes de bus. ¿Vale la pena?",
    related: ["Blended Price", "PEN", "MYPE", "Equivalencias"],
  },
  {
    term: "Perfil de Usuario",
    category: "Arquitectura",
    aliases: ["Perfil", "Profile", "Profile A", "Profile B"],
    definition:
      "6 perfiles preconfigurados que adaptan la UI y los pesos del motor: A (Ingeniero Industrial — técnico), B (Gerente de Planta — KPIs y ROI), C (Consultor Supply Chain — comparativas), D (TI/Sysadmin — confiabilidad y APIs), E (Operario de Taller — tarjetas grandes, simple), F (Compras — precios y proyecciones). Cada perfil prioriza distinta información.",
    example: "Perfil A ve tabla completa + recomendador técnico. Perfil E ve 3 tarjetas grandes con recomendación simple. Perfil F ve timeline de precios + simulador ROI.",
    related: ["Modo MYPE", "Modo Calidad", "Tier", "MYPE"],
  },

  // ---------- Tier de precios BenchLM (3) ----------
  {
    term: "Frontier Model",
    category: "Costos",
    aliases: ["Frontier", "Modelo Frontier", "Top-tier"],
    definition:
      "Modelo de IA top-tier, el más caro y capaz del mercado. Ej: GPT-5.5 ($12.50/M), Claude Opus 4.6 ($11/M). BenchLM los clasifica como 'frontier' en el Token Price Index. Han caído 88% de precio desde marzo 2023 (índice 100 a 12). Son los modelos que definen el estado del arte.",
    example: "GPT-5.5 y Claude Opus 4.6 son frontier. En marzo 2023 costaban $100/M (índice 100), ahora cuestan $12/M (índice 12).",
    related: ["Mid-tier Model", "Budget Model", "BenchLM", "Blended Price"],
  },
  {
    term: "Mid-tier Model",
    category: "Costos",
    aliases: ["Mid", "Mid-tier", "Modelo Mid", "Gama Media"],
    definition:
      "Modelo de IA de gama media, con balance precio-calidad. Ej: Claude Sonnet 5 ($6.60/M), Gemini 3.5 Flash ($3.75/M). BenchLM los clasifica como 'mid' en el Token Price Index. Caída de precio moderada desde marzo 2023. Ideales para la mayoría de tareas empresariales.",
    example: "Claude Sonnet 5 y Gemini 3.5 Flash son mid-tier. Más baratos que frontier pero casi igual de capaces para tareas comunes.",
    related: ["Frontier Model", "Budget Model", "Tier", "BenchLM"],
  },
  {
    term: "Budget Model",
    category: "Costos",
    aliases: ["Budget", "Modelo Budget", "Económico"],
    definition:
      "Modelo de IA económico (menos de $1/M tokens). Ej: Mercury 2 ($0.40/M), Granite 3.3 ($0.10/M). BenchLM los clasifica como 'budget' en el Token Price Index. Precios estables, sin caída significativa. Ideales para tareas simples, alta frecuencia o MYPEs con presupuesto cero.",
    example: "Mercury 2 ($0.40/M) es budget. 100x más barato que GPT-5.5 ($12.50/M) pero con menos calidad.",
    related: ["Frontier Model", "Mid-tier Model", "Tier", "Modo MYPE"],
  },
];

// Helper lookup
export function findTerm(term: string): GlossaryTerm | undefined {
  const lower = term.toLowerCase();
  return GLOSSARY.find(
    (t) =>
      t.term.toLowerCase() === lower ||
      (t.aliases ?? []).some((a) => a.toLowerCase() === lower)
  );
}
