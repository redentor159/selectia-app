---
target: Filtros Tabla Maestra
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-07-31T00-05-59Z
slug: src-components-dashboard-views-tabla-view-tsx
---
#### Design Health Score
| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good; filter states are clear, badges show counts. |
| 2 | Match System / Real World | 2 | High jargon load: TTFT, Elo Ci, Blended, MoE. |
| 3 | User Control and Freedom | 4 | Clear reset buttons and explicit toggles. |
| 4 | Consistency and Standards | 3 | Some custom widgets mixed with standard ones, font size drift. |
| 5 | Error Prevention | 3 | Sliders constrain values, logic toggle prevents impossible states. |
| 6 | Recognition Rather Than Recall | 4 | Everything is visible (perhaps too much). |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts for search or panel toggle. |
| 8 | Aesthetic and Minimalist Design | 0 | Overwhelming. No progressive disclosure, completely cluttered. |
| 9 | Error Recovery | 4 | Graceful empty states and easy resets. |
| 10 | Help and Documentation | 2 | Missing tooltips on dense advanced sliders. |
| **Total** | | **27/40** | **Acceptable** |

#### Design Specificity Verdict
**LLM assessment**: The filter panel sacrifices user experience for feature completeness. It feels like an engineering debug panel rather than a user-centric filter system. The design completely lacks progressive disclosure, resulting in a dense grid of sliders and an overwhelming wall of provider pills.

**Deterministic scan**: The CLI found several hardcoded colors outside `DESIGN.md` (e.g., `#00d66f`, `#f5a623`) and over 12 instances of text sizes off the documented type ramp (using literal `10px`, `9px`, `11px`). The UI relies heavily on undocumented tokens to achieve its extreme density.

#### Overall Impression
A highly functional but deeply overwhelming filter interface that trades usability for exposing every possible database column at once. The biggest opportunity is introducing progressive disclosure to hide power-user filters.

#### What's Working
1. **Live reactivity**: The deferred search and live table updates feel incredibly powerful and fast.
2. **Clear state**: The top badge and active tags give immediate feedback on the impact of the filters.

#### Priority Issues
- **[P0] Cognitive Overload (The Wall of Options)**
  - **Why it matters**: Users are confronted with 9 sliders, 2 dropdowns, 1 date picker, 10 capability pills, and 27 provider pills instantly. It violates working memory limits (Miller's Law) and causes choice paralysis.
  - **Fix**: Implement progressive disclosure. Keep Search, 2-3 primary filters (Price, Intelligence) visible by default. Move the rest behind an "Advanced Filters" accordion or modal.
  - **Suggested command**: `$impeccable distill`

- **[P1] Thumb-Hostile Click Targets (Provider Pills)**
  - **Why it matters**: 27 tiny provider pills are unscannable and hard to tap on mobile, taking up massive vertical space.
  - **Fix**: Replace the massive pill cloud with a searchable multi-select combobox.
  - **Suggested command**: `$impeccable adapt`

- **[P1] Jargon Barrier**
  - **Why it matters**: Terms like "TTFT", "Elo CI", and "MoE" lack inline tooltips inside the filter panel itself.
  - **Fix**: Add small `(?)` tooltip icons next to advanced sliders to explain what they control.
  - **Suggested command**: `$impeccable clarify`

- **[P2] Design System Drift**
  - **Why it matters**: The detector found 12+ instances of literal `text-[10px]` and undocumented hex colors.
  - **Fix**: Map these micro-text classes to a defined `text-xxs` token and use semantic variables for colors.
  - **Suggested command**: `$impeccable harden`

#### Persona Red Flags
**Jordan (First-Timer)**: Will experience immediate choice paralysis upon opening the filter panel. Will not understand what "Confianza Elo máx" or "BenchLM Score" means. Likely to abandon advanced filtering altogether.

**Casey (Distracted Mobile User)**: The dense 4-column grid of sliders will turn into a massive vertical scroll of tiny touch targets on a phone screen. Adjusting a small slider precisely to "30" with a thumb will be extremely frustrating.

**Alex (Power User)**: Will be annoyed that they have to click the search bar with the mouse instead of pressing `/` or `Cmd+K` to jump straight into typing.

#### Minor Observations
- The "Ocultar modelos obsoletos" checkbox is misaligned vertically with the other dropdowns in the advanced row.
- The "Lógica: Todas (AND) / Cualquiera (OR)" is a nice power feature, but it's visually tiny.

#### Questions to Consider
- Do 80% of users ever touch the "Confianza Elo máx" or "BenchLM Score" sliders, or are they strictly for 5% of users?
- Could the capabilities checkboxes be grouped into "Modality" (Vision, Audio) vs "Reasoning"?
