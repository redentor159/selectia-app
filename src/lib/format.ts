import type { AIModel, CurrencyRate, CurrencyCode, LicenseType, FreeAccessType } from "./types";

// ---------- Currency ----------

export function convertPrice(usdPrice: number, currency: CurrencyRate): number {
  return usdPrice * currency.rateFromUsd;
}

export function formatPrice(
  usdPrice: number | null,
  currency: CurrencyRate,
  decimals = 2
): string {
  if (usdPrice === null) return "—";
  const converted = convertPrice(usdPrice, currency);
  return `${currency.symbol} ${converted.toFixed(decimals)}`;
}

export function formatPricePerMillion(
  usdPrice: number | null,
  currency: CurrencyRate
): string {
  if (usdPrice === null) return "—";
  return `${formatPrice(usdPrice, currency)} /M`;
}

export function getCurrencyByCode(
  currencies: CurrencyRate[],
  code: CurrencyCode
): CurrencyRate {
  return currencies.find((c) => c.code === code) ?? currencies[0];
}

// ---------- Blended price ----------

export function computeBlendedUsd(model: AIModel): number {
  if (model.priceInputUsd === null || model.priceOutputUsd === null) return 0;
  return model.priceInputUsd * 0.7 + model.priceOutputUsd * 0.3;
}

export function formatBlended(
  model: AIModel,
  currency: CurrencyRate
): string {
  const blended = computeBlendedUsd(model);
  if (blended === 0) return "Gratis";
  return formatPricePerMillion(blended, currency);
}

// ---------- Context ----------

export function formatContext(ctx: number): string {
  if (ctx >= 1000000) return `${(ctx / 1000000).toFixed(1)}M`;
  if (ctx >= 1000) return `${Math.round(ctx / 1000)}K`;
  return ctx.toString();
}

// ---------- Elo / votes ----------

export function formatVotes(v: number | null): string {
  if (v === null) return "—";
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v.toString();
}

export function formatEloConfidence(
  elo: number | null,
  ci: number | null,
  votes: number | null
): string {
  if (elo === null) return "Sin dato";
  const ciStr = ci !== null ? ` ±${ci}` : "";
  const votesStr = votes !== null ? ` (${formatVotes(votes)} votos)` : "";
  return `${elo}${ciStr}${votesStr}`;
}

// ---------- License ----------

export const LICENSE_META: Record<
  LicenseType,
  { label: string; color: string; bgColor: string; borderColor: string; icon: string }
> = {
  "commercial-open": {
    label: "Comercial Libre",
    color: "#00d66f",
    bgColor: "rgba(0, 214, 111, 0.10)",
    borderColor: "rgba(0, 214, 111, 0.20)",
    icon: "●",
  },
  conditional: {
    label: "Condicional",
    color: "#f5a623",
    bgColor: "rgba(245, 166, 35, 0.10)",
    borderColor: "rgba(245, 166, 35, 0.20)",
    icon: "●",
  },
  "api-paid": {
    label: "Solo API Pago",
    color: "#ea2261",
    bgColor: "rgba(234, 34, 97, 0.10)",
    borderColor: "rgba(234, 34, 97, 0.20)",
    icon: "●",
  },
  "research-only": {
    label: "Solo Investigación",
    color: "#62666d",
    bgColor: "rgba(98, 102, 109, 0.10)",
    borderColor: "rgba(98, 102, 109, 0.20)",
    icon: "●",
  },
  "open-source-full": {
    label: "Open Source Completo",
    color: "#4ea7fc",
    bgColor: "rgba(78, 167, 252, 0.10)",
    borderColor: "rgba(78, 167, 252, 0.20)",
    icon: "●",
  },
};

// ---------- Free access ----------

export const FREE_ACCESS_META: Record<
  FreeAccessType,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  "free-100": {
    label: "100% Gratis",
    color: "#00d66f",
    bgColor: "rgba(0, 214, 111, 0.10)",
    borderColor: "rgba(0, 214, 111, 0.20)",
  },
  "free-limited": {
    label: "Tier Gratis",
    color: "#f0bf00",
    bgColor: "rgba(240, 191, 0, 0.10)",
    borderColor: "rgba(240, 191, 0, 0.20)",
  },
  "free-registration": {
    label: "Gratis c/Registro",
    color: "#fc7840",
    bgColor: "rgba(252, 120, 64, 0.10)",
    borderColor: "rgba(252, 120, 64, 0.20)",
  },
  "paid-only": {
    label: "Solo Pago",
    color: "#8a8f98",
    bgColor: "rgba(138, 143, 152, 0.10)",
    borderColor: "rgba(138, 143, 152, 0.20)",
  },
};

// ---------- Intelligence Index color coding ----------

export function getIntelligenceColor(ii: number | null): string {
  if (ii === null) return "#62666d";
  if (ii < 30) return "#eb5757";
  if (ii < 40) return "#fc7840";
  if (ii < 50) return "#f0bf00";
  if (ii < 60) return "#68cc58";
  if (ii < 70) return "#00b8cc";
  return "#5e6ad2";
}

