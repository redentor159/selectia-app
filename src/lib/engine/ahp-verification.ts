// ================================================================
// AHP Consistency Ratio Verification (Saaty 1980)
// ================================================================
// Saaty's AHP requires that pairwise comparison matrices have a
// Consistency Ratio (CR) < 0.1. This module reconstructs the pairwise
// matrix from weight vectors and calculates CI, CR.
//
// Formula:
//   1. Reconstruct pairwise matrix A where A[i][j] = w[i] / w[j]
//   2. λ_max = (1/n) * Σ (Aw)_i / w_i
//   3. CI = (λ_max - n) / (n - 1)
//   4. CR = CI / RI  (RI from Saaty's random index table)
// ================================================================

// Saaty's Random Consistency Index (RI) table
const RI_TABLE: Record<number, number> = {
  1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12,
  6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49,
};

export interface AHPCrResult {
  lambdaMax: number;
  CI: number;
  RI: number;
  CR: number;
  passes: boolean; // true if CR < 0.1
  n: number;
}

/**
 * Calculate the Consistency Ratio for a set of AHP weights.
 * Weights must be positive and sum to 1.0.
 */
export function calculateCR(weights: number[]): AHPCrResult {
  const n = weights.length;
  const RI = RI_TABLE[n] ?? 1.49;

  // Step 1: Reconstruct pairwise comparison matrix A[i][j] = w[i] / w[j]
  const A: number[][] = [];
  for (let i = 0; i < n; i++) {
    A[i] = [];
    for (let j = 0; j < n; j++) {
      A[i][j] = weights[i] / weights[j];
    }
  }

  // Step 2: Calculate λ_max = (1/n) * Σ (Aw)_i / w_i
  // (Aw)_i = Σ_j A[i][j] * w[j]  (but w is the eigenvector, so Aw ≈ λ_max * w)
  let lambdaSum = 0;
  for (let i = 0; i < n; i++) {
    let aw_i = 0;
    for (let j = 0; j < n; j++) {
      aw_i += A[i][j] * weights[j];
    }
    lambdaSum += aw_i / weights[i];
  }
  const lambdaMax = lambdaSum / n;

  // Step 3: CI = (λ_max - n) / (n - 1)
  const CI = n > 1 ? (lambdaMax - n) / (n - 1) : 0;

  // Step 4: CR = CI / RI
  const CR = RI > 0 ? CI / RI : 0;

  return {
    lambdaMax: Number(lambdaMax.toFixed(6)),
    CI: Number(CI.toFixed(6)),
    RI,
    CR: Number(CR.toFixed(6)),
    passes: CR < 0.1,
    n,
  };
}

/**
 * Verify all weight sets for all categories in all modes.
 * Returns a summary that can be displayed in the UI.
 */
export interface WeightSetVerification {
  mode: string;
  category: string;
  weights: number[];
  cr: number;
  passes: boolean;
}

export function verifyAllWeights(
  weightTables: Record<string, Record<string, number[]>>,
  categoryLabels: Record<string, string>
): WeightSetVerification[] {
  const results: WeightSetVerification[] = [];
  for (const [mode, categories] of Object.entries(weightTables)) {
    for (const [category, weights] of Object.entries(categories)) {
      // Filter out zero-weight criteria (they don't participate in the pairwise)
      const nonZeroWeights = weights.filter((w) => w > 0);
      const cr = calculateCR(nonZeroWeights);
      results.push({
        mode,
        category: categoryLabels[category] ?? category,
        weights: nonZeroWeights,
        cr: cr.CR,
        passes: cr.passes,
      });
    }
  }
  return results;
}
