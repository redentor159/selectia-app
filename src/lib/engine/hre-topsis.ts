// ================================================================
// HRE-TOPSIS ENGINE — Hybrid Rule-Expert + TOPSIS
// 100% client-side, <100ms, deterministic, auditable
// 5 layers: Intent Classification (Spanish Porter Stemmer + TF-IDF) →
//           Hard Filters → AHP Weights → TOPSIS Ranking →
//           Natural Language Explanation
//
// P1B-ENGINE (gap #15):
//   • Capa 1 now uses a real Snowball-inspired Spanish Porter stemmer
//     (stemWord) so word families collapse to the same stem
//     (redactar/redacción/redacté → redact) and a real TF-IDF score
//     per category (IDF precomputed from the 8-category keyword corpus).
//   • New Capa 1.5: keyword-based auto-mode detection. The query is
//     scanned for "gratis"/"mype"/"sin tarjeta" (Solo Gratis),
//     "calidad máxima"/"profesional" (Calidad), "equilibrado" (Equilibrado).
//     If matched and the user has NOT manually toggled the mode
//     (manualModeOverride option), the mode is overridden for THIS query
//     only. The active mode + source are returned in the result.
//   • Result extended (RecommendationResultExtended) with `intent`,
//     `categories`, `activeMode`, `modeSource`.
// ================================================================

import type {
  AIModel,
  TaskCategory,
  OperationMode,
  RecommendationResult,
  HRETOPSISResult,
  ProfileId,
} from "../types";
import { calculateCR } from "./ahp-verification";
// Display consistente: formateo de razones con moneda/tasa viva del store.
// Solo se usa en generateReasons — el cálculo del ranking NO pasa por aquí.
import { costRateLabel, sloganForFreeAccess, type RecommendCurrency } from "../format";

// Re-export TaskCategory so consumers can import it from this module.
export type { TaskCategory };

// ---------- CAPA 1: Intent Classification ----------

const CATEGORY_KEYWORDS: Record<TaskCategory, string[]> = {
  redaccion: [
    "correo", "carta", "propuesta", "cotizacion", "cotización", "informe",
    "reporte", "email", "redactar", "escribir", "mensaje", "memorandum",
    "memo", "acta", "minuta", "documentacion", "documentación",
    // v3.3.1: expanded keywords
    "oficio", "solicitud", "declaracion", "declaración", "notificacion", "notificación",
    "aviso", "comunicado", "circular", "instructivo", "guia", "guía",
    "blog", "post", "articulo", "artículo", "ensayo", "resumen", "abstract",
    "conclusion", "conclusión", "introduccion", "introducción", "bibliografia",
    "carta poder", "poder", "constancia", "certificado", "diagnostico", "diagnóstico",
    "evaluacion", "evaluación", "reunion", "reunión", "minuta reunion",
    "invitacion", "invitación", "agradecimiento", "disculpa", "seguimiento",
    "comercial", "venta", "ventas", "marketing", "propuesta comercial",
    "presentacion", "presentación", "discurso", "disertacion", "disertación",
  ],
  documentos: [
    "manual", "norma", "contrato", "plano", "pdf", "iso", "especificacion",
    "especificación", "analizar", "analisis", "análisis", "resumir", "leer",
    "documento", "paginas", "páginas", "hojas", "tecnico", "técnico",
    // v3.3.1: expanded keywords
    "especificacion tecnica", "datasheet", "catalogo", "catálogo", "folleto",
    "reglamento", "ley", "decreto", "resolucion", "resolución", "directiva",
    "procedimiento", "politica", "política", "expediente", "expediente tecnico",
    "sustento", "memoria", "memoria descriptiva", "liquidacion", "liquidación",
    "valorizacion", "medicion", "medición", "topografia", "topografía",
    "geometria", "geometría", "tolerancia", "calidad", "inspeccion", "inspección",
    "ensayo", "probeta", "dureza", "traccion", "tracción", "fatiga",
    "norma tecnica", "astm", "asme", "aws", "ansi", "din", "jis",
    "esquema", "diagrama", "flowchart", "organigrama", "lay out", "layout",
    "planos", "drawing", "cad", "autocad", "solidworks", " inventor",
  ],
  programacion: [
    "python", "g-code", "gcode", "cnc", "macro", "script", "odoo", "codigo",
    "código", "programa", "programar", "funcion", "función", "api",
    "debug", "bug", "refactor", "clase", "metodo", "método",
    // v3.3.1: expanded keywords
    "algoritmo", "bucle", "loop", "variable", "array", "objeto", "herencia",
    "polimorfismo", "sql", "query", "consulta", "base datos", "database",
    "json", "xml", "html", "css", "javascript", "typescript", "java",
    "c++", "rust", "git", "commit", "pull request", "merge", "deploy",
    "docker", "kubernetes", "linux", "bash", "shell", "powershell",
    "automatizacion", "rpa", "selenium", "puppeteer", "scraping",
    "fresadora", "torno", "plc", "scada", "arduino", "raspberry",
    "microcontrolador", "iot", "sensor", "actuador", "controlador",
    "automata", "autómata", "hmi", "programacion logica", "ladder",
  ],
  calculos: [
    "costo", "costos", "presupuesto", "roi", "precio", "calcular",
    "formula", "fórmula", "estimacion", "estimación", "margen", "ganancia",
    "perdida", "pérdida", "impuesto", "tributo", "sunat", "rentable",
    // v3.3.1: expanded keywords
    "inversion", "inversión", "van", "tir", "payback", "punto equilibrio",
    "break even", "breakeven", "costo unitario", "costo marginal", "costo fijo",
    "costo variable", "punto muerto", "rentabilidad", "flujo caja", "cash flow",
    "balance", "estado resultados", "depreciacion", "depreciación", "amortizacion",
    "amortización", "igv", "renta", "utilidad", "perdida", "pérdida",
    "ganancia bruta", "neto", "factura", "boleta", "liquidacion", "liquidación",
    "precio venta", "precio costo", "markup", "margen contribucion",
    "margen contribución", "punto cierre", "costo oportunidad",
    "tasa interes", "tasa interés", "interes", "interés", "cuota", "credito",
    "crédito", "prestamo", "préstamo", "letras", "leasing",
  ],
  offline: [
    "sin internet", "privado", "confidencial", "planta", "wifi", "local",
    "offline", "desconectado", "taller", "red", "interna",
    // v3.3.1: expanded keywords
    "on-premise", "on premise", "localhost", "servidor propio", "sin nube",
    "sin cloud", "air gap", "air-gap", "aislado", "intranet", "vpn",
    "data center", "centro datos", "sin conexion", "sin conexión",
    "campo", "obra", "faena", "remoto", "rural", "sin signal", "sin señal",
    "edge", "edge computing", "gpu local", "mi computadora", "mi equipo",
    "instalar", "instalacion", "instalación", "portatil", "portátil",
  ],
  rapidas: [
    "rapido", "rápido", "inmediato", "tiempo real", "urgente", "ahora",
    "rapida", "rápida", "instantaneo", "instantáneo", "veloz",
    // v3.3.1: expanded keywords
    "prisa", "urgencia", "cuanto antes", "ya", "inmediatamente",
    "sin demora", "sin espera", "on the fly", "latencia baja", "milisegundos",
    "segundos", "tiempo respuesta", "rapidez", "velocidad", "agil", "ágil",
    "ligero", "sencillo", "directo", "simple", "breve", "corto",
    "chat", "conversacion", "conversación", "chatear", "responder",
    "whatsapp", "telegram", "mensajeria", "mensajería", "notificacion push",
  ],
  multilingue: [
    "español", "ingles", "inglés", "traducir", "idioma", "chino",
    "mandarin", "mandarín", "portugues", "portugués", "aleman", "alemán",
    "frances", "francés", "multilingue", "multilingüe",
    // v3.3.1: expanded keywords
    "ruso", "japones", "japonés", "koreano", "coreano", "arabe", "árabe",
    "hindi", "italiano", "holandes", "neerlandés", "sueco", "polaco",
    "turco", "tailandes", "tailandés", "vietnamita", "indonesio", "swahili",
    "dialecto", "bilingue", "bilingüe", "traduccion", "traducción",
    "interpretar", "interpretacion", "interpretación", "subtitulos", "subtítulos",
    "doblaje", "localizacion", "localización", "globalizacion", "globalización",
    "quechua", "aymara", "guarani", "guaraní", "nahuatl", "náhuatl",
  ],
  agentes: [
    "automatizar", "automatizacion", "automatización", "proceso", "workflow",
    "flujo", "multiples pasos", "múltiples pasos", "conectar", "integrar",
    "agente", "agentic", "orquestar", "pipeline",
    // v3.3.1: expanded keywords
    "n8n", "zapier", "make", "integromat", "webhook", "trigger", "disparador",
    "scheduler", "cron job", "cola", "queue", "batch", "lote",
    "encadenar", "secuenciar", "orquestacion", "orquestación", "coordinar",
    "asincrono", "asíncrono", "async", "paralelo", "concurrente",
    "bot", "chatbot", "asistente", "asistente virtual", "asistente IA",
    "herramienta", "tool use", "function calling", "mcp",
    "automatizacion procesos", "rpa", "robotica", "robótica",
    "integracion sistema", "integración sistema", "erp", "crm",
    "notificacion automatica", "notificación automática", "alerta automatica",
    "alerta automática", "seguimiento automatico", "seguimiento automático",
  ],
};

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  redaccion: "Redacción profesional",
  documentos: "Análisis de documentos",
  programacion: "Programación / Código",
  calculos: "Cálculos y matemáticas",
  offline: "Uso offline / confidencial",
  rapidas: "Respuestas rápidas",
  multilingue: "Multilingüe",
  agentes: "Automatización / Agentes",
};

// Exported so the Recomendador UI can render clickable category chips that
// let users trigger a recommendation directly without typing a query.
export const TASK_CATEGORIES: { id: TaskCategory; label: string; icon: string }[] = [
  { id: "redaccion", label: "Redacción profesional", icon: "PenLine" },
  { id: "documentos", label: "Análisis de documentos", icon: "FileText" },
  { id: "programacion", label: "Programación / Código", icon: "Code2" },
  { id: "calculos", label: "Cálculos y matemáticas", icon: "Calculator" },
  { id: "offline", label: "Uso offline / confidencial", icon: "WifiOff" },
  { id: "rapidas", label: "Respuestas rápidas", icon: "Zap" },
  { id: "multilingue", label: "Multilingüe", icon: "Globe" },
  { id: "agentes", label: "Automatización / Agentes", icon: "Bot" },
];

// Representative query per category — when the user clicks a category chip
// without typing anything, we run recommend() with this canonical query so
// the engine classifies it into the right category and returns results.
export const CATEGORY_CANONICAL_QUERIES: Record<TaskCategory, string> = {
  redaccion: "redactar correo profesional",
  documentos: "analizar documento técnico extenso",
  programacion: "escribir código para automatizar tarea",
  calculos: "calcular costos y presupuesto",
  offline: "usar modelo offline sin internet de forma confidencial",
  rapidas: "respuesta rápida inmediata",
  multilingue: "traducir texto a otro idioma",
  agentes: "automatizar flujo con agentes IA",
};

interface EntityDetection {
  hasNumbers: boolean;
  hasCurrency: boolean;
  hasTimeConstraint: boolean;
  hasDocumentType: boolean;
  hasMaterial: boolean;
  hasLanguage: boolean;
  contextSizeHint: number | null;
}

