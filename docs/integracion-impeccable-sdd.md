# Integración Impeccable + SDD

Guía práctica para integrar [Impeccable](https://impeccable.style) (v4.0.2) de Paul Bakaus con el pipeline SDD de Gentle AI en OpenCode.

Cubre dos escenarios:
- **Proyecto desde 0**: arrancar un proyecto nuevo con SDD + Impeccable desde el primer commit
- **Proyecto existente**: aplicar Impeccable a un proyecto que ya tiene código funcionando
- **Extra — exploración visual multi-dirección**: Cómo explorar identidades visuales radicalmente distintas antes de comprometerse (esto NO es un comando de Impeccable, es un flujo del orquestador)

---

## Índice

1. [Prerrequisitos](#1-prerrequisitos)
2. [Instalación de Impeccable](#2-instalación-de-impeccable)
3. [Proyecto desde 0 — flujo completo](#3-proyecto-desde-0--flujo-completo)
4. [Proyecto existente — flujo de retrofit](#4-proyecto-existente--flujo-de-retrofit)
5. [Integración en el pipeline SDD (orquestador)](#5-integración-en-el-pipeline-sdd-orquestador)
6. [Gatekeeper con npx impeccable detect](#6-gatekeeper-con-npx-impeccable-detect)
7. [Referencia rápida de comandos Impeccable](#7-referencia-rápida-de-comandos-impeccable)
8. [Arquitectura de archivos](#8-arquitectura-de-archivos)
9. [Solución de problemas](#9-solución-de-problemas)
10. [Referencias](#10-referencias)

---

## 1. Prerrequisitos

| Requisito | Versión mínima | Notas |
|-----------|---------------|-------|
| Node.js | 22.12+ | Necesario para `npx impeccable install` y los scripts de contexto |
| OpenCode | última | El skill debe instalarse en `.opencode/skills/impeccable/` |
| SDD skills instalados | — | `sdd-init`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-apply`, `sdd-verify`, `sdd-archive` |
| Skill registry actualizado | — | `.atl/skill-registry.md` debe incluir `impeccable` |

### Instalación inicial de SDD (si no está hecho)

```bash
# En la raíz del proyecto, dentro de OpenCode:
/sdd-init
```

Esto detecta el stack, configura Strict TDD Mode, y crea el skill registry.

---

## 2. Instalación de Impeccable

### 2.1 Instalador oficial (recomendado para harnesses detectados)

```bash
npx impeccable install
```

Esto autodetecta harnesses como Gemini CLI, Claude Code, Cursor, etc. y copia la build correcta para cada uno.

**Problema conocido:** OpenCode NO es detectado automáticamente por el instalador. Solo se detecta Gemini CLI (y Antigravity). Para OpenCode hay que instalar manualmente (ver 2.2).

El instalador interactivo pregunta:
- Destino: `project` (local al proyecto) o `global` (~/)
- Qué harnesses incluir

### 2.2 Instalación manual para OpenCode (CUANDO el instalador no lo detecta)

```bash
# En la raíz del proyecto:
mkdir -p .opencode/skills/impeccable/reference
mkdir -p .opencode/skills/impeccable/scripts
```

Luego copiar los archivos desde la fuente (GitHub repo o instalación global de otro harness):

```bash
# Desde el repo clonado:
# cp -r <repo>/.opencode/skills/impeccable/ .opencode/skills/impeccable/
```

**Alternativa:** copiar desde la instalación global de OpenCode si existe:

```bash
cp -r ~/.config/opencode/skills/impeccable/scripts/* .opencode/skills/impeccable/scripts/
cp -r ~/.config/opencode/skills/impeccable/reference/* .opencode/skills/impeccable/reference/
```

### 2.3 Verificar que el SKILL.md tenga el frontmatter correcto

El archivo `.opencode/skills/impeccable/SKILL.md` **debe** tener:

```yaml
---
name: impeccable
user-invocable: true                    # ← Esto registra /impeccable como comando
argument-hint: "[craft|shape · audit|critique · ...] [target]"
allowed-tools:
  - Bash(npx impeccable *)
  - Bash(node .opencode/skills/impeccable/scripts/*)   # ← Paths relativos al proyecto
---
```

El campo `user-invocable: true` es el que hace que OpenCode muestre `/impeccable` en el autocompletado al tipear `/`.

### 2.4 Actualizar el skill registry

```bash
# Dentro de OpenCode:
/update-skills
```

O manualmente: actualizar `.atl/skill-registry.md` para incluir:

```
**Frontend/UI (4):** frontend-design, impeccable, ui-ux-pro-max, vercel-react-best-practices
```

### 2.5 Verificar instalación

```bash
# Verificar que los scripts existen:
ls .opencode/skills/impeccable/scripts/context.mjs
ls .opencode/skills/impeccable/scripts/pin.mjs
ls .opencode/skills/impeccable/reference/init.md
```

---

## 3. Proyecto desde 0 — flujo completo

Este es el flujo para un proyecto NUEVO que arranca con SDD + Impeccable desde el primer día.

### Fase 0: Inicialización

```bash
# 1. Instalar Impeccable (ver sección 2)
npx impeccable install
# ... + instalación manual para OpenCode si es necesario

# 2. Cerrar y reabrir OpenCode

# 3. Inicializar SDD
/sdd-init

# 4. Inicializar Impeccable — genera PRODUCT.md + DESIGN.md
/impeccable init
```

El comando `/impeccable init` pregunta:
- Tipo de superficie: `product` (app/dashboard) o `brand` (landing/marketing)
- Público objetivo
- Personalidad/tono de marca
- Anti-referencias (qué evitar)
- Colores primarios, tipografía, si existen

**Respuestas sugeridas para un ERP corporativo:**
- Modo: `product` → `operate`
- Público: operarios, administrativos, dueños de taller
- Tono: profesional, claro, sin estridencias
- Anti-referencias: purple gradients, glassmorphism, "boost your productivity", rounded cards
- Paleta: OKLCH, azul acero/gris neutro como base

Esto genera:
- `PRODUCT.md` — contexto de negocio persistente
- `DESIGN.md` — sistema de diseño en formato [Google Stitch](https://stitch.withgoogle.com/docs/design-md/overview/)

### Fase 1: SDD Propose

Normal. No necesita Impeccable.

```
/sdd-new nombre-del-cambio
```

### Fase 2: SDD Spec

Normal. Los escenarios funcionales no cambian.

### Fase 3: SDD Design (con Impeccable)

**Aquí entra Impeccable por primera vez en el pipeline.**

El diseño SDD debe:
1. Leer `DESIGN.md` generado por `/impeccable init`
2. Definir el **visitor mode** para cada superficie:
   - Dashboard → `Operate`
   - Login → `Operate`
   - Landing/página pública → `Persuade`
   - Documentación → `Read`
3. Documentar tokens: paleta OKLCH, tipografía, espaciado, radios
4. Definir componentes y variantes con `cva()` (class-variance-authority)

El design SDD NO reemplaza a DESIGN.md — lo complementa. El DESIGN.md es el contexto que Impeccable lee en cada comando.

### Fase 4: SDD Tasks

Normal. Pero incluir en las tareas:
- "Aplicar visitor mode {X} a la página {Y}"
- "Usar tokens de DESIGN.md"
- "Implementar con reglas Impeccable: sin cards anidadas, sin gradient text, OKLCH, etc."

### Fase 5: SDD Apply (con Impeccable inline)

El orquestador pasa el skill Impeccable al subagente `sdd-apply`:

```
Skills a cargar antes de implementar:
- .opencode/skills/impeccable/SKILL.md  → reglas de diseño
- .opencode/skills/impeccable/reference/craft-floor.md  → calidad mínima
```

El agente implementa CON las reglas de Impeccable:
- Nada de `linear-gradient` en textos
- Nada de bounce easing
- Nada de cards anidadas
- Usar OKLCH para colores
- Visitor mode según el tipo de página
- Tokens del DESIGN.md

**No necesitás ejecutar `/impeccable` manualmente.** El agente ya tiene las reglas.

### Fase 6: Gatekeeper

```bash
npx impeccable detect src/ --json
```

Si hay findings, el orquestador decide si re-ejecutar o preguntar (según modo Auto/Interactive).

### Fase 7: SDD Verify

Normal.

### Fase 8: SDD Archive

Normal.

---

## 4. Proyecto existente — flujo de retrofit

Este es el flujo para un proyecto que YA tiene código (como el ERP de carpintería metálica).

### Paso 1: Instalar Impeccable (ver sección 2)

```bash
npx impeccable install
# + instalación manual para OpenCode
```

Cerrar y reabrir OpenCode.

### Paso 2: Inicializar contexto de diseño

```bash
/impeccable init
```

Contestar las preguntas sobre el producto (público, tono, anti-referencias).

### Paso 3: Extraer el diseño existente

```bash
/impeccable document
```

Esto escanea todo el código y genera `DESIGN.md` con los tokens, componentes y sistema de diseño que YA EXISTEN. No inventa nada, documenta lo que hay.

### Paso 4: Auditar el estado actual

```bash
/impeccable critique
```

Esto analiza el diseño actual y devuelve:
- Problemas de jerarquía visual
- Problemas de consistencia
- Anti-patrones detectados
- Oportunidades de mejora

### Paso 5: Decidir alcance

Con el critique en mano, decidir:
- **Refinamiento**: aplicar `/impeccable polish` a secciones específicas
- **Rediseño completo**: crear un SDD change nuevo (`refactor-estetica-impeccable`) con las secciones a rediseñar

### Paso 6: SDD Change de polish (recomendado para ERP existente)

```bash
/sdd-new refactor-estetica-impeccable
```

En el proposal, incluir:
- Las secciones a pulir (login, dashboard, catálogo, cotizaciones, etc.)
- Los findings del critique
- Las reglas Impeccable a aplicar

En `sdd-design`:
- Definir visitor mode por página
- Documentar tokens existentes + cambios

En `sdd-apply`:
- El orquestador pasa el skill Impeccable
- El agente refactoriza manteniendo funcionalidad

Gatekeeper:
```bash
npx impeccable detect src/ --json
```

### Paso 7: Polish manual (alternativa rápida)

Para cambios rápidos sin SDD:

```bash
/impeccable polish la página de login
/impeccable polish el dashboard
/impeccable polish el formulario de cotización
```

Cada comando aplica una pasada de calidad a esa sección.

---

## 5. Integración en el pipeline SDD (orquestador)

Esto es lo que el ORQUESTADOR (Gentle AI) debe hacer automáticamente.

### 5.1 Configuración en el prompt del orquestador

En `opencode.json`, el agente `gentle-orchestrator` debe tener:

```json
"prompt": "... (instrucciones existentes) ...

### Integración Impeccable

Cuando el proyecto tenga `.opencode/skills/impeccable/`:
- En `sdd-design`: pasar el skill impeccable + DESIGN.md como contexto
- En `sdd-apply`: pasar el skill impeccable + craft-floor.md como reglas inline
- Después de `sdd-apply`: ejecutar `npx impeccable detect src/ --json` como gatekeeper
- Si hay findings CRITICAL: re-ejecutar apply
- Si hay findings WARNING: preguntar en modo Interactive, ignorar en Auto
```

### 5.2 Skills a pasar en cada fase

| Fase | Skills a pasar |
|------|---------------|
| `sdd-design` | `impeccable/SKILL.md`, `DESIGN.md` |
| `sdd-apply` | `impeccable/SKILL.md`, `impeccable/reference/craft-floor.md` |
| gatekeeper | `npx impeccable detect` (bash, no skill) |

### 5.3 Reglas inline para sdd-apply

El prompt de `sdd-apply` debe incluir:

```
## Reglas de diseño Impeccable (OBLIGATORIO)
- Usar visitor mode según el tipo de página (Operate, Persuade, Read, Experience)
- NO usar gradient text ni gradient en backgrounds decorativos
- NO usar bounce easing ni elastic animations
- NO anidar cards dentro de cards
- NO usar gris sobre fondos de color
- NO usar negro/blanco puro — siempre teñir
- Usar OKLCH para colores cuando sea posible
- Los tokens visuales están en DESIGN.md y PRODUCT.md
- Aplicar craft-floor.md antes de entregar
```

### 5.4 Flujo extra: exploración de direcciones visuales múltiples

> ⚠️ **Esto NO es un comando de Impeccable.** No existe un `/impeccable concept-seed` ni nada similar.
> Es un flujo que el ORQUESTADOR ejecuta usando herramientas reales: Impeccable para planificar,
> Engram para persistir, y SDD para structured planning.

**Cuándo aplica:** Cuando querés explorar múltiples identidades visuales ANTES de comprometerte con una. Por ejemplo: 6 macros de dashboard con identidades estructurales distintas, o 3 propuestas de landing page para mostrar al cliente.

**Flujo completo:**

#### Paso 1: Investigación de referencias (orquestador manual)

El orquestador investiga N direcciones visuales. Fuentes de inspiración:
- [Google Stitch DesignMD](https://stitch.withgoogle.com/docs/design-md/overview/) → biblioteca de system designs
- Dribbble / Behance / Referentes del rubro
- Componentes existentes en el proyecto

Cada dirección debe tener una **identidad estructural única** (no solo colores distintos):
- Tipo de superficie: glassmorphism, scaffolding 1px borders, tonal layers, pill radii, sombras suaves, etc.
- Grilla: 2-col asimétrica, 4-col compacto, fluid, etc.
- Radios, padding, borders, sombras — valores específicos
- Comportamiento hover/focus/active

#### Paso 2: Shape de cada dirección (con Impeccable real)

Para CADA dirección, ejecutar `/impeccable shape` por separado:

```bash
/impeccable shape macro-horizon     # Planificar identidad glassmorphism
/impeccable shape macro-romer       # Planificar identidad scaffolding industrial
/impeccable shape macro-lumio       # Planificar identidad luminosa suave
# ... etc por cada dirección
```

Cada `shape` genera un plan UX/UI que el orquestador guarda en Engram.

Si el feature es grande, se puede usar `/impeccable craft` que es el flujo completo shape-then-build con iteración visual.

#### Paso 3: Documentar en Engram

```bash
# Cada dirección se guarda como decisión para no perderla
mem_save(
  title: "Dirección visual: Horizon para dashboard macro",
  type: "decision",
  topic_key: "sdd/{change-name}/visual-direction/horizon",
  content: """
  **What**: Identidad estructural para macro Horizon
  **Estructura**:
  - Glassmorphism con backdrop-filter blur(20px)
  - Radios: 32px
  - Grilla: 2-columnas asimétrica
  - Borders: none (reemplazados por depth con sombras)
  - Padding: 24px
  - Hover: elevation increase con box-shadow
  """
)
```

#### Paso 4: Usuario elige

En modo **Interactive**: el orquestador presenta las opciones vía `question` tool y el usuario elige.
En modo **Auto**: el orquestador elige según match con PRODUCT.md + DESIGN.md.

#### Paso 5: SDD con la dirección elegida

El orquestador pasa la dirección elegida a todas las fases SDD:

**En `sdd-apply`:**
```
## Dirección visual elegida para este componente
Nombre: Horizon
Estructura:
- Glassmorphism con backdrop-filter blur(20px)
- Radios: 32px
- Grilla: 2-columnas asimétrica
- Borders: none

⚠️ Esto NO es solo colores. La estructura CSS debe reflejar
   esta identidad, no solo cambiar --primary-color.
   Si el CSS queda genérico (solo variables de color),
   el gatekeeper va a RECHAZAR el cambio.
```

#### Paso 6: Gatekeeper extendido

Además de `npx impeccable detect`, el orquestador verifica:

```
## Verificación post-apply
1. ¿npx impeccable detect src/ --json pasa sin errores?
2. ¿Cada macro tiene CSS estructural distinto?
   - Comparar selectores: no solo --primary-color cambia
   - Verificar: grid-template-columns, padding, border-radius, box-shadow, backdrop-filter
   - Si todos los CSS tienen la misma estructura y solo cambian variables → RECHAZAR
3. ¿Los class hooks existen en el HTML?
4. ¿El toggle global de theme funciona?
5. ¿Build compila?
```

#### Paso 7: Polish individual

```bash
/impeccable polish macro-horizon
/impeccable layout macro-horizon    # ajustar espaciado
/impeccable colorize macro-horizon  # ajustar paleta
/impeccable harden macro-horizon    # errores, edge cases
```

### 5.5 Cuándo NO usar este flujo

- **Un solo componente simple** (un botón, un card) → no vale la pena, mandale Impeccable directo
- **Refactor de página existente** → mejor retrofit estándar (sección 4)
- **Cuando el usuario ya tiene una dirección clara** → no explorar, ejecutar

### 5.6 Persistencia en Engram

| Qué guardar | topic_key | Cuándo |
|-------------|-----------|--------|
| DESIGN.md | `sdd-init/{project}` | `/impeccable init` |
| Dirección visual candidata | `sdd/{change-name}/visual-direction/{slug}` | Después de shape |
| Dirección elegida | `sdd/{change-name}/visual-direction` | Cuando el usuario elige |
| DesignMD de referencia | `sdd/{change-name}/designmd/{slug}` | Si se portan conceptos externos |

---

## 6. Gatekeeper con npx impeccable detect

El detector de Impeccable es una herramienta standalone que NO necesita LLM. Corre 59 reglas deterministas.

### 6.1 Uso básico

```bash
# Escanear directorio
npx impeccable detect src/

# Escanear archivo específico
npx impeccable detect src/app/page.tsx

# JSON para CI/gatekeeper
npx impeccable detect src/ --json

# Ignorar config del proyecto
npx impeccable detect --no-config src/
```

### 6.2 Integración en el gatekeeper del orquestador

```javascript
// Pseudocódigo del gatekeeper
const result = execSync('npx impeccable detect src/ --json')
const findings = JSON.parse(result)

if (findings.some(f => f.severity === 'error')) {
  // En Auto: re-ejecutar sdd-apply con los findings como feedback
  // En Interactive: mostrar findings y preguntar
} else {
  // Continuar pipeline
}
```

### 6.3 Ignorar falsos positivos

```bash
# Ignorar una regla específica
npx impeccable ignores add-rule overused-font

# Ignorar un archivo completo
npx impeccable ignores add-file "src/legacy/**"

# Ignorar un valor específico (ej: una fuente que es parte de la marca)
npx impeccable ignores add-value overused-font Inter --reason "Brand font"
```

Los ignores se guardan en `.impeccable/config.json` y persisten entre sesiones.

### 6.4 Inline ignores en código

```html
<!-- impeccable-disable overused-font: fuente legacy -->
<p class="text-inter">Texto legacy</p>
```

```css
/* impeccable-disable-line no-gray-text */
```

---

## 7. Referencia rápida de comandos Impeccable

| Comando | Categoría | Qué hace |
|---------|-----------|----------|
| `/impeccable init` | Setup | Configura PRODUCT.md + DESIGN.md |
| `/impeccable document` | Setup | Extrae DESIGN.md del código existente |
| `/impeccable extract` | Setup | Extrae componentes reutilizables al design system |
| `/impeccable critique` | Evaluar | UX review con scoring heurístico |
| `/impeccable audit` | Evaluar | Calidad técnica (accesibilidad, performance, responsive) |
| `/impeccable polish` | Refinar | Pasada final de calidad antes de shipping |
| `/impeccable bolder` | Refinar | Amplificar diseños planos |
| `/impeccable quieter` | Refinar | Moderar diseños agresivos |
| `/impeccable distill` | Refinar | Simplificar, eliminar complejidad |
| `/impeccable harden` | Refinar | Errores, i18n, edge cases |
| `/impeccable onboard` | Refinar | First-run flows, empty states |
| `/impeccable animate` | Mejorar | Animaciones con propósito |
| `/impeccable colorize` | Mejorar | Agregar color estratégico |
| `/impeccable typeset` | Mejorar | Jerarquía tipográfica |
| `/impeccable layout` | Mejorar | Espaciado, ritmo visual |
| `/impeccable delight` | Mejorar | Momentos de delight |
| `/impeccable overdrive` | Mejorar | Efectos visuales extraordinarios |
| `/impeccable clarify` | Corregir | UX copy, etiquetas, errores |
| `/impeccable adapt` | Corregir | Adaptación a dispositivos |
| `/impeccable optimize` | Corregir | Performance UI |
| `/impeccable shape` | Planificar | Planificar UX/UI antes de escribir código |
| `/impeccable craft` | Planificar | Flujo completo shape-then-build con iteración visual |
| `/impeccable live` | Iterar | Variantes visuales en navegador |

### Atajos (pin)

```bash
# Crear atajo para un comando usado frecuentemente
/impeccable pin audit    →   ahora /audit funciona standalone

# Remover atajo
/impeccable unpin audit
```

---

## 8. Arquitectura de archivos

### En proyecto desde 0

```
proyecto/
├── .opencode/
│   └── skills/
│       └── impeccable/
│           ├── SKILL.md
│           ├── reference/       → 30+ playbooks por comando
│           └── scripts/         → ~70 scripts (context, pin, live, hook, detector)
├── PRODUCT.md                   → generado por /impeccable init
├── DESIGN.md                    → generado por /impeccable init o document
├── .impeccable/
│   ├── config.json              → configuración compartida
│   └── config.local.json        → overrides por desarrollador (.gitignored)
└── (código del proyecto)
```

### En proyecto existente (retrofit)

Lo mismo + se agregan `PRODUCT.md` y `DESIGN.md` al proyecto existente.

### Ubicación global

```
~/.config/opencode/skills/impeccable/
├── SKILL.md                     → misma estructura, con user-invocable: true
├── reference/
└── scripts/
```

### Nota sobre .gitignore

Agregar al `.gitignore` del proyecto:

```gitignore
# impeccable-ignore-start
.impeccable/config.local.json
.impeccable/hook.cache.json
.impeccable/hook.pending.json
.impeccable/*.png
.impeccable/live/server.json
.impeccable/live/sessions/
.impeccable/live/previews/
.impeccable/live/annotations/
.impeccable/live/cache/
# impeccable-ignore-end
```

**NO ignorar:** `.impeccable/config.json`, `.impeccable/design.json`, `DESIGN.md`, `PRODUCT.md`

---

## 9. Solución de problemas

### 9.1 `/impeccable` no aparece en el menú de comandos

**Causa más común:** el SKILL.md no tiene `user-invocable: true` en el frontmatter.

**Solución:**
1. Verificar `.opencode/skills/impeccable/SKILL.md` — debe tener `user-invocable: true`
2. Verificar que OpenCode tiene permiso para cargar el skill
3. Cerrar y reabrir OpenCode (los skills se cargan al inicio de sesión)

### 9.2 `user-invocable: true` está pero no aparece

El SKILL.md podría tener errores de sintaxis YAML que impiden que OpenCode lo parseé.

**Solución:**
```bash
node -e "require('js-yaml').load(require('fs').readFileSync('.opencode/skills/impeccable/SKILL.md','utf8'))"
```

### 9.3 Los scripts fallan con "path not found"

**Causa:** El SKILL.md tiene paths hardcodeados que no coinciden con la instalación real.

| Build | Path correcto en SKILL.md |
|-------|--------------------------|
| OpenCode (proyecto-local) | `node .opencode/skills/impeccable/scripts/context.mjs` |
| OpenCode (global) | `node <project>/.opencode/skills/impeccable/scripts/context.mjs` |
| Gemini CLI | `node .gemini/skills/impeccable/scripts/context.mjs` |
| Claude Code | (usa paths relativos al skill) |

**Solución:** Asegurarse de que el SKILL.md coincida con la ubicación real de los scripts.

### 9.4 `npx impeccable install` no detecta OpenCode

**Problema conocido.** El instalador oficial solo detecta Gemini CLI, Claude Code, Cursor, Codex CLI, GitHub Copilot, Grok Build y Antigravity.

**Solución:** Instalación manual (ver sección 2.2).

### 9.5 El detector da falsos positivos en código legacy

```bash
npx impeccable ignores add-file "src/legacy/**"
```

O agregar inline ignores en el código fuente.

### 9.6 El skill no se carga al reiniciar OpenCode

Posiblemente el skill registry está corrupto o desactualizado.

```bash
# Regenerar skill registry
/update-skills
```

O forzar la recarga cerrando OpenCode, borrando caché si existe, y reabriendo.

---

## 10. Referencias

- [Impeccable Official Site](https://impeccable.style)
- [GitHub Repo](https://github.com/pbakaus/impeccable)
- [Google Stitch — DESIGN.md spec](https://stitch.withgoogle.com/docs/design-md/overview/)
- [SDD Orchestrator docs](https://opencode.ai/docs/sdd)
- [Impeccable Detector (npm)](https://www.npmjs.com/package/impeccable)
- [Impeccable Changelog](https://impeccable.style/changelog)
- [Impeccable FAQ](https://impeccable.style/faq)
- [Skill Registry docs](https://opencode.ai/docs/skills)

---

> **Última actualización:** 2026-07-28
> **Versión de Impeccable:** 4.0.2
> **Versión de SDD:** Gentle AI + OpenCode
