# PPSB Project State

**Last updated:** 2026-03-17

---

## Project Identity

- **Full name:** Power Platform Solution Solution Health Checker (PPSB)
- **Tagline:** "Complete architectural blueprints for your Power Platform systems"
- **Type:** PPTB Desktop tool (runs inside Power Platform Toolbox Desktop)
- **License:** MIT, free and open-source
- **Entry point:** `dist/index.html`
- **Tool display name in PPTB:** "Power Platform Solution Health Checker (PPSB)"
- **GitHub:** https://github.com/aidevme/pptb-solution-health-checker

---

## Current Version

**v1.1.2** (pending release 2026-03-17) — cross-entity chain map redesign (trigger operation column, message code support), debug logging cleanup  
**v1.1.1** (released 2026-03-17) — business rules IF/THEN/ELSE, conditionCount fix, DRY/SOLID refactoring, debug logger, Custom APIs click fix, env vars eye icon fix, CDS Default Solution filter fix, HTML cross-entity structure fix

See `CHANGELOG.md` for full version history.

---

## What is Working (as of v1.1.1)

**Stable baseline (v1.0+):** Full Dataverse component discovery — entities, plugins, flows, business rules, classic workflows, BPFs, web resources, custom APIs, environment variables, connection references, global choices, security roles, field security profiles, attribute masking, column security profiles, forms, canvas apps, custom pages, model-driven apps. Scope selector (publisher + solution multi-select), entity list with flag filter bar (AND logic), Component Browser card-row accordion (PATTERN-001), universal search/filter on all tabs, Results Dashboard, interactive Cytoscape.js ERD with pan/zoom and PNG/SVG export, JSON/Markdown/HTML/ZIP export.

**v1.1.0+:** Pipeline-first Cross-Entity Automation view (automation nodes top-level, entities as children with ← inbound badge); external API call detection on flow steps; HTML/Markdown export parity; full AUDIT-001–013 compliance sweep across all components.

**Business rule parser:** Full IF/THEN/ELSE structure (`conditionGroups: ConditionGroup[]`, `elseActions: Action[]`); handles all condition/action types including `controls.forEach` delegate and date-derived variables.

---

## Architecture

```
Presentation:   React UI (src/components/, src/hooks/, src/App.tsx)
Business Logic: Core TypeScript (src/core/)
Data Access:    window.dataverseAPI (PPTB Desktop official API)
Data:           Microsoft Dataverse (Cloud)
```

See `docs/architecture.md` for full detail.

---

## Development Commands

```bash
pnpm install    # Install dependencies
pnpm build      # Build (outputs to dist/)
pnpm dev        # Dev server (browser testing only)
pnpm typecheck  # Type check
```

---

## In Progress

### Release v1.1.2 — Documentation Finalized (2026-03-17)

CHANGELOG.md, README.md, package.json, and npm-shrinkwrap.json all show v1.1.2.

**Pending — project owner must run:**
1. `pnpm typecheck && pnpm build` — build verification
2. `git add CHANGELOG.md README.md`
3. `git commit -m "chore: release v1.1.2"`
4. `gh pr create ...` — create PR to main
5. After PR merge: `git tag v1.1.2 -m "Release v1.1.2"` then push tag

---

## Known Limitations

- **Canvas Apps:** Basic metadata discovery supported; component-level screen analysis not available from API
- **Custom Pages:** Metadata only
- **Power Pages:** Only if deployed to Dataverse
- **Customer Insights - Journeys:** Not included

---

## Next Steps (from roadmap.md)

### Near-term
- Baseline Comparison: Load previous blueprint JSON, detect added/removed/modified components
- CLI tool: `ppsb generate [options]` with service principal auth
- CI/CD integration: GitHub Actions and Azure DevOps tasks

### Medium-term
- Impact analysis ("what if" scenarios for entities/fields/plugins)
- Unused component detection
- Business process mining (flow execution history)
- Custom analysis rules (compliance/quality, JSON/YAML config)

### Extended Platform Support
- Canvas Apps enhanced analysis (component-level screen analysis; requires .msapp extraction)
- Power Pages full portal component analysis
- Customer Insights and Marketing journeys
- Additional Dataverse component types (virtual/elastic tables, AI models, PCF controls)
- Model-driven app enhanced documentation

---

## Reference Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Primary development guide — read first |
| `COMPONENT_TYPES_REFERENCE.md` | Complete Dataverse component type codes — always check before implementing discovery |
| `DATAVERSE_OPTIMIZATION_GUIDE.md` | Performance patterns and GUID handling rules |
| `UI_PATTERNS.md` | UI design decisions (card-row pattern now in `.claude/memory/patterns-ui.md` PATTERN-001) |
| `docs/architecture.md` | Technical architecture |
| `docs/roadmap.md` | Future development plans |
| `docs/API_SECURITY.md` | API call reference and security considerations |
| `docs/user-guide.md` | End-user documentation |
| `CONTRIBUTING.md` | Commit conventions and development workflow |
| `NPM_SHRINKWRAP_GENERATION.md` | Shrinkwrap regeneration — must use `npm`, never `pnpm` |
