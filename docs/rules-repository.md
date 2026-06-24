# Solution Health Checker — Rule Repository

**Repository:** `aidevme/pptb-solution-health-checker`
**Companion docs:** `ARCHITECTURE.md` · `RULES.md`
**Maintainer:** AIDevMe (@aidevme)
**Last updated:** 2026-06-23

This file is the canonical rule reference. Every rule in the engine — whether bundled as TypeScript or hosted in Azure as a declarative JSON spec — has a master entry here covering full metadata, rationale, data source details, known false-positive conditions, fix guidance, and version history.

For the JSON DSL spec format, see `ARCHITECTURE.md §4.1` and `RULES.md §3`.

---

## Contents

- [How to read a rule entry](#how-to-read-a-rule-entry)
- [Category: Schema & Data](#category-schema--data)
- [Category: Plugins & Server-Side Logic](#category-plugins--server-side-logic)
- [Category: Power Automate (Flows)](#category-power-automate-flows)
- [Category: Connection References & Environment Variables](#category-connection-references--environment-variables)
- [Category: ALM & Layering](#category-alm--layering)
- [Category: Security Model](#category-security-model)
- [Category: Capacity & Governance](#category-capacity--governance)
- [Category: Web Resources](#category-web-resources)
- [Adding a new rule](#adding-a-new-rule)
- [Rule retirement process](#rule-retirement-process)

---

## How to read a rule entry

Each rule entry uses the following fields:

| Field | Meaning |
|---|---|
| **ID** | Canonical rule identifier. Format: `<CATEGORY>-<SUBTOPIC>-<NNN>` |
| **Version** | Current version of this rule definition, e.g. `1.0` |
| **Title** | Short, action-oriented title shown in the UI |
| **Description** | One-sentence summary of what the rule detects |
| **Category** | One of: `schema` · `flow` · `security` · `alm` · `capacity` · `webresource` |
| **Severity** | `fail` — blocks sign-off · `warn` — investigate · `info` — observational |
| **Source** | `Code` — bundled TypeScript · `Dataverse Entity` — rule definition stored in a Dataverse entity record · `Azure Hosted JSON file` — declarative JSON spec hosted in Azure Blob Storage |
| **Dataverse API** | Minimum Dataverse API version required |
| **Tags** | Searchable labels for filtering |
| **Effort to fix** | Estimated remediation effort: `low` · `medium` · `high` |
| **Data sources** | Which API surfaces are queried |
| **Configurable thresholds** | Named config keys and defaults |
| **False positive conditions** | Known scenarios where the rule fires but the finding is acceptable |
| **Related rules** | Other rules that are commonly triggered together |
| **Version history** | Change log per rule version |

---

## Category: Schema & Data

Rules that examine table definitions, column design, relationships, and audit configuration.

---

### SCH-IDX-001 — Missing index on frequently filtered column

| Field | Value |
|---|---|
| **ID** | SCH-IDX-001 |
| **Version** | 1.0 |
| **Title** | Missing index on frequently filtered column |
| **Description** | Flags columns used in view or FetchXML filters that have no supporting index on the table. |
| **Category** | schema |
| **Severity** | warn |
| **Source** | Code |
| **Dataverse API** | v9.2+ |
| **Tags** | `performance` `schema` `query-optimization` |
| **Effort to fix** | medium |

**Description**
Identifies columns that appear as filter criteria in published views, charts, or FetchXML-based integrations but have no supporting index defined on the table. Unindexed high-cardinality columns cause full-table scans on every query, which degrades performance linearly as table row count grows.

**What it checks**
Correlates column usage patterns from `savedquery` and `userquery` filter definitions against the index definitions returned by `EntityMetadata.Keys`. Flags columns that appear in `<condition>` elements across a configurable minimum number of distinct queries but are absent from any defined index.

**Data sources**
- `EntityDefinitions` — column metadata
- `savedquery` — system views (FetchXML filter analysis)
- `userquery` — personal views (FetchXML filter analysis)

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `minQueryAppearances` | 3 | Minimum number of distinct queries a column must appear in before flagging |

**Recommendation**
Add an index via the table's Keys configuration in the maker portal or via solution XML. Avoid adding indexes to low-cardinality columns (e.g. boolean flags, small choice sets) — they increase write overhead without meaningful read benefit.

**False positive conditions**
- Column is filtered only in rarely-executed administrative views, not in production transaction paths.
- Column is a lookup to a table with very few rows (indexing provides no measurable benefit below ~1,000 rows).
- Index was intentionally omitted after a load test confirmed acceptable performance at current data volumes.

**Related rules**
- SCH-COL-004 (orphaned columns should not be indexed)
- PLG-SYNC-001 (synchronous plugins querying unindexed columns compound the latency problem)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### SCH-OPT-002 — Choice (option set) sprawl

| Field | Value |
|---|---|
| **ID** | SCH-OPT-002 |
| **Version** | 1.0 |
| **Title** | Choice (option set) sprawl |
| **Description** | Flags choice columns with more options than the configured threshold, indicating likely misuse as a lookup proxy. |
| **Category** | schema |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `schema` `design` `maintainability` |
| **Effort to fix** | medium |

**Description**
Flags global or local choice (option set) columns with more options than the configured threshold. Excessively long choice lists are usually a symptom of using a choice column as a proxy for a lookup to a configuration table — a design pattern that makes adding/editing options an ALM operation (requiring a solution import) rather than a data operation (editing a row).

**What it checks**
Retrieves all `PicklistAttributeMetadata` and `MultiSelectPicklistAttributeMetadata` and counts their option values. Flags any column exceeding the threshold.

**Data sources**
- `EntityDefinitions/<table>/Attributes` — attribute metadata with option set definitions

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `maxChoiceOptions` | 50 | Maximum number of options before flagging |

**Recommendation**
For large, frequently-changing option lists, replace the choice column with a lookup to a reference/configuration table. This allows new values to be added by data entry rather than solution deployment.

**False positive conditions**
- Industry-standard code sets (country codes, currency codes, language codes) legitimately have 100+ values and are stable.
- The option set is intentionally long and managed as part of the product spec (e.g. a comprehensive product category taxonomy).

**Related rules**
- SCH-OPT-003 (duplicate global choices that could be consolidated)
- SCH-DESC-008 (sprawling option sets often also lack descriptions)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### SCH-OPT-003 — Duplicate global choices

| Field | Value |
|---|---|
| **ID** | SCH-OPT-003 |
| **Version** | 1.0 |
| **Title** | Duplicate global choices |
| **Description** | Detects pairs of global choice sets with near-identical option values, suggesting accidental duplication instead of reuse. |
| **Category** | schema |
| **Severity** | warn |
| **Source** | Code |
| **Dataverse API** | v9.2+ |
| **Tags** | `schema` `design` `duplication` `maintainability` |
| **Effort to fix** | high |

**Description**
Detects two or more global choice sets (option sets) with near-identical option values, suggesting that a shared global choice was duplicated (intentionally or by accident) instead of reused. Duplicate choices lead to synchronization drift — the same concept is maintained in two places, and they inevitably diverge over time.

**What it checks**
Loads all `GlobalOptionSetDefinitions`, normalizes option labels to lowercase/trimmed strings, and computes a similarity score between each pair. Flags pairs where similarity exceeds the configured threshold.

**Data sources**
- `GlobalOptionSetDefinitions` — all global option sets and their option labels

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `optionSetSimilarityThreshold` | 0.85 | Jaccard similarity above which two option sets are flagged as duplicates |

**Recommendation**
Consolidate the duplicate option sets into a single global choice. Update all consuming columns to reference the retained definition. Schedule the removal of the deprecated set for the next major solution release.

**False positive conditions**
- Two choice sets intentionally share most but not all options (e.g. a subset choice for a specific module). If this is intentional, suppress via the baseline file and document the design decision.
- Multi-language environments where different language label sets create apparent similarity on the primary language but represent distinct concepts.

**Related rules**
- SCH-OPT-002 (large option sets are more likely to be duplicated)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### SCH-COL-004 — Orphaned/unused column

| Field | Value |
|---|---|
| **ID** | SCH-COL-004 |
| **Version** | 1.0 |
| **Title** | Orphaned/unused column (near-zero population) |
| **Description** | Flags columns where fewer than a configurable percentage of records have a non-null value, suggesting the column is no longer in use. |
| **Category** | schema |
| **Severity** | info |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `schema` `hygiene` `storage` |
| **Effort to fix** | low |

**Description**
Flags columns where fewer than a configurable percentage of records have a non-null value, suggesting the column is no longer actively used. Orphaned columns accumulate as features are changed or removed, creating schema noise that makes the table harder to understand and maintain.

**What it checks**
Uses FetchXML aggregate to compare count of non-null values for a column against total record count. Flags when population rate falls below threshold.

**Data sources**
- Direct FetchXML aggregate query against the target entity

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `minPopulationPercent` | 1 | Minimum % of records with a non-null value before flagging as orphaned |
| `minRecordCount` | 100 | Minimum total records before this rule runs (avoids false positives on empty tables) |

**Recommendation**
Confirm with the owning team whether the column is still needed. If not, remove it from all views/forms/flows first, then deprecate and eventually delete from the solution. Never delete a column without confirming it is absent from all integrations and plugin code.

**False positive conditions**
- New columns recently added that have not yet been populated via migration or normal use.
- Columns used only for specific scenarios (e.g. a "Return reason" field populated only for returned orders — sparse by design).
- Columns written only by integrations that run infrequently (e.g. monthly batch processes).

**Related rules**
- SCH-IDX-001 (orphaned columns should not have indexes)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### SCH-NN-005 — Unbounded N:N intersect table growth

| Field | Value |
|---|---|
| **ID** | SCH-NN-005 |
| **Version** | 1.0 |
| **Title** | Unbounded N:N intersect table growth |
| **Description** | Flags many-to-many intersect tables that have grown beyond a threshold without an archival or cleanup strategy. |
| **Category** | schema |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `schema` `performance` `storage` `data-management` |
| **Effort to fix** | medium |

**Description**
Flags many-to-many relationship intersect tables that have grown beyond a threshold without an archival or cleanup strategy. Intersect tables accumulate silently — there is no UI that surfaces their row count — and can become a significant storage and query-performance factor for high-volume relationships.

**What it checks**
Queries the intersect entity aggregate count and compares against the configured maximum.

**Data sources**
- FetchXML aggregate count against the intersect entity

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `maxIntersectRows` | 500,000 | Row count above which the intersect table is flagged |

**Recommendation**
Introduce a lifecycle management process for the relationship: either a scheduled flow that removes stale associations, or an archival pattern that moves historical association data out of the active intersect table. Review whether the N:N relationship is the right modeling choice, or whether a 1:N with a status field would provide more control.

**False positive conditions**
- High row count is expected and the query patterns against this table have been confirmed as performant via load testing.
- The intersect table is actively managed via a cleanup process that was simply not running at the time of the scan.

**Related rules**
- CAP-STORE-002 (large intersect tables contribute to database storage consumption)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### SCH-AUDIT-006 — Audit log growth rate vs. retention policy

| Field | Value |
|---|---|
| **ID** | SCH-AUDIT-006 |
| **Version** | 1.0 |
| **Title** | Audit log growth rate vs. retention policy |
| **Description** | Flags environments where audit log creation volume exceeds the acceptable monthly growth threshold relative to the configured retention period. |
| **Category** | schema |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `schema` `storage` `compliance` `audit` |
| **Effort to fix** | low |

**Description**
Compares recent audit log creation volume against the configured audit retention period to identify environments where audit data is accumulating faster than it is being purged. Audit logs are a silent storage cost driver — auditing is often enabled on tables by default and never reviewed.

**What it checks**
Counts audit records created in the last 30 days and compares against a configurable threshold representing the acceptable monthly growth rate.

**Data sources**
- `audit` entity — FetchXML aggregate with `last-x-days` filter

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `maxMonthlyAuditRows` | 1,000,000 | Maximum audit records per 30-day window before flagging |

**Recommendation**
Review which tables and columns have auditing enabled — disable it on low-value or high-volume tables where the audit trail is not a compliance requirement. Set or shorten the audit retention period in the System Settings. Consider scheduling the built-in "Delete Audit Logs" bulk-delete job.

**False positive conditions**
- High audit volume is expected and storage has been allocated accordingly.
- Organization has a compliance requirement to retain all audit records and has accounted for the storage cost.

**Related rules**
- CAP-STORE-002 (audit tables contribute to database storage)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### SCH-LOOKUP-007 — Excessive lookup columns on one table

| Field | Value |
|---|---|
| **ID** | SCH-LOOKUP-007 |
| **Version** | 1.0 |
| **Title** | Excessive lookup columns on one table |
| **Description** | Flags tables with an unusually high count of lookup columns, signalling denormalization debt. |
| **Category** | schema |
| **Severity** | info |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `schema` `design` `normalization` |
| **Effort to fix** | high |

**Description**
Flags tables with an unusually high count of lookup columns. A large number of lookups on a single table is a common sign of denormalization debt — related entities whose data has been collapsed into the parent table for convenience rather than modeled as proper related records.

**What it checks**
Counts attributes of type `Lookup` on the target entity and compares against the configured maximum.

**Data sources**
- `EntityDefinitions/<table>/Attributes` — filtered to `AttributeType eq 'Lookup'`

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `maxLookups` | 20 | Maximum lookup columns before flagging |

**Recommendation**
Review the entity design: consider whether some lookup relationships represent a separate bounded context that should be its own related table. Be especially cautious about adding further lookups to tables already near this threshold.

**False positive conditions**
- The table is intentionally an aggregation/hub entity (e.g. a transaction header that legitimately references customer, product, currency, territory, owner, and several other entities).
- The lookups were introduced by multiple managed solutions layered on top of a base entity — remove/suppress this finding for ISV-owned tables.

**Related rules**
- SCH-NN-005 (N:N relationships as an alternative to many lookups)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### SCH-DESC-008 — Missing display name or description

| Field | Value |
|---|---|
| **ID** | SCH-DESC-008 |
| **Version** | 1.0 |
| **Title** | Missing display name or description on custom table/column |
| **Description** | Flags custom tables or columns with a missing or empty description, removing the only in-product documentation for that component. |
| **Category** | schema |
| **Severity** | info |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `schema` `hygiene` `documentation` `maintainability` |
| **Effort to fix** | low |

**Description**
Flags custom tables or columns with a missing or empty description. Descriptions are the primary in-product documentation mechanism for Dataverse schema — they appear in the maker portal, in Copilot Studio entity discovery, and in AI-assisted development tools. Missing descriptions mean every new team member must reverse-engineer purpose from column names and usage.

**What it checks**
Inspects `EntityDefinitions` and `Attributes` for custom components (`IsCustom eq true`) where `Description.UserLocalizedLabel.Label` is null or empty.

**Data sources**
- `EntityDefinitions` — table-level description
- `EntityDefinitions/<table>/Attributes` — column-level description

**Configurable thresholds**
None — binary check.

**Recommendation**
Add a concise description (1–3 sentences) to every custom table and column. At minimum: what the field stores, what its values mean, and any non-obvious constraints or usage patterns. This is especially valuable for boolean and choice columns whose names alone are ambiguous.

**False positive conditions**
- Standard/system tables and columns that are not custom (these are filtered out by default).
- Columns with extremely self-explanatory names in context (e.g. `firstname`, `lastname` on a contact extension) — suppress individually via the baseline.

**Related rules**
- SCH-PREFIX-009 (missing descriptions often co-occur with prefix convention violations — both signal low hygiene discipline)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### SCH-PREFIX-009 — Publisher prefix convention violation

| Field | Value |
|---|---|
| **ID** | SCH-PREFIX-009 |
| **Version** | 1.0 |
| **Title** | Component not using publisher prefix convention |
| **Description** | Flags custom solution components whose logical names do not begin with the organization's registered publisher prefix. |
| **Category** | schema |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `schema` `alm` `naming` `governance` |
| **Effort to fix** | high |

**Description**
Flags custom solution components whose logical names do not use the organization's registered publisher prefix. The publisher prefix is the primary mechanism for namespace isolation in Dataverse — without it, components from different solutions can collide, and the origin of a component becomes untrackable in a multi-solution environment.

**What it checks**
Compares the logical name of custom tables and columns against the `config.expectedPrefix` value. Flags any that do not begin with the expected prefix followed by an underscore.

**Data sources**
- `EntityDefinitions` — `LogicalName` for tables
- `EntityDefinitions/<table>/Attributes` — `LogicalName` for columns

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `expectedPrefix` | (required) | The publisher prefix to enforce, e.g. `hso` |

**Recommendation**
For new components, always use the publisher prefix. For existing violations: renaming components in production is high-risk and may break integrations — document the violation, suppress it in the baseline with a note, and plan a correction as part of the next major refactor or environment refresh.

**False positive conditions**
- Components from installed managed solutions using a different vendor's prefix — these should be excluded by filtering `IsCustomizable.Value eq false`.
- Environments where multiple publishers are legitimately in use (multi-team development) — configure the rule per-publisher or suppress for the secondary prefix.

**Related rules**
- ALM-PUB-005 (default publisher usage often accompanies prefix violations)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### SCH-CASCADE-010 — Cascade delete on high-volume relationship

| Field | Value |
|---|---|
| **ID** | SCH-CASCADE-010 |
| **Version** | 1.0 |
| **Title** | Cascade delete configured on a high-volume relationship |
| **Description** | Flags 1:N relationships configured with cascade delete where the child table has a high record count, risking long-running platform timeouts. |
| **Category** | schema |
| **Severity** | warn |
| **Source** | Code |
| **Dataverse API** | v9.2+ |
| **Tags** | `schema` `performance` `data-management` `reliability` |
| **Effort to fix** | medium |

**Description**
Flags 1:N relationships configured with a cascade behavior of `CascadeType.Cascade` (delete child records when parent is deleted) where the child table has a high record count. Cascading deletes on large tables cause long-running, potentially timing-out platform operations that can leave data in an inconsistent state if the operation is interrupted.

**What it checks**
Retrieves 1:N relationship metadata and identifies those with cascade delete configuration. For each, queries the child entity total row count and flags those exceeding the threshold.

**Data sources**
- `EntityDefinitions/<table>/OneToManyRelationships` — cascade configuration
- FetchXML aggregate count against the child entity

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `highVolumeChildThreshold` | 100,000 | Child record count above which cascade delete is flagged |

**Recommendation**
Change the cascade behavior to `RemoveLink` (nullify the lookup) or `Restrict` (prevent deletion if children exist). Implement child cleanup explicitly via a flow or plugin so the behavior is observable, cancellable, and batchable.

**False positive conditions**
- Parent records are extremely rarely deleted (e.g. a reference/master data table), so cascade never fires in practice.
- Cascade was load-tested at the given volume and confirmed to complete within acceptable time limits.

**Related rules**
- PLG-SYNC-001 (cascade deletes trigger sync plugins on the child entity — compounded latency)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

## Category: Plugins & Server-Side Logic

Rules that examine plugin assembly registrations, step configurations, and server-side automation patterns.

---

### PLG-SYNC-001 — Synchronous plugin on high-volume message

| Field | Value |
|---|---|
| **ID** | PLG-SYNC-001 |
| **Version** | 1.0 |
| **Title** | Synchronous plugin registered on high-volume message |
| **Description** | Flags synchronous plugin steps on Create or Update messages for tables with high recent transaction volume. |
| **Category** | flow |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `performance` `plugins` `reliability` |
| **Effort to fix** | medium |

**Description**
Flags synchronous (Mode=0) plugin steps registered on Create or Update messages for tables with high recent transaction volume. Synchronous plugins execute within the platform transaction, adding latency to every triggering operation. On high-volume tables this translates directly into end-user wait time and increases the risk of platform timeouts under load.

**What it checks**
Queries `sdkmessageprocessingstep` for synchronous steps on the configured table. Separately queries the table's record creation count in the last 7 days. Flags when both conditions are true — sync steps exist and volume exceeds threshold.

**Data sources**
- `sdkmessageprocessingstep` — step mode and message/entity registration
- FetchXML aggregate count against the target entity (7-day window)

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `highVolumeThreshold` | 10,000 | Records created in last 7 days before considering the table "high-volume" |

**Recommendation**
Move non-blocking logic (notifications, async enrichment, audit side-effects) to an asynchronous plugin step or a Power Automate flow. Reserve synchronous steps for operations that must validate or transform data within the platform transaction (e.g. field defaulting, cross-field validation).

**False positive conditions**
- Synchronous plugin performs only lightweight, in-memory logic (no outbound calls, no Dataverse queries) and has been confirmed to complete in under 10ms at load.
- High volume is concentrated in batch import windows that occur outside business hours and tolerate higher latency.

**Related rules**
- PLG-DUP-002 (duplicate sync steps on the same message compound the latency further)
- SCH-IDX-001 (sync plugins that query unindexed columns are especially risky)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### PLG-DUP-002 — Duplicate plugin step registrations

| Field | Value |
|---|---|
| **ID** | PLG-DUP-002 |
| **Version** | 1.0 |
| **Title** | Duplicate plugin step registrations on same message/entity |
| **Description** | Detects multiple plugin steps registered on the same message, entity, and stage combination across the same or different plugin types. |
| **Category** | flow |
| **Severity** | warn |
| **Source** | Code |
| **Dataverse API** | v9.2+ |
| **Tags** | `plugins` `design` `maintainability` |
| **Effort to fix** | medium |

**Description**
Detects multiple plugin steps registered on the identical message/entity/stage combination across the same or different plugin types. When multiple steps fire on the same trigger, execution order becomes critical and is controlled only by the `rank` field — easy to get wrong, hard to audit, and invisible to anyone not familiar with the plugin registration tool.

**What it checks**
Groups `sdkmessageprocessingstep` records by `sdkmessageid` + `primaryentityname` + `stage` and flags groups with more than one step, filtering to custom (non-system) steps only.

**Data sources**
- `sdkmessageprocessingstep` — grouped by message/entity/stage

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `maxStepsPerTrigger` | 1 | Maximum plugin steps on a given message/entity/stage before flagging |

**Recommendation**
Where multiple steps exist for legitimate reasons, document the rank-ordering explicitly and add comments in the plugin code referencing the other steps. Where duplication is accidental (common after copy-paste or multi-developer work), consolidate into a single step with a dispatcher pattern.

**False positive conditions**
- Multiple steps from different managed solutions (e.g. a base solution and an extension) — this is expected layering and should be suppressed if each step handles a distinct concern.
- Steps registered by Microsoft-provided solutions should be excluded from this check.

**Related rules**
- PLG-SYNC-001 (duplicate sync steps compound latency)
- PLG-BROAD-003 (broad triggers combined with duplicate steps create unpredictable execution)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### PLG-BROAD-003 — Plugin registered on every message

| Field | Value |
|---|---|
| **ID** | PLG-BROAD-003 |
| **Version** | 1.0 |
| **Title** | Plugin registered on overly broad message set |
| **Description** | Flags plugin assemblies registered against an unusually high number of distinct messages or entities. |
| **Category** | flow |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `plugins` `performance` `design` |
| **Effort to fix** | medium |

**Description**
Flags plugin assemblies registered against an unusually high number of distinct messages or entities. A plugin type that fires on Create, Update, Delete, Assign, and Share across multiple entities is almost certainly doing too much — it becomes difficult to test, reason about, and maintain safely.

**What it checks**
Counts distinct `sdkmessageid` values across all steps for a given `plugintypeid` and flags those exceeding the threshold.

**Data sources**
- `sdkmessageprocessingstep` — grouped by `plugintypeid`

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `maxMessagesPerPlugin` | 5 | Distinct messages registered against one plugin type before flagging |

**Recommendation**
Split the plugin into message-specific implementations. Apply the Single Responsibility Principle: one plugin type handles one concern on one or a small set of related messages. Use a shared library/base class for common logic.

**False positive conditions**
- A generic audit or telemetry plugin intentionally registered on many messages by design.
- A plugin acting as a router/dispatcher, where the broad registration is the explicit architecture pattern and is documented.

**Related rules**
- PLG-DUP-002 (broad registration often leads to accidental duplication)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### PLG-IMG-004 — Missing pre/post image on plugin step

| Field | Value |
|---|---|
| **ID** | PLG-IMG-004 |
| **Version** | 1.0 |
| **Title** | Plugin step missing pre/post image where referenced in code |
| **Description** | Flags plugin steps whose registration omits a pre- or post-image that the plugin code appears to access. |
| **Category** | flow |
| **Severity** | info |
| **Source** | Code |
| **Dataverse API** | v9.2+ |
| **Tags** | `plugins` `reliability` `configuration` |
| **Effort to fix** | low |

**Description**
Flags plugin steps where the registration does not include a pre-image or post-image, but the associated plugin assembly's metadata suggests the code accesses `context.PreEntityImages` or `context.PostEntityImages`. Accessing an image that is not registered returns null at runtime — a silent failure that typically manifests as a NullReferenceException or incorrect logic rather than an obvious error.

**What it checks**
Correlates `sdkmessageprocessingstep` image registrations against assembly-level attribute inspection (where available) or naming convention patterns in the step/plugin name.

**Data sources**
- `sdkmessageprocessingstepimage` — image registrations per step
- `sdkmessageprocessingstep` — step configuration

**Configurable thresholds**
None — informational flag only.

**Recommendation**
Register the required pre/post image on the plugin step, including only the specific attributes the plugin code accesses (partial images) rather than registering all attributes, which increases payload size unnecessarily.

**False positive conditions**
- Plugin code checks for null before accessing the image (defensive coding) and handles the missing image gracefully.
- Plugin was recently updated to use images but the step registration reflects the old pattern — in progress.

**Related rules**
- PLG-RETRY-005 (missing images combined with no exception handling causes silent runtime failures)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### PLG-RETRY-005 — No exception handling in plugin

| Field | Value |
|---|---|
| **ID** | PLG-RETRY-005 |
| **Version** | 1.0 |
| **Title** | Plugin step with no exception handling pattern |
| **Description** | Flags plugin steps where configuration metadata suggests no structured exception handling is in place. |
| **Category** | flow |
| **Severity** | warn |
| **Source** | Code |
| **Dataverse API** | v9.2+ |
| **Tags** | `plugins` `reliability` `error-handling` |
| **Effort to fix** | medium |

**Description**
Flags plugin steps where the assembly/step configuration metadata suggests no structured exception handling. Unhandled exceptions in synchronous plugins surface as generic platform error messages to the user ("An unexpected error occurred"), with no useful diagnostic information logged.

**What it checks**
Inspects plugin step configuration and, where assembly metadata is available, checks for the presence of structured error patterns (e.g. `InvalidPluginExecutionException` references in descriptions/logs).

**Data sources**
- `sdkmessageprocessingstep` — step metadata
- `pluginassembly` — assembly metadata

**Configurable thresholds**
None — pattern-based inspection.

**Recommendation**
Wrap all business logic in a try/catch. Throw `InvalidPluginExecutionException` with a user-friendly message for expected error conditions. Log unexpected exceptions using the `ITracingService` before re-throwing. Never swallow exceptions silently.

**False positive conditions**
- Simple, single-operation plugins (e.g. a field-default setter) where the only possible failure is a platform-level exception already handled by the host.
- Plugin relies on the platform's default exception bubbling intentionally.

**Related rules**
- PLG-IMG-004 (missing images are a common source of NullReferenceExceptions)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

## Category: Power Automate (Flows)

Rules that examine cloud flow configuration, ownership, error handling, and resource consumption.

---

### FLOW-OWN-001 — Flow owned by individual user

| Field | Value |
|---|---|
| **ID** | FLOW-OWN-001 |
| **Version** | 1.0 |
| **Title** | Flow owned by individual user, not service/app account |
| **Description** | Flags cloud flows owned by a named human user account rather than a service or application account. |
| **Category** | flow |
| **Severity** | fail |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `flow` `governance` `resilience` `offboarding` |
| **Effort to fix** | low |

**Description**
Flags cloud flows owned by a named human user account rather than a service/application account. When the owning user leaves the organization, is disabled in Azure AD, or has their license removed, the flow immediately stops running — often silently, with no notification to the business. This is the single most common cause of unexplained flow outages in enterprise environments.

**What it checks**
Queries `workflow` (category=5, cloud flows) and joins to `systemuser` filtering to accounts with no `applicationid` (i.e. non-application user accounts).

**Data sources**
- `workflow` — cloud flow definitions
- `systemuser` — owner type (human vs. application user)

**Configurable thresholds**
None — binary check.

**Recommendation**
Transfer flow ownership to a dedicated service/application account before the current owner's departure. Create a shared service account per environment or workload, licensed appropriately, and with a shared mailbox for notifications. Document the account in the solution's runbook.

**False positive conditions**
- Flow is a personal productivity flow explicitly intended to run as the individual user (e.g. a personal notification flow) — suppress and tag as personal-use.
- Owner is a shared/functional mailbox account used as a service account even though it is technically a "user" rather than an application registration.

**Related rules**
- FLOW-CONN-007 (flows with personal connections are equally at-risk on offboarding)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### FLOW-ERR-002 — No configured error handling

| Field | Value |
|---|---|
| **ID** | FLOW-ERR-002 |
| **Version** | 1.0 |
| **Title** | Flow with no configured error handling (run-after) |
| **Description** | Flags flows where no action has a run-after path set for failed, skipped, or timed-out outcomes. |
| **Category** | flow |
| **Severity** | warn |
| **Source** | Code |
| **Dataverse API** | v9.2+ |
| **Tags** | `flow` `reliability` `error-handling` |
| **Effort to fix** | medium |

**Description**
Flags flows where no action has a "Configure run after" path set for `Failed`, `Skipped`, or `TimedOut` outcomes. Without this, failed actions cause the flow run to stop silently — no notification is sent, no retry is attempted, and the failure is only discoverable by manually checking the flow run history.

**What it checks**
Parses the flow's JSON definition (`clientdata` on the `workflow` record) and inspects each action's `runAfter` configuration for failure/timeout branches.

**Data sources**
- `workflow` — `clientdata` field (flow JSON definition)

**Configurable thresholds**
None — structural inspection.

**Recommendation**
Add a parallel error-handling branch (Scope + Configure run after Failed/Skipped/TimedOut) that at minimum sends an email or Teams notification with the run URL and error message. For critical flows, trigger a remediation action or create a Dataverse error log record.

**False positive conditions**
- Flows explicitly designed to be fire-and-forget with no notification requirement (e.g. low-priority enrichment flows).
- Flow is wrapped by a parent flow that handles its failure via child flow run-after configuration.

**Related rules**
- FLOW-OWN-001 (a flow with no owner accountability and no error handling has zero visibility on failure)
- FLOW-TRIG-006 (recursive flows with no error handling are especially risky)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### FLOW-API-003 — Approaching API request entitlement limit

| Field | Value |
|---|---|
| **ID** | FLOW-API-003 |
| **Version** | 1.0 |
| **Title** | Flow approaching API request entitlement limit |
| **Description** | Flags flows whose recent run volume is trending toward the daily API request entitlement for the owning user or environment. |
| **Category** | capacity |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `flow` `capacity` `licensing` `governance` |
| **Effort to fix** | medium |

**Description**
Estimates whether a flow's recent run volume is trending toward the daily API request entitlement for the owning user or environment. API throttling does not generate a notification — flows simply begin failing with 429 errors, which are hard to distinguish from transient network issues.

**What it checks**
Counts `flowrun` records in the last 24 hours and compares against the configurable warning threshold.

**Data sources**
- `flowrun` — recent run history aggregate

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `dailyRunWarningThreshold` | 5,000 | Daily run count above which the rule warns |

**Recommendation**
Reduce trigger frequency where possible (e.g. polling triggers should use the longest acceptable interval). Batch Dataverse actions inside flows using the `ChangeSet` (batch request) pattern. Consider upgrading to a Power Automate Process license for high-throughput flows to avoid per-user entitlement constraints.

**False positive conditions**
- Spike in run count was a one-off (bulk import, migration event) rather than steady-state volume.
- Organization has purchased additional API capacity add-ons that raise the effective entitlement.

**Related rules**
- CAP-API-001 (environment-level API consumption)
- FLOW-LOOP-005 (looping Dataverse calls are the most common cause of unexpected API consumption)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### FLOW-DIS-004 — Flow disabled or in failed state

| Field | Value |
|---|---|
| **ID** | FLOW-DIS-004 |
| **Version** | 1.0 |
| **Title** | Flow disabled or in suspended/failed state |
| **Description** | Flags cloud flows currently in a suspended or manually disabled state, meaning the business process they implement is silently not running. |
| **Category** | flow |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `flow` `reliability` `hygiene` |
| **Effort to fix** | low |

**Description**
Flags cloud flows that are currently in a suspended (disabled due to repeated failures) or manually disabled state. A suspended flow means a business process is silently not running — often discovered only when a downstream stakeholder notices missing data or notifications.

**What it checks**
Queries `workflow` for records with `category=5` (cloud flow), `statecode=0` (inactive), or `statuscode=2` (suspended).

**Data sources**
- `workflow` — state and status code

**Configurable thresholds**
None — binary check.

**Recommendation**
Investigate the suspension cause in the flow run history. Common causes: connector authentication expired, API limit reached, or a data condition the flow was not designed to handle. Fix the root cause, then re-enable. If the flow is intentionally disabled, remove it from the solution or document the decision in the flow's description.

**False positive conditions**
- Flow is intentionally disabled as part of a planned maintenance window or environment freeze.
- Flow is a template or scaffold that has not yet been configured for activation.

**Related rules**
- FLOW-OWN-001 (flows owned by departed users are often found in suspended state)
- FLOW-ERR-002 (flows with no error handling are more likely to end up suspended after repeated failures)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### FLOW-LOOP-005 — Dataverse action called in a loop

| Field | Value |
|---|---|
| **ID** | FLOW-LOOP-005 |
| **Version** | 1.0 |
| **Title** | Dataverse action called in a loop instead of batch |
| **Description** | Flags flows that call a Dataverse Create, Update, or Delete action inside an Apply-to-each or Do-until loop instead of using a batch request. |
| **Category** | flow |
| **Severity** | warn |
| **Source** | Code |
| **Dataverse API** | v9.2+ |
| **Tags** | `flow` `performance` `api-consumption` `design` |
| **Effort to fix** | medium |

**Description**
Flags flows that contain a Dataverse connector action (Create, Update, Delete, or Get) inside an Apply-to-each or Do-until loop. Per-item Dataverse calls in a loop consume one API request per iteration — a loop processing 1,000 items consumes 1,000 API requests where a batch operation would consume one.

**What it checks**
Parses the flow's JSON definition and identifies Apply-to-each or Do-until actions containing children of type `OpenApiConnection` targeting the Dataverse connector with a Create/Update/Delete operation.

**Data sources**
- `workflow` — `clientdata` field (flow JSON definition)

**Configurable thresholds**
None — structural pattern detection.

**Recommendation**
Replace per-item Dataverse calls with a `Perform a changeset request` action (available in the Dataverse connector) for batch Create/Update/Delete. For large datasets, consider using the Dataverse Web API directly via an HTTP action with `$batch` endpoint, or triggering a plugin/flow from a bulk-import context.

**False positive conditions**
- Loop is processing a small, bounded set of items (e.g. always ≤5 records) where batching would add complexity without meaningful benefit.
- Each iteration requires a decision based on the previous iteration's result, making batching structurally incompatible.

**Related rules**
- FLOW-API-003 (looping calls are the primary driver of unexpected API entitlement consumption)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### FLOW-TRIG-006 — Recursive trigger-condition risk

| Field | Value |
|---|---|
| **ID** | FLOW-TRIG-006 |
| **Version** | 1.0 |
| **Title** | Recursive trigger-condition risk |
| **Description** | Flags flows that update the same table they are triggered by with no trigger condition guarding against infinite re-triggering. |
| **Category** | flow |
| **Severity** | fail |
| **Source** | Code |
| **Dataverse API** | v9.2+ |
| **Tags** | `flow` `reliability` `design` `infinite-loop` |
| **Effort to fix** | medium |

**Description**
Flags flows triggered by a Dataverse record change (Create/Update) on a table when the flow also updates a column on that same table with no trigger condition guarding against re-triggering. Without a guard condition (e.g. checking whether the value to be written differs from the current value), every execution of the flow triggers a new execution — resulting in an infinite loop that consumes API entitlement until the platform throttles or suspends the flow.

**What it checks**
Parses the flow's JSON definition to compare the trigger entity/table with the target entity/table of any Dataverse Update actions in the flow body. Flags when they match and no trigger condition is set on the flow.

**Data sources**
- `workflow` — `clientdata` field (flow JSON definition, trigger, and action configuration)

**Configurable thresholds**
None — structural pattern detection.

**Recommendation**
Add a trigger condition expression that prevents the flow from running when the field it will write already has the target value (e.g. `@not(equals(triggerOutputs()?['body/new_status'], 'Processed'))`). Alternatively, use the "Modify a row" action's `IfMatch` header to write only when the value has changed.

**False positive conditions**
- Flow updates a column other than the triggering column and the trigger is filtered to specific column changes — confirm via trigger configuration filtering.
- Flow includes an explicit guard condition implemented as a Condition action early in the run (not a trigger-level condition).

**Related rules**
- FLOW-API-003 (recursive flows are the fastest way to exhaust API entitlement)
- FLOW-ERR-002 (recursive flows with no error handling are especially hard to recover from)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### FLOW-CONN-007 — Personal connection in use

| Field | Value |
|---|---|
| **ID** | FLOW-CONN-007 |
| **Version** | 1.0 |
| **Title** | Flow using a personal (non-shared) connection |
| **Description** | Flags flows using a personal connection authenticated as an individual user rather than a shared service account connection. |
| **Category** | flow |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `flow` `governance` `resilience` `offboarding` |
| **Effort to fix** | low |

**Description**
Flags flows using a personal connection (authenticated as an individual user) rather than a shared connection backed by a service account. Like flow ownership, personal connections break when the user's account is disabled or license removed — but unlike ownership, they can break even if the flow was already transferred to a service account.

**What it checks**
Inspects `connectionreference` records associated with the solution's flows and flags those where the underlying connection is not customizable (indicating a personal, non-environment-level connection) or where the connection owner is a non-application user.

**Data sources**
- `connectionreference` — connection reference definitions
- `connection` (via Admin API or connector metadata where available)

**Configurable thresholds**
None — binary check.

**Recommendation**
Replace personal connections with connections authenticated as a dedicated service account. For Dataverse connections, use an application user (app registration) rather than a licensed user account to avoid consuming a license seat for the service account.

**False positive conditions**
- Flow is a personal productivity tool explicitly intended to run as the individual user's identity.
- Connection is to a system that does not support service account authentication and requires a named user.

**Related rules**
- FLOW-OWN-001 (personal connections + personal ownership = double offboarding risk)
- ALM-CREF-001 (hardcoded connection GUIDs often indicate the connection reference pattern was bypassed)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

## Category: Connection References & Environment Variables

Rules that examine ALM parameterization of connections and configuration values.

---

### ALM-CREF-001 — Hardcoded connection reference

| Field | Value |
|---|---|
| **ID** | ALM-CREF-001 |
| **Version** | 1.0 |
| **Title** | Flow using a hardcoded connection instead of a connection reference |
| **Description** | Flags flows whose JSON definition references a connector directly by path rather than via a solution-aware connection reference component. |
| **Category** | alm |
| **Severity** | fail |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `alm` `portability` `connection-references` `deployment` |
| **Effort to fix** | medium |

**Description**
Flags flows whose JSON definition contains a direct reference to a connection by path (`/providers/Microsoft.PowerApps/apis/...`) rather than routing through a solution-aware connection reference. Hardcoded connections are environment-specific — importing the solution into a different environment requires manual editing of the flow definition rather than simply mapping a connection reference.

**What it checks**
Inspects `workflow.clientdata` for the pattern `/providers/Microsoft.PowerApps/apis/` appearing in connection references within the flow definition, which indicates a direct connector reference rather than a connection reference component.

**Data sources**
- `workflow` — `clientdata` field

**Configurable thresholds**
None — binary check.

**Recommendation**
Replace all inline connection references with connection reference solution components. In Power Automate designer, connections are automatically parameterized when a flow is added to a solution — ensure all flows are created inside a solution from the outset, not added after the fact.

**False positive conditions**
- Flow is not intended for ALM across environments (personal productivity flow, never to be imported elsewhere) — suppress with a documented note.

**Related rules**
- ALM-ENV-002 (environment variables are the config equivalent of connection references — both missing indicates low ALM maturity)
- FLOW-CONN-007 (personal connections are often the cause of hardcoded connection references)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### ALM-ENV-002 — Environment variable missing default value

| Field | Value |
|---|---|
| **ID** | ALM-ENV-002 |
| **Version** | 1.0 |
| **Title** | Environment variable with no default value |
| **Description** | Flags environment variable definitions with no default value, which causes null values or import failures when deployed to a new environment. |
| **Category** | alm |
| **Severity** | fail |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `alm` `deployment` `environment-variables` |
| **Effort to fix** | low |

**Description**
Flags environment variable definitions with no default value set. During a managed solution import, if no current value exists in the target environment and no default is defined, the import either fails or leaves the variable with a null value — silently breaking any flow or plugin that consumes it.

**What it checks**
Queries `environmentvariabledefinition` for records where `defaultvalue` is null.

**Data sources**
- `environmentvariabledefinition`

**Configurable thresholds**
None — binary check.

**Recommendation**
Set a sensible default value representing the DEV environment's configuration. Document in the solution's deployment guide which variables require a different value per environment (typically base URLs, email addresses, feature flag defaults).

**False positive conditions**
- Variable is a secret type — default values for secrets are intentionally absent (the value is supplied per-environment via Key Vault reference). Suppress for `type=Secret`.
- Variable is intentionally left blank to force an explicit per-environment value, with this requirement documented in the deployment guide.

**Related rules**
- ALM-SECRET-003 (missing defaults on secret variables can mask mis-configuration)
- ALM-CREF-001 (both indicate poor ALM parameterization discipline)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### ALM-SECRET-003 — Secret stored as plain-text environment variable

| Field | Value |
|---|---|
| **ID** | ALM-SECRET-003 |
| **Version** | 1.0 |
| **Title** | Secret stored as plain-text environment variable |
| **Description** | Flags String-type environment variables whose schema name matches common secret-related patterns, indicating unencrypted storage of sensitive values. |
| **Category** | alm |
| **Severity** | fail |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `alm` `security` `secrets-management` `compliance` |
| **Effort to fix** | medium |

**Description**
Flags environment variables of String type whose schema name matches patterns associated with secrets (containing "key", "secret", "password", "token", "apikey", "connectionstring"). Plain-text secrets in environment variables are stored unencrypted in Dataverse, visible to anyone with read access to the `environmentvariablevalue` table, and exported in solution packages.

**What it checks**
Queries `environmentvariabledefinition` for `type=String` records and applies name pattern matching for common secret-related naming patterns.

**Data sources**
- `environmentvariabledefinition` — type and schema name

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `secretNamePatterns` | `["secret","key","password","token","apikey","connectionstring"]` | Substrings in schema name that trigger this rule |

**Recommendation**
Migrate the secret to a Secret-type environment variable backed by an Azure Key Vault reference. The Secret type encrypts the value at rest and restricts access via Key Vault RBAC, providing a proper audit trail for secret access.

**False positive conditions**
- Variable name contains "key" in a non-secret context (e.g. `hso_primarykey_column_name` storing a column schema name, not a credential) — suppress individually with a documented justification.

**Related rules**
- ALM-ENV-002 (secret variables often also lack a default — both are a deployment risk)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### ALM-CREF-004 — Unused connection reference

| Field | Value |
|---|---|
| **ID** | ALM-CREF-004 |
| **Version** | 1.0 |
| **Title** | Connection reference unused by any solution component |
| **Description** | Flags connection references present in the solution that are not referenced by any active flow or other component. |
| **Category** | alm |
| **Severity** | info |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `alm` `hygiene` `connection-references` |
| **Effort to fix** | low |

**Description**
Flags connection references present in the solution that are not referenced by any flow or other solution component. Unused connection references accumulate after flows are deleted or refactored, and add noise to the solution's deployment manifest — every connection reference requires mapping during import, even if nothing uses it.

**What it checks**
Queries `connectionreference` for records with no associated `workflow` referencing them via the solution's component inventory.

**Data sources**
- `connectionreference`
- `solutioncomponent` — to correlate with active flow components

**Configurable thresholds**
None — binary check.

**Recommendation**
Remove unused connection references from the solution. They can always be re-added if a new flow needs them.

**False positive conditions**
- Connection reference is intentionally included for future use (planned but not yet built flow) — document in the solution's changelog.

**Related rules**
- ALM-CREF-001 (hardcoded connections and unused references both indicate connection reference hygiene issues)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

## Category: ALM & Layering

Rules that examine solution structure, layering, publisher configuration, and component dependencies.

---

### ALM-LAYER-001 — Unmanaged layer in non-DEV environment

| Field | Value |
|---|---|
| **ID** | ALM-LAYER-001 |
| **Version** | 1.0 |
| **Title** | Unmanaged customization layer in non-DEV environment |
| **Description** | Flags the presence of visible unmanaged solution layers in any environment configured as non-DEV. |
| **Category** | alm |
| **Severity** | fail |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `alm` `layering` `deployment` `governance` |
| **Effort to fix** | high |

**Description**
Flags the presence of visible unmanaged solution layers in any environment configured as non-DEV. This is the most common ALM anti-pattern in Power Platform deployments and the primary cause of "it works in TEST but breaks in PROD" deployment failures. Unmanaged layers in TEST/PROD are created when someone makes changes directly in those environments instead of promoting from source control via a managed solution pipeline.

**What it checks**
Queries `solution` for records with `ismanaged=false` and `isvisible=true`, combined with a check of the configured `environmentType` parameter. Flags when unmanaged solutions are present in a non-DEV environment.

**Data sources**
- `solution` — managed/visible flags

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `environmentType` | (required) | `dev`, `test`, `uat`, or `production` — rule only fires for non-`dev` environments |

**Recommendation**
In the short term: document every unmanaged customization present, export them, commit to source control, and remove them from the environment. In the medium term: enforce a policy that TEST/PROD environments are locked — all changes go through a pipeline (Azure DevOps / GitHub Actions with `pac solution import --managed`). Consider enabling Managed Environments to enforce this at the platform level.

**False positive conditions**
- Default solution components that Dataverse always shows as "unmanaged" (Publisher: Microsoft) — exclude by filtering `publisherid` to the Microsoft publisher.
- TEST environment is also used as a scratch DEV environment for a small team — this is an organizational choice, but accept that ALM quality will be lower.

**Related rules**
- ALM-LAYER-002 (unmanaged layers on top of managed solutions create import conflicts)
- ALM-PUB-005 (default publisher usage often co-occurs with unmanaged-everywhere patterns)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### ALM-LAYER-002 — Managed solution actively customized via unmanaged layer

| Field | Value |
|---|---|
| **ID** | ALM-LAYER-002 |
| **Version** | 1.0 |
| **Title** | Managed solution components have active unmanaged override layer |
| **Description** | Flags managed solution components that have an unmanaged customization layer sitting on top, risking conflict or silent loss on the next managed upgrade. |
| **Category** | alm |
| **Severity** | warn |
| **Source** | Code |
| **Dataverse API** | v9.2+ |
| **Tags** | `alm` `layering` `deployment` |
| **Effort to fix** | high |

**Description**
Flags components from a managed solution that have an unmanaged customization layer sitting on top. When the managed solution is next upgraded (a newer version imported), the unmanaged layer may conflict with the incoming managed definition — resulting in either the upgrade being blocked or the customization being silently lost, depending on the merge behavior.

**What it checks**
Uses the solution layering API (`/RetrieveSolutionComponents`) to identify components present in both a managed and an unmanaged solution simultaneously.

**Data sources**
- Solution component layer metadata (via organization service API)

**Configurable thresholds**
None — structural inspection.

**Recommendation**
Reconcile the unmanaged customization with the managed solution owner. Options: (a) fold the change into the managed solution via the source repo and release a new version; (b) accept the unmanaged override permanently by including it in an explicit extension solution; (c) remove the unmanaged override if it is no longer needed.

**False positive conditions**
- Unmanaged layer is an intentional extension to a managed base solution, managed via a formal extension solution pattern — suppress and document.

**Related rules**
- ALM-LAYER-001 (unmanaged layers in production are the root cause)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### ALM-SEG-003 — Single oversized solution

| Field | Value |
|---|---|
| **ID** | ALM-SEG-003 |
| **Version** | 1.0 |
| **Title** | Single solution with excessive component count |
| **Description** | Flags solutions that have grown beyond a component-count threshold without segmentation into a core/extension pattern. |
| **Category** | alm |
| **Severity** | info |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `alm` `design` `maintainability` `deployment` |
| **Effort to fix** | high |

**Description**
Flags solutions that have grown beyond a component-count threshold without segmentation into a core/extension pattern. A single oversized solution creates slow imports, high deployment risk (all-or-nothing), and makes it impossible to release individual features independently.

**What it checks**
Counts `solutioncomponent` records for the specified solution and compares against the threshold.

**Data sources**
- `solutioncomponent` — aggregate count per solution

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `solutionId` | (required) | The solution to check |
| `maxComponentsPerSolution` | 500 | Component count above which the rule fires |

**Recommendation**
Split into at minimum two solutions: a core/base solution containing shared schema (tables, columns, relationships, global choices) and a feature/extension solution containing business logic (flows, plugins, forms, views, apps). Consider further splitting by feature area or team ownership for large implementations.

**False positive conditions**
- Solution is in early-stage development and component count is growing toward a threshold that is not yet a problem — defer remediation until segmentation is structurally necessary.

**Related rules**
- ALM-DEP-004 (splitting solutions exposes dependency gaps that were hidden in a monolithic solution)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### ALM-DEP-004 — Missing or broken component dependency

| Field | Value |
|---|---|
| **ID** | ALM-DEP-004 |
| **Version** | 1.0 |
| **Title** | Missing or broken component dependency |
| **Description** | Flags solution components that declare a dependency on another component absent from the current environment, causing import failures on deployment. |
| **Category** | alm |
| **Severity** | fail |
| **Source** | Code |
| **Dataverse API** | v9.2+ |
| **Tags** | `alm` `deployment` `dependencies` |
| **Effort to fix** | medium |

**Description**
Flags solution components that declare a dependency on another component (e.g. a flow referencing a table, a plugin step referencing an entity) that cannot be resolved in the current environment. Missing dependencies cause import failures when the solution is deployed to an environment where the dependency is absent.

**What it checks**
Uses the `RetrieveMissingDependencies` organization service message to identify components present in the solution's dependency manifest but absent from the environment.

**Data sources**
- Solution dependency manifest (via `RetrieveMissingDependencies` org service call)

**Configurable thresholds**
None — binary check.

**Recommendation**
Add the missing component to the solution, or ensure the dependency's solution is imported first in the target environment. Document inter-solution dependency order in the deployment runbook.

**False positive conditions**
- Component has been superseded and the dependency reference is orphaned dead code — in this case, remove the stale reference rather than adding the dependency.

**Related rules**
- ALM-SEG-003 (solution segmentation increases the surface area for cross-solution dependencies)
- ALM-LAYER-002 (unmanaged overrides sometimes mask missing dependencies)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### ALM-PUB-005 — Default publisher used

| Field | Value |
|---|---|
| **ID** | ALM-PUB-005 |
| **Version** | 1.0 |
| **Title** | Solution using default Microsoft publisher |
| **Description** | Flags solutions still associated with the default Microsoft publisher rather than a custom organizational publisher, leaving components with no namespace isolation. |
| **Category** | alm |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `alm` `naming` `governance` |
| **Effort to fix** | high |

**Description**
Flags solutions still associated with the default Microsoft publisher (`MicrosoftCorporation` or `Default`) rather than a custom organizational publisher. The publisher determines the prefix applied to all custom component logical names — using the default publisher means components have no namespace isolation and are indistinguishable from Microsoft-provided components.

**What it checks**
Reads the solution's publisher reference and compares `uniquename` against the list of known default publishers.

**Data sources**
- `solution` → `publisherid` → `publisher.uniquename`

**Configurable thresholds**
None — binary check.

**Recommendation**
Create a custom publisher with an agreed organizational prefix (e.g. `hso`, `aidevme`) and reassign the solution. Note: existing components will retain their default-prefixed logical names — renaming in production is high-risk and should be planned carefully.

**False positive conditions**
- Solution is a Microsoft-provided managed solution — these legitimately use the default publisher. Filter by `ismanaged=true` to exclude.

**Related rules**
- SCH-PREFIX-009 (default publisher results in components with no prefix)
- ALM-LAYER-001 (default publisher usage correlates with low ALM maturity overall)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

## Category: Security Model

Rules that examine role assignments, team structure, field security, and access control patterns.

---

### SEC-ADMIN-001 — Excessive System Administrators

| Field | Value |
|---|---|
| **ID** | SEC-ADMIN-001 |
| **Version** | 1.0 |
| **Title** | Excessive System Administrator role assignments |
| **Description** | Flags environments where more than the recommended number of users hold the System Administrator security role. |
| **Category** | security |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `security` `access-control` `governance` `least-privilege` |
| **Effort to fix** | medium |

**Description**
Flags environments where more than the recommended number of users hold the System Administrator security role. System Administrator is an unrestricted role — it bypasses all field-level security, business unit hierarchy, and row-level access controls. Over-assigning it is a common shortcut that creates significant audit and compliance risk.

**What it checks**
Queries `systemuser` joined through `systemuserroles` to `role` filtered by the System Administrator role name.

**Data sources**
- `systemuser` — role assignments via `systemuserroles` link entity

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `maxSysAdmins` | 5 | Maximum System Administrators before flagging |

**Recommendation**
Audit all System Administrator assignments. Retain only those with a documented business need (typically: 1–2 IT admins, 1 service account). Replace all others with a custom role scoped to the minimum required privileges. Establish a process for temporary elevated access (e.g. a time-limited group membership) rather than permanent System Administrator assignment.

**False positive conditions**
- Organization is in initial rollout phase where broad admin access is temporarily required for configuration — plan a remediation sprint before go-live.
- Large enterprise with multiple business units each requiring a dedicated admin — adjust `maxSysAdmins` to reflect the justified count.

**Related rules**
- SEC-ROLE-003 (System Administrator excess often co-occurs with overly broad custom roles)
- SEC-BU-005 (System Administrators bypass business unit restrictions, masking BU design gaps)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### SEC-TEAM-002 — Ad hoc team sprawl

| Field | Value |
|---|---|
| **ID** | SEC-TEAM-002 |
| **Version** | 1.0 |
| **Title** | Excessive ad hoc (non-AAD-backed) owner teams |
| **Description** | Flags environments with a high count of owner teams not backed by an Azure Active Directory security group, requiring manual membership lifecycle management. |
| **Category** | security |
| **Severity** | info |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `security` `teams` `governance` `access-control` |
| **Effort to fix** | medium |

**Description**
Flags environments with a high count of owner teams that are not backed by an Azure Active Directory security group. Ad hoc teams require manual membership management — members must be individually added and removed, there is no automated lifecycle tied to HR/identity systems, and departed users often remain in teams long after leaving the organization.

**What it checks**
Queries `team` for records with `teamtype=0` (owner team) and `azureactivedirectoryobjectid` null (no AAD backing).

**Data sources**
- `team` — type and AAD object ID

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `maxAdHocTeams` | 15 | Ad hoc team count above which the rule fires |

**Recommendation**
Migrate team-based access to AAD-backed teams (security group teams). This ties Dataverse access to the identity provider lifecycle — users gain and lose access automatically as they are added/removed from AAD groups, eliminating manual Dataverse team maintenance.

**False positive conditions**
- Small organization where manual team management is practical and turnover is very low.
- Teams represent functional roles that do not map to AAD groups (e.g. "Project Alpha Reviewers" — a temporary, project-specific team).

**Related rules**
- SEC-ADMIN-001 (team sprawl and admin sprawl often co-occur in under-governed environments)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### SEC-ROLE-003 — Security role with org-wide access on sensitive table

| Field | Value |
|---|---|
| **ID** | SEC-ROLE-003 |
| **Version** | 1.0 |
| **Title** | Security role granting org-wide access on sensitive table |
| **Description** | Flags security roles that grant Organization-level read or write privilege on tables designated as sensitive in the configuration. |
| **Category** | security |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `security` `access-control` `compliance` `least-privilege` |
| **Effort to fix** | medium |

**Description**
Flags security roles that grant Organization-level (depth=8) read or write privilege on tables designated as sensitive in the configuration. Organization-level access means every user with the role can read or write every record on the table, regardless of owner or business unit — appropriate for reference data, inappropriate for personal, financial, or confidential tables.

**What it checks**
Queries `roleprivileges` for `privilegedepthmask=8` (Organization level) joined to `privilege` filtered to the configured sensitive table privilege names.

**Data sources**
- `roleprivileges` — privilege depth per role
- `privilege` — privilege name to table mapping

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `sensitiveTablePrivilegeNames` | (required) | List of `prv*` privilege names for tables considered sensitive (e.g. `prvReadContact`, `prvWriteAccount`) |

**Recommendation**
Reduce the privilege depth to Business Unit (depth=2) or User (depth=1) for sensitive tables. Where organization-wide access is genuinely required (e.g. global customer service team), document the business justification.

**False positive conditions**
- Table designated as sensitive in config is actually non-sensitive reference data — review the `sensitiveTablePrivilegeNames` configuration.
- Role is assigned only to system/integration accounts that legitimately require org-wide access.

**Related rules**
- SEC-ADMIN-001 (System Administrators bypass this check — always have org-wide access)
- SEC-FLS-004 (field security is the complementary control for sensitive columns within a table)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### SEC-FLS-004 — Unassigned field security profile

| Field | Value |
|---|---|
| **ID** | SEC-FLS-004 |
| **Version** | 1.0 |
| **Title** | Field security profile defined but assigned to nobody |
| **Description** | Flags field security profiles that exist in the environment but have no team or user assigned, leaving the protected fields effectively unprotected. |
| **Category** | security |
| **Severity** | info |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `security` `field-security` `configuration` `hygiene` |
| **Effort to fix** | low |

**Description**
Flags field security profiles that exist in the environment but have no team or user assigned to them. A field security profile with no assignment means the security restriction is configured in the metadata but not enforced at runtime — the protected fields are effectively unprotected.

**What it checks**
Queries `fieldsecurityprofile` and outer-joins to both `teamprofiles_association` and `systemuserprofiles_association` to find profiles with no assignments on either side.

**Data sources**
- `fieldsecurityprofile` — profile definitions
- `teamprofiles_association` — team assignments
- `systemuserprofiles_association` — user assignments

**Configurable thresholds**
None — binary check.

**Recommendation**
Either assign the profile to the intended team(s)/user(s), or remove it if the field security requirement no longer applies. Verify that the field(s) controlled by this profile are actually flagged as secured on their column definition.

**False positive conditions**
- Profile was created in preparation for a security model that has not yet been activated — suppress with a planned date for activation.

**Related rules**
- SEC-ROLE-003 (field security complements role-based access but does not replace it)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### SEC-BU-005 — Sharing used instead of business unit structure

| Field | Value |
|---|---|
| **ID** | SEC-BU-005 |
| **Version** | 1.0 |
| **Title** | Record sharing volume suggests missing business unit design |
| **Description** | Flags environments with high explicit record-sharing volume relative to a shallow business unit hierarchy, indicating the security model was not designed to match actual access patterns. |
| **Category** | security |
| **Severity** | info |
| **Source** | Code |
| **Dataverse API** | v9.2+ |
| **Tags** | `security` `access-control` `design` `business-units` |
| **Effort to fix** | high |

**Description**
Flags environments with a high volume of explicit record-sharing (`principalobjectaccess` / `PrincipalObjectAttributeAccess`) relative to a shallow business unit hierarchy. Record sharing is an escape hatch for the security model — it bypasses the role-based BU hierarchy by granting direct access to individual records. Heavy reliance on sharing usually indicates the BU structure was not designed to reflect the actual access patterns of the business.

**What it checks**
Compares `principalobjectaccess` record count against the configured threshold and correlates with BU hierarchy depth (a flat BU structure + high sharing volume is the red flag combination).

**Data sources**
- `principalobjectaccess` — aggregate sharing record count
- `businessunit` — hierarchy depth

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `maxSharingRecords` | 10,000 | Sharing record count above which the rule evaluates |
| `maxBuDepth` | 2 | BU hierarchy depth below which "flat" is inferred |

**Recommendation**
Review whether the BU hierarchy reflects the organization's reporting structure and access patterns. Deepening the BU structure and adjusting role assignments often eliminates the need for manual sharing. Where sharing is genuinely needed (ad hoc cross-BU collaboration), consider Dataverse Teams with appropriate roles as a more manageable alternative.

**False positive conditions**
- Sharing is used deliberately for a specific cross-organizational pattern (e.g. shared cases between subsidiaries) and the BU design is intentionally flat.
- High sharing count reflects a legacy migration where sharing records were created for historical data and are being cleaned up.

**Related rules**
- SEC-ADMIN-001 (too many admins can mask the need for proper BU/security model design)
- SEC-TEAM-002 (AAD-backed teams are often a better alternative to ad hoc sharing)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

## Category: Capacity & Governance

Rules that examine API consumption, storage, and data policy configuration.

---

### CAP-API-001 — API entitlement trending toward cap

| Field | Value |
|---|---|
| **ID** | CAP-API-001 |
| **Version** | 1.0 |
| **Title** | API request consumption trending toward entitlement cap |
| **Description** | Flags environments where API request consumption is trending above a configurable percentage of the licensed daily entitlement. |
| **Category** | capacity |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `capacity` `licensing` `governance` `api` |
| **Effort to fix** | medium |

**Description**
Flags environments where API request consumption is trending above a configurable percentage of the licensed daily entitlement. API throttling does not generate proactive notifications — when the entitlement is exceeded, calls begin failing with 429 (Too Many Requests) errors, which appear identical to transient network issues and are hard to diagnose.

**What it checks**
Uses the organization's current API usage data to calculate consumption as a percentage of entitlement.

**Data sources**
- Organization API usage telemetry (via Admin API or environment-level usage endpoint)

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `apiUsageWarningPercent` | 80 | % of entitlement consumed before warning |

**Recommendation**
Identify the highest-volume API consumers (flows, integrations, plugins) and optimize their request patterns — batching, caching, polling-interval increases. If consumption is legitimately high and growing, plan a license upgrade (Process plans or API capacity add-ons) before hitting the cap.

**False positive conditions**
- Spike is caused by a one-off bulk operation (migration, batch import) rather than steady-state consumption.
- Organization has purchased API capacity add-ons that increase the effective entitlement — update `apiUsageWarningPercent` threshold accordingly.

**Related rules**
- FLOW-API-003 (flow run volume is the most common driver of API entitlement consumption)
- FLOW-LOOP-005 (looping calls are the most common inefficiency)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### CAP-STORE-002 — Database storage trending toward allocation

| Field | Value |
|---|---|
| **ID** | CAP-STORE-002 |
| **Version** | 1.0 |
| **Title** | Database storage consumption trending toward allocation |
| **Description** | Flags environments where database storage consumption exceeds a configurable percentage of the allocated capacity. |
| **Category** | capacity |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `capacity` `storage` `governance` |
| **Effort to fix** | medium |

**Description**
Flags environments where database storage consumption exceeds a configurable percentage of the allocated capacity. When storage is exhausted, Dataverse begins rejecting write operations — an outage condition with no graceful degradation.

**What it checks**
Reads current database capacity utilization as a percentage.

**Data sources**
- Organization capacity data (via Admin API capacity endpoint)

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `dbStorageWarningPercent` | 80 | % of allocated capacity before warning |

**Recommendation**
Run a storage breakdown analysis (available in the Power Platform admin center) to identify top consumers. Common remediation: archive or delete stale records, reduce audit retention, remove email attachments from Dataverse (move to SharePoint), clean up activity/email entity data. If growth is structural, plan a storage add-on purchase before reaching capacity.

**False positive conditions**
- Organization has additional storage allocation from licenses not yet reflected in the utilization API (e.g. recently purchased add-ons with a lag in provisioning).

**Related rules**
- SCH-AUDIT-006 (audit logs are a major silent contributor to database storage)
- SCH-NN-005 (large intersect tables also contribute to database storage)
- CAP-FILE-004 (file storage is separate but related)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### CAP-DLP-003 — DLP policy mixing Business and Non-Business connectors

| Field | Value |
|---|---|
| **ID** | CAP-DLP-003 |
| **Version** | 1.0 |
| **Title** | DLP policy mixing Business and Non-Business connector groups |
| **Description** | Flags DLP policies where Business and Non-Business classified connectors are placed in the same group, eliminating data loss prevention protection. |
| **Category** | capacity |
| **Severity** | fail |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `governance` `dlp` `security` `compliance` `data-loss-prevention` |
| **Effort to fix** | medium |

**Description**
Flags Data Loss Prevention (DLP) policies where connectors classified as Business (internal data sources, e.g. Dataverse, SharePoint) and Non-Business (external/consumer services, e.g. personal email, social media) are placed in the same group. The entire purpose of a DLP policy is to prevent flows from connecting these two groups — placing both in the same group eliminates this protection entirely.

**What it checks**
Inspects the DLP policy connector classification to determine whether the same policy group contains both Business and Non-Business classified connectors.

**Data sources**
- DLP policy definitions (via Power Platform Admin API — `dlpPolicies` endpoint)

**Configurable thresholds**
None — binary policy inspection.

**Recommendation**
Review the connector classification in each DLP policy. Move high-risk connectors (personal email, social media, file storage outside the organization) to the Blocked or Non-Business group. Ensure Dataverse, SharePoint, Teams, and other corporate data sources are in the Business group, isolated from consumer connectors.

**False positive conditions**
- Policy is intentionally permissive for a developer/sandbox environment where connector mixing is acceptable under controlled conditions — tag the environment accordingly and suppress.

**Related rules**
- SEC-ROLE-003 (DLP governs flow-level data access; roles govern user-level data access — both should be reviewed together)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### CAP-FILE-004 — File storage trending toward allocation

| Field | Value |
|---|---|
| **ID** | CAP-FILE-004 |
| **Version** | 1.0 |
| **Title** | File/attachment storage consumption trending toward allocation |
| **Description** | Flags environments where file and attachment storage consumption exceeds a configurable percentage of the allocated capacity. |
| **Category** | capacity |
| **Severity** | info |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `capacity` `storage` `governance` `files` |
| **Effort to fix** | medium |

**Description**
Flags environments where file and attachment storage consumption exceeds a configurable percentage of the allocated capacity. File storage is consumed by Dataverse file and image columns, email attachments, and notes — it is separate from database storage and has its own allocation.

**What it checks**
Reads current file capacity utilization as a percentage.

**Data sources**
- Organization capacity data (via Admin API capacity endpoint)

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `fileStorageWarningPercent` | 80 | % of allocated file capacity before warning |

**Recommendation**
Review file storage consumers: email attachments on the Email/Activity entity are typically the largest contributor. Consider enabling SharePoint integration for document-heavy tables (Account, Opportunity, Case) to store files outside Dataverse. Clean up obsolete notes and attachments via bulk-delete jobs.

**False positive conditions**
- File storage spike caused by a one-off bulk document upload — review trend over time rather than point-in-time snapshot.

**Related rules**
- CAP-STORE-002 (database and file storage are often confused — both should be monitored)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

## Category: Web Resources

Rules that examine JavaScript, HTML, CSS, and image web resources deployed in Dataverse — covering size, usage, API hygiene, and library currency.

---

### WR-UNUSED-001 — Unused web resource

| Field | Value |
|---|---|
| **ID** | WR-UNUSED-001 |
| **Version** | 1.0 |
| **Title** | Web resource not referenced by any solution component |
| **Description** | Flags web resources present in the solution that are not referenced by any form, ribbon, site map, or other active component. |
| **Category** | webresource |
| **Severity** | info |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `web-resources` `hygiene` `alm` |
| **Effort to fix** | low |

**Description**
Flags web resources present in the solution that are not referenced by any form, ribbon, site map, canvas app, or other solution component. Unused web resources inflate solution package size, slow imports, and create confusion for developers who cannot tell whether a file is safe to delete.

**What it checks**
Cross-references the solution's `webresource` components against `systemform` XML (form libraries), `appmodule` references, and `ribbondiff` definitions to determine whether each web resource is reachable from any active component.

**Data sources**
- `webresource` — all web resource components in the solution
- `systemform` — form XML parsed for `<Library>` references
- `appmodule` — canvas and model-driven app component references

**Configurable thresholds**
None — binary check.

**Recommendation**
Confirm with the owning team that the resource is genuinely unused. If confirmed, remove it from the solution. If it is referenced by code outside the solution (e.g. a portal or external integration), document that dependency explicitly rather than leaving it as an implicit coupling.

**False positive conditions**
- Web resource is referenced dynamically via `Xrm.Navigation` or a constructed URL string — static analysis cannot detect runtime string-concatenated references.
- Web resource is included as a shared utility library depended on by other web resources that are themselves referenced; the top-level resource is reachable but not directly listed on any form.

**Related rules**
- ALM-DEP-004 (unused web resources often appear alongside missing dependency declarations)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### WR-SIZE-002 — Oversized or unminified web resource

| Field | Value |
|---|---|
| **ID** | WR-SIZE-002 |
| **Version** | 1.0 |
| **Title** | Web resource exceeds size threshold or is unminified |
| **Description** | Flags JavaScript or CSS web resources exceeding a size threshold or showing clear signs of being unminified, increasing form load time for all users. |
| **Category** | webresource |
| **Severity** | warn |
| **Source** | Azure Hosted JSON file |
| **Dataverse API** | v9.2+ |
| **Tags** | `web-resources` `performance` `size` |
| **Effort to fix** | low |

**Description**
Flags JavaScript or CSS web resources whose content length exceeds a configurable threshold or that show clear signs of being unminified (high comment density, long line lengths, whitespace-heavy formatting). Large unminified scripts are downloaded and parsed synchronously by the browser on every form load, directly increasing form open time for all users.

**What it checks**
Reads the `content` (base64) field of `webresource` records with `webresourcetype` 3 (JavaScript) or 5 (CSS), decodes to measure byte length, and for JavaScript files inspects a sample of lines for comment markers and average line length.

**Data sources**
- `webresource` — `content`, `webresourcetype`, `contentjson` fields

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `maxWebResourceKb` | 500 | File size in KB above which the resource is flagged |
| `minifiedLineLengthHint` | 500 | Average characters per line above which a file is considered likely minified (inverted — below this triggers the unminified warning) |

**Recommendation**
Run JavaScript and CSS through a minifier/bundler (esbuild, terser, cssnano) before uploading. For large shared libraries, consider hosting them on a CDN or SharePoint and loading via a stub web resource rather than embedding the full library in Dataverse.

**False positive conditions**
- Web resource is an HTML file or image — size thresholds do not apply meaningfully to non-script types; filter by `webresourcetype`.
- Intentionally readable script kept unminified for supportability in a low-governance environment — suppress individually with a documented note.

**Related rules**
- WR-LIB-004 (large files are often caused by bundling entire third-party libraries)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### WR-API-003 — Deprecated Xrm client API usage

| Field | Value |
|---|---|
| **ID** | WR-API-003 |
| **Version** | 1.0 |
| **Title** | Web resource using deprecated Xrm client API |
| **Description** | Flags JavaScript web resources that reference Xrm client API namespaces or methods that Microsoft has formally deprecated. |
| **Category** | webresource |
| **Severity** | warn |
| **Source** | Code |
| **Dataverse API** | v9.2+ |
| **Tags** | `web-resources` `deprecation` `javascript` `maintainability` |
| **Effort to fix** | medium |

**Description**
Flags JavaScript web resources that reference Xrm client API namespaces or methods that Microsoft has formally deprecated. Deprecated APIs continue to work until the version they are removed in — but when removal occurs it typically happens silently in a platform update, causing immediate form breakage with no advance warning at the individual resource level.

**What it checks**
Decodes and scans the text content of JavaScript web resources for known deprecated API patterns: `Xrm.Page.*`, `Xrm.Utility.openEntityForm`, `Xrm.Utility.openWebResource` (legacy signature), `parent.Xrm`, and `GetGlobalContext()` (outside the supported execution context).

**Data sources**
- `webresource` — `content` field (base64-decoded JavaScript text)

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `deprecatedApiPatterns` | `["Xrm.Page.", "parent.Xrm", "openEntityForm", "GetGlobalContext()"]` | Regex/string patterns identifying deprecated API usage |

**Recommendation**
Migrate to the supported model-driven app API: replace `Xrm.Page.*` with the `formContext` object passed via `OnLoad`/`OnChange` event arguments. Replace `Xrm.Utility.openEntityForm` with `Xrm.Navigation.openForm`. Remove all `parent.Xrm` references — cross-frame Xrm access has been unsupported since UCI.

**False positive conditions**
- Pattern appears inside a comment or string literal (not actual API call) — the text-scan approach cannot distinguish usage from documentation within the file.
- Web resource wraps a deprecated API in a compatibility shim that is itself only called from a suppressed context.

**Related rules**
- WR-UNUSED-001 (deprecated API usage in an unused resource is doubly stale)
- WR-SIZE-002 (legacy scripts are often also unminified and large)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

### WR-LIB-004 — Outdated third-party JavaScript library

| Field | Value |
|---|---|
| **ID** | WR-LIB-004 |
| **Version** | 1.0 |
| **Title** | Third-party JavaScript library with known outdated version |
| **Description** | Flags JavaScript web resources embedding a recognisable third-party library at a version older than the configured minimum. |
| **Category** | webresource |
| **Severity** | warn |
| **Source** | Code |
| **Dataverse API** | v9.2+ |
| **Tags** | `web-resources` `security` `dependencies` `javascript` |
| **Effort to fix** | medium |

**Description**
Flags JavaScript web resources that embed a recognisable third-party library (jQuery, Moment.js, Lodash, Axios, etc.) at a version older than the configured minimum. Outdated libraries accumulate known CVEs, carry deprecated APIs, and often include features that have since been provided natively by the browser — increasing payload size without benefit.

**What it checks**
Scans the decoded text content of JavaScript web resources for version comment banners and inline version strings matching known library fingerprints (e.g. `jQuery v`, `moment.js`, `lodash`). Compares the detected version against the configured minimum version map.

**Data sources**
- `webresource` — `content` field (base64-decoded JavaScript text)

**Configurable thresholds**

| Key | Default | Description |
|---|---|---|
| `libraryMinVersions` | `{"jquery": "3.7.0", "moment": "2.30.0", "lodash": "4.17.21", "axios": "1.6.0"}` | Minimum acceptable version per library name |

**Recommendation**
Update the library to the latest stable version and re-upload the web resource. For jQuery specifically, evaluate whether the library is still needed — most jQuery functionality is now available natively in modern browsers. For Moment.js, consider migrating to a maintained alternative (Day.js, date-fns) as Moment is in maintenance mode only.

**False positive conditions**
- Version string detected in a comment from a wrapper or bundled file, but the actual library code is a newer version — verify by checking the functional version declaration.
- Library is intentionally pinned to an older version due to a known compatibility requirement with a third-party component that has not yet been updated.

**Related rules**
- WR-SIZE-002 (full third-party library bundles are a primary cause of oversized web resources)
- WR-API-003 (outdated libraries often accompany deprecated Xrm API patterns in legacy scripts)

**Version history**

| Version | Change |
|---|---|
| 1.0 | Initial implementation |

---

## Adding a new rule

1. **Decide source type**:
   - Can the rule be expressed as one or more named FetchXML/OData queries + a DSL expression served from Azure Blob Storage? → `Azure Hosted JSON file`
   - Is the rule definition stored as a record in a Dataverse entity? → `Dataverse Entity`
   - Requires multi-step logic, cross-query correlation beyond the DSL's operator set, or assembly inspection? → `Code`
2. **Assign an ID**: next sequential number within the appropriate `<CATEGORY>-<SUBTOPIC>` prefix. Check this file to confirm no collision.
3. **Write the rule entry** in this file following the template above. All fields are required.
4. **Implement the rule**:
   - Azure Hosted JSON file: add the JSON spec to `rules.json` in Blob Storage and bump `version`. No code change required.
   - Dataverse Entity: create or update the rule definition record in the appropriate Dataverse entity. No code change required.
   - Code: add a new `.ts` file in the appropriate `src/engine/rulePacks/<category>/` folder and add one import line to `src/engine/rulePacks/index.ts`.
5. **Write a unit test** in `src/engine/rulePacks/__tests__/<category>/` covering at minimum: a passing case, a failing case, and one known false-positive scenario.
6. **Update the summary table** in `RULES.md`.
7. Submit a PR with this file, the implementation, and the test. No PR without all three.

---

## Rule retirement process

Rules become obsolete when Microsoft adds native coverage for the same finding (e.g. Solution Checker adds a new rule, PPAC adds a built-in governance check). To retire a rule:

1. Mark the rule entry here with `**Status:** Retired — <date> — <reason>`.
2. Remove the rule from `rules.json` (declarative) or from `index.ts` (code), and archive the implementation file to `src/engine/rulePacks/_retired/`.
3. Add a `CHANGELOG.md` entry.
4. Do not delete the rule entry from this file — the history should be preserved for environments that may have suppressed the rule in their baseline and need to understand what it covered.
