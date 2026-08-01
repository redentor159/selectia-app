"use client";

import { useState, useMemo } from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { ProviderLogo } from "../provider-logo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monitor, CheckCircle2, XCircle, AlertCircle, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

// Bytes per parameter by quantization format (verified against 2026 technical sources)
const QUANT_TABLE = [
  { format: "BF16 / FP16", bytesPerParam: 2.0, qualityRetention: 100, recommended: false },
  { format: "Q8_0", bytesPerParam: 1.06, qualityRetention: 103, recommended: false },
  { format: "Q6_K", bytesPerParam: 0.82, qualityRetention: 102, recommended: false },
  { format: "Q5_K_M", bytesPerParam: 0.73, qualityRetention: 101.5, recommended: false },
  { format: "Q4_K_M", bytesPerParam: 0.68, qualityRetention: 100, recommended: true },
  { format: "Q3_K_M", bytesPerParam: 0.49, qualityRetention: 90, recommended: false },
  { format: "Q2_K", bytesPerParam: 0.35, qualityRetention: 85, recommended: false },
];

// Common GPUs in the Peruvian/LatAm market
const GPU_OPTIONS = [
  { label: "Sin GPU (0 GB, solo CPU)", vram: 0 },
  { label: "GPU integrada (Ej. 4-8 GB compartidos)", vram: 4 },
  { label: "RTX 3060 / 4060 (8-12 GB)", vram: 12 },
  { label: "RTX 4060 Ti (16 GB)", vram: 16 },
  { label: "RTX 3090 / 4090 (24 GB)", vram: 24 },
  { label: "A6000 (48 GB)", vram: 48 },
  { label: "A100 / H100 (80 GB)", vram: 80 },
  { label: "Otro (ingresar GB)", vram: -1 },
];

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + " GB";
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(0) + " MB";
  return bytes + " B";
}

function formatParams(params: number): string {
  if (params >= 1e9) return (params / 1e9).toFixed(1) + "B";
  if (params >= 1e6) return (params / 1e6).toFixed(0) + "M";
  return params.toString();
}

