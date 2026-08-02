# Guía de Publicación en LinkedIn — SelectIA

**Proyecto**: SelectIA v3.3.1
**Autor**: José Jesús Alejandro Soria Vásquez — Ing. Industrial (Perú)
**Repo**: github.com/redentor159/selectia

---

## Propósito de esta guía

Esta guía es el manual operativo para publicar SelectIA en LinkedIn de forma profesional y maximizar alcance. Cubre desde la preparación 24 horas antes hasta el plan de 30 días posterior a la publicación.

**Audiencia objetivo**: profesionales de Ingeniería Industrial, dev/ML engineers LatAm, founders de MYPEs, recruiters tech, profesores universitarios.

**Objetivo de la publicación**: posicionar el proyecto, generar conversación, atraer oportunidades profesionales, abrir puerta a charlas o colaboraciones.

**Reglas de oro no negociables**:
- Solo se afirman métricas verificables (206 modelos, 13 fuentes, 31,116 LOC TS, 111 archivos, JSON 376 KB, latencia < 10 ms / avg 0.5 ms / max 3 ms, 21 monedas, 176 términos en glosario, 15 deepDives, 8 categorías, 4 temas, v3.3.1, MIT).
- No se afirma "orquestación con framework" (fue manual), ni "95% de ahorro", ni "producción en planta real", ni "usuarios activos".
- Hook estadístico real: Workday Research, enero 2026, 3,200 líderes (NASDAQ: WDAY). URL: https://investor.workday.com/news-and-events/press-releases/news-details/2026/New-Workday-Research-Companies-Are-Leaving-AI-Gains-on-the-Table/default.aspx

---

## Sección 1 — Preparación (24 h antes)

### 1.1 Subir repo a GitHub

**Pasos**:
1. Verificar que el repo local esté limpio: `git status` (sin archivos sin commitear).
2. Crear el repo público en GitHub: `github.com/new` con nombre `selectia`.
3. Push: `git remote add origin git@github.com:redentor159/selectia.git && git push -u origin main`.
4. Verificar URL: `github.com/redentor159/selectia` debe responder.
5. Agregar `README.md` con: descripción, capturas, link al deploy, instrucciones de setup, link a la guía de deploy en Vercel.
6. Agregar `LICENSE` (MIT).
7. Agregar tópicos al repo: `ai`, `dashboard`, `topsis`, `ahp`, `multi-model`, `latam`, `open-source`, `nextjs`, `typescript`.

**Checklist de README**:
- [ ] Screenshot principal visible sin hacer scroll.
- [ ] Badge de deploy Vercel funcional.
- [ ] Stack tecnológico listado (Next.js, TS, Prisma, Tailwind, shadcn/ui).
- [ ] Instrucciones de setup local (mínimo 4 comandos).
- [ ] Sección "Métricas verificables" con los números reales.
- [ ] Link a la documentación técnica (`/docs/INDEX.md`).

### 1.2 Deploy en Vercel (5 minutos)

1. Entrar a `vercel.com/new`.
2. Importar el repo `redentor159/selectia`.
3. Framework preset: Next.js.
4. Variables de entorno: revisar `.env.example` y agregar las necesarias (la mayoría opcionales para modo demo).
5. Click "Deploy". Esperar 1-2 minutos.
6. Verificar URL generada (ej: `selectia.vercel.app` o `selectia-redentor159.vercel.app`).
7. Probar el deploy: abrir la URL, navegar por 5 vistas, hacer 2 recomendaciones.

**Checklist post-deploy**:
- [ ] Carga inicial < 3 segundos.
- [ ] Vista Resumen se ve completa.
- [ ] Vista Recomendador funciona (probar "cotización" y "IPERC").
- [ ] Dropdown de monedas muestra las 21.
- [ ] Vista Salud del Sistema muestra 13 fuentes.
- [ ] No hay errores en consola del navegador.

### 1.3 Tomar screenshots

Tomar screenshots en los 4 temas del proyecto para tener material gráfico para distintos contextos.

**Resolución recomendada**: 1920×1080 (16:9) para imágenes principales, 1080×1350 (4:5) para carruseles.

**Screenshots obligatorios** (carpeta `/screenshots/` ya existe en el repo):

