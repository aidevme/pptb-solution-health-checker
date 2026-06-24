import type { HealthCheckerResult } from '../types/healthChecker.js';

/**
 * Common interface for all Health Checker reporters.
 * Each reporter transforms a HealthCheckerResult into its target output format.
 *
 * Naming convention: IReporter uses the I-prefix as it is a true interface contract
 * used in dependency inversion (see CONTRIBUTING.md for convention rules).
 */
export interface IReporter<TOutput> {
  generate(result: HealthCheckerResult): TOutput;
}