// ---------- Elo color ----------

export function getEloColor(elo: number | null): string {
  if (elo === null) return "#62666d";
  if (elo >= 1400) return "#00d66f";
  if (elo >= 1300) return "#f0bf00";
  return "#8a8f98";
}

// ---------- Relative time ----------

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hace menos de 1 min";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "ya";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `en ${mins} min`;
  const hours = Math.floor(mins / 60);
  const remMin = mins % 60;
  return `en ${hours}h ${remMin}m`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const meses = [
    "ene.", "feb.", "mar.", "abr.", "may.", "jun.",
    "jul.", "ago.", "sep.", "oct.", "nov.", "dic.",
  ];
  const dia = d.getDate();
  const mes = meses[d.getMonth()];
  const año = d.getFullYear();
  let horas = d.getHours();
  const minutos = d.getMinutes();
  const ampm = horas >= 12 ? "p. m." : "a. m.";
  horas = horas % 12 || 12;
  const minStr = minutos < 10 ? `0${minutos}` : minutos;
  return `${dia} ${mes} ${año}, ${horas}:${minStr} ${ampm}`;
}

// ---------- Number formatting ----------

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ---------- Razones del recomendador (HRE-TOPSIS display consistente) ----------
// Aditivo: los callers que no pasan `currency` siguen recibiendo el texto de hoy
// (PEN con el fallback 3.714 del orquestador, sin sufijos).

/**
 * Moneda usada por las razones del motor. Proviene del store de moneda/tasas
 * y usa el MISMO fallback que `orchestrator.ts` (`rates.PEN ?? 3.714`) cuando
 * el servicio de tipo de cambio está caído (`isFallback === true`).
 */
export interface RecommendCurrency {
  code: string;
  symbol: string;
  rateFromUsd: number; // multiplicar USD por esto para obtener la moneda objetivo
  isFallback?: boolean;
}

/**
 * Etiqueta de costo blended en la moneda del usuario:
 * `S/. 8.52/M tokens blended`. Con `isFallback` añade el sufijo "(TC estimado)".
 */
export function costRateLabel(blendedUsd: number, cur: RecommendCurrency): string {
  const converted = (blendedUsd * cur.rateFromUsd).toFixed(2);
  const base = `${cur.symbol} ${converted}/M tokens blended`;
  return cur.isFallback ? `${base} (TC estimado)` : base;
}

/**
 * Eslogan de gratuidad honesto para el modo "solo-gratis".
 * Solo se afirma "100% gratis" cuando el modelo es `free-100` y su precio
 * real de entrada es 0; los demás tiers reciben un texto matizado o nada.
 */
export function sloganForFreeAccess(fa: FreeAccessType, verifiedFree: boolean): string | null {
  if (fa === "free-100" && verifiedFree) {
    return "Disponible 100% gratis — sin tarjeta de crédito requerida";
  }
  if (fa === "free-limited") return "Disponible gratis con límites (free tier)";
  if (fa === "free-registration") return "Disponible gratis con registro";
  return null; // paid-only o precio no verificado → sin etiqueta
}

/**
 * Redondeo por mayor remanente: devuelve enteros que SIEMPRE suman 100
 * (p. ej. [0.503, 0.497] → [50, 50]; [0.334, 0.333, 0.333] → [34, 33, 33]).
 * Pesos vacíos o total 0 → [].
 */
export function normalizePercentages(weights: number[]): number[] {
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total === 0) return [];
  const raw = weights.map((w) => (w / total) * 100);
  const floors = raw.map((r) => Math.floor(r));
  let remaining = 100 - floors.reduce((sum, f) => sum + f, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remaining; k++) {
    floors[order[k % order.length].i] += 1;
  }
  return floors;
}

/**
 * Texto del badge multi-intent: aclara que la categoría ganadora define el
 * ranking (el multi-intent NO mezcla el ranking) y suma 100% exacto.
 */
export function buildMultiIntentText(
  parts: { key: string; label: string; weight: number }[],
  winnerLabel: string
): string {
  if (parts.length === 0) return "";
  const pcts = normalizePercentages(parts.map((p) => p.weight));
  const shown = parts.map((p, i) => `${p.label} ${pcts[i]}%`).join(" + ");
  const realDiffPts = parts.length >= 2 ? Math.abs(parts[0].weight - parts[1].weight) * 100 : 100;
  const apparentTie = parts.length >= 2 && pcts[0] === pcts[1] && realDiffPts < 0.5;
  if (apparentTie) {
    return `Multi-intento: [Empate ${pcts[0]}/${pcts[1]}] — la primera categoría detectada define el ranking`;
  }
  return `Multi-intento: [${shown}] — ${winnerLabel} define el ranking (categoría ganadora)`;
}
