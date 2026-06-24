# Claude Code Agent Best Practices

> Research summary — June 2026

---

## The Foundational Constraint

Claude's context window holds your entire conversation — every message, every file read, and every command output — and performance degrades as it fills. When the context window gets full, Claude may start "forgetting" earlier instructions or making more mistakes. **The context window is the most important resource to manage.**

Almost every best practice below is a corollary of this constraint.

---

## 1. Core Workflow: Explore → Plan → Implement → Commit

Separate research and planning from implementation to avoid solving the wrong problem. Use plan mode to divide exploration from execution:

1. Enter **plan mode** — Claude reads files and answers questions without making changes
2. Ask Claude to create a **detailed implementation plan**
3. Switch out of plan mode and let Claude code, verifying against its plan
4. Ask Claude to **commit** with a descriptive message and open a PR

> **Architect rule:** Always review the plan/architecture before approving execution — actually read it, don't just say "looks good." If something goes wrong mid-execution: stop. Don't patch a broken plan. Re-plan from the point of failure. Specs and plans are saved to version control; they're documentation for future developers.

---

## 2. CLAUDE.md — The Project Memory File

`CLAUDE.md` is a special file that Claude reads at the start of every conversation. The `/init` command analyzes your codebase to detect build systems, test frameworks, and code patterns. There is no required format — keep it short and human-readable.

### What to include vs. exclude

| ✅ Include | ❌ Exclude |
|---|---|
| Bash commands Claude can't guess | Anything Claude can figure out by reading code |
| Code style rules that differ from defaults | Standard language conventions |
| Testing instructions and preferred test runners | Detailed API documentation |
| Repository etiquette (branch naming, PR conventions) | Information that changes frequently |
| Architectural decisions specific to your project | Long explanations or tutorials |
| Developer environment quirks | File-by-file codebase descriptions |

> If Claude keeps doing something you don't want despite having a rule against it, the file is probably too long and the rule is getting lost. Treat CLAUDE.md like code: review it when things go wrong, prune it regularly, and test changes by observing whether Claude's behavior actually shifts. You can add emphasis such as "IMPORTANT" or "YOU MUST" to improve adherence on critical rules.

---

## 3. Subagent Architecture — The Developer/Architect Split

Claude Code subagents are specialized, autonomous assistants designed to execute specific, well-defined tasks within a larger workflow. Unlike a general-purpose agent that handles a wide range of requests, a subagent operates with its own distinct system prompt, a curated set of tool permissions, and an **isolated context window**.

### Proven three-stage pipeline

```
pm-spec → architect-review → implementer-tester
```

The architect considers performance and cost limits, produces an ADR, and sets status `READY_FOR_BUILD`. Each subagent has its own context window and can provide a summary after doing extensive research to the main agent — saving precious context before the main agent has to compact.

### Recommended subagent roles for enterprise/Power Platform work

| Role | Responsibility |
|---|---|
| `pm-spec` | Reads enhancement requests, writes a working spec, asks clarifying questions |
| `architect-review` | Validates design against platform constraints, produces ADRs |
| `implementer-tester` | Implements, runs tests, commits clean PRs |
| `security-reviewer` | Reviews diffs for injection, auth flaws, credential exposure |
| `code-reviewer` | Adversarial review in a fresh context window |

### Subagent memory

The `memory` field gives a subagent a persistent directory that survives across conversations. The subagent uses this directory to build up knowledge over time — codebase patterns, debugging insights, and architectural decisions.

### Subagent file location

```
.claude/agents/<agent-name>.md       # project-local
~/.claude/agents/<agent-name>.md     # global / cross-project
```

### When to use subagents

Use subagents when a task naturally splits into specialized responsibilities with different tool needs. For simple bugs or small features, a single session is faster. **The rule: subagents help when context separation and permission boundaries matter.**

---

## 4. Context Management in Practice

| Command | When to use |
|---|---|
| `/clear` | Full reset between unrelated tasks |
| `/compact <focus>` | Summarize with a directive (e.g. `/compact Focus on the API changes`) |
| `/rewind` | Restore conversation and code to any prior checkpoint |
| `/btw` | Side question that never enters conversation history |

You can customize compaction behavior in `CLAUDE.md`:

```
When compacting, always preserve the full list of modified files
and any test commands.
```

### Context hygiene rules

- Use `/clear` between different tasks — it wipes the conversation history and prevents context pollution
- Delegate intensive research to a subagent so its output stays in a separate context window
- After two failed correction attempts, `/clear` and write a better prompt rather than continuing to patch

---

## 5. Verification Gates — Evidence Over Assertions

Give Claude a check it can run: tests, a build, a screenshot to compare. Without a runnable check, "looks done" is the only signal available and you become the verification loop.

### Four escalating gates

1. **In-prompt** — ask Claude to run the check and iterate in the same message
2. **Session-level** — set a `/goal` condition; a separate evaluator re-checks after every turn
3. **Stop hook** — a script runs as a deterministic gate and blocks the turn from ending until it passes
4. **Adversarial subagent** — a fresh-context reviewer that didn't produce the code evaluates the diff

> A reviewer running in a fresh subagent context sees only the diff and the criteria you give it — not the reasoning that produced the change. Tell the reviewer to flag only gaps that affect correctness or the stated requirements, and treat the rest as optional. Chasing every finding leads to over-engineering.

