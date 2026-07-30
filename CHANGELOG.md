# 📋 Changelog — SelectIA

Todos los cambios notables de SelectIA se documentan aquí.

---

## [3.3.1] — 2026-07-06

### ✨ Features añadidas

- **BenchLM integration**: 5 sub-endpoints (models, price-index, stats, pricing, leaderboard envelope). 87/206 modelos enriquecidos con 8 category scores.
- **ZeroEval integration**: 36/206 modelos con métricas de producción real (failure_rate, P95, throughput, total_calls).
- **Motor HRE-TOPSIS v3.3.1**: 8 criterios (añadido `reliability`), 24 vectores AHP recalibrados, CR = 0.
- **Multi-moneda América**: 21 monedas (PEN, BRL, MXN, COP, CLP, ARS, CAD + 13 más).
- **Tipo de cambio personalizable**: Override en localStorage, persistente, con reset manual.
- **Glosario técnico**: 176 términos, 15 deepDives expandibles, 8 categorías, 0 intercorrelaciones rotas.
- **Animación del motor**: 36 pasos, Modo Traza con badges de proveniencia, footer "Fuentes de datos usadas".
- **Ficha Técnica**: 3 secciones nuevas (BenchLM 8 categorías, ZeroEval 4 métricas, Ciclo de Vida Función K).
- **Función K**: Ciclo de vida del modelo (Vigente/Reemplazado) usando `family.supersedesModelKey`.
- **Función L**: 8 mini-badges de cobertura por categoría en Salud del Sistema.
- **Timeline de Precios**: Gráfico LineChart con 41 meses (marzo 2023 - julio 2026), 3 tiers (frontier/mid/budget).
- **Privacy Policy + Terms of Service**: Páginas `/privacy` y `/terms`.
- **LICENSE MIT**: Open source.
- **4 temas**: Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro.
- **Doble click en tabla**: Abre Ficha Técnica automáticamente.
- **Hardware IA autocompletar**: Dropdown con resultados en tiempo real.
- **TF-IDF expandido**: ~30 palabras por categoría (era ~15).

### 🐛 Bugs arreglados

- **#1**: Función K al revés — `supersedesModelKey` ahora interpreta correctamente quién reemplaza a quién.
- **#3**: Emojis en headers de tabla → iconos SVG de Lucide (Stethoscope, Download, Heart, FileText).
- **#4**: Columnas de tabla visibles detrás del glosario → Dialog z-index 50 → 700.
- **#6**: Speed cap 500 tok/s (outlier Mercury 2 = 872).
- **#7**: MYPE price ceiling $1/M (excluye premium).
- **#8**: Context cap 256K (outlier Gemini 2.0 = 1M).
- **#9**: "7 fuentes" hardcoded → dinámico (`data.sources.length`).
- **#9 (doble estándar II)**: `extractMetrics()` ahora usa AA II (no BenchLM) para consistencia con `computeEfficiencyCost()`.
- **#10**: `computeBlendedPriceUsd(m, mode)` — FREE usa precio API real en modo Calidad.
- **#10b**: `effCost = 0` en pesos Calidad (no importa el precio).
- **#11**: Pesos Calidad recalibrados — II dominante (0.50-0.60), context reducido.
- **#14**: Piso de calidad II ≥ 30 en modo Calidad (excepto offline: 15).
- **#15**: ContextWindow corrupto (210 modelos con 8K falso) — fix LiteLLM matching con baseName lowercase + merge inteligente.
- **#16**: Matching BenchLM sobreescritura — 2 pasadas (sin sufijo primero, con sufijo después).
- **React keys duplicadas**: `key={p.name}` → `key={`${p.name}-${idx}`}` en 4 archivos.
- **3 errores TSC recharts**: Eliminado `isAnimationActive` y arreglado `style` prop.

### 📊 Métricas

| Métrica | Antes (v3.2) | Después (v3.3.1) |
|---|:---:|:---:|
| Fuentes de datos | 11 | 13 |
| Monedas | 4 | 21 |
| Criterios TOPSIS | 7 | 8 |
| Glosario términos | 81 | 176 |
| BenchLM modelos | 0 | 87 |
| ZeroEval modelos | 0 | 36 |
| TSC errors | 3 | 0 |
| Lint errors | 0 | 0 |

---

## [3.2] — 2026-07-01

### Features

- HuggingFace Hub integration (100% field coverage)
- Ficha Técnica modal (7 secciones, lazy-load)
- 6 perfiles de usuario (A-F)
- Animación del motor (36 pasos)
- Glosario inicial (81 términos)
- Multi-moneda básica (PEN, USD, EUR, GBP)
- Cron job + JSON estático < 500 KB
- Dark/light mode

---

## [1.0] — 2026-06-28

### Initial release

- Motor HRE-TOPSIS (7 criterios, TF-IDF, AHP, TOPSIS)
- 11 fuentes de datos
- Tabla Maestra (22 columnas)
- Recomendador con razones
- Calculadora de tokens
- Comparador side-by-side
- Analytics con heatmaps
- Salud del Sistema
