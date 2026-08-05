# 🚀 Guía de Deployment — SelectIA

> Paso a paso para deployar SelectIA en Vercel desde GitHub. Sin experiencia previa necesaria.

---

## Prerrequisitos

| Requisito | Cómo obtenerlo |
|---|---|
| Cuenta GitHub | github.com (gratis) |
| Cuenta Vercel | vercel.com (gratis, login con GitHub) |
| Archivos del proyecto | Descargar `.tar.gz` y extraer |

---

## Paso 1: Subir código a GitHub

### Opción A: Arrastrar archivos (más fácil)

1. Extrae el `.tar.gz` en tu computadora (click derecho → Extraer)
2. Entra a [github.com/new](https://github.com/new)
3. Nombre: `selectia` → Público → Create repository
4. En la página del repo vacío, click "uploading an existing file"
5. Arrastra TODOS los archivos de la carpeta extraída
6. Commit message: `SelectIA v3.3.1`
7. Click "Commit changes"

### Opción B: Git CLI (más rápido)

```bash
cd carpeta-extraida
git init
git add .
git commit -m "SelectIA v3.3.1"
git remote add origin https://github.com/TU_USUARIO/selectia.git
git push -u origin main
```

---

## Paso 2: Conectar Vercel

```mermaid
flowchart LR
    A[vercel.com] --> B[New Project]
    B --> C[Import GitHub repo]
    C --> D[Select selectia]
    D --> E[Configure env vars]
    E --> F[Deploy]
    F --> G[selectia.vercel.app]
```

1. Entra a [vercel.com](https://vercel.com) → Login con GitHub
2. Click "Add New Project"
3. Busca y selecciona tu repo `selectia`
4. Vercel detecta Next.js automáticamente

---

## Paso 3: Configurar variables de entorno

En la pantalla de deploy de Vercel, antes de click "Deploy":

| Variable | Valor |
|---|---|
| `AA_API_KEY` | `aa_FSNEylzoSXyQhtxgyrsXHaEntZMPboOT` |
| `HF_TOKEN` | `TU_TOKEN_REAL_AQUI` |
| `NTFY_TOPIC` | `selectia-alerts` |

**Cómo**: Settings → Environment Variables → Add cada una.

---

## Paso 4: Deploy

Click "Deploy". Vercel hace todo automáticamente:
- Instala dependencias (`bun install`)
- Compila Next.js (`next build`)
- Sirve en `selectia-tuusuario.vercel.app`

**Tiempo**: 2-3 minutos.

---

## Paso 5: Verificar

| Check | URL |
|---|---|
| Página principal | `selectia-tuusuario.vercel.app` |
| Privacy Policy | `selectia-tuusuario.vercel.app/privacy` |
| Terms | `selectia-tuusuario.vercel.app/terms` |
| API | `selectia-tuusuario.vercel.app/api/dashboard` |

---

## Paso 6 (Opcional): Dominio propio

1. Comprar dominio (ej: Namecheap, ~$20/año)
2. Vercel → Settings → Domains → Add
3. Configurar DNS: CNAME `www` → `cname.vercel-dns.com`
4. Vercel configura HTTPS automáticamente

---

## Cron Job (datos frescos diarios)

### Vercel Cron

El cron está definido en `vercel.json` (no en GitHub Actions) y llama al
orquestador server-side para forzar el refresco de las fuentes en vivo:

```json
{
  "crons": [
    {
      "path": "/api/dashboard?force=1",
      "schedule": "0 7 * * *"
    }
  ]
}
```

- Horario: `0 7 * * *` = 07:00 UTC diarias (02:00 Lima).
- Acción: `GET /api/dashboard?force=1` → `revalidateTag("dashboard-data")` + los 9 fetchers en vivo (con fallbacks a seeds estáticos si una fuente falla).
- No se commitea ningún JSON al repo: el resultado queda cacheado por Next.js (`unstable_cache`, revalidate 7 días) y por el edge (s-maxage=300, SWR=600).

### Variables de entorno

Vercel → Settings → Environment Variables (NO en el código):

- `AA_API_KEY` = tu key de Artificial Analysis (free tier, 100 req/día).
- `HF_TOKEN` = tu token de Hugging Face (rate limit por IP).
- `NTFY_TOPIC` = topic de ntfy.sh para alertas (opcional, default `selectia-alerts`).

### Refresco manual

Desde la vista Salud, el botón "Forzar actualización" hace `fetch("/api/dashboard?force=1")` (rate limit 5/min). La ventana también refetch al recuperar conexión.

---

## Actualizar el código después de cambios

Cuando yo (Z.ai) te dé un nuevo `.tar.gz`:

```bash
# Extraer nuevo tar sobre la carpeta existente
# Luego:
git add .
git commit -m "Update: descripción del cambio"
git push
# Vercel auto-deploya. El link NUNCA cambia.
```

---

## Troubleshooting

| Problema | Solución |
|---|---|
| "Build failed" en Vercel | Verificar que `package.json` tiene `"version": "3.3.1"` |
| Página en blanco | Verificar variables de entorno en Vercel |
| API devuelve 500 | Verificar `AA_API_KEY` y `HF_TOKEN` |
| Datos antiguos | Ejecutar cron job manualmente o `bun run scripts/generate-static-json.ts` |
| Ficha Técnica 404 | Normal — modelos propietarios no tienen repo en HuggingFace |
