# Solution Health Checker — High-Level Architecture

**Repository:** `aidevme/pptb-solution-health-checker`
**Host platform:** [Power Platform ToolBox (PPTB)](https://www.powerplatformtoolbox.com/) — Electron-based desktop companion for Power Platform practitioners
**Status:** Design draft

---

## 1. Purpose

Solution Checker (Microsoft's built-in static analyzer) covers code-quality and performance issues inside a solution package, but has no visibility into schema design, security model, ALM layering, flow governance, or capacity trends. This tool fills that gap as a PPTB plugin, with the goal of surfacing a broader set of Dataverse/Power Platform governance findings than Solution Checker can reach.

All rules and their definitions are **bundled with the tool** — no external service is required at runtime. New rules ship with new tool versions published to npm and the PPTB registry.

---

## 2. Why PPTB shapes this architecture

PPTB tools are not native desktop apps — they are **sandboxed web applications**:

- Each tool runs in an isolated iframe inside the PPTB Electron shell.
- The tool talks to the host only through two injected, namespaced APIs: `window.toolboxAPI` and `window.dataverseAPI`.
- There is no backend the tool controls — no Express server, no Node `fs`, no native modules. Everything is browser-side TypeScript.
- The host owns authentication entirely (interactive login, MFA). The tool never sees a token.
- Outbound network calls are blocked by default. A tool must declare `cspExceptions` per domain in its manifest, and the **user must explicitly consent** the first time the tool runs.
- Build output is a single bundled JS file (Vite), loaded via `file://` — no dynamic module loading, no runtime filesystem scanning.

Because all rule logic is bundled, this tool requires **no CSP exceptions** — it makes no outbound network calls beyond Dataverse (which is handled by the host through `window.dataverseAPI`).

---

## 3. Component overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Power Platform ToolBox (host)                   │
│        owns auth, connection, sandbox, CSP enforcement, settings     │
└───────────────────────────────┬──────────────────────────────────────┘
                                 │ window.toolboxAPI / window.dataverseAPI
┌───────────────────────────────▼──────────────────────────────────────┐
│                Solution Health Checker (this tool, in an iframe)     │
│                                                                        │
│  ┌─────────────┐   ┌──────────────────┐   ┌─────────────────────┐    │
│  │   UI Layer   │──▶│   Orchestrator   │──▶│     Rule Engine      │    │
│  │ (React + TS) │   │ (runner, cache,  │   │ (bundled rule packs) │    │
│  │              │◀──│  suppressions)   │◀──│                      │    │
│  └─────────────┘   └──────────────────┘   └──────────┬───────────┘    │
│                                                        │                │
│                                            ┌───────────▼───────────┐  │
│                                            │  Dataverse Data Source │  │
│                                            │  (wraps               │  │
│                                            │  window.dataverseAPI) │  │
│                                            └───────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Rule model

All rules are **code rules** — TypeScript modules bundled with the application inside `src/engine/rulePacks/`. There are no remotely fetched or interpreted rule definitions.

```typescript
interface Rule {
  id: string;                 // e.g. "SEC-ADMIN-001"
  category: 'schema' | 'flow' | 'security' | 'alm' | 'capacity';
  title: string;
  description: string;
  defaultSeverity: 'fail' | 'warn' | 'info';
  evaluate(ctx: RuleContext): Promise<Finding[]>;
}
```

Each rule pack is a plain TypeScript file that exports an array of `Rule` objects. The orchestrator imports all packs at build time — the full rule set is known statically.

### Rule pack structure

```
src/engine/
├── types.ts               Rule, Finding, RuleContext interfaces
├── orchestrator.ts        runs selected rules, aggregates findings
├── dataverseSource.ts     wraps window.dataverseAPI
└── rulePacks/
    ├── schema.ts          SCH-* rules
    ├── security.ts        SEC-* rules
    ├── alm.ts             ALM-* rules
    ├── flow.ts            FLOW-* and PLG-* rules
    └── capacity.ts        CAP-* rules
```

### Adding a new rule

1. Open the relevant rule pack file (e.g. `src/engine/rulePacks/security.ts`).
2. Implement the `Rule` interface — `evaluate()` receives a `RuleContext` and returns `Promise<Finding[]>`.
3. Export the new rule in the pack's array.
4. Bump the package version and publish to npm — PPTB users receive the update automatically.

---

## 5. Data flow per run

1. **On tool load** — fetch the active connection via `toolboxAPI.connections.getActiveConnection()`; subscribe to `connection:updated`.
2. **User selects rule categories/rules**, persisted via `toolboxAPI.settings`.
3. **On "Run Health Check"** — orchestrator runs each selected rule's `evaluate()` against `RuleContext` (in parallel, `Promise.allSettled` so one failing rule doesn't abort the run), aggregates `Finding[]`, applies the suppression baseline.
4. **Results rendered** in a grid, grouped by severity/category, with drill-down detail and CSV export via `toolboxAPI.fileSystem.saveFile`.

---

## 6. PPTB integration specifics

- **No CSP exceptions required** — all Dataverse access goes through `window.dataverseAPI` which the host manages; no direct outbound calls are made by the tool.
- **No proxy/backend** is needed for Dataverse access — `window.dataverseAPI` provides FetchXML, OData, and metadata operations directly.
- **Settings persistence** (selected rules, suppression baseline) uses `toolboxAPI.settings`, which is tool- and context-scoped by the host.
- **Build**: React + TypeScript + Vite, producing a single JS bundle. No external runtime dependencies beyond what is bundled.

---

## 7. Engine portability

`src/engine/` (rules, contracts, data source wrapper) has **no dependency on React or PPTB APIs** beyond the single `DataverseSource` wrapper around `window.dataverseAPI`. This keeps:

- Rules unit-testable in isolation (mock `DataverseSource`, no iframe/sandbox needed).
- The door open to reusing the same engine in a future CLI context, if a non-PPTB delivery surface is ever needed.

---

## 8. Scope for v1

| In scope | Deferred |
|---|---|
| Bundled code rules: ~10–15 across all categories | Per-tenant rule customisation |
| Schema, security, ALM, flow rule categories | Capacity/Admin API-sourced rules (needs a second data source adapter) |
| CSV export | Markdown/HTML export |
| Suppression baseline (flat allow-list) | Suppression UI |
| Rule enable/disable per category | Rule severity overrides |