| Archivo | Vista | Tema | Uso principal |
|---|---|---|---|
| `00-inicio.png` | Pantalla de inicio | Linear Claro | Post principal |
| `01-resumen.png` | Resumen | Linear Claro | Post principal alternativo |
| `02-recomendador-mype.png` | Recomendador MYPE | Linear Claro | Storytelling |
| `03-recomendador-calidad.png` | Recomendador calidad | Linear Oscuro | Técnica |
| `04-tabla-maestra.png` | Tabla maestra | Linear Claro | Data-driven |
| `05-comparador.png` | Comparador | Linear Claro | Corta directa |
| `06-analytics.png` | Analytics | Linear Oscuro | Data-driven |
| `07-simulador-roi.png` | Simulador ROI | Linear Claro | Educativa |
| `08-calculadora.png` | Calculadora | Linear Claro | Educativa |
| `09-hardware-ia.png` | Hardware IA | Linear Oscuro | Técnica |
| `10-salud-sistema.png` | Salud del sistema | Linear Claro | Data-driven |
| `11-guia-decision.png` | Guía de decisión | Linear Claro | Educativa |
| `12-glosario.png` | Glosario | Linear Claro | Educativa |
| `13-motor-explicado.png` | Motor explicado | Linear Oscuro | Técnica |
| `14-ficha-tecnica.png` | Ficha técnica | Linear Claro | Técnica |
| `15-recomendador-resultado.png` | Resultado de recomendación | Linear Claro | Storytelling |
| `16-animacion-step41.png` | Animación motor | Linear Oscuro | Técnica |
| `17-modo-traza.png` | Modo traza | Linear Oscuro | Técnica |
| `18-dropdown-monedas.png` | Dropdown 21 monedas | Linear Claro | LatAm |
| `15-dropdown-monedas-21.png` | Dropdown 21 monedas (variante) | Linear Claro | LatAm |

**Screenshots adicionales recomendados**:
- Tema "Blanco Puro" sobre la vista Resumen (1 screenshot).
- Tema "Negro Puro" sobre la vista Recomendador (1 screenshot).
- Modo mobile (375px) sobre la vista Resumen (1 screenshot).

**Reglas para screenshots**:
- Sin información sensible visible (API keys, contraseñas).
- Con datos reales cargados (no usar la vista vacía).
- Navegador en modo incógnito (sin extensiones visibles).
- Cursor fuera del frame.

### 1.4 Verificar que todos los links funcionen

Antes de publicar, abrir cada URL que vayas a mencionar:
- [ ] `github.com/redentor159/selectia` — responde 200.
- [ ] URL de Vercel (`selectia.vercel.app` o la que tocó) — carga completa.
- [ ] URL del estudio de Workday: https://investor.workday.com/news-and-events/press-releases/news-details/2026/New-Workday-Research-Companies-Are-Leaving-AI-Gains-on-the-Table/default.aspx
- [ ] Cada enlace interno del README del repo.

### 1.5 Grabar video demo (opcional pero recomendado, 30-60 s)

LinkedIn premia el video nativo. Un video corto de 30-60 segundos puede duplicar el alcance del post.

**Guion sugerido**:
- (0-5s) "Esto es SelectIA, un Command Center de modelos de IA para MYPEs LatAm."
- (5-15s) Mostrar vista Resumen. "Compara 206 modelos desde 13 fuentes en vivo."
- (15-30s) Cambiar a vista Recomendador. Escribir "cotización en soles peruanos para taller". Click en recomendar.
- (30-45s) Mostrar el resultado. "Latencia: 0.5 milisegundos. Con explicabilidad en español."
- (45-60s) Cambiar tema (Linear Claro → Linear Oscuro). "Open source MIT. Repo en la descripción."

**Recomendaciones técnicas**:
- Grabar con OBS o Loom en 1080p.
- Sin audio ambiental, solo voz en off (más limpia).
- Subtítulos embebidos (LinkedIn reproduce mute por defecto).

---

## Sección 2 — Mejor momento para publicar

### 2.1 Mejores días

| Día | Rating | Por qué |
|---|---|---|
| Lunes | ⚠️ Medio | La gente está procesando la semana. Bajo engagement matinal. |
| **Martes** | ✅ Óptimo | Mejor día para B2B. Audiencia ya enfocada. |
| **Miércoles** | ✅ Óptimo | Segundo mejor día. Punto medio de la semana. |
| **Jueves** | ✅ Óptimo | Tercer mejor día. Bueno para contenido técnico. |
| Viernes | ⚠️ Medio | Buena mañana, malo después del mediodía (desconexión mental). |
| Sábado | ❌ Evitar | Peor día para B2B. |
| Domingo | ⚠️ Solo si es reflexivo | Funciona para posts filosóficos/largos por la noche. |

