/**
 * Barrel re-export for all utility functions in the `utils/` directory.
 *
 * @remarks
 * Two modules use named exports; three use `export *`:
 *
 * | Module               | Export style | Notes                                                  |
 * |----------------------|--------------|--------------------------------------------------------|
 * | `dateFormat`         | `export *`   | Exports `formatDate` and `formatDateTime`              |
 * | `dbDiagramGenerator` | named        | Only `generateDbDiagramCode` is public surface         |
 * | `descriptionFilter`  | named        | Only `filterDescription` is public surface             |
 * | `sizeEstimator`      | `export *`   | Exports all four size/format helpers                   |
 * | `systemFilters`      | `export *`   | **Deprecated shim** — re-exports from `core/utils/systemFilters.js`; prefer importing from `core` directly |
 *
 * @packageDocumentation
 */

export * from './dateFormat';
export { generateDbDiagramCode } from './dbDiagramGenerator';
export { filterDescription } from './descriptionFilter';
export * from './sizeEstimator';
export * from './systemFilters';
