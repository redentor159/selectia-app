"use client";

import Link from "next/link";
import { Home, Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand-accent)_12%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--brand-accent)_30%,transparent)]">
          <Compass
            className="h-7 w-7 text-[var(--brand-accent)]"
            strokeWidth={2}
          />
        </div>

        <p className="font-mono text-[13px] uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-2">
          Error 404
        </p>
        <h1 className="text-[32px] font-semibold tracking-[-0.022em] text-[var(--text-primary)] mb-3">
          Página no encontrada
        </h1>
        <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] mb-8">
          La URL que buscas no existe o fue movida. Vuelve al dashboard para
          comparar modelos de IA en Soles.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-8)] bg-[var(--brand-accent)] px-4 text-[13px] font-medium text-[var(--on-accent)] shadow-[0_4px_14px_var(--brand-accent-glow)] transition-all hover:bg-[var(--brand-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] cursor-pointer"
          >
            <Home className="h-4 w-4" strokeWidth={2} />
            Ir al Dashboard
          </Link>

          <button
            onClick={() => history.back()}
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-8)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 text-[13px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-overlay)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
}
