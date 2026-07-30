// ================================================================
// DOCUMENTACIÓN DEL MOTOR HRE-TOPSIS
// Exporta CATEGORY_DOCS (8 categorías), MODE_DOCS (4 modos) y
// ENGINE_LAYERS (5 capas). Usado por <HreTopsisExplained /> y
// <CategoryCards /> para mostrar contenido educativo.
// ================================================================

import type { TaskCategory, OperationMode } from "@/lib/types";

export interface CategoryDoc {
  id: TaskCategory;
  label: string;
  shortDescription: string;
  fullDescription: string;
  icon: string; // lucide icon name
  color: string;
  keywords: string[];
  entityBoosts: string[];
  priorityMetrics: { metric: string; weight: number }[];
  hardFilters: string[];
  included: string[];
  excluded: string[];
  exampleQueries: string[];
}

export const CATEGORY_DOCS: CategoryDoc[] = [
  {
    id: "redaccion",
    label: "Redacción",
    icon: "PenLine",
    color: "#5e6ad2",
    shortDescription: "Correos, cartas, propuestas, cotizaciones, informes",
    fullDescription:
      "Tareas de escritura profesional en español: correspondencia con clientes, propuestas comerciales, memorandums internos, informes de gestión. El motor prioriza preferencia humana (Elo) y costo para MYPE.",
    keywords: [
      "correo", "carta", "propuesta", "cotizacion", "informe", "reporte",
      "email", "redactar", "mensaje", "memorandum", "memo", "acta",
    ],
    entityBoosts: ["Detección de moneda (+2)", "Restricción de tiempo (+3)"],
    priorityMetrics: [
      { metric: "Elo (preferencia humana)", weight: 0.4 },
      { metric: "Efficiency Cost", weight: 0.25 },
      { metric: "Intelligence Index", weight: 0.20 },
    ],
    hardFilters: ["Excluye Solo Investigación"],
    included: ["GPT-5.5", "Claude Sonnet 4", "Gemini 3 Pro", "Llama 3.3 70B"],
    excluded: ["Modelos research-only", "Modelos discontinuados"],
    exampleQueries: [
      "Redactar correo a cliente sobre demora en entrega",
      "Escribir propuesta comercial para 200 bridas",
      "Memorandum interno sobre nuevo turno",
    ],
  },
  {
    id: "documentos",
    label: "Documentos",
    icon: "FileText",
    color: "#f0bf00",
    shortDescription: "Manuales, normas, contratos, planos, PDFs extensos",
    fullDescription:
      "Análisis de documentos técnicos: manuales de CNC de 300+ páginas, normas ISO, contratos, especificaciones. El motor prioriza capacidad de contexto y soporte PDF.",
    keywords: [
      "manual", "norma", "contrato", "plano", "pdf", "iso",
      "analizar", "resumir", "leer", "documento", "paginas",
    ],
    entityBoosts: ["Tipo de documento (+3)", "Tamaño de contexto detectado (+3)"],
    priorityMetrics: [
      { metric: "Context Window", weight: 0.45 },
      { metric: "Intelligence Index", weight: 0.25 },
      { metric: "Elo", weight: 0.10 },
    ],
    hardFilters: ["Excluye sin contexto suficiente si se detecta tamaño"],
    included: ["Gemini 3 Pro (2M)", "GPT-5.5 (400K)", "Claude Opus 4 (1M)"],
    excluded: ["Modelos sin soporte PDF (warning suave)"],
    exampleQueries: [
      "Analizar manual técnico CNC de 300 páginas",
      "Resumir contrato de suministro de 80 hojas",
      "Extraer cotas de plano PDF de brida",
    ],
  },
  {
    id: "programacion",
    label: "Programación",
    icon: "Code2",
    color: "#68cc58",
    shortDescription: "Código, G-code, scripts, macros CNC, integraciones Odoo",
    fullDescription:
      "Generación y depuración de código: Python, JavaScript, G-code para CNC, macros paramétricas, scripts de Odoo. El motor prioriza Coding Index y exige JSON Mode.",
    keywords: [
      "python", "g-code", "gcode", "cnc", "macro", "script",
      "odoo", "codigo", "programar", "funcion", "api", "debug",
    ],
    entityBoosts: ["Mención de lenguaje (+2)", "Mención de herramienta (+2)"],
    priorityMetrics: [
      { metric: "Coding Index", weight: 0.50 },
      { metric: "Efficiency Cost", weight: 0.20 },
      { metric: "Intelligence Index", weight: 0.10 },
    ],
    hardFilters: ["Excluye sin JSON Mode", "Excluye Solo Investigación"],
    included: ["Claude Fable 5", "GPT-5.5", "DeepSeek V3.2", "Gemini 3 Pro"],
    excluded: ["Modelos sin JSON Mode (Llama 3.1 8B base)"],
    exampleQueries: [
      "Generar G-code para fresado de bridas Ø100mm",
      "Macro CNC paramétrica para agujeros circulares",
      "Script Python para validar RUC en SUNAT",
    ],
  },
  {
    id: "calculos",
    label: "Cálculos",
    icon: "Calculator",
    color: "#fc7840",
    shortDescription: "Costos, ROI, presupuestos, márgenes, tributos SUNAT",
    fullDescription:
      "Cálculos numéricos y financieros: ROI de automatización, presupuestos, márgenes, impuestos peruanos. El motor prioriza Intelligence Index (razonamiento numérico) y contexto.",
    keywords: [
      "costo", "presupuesto", "roi", "precio", "calcular",
      "formula", "estimacion", "margen", "ganancia", "impuesto", "sunat",
    ],
    entityBoosts: ["Moneda detectada (+2)", "Números detectados (+2)"],
    priorityMetrics: [
      { metric: "Intelligence Index", weight: 0.45 },
      { metric: "Context Window", weight: 0.25 },
      { metric: "Elo", weight: 0.10 },
    ],
    hardFilters: ["Excluye Solo Investigación"],
    included: ["GPT-5.5 (xhigh)", "Claude Opus 4", "Gemini 3 Pro"],
    excluded: ["Modelos sin extended thinking para cálculos complejos"],
    exampleQueries: [
      "Calcular ROI de automatizar cotizaciones",
      "Estimar margen de brida SAE 1045 con IGV",
      "Presupuesto mensual de tokens para 10 ingenieros",
    ],
  },
  {
    id: "offline",
    label: "Offline",
    icon: "HardDriveDownload",
    color: "#00b8cc",
    shortDescription: "Sin internet, confidencial, planta, taller",
    fullDescription:
      "Tareas en entornos sin internet o con datos confidenciales: planta industrial, taller, red interna. El motor exige disponibilidad en Ollama y prioriza velocidad local.",
    keywords: [
      "sin internet", "privado", "confidencial", "planta",
      "wifi", "local", "offline", "desconectado", "taller",
    ],
    entityBoosts: ["Mención de planta (+4)", "Mención de confidencial (+3)"],
    priorityMetrics: [
      { metric: "Context Window", weight: 0.30 },
      { metric: "Intelligence Index", weight: 0.20 },
      { metric: "Speed TPS", weight: 0.20 },
    ],
    hardFilters: ["Excluye no disponibles en Ollama"],
    included: ["Llama 3.3 70B", "Llama 3.1 8B", "Phi-4", "Gemma 3 27B", "Mistral Nemo"],
    excluded: ["GPT, Claude, Gemini (no descargables)"],
    exampleQueries: [
      "Tarea en planta sin internet para interpretar plano",
      "Resumir contrato confidencial offline",
      "Generar G-code en taller sin WiFi",
    ],
  },
  {
    id: "rapidas",
    label: "Rápidas",
    icon: "Zap",
    color: "#f0bf00",
    shortDescription: "Urgente, tiempo real, inmediato, ahora mismo",
    fullDescription:
      "Tareas con restricción de tiempo explícita: respuestas en vivo, traducción durante llamada, generación en fila de producción. El motor exige >30 tok/s y prioriza velocidad sobre calidad.",
    keywords: [
      "rapido", "inmediato", "tiempo real", "urgente",
      "ahora", "instantaneo", "veloz",
    ],
    entityBoosts: ["Restricción de tiempo explícita (+3)"],
    priorityMetrics: [
      { metric: "Speed TPS", weight: 0.55 },
      { metric: "Elo", weight: 0.15 },
      { metric: "Efficiency Cost", weight: 0.20 },
    ],
    hardFilters: ["Excluye <30 tok/s", "Excluye Solo Investigación"],
    included: ["Llama 3.1 8B (Groq)", "Phi-4 (Cerebras)", "Gemini 3 Flash"],
    excluded: ["Modelos razonadores lentos (>5s TTFT)"],
    exampleQueries: [
      "Traducir instrucción urgente al chino mandarín",
      "Respuesta inmediata para cliente en línea",
      "Generar código G-code en tiempo real en CNC",
    ],
  },
  {
    id: "multilingue",
    label: "Multilingüe",
    icon: "Globe",
    color: "#4ea7fc",
    shortDescription: "Español, inglés, chino, portugués, alemán, francés",
    fullDescription:
      "Tareas que requieren traducción o manejo multilingüe: especificaciones técnicas, manuales internacionales, correspondencia con proveedores extranjeros. El motor prioriza Elo (preferencia humana) e Intelligence Index con umbral mínimo de 30.",
    keywords: [
      "español", "ingles", "traducir", "idioma",
      "chino", "mandarin", "portugues", "aleman", "frances", "multilingue",
    ],
    entityBoosts: ["Idioma explícito mencionado (+4)"],
    priorityMetrics: [
      { metric: "Intelligence Index", weight: 0.30 },
      { metric: "Elo", weight: 0.30 },
      { metric: "Efficiency Cost", weight: 0.20 },
    ],
    hardFilters: ["Excluye II<30 (calidad mínima multilingüe)"],
    included: ["GPT-5.5", "Claude Opus 4", "Gemini 3 Pro", "DeepSeek V3.2"],
    excluded: ["Modelos pequeños sin entrenamiento multilingüe"],
    exampleQueries: [
      "Traducir especificación técnica al inglés",
      "Manual de operación en portugués brasileño",
      "Correo a proveedor chino en mandarín",
    ],
  },
  {
    id: "agentes",
    label: "Agentes",
    icon: "Bot",
    color: "#533afd",
    shortDescription: "Automatización, workflows, multi-paso, integraciones",
    fullDescription:
      "Tareas autónomas multi-paso: automatización de cotizaciones, integración con ERP, pipelines de datos. El motor prioriza Agentic Index y exige Tool Use.",
    keywords: [
      "automatizar", "proceso", "workflow", "flujo",
      "multiples pasos", "conectar", "integrar", "agente", "orquestar",
    ],
    entityBoosts: ["Mención de integración (+3)", "Mención de workflow (+2)"],
    priorityMetrics: [
      { metric: "Agentic Index", weight: 0.55 },
      { metric: "Coding Index", weight: 0.10 },
      { metric: "Intelligence Index", weight: 0.10 },
    ],
    hardFilters: ["Excluye sin Tool Use (recomendado)", "Excluye research-only"],
    included: ["GPT-5.5 (xhigh)", "Claude Fable 5", "Gemini 3 Pro"],
    excluded: ["Modelos sin function calling"],
    exampleQueries: [
      "Automatizar flujo de cotización a factura en Odoo",
      "Agente que valide RUC en SUNAT y emita comprobante",
      "Pipeline de clasificación de OTs por prioridad",
    ],
  },
];

