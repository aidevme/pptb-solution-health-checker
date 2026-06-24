import type { EntityHealthResult, HealthCheckerResult } from '../types/healthChecker.js';

/**
 * Scores entity complexity from automation density and schema size.
 *
 * @remarks
 * Weighted point formula: attributes × 1 + plugins × 5 + flows × 3 + businessRules × 2 + forms × 2.
 * Thresholds: Low ≤ 50, Medium ≤ 150, High > 150.
 * Plugins carry the highest weight because synchronous plugin chains are the primary
 * source of platform-side execution risk.
 */
export function calculateComplexityScore(entity: EntityHealthResult, _result: HealthCheckerResult): {
  total: number;
  level: 'Low' | 'Medium' | 'High';
  breakdown: {
    attributes: number;
    plugins: number;
    flows: number;
    businessRules: number;
    forms: number;
  };
} {
  const breakdown = {
    attributes: entity.entity.Attributes?.length || 0,
    plugins: entity.plugins.length,
    flows: entity.flows.length,
    businessRules: entity.businessRules.length,
    forms: entity.forms.length,
  };

  const total =
    breakdown.attributes * 1 +
    breakdown.plugins * 5 +
    breakdown.flows * 3 +
    breakdown.businessRules * 2 +
    breakdown.forms * 2;

  let level: 'Low' | 'Medium' | 'High';
  if (total <= 50) {
    level = 'Low';
  } else if (total <= 150) {
    level = 'Medium';
  } else {
    level = 'High';
  }

  return { total, level, breakdown };
}