### 2.2 Mejor hora (hora Lima, UTC-5)

| Bloque | Rating | Por qué |
|---|---|---|
| 7:00-8:30 | ⚠️ Medio | Pocos activos aún. |
| **9:00-10:00** | ✅ Óptimo | Pico de actividad B2B LatAm. |
| 11:00-12:00 | ✅ Bueno | Pre-almuerzo, lectura rápida. |
| 13:00-14:00 | ⚠️ Medio | Horario de almuerzo variable por país. |
| 15:00-16:00 | ✅ Bueno | Pico vespertino. |
| 18:00-19:00 | ✅ Bueno para móvil | Cierre de jornada, scroll mobile. |

### 2.3 Por qué esos horarios

- **9-10 AM Lima**: coincide con 10-11 AM Bogotá, 11-12 AM Caracas/ Santiago, 11-12 AM São Paulo / Buenos Aires. Es la franja común de mayor actividad B2B en LatAm.
- **Martes a jueves**: lunes se procesa la semana, viernes se desconecta. Martes-jueves son los días de máxima concentración.

### 2.4 Tabla de mejores momentos por país LatAm (referencia)

| País | Hora local óptima | Equivalente en Lima |
|---|---|---|
| Perú 🇵🇪 | 9:00-10:00 | 9:00-10:00 |
| Colombia 🇨🇴 | 9:00-10:00 | 9:00-10:00 |
| México 🇲🇽 | 8:00-9:00 | 9:00-10:00 |
| Chile 🇨🇱 | 10:00-11:00 | 9:00-10:00 |
| Argentina 🇦🇷 | 11:00-12:00 | 9:00-10:00 |
| Brasil 🇧🇷 | 11:00-12:00 | 9:00-10:00 |
| Ecuador 🇪🇨 | 9:00-10:00 | 9:00-10:00 |
| Bolivia 🇧🇴 | 10:00-11:00 | 9:00-10:00 |

**Conclusión**: publicar a las 9:00 AM hora Lima te captura el pico matinal en toda la región.

---

## Sección 3 — Cómo estructurar el post

### 3.1 Hook (primeras 2 líneas)

Las primeras 2 líneas son lo único que se ve antes del botón "ver más". Deben generar detención de scroll.

**Tipos de hook que funcionan para SelectIA**:

1. **Estadística con fuente** (recomendado):
   > "Un estudio de Workday (enero 2026, 3,200 líderes) encontró que 85% de empleados ahorra 1-7 h/semana con IA... pero casi el 40% se pierde en retrabajo."

2. **Pregunta incómoda**:
   > "¿Cómo decide una MYPE en Lima qué modelo de IA usar para redactar un IPERC?"

3. **Afirmación contraintuitiva**:
   > "El futuro de la Ingeniería Industrial no es 'usar IA'. Es saber qué IA usar para cada tarea."

4. **Número contundente**:
   > "206 modelos de IA comparados desde 13 fuentes en vivo. Recomendación en 0.5 ms."

### 3.2 Cuerpo

Después del hook, estructura en 4-6 párrafos cortos (2-4 líneas cada uno). LinkedIn premia el espacio en blanco.

**Estructura recomendada**:
1. **Contexto / por qué importó el hook** (1 párrafo).
2. **Qué construiste** (1 párrafo).
3. **Cómo lo construiste** (1-2 párrafos).
4. **Métricas verificables** (lista con bullets).
5. **Reflexión final** (1 párrafo).

### 3.3 Métricas

Lista de bullets al final del cuerpo, antes del CTA. Solo números verificables:

```
Métricas verificables:
▪️ 206 modelos comparados desde 13 fuentes en vivo
▪️ 31,116 líneas de TypeScript en 111 archivos
▪️ JSON maestro de 376 KB, cron diario 2 AM Lima
▪️ Latencia < 10 ms por recomendación (avg 0.5 ms, max 3 ms)
▪️ 21 monedas de América · 4 temas visuales
▪️ Glosario: 176 términos, 15 deepDives, 8 categorías
▪️ v3.3.1 · MIT · deploy gratis en Vercel
```

### 3.4 CTA (call to action)

