/**
 * Barrel re-export for all Fluent UI `makeStyles` hooks in this project.
 *
 * @remarks
 * Style hooks are extracted from their component files and co-located here so
 * that components import styles from a single well-known path (`styles/`) rather
 * than via relative sibling imports. Individual hooks are not documented because
 * `makeStyles` style objects are implementation details with no public contract.
 *
 * @packageDocumentation
 */

// Top-level screen styles
export { useAppStyles } from './useAppStyles';

// Scope screen component styles
export { usePublisherScopePanelStyles } from './components/scope/usePublisherScopePanelStyles';
export { useSolutionScopePanelStyles } from './components/scope/useSolutionScopePanelStyles';

// Shared card-row styles (used across all list components)
export { useCardRowStyles } from './components/useCardRowStyles';

// Results screen component styles
export { useComponentBrowserStyles } from './components/results/useComponentBrowserStyles';
export { useComponentSummaryCardsStyles } from './components/results/useComponentSummaryCardsStyles';
export { useStepWarningsPanelStyles } from './components/results/useStepWarningsPanelStyles';
