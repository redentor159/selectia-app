"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console / external monitoring
    console.error("[SelectIA] Error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--color-error)_30%,transparent)]">
          <AlertTriangle className="h-7 w-7 text-[var(--color-error)]" strokeWidth={2} />
        </div>

        <h1 className="text-[28px] font-semibold tracking-[-0.022em] text-[var(--text-primary)] mb-2">
          Algo salió mal
        </h1>
        <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] mb-1">
          Hubo un problema al cargar el dashboard. Puedes intentar de nuevo
          o volver al inicio.
        </p>

        {error?.digest && (
          <p className="mb-6 font-mono text-[11px] text-[var(--text-disabled)]">
            ID de error: {error.digest}
          </p>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-8)] bg-[var(--brand-accent)] px-4 text-[13px] font-medium text-[var(--on-accent)] shadow-[0_4px_14px_var(--brand-accent-glow)] transition-all hover:bg-[var(--brand-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={2} />
            Reintentar
          </button>

          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-8)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 text-[13px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-overlay)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] cursor-pointer"
          >
            <Home className="h-4 w-4" strokeWidth={2} />
            Ir al Dashboard
          </Link>
        </div>

        {error?.message && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              Ver detalles técnicos
            </summary>
            <pre className="mt-2 overflow-x-auto rounded-[var(--radius-8)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3 font-mono text-[11px] text-[var(--text-secondary)]">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
