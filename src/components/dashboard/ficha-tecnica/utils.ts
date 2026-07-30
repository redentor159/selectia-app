import type { AIModel } from "@/lib/types";

export function formatParams(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + " GB";
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(0) + " MB";
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(0) + " KB";
  return bytes + " B";
}

export function formatRelative(iso: string): string {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return "hoy";
  if (days < 7) return `hace ${days}d`;
  if (days < 30) return `hace ${Math.floor(days / 7)}sem`;
  if (days < 365) return `hace ${Math.floor(days / 30)}m`;
  return `hace ${Math.floor(days / 365)}a`;
}

export const PROVIDER_TO_HF_ORG: Record<string, string> = {
  "Meta": "meta-llama",
  "Mistral AI": "mistralai",
  "Google": "google",
  "Qwen": "Qwen",
  "DeepSeek": "deepseek-ai",
  "Microsoft": "microsoft",
  "AllenAI": "allenai",
  "Cohere": "CohereForAI",
  "Alibaba": "Qwen",
  "Nvidia": "nvidia",
  "Z AI": "zai-org",
  "Inception": "inception-ai",
};

export function resolveHfId(model: AIModel): string | null {
  const org = PROVIDER_TO_HF_ORG[model.provider];
  if (!org) return null;
  // The slug field is the HF-compatible name (e.g., "llama-3.3-70b-instruct")
  if (model.slug) return `${org}/${model.slug}`;
  // Fallback: derive from name
  const slug = model.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${org}/${slug}`;
}
