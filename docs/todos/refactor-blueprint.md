# Refactor: Blueprint → HealthChecker rename

## Overview

Rename all `Blueprint`-prefixed identifiers, the `useBlueprint` hook, and
associated generated output filenames to align with the project's
"Solution Health Checker" product name.

**Total scope:** ~295 replacement sites across 61 files (3 file renames + 58 content edits).

---

## Rename mapping

| Current name | New name | Kind | Occurrences | Risk |
|---|---|---|---|---|
| `useBlueprint` | `useHealthChecker` | hook function | 23 | Low — all call sites are internal |
| `UseBlueprintResult` | `UseHealthCheckerResult` | hook result interface | 2 | Very low — declared and used only in `useBlueprint.ts` |
| `BlueprintResult` | `HealthCheckerResult` | core result type | 168 | **High** — most-used type; see risk notes below |
| `BlueprintGenerator` | `HealthCheckerGenerator` | class | 27 | Medium — file rename + `blueprintGenerator` property also needs renaming |
| `BlueprintScope` | `HealthCheckerScope` | type | 4 | Very low — confined to `BlueprintGenerator.ts` and `useBlueprint.ts` |
| `BlueprintSummary` | `HealthCheckerSummary` | type | 5 | Low — type name only; runtime property key `result.summary` is unchanged |
| `BlueprintMetadata` | `HealthCheckerMetadata` | type | 5 | Low — type name only; runtime property key `result.metadata` is unchanged |
| `EntityBlueprint` | `EntityHealthResult` | type | 56 | Medium — touches `IDiscoverer` contract and all 20+ discoverer implementations |
| `blueprint-*.md/html/json/zip` | `health-checker-*.md/html/json/zip` | generated output filenames | ~62 | **Medium** — user-visible; breaks any external scripts that expect the old filename prefix |

### Risk notes

**`BlueprintResult` (168 sites)**
Renaming the TypeScript type does NOT change the runtime JSON structure — only
property names (`summary`, `entities`, `metadata`, etc.) affect the serialised
output, not the TypeScript type name itself. The risk is purely in breadth:
missing even one occurrence causes a compile error. The `blueprint-` prefix
in string literals for generated filenames is a separate concern (see below).

**`EntityBlueprint` (56 sites)**
`EntityBlueprint` is part of the `IDiscoverer` interface contract. All 20+
discoverer concrete classes implement this interface. Renaming it requires
updating every discoverer in one atomic operation — a partial rename will
break the build immediately.

**`blueprint-` output filenames (~62 string literals)**
These are runtime string values embedded in `MarkdownReporter.ts` (46 sites)
and `HtmlTemplates.ts` (16 sites). They determine the filenames users download
(e.g. `blueprint-2024-01-15.json`). Changing to `health-checker-*` is a
user-visible breaking change. Any automation scripts or bookmarks that rely on
the old filename prefix will break. Consider a minor version bump.

**`blueprints` prop names (not in the mapping above)**
Several components have a runtime prop named `blueprints` (e.g.
`CrossEntityAutomationView` has `blueprints: EntityBlueprint[]`). The TypeScript
type changes with the `EntityBlueprint` rename, but the prop name `blueprints`
is a separate decision. Recommend leaving prop names unchanged in this pass to
contain scope — they do not affect compilation or runtime correctness.

---

## File renames (3)

| Old path | New path | Risk |
|---|---|---|
| `src/hooks/useBlueprint.ts` | `src/hooks/useHealthChecker.ts` | Low — 2 direct import paths to update (`App.tsx`, `hooks/index.ts`) |
| `src/core/generators/BlueprintGenerator.ts` | `src/core/generators/HealthCheckerGenerator.ts` | Medium — verify no processors import by direct path before renaming |
| `src/core/types/blueprint.ts` | `src/core/types/healthChecker.ts` | Low — consumed only via the `core/index.ts` barrel; 1 barrel import path to update |

### File rename risks

**Must use `git mv`**, not a copy+delete, for all three files to preserve
`git blame` and `git log --follow` history. Renaming without `git mv` severs
the file history at this commit.

After renaming, the TypeScript language server and VS Code's import resolver
may still cache the old path. A full IDE restart or `tsc --noEmit` run is
needed to confirm the rename resolved cleanly.

**Windows file system is case-insensitive.** Renaming `BlueprintGenerator.ts`
→ `HealthCheckerGenerator.ts` (completely different name) is safe. However,
if a rename ever involves only a case change (e.g. `Blueprint.ts` →
`blueprint.ts`), Git on Windows will not detect it without `git mv --force`.

---

## Content edits (58 files)

### Entry points & hooks

