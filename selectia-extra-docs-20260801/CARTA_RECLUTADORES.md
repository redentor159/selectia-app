# SelectIA — Carta para reclutadores

**Proyecto**: SelectIA v3.3.1 — Command Center de Modelos de IA para MYPEs latinoamericanas
**Autor**: José Jesús Alejandro Soria Vásquez — Ingeniería Industrial (Perú)
**Repo**: github.com/redentor159/selectia
**Licencia**: MIT
**Documento**: Guía para presentar el proyecto a reclutadores técnicos y no técnicos.

---

## Cómo leer este documento

Este documento está pensado para que un reclutador (o el propio autor al prepararse para una entrevista) entienda rápidamente:

- **Qué es SelectIA** en 30 segundos.
- **Qué competencias demuestra** el proyecto (mapeadas a un vocabulario de RRHH).
- **Qué métricas verificables** pueden mencionarse en CV y entrevista.
- **Cómo presentar el proyecto** en una entrevista técnica.
- **Qué preguntas pueden hacer** y cómo responderlas.
- **Qué NO afirmar** (boundaries honestos para no inflar el CV).
- **Plantillas de mensaje** para LinkedIn y email.

La regla de oro: **transparencia sobre inflación**. El proyecto habla por sí mismo; inflarlo lo descredibiliza.

---

## Pitch de 30 segundos para reclutador

> Construí **SelectIA**, un command center open source que reúne **206 modelos de IA** desde **13 fuentes de datos en vivo** y los rankea con un motor HRE-TOPSIS de cinco capas con pesos AHP perfectamente consistentes. Está pensado para MYPEs latinoamericanas: soporta 21 monedas, tiene glosario en español con 176 términos y casos de uso industriales como IPERC y G-code CNC. Lo escribí en TypeScript con Next.js 16, son 31,116 líneas de código en 111 archivos, y se publica bajo MIT. No es un producto comercial, es un proyecto educativo y de portafolio. Lo que más me interesa destacar es que el motor tiene explicabilidad real: cada recomendación se descompone en cinco capas auditables, y hay una animación de 36 pasos que muestra el razonamiento completo.

---

## Competencias demostradas (mapeo feature → skill)

### 1. Pensamiento analítico

**Dónde se ve**:
- Diseño del motor HRE-TOPSIS (combinación de dos métodos MCDM clásicos: TOPSIS + AHP con restricciones jerárquicas).
- Calibración de 24 vectores AHP (3 modos × 8 categorías) con Consistency Ratio = 0.
- Identificación de 16 bugs en v3.3.1 con causa raíz documentada.

**Cómo hablarlo en entrevista**: "Diseñé un sistema de decisión multicriterio que combina HRE con TOPSIS. Cada uno de los 24 vectores de pesos tiene Consistency Ratio cero, lo que significa que son matemáticamente consistentes. Lo verifiqué programáticamente en `src/lib/engine/ahp-verification.ts`."

### 2. Investigación técnica

**Dónde se ve**:
- Integración de 13 fuentes de datos distintas, cada una con su esquema, autenticación y rate limit.
- Análisis del estudio de Workday (NASDAQ: WDAY, enero 2026, 3,200 líderes) como motivación del proyecto, con verificación en 4 fuentes independientes.
- Comparativa honesta con 9 herramientas similares (Artificial Analysis, Chatbot Arena, Vellum, Helicone, OpenRouter, LiteLLM, ZeroEval, BenchLM, HuggingFace).

**Cómo hablarlo en entrevista**: "Antes de escribir código, leí la documentación de las 13 fuentes que iba a integrar. Documenté las decisiones de diseño en 20 ADRs que están en el repo, y la comparativa con competidores en `COMPARATIVA_COMPETIDORES.md`. No es code-first, es research-first."

### 3. Diseño de sistemas

