"use client";

import { useState } from "react";
import type { AIModel } from "@/lib/types";

interface ProviderLogoProps {
  model: AIModel;
  size?: number;
  className?: string;
}

// Publishable logo.dev token — PRD Col 1 says 500K req/mes free with this token.
// Safe to expose client-side (it is rate-limited per domain, not per user).
const LOGO_DEV_TOKEN = "pub";

/**
 * Map a provider display name (e.g. "OpenAI", "Google (Gemini)") to its
 * lowercase models.dev provider id, used to build the SVG logo URL fallback.
 * Falls back to a normalized slug (first word, lowercased) for unknowns.
 */
function providerIdFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("openai")) return "openai";
  if (lower.includes("anthropic")) return "anthropic";
  if (lower.includes("google") || lower.includes("gemini")) return "google";
  if (lower.includes("meta") || lower.includes("llama")) return "meta";
  if (lower.includes("deepseek")) return "deepseek";
  if (lower.includes("alibaba") || lower.includes("qwen")) return "alibaba";
  if (lower.includes("mistral")) return "mistral";
  if (lower.includes("z ai") || lower === "z-ai" || lower.includes("zhipu")) return "z-ai";
  if (lower.includes("minimax")) return "minimax";
  if (lower.includes("xai") || lower === "x-ai") return "xai";
  if (lower.includes("nvidia")) return "nvidia";
  if (lower.includes("microsoft") || lower.includes("azure")) return "microsoft";
  if (lower.includes("amazon") || lower.includes("aws")) return "amazon";
  if (lower.includes("cohere")) return "cohere";
  if (lower.includes("perplexity")) return "perplexity";
  if (lower.includes("ibm")) return "ibm";
  // Fallback: first token (split on whitespace, slash, or hyphen)
  return lower.split(/[\s/-]/)[0] || lower;
}

type FallbackStep = 0 | 1 | 2 | 3;
// 0 = Logo.dev (primary)
// 1 = Google favicon (fallback 1)
// 2 = Models.dev SVG (fallback 2)
// 3 = Color-initial (final)

/**
 * Public wrapper. Forwards to ProviderLogoInner with `key={model.id}` so that
 * a change of model unmounts the previous instance and mounts a fresh one —
 * this resets the internal `step` state to its proper initial value without
 * needing useEffect or refs-during-render (both forbidden by React 19's
 * lint rules: react-hooks/set-state-in-effect and react-hooks/refs).
 */
export function ProviderLogo({ model, size = 24, className = "" }: ProviderLogoProps) {
  return (
    <ProviderLogoInner
      key={model.id}
      model={model}
      size={size}
      className={className}
    />
  );
}

function ProviderLogoInner({ model, size = 24, className = "" }: ProviderLogoProps) {
  // Skip primary if no domain — jump straight to fallback chain
  const initialStep: FallbackStep = model.providerDomain ? 0 : 2;
  const [step, setStep] = useState<FallbackStep>(initialStep);

  const advance = () => setStep((s) => (s < 3 ? ((s + 1) as FallbackStep) : s));

  // Final fallback — color-initial circle with first letter
  if (step === 3 || (step === 2 && !model.provider)) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-md font-semibold text-white shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: model.providerColor,
          fontSize: size * 0.4,
        }}
        aria-hidden
      >
        {model.provider.charAt(0)}
      </div>
    );
  }

  const src =
    step === 0
      ? `https://img.logo.dev/${model.providerDomain}?token=${LOGO_DEV_TOKEN}&retina=true`
      : step === 1
        ? `https://www.google.com/s2/favicons?sz=64&domain=${model.providerDomain}`
        : `https://models.dev/logos/${providerIdFromName(model.provider)}.svg`;

  return (
    <img
      src={src}
      alt={`Logo de ${model.provider}`}
      width={size}
      height={size}
      onError={advance}
      className={`rounded-md shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
      // referrerPolicy noopener lets models.dev serve without leaking the
      // dashboard URL through the Referer header.
      referrerPolicy="no-referrer"
    />
  );
}
