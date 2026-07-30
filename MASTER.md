# 🎨 MASTER.md — Design System (Reconstruido)

> Design system portability-first, token-driven. Extraído live de Stripe.com + Linear.app (2026-06-29).
> Implementado en `src/app/globals.css` (571 líneas). Documentado en `docs/CSS_TOKENS.md`.

---

## 1. Filosofía

- **Token-driven**: Cero HEX en componentes. TODO usa `var(--*)`.
- **Portability**: Cambiar 1 bloque de variables rethemea toda la UI.
- **Hairline borders**: Solo 1px, nunca 2px+.
- **Shadows Stripe**: `rgba(50,50,93,...)` blue-tinted, NO negro puro.
- **Cristal tintado**: Badges con `rgba 0.10 bg / rgba 0.20 border`.
- **A11y**: Focus rings obligatorios. `cursor:pointer` en clickables. `prefers-reduced-motion` respetado.
- **Negative letter-spacing**: En todos los headings.

---

## 2. Paleta Intercambiable (D1 — Indigo/Violet, default)

### Dark (default)

```css
--bg-base: #08090a;
--bg-surface: #0d0e11;
--bg-elevated: #16171a;
--bg-overlay: rgba(255,255,255,0.05);

--text-primary: #f8f9fa;
--text-secondary: #9ca3af;
--text-disabled: #4b5563;

--border-default: rgba(255,255,255,0.08);
--border-strong: rgba(255,255,255,0.15);

--brand-primary: #5e6ad2;
--brand-primary-subtle: rgba(94,106,210,0.12);
--brand-accent: #533afd;
--brand-accent-glow: rgba(83,58,253,0.4);

--color-success: #3ecf8e;
--color-warning: #f0bf00;
--color-error: #eb5757;
```

### Light

```css
--bg-base: #ffffff;
--bg-surface: #f8f9fa;
--bg-elevated: #f1f3f5;
--bg-overlay: rgba(0,0,0,0.04);

--text-primary: #0d0e11;
--text-secondary: #6b7280;
--text-disabled: #d1d5db;

--border-default: rgba(0,0,0,0.08);
--border-strong: rgba(0,0,0,0.15);
```

### Blanco Puro

```css
--bg-base: #ffffff;
--bg-surface: #ffffff;
--bg-elevated: #f5f5f5;
--bg-overlay: rgba(0,0,0,0.03);

--text-primary: #000000;
--text-secondary: #666666;
--text-disabled: #cccccc;

--border-default: #e5e5e5;
--border-strong: #cccccc;
```

### Negro Puro

```css
--bg-base: #000000;
--bg-surface: #0a0a0a;
--bg-elevated: #111111;
--bg-overlay: rgba(255,255,255,0.05);

--text-primary: #ffffff;
--text-secondary: #999999;
--text-disabled: #444444;

--border-default: #222222;
--border-strong: #333333;
```

---

## 3. Paletas Curadas (D1–D6, L1–L4)

| ID | Nombre | Brand | Accent | Base (dark) |
|---|---|---|---|---|
| **D1** | Indigo/Violet (default) | `#5e6ad2` | `#533afd` | `#08090a` |
| D2 | Emerald | `#10b981` | `#06b6d4` | `#0a0f0d` |
| D3 | Rose | `#f43f5e` | `#ec4899` | `#0f0a0b` |
| D4 | Amber | `#f59e0b` | `#ef4444` | `#0f0d0a` |
| D5 | Teal | `#14b8a6` | `#0ea5e9` | `#0a0f0f` |
| D6 | Slate | `#64748b` | `#475569` | `#0a0a0f` |
| **L1** | Light Indigo | `#5e6ad2` | `#533afd` | `#ffffff` |
| L2 | Light Emerald | `#059669` | `#0891b2` | `#ffffff` |
| L3 | Light Rose | `#e11d48` | `#db2777` | `#ffffff` |
| L4 | Light Slate | `#475569` | `#64748b` | `#ffffff` |