**Dónde se ve**:
- Arquitectura "JSON estático + cron job" (vs API en vivo en cada request). Latencia < 10 ms por recomendación.
- Stack: Next.js 16 + TypeScript strict + Tailwind 4 + shadcn/ui + Zustand + TanStack Query + Zod + Recharts.
- Tolerancia a fallos: si una de 13 fuentes cae, la UI no se rompe; se conserva último snapshot válido.
- Cron diario 2 AM Lima vía GitHub Actions, deploy automático en Vercel.

**Cómo hablarlo en entrevista**: "Decidí arquitectura JSON estático + cron job porque una API en vivo en cada request saturaría las 13 fuentes gratuitas. El JSON maestro pesa 376 KB y se sirve estático. La latencia por recomendación es de menos de 10 milisegundos porque todo el cómputo ocurre en el cliente. La decisión está documentada como ADR-006 en `DECISIONES_DISENIO.md`."

### 4. Documentación

**Dónde se ve**:
- 20 ADRs (Architecture Decision Records) en `DECISIONES_DISENIO.md`.
- 16 bugs documentados con síntomas, causa raíz, fix, lección aprendida en `BUGS_RESUELTOS.md`.
- FAQ con 47 preguntas en 6 categorías en `FAQ_SELECTIA.md`.
- 10 documentos técnicos en `extra-docs/` (este que estás leyendo, PITCH_DECK, PRESS_KIT, COMPARATIVA_COMPETIDORES, CASOS_USO_MYPE, ROADMAP_FUTURO, METRICAS_VERIFICABLES, etc.).
- Glosario con 176 términos y 15 deepDives en la propia app.

**Cómo hablarlo en entrevista**: "Cada decisión importante tiene un ADR. Cada bug tiene su entrada con causa raíz y lección aprendida. La documentación es parte del proyecto, no un afterthought. Si yo me caigo de un bus mañana, alguien puede continuar el proyecto solo leyendo los docs."

### 5. UX/UI

**Dónde se ve**:
- 4 temas (Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro).
- Design system extraído de Stripe.com + Linear.app (2026-06-29).
- Mobile-first: todas las vistas adaptan a 375 px.
- Accesibilidad: focus rings, ARIA, keyboard navigation, soporte para lectores de pantalla.
- 28 vistas en el dashboard (Resumen, Recomendador, Tabla, Comparador, Analytics, Simulador ROI, Calculadora, Calculadora Hardware, Guía de Decisión, Salud, Animación del Motor, Glosario, Mapa Proveedores, QR Generator, Routing LLM, Operario, Ingeniero, Gerente, Consultor, Compras, Ficha Técnica, etc.).

**Cómo hablarlo en entrevista**: "El design system se extrajo literalmente de Stripe y Linear, no es inventado. Está todo tokenizado en CSS variables, así que cambiar de tema es cambiar un atributo. La accesibilidad no es opcional: focus rings, ARIA, navegación por teclado. Y es mobile-first porque la MYPE LatAm usa principalmente celular."

### 6. Colaboración con IA

**Dónde se ve**:
- El proyecto fue construido con la guía de Cursor, Claude y la documentación oficial de cada tecnología. El autor aprendió desarrollo web de forma autodidacta durante el proyecto.
- **Honestidad**: no se afirma "orquesté IAs con un framework". El proceso fue manual, modelo por modelo, con IA como asistente.

**Cómo hablarlo en entrevista**: "Aprendí desarrollo web haciendo SelectIA, con la guía de Cursor y Claude. No usé ningún framework de orquestación; cada integración fue manual, leyendo la documentación de cada fuente. Esto me dio control total pero también me obligó a entender cada detalle. Si hoy tuviera que empezar de cero, usaría la misma aproximación."

### 7. Comunicación técnica

**Dónde se ve**:
- 6 variantes del post de LinkedIn en `LINKEDIN_POST_VARIANTES.md`, cada una con tono y público distintos.
- Pitch deck de 12 slides + 3 elevators pitches (30 s, 1 min, 3 min) en `PITCH_DECK.md`.
- Press kit completo en `PRESS_KIT.md`.
- Documento para reclutadores (este) en `CARTA_RECLUTADORES.md`.

