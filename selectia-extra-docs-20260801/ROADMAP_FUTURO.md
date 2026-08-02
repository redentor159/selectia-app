# SelectIA — Roadmap a 12 meses

**Proyecto**: SelectIA v3.3.1 — Command Center de Modelos de IA para MYPEs latinoamericanas
**Autor**: José Jesús Alejandro Soria Vásquez — Ingeniería Industrial (Perú)
**Repo**: github.com/redentor159/selectia
**Licencia**: MIT
**Documento**: Roadmap de julio 2026 a julio 2027 (12 meses), organizado por versiones menores.

---

## Cómo leer este documento

- El roadmap está organizado por **versiones** (v3.4, v3.5, v4.0, v4.1, v4.2, v5.0).
- Cada versión tiene: **objetivo general**, **features confirmadas**, **features consideradas pero no confirmadas**, **fecha objetivo**.
- Las fechas son **estimaciones**, no compromisos. El proyecto es personal y el tiempo del autor es limitado.
- Todo lo marcado como *[Confirmado]* entrará en esa versión. Todo lo marcado como *[Considerado]* puede entrar o desplazarse.
- El roadmap se actualiza en cada release menor.

---

## Versión actual — v3.3.1 (julio 2026)

### Estado

**Estable y publicada**. Código en `main`, deploy en Vercel, repo público en github.com/redentor159/selectia.

### Qué incluye v3.3.1

- 206 modelos de IA desde 13 fuentes en vivo.
- Motor HRE-TOPSIS de 5 capas con AHP (CR = 0, 24 vectores).
- 8 criterios: precio, II, coding, agentic, speed, context, elo, reliability (reliability añadido en v3.3.1).
- 3 modos (Ahorro, Equilibrado, Calidad) × 8 categorías.
- 21 monedas de América.
- Glosario con 176 términos, 15 deepDives, 8 categorías.
- 4 temas (Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro).
- 16 bugs resueltos (ver `BUGS_RESUELTOS.md`).
- Casos de uso: IPERC, G-code CNC, manual técnico 300 páginas, cotización y traducción técnica.
- 31,116 líneas de TypeScript, 111 archivos.
- JSON maestro: 376 KB.
- Latencia: < 10 ms por recomendación (avg 0.5 ms, max 3 ms).
- Deploy: Vercel free.
- Cron: GitHub Actions diario 2 AM Lima.

### Lo que NO incluye v3.3.1 (deliberadamente)

- Auth / cuentas de usuario.
- Persistencia de favoritos o historial.
- API pública documentada.
- Multi-idioma (solo español LatAm).
- PWA / mobile app nativa.
- Webhooks.
- Modo offline.
- Marketplace de prompts.

---

## v3.4 — Q3 2026 (septiembre 2026 estimado)

### Objetivo general

**Personalización**: permitir al usuario tener su propia cuenta, guardar recomendaciones favoritas y ver historial de uso. Es el primer paso para que SelectIA pase de "herramienta de una sola consulta" a "asistente de uso recurrente".

### Features confirmadas

#### v3.4.1 — Auth con NextAuth.js *[Confirmado]*

- Implementar **NextAuth.js** (Auth.js v5) con proveedores:
  - GitHub OAuth (prioridad 1).
  - Google OAuth (prioridad 2).
  - Email magic link (prioridad 3, opcional).
- Tabla `users` en SQLite (Prisma ya está configurado).
- Sesión persistente con cookie httpOnly.
- Rutas protegidas: `/api/favorites`, `/api/history`.
- Logout desde el header.

#### v3.4.2 — Guardar recomendaciones favoritas *[Confirmado]*

- Botón "Guardar" en cada recomendación.
- Vista nueva: "Mis favoritos" en el sidebar.
- Cada favorito guarda: modelo recomendado, filtros usados, fecha, nota opcional.
- Exportar favoritos a JSON / CSV.

#### v3.4.3 — Historial de uso *[Confirmado]*

- Cada recomendación que el usuario ejecuta se loggea (con su consentimiento explícito).
- Vista "Historial" con timeline de últimas 50 recomendaciones.
- Filtrado por fecha, categoría, modo.
- Borrar historial individual o completo.

### Features consideradas pero no confirmadas

- **Compartir favorito vía URL** *[Considerado]*: generar enlace público (no listado) a un favorito. Útil para compartir con colegas.
- **Tags personalizados en favoritos** *[Considerado]*: organizar favoritos por tag libre (no solo categoría).
- **Notas enriquecidas (Markdown)** *[Considerado]*: las notas de favoritos soportan Markdown con preview.

### Dependencias técnicas

- `next-auth` v5 (beta estable en Q3 2026).
- Schema Prisma extendido (User, Favorite, History).
- Migración de SQLite a PostgreSQL en Vercel Postgres free tier (si el proyecto crece; SQLite sigue siendo válido para < 1000 usuarios).

