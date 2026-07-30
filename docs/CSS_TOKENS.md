# 🎨 CSS Tokens Reference — SelectIA v3.3.1

> Todas las variables CSS (design tokens) con su valor, dónde se definen, qué significan y dónde se usan.

---

## Tokens de color

### Backgrounds (4 niveles)

| Token | Dark (Linear) | Light (Linear) | Blanco Puro | Negro Puro | Dónde se usa |
|---|---|---|---|---|---|
| `var(--bg-base)` | `#08090a` | `#ffffff` | `#ffffff` | `#000000` | Background del body, main |
| `var(--bg-surface)` | `#0d0e11` | `#f8f9fa` | `#ffffff` | `#0a0a0a` | Cards, panels |
| `var(--bg-elevated)` | `#16171a` | `#f1f3f5` | `#f5f5f5` | `#111111` | Tooltips, dropdowns, inputs |
| `var(--bg-overlay)` | `rgba(255,255,255,0.05)` | `rgba(0,0,0,0.04)` | `rgba(0,0,0,0.03)` | `rgba(255,255,255,0.05)` | Hover states, chips |

**Regla**: `bg-base` < `bg-surface` < `bg-elevated` < `bg-overlay` (oscurecen/aclaramen progresivamente).

### Text (3 niveles)

| Token | Dark | Light | Blanco | Negro | Uso |
|---|---|---|---|---|---|
| `var(--text-primary)` | `#f8f9fa` | `#0d0e11` | `#000000` | `#ffffff` | Texto principal, títulos |
| `var(--text-secondary)` | `#9ca3af` | `#6b7280` | `#666666` | `#999999` | Texto secundario, labels |
| `var(--text-disabled)` | `#4b5563` | `#d1d5db` | `#cccccc` | `#444444` | Texto deshabilitado |

### Borders (2 niveles)

| Token | Dark | Light | Blanco | Negro | Uso |
|---|---|---|---|---|---|
| `var(--border-default)` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` | `#e5e5e5` | `#222222` | Borders normales |
| `var(--border-strong)` | `rgba(255,255,255,0.15)` | `rgba(0,0,0,0.15)` | `#cccccc` | `#333333` | Borders prominentes |

### Brand (3 tokens)

| Token | Valor | Uso |
|---|---|---|
| `var(--brand-primary)` | `#5e6ad2` | Color de acento principal (links, botones primarios, highlights) |
| `var(--brand-primary-subtle)` | `rgba(94,106,210,0.12)` | Background sutil del brand (badges, items activos) |
| `var(--brand-accent)` | `#533afd` | Color de acento secundario (raro uso) |
| `var(--brand-accent-glow)` | `rgba(83,58,253,0.4)` | Glow effect |

### Semantic colors (5 tokens)

| Token | Dark | Light | Uso |
|---|---|---|---|
| `var(--color-success)` | `#3ecf8e` | `#16a34a` | ✅ Green, modelos activos, fuentes OK |
| `var(--color-success-bg)` | `rgba(62,207,142,0.12)` | `rgba(22,163,74,0.12)` | Background success |
| `var(--color-success-border)` | `rgba(62,207,142,0.25)` | `rgba(22,163,74,0.25)` | Border success |
| `var(--color-warning)` | `#f0bf00` | `#eab308` | ⚠ Yellow, alertas, confiabilidad media |
| `var(--color-warning-bg)` | `rgba(240,191,0,0.12)` | `rgba(234,179,8,0.12)` | Background warning |
| `var(--color-warning-border)` | `rgba(240,191,0,0.25)` | `rgba(234,179,8,0.25)` | Border warning |
| `var(--color-error)` | `#eb5757` | `#dc2626` | ❌ Red, errores, confiabilidad baja |
| `var(--color-error-bg)` | `rgba(235,87,87,0.12)` | `rgba(220,38,38,0.12)` | Background error |
| `var(--color-error-border)` | `rgba(235,87,87,0.25)` | `rgba(220,38,38,0.25)` | Border error |

**Regla**: NUNCA usar hex directo. SIEMPRE `var(--color-*)`. No usar indigo ni blue.

---

## Tokens de tipografía

