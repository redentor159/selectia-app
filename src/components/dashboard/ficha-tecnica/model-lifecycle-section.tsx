import { RefreshCw, CheckCircle2, CalendarClock, ExternalLink } from "lucide-react";
import type { AIModel } from "@/lib/types";

export function ModelLifecycleSection({ model }: { model: AIModel }) {
  const supersededBy = model.benchlmSupersededBy;
  const supersededByName = model.benchlmSupersededByName;
  const isCanonical = model.benchlmIsCanonicalEntry === true;
  const releaseDate = model.benchlmReleaseDate;
  const isSuperseded = supersededBy != null;

  return (
    <div className="space-y-2.5">
      {/* Superseded alert OR canonical badge */}
      {isSuperseded ? (
        <div
          className="rounded-md border px-3 py-2 text-xs flex items-start gap-2 bg-[var(--color-warning-bg)] border-[var(--color-warning-border)] text-[var(--color-warning)]"
          role="alert"
        >
          <RefreshCw className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Este modelo ha sido reemplazado</span>{" "}
            <span className="text-[var(--text-secondary)]">
              por <span className="font-semibold text-[var(--text-primary)]">{supersededByName ?? supersededBy}</span>
              {supersededBy && (
                <>
                  {" "}(slug: <code className="font-mono text-xs text-[var(--text-secondary)]">{supersededBy}</code>)
                </>
              )}
              . Considera usar la versión más reciente.
            </span>
            {supersededBy && (
              <a
                href={`https://benchlm.ai/models/${supersededBy}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-flex items-center gap-0.5 text-[var(--brand-primary)] hover:underline align-middle"
              >
                Ver sucesor <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>
      ) : isCanonical ? (
        <div
          className="rounded-md border px-3 py-2 text-xs flex items-center gap-2 bg-[var(--color-success-bg)] border-[var(--color-success-border)] text-[var(--color-success)]"
          role="status"
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span className="font-semibold">Vigente</span>
          <span className="text-[var(--text-secondary)]">— este es el modelo recomendado de su familia.</span>
        </div>
      ) : null}

      {/* Release date */}
      {releaseDate != null && (
        <div className="rounded-lg bg-[var(--bg-overlay)] p-2 text-xs flex items-center gap-2">
          <CalendarClock className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
          <span className="text-[var(--text-secondary)]">Fecha de lanzamiento (BenchLM):</span>
          <span className="num font-semibold text-[var(--text-primary)]">
            {new Date(releaseDate).toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>
      )}
    </div>
  );
}