### Cómo contribuir

- Issues con etiqueta `v3.4`: buscar "good first issue" para contribuir.
- Áreas donde se necesita ayuda: UI de favoritos, migración de schema, tests de auth.

---

## v3.5 — Q4 2026 (diciembre 2026 estimado)

### Objetivo general

**Interoperabilidad**: exponer SelectIA como API para que otras herramientas puedan consumir sus recomendaciones, y soportar portugués brasileño e inglés para ampliar cobertura LatAm + Caribe anglófono.

### Features confirmadas

#### v3.5.1 — Multi-idioma (portugués, inglés) *[Confirmado]*

- Internacionalización con `next-intl`.
- Idiomas soportados:
  - Español LatAm (default, actual).
  - Portugués brasileño (PT-BR).
  - Inglés (EN-US).
- Traducción de toda la UI.
- **El glosario se traduce completo** (176 términos × 3 idiomas = 528 entradas).
- Detección automática de idioma del navegador.
- Selector de idioma en el header.

#### v3.5.2 — API pública documentada *[Confirmado]*

- Endpoints:
  - `GET /api/v1/recommend?modo=equilibrado&categoria=coding&moneda=PEN`
  - `GET /api/v1/models` (catálogo completo)
  - `GET /api/v1/models/:slug` (ficha técnica)
  - `GET /api/v1/glossary/:termId`
- Documentación OpenAPI 3.1 en `/api/v1/docs`.
- Rate limiting: 60 req/min en free tier, 600 req/min con API key (registro gratuito).
- Respuestas en JSON, con paginación donde aplique.

#### v3.5.3 — Webhooks *[Confirmado]*

- Notificar a URLs registradas cuando:
  - Un modelo nuevo entra al catálogo.
  - Un modelo cambia de precio > 20 %.
  - Un modelo es marcado como "Reemplazado por X" (Función K).
- HMAC SHA-256 para firma de payloads.
- Reintentos con backoff exponencial (3 intentos).

### Features consideradas pero no confirmadas

- **SDK oficial JavaScript/TypeScript** *[Considerado]*: wrapper sobre la API pública.
- **SDK Python** *[Considerado]*: para audiencia data science.
- **API GraphQL** *[Considerado]*: además de REST, exponer endpoint GraphQL.

### Cómo contribuir

- Traductores nativos de PT-BR y EN: revisar glosario y UI.
- Desarrolladores: implementar rate limiting, webhooks, OpenAPI.

---

## v4.0 — Q1 2027 (marzo 2027 estimado)

### Objetivo general

**Mobile-first**: convertir SelectIA en una PWA instalable, con notificaciones push y modo offline. La MYPE LatAm usa principalmente celular; esta versión pone el celular como ciudadano de primera clase.

### Features confirmadas

#### v4.0.1 — Versión mobile-first PWA *[Confirmado]*

- Manifest.json completo.
- Service worker para cache de assets y JSON maestro.
- Instalable en iOS (Safari) y Android (Chrome).
- Iconos adaptativos para Android.
- Splash screen custom.
- Offline indicator cuando no hay red.

#### v4.0.2 — Notificaciones push *[Confirmado]*

- Suscripción a eventos:
  - Modelo nuevo en catálogo.
  - Modelo favorito bajó de precio > 20 %.
  - Modelo favorito marcado como reemplazado.
- Permisos explícitos del usuario.
- Web Push API con VAPID keys.
- Configurable: silenciar por categoría, horario, frecuencia.

#### v4.0.3 — Modo offline con service worker *[Confirmado]*

- Cache del JSON maestro en IndexedDB.
- Última versión conocida sirve offline.
- Indicador visible "Datos de {fecha} (offline)".
- Sincronización en background cuando hay red (Background Sync API).
- Conflict resolution: siempre gana la versión del servidor.

### Features consideradas pero no confirmadas

- **App nativa React Native** *[Considerado]*: si la PWA no es suficiente para iOS.
- **Share extension** *[Considerado]*: compartir texto desde otras apps a SelectIA para categorizarlo.

### Dependencias técnicas

- `next-pwa` o implementación manual.
- VAPID keys gestionadas en Vercel env vars.
- Background Sync solo funciona en Chrome/Edge; iOS limitado.

---

## v4.1 — Q2 2027 (junio 2027 estimado)

### Objetivo general

**Conversación**: llevar SelectIA a los canales donde la MYPE ya está (WhatsApp, Telegram), en lugar de pedirle que abra una web.

### Features confirmadas

#### v4.1.1 — Integración con WhatsApp Business *[Confirmado]*

