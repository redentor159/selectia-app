# 🎨 THEMES.md — Sistema de Temas SelectIA v3.3.1

> Documentación completa de los 4 temas soportados, cómo se implementan, cómo cambiarlos, y cómo crear nuevos.

---

## 4 Temas Soportados

| ID | Nombre Display | Descripción | Inspiración |
|---|---|---|---|
| `dark` | Linear Oscuro | Tema oscuro profesional con brand índigo | Linear.app dark |
| `light` | Linear Claro | Tema claro profesional con brand índigo | Linear.app light |
| `blanco-puro` | Blanco Puro | Minimalista total, sin color de marca | Notion, Apple |
| `negro-puro` | Negro Puro | Minimalista oscuro, máximo contraste | Vercel dark, Terminal |

### Eliminados (NO usar)

| ID | Razón |
|---|---|
| `dark-gray` | Eliminado por petición del usuario — simplificación a 4 temas |
| `light-gray` | Eliminado por petición del usuario — simplificación a 4 temas |

---

## Linear Oscuro (`dark`) — Default

```css
/* Inspiración: Linear.app dark mode */
--bg-base: #08090a;        /* Casi negro con tinte sutil */
--bg-surface: #0d0e11;     /* Cards */
--bg-elevated: #16171a;    /* Tooltips, inputs */
--bg-overlay: rgba(255,255,255,0.05);  /* Hover */

--text-primary: #f8f9fa;   /* Casi blanco */
--text-secondary: #9ca3af;  /* Gris medio */
--text-disabled: #4b5563;   /* Gris oscuro */

--border-default: rgba(255,255,255,0.08);
--border-strong: rgba(255,255,255,0.15);

--brand-primary: #5e6ad2;   /* Índigo Linear */
--brand-primary-subtle: rgba(94,106,210,0.12);
--brand-accent: #533afd;     /* Violeta */
```

**Uso**: Tema por defecto. Profesional, oscuro, con brand color visible. Ideal para uso diario.

---

## Linear Claro (`light`)

```css
/* Inspiración: Linear.app light mode */
--bg-base: #ffffff;
--bg-surface: #f8f9fa;
--bg-elevated: #f1f3f5;
--bg-overlay: rgba(0,0,0,0.04);

--text-primary: #0d0e11;
--text-secondary: #6b7280;
--text-disabled: #d1d5db;

--border-default: rgba(0,0,0,0.08);
--border-strong: rgba(0,0,0,0.15);

--brand-primary: #5e6ad2;
--brand-primary-subtle: rgba(94,106,210,0.12);
--brand-accent: #533afd;
```

**Uso**: Para ambientes con mucha luz o preferencia de tema claro. Mantiene el brand índigo.

---

## Blanco Puro (`blanco-puro`)

```css
/* Inspiración: Notion, Apple, minimalismo total */
/* SIN color de marca — todo es negro sobre blanco */
--bg-base: #ffffff;
--bg-surface: #ffffff;
--bg-elevated: #f5f5f5;
--bg-overlay: rgba(0,0,0,0.03);

--text-primary: #000000;     /* Negro absoluto */
--text-secondary: #666666;
--text-disabled: #cccccc;

--border-default: #e5e5e5;
--border-strong: #cccccc;

--brand-primary: #1a1a1a;    /* Casi negro suave */
--brand-primary-subtle: rgba(0,0,0,0.06);
--brand-accent: #333333;
```

**Uso**: Minimalismo extremo. Sin colores de marca. Todo es blanco/negro/gris. Para usuarios que quieren máxima claridad y cero distracciones visuales.