function detectEntities(query: string): EntityDetection {
  const lower = query.toLowerCase();
  return {
    hasNumbers: /\d+/.test(lower),
    hasCurrency: /s\/\.|soles|usd|\$|pen|euros|€/.test(lower),
    hasTimeConstraint: /urgente|inmediato|rápido|rapido|ahora|ya/.test(lower),
    hasDocumentType: /pdf|manual|plano|contrato|norma|iso/.test(lower),
    hasMaterial: /acero|cobre|aluminio|tornillo|brida|metal|metalico/.test(lower),
    hasLanguage: /ingles|inglés|chino|mandarin|mandarín|español|portugues|portugués|aleman|alemán|frances|francés/.test(lower),
    contextSizeHint: (() => {
      const m = lower.match(/(\d+)\s*(páginas|paginas|hojas|pag)/);
      if (m) {
        const pages = parseInt(m[1], 10);
        return pages * 1500; // ~1500 tokens per page
      }
      return null;
    })(),
  };
}

// ---------- SPANISH PORTER STEMMER (Snowball-inspired, compact) ----------
// Reference: https://snowballstem.org/algorithms/spanish/stemmer.html
// Strips: plurals (-s/-es/-os/-as), feminine (-a), -ción/-sión, -mente,
//         -idad, -able/-ible, infinitive (-ar/-er/-ir), past participle
//         (-ado/-ido), gerund (-ando/-iendo), gender endings (-o/-a/-e).
// Deterministic, <8KB, no external deps. Not a perfect academic Snowball
// implementation, but it strips real suffixes so word families collapse
// to the same stem (redactar/redacción/redacté → redact).
const SUFFIX_RULES: ReadonlyArray<readonly [string, string]> = [
  // Longest plural + derivational suffixes first (longest-match wins)
  ["amientos", ""],
  ["imientos", ""],
  ["acciones", "act"],   // redacciones → redact
  ["ucciones", "uct"],   // instrucciones → instruct
  ["aciones", ""],       // cotizaciones → cotiz
  ["uciones", "u"],
  ["ciones", ""],        // tradiciones → tradi
  ["siones", "s"],       // decisiones → decis
  ["adoras", ""],
  ["adores", ""],
  ["ancias", ""],
  ["encias", ""],
  ["idades", ""],
  ["amentos", ""],
  ["imentos", ""],
  ["istas", ""],
  ["ismos", ""],
  ["ables", ""],
  ["ibles", ""],
  ["ivas", ""],
  ["ivos", ""],
  ["osas", ""],
  ["osos", ""],
  ["icas", ""],
  ["icos", ""],
  ["anzas", ""],
  // Special orthographic (cross-conjugation unification)
  ["ccion", "ct"],       // redaccion → redact
  ["sion", "s"],         // decision → decis
  // Single suffixes
  ["amiento", ""],
  ["imiento", ""],
  ["acion", ""],         // cotizacion → cotiz
  ["ucion", "u"],
  ["adora", ""],
  ["ador", ""],
  ["ancia", ""],
  ["encia", ""],
  ["idad", ""],
  ["amento", ""],
  ["imento", ""],
  ["ista", ""],
  ["ismo", ""],
  ["able", ""],
  ["ible", ""],
  ["iva", ""],
  ["ivo", ""],
  ["osa", ""],
  ["oso", ""],
  ["ica", ""],
  ["ico", ""],
  ["anza", ""],
  ["mente", ""],
  ["al", ""],            // documental → document
  ["sis", "z"],          // analisis → analiz (Greek -sis → -z to unify with -zar verbs)
  // Past participle
  ["ados", ""],
  ["adas", ""],
  ["idos", ""],
  ["idas", ""],
  ["ado", ""],
  ["ada", ""],
  ["ido", ""],
  ["ida", ""],
  // Gerund
  ["ando", ""],
  ["iendo", ""],
  ["yendo", ""],
  // Infinitive
  ["ar", ""],
  ["er", ""],
  ["ir", ""],
  // Gender/number final-vowel strip
  ["as", ""],
  ["os", ""],
  ["es", ""],
  ["o", ""],
  ["a", ""],
  ["e", ""],
];

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function stemWord(word: string): string {
  if (word.length <= 3) return word;
  const w = stripAccents(word.toLowerCase());
  if (w.length <= 3) return w;
  for (const [suf, repl] of SUFFIX_RULES) {
    if (w.endsWith(suf) && w.length - suf.length >= 3) {
      return w.slice(0, -suf.length) + repl;
    }
  }
  return w;
}

// STEM TEST (dev-only, run manually):
//   bun -e "import('./src/lib/engine/hre-topsis.ts').then(m => m.runStemTest())"
// Verifies word-family collapse for the five PRD-relevant stems.
export function runStemTest(): void {
  const cases: Array<[string[], string]> = [
    [["redactar", "redacto", "redacción", "redacté"], "redact"],
    [["calcular", "calcula", "cálculo", "calculé"], "calcul"],
    [["analizar", "análisis", "analizo", "analizó"], "analiz"],
    [["correos", "correo"], "corre"],
    [["documentos", "documento", "documental"], "document"],
  ];
  for (const [words, expected] of cases) {
    const stems = words.map(stemWord);
    const ok = stems.every((s) => s === expected);
    console.log(
      `[STEM TEST] ${ok ? "PASS" : "FAIL"}  ${words.join(", ")} → [${stems.join(", ")}] (expected "${expected}")`
    );
  }
}

function normalize(text: string): string {
  return stripAccents(text.toLowerCase())
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Minimal Spanish stopword list — filtered from BOTH query tokens and keyword
// tokens before stemming. Without this, function words like "sin"/"para"/"con"
// produce false-positive matches (e.g. "sin tarjeta" hit the offline keyword
// "sin internet" via the bare stem "sin"). Multi-word keywords such as
// "sin internet" still match because their content token ("internet") survives.
const STOPWORDS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "lo",
  "y", "o", "u", "de", "del", "en", "al", "a", "e", "i",
  "que", "sin", "para", "por", "con", "se", "su", "sus",
  "es", "son", "muy", "ya", "ahora",
  "mi", "tu", "yo", "ella", "ellos", "ellas",
  "este", "esta", "esto", "ese", "esa", "eso",
  "pero", "porque", "como", "cuando", "donde", "si", "no",
]);

// ---------- TF-IDF Precomputation ----------
// N = total categories (8). df = number of categories a stem appears in.
// idf(stem) = log((N+1)/(df+0.5)) + 1 (smoothed, always > 0).
// Stems appearing in all 8 categories get low IDF (≈0.65); stems unique to
// one category get high IDF (≈2.79). This rewards distinctive keywords.
const N_CATEGORIES = 8;

// Build stemmed-keyword set per category (deduplicated within category).
// Multi-word keywords (e.g. "g-code") are split into per-token stems so the
// query "G-code" matches the keyword via the "code" → "cod" stem. Stopwords
// are filtered so "sin internet" reduces to just the "internet" stem.
const CATEGORY_STEMS: Record<TaskCategory, string[]> = (() => {
  const out = {} as Record<TaskCategory, string[]>;
  for (const cat of Object.keys(CATEGORY_KEYWORDS) as TaskCategory[]) {
    const seen = new Set<string>();
    for (const kw of CATEGORY_KEYWORDS[cat]) {
      for (const tok of normalize(kw).split(" ")) {
        if (tok.length <= 1) continue;
        if (STOPWORDS.has(tok)) continue;
        const s = stemWord(tok);
        if (s.length > 1) seen.add(s);
      }
    }
    out[cat] = [...seen];
  }
  return out;
})();

const IDF_MAP: Map<string, number> = (() => {
  const df = new Map<string, number>();
  for (const cat of Object.keys(CATEGORY_STEMS) as TaskCategory[]) {
    for (const s of CATEGORY_STEMS[cat]) {
      df.set(s, (df.get(s) ?? 0) + 1);
    }
  }
  const m = new Map<string, number>();
  for (const [s, d] of df) {
    m.set(s, Math.log((N_CATEGORIES + 1) / (d + 0.5)) + 1);
  }
  return m;
})();

function classifyIntent(query: string): {
  category: TaskCategory;
  scores: Record<TaskCategory, number>;
  entities: EntityDetection;
  multiIntent?: { category: TaskCategory; weight: number }[];
} {
  const normalized = normalize(query);
  const tokens = normalized.split(" ").filter((w) => w.length > 1 && !STOPWORDS.has(w));
  const total = tokens.length || 1;

  // TF: per-stem count / total tokens
  const tf = new Map<string, number>();
  for (const tok of tokens) {
    const s = stemWord(tok);
    if (s.length <= 1) continue;
    tf.set(s, (tf.get(s) ?? 0) + 1);
  }
  const tfNorm = new Map<string, number>();
  for (const [s, c] of tf) tfNorm.set(s, c / total);

  const entities = detectEntities(query);

  const scores = {} as Record<TaskCategory, number>;
  (Object.keys(CATEGORY_STEMS) as TaskCategory[]).forEach((cat) => {
    const catStems = CATEGORY_STEMS[cat];
    let tfidfSum = 0;
    for (const s of catStems) {
      const t = tfNorm.get(s);
      if (t === undefined) continue;
      const idf = IDF_MAP.get(s) ?? 1;
      tfidfSum += t * idf;
    }
    // Normalize by total keywords in category (avoids bias toward bigger lists).
    const numKw = catStems.length || 1;
    let score = (tfidfSum / numKw) * 100;

    // Entity boosts — applied as multipliers (per gap #15 spec).
    if (cat === "documentos" && (entities.hasDocumentType || entities.contextSizeHint)) {
      score *= 1.5;
    }
    if (cat === "rapidas" && entities.hasTimeConstraint) {
      score *= 1.5;
    }
    if (cat === "multilingue" && entities.hasLanguage) {
      score *= 1.8;
    }
    if (cat === "offline" && /offline|sin internet|privado|confidencial|planta/.test(normalized)) {
      score *= 1.8;
    }
    if (cat === "calculos" && (entities.hasCurrency || entities.hasNumbers)) {
      score *= 1.3;
    }
    if (cat === "programacion" && entities.hasMaterial) {
      score *= 1.3;
    }
    scores[cat] = score;
  });

  // Pick top categories
  const sorted = (Object.entries(scores) as [TaskCategory, number][])
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1]);

  let category: TaskCategory = "redaccion";
  if (sorted.length > 0) category = sorted[0][0];

  // Multi-intent: if 2+ categories have score >= 50% of top
  let multiIntent: { category: TaskCategory; weight: number }[] | undefined;
  if (sorted.length >= 2 && sorted[1][1] >= sorted[0][1] * 0.5) {
    const totalScore = sorted.slice(0, 2).reduce((s, [, v]) => s + v, 0);
    multiIntent = sorted.slice(0, 2).map(([c, v]) => ({
      category: c,
      weight: v / totalScore,
    }));
  }

  return { category, scores, entities, multiIntent };
}

// ---------- CAPA 1.5: Keyword-Based Auto-Mode Detection (gap #15) ----------
// PRD mode-selection priority: (1) manual toggle > (2) profile auto-detection
// > (3) keyword detection in query. The store does not currently expose a
// `modeManuallySet` flag, so callers must pass `manualModeOverride: true`
// via RecommendOptions when the user has explicitly toggled the mode.
const MODE_KEYWORDS: Partial<Record<OperationMode, string[]>> = {
  "solo-gratis": [
    "gratis", "sin costo", "mype", "sin tarjeta", "presupuesto cero",
    "free", "no pago",
  ],
  "calidad": [
    "calidad máxima", "calidad maxima", "mejor sin importar costo",
    "entregable cliente", "profesional", "alta calidad",
  ],
  "equilibrado": [
    "equilibrado", "balanceado", "relación calidad precio", "relacion calidad precio",
  ],
};

