import { NextResponse } from "next/server";
import { getHealthStatus } from "@/lib/orchestrator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await getHealthStatus();
    const hasModels = (health as any).models > 0;
    const status: "green" | "yellow" | "red" = hasModels
      ? health.status
      : "red";

    return NextResponse.json(
      {
        ...health,
        status,
        httpStatus: hasModels ? 200 : 503,
        timestamp: new Date().toISOString(),
      },
      {
        status: hasModels ? 200 : 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "red",
        error: "Health check failed",
        detail: (error as Error)?.message ?? "Unknown",
        timestamp: new Date().toISOString(),
        models: 0,
      },
      { status: 503 }
    );
  }
}