**Para rethemar**: Cambiar solo la sección "Paleta Intercambiable" en `globals.css`.

---

## 4. Tipografía

### Font Families

| Token | Valor | Uso |
|---|---|---|
| `--font-inter` | `'Inter Variable', system-ui, sans-serif` | Body, headings, UI |
| `--font-fira` | `'Fira Code', monospace` | Números, código, datos |

### Tamaños

| Clase Tailwind | px | Uso |
|---|---|---|
| `text-[10px]` | 10 | Tooltips, badges, micro |
| `text-xs` | 12 | Labels, metadata, secondary |
| `text-sm` | 14 | Body base |
| `text-base` | 16 | Subheadings |
| `text-lg` | 18 | Section titles |
| `text-xl` | 20 | Page titles |
| `text-2xl` | 24 | Hero |

### Stripe HDS Scale (headings)

| Token | size/line-height/weight/letter-spacing |
|---|---|
| xxs | 11px / 16px / 500 / 0.06em |
| xs | 12px / 16px / 500 / 0.06em |
| sm | 14px / 20px / 500 / 0.04em |
| md | 15px / 24px / 500 / 0.02em |
| lg | 17px / 26px / 600 / 0 |
| xl | 20px / 28px / 600 / -0.01em |
| xxl | 24px / 32px / 700 / -0.02em |

### Linear Title Scale

| Token | size/weight/letter-spacing |
|---|---|
| title-1 | 44px / 700 / -0.04em |
| title-2 | 36px / 700 / -0.03em |
| title-3 | 30px / 700 / -0.02em |
| title-4 | 24px / 700 / -0.02em |
| title-5 | 20px / 600 / -0.01em |
| title-6 | 18px / 600 / -0.01em |
| title-7 | 16px / 600 / 0 |
| title-8 | 14px / 600 / 0 |
| title-9 | 12px / 600 / 0.04em |

---

## 5. Spacing — Grid 8pt

| Token | px | Clase Tailwind |
|---|---|---|
| — | 4 | `gap-1`, `p-1` |
| — | 8 | `gap-2`, `p-2` |
| — | 12 | `gap-3`, `p-3` |
| — | 16 | `gap-4`, `p-4` |
| — | 24 | `gap-6`, `p-6` |
| — | 32 | `gap-8`, `p-8` |
| — | 48 | `gap-12`, `p-12` |
| — | 64 | `gap-16`, `p-16` |
| — | 96 | `gap-24`, `p-24` |

---

## 6. Radius

| Valor | Clase Tailwind | Uso |
|---|---|---|
| 2px | `rounded-sm` | Chips, badges pequeños |
| 4px | `rounded-md` | Inputs, buttons |
| 8px | `rounded-lg` | Cards, modals |
| 12px | `rounded-xl` | Cards grandes |
| 16px | `rounded-2xl` | Modals grandes |
| 9999px | `rounded-full` | Pills, avatars, dots |

---

## 7. Shadows

### Linear (5 niveles)

```css
--shadow-lin-sm: 0 1px 2px rgba(0,0,0,0.07);
--shadow-lin-md: 0 4px 12px rgba(0,0,0,0.12);
--shadow-lin-lg: 0 8px 24px rgba(0,0,0,0.15);
--shadow-lin-xl: 0 16px 48px rgba(0,0,0,0.18);
--shadow-lin-2xl: 0 32px 64px rgba(0,0,0,0.22);
```

### Stripe (5 niveles — blue-tinted rgba(50,50,93,...))

```css
--shadow-stp-sm: 0 1px 3px rgba(50,50,93,0.15), 0 1px 2px rgba(0,0,0,0.06);
--shadow-stp-md: 0 4px 6px rgba(50,50,93,0.11), 0 2px 4px rgba(0,0,0,0.07);
--shadow-stp-lg: 0 10px 15px rgba(50,50,93,0.1), 0 4px 6px rgba(0,0,0,0.05);
--shadow-stp-xl: 0 20px 25px rgba(50,50,93,0.1), 0 10px 10px rgba(0,0,0,0.04);
--shadow-stp-2xl: 0 25px 50px rgba(50,50,93,0.25);
```