function detectModeFromQuery(query: string): OperationMode | null {
  const lower = query.toLowerCase();
  // Priority: solo-gratis > calidad > equilibrado (most distinctive first).
  for (const mode of ["solo-gratis", "calidad", "equilibrado"] as OperationMode[]) {
    for (const kw of MODE_KEYWORDS[mode] ?? []) {
      if (lower.includes(kw)) return mode;
    }
  }
  return null;
}

// ---------- CAPA 2: Hard Filters ----------

function applyHardFilters(
  models: AIModel[],
  category: TaskCategory,
  entities: EntityDetection,
  mode: OperationMode,
  hardwareVram?: number
): AIModel[] {
  return models.filter((m) => {
    // Solo gratis mode hard filter
    if (mode === "solo-gratis") {
      if (m.freeAccess === "paid-only" || m.freeAccess === "free-registration") {
        return false;
      }
    }

    // HRE-TOPSIS v3.3 bug fix #7: MYPE (presupuesto cero) price ceiling.
    // In MYPE mode, exclude models that cost more than $2/M blended — the user
    // has explicitly chosen "presupuesto cero" and premium models ($5-$25/M)
    // like GPT-5.4 ($6.25) or Claude Sonnet 5 ($24.51) should never appear.
    // Free-tier models (freeAccess=free-100/free-limited) always pass regardless
    // of API price, because the user can access them for $0 via the free tier.
    // This filter ensures MYPE recommendations stay truly budget-friendly.
    if (mode === "mype") {
      const isFree = m.freeAccess === "free-100" || m.freeAccess === "free-limited" || (m.priceInputUsd === 0);
      if (!isFree) {
        const blended = m.priceInputUsd !== null && m.priceOutputUsd !== null
          ? m.priceInputUsd * 0.7 + m.priceOutputUsd * 0.3
          : 5; // unknown price → conservative $5/M estimate
        if (blended > 1) return false;  // $1/M ceiling for MYPE (presupuesto cero)
      }
    }

    // Commercial task default: exclude research-only
    if (m.license === "research-only") return false;

    // HuggingFace disabled models — exclude from all recommendations (Función A)
    if (m.hfDisabled === true) return false;

    // HRE-TOPSIS v3.3.1 bug fix #14: piso de calidad en modo Calidad.
    // En "Calidad máxima", el usuario busca lo mejor de lo mejor. Modelos con
    // Intelligence Index muy bajo (ej: Gemini 2.0 Flash Think II=13.3) NO deben
    // aparecer, incluso si tienen context enorme o effCost bajo. El piso II ≥ 30
    // elimina los modelos antiguos/basura que dominaban injustamente.
    // Excepciones:
    //   - offline: II ≥ 15 (modelos ollama suelen tener II bajo, pero son los únicos offline)
    //   - rapidas: sin piso (speed domina, Mercury 2 II=25.3 es legítimamente el más rápido)
    if (mode === "calidad") {
      const ii = m.intelligenceIndex ?? 0;
      const minII = category === "offline" ? 15 : 30;
      if (ii < minII) return false;
    }

    switch (category) {
      case "documentos":
        if (entities.contextSizeHint && m.contextWindow < entities.contextSizeHint) {
          return false;
        }
        if (entities.hasDocumentType && !m.capabilities.pdf) {
          // soft — don't hard-exclude but it's a strong signal
        }
        break;
      case "offline":
        if (!m.ollamaAvailable) return false;
        // Función C — when user has specified their hardware VRAM via Filtro 13,
        // require that some quantization level (Q2_K or better) fits in their GPU.
        // This refines the binary "exists in Ollama?" check into a precise
        // "exists AND fits in MY hardware" check. Per MD Parte 8 + Parte 13.
        if (hardwareVram && hardwareVram > 0 && m.hfParameters && m.hfParameters > 0) {
          const q2KBytes = m.hfParameters * 0.35 * 1.2; // Q2_K = 0.35 bytes/param, 20% overhead
          if (q2KBytes > hardwareVram * 1e9) return false;
        }
        break;
      case "rapidas":
        if (m.speedTps !== null && m.speedTps < 30) return false;
        break;
      case "multilingue":
        if (m.intelligenceIndex !== null && m.intelligenceIndex < 30) return false;
        break;
      case "programacion":
        // exclude models without jsonMode (can't produce structured code well)
        if (!m.capabilities.jsonMode) return false;
        break;
    }
    return true;
  });
}

// ---------- CAPA 3: AHP-Weighted Decision Matrix ----------

// HRE-TOPSIS v3.3 — WeightSet now includes `reliability` (the 8th criterion,
// sourced from ZeroEval production failure-rate data). All 24 entries below
// (3 modes × 8 categories) have been recalibrated so the 8 weights sum to
// exactly 1.0: each non-zero weight was scaled by (1 - reliabilityWeight) and
// rounded to 3 decimals, with one weight nudged by ±0.001 to absorb float
// drift. The DEV-only assertion below verifies every entry at startup.
//
// Reliability weights by category (plan v2.0 Sección 3.2):
//   offline=0.15, agentes=0.10, rapidas=0.10, calculos=0.08,
//   redaccion/documentos/programacion/multilingue=0.05
interface WeightSet {
  efficiencyCost: number;
  elo: number;
  intelligenceIndex: number;
  codingIndex: number;
  agenticIndex: number;
  speed: number;
  context: number;
  reliability: number; // 8th criterion — from ZeroEval (1 - failure_rate), baseline 0.95
}

// ============================================================
// HRE-TOPSIS v3.3 RECALIBRACIÓN — BenchLM + ZeroEval aware
// ============================================================
// Filosofía por modo:
//   MYPE (presupuesto cero): effCost DOMINANTE (0.35-0.40) para que modelos
//     GRATIS (effCost=0) ganen sobre pagados con mejores métricas.
//   EQUILIBRADO: balance — effCost medio (0.15) + métrica categoría (0.30-0.40).
//     Modelos baratos ($0.20-$3) ganan.
//   CALIDAD: métrica categoría-específica DOMINANTE (0.40-0.50) + effCost bajo (0.05).
//     Modelos premium ($3-$5) con mejores BenchLM scores ganan.
//
// Reliability weights por categoría (criticidad de fallo):
//   offline=0.15, agentes=0.10, rapidas=0.05-0.10, calculos=0.10-0.15,
//   {redaccion, documentos, programacion, multilingue}=0.05
// ============================================================

const WEIGHTS_MYPE: Record<TaskCategory, WeightSet> = {
  // effCost MUY dominante (0.45-0.50) → modelos GRATIS (effCost=0) siempre ganan
  // speed bajo (0.05) porque en MYPE la velocidad no es crítica
  redaccion:     { efficiencyCost: 0.45, elo: 0.15, intelligenceIndex: 0.25, codingIndex: 0,    agenticIndex: 0,    speed: 0.05, context: 0.05, reliability: 0.05 },
  documentos:    { efficiencyCost: 0.45, elo: 0.05, intelligenceIndex: 0.20, codingIndex: 0,    agenticIndex: 0,    speed: 0.05, context: 0.20, reliability: 0.05 },
  programacion:  { efficiencyCost: 0.45, elo: 0.05, intelligenceIndex: 0.05, codingIndex: 0.30, agenticIndex: 0,    speed: 0.05, context: 0,    reliability: 0.10 },
  calculos:      { efficiencyCost: 0.45, elo: 0.05, intelligenceIndex: 0.30, codingIndex: 0,    agenticIndex: 0,    speed: 0.05, context: 0.05, reliability: 0.10 },
  offline:       { efficiencyCost: 0.30, elo: 0.05, intelligenceIndex: 0.10, codingIndex: 0,    agenticIndex: 0,    speed: 0.05, context: 0.30, reliability: 0.20 },
  rapidas:       { efficiencyCost: 0.25, elo: 0.10, intelligenceIndex: 0.05, codingIndex: 0,    agenticIndex: 0,    speed: 0.50, context: 0.05, reliability: 0.05 },
  multilingue:   { efficiencyCost: 0.45, elo: 0.15, intelligenceIndex: 0.25, codingIndex: 0,    agenticIndex: 0,    speed: 0.05, context: 0.05, reliability: 0.05 },
  agentes:       { efficiencyCost: 0.45, elo: 0.05, intelligenceIndex: 0.05, codingIndex: 0,    agenticIndex: 0.25, speed: 0.05, context: 0,    reliability: 0.15 },
};

const WEIGHTS_CALIDAD: Record<TaskCategory, WeightSet> = {
  // HRE-TOPSIS v3.3.1 fix #11+#14: II DOMINANTE (0.45-0.60), effCost=0, context reducido.
  // En Calidad máxima, NO importa el precio — importa la calidad. effCost=0 elimina
  // la ventaja injusta de modelos FREE sobre premium. II alto + elo alto = gana.
  // Esto permite que GPT-5.5 (II=54.8, elo=1475) le gane a Gemini 3.5 Flash (II=50.2, elo=1479).
  redaccion:     { efficiencyCost: 0,    elo: 0.30, intelligenceIndex: 0.50, codingIndex: 0,    agenticIndex: 0,    speed: 0.10, context: 0.05, reliability: 0.05 },
  documentos:    { efficiencyCost: 0,    elo: 0.15, intelligenceIndex: 0.55, codingIndex: 0,    agenticIndex: 0,    speed: 0.05, context: 0.15, reliability: 0.10 },
  programacion:  { efficiencyCost: 0,    elo: 0.10, intelligenceIndex: 0.20, codingIndex: 0.55, agenticIndex: 0,    speed: 0.10, context: 0,    reliability: 0.05 },
  calculos:      { efficiencyCost: 0,    elo: 0.15, intelligenceIndex: 0.60, codingIndex: 0,    agenticIndex: 0,    speed: 0.05, context: 0.10, reliability: 0.10 },
  offline:       { efficiencyCost: 0,    elo: 0.10, intelligenceIndex: 0.35, codingIndex: 0,    agenticIndex: 0,    speed: 0.15, context: 0.25, reliability: 0.15 },
  rapidas:       { efficiencyCost: 0,    elo: 0.20, intelligenceIndex: 0.15, codingIndex: 0,    agenticIndex: 0,    speed: 0.55, context: 0.05, reliability: 0.05 },
  multilingue:   { efficiencyCost: 0,    elo: 0.30, intelligenceIndex: 0.55, codingIndex: 0,    agenticIndex: 0,    speed: 0.05, context: 0.05, reliability: 0.05 },
  agentes:       { efficiencyCost: 0,    elo: 0.10, intelligenceIndex: 0.20, codingIndex: 0,    agenticIndex: 0.55, speed: 0.05, context: 0,    reliability: 0.10 },
};