Cierra con una pregunta abierta. LinkedIn premia los posts que generan comentarios (más que likes).

**CTAs efectivos**:
- "¿Cómo están eligiendo modelos de IA en su equipo hoy? Los leo 👇"
- "¿Qué tarea automatizarían primero en su MYPE? Los leo 👇"
- "¿Creen que la decisión de modelo de IA será función de Ingeniería Industrial en 5 años? Los leo 👇"

### 3.5 Hashtags

- **Cantidad**: 8-10 hashtags. Más de 12 se ve spam; menos de 5 pierde alcance.
- **Posición**: al final del post, después del CTA.
- **Mezcla**: 3 amplios + 4 nicho + 3 locales.

**Hashtags base recomendados**:
`#IngenieriaIndustrial` `#IA` `#ProductManagement` `#MultiModelo` `#TOPSIS` `#IntegracionAPIs` `#OpenSource` `#LatAm` `#MYPE` `#Perú`

---

## Sección 4 — Multimedia que adjuntar

### 4.1 Imagen principal (obligatoria)

Posts con imagen tienen ~2× más alcance que posts solo texto.

**Recomendación para post principal**: screenshot de la vista Resumen en tema Linear Claro. Es la imagen más limpia y representativa.

**Alternativas por ángulo**:
- Storytelling → `01-resumen.png` o `15-recomendador-resultado.png`.
- Técnica → `13-motor-explicado.png` o `17-modo-traza.png`.
- Educativa → `12-guia-decision.png`.
- Corta directa → `05-comparador.png`.
- Data-driven → `06-analytics.png` o `10-salud-sistema.png`.
- Reflexiva → foto del autor o `04-tabla-maestra.png` en tema Negro Puro.

### 4.2 Screenshots adicionales (opcional)

LinkedIn permite hasta 4 imágenes en grid. Si usas 4, el alcance aumenta ~30%.

**Combinación recomendada**:
1. Vista Resumen (overview).
2. Vista Recomendador con resultado.
3. Vista Motor Explicado (rigor técnico).
4. Dropdown de 21 monedas (valor LatAm).

### 4.3 Video demo (opcional, recomendado)

Video de 30-60 segundos con navegación por el dashboard. Ver guion en sección 1.5.

### 4.4 Carousel PDF (opcional, alto alcance)

LinkedIn permite subir PDFs como carrusel nativo (cada página = slide). Esto tiene el mayor alcance orgánico de todos los formatos.

**Recomendación**: convertir el Carrusel 1 de Instagram ("¿Cuál es el mejor modelo de IA para tu MYPE?") en PDF de 10 páginas y subirlo a LinkedIn en vez de imagen.

**Cómo generarlo**:
1. Abrir Figma o Canva.
2. Crear 10 slides con la especificación del carrusel (en `INSTAGRAM_CARRUSELES.md`).
3. Exportar como PDF.
4. Subir el PDF a LinkedIn (se ve como carrusel nativo).

---

## Sección 5 — Después de publicar

### 5.1 Responder comentarios en la primera hora

La primera hora es crítica. El algoritmo de LinkedIn usa el ritmo de comentarios para decidir cuánta gente más verá el post.

**Regla**: responder cada comentario en menos de 60 minutos. Si no puedes estar en la app, programa recordatorios.

**Cómo responder**:
- Comentario genérico ("¡Buen post!") → responder con pregunta específica.
- Comentario técnico → responder con detalle real, no con frases hechas.
- Comentario crítico → agradecer la crítica, no defenderse.
- Comentario con pregunta → responder la pregunta + invitar a continuar la conversación en DM.

### 5.2 Etiquetar a personas relevantes

Después de publicar, en los comentarios, etiquetar (sin spam) a:
- Profesores de Ingeniería Industrial de la universidad.
- Mentores o seniors que hayan revisado el proyecto.
- Miembros de comunidades tech LatAm (si tienes relación previa).

**Regla de etiquetado**: solo etiquetar a personas con las que tengas relación. El etiquetado frío se ve desesperado.

### 5.3 Compartir en grupos

LinkedIn tiene grupos profesionales. Compartir el post en 2-3 grupos relevantes multiplica alcance.

**Grupos recomendados**:
- "Ingeniería Industrial Perú".
- "Inteligencia Artificial LatAm".
- "Product Management LatAm".
- "Open Source LATAM".

