import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { fetchDashboardData, forceRefreshDashboardData } from "@/lib/orchestrator";

export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_FORCE = 5;
const RATE_LIMIT_MAX_NORMAL = 60;

const forceRequests: number[] = [];
const normalRequests: number[] = [];

function cleanOldRequests(arr: number[]) {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  while (arr.length > 0 && arr[0] < cutoff) arr.shift();
}

// readStaticJson removed as we now use Next.js native cache

function resolveCustomKey(request: Request): string | undefined {
  const headerKey = request.headers.get("x-aa-key");
  if (headerKey && headerKey.trim().length > 0) return headerKey.trim();
  const url = new URL(request.url);
  const queryKey = url.searchParams.get("aaKey");
  if (queryKey && queryKey.trim().length > 0) return queryKey.trim();
  return undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "1";
  const customKey = resolveCustomKey(request);

  if (force) {
    cleanOldRequests(forceRequests);
    if (forceRequests.length >= RATE_LIMIT_MAX_FORCE) {
      const retryAfter = Math.ceil(
        (forceRequests[0] + RATE_LIMIT_WINDOW_MS - Date.now()) / 1000
      );
      return NextResponse.json(
        { error: "Rate limited", message: `Espera ${retryAfter}s`, retryAfter },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }
    forceRequests.push(Date.now());
    
    // Purge the global Next.js cache so the next fetch hits the live APIs
    // @ts-expect-error Next.js typings mismatch
    revalidateTag("dashboard-data");
  } else {
    cleanOldRequests(normalRequests);
    if (normalRequests.length >= RATE_LIMIT_MAX_NORMAL) {
      return NextResponse.json(
        { error: "Rate limited", message: "Demasiadas peticiones, espera 60s" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    normalRequests.push(Date.now());
  }

  try {
    // We now rely purely on Next.js native cache inside fetchDashboardData
    // which eliminates the need to read static JSON files manually.

    const data = force
      ? await forceRefreshDashboardData(customKey)
      : await fetchDashboardData(false, customKey);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": force || customKey ? "no-store" : "public, s-maxage=300, stale-while-revalidate=600",
        "X-Data-Source": force ? "live-force" : "live-cached",
      },
    });
  } catch (error) {
    console.error("Orchestrator failed:", error);
    return NextResponse.json(
      { error: "Orchestrator API failure", message: (error as Error).message },
      { status: 500 }
    );
  }
}