| File | Identifiers | Risk |
|---|---|---|
| `src/App.tsx` | `useBlueprint` import + call site + TSDoc | Low — 1 import, 1 call site |
| `src/hooks/useBlueprint.ts` *(also renamed)* | `UseBlueprintResult`, `useBlueprint`, `BlueprintGenerator`, `BlueprintScope` | Low — the file itself; rename `blueprintGenerator` property to `healthCheckerGenerator` |
| `src/hooks/index.ts` | barrel export + TSDoc | Low — 1 export line; TSDoc count note needs updating |
| `src/hooks/useExport.ts` | `BlueprintResult` parameter type | Very low — 2 sites |

### Components (12 files)

| File | Identifiers | Risk |
|---|---|---|
| `src/components/ComponentTabRegistry.tsx` | `BlueprintResult`, `EntityBlueprint` | Low — type-only usage |
| `src/components/EntityList.tsx` | `EntityBlueprint` | Low |
| `src/components/ResultsDashboard.tsx` | `BlueprintResult` | Low |
| `src/components/ExportDialog.tsx` | `BlueprintResult`, `BlueprintGenerator`, `blueprintGenerator` prop | Medium — accesses `blueprintGenerator` on the hook result by name; must rename the property in sync with `UseBlueprintResult` |
| `src/components/ERDView.tsx` | `BlueprintResult` | Low |
| `src/components/CrossEntityAutomationView.tsx` | `EntityBlueprint` (type only) | Low — prop name `blueprints` intentionally left unchanged |
| `src/components/ExecutionPipelineView.tsx` | `EntityBlueprint` | Low |
| `src/components/SchemaView.tsx` | `EntityBlueprint` | Low |
| `src/components/results/ComponentBrowser.tsx` | `BlueprintResult` | Low |
| `src/components/results/ComponentSummaryCards.tsx` | `BlueprintResult` | Low |
| `src/components/results/StepWarningsPanel.tsx` | `BlueprintResult` | Low |

### Core — barrel & types

| File | Identifiers | Risk |
|---|---|---|
| `src/core/index.ts` | re-exports of all renamed types + TSDoc | **High** — this is the public API surface for the entire core layer; must be updated atomically with the type declarations |
| `src/core/types/blueprint.ts` *(also renamed)* | all `Blueprint*` type declarations | Medium — source of truth; every downstream type error traces back here |
| `src/core/types.ts` | any `Blueprint*` re-exports | Low — verify content; may be a thin re-export layer |

### Core — generators (4 files)

| File | Identifiers | Risk |
|---|---|---|
| `src/core/generators/BlueprintGenerator.ts` *(also renamed)* | class name, `BlueprintScope`, `BlueprintOptions` | Medium — file rename + all direct import paths |
| `src/core/generators/ERDGenerator.ts` | `BlueprintResult`, `EntityBlueprint` | Low |
| `src/core/generators/processors/generatorSteps.ts` | `BlueprintResult` | Low |
| `src/core/generators/processors/ProcessorStep.ts` | `BlueprintResult` | Low |

### Core — analyzers (3 files)

| File | Identifiers | Risk |
|---|---|---|
| `src/core/analyzers/CrossEntityAnalyzer.ts` | `BlueprintResult`, `EntityBlueprint` | Low |
| `src/core/analyzers/SolutionDistributionAnalyzer.ts` | `BlueprintResult`, `EntityBlueprint` | Low |
| `src/core/analyzers/ExternalDependencyAggregator.ts` | `BlueprintResult` | Low |

### Core — exporters (1 file)

| File | Identifiers | Risk |
|---|---|---|
| `src/core/exporters/ExportFacade.ts` | `BlueprintResult` | Low |

### Core — reporters (24 files)

| File | Identifiers | Risk |
|---|---|---|
| `src/core/reporters/IReporter.ts` | `BlueprintResult` | Low |
| `src/core/reporters/JsonReporter.ts` | `BlueprintResult` | Low — type name only; JSON property keys are unchanged |
| `src/core/reporters/HtmlReporter.ts` | `BlueprintResult` | Low |
| `src/core/reporters/MarkdownReporter.ts` | `BlueprintResult`, `EntityBlueprint`, `blueprint-` output filenames (46 sites) | **Medium** — 46 sites include both type references and runtime filename strings; must distinguish type replacements from string-literal replacements to avoid over-replacing product name references |
| `src/core/reporters/html/HtmlTemplates.ts` | `BlueprintResult`, `blueprint-` output filenames (16 sites) | **Medium** — same dual concern as `MarkdownReporter.ts` |
| `src/core/reporters/html/IHtmlTemplateSection.ts` | `BlueprintResult` | Low |
| All 18 `sections/*.ts` files | `BlueprintResult` (3 occurrences each) | Low — mechanical; all follow the same pattern |

### Core — discovery (3 files)

| File | Identifiers | Risk |
|---|---|---|
| `src/core/discovery/IDiscoverer.ts` | `EntityBlueprint` | **Medium** — this is the interface contract; must be renamed in the same commit as all 20+ implementing classes |
| `src/core/discovery/EntityDiscovery.ts` | `EntityBlueprint` | Low |
| `src/core/discovery/SolutionComponentDiscovery.ts` | `EntityBlueprint` | Low |