**Regla**: máximo 3 grupos. Más que eso se ve spam y te penalizan.

### 5.4 Repostear a las 24 h si tuvo engagement

Si a las 24 horas el post tiene > 50 reacciones y > 10 comentarios, repostearlo (en tu perfil, no en otros) con un comentario "Update: gracias por los X comentarios. Si lo perdiste, aquí de nuevo el post".

**No repostear si**:
- Tiene menos de 30 reacciones.
- La mayoría de comentarios son tuyos (respondiendo).
- Ya pasaron más de 48 horas (el momentum se perdió).

---

## Sección 6 — Métricas a observar

### 6.1 Qué métricas importan

| Métrica | Peso | Por qué |
|---|---|---|
| **Comentarios** | ⭐⭐⭐⭐⭐ | Es la métrica que más pesa en el algoritmo. Indica conversación real. |
| **Reacciones** (likes) | ⭐⭐⭐⭐ | Señal de calidad. Poco peso individual pero importante en volumen. |
| **Reposts / Shares** | ⭐⭐⭐⭐⭐ | Es la métrica de validación social. Indica que el contenido es útil. |
| **Guardados (saves)** | ⭐⭐⭐⭐ | Métrica oculta pero muy valorada por el algoritmo. Indica utilidad real. |
| **Impresiones** | ⭐⭐⭐ | Métrica de vanidad. Solo útil en relación con las demás. |
| **Clicks en enlace** | ⭐⭐⭐⭐ | Indica interés real en el proyecto. |
| **Profile views** | ⭐⭐⭐⭐ | Métrica clave para opportunities (recruiters, colaboraciones). |
| **Seguidores nuevos** | ⭐⭐⭐ | Conversión a largo plazo. |

### 6.2 Cuándo considerar un post exitoso

**Para un perfil de estudiante / junior (~500-2000 conexiones)**:

| Métrica | OK | Bueno | Excelente |
|---|---|---|---|
| Impresiones | 1,000 | 5,000 | 20,000+ |
| Reacciones | 30 | 100 | 500+ |
| Comentarios | 5 | 20 | 80+ |
| Reposts | 1 | 5 | 20+ |
| Clicks al repo | 10 | 50 | 200+ |
| Profile views (24h) | 10 | 50 | 200+ |
| Seguidores nuevos (24h) | 2 | 10 | 50+ |

### 6.3 Cuándo repostear o iterar

- **Repostear** si a las 24h está en "Bueno" o mejor. Mismo post, nuevo comentario introductorio.
- **Iterar** si está en "OK": identificar qué falló (hook, multimedia, hora) y publicar una variante mejorada en 7 días.
- **No tocar** si está por debajo de "OK": probablemente no era el día ni el tema. Guardar la idea para más adelante.

---

## Sección 7 — Errores comunes a evitar

### 10 errores típicos

1. **Afirmar métricas no verificables**. ❌ "Tengo 500 usuarios" o "ahorro 95% de tiempo". Solo afirmar lo que se puede comprobar con `curl`, `wc -l` o `ls -lh`.

2. **Hook genérico**. ❌ "Hoy quiero compartirles un proyecto en el que vengo trabajando…". Aburrido. Las primeras 2 líneas son la oportunidad más valiosa del post.

3. **Post demasiado largo sin espaciado**. ❌ Bloques de 10 líneas. LinkedIn premia el espacio en blanco. Párrafos de 2-4 líneas.

4. **Hashtags irrelevantes o excesivos**. ❌ `#AI #IA #MachineLearning #ML #Tech #Innovation #Future`. Spam. Máximo 10 hashtags, todos relevantes.

5. **No responder comentarios**. ❌ Publicar y desaparecer. La primera hora define el alcance del post.

6. **Etiquetar a personas que no conoces**. ❌ Etiquetar a CEOs o influencers sin relación previa. LinkedIn penaliza el spam de etiquetas.

7. **Publicar el viernes por la tarde**. ❌ La gente ya desconectó. El post muere.

8. **Multimedia aburrida**. ❌ Subir un screenshot sin contexto o con datos sensibles visibles. Limpiar el screenshot antes de subirlo.

9. **No usar el hook de Workday**. ❌ Inventar una estadística ("9 de cada 10 empresas pierden tiempo con IA") cuando hay una real y verificable disponible.

10. **Olvidar el CTA**. ❌ Terminar el post con "Saludos" o "Gracias". Siempre cerrar con pregunta abierta.