- Bot de WhatsApp Business con la API oficial de Meta.
- Comandos:
  - `!recomendar <categoria> <modo>`: devuelve top 3 modelos.
  - `!modelo <nombre>`: ficha técnica resumida.
  - `!glosario <termino>`: definición.
  - `!precio <moneda>`: precios de modelos top en moneda local.
- Mensajes con plantillas aprobadas por Meta.
- Rate limiting por número de teléfono.
- Carrito: comparar 2-3 modelos en conversación.

#### v4.1.2 — Bot de Telegram *[Confirmado]*

- Bot de Telegram con `grammy` o `telegraf`.
- Mismos comandos que WhatsApp.
- Inline keyboards para selección rápida.
- Soporte de grupos (con permisos de admin).
- Mensajes con formato Markdown.
- Sin costo (Telegram API es gratis).

### Features consideradas pero no confirmadas

- **Bot de Discord** *[Considerado]*: para comunidades de desarrolladores.
- **Bot de Slack** *[Considerado]*: para equipos B2B.
- **Integración con Microsoft Teams** *[Considerado]*: si hay demanda enterprise.

### Dependencias técnicas

- Meta WhatsApp Business API (requiere verificación de negocio).
- Telegram Bot API (gratis, inmediato).
- Webhooks en Vercel para recibir mensajes.

---

## v4.2 — Q3 2027 (septiembre 2027 estimado)

### Objetivo general

**Comunidad**: empezar a construir comunidad alrededor de SelectIA: marketplace de prompts y foro de usuarios.

### Features confirmadas

#### v4.2.1 — Marketplace de prompts *[Confirmado]*

- Sección pública donde usuarios suben prompts.
- Categorías: IPERC, G-code, cotización, traducción, manual técnico, etc.
- Cada prompt: título, descripción, prompt completo, variables, ejemplo de salida, autor, licencia (CC-BY default).
- Rating 1-5 estrellas y comentarios.
- Fork: copiar y modificar un prompt existente.
- Moderación: reportes de prompts inapropiados.

#### v4.2.2 — Comunidad de usuarios *[Confirmado]*

- Foro integrado (con Discourse o solution similar self-hosted).
- Categorías: casos de uso, bugs, feature requests, off-topic.
- Login unificado con la cuenta de SelectIA (v3.4).
- Perfiles de usuario con badges (contribuidor, traductor, etc.).

### Features consideradas pero no confirmadas

- **Marketplace de presets de filtros** *[Considerado]*: guardar combinaciones de filtros como "preset" y compartirlo.
- **Wikis de casos de uso** *[Considerado]*: wikis editables colaborativamente por caso de uso.

### Dependencias técnicas

- Discourse (self-hosted en subdominio) o GitHub Discussions integrados.
- Moderación requiere herramientas admin.

---

## v5.0 — Q4 2027 (diciembre 2027 estimado)

### Objetivo general

**Enterprise-ready**: versión self-hosted con Docker, dashboards de uso, y soporte para empresas que quieren desplegar SelectIA en su propia infraestructura.

### Features confirmadas

#### v5.0.1 — On-premise para empresas *[Confirmado]*

- Imagen Docker oficial (`selectia/selectia:latest`).
- `docker-compose.yml` con PostgreSQL + Redis + Next.js.
- Documentación de despliegue en:
  - AWS ECS.
  - GCP Cloud Run.
  - Azure Container Apps.
  - On-premise con Kubernetes.
- Licencia dual: MIT para uso personal/educativo, licencia comercial opcional para empresas que quieran soporte.

#### v5.0.2 — Self-hosted con Docker *[Confirmado]*

- Imagen Docker liviana (~150 MB).
- Healthcheck endpoint.
- Variables de entorno para configuración sin tocar código.
- Volúmenes para persistencia de datos.
- Backups automatizados documentados.

#### v5.0.3 — Análisis de uso con dashboards *[Confirmado]*

- Dashboard de uso para administradores:
  - Recomendaciones por día / semana / mes.
  - Modelos más recomendados.
  - Categorías más consultadas.
  - Modos más usados.
- Métricas de adopción: usuarios activos, retención, frecuencia.
- Exportar datos a CSV / JSON.
- Privacidad por diseño: no se loggea contenido de prompts, solo metadata.

### Features consideradas pero no confirmadas

- **SSO empresarial (SAML, OIDC)** *[Considerado]*: para integración con Okta, Azure AD, etc.
- **Auditoría logs** *[Considerado]*: registro inmutable de acciones admin.
- **Multi-tenancy** *[Considerado]*: cada empresa tiene su instancia lógica aislada.

### Dependencias técnicas

- Docker oficial multi-arch (amd64, arm64).
- PostgreSQL 16+ recomendado (SQLite sigue siendo válido para < 100 usuarios).
- Redis opcional para cache distribuido.

---

## Features consideradas pero no confirmadas (en cualquier versión futura)

### Feature 1 — Comparación lado a lado enriquecida