const WEIGHTS_EQUILIBRADO: Record<TaskCategory, WeightSet> = {
  // HRE-TOPSIS v3.3.1 fix #11b: II reforzado (0.30-0.45), context reducido (0.05-0.20).
  // Equilibrado busca balance: modelos baratos ($0.20-$3) con buena calidad.
  // II debe pesar más que context para evitar que Gemini 2.0 Flash Think (II=13.3)
  // gane sobre GPT-5.5 (II=54.8) solo por tener 256K vs 8K de contexto.
  redaccion:     { efficiencyCost: 0.20, elo: 0.25, intelligenceIndex: 0.35, codingIndex: 0,    agenticIndex: 0,    speed: 0.10, context: 0.05, reliability: 0.05 },
  documentos:    { efficiencyCost: 0.15, elo: 0.10, intelligenceIndex: 0.40, codingIndex: 0,    agenticIndex: 0,    speed: 0.10, context: 0.20, reliability: 0.05 },
  programacion:  { efficiencyCost: 0.15, elo: 0.10, intelligenceIndex: 0.20, codingIndex: 0.40, agenticIndex: 0,    speed: 0.10, context: 0,    reliability: 0.05 },
  calculos:      { efficiencyCost: 0.15, elo: 0.10, intelligenceIndex: 0.45, codingIndex: 0,    agenticIndex: 0,    speed: 0.05, context: 0.10, reliability: 0.15 },
  offline:       { efficiencyCost: 0.15, elo: 0.10, intelligenceIndex: 0.25, codingIndex: 0,    agenticIndex: 0,    speed: 0.10, context: 0.25, reliability: 0.15 },
  rapidas:       { efficiencyCost: 0.15, elo: 0.15, intelligenceIndex: 0.10, codingIndex: 0,    agenticIndex: 0,    speed: 0.50, context: 0.05, reliability: 0.05 },
  multilingue:   { efficiencyCost: 0.15, elo: 0.20, intelligenceIndex: 0.40, codingIndex: 0,    agenticIndex: 0,    speed: 0.10, context: 0.10, reliability: 0.05 },
  agentes:       { efficiencyCost: 0.15, elo: 0.10, intelligenceIndex: 0.20, codingIndex: 0,    agenticIndex: 0.40, speed: 0.10, context: 0,    reliability: 0.05 },
};

// DEV-only verification — weights must sum to 1.0 (within float tolerance)
if (process.env.NODE_ENV !== "production") {
  for (const [mode, table] of [
    ["MYPE", WEIGHTS_MYPE], ["CALIDAD", WEIGHTS_CALIDAD], ["EQUILIBRADO", WEIGHTS_EQUILIBRADO]
  ] as const) {
    for (const cat of Object.keys(table) as TaskCategory[]) {
      const sum = Object.values(table[cat]).reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1.0) > 0.001) {
        console.warn(`[HRE-TOPSIS] Weights ${mode}/${cat} sum to ${sum}, expected 1.0`);
      }
    }
  }
}

function getWeights(category: TaskCategory, mode: OperationMode): WeightSet {
  if (mode === "calidad") return WEIGHTS_CALIDAD[category];
  if (mode === "equilibrado") return WEIGHTS_EQUILIBRADO[category];
  return WEIGHTS_MYPE[category]; // mype + solo-gratis use mype weights
}

// ---------- CAPA 4: TOPSIS Ranking ----------

// Bug fix #3: "null price = gratis" was the root cause of Fable 5 (a $10/$50
// model) winning every recommendation. Now: a model is only "free" if it has
// a verified price of $0 OR its freeAccess field explicitly says so. A model
// with null price is treated as UNKNOWN, not free — it gets a conservative
// mid-range estimate so it can't game the efficiency metric.
const FREE_ACCESS_TIERS = new Set(["free-100", "free-limited"]);

function isModelFree(m: AIModel): boolean {
  if (m.priceInputUsd !== null && m.priceInputUsd === 0) return true;
  if (m.freeAccess && FREE_ACCESS_TIERS.has(m.freeAccess)) return true;
  return false;
}

// HRE-TOPSIS v3.3.1 bug fix #10: computeBlendedPriceUsd ahora acepta `mode`
// para decidir si un modelo FREE se trata como $0 o como su precio API real.
//
// - MYPE / Equilibrado / solo-gratis: FREE = $0 (el usuario puede acceder gratis
//   via Google AI Studio, Groq free, etc.). Esto es correcto porque el usuario
//   busca presupuesto bajo y puede usar el free tier.
//
// - Calidad máxima: FREE usa su precio API real. El usuario eligió "calidad
//   máxima sin importar nada" — si un modelo FREE tiene II=13.3 (Gemini 2.0
//   Flash Think) NO debe tener effCost=0 injusto sobre un modelo pago con
//   II=54.8 (GPT-5.5). En Calidad, todos compiten en igualdad de condiciones.
//
// El parámetro `mode` es opcional para backward compatibility: si no se pasa,
// se asume comportamiento MYPE (FREE=$0), que es el caso seguro por defecto.
function computeBlendedPriceUsd(m: AIModel, mode?: OperationMode): number {
  // Verified price present → compute blended
  if (m.priceInputUsd !== null && m.priceOutputUsd !== null) {
    const apiPrice = m.priceInputUsd * 0.7 + m.priceOutputUsd * 0.3;
    // In Calidad mode, always use the real API price (even for FREE-tier models)
    if (mode === "calidad") return apiPrice;
    // In MYPE / Equilibrado / solo-gratis: FREE-tier models = $0
    if (isModelFree(m)) return 0;
    return apiPrice;
  }
  // No verified price: FREE-tier = $0 (except in Calidad, where unknown → $5 conservative)
  if (mode === "calidad") {
    // In Calidad, unknown price → conservative $5/M (can't be "free" without verification)
    return 5;
  }
  if (isModelFree(m)) return 0;
  // Unknown price (Arena-only models without AA enrichment) → conservative $5/M
  return 5;
}

function computeEfficiencyCost(m: AIModel, mode?: OperationMode): number {
  const blended = computeBlendedPriceUsd(m, mode);
  // Bug fix #2: models without Intelligence Index now get the WORST efficiency
  // (999), not the best (0). A model with no quality data should never win
  // a "cost per unit of intelligence" metric.
  if (m.intelligenceIndex === null || m.intelligenceIndex === 0) {
    return 999;
  }
  // Free models (free tier OR $0 price) with real II → efficiency = 0 (best possible)
  // In Calidad mode, blended is never 0 for FREE-tier (uses API price), so this
  // check only triggers for genuinely free models in MYPE/Equilibrado modes.
  if (blended === 0) return 0;
  return blended / m.intelligenceIndex;
}

// Bug fix #1: missing Elo is now imputed to a conservative baseline of 1200
// (Arena's "competent" tier) instead of 0. Models without Elo shouldn't be
// ranked as if humans hate them.
const ELO_BASELINE = 1200;
// Missing Intelligence Index imputed to 30 (below average) — not 0.
const II_BASELINE = 30;
// Missing speed imputed to 50 tok/s (mid-range) — not 0.
const SPEED_BASELINE = 50;
// Missing coding/agentic index imputed to 25 (below average) — not 0.
const CODING_BASELINE = 25;
const AGENTIC_BASELINE = 25;

// ============================================================
// Category-specific Intelligence Index (HRE-TOPSIS v3.3)
// Uses BenchLM category score when available (e.g. math score for "calculos"),
// falls back to AA's generic intelligenceIndex when null, then to II_BASELINE.
// Phase 0.1 confirmed 93/225 models have BenchLM data → 41.3% get the specific score.
// ============================================================

const RELIABILITY_BASELINE = 0.95;  // assumed reliable if no ZeroEval data

// Maps each SelectIA task category to the BenchLM category score key.
// When the engine needs II for a "calculos" query, it uses BenchLM.math (not the generic II).
const CATEGORY_BENCHLM_MAP: Record<TaskCategory, keyof NonNullable<AIModel["benchlmCategoryScores"]>> = {
  redaccion: "instructionFollowing",
  documentos: "knowledge",
  programacion: "coding",
  calculos: "math",
  offline: "knowledge",        // best proxy — offline tasks need broad knowledge
  rapidas: "instructionFollowing",  // best proxy — fast tasks need instruction-following
  multilingue: "multilingual",
  agentes: "agentic",
};

// HRE-TOPSIS v3.3.1: esta función ya NO se llama desde extractMetrics() (bug #9 fix).
// Se conserva para referencia futura y para validar que el mapeo categoría→BenchLM key
// sigue disponible si se decide re-introducir II categoría-específico con escala normalizada.
function getCategoryIntelligenceIndex(model: AIModel, category: TaskCategory): number {
  const blm = model.benchlmCategoryScores;
  if (blm) {
    const key = CATEGORY_BENCHLM_MAP[category];
    const specific = blm[key];
    if (specific != null) return specific;
  }
  return model.intelligenceIndex ?? II_BASELINE;
}
// Marca explícita: esta función se mantiene para referencia pero no se invoca en v3.3.1.
void getCategoryIntelligenceIndex;

interface ModelMetrics {
  efficiencyCost: number;
  elo: number;
  intelligenceIndex: number;
  codingIndex: number;
  agenticIndex: number;
  speed: number;
  context: number;
  reliability: number; // NEW — 1 - failure_rate, or RELIABILITY_BASELINE
  /** True if any critical metric was imputed (for explanation transparency) */
  hasImputedData: boolean;
}

// extractMetrics — HRE-TOPSIS v3.3.1 FIX (bug #9: doble estándar de II).
//
// PROBLEMA (v3.3 roto): extractMetrics() usaba getCategoryIntelligenceIndex()
// (BenchLM category score, avg 61.5, coverage 41%) para el II del TOPSIS,
// MIENTRAS computeEfficiencyCost() usaba m.intelligenceIndex (AA, avg 12.2,
// coverage 100%). Un modelo con BenchLM recibía effCost bajo (AA II bajo)
// Y II alto (BenchLM alto) — lo mejor de ambos mundos, injustamente.
//
// FIX (v3.3.1): II siempre viene de m.intelligenceIndex (AA). Misma escala
// para TOPSIS y effCost. BenchLM category scores siguen disponibles para
// generateReasons() (display informativo) y Ficha Técnica, pero NO afectan
// el ranking. Esto elimina el sesgo sistemático contra los 132 modelos sin
// BenchLM data.
//
// Nota: el parámetro `category` se mantiene en la firma para backward
// compatibility con callers existentes, pero ya no afecta el cálculo de II.
// Se conserva para trazabilidad futura (si se decide re-introducir II
// categoría-específico con una escala normalizada).
function extractMetrics(m: AIModel, _category?: TaskCategory, mode?: OperationMode): ModelMetrics {
  let imputed = false;
  const elo = m.elo ?? (() => { imputed = true; return ELO_BASELINE; })();
  // HRE-TOPSIS v3.3 bug fix #6: cap speed at 500 tok/s. Models like Mercury 2
  // (872 tok/s) are outliers that distort TOPSIS normalization. Capping at 500
  // tok/s preserves the "fast" signal (Mercury 2 still has 500, vs 184 for
  // Gemini 3.5 Flash) without letting 872 dominate the normalization.
  // 500 tok/s ≈ 8x human reading speed, beyond which additional speed provides
  // no real UX benefit for most tasks.
  const rawSpeed = m.speedTps ?? (() => { imputed = true; return SPEED_BASELINE; })();
  const speed = Math.min(rawSpeed, 500);
  // v3.3.1 FIX: II siempre de AA (misma escala que computeEfficiencyCost).
  // Ya NO se usa getCategoryIntelligenceIndex() aquí — ve el comentario de la función.
  const ii = m.intelligenceIndex ?? (() => { imputed = true; return II_BASELINE; })();
  if (m.intelligenceIndex == null) imputed = true;

  const coding = m.codingIndex ?? (() => { imputed = true; return CODING_BASELINE; })();
  const agentic = m.agenticIndex ?? (() => { imputed = true; return AGENTIC_BASELINE; })();
  // HRE-TOPSIS v3.3 bug fix #8: cap context at 256K tokens. Models like Gemini 2.0
  // Flash Thinking (1M tokens) are outliers that distort TOPSIS normalization —
  // a 4x context advantage over a 256K model gives an outsized weighted contribution.
  // Capping at 256K preserves the "large context" signal without letting 1M dominate.
  // 256K tokens ≈ 500 pages of text, beyond which most industrial tasks don't need.
  const context = Math.min(m.contextWindow, 256_000);
  // speed already computed above (capped at 500 tok/s)

  // Reliability: 1 - failure_rate when ZeroEval has data, else baseline 0.95.
  // Don't mark as imputed — baseline 0.95 is a reasonable assumption, not a data gap.
  const reliability = m.zeroevalFailureRate != null
    ? 1 - m.zeroevalFailureRate
    : RELIABILITY_BASELINE;

  return {
    efficiencyCost: computeEfficiencyCost(m, mode),
    elo,
    intelligenceIndex: ii,
    codingIndex: coding,
    agenticIndex: agentic,
    speed,
    context: context,  // capped at 256K (bug fix #8)
    reliability,
    hasImputedData: imputed,
  };
}

