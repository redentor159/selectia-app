"use client";

import { useDashboardStore, PROFILES } from "@/store/dashboard-store";
import type { CurrencyCode, OperationMode } from "@/lib/types";
import { useEffectiveDashboardData } from "@/hooks/use-effective-dashboard-data";
import {
  HardHat,
  Factory,
  Briefcase,
  ServerCog,
  Wrench,
  Calculator,
  Sun,
  Moon,
  Target,
  Search,
  Scale,
  ChevronDown,
  CheckCircle2,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PROFILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  HardHat,
  Factory,
  Briefcase,
  ServerCog,
  Wrench,
  Calculator,
};

const MODE_LABELS: Record<OperationMode, string> = {
  mype: "MYPE (presupuesto cero)",
  calidad: "Calidad máxima",
  equilibrado: "Equilibrado",
  "solo-gratis": "Solo gratis",
};

// ═══════════════════════════════════════════════════════════════
// EASTER EGG LOGO — Scale → Search (hover) → Target (click)
// Epic animations between each state using framer-motion.
// ═══════════════════════════════════════════════════════════════
type LogoState = "scale" | "search" | "target";

const LOGO_CONFIG: Record<LogoState, {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
}> = {
  scale: { Icon: Scale, label: "Comparar" },
  search: { Icon: Search, label: "Buscar" },
  target: { Icon: Target, label: "Acertar" },
};

