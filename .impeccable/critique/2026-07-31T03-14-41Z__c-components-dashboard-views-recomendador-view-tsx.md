---
target: src/components/dashboard/views/recomendador-view.tsx
total_score: 36
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-07-31T03-14-41Z
slug: c-components-dashboard-views-recomendador-view-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Excellent use of loading skeletons and computation badges. |
| 2 | Match System / Real World | 3 | High reliance on technical terms (AHP, TOPSIS, TF-IDF). |
| 3 | User Control and Freedom | 4 | Flexible input (text vs category chips), manual overrides. |
| 4 | Consistency and Standards | 4 | Strict design system adherence (except literal font sizes). |
| 5 | Error Prevention | 3 | Disables comparison correctly; warns about failure rates. |
| 6 | Recognition Rather Than Recall | 4 | Excellent contextual chips prevent guessing. |
| 7 | Flexibility and Efficiency | 4 | Supports power-users and first-timers via rapid chips. |
| 8 | Aesthetic and Minimalist Design | 3 | High data density; leans maximalist to show all metadata. |
| 9 | Error Recovery | 3 | Graceful notifications and states for gated repos. |
| 10 | Help and Documentation | 4 | Superb contextual help and glossary links inside badges. |
| **Total** | | **36/40** | **Excellent** |

## Design Specificity Verdict
**LLM Assessment:** The UI is highly specific to the domain of AI recommendation. It uses domain-specific semantic coloring and specialized components (TF-IDF mini-chart, AHP CR). It feels like a premium, purpose-built tool rather than a generic template.
**Deterministic Scan:** The detector found 11 instances of hardcoded font-sizes (10px and 11px) that break the typography ramp of the design system.

## Overall Impression
The recommendation view is a masterclass in surfacing complex multi-criteria decision data cleanly. It builds trust by "showing its math." The single biggest opportunity is refining the typography scale and reducing jargon cognitive load for non-expert users.

## What's Working
- **Transparency & Trust**: The "Por qué" sections and explicit context size hints make the AI's decision fully explainable.
- **Progressive Discovery**: The task category chips provide a perfect "zero-typing" path for quick answers.

## Priority Issues
- **[P1] Typography System Drift**
  - **Why it matters**: 11 instances of 	ext-[10px] and 	ext-[11px] break the standardized type ramp, affecting consistency and readability on some screens.
  - **Fix**: Replace literal pixel classes with standard Tailwind text utilities (e.g., 	ext-[10px] to 	ext-[0.65rem] or custom variables) defined in DESIGN.md.
  - **Suggested command**: $impeccable typeset
- **[P2] High Data Density and Vertical Rhythm in Cards**
  - **Why it matters**: The winner cards contain a massive amount of metadata (medals, provider, 4 metrics, reasons, badges, actions). It pushes cognitive limits and makes the cards very tall.
  - **Fix**: Optimize padding and line heights in the "Por qué" section, or move secondary metrics behind a hover or "expand" action.
  - **Suggested command**: $impeccable layout
- **[P3] Jargon Overload**
  - **Why it matters**: Terms like "AHP CR" and "TF-IDF" are prominent. While accurate, they add extraneous cognitive load for users just seeking a fast LLM recommendation.
  - **Fix**: Demote or abstract highly technical terms, ensuring the primary path speaks plain language.
  - **Suggested command**: $impeccable clarify

## Persona Red Flags
- **Jordan (First-Timer)**: The meta-bar showing "TF-IDF" and "AHP CR 0.0000" might be intimidating. Jordan might not know if a CR of 0.0000 is good or bad without reading documentation.
- **Casey (Distracted Mobile User)**: The cards are very tall due to the extensive "Por qué" lists and badges. Scrolling past 3 winners on a mobile screen will take multiple swipes, making comparison difficult.

## Minor Observations
- The TF-IDF mini bar chart is a nice touch, but takes up vertical space for something that is usually secondary to the final result.
- The badges area can get crowded if a model has many licenses, offline capability, and repo statuses simultaneously.

## Questions to Consider
- Does the user *need* to see the TF-IDF breakdown before looking at the winners, or could it be moved below the results?
- Can the 4 key metrics inside the card be displayed in a more compact horizontal grid?