export interface ModeDoc {
  id: OperationMode;
  label: string;
  shortLabel: string;
  description: string;
  costWeightRange: string;
  behavior: string;
  useCase: string;
  exampleScenario: string;
  color: string;
  icon: string;
}

export const MODE_DOCS: ModeDoc[] = [
  {
    id: "mype",
    label: "MYPE (presupuesto cero)",
    shortLabel: "MYPE",
    description:
      "Prioriza modelos gratuitos o de costo cero. Aplica el umbral anti-'gratis malo': si el mejor modelo gratis tiene Intelligence Index <70% del mejor pago, swap a pago como ganador.",
    costWeightRange: "0.15 - 0.25",
    behavior:
      "Pesos altos a Efficiency Cost (15-25%) y moderados a Elo (10-40%). Mantiene calidad mínima con umbral del 70%.",
    useCase: "Micro y pequeña empresa peruana con presupuesto ajustado",
    exampleScenario:
      "Una metalmecánica con 8 tornos quiere probar IA sin gastar. Modo MYPE recomienda Llama 3.1 8B gratis en Groq si su II ≥ 70% del mejor pago.",
    color: "#00d66f",
    icon: "Sprout",
  },
  {
    id: "calidad",
    label: "Calidad máxima",
    shortLabel: "Calidad",
    description:
      "Ignora el costo (peso 0.05) y maximiza Elo + Intelligence Index. Pensado para entregables profesionales donde un error es caro.",
    costWeightRange: "0.05",
    behavior:
      "Pesos máximos a Elo (10-50%) e Intelligence Index (20-55%). Costo casi irrelevante.",
    useCase: "Consultor armando propuesta de $50K, ingeniero emitiendo informe técnico crítico",
    exampleScenario:
      "Consultor redactando propuesta técnica para licitación pública. Modo Calidad recomienda siempre Claude Opus 4 o GPT-5.5 sin importar costo.",
    color: "#5e6ad2",
    icon: "Award",
  },
  {
    id: "equilibrado",
    label: "Equilibrado",
    shortLabel: "Equilibrado",
    description:
      "Balance justo entre costo y calidad. Pesos intermedios para decisiones informadas donde ambos factores importan.",
    costWeightRange: "0.10 - 0.15",
    behavior:
      "Pesos moderados en todos los criterios. Elo (7-45%), II (15-50%), Cost (10-15%).",
    useCase: "Gerente decidiendo modelo para 200 ingenieros — busca TCO sin sacrificar calidad",
    exampleScenario:
      "Gerente de planta con 50 ingenieros: Modo Equilibrado recomienda Claude Sonnet 4 (calidad alta con costo controlado).",
    color: "#f0bf00",
    icon: "Scale",
  },
  {
    id: "solo-gratis",
    label: "Solo gratis",
    shortLabel: "Gratis",
    description:
      "Hard-filtra todo modelo pago o con registro de tarjeta. Solo muestra opciones 100% gratis o tier gratis. Para pruebas sin compromiso.",
    costWeightRange: "0.20 - 0.25 (hereda MYPE)",
    behavior:
      "Aplica filtros duros adicionales: excluye paid-only y free-registration. Usa pesos MYPE sobre el subconjunto resultante.",
    useCase: "Estudiante, profesional evaluando IA por primera vez, prueba sin tarjeta",
    exampleScenario:
      "Estudiante de ingeniería quiere probar IA sin dar tarjeta de crédito. Modo Solo Gratis muestra solo Llama, Phi-4, Gemma 3, Mistral en tier gratis.",
    color: "#00b8cc",
    icon: "Gift",
  },
];