// Each transition gets a UNIQUE animation — no two are the same.
const LOGO_TRANSITIONS: Record<string, { exit: object; enter: object }> = {
  // Scale → Search (hover): scale down + rotate out, search flies in from above
  "scale→search": {
    exit: { scale: 0, rotate: -180, opacity: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
    enter: { scale: [0, 1.2, 1], rotate: [90, 0], opacity: [0, 1], y: [-20, 0], transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  },
  // Search → Scale (un-hover): search fades down, scale rotates back in
  "search→scale": {
    exit: { scale: 0, rotate: 180, opacity: 0, y: 20, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
    enter: { scale: [0, 1.1, 1], rotate: [-90, 0], opacity: [0, 1], transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  },
  // Scale → Target (click): scale explodes outward, target zooms in with pulse
  "scale→target": {
    exit: { scale: [1, 1.5, 0], rotate: 360, opacity: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
    enter: { scale: [0, 1.3, 1], opacity: [0, 1], transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } },
  },
  // Search → Target (click while hovering): search dissolves, target materializes
  "search→target": {
    exit: { scale: 0, rotate: -90, opacity: 0, filter: "blur(8px)", transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
    enter: { scale: [0, 1.2, 1], rotate: [180, 0], opacity: [0, 1], filter: ["blur(8px)", "blur(0px)"], transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  },
  // Target → Scale (auto-reset): target implodes, scale gently fades back
  "target→scale": {
    exit: { scale: [1, 1.3, 0], opacity: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
    enter: { scale: [0, 1], rotate: [45, 0], opacity: [0, 1], transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  },
};

function LogoEasterEgg() {
  const [logoState, setLogoState] = useState<LogoState>("scale");
  const [prevLogoState, setPrevLogoState] = useState<LogoState>("scale");
  const [clickCount, setClickCount] = useState(0);

  // Auto-reset to scale after 3 seconds of showing target
  useEffect(() => {
    if (logoState === "target") {
      const timer = setTimeout(() => {
        setPrevLogoState("target");
        setLogoState("scale");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [logoState]);

  const handleMouseEnter = useCallback(() => {
    if (logoState !== "target") {
      setPrevLogoState(logoState);
      setLogoState("search");
    }
  }, [logoState]);

  const handleMouseLeave = useCallback(() => {
    if (logoState === "search") {
      setPrevLogoState("search");
      setLogoState("scale");
    }
  }, [logoState]);

  const handleClick = useCallback(() => {
    setClickCount((c) => c + 1);
    setPrevLogoState(logoState);
    setLogoState("target");
  }, [logoState]);

  const transitionKey = `${prevLogoState}→${logoState}`;
  const transition = LOGO_TRANSITIONS[transitionKey] ?? LOGO_TRANSITIONS["target→scale"];
  const { Icon } = LOGO_CONFIG[logoState];

  return (
    <div
      className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--brand-accent)] to-[var(--brand-primary)] shadow-[0_0_0_3px_var(--brand-accent-glow)] cursor-pointer select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      title={`SelectIA · ${LOGO_CONFIG[logoState].label}${clickCount > 0 ? ` · clicks: ${clickCount}` : ""}`}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={logoState}
          initial={transition.enter as any}
          animate={{ scale: 1, rotate: 0, opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={transition.exit as any}
          className="flex items-center justify-center"
        >
          <Icon className="h-4 w-4 text-[var(--on-accent)]" strokeWidth={2.5} />
        </motion.div>
      </AnimatePresence>

      {/* Ripple effect on click */}
      <AnimatePresence>
        {logoState === "target" && (
          <motion.div
            key="ripple"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 rounded-lg border-2 border-[var(--on-accent)] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const {
    profile,
    setProfile,
    currency,
    setCurrency,
    customExchangeRates,
    setCustomExchangeRate,
    resetExchangeRate,
    operationMode,
    setOperationMode,
    theme,
    setTheme,
  } = useDashboardStore();
  const { data } = useEffectiveDashboardData();

  const currentProfile = PROFILES.find((p) => p.id === profile)!;
  const ProfileIcon = PROFILE_ICONS[currentProfile.icon];

  // Live exchange rate for the currently-selected currency. PRD Módulo 8:
  // "El tipo de cambio se actualiza en tiempo real cada vez que el usuario
  // abre el dashboard." Display it in the selector trigger so the user
  // always sees the live rate they're converting with.
  const liveCurrencies = data?.currencies ?? [];
  const currentCurrencyMeta = liveCurrencies.find((c) => c.code === currency);
  // v3.3.1: Apply custom exchange rate override if user has set one.
  // This makes ALL views that read currentCurrencyMeta.rateFromUsd use the
  // custom rate automatically.
  const customRate = customExchangeRates[currency];
  const effectiveRate = customRate ?? currentCurrencyMeta?.rateFromUsd;
  const effectiveMeta = currentCurrencyMeta
    ? { ...currentCurrencyMeta, rateFromUsd: effectiveRate ?? currentCurrencyMeta.rateFromUsd }
    : null;
  const hasCustomRate = customRate != null;
  const rateDisplay =
    currency === "USD"
      ? "1 USD"
      : effectiveMeta
        ? `1$ = ${effectiveMeta.symbol}${effectiveMeta.rateFromUsd.toFixed(3)}`
        : null;

  return (
    <header className="sticky top-0 z-[100] border-b border-[var(--border-default)] bg-[color-mix(in_srgb,var(--bg-base)_85%,transparent)] backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        {/* Logo — Easter egg: hover→Search, click→Target, with epic animations */}
        <div className="flex items-center gap-2.5 shrink-0">
          <LogoEasterEgg />
          <div className="hidden sm:block">
            <div className="text-[15px] font-semibold leading-tight tracking-[-0.022em] text-[var(--text-primary)]">
              SelectIA
            </div>
            <div className="text-[11px] leading-tight text-[var(--text-secondary)]">
              Command Center · v3.2
            </div>
          </div>
        </div>

        {/* Status pill */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-2.5 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-success)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-success)]" />
          </span>
          <span className="text-[11px] font-medium text-[var(--color-success)]">
            Datos actualizados hoy
          </span>
        </div>

        <div className="flex-1" />

        {/* Profile selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 gap-2 px-2.5 hover:bg-[var(--bg-overlay)]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--brand-primary-subtle)]">
                <ProfileIcon className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
              </span>
              <span className="hidden lg:block text-sm font-medium">
                {currentProfile.name}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">
              Perfil de usuario
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PROFILES.map((p) => {
              const Icon = PROFILE_ICONS[p.icon];
              const active = p.id === profile;
              return (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => setProfile(p.id)}
                  className={cn(
                    "flex items-start gap-3 py-2.5 cursor-pointer",
                    active && "bg-[var(--brand-primary-subtle)]"
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--brand-primary-subtle)]">
                    <Icon className="h-4 w-4 text-[var(--brand-primary)]" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{p.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                        {p.id}
                      </Badge>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {p.description}
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Operation mode */}
        <Select
          value={operationMode}
          onValueChange={(v) => setOperationMode(v as OperationMode)}
        >
          <SelectTrigger className="h-9 w-[140px] hidden sm:flex text-sm border-[var(--border-strong)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(MODE_LABELS) as OperationMode[]).map((m) => (
              <SelectItem key={m} value={m} className="text-sm">
                {MODE_LABELS[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Currency selector — shows live exchange rate in the trigger.
            PRD Módulo 8: "El tipo de cambio se actualiza en tiempo real
            cada vez que el usuario abre el dashboard." The user requested
            the rate be always visible right on the selector button, so we
            use a custom DropdownMenu (not the stock Select) to render the
            trigger with the live rate inline. */}
        {currentProfile.showCurrencySelector && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-2.5 text-sm font-mono border-[var(--border-strong)] gap-1.5"
                title={rateDisplay ? `Tipo de cambio en vivo: ${rateDisplay}` : undefined}
              >
                <span className="font-mono">{effectiveMeta?.symbol ?? "S/."}</span>
                <span className="text-[var(--text-secondary)]">{currency}</span>
                {rateDisplay && (
                  <span className={cn(
                    "text-[10px] num hidden sm:inline",
                    hasCustomRate ? "text-[var(--color-warning)] font-semibold" : "text-[var(--text-disabled)]"
                  )}>
                    · {rateDisplay}
                  </span>
                )}
                {hasCustomRate && (
                  <span className="inline-flex items-center rounded px-1 py-px text-[8px] font-semibold uppercase tracking-wider" style={{ backgroundColor: "color-mix(in srgb, var(--color-warning) 15%, transparent)", color: "var(--color-warning)" }} title="Tipo de cambio personalizado">
                    <Pencil className="h-2 w-2" />
                  </span>
                )}
                <ChevronDown className="h-3 w-3 text-[var(--text-secondary)]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                Moneda · TC en vivo
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {liveCurrencies.map((c) => {
                const active = c.code === currency;
                return (
                  <DropdownMenuItem
                    key={c.code}
                    onClick={() => setCurrency(c.code as CurrencyCode)}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer py-2",
                      active && "bg-[var(--brand-primary-subtle)]"
                    )}
                  >
                    <span className="font-mono text-sm w-6">{c.symbol}</span>
                    <span className="text-sm font-medium flex-1">{c.code}</span>
                    <span className="text-[10px] text-[var(--text-secondary)] num">
                      {c.code === "USD" ? "base" : `1$ = ${c.symbol}${c.rateFromUsd.toFixed(3)}`}
                    </span>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              {/* v3.3.1: Custom exchange rate editor — MYPEs can override the
                  official TC with their own negotiated rate. */}
              {currency !== "USD" && (
                <>
                  {hasCustomRate && (
                    <div className="mx-2 mb-1 rounded-md border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-2 py-1.5">
                      <div className="text-[10px] font-semibold text-[var(--color-warning)] flex items-center gap-1">
                        <Pencil className="h-3 w-3" /> TC personalizado
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                        1$ = {effectiveMeta?.symbol}{effectiveMeta?.rateFromUsd.toFixed(4)} (tú)
                      </div>
                      <div className="text-[9px] text-[var(--text-disabled)]">
                        Oficial: {effectiveMeta?.symbol}{currentCurrencyMeta?.rateFromUsd.toFixed(4)}
                      </div>
                    </div>
                  )}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      const input = prompt(
                        `Tu tipo de cambio para ${currency}\n(oficial: ${currentCurrencyMeta?.rateFromUsd.toFixed(4)})\n\nIngresa cuántos ${currency} = 1 USD:`,
                        String(effectiveMeta?.rateFromUsd.toFixed(4) ?? "")
                      );
                      if (input != null) {
                        const rate = parseFloat(input.replace(",", "."));
                        if (!isNaN(rate) && rate > 0) {
                          setCustomExchangeRate(currency, rate);
                        }
                      }
                    }}
                    className="flex items-center gap-2 cursor-pointer py-2"
                  >
                    <Pencil className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                    <span className="text-xs">{hasCustomRate ? "Editar mi TC" : "Usar mi propio TC"}</span>
                  </DropdownMenuItem>
                  {hasCustomRate && (
                    <DropdownMenuItem
                      onClick={() => resetExchangeRate(currency)}
                      className="flex items-center gap-2 cursor-pointer py-2"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                      <span className="text-xs text-[var(--text-secondary)]">Restablecer TC oficial</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}
              <div className="px-2 py-1.5 text-[10px] text-[var(--text-disabled)]">
                {hasCustomRate ? "TC personalizado (localStorage)" : "Open ER-API · actualizado"} {data ? "hoy" : "—"}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Theme selector — 4 themes only: Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-[var(--bg-overlay)]"
              aria-label="Cambiar tema"
            >
              {theme === "dark" || theme === "negro-puro" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
              Tema
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { id: "light" as const, label: "Linear Claro", desc: "Tema claro profesional" },
              { id: "dark" as const, label: "Linear Oscuro", desc: "Tema oscuro profesional" },
              { id: "blanco-puro" as const, label: "Blanco Puro", desc: "Minimalista total" },
              { id: "negro-puro" as const, label: "Negro Puro", desc: "Minimalista oscuro" },
            ].map((t) => {
              const active = theme === t.id;
              return (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex items-start gap-2 py-2 cursor-pointer",
                    active && "bg-[var(--brand-primary-subtle)]"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">{t.desc}</div>
                  </div>
                  {active && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--brand-primary)] shrink-0 mt-1" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