### Focus Glows

```css
--shadow-focus: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--brand-primary);
--shadow-focus-error: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--color-error);
```

**Regla**: Las sombras SIEMPRE usan `rgba(50,50,93,...)` (Stripe blue-tinted), NUNCA negro puro `rgba(0,0,0,...)`.

---

## 8. Motion

### Durations

| Token | ms | Uso |
|---|---|---|
| `--duration-fast` | 100 | Hover, click feedback |
| `--duration-regular` | 150 | Transiciones de color |
| `--duration-normal` | 250 | Transiciones de layout |
| `--duration-slow` | 300 | Entradas de modals |
| `--duration-xslow` | 450 | Page transitions |

### Easings (11 custom cubic-bezier)

| Token | cubic-bezier | Uso |
|---|---|---|
| `--ease-snappy` | `cubic-bezier(0.22,1,0.36,1)` | Interacciones rápidas |
| `--ease-out-cubic` | `cubic-bezier(0.33,1,0.68,1)` | Entradas |
| `--ease-spring` | `cubic-bezier(0.34,1.56,0.64,1)` | Rebote sutil |
| `--ease-expo` | `cubic-bezier(0.16,1,0.3,1)` | Exponencial |
| `--ease-in-out-quart` | `cubic-bezier(0.76,0,0.24,1)` | In-out suave |

**Regla**: `@media (prefers-reduced-motion: reduce)` → `transition: none !important`.

---

## 9. Z-index Scale

| Token | Valor | Uso |
|---|---|---|
| base | 1 | Contexto base |
| sticky | 75 | `<thead>` sticky en tablas |
| header | 100 | Header del dashboard |
| sidebar | 100 | Sidebar |
| dropdown | 500 | Dropdowns, popovers |
| dialog | 700 | Modals (Dialog, GlossaryDialog, FichaTecnicaModal) |
| toast | 800 | Toast notifications |
| tooltip | 1100 | Tooltips |
| context-menu | 1200 | Context menus |
| skip-nav | 5000 | Skip navigation (a11y) |

---

## 10. Layout

| Token | Valor | Uso |
|---|---|---|
| page-max-width | 1024px | Ancho máximo del contenido |
| page-padding-inline | 24px | Padding horizontal |
| page-padding-block | 48-64px | Padding vertical |
| prose-max-width | 624px | Ancho máximo de texto |
| min-tap | 44px | Tamaño mínimo touch target (a11y) |

---

## 11. Component Specs

### Buttons

| Variante | Background | Text | Border | Uso |
|---|---|---|---|---|
| Primary | `var(--brand-primary)` | `#fff` | none | CTA principal |
| Secondary | `var(--bg-elevated)` | `var(--text-primary)` | `var(--border-strong)` | CTA secundario |
| Ghost | transparent | `var(--text-secondary)` | none | Hover actions |
| Outline | transparent | `var(--brand-primary)` | `var(--brand-primary)` | Alternativa primary |

**Reglas**: `cursor:pointer`, `transition: all var(--duration-fast)`, focus ring obligatorio.

### Cards

| Variante | Background | Border | Shadow | Uso |
|---|---|---|---|---|
| Standard | `var(--bg-surface)` | `var(--border-default)` | `shadow-sm` | Cards normales |
| Glass | `rgba(255,255,255,0.03)` | `rgba(255,255,255,0.06)` | `shadow-lin-md` | Cards con efecto glass |
| KPI | `var(--bg-surface)` | `var(--border-default)` | none | KPI cards |

### Badges (Cristal Tintado)

```css
/* Patrón: rgba 0.10 bg / rgba 0.20 border */
background: rgba(COLOR, 0.10);
border: 1px solid rgba(COLOR, 0.20);
color: COLOR;
```