---

## 6. Hooks — Deterministic Control

Hooks run scripts automatically at specific points in Claude's workflow. Unlike `CLAUDE.md` instructions which are advisory, **hooks are deterministic and guarantee the action happens**.

### Example hook for read-only database queries

```yaml
--- name: db-reader
description: Execute read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

### Useful hook events for enterprise/architect workflows

| Hook event | When it fires |
|---|---|
| `PreToolUse` | Validate before Bash executes |
| `SubagentStop` | Surface next steps in transcript |
| `Stop` | Run final checks before session ends |

Claude can write hooks for you — try prompts like:

- "Write a hook that runs eslint after every file edit"
- "Write a hook that blocks writes to the migrations folder"

---

## 7. Skills — Domain Expertise on Demand

Agent Skills are organized folders of instructions, scripts, and resources that agents can discover and load dynamically to perform better at specific tasks. They transform general-purpose agents into specialized agents that fit your needs.

**Progressive disclosure** is the core design principle — agents don't need to read an entire skill into their context window; they load only what's relevant per task.

### File location

```
.claude/skills/<skill-name>/    # project-local
~/.claude/skills/<skill-name>/  # global
```

### Useful skills for Power Platform architecture

- ALM pipeline patterns and GitHub Actions workflows
- Dataverse schema conventions and naming rules
- PCF component standards and patterns
- Solution layering and publisher prefix conventions
- Copilot Studio agent design patterns

---

## 8. Parallel Execution Patterns

### Options by coordination level

| Pattern | How it works | Best for |
|---|---|---|
| Git worktrees | Separate CLI sessions in isolated git checkouts | Feature branches that must not collide |
| Desktop app multiple sessions | Multiple local sessions side by side | Parallel investigation with visual oversight |
| Claude Code on the web | Sessions on Anthropic-managed cloud infrastructure | Team members working concurrently |
| Agent teams | Automated coordination with shared tasks and a team lead | Large, multi-responsibility refactors |

### Writer/Reviewer pattern

The simplest high-value parallel pattern:

- **Session A** — implements the feature
- **Session B** — reviews in a fresh context with no bias toward code it didn't write

### Cost impact

Running parallel agents consumes your Pro, Max, or Enterprise token quota proportionally. At Anthropic's reported average of ~$13 per developer per active day, five concurrent agents could push daily spend to $50–65. There is no separate agent billing; all sessions draw from the same plan.

---

## 9. Headless / CI Mode

```bash
claude -p "your prompt"
```

Non-interactive mode integrates Claude into CI pipelines, pre-commit hooks, or any automated workflow. The `--allowedTools` flag restricts what Claude can do, which is important when running unattended.

### Fan-out pattern for large migrations

1. Generate a task list
2. Write a shell loop calling `claude -p` per file with scoped permissions
3. Test on 2–3 files first
4. Run at scale

---

## 10. Model Selection by Role

Match the model to the job. Using Opus for everything is slow and expensive; using Haiku for everything produces shallow results on complex tasks.

| Model | Best for |
|---|---|
| **Opus** | Architecture decisions, complex debugging, ADR generation, security review |
| **Sonnet** | Standard implementation, code review, documentation |
| **Haiku** | Fast subtasks, linting checks, simple lookups, context-cheap subagent exploration |

---

## 11. Common Failure Patterns to Avoid

| Pattern | Description | Fix |
|---|---|---|
| Kitchen sink session | One session accumulates unrelated tasks; context fills with noise | `/clear` between tasks; one goal per session |
| Correction spiral | Correcting over and over until context is polluted with failed approaches | After two corrections, `/clear` and write a better prompt |
| Over-specified CLAUDE.md | Important rules get lost in noise | Keep it short; prune aggressively |
| Trust-then-verify gap | Plausible-looking implementation that doesn't handle edge cases | Always run a verification gate |
| Infinite exploration | Unscoped investigation reads hundreds of files and consumes main context | Scope exploration to a subagent; define exit criteria upfront |

---

## 12. Agent Coordination and Institutional Memory

The serious issue with multi-agent setups is the lack of collaboration between agents — they produce useful plans and reports but these aren't cross-referenced. Isolated pieces of work create significant inefficiency through duplication.

### Agent-Memory-Protocol pattern

Create a structured `.md` file under `.claude/` in the project directory:

```
.claude/AGENT_REGISTRY.md
```

Each agent checks this file for previous work and provides the necessary context before starting new tasks. Unlike the static `CLAUDE.md` file, this dynamic registry is updated as agents complete work.

---

## Architectural Summary for Enterprise / Power Platform Work

The stack that works in 2026:

```
CLAUDE.md (project conventions)
  └── Subagents per role (architect · implementer · security-reviewer)
        └── MCP servers (M365 · GitHub · Azure · Dataverse)
              └── Skills (ALM · schema · PCF · Copilot Studio)
                    └── Hooks (deterministic guardrails)
                          └── Headless CI (-p flag · fan-out loops)
```

Context hygiene — aggressive use of `/clear`, subagent delegation for research, compact directives — is what keeps the whole system reliable over long autonomous runs.

---

*Sources: Anthropic Claude Code official docs · Developers Digest 2026 playbook · FindSkill.ai disambiguation map · VILA-Lab systematic analysis · Claude Certified Architect Foundations guide*
