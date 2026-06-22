# Power Platform ToolBox — Tool Developer Guide

> Source: https://docs.powerplatformtoolbox.com/tool-development  
> Last updated: 2026-06-21

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Package Manifest](#package-manifest)
4. [API Reference](#api-reference)
   - [ToolBox API](#toolbox-api)
   - [Dataverse API](#dataverse-api)
   - [Events API](#events-api)
   - [Settings API](#settings-api)
   - [File System API](#file-system-api)
   - [Error Handling](#error-handling)
5. [CSP Configuration](#csp-configuration)
6. [Inter-Tool Invocation](#inter-tool-invocation)
7. [Local Validation](#local-validation)
8. [Publishing](#publishing)

---

## Overview

Tools are web applications that run in isolated sandboxed environments inside Power Platform ToolBox (PPTB) and communicate with the host through secure APIs. Key characteristics:

- Each tool runs in its own **sandboxed iframe**
- Communication happens exclusively through **structured postMessage protocols**
- PPTB provides two primary API namespaces: `window.toolboxAPI` and `window.dataverseAPI`
- TypeScript definitions are available via `@pptb/types` on npm
- Tool ID and connection context are automatically injected — no manual wiring required

---

## Getting Started

### Scaffold a new tool

Use the Yeoman generator to bootstrap a project:

```bash
npx --package yo --package generator-pptb -- yo pptb
# or, if yo is installed globally:
yo pptb
```

The generated project includes HTML, CSS, TypeScript files, and a configured `package.json`.

### Install type definitions

```bash
npm install --save-dev @pptb/types
```

### Development workflow

1. Enable **Debug Menu** in PPTB Settings
2. Browse and load your local tool directory
3. Use **watch mode** (`npm run watch`) for hot iteration

---

## Package Manifest

Every tool requires a `package.json` that describes it to both the PPTB host and the npm registry.

### Required fields

| Field | Description | Example |
|---|---|---|
| `name` | Scoped npm package name | `"@myorg/my-tool"` |
| `version` | SemVer-compatible | `"1.0.0"` |
| `displayName` | Human-readable name shown in PPTB UI | `"My Tool"` |
| `description` | Brief explanation of the tool | `"Manages Dataverse entities"` |
| `main` | Entry-point file relative to `dist/` root | `"index.html"` |
| `icon` | SVG icon path; must use `fill="currentColor"` for theme support | `"icon.svg"` |
| `license` | Approved OSS identifier (see below) | `"MIT"` |
| `contributors` | Array of objects with at minimum a `name` field | `[{ "name": "Jane Doe" }]` |
| `configurations` | Object with PPTB-specific metadata including repository URL | see below |

**Approved licenses:** MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, GPL-2.0-only, GPL-2.0-or-later, GPL-3.0-only, GPL-3.0-or-later, LGPL-3.0, ISC, AGPL-3.0-only

### `configurations` object

```json
{
  "configurations": {
    "repositoryUrl": "https://github.com/myorg/my-tool",
    "readmeUrl": "https://raw.githubusercontent.com/myorg/my-tool/main/README.md"
  }
}
```

`readmeUrl` must point to a raw `githubusercontent.com` URL — PPTB renders it as docs inside the app.

### Optional: `features` object

Declare tool capabilities and version requirements:

```json
{
  "features": {
    "multiConnection": "optional",
    "minimumApiVersion": "1.2.0"
  }
}
```

Each method in the API Reference includes a **Requires vX.Y.Z** badge — use those to set `minimumApiVersion` correctly.

### Optional: `cspExceptions` object

See [CSP Configuration](#csp-configuration) below.

---

## API Reference

### ToolBox API

Accessed via `window.toolboxAPI`. Provides platform features organized into namespaces.

#### Connections

```typescript
// Get the active primary Dataverse connection
const conn = await toolboxAPI.connections.getActiveConnection();
// Returns: { name, url, environmentType, ... }

// Get the secondary connection (requires v1.2.0 + multiConnection feature)
const secondary = await toolboxAPI.connections.getSecondaryConnection();
```

For multi-connection tools, pass `'secondary'` as the `connectionTarget` parameter to relevant API calls.

#### Utils

```typescript
// Display a notification
await toolboxAPI.utils.showNotification({
  title: "Done",
  body: "Records exported successfully.",
  type: "success",   // "success" | "info" | "warning" | "error"
  duration: 5000,
});

// Copy text to clipboard
await toolboxAPI.utils.copyToClipboard("some text");

// Detect current app theme
const theme = await toolboxAPI.utils.getTheme(); // "light" | "dark"

// Open a URL in the connection's configured browser profile (v1.2.2+)
await toolboxAPI.utils.openInBrowser("https://make.powerapps.com");

// Run async operations in parallel
const [a, b] = await toolboxAPI.utils.parallel([fetchA(), fetchB()]);

// Loading state
toolboxAPI.utils.showLoading("Processing...");
toolboxAPI.utils.hideLoading();
```

#### Terminal Management

```typescript
// Create a terminal
const terminalId = await toolboxAPI.terminals.create({
  workingDirectory: "/some/path",
  env: { MY_VAR: "value" },
});

// Execute a command
const exitCode = await toolboxAPI.terminals.execute(terminalId, "npm install");

// Control visibility
toolboxAPI.terminals.show(terminalId);
toolboxAPI.terminals.hide(terminalId);

// Destroy when done
await toolboxAPI.terminals.destroy(terminalId);
```

#### Invocation API _(v1.2.2-beta)_

See [Inter-Tool Invocation](#inter-tool-invocation) for the full reference.

#### Tool Context

```typescript
const ctx = await toolboxAPI.context.getToolContext();
// Returns: { toolId, instanceId, connectionUrl, connectionId }
```

---

### Dataverse API

Accessed via `window.dataverseAPI`. Full HTTP client for Microsoft Dataverse.

All methods accept an optional `connectionTarget: 'primary' | 'secondary'` parameter.

#### CRUD Operations

```typescript
// Create
const id = await dataverseAPI.create("accounts", {
  name: "Contoso Ltd.",
  telephone1: "555-1234",
});

// Retrieve single
const account = await dataverseAPI.retrieve("accounts", id, ["name", "telephone1"]);

// Update
await dataverseAPI.update("accounts", id, { telephone1: "555-9999" });

// Delete
await dataverseAPI.delete("accounts", id);

// Batch create / update
const ids = await dataverseAPI.createMultiple("contacts", [{ firstname: "Jane" }]);
await dataverseAPI.updateMultiple("contacts", [{ id: "...", lastname: "Doe" }]);
```

#### Querying

```typescript
// OData query
const results = await dataverseAPI.queryData(
  "accounts?$select=name,telephone1&$filter=statecode eq 0&$top=50"
);

// FetchXML query
const fetchXml = `
<fetch top="50">
  <entity name="account">
    <attribute name="name" />
    <filter>
      <condition attribute="statecode" operator="eq" value="0" />
    </filter>
  </entity>
</fetch>`;
const records = await dataverseAPI.fetchXmlQuery(fetchXml);
```

#### Relationship Management

```typescript
// Associate (many-to-many)
await dataverseAPI.associate("accounts", accountId, "contact_customer_accounts", "contacts", contactId);

// Disassociate
await dataverseAPI.disassociate("accounts", accountId, "contact_customer_accounts", "contacts", contactId);
```

#### Metadata Operations

```typescript
// Entity definitions
const entities = await dataverseAPI.getEntityDefinitions();
const entity = await dataverseAPI.getEntityDefinition("account");

// Attributes
const attributes = await dataverseAPI.getAttributes("account");

// Option sets
const optionSet = await dataverseAPI.getGlobalOptionSet("my_optionset");

// Solutions
const solutions = await dataverseAPI.getSolutions();

// Custom actions / functions
await dataverseAPI.executeAction("my_CustomAction", { param1: "value" });
const result = await dataverseAPI.executeFunction("my_CustomFunction", { param: "value" });
```

#### Schema Modifications

```typescript
// Create entity
await dataverseAPI.createEntity({ ... });

// Create attribute
await dataverseAPI.createAttribute("account", { ... });

// Always publish after schema changes
await dataverseAPI.publishCustomizations();
```

#### Solution Deployment

```typescript
const importJobId = await dataverseAPI.importSolution(solutionFileBuffer);
const status = await dataverseAPI.getImportJobStatus(importJobId);
```

---

### Events API

Subscribe to platform lifecycle events. Requires **v1.0.17+**.

```typescript
toolboxAPI.events.on((event) => {
  switch (event.type) {
    case "connection:created":
    case "connection:updated":
    case "connection:deleted":
      refreshConnectionList();
      break;

    case "settings:updated":
      reloadSettings();
      break;

    case "tool:loaded":
      initialize();
      break;

    case "tool:unloaded":
      cleanup();
      break;

    case "terminal:output":
      appendToLog(event.payload.data);
      break;

    case "terminal:command:completed":
      handleCommandDone(event.payload.exitCode);
      break;
  }
});
```

**Available event types:**

| Category | Events |
|---|---|
| Tool lifecycle | `tool:loaded`, `tool:unloaded` |
| Connections | `connection:created`, `connection:updated`, `connection:deleted` |
| Configuration | `settings:updated` |
| User feedback | `notification:shown` |
| Terminal | `terminal:created`, `terminal:output`, `terminal:command:completed`, `terminal:error` |

**Best practices:**
- Register handlers **once** during initialization — not inside loops or callbacks
- Use a single handler with `switch` routing rather than multiple `events.on()` calls
- Wrap handler logic in try-catch to prevent unhandled errors from disrupting the tool

---

### Settings API

Persist user preferences between sessions. Requires **v1.0.17+**.

```typescript
// Read
const all = await toolboxAPI.settings.getAll();
const pageSize = (await toolboxAPI.settings.get("grid.pageSize")) ?? 50;

// Write (prefer batch for multiple values)
await toolboxAPI.settings.set("grid.pageSize", 100);
await toolboxAPI.settings.setAll({
  "grid.pageSize": 100,
  "ui.theme": "dark",
});
```

**Best practices:**
- Use namespaced keys (`ui.theme`, not `theme`)
- Always provide fallback defaults when reading
- Validate retrieved values before use
- Store only user **preferences** — not temporary or application state
- Prefer `setAll()` over multiple `set()` calls

---

### File System API

Secure local file and directory operations with built-in path validation. Requires **v1.0.20+** for read/write methods.

```typescript
// Check existence
const exists = await toolboxAPI.fileSystem.exists("/path/to/file.json");

// Stat
const stat = await toolboxAPI.fileSystem.stat("/path/to/file.json");
// Returns: { type: "file" | "directory", size, mtime }

// List directory
const entries = await toolboxAPI.fileSystem.readDirectory("/path/to/dir");

// Read
const text = await toolboxAPI.fileSystem.readText("/path/to/file.json");
const binary = await toolboxAPI.fileSystem.readBinary("/path/to/image.png");

// Write
await toolboxAPI.fileSystem.createDirectory("/path/to/new/dir");
await toolboxAPI.fileSystem.writeText("/path/to/output.json", JSON.stringify(data, null, 2));

// Interactive dialogs (native OS pickers)
const savePath = await toolboxAPI.fileSystem.saveFile(
  "/default/path/export.csv",
  csvContent,
  [{ name: "CSV Files", extensions: ["csv"] }],
);
const selectedPath = await toolboxAPI.fileSystem.selectPath({ type: "file" | "directory" });
```

**Best practices:**
- Always use **absolute paths**
- Check existence before reading
- Create parent directories before writing
- Wrap all operations in try-catch
- Use `readText` for text, `readBinary` for images/ZIPs/etc.

> `saveFile()` and `selectPath()` were migrated from `toolboxAPI.utils` to `toolboxAPI.fileSystem`.

---

### Error Handling

All API calls may throw. Implement structured error management throughout your tool.

#### Patterns

```typescript
// Basic
try {
  const record = await dataverseAPI.retrieve("accounts", id, ["name"]);
  render(record);
} catch (err) {
  await toolboxAPI.utils.showNotification({
    title: "Failed to load record",
    body: err instanceof Error ? err.message : "Unknown error",
    type: "error",
  });
}

// Continue-with-reporting (batch operations)
const successes: string[] = [];
const failures: string[] = [];

for (const item of items) {
  try {
    await dataverseAPI.update("accounts", item.id, item.changes);
    successes.push(item.name);
  } catch {
    failures.push(item.name);
  }
}

await toolboxAPI.utils.showNotification({
  title: "Batch update complete",
  body: `${successes.length} succeeded, ${failures.length} failed`,
  type: failures.length > 0 ? "warning" : "success",
});

// Resource cleanup
try {
  toolboxAPI.utils.showLoading("Importing...");
  await doLongOperation();
} catch (err) {
  handleError(err);
} finally {
  toolboxAPI.utils.hideLoading();
}
```

#### Common HTTP status codes

| Code | Meaning | User message |
|---|---|---|
| 400 | Bad request | Check your input and try again |
| 401 | Unauthorized | Your session may have expired — reconnect |
| 403 | Forbidden | You don't have permission to perform this action |
| 404 | Not found | The record no longer exists |
| 429 | Too many requests | Slow down and try again in a moment |
| 500 | Server error | Dataverse encountered an error — try again later |
| 503 | Service unavailable | Dataverse is temporarily unavailable |

**Seven core best practices:**
1. Always use try-catch blocks
2. Log errors with contextual information
3. Provide **actionable**, specific user messages
4. Hide technical details from end users
5. Clean up resources in `finally` blocks
6. Validate input before API calls
7. Implement retry logic for transient failures (429, 503)

---

## CSP Configuration

PPTB enforces a strict per-tool Content Security Policy. Tools that need external resources must declare exceptions explicitly — users must consent before the tool loads.

### Default policy

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self';
```

### Declaring exceptions in `package.json`

```json
{
  "cspExceptions": {
    "connect-src": [
      {
        "domain": "https://api.example.com",
        "exceptionReason": "Required to fetch external reference data used by this tool."
      }
    ],
    "script-src": [
      {
        "domain": "https://cdn.jsdelivr.net",
        "exceptionReason": "Loads the Monaco editor library.",
        "optional": true
      }
    ]
  }
}
```

### Supported CSP directives

| Directive | Controls |
|---|---|
| `connect-src` | XHR, fetch, WebSocket connections |
| `script-src` | JavaScript loading sources |
| `style-src` | CSS loading sources |
| `img-src` | Image loading sources |
| `font-src` | Font loading sources |
| `frame-src` | Embedded frame sources |
| `media-src` | Video/audio sources |
| `mailto` | Email link functionality |

### User consent flow

1. On first tool launch, a consent dialog lists all declared exceptions
2. Users approve or decline
3. Accepted consent persists; declined access prevents tool loading
4. Users can revoke via `window.toolboxAPI.revokeCspConsent('tool-id')` or manual settings edit

### Best practices

- Request **only necessary exceptions** — users trust minimal-permission tools
- Use **specific domains** rather than wildcards
- Document requirements through `exceptionReason` (supports markdown)
- Mark non-essential features as `"optional": true`
- Consider **bundling libraries** or **proxying calls** instead of requesting exceptions

### Troubleshooting CSP

| Issue | Resolution |
|---|---|
| CSP violation error | Check if exception covers the blocked resource and consent was granted |
| Consent dialog not appearing | Clear tool tabs or check browser console for errors |
| Need to revoke consent | `window.toolboxAPI.revokeCspConsent('tool-id')` or edit settings manually |

---

## Inter-Tool Invocation

Inter-Tool Invocation lets one PPTB tool launch another, passing prefill data as input and receiving results when done. Requires **v1.2.2-beta+**.

### Key characteristics

- Promise-based: `launchTool()` resolves when the callee calls `returnData()` or closes
- Callee runs in an isolated BrowserView instance
- Connection is automatically inherited from the caller
- Only **one active callee per caller** at a time
- Optional `pptb.config.json` defines the JSON-schema contract

---

### Part 1: Callee — accepting invocations

#### Declare the contract (`pptb.config.json` at package root)

```json
{
  "invocation": {
    "version": "1.0.0",
    "capabilities": ["entity-picker"],
    "prefill": {
      "properties": {
        "entityName": { "type": "string" },
        "allowMultiSelect": { "type": "boolean" }
      }
    },
    "returnTopic": {
      "properties": {
        "selectedId": { "type": "string" },
        "selectedName": { "type": "string" }
      }
    }
  }
}
```

Supported property types: `"string"`, `"number"`, `"boolean"`, `"object"`, `"array"`

#### Read launch context

```typescript
const ctx = await toolboxAPI.invocation.getLaunchContext();
// Returns prefill data when invoked, null when opened normally by the user

if (ctx !== null) {
  const entityName = ctx.entityName as string;
  renderPickerUI(entityName);
} else {
  renderFullExplorerUI();
}
```

#### Return data to caller

```typescript
await toolboxAPI.invocation.returnData({
  selectedId: "a1b2c3d4-...",
  selectedName: "Contoso Ltd.",
});
// PPTB automatically closes this window after delivery
```

If the tool was not launched via invocation, `returnData()` is a no-op.

---

### Part 2: Caller — launching other tools

#### Launch by package name

```typescript
const result = await toolboxAPI.invocation.launchTool(
  "@my-org/entity-picker",
  { entityName: "account", allowMultiSelect: false },
);

if (result !== null) {
  const { selectedId, selectedName } = result as { selectedId: string; selectedName: string };
  populateField("regardingobjectid", selectedId, selectedName);
} else {
  // User dismissed without selecting
}
```

#### `launchTool` signature

```typescript
launchTool(
  targetToolId: string,
  prefillData?: Record<string, unknown>,
  options?: {
    primaryConnectionId?: string | null;
    secondaryConnectionId?: string | null;
    noReturn?: boolean;
  },
): Promise<unknown>
```

Pass `null` for `primaryConnectionId` to launch without a connection.

#### Discover tools by capability tag

```typescript
import type { CapabilityTag } from "@pptb/types/pptbConfig";

const pickers = await toolboxAPI.invocation.findToolsByCapability("entity-picker");

if (pickers.length > 0) {
  const picker = pickers[0] as { id: string };
  const result = await toolboxAPI.invocation.launchTool(picker.id, { entityName: "account" });
}

// List all known tags
const knownTags = await toolboxAPI.invocation.getKnownCapabilityTags();
```

**Well-known capability tags:**

| Tag | Purpose |
|---|---|
| `fetchxml` | Process FetchXML queries |
| `entity-picker` | Browse and select Dataverse entities |
| `record-selector` | Browse and select Dataverse records |
| `solution-selector` | Pick Power Platform solutions |
| `odata` | Process OData queries |

---

### Invocation lifecycle

```
Caller → launchTool(...)
           │
           ▼
    One-at-a-time check
           │
           ▼
  PPTB creates BrowserView
  Auto-inherits connection
           │
           ▼
  Callee loads with prefillData
  "Return to Caller" banner injected
           │
    ┌──────┴──────────────┬──────────────┐
    ▼                     ▼              ▼
returnData()          Close window  Click banner
PPTB closes           null          null
    │                     │              │
    └─────────────────────┴──────────────┘
                     Promise resolves (data | null)
```

---

### Publishing with inter-tool invocation

Include `pptb.config.json` in the npm package:

```json
{
  "files": ["dist", "npm-shrinkwrap.json", "pptb.config.json"]
}
```

Bump `invocation.version` in `pptb.config.json` whenever prefill or returnTopic shapes change.

---

### Troubleshooting invocation

| Issue | Resolution |
|---|---|
| "Tool not found" | Install target tool; verify `targetToolId` matches `name` in its `package.json` |
| "A callee invocation is already in progress" | Wait for the current invocation to complete |
| `getLaunchContext()` returns `null` | Tool was opened by user directly, not via `launchTool()` |
| Promise resolves with `null` unexpectedly | User closed callee or clicked return banner before `returnData()` |
| Contract changes not recognized | Reinstall tool in PPTB after modifying `pptb.config.json` |
| `findToolsByCapability` returns empty | Verify target tool has correct tag in `pptb.config.json` and was reinstalled |

---

## Local Validation

Use `pptb-validate` CLI to validate your `package.json` against the same criteria used in the official review process.

### Setup

```bash
npm install --save-dev @pptb/types
```

Add to your `package.json` scripts:

```json
{
  "scripts": {
    "validate": "pptb-validate"
  }
}
```

### Usage

```bash
npm run validate
# or directly:
npx pptb-validate
npx pptb-validate path/to/package.json
```

### CLI options

| Option | Purpose |
|---|---|
| `--skip-url-checks` | Disable URL reachability checks (faster, offline-friendly) |
| `--json` | Structured JSON output for CI integration |
| `--help`, `-h` | Show usage |

### Validation coverage

- **Required fields:** `name`, `version`, `displayName`, `description`, `license`, `contributors`, repository URL, readme URL
- **Optional fields:** `icon`, website, funding URLs, CSP exceptions, feature flags, invocation contract
- **Exit codes:** `0` = clean, `1` = errors present (warnings do not fail)

### CI integration

```yaml
- name: Validate PPTB manifest
  run: npx pptb-validate --json --skip-url-checks
```

---

## Publishing

### Steps

1. **Prepare `package.json`** — fill all required fields; icon must be SVG with `fill="currentColor"`
2. **Build** — `npm run build` → distributable files in `dist/`
3. **Validate** — `npx pptb-validate`
4. **Finalize** — `npm run finalize-package`
5. **Publish to npm** — `npm publish --access public` (required for scoped packages)
6. **Test** — install and test via PPTB Debug section
7. **Submit to registry** — complete the [Tool Submission Form](https://powerplatformtoolbox.com) (select up to 3 categories)

### Pre-publication checklist

- [ ] `npm run build` succeeds with no errors
- [ ] `npx pptb-validate` exits with code `0`
- [ ] All required metadata fields are present
- [ ] License is from the approved list
- [ ] README is comprehensive and uses markdown (no inline HTML)
- [ ] Icon SVG uses `fill="currentColor"` for theme support
- [ ] `pptb.config.json` included in `files` array if using inter-tool invocation

### Post-publication

- Registry automatically syncs with npm
- Users receive update notifications when new versions publish
- Maintainer review typically takes **48–72 hours** (checks security, quality, functionality, documentation)

### Resources

- [Sample Tools Repository](https://github.com/PowerPlatformToolBox/sample-tools) — framework examples and API usage patterns
- [Tool Submission Form](https://powerplatformtoolbox.com) — registry submission