| Variante | Color | Uso |
|---|---|---|
| Success | `var(--color-success)` | ✅ Activo, green |
| Warning | `var(--color-warning)` | ⚠ Alerta, yellow |
| Error | `var(--color-error)` | ❌ Error, red |
| Brand | `var(--brand-primary)` | Info, links |
| Neutral | `var(--text-secondary)` | Default |

### Inputs

- Background: `var(--bg-elevated)`
- Border: `var(--border-default)` → `var(--brand-primary)` on focus
- Height: 36px (`h-9`)
- Padding: `px-3 py-2`
- Focus: ring 2px `var(--brand-primary)` + offset 2px `var(--bg-base)`

### Tables

- `<thead>`: `bg-[var(--bg-elevated)]` sticky `z-[75]`
- `<tbody>`: `divide-y divide-[var(--border-default)]`
- Hover: `hover:bg-[var(--bg-overlay)]`
- Sortable headers: `cursor-pointer`, arrow icon on active

### Modals (Dialog)

- Overlay: `fixed inset-0 z-[700] bg-black/50`
- Content: `z-[700]`, `rounded-lg`, `shadow-lg`, `max-w-[calc(100%-2rem)]`
- Close: X button top-right, `h-7 w-7`

---

## 12. Scrollbar

```css
--scrollbar-size: 8px;
--scrollbar-color: rgba(255,255,255,0.1);
--scrollbar-color-hover: rgba(255,255,255,0.2);

/* Custom scrollbar */
::-webkit-scrollbar { width: var(--scrollbar-size); }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--scrollbar-color);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-color-hover); }
```

---

## 13. Reglas B2B (Engineering)

1. **ZERO HEX en componentes**: Usar `var(--*)` siempre. Hex solo en `:root`.
2. **Hairline borders**: 1px máximo. `var(--border-default)` para normal, `var(--border-strong)` para énfasis.
3. **Shadows Stripe**: `rgba(50,50,93,...)` blue-tinted. NUNCA `rgba(0,0,0,...)` puro.
4. **Negative letter-spacing**: En todos los headings. `-0.01em` a `-0.04em` según tamaño.
5. **Cristal tintado badges**: `rgba 0.10 bg / rgba 0.20 border`. NUNCA solid color.
6. **A11y focus rings**: `box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--brand-primary)`. Obligatorio.
7. **cursor:pointer**: En todos los clickables (`button`, `a`, `[role=button]`).
8. **prefers-reduced-motion**: `@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }`.
9. **min-tap 44px**: Touch targets mínimo 44×44px (iOS HIG).
10. **No indigo/blue Tailwind**: Usar `var(--brand-primary)`. No `bg-indigo-500` ni `text-blue-600`.

---

## 14. Anti-patrones (NO hacer)

- ❌ Hardcodear HEX en componentes (`color: #5e6ad2`)
- ❌ Usar `rgba(0,0,0,...)` en sombras
- ❌ Borders de 2px o más
- ❌ `letter-spacing: 0` en headings
- ❌ Badges con solid color background
- ❌ `transition: all` (specificar propiedades)
- ❌ `text-blue-*` o `bg-indigo-*` de Tailwind
- ❌ Touch targets menores a 44px
- ❌ `z-index` fuera del scale definido
- ❌ `console.log` en producción

---

## 15. Pre-delivery Checklist

- [ ] Lint: 0 errores
- [ ] TSC: 0 errores
- [ ] Console: 0 errores
- [ ] Focus visible en todos los interactivos
- [ ] `cursor: pointer` en todos los clickables
- [ ] `aria-label` en iconos sin texto
- [ ] `alt` en imágenes
- [ ] Responsive: 375px mínimo
- [ ] Sticky footer funciona
- [ ] `prefers-reduced-motion` respetado
- [ ] No HEX en componentes
- [ ] No `rgba(0,0,0,...)` en sombras
