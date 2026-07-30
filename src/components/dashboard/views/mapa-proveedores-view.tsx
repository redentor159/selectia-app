"use client";

import { useMemo, useState } from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useDashboardStore } from "@/store/dashboard-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Search,
  Phone,
  Star,
  TrendingDown,
  TrendingUp,
  Minus,
  Map as MapIcon,
} from "lucide-react";
import type { CommodityPrice, MetalSupplier, CurrencyRate } from "@/lib/types";

// Fallback seed data (used when API doesn't return Phase 3 fields yet)
const FALLBACK_COMMODITIES: CommodityPrice[] = [
  {
    code: "steel",
    name: "Acero (laminado)",
    priceUsd: 0.72,
    unit: "kg",
    changePct: 1.4,
  },
  {
    code: "copper",
    name: "Cobre (refinado)",
    priceUsd: 9.84,
    unit: "kg",
    changePct: -0.6,
  },
  {
    code: "aluminum",
    name: "Aluminio (LME)",
    priceUsd: 2.41,
    unit: "kg",
    changePct: 0.3,
  },
  {
    code: "zinc",
    name: "Zinc",
    priceUsd: 2.78,
    unit: "kg",
    changePct: 0.9,
  },
];

const FALLBACK_SUPPLIERS: MetalSupplier[] = [
  {
    id: "sup-1",
    name: "Aceros Arequipa SA",
    type: "industrial_supplier",
    city: "Arequipa",
    lat: -16.3989,
    lon: -71.535,
    displayName: "Aceros Arequipa — Planta principal",
    address: "Av. Parra 312, Arequipa",
    countryCode: "PE",
  },
  {
    id: "sup-2",
    name: "Cía. Siderúrgica del Perú",
    type: "industrial_supplier",
    city: "Lima",
    lat: -12.0464,
    lon: -77.0428,
    displayName: "Cosipa — Distribuidor Lima",
    address: "Av. Argentina 3490, Callao",
    countryCode: "PE",
  },
  {
    id: "sup-3",
    name: "Metalúrgica Chiclayo EIRL",
    type: "shop",
    city: "Chiclayo",
    lat: -6.7714,
    lon: -79.8409,
    displayName: "Metalúrgica Chiclayo — Planta Norte",
    address: "Av. Bolognesi 850, Chiclayo",
    countryCode: "PE",
  },
  {
    id: "sup-4",
    name: "Bronces y Aluminios Trujillo",
    type: "shop",
    city: "Trujillo",
    lat: -8.1116,
    lon: -79.0288,
    displayName: "Bronces y Aluminios Trujillo",
    address: "Jr. Bolívar 245, Trujillo",
    countryCode: "PE",
  },
  {
    id: "sup-5",
    name: "Distribuidora MetalPeru",
    type: "industrial_supplier",
    city: "Lima",
    lat: -12.0789,
    lon: -77.0936,
    displayName: "MetalPeru — Depósito Pueblo Libre",
    address: "Av. Universitaria 1820, Lima",
    countryCode: "PE",
  },
  {
    id: "sup-6",
    name: "Industrias Metálicas Piura",
    type: "shop",
    city: "Piura",
    lat: -5.1945,
    lon: -80.6328,
    displayName: "Industrias Metálicas Piura",
    address: "Calle Tacna 410, Piura",
    countryCode: "PE",
  },
];

