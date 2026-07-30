import { NextResponse } from "next/server";
import { fetchSingleModelById } from "@/lib/orchestrator";

export const dynamic = "force-dynamic";

// Rate limit: 1 refresh per 10 seconds per server instance.
const MIN_INTERVAL_MS = 10_000;
let lastRequestAt = 0;

/**
 * Resolve a custom AA API key from the incoming request.
 * Priority: X-AA-Key header → body field `aaKey`.
 * Returns undefined when no override is provided so the orchestrator
 * falls back to its hardcoded default key.
 */
async function resolveCustomKey(
  request: Request,
  preParsedBody?: { aaKey?: string }
): Promise<string | undefined> {
  const headerKey = request.headers.get("x-aa-key");
  if (headerKey && headerKey.trim().length > 0) return headerKey.trim();

  if (preParsedBody?.aaKey && preParsedBody.aaKey.trim().length > 0) {
    return preParsedBody.aaKey.trim();
  }

  return undefined;
}

export async function POST(request: Request) {
  const now = Date.now();
  if (now - lastRequestAt < MIN_INTERVAL_MS) {
    const retryAfter = Math.ceil((MIN_INTERVAL_MS - (now - lastRequestAt)) / 1000);
    return NextResponse.json(
      {
        error: "Rate limited",
        message: `Espera ${retryAfter}s entre refrescos de modelo`,
        retryAfter,
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }
  lastRequestAt = now;

  let body: { modelId?: string; aaKey?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const modelId = body.modelId;
  if (!modelId) {
    return NextResponse.json(
      { error: "modelId is required" },
      { status: 400 }
    );
  }

  const customKey = await resolveCustomKey(request, body);

  try {
    const model = await fetchSingleModelById(modelId, customKey);
    if (!model) {
      return NextResponse.json(
        { error: "Model not found", modelId },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { model, refreshedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to refresh model",
        detail: (error as Error)?.message ?? "Unknown",
      },
      { status: 502 }
    );
  }
}