**Cómo hablarlo en entrevista**: "Sé comunicar el proyecto a tres audiencias: técnica (devs), de negocio (MYPEs) y de RRHH (reclutadores). Para cada una tengo materiales distintos. No es lo mismo hablar con un ML engineer que con un CTO de una MYPE; sé ajustar el nivel."

### 8. Open source mindset

**Dónde se ve**:
- Licencia MIT (más permisiva que GPL o Apache).
- CONTRIBUTING.md con guía para contribuidores.
- Issues templates en GitHub.
- Roadmap público a 12 meses.
- Aceptación explícita de forks comerciales.

**Cómo hablarlo en entrevista**: "Elegí MIT deliberadamente porque quiero máxima adopción, no copyleft restrictivo. Acepto que alguien haga fork y monetice; es el precio del open source real. El CONTRIBUTING.md está pensado para que un contribuidor nuevo pueda empezar en una tarde."

---

## Métricas verificables para CV

Estas son las métricas que pueden mencionarse en CV y entrevista. Todas son verificables con comandos públicos en `METRICAS_VERIFICABLES.md`.

| Métrica | Valor | Cómo verificarlo |
|---|---|---|
| Modelos de IA integrados | 206 | `curl /api/dashboard \| jq '.models \| length'` |
| Fuentes de datos en vivo | 13 | `curl /api/health \| jq '.sources \| length'` |
| Líneas de TypeScript | 31,116 | `find src -name '*.ts*' \| xargs wc -l \| tail -1` |
| Archivos de código | 111 | `find src -name '*.ts*' \| wc -l` |
| Tamaño JSON maestro | 376 KB | `ls -lh public/data/master_dashboard_data.json` |
| Latencia por recomendación | < 10 ms | medición con `performance.now()` |
| Monedas soportadas | 21 | `curl /api/dashboard \| jq '.currencies \| length'` |
| Términos de glosario | 176 | `grep -c '^  {' src/lib/data/glossary.ts` |
| DeepDives | 15 | `grep -c 'deepDive' src/lib/data/glossary.ts` |
| Vectores AHP | 24 | 3 modos × 8 categorías |
| Consistency Ratio AHP | 0 | `src/lib/engine/ahp-verification.ts` |
| Temas visuales | 4 | `src/components/theme-provider.tsx` |
| Bugs resueltos en v3.3.1 | 16 | `BUGS_RESUELTOS.md` |
| ADRs documentados | 20 | `DECISIONES_DISENIO.md` |
| Vistas en el dashboard | 28 | `src/components/dashboard/views/` |
| Fuentes de verificación del hook | 4 | Workday IR + TheNextWeb + PRNewswire + StockTitan |

### Cómo escribir esto en un CV (ejemplo)

> **SelectIA** — github.com/redentor159/selectia — julio 2026
> Command center open source (MIT) para elegir modelos de IA en MYPEs LatAm.
> - 206 modelos integrados desde 13 fuentes de datos en vivo (Artificial Analysis, BenchLM, ZeroEval, Arena, LiteLLM, HuggingFace, OpenRouter, etc.).
> - Motor HRE-TOPSIS de 5 capas con AHP (CR = 0, 24 vectores).
> - 21 monedas de América, glosario en español (176 términos, 15 deepDives).
> - Stack: Next.js 16, TypeScript strict, Tailwind 4, shadcn/ui, Zustand, TanStack Query, Zod.
> - 31,116 líneas de TypeScript, 111 archivos, JSON maestro 376 KB, latencia < 10 ms.
> - 16 bugs documentados y resueltos, 20 ADRs, 28 vistas en dashboard.

---

## Cómo presentar el proyecto en una entrevista

### Estructura recomendada (3-5 minutos)