### Errores técnicos específicos de SelectIA

- ❌ Afirmar "orquesté con framework" — fue manual.
- ❌ Afirmar "95% de ahorro" — no hay data para probarlo.
- ❌ Afirmar "producción en planta real" — es PoC.
- ❌ Afirmar "usuarios activos" — no hay aún.
- ❌ Mencionar las IAs como "empleados" o "mi equipo de IAs" — son asistentes de investigación.

---

## Sección 8 — Plantillas de comentario de respuesta

### Plantilla 1 — Respuesta a comentario genérico positivo

> "¡Gracias, [Nombre]! Una pregunta para seguir la conversación: ¿en tu equipo ya tienen un proceso para elegir modelo de IA, o prueban al azar?"

### Plantilla 2 — Respuesta a comentario técnico

> "Buen punto, [Nombre]. Justo ahí fue donde más tiempo perdí. Lo resolví con [explicación técnica corta, 2-3 líneas]. ¿Tú has enfrentado algo parecido en [contexto del comentario]?"

### Plantilla 3 — Respuesta a comentario crítico

> "Aprecio la crítica, [Nombre]. Tienes razón en que [reconocer el punto válido]. Sobre [el punto que no comparto], mi experiencia fue distinta porque [razón concreta, sin defensa]. ¿Qué cambiarías tú si estuvieras construyendo algo así?"

### Plantilla 4 — Respuesta a pregunta sobre deploy

> "¡Gracias por preguntar, [Nombre]! Deploy en Vercel es gratis y toma 5 minutos: 1) Fork del repo github.com/redentor159/selectia, 2) Importar en vercel.com/new, 3) Deploy. Si te trabas en algún paso, escríbeme por DM y te ayudo."

### Plantilla 5 — Respuesta a pregunta sobre el motor HRE-TOPSIS

> "Excelente pregunta, [Nombre]. HRE-TOPSIS combina: 1) TF-IDF + Porter stemmer español para entender la consulta, 2) filtros duros (contexto, modalidad, precio), 3) piso de calidad (reliability ≥ 0.7), 4) AHP con CR=0 para ponderar 8 criterios, 5) TOPSIS con distancia euclidiana. Latencia avg 0.5 ms. ¿Quieres que te envíe por DM la documentación técnica completa?"

---

## Sección 9 — Plan de publicación 30 días

### Semana 1 — Lanzamiento

| Día | Acción | Contenido |
|---|---|---|
| Lunes | Preparación | Subir repo, deploy Vercel, screenshots, verificar links. |
| Martes 9 AM | **Post principal** | Variante 1 (storytelling) o Variante 5 (data-driven) del archivo `LINKEDIN_POST_VARIANTES.md`. Multimedia: screenshot Resumen + 3 adicionales. |
| Martes 10 AM | Respuesta | Responder cada comentario en < 60 min. |
| Miércoles | Mantenimiento | Responder comentarios. Compartir en 2 grupos. |
| Jueves 9 AM | Hilo | Hilo 1 (cómo elegí las 13 fuentes) del archivo `LINKEDIN_HILOS.md`. |
| Viernes | Observación | No publicar. Revisar métricas del martes. |

### Semana 2 — Profundización técnica

| Día | Acción | Contenido |
|---|---|---|
| Lunes | Preparación | Preparar Hilo 2 (motor HRE-TOPSIS). Verificar screenshots del modo traza. |
| Martes 9 AM | Hilo | Hilo 2 (motor HRE-TOPSIS en 7 pasos). |
| Jueves 9 AM | Post | Variante 2 (técnica para ingenieros). Multimedia: Motor Explicado. |
| Viernes | Repost | Si el post del martes tuvo > 50 reacciones, repostearlo. |

### Semana 3 — Errores y aprendizajes

| Día | Acción | Contenido |
|---|---|---|
| Lunes | Preparación | Preparar Hilo 3 (5 errores). |
| Martes 9 AM | Hilo | Hilo 3 (5 errores que cometí y cómo los resolví). |
| Miércoles 7 PM | Post | Variante 6 (reflexiva filosófica). Ángulo LatAm. |
| Jueves 9 AM | Post | Variante 4 (corta y directa). Multimedia: Comparador. |

### Semana 4 — Open source y reflexión

