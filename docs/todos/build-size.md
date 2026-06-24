# Build Size Warning

## Warning

```
dist/assets/index-B2_80otH.js   2,012.79 kB │ gzip: 542.63 kB

(!) Some chunks are larger than 500 kB after minification.
```

Vite emits this warning when a single output chunk exceeds the default 500 kB threshold. All 2342 modules are currently bundled into one JS file (~2 MB raw, ~543 kB gzipped).

## Root Cause

No code-splitting is configured. Heavy dependencies (Cytoscape.js, Mermaid, JSZip, Fluent UI) land in the same chunk as application code.

## Workaround Options

### Option A — Manual chunks via `rollupOptions` (lowest risk)

Split known heavy libraries into separate chunks in [vite.config.ts](../../vite.config.ts):

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor_fluent: ['@fluentui/react-components'],
        vendor_cytoscape: ['cytoscape'],
        vendor_mermaid: ['mermaid'],
        vendor_jszip: ['jszip'],
      },
    },
  },
},
```

Pros: no code changes required, chunks load in parallel, browser caches each independently.  
Cons: all chunks still load eagerly on startup — no lazy-loading benefit.

### Option B — Dynamic `import()` for heavy views (best long-term)

Lazy-load tab content that is not visible on first render (e.g. ERD, code viewer, export dialog):

```ts
const ERDView = React.lazy(() => import('./components/ERDView'));
```

Pros: reduces initial parse time; heaviest modules only load when needed.  
Cons: requires wrapping lazy components in `<Suspense>` and testing under `pptb-webview://` — dynamic imports must be verified to work with the custom protocol (see PATTERN-007 in `.claude/memory/patterns-general.md`).

### Option C — Raise the warning limit only (suppresses noise, fixes nothing)

```ts
build: {
  chunkSizeWarningLimit: 2500,
},
```

Use only as a temporary measure while Option A or B is implemented.

## Recommended Approach

1. Apply **Option A** first — it is safe, requires no component changes, and immediately reduces the largest chunk.
2. Follow up with **Option B** for `ERDView`, `CodeViewer`, and `ExportDialog` after verifying dynamic imports work under `pptb-webview://`.
3. Do **not** use Option C alone.
