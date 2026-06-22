# Solution Health Checker — Rule Catalog

**Repository:** `aidevme/pptb-solution-health-checker`
**Companion doc:** `ARCHITECTURE.md`
**Status:** Design draft — catalog of rules planned across code rules and declarative (Azure-sourced) rules

---

## 1. How to read this document

- **Part 2** is a scannable summary table of every rule: ID, category, severity, source type, one-line purpose.
- **Part 3** gives the full detail for every rule — description, rationale, recommendation, and (for declarative rules) the JSON DSL spec as defined in `ARCHITECTURE.md` §4.1.
- **Source type** column:
  - `Code` — bundled TypeScript, ships with the app, needed for multi-query/branching logic
  - `Declarative` — JSON spec fetched from Azure, editable without an app update
- **Severity**: `fail` (governance violation, should block sign-off), `warn` (worth investigating), `info` (observational, no action implied by default)

ID format: `<CATEGORY>-<SUBTOPIC>-<NNN>`

---

## 2. Summary table

### Schema & Data

| ID | Title | Severity | Source |
|---|---|---|---|
| SCH-IDX-001 | Missing index on frequently filtered column | warn | Code |
| SCH-OPT-002 | Choice (option set) sprawl | warn | Declarative |
| SCH-OPT-003 | Duplicate global choices | warn | Code |
| SCH-COL-004 | Orphaned/unused column (near-zero population) | info | Declarative |
| SCH-NN-005 | Unbounded N:N intersect table growth | warn | Declarative |
| SCH-AUDIT-006 | Audit log growth rate vs. retention policy | warn | Declarative |
| SCH-LOOKUP-007 | Excessive lookup columns on one table | info | Declarative |
| SCH-DESC-008 | Missing display name or description on custom table | info | Declarative |
| SCH-PREFIX-009 | Component not using publisher prefix convention | warn | Declarative |
| SCH-CASCADE-010 | Cascade delete configured on a high-volume relationship | warn | Code |

### Plugins & Server-Side Logic

| ID | Title | Severity | Source |
|---|---|---|---|
| PLG-SYNC-001 | Synchronous plugin registered on high-volume message | warn | Declarative |
| PLG-DUP-002 | Duplicate plugin step registrations on same message/entity | warn | Code |
| PLG-BROAD-003 | Plugin registered on every message (overly broad trigger) | warn | Declarative |
| PLG-IMG-004 | Plugin step missing pre/post image where referenced in code | info | Code |
| PLG-RETRY-005 | Plugin with no exception handling pattern detected | warn | Code |

### Power Automate (Flows)

| ID | Title | Severity | Source |
|---|---|---|---|
| FLOW-OWN-001 | Flow owned by individual user, not service/app account | fail | Declarative |
| FLOW-ERR-002 | Flow with no configured error handling (run-after) | warn | Code |
| FLOW-API-003 | Flow approaching API request entitlement limit | warn | Declarative |
| FLOW-DIS-004 | Flow disabled or in failed state | warn | Declarative |
| FLOW-LOOP-005 | Dataverse action called in a loop instead of batch | warn | Code |
| FLOW-TRIG-006 | Recursive trigger-condition risk (same-table update loop) | fail | Code |
| FLOW-CONN-007 | Flow using a personal (non-shared) connection | warn | Declarative |

### Connection References & Environment Variables

| ID | Title | Severity | Source |
|---|---|---|---|
| ALM-CREF-001 | Connection reference pointing to hardcoded GUID | fail | Declarative |
| ALM-ENV-002 | Environment variable with no default value | fail | Declarative |
| ALM-SECRET-003 | Secret stored as plain-text environment variable | fail | Declarative |
| ALM-CREF-004 | Connection reference unused by any component | info | Declarative |

### ALM & Layering

| ID | Title | Severity | Source |
|---|---|---|---|
| ALM-LAYER-001 | Unmanaged layer present in non-DEV environment | fail | Declarative |
| ALM-LAYER-002 | Managed solution with components still actively customized | warn | Code |
| ALM-SEG-003 | Single oversized solution (no core/extension segmentation) | info | Declarative |
| ALM-DEP-004 | Missing or broken component dependency | fail | Code |
| ALM-PUB-005 | Default publisher used instead of custom publisher | warn | Declarative |

### Security Model

| ID | Title | Severity | Source |
|---|---|---|---|
| SEC-ADMIN-001 | Excessive System Administrators | warn | Declarative |
| SEC-TEAM-002 | Ad hoc (non-AAD-backed) team sprawl | info | Declarative |
| SEC-ROLE-003 | Security role with org-wide read/write on sensitive table | warn | Declarative |
| SEC-FLS-004 | Field security profile defined but assigned to nobody | info | Declarative |
| SEC-BU-005 | Sharing used in place of business unit structure | info | Code |

### Capacity & Governance

| ID | Title | Severity | Source |
|---|---|---|---|
| CAP-API-001 | API entitlement consumption trending toward cap | warn | Declarative |
| CAP-STORE-002 | Database storage capacity trending toward allocation | warn | Declarative |
| CAP-DLP-003 | DLP policy mixing Business and Non-Business connectors | fail | Declarative |
| CAP-FILE-004 | File storage capacity trending toward allocation | info | Declarative |

### JavaScript Web Resources

Rules in this group scan the content and metadata of JavaScript web resources. `JS-SEC-*` and `JS-COMPAT-*` rules operate by decoding each resource's Base64 content from `webresourceset` and applying regex/heuristic analysis. `JS-PERF-*` and `JS-ALM-*` rules combine metadata queries with content checks or form XML inspection. `JS-QUAL-*` rules flag code quality anti-patterns that correlate with silent production failures.

| ID | Title | Severity | Source |
|---|---|---|---|
| JS-SEC-001 | `eval()` or dynamic code execution | fail | Code |
| JS-SEC-002 | Hardcoded credentials or secrets | fail | Code |
| JS-SEC-003 | `innerHTML` with non-literal value (XSS risk) | warn | Code |
| JS-SEC-004 | Cross-frame `parent.Xrm` access | warn | Code |
| JS-COMPAT-001 | Deprecated `Xrm.Page` API | warn | Code |
| JS-COMPAT-002 | Deprecated `Xrm.Utility` navigation methods | warn | Code |
| JS-COMPAT-003 | Synchronous XMLHttpRequest | warn | Code |
| JS-COMPAT-004 | `document.getElementById` for form field access | info | Code |
| JS-PERF-001 | Blocking synchronous operation in `OnLoad` handler | warn | Code |
| JS-PERF-002 | Unminified JavaScript web resource over 50 KB | info | Declarative |
| JS-PERF-003 | Excessive JavaScript web resources on one form | info | Declarative |
| JS-ALM-001 | Hardcoded GUIDs in web resource source | warn | Code |
| JS-ALM-002 | Hardcoded organisation URL in web resource source | warn | Code |
| JS-ALM-003 | Missing error handling around async operations | warn | Code |
| JS-ALM-004 | Global namespace pollution (no IIFE or namespace wrapper) | warn | Code |
| JS-ALM-005 | JavaScript web resource not included in any solution | info | Declarative |
| JS-QUAL-001 | Missing `'use strict'` directive | info | Code |
| JS-QUAL-002 | `console.log` / `console.debug` left in production | info | Code |
| JS-QUAL-003 | Implicit global variable assignment | warn | Code |

---

## 3. Detailed rule specifications

### 3.1 Schema & Data

#### SCH-IDX-001 — Missing index on frequently filtered column
- **Category:** schema · **Severity:** warn · **Source:** Code (requires execution-plan inspection, not expressible as a single query/threshold)
- **Description:** Flags columns used as filter criteria in views/queries that have no supporting index, based on sampled FetchXML usage patterns.
- **Recommendation:** Add an index via the table's Keys configuration, or reconsider the filter design if the column is low-selectivity.