### Core — utils (2 files)

| File | Identifiers | Risk |
|---|---|---|
| `src/core/utils/complexity.ts` | `BlueprintResult`, `EntityBlueprint` | Low |
| `src/core/utils/systemFilters.ts` | `EntityBlueprint` | Low |

### src/utils (2 files)

| File | Identifiers | Risk |
|---|---|---|
| `src/utils/sizeEstimator.ts` | `BlueprintResult` | Low |
| `src/utils/dbDiagramGenerator.ts` | `BlueprintResult` | Low |

---

## Execution plan

### Step 1 — Mass identifier replace across `.ts` / `.tsx` files

Run a PowerShell `Get-ChildItem -Recurse | ForEach` pass using the mapping table.

**Risks:**
- **Over-replacement.** The word `blueprint` appears in non-identifier contexts that must NOT be replaced:
  - Product name prose in comments and TSDoc: `"Generated by Power Platform Solution Blueprint (PPSB)"`, `"Power Platform Solution Blueprint"` — leave unchanged.
  - Lowercase local variable names (e.g. `const blueprints = ...`, `reset(); // Clear blueprint state first`) — these are not identifiers in the mapping and should be evaluated case by case.
  - The `blueprints` prop name on React components — intentionally excluded from this pass (see mapping notes above).
- **Under-replacement.** The patterns are case-sensitive. Confirm every casing variant is covered: `BlueprintResult`, `blueprintResult`, `blueprint-` (string literals).
- **Mitigation:** Apply each substitution as an exact whole-word match (`\bBlueprintResult\b` etc.) rather than a plain substring replace to avoid partial matches inside longer identifiers.

### Step 2 — Rename the 3 source files

Use `git mv` for all three files (see file rename section above).

**Risks:**
- Renaming before fixing import paths leaves the project in a broken build state. Do not commit between Step 2 and Step 3.
- If the processors directory has any file that imports `BlueprintGenerator` by direct relative path (not via the barrel), that path will break immediately. Verify with `grep -rn "from.*BlueprintGenerator"` before renaming.
- Renaming `blueprint.ts` → `healthChecker.ts` changes the module path consumed by `core/index.ts`. The barrel import `from './types/blueprint'` must be updated in the same working tree change.

### Step 3 — Update direct import paths

Only **direct path imports** need updating — barrel imports (`from '../core'`, `from '../../hooks'`) resolve through the barrel and need no path change after the barrel itself is updated.

Direct paths to update:

| File | Old import | New import |
|---|---|---|
| `src/App.tsx` | `from './hooks/useBlueprint'` | `from './hooks/useHealthChecker'` |
| `src/hooks/index.ts` | `from './useBlueprint'` | `from './useHealthChecker'` |
| `src/core/index.ts` | `from './types/blueprint'` | `from './types/healthChecker'` |
| Any file importing `BlueprintGenerator` by direct path | `from '.../BlueprintGenerator'` | `from '.../HealthCheckerGenerator'` |

**Risks:**
- Missing a direct path import results in a `Cannot find module` compile error — caught immediately by Step 4.
- Barrel imports that happen to also have a direct import alias will not be caught by the barrel-only assumption — run the `grep` pass first to be sure.

### Step 4 — TypeScript build verification

```
npx tsc --noEmit
```

**Risks:**
- `tsc --noEmit` catches TypeScript-visible errors only. It will NOT catch:
  - Runtime string comparisons that referenced the old type name.
  - Generated output filename strings (`blueprint-` → `health-checker-`) — these are plain strings to TypeScript.
  - Test snapshots that include old type names or filenames.
  - Documentation and TSDoc prose referencing old names (non-breaking but inconsistent).
- **Mitigation:** After a clean `tsc` pass, run a final `grep -rn "Blueprint" src/` to catch any remaining prose or string-literal references that were intentionally skipped in Step 1.

---

## Post-refactor follow-up (separate pass)

These do not affect compilation and can be done independently:

1. **TSDoc prose** — update all `@remarks` and inline comments that reference `Blueprint*` names as prose (added during the recent documentation pass). Run `grep -rn "Blueprint" src/` after the main rename and review each hit.
2. **`blueprint` lowercase variable names** — e.g. `reset(); // Clear blueprint state first` in `App.tsx`. Update for consistency.
3. **`blueprints` prop names** — if the team decides to rename the `blueprints: EntityHealthResult[]` prop on `CrossEntityAutomationView` and similar components, do it as a separate PR after the main rename is merged to keep diffs reviewable.
4. **Version bump** — the `blueprint-*` output filename change is user-visible. Consider bumping the minor version and adding a `CHANGELOG.md` entry noting the renamed download files.
5. **`dbDiagramGenerator.ts` output comment** — the generated DBML header currently reads `// Generated by Power Platform Solution Blueprint (PPSB)`. Decide whether to update this string or leave it as product history.