**Diferencia vs Linear Claro**: Linear Claro tiene brand índigo (#5e6ad2). Blanco Puro NO tiene brand color — todo es neutro.

---

## Negro Puro (`negro-puro`)

```css
/* Inspiración: Vercel dark, Terminal, OLED */
/* SIN color de marca — todo es blanco sobre negro */
--bg-base: #000000;          /* Negro absoluto (OLED friendly) */
--bg-surface: #0a0a0a;
--bg-elevated: #111111;
--bg-overlay: rgba(255,255,255,0.05);

--text-primary: #ffffff;     /* Blanco absoluto */
--text-secondary: #999999;
--text-disabled: #444444;

--border-default: #222222;
--border-strong: #333333;

--brand-primary: #ffffff;    /* Blanco para máximo contraste */
--brand-primary-subtle: rgba(255,255,255,0.08);
--brand-accent: #cccccc;
```

**Uso**: Minimalismo extremo oscuro. Máximo contraste blanco sobre negro. Ideal para OLED (ahorra batería). Sin colores de marca.

**Diferencia vs Linear Oscuro**: Linear Oscuro tiene brand índigo (#5e6ad2) y bg #08090a (casi negro con tinte). Negro Puro es #000000 absoluto sin brand color.

---

## Cómo se implementan

### CSS (`src/app/globals.css`)

```css
/* Default (dark) */
:root, [data-theme="dark"] {
  --bg-base: #08090a;
  /* ... */
}

/* Light */
[data-theme="light"] {
  --bg-base: #ffffff;
  /* ... */
}

/* Blanco Puro */
[data-theme="blanco-puro"] {
  --bg-base: #ffffff;
  /* ... */
}

/* Negro Puro */
[data-theme="negro-puro"] {
  --bg-base: #000000;
  /* ... */
}
```

### JavaScript (`src/components/theme-provider.tsx`)

```typescript
// next-themes setea el atributo data-theme en <html>
document.documentElement.setAttribute("data-theme", theme);
```

### Store (`src/store/dashboard-store.ts`)

```typescript
type Theme = "dark" | "light" | "blanco-puro" | "negro-puro";
// Default: "dark"
// Persiste en localStorage
```

### Header (`src/components/dashboard/header.tsx`)

```typescript
// Dropdown con 4 opciones
{ id: "light", label: "Linear Claro", desc: "Tema claro profesional" },
{ id: "dark", label: "Linear Oscuro", desc: "Tema oscuro profesional" },
{ id: "blanco-puro", label: "Blanco Puro", desc: "Minimalista total" },
{ id: "negro-puro", label: "Negro Puro", desc: "Minimalista oscuro" },
```

---

## Reglas de temas

1. **Solo 4 temas**: No añadir más sin documentar aquí
2. **Sin indigo/blue de Tailwind**: Usar `var(--brand-primary)` siempre
3. **Blanco Puro y Negro Puro NO tienen brand color**: Son neutros (gris/negro/blanco)
4. **Linear Claro y Linear Oscuro SÍ tienen brand color**: Índigo #5e6ad2
5. **Persistencia**: El tema se guarda en localStorage y sobrevive recargas
6. **Default**: `dark` (Linear Oscuro)

---

## Cómo crear un nuevo tema

1. Añadir el ID al tipo `Theme` en `dashboard-store.ts`
2. Añadir el bloque `[data-theme="nuevo-tema"]` en `globals.css` con todos los tokens
3. Añadir la opción en el dropdown de `header.tsx`
4. Documentar aquí en `THEMES.md`
5. Verificar que las 4 variables de background + 3 de text + 2 de border + 3 de brand estén definidas

---

## Tabla comparativa

| Token | Linear Oscuro | Linear Claro | Blanco Puro | Negro Puro |
|---|---|---|---|---|
| `--bg-base` | `#08090a` | `#ffffff` | `#ffffff` | `#000000` |
| `--bg-surface` | `#0d0e11` | `#f8f9fa` | `#ffffff` | `#0a0a0a` |
| `--bg-elevated` | `#16171a` | `#f1f3f5` | `#f5f5f5` | `#111111` |
| `--text-primary` | `#f8f9fa` | `#0d0e11` | `#000000` | `#ffffff` |
| `--text-secondary` | `#9ca3af` | `#6b7280` | `#666666` | `#999999` |
| `--brand-primary` | `#5e6ad2` | `#5e6ad2` | `#1a1a1a` | `#ffffff` |
| `--border-default` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` | `#e5e5e5` | `#222222` |
| `--color-success` | `#3ecf8e` | `#16a34a` | `#16a34a` | `#3ecf8e` |
| `--color-warning` | `#f0bf00` | `#eab308` | `#eab308` | `#f0bf00` |
| `--color-error` | `#eb5757` | `#dc2626` | `#dc2626` | `#eb5757` |
