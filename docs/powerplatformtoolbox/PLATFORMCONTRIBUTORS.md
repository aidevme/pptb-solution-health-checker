# Power Platform ToolBox — Platform Contributor Guide

> Source: https://docs.powerplatformtoolbox.com/toolbox-development  
> Last updated: 2026-06-21

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Architecture](#architecture)
   - [Main Process](#main-process)
   - [Preload Script](#preload-script)
   - [Renderer Process](#renderer-process)
   - [API Layer](#api-layer)
   - [Type Definitions](#type-definitions)
7. [Data Flow](#data-flow)
8. [Security Model](#security-model)
9. [Terminal Integration](#terminal-integration)
10. [Build Process](#build-process)
11. [Development Workflow](#development-workflow)
12. [Contributing Guidelines](#contributing-guidelines)
13. [Coding Standards](#coding-standards)
14. [Release Process](#release-process)

---

## Overview

Power Platform ToolBox is an Electron-based desktop application built with TypeScript, Vite, and a modular design. The architecture enforces a clear separation between:

- **Main process** — Node.js environment; manages application state, connections, tools, authentication
- **Renderer process** — Chromium environment; React-based UI, tool iframe hosting
- **API layer** — event-driven communication bridge between main and renderer

---

## Technology Stack

| Technology | Version | Role |
|---|---|---|
| Electron | v28 | Cross-platform desktop framework |
| TypeScript | v5.9.3 | Type-safe development |
| Vite | v7.1.11 | Build tooling with HMR |
| pnpm | v10.18.3+ | Package management |
| electron-store | v8.2.0 | Persistent settings storage |
| electron-updater | v6.6.2 | Auto-update delivery |
| @azure/msal-node | v3.8.0 | Azure AD authentication |
| @fluentui/tokens | — | Design system tokens |
| Zustand | — | Renderer state management |

---

## Prerequisites

- Node.js 18 or higher
- pnpm 10 or higher
- Git
- VS Code (recommended)

Install pnpm:

```bash
# Windows (winget)
winget install pnpm

# macOS (Homebrew)
brew install pnpm

# Any platform via npm
npm install -g pnpm
```

---

## Getting Started

```bash
# 1. Fork and clone the repository
git clone https://github.com/PowerPlatformToolBox/desktop-app.git
cd desktop-app

# 2. Install dependencies
pnpm install

# 3. Start development mode (HMR enabled)
pnpm run dev
```

---

## Project Structure

```
desktop-app/
├── src/
│   ├── main/           # Main process (Node.js)
│   │   ├── index.ts    # Entry point
│   │   ├── preload.ts  # Secure IPC bridge
│   │   └── managers/   # Feature managers
│   ├── renderer/       # UI / Renderer process
│   │   ├── index.html
│   │   ├── renderer.ts
│   │   ├── styles.scss
│   │   └── toolboxAPIBridge.js
│   ├── api/            # toolboxAPI, dataverseAPI
│   └── types/          # Shared TypeScript definitions
├── packages/
│   └── @pptb/types/    # Published npm package for tool developers
├── docs/               # Project documentation
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## Architecture

### Main Process

Entry point: `src/main/index.ts`

Manages application lifecycle, window creation, IPC handlers, and coordinates between feature managers.

| Manager | Responsibility |
|---|---|
| `settingsManager.ts` | User settings: theme, language, auto-update preferences |
| `connectionsManager.ts` | Dataverse connection CRUD operations |
| `toolsManager.ts` | Tool lifecycle, loading, installation, contribution point parsing |
| `toolRegistryManager.ts` | Registry fetching, downloads, versioning |
| `authManager.ts` | Azure AD OAuth flows, token management, MSAL integration |
| `dataverseManager.ts` | Web API operations, FetchXML execution, metadata retrieval |
| `encryptionManager.ts` | OS-native secure storage encryption via `safeStorage` |
| `terminalManager.ts` | Terminal instance creation and command execution |
| `autoUpdateManager.ts` | Application updates via `electron-updater` |

---

### Preload Script

`src/main/preload.ts` is the **secure bridge** between main and renderer processes.

- Runs in a semi-privileged context with access to both Node.js APIs and the renderer window
- Exposes safe APIs to the renderer via Electron's `contextBridge`
- All IPC communication from the renderer goes through this script
- Tools (in iframes) use a separate path: `toolboxAPIBridge.js` + `postMessage`

---

### Renderer Process

`src/renderer/` — Chromium environment with no direct Node.js access.

| File | Role |
|---|---|
| `index.html` | Multi-panel UI layout: tools, connections, settings, terminal panels |
| `renderer.ts` | Main UI logic and interactions (3,000+ lines) |
| `styles.scss` | Modular SCSS using Fluent UI design tokens |
| `toolboxAPIBridge.js` | Exposes `toolboxAPI` and `dataverseAPI` to tools running in iframes |

State management uses **Zustand** for reactive UI state.

---

### API Layer

`src/api/toolboxAPI.ts` is the communication hub:

- **Event emission and subscription** — pub/sub for platform events
- **Notification system** — cross-process user feedback
- **Event history tracking** — replay recent events for newly loaded tools
- Bridges renderer UI ↔ main process managers via IPC

---

### Type Definitions

| Location | Audience |
|---|---|
| `src/types/index.ts` | Internal use within the desktop-app repository |
| `packages/@pptb/types/` | Published to npm for external tool developers; contains `toolboxAPI.d.ts` and `dataverseAPI.d.ts` |

When adding new API surface area, update both.

---

## Data Flow

### Tool Installation

```
User requests install
  → Renderer opens modal
  → User enters npm package name
  → IPC to main process
  → toolsManager installs via pnpm
  → Tool loaded into BrowserView
  → tool:loaded event emitted
  → UI updates
```

### Connection Creation

```
User adds connection
  → Modal opens in renderer
  → Details entered and submitted
  → IPC to main process
  → connectionsManager saves
  → encryptionManager encrypts sensitive fields (clientId, clientSecret, tokens)
  → connection:created event emitted
  → UI updates
```

### Tool API Call (Context-Aware Routing)

```
Tool calls API in iframe
  → toolboxAPIBridge.js injects tool ID
  → postMessage to renderer
  → Renderer routes by context (tool ID + connection)
  → IPC invokes main process manager
  → Manager executes operation
  → Response flows back: main → renderer → bridge → Promise resolves in tool
```

---

## Security Model

### Tool Isolation

Each tool runs in a **separate iframe** with restricted API access:

- Tools cannot access other tools' state or data
- Communication is exclusively through `window.postMessage` with structured protocols
- Tool ID is automatically injected by `toolboxAPIBridge.js` — tools cannot spoof identity
- Per-tool Content Security Policy enforced (see [Tool Developer Guide](TOOLDEVELOPERS.md#csp-configuration))

### Encryption and Secure Storage

Sensitive connection fields are encrypted using Electron's `safeStorage` API backed by OS-native facilities:

| OS | Encryption backend |
|---|---|
| macOS | Keychain |
| Windows | DPAPI |
| Linux | libsecret |

**Encrypted fields:** `clientId`, `clientSecret`, `accessToken`, `refreshToken`, `password`

### Context Isolation and IPC

- Renderer runs in an isolated context with **no direct Node.js access**
- Main UI communicates via IPC through the preload script's `contextBridge`
- Tools communicate via `postMessage` through `toolboxAPIBridge.js`
- Settings stored in `electron-store`; sensitive fields additionally encrypted

---

## Terminal Integration

`terminalManager.ts` provides:

- Terminal creation with configurable shell (`bash`, `zsh`, `PowerShell`, `cmd`) and working directory
- Real-time command execution with exit code capture
- Context-aware isolation — each tool gets its own terminal namespace
- Lifecycle management with automatic cleanup on tool unload
- Supported shells: `bash`, `zsh`, `PowerShell`, `cmd`

---

## Build Process

Vite creates **three parallel bundles**:

| Bundle | Entry | Output |
|---|---|---|
| Main process | `src/main/index.ts` | `dist/main/` |
| Preload script | `src/main/preload.ts` | `dist/preload/` |
| Renderer | `src/renderer/index.html` | `dist/renderer/` |

Bundle analysis reports are generated at `dist/stats-*.html`.

### Build commands

```bash
pnpm install          # Install dependencies
pnpm run lint         # Lint source files
pnpm run type-check   # TypeScript validation
pnpm run format       # Auto-format code
pnpm run build        # Development build
pnpm run watch        # Watch mode
pnpm run dev          # Dev mode with HMR
pnpm start            # Start built app
pnpm run package      # Production build (all platforms)
pnpm run package:win  # Windows only
pnpm run package:mac  # macOS only
pnpm run package:linux # Linux only
```

---

## Development Workflow

### Day-to-day

1. Create a branch from `dev` (see naming conventions below)
2. Make changes with `pnpm run dev` running for HMR
3. Run `pnpm run lint` and `pnpm run type-check` before committing
4. Run `pnpm run package` for a full local build test before opening a PR

### Pre-PR checklist

- [ ] `pnpm run lint` passes
- [ ] `pnpm run type-check` passes
- [ ] `pnpm run package` succeeds locally
- [ ] Related issues are referenced in the PR
- [ ] Documentation updated if feature-level change (README, architecture docs, inline comments, type definitions)

---

## Contributing Guidelines

### Code of Conduct

Contributors must adhere to the project Code of Conduct: empathy and kindness toward others; harassment and discriminatory conduct are not tolerated.

### Branch strategy

All PRs target **`dev`** — never `main` directly.

| Prefix | Use |
|---|---|
| `feature/` | New functionality |
| `fix/` | Bug corrections |
| `docs/` | Documentation updates |
| `refactor/` | Code restructuring |
| `chore/` | Maintenance, dependency updates |

### Commit format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

| Type | When |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructuring |
| `test` | Tests only |
| `chore` | Build process, tooling |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

**Example:**
```
feat(auth): add support for client credentials flow

Adds MSAL client credentials OAuth flow for headless environments.
Closes #123
```

### Pull request requirements

- Target the `dev` branch
- Complete the PR template checklist
- Reference related issues
- Provide a meaningful title and description
- Run `pnpm run package` locally before submitting

---

## Coding Standards

### TypeScript

- **Strict mode** is enabled — do not disable it
- Avoid `any` types; use `unknown` and narrow with type guards
- Define interfaces for all complex objects
- Export types from `packages/@pptb/types/` for any API surface that tool developers consume
- Use meaningful, self-documenting names — avoid abbreviations

### Comments

Write comments only when **the WHY is non-obvious**: a hidden constraint, a subtle invariant, a workaround for a specific bug. If removing the comment wouldn't confuse a future maintainer, don't write it.

### Documentation updates required for features

- `README.md` — if user-visible behavior changes
- `docs/architecture/` — if architecture changes
- Inline comments — for complex logic
- `packages/@pptb/types/` — for any new or changed API surface

---

## Release Process

### Nightly pre-releases

Every PR merged to `dev` triggers an automated nightly pre-release:

```
Format: 1.0.0-dev.YYYYMMDD
Example: 1.0.0-dev.20260621
```

### Stable releases

After sufficient testing on `dev`, merging to `main` produces a stable release:

```
Format: 1.0.0
```

Users with auto-updates enabled receive a notification and can update in-app.

### Future enhancements (roadmap)

- **Tool Marketplace** — browse and install from a curated catalog
- **Enhanced Tool Sandboxing** — additional security layers
- **Multi-language Support** — i18n implementation
- **Theme Customization** — user-defined themes and full dark mode
- **Enhanced Dataverse API** — batch requests, upsert operations
- **Testing Framework** — automated testing infrastructure

### Known technical debt

- Comprehensive test coverage (currently minimal)
- Error boundary implementation in renderer
- Structured logging system
- Tool signing / verification
- Performance monitoring
- Bundle size optimization

---

## Support

| Channel | Purpose |
|---|---|
| GitHub Discussions | General questions, ideas |
| GitHub Issues | Bug reports, feature requests |
| Discord | Real-time community chat |
