# Claude Code Agents — Complete Setup Guide

> Derived from the PPSB project's live `.claude/` setup, `CLAUDE.md`, `CLAUDE-SETUP.md`,
> and the June 2026 best-practices research doc. Everything here reflects patterns
> that have been proven across real sessions.

---

## Table of Contents

1. [The Core Concept](#1-the-core-concept)
2. [Directory Structure](#2-directory-structure)
3. [CLAUDE.md — The Entry Point](#3-claudemd--the-entry-point)
4. [Agents — Specialist Sub-Agents](#4-agents--specialist-sub-agents)
5. [Commands — Slash Commands](#5-commands--slash-commands)
6. [Skills — Internal Orchestrated Procedures](#6-skills--internal-orchestrated-procedures)
7. [Memory Files — Persistent Project Brain](#7-memory-files--persistent-project-brain)
8. [Settings — Permissions and Hooks](#8-settings--permissions-and-hooks)
9. [How Everything Connects — The Workflow](#9-how-everything-connects--the-workflow)
10. [Model Selection by Role](#10-model-selection-by-role)
11. [Maintenance Schedule](#11-maintenance-schedule)
12. [Anti-Patterns to Avoid](#12-anti-patterns-to-avoid)

---

## 1. The Core Concept

Claude Code's agent system is built on one principle: **context window is the scarcest resource**.
Every best practice below is a corollary of that constraint.

The architecture has four layers:

```
CLAUDE.md                        ← Read at every session start; orientation and routing rules
  └── Agents (.claude/agents/)        ← Specialist sub-agents with isolated context windows
        └── Commands (.claude/commands/) ← Slash commands (fast, reusable procedures)
              └── Skills (.claude/skills/)   ← Internal orchestrated multi-step procedures
                    └── Memory (.claude/memory/) ← Persistent state across all sessions
```

Each layer solves a different problem:

| Layer | Problem it solves |
|---|---|
| `CLAUDE.md` | Tells Claude what project it's in and how to behave by default |
| Agents | Different roles need different models, tools, and context — keeps specialist context clean |
| Commands | Repeatable procedures (pre-commit, push) that run as slash commands |
| Skills | Complex multi-step orchestrated procedures invoked by the orchestrator |
| Memory | Knowledge that must survive between sessions without re-deriving it from code |

---

## 2. Directory Structure

```
your-project/
├── CLAUDE.md                       ← Read at every session start
├── CLAUDE-SETUP.md                 ← Human reference for the agent system (optional)
├── .claude/
│   ├── agents/                     ← Sub-agent definitions
│   │   ├── orchestrator.md         ← ALWAYS start here; routes all tasks
│   │   ├── architect.md            ← Architecture decisions (Opus — expensive)
│   │   ├── developer.md            ← All implementation (Sonnet)
│   │   ├── reviewer.md             ← Code review, read-only (Haiku)
│   │   ├── document-updater.md     ← Docs, changelogs, memory maintenance (Haiku)
│   │   ├── skills-learner.md       ← Captures corrections into memory (Haiku)
│   │   └── security-auditor.md     ← Pre-commit/push security sweep (Haiku)
│   ├── commands/                   ← Slash commands (type /name in terminal)
│   │   ├── pre-commit.md           ← /pre-commit [files] — fast checks before commit
│   │   ├── push-branch.md          ← /push-branch — full gate then git push
│   │   ├── maintain-learnings.md   ← /maintain-learnings — promote learnings to patterns
│   │   ├── maintain-memory.md      ← /maintain-memory — trim project.md
│   │   ├── maintain-decisions.md   ← /maintain-decisions — collapse settled decisions
│   │   └── release.md              ← /release vX.Y.Z — full release sequence
│   ├── skills/                     ← Internal skills (orchestrator reads and executes)
│   │   ├── skill-prompt-engineering.md  ← Prompt conventions for feature/verification prompts
│   │   └── trim-guides.md          ← Deduplicate guide files against pattern files
│   ├── memory/                     ← Persistent project brain (all agents read at startup)
│   │   ├── project.md              ← Current version, working features, next steps
│   │   ├── decisions.md            ← Accepted decisions — never re-debate these
│   │   ├── learnings.md            ← Corrections from project owner — hard rules
│   │   ├── patterns-dataverse.md   ← Dataverse, API, build, commit patterns
│   │   ├── patterns-ui.md          ← React, Fluent UI v9, UI behaviour patterns
│   │   ├── patterns-general.md     ← DRY/SOLID, hooks, utils patterns
│   │   └── interactions/           ← Session logs — GITIGNORED, never committed
│   └── settings.local.json         ← Local permissions (gitignored)
```

---

## 3. CLAUDE.md — The Entry Point

`CLAUDE.md` is the first file Claude reads in every session. Keep it short — under 100 lines.
It orients and routes; it does not contain all the detail.

### What belongs in CLAUDE.md

| Include | Exclude |
|---|---|
| Mandatory startup sequence (what files to read, in what order) | Code patterns (those go in memory/patterns-*.md) |
| Hard rules (things that would break the project if violated) | File-by-file codebase descriptions |
| Agent table (name, model, role) | Standard language conventions |
| Command table (when to use each) | Long explanations or tutorials |
| Key reference file table | Information derivable from reading the code |
| Stack and API overview (2-3 lines) | Anything already in a linked file |

### Tiered behaviour pattern

The PPSB project uses a three-tier default so that Claude doesn't load heavy memory
for simple questions:

```markdown
## Default Behaviour — No Agent Specified

### Tier 1: Conversational or general questions
Trigger: questions about syntax, concepts, tooling, not specific to this project.
Behaviour: answer directly. Do not load any memory files.

### Tier 2: Project-specific questions, no code changes
Trigger: questions about this project's state, architecture, decisions.
Behaviour: load `.claude/memory/project.md` only, then answer.

### Tier 3: Any implementation, commit, or push
Trigger: any request to write code, fix a bug, add a feature, commit, or push.
Behaviour: treat exactly as if the project owner had invoked `/agent orchestrator`.
Load all memory files and apply all orchestrator rules.
```

### Mandatory startup sequence

Every agent definition references this sequence from CLAUDE.md:

```markdown
## Mandatory Startup Sequence (ALL agents)

Before responding to any task, read in order:

1. `.claude/memory/project.md` — current version, working features, next steps
2. `.claude/memory/decisions.md` — accepted decisions; never re-debate these
3. `.claude/memory/learnings.md` — corrections from the project owner; every entry is a hard rule
4. Pattern files — load based on task domain:
   - Dataverse, API, discovery, export, build, commits → `.claude/memory/patterns-dataverse.md`
   - React components, Fluent UI v9, UI behaviour → `.claude/memory/patterns-ui.md`
   - Both → load both
   - Any task involving new or modified code → also load `.claude/memory/patterns-general.md`
   - Documentation only (no code changes) → skip all pattern files
5. `.claude/memory/interactions/` — scan for files relevant to the current task

Report: **"Memory loaded: [files read]"**
```

The startup report is important — it forces verification that the sequence ran.

### Hard rules in CLAUDE.md

State them with `NEVER` and `ALWAYS` — vague rules get ignored:

```markdown
## Hard Rules

- **NEVER** use `executeDataverseRequest()` or `window.toolboxAPI.dataverse.*` — they do not exist
- **ALWAYS** use static imports for reporters — dynamic imports break under `pptb-webview://`
- **ALWAYS** run `pnpm typecheck && pnpm build` after any code change before committing
- **ALWAYS** run `/pre-commit` before any git commit
```

---

## 4. Agents — Specialist Sub-Agents

Agents are Markdown files in `.claude/agents/` with YAML frontmatter. Claude Code
discovers them automatically. Each agent gets its own isolated context window.

### Agent file format

```markdown
---
name: agent-name
description: One sentence that tells the orchestrator WHEN to invoke this agent.
             This is the routing signal — make it precise and include trigger conditions.
model: claude-sonnet-4-6   # or claude-opus-4-6 or claude-haiku-4-5-20251001
tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch, Task
---

# Agent Title

[Agent's role, expertise, and identity]

## Mandatory Startup Sequence

[Which memory files to load — reference CLAUDE.md or list explicitly]

Report: **"[Context type] loaded: [files read]"**

## [Core responsibilities, rules, output format]
```

### The description field is the routing signal

The `description` field appears in Claude Code's agent list. The orchestrator
reads it to decide which agent to invoke. Write it as a routing rule, not a job title:

```markdown
# Good — tells the orchestrator exactly when to invoke
description: Senior Tech Lead developer for PPSB. Invoke for all implementation work —
             new features, bug fixes, refactoring, component creation, Dataverse API
             integration, TypeScript type work, and build/tooling changes.

# Bad — too generic
description: Developer agent for writing code.
```

### The seven agents in PPSB

#### Orchestrator (`claude-sonnet-4-6`) — the entry point

```markdown
---
name: orchestrator
description: ALWAYS start here. The orchestrator coordinates all work. Invoke first
             for any new task, feature, bug, refactor, or question. It reads project
             memory, decides which specialist agent to delegate to, and ensures only
             one architect instance is active.
model: claude-sonnet-4-6
tools: Read, Write, Edit, Glob, Grep, Task, WebFetch, WebSearch
---
```

Key orchestrator responsibilities:
- Reads ALL memory files at startup
- Routes tasks to the right specialist (never does specialist work itself)
- Runs implementation pipeline: architect → developer → reviewer → document-updater
- Invokes `/pre-commit` on commit triggers, `/push-branch` on push triggers
- Routes to `skills-learner` immediately when project owner makes a correction
- Runs `security-auditor` at end of any session with code changes

Orchestrator hard rules:
- Only ONE architect active at any time
- Never implement code — always delegate to developer
- Check `decisions.md` before routing to architect (skip if decision already exists)
- Never `git push` directly — always via `/push-branch`

#### Architect (`claude-opus-4-6`) — the expensive one

```markdown
---
name: architect
description: Senior solution architect. Invoke for architecture decisions, API design,
             data models, security architecture, React component architecture,
             performance strategy, and any decision that will be hard to reverse.
             Only ONE architect instance should be active at any time.
model: claude-opus-4-6
tools: Read, Edit, Glob, Grep, WebFetch, WebSearch, Write
---
```

Key architect rules:
- Loads BOTH pattern files and BOTH guide files — architecture decisions span domains
- Outputs decisions in structured ADR format, appended to `decisions.md`
- Never starts implementation — outputs decisions, interfaces, and guidance only
- For >3 decisions: presents outline first, waits for approval before writing full entries
  (prevents wasted Opus cost on wrong directions)

ADR output format:
```markdown
## Decision: [Short title]

**Status:** Proposed / Accepted / Superseded

**Context:** What situation requires this decision?

**Decision:** What are we doing?

**Rationale:** Why this approach over alternatives?

**Trade-offs:** What are we giving up? What risks does this introduce?

**Constraints it must satisfy:** [link to learnings.md if relevant]

**Implementation guidance for Developer:**
- [Specific points the developer must follow]

**Definition of done:** How will we know this is correctly implemented?
```

#### Developer (`claude-sonnet-4-6`) — all implementation

```markdown
---
name: developer
description: Senior Tech Lead developer for PPSB. Invoke for all implementation work —
             new features, bug fixes, refactoring, component creation, Dataverse API
             integration, TypeScript type work, and build/tooling changes.
model: claude-sonnet-4-6
tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch
---
```

Key developer rules:
- Presents a commit plan BEFORE writing any code — waits for approval
- After every atomic unit: `pnpm tsc --noEmit` → `pnpm build` → lint → format → commit
- Never bundles multiple logical changes into one commit
- Escalates to orchestrator when hitting an unresolved architecture decision

Commit plan format:
```
Task: [description]
Planned commits:
1. feat(scope): description — [what this unit contains]
2. fix(scope): description — [what this unit contains]
Awaiting approval to proceed.
```

Self-check before declaring done (prevent review blockers):
```
- [ ] Type-check — passed
- [ ] Build — passed
- [ ] Lint — passed
- [ ] Format — passed
```

#### Reviewer (`claude-haiku-4-5-20251001`) — read-only, gate

```markdown
---
name: reviewer
description: Senior code reviewer. Invoke after implementation is complete, before any
             commit or merge. Reviews TypeScript correctness, React patterns, Fluent UI
             compliance, Dataverse API safety, and security. Read-only — never modifies files.
model: claude-haiku-4-5-20251001
tools: Read, Glob, Grep, WebFetch
---
```

Key reviewer rules:
- Checks `learnings.md` FIRST — any violation is an automatic blocker
- Runs inside `/push-branch`, not after every commit (avoids slow repeated reviews)
- Uses `WebFetch` only to verify official Microsoft documentation references
- Defers deep credential scanning to `security-auditor` — only flags obvious code-level issues

Review verdict format:
```
## Review Summary
**Verdict:** ✅ Approved | ⚠️ Approved with comments | ❌ Changes required

## 🚨 Blockers (must fix before any commit)
## ⚠️ Issues (should fix)
## 💡 Suggestions (optional)
## ✅ What was done well
```

#### Document Updater (`claude-haiku-4-5-20251001`) — docs only

```markdown
---
name: document-updater
description: Technical documentation specialist. Invoke after features are implemented
             and reviewed, to update CHANGELOG.md, docs/, README.md, CLAUDE.md (when
             needed), and .claude/memory/ files. Also keeps memory current at end of session.
model: claude-haiku-4-5-20251001
tools: Read, Write, Edit, Glob, Grep
---
```

Key rules:
- Skips pattern files — documentation work doesn't need code patterns
- `CLAUDE.md` only updated when structure changes, new hard rules added, or paths change
- Pattern files updated when promoting learnings (adds PATTERN-XXX entries)
- Version consistency check before completing release: `package.json`, `npm-shrinkwrap.json`,
  `CHANGELOG.md`, `README.md` must all show the same version number

End-of-session routine: updates `project.md` with what was completed, new decisions,
current blockers, and ordered next steps.

#### Skills Learner (`claude-haiku-4-5-20251001`) — memory keeper

```markdown
---
name: skills-learner
description: Captures the project owner's corrections and feedback and updates shared
             memory files so no agent repeats the same mistake. Invoke when the project
             owner says "that's wrong", "don't do X", "remember this", or "I told you this before".
model: claude-haiku-4-5-20251001
tools: Read, Write, Edit, Glob, Grep
---
```

Key rules:
- Never argues with the correction — captures faithfully
- Checks for duplicates in `learnings.md` AND both pattern files before writing
- If the correction contradicts an existing rule: flags conflict before writing
- Always reads the new rule back to the project owner for confirmation

Learnings entry format:
```markdown
## [YYYY-MM-DD] — [Short descriptive title]
**Affects:** [All agents | Architect | Developer | Reviewer | Document Updater]
**Severity:** [Blocker | High | Medium]
**Rule:** [Clear imperative: "Always X" or "Never Y" or "When Z, do W"]
**Context:** [What went wrong, or why this matters]
**Example:**
- ❌ Wrong: `[code or behaviour that is wrong]`
- ✅ Right: `[code or behaviour that is correct]`
```

#### Security Auditor (`claude-haiku-4-5-20251001`) — pre-commit/push sweep

```markdown
---
name: security-auditor
description: Security and privacy auditor. Scans source code, memory files, docs, and
             config files for sensitive data before commits or releases. Read-only —
             never modifies files, only reports findings.
model: claude-haiku-4-5-20251001
tools: Read, Glob, Grep
---
```

Key rules:
- Runs before every commit (via `/pre-commit`) and before every push (via `/push-branch`)
- Scans memory files with highest priority — verbatim from sessions, highest risk of
  accidentally captured sensitive data
- CRITICAL finding = automatic block; never approve a commit with CRITICAL findings
- False positive guidance is explicit (GUIDs in docs, `example.com`, placeholder values)

What it scans for:
- CRITICAL: Azure/Entra credentials, client secrets, tenant IDs, access tokens, GitHub PATs
- CRITICAL: Real client names, internal URLs, colleague names in non-attribution contexts
- HIGH: Real Azure resource names, internal DNS, real tenant domain names
- MEDIUM: Console.log of API responses, TODO comments with internal ticket numbers
- LOW: Machine-specific file paths, hard-coded localhost ports

---

## 5. Commands — Slash Commands

Commands are Markdown files in `.claude/commands/`. Type `/command-name` directly in
the Claude Code terminal. They inject their content as a prompt. The orchestrator also
invokes them automatically on trigger phrases.

### Command file format

```markdown
## Command Title

[Step-by-step procedure — written as instructions Claude will follow]

### Step 1: [Action]
[Details]

### Step 2: [Action]
[Details]

## Completion report
[Expected output format — always end with a checklist]
```

### The six commands in PPSB

#### `/pre-commit [files]` — fast pre-commit gate

Runs before every `git commit`. Steps:
1. Determine changed file scope (from `$ARGUMENTS` or `git diff origin/branch...HEAD`)
2. Invoke `@reviewer` scoped to changed files only (TypeScript, React, Fluent UI, code quality)
3. Invoke `@security-auditor` scoped to changed files + unconditionally scan `.claude/memory/`

If any HIGH security finding: blocked — do not commit.
If reviewer returns blockers: report and ask whether to proceed.

Key design: reviewer runs inside pre-commit in scoped mode. It reads only the diff,
not the entire codebase — keeps the review fast and the context isolated.

#### `/push-branch` — full pre-push gate

Runs instead of `git push` directly. Steps:
1. `pnpm test --run` — full test suite
2. `pnpm build` — production build (catches bundle errors, chunk size issues)
3. `git diff main...HEAD --name-only` → pass to `@security-auditor` (full branch diff)
4. Pass same list to `@reviewer` (full context, complete changeset)
5. `git push origin [branch]` — only if all steps pass

Flags any chunk > 500KB that wasn't present before.
HIGH security finding = stop, advise rebasing to remove sensitive history before pushing.

#### `/maintain-learnings` — promote stable learnings to patterns

Runs every 3-4 sessions. Interactive: shows each learning candidate, proposes a
PATTERN-XXX entry, waits for explicit approval ("yes", "approved") before writing.

After each approved promotion:
- Appends new pattern to the correct domain file (check both files for the highest
  existing PATTERN-XXX number before assigning)
- Replaces the learning entry with:
  `Promoted → PATTERN-XXX in patterns-dataverse.md ([YYYY-MM-DD])`

#### `/maintain-memory` — trim project.md

Runs every 3-4 sessions. Collapses stable feature lists in `project.md` into single
summary lines. Target: under 150 lines. Bloated `project.md` degrades startup context quality.

#### `/maintain-decisions` — collapse settled decisions

Runs every major version. Collapses Accepted decisions to one-line summaries;
archives full rationale to `docs/architecture.md`. Prevents `decisions.md` from
growing indefinitely.

#### `/release vX.Y.Z` — full release sequence

Full sequence (orchestrator invokes this):
1. Reviewer — full code review of all changed files since last release
2. Security auditor — sweep source and `.claude/` folder
3. Document updater — bump `package.json`, finalise `CHANGELOG.md`, update README badge
   (all must show same version number)
4. Developer — `pnpm typecheck` (zero errors) + `pnpm build` + `npm shrinkwrap`
5. Orchestrator — confirms all steps, prints git commands for manual execution

The orchestrator never runs `git push` itself — always handed to the project owner.

---

## 6. Skills — Internal Orchestrated Procedures

Skills are Markdown files in `.claude/skills/`. Unlike commands (which are slash
commands you type directly), skills are internal procedures the orchestrator reads
and executes on the project owner's behalf.

### When to use skills vs. commands

| Commands | Skills |
|---|---|
| Run directly by the project owner via `/name` | Invoked by orchestrator when project owner describes the task |
| Fast, focused procedures | Complex multi-step orchestrated procedures |
| Pre-commit, pre-push, memory maintenance | Release sequence, prompt engineering review |

### The two skills in PPSB

#### `skill-prompt-engineering.md` — prompt conventions

Loaded by any agent when drafting or reviewing feature prompts or verification prompts.
Defines the canonical structure for both types:

Feature prompt structure:
1. Context — what exists, which files, current state
2. Goal — user-facing outcome (not implementation steps)
3. Constraints — non-negotiable rules
4. Acceptance criteria — specific, binary, testable
5. Out of scope — explicitly list what must NOT change
6. Routing — which agents, in what order

Verification prompt structure:
- Must start with "READ ONLY. Do not modify any files."
- Checklist items must be PASS / FAIL / WARN
- Assign to `@reviewer` or `@security-auditor`

Anti-patterns:
- Prompts that assume the agent has read previous conversation history
- Feature prompts that describe *how* to implement rather than *what* to achieve
- Vague acceptance criteria ("works correctly", "handles errors")

#### `trim-guides.md` — deduplicate guide files

Cross-references `DATAVERSE_OPTIMIZATION_GUIDE.md` and `UI_PATTERNS.md` against
the pattern memory files. Replaces duplicated content with "See PATTERN-XXX" references.
Run when combined pattern count reaches ~20 entries.

---

## 7. Memory Files — Persistent Project Brain

All agents read these files at startup. They are the single source of truth about
the project's history, patterns, and corrections.

### `project.md` — current state

Updated at the end of every session by the document-updater. Contains:
- Current version
- What's working (stable features)
- In progress (current session's work)
- Known limitations / blockers
- Ordered next steps for the next session

Target: under 150 lines. Run `/maintain-memory` when it exceeds this.

```markdown
# Project State

**Last updated:** YYYY-MM-DD
**Current version:** X.Y.Z

## What's Working
[Stable feature list — can be collapsed into summary lines]

## In Progress
[What was being worked on]

## Next Steps
1. [Most important next task]
2. [Second task]

## Known Issues / Blockers
[Anything blocking progress]
```

### `decisions.md` — architecture decisions log

Written by the architect using the ADR format. Agents do not re-debate Accepted
decisions. New entries are always appended — existing entries never deleted.

Run `/maintain-decisions` every major version to collapse settled entries into summaries
and archive full rationale to `docs/architecture.md`.

### `learnings.md` — corrections and hard rules

The most important file. Every entry is a real mistake that was corrected. All agents
check this file before starting work. The reviewer checks it first; any violation
is an automatic blocker.

An entry is promoted to a pattern file (via `/maintain-learnings`) once it has been
stable across multiple sessions without a violation. After promotion, the learning
entry is replaced with a cross-reference line.

### `patterns-dataverse.md` and `patterns-ui.md` — stable patterns

Promoted from learnings. Each pattern has:
- `PATTERN-XXX` — sequential number across BOTH files (check both before assigning)
- Source — where the pattern originated (file or decision)
- Applies to — which agents use this pattern
- Description with correct code example
- "Do NOT" section with the anti-pattern

```markdown
## PATTERN-003 — GUID Formatting in OData Filters

**Source:** learnings.md [2026-02-11]
**Applies to:** Developer, Reviewer

Always strip braces from GUIDs before using in OData $filter:

```typescript
// Correct
const cleanId = id.replace(/[{}]/g, '');
const filter = `_regardingobjectid_value eq ${cleanId}`;
```

**Do NOT:**
```typescript
// Wrong — braces cause 400 Bad Request
const filter = `_regardingobjectid_value eq {${id}}`;
```

Selective loading: Dataverse/API/build work → load `patterns-dataverse.md`;
React/Fluent UI work → load `patterns-ui.md`; full-stack → load both;
documentation only → skip both.

### `patterns-general.md` — DRY/SOLID and shared utility patterns

Cross-cutting patterns that apply to any code task: when to extract to utils,
when to create custom hooks, shared utility locations to check before writing
new logic. Load for any task involving new or modified code.

### `interactions/` — session logs (gitignored)

Session logs written during work. Never committed. Listed in `.gitignore`.
Agents scan this directory at startup for files relevant to the current task.

---

## 8. Settings — Permissions and Hooks

### `.claude/settings.local.json` (gitignored)

Project-local permission allowlist. Lets Claude run specific commands without
prompting each time. Use for commands that are safe and frequently needed:

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm typecheck *)",
      "Bash(pnpm build)",
      "Bash(git diff *)",
      "WebFetch(domain:docs.microsoft.com)",
      "Skill(run)",
      "Skill(run:*)"
    ]
  }
}
```

Syntax:
- `"Bash(command *)"` — allow specific bash commands (glob supported)
- `"WebFetch(domain:hostname)"` — allow fetching from a specific domain
- `"Skill(name)"` — allow a specific skill to run without prompting
- `"PowerShell(exact command)"` — allow specific PowerShell commands

### Project-level vs. user-level settings

| File | Scope | Commit? |
|---|---|---|
| `.claude/settings.local.json` | Project, local only | No — gitignore it |
| `.claude/settings.json` | Project, shared with team | Yes — if appropriate |
| `~/.claude/settings.json` | User, all projects | N/A |
| `~/.claude/.mcp.json` | User, MCP servers | N/A |

### Hooks

Hooks run shell commands at specific points in Claude's workflow. Unlike CLAUDE.md
instructions (which are advisory), **hooks are deterministic**.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'File write: '${TOOL_INPUT_PATH}"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/session-end-check.sh"
          }
        ]
      }
    ]
  }
}
```

Hook events:
- `PreToolUse` — fires before a tool executes (can validate or block)
- `PostToolUse` — fires after a tool executes
- `SubagentStop` — fires when a sub-agent completes
- `Stop` — fires when the session ends

---

## 9. How Everything Connects — The Workflow

### Starting a session

```
/agent orchestrator
[describe what you want to work on, or just say "resume"]
```

The orchestrator:
1. Reads all memory files in startup sequence
2. Summarises where the project left off (from `project.md`)
3. Either asks what to work on or proceeds with the stated task

### Implementation pipeline (orchestrator manages this automatically)

```
1. Check decisions.md — novel? → architect; already decided? → developer directly
2. Architect designs (if needed) → writes ADR to decisions.md
3. Developer presents commit plan → wait for project owner approval
4. Developer implements in atomic units:
   - After each unit: typecheck → build → lint → format → git commit
5. On commit trigger phrase → /pre-commit → git commit
6. On push trigger phrase → /push-branch → git push
7. Document-updater updates CHANGELOG and docs after push
8. End of session → document-updater updates project.md
```

### Trigger phrases the orchestrator recognises

| Trigger phrase | Action |
|---|---|
| "ok commit it", "commit it", "ready to commit" | Invoke `/pre-commit` then confirm before `git commit` |
| "push the code", "push it", "push the branch" | Invoke `/push-branch` |
| "prepare a release for vX.Y.Z" | Invoke `/release vX.Y.Z` skill |
| "session done, update memory" | Invoke document-updater for end-of-session routine |
| "that's wrong", "don't do that", "remember this" | Route to skills-learner immediately |

### Correction capture (immediate)

When the project owner makes a correction:
```
/agent skills-learner
Correction: [exactly what went wrong and what the right behaviour is]
```

The skills-learner:
1. Checks for duplicates in `learnings.md` and both pattern files
2. Drafts the rule, reads it back for confirmation
3. Writes to `learnings.md`
4. All agents will respect this rule from the next session onward

### Ending a session

```
/agent orchestrator
Session done. Please run the end-of-session routine.
```

The orchestrator instructs the document-updater to update `project.md` with
what was completed, new decisions, blockers, and next steps.

---

## 10. Model Selection by Role

Match the model to the job. Every agent file specifies its model in frontmatter.

| Model | ID | Best for | Cost |
|---|---|---|---|
| **Opus 4.6** | `claude-opus-4-6` | Architecture decisions, complex debugging, ADR generation, novel design problems | Most expensive |
| **Sonnet 4.6** | `claude-sonnet-4-6` | Standard implementation, orchestration, full-stack tasks, code review | Mid |
| **Haiku 4.5** | `claude-haiku-4-5-20251001` | Read-only tasks, linting checks, memory updates, simple lookups, security scans | Cheapest |

The PPSB assignment:
- Orchestrator: Sonnet (coordinates; needs to be fast and capable)
- Architect: Opus (most expensive; flag cost before invoking; only ONE at a time)
- Developer: Sonnet (standard implementation; Haiku would struggle with complex TypeScript)
- Reviewer, Document Updater, Skills Learner, Security Auditor: Haiku (read-only or structured writes)

---

## 11. Maintenance Schedule

Run these to keep the memory system healthy. Without maintenance, startup context
grows each session and signal-to-noise drops.

| Trigger | Task | How |
|---|---|---|
| Before every commit | Fast checks: TS, lint, related tests, spot review | Tell orchestrator "ready to commit [files]" → `/pre-commit` |
| Before every push | Full gate: build, tests, security, reviewer | Tell orchestrator "push the branch" → `/push-branch` |
| Before every release | Full release sequence | Tell orchestrator "prepare release vX.Y.Z" |
| Every session end | Update project.md | Tell orchestrator "session done, update memory" |
| Every 3-4 sessions | Promote learnings → patterns | `/maintain-learnings` |
| Every 3-4 sessions | Trim project.md | `/maintain-memory` |
| Every major version | Collapse settled decisions | `/maintain-decisions` |
| Pattern count hits ~20 | Remove guide file duplication | `/trim-guides` |
| Skills-learner updates memory | Security sweep of memory files | Security auditor runs automatically |

---

## 12. Anti-Patterns to Avoid

### Kitchen sink session

**Problem:** One session accumulates unrelated tasks. Context fills with noise.
**Fix:** `/clear` between different tasks. One goal per session.

### Correction spiral

**Problem:** Correcting over and over until context is polluted with failed approaches.
**Fix:** After two corrections on the same issue, `/clear` and write a better prompt.
Route to skills-learner first to capture the correction before clearing.

### Over-specified CLAUDE.md

**Problem:** CLAUDE.md grows long; important hard rules get buried and ignored.
**Fix:** Keep CLAUDE.md under 100 lines. Point to memory files for detail. Prune
aggressively — if a rule is captured in a pattern file, remove it from CLAUDE.md.

### Architect for everything

**Problem:** Routing every question to the architect burns Opus budget on tasks
Sonnet handles fine.
**Fix:** Check `decisions.md` first. If the decision exists, route to developer directly.
Only use the architect for genuinely novel decisions not already captured.

### Memory files as code/docs storage

**Problem:** Using memory files to track code patterns, file lists, or recent PRs.
**Fix:** Memory files store what is NOT derivable from reading the code. Corrections →
`learnings.md`. Stable patterns → `patterns-*.md`. Project state → `project.md`.
Never store: code snippets derivable from git, file lists, PR history.

### Orphaned patterns

**Problem:** Learnings promoted to pattern files but the learning entry still gives
the full text (duplicate maintenance burden).
**Fix:** After promoting, replace the full learning entry with a single line:
`Promoted → PATTERN-XXX in patterns-dataverse.md ([YYYY-MM-DD])`.

### Infinite exploration consuming main context

**Problem:** Open-ended investigation reads hundreds of files, burning the main
context window before implementation starts.
**Fix:** Scope exploration to a subagent (Explore type). Define exit criteria upfront.
The subagent's summary comes back to the main context; the raw file reads stay isolated.

### Trust-then-verify gap

**Problem:** "Looks done" is the only signal. Implementation is accepted without
running a verification gate.
**Fix:** Always run `pnpm typecheck && pnpm build` after any code change. Use
`/pre-commit` before every commit. Use `/push-branch` before every push.

---

*Derived from `.claude/agents/`, `.claude/commands/`, `.claude/memory/`, `.claude/skills/`,
`CLAUDE.md`, `CLAUDE-SETUP.md`, and `docs/todos/claude-code-agents-best-practices.md`
as of 2026-06-24.*
