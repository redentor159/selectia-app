import type { AIModel } from "@/lib/types";
import { resolveHfId } from "./utils";

export interface HfModelDetails {
  id: string;
  spaces: number;
  spacesSample: string[];
  inference: string | null;
  modelIndex: any;
  widgetData: any[] | null;
  chatTemplate: string | null;
  transformersInfo: { auto_model?: string; processor?: string } | null;
  sha: string | null;
  usedStorage: number | null;
  libraryName: string | null;
  config: { architectures?: string; model_type?: string; tokenizer_config?: any } | null;
  cardData: any;
  tags: string[] | null;
  safetensors: { parameters?: Record<string, number>; total?: number } | null;
  siblings: { count: number; files: string[] } | null;
  downloads: number | null;
  likes: number | null;
  trendingScore: number | null;
  gated: any;
  disabled: boolean | null;
  lastModified: string | null;
  createdAt: string | null;
}

export interface HfCacheEntry {
  details: HfModelDetails | null;
  error: string | null;
  status: "loading" | "ready" | "error";
}

const cache = new Map<string, HfCacheEntry>();
const inFlight = new Set<string>();
const subscribers = new Map<string, Set<() => void>>();

function notify(id: string) {
  const set = subscribers.get(id);
  if (!set) return;
  for (const cb of set) cb();
}

export function getHfCache(id: string): HfCacheEntry | undefined {
  return cache.get(id);
}

export function subscribeHfCache(id: string, cb: () => void): () => void {
  let set = subscribers.get(id);
  if (!set) {
    set = new Set();
    subscribers.set(id, set);
  }
  set.add(cb);
  return () => {
    set.delete(cb);
    if (set.size === 0) subscribers.delete(id);
  };
}

export function prefetchHfDetails(id: string, force = false): void {
  if (!id) return;
  const existing = cache.get(id);
  if (existing?.status === "ready" && !force) return;
  if (inFlight.has(id)) return;

  cache.set(id, {
    details: existing?.status === "ready" ? existing.details : null,
    error: null,
    status: "loading",
  });
  inFlight.add(id);
  notify(id);

  fetch(`/api/hf-model?id=${encodeURIComponent(id)}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((data: HfModelDetails) => {
      cache.set(id, { details: data, error: null, status: "ready" });
    })
    .catch((err) => {
      cache.set(id, {
        details: null,
        error: err?.message || "Error al cargar la ficha técnica",
        status: "error",
      });
    })
    .finally(() => {
      inFlight.delete(id);
      notify(id);
    });
}

export function prefetchFichaForModel(model: AIModel | null): void {
  const id = model?.hfRepoId || (model?.slug ? resolveHfId(model) : null);
  if (id) prefetchHfDetails(id);
}
