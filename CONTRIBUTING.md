# 🤝 Contributing — SelectIA

¡Gracias por tu interés en contribuir a SelectIA!

---

## 🚀 Cómo contribuir

### 1. Fork & Clone

```bash
git clone https://github.com/TU_USUARIO/selectia.git
cd selectia
bun install
```

### 2. Crear una rama

```bash
git checkout -b feature/mi-nueva-feature
# o
git checkout -b fix/mi-fix
```

### 3. Hacer cambios

```bash
bun run dev    # desarrollo
bun run lint   # verificar código
```

### 4. Commit

```bash
git add .
git commit -m "feat: descripción del cambio"
```

### Convención de commits

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva feature |
| `fix:` | Bug fix |
| `docs:` | Documentación |
| `style:` | Cambios de estilo (CSS, formato) |
| `refactor:` | Refactorización sin cambio de comportamiento |
| `perf:` | Mejora de performance |
| `chore:` | Tareas de mantenimiento |

### 5. Pull Request

Push a tu fork → Pull Request → describe los cambios.

---

## 📋 Reglas

### Código

- **TypeScript strict** — sin `any`
- **Lint limpio** — `bun run lint` debe dar 0 errores
- **TSC limpio** — `npx tsc --noEmit` debe dar 0 errores
- **shadcn/ui** — usar componentes existentes, no crear nuevos desde cero
- **CSS variables** — usar `var(--*)`, no hardcodear colores
- **Sin emojis en código** — usar iconos SVG de Lucide

### Datos

- **JSON < 500 KB** — el JSON maestro no debe exceder 500 KB
- **Zod validation** — toda API externa debe validarse con Zod
- **Graceful fallback** — si una API falla, el motor debe seguir funcionando
- **Aditivo** — los cambios nuevos no deben romper funcionalidad existente

### Glosario

- Términos nuevos deben tener `definition` + `example` + `related`
- Los `related` deben apuntar a términos que EXISTEN
- Categoría correcta (IA, Benchmark, Ingeniería, Costos, Arquitectura, Licencias, Infraestructura, Matemáticas)

---

## 🏗️ Estructura de archivos

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para entender la arquitectura completa.

---

## 📄 Licencia

Al contribuir, aceptas que tus cambios se publiquen bajo licencia MIT.