1. **Contexto (30 seg)**: "Soy ingeniero industrial en Perú. SelectIA nace de ver que la MYPE LatAm quiere usar IA pero choca con barreras: precios en USD, benchmarks en inglés, vocabulario técnico opaco."
2. **Estadística del hook (20 seg)**: "Workday publicó un estudio en enero 2026, 3,200 líderes. 85 % ahorra 1-7 h por semana con IA, pero 40 % se pierde en retrabajo por elegir mal."
3. **Solución (1 min)**: "SelectIA reúne 206 modelos desde 13 fuentes, los normaliza a 8 criterios, los rankea con HRE-TOPSIS + AHP. Latencia < 10 ms. 21 monedas. Glosario en español."
4. **Demo o métricas (1 min)**: muéstrate el repo en GitHub, menciona los 31,116 LOC, los 16 bugs documentados, los 20 ADRs.
5. **Cierre (30 seg)**: "No es un producto comercial, es educativo. Lo que demuestra es que puedo llevar un proyecto real de principio a fin: investigación, diseño, código, docs, deploy."

### Qué NO hacer en la presentación

- No empezar con "hice un framework de orquestación de IAs". Eso no es verdad.
- No mencionar "ahorro del 95 %". No hay data.
- No decir "está en producción en planta real". Es PoC.
- No decir "tenemos N usuarios activos". No los hay todavía.
- No mencionar métricas que no puedes verificar. Si no recuerdas, usa formulación cualitativa.

### Qué SÍ hacer

- Tener el repo abierto en una pestaña, listo para mostrar.
- Tener la app desplegada en Vercel lista para demo en vivo.
- Tener preparado un "deep dive" de 30 segundos sobre cualquier ADR (por si te preguntan).
- Mencionar específicamente qué aprendiste en el proceso (no solo qué construiste).

---

## Preguntas que pueden hacer y cómo responderlas (15 preguntas)

### Q1. "¿Por qué Next.js y no Remix o SvelteKit?"

**Respuesta**: "Por tres razones: (1) Vercel free tier está optimizado para Next, deploy es trivial; (2) shadcn/ui tiene mejor soporte para Next que para Remix; (3) el App Router permite server components que simplifican el fetch inicial del JSON. Lo dejé documentado como ADR-001."

### Q2. "¿Por qué Zustand y no Redux?"

**Respuesta**: "Zustand es más simple para el alcance de SelectIA. El estado global es filtros + modo + moneda + tema + resultado del recomendador. Redux sería overkill. Zustand da selectores finos para evitar re-renders y tiene API minimalista. ADR-004."

### Q3. "¿Cómo garantizas que el AHP sea consistente?"

**Respuesta**: "Los 24 vectores AHP no se derivaron de encuestas; se construyeron deliberadamente con matrices perfectamente consistentes. El Consistency Ratio es cero, lo que es matemáticamente el caso ideal. Lo verifico en `src/lib/engine/ahp-verification.ts`. Si alguien quiere modificar un vector, tiene que mantener CR ≤ 0.10 o el test falla."

### Q4. "¿Por qué JSON estático y no una API en vivo?"

**Respuesta**: "Porque una API en vivo saturaría las 13 fuentes gratuitas. El JSON se refresca una vez al día a las 2 AM Lima vía GitHub Actions, pesa 376 KB, y se sirve estático desde Vercel. La latencia por recomendación es < 10 ms porque todo el cómputo ocurre en el cliente. La desventaja es que los datos pueden tener hasta 24 h de antigüedad, pero para el caso de uso MYPE es aceptable. ADR-006."

### Q5. "¿Cómo manejaste el outlier de Gemini 2.0 con 1M de contexto?"

**Respuesta**: "Puse un cap explícito en 256K tokens en la normalización. Gemini 2.0 queda saturado en 1.0, pero no distorsiona el resto. El cap está documentado en ADR y el bug está en `BUGS_RESUELTOS.md` como BUG-08. La lección: toda normalización min-max debe tener caps por ambos extremos."

### Q6. "¿Qué hiciste cuando el cron falla?"

**Respuesta**: "El cron tiene tolerancia a fallos. Si una de las 13 fuentes no responde, se conserva el último snapshot válido y se marca como 'yellow' en la vista Salud del Sistema. Si la fuente se recupera al día siguiente, se refresca. La UI nunca se rompe por un fallo de API."

