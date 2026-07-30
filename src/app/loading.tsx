import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)]">
      {/* Header skeleton */}
      <header className="sticky top-0 z-[100] border-b border-[var(--border-default)] bg-[color-mix(in_srgb,var(--bg-base)_85%,transparent)] backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
            <div className="hidden sm:block space-y-1.5">
              <div className="h-3.5 w-36 rounded bg-[var(--bg-elevated)] animate-pulse" />
              <div className="h-2.5 w-24 rounded bg-[var(--bg-elevated)] animate-pulse" />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-7 w-24 rounded bg-[var(--bg-elevated)] animate-pulse" />
            <div className="h-7 w-12 rounded bg-[var(--bg-elevated)] animate-pulse" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row min-h-0">
        {/* Sidebar skeleton */}
        <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:border-r lg:border-[var(--border-default)] lg:bg-[var(--bg-elevated)] p-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 h-9 px-3 rounded-[var(--radius-8)]"
            >
              <div className="h-4 w-4 rounded bg-[var(--bg-overlay)] animate-pulse" />
              <div className="h-3 w-20 rounded bg-[var(--bg-overlay)] animate-pulse" />
            </div>
          ))}
        </aside>

        {/* Main skeleton */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-5 lg:py-6">
            {/* Hero / status row */}
            <div className="mb-6 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 w-64 rounded bg-[var(--bg-elevated)] animate-pulse" />
                <div className="h-3 w-48 rounded bg-[var(--bg-elevated)] animate-pulse" />
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Activity className="h-4 w-4 animate-pulse" />
                <span className="text-[12px]">Cargando dashboard…</span>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-[var(--radius-12)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 space-y-3"
                >
                  <div className="h-3 w-24 rounded bg-[var(--bg-overlay)] animate-pulse" />
                  <div className="h-7 w-20 rounded bg-[var(--bg-overlay)] animate-pulse" />
                  <div className="h-2.5 w-full rounded bg-[var(--bg-overlay)] animate-pulse" />
                </div>
              ))}
            </div>

            {/* Chart placeholder */}
            <div className="rounded-[var(--radius-12)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 mb-6">
              <div className="h-4 w-40 rounded bg-[var(--bg-overlay)] animate-pulse mb-4" />
              <div className="h-72 w-full rounded bg-[var(--bg-elevated)] animate-pulse" />
            </div>

            {/* Table placeholder */}
            <div className="rounded-[var(--radius-12)] border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
              <div className="h-10 border-b border-[var(--border-default)] flex items-center px-4 gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-3 rounded bg-[var(--bg-overlay)] animate-pulse"
                    style={{ width: `${60 + i * 12}px` }}
                  />
                ))}
              </div>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                <div
                  key={row}
                  className="h-12 border-b border-[var(--border-default)] flex items-center px-4 gap-3 last:border-b-0"
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-3 rounded bg-[var(--bg-elevated)] animate-pulse"
                      style={{ width: `${50 + i * 10}px` }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Footer skeleton */}
      <footer className="mt-auto border-t border-[var(--border-default)] bg-[var(--bg-elevated)]">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="h-3 w-48 rounded bg-[var(--bg-overlay)] animate-pulse" />
          <div className="h-3 w-32 rounded bg-[var(--bg-overlay)] animate-pulse" />
        </div>
      </footer>
    </div>
  );
}
