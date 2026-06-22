/**
 * @deprecated Import from `../core/utils/systemFilters.js` (or from the `core` barrel) instead.
 *
 * @remarks
 * This file is a backward-compatibility shim created when `systemFilters` was
 * moved from `src/utils/` to `src/core/utils/`. It re-exports everything from
 * the canonical location so existing imports continue to compile without change.
 * Once all call sites have been updated to import from `core`, this file will
 * be deleted.
 */
export * from '../core/utils/systemFilters.js';
