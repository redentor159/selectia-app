---
target: src/components/dashboard/views/tabla-view.tsx
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-01T16-03-14Z
slug: src-components-dashboard-views-tabla-view-tsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Filter updates are debounced, but loading state during filtering is subtle. |
| 2 | Match System / Real World | 3 | Good domain language, but terms like "TTFT", "Elo CI" require high context. |
| 3 | User Control and Freedom | 3 | Good filter reset, but the 20-column table is hard to navigate horizontally. |
| 4 | Consistency and Standards | 4 | Consistent use of badges, colors, and typography. |
| 5 | Error Prevention | 3 | Sliders prevent invalid input, but hardware filter relies on rough estimates. |
| 6 | Recognition Rather Than Recall | 3 | Icons used for capabilities, but require remembering what each icon means. |
| 7 | Flexibility and Efficiency | 2 | Table does not use 100% dynamic width; sidebar is fixed, limiting space for 20 columns. |
| 8 | Aesthetic and Minimalist Design | 2 | High visual noise. 20 columns and a complex filter panel create significant clutter. |
| 9 | Error Recovery | 3 | Empty states handle over-filtering well ("Ningún modelo coincide..."). |
| 10 | Help and Documentation | 3 | Tooltips present, glossary and engine explanation are always accessible. |
| **Total** | | **29/40** | **Good** |

#### Design Specificity Verdict

**LLM assessment**: The design feels tailored to a highly technical AI model comparison tool. However, the execution is constrained by a rigid layout. The 20-column table is too cramped, and the fixed sidebar limits horizontal real estate. It needs to adapt to the user's request for 100% dynamic width and a collapsible sidebar to let the data breathe.

**Deterministic scan**: The CLI detector identified multiple design system deviations in `src/components/dashboard/views/tabla-view.tsx`.
- **Colors outside DESIGN.md**: Multiple instances found (e.g., `#f5a623`, `#00d66f`, `rgba(0, 214, 111, 0.20)`).
- **Font sizes outside DESIGN.md**: Multiple instances of literal font sizes off the type ramp (e.g., `9px`, `10px`, `11px`).

**Visual overlays**: No reliable user-visible overlay is available because live browser visualization is skipped in this headless environment.

#### Overall Impression
A powerful, data-dense tool that is currently suffocating its own content due to layout constraints. The primary opportunity is freeing up horizontal space for the massive data table.

#### What's Working
- **Data Density**: Handles a massive amount of information with inline virtualization to keep performance snappy.
- **Persistent Help**: Glossary and Engine Explanation are always accessible, crucial for this highly technical domain.

#### Priority Issues
- **[P0] Fixed Layout Constraining Data**: The table has 20 columns but is squeezed by a fixed sidebar and non-dynamic wrapper.
  - **Why it matters**: Users cannot comfortably read or compare 20 columns of data in a constrained viewport.
  - **Fix**: Make the main layout container `w-full` dynamically and add a collapse toggle to `sidebar.tsx`.
  - **Suggested command**: `$impeccable layout`
- **[P1] Hardcoded Styles**: The detector found multiple literal hex colors and pixel font sizes that break the design system.
  - **Why it matters**: Breaks thematic consistency (e.g. dark mode) and violates the Colorless Chrome rule.
  - **Fix**: Replace literals with design system variables (`var(--...)` or Tailwind tokens).
  - **Suggested command**: `$impeccable polish`
- **[P1] Cognitive Overload (Working Memory)**: 20 visible columns exceed the limits of working memory and create a wall of data.
  - **Why it matters**: Users get lost tracking rows across so many disparate data points.
  - **Fix**: Introduce column visibility toggles or group related metrics.
  - **Suggested command**: `$impeccable distill`

#### Persona Red Flags

**Alex (Power User)**: Frustrated by the inability to collapse the sidebar to maximize data visibility on a wide monitor.
**Jordan (First-Timer)**: Overwhelmed by the "wall of options" in the filter panel and the 20-column table. Too many numbers and acronyms at once.

#### Minor Observations
- The capability icons in the table header could use a legend or text labels on hover.
- Some inline style overrides are slipping through the `Section` and `Badge` usage.

#### Questions to Consider
- "What if users could customize their own default view of the table?"
- "Does every user need to see all 20 columns at all times?"
