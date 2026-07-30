"use client";

import { useMemo, useState } from "react";
import { useDashboardStore } from "@/store/dashboard-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  QrCode,
  Download,
  Copy,
  Hash,
  Package,
  Layers,
  Cog,
} from "lucide-react";

interface QrData {
  otNumber: string;
  pieceName: string;
  material: string;
  operation: string;
}

export function QrGeneratorView() {
  const { toast } = useToast();
  const [data, setData] = useState<QrData>({
    otNumber: "",
    pieceName: "",
    material: "",
    operation: "",
  });

  // Build compact payload
  const payload = useMemo(() => {
    const parts = [
      `OT:${data.otNumber || "—"}`,
      `PIEZA:${data.pieceName || "—"}`,
      `MAT:${data.material || "—"}`,
      `OP:${data.operation || "—"}`,
    ];
    return parts.join("|");
  }, [data]);

  const qrUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        payload
      )}`,
    [payload]
  );

  const handleDownload = async () => {
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR-OT-${data.otNumber || "sin-OT"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "QR descargado",
        description: `Archivo: QR-OT-${data.otNumber || "sin-OT"}.png`,
      });
    } catch {
      toast({
        title: "No se pudo descargar",
        description: "Intenta hacer clic derecho en la imagen y guardar como.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      toast({
        title: "Datos copiados",
        description: payload,
      });
    } catch {
      toast({
        title: "No se pudo copiar",
        variant: "destructive",
      });
    }
  };

  const isValid = data.otNumber.trim() !== "";

  return (
    <div className="space-y-5 animate-fade-in">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          Generador de QR · Órdenes de Trabajo
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Crea códigos QR para etiquetar piezas, kits y OTs en planta
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inputs */}
        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-1.5">
              <Hash className="h-4 w-4 text-[var(--brand-primary)]" />
              Datos de la orden
            </CardTitle>
            <CardDescription className="text-xs">
              Los campos se codifican en el QR separados por "|"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <Hash className="h-3 w-3 text-[var(--text-secondary)]" />
                N° de OT *
              </Label>
              <Input
                value={data.otNumber}
                onChange={(e) =>
                  setData((d) => ({ ...d, otNumber: e.target.value }))
                }
                placeholder="Ej: OT-2026-1024"
                className="bg-[var(--bg-elevated)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <Package className="h-3 w-3 text-[var(--text-secondary)]" />
                Nombre de pieza
              </Label>
              <Input
                value={data.pieceName}
                onChange={(e) =>
                  setData((d) => ({ ...d, pieceName: e.target.value }))
                }
                placeholder="Ej: Brida SAE 1045 Ø100"
                className="bg-[var(--bg-elevated)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <Layers className="h-3 w-3 text-[var(--text-secondary)]" />
                Material
              </Label>
              <Input
                value={data.material}
                onChange={(e) =>
                  setData((d) => ({ ...d, material: e.target.value }))
                }
                placeholder="Ej: Acero SAE 1045"
                className="bg-[var(--bg-elevated)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <Cog className="h-3 w-3 text-[var(--text-secondary)]" />
                Operación
              </Label>
              <Textarea
                value={data.operation}
                onChange={(e) =>
                  setData((d) => ({ ...d, operation: e.target.value }))
                }
                placeholder="Ej: Fresado periférico + barrenado 4×Ø10"
                className="bg-[var(--bg-elevated)] min-h-[80px]"
              />
            </div>
            <div className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] p-3">
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Payload codificado
              </div>
              <code className="text-xs text-[var(--text-primary)] break-all font-mono">
                {payload}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* QR Preview */}
        <Card className="bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-1.5">
              <QrCode className="h-4 w-4 text-[var(--brand-primary)]" />
              Vista previa
            </CardTitle>
            <CardDescription className="text-xs">
              300×300px · generado vía api.qrserver.com
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="rounded-xl bg-white p-4 border border-[var(--border-default)] shadow-sm">
              {isValid ? (
                <img
                  src={qrUrl}
                  alt={`QR para OT ${data.otNumber}`}
                  width={240}
                  height={240}
                  className="block"
                  loading="lazy"
                />
              ) : (
                <div className="w-[240px] h-[240px] flex flex-col items-center justify-center text-[var(--text-disabled)] bg-[var(--bg-elevated)] rounded-lg">
                  <QrCode className="h-12 w-12 mb-2" />
                  <span className="text-xs">Ingresa al menos el N° de OT</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 w-full justify-center">
              <Button
                onClick={handleDownload}
                disabled={!isValid}
                className="bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--on-accent)]"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Descargar PNG
              </Button>
              <Button
                onClick={handleCopy}
                disabled={!isValid}
                variant="outline"
                className="border-[var(--border-strong)]"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copiar datos
              </Button>
            </div>

            <div className="text-[10px] text-[var(--text-disabled)] text-center max-w-xs">
              💡 Imprime el PNG en etiqueta adhesiva y pégalo en la pieza. El
              operario escanea con la cámara del celular para ver todos los
              datos.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