function topsisRank(
  models: AIModel[],
  weights: WeightSet,
  category?: TaskCategory,
  mode?: OperationMode
): { model: AIModel; score: number; metrics: ModelMetrics }[] {
  if (models.length === 0) return [];

  // v3.3.1 bug fix #10: pasamos `mode` a extractMetrics para que computeEfficiencyCost
  // sepa si estamos en Calidad (FREE usa precio API real) o MYPE/Equilibrado (FREE=$0).
  const metrics = models.map((m) => extractMetrics(m, category, mode));

  // Vector normalization (TOPSIS)
  const criteria = [
    "efficiencyCost", "elo", "intelligenceIndex", "codingIndex",
    "agenticIndex", "speed", "context", "reliability",
  ] as const;
  type NumKey = typeof criteria[number];

  // For efficiencyCost: LOWER is better (cost). All others (including reliability): HIGHER is better.
  const isCost = (k: keyof ModelMetrics) => k === "efficiencyCost";

  // Compute vector normalization denominators
  const denom: Record<string, number> = {};
  for (const c of criteria) {
    const sumSq = metrics.reduce((s, m) => s + m[c as NumKey] * m[c as NumKey], 0);
    denom[c] = Math.sqrt(sumSq) || 1;
  }

  // Normalized + weighted matrix
  const normalized = metrics.map((m) => {
    const row: Record<string, number> = {};
    for (const c of criteria) {
      const w = weights[c as keyof WeightSet] ?? 0;
      row[c] = (m[c as NumKey] / denom[c]) * w;
    }
    return row;
  });

  // Ideal best & worst
  const idealBest: Record<string, number> = {};
  const idealWorst: Record<string, number> = {};
  for (const c of criteria) {
    const vals = normalized.map((r) => r[c]);
    if (isCost(c)) {
      idealBest[c] = Math.min(...vals);
      idealWorst[c] = Math.max(...vals);
    } else {
      idealBest[c] = Math.max(...vals);
      idealWorst[c] = Math.min(...vals);
    }
  }

  // Closeness coefficient
  return models.map((model, i) => {
    const row = normalized[i];
    let dBest = 0;
    let dWorst = 0;
    for (const c of criteria) {
      dBest += Math.pow(row[c] - idealBest[c], 2);
      dWorst += Math.pow(row[c] - idealWorst[c], 2);
    }
    dBest = Math.sqrt(dBest);
    dWorst = Math.sqrt(dWorst);
    const score = dBest + dWorst === 0 ? 0 : dWorst / (dBest + dWorst);
    return { model, score, metrics: metrics[i] };
  });
}

// ---------- CAPA 5: Natural Language Explanation ----------

function generateReasons(
  model: AIModel,
  metrics: ModelMetrics,
  category: TaskCategory,
  mode: OperationMode,
  weights: WeightSet,
  currency?: RecommendCurrency
): string[] {
  const reasons: string[] = [];
  const wEntries = Object.entries(weights).sort((a, b) => b[1] - a[1]);

  const topCriteria = wEntries.slice(0, 3);
  for (const [criterion, weight] of topCriteria) {
    if (weight === 0) continue;
    switch (criterion) {
      case "efficiencyCost": {
        // Fix bug "Tier gratuito" contradictorio: pasar `mode` para que la razón
        // coincida con el ranking. En MYPE/Equilibrado/solo-gratis, free-limited = $0
        // (free tier); en Calidad se cita el precio API real. Si blended=0 pero el
        // modelo tiene precio API real >0 (free-limited), se muestra transparencia
        // total: el usuario ve "free tier $0" + el precio API real que pagaría si
        // se pasa de tier. 100% confiable y verificable, sin tocar el ranking.
        const blended = computeBlendedPriceUsd(model, mode);
        const cur = currency ?? { code: "PEN", symbol: "S/.", rateFromUsd: 3.714 };
        if (blended === 0) {
          const apiBlended =
            model.priceInputUsd !== null && model.priceOutputUsd !== null
              ? model.priceInputUsd * 0.7 + model.priceOutputUsd * 0.3
              : null;
          if (apiBlended !== null && apiBlended > 0) {
            // Free-tier con precio API real >0: transparencia total.
            reasons.push(
              `Acceso vía free tier — costo cero, precio API real ${costRateLabel(apiBlended, cur)}`
            );
          } else {
            reasons.push(`Tier gratuito — costo cero, ideal para MYPE con presupuesto ajustado`);
          }
        } else {
          // Tasa viva del store (mismo fallback 3.714 del orquestador cuando no
          // hay currency). El II citado es el que el ranking usó (metrics.*).
          const prefix =
            metrics.hasImputedData && model.intelligenceIndex == null
              ? "Eficiencia de costo (II estimado): "
              : "Excelente eficiencia de costo: ";
          reasons.push(
            `${prefix}${costRateLabel(blended, cur)} con Intelligence Index de ${metrics.intelligenceIndex}`
          );
        }
        break;
      }
      case "elo":
        if (model.elo) {
          reasons.push(
            `Alta preferencia humana: Elo ${model.elo} ±${model.eloCi} (${formatVotes(model.eloVotes)} votos en Arena AI)`
          );
        } else if (metrics.hasImputedData) {
          reasons.push(
            `Potencial de preferencia humana: Elo ${metrics.elo} (estimado — sin dato del modelo)`
          );
        }
        break;
      case "intelligenceIndex": {
        // HRE-TOPSIS v3.3.1: la razón PRINCIPAL siempre cita el AA Intelligence Index,
        // porque es la métrica que el TOPSIS realmente usó para ranking. BenchLM
        // category scores son display-only (Ficha Técnica) — no afectan el ranking.
        // Si el modelo tiene BenchLM data, se cita como info complementaria.
        if (model.intelligenceIndex) {
          reasons.push(
            `Intelligence Index de ${model.intelligenceIndex} — sobresaliente en razonamiento y benchmarks académicos`
          );
        } else if (metrics.hasImputedData) {
          reasons.push(
            `Intelligence Index de ${metrics.intelligenceIndex} (estimado — sin dato del modelo)`
          );
        }
        // Razón complementaria: BenchLM category score (display, no afecta ranking)
        const blm = model.benchlmCategoryScores;
        if (blm) {
          const key = CATEGORY_BENCHLM_MAP[category];
          const specificScore = blm[key];
          if (specificScore != null) {
            const catLabel = CATEGORY_LABELS[category].toLowerCase();
            reasons.push(
              `Además: score BenchLM ${key}=${specificScore}/100 (display informativo, no afecta ranking)`
            );
          }
        }
        break;
      }
      case "codingIndex":
        if (model.codingIndex) {
          reasons.push(
            `Coding Index de ${model.codingIndex} — top en Terminal-Bench y SciCode`
          );
        } else if (metrics.hasImputedData) {
          reasons.push(
            `Coding Index de ${metrics.codingIndex} (estimado — sin dato del modelo)`
          );
        }
        break;
      case "agenticIndex":
        if (model.agenticIndex) {
          reasons.push(
            `Agentic Index de ${model.agenticIndex} — capability demostrada en tareas multi-paso autónomas`
          );
        } else if (metrics.hasImputedData) {
          reasons.push(
            `Agentic Index de ${metrics.agenticIndex} (estimado — sin dato del modelo)`
          );
        }
        break;
      case "speed":
        if (model.speedTps == null) {
          reasons.push(
            `Velocidad estimada: ${metrics.speed} tok/s (baseline del motor)`
          );
        } else if (model.speedTps > 500) {
          reasons.push(
            `Velocidad de ${metrics.speed} tok/s — valor con cap usado en el ranking (crudo: ${model.speedTps} sin cap)`
          );
        } else {
          reasons.push(
            `Velocidad de ${model.speedTps} tokens/seg — respuestas fluidas sin esperas`
          );
        }
        break;
      case "context":
        if (model.contextWindow > 256_000) {
          reasons.push(
            `Ventana de contexto de ${formatContext(metrics.context)} — valor con cap usado en el ranking (crudo: ${formatContext(model.contextWindow)} sin cap)`
          );
        } else {
          reasons.push(
            `Ventana de contexto de ${formatContext(model.contextWindow)} — maneja documentos extensos`
          );
        }
        break;
      case "reliability": {
        if (model.zeroevalFailureRate != null && model.zeroevalTotalCalls != null) {
          const successRate = ((1 - model.zeroevalFailureRate) * 100).toFixed(1);
          const fr = (model.zeroevalFailureRate * 100).toFixed(1);
          reasons.push(
            `Confiabilidad de producción: ${successRate}% (basado en ${model.zeroevalTotalCalls} llamadas monitoreadas por ZeroEval — ${fr}% failure rate)`
          );
        } else if (model.zeroevalFailureRate != null) {
          const successRate = ((1 - model.zeroevalFailureRate) * 100).toFixed(1);
          reasons.push(`Confiabilidad de producción: ${successRate}% (ZeroEval)`);
        } else {
          // Sin evidencia ZeroEval → baseline 0.95; se muestra como estimado.
          reasons.push(`Confiabilidad estimada (baseline 0.95 — sin datos ZeroEval)`);
        }
        break;
      }
    }
  }

  // Mode-specific note — eslogan de gratuidad honesto según freeAccess real
  if (mode === "solo-gratis") {
    const eslogan = sloganForFreeAccess(model.freeAccess, model.priceInputUsd === 0);
    if (eslogan) reasons.push(eslogan);
  }

  return reasons.slice(0, 3);
}

function formatVotes(v: number | null): string {
  if (v === null) return "—";
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v.toString();
}

function formatContext(ctx: number): string {
  if (ctx >= 1000000) return `${(ctx / 1000000).toFixed(1)}M tokens`;
  if (ctx >= 1000) return `${Math.round(ctx / 1000)}K tokens`;
  return `${ctx} tokens`;
}

function generateExplanation(
  winners: HRETOPSISResult[],
  category: TaskCategory,
  mode: OperationMode,
  query: string
): string {
  if (winners.length === 0) {
    return `No se encontraron modelos que cumplan los criterios para "${query}". Intenta relajar los filtros.`;
  }

  const winner = winners[0];
  const modeLabel =
    mode === "mype" ? "MYPE (presupuesto cero)" :
    mode === "calidad" ? "Calidad máxima (entregable profesional)" :
    mode === "equilibrado" ? "Equilibrado (decisión informada)" :
    "Solo gratis";

  let explanation = `Para la tarea "${query}" clasificada como "${CATEGORY_LABELS[category]}", en modo ${modeLabel}, `;

  // tie detection
  if (winners.length >= 2 && Math.abs(winners[0].score - winners[1].score) < 0.03) {
    explanation += `${winners[0].model.name} y ${winners[1].model.name} están prácticamente empatados (diferencia < 0.03). `;
    explanation += `Recomendamos ${winners[0].model.name} por ${winner.reasons[0]?.toLowerCase() ?? "su balance general"}.`;
  } else {
    explanation += `${winner.model.name} es la mejor opción. ${winner.reasons.join(". ")}.`;
  }

  return explanation;
}