| Día | Acción | Contenido |
|---|---|---|
| Lunes | Preparación | Preparar Hilo 4 (open source para LatAm). |
| Martes 9 AM | Hilo | Hilo 4 (por qué open source para LatAm). |
| Miércoles 9 AM | Post | Variante 3 (educativa / tutorial). |
| Jueves 9 AM | Hilo | Hilo 5 (crónica con 4 IAs). Ángulo personal. |
| Viernes | Análisis | Revisar métricas del mes. Iterar para mes 2. |

### Calendario visual (resumen)

```
Semana 1: Post principal + Hilo fuentes
Semana 2: Hilo motor + Post técnico
Semana 3: Hilo errores + Post reflexivo + Post corto
Semana 4: Hilo open source + Post educativo + Hilo crónica
```

### Reglas del calendario
- **No publicar más de 3 veces por semana**. Más que eso cansa a la audiencia.
- **Variar el formato**: intercalar posts largos, hilos y posts cortos.
- **No repetir el mismo ángulo** dos semanas seguidas.
- **Medir cada viernes**: ¿qué post tuvo mejor performance? Ese ángulo es el que más resuena. Iterar sobre él en el próximo mes.

---

## Cierre — Mensaje motivacional

José, si estás leyendo esto: el proyecto que construiste es serio. 206 modelos, 13 fuentes en vivo, motor HRE-TOPSIS con CR=0, latencia de 0.5 ms, 31,116 líneas de TypeScript. Eso no es un proyecto de estudiante promedio. Es infraestructura técnica real.

La publicación en LinkedIn no es el final del proyecto. Es el principio del siguiente: el de construir audiencia, abrir conversaciones y convertir SelectIA en una referencia regional sobre cómo decidir modelo de IA en MYPEs.

Publica con orgullo. Acepta las críticas. Itera. Y recuerda: el 40% de retrabajo que Workday detectó no es destino. Es la variable que tu proyecto ayuda a controlar. Esa es la historia que vale la pena contar.

Suerte con el lanzamiento. El repo está en `github.com/redentor159/selectia`. El futuro es open source.

— Documento generado para acompañar el lanzamiento de SelectIA v3.3.1.

---

## Anexo A — Métricas verificables (tarjeta de referencia rápida)

Lleva esta tarjeta a mano cuando escribas o respondas comentarios. Solo estos números son verificables:

```
▪️ 206 modelos de IA comparados
▪️ 13 fuentes de datos en vivo
▪️ 31,116 líneas de TypeScript
▪️ 111 archivos
▪️ JSON maestro de 376 KB
▪️ Latencia < 10 ms (avg 0.5 ms, max 3 ms)
▪️ AHP Consistency Ratio = 0
▪️ 8 criterios: precio, II, coding, agentic, speed, context, elo, reliability
▪️ 21 monedas de América (PEN, USD, BRL, MXN, COP, CLP, ARS, CAD + 13)
▪️ 4 temas visuales (Linear Claro, Linear Oscuro, Blanco Puro, Negro Puro)
▪️ Glosario: 176 términos, 15 deepDives, 8 categorías
▪️ Cron diario 2 AM Lima
▪️ v3.3.1 · MIT · Vercel gratis
▪️ Repo: github.com/redentor159/selectia

Hook estadístico (real, verificable):
Workday Research, enero 2026, 3,200 líderes de negocio.
"85% save 1-7 hrs/week, ~40% lost to rework."
URL: https://investor.workday.com/news-and-events/press-releases/news-details/2026/New-Workday-Research-Companies-Are-Leaving-AI-Gains-on-the-Table/default.aspx
Workday es pública (NASDAQ: WDAY).

Proceso honesto:
4 IAs como asistentes de investigación (GLM-5.2, Minimax M3, Gemini 3.1 Pro, Claude Sonnet 4.6).
Contexto pasado manualmente entre sesiones.
SIN framework de orquestación.

Casos de uso reales en el dashboard:
IPERC (matriz de riesgo), G-code CNC, manual técnico 300 páginas, cotización, traducción técnica.
```

## Anexo B — Lo que NUNCA debes afirmar

```
❌ "Orquesté IAs con un framework" — fue manual
❌ "95% de ahorro" / "ahorro de X%" — no hay data para probarlo
❌ "Producción en planta real" — es PoC
❌ "Usuarios activos" — no hay aún
❌ "Equipo de IAs" — son asistentes de investigación
❌ Cualquier métrica no listada en el Anexo A
```