Comparar 3-5 modelos con tablas enriquecidas: no solo datos crudos, sino ventajas/desventajas cualitativas generadas por un LLM.

### Feature 2 — Alertas de precio histórico

Notificar cuando un modelo baja a su precio histórico mínimo (usando el Token Price Index de BenchLM, 41 meses de historia).

### Feature 3 — Integración con proveedores locales LatAm

Integrar precios de proveedores de API locales (ej.:吞吐量, plataformas brasileñas) que ofrezcan mejores precios en moneda local.

### Feature 4 — Recomendador de prompts por tarea

Dado un caso de uso ("necesito traducir manual técnico de 80 páginas"), recomendar no solo el modelo sino el prompt template óptimo. Esto conecta con el marketplace de prompts (v4.2).

### Feature 5 — Modo "asistente"

Chat in-app donde el usuario describe su caso en lenguaje natural y SelectIA le guía: elige categoría, modo, moneda, modelo, y copia el prompt listo. Usaría un LLM barato (GPT-4o-mini) para la conversación, no para la recomendación (que sigue siendo HRE-TOPSIS).

### Feature 6 — Plugin para Excel / Google Sheets

Función `=SELECTIA_RECOMENDAR(categoria, modo, moneda)` que llama a la API pública y devuelve el top 1. Útil para MYPEs que viven en Excel.

### Feature 7 — Plugin para VS Code

Recomendar modelo de IA para la tarea de coding que estás haciendo, en función del lenguaje, complejidad y contexto del archivo abierto.

### Feature 8 — Comparador de costos en tiempo real

Simulador: "si uso este modelo 1000 veces al día con prompt promedio de 500 tokens y output de 200 tokens, ¿cuánto gasto al mes?" Integrado con gráficos.

---

## Cómo contribuir al roadmap

### Para usuarios

1. Abre un issue con etiqueta `feature-request` describiendo la feature.
2. Si es un bug, usa etiqueta `bug`.
3. Vota con 👍 en issues existentes para priorizar.

### Para desarrolladores

1. Busca issues con etiqueta `good first issue` para empezar.
2. Issues con etiqueta `help wanted` son tareas más grandes que necesitan un contribuidor.
3. Antes de empezar a trabajar en una feature grande, abre un issue de discusión para alinear diseño.

### Para empresas

1. Si quieres que una feature entre en una versión específica, considera sponsorizar su desarrollo.
2. Si quieres soporte enterprise (SLA, onboarding), espera a v5.0 (Q4 2027) o contacta al autor directamente.

### Para traductores

1. La traducción del glosario (176 términos × idiomas) es el trabajo más grande.
2. Se coordina vía GitHub Discussions con etiqueta `i18n`.
3. Se reconoce a los traductores con badge en su perfil (v4.2).

---

## Visión de largo plazo (más allá de 12 meses)

### Visión 2028+

Si el proyecto tiene tracción, la visión es:

1. **SelectIA Foundation**: convertir el proyecto en una fundación sin fines de lucro que mantenga el open source, con governance abierta y board elegido por la comunidad.
2. **SelectIA Research**: brazo académico que publique papers sobre HRE-TOPSIS aplicado a selección de modelos de IA, con datos abiertos.
3. **SelectIA LatAm Network**: red de capítulos locales (Perú, México, Brasil, Colombia, etc.) que organicen workshops, traduzcan el glosario, y documenten casos de uso locales.
4. **SelectIA for Government**: versión específica para gobiernos LatAm que quieran recomendar IA a sus MYPEs (con datos de proveedores locales, integración con sistemas públicos).

### Visión personal del autor

El autor no busca monetizar SelectIA ni convertirlo en startup. Busca:

1. **Aprender en público**: usar el proyecto como pieza de portafolio y como excusa para aprender tecnologías nuevas.
2. **Servir a la MYPE LatAm**: si una MYPE ahorra tiempo gracias a esto, ya valió la pena.
3. **Abrir puertas profesionales**: usar el proyecto como conversación en entrevistas, charlas y colaboraciones.
4. **Dejar huella**: si en 5 años alguien dice "SelectIA me ayudó a elegir mi primer modelo de IA", el objetivo está cumplido.

---

## Cierre

Este roadmap es una **declaración de intenciones**, no un contrato. Las fechas pueden desplazarse, las features pueden entrar o salir, y el orden puede cambiar según feedback de la comunidad. Lo que no cambiará es:

- **Open source MIT**. Siempre.
- **Gratis para uso personal y educativo**. Siempre.
- **Enfoque LatAm / MYPE**. Siempre.
- **Honestidad sobre lo que se afirma y lo que no**. Siempre.

Si quieres influir en el roadmap, abre un issue o únete a las discussions en GitHub. La voz de la comunidad pesa más que la opinión del autor individual.

— *Fin del documento.*