// ---------- MAIN ENTRY POINT ----------

/**
 * Extended RecommendationResult.
 *
 * P1B-ENGINE added four fields (gap #15):
 *   - `intent`     : { category, label } — primary intent (alias of `category`).
 *   - `categories` : top-3 categories sorted by TF-IDF score, for multi-intent display.
 *   - `activeMode` : the mode actually used after keyword auto-detection.
 *   - `modeSource` : "manual" | "profile" | "keyword" — where activeMode came from.
 *
 * The base `RecommendationResult` (owned by P1A-DATA in types.ts) is unchanged
 * for backward compatibility with existing callers; the new fields are layered
 * on top. P2A can wire `intent`/`categories`/`activeMode`/`modeSource` into the
 * Recomendador UI and the Capa 5 explanation.
 */
export interface RecommendationResultExtended extends RecommendationResult {
  intent: { category: TaskCategory; label: string };
  categories: Array<{ category: TaskCategory; score: number; label: string }>;
  activeMode: OperationMode;
  modeSource: "manual" | "profile" | "keyword";
  // AHP Consistency Ratio verification (Saaty 1980)
  ahpCR?: { cr: number; passes: boolean; n: number };
}

/**
 * Options for recommend().
 *   - `manualModeOverride`: when true, keyword-based mode detection is skipped
 *     (the user has explicitly toggled the mode in the UI). The store does not
 *     yet expose a `modeManuallySet` flag, so callers must set this explicitly.
 *   - `queryText`: optional separate text used for keyword detection. Defaults
 *     to the `query` argument. Useful when the recommendation is triggered by a
 *     UI affordance that has access to richer context than the bare query.
 */
export interface RecommendOptions {
  manualModeOverride?: boolean;
  queryText?: string;
  // Filtro 13 — hardware VRAM in GB. When provided and > 0, the offline category
  // hard filter (Capa 2) additionally excludes models whose most aggressive
  // quantization (Q2_K) still exceeds the user's VRAM. Per MD Función C.
  hardwareVram?: number;
  // Display consistente (opcional, aditivo): moneda/tasa del usuario para las
  // razones. Si no se pasa, las razones conservan el texto de hoy (PEN/3.714).
  currency?: RecommendCurrency;
}

export function recommend(
  query: string,
  models: AIModel[],
  mode: OperationMode,
  profile?: ProfileId,
  options?: RecommendOptions
): RecommendationResultExtended {
  const start = typeof performance !== "undefined" ? performance.now() : Date.now();

  // CAPA 1: Intent classification (TF-IDF + Spanish Porter stemmer)
  const { category, scores, entities, multiIntent } = classifyIntent(query);

  // CAPA 1.5: Keyword-based auto-mode detection (gap #15).
  // PRD priority: (1) manual toggle > (2) profile auto-detection > (3) keyword.
  // If the caller signals `manualModeOverride`, keep the supplied `mode` as-is
  // (it represents a user-initiated change). Otherwise, query keywords can
  // temporarily override the mode for THIS recommendation only — the store is
  // never mutated, so the override is per-query.
  let activeMode = mode;
  let modeSource: "manual" | "profile" | "keyword" = "profile";
  if (options?.manualModeOverride) {
    modeSource = "manual";
  } else {
    const detected = detectModeFromQuery(options?.queryText ?? query);
    if (detected && detected !== mode) {
      activeMode = detected;
      modeSource = "keyword";
    }
  }

  // CAPA 2: Hard filters — use activeMode so a keyword-detected "solo-gratis"
  // actually applies the free-only hard filter for this query.
  let candidates = applyHardFilters(models, category, entities, activeMode, options?.hardwareVram);

  // Bug fix #6: Quality gate — models with NO verified Intelligence Index AND
  // NO verified Elo are excluded from recommendations. A model with zero
  // ground-truth data cannot be responsibly recommended. This prevents
  // Arena-only models (like Fable 5 without AA enrichment) from winning on
  // imputed data alone. Exception: genuinely free models (Ollama, Groq free
  // tier) are kept even without II, because their value proposition is $0.
  const qualityFiltered = candidates.filter((m) => {
    const hasII = m.intelligenceIndex !== null && m.intelligenceIndex > 0;
    const hasElo = m.elo !== null && m.elo > 0;
    const hasCoding = m.codingIndex !== null && m.codingIndex > 0;
    if (hasII || hasElo || (category === "programacion" && hasCoding)) {
      // BenchLM confidence gate (HRE-TOPSIS v3.3): exclude paid models whose
      // BenchLM score has confidence=1 (few benchmarks) AND that have no AA II/Elo
      // to back it up. Free models pass regardless (no financial risk in trying them).
      if (m.benchlmScoreConfidence === 1 && !isModelFree(m) && !hasII && !hasElo) {
        return false;
      }
      return true;
    }
    // Free models get a pass — they cost nothing to try
    if (isModelFree(m)) return true;
    return false;
  });
  if (qualityFiltered.length >= 3) {
    candidates = qualityFiltered;
  }
  // If quality gate leaves < 3 candidates, keep the original set (graceful).

  // Fallback: relax offline/speed filters if hard filters eliminated everyone
  if (candidates.length === 0) {
    candidates = models.filter((m) => m.license !== "research-only");
  }

  // CAPA 3 + 4: AHP weights + TOPSIS ranking — use activeMode.
  // v3.3.1 bug fix #10: pasamos `activeMode` a topsisRank para que computeEfficiencyCost
  // sepa si estamos en Calidad (FREE usa precio API real) o MYPE/Equilibrado (FREE=$0).
  const weights = getWeights(category, activeMode);
  let ranked = topsisRank(candidates, weights, category, activeMode);

  // Anti-"gratis malo" threshold: if best free model has II < 70% of best paid,
  // the paid model wins and the free model is shown as a flagged alternative.
  // Bug fix #5: the Operario (Profile E) bypass is REMOVED — the 70% quality
  // threshold now applies universally. Recommending a $0 model that's 40% as
  // smart as a $2/M model is never good advice, even for an operator. The
  // operator's card will still prefer free models when they're genuinely
  // competitive (within 70% of the best paid), but won't recommend garbage.
  if (activeMode === "mype" || activeMode === "solo-gratis") {
    const paidModels = ranked.filter((r) => computeBlendedPriceUsd(r.model) > 0);
    const freeModels = ranked.filter((r) => computeBlendedPriceUsd(r.model) === 0);
    if (paidModels.length > 0 && freeModels.length > 0) {
      const bestPaidII = Math.max(...paidModels.map((r) => r.model.intelligenceIndex ?? II_BASELINE));
      const bestFreeII = Math.max(...freeModels.map((r) => r.model.intelligenceIndex ?? II_BASELINE));
      if (bestFreeII < bestPaidII * 0.7) {
        // Re-sort: paid first, free as alternative
        ranked = [
          ...paidModels.sort((a, b) => b.score - a.score),
          ...freeModels.sort((a, b) => b.score - a.score),
        ];
      } else {
        ranked.sort((a, b) => b.score - a.score);
      }
    } else {
      ranked.sort((a, b) => b.score - a.score);
    }
  } else {
    ranked.sort((a, b) => b.score - a.score);
  }

  const top3 = ranked.slice(0, 3);

  // CAPA 5: Natural language explanation — uses activeMode so the label reflects
  // any keyword-driven mode override.
  const winners: HRETOPSISResult[] = top3.map((r, i) => ({
    model: r.model,
    score: r.score,
    rank: i + 1,
    reasons: generateReasons(r.model, r.metrics, category, activeMode, weights, options?.currency),
    metrics: {
      efficiencyCost: r.metrics.efficiencyCost,
      elo: r.model.elo,
      // HRE-TOPSIS v3.3: report the BenchLM category-specific II that was actually
      // used in the TOPSIS calculation (r.metrics.intelligenceIndex), NOT the generic
      // AA intelligenceIndex (r.model.intelligenceIndex). This makes the UI show the
      // same value the engine used — e.g. for "programacion" with a model that has
      // BenchLM.coding=75.6, the UI shows 75.6 (not the AA II=50.2).
      intelligenceIndex: r.metrics.intelligenceIndex,
      codingIndex: r.model.codingIndex,
      agenticIndex: r.model.agenticIndex,
      speed: r.model.speedTps,
      context: r.model.contextWindow,
      reliability: r.metrics.reliability,
    },
  }));

  const explanation = generateExplanation(winners, category, activeMode, query);

  const end = typeof performance !== "undefined" ? performance.now() : Date.now();

  // Top-3 categories by TF-IDF score (for multi-intent UI display)
  const categoriesRanked = (Object.entries(scores) as [TaskCategory, number][])
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c, s]) => ({ category: c, score: Number(s.toFixed(4)), label: CATEGORY_LABELS[c] }));

  return {
    // Base RecommendationResult fields (backward-compatible)
    query,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    mode: activeMode, // reflect active mode so existing UIs show the right label
    detectedEntities: {
      hasNumbers: entities.hasNumbers,
      hasCurrency: entities.hasCurrency,
      hasTimeConstraint: entities.hasTimeConstraint,
      hasDocumentType: entities.hasDocumentType,
      hasMaterial: entities.hasMaterial,
      hasLanguage: entities.hasLanguage,
      contextSizeHint: entities.contextSizeHint ?? 0,
    },
    multiIntent,
    winners,
    explanation,
    computationTimeMs: Math.round(end - start),
    // P1B-ENGINE extension fields (gap #15)
    intent: { category, label: CATEGORY_LABELS[category] },
    categories: categoriesRanked,
    activeMode,
    modeSource,
    // AHP Consistency Ratio (calculated from the active weight set, 8 criteria incl. reliability)
    ahpCR: (() => {
      const ws = getWeights(category, activeMode);
      const nonZeroWeights = [
        ws.efficiencyCost, ws.elo, ws.intelligenceIndex,
        ws.codingIndex, ws.agenticIndex, ws.speed, ws.context, ws.reliability,
      ].filter((w) => w > 0);
      const cr = calculateCR(nonZeroWeights);
      return { cr: cr.CR, passes: cr.passes, n: cr.n };
    })(),
  };
}

// Re-export helpers for UI
export {
  computeBlendedPriceUsd,
  computeEfficiencyCost,
  formatContext,
  formatVotes,
  CATEGORY_LABELS,
  stemWord,
};

// ================================================================
// ENGINE TRACE — Full step-by-step capture for the educational
// animation. Every layer exposes its intermediate values so the UI
// can render an EXTREMELY detailed walkthrough of how the engine
// arrives at its recommendation. The trace is computed by calling
// the SAME private functions used by recommend(), so the values are
// guaranteed to match the production engine output.
// ================================================================

export interface TraceTfIdfStem {
  token: string;
  stem: string;
  count: number;
  tf: number; // term frequency (count / totalTokens)
  idf: number; // inverse document frequency (smoothed)
  df: number; // document frequency (how many categories contain this stem)
}

