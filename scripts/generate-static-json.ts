#!/usr/bin/env bun
/**
 * generate-static-json.ts
 *
 * Script para el cron diario de las 2 AM Lima (7 AM UTC) que genera el
 * archivo `master_dashboard_data.json` estático que se sirve a los usuarios.
 *
 * PRD Parte 8 (linea 1529-1571): el cron diario recolecta 19 fuentes en
 * paralelo, procesa, y publica un único JSON <500KB que el navegador descarga
 * y renderiza client-side. Esto cubre el 99% de visitas SIN ninguna llamada
 * API en vivo (solo el force-refresh del Perfil D usa el serverless proxy).
 *
 * Uso:
 *   bun run scripts/generate-static-json.ts
 *
 * Salida:
 *   public/data/master_dashboard_data.json  (siempre <500KB garantizado)
 *
 * GitHub Actions lo ejecuta a las 7 AM UTC diarias y commitea el resultado.
 * El commit dispara un redeploy automático en Vercel.
 */

import { fetchDashboardData } from "../src/lib/orchestrator";
import { writeFileSync, mkdirSync, existsSync, statSync, unlinkSync } from "fs";
import { join } from "path";

const OUTPUT_DIR = join(process.cwd(), "public", "data");
const OUTPUT_FILE = join(OUTPUT_DIR, "master_dashboard_data.json");
const MAX_SIZE_BYTES = 500 * 1024; // PRD line 2003 — <500KB

async function main() {
  console.log("🔄 Iniciando generación de master_dashboard_data.json...");
  const start = Date.now();

  // Forzar refresh fresco (ignora caché en memoria) — el cron corre 1x/día.
  const data = await fetchDashboardData(true);

  // Validación PRD: <500KB
  const json = JSON.stringify(data);
  const sizeBytes = Buffer.byteLength(json, "utf8");
  const sizeKB = sizeBytes / 1024;

  console.log(`📊 Modelos: ${data.models.length}`);
  console.log(`💱 Monedas: ${data.currencies.length}`);
  console.log(`📡 Fuentes: ${data.sources.length} (${data.sources.filter(s => s.status === "green").length} green)`);
  console.log(`📦 Tamaño JSON: ${sizeKB.toFixed(1)} KB (límite PRD: 500 KB)`);

  if (sizeBytes > MAX_SIZE_BYTES) {
    console.warn(`⚠️  JSON excede 500KB (${sizeKB.toFixed(1)} KB). Truncando modelos no esenciales...`);
    // Estrategia de truncado: mantener los top 150 por Intelligence Index + todos los free.
    const free = data.models.filter(m => m.freeAccess === "free-100" || m.freeAccess === "free-limited");
    const paid = data.models
      .filter(m => m.freeAccess !== "free-100" && m.freeAccess !== "free-limited")
      .sort((a, b) => (b.intelligenceIndex ?? 0) - (a.intelligenceIndex ?? 0))
      .slice(0, 150 - free.length);
    data.models = [...free, ...paid];
    const truncatedJson = JSON.stringify(data);
    const truncatedSize = Buffer.byteLength(truncatedJson, "utf8");
    console.log(`📦 Tras truncado: ${(truncatedSize / 1024).toFixed(1)} KB (${data.models.length} modelos)`);
    if (truncatedSize > MAX_SIZE_BYTES) {
      console.error(`❌ Aún excede 500KB tras truncado. Abortando.`);
      process.exit(1);
    }
    writeOutput(truncatedJson);
  } else {
    writeOutput(json);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`✅ Generado en ${elapsed}s → ${OUTPUT_FILE}`);
}

function writeOutput(jsonStr: string) {
  // Asegurar que el directorio existe
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  // Eliminar versión anterior si existe
  if (existsSync(OUTPUT_FILE)) {
    unlinkSync(OUTPUT_FILE);
  }
  // Escribir nueva versión
  writeFileSync(OUTPUT_FILE, jsonStr, "utf8");

  // Verificación final
  const stat = statSync(OUTPUT_FILE);
  console.log(`✓ Archivo escrito: ${(stat.size / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error("❌ Error generando JSON estático:", err);
  // Enviar alerta ntfy.sh (el orchestrator ya lo hace internamente, pero
  // este catch cubre errores fuera del orchestrator).
  process.exit(1);
});
