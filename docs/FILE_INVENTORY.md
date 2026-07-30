# 🗂️ File Inventory — SelectIA v3.3.1

> Los 111 archivos TypeScript con propósito, dependencias y qué los consume.

---

## App Router (`src/app/`) — 8 archivos

| Archivo | Líneas | Propósito | Consume | Consumido por |
|---|---|---|---|---|
| `layout.tsx` | 108 | Layout raíz: fonts, metadata, ThemeProvider, QueryProvider | next/font, next-themes, tanstack-query | Next.js |
| `page.tsx` | ~250 | Página principal: sidebar + header + vista activa + modals | dashboard-store, todas las vistas, GlossaryDialog, FichaTecnicaModal, HreTopsisExplained | Next.js |
| `error.tsx` | ~30 | Error boundary | — | Next.js |
| `loading.tsx` | ~10 | Loading skeleton | — | Next.js |
| `not-found.tsx` | ~15 | 404 page | — | Next.js |
| `sitemap.ts` | ~15 | sitemap.xml | — | Next.js |
| `privacy/page.tsx` | 60 | Privacy Policy | — | — |
| `terms/page.tsx` | 55 | Terms of Service | — | — |

## API Routes (`src/app/api/`) — 6 archivos

| Archivo | Endpoint | Función |
|---|---|---|
| `dashboard/route.ts` | `GET /api/dashboard` | Retorna DashboardData (force-static, 5min revalidate) |
| `health/route.ts` | `GET /api/health` | Status summary |
| `hf-model/route.ts` | `GET /api/hf-model?id=` | Lazy-load HF data para Ficha Técnica |
| `ntfy-test/route.ts` | `POST /api/ntfy-test` | Test alerta ntfy |
| `refresh-model/route.ts` | `GET /api/refresh-model?id=` | Refresh modelo individual |
| `route.ts` | `GET /api` | Health check básico |

## Lib (`src/lib/`) — 12 archivos

| Archivo | Líneas | Propósito | Exporta |
|---|---|---|---|
| `types.ts` | 381 | Todos los tipos TypeScript | AIModel, DashboardData, WeightSet, etc. |
| `orchestrator.ts` | 2,278 | 13 fetchers + merge + enrichment | fetchDashboardData, sendNtfyAlert, etc. |
| `validations.ts` | 199 | 6 Zod schemas + 6 validators | validateBenchlmModels, etc. |
| `format.ts` | ~150 | Formateo (precio, fecha, color) | formatPricePerMillion, computeBlendedUsd, etc. |
| `equivalences.ts` | 37 | Equivalencias (almuerzos, cafés) | EQUIVALENCES, getEquivalence |
| `utils.ts` | ~20 | cn() helper | cn |
| `db.ts` | 10 | Prisma client | db |
| `data/models.ts` | 1,251 | Seed data + CURRENCIES (21) + SOURCES + DASHBOARD_DATA | MODELS, CURRENCIES, etc. |
| `data/glossary.ts` | 1,712 | Glosario 176 términos | GLOSSARY, GLOSSARY_CATEGORIES, findTerm |
| `data/engine-docs.ts` | ~350 | Docs del motor para UI | CATEGORY_DOCS, MODE_DOCS, ENGINE_LAYERS |
| `engine/hre-topsis.ts` | 2,039 | Motor HRE-TOPSIS (5 capas) | recommend, traceRecommendation, TASK_CATEGORIES |
| `engine/ahp-verification.ts` | ~100 | Consistency Ratio (Saaty) | calculateCR, verifyAllWeights |
| `engine/sensitivity-analysis.ts` | ~100 | Análisis de sensibilidad | runSensitivityAnalysis |

## Components (`src/components/dashboard/`) — 10 archivos

| Archivo | Líneas | Propósito |
|---|---|---|
| `header.tsx` | ~490 | Profile, moneda (21), tema (4), modo (4), status pill |
| `sidebar.tsx` | ~210 | Navegación 12 vistas + Glosario + Motor explicado |
| `footer.tsx` | ~50 | Sticky footer con data freshness |
| `ficha-tecnica-modal.tsx` | 1,005 | Modal: HF + BenchLM + ZeroEval + Ciclo Vida |
| `glossary-dialog.tsx` | ~400 | Modal glosario con deepDive expandible |
| `hre-topsis-explained.tsx` | ~300 | Modal documentación del motor |
| `model-badges.tsx` | ~210 | LicenseBadge, FreeAccessBadge, CapabilityIcons, InferenceProviders |
| `provider-logo.tsx` | ~80 | Logo del proveedor (favicon o color fallback) |
| `profile-explained.tsx` | ~140 | Modal explicación perfiles A-F |
| `category-cards.tsx` | ~100 | Cards de categoría para Recomendador |

## Views (`src/components/dashboard/views/`) — 16 archivos

| Archivo | Líneas | Vista |
|---|---|---|
| `overview-view.tsx` | 900 | Resumen: KPIs, scatter, timeline precios, top modelos |
| `recomendador-view.tsx` | 693 | Recomendador: query → top 3 + razones |
| `tabla-view.tsx` | 1,059 | Tabla Maestra: 23 columnas, 14 filtros, scroll virtual |
| `comparador-view.tsx` | 488 | Comparador side-by-side + radar |
| `analytics-view.tsx` | 511 | Analytics: heatmaps, distribuciones |
| `simulador-roi-view.tsx` | 458 | Simulador ROI + banner BenchLM |
| `calculadora-view.tsx` | 493 | Calculadora tokens + equivalencias |
| `calculadora-hardware-view.tsx` | 345 | Hardware: VRAM, quantization, autocompletar |
| `salud-view.tsx` | 813 | 13 fuentes + Función L + TC colapsable |
| `engine-animation-view.tsx` | 2,243 | Animación 36 pasos + Modo Traza |
| `guia-decision-view.tsx` | 494 | Guía tiers (Rápido/Medio/Avanzado) |
| `ingeniero-view.tsx` | 414 | Overview layout para Perfil A |
| `gerente-view.tsx` | 481 | Overview layout para Perfil B |
| `consultor-view.tsx` | 750 | Overview layout para Perfil C |
| `operario-view.tsx` | 343 | Overview layout para Perfil E |
| `compras-view.tsx` | 476 | Overview layout para Perfil F |
| `mapa-proveedores-view.tsx` | 325 | Mapa proveedores (Nominatim) |
| `routing-llm-view.tsx` | 432 | Routing LLM |
| `qr-generator-view.tsx` | 255 | QR Generator |

## Store (`src/store/`) — 1 archivo

| Archivo | Líneas | Propósito |
|---|---|---|
| `dashboard-store.ts` | 304 | Zustand + persist (localStorage): profile, currency, customExchangeRates, mode, filters, theme, compareIds, glossary/engine state |

## Hooks (`src/hooks/`) — 2 archivos

| Archivo | Líneas | Propósito |
|---|---|---|
| `use-dashboard-data.ts` | 35 | TanStack Query: fetch /api/dashboard, 5min cache |
| `use-effective-dashboard-data.ts` | 36 | Wrapper que aplica customExchangeRates |

## UI Components (`src/components/ui/`) — 40+ archivos

shadcn/ui (New York style). No modificar. Componentes: accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, scroll-area, select, separator, sheet, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip.
