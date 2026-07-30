# Prompt: Auditoría Exhaustiva y Extirpación de Fuentes de Datos

**Contexto para la IA:**
Eres un Arquitecto de Software Senior y experto en Integración de Datos. Estás auditando el motor principal de un dashboard de IA (`SelectIA`) que supuestamente ingesta datos de múltiples fuentes en paralelo.

**Objetivo de la Tarea:**
Tu misión es identificar y proponer la ELIMINACIÓN TOTAL de cualquier fuente de datos que no se esté usando de forma real en la interfaz. Debes presentar un informe de diagnóstico y esperar autorización expresa antes de alterar el código.

**Instrucciones Obligatorias (Strict Rules):**

0. **SEGURIDAD EXTREMA Y COMMIT INICIAL:** Antes de modificar cualquier archivo, DEBES ejecutar un `git commit` (o un backup temporal seguro si git no está disponible) para guardar el estado actual. Debes tomar ABSOLUTAMENTE TODAS las medidas de seguridad defensivas necesarias (respaldar archivos críticos, chequeo riguroso de tipos) para asegurar que es imposible que el código se rompa.
1. **LECTURA OBLIGATORIA:** Usa tus herramientas para leer TODO `src/lib/orchestrator.ts` y `src/lib/types.ts`. NO asumas nada.
2. **RASTREO DE USO REAL (Dead Code Analysis):** Verifica, campo por campo, si los datos que extrae cada fuente (ej. `pass@2` de Aider, URLs de Ollama, estados de proveedores) se mapean a las propiedades del objeto `AIModel` y si realmente impactan la lógica de negocio. Si una fuente solo se usa para rellenar el array de `SourceHealth` para impresionar visualmente en un panel, declárala como "CÓDIGO FANTASMA / VANITY METRIC".
3. **INFORME Y PAUSA (STOP RULE):** 
   - Genera un informe despiadado donde listes: 
     a) Las fuentes que SÍ se usan realmente (JSON APIs sólidas).
     b) Las fuentes que NO se usan (humo, código fantasma).
     c) Las fuentes frágiles (scraping HTML con regex).
   - **DETENTE AQUÍ. NO EJECUTES NINGÚN CAMBIO.** Debes esperar a que yo (el usuario) lea el informe y te dé la autorización explícita para proceder a borrar las fuentes inútiles.
4. **MICRO TDD OBLIGATORIO (Al ser autorizado):** Una vez que te autorice a eliminar código, estás OBLIGADO a usar Micro TDD. 
   - Antes de modificar `orchestrator.ts`, crea un micro script de test en Node (`node:test` + `node:assert`) que valide que el parseo de las fuentes sobrevivientes sigue funcionando. 
   - Ejecuta tu test. Si pasa, procede a eliminar las fuentes innecesarias y refactoriza el `Promise.allSettled` para ahorrar ancho de banda y latencia.

**Entregable Inmediato:**
Inicia leyendo los archivos mencionados, realiza el análisis forense, entrega el informe de diagnóstico y **QUÉDATE A LA ESPERA DE MI AUTORIZACIÓN.**
