# Archive Report — graficos-expandibles

- **Fecha de archive**: 2026-08-02
- **Estado de verificación**: PASS WITH WARNINGS — 8/8 requisitos, 14/14 escenarios, 0 CRITICAL, 1 WARNING aceptado (sin runner de tests; config.yaml `tdd: false`, `test_command: ""`).
- **Modo de persistencia**: hybrid (openspec + Engram).
- **Archivado en**: `openspec/changes/archive/2026-08-02-graficos-expandibles/`

## Sincronización de specs (delta → source of truth)

- La spec delta de `openspec/changes/graficos-expandibles/spec.md` se copió como **spec principal nueva** en `openspec/specs/graficos-expandibles/spec.md` (no existía spec previa en `openspec/specs/`; la delta es una spec completa, no un delta parcial).
- **Contenido fusionado**: 7 requirements ADDED (14 escenarios en total) — ver sección `## Requirements` de la spec principal.
- **Regla de config.yaml (`archive: Avisar antes de fusionar deltas destructivos`)**: no aplica — el delta es 100% ADDED; no hay requirements MODIFIED, REMOVED ni RENAMED. No se elimina ni reemplaza ningún contenido existente. Sin riesgo destructivo.
- **Formato del delta en este proyecto**: el proyecto define la delta como `spec.md` plano en la raíz del change folder (con `## Capability` y `## ADDED Requirements`), en lugar de `specs/{domain}/spec.md`. La spec principal se generó con la misma estructura (`## Capability` + `## Requirements`).

## Reconciliación de checkboxes (reparación excepcional autorizada)

- Las tareas 5.1, 5.2 y 5.3 (Fase 5: Verificación final) quedaron sin marcar en `tasks.md` tras apply, pero fueron **ejecutadas y completadas por sdd-verify** con evidencia en el verify-report:
  - 5.1 `npx tsc --noEmit` → EXIT 0 (11.1 s, salida vacía).
  - 5.2 `npm run build` → EXIT 0 (60.9–63.0 s, "Compiled successfully").
  - 5.3 Matriz de 14/14 escenarios cubiertos con evidencia estática (archivo:línea).
- **Razón registrada**: el orquestador confirmó el ciclo completo (apply WU1+WU2+WU3 → verify PASS WITH WARNINGS, 0 CRITICAL) e instruyó ejecutar el archive. Según el skill sdd-archive, la reconciliación excepcional de checkboxes obsoletos procede cuando apply-progress/verify-report prueban la completitud; ambas fuentes lo prueban (verify-report #173, apply-progress #172).
- Las tareas 0.1–4.2b (22) ya estaban `[x]` por apply. Total: 25/25 completadas en el tasks.md archivado.

## Verificación del archive

- [x] Spec principal actualizada: `openspec/specs/graficos-expandibles/spec.md` (7 requirements, 14 escenarios).
- [x] Change folder movido a `openspec/changes/archive/2026-08-02-graficos-expandibles/`.
- [x] El archive contiene todos los artefactos: proposal.md, spec.md, design.md, tasks.md.
- [x] El tasks.md archivado no tiene checkboxes sin marcar (25/25).
- [x] `openspec/changes/` ya no contiene el cambio activo.
- [x] No se borró ningún archivo del directorio de cambio.

## Trazabilidad en Engram (proyecto selectia-app)

| Artefacto | Observation ID |
|-----------|----------------|
| proposal | #167 |
| spec (delta) | #168 |
| design | #169 |
| tasks (actualizado: 25/25) | #170 |
| estado del plan (orquestador) | #171 |
| apply-progress | #172 |
| verify-report | #173 |
| archive-report (este) | topic `sdd/graficos-expandibles/archive-report` |

## Hallazgos heredados del verify-report (no bloqueantes)

- **WARNING**: comportamiento interactivo del Brush (drag/pan), ficha anidada y escala log validados por inspección estática + type-check + build, no por tests en runtime (aceptado por config).
- **SUGGESTION 1**: posible ciclo de import circular `chart-expand-dialog.tsx` ↔ `analytics-view.tsx` (ScatterProviderLegend); tolerado por Turbopack/tsc; considerar mover la leyenda a un módulo compartido.
- **SUGGESTION 2**: `data-chart-id` está en un div wrapper (Recharts 2.15.4 no esparce props extra al ResponsiveContainer); difiere de la literalidad del design.
- **SUGGESTION 3**: doble leyenda visual en el modal del timeline (Legend de Recharts + ScatterProviderLegend); menor.

## Cierre

El ciclo SDD del cambio `graficos-expandibles` está completo: proposal → spec → design → tasks → apply (WU1+WU2+WU3) → verify (PASS WITH WARNINGS) → archive. Listo para el siguiente cambio.