export function MapaProveedoresView() {
  const { data, isLoading } = useDashboardData();
  const { currency } = useDashboardStore();
  const [search, setSearch] = useState("");

  const currencyMeta: CurrencyRate | undefined = data?.currencies.find(
    (c) => c.code === currency
  );
  const rate = currencyMeta?.rateFromUsd ?? 3.714;

  const commodities = data?.commodities ?? FALLBACK_COMMODITIES;
  const suppliers = data?.metalSuppliers ?? FALLBACK_SUPPLIERS;

  const filteredSuppliers = useMemo(() => {
    if (!search.trim()) return suppliers;
    const q = search.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.address ?? "").toLowerCase().includes(q)
    );
  }, [suppliers, search]);

  // Build OpenStreetMap embed URL with markers via bbox + marker query param
  const mapEmbedUrl = useMemo(() => {
    // Compute bounding box covering all suppliers (with padding)
    if (suppliers.length === 0) {
      return "https://www.openstreetmap.org/export/embed.html?bbox=-81.5,-18.5,-75.5,4.5&layer=mapnik";
    }
    const lats = suppliers.map((s) => s.lat);
    const lons = suppliers.map((s) => s.lon);
    const minLat = Math.min(...lats) - 0.5;
    const maxLat = Math.max(...lats) + 0.5;
    const minLon = Math.min(...lons) - 0.5;
    const maxLon = Math.max(...lons) + 0.5;
    // marker syntax: m1=lat,lon; or use ?marker=lat,lon
    // OSM embed supports a single marker param. We'll use the centroid of suppliers as a fallback marker.
    const centroidLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centroidLon = lons.reduce((a, b) => a + b, 0) / lons.length;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${centroidLat}%2C${centroidLon}`;
  }, [suppliers]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          Mapa de Proveedores · Metalmecánica Peruana
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Commodities en tiempo real + proveedores de acero/cobre/aluminio
        </p>
      </header>

      {/* Commodities prices */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {commodities.map((c) => {
          const change = c.changePct ?? 0;
          const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
          const trendColor =
            change > 0
              ? "var(--color-error)"
              : change < 0
                ? "var(--color-success)"
                : "var(--text-secondary)";
          const localPrice = c.priceUsd * rate;
          return (
            <Card
              key={c.code}
              className="bg-[var(--bg-surface)] border-[var(--border-default)] card-hover"
            >
              <CardContent className="p-4">
                <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  {c.name}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="kpi-value num text-lg text-[var(--text-primary)]">
                    {currencyMeta?.symbol ?? "S/."} {localPrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    /{c.unit}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 mt-1 text-xs num"
                  style={{ color: trendColor }}
                >
                  <TrendIcon className="h-3 w-3" />
                  {change > 0 ? "+" : ""}
                  {change.toFixed(2)}% 24h
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* OSM iframe map */}
        <Card className="lg:col-span-2 bg-[var(--bg-surface)] border-[var(--border-default)] overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-1.5">
              <MapIcon className="h-4 w-4 text-[var(--brand-primary)]" />
              Mapa de proveedores
            </CardTitle>
            <CardDescription className="text-xs">
              OpenStreetMap · {suppliers.length} proveedores en Perú
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              title="Mapa de proveedores metalmecánicos"
              src={mapEmbedUrl}
              className="w-full h-[400px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="px-4 py-2 text-[10px] text-[var(--text-disabled)] border-t border-[var(--border-default)] bg-[var(--bg-elevated)]">
              © OpenStreetMap contributors · El marcador central indica el
              centroide de los proveedores cargados.
            </div>
          </CardContent>
        </Card>

        {/* Searchable list */}
        <Card className="lg:col-span-1 bg-[var(--bg-surface)] border-[var(--border-default)]">
          <CardHeader className="pb-3 space-y-2">
            <CardTitle className="text-base flex items-center gap-1.5">
              <Search className="h-4 w-4 text-[var(--brand-primary)]" />
              Listado de proveedores
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por nombre, ciudad…"
                className="h-8 pl-8 text-xs bg-[var(--bg-elevated)]"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[440px] overflow-y-auto">
            {filteredSuppliers.map((s) => (
              <a
                key={s.id}
                href={`https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lon}#map=15/${s.lat}/${s.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3 hover:border-[var(--brand-primary)] hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-[var(--text-primary)] truncate">
                      {s.name}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] truncate">
                      {s.displayName}
                    </div>
                    {s.address && (
                      <div className="text-[10px] text-[var(--text-disabled)] mt-0.5 truncate">
                        {s.address}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                        {s.city}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                        {s.type === "industrial_supplier" ? "Industrial" : "Tienda"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </a>
            ))}
            {filteredSuppliers.length === 0 && (
              <div className="text-center text-xs text-[var(--text-secondary)] py-6">
                Sin coincidencias para "{search}"
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
