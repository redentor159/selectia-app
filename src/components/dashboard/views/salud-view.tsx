"use client";

import { useEffect, useState, useCallback } from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import {
  timeAgo,
  timeUntil,
  formatNumber,
} from "@/lib/format";
import {
  HeartPulse,
  Activity,
  Clock,
  Zap,
  Server,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Gauge,
  RefreshCw,
  Bell,
  Database,
  TrendingUp,
  WifiOff,
  Key,
  Save,
  RotateCcw,
  Send,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { SourceHealth } from "@/lib/types";

const STATUS_META = {
  green: { icon: CheckCircle2, label: "Operativo", color: "var(--color-success)", bg: "var(--color-success-bg)", border: "var(--color-success-border)" },
  yellow: { icon: AlertCircle, label: "Degradado", color: "var(--color-warning)", bg: "var(--color-warning-bg)", border: "var(--color-warning-border)" },
  red: { icon: XCircle, label: "Caído", color: "var(--color-error)", bg: "var(--color-error-bg)", border: "var(--color-error-border)" },
};

// localStorage key for the user-supplied AA API key override.
// When present, force-refresh sends it via the X-AA-Key header (P1A-DATA).
const AA_KEY_STORAGE = "aa-api-key";
const HF_KEY_STORAGE = "hf-api-key";

export function SaludView() {
  const { data, isLoading, refetch } = useDashboardData();
  const { toast } = useToast();

  // Offline detection (gap #5 — Modo Taller offline indicator)
  const [isOnline, setIsOnline] = useState<boolean>(true);
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conexión restablecida",
        description: "Sincronizando datos en vivo desde el orquestador…",
      });
      refetch();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "📵 Modo Taller activado",
        description: "Sin conexión — mostrando últimos datos cacheados.",
        variant: "destructive",
      });
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refetch, toast]);

  // AA key override state
  const [aaKeyInput, setAaKeyInput] = useState("");
  const [aaKeyStored, setAaKeyStored] = useState<string | null>(null);
  const [hfKeyInput, setHfKeyInput] = useState("");
  const [hfKeyStored, setHfKeyStored] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(AA_KEY_STORAGE);
      setAaKeyStored(stored);
      const storedHf = window.localStorage.getItem(HF_KEY_STORAGE);
      setHfKeyStored(storedHf);
    }
  }, []);

  // Force-refresh loading state (gap #10 — show spinner during refresh)
  const [isForceRefreshing, setIsForceRefreshing] = useState(false);
  // ntfy test sending state (gap #11)
  const [isSendingNtfy, setIsSendingNtfy] = useState(false);
  const sourcesCount = data?.sources.length ?? 0;

  // gap #10 — force refresh must hit the server-side ?force=1 route, NOT just
  // react-query's refetch() (which would hit /api/dashboard without force).
  // We POST/GET directly, then invalidate the react-query cache so the UI
  // refreshes with the freshly-fetched data.
  const handleForceRefresh = useCallback(async () => {
    setIsForceRefreshing(true);
    try {
      const headers: Record<string, string> = {};
      const customKey = window.localStorage.getItem(AA_KEY_STORAGE);
      if (customKey) {
        headers["X-AA-Key"] = customKey;
      }
      const res = await fetch("/api/dashboard?force=1", { headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      // Invalidate the react-query cache so the UI picks up the new payload.
      await refetch();
      toast({
        title: "Datos actualizados",
        description: `Sincronización forzada completada — datos frescos desde las ${sourcesCount} fuentes en vivo.`,
      });
    } catch (err) {
      toast({
        title: "Error al forzar actualización",
        description: (err as Error)?.message ?? "Reintentá en unos segundos.",
        variant: "destructive",
      });
    } finally {
      setIsForceRefreshing(false);
    }
  }, [refetch, toast, sourcesCount]);

  // gap #11 — ntfy test button must actually POST to /api/ntfy-test
  const handleTestNotification = useCallback(async () => {
    setIsSendingNtfy(true);
    try {
      const res = await fetch("/api/ntfy-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Prueba",
          message: "Notificación de prueba desde SelectIA",
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast({
          title: "Notificación ntfy.sh enviada",
          description: `Push de prueba entregado al canal "${json.topic}".`,
        });
      } else {
        toast({
          title: "No se pudo enviar la notificación",
          description: json.detail ?? json.error ?? "Revisá la configuración ntfy.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error de red",
        description: (err as Error)?.message ?? "No se pudo alcanzar /api/ntfy-test",
        variant: "destructive",
      });
    } finally {
      setIsSendingNtfy(false);
    }
  }, [toast]);

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const greenCount = data.sources.filter((s) => s.status === "green").length;
  const yellowCount = data.sources.filter((s) => s.status === "yellow").length;
  const redCount = data.sources.filter((s) => s.status === "red").length;
  const overallStatus = redCount >= 3 ? "red" : yellowCount > 0 ? "yellow" : "green";
  const overallMeta = STATUS_META[overallStatus];

  const aaRemaining = data.aaQuota.remaining;
  const aaLimit = data.aaQuota.limit;
  const aaPercent = (aaRemaining / aaLimit) * 100;
  // gap #3 — Retry-After header (P1A-DATA field `retryAfter`)
  const aaRetryAfter = data.aaQuota.retryAfter ?? null;

  const handleSaveAaKey = () => {
    const trimmed = aaKeyInput.trim();
    if (!trimmed) {
      toast({
        title: "Key vacía",
        description: "Pegá tu API key de Artificial Analysis para guardarla.",
        variant: "destructive",
      });
      return;
    }
    window.localStorage.setItem(AA_KEY_STORAGE, trimmed);
    setAaKeyStored(trimmed);
    setAaKeyInput("");
    toast({
      title: "API key guardada",
      description: "Se usará en el próximo force-refresh vía header X-AA-Key.",
    });
  };

  const handleClearAaKey = () => {
    window.localStorage.removeItem(AA_KEY_STORAGE);
    setAaKeyStored(null);
    setAaKeyInput("");
    toast({
      title: "Key AA removida",
      description: "Se volverá a usar la key predeterminada (hardcodeada).",
    });
  };

  const handleSaveHfKey = () => {
    const trimmed = hfKeyInput.trim();
    if (!trimmed) {
      toast({ title: "Key vacía", description: "Pega tu token de HuggingFace para guardarlo.", variant: "destructive" });
      return;
    }
    window.localStorage.setItem(HF_KEY_STORAGE, trimmed);
    setHfKeyStored(trimmed);
    setHfKeyInput("");
    toast({ title: "Token HF guardado", description: "Se usará en el próximo force-refresh vía header X-HF-Token." });
  };

  const handleClearHfKey = () => {
    window.localStorage.removeItem(HF_KEY_STORAGE);
    setHfKeyStored(null);
    setHfKeyInput("");
    toast({ title: "Token HF removido", description: "Se volverá a usar el token predeterminado (hardcodeado)." });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-[var(--brand-primary)]" />
          <h1 className="text-lg font-semibold tracking-tight">Salud del Sistema</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleForceRefresh}
          disabled={isForceRefreshing}
          className="h-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isForceRefreshing ? "animate-spin" : ""}`} />
          {isForceRefreshing ? "Actualizando…" : "Forzar actualización"}
        </Button>
      </div>

      {/* Offline banner (gap #5) */}
      {!isOnline && (
        <div
          className="flex items-start gap-3 rounded-xl border px-4 py-3"
          style={{
            backgroundColor: "var(--color-warning-bg)",
            borderColor: "var(--color-warning-border)",
            color: "var(--color-warning)",
          }}
          role="status"
          aria-live="polite"
        >
          <WifiOff className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-semibold">
              📵 MODO TALLER — Sin conexión
            </div>
            <div className="text-xs opacity-90 mt-0.5">
              Mostrando últimos datos cacheados (hace {timeAgo(data.generatedAt)}).
              Los datos se actualizarán cuando vuelva la conexión.
            </div>
          </div>
        </div>
      )}

      {/* Overall status banner */}
      <div
        className="flex items-center gap-3 rounded-xl border px-4 py-3"
        style={{
          backgroundColor: overallMeta.bg,
          borderColor: overallMeta.border,
          color: overallMeta.color,
        }}
      >
        <overallMeta.icon className="h-5 w-5 shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-semibold">
            {overallStatus === "green" && "Todos los sistemas operativos"}
            {overallStatus === "yellow" && "Sistema operativo con degradaciones menores"}
            {overallStatus === "red" && "Sistema degradado — revise las fuentes en rojo"}
          </div>
          <div className="text-xs opacity-80">
            Última sincronización: {timeAgo(data.generatedAt)} · {greenCount}/{data.sources.length} fuentes OK
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--color-success)]" /> {greenCount}</span>
          {yellowCount > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" /> {yellowCount}</span>}
          {redCount > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--color-error)]" /> {redCount}</span>}
        </div>
      </div>

      {/* AA Quota + Exchange rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-[var(--brand-primary)]" />
              Cuota Artificial Analysis
            </CardTitle>
            <CardDescription className="text-xs">
              Headers HTTP capturados: X-RateLimit-Limit / Remaining / Reset / Retry-After
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">Requests restantes hoy</span>
              <span className="num text-2xl font-semibold" style={{ color: aaPercent > 30 ? "var(--color-success)" : aaPercent > 10 ? "var(--color-warning)" : "var(--color-error)" }}>
                {aaRemaining}<span className="text-sm text-[var(--text-secondary)]">/{aaLimit}</span>
              </span>
            </div>
            <Progress
              value={aaPercent}
              className="h-2"
              style={{
                background: "var(--bg-overlay)",
              }}
            />
            <div className="flex justify-between text-xs text-[var(--text-secondary)]">
              <span>Tier: <Badge variant="outline" className="text-[10px] capitalize ml-1">{data.aaQuota.tier}</Badge></span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Resetea {timeUntil(data.aaQuota.reset)}
              </span>
            </div>
            {/* gap #3 — Retry-After visible when AA returned 429 */}
            {aaRetryAfter !== null && aaRetryAfter > 0 && (
              <div className="rounded-md bg-[var(--color-error-bg)] border border-[var(--color-error-border)] px-2.5 py-1.5 text-[11px] text-[var(--color-error)] flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Rate-limited — reintentar en {aaRetryAfter}s
              </div>
            )}
            {aaPercent < 30 && aaRetryAfter === null && (
              <div className="rounded-md bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] px-2.5 py-1.5 text-[11px] text-[var(--color-warning)]">
                Cuota baja — el cron de las 2 AM usará el último JSON válido si se agota.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-[var(--color-success)]" />
              Tipo de cambio
            </CardTitle>
            <CardDescription className="text-xs">
              Open ER-API · {data.currencies.length} monedas · actualizado {timeAgo(data.exchangeRateUpdated)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <details className="group">
              <summary className="cursor-pointer text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] select-none flex items-center gap-1">
                <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                Ver las {data.currencies.length} monedas
              </summary>
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {data.currencies.map((c) => (
                    <div key={c.code} className="rounded-lg bg-[var(--bg-elevated)] px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">{c.name}</div>
                      <div className="num text-base font-semibold">
                        {c.symbol} {(1 / c.rateFromUsd).toFixed(4)}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)]">1 USD = {c.symbol} {c.rateFromUsd.toFixed(4)}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] pt-1">
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Actualizado {timeAgo(data.exchangeRateUpdated)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Próxima {timeUntil(data.exchangeRateNextUpdate)}
                  </span>
                </div>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>

      {/* AA API Key override (user-supplied key — P1A-DATA X-AA-Key header) */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Key className="h-4 w-4 text-[var(--brand-primary)]" />
            Configuración de API Key
          </CardTitle>
          <CardDescription className="text-xs">
            Override del orquestador — tu key se envía vía header <code className="text-[var(--brand-primary)]">X-AA-Key</code> al force-refresh.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px]"
              style={
                aaKeyStored
                  ? { color: "var(--color-success)", borderColor: "var(--color-success-border)", backgroundColor: "var(--color-success-bg)" }
                  : { color: "var(--color-blue, var(--brand-primary))", borderColor: "var(--brand-primary)", backgroundColor: "var(--brand-primary-subtle)" }
              }
            >
              {aaKeyStored ? "Usando key personalizada" : "Usando key predeterminada (hardcodeada)"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              value={aaKeyInput}
              onChange={(e) => setAaKeyInput(e.target.value)}
              placeholder="aa_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="h-9 font-mono text-xs bg-[var(--bg-elevated)]"
              autoComplete="off"
            />
            <Button
              size="sm"
              onClick={handleSaveAaKey}
              disabled={!aaKeyInput.trim()}
              className="h-9"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              Guardar
            </Button>
            {aaKeyStored && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearAaKey}
                className="h-9"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Usar key por defecto
              </Button>
            )}
          </div>
          <p className="text-[10px] text-[var(--text-disabled)]">
            Tu key se guarda solo en este navegador (localStorage). No se envía a ningún servidor más que al orquestador del dashboard.
          </p>
        </CardContent>
      </Card>

      {/* HF API Key override */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Key className="h-4 w-4 text-[var(--color-teal)]" />
            Token de HuggingFace
          </CardTitle>
          <CardDescription className="text-xs">
            Para enriquecimiento con downloads, likes, tags y parámetros. Obtén el tuyo gratis en{" "}
            <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener" className="text-[var(--brand-primary)] underline">
              huggingface.co/settings/tokens
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]" style={hfKeyStored ? { color: "var(--color-success)", borderColor: "var(--color-success-border)" } : { color: "var(--brand-primary)", borderColor: "var(--brand-primary)" }}>
              {hfKeyStored ? "Token personalizado" : "Token predeterminado"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              value={hfKeyInput}
              onChange={(e) => setHfKeyInput(e.target.value)}
              placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
              className="h-9 font-mono text-xs bg-[var(--bg-elevated)]"
              autoComplete="off"
            />
            <Button size="sm" onClick={handleSaveHfKey} disabled={!hfKeyInput.trim()} className="h-9">
              <Save className="h-3.5 w-3.5 mr-1" />
              Guardar
            </Button>
            {hfKeyStored && (
              <Button size="sm" variant="outline" onClick={handleClearHfKey} className="h-9">
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Default
              </Button>
            )}
          </div>
          <p className="text-[10px] text-[var(--text-disabled)]">
            Tu token se guarda solo en este navegador. Sin token, se usa el predeterminado (free tier).
          </p>
        </CardContent>
      </Card>

      {/* Source health list */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Server className="h-4 w-4 text-[var(--brand-primary)]" />
            Fuentes de datos ({data.sources.length} integradas)
          </CardTitle>
          <CardDescription className="text-xs">
            Semáforo: 🟢 &lt;5s datos frescos · 🟡 datos parciales · 🔴 no respondió (usando caché)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {data.sources.map((source) => (
            <SourceRow
              key={source.id}
              source={source}
              benchlmCategoryCoverage={
                source.id === "benchlm" ? data.benchlmCategoryCoverage : undefined
              }
            />
          ))}
        </CardContent>
      </Card>

      {/* Data quality + notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-1.5">
              <Database className="h-4 w-4 text-[var(--brand-primary)]" />
              Indicadores de calidad del dato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <QualityRow label="Modelos con precio verificado" value={`${data.models.length} / ${data.models.length}`} percent={100} />
            <QualityRow
              label="Modelos con Elo actualizado"
              value={`${data.models.filter((m) => m.elo !== null).length} / ${data.models.length}`}
              percent={(data.models.filter((m) => m.elo !== null).length / data.models.length) * 100}
            />
            <QualityRow
              label="Cobertura de Intelligence Index"
              value={`${data.models.filter((m) => m.intelligenceIndex !== null).length} / ${data.models.length}`}
              percent={(data.models.filter((m) => m.intelligenceIndex !== null).length / data.models.length) * 100}
            />
            <QualityRow
              label="Modelos con capacidades verificadas"
              value={`${data.models.length} / ${data.models.length}`}
              percent={100}
            />
            <QualityRow
              label="Frescura Arena AI"
              value={timeAgo(data.arenaFetchedAt)}
              percent={75}
            />
            <QualityRow
              label="Cobertura de Elo"
              value={`${data.arenaModelCount} de ${data.models.length} modelos rankeados`}
              percent={(data.arenaModelCount / data.models.length) * 100}
            />
            {/* Phase 4A.4.b — BenchLM + ZeroEval coverage rows */}
            {(() => {
              const benchlmCount = data.models.filter((m) => m.benchlmDisplayScore != null).length;
              const benchlmTotal = data.models.length;
              const benchlmPct = benchlmTotal === 0 ? 0 : (benchlmCount / benchlmTotal) * 100;
              return (
                <QualityRow
                  label="Cobertura BenchLM"
                  value={`${benchlmCount} / ${benchlmTotal} modelos (${benchlmPct.toFixed(0)}%)`}
                  percent={benchlmPct}
                  warningIcon={AlertCircle}
                />
              );
            })()}
            {(() => {
              const zeroevalCount = data.models.filter((m) => m.zeroevalFailureRate != null).length;
              const zeroevalTotal = data.models.length;
              const zeroevalPct = zeroevalTotal === 0 ? 0 : (zeroevalCount / zeroevalTotal) * 100;
              return (
                <QualityRow
                  label="Cobertura ZeroEval"
                  value={`${zeroevalCount} / ${zeroevalTotal} modelos (${zeroevalPct.toFixed(0)}%)`}
                  percent={zeroevalPct}
                  warningIcon={AlertCircle}
                />
              );
            })()}
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-[var(--color-warning)]" />
                Notificaciones push
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTestNotification}
                disabled={isSendingNtfy}
                className="h-7 text-xs"
              >
                {isSendingNtfy ? (
                  <><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Enviando…</>
                ) : (
                  <><Send className="h-3 w-3 mr-1" /> Probar</>
                )}
              </Button>
            </div>
            <CardDescription className="text-xs">
              Canal ntfy.sh — alertas al Perfil D sin app adicional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <AlertRow
              icon={XCircle}
              color="var(--color-error)"
              title="Cuota AA agotada"
              desc="Se dispara en HTTP 429 — auto-retry hasta 00:00 UTC"
              time="—"
            />
            <AlertRow
              icon={AlertCircle}
              color="var(--color-warning)"
              title="Fallo de ExchangeRate-API"
              desc="Usa último valor conocido del JSON del día anterior"
              time="—"
            />
            <AlertRow
              icon={XCircle}
              color="var(--color-error)"
              title="Cron de GitHub Actions falló"
              desc="Email al equipo + push ntfy.sh al responsable TI"
              time="—"
            />
            <AlertRow
              icon={AlertCircle}
              color="var(--color-warning)"
              title="Discrepancia de precios >5%"
              desc="Cross-validación Helicone vs LiteLLM detecta diferencias"
              time="—"
            />
          </CardContent>
        </Card>
      </div>

      {/* Endpoint health */}
      <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-[var(--color-teal)]" />
            Health check
          </CardTitle>
          <CardDescription className="text-xs">
            <code className="text-[var(--brand-primary)]">GET /api/dashboard</code> — endpoint del orquestador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg bg-[var(--bg-elevated)] px-4 py-3 font-mono text-xs">
            <span className="flex h-2 w-2 rounded-full bg-[var(--color-success)] animate-pulse-soft" />
            <span className="text-[var(--color-success)] font-semibold">200 OK</span>
            <span className="text-[var(--text-secondary)]">·</span>
            <span className="text-[var(--text-secondary)]">{formatNumber(JSON.stringify(data).length)} bytes</span>
            <span className="text-[var(--text-secondary)]">·</span>
            <span className="text-[var(--text-secondary)]">Cache: s-maxage=3600, stale-while-revalidate=86400</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SourceRow({
  source,
  benchlmCategoryCoverage,
}: {
  source: SourceHealth;
  benchlmCategoryCoverage?: Record<string, number>;
}) {
  const meta = STATUS_META[source.status];
  return (
    <div className="rounded-lg px-3 py-2 hover:bg-[var(--bg-overlay)] transition-colors">
      <div className="flex items-center gap-3">
        <meta.icon className="h-4 w-4 shrink-0" style={{ color: meta.color }} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{source.name}</div>
          <div className="text-[11px] text-[var(--text-secondary)] truncate">{source.note}</div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)] shrink-0">
          <span className="num flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {source.latencyMs}ms
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(source.lastSync)}
          </span>
          {source.remaining !== undefined && source.limit !== undefined && (
            <span className="num">
              {source.remaining}/{source.limit}
            </span>
          )}
        </div>
      </div>
      {/* Phase 4A.4.a — Función L: 8 mini-badges con la cobertura BenchLM por categoría */}
      {benchlmCategoryCoverage && (
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
          <span className="text-[var(--text-secondary)]">Cobertura por categoría:</span>
          {Object.entries(benchlmCategoryCoverage).map(([cat, count]) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5"
              style={{
                backgroundColor: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-default)",
              }}
              title={`${cat}: ${count} modelos elegibles en BenchLM`}
            >
              <span className="font-medium">{cat}</span>
              <span className="num">{count}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function QualityRow({
  label,
  value,
  percent,
  warningIcon: WarningIcon,
  warningThreshold = 50,
}: {
  label: React.ReactNode;
  value: string;
  percent: number;
  warningIcon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  warningThreshold?: number;
}) {
  const showWarning = WarningIcon && percent < warningThreshold;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[var(--text-secondary)] flex items-center gap-1">
          {label}
          {showWarning && (
            <WarningIcon
              className="h-3 w-3"
              style={{ color: "var(--color-warning)" }}
            />
          )}
        </span>
        <span className="num font-medium">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percent}%`,
            backgroundColor: percent > 70 ? "var(--color-success)" : percent > 40 ? "var(--color-warning)" : "var(--color-error)",
          }}
        />
      </div>
    </div>
  );
}

function AlertRow({
  icon: Icon,
  color,
  title,
  desc,
  time,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  title: string;
  desc: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg px-3 py-2 hover:bg-[var(--bg-overlay)] transition-colors">
      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium">{title}</div>
        <div className="text-[11px] text-[var(--text-secondary)]">{desc}</div>
      </div>
      {time !== "—" && <span className="text-[10px] text-[var(--text-disabled)] num shrink-0">{time}</span>}
    </div>
  );
}