export interface EngineLayer {
  id: number;
  name: string;
  shortName: string;
  description: string;
  steps: string[];
  output: string;
  traceability: string;
  icon: string;
  color: string;
}

export const ENGINE_LAYERS: EngineLayer[] = [
  {
    id: 1,
    name: "Clasificación TF-IDF",
    shortName: "Intent",
    description:
      "Normaliza la consulta del usuario (lowercase, sin acentos, sin puntuación) y la clasifica en 8 categorías de tarea usando keyword scoring + entity boosts.",
    steps: [
      "Normalización: lowercase + NFD + strip accents + strip punctuation",
      "Tokenización: split por espacios, filtro palabras >2 chars",
      "Match contra 8 categorías × ~15 keywords cada una (long>4 → +2, sino +1)",
      "Detección de entidades: moneda, números, materiales, idioma, tiempo, tipo doc, tamaño contexto",
      "Boosts: +2 a +4 según entidad y categoría (ej. idioma +4 a multilingüe)",
      "Multi-intent: si 2da categoría ≥50% de la 1ra, se divide en pesos",
    ],
    output: "Categoría principal (TaskCategory) + scores por categoría + entidades detectadas + multi-intent opcional",
    traceability: "El panel 'Intención detectada' muestra la categoría elegida, los pesos y todas las entidades encontradas.",
    icon: "Search",
    color: "#5e6ad2",
  },
  {
    id: 2,
    name: "Filtros Duros",
    shortName: "Filtros",
    description:
      "Aplica criterios no negociables que eliminan modelos antes del ranking. Diferentes por categoría y modo.",
    steps: [
      "Excluye siempre licencia 'research-only' (salvo que el usuario lo active)",
      "Modo Solo Gratis: excluye paid-only y free-registration",
      "Categoría documentos: si detecta tamaño de contexto, excluye modelos que no lo soportan",
      "Categoría offline: excluye no disponibles en Ollama",
      "Categoría rápidas: excluye <30 tok/s",
      "Categoría multilingüe: excluye II<30 (calidad mínima)",
      "Categoría programación: excluye sin JSON Mode",
      "Fallback: si quedan 0 candidatos, relaja filtros y solo excluye research-only",
    ],
    output: "Subconjunto de modelos candidatos que cumplen todos los requisitos duros",
    traceability: "El contador 'N modelos candidatos' muestra cuántos pasaron el filtro.",
    icon: "Filter",
    color: "#eb5757",
  },
  {
    id: 3,
    name: "Matriz AHP",
    shortName: "AHP",
    description:
      "Asigna pesos a 7 criterios (efficiencyCost, elo, II, coding, agentic, speed, context) según categoría + modo. 3 sets pre-calibrados × 8 categorías = 24 matrices.",
    steps: [
      "Selecciona set de pesos: MYPE / Calidad / Equilibrado",
      "Recupera pesos específicos para la categoría detectada",
      "Aplica pesos a los 7 criterios TOPSIS",
      "Pesos suman 1.0 (verificado en build-time)",
      "El usuario puede cambiar de modo en tiempo real y ver cómo cambian los pesos",
    ],
    output: "WeightSet { efficiencyCost, elo, intelligenceIndex, codingIndex, agenticIndex, speed, context }",
    traceability: "El panel 'Pesos AHP' muestra los 7 criterios con sus pesos para la combinación actual.",
    icon: "Scale",
    color: "#f0bf00",
  },
  {
    id: 4,
    name: "Ranking TOPSIS",
    shortName: "TOPSIS",
    description:
      "Aplica el algoritmo MCDM TOPSIS: normaliza vectorialmente, pondera, calcula distancias a solución ideal y anti-ideal, y obtiene coeficiente de cercanía 0-1.",
    steps: [
      "Extracción de métricas: efficiencyCost = blended/II, elo, II, coding, agentic, speed, context",
      "Normalización vectorial: cada columna se divide por sqrt(Σx²)",
      "Multiplicación por pesos AHP → matriz decisional ponderada",
      "Identifica solución ideal (max para benefit, min para cost) y anti-ideal (opuesto)",
      "Calcula distancia euclidiana a ideal (dBest) y a anti-ideal (dWorst) por modelo",
      "Coeficiente de cercanía C = dWorst / (dBest + dWorst) ∈ [0, 1]",
      "Ordena descendente por C → ranking final",
      "Modo MYPE adicional: umbral anti-'gratis malo' 70%",
    ],
    output: "Lista ordenada de (model, score 0-1, metrics) → top 3 son los 'winners'",
    traceability: "El disclosure 'Auditoría TOPSIS' muestra la matriz normalizada y las distancias de cada candidato.",
    icon: "BarChart3",
    color: "#68cc58",
  },
  {
    id: 5,
    name: "Explicación",
    shortName: "Explicación",
    description:
      "Genera texto en español natural explicando POR QUÉ el ganador fue elegido, citando los 3 criterios de mayor peso y detectando empates técnicos.",
    steps: [
      "Toma los 3 criterios con mayor peso AHP para la categoría+modo",
      "Para cada criterio, formatea una razón concreta con el valor real del modelo",
      "Detecta empate técnico: si |score[0] - score[1]| < 0.03 → lo menciona",
      "Selecciona plantilla según modo (MYPE/Calidad/Equilibrado/Solo Gratis)",
      "Compone oración natural: 'Para la tarea X clasificada como Y, en modo Z, A es la mejor opción...'",
    ],
    output: "Texto de 2-3 oraciones en español + 3 razones bullet para el ganador",
    traceability: "El banner superior del recomendador muestra la explicación completa generada.",
    icon: "MessageSquare",
    color: "#4ea7fc",
  },
];