#### SCH-OPT-002 — Choice (option set) sprawl
- **Category:** schema · **Severity:** warn · **Source:** Declarative
- **Description:** Flags choice columns with an excessive number of options, which usually indicates the column should be a lookup to a configuration table instead.
```json
{
  "id": "SCH-OPT-002",
  "category": "schema",
  "queries": {
    "choices": { "type": "metadata", "entitySet": "GlobalOptionSetDefinitions", "template": "" }
  },
  "evaluate": {
    "op": "gt",
    "left": { "op": "count", "var": "queries.choices" },
    "right": { "var": "config.maxChoiceOptions", "default": 50 }
  },
  "message": "Choice set exceeds {{threshold}} options ({{count}} found).",
  "recommendation": "Consider replacing with a lookup to a configuration/reference table."
}
```

#### SCH-OPT-003 — Duplicate global choices
- **Category:** schema · **Severity:** warn · **Source:** Code (requires cross-comparison of option sets by content, not a single query)
- **Description:** Detects two or more global choice sets with near-identical option lists, suggesting consolidation is overdue.
- **Recommendation:** Merge into a single global choice and repoint consuming columns.

#### SCH-COL-004 — Orphaned/unused column
- **Category:** schema · **Severity:** info · **Source:** Declarative
- **Description:** Flags columns with population below a threshold across a representative sample of records.
```json
{
  "id": "SCH-COL-004",
  "category": "schema",
  "queries": {
    "populated": { "type": "fetchXml", "entitySet": "{{config.tableName}}", "template": "<fetch aggregate='true'><entity name='{{config.tableName}}'><attribute name='{{config.columnName}}' aggregate='countcolumn' alias='c'/></entity></fetch>" },
    "total": { "type": "fetchXml", "entitySet": "{{config.tableName}}", "template": "<fetch aggregate='true'><entity name='{{config.tableName}}'><attribute name='{{config.columnName}}' aggregate='count' alias='c'/></entity></fetch>" }
  },
  "evaluate": {
    "op": "lt",
    "left": { "var": "queries.populated.c" },
    "right": { "op": "literal", "value": { "op": "mul", "left": { "var": "queries.total.c" }, "right": 0.01 } }
  },
  "message": "Column '{{config.columnName}}' is populated in under 1% of records.",
  "recommendation": "Confirm the column is still required; consider removal if obsolete."
}
```

#### SCH-NN-005 — Unbounded N:N intersect table growth
- **Category:** schema · **Severity:** warn · **Source:** Declarative
- **Description:** Flags many-to-many relationship intersect tables growing without an apparent cleanup/archival strategy.
```json
{
  "id": "SCH-NN-005",
  "category": "schema",
  "queries": {
    "intersect": { "type": "fetchXml", "entitySet": "{{config.intersectEntity}}", "template": "<fetch aggregate='true'><entity name='{{config.intersectEntity}}'><attribute name='{{config.intersectEntity}}id' aggregate='count' alias='c'/></entity></fetch>" }
  },
  "evaluate": { "op": "gt", "left": { "var": "queries.intersect.c" }, "right": { "var": "config.maxIntersectRows", "default": 500000 } },
  "message": "Intersect table has {{count}} rows, exceeding the recommended {{threshold}}.",
  "recommendation": "Introduce archival or pruning for stale relationship records."
}
```

#### SCH-AUDIT-006 — Audit log growth rate vs. retention policy
- **Category:** schema · **Severity:** warn · **Source:** Declarative
- **Description:** Compares recent audit log volume against configured retention settings to flag silent storage cost growth.
```json
{
  "id": "SCH-AUDIT-006",
  "category": "schema",
  "queries": {
    "auditCount": { "type": "fetchXml", "entitySet": "audit", "template": "<fetch aggregate='true'><entity name='audit'><attribute name='auditid' aggregate='count' alias='c'/><filter><condition attribute='createdon' operator='last-x-days' value='30'/></filter></entity></fetch>" }
  },
  "evaluate": { "op": "gt", "left": { "var": "queries.auditCount.c" }, "right": { "var": "config.maxMonthlyAuditRows", "default": 1000000 } },
  "message": "{{count}} audit records created in the last 30 days, exceeding {{threshold}}.",
  "recommendation": "Review audited tables/columns and retention policy; disable auditing on low-value tables."
}
```

#### SCH-LOOKUP-007 — Excessive lookup columns on one table
- **Category:** schema · **Severity:** info · **Source:** Declarative
- **Description:** Flags tables with an unusually high count of lookup columns, often a sign of denormalization debt.
```json
{
  "id": "SCH-LOOKUP-007",
  "category": "schema",
  "queries": {
    "lookups": { "type": "metadata", "entitySet": "{{config.tableName}}/Attributes", "template": "$filter=AttributeType eq 'Lookup'" }
  },
  "evaluate": { "op": "gt", "left": { "op": "count", "var": "queries.lookups" }, "right": { "var": "config.maxLookups", "default": 20 } },
  "message": "Table '{{config.tableName}}' has {{count}} lookup columns (recommended max: {{threshold}}).",
  "recommendation": "Review whether some lookups can be consolidated or moved to a related table."
}
```

#### SCH-DESC-008 — Missing display name or description
- **Category:** schema · **Severity:** info · **Source:** Declarative
- **Description:** Flags custom tables/columns missing a description, which hampers maintainability for future team members.
```json
{
  "id": "SCH-DESC-008",
  "category": "schema",
  "queries": {
    "table": { "type": "metadata", "entitySet": "EntityDefinitions({{config.tableLogicalName}})", "template": "$select=Description" }
  },
  "evaluate": { "op": "eq", "left": { "var": "queries.table.Description.UserLocalizedLabel.Label" }, "right": { "op": "literal", "value": null } },
  "message": "Table '{{config.tableLogicalName}}' has no description set.",
  "recommendation": "Add a description summarizing the table's purpose for future maintainers."
}
```

#### SCH-PREFIX-009 — Publisher prefix convention violation
- **Category:** schema · **Severity:** warn · **Source:** Declarative
- **Description:** Flags components whose logical name does not use the expected publisher prefix.
```json
{
  "id": "SCH-PREFIX-009",
  "category": "schema",
  "queries": {
    "table": { "type": "metadata", "entitySet": "EntityDefinitions({{config.tableLogicalName}})", "template": "$select=LogicalName" }
  },
  "evaluate": {
    "op": "eq",
    "left": { "op": "startswith", "var": "queries.table.LogicalName", "value": { "var": "config.expectedPrefix" } },
    "right": { "op": "literal", "value": false }
  },
  "message": "Table '{{config.tableLogicalName}}' does not use the expected prefix '{{config.expectedPrefix}}'.",
  "recommendation": "Rename or re-publish using the organization's agreed publisher prefix."
}
```

#### SCH-CASCADE-010 — Cascade delete on high-volume relationship
- **Category:** schema · **Severity:** warn · **Source:** Code (requires relationship metadata + row-count correlation)
- **Description:** Flags 1:N relationships configured with cascading delete where the child table has high record volume — a common cause of long-running, failing delete operations.
- **Recommendation:** Change cascade behavior to "Remove Link" or "Restrict" unless cascading delete is a deliberate design choice.

---

### 3.2 Plugins & Server-Side Logic