### Q7. "¿Cómo son los tests?"

**Respuesta**: "Honestamente, la cobertura de tests automáticos es baja. Hay tests unitarios para el motor HRE-TOPSIS y para la verificación AHP. No hay tests E2E todavía. Es una deuda técnica que acknowledged. En v3.4 está planificado añadir tests con Vitest y Playwright."

### Q8. "¿Cómo es la accesibilidad?"

**Respuesta**: "focus rings obligatorios, navegación por teclado en todos los componentes interactivos, ARIA labels en elementos no textuales, soporte para prefers-reduced-motion, contraste WCAG AA mínimo. Cambié emojis por íconos Lucide en v3.3.1 precisamente por accesibilidad (BUG-03): los emojis se venan distinto en cada SO y los lectores de pantalla no los manejan bien."

### Q9. "¿Por qué MIT y no GPL?"

**Respuesta**: "Porque quiero máxima adopción. GPL fuerza a cualquier derivado a ser GPL, lo que cierra la puerta a uso comercial. MIT permite forks comerciales, lo que acepto como precio del open source real. No busco monetizar SelectIA, pero si alguien más quiere, MIT se lo permite. ADR-015."

### Q10. "¿Cuál fue el bug más difícil?"

**Respuesta**: "BUG-15, el ContextWindow corrupto. 210 modelos aparecían con context window de 8K, falso. La causa raíz era el matching entre LiteLLM (que usa `claude-3-5-sonnet-20241022`) y mi modelKey interno (`claude-3.5-sonnet`). El matching por substring fallaba. Lo arreglé con 3 estrategias en orden: exacto, normalizado (sin puntos ni guiones), substring bidireccional. Y si ninguna matchea, se conserva el valor anterior en lugar de fallback a 8K."

### Q11. "¿Cómo decidiste los 8 criterios?"

**Respuesta**: "Originalmente eran 7: precio, II, coding, agentic, speed, context, elo. En v3.3.1 añadí reliability como octavo, basado en datos de ZeroEval (failure rate, P95). La razón: un modelo puede ser brillante en benchmarks y fallar en producción. Reliability captura eso. Los 8 criterios cubren las dimensiones que la MYPE realmente usa: cuánto cuesta, qué tan inteligente, si sirve para programar, si puede usar herramientas, qué tan rápido, cuánto contexto, qué tan bien le va en batallas humanas, qué tan confiable. ADR-008."

### Q12. "¿Qué harías diferente si empezaras hoy?"

**Respuesta**: "Tres cosas: (1) habría empezado con tests desde el día 1, no como deuda técnica al final; (2) habría usado Turborepo desde el inicio para separar el motor en un package independiente, reusable; (3) habría documentado los ADRs conforme tomaba las decisiones, no retrospectivamente."

### Q13. "¿Cómo es el deploy?"

**Respuesta**: "Push a main → Vercel build automático → deploy en producción. El cron de GitHub Actions corre a las 2 AM Lima, hace commit del JSON actualizado, Vercel redeploya. Sin intervención manual. Si algo se rompe, puedo revertir desde Vercel dashboard o desde git."

### Q14. "¿Qué pasa si un usuario te pide un modelo que no está?"

**Respuesta**: "Tres opciones: (1) si está en alguna de las 13 fuentes pero no se matcheó, abre un issue y lo arreglo en el matching; (2) si no está en ninguna fuente, hay que añadir una fuente nueva, lo que requiere modificar el cron; (3) si es un modelo interno de una empresa, está planeado para v3.5 una API pública que permite alimentar modelos propios. Mientras tanto, el usuario puede usar el comparador con los 206 modelos existentes."

### Q15. "¿Cuál es el siguiente paso del proyecto?"

