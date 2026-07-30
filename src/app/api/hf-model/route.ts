import { NextResponse } from "next/server";

// Lazy-load HuggingFace model details for the Ficha Técnica modal.
// Called on-demand when a user clicks "Ver ficha técnica" on a specific model.
// This avoids bloating the main JSON with spaces[], siblings[], chat_template, etc.
export const dynamic = "force-dynamic";

const HF_TOKEN_FALLBACK = process.env.HF_TOKEN || "TU_TOKEN_REAL_AQUI";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get("id");
  if (!modelId) {
    return NextResponse.json({ error: "Missing model id" }, { status: 400 });
  }

  // Resolve HF token: user header > env var > hardcoded fallback
  const headerToken = request.headers.get("x-hf-token");
  const token = headerToken || process.env.HF_TOKEN || HF_TOKEN_FALLBACK;

  try {
    const res = await fetch(`https://huggingface.co/api/models/${modelId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "SelectIA/3.2",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `HF API returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Extract only the fields needed for the Ficha Técnica modal (Funciones D + E)
    const filtered = {
      id: data.id,
      // Función D — Actividad del Ecosistema
      spaces: data.spaces ? data.spaces.length : 0,
      spacesSample: data.spaces ? data.spaces.slice(0, 3) : [],
      inference: data.inference ?? null,
      // Función E — Evaluación Cruzada del Autor
      modelIndex: data["model-index"] ?? null,
      widgetData: data.widgetData ?? null,
      chatTemplate: data.config?.tokenizer_config?.chat_template ?? null,
      transformersInfo: data.transformersInfo ?? null,
      sha: data.sha ?? null,
      usedStorage: data.usedStorage ?? null,
      libraryName: data.library_name ?? null,
      // Cross-reference fields (also in main JSON but re-fetched for the modal)
      config: data.config
        ? {
            architectures: data.config.architectures ?? null,
            model_type: data.config.model_type ?? null,
            tokenizer_config: data.config.tokenizer_config ?? null,
          }
        : null,
      cardData: data.cardData ?? null,
      tags: data.tags ?? null,
      safetensors: data.safetensors ?? null,
      siblings: data.siblings
        ? {
            count: data.siblings.length,
            files: data.siblings.slice(0, 50).map((s: any) => s.rfilename || s.filename),
          }
        : null,
      downloads: data.downloads ?? null,
      likes: data.likes ?? null,
      trendingScore: data.trendingScore ?? null,
      gated: data.gated ?? null,
      disabled: data.disabled ?? null,
      lastModified: data.lastModified ?? null,
      createdAt: data.createdAt ?? null,
    };

    return NextResponse.json(filtered, {
      headers: { "Cache-Control": "public, s-maxage=3600" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