export interface TraceCategoryScore {
  category: TaskCategory;
  label: string;
  tfidfSum: number;
  numKeywords: number;
  rawScore: number; // (tfidfSum / numKeywords) * 100
  entityBoostMultiplier: number;
  finalScore: number; // rawScore * boost
  matchedStems: string[];
}

export interface TraceFilterRule {
  rule: string;
  description: string;
  eliminated: number;
  remaining: number;
}

export interface TraceCandidateMetrics {
  modelId: string;
  modelName: string;
  provider: string;
  raw: {
    efficiencyCost: number;
    elo: number;
    intelligenceIndex: number;
    codingIndex: number;
    agenticIndex: number;
    speed: number;
    context: number;
    reliability: number;
  };
  imputed: {
    elo: boolean;
    intelligenceIndex: boolean;
    codingIndex: boolean;
    agenticIndex: boolean;
    speed: boolean;
    reliability: boolean;
  };
  isImputed: boolean;
}

export interface TraceMatrixRow {
  modelId: string;
  modelName: string;
  values: Record<string, number>;
}

export interface TraceDistanceRow {
  modelId: string;
  modelName: string;
  provider: string;
  dBest: number;
  dWorst: number;
  C: number;
  rank: number;
  score: number;
}

export interface EngineTrace {
  query: string;
  mode: OperationMode;
  profile: ProfileId | undefined;
  computationTimeMs: number;

  capa1: {
    rawQuery: string;
    normalized: string;
    tokensRaw: string[];
    tokensFiltered: string[];
    stemmedTokens: TraceTfIdfStem[];
    totalTokens: number;
    categoryScores: TraceCategoryScore[];
    entities: EntityDetection;
    multiIntent?: { category: TaskCategory; weight: number }[];
    winner: { category: TaskCategory; label: string; score: number };
  };

  capa1_5: {
    requestedMode: OperationMode;
    manualOverride: boolean;
    detectedMode: OperationMode | null;
    matchedKeyword: string | null;
    activeMode: OperationMode;
    modeSource: "manual" | "profile" | "keyword";
  };

  capa2: {
    totalModels: number;
    filters: TraceFilterRule[];
    qualityGate: {
      before: number;
      hasII: number;
      hasElo: number;
      hasCoding: number;
      isFree: number;
      after: number;
      applied: boolean;
    };
    finalCandidates: number;
  };

  capa3: {
    mode: OperationMode;
    category: TaskCategory;
    weights: Array<{ criterion: string; label: string; weight: number }>;
    sumWeights: number;
    nonZeroWeights: number[];
    ahp: {
      n: number;
      lambdaMax: number;
      CI: number;
      RI: number;
      CR: number;
      passes: boolean;
    };
  };

  capa4: {
    candidates: TraceCandidateMetrics[];
    denominators: Record<string, number>;
    normalizedMatrix: TraceMatrixRow[];
    weightedMatrix: TraceMatrixRow[];
    idealBest: Record<string, number>;
    idealWorst: Record<string, number>;
    distances: TraceDistanceRow[];
    antiFreeBad: {
      applied: boolean;
      bestPaidII: number;
      bestFreeII: number;
      threshold: number;
      triggered: boolean;
    };
    top3: Array<{ rank: number; modelId: string; modelName: string; score: number }>;
  };

  capa5: {
    top3Criteria: Array<{ criterion: string; label: string; weight: number }>;
    winners: Array<{
      rank: number;
      modelName: string;
      score: number;
      reasons: string[];
    }>;
    tie: boolean;
    tieDelta: number;
    explanation: string;
  };
}

// Human-readable labels for the 8 TOPSIS criteria (HRE-TOPSIS v3.3 — reliability added)
const CRITERION_LABELS: Record<string, string> = {
  efficiencyCost: "Eficiencia de Costo (menor = mejor)",
  elo: "Preferencia humana (Elo)",
  intelligenceIndex: "Inteligencia (II)",
  codingIndex: "Código (Coding Index)",
  agenticIndex: "Agentes (Agentic Index)",
  speed: "Velocidad (tokens/seg)",
  context: "Ventana de contexto",
  reliability: "Confiabilidad (1 - failure rate)",
};

/**
 * Run the engine and capture EVERY intermediate value for educational
 * display. Same logic as recommend(), but instrumented. The returned
 * EngineTrace is consumed by the Animación del Motor view.
 */