**Respuesta**: "v3.4 en Q3 2026: auth con NextAuth.js, guardar favoritos, historial de uso. v3.5 en Q4: multi-idioma (PT-BR, EN), API pública documentada, webhooks. v4.0 en Q1 2027: PWA mobile-first con notificaciones push y modo offline. El roadmap completo de 12 meses está en `ROADMAP_FUTURO.md`."

---

## Lo que NO afirmar en entrevista (boundaries honestos)

| No afirmar | Por qué | Qué decir en su lugar |
|---|---|---|
| "Orquesté IAs con un framework" | Fue manual, modelo por modelo, con IA como asistente | "Integré 13 fuentes manualmente, leyendo la documentación de cada una" |
| "95 % de ahorro" | No hay data | "Ayuda a elegir el modelo correcto para cada tarea, lo que puede resultar en ahorro" |
| "Producción en planta real" | Es PoC | "Es una prueba de concepto; los casos de uso son escenarios verosímiles, no implementaciones activas" |
| "Usuarios activos" | No los hay todavía | "Recientemente publicado, en fase de adopción temprana" |
| "Framework propio de orquestación" | No es framework, es una app | "Es una aplicación web, no un framework" |
| "Sistema de IA en producción" | Es un comparador, no un sistema de IA | "Es un comparador y recomendador de modelos de IA" |
| "Equipo de N personas" | Es proyecto individual | "Proyecto individual, con guía de herramientas de IA (Cursor, Claude)" |
| "Escalado a N usuarios" | No hay usuarios suficientes para hablar de escala | "Diseñado para escalar, pero actualmente en adopción temprana" |
| "Validado con clientes" | No hay clientes | "Casos de uso documentados como escenarios verosímiles" |
| "Genera revenue" | No hay revenue | "Proyecto educativo y de portafolio, sin modelo de negocio" |

---

## Links a compartir

### Para reclutadores (resumen)

- **Repo GitHub**: github.com/redentor159/selectia
- **Demo Vercel**: [placeholder para URL de Vercel]
- **LinkedIn post (variante recomendada para recruiters)**: ver `LINKEDIN_POST_VARIANTES.md`, variante 2 (Técnica).
- **Este documento**: `extra-docs/CARTA_RECLUTADORES.md`
- **Pitch deck**: `extra-docs/PITCH_DECK.md`

### Para entrevistadores técnicos

- **Arquitectura**: `ARCHITECTURE.md` (en raíz del repo).
- **Decisions**: `extra-docs/DECISIONES_DISENIO.md` (20 ADRs).
- **Bugs**: `extra-docs/BUGS_RESUELTOS.md` (16 bugs documentados).
- **API reference**: `docs/API_REFERENCE.md`.
- **Engine trace**: `docs/ENGINE_TRACE.md`.
- **File inventory**: `docs/FILE_INVENTORY.md`.

### Para managers no técnicos

- **Pitch deck**: `extra-docs/PITCH_DECK.md`.
- **Press kit**: `extra-docs/PRESS_KIT.md`.
- **FAQ**: `extra-docs/FAQ_SELECTIA.md`.
- **Casos de uso**: `extra-docs/CASOS_USO_MYPE.md`.

---

## Plantilla de mensaje para reclutador (LinkedIn DM)

> Hola [Nombre], vi que estás buscando [perfil: ingeniero full-stack / product engineer / technical PM]. Quería compartir un proyecto que acabo de publicar: **SelectIA**, un command center open source (MIT) para elegir modelos de IA en MYPEs LatAm.
>
> Métricas clave:
> - 206 modelos de IA integrados desde 13 fuentes en vivo
> - 31,116 líneas de TypeScript, 111 archivos
> - Motor HRE-TOPSIS de 5 capas con AHP (CR = 0)
> - 21 monedas de América, glosario en español (176 términos)
> - Latencia < 10 ms por recomendación
>
> Stack: Next.js 16, TypeScript strict, Tailwind 4, shadcn/ui, Zustand, TanStack Query, Zod.
>
> Repo: github.com/redentor159/selectia
>
> No es un producto comercial, es un proyecto educativo y de portafolio. Lo que demuestra es que puedo llevar un proyecto real de principio a fin: investigación, diseño, código, docs y deploy.
>
> ¿Te interesa conversar? Tengo 20-30 minutos esta semana.
>
> Saludos,
> José

