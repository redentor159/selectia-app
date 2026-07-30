import { NextResponse } from "next/server";
import { sendNtfyAlert } from "@/lib/orchestrator";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const title = body.title || "Test SelectIA";
    const message = body.message || "Notificación de prueba";

    const success = await sendNtfyAlert(title, message);

    return NextResponse.json({
      success,
      topic: "selectia-alerts",
      timestamp: new Date().toISOString(),
      title,
      message,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send ntfy alert",
        detail: (error as Error)?.message ?? "Unknown",
      },
      { status: 500 }
    );
  }
}
