/**
 * Barrel re-export for all custom React hooks in the `hooks/` directory.
 *
 * @remarks
 * **Named vs. wildcard exports**
 *
 * Three hooks use named exports; three use `export *`. The wildcard exports pull in
 * companion TypeScript interfaces alongside the hook function:
 *
 * | Module          | Additional public surface                                                   |
 * |-----------------|-----------------------------------------------------------------------------|
 * | `useExport`     | {@link UseExportResult}                                                     |
 * | `useListFilter` | {@link FilterDimension}, {@link UseListFilterResult}, {@link FilterSpec}    |
 * | `useScopeData`  | {@link ScopeDataState}                                                      |
 *
 * **PPTB Desktop dependency**
 *
 * {@link useBlueprint}, {@link useScopeData}, and {@link useConnectionChange} require
 * `window.toolboxAPI` / `window.dataverseAPI` injected by the PPTB Desktop host.
 * Outside that host they throw or silently no-op — they cannot be used in isolation
 * (e.g. Storybook or unit tests) without a mock of those globals.
 *
 * @packageDocumentation
 */

export { useBlueprint } from './useBlueprint';
export { useConnectionChange } from './useConnectionChange';
export { useExpandable } from './useExpandable';
export * from './useExport';
export * from './useListFilter';
export * from './useScopeData';
