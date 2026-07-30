// ================================================================
// TOPSIS Sensitivity Analysis
// ================================================================
// Verifies that small perturbations (±10%) in AHP weights do not
// drastically change the TOPSIS ranking. If the #1 model changes in
// >50% of perturbations, the engine is "sensitive". If it stays in
// >80%, the engine is "robust".
//
// Methodology:
//   For each criterion weight w_i:
//     1. Create variant: w_i * 1.1, renormalize others
//     2. Create variant: w_i * 0.9, renormalize others
//     3. Run TOPSIS with each variant
//     4. Compare top-3 original vs top-3 variant
// ================================================================

export interface SensitivityResult {
  criterion: string;
  perturbation: "+10%" | "-10%";
  originalTop3: string[];
  variantTop3: string[];
  top1Changed: boolean;
  top3Overlap: number; // 0-3, how many of original top-3 remain
}

export interface SensitivitySummary {
  totalTests: number;
  top1Stable: number; // times #1 didn't change
  top1StabilityPct: number;
  avgTop3Overlap: number;
  robust: boolean; // true if top1StabilityPct >= 80
}

/**
 * Run sensitivity analysis on TOPSIS weights.
 * Takes the original weights, perturbs each by ±10%, and compares rankings.
 */
export function runSensitivityAnalysis(
  originalWeights: Record<string, number>,
  originalTop3: string[],
  topsisFn: (weights: Record<string, number>) => string[] // returns top-3 model names
): { results: SensitivityResult[]; summary: SensitivitySummary } {
  const results: SensitivityResult[] = [];
  const criteria = Object.keys(originalWeights).filter((k) => originalWeights[k] > 0);

  for (const criterion of criteria) {
    for (const delta of [1.1, 0.9] as const) {
      // Create perturbed weights
      const perturbed: Record<string, number> = { ...originalWeights };
      perturbed[criterion] = originalWeights[criterion] * delta;

      // Renormalize so they sum to 1.0
      const sum = Object.values(perturbed).reduce((s, w) => s + w, 0);
      for (const k of Object.keys(perturbed)) {
        perturbed[k] = perturbed[k] / sum;
      }

      // Run TOPSIS with perturbed weights
      const variantTop3 = topsisFn(perturbed);

      const top1Changed = variantTop3[0] !== originalTop3[0];
      const overlap = originalTop3.filter((m) => variantTop3.includes(m)).length;

      results.push({
        criterion,
        perturbation: delta === 1.1 ? "+10%" : "-10%",
        originalTop3,
        variantTop3,
        top1Changed,
        top3Overlap: overlap,
      });
    }
  }

  const totalTests = results.length;
  const top1Stable = results.filter((r) => !r.top1Changed).length;
  const avgTop3Overlap = results.reduce((s, r) => s + r.top3Overlap, 0) / totalTests;

  return {
    results,
    summary: {
      totalTests,
      top1Stable,
      top1StabilityPct: Number(((top1Stable / totalTests) * 100).toFixed(1)),
      avgTop3Overlap: Number(avgTop3Overlap.toFixed(2)),
      robust: (top1Stable / totalTests) >= 0.8,
    },
  };
}