#### PLG-SYNC-001 — Synchronous plugin on high-volume message
- **Category:** flow · **Severity:** warn · **Source:** Declarative
- **Description:** Flags synchronous plugin steps registered on Create/Update for tables with high transaction volume, a common latency cause.
```json
{
  "id": "PLG-SYNC-001",
  "category": "flow",
  "queries": {
    "steps": { "type": "fetchXml", "entitySet": "sdkmessageprocessingsteps", "template": "<fetch><entity name='sdkmessageprocessingstep'><filter><condition attribute='mode' operator='eq' value='0'/><condition attribute='primaryentityname' operator='eq' value='{{config.tableName}}'/></filter></entity></fetch>" },
    "volume": { "type": "fetchXml", "entitySet": "{{config.tableName}}", "template": "<fetch aggregate='true'><entity name='{{config.tableName}}'><attribute name='{{config.tableName}}id' aggregate='count' alias='c'/><filter><condition attribute='createdon' operator='last-x-days' value='7'/></filter></entity></fetch>" }
  },
  "evaluate": {
    "op": "and",
    "args": [
      { "op": "gt", "left": { "op": "count", "var": "queries.steps" }, "right": 0 },
      { "op": "gt", "left": { "var": "queries.volume.c" }, "right": { "var": "config.highVolumeThreshold", "default": 10000 } }
    ]
  },
  "message": "Synchronous plugin step(s) on high-volume table '{{config.tableName}}' ({{queries.volume.c}} records/7d).",
  "recommendation": "Consider moving non-blocking logic to an asynchronous step."
}
```

#### PLG-DUP-002 — Duplicate plugin step registrations
- **Category:** flow · **Severity:** warn · **Source:** Code (cross-step comparison)
- **Description:** Flags multiple plugin steps registered on the identical message/entity/stage combination, where one consolidated step would suffice.
- **Recommendation:** Consolidate logic into a single step to reduce execution overhead and ordering ambiguity.

#### PLG-BROAD-003 — Plugin registered on every message
- **Category:** flow · **Severity:** warn · **Source:** Declarative
- **Description:** Flags plugin assemblies registered against an unusually broad set of messages, suggesting an overly generic trigger design.
```json
{
  "id": "PLG-BROAD-003",
  "category": "flow",
  "queries": {
    "steps": { "type": "fetchXml", "entitySet": "sdkmessageprocessingsteps", "template": "<fetch distinct='true'><entity name='sdkmessageprocessingstep'><attribute name='sdkmessageid'/><filter><condition attribute='plugintypeid' operator='eq' value='{{config.pluginTypeId}}'/></filter></entity></fetch>" }
  },
  "evaluate": { "op": "gt", "left": { "op": "count", "var": "queries.steps" }, "right": { "var": "config.maxMessagesPerPlugin", "default": 5 } },
  "message": "Plugin type registered against {{count}} distinct messages (recommended max: {{threshold}}).",
  "recommendation": "Split into message-specific plugin types for clarity and easier maintenance."
}
```

#### PLG-IMG-004 — Missing pre/post image
- **Category:** flow · **Severity:** info · **Source:** Code (requires correlating step config against referenced image usage in assembly metadata)
- **Description:** Flags plugin steps where code appears to reference pre/post image data but no image is registered on the step.
- **Recommendation:** Register the appropriate entity image, or confirm the reference is dead code.

#### PLG-RETRY-005 — No exception handling pattern
- **Category:** flow · **Severity:** warn · **Source:** Code (structural inspection of step configuration, not a single FetchXML query)
- **Description:** Flags plugin steps with no apparent exception-handling or `InvalidPluginExecutionException` usage pattern based on registered configuration metadata.
- **Recommendation:** Wrap business logic in try/catch and surface meaningful error messages to the calling context.

---

### 3.3 Power Automate (Flows)

#### FLOW-OWN-001 — Flow owned by individual user
- **Category:** flow · **Severity:** fail · **Source:** Declarative
- **Description:** Flags flows owned by a named user account rather than a service/application account — a single point of failure on offboarding.
```json
{
  "id": "FLOW-OWN-001",
  "category": "flow",
  "queries": {
    "flows": { "type": "fetchXml", "entitySet": "workflows", "template": "<fetch><entity name='workflow'><attribute name='ownerid'/><filter><condition attribute='category' operator='eq' value='5'/></filter><link-entity name='systemuser' from='systemuserid' to='ownerid'><filter><condition attribute='applicationid' operator='null'/></filter></link-entity></entity></fetch>" }
  },
  "evaluate": { "op": "gt", "left": { "op": "count", "var": "queries.flows" }, "right": 0 },
  "message": "{{count}} cloud flow(s) owned by an individual user account.",
  "recommendation": "Transfer ownership to a service/application account before the owner leaves the organization."
}
```