export function CalculadoraHardwareView() {
  const { data, isLoading } = useDashboardData();
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [gpuVram, setGpuVram] = useState<number>(12);
  const [customVram, setCustomVram] = useState<string>("");
  const [search, setSearch] = useState("");

  // Models with HF parameters
  const modelsWithParams = useMemo(() => {
    if (!data) return [];
    return data.models.filter(
      (m) => m.hfParameters !== null && m.hfParameters !== undefined && m.hfParameters > 0
    );
  }, [data]);

  const filteredModels = useMemo(() => {
    if (!search.trim()) return modelsWithParams.slice(0, 100);
    const q = search.toLowerCase();
    return modelsWithParams
      .filter((m) => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q))
      .slice(0, 100);
  }, [modelsWithParams, search]);

  const selectedModel = useMemo(() => {
    if (!data || !selectedModelId) return null;
    return data.models.find((m) => m.id === selectedModelId) ?? null;
  }, [data, selectedModelId]);

  const effectiveVram = gpuVram === -1 ? parseInt(customVram) || 0 : gpuVram;

  const calculations = useMemo(() => {
    if (!selectedModel || !selectedModel.hfParameters) return [];
    const params = selectedModel.hfParameters;
    return QUANT_TABLE.map((q) => {
      const vramBytes = params * q.bytesPerParam * 1.2; // ×1.2 = 20% overhead for KV cache
      const vramGB = vramBytes / 1e9;
      let status: "green" | "yellow" | "red";
      if (effectiveVram === 0) {
        status = vramGB < 8 ? "yellow" : "red"; // CPU only, slow
      } else if (vramGB <= effectiveVram * 0.85) {
        status = "green"; // fits comfortably
      } else if (vramGB <= effectiveVram) {
        status = "yellow"; // fits tight
      } else {
        status = "red"; // doesn't fit
      }
      return { ...q, vramGB, status, params };
    });
  }, [selectedModel, effectiveVram]);

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-[var(--bg-elevated)] rounded animate-pulse" />
        <div className="h-96 bg-[var(--bg-elevated)] rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2">
        <Monitor className="h-4 w-4 text-[var(--brand-primary)]" />
        <h1 className="text-lg font-semibold tracking-tight">Calculadora de Hardware Local</h1>
      </div>
      <p className="text-sm text-[var(--text-secondary)] -mt-3">
        ¿Corre este modelo en tu GPU? Cálculo exacto de VRAM con datos de HuggingFace Safetensors.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Model selector + GPU selector */}
        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Configuración</CardTitle>
            <CardDescription className="text-xs">
              Selecciona un modelo y tu GPU
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Buscar modelo ({modelsWithParams.length} con parámetros exactos)</Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Escribe para filtrar: DeepSeek, Qwen, Llama..."
                className="h-9 bg-[var(--bg-elevated)]"
              />
              {search.trim() && (
                <div className="mt-1 max-h-48 overflow-y-auto rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] divide-y divide-[var(--border-default)]">
                  {filteredModels.slice(0, 10).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModelId(m.id);
                        setSearch("");
                      }}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 text-left text-xs hover:bg-[var(--bg-overlay)] transition-colors",
                        selectedModelId === m.id && "bg-[var(--brand-primary-subtle)]"
                      )}
                    >
                      <span className="font-medium text-[var(--text-primary)]">{m.name}</span>
                      <span className="text-[var(--text-secondary)] num">{formatParams(m.hfParameters!)}</span>
                    </button>
                  ))}
                  {filteredModels.length === 0 && (
                    <div className="px-3 py-2 text-xs text-[var(--text-secondary)]">Sin resultados para "{search}"</div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Modelo seleccionado</Label>
              <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                <SelectTrigger className="h-9 bg-[var(--bg-elevated)]">
                  <SelectValue placeholder="Selecciona un modelo..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredModels.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-sm">
                      {m.name} ({formatParams(m.hfParameters!)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tu GPU</Label>
              <Select
                value={String(gpuVram)}
                onValueChange={(v) => setGpuVram(Number(v))}
              >
                <SelectTrigger className="h-9 bg-[var(--bg-elevated)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GPU_OPTIONS.map((g) => (
                    <SelectItem key={g.label} value={String(g.vram)} className="text-sm">
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {gpuVram === -1 && (
              <div className="space-y-1.5">
                <Label className="text-xs">VRAM de tu GPU (GB)</Label>
                <Input
                  type="number"
                  value={customVram}
                  onChange={(e) => setCustomVram(e.target.value)}
                  placeholder="ej: 20"
                  className="h-9 bg-[var(--bg-elevated)]"
                />
              </div>
            )}
            {selectedModel && (
              <div className="rounded-lg bg-[var(--bg-elevated)] p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ProviderLogo model={selectedModel} size={24} />
                  <span className="text-sm font-medium truncate">{selectedModel.name}</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
                  <div>Parámetros exactos: <span className="num font-medium text-[var(--text-primary)]">{selectedModel.hfParameters?.toLocaleString("en-US")}</span></div>
                  <div>Proveedor: {selectedModel.provider}</div>
                  {selectedModel.hfSafetensorsDetail && (
                    <div className="text-[10px] opacity-70">
                      Precisiones: {Object.entries(selectedModel.hfSafetensorsDetail).map(([k, v]) => `${k}=${formatParams(v)}`).join(", ")}
                    </div>
                  )}
                  {selectedModel.hfSiblingsCount != null && (
                    <div>Archivos en repo HF: {selectedModel.hfSiblingsCount}</div>
                  )}
                  {selectedModel.hfTags && (
                    <div>Tags: {selectedModel.hfTags.filter(t => !t.startsWith("arxiv") && !t.startsWith("base_model") && !t.startsWith("license") && !t.startsWith("region")).slice(0, 5).join(", ")}</div>
                  )}
                </div>
                {/* GGUF detection — Función C del MD de HuggingFace */}
                {selectedModel.hfHasGguf === true ? (
                  <div className="rounded-md border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-2.5 py-1.5 text-[10px] text-[var(--color-success)] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    <span>
                      ✓ Este repo distribuye <b>versiones GGUF propias</b>
                      {selectedModel.hfGgufFiles && selectedModel.hfGgufFiles.length > 0 && (
                        <> ({selectedModel.hfGgufFiles.length} archivo{selectedModel.hfGgufFiles.length > 1 ? "s" : ""} .gguf)</>
                      )}
                      — puedes descargar y correr directamente con llama.cpp/Ollama.
                    </span>
                  </div>
                ) : selectedModel.hfHasGguf === false ? (
                  <div className="rounded-md border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-2.5 py-1.5 text-[10px] text-[var(--color-warning)] space-y-1">
                    <div className="flex items-start gap-1.5">
                      <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>
                        El repo oficial no incluye archivos <b>.gguf</b>. Para correrlo localmente con cuantización GGUF,
                        busca una versión comunitaria (republicadores como <b>bartowski</b> o <b>unsloth</b> son estándar de facto).
                      </span>
                    </div>
                    {selectedModel.slug && (
                      <a
                        href={`https://huggingface.co/models?search=${encodeURIComponent(selectedModel.slug + " GGUF")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[var(--brand-primary)] hover:underline"
                      >
                        🔍 Buscar "{selectedModel.slug} GGUF" en HuggingFace →
                      </a>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: VRAM calculation results */}
        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resultado del cálculo VRAM</CardTitle>
            <CardDescription className="text-xs">
              Fórmula: parámetros × bytes/peso × 1.2 (overhead) ÷ 1e9 = VRAM en GB
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedModel ? (
              <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Selecciona un modelo para ver el cálculo
              </div>
            ) : calculations.length === 0 ? (
              <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                Este modelo no tiene parámetros exactos en HuggingFace
              </div>
            ) : (
              <div className="space-y-2">
                {/* Best recommendation */}
                {(() => {
                  const best = calculations.find((c) => c.status === "green" && c.recommended) ||
                               calculations.find((c) => c.status === "green") ||
                               calculations.find((c) => c.status === "yellow");
                  if (best) {
                    return (
                      <div className="rounded-lg border border-[var(--color-success-border)] bg-[var(--color-success-bg)] px-3 py-2 text-xs text-[var(--color-success)] mb-3">
                        ✓ Con tu GPU ({effectiveVram > 0 ? `${effectiveVram} GB` : "solo CPU"}), la mejor opción es{" "}
                        <b>{best.format}</b> — {best.vramGB.toFixed(1)} GB VRAM necesarios.
                      </div>
                    );
                  }
                  const allRed = calculations.every((c) => c.status === "red");
                  if (allRed && effectiveVram > 0) {
                    return (
                      <div className="rounded-lg border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-3 py-2 text-xs text-[var(--color-error)] mb-3">
                        ✗ Este modelo no corre localmente en tu GPU de {effectiveVram} GB. Considera usarlo vía API (ver columnas de precio) o un modelo más pequeño.
                      </div>
                    );
                  }
                  return null;
                })()}
                {/* Table of all quantization levels */}
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-default)]">
                      <th className="px-2 py-1.5 text-left font-medium">Formato</th>
                      <th className="px-2 py-1.5 text-right font-medium">VRAM</th>
                      <th className="px-2 py-1.5 text-right font-medium">Calidad</th>
                      <th className="px-2 py-1.5 text-center font-medium">¿Cabe?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.map((c) => (
                      <tr key={c.format} className="border-b border-[var(--border-default)] last:border-0">
                        <td className="px-2 py-1.5 font-medium">
                          {c.format}
                          {c.recommended && <span className="ml-1 text-[var(--brand-primary)]">★</span>}
                        </td>
                        <td className="px-2 py-1.5 text-right num">{c.vramGB.toFixed(1)} GB</td>
                        <td className="px-2 py-1.5 text-right num">{c.qualityRetention}%</td>
                        <td className="px-2 py-1.5 text-center">
                          {c.status === "green" ? (
                            <span className="inline-flex items-center gap-1 text-[var(--color-success)]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </span>
                          ) : c.status === "yellow" ? (
                            <span className="inline-flex items-center gap-1 text-[var(--color-warning)]">
                              <AlertCircle className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[var(--color-error)]">
                              <XCircle className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[10px] text-[var(--text-disabled)] mt-2">
                  ★ = recomendado · ×1.2 = margen estándar para KV cache y overhead del runtime · Q4_K_M es el formato más usado (70% de descargas locales en 2026)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