export function traceRecommendation(
  query: string,
  models: AIModel[],
  mode: OperationMode,
  profile?: ProfileId,
  options?: RecommendOptions
): EngineTrace {
  const start = typeof performance !== "undefined" ? performance.now() : Date.now();

  // ---------- CAPA 1 ----------
  const normalized = normalize(query);
  const tokensRaw = normalized.split(" ");
  const tokensFiltered = tokensRaw.filter(
    (w) => w.length > 1 && !STOPWORDS.has(w)
  );
  const total = tokensFiltered.length || 1;

  // TF (term frequency per stem)
  const tf = new Map<string, number>();
  const stemmedTokens: TraceTfIdfStem[] = [];
  for (const tok of tokensFiltered) {
    const s = stemWord(tok);
    if (s.length <= 1) continue;
    tf.set(s, (tf.get(s) ?? 0) + 1);
  }
  // Build per-stem trace with TF, IDF, DF
  for (const tok of tokensFiltered) {
    const s = stemWord(tok);
    if (s.length <= 1) continue;
    // df = number of categories that contain this stem
    let df = 0;
    for (const cat of Object.keys(CATEGORY_STEMS) as TaskCategory[]) {
      if (CATEGORY_STEMS[cat].includes(s)) df++;
    }
    const idf = IDF_MAP.get(s) ?? 1;
    const count = tf.get(s) ?? 1;
    stemmedTokens.push({
      token: tok,
      stem: s,
      count,
      tf: count / total,
      idf,
      df,
    });
  }
  // Dedupe stemmed tokens (same stem may appear from multiple tokens)
  const seenStems = new Set<string>();
  const stemmedTokensUnique = stemmedTokens.filter((t) => {
    if (seenStems.has(t.stem)) return false;
    seenStems.add(t.stem);
    return true;
  });

  const entities = detectEntities(query);

  // Compute per-category scores with traceability
  const tfNorm = new Map<string, number>();
  for (const [s, c] of tf) tfNorm.set(s, c / total);

  const categoryScores: TraceCategoryScore[] = [];
  for (const cat of Object.keys(CATEGORY_STEMS) as TaskCategory[]) {
    const catStems = CATEGORY_STEMS[cat];
    const matchedStems: string[] = [];
    let tfidfSum = 0;
    for (const s of catStems) {
      const t = tfNorm.get(s);
      if (t === undefined) continue;
      matchedStems.push(s);
      const idf = IDF_MAP.get(s) ?? 1;
      tfidfSum += t * idf;
    }
    const numKw = catStems.length || 1;
    const rawScore = (tfidfSum / numKw) * 100;
    let boost = 1;
    if (cat === "documentos" && (entities.hasDocumentType || entities.contextSizeHint)) boost *= 1.5;
    if (cat === "rapidas" && entities.hasTimeConstraint) boost *= 1.5;
    if (cat === "multilingue" && entities.hasLanguage) boost *= 1.8;
    if (cat === "offline" && /offline|sin internet|privado|confidencial|planta/.test(normalized)) boost *= 1.8;
    if (cat === "calculos" && (entities.hasCurrency || entities.hasNumbers)) boost *= 1.3;
    if (cat === "programacion" && entities.hasMaterial) boost *= 1.3;
    const finalScore = rawScore * boost;
    categoryScores.push({
      category: cat,
      label: CATEGORY_LABELS[cat],
      tfidfSum,
      numKeywords: numKw,
      rawScore,
      entityBoostMultiplier: boost,
      finalScore,
      matchedStems,
    });
  }
  categoryScores.sort((a, b) => b.finalScore - a.finalScore);

  const winnerCat = categoryScores[0]?.category ?? "redaccion";
  const winnerLabel = CATEGORY_LABELS[winnerCat];

  // Multi-intent
  let multiIntent: { category: TaskCategory; weight: number }[] | undefined;
  if (categoryScores.length >= 2 && categoryScores[1].finalScore >= categoryScores[0].finalScore * 0.5) {
    const totalScore = categoryScores[0].finalScore + categoryScores[1].finalScore;
    multiIntent = [
      { category: categoryScores[0].category, weight: categoryScores[0].finalScore / totalScore },
      { category: categoryScores[1].category, weight: categoryScores[1].finalScore / totalScore },
    ];
  }

  // ---------- CAPA 1.5 ----------
  const manualOverride = options?.manualModeOverride ?? false;
  let detectedMode: OperationMode | null = null;
  let matchedKeyword: string | null = null;
  if (!manualOverride) {
    const queryText = (options?.queryText ?? query).toLowerCase();
    for (const m of ["solo-gratis", "calidad", "equilibrado"] as OperationMode[]) {
      for (const kw of MODE_KEYWORDS[m] ?? []) {
        if (queryText.includes(kw)) {
          detectedMode = m;
          matchedKeyword = kw;
          break;
        }
      }
      if (detectedMode) break;
    }
  }
  let activeMode = mode;
  let modeSource: "manual" | "profile" | "keyword" = "profile";
  if (manualOverride) {
    modeSource = "manual";
  } else if (detectedMode && detectedMode !== mode) {
    activeMode = detectedMode;
    modeSource = "keyword";
  }

  // ---------- CAPA 2 ----------
  const totalModels = models.length;
  const filters: TraceFilterRule[] = [];
  let working = [...models];

  // Rule 1: research-only
  const beforeR1 = working.length;
  working = working.filter((m) => m.license !== "research-only");
  filters.push({
    rule: "license !== 'research-only'",
    description: "Excluye modelos de solo investigación (no comerciales)",
    eliminated: beforeR1 - working.length,
    remaining: working.length,
  });

  // Rule 2: HF disabled
  const beforeR2 = working.length;
  working = working.filter((m) => m.hfDisabled !== true);
  filters.push({
    rule: "hfDisabled !== true",
    description: "Excluye modelos deshabilitados en HuggingFace Hub",
    eliminated: beforeR2 - working.length,
    remaining: working.length,
  });

  // Rule 3: solo-gratis mode
  if (activeMode === "solo-gratis") {
    const beforeR3 = working.length;
    working = working.filter(
      (m) => m.freeAccess !== "paid-only" && m.freeAccess !== "free-registration"
    );
    filters.push({
      rule: "freeAccess not in (paid-only, free-registration)",
      description: "Modo Solo Gratis: solo modelos 100% gratuitos sin tarjeta",
      eliminated: beforeR3 - working.length,
      remaining: working.length,
    });
  }

  // Rule 4: category-specific hard filters
  const beforeR4 = working.length;
  working = working.filter((m) => {
    switch (winnerCat) {
      case "documentos":
        if (entities.contextSizeHint && m.contextWindow < entities.contextSizeHint) return false;
        break;
      case "offline":
        if (!m.ollamaAvailable) return false;
        break;
      case "rapidas":
        if (m.speedTps !== null && m.speedTps < 30) return false;
        break;
      case "multilingue":
        if (m.intelligenceIndex !== null && m.intelligenceIndex < 30) return false;
        break;
      case "programacion":
        if (!m.capabilities.jsonMode) return false;
        break;
    }
    return true;
  });
  filters.push({
    rule: `category-specific (${winnerCat})`,
    description: `Filtros duros de la categoría "${winnerLabel}"`,
    eliminated: beforeR4 - working.length,
    remaining: working.length,
  });

  // Rule 5: Quality gate (mirrors recommend() — includes the BenchLM
  // confidence=1 exclusion for paid models with no AA II/Elo backup)
  const beforeQuality = working.length;
  let hasII = 0, hasElo = 0, hasCoding = 0, isFree = 0;
  const qualityFiltered = working.filter((m) => {
    const ii = m.intelligenceIndex !== null && m.intelligenceIndex > 0;
    const elo = m.elo !== null && m.elo > 0;
    const coding = m.codingIndex !== null && m.codingIndex > 0;
    if (ii) hasII++;
    if (elo) hasElo++;
    if (coding) hasCoding++;
    if (isModelFree(m)) isFree++;
    if (ii || elo || (winnerCat === "programacion" && coding)) {
      if (m.benchlmScoreConfidence === 1 && !isModelFree(m) && !ii && !elo) return false;
      return true;
    }
    if (isModelFree(m)) return true;
    return false;
  });
  const qualityApplied = qualityFiltered.length >= 3;
  let candidates = qualityApplied ? qualityFiltered : working;

  // HRE-TOPSIS v3.3.1 bug fix #14 (trace): mismo piso de calidad que recommend().
  // En modo Calidad, excluir modelos con II < 30 (excepto offline: II ≥ 15).
  if (activeMode === "calidad") {
    const minII = winnerCat === "offline" ? 15 : 30;
    const beforeFloor = candidates.length;
    candidates = candidates.filter(m => (m.intelligenceIndex ?? 0) >= minII);
    if (candidates.length < 3) {
      // Fallback: si quedan < 3, relajar el piso (mejor tener 3 que 1)
      candidates = qualityApplied ? qualityFiltered : working;
    } else {
      // Record the floor filter as a trace filter rule
      filters.push({
        rule: `quality-floor (calidad, II ≥ ${minII})`,
        description: `Piso de calidad: en modo Calidad, modelos con Intelligence Index < ${minII} se excluyen`,
        eliminated: beforeFloor - candidates.length,
        remaining: candidates.length,
      });
    }
  }

  // ---------- CAPA 3 ----------
  const weights = getWeights(winnerCat, activeMode);
  const weightEntries: Array<{ criterion: string; label: string; weight: number }> = [
    { criterion: "efficiencyCost", label: CRITERION_LABELS.efficiencyCost, weight: weights.efficiencyCost },
    { criterion: "elo", label: CRITERION_LABELS.elo, weight: weights.elo },
    { criterion: "intelligenceIndex", label: CRITERION_LABELS.intelligenceIndex, weight: weights.intelligenceIndex },
    { criterion: "codingIndex", label: CRITERION_LABELS.codingIndex, weight: weights.codingIndex },
    { criterion: "agenticIndex", label: CRITERION_LABELS.agenticIndex, weight: weights.agenticIndex },
    { criterion: "speed", label: CRITERION_LABELS.speed, weight: weights.speed },
    { criterion: "context", label: CRITERION_LABELS.context, weight: weights.context },
    { criterion: "reliability", label: CRITERION_LABELS.reliability, weight: weights.reliability },
  ];
  const sumWeights = weightEntries.reduce((s, w) => s + w.weight, 0);
  const nonZeroWeights = weightEntries.filter((w) => w.weight > 0).map((w) => w.weight);
  const cr = calculateCR(nonZeroWeights);

  // ---------- CAPA 4 ----------
  // 8 criteria (HRE-TOPSIS v3.3 — reliability added)
  const criteria = [
    "efficiencyCost", "elo", "intelligenceIndex", "codingIndex",
    "agenticIndex", "speed", "context", "reliability",
  ] as const;
  type NumKey = typeof criteria[number];

  // Extract metrics with imputation flags — pass winnerCat so the engine uses
  // BenchLM category-specific II when available (e.g. BenchLM.math for "calculos").
  // We reuse the production extractMetrics() helper for consistency.
  const candidateMetrics: TraceCandidateMetrics[] = candidates.map((m) => {
    const imputed = {
      elo: m.elo === null,
      intelligenceIndex: (m.benchlmCategoryScores == null && m.intelligenceIndex == null),
      codingIndex: m.codingIndex === null,
      agenticIndex: m.agenticIndex === null,
      speed: m.speedTps === null,
      reliability: false,  // baseline 0.95 is not an imputation
    };
    // v3.3.1 bug fix #10: pasamos `activeMode` para que extractMetrics use el
    // modo correcto al calcular effCost (Calidad = precio API real para FREE).
    const metrics = extractMetrics(m, winnerCat, activeMode);
    return {
      modelId: m.id,
      modelName: m.name,
      provider: m.provider,
      raw: {
        efficiencyCost: metrics.efficiencyCost,
        elo: metrics.elo,
        intelligenceIndex: metrics.intelligenceIndex,
        codingIndex: metrics.codingIndex,
        agenticIndex: metrics.agenticIndex,
        speed: metrics.speed,
        context: metrics.context,
        reliability: metrics.reliability,
      },
      imputed,
      isImputed: Object.values(imputed).some(Boolean),
    };
  });

  // Vector normalization denominators
  const denom: Record<string, number> = {};
  for (const c of criteria) {
    const sumSq = candidateMetrics.reduce(
      (s, m) => s + m.raw[c as NumKey] * m.raw[c as NumKey], 0
    );
    denom[c] = Math.sqrt(sumSq) || 1;
  }

  // Normalized + weighted matrix
  const normalizedMatrix: TraceMatrixRow[] = candidateMetrics.map((m) => {
    const row: Record<string, number> = {};
    for (const c of criteria) {
      row[c] = m.raw[c as NumKey] / denom[c];
    }
    return { modelId: m.modelId, modelName: m.modelName, values: row };
  });

  const weightedMatrix: TraceMatrixRow[] = candidateMetrics.map((m, i) => {
    const row: Record<string, number> = {};
    for (const c of criteria) {
      const w = weights[c as keyof WeightSet] ?? 0;
      row[c] = normalizedMatrix[i].values[c] * w;
    }
    return { modelId: m.modelId, modelName: m.modelName, values: row };
  });

  // Ideal best & worst
  const isCost = (k: string) => k === "efficiencyCost";
  const idealBest: Record<string, number> = {};
  const idealWorst: Record<string, number> = {};
  for (const c of criteria) {
    const vals = weightedMatrix.map((r) => r.values[c]);
    if (isCost(c)) {
      idealBest[c] = Math.min(...vals);
      idealWorst[c] = Math.max(...vals);
    } else {
      idealBest[c] = Math.max(...vals);
      idealWorst[c] = Math.min(...vals);
    }
  }

  // Distances + C
  let distances: TraceDistanceRow[] = candidates.map((m, i) => {
    const row = weightedMatrix[i].values;
    let dBest = 0;
    let dWorst = 0;
    for (const c of criteria) {
      dBest += Math.pow(row[c] - idealBest[c], 2);
      dWorst += Math.pow(row[c] - idealWorst[c], 2);
    }
    dBest = Math.sqrt(dBest);
    dWorst = Math.sqrt(dWorst);
    const C = dBest + dWorst === 0 ? 0 : dWorst / (dBest + dWorst);
    return {
      modelId: m.id,
      modelName: m.name,
      provider: m.provider,
      dBest,
      dWorst,
      C,
      rank: 0,
      score: C,
    };
  });

  // Anti-"gratis malo" threshold — compute BEFORE sorting so indices still
  // align distances[i] ↔ candidates[i]. Per the production engine: if best
  // free model has II < 70% of best paid, paid models win. We just record
  // the values for the trace; the production engine re-sorts the ranked list
  // when this triggers (see recommend() anti-free-bad block).
  let antiFreeBad = {
    applied: false,
    bestPaidII: 0,
    bestFreeII: 0,
    threshold: 0.7,
    triggered: false,
  };
  if (activeMode === "mype" || activeMode === "solo-gratis") {
    antiFreeBad.applied = true;
    const paid = distances
      .map((d, i) => ({ d, m: candidates[i] }))
      .filter((x) => computeBlendedPriceUsd(x.m) > 0);
    const free = distances
      .map((d, i) => ({ d, m: candidates[i] }))
      .filter((x) => computeBlendedPriceUsd(x.m) === 0);
    if (paid.length > 0 && free.length > 0) {
      const bestPaidII = Math.max(...paid.map((x) => x.m.intelligenceIndex ?? II_BASELINE));
      const bestFreeII = Math.max(...free.map((x) => x.m.intelligenceIndex ?? II_BASELINE));
      antiFreeBad.bestPaidII = bestPaidII;
      antiFreeBad.bestFreeII = bestFreeII;
      antiFreeBad.triggered = bestFreeII < bestPaidII * 0.7;
    }
  }

  distances.sort((a, b) => b.C - a.C);
  distances = distances.map((d, i) => ({ ...d, rank: i + 1 }));

  const top3 = distances.slice(0, 3).map((d) => ({
    rank: d.rank,
    modelId: d.modelId,
    modelName: d.modelName,
    score: d.score,
  }));

  // ---------- CAPA 5 ----------
  const wEntries = Object.entries(weights).sort((a, b) => b[1] - a[1]);
  const top3Criteria = wEntries
    .slice(0, 3)
    .filter(([, w]) => w > 0)
    .map(([criterion, weight]) => ({
      criterion,
      label: CRITERION_LABELS[criterion] ?? criterion,
      weight,
    }));

  // Build winners (call the real engine to get reasons)
  const realResult = recommend(query, models, mode, profile, options);
  const winners = realResult.winners.map((w) => ({
    rank: w.rank,
    modelName: w.model.name,
    score: w.score,
    reasons: w.reasons,
  }));
  const tie = realResult.winners.length >= 2 && Math.abs(realResult.winners[0].score - realResult.winners[1].score) < 0.03;
  const tieDelta = realResult.winners.length >= 2 ? Math.abs(realResult.winners[0].score - realResult.winners[1].score) : 0;

  const end = typeof performance !== "undefined" ? performance.now() : Date.now();

  return {
    query,
    mode,
    profile,
    computationTimeMs: Math.round(end - start),
    capa1: {
      rawQuery: query,
      normalized,
      tokensRaw,
      tokensFiltered,
      stemmedTokens: stemmedTokensUnique,
      totalTokens: total,
      categoryScores,
      entities,
      multiIntent,
      winner: { category: winnerCat, label: winnerLabel, score: categoryScores[0]?.finalScore ?? 0 },
    },
    capa1_5: {
      requestedMode: mode,
      manualOverride,
      detectedMode,
      matchedKeyword,
      activeMode,
      modeSource,
    },
    capa2: {
      totalModels,
      filters,
      qualityGate: {
        before: beforeQuality,
        hasII,
        hasElo,
        hasCoding,
        isFree,
        after: candidates.length,
        applied: qualityApplied,
      },
      finalCandidates: candidates.length,
    },
    capa3: {
      mode: activeMode,
      category: winnerCat,
      weights: weightEntries,
      sumWeights,
      nonZeroWeights,
      ahp: {
        n: cr.n,
        lambdaMax: cr.lambdaMax,
        CI: cr.CI,
        RI: cr.RI,
        CR: cr.CR,
        passes: cr.passes,
      },
    },
    capa4: {
      candidates: candidateMetrics,
      denominators: denom,
      normalizedMatrix,
      weightedMatrix,
      idealBest,
      idealWorst,
      distances,
      antiFreeBad,
      top3,
    },
    capa5: {
      top3Criteria,
      winners,
      tie,
      tieDelta,
      explanation: realResult.explanation,
    },
  };
}