| Token | Valor | Uso |
|---|---|---|
| `var(--font-inter)` | `'Inter Variable', system-ui, sans-serif` | Font family principal |
| `var(--font-fira)` | `'Fira Code', monospace` | Font monoespaciado (números, código) |
| `var(--text-size-micro)` | `10px` | Texto muy pequeño (tooltips, badges) |
| `var(--text-size-small)` | `12px` | Texto pequeño (labels, metadata) |
| `var(--text-size-base)` | `14px` | Texto base del body |

**Clases Tailwind**: `text-xs` = 12px, `text-sm` = 14px, `text-base` = 16px, `text-lg` = 18px.

---

## Tokens de spacing

Sistema 8pt: `4, 8, 12, 16, 24, 32, 48, 64, 96`

Clases Tailwind: `gap-1` = 4px, `gap-2` = 8px, `gap-4` = 16px, `p-4` = 16px, `p-6` = 24px.

---

## Tokens de radius

| Token | Valor | Clase Tailwind |
|---|---|---|
| `var(--radius-full)` | `9999px` | `rounded-full` |
| — | `2px` | `rounded-sm` |
| — | `4px` | `rounded-md` |
| — | `8px` | `rounded-lg` |
| — | `12px` | `rounded-xl` |
| — | `16px` | `rounded-2xl` |

---

## Tokens de sombra

| Token | Uso |
|---|---|
| `var(--shadow-stripe-md)` | Sombra media estilo Stripe |
| `shadow-lg` | Sombra para cards y modals |
| `shadow-sm` | Sombra sutil para dropdowns |

---

## Tokens de animación

| Token | Valor | Uso |
|---|---|---|
| `var(--duration-fast)` | `100ms` | Hover, click feedback |
| `var(--duration-regular)` | `150ms` | Transiciones de color |
| `var(--duration-normal)` | `250ms` | Transiciones de layout |
| `var(--ease-snappy)` | `cubic-bezier(0.22, 1, 0.36, 1)` | Easing para interacciones rápidas |
| `var(--ease-out-cubic)` | `cubic-bezier(0.33, 1, 0.68, 1)` | Easing para entradas |

---

## Tokens de scrollbar

| Token | Valor | Uso |
|---|---|---|
| `var(--scrollbar-size)` | `8px` | Ancho del scrollbar |
| `var(--scrollbar-color)` | `rgba(255,255,255,0.1)` | Color del scrollbar |
| `var(--scrollbar-color-hover)` | `rgba(255,255,255,0.2)` | Color hover |

---

## Tokens de focus

| Token | Valor | Uso |
|---|---|---|
| `var(--focus-ring-color)` | `#5e6ad2` | Color del focus ring |
| `var(--focus-ring-width)` | `2px` | Ancho del focus ring |
| `var(--focus-ring-offset)` | `2px` | Offset del focus ring |

---

## Reglas de uso

1. **NUNCA hex directo**: Usar `var(--*)` siempre. Ej: `style={{ color: "var(--color-success)" }}`
2. **NUNCA indigo ni blue**: El brand es `#5e6ad2` (índigo sutil de Linear), pero NO usar `blue-500` ni `indigo-500` de Tailwind
3. **`color-mix()` para transparencias**: `color-mix(in srgb, var(--color-warning) 15%, transparent)`
4. **Dark mode por defecto**: El tema default es `dark` (Linear Oscuro)
5. **4 temas**: `dark`, `light`, `blanco-puro`, `negro-puro` (NO usar `dark-gray` ni `light-gray`)

---

## Dónde se definen

**Archivo**: `src/app/globals.css`

```css
:root, [data-theme="dark"] {
  --bg-base: #08090a;
  --text-primary: #f8f9fa;
  /* ... todos los tokens dark */
}

[data-theme="light"] {
  --bg-base: #ffffff;
  --text-primary: #0d0e11;
  /* ... todos los tokens light */
}

[data-theme="blanco-puro"] {
  --bg-base: #ffffff;
  /* ... minimalista blanco */
}

[data-theme="negro-puro"] {
  --bg-base: #000000;
  /* ... minimalista negro */
}
```

El tema se setea via `document.documentElement.setAttribute("data-theme", theme)` en `theme-provider.tsx`.