#### FLOW-ERR-002 — No configured error handling
- **Category:** flow · **Severity:** warn · **Source:** Code (requires inspecting flow JSON definition's `runAfter` configuration)
- **Description:** Flags flows where no action has a configured "Configure run after" failure/timeout path.
- **Recommendation:** Add error-handling branches (e.g. `Failed`/`Skipped`/`TimedOut`) to critical actions, with notification or logging on failure.

#### FLOW-API-003 — Approaching API request limit
- **Category:** capacity · **Severity:** warn · **Source:** Declarative
- **Description:** Estimates a flow's daily API consumption against the per-user/environment entitlement.
```json
{
  "id": "FLOW-API-003",
  "category": "flow",
  "queries": {
    "runs": { "type": "fetchXml", "entitySet": "flowruns", "template": "<fetch aggregate='true'><entity name='flowrun'><attribute name='flowrunid' aggregate='count' alias='c'/><filter><condition attribute='createdon' operator='last-x-days' value='1'/></filter></entity></fetch>" }
  },
  "evaluate": { "op": "gt", "left": { "var": "queries.runs.c" }, "right": { "var": "config.dailyRunWarningThreshold", "default": 5000 } },
  "message": "{{count}} flow runs in the last 24 hours, approaching the API entitlement threshold.",
  "recommendation": "Review trigger frequency and batch actions where possible."
}
```

#### FLOW-DIS-004 — Flow disabled or failed
- **Category:** flow · **Severity:** warn · **Source:** Declarative
- **Description:** Flags flows currently in a disabled (suspended) or failed state.
```json
{
  "id": "FLOW-DIS-004",
  "category": "flow",
  "queries": {
    "flows": { "type": "fetchXml", "entitySet": "workflows", "template": "<fetch><entity name='workflow'><filter><condition attribute='category' operator='eq' value='5'/><condition attribute='statecode' operator='eq' value='0'/><condition attribute='statuscode' operator='eq' value='2'/></filter></entity></fetch>" }
  },
  "evaluate": { "op": "gt", "left": { "op": "count", "var": "queries.flows" }, "right": 0 },
  "message": "{{count}} cloud flow(s) found in a suspended state.",
  "recommendation": "Investigate the suspension cause (often repeated failures) and re-enable or retire the flow."
}
```

#### FLOW-LOOP-005 — Dataverse action in a loop instead of batch
- **Category:** flow · **Severity:** warn · **Source:** Code (requires parsing flow JSON for Apply-to-each containing Dataverse connector actions)
- **Description:** Flags flows performing per-item Dataverse Create/Update/Delete inside a loop instead of using a `ChangeSet`/batch request.
- **Recommendation:** Use a batch (`$batch`) request or the Dataverse "Perform a bound/unbound action" with a list payload where supported.

#### FLOW-TRIG-006 — Recursive trigger-condition risk
- **Category:** flow · **Severity:** fail · **Source:** Code (requires comparing trigger table/fields against the flow's own update actions)
- **Description:** Flags flows that update the same table/field they are triggered on, without a trigger condition guarding against infinite recursion.
- **Recommendation:** Add a trigger condition (e.g. checking a status field) or use the "Update a row" action's `IfMatch` pattern to break the loop.

#### FLOW-CONN-007 — Personal (non-shared) connection in use
- **Category:** flow · **Severity:** warn · **Source:** Declarative
- **Description:** Flags flows using a connector connection that is not a shared/environment-level connection.
```json
{
  "id": "FLOW-CONN-007",
  "category": "flow",
  "queries": {
    "connRefs": { "type": "fetchXml", "entitySet": "connectionreferences", "template": "<fetch><entity name='connectionreference'><filter><condition attribute='connectionreferenceid' operator='not-null'/></filter></entity></fetch>" }
  },
  "evaluate": { "op": "eq", "left": { "var": "queries.connRefs.iscustomizable.Value" }, "right": { "op": "literal", "value": false } },
  "message": "Connection reference is not customizable/shared at the environment level.",
  "recommendation": "Reconfigure to use a shared connection owned by a service account."
}
```

---

### 3.4 Connection References & Environment Variables

#### ALM-CREF-001 — Hardcoded connection reference
- **Category:** alm · **Severity:** fail · **Source:** Declarative
- **Description:** Flags components referencing a hardcoded connection GUID instead of a parameterized connection reference.
```json
{
  "id": "ALM-CREF-001",
  "category": "alm",
  "queries": {
    "flows": { "type": "fetchXml", "entitySet": "workflows", "template": "<fetch><entity name='workflow'><attribute name='clientdata'/><filter><condition attribute='category' operator='eq' value='5'/></filter></entity></fetch>" }
  },
  "evaluate": { "op": "contains", "left": { "var": "queries.flows.clientdata" }, "right": { "op": "literal", "value": "/providers/Microsoft.PowerApps/apis/" } },
  "message": "Flow definition appears to reference a connection directly rather than via a connection reference.",
  "recommendation": "Replace inline connection references with a solution-aware connection reference component."
}
```

#### ALM-ENV-002 — Environment variable missing default value
- **Category:** alm · **Severity:** fail · **Source:** Declarative
- **Description:** Flags environment variable definitions with no default value, which breaks unmanaged-to-managed deployment.
```json
{
  "id": "ALM-ENV-002",
  "category": "alm",
  "queries": {
    "envVars": { "type": "fetchXml", "entitySet": "environmentvariabledefinitions", "template": "<fetch><entity name='environmentvariabledefinition'><filter><condition attribute='defaultvalue' operator='null'/></filter></entity></fetch>" }
  },
  "evaluate": { "op": "gt", "left": { "op": "count", "var": "queries.envVars" }, "right": 0 },
  "message": "{{count}} environment variable(s) defined with no default value.",
  "recommendation": "Set a sensible default value, or document the required value in deployment instructions."
}
```

#### ALM-SECRET-003 — Secret stored as plain-text environment variable
- **Category:** alm · **Severity:** fail · **Source:** Declarative
- **Description:** Flags environment variables of type "String" whose name pattern suggests they hold a secret (e.g. contains "key", "secret", "password", "token").
```json
{
  "id": "ALM-SECRET-003",
  "category": "alm",
  "queries": {
    "envVars": { "type": "fetchXml", "entitySet": "environmentvariabledefinitions", "template": "<fetch><entity name='environmentvariabledefinition'><filter><condition attribute='type' operator='eq' value='100000000'/></filter></entity></fetch>" }
  },
  "evaluate": {
    "op": "or",
    "args": [
      { "op": "contains", "left": { "var": "queries.envVars.schemaname" }, "right": { "op": "literal", "value": "secret" } },
      { "op": "contains", "left": { "var": "queries.envVars.schemaname" }, "right": { "op": "literal", "value": "key" } },
      { "op": "contains", "left": { "var": "queries.envVars.schemaname" }, "right": { "op": "literal", "value": "password" } }
    ]
  },
  "message": "Environment variable '{{queries.envVars.schemaname}}' appears to store a secret as plain text.",
  "recommendation": "Use the Secret-type environment variable backed by Azure Key Vault instead."
}
```

#### ALM-CREF-004 — Unused connection reference
- **Category:** alm · **Severity:** info · **Source:** Declarative
- **Description:** Flags connection references present in a solution but not referenced by any flow or canvas app component.
```json
{
  "id": "ALM-CREF-004",
  "category": "alm",
  "queries": {
    "connRefs": { "type": "fetchXml", "entitySet": "connectionreferences", "template": "<fetch><entity name='connectionreference'/></fetch>" }
  },
  "evaluate": { "op": "eq", "left": { "var": "queries.connRefs.usagecount" }, "right": 0 },
  "message": "Connection reference '{{queries.connRefs.connectionreferencedisplayname}}' is not used by any known component.",
  "recommendation": "Remove the unused connection reference to reduce solution clutter."
}
```

---

### 3.5 ALM & Layering

#### ALM-LAYER-001 — Unmanaged layer in non-DEV environment
- **Category:** alm · **Severity:** fail · **Source:** Declarative
- **Description:** Flags the presence of unmanaged customization layers in any environment not designated as DEV — the single most common real-world ALM failure.
```json
{
  "id": "ALM-LAYER-001",
  "category": "alm",
  "queries": {
    "solutions": { "type": "fetchXml", "entitySet": "solutions", "template": "<fetch><entity name='solution'><filter><condition attribute='ismanaged' operator='eq' value='0'/><condition attribute='isvisible' operator='eq' value='1'/></filter></entity></fetch>" }
  },
  "evaluate": {
    "op": "and",
    "args": [
      { "op": "gt", "left": { "op": "count", "var": "queries.solutions" }, "right": 1 },
      { "op": "eq", "left": { "var": "config.environmentType" }, "right": { "op": "literal", "value": "production" } }
    ]
  },
  "message": "Unmanaged solution layer(s) detected in a production environment.",
  "recommendation": "Move unmanaged customizations into source control and deploy via a managed solution pipeline."
}
```

#### ALM-LAYER-002 — Managed solution still actively customized
- **Category:** alm · **Severity:** warn · **Source:** Code (requires diffing managed layer state against unmanaged override presence per component)
- **Description:** Flags managed solution components that have an active unmanaged layer on top — a guaranteed layering conflict on the next import.
- **Recommendation:** Reconcile and remove the unmanaged override before the next solution upgrade.

#### ALM-SEG-003 — Single oversized solution
- **Category:** alm · **Severity:** info · **Source:** Declarative
- **Description:** Flags solutions exceeding a component-count threshold, suggesting a core/extension segmentation pattern is overdue.
```json
{
  "id": "ALM-SEG-003",
  "category": "alm",
  "queries": {
    "components": { "type": "fetchXml", "entitySet": "solutioncomponents", "template": "<fetch aggregate='true'><entity name='solutioncomponent'><attribute name='solutioncomponentid' aggregate='count' alias='c'/><filter><condition attribute='solutionid' operator='eq' value='{{config.solutionId}}'/></filter></entity></fetch>" }
  },
  "evaluate": { "op": "gt", "left": { "var": "queries.components.c" }, "right": { "var": "config.maxComponentsPerSolution", "default": 500 } },
  "message": "Solution contains {{count}} components, exceeding the recommended {{threshold}}.",
  "recommendation": "Split into a core solution plus feature-specific extension solutions."
}
```

#### ALM-DEP-004 — Missing or broken component dependency
- **Category:** alm · **Severity:** fail · **Source:** Code (requires dependency graph traversal, not a single query)
- **Description:** Flags components with a declared dependency that cannot be resolved within the target environment.
- **Recommendation:** Add the missing dependency to the solution, or remove the dependent reference.

#### ALM-PUB-005 — Default publisher used
- **Category:** alm · **Severity:** warn · **Source:** Declarative
- **Description:** Flags solutions still using the default/unbranded publisher rather than a custom organizational publisher.
```json
{
  "id": "ALM-PUB-005",
  "category": "alm",
  "queries": {
    "publisher": { "type": "fetchXml", "entitySet": "publishers", "template": "<fetch><entity name='publisher'><filter><condition attribute='uniquename' operator='eq' value='{{config.solutionPublisherUniqueName}}'/></filter></entity></fetch>" }
  },
  "evaluate": { "op": "eq", "left": { "var": "queries.publisher.uniquename" }, "right": { "op": "literal", "value": "MicrosoftCorporation" } },
  "message": "Solution uses the default Microsoft publisher rather than a custom one.",
  "recommendation": "Create and apply a custom publisher with an agreed prefix before further development."
}
```

---

### 3.6 Security Model

#### SEC-ADMIN-001 — Excessive System Administrators
- **Category:** security · **Severity:** warn · **Source:** Declarative — *(full example shown in `ARCHITECTURE.md` §4.1)*
- **Description:** Flags environments with more System Administrator role holders than recommended.
```json
{
  "id": "SEC-ADMIN-001",
  "category": "security",
  "queries": {
    "admins": { "type": "fetchXml", "entitySet": "systemusers", "template": "<fetch><entity name='systemuser'><link-entity name='systemuserroles' from='systemuserid' to='systemuserid'><link-entity name='role' from='roleid' to='roleid'><filter><condition attribute='name' operator='eq' value='System Administrator'/></filter></link-entity></link-entity></entity></fetch>" }
  },
  "evaluate": { "op": "gt", "left": { "op": "count", "var": "queries.admins" }, "right": { "var": "config.maxSysAdmins", "default": 5 } },
  "message": "{{count}} users hold System Administrator (recommended max: {{threshold}}).",
  "recommendation": "Move non-essential admins to a custom role with scoped privileges."
}
```

#### SEC-TEAM-002 — Ad hoc team sprawl
- **Category:** security · **Severity:** info · **Source:** Declarative
- **Description:** Flags a high count of owner teams not backed by an Azure AD security group, indicating manual/ungoverned team creation.
```json
{
  "id": "SEC-TEAM-002",
  "category": "security",
  "queries": {
    "teams": { "type": "fetchXml", "entitySet": "teams", "template": "<fetch><entity name='team'><filter><condition attribute='teamtype' operator='eq' value='0'/><condition attribute='azureactivedirectoryobjectid' operator='null'/></filter></entity></fetch>" }
  },
  "evaluate": { "op": "gt", "left": { "op": "count", "var": "queries.teams" }, "right": { "var": "config.maxAdHocTeams", "default": 15 } },
  "message": "{{count}} owner teams exist without an Azure AD group backing them.",
  "recommendation": "Standardize on AAD-group-backed teams for easier lifecycle management."
}
```

#### SEC-ROLE-003 — Security role with org-wide access on sensitive table
- **Category:** security · **Severity:** warn · **Source:** Declarative
- **Description:** Flags security roles granting Organization-level read/write privilege on tables marked as sensitive in config.
```json
{
  "id": "SEC-ROLE-003",
  "category": "security",
  "queries": {
    "privileges": { "type": "fetchXml", "entitySet": "roleprivileges", "template": "<fetch><entity name='roleprivileges'><filter><condition attribute='privilegedepthmask' operator='eq' value='8'/></filter><link-entity name='privilege' from='privilegeid' to='privilegeid'><filter><condition attribute='name' operator='in'>{{config.sensitiveTablePrivilegeNames}}</condition></filter></link-entity></entity></fetch>" }
  },
  "evaluate": { "op": "gt", "left": { "op": "count", "var": "queries.privileges" }, "right": 0 },
  "message": "{{count}} role(s) grant organization-wide access to a sensitive table.",
  "recommendation": "Scope the privilege depth down to Business Unit or User level unless org-wide access is a deliberate requirement."
}
```

#### SEC-FLS-004 — Unassigned field security profile
- **Category:** security · **Severity:** info · **Source:** Declarative
- **Description:** Flags field security profiles that exist but have no team or user assigned, meaning the intended restriction is not actually enforced.
```json
{
  "id": "SEC-FLS-004",
  "category": "security",
  "queries": {
    "profiles": { "type": "fetchXml", "entitySet": "fieldsecurityprofiles", "template": "<fetch><entity name='fieldsecurityprofile'><link-entity name='teamprofiles_association' from='fieldsecurityprofileid' to='fieldsecurityprofileid' link-type='outer'/><link-entity name='systemuserprofiles_association' from='fieldsecurityprofileid' to='fieldsecurityprofileid' link-type='outer'/></entity></fetch>" }
  },
  "evaluate": { "op": "eq", "left": { "var": "queries.profiles.assignmentcount" }, "right": 0 },
  "message": "Field security profile '{{queries.profiles.name}}' has no team or user assigned.",
  "recommendation": "Assign the profile to the intended team/users, or remove it if no longer needed."
}
```

#### SEC-BU-005 — Sharing used instead of business unit structure
- **Category:** security · **Severity:** info · **Source:** Code (requires correlating share record volume against business unit hierarchy depth)
- **Description:** Flags environments with a high volume of explicit record-sharing relative to a shallow business unit hierarchy, suggesting BU structure isn't being leveraged for access control.
- **Recommendation:** Review whether a deeper business unit hierarchy with role-based access would reduce reliance on manual sharing.

---

### 3.7 Capacity & Governance

#### CAP-API-001 — API entitlement trending toward cap
- **Category:** capacity · **Severity:** warn · **Source:** Declarative
- **Description:** Flags tenant/environment API request consumption trending toward the licensed entitlement.
```json
{
  "id": "CAP-API-001",
  "category": "capacity",
  "queries": {
    "usage": { "type": "odata", "entitySet": "RetrieveCurrentOrganizationApiUsage", "template": "" }
  },
  "evaluate": { "op": "gt", "left": { "var": "queries.usage.PercentOfEntitlement" }, "right": { "var": "config.apiUsageWarningPercent", "default": 80 } },
  "message": "API usage is at {{value}}% of entitlement (warning threshold: {{threshold}}%).",
  "recommendation": "Review high-volume flows/integrations and consider request batching."
}
```

#### CAP-STORE-002 — Database storage trending toward allocation
- **Category:** capacity · **Severity:** warn · **Source:** Declarative
- **Description:** Flags database capacity consumption trending toward the allocated limit.
```json
{
  "id": "CAP-STORE-002",
  "category": "capacity",
  "queries": {
    "capacity": { "type": "odata", "entitySet": "RetrieveCurrentOrganizationCapacity", "template": "" }
  },
  "evaluate": { "op": "gt", "left": { "var": "queries.capacity.DatabaseCapacity.PercentUsed" }, "right": { "var": "config.dbStorageWarningPercent", "default": 80 } },
  "message": "Database storage at {{value}}% of allocated capacity.",
  "recommendation": "Archive or purge stale data; consider add-on capacity if growth is expected to continue."
}
```

#### CAP-DLP-003 — DLP policy mixing Business and Non-Business connectors
- **Category:** capacity · **Severity:** fail · **Source:** Declarative
- **Description:** Flags Data Loss Prevention policies that place high-risk connectors in the same group as Business-classified connectors, defeating the segregation's purpose.
```json
{
  "id": "CAP-DLP-003",
  "category": "capacity",
  "queries": {
    "policies": { "type": "odata", "entitySet": "dlpPolicies", "template": "" }
  },
  "evaluate": {
    "op": "and",
    "args": [
      { "op": "gt", "left": { "op": "count", "var": "queries.policies.businessConnectors" }, "right": 0 },
      { "op": "gt", "left": { "op": "count", "var": "queries.policies.nonBusinessConnectors" }, "right": 0 }
    ]
  },
  "message": "DLP policy '{{queries.policies.displayName}}' mixes Business and Non-Business connectors.",
  "recommendation": "Move connectors into properly segregated Business/Non-Business/Blocked groups."
}
```

#### CAP-FILE-004 — File storage trending toward allocation
- **Category:** capacity · **Severity:** info · **Source:** Declarative
- **Description:** Flags file/attachment storage consumption trending toward the allocated limit.
```json
{
  "id": "CAP-FILE-004",
  "category": "capacity",
  "queries": {
    "capacity": { "type": "odata", "entitySet": "RetrieveCurrentOrganizationCapacity", "template": "" }
  },
  "evaluate": { "op": "gt", "left": { "var": "queries.capacity.FileCapacity.PercentUsed" }, "right": { "var": "config.fileStorageWarningPercent", "default": 80 } },
  "message": "File storage at {{value}}% of allocated capacity.",
  "recommendation": "Review large attachments; consider SharePoint integration for document-heavy tables."
}
```

---

### 3.8 JavaScript Web Resources

Web resource content is stored as Base64 in the `content` column of `webresourceset`. The engine fetches and decodes each JS resource once per run (filtered to `webresourcetype eq 3`), passes the string through all applicable `JS-*` code rules in a single pass, then discards it. Content is never written to settings or persisted between runs.

All pattern matches in this section are applied after stripping single-line comments (`//`) from each line to reduce false positives from commented-out code. Multi-line comment blocks (`/* … */`) are stripped from the entire string before scanning. String literals that contain a pattern but are clearly inert (e.g., `'do not use eval()'`) are excluded by requiring the pattern to appear as a callable or assignment, not as a string argument.

#### JS-SEC-001 — `eval()` or dynamic code execution
- **Category:** security · **Severity:** fail · **Source:** Code
- **Description:** Flags any call to `eval()`, `new Function(string)`, `setTimeout(string, …)`, or `setInterval(string, …)` — the four standard dynamic code-execution sinks — in JavaScript web resources belonging to the active solution.
- **Why:** `eval()` executes an arbitrary string as JavaScript inside the form's security context, which has live Dataverse access via the Xrm API. A compromised or MITM-injected web resource reaching `eval()` can exfiltrate data or call admin APIs without additional privilege escalation. Power Platform's CSP does not block `eval()` in web resources.
- **Detection patterns:**
  ```
  /\beval\s*\(/
  /new\s+Function\s*\(/
  /setTimeout\s*\(\s*['"`]/
  /setInterval\s*\(\s*['"`]/
  ```
- **Recommendation:** Replace with a deterministic code path. For dynamic dispatch, use a lookup object (`const handlers = { foo: fn1 }; handlers[key]()`). There is no legitimate use of `eval()` in production form scripts.
- **False positives:** Third-party minified bundles may contain `eval` inside a vendor shim. Suppress at the resource level after confirming the match is inside an inert or unreachable code path.

#### JS-SEC-002 — Hardcoded credentials or secrets
- **Category:** security · **Severity:** fail · **Source:** Code
- **Description:** Scans JavaScript web resource content for patterns resembling hardcoded secrets: API keys, SAS tokens, Azure AD client secrets, connection strings, or bearer token literals.
- **Why:** Web resources are readable by every licensed user via `webresourceset` OData and are extracted verbatim into solution export packages. A secret embedded in a web resource is effectively public within the tenant and will appear in version control on any export.
- **Detection patterns (case-insensitive):**
  ```
  /apiKey\s*[:=]\s*['"][A-Za-z0-9+/]{20,}/
  /SharedAccessSignature|sv=\d{4}-\d{2}-\d{2}&/
  /client[_-]?secret\s*[:=]\s*['"][^\s'"]{16,}/
  /Bearer\s+[A-Za-z0-9\-_]{20,}\.[A-Za-z0-9\-_]{20,}/
  /password\s*[:=]\s*['"][^'"]{8,}/i
  ```
  Findings emit a redacted excerpt (first 6 + last 4 characters of the matched value) — the full secret is never written to the findings output.
- **Recommendation:** Move secrets to Azure Key Vault and retrieve them at runtime from an Azure Function proxy. Browser-side code must never hold a live credential.
- **False positives:** Placeholder strings (`"YOUR_KEY_HERE"`, `"<api-key>"`). Suppress after confirming the value is non-functional.

#### JS-SEC-003 — `innerHTML` with non-literal value (XSS risk)
- **Category:** security · **Severity:** warn · **Source:** Code
- **Description:** Detects `.innerHTML =`, `.outerHTML =`, and `document.write(` patterns where the right-hand side is not a bare string literal — i.e., where user-controlled or Dataverse-sourced data could flow into DOM insertion.
- **Why:** Model-driven app forms render in a browser context. Unsanitised `innerHTML` assignments from field values are a stored XSS vector: an attacker who writes to a text field can execute arbitrary JavaScript in the context of any user who opens that record.
- **Detection patterns:**
  ```
  /\.innerHTML\s*=\s*(?!['"`])/
  /\.outerHTML\s*=\s*(?!['"`])/
  /document\.write\s*\(/
  ```
  Assignments to a bare string literal are downgraded to info.
- **Recommendation:** Use `textContent` for plain text. For structured HTML, use `createElement`/`appendChild` or a sanitisation library (DOMPurify). Never concatenate record field values into an HTML string.

#### JS-SEC-004 — Cross-frame `parent.Xrm` access
- **Category:** security · **Severity:** warn · **Source:** Code
- **Description:** Detects references to `parent.Xrm`, `window.parent.Xrm`, or `top.Xrm` in JavaScript web resources.
- **Why:** Cross-frame Xrm access bypasses the sandboxed execution context Unified Interface enforces, is explicitly unsupported by Microsoft, and will break silently in future platform updates. It also exposes a potential privilege-escalation path if a malicious iframe is injected into the same page hierarchy.
- **Detection patterns:**
  ```
  /\bparent\.Xrm\b/
  /\bwindow\.parent\.Xrm\b/
  /\btop\.Xrm\b/
  ```
- **Recommendation:** Use the `formContext` or `gridContext` parameter passed directly to the event handler, or the global `Xrm` object (available as a global in the Unified Interface web resource scope).
- **False positives:** None expected in production code. All findings should be treated as requiring remediation.

#### JS-COMPAT-001 — Deprecated `Xrm.Page` API
- **Category:** alm · **Severity:** warn · **Source:** Code
- **Description:** Flags references to `Xrm.Page` in JavaScript web resources. `Xrm.Page` was deprecated in Dynamics 365 v9.0 (2017) and is unsupported in the Unified Interface.
- **Why:** `Xrm.Page` is either `undefined` or returns stale data in Unified Interface. Code that references it fails silently or raises a JavaScript error, breaking form behaviour invisibly. Microsoft has confirmed it will not receive bug fixes.
- **Detection pattern:** `/\bXrm\.Page\b/`
- **Recommendation:** Replace `Xrm.Page.getAttribute('name')` with `formContext.getAttribute('name')`, using the `formContext` passed as the second argument to the event handler.
- **False positives:** Code that tests `typeof Xrm.Page !== 'undefined'` as a backward-compatibility guard. Downgrade to info if the usage is inside such a guard block.

#### JS-COMPAT-002 — Deprecated `Xrm.Utility` navigation methods
- **Category:** alm · **Severity:** warn · **Source:** Code
- **Description:** Flags calls to `Xrm.Utility.openEntityForm`, `Xrm.Utility.openWebResource`, and `Xrm.Utility.openQuickCreate` — deprecated in v9.0 in favour of the `Xrm.Navigation` namespace.
- **Why:** These methods are no-ops or throw errors in the Unified Interface and are not receiving bug fixes. Behaviour in future platform updates is undefined.
- **Detection patterns:**
  ```
  /\bXrm\.Utility\.openEntityForm\s*\(/
  /\bXrm\.Utility\.openWebResource\s*\(/
  /\bXrm\.Utility\.openQuickCreate\s*\(/
  ```
- **Recommendation:**

  | Deprecated | Replacement |
  |---|---|
  | `Xrm.Utility.openEntityForm` | `Xrm.Navigation.openForm` |
  | `Xrm.Utility.openWebResource` | `Xrm.Navigation.openWebResource` |
  | `Xrm.Utility.openQuickCreate` | `Xrm.Navigation.openForm` with `useQuickCreateForm: true` |

#### JS-COMPAT-003 — Synchronous XMLHttpRequest
- **Category:** alm · **Severity:** warn · **Source:** Code
- **Description:** Detects synchronous XHR calls (`xhr.open(method, url, false)`) in JavaScript web resources.
- **Why:** Synchronous XHR blocks the browser's main thread for the entire duration of the network call, freezing the form completely on slow or unavailable connections. The specification marks synchronous XHR (outside workers) for removal; browsers emit deprecation warnings. Microsoft's own FetchXML guidance prohibits synchronous calls in form scripts.
- **Detection pattern:** `/\.open\s*\(\s*['"][A-Z]+['"]\s*,\s*[^,]+,\s*false\s*\)/`
- **Recommendation:** Convert to async XHR (`open(method, url, true)`) or, preferably, to the `fetch` API with `async/await`. Mark the `OnLoad` handler as async and register it with the `isAsync` flag in the form designer.
- **False positives:** Test harnesses intentionally using synchronous XHR outside a browser runtime. Suppress at the resource level if the resource is explicitly a test fixture.

#### JS-COMPAT-004 — `document.getElementById` for form field access
- **Category:** alm · **Severity:** info · **Source:** Code
- **Description:** Detects `document.getElementById`, `document.querySelector`, or `document.getElementsByName` called inside web resources registered as form event handlers.
- **Why:** DOM element IDs for form controls are internal Unified Interface implementation details, not a public API. They change without notice between platform updates, causing code to break silently during upgrades.
- **Detection patterns:**
  ```
  /\bdocument\.getElementById\s*\(/
  /\bdocument\.querySelector\s*\(/
  /\bdocument\.getElementsByName\s*\(/
  ```
  Only flagged when the resource is registered as a form event handler (cross-referenced via form XML `<handler>` nodes).
- **Recommendation:** Replace with `formContext.getControl('logicalname')` for controls and `formContext.getAttribute('logicalname')` for attribute values.
- **False positives:** Web resources used as standalone full-page resources (not embedded on a form) legitimately use DOM APIs. The rule skips resources not registered as form handlers.

#### JS-PERF-001 — Blocking synchronous operation in `OnLoad` handler
- **Category:** alm · **Severity:** warn · **Source:** Code
- **Description:** Flags JavaScript web resources registered as form `OnLoad` handlers that contain synchronous blocking patterns: synchronous XHR (see `JS-COMPAT-003`), or `while` loops with non-constant conditions.
- **Why:** `OnLoad` fires before the form is visible to the user. Any blocking in this handler delays time-to-interactive. Microsoft's performance guidance requires `OnLoad` handlers to be asynchronous.
- **Detection:** Cross-reference form XML for handlers with `event = "onload"`, then apply patterns from `JS-COMPAT-003` plus `/\bwhile\s*\((?!false)/` to the handler's web resource content.
- **Recommendation:** Mark the handler function `async`, `await` all data-fetching calls, and register the function with the `isAsync` flag in the form designer.

#### JS-PERF-002 — Unminified JavaScript web resource over 50 KB
- **Category:** alm · **Severity:** info · **Source:** Declarative
- **Description:** Flags JavaScript web resources larger than 50 KB that show signs of being unminified (average line length below 120 characters, or presence of multi-line comment blocks).
- **Why:** Web resources are loaded synchronously during form rendering. Large unminified files increase parse time and initial page load, cumulatively significant in solutions with many web resources.
```json
{
  "id": "JS-PERF-002",
  "category": "alm",
  "queries": {
    "largeResources": {
      "type": "odata",
      "entitySet": "webresourceset",
      "select": ["webresourceid", "name", "sizeofcontent"],
      "filter": "webresourcetype eq 3 and sizeofcontent gt 51200"
    }
  },
  "evaluate": {
    "op": "gt",
    "left": { "op": "count", "var": "queries.largeResources" },
    "right": 0
  },
  "message": "{{count}} JavaScript web resource(s) exceed 50 KB and appear unminified.",
  "recommendation": "Run source through Terser or esbuild before uploading. Retain source in version control separately."
}
```

#### JS-PERF-003 — Excessive JavaScript web resources on one form
- **Category:** alm · **Severity:** info · **Source:** Declarative
- **Description:** Flags model-driven app forms that register more than the configured maximum number of distinct JavaScript web resources as event handlers.
- **Why:** Each additional web resource is a separate file request during form load. More than five distinct resources creates meaningful load-time overhead and increases the risk of load-order bugs.
```json
{
  "id": "JS-PERF-003",
  "category": "alm",
  "queries": {
    "formHandlerCounts": {
      "type": "formXmlAggregation",
      "groupBy": "formid",
      "count": "distinctWebResourceName",
      "filter": "webresourcetype eq 3"
    }
  },
  "evaluate": {
    "op": "anyGt",
    "var": "queries.formHandlerCounts.count",
    "threshold": { "var": "config.maxJsResourcesPerForm", "default": 5 }
  },
  "message": "{{count}} form(s) load more than {{threshold}} JavaScript web resources.",
  "recommendation": "Bundle related scripts into a single IIFE-wrapped web resource using Vite or esbuild."
}
```

#### JS-ALM-001 — Hardcoded GUIDs in web resource source
- **Category:** alm · **Severity:** warn · **Source:** Code
- **Description:** Detects GUID literals hardcoded directly in JavaScript web resource source.
- **Why:** GUIDs for records, views, roles, and other system objects differ between environments. Hardcoded GUIDs cause web resource behaviour to silently fail — or worse, operate on an unintended record — when a solution is promoted.
- **Detection pattern:** `/['"`][0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}['"`]/g`
- **Recommendation:** Retrieve GUIDs at runtime using a logical name lookup (e.g., fetch a role by `name`, not `roleid`). For configuration values, use a Dataverse configuration entity or an environment variable.
- **False positives:** GUIDs used as stable test fixture identifiers in files explicitly named as test harnesses.

#### JS-ALM-002 — Hardcoded organisation URL in web resource source
- **Category:** alm · **Severity:** warn · **Source:** Code
- **Description:** Detects hardcoded Dataverse/Power Platform organisation URLs embedded in JavaScript web resource content.
- **Why:** Organisation URLs are environment-specific. A script pointing to the dev or test org URL will call the wrong environment when deployed, potentially reading from or writing to the wrong dataset — a data integrity risk in addition to an ALM concern.
- **Detection patterns (case-insensitive):**
  ```
  /https?:\/\/[a-z0-9\-]+\.crm[0-9]*\.dynamics\.com/i
  /https?:\/\/[a-z0-9\-]+\.api\.powerplatform\.com/i
  /https?:\/\/[a-z0-9\-]+\.api\.crm[0-9]*\.dynamics\.com/i
  ```
- **Recommendation:** Use `Xrm.Utility.getGlobalContext().getClientUrl()` to obtain the current environment's base URL at runtime and construct all API paths relative to it.
- **False positives:** URLs inside comment-only lines that document example values. Exclude lines beginning with `//` after trimming.

#### JS-ALM-003 — Missing error handling around async operations
- **Category:** alm · **Severity:** warn · **Source:** Code
- **Description:** Flags JavaScript web resources registered as form event handlers that contain `await` or `.then(` chains without a wrapping `try/catch` or `.catch(` handler.
- **Why:** Unhandled Promise rejections in form event handlers fail silently in Unified Interface — no user-visible error, no entry in the application error log. A network error or permission denial leaves the form in an indeterminate state with no feedback, making defects in production extremely difficult to diagnose.
- **Detection (heuristic):**
  ```
  locate top-level async function bodies or .then() chains in handler resources
  check whether each await / .then block is enclosed in try/catch or .catch()
  flag handlers where at least one uncaught async path exists
  ```
- **Recommendation:** Wrap all `await` expressions in `try/catch`. At minimum, add a top-level catch that calls `Xrm.Navigation.openAlertDialog` to inform the user of the failure. For diagnostics, route errors to Application Insights via a telemetry helper.
- **False positives:** Fire-and-forget patterns (telemetry, logging) where a failed call is intentionally ignored. Suppress at the function level if the fire-and-forget is deliberate and documented.

#### JS-ALM-004 — Global namespace pollution
- **Category:** alm · **Severity:** warn · **Source:** Code
- **Description:** Detects JavaScript web resources that declare top-level variables or named functions outside of a namespace object, IIFE wrapper, or ES module boundary.
- **Why:** Web resources from multiple solutions can be loaded on the same form simultaneously. Top-level declarations go into the global `window` scope. Name collisions between resources from different solutions cause one script to silently overwrite another's functions or state, producing intermittent, load-order-dependent bugs.
- **Detection (heuristic):** Check whether the entire file body is wrapped in an IIFE (`(function(){…})()`), a namespace pattern (`var NS = NS || {}; NS.fn = …`), or contains ES module `import`/`export` statements. Flag if none is found.
- **Recommendation:** Wrap all code in a namespace object using your organisation's publisher prefix (e.g., `window.Contoso = window.Contoso || {}; Contoso.AccountForm = { onLoad: … }`). Register event handlers as `Contoso.AccountForm.onLoad` in the form designer.
- **False positives:** Files whose single top-level statement is the namespace initialisation itself are using the pattern correctly. Do not flag if the only top-level statement is the namespace object assignment.

#### JS-ALM-005 — JavaScript web resource not included in any solution
- **Category:** alm · **Severity:** info · **Source:** Declarative
- **Description:** Identifies JavaScript web resources present in the environment but not included in any managed or unmanaged solution component list (excluding Microsoft first-party resources prefixed with `msdyn_`, `mscrm_`, or `msapp_`).
- **Why:** Web resources outside a solution cannot be transported via standard ALM tooling (solution export/import, Power Platform CLI, pipelines). They exist only in the environment where they were created and are invisible to source control, creating shadow customisations that diverge silently from the tracked solution.
```json
{
  "id": "JS-ALM-005",
  "category": "alm",
  "queries": {
    "orphaned": {
      "type": "fetchXml",
      "template": "<fetch><entity name='webresource'><attribute name='name'/><attribute name='webresourcetype'/><filter><condition attribute='webresourcetype' operator='eq' value='3'/><condition attribute='name' operator='not-begin-with' value='msdyn_'/><condition attribute='name' operator='not-begin-with' value='mscrm_'/></filter><filter type='and'><condition entityname='solutioncomponent' attribute='solutioncomponentid' operator='null'/></filter></entity></fetch>"
    }
  },
  "evaluate": {
    "op": "gt",
    "left": { "op": "count", "var": "queries.orphaned" },
    "right": 0
  },
  "message": "{{count}} JavaScript web resource(s) are not included in any solution.",
  "recommendation": "Add each resource to the appropriate solution using Solution Explorer or `pac solution add-reference`, or delete it if obsolete."
}
```

#### JS-QUAL-001 — Missing `'use strict'` directive
- **Category:** alm · **Severity:** info · **Source:** Code
- **Description:** Flags JavaScript web resources that do not begin with `'use strict';` or `"use strict";` as the first executable statement (or as the first statement inside the top-level IIFE, if one is present).
- **Why:** Strict mode converts silent JavaScript errors into thrown exceptions (writing to undeclared variables, deleting non-configurable properties, duplicate parameter names). Without it, logical errors fail silently and can corrupt form state without any console output.
- **Detection:** Strip leading comments and whitespace, then check the first statement of the file body (or the first statement inside the IIFE wrapper) against `/^['"]use strict['"];/`.
- **Recommendation:** Add `'use strict';` as the first line of the file or as the first statement inside the IIFE. Bundlers (Vite, esbuild) apply strict mode globally to their output by default.
- **False positives:** Files compiled from TypeScript or transpiled from ES modules are implicitly in strict mode; the directive may be absent from bundler output without risk. Suppress for resources confirmed to be bundler output.

#### JS-QUAL-002 — `console.log` / `console.debug` left in production
- **Category:** alm · **Severity:** info · **Source:** Code
- **Description:** Detects `console.log(`, `console.debug(`, `console.warn(`, and `console.error(` calls in JavaScript web resources registered as active form event handlers.
- **Why:** Console statements in production web resources: (1) expose internal variable names, data shapes, and control flow logic in browser developer tools, (2) may log sensitive record data (IDs, field values) capturable by browser extensions, and (3) add non-zero overhead per call.
- **Detection pattern:** `/\bconsole\.(log|debug|warn|error)\s*\(/`
  `console.error` inside a `catch` block is downgraded from info to a note (not flagged), as it is part of structured error handling rather than a debug trace.
- **Recommendation:** Remove `console.*` calls before deploying to production. For diagnostics, implement a configurable telemetry wrapper that routes output to Application Insights and activates only when a debug flag (stored in Dataverse configuration) is set.

#### JS-QUAL-003 — Implicit global variable assignment
- **Category:** alm · **Severity:** warn · **Source:** Code
- **Description:** Flags assignments to undeclared variables (used without a preceding `var`, `let`, or `const`) in JavaScript web resources not running in strict mode.
- **Why:** An undeclared assignment silently creates a property on `window`. This is indistinguishable from a deliberate global and interacts unpredictably with other scripts on the same form — including Microsoft's Unified Interface scripts. In multi-solution environments this is a data-corruption risk.
- **Detection (heuristic):**
  ```
  tokenise the file
  collect all LHS assignments: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/
  subtract declared names: /\b(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/
  flag undeclared assignments that are not property accesses (no preceding `.`)
  ```
  This is a conservative heuristic; a linter (`eslint no-undef`) provides authoritative analysis.
- **Recommendation:** Declare all variables with `let` or `const`. Enable `'use strict'` (see `JS-QUAL-001`) — it converts implicit global creation into a `ReferenceError`, making the defect immediately visible during development.
- **False positives:** Intentional namespace extensions (`MyNamespace.newMethod = function() { … }`) are property assignments, not implicit globals, and are excluded by the `.` filter. Suppress at the resource level for confirmed vendor bundles.

---

## 4. Config defaults reference

Declarative rules read thresholds from `RuleContext.config`. Suggested defaults, overridable per environment/tenant:

| Key | Default | Used by |
|---|---|---|
| `maxSysAdmins` | 5 | SEC-ADMIN-001 |
| `maxChoiceOptions` | 50 | SCH-OPT-002 |
| `maxIntersectRows` | 500,000 | SCH-NN-005 |
| `maxMonthlyAuditRows` | 1,000,000 | SCH-AUDIT-006 |
| `maxLookups` | 20 | SCH-LOOKUP-007 |
| `highVolumeThreshold` | 10,000 / 7d | PLG-SYNC-001 |
| `maxMessagesPerPlugin` | 5 | PLG-BROAD-003 |
| `dailyRunWarningThreshold` | 5,000 | FLOW-API-003 |
| `maxComponentsPerSolution` | 500 | ALM-SEG-003 |
| `maxAdHocTeams` | 15 | SEC-TEAM-002 |
| `apiUsageWarningPercent` | 80 | CAP-API-001 |
| `dbStorageWarningPercent` | 80 | CAP-STORE-002 |
| `fileStorageWarningPercent` | 80 | CAP-FILE-004 |
| `maxJsResourcesPerForm` | 5 | JS-PERF-003 |

---

## 5. Notes on JSON specs in this document

The expression syntax (`op`, `var`, `count`, `and`/`or`, etc.) matches the fixed, bundled interpreter defined in `ARCHITECTURE.md` §4.1. A small number of operators referenced above (`startswith`, `contains`, `mul`) extend the minimal example set shown there — when implementing, ensure the interpreter's operator allow-list is the single source of truth, and that any operator appearing in a rule spec but not implemented causes that rule to fail closed (dropped with a logged reason), never silently ignored or executed as code.