---

## Plantilla de email para postulación

**Asunto**: Postulación a [puesto] — SelectIA como pieza de portafolio

> Estimado/a [Nombre del reclutador o hiring manager]:
>
> Me dirijo a usted para postular al puesto de [puesto] en [empresa]. Como pieza central de mi portafolio, quiero destacar **SelectIA**, un proyecto open source (MIT) que construí individualmente en los últimos meses.
>
> **Qué es SelectIA**
> Un command center para elegir modelos de IA en MYPEs latinoamericanas. Reúne 206 modelos desde 13 fuentes de datos en vivo, los rankea con un motor HRE-TOPSIS de 5 capas con pesos AHP pre-calibrados (Consistency Ratio = 0), y entrega una recomendación explicada en menos de 10 milisegundos.
>
> **Métricas verificables**
> - 206 modelos, 13 fuentes, 21 monedas, 176 términos de glosario
> - 31,116 líneas de TypeScript en 111 archivos
> - 16 bugs documentados con causa raíz, 20 ADRs de decisiones de diseño
> - Stack: Next.js 16, TypeScript strict, Tailwind 4, shadcn/ui, Zustand 5, TanStack Query 5, Zod 4.0.2, Recharts, Lucide, Bun 1.3, Vercel free, GitHub Actions
>
> **Lo que demuestra**
> - Pensamiento analítico: diseño del motor HRE-TOPSIS + AHP
> - Investigación técnica: integración de 13 fuentes, cada una con su esquema
> - Diseño de sistemas: arquitectura JSON estático + cron job, latencia < 10 ms
> - Documentación: 20 ADRs, 16 bugs documentados, 10 docs en extra-docs/
> - UX/UI: 4 temas, design system extraído de Stripe + Linear, mobile-first
> - Open source: MIT, CONTRIBUTING.md, roadmap público a 12 meses
>
> **Repo**: github.com/redentor159/selectia
> **Demo**: [URL de Vercel]
>
> Me gustaría conversar sobre cómo mi perfil encaja con el puesto. Tengo disponibilidad esta semana para una llamada de 30 minutos.
>
> ¿Les parece bien?
>
> Saludos cordiales,
>
> José Jesús Alejandro Soria Vásquez
> Ingeniería Industrial — Perú
> [email]
> [LinkedIn URL]

---

## Cierre — Mensaje sobre qué tipo de rol busca el autor

El autor busca roles que combinen **investigación técnica**, **diseño de sistemas** y **impacto real en LatAm**. No busca roles puramente de código (junior dev), ni roles puramente de gestión (PM sin hands-on). El sweet spot es:

- **Product Engineer** en startup B2B LatAm.
- **Technical PM** en empresa de IA aplicada.
- **Solutions Engineer** en proveedor de IA con clientes LatAm.
- **Founding Engineer** en startup early-stage con misión social.
- **Consultor de IA** para MYPEs, con componente de implementación.

No busca:

- Roles 100 % gestión sin código.
- Roles 100 % código sin decisión de producto.
- Roles en empresas con practices que considere poco éticas (ej.: vigilancia masiva, IA militar).
- Roles que requieran reubicación fuera de LatAm (al menos en el corto plazo).

Lo que más valora en un rol:

- **Autonomía** para tomar decisiones técnicas.
- **Impacto** medible en usuarios reales.
- **Aprendizaje** continuo, especialmente en IA y sistemas distribuidos.
- **Cultura** de transparencia y documentación (como la que intentó construir en SelectIA).
- **Comunidad** LatAm: prefiere equipos distribuidos en LatAm sobre equipos en US/EU.

Si tienes un rol que encaja con este perfil, escríbele. Si no, comparte el repo con quien creas que le puede interesar.

— *Fin del documento.*
