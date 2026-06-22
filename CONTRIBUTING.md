# Contributing to PPTB Solution Health Checker

Thank you for your interest in contributing! This document provides guidelines and best practices for contributing to the project.

## Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages. This leads to **more readable messages** that are easy to follow when looking through the **project history** and enables automatic changelog generation.

### Commit Message Format

Each commit message consists of a **header**, an optional **body**, and an optional **footer**:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The **header** is mandatory and must conform to the format above.

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies (example scopes: npm, vite, typescript)
- **ci**: Changes to CI configuration files and scripts (example scopes: github-actions, npm-publishing)
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope

The scope should be the name of the affected component or area (as perceived by the person reading the changelog):

- **ui**: UI components and visual changes
- **core**: Core types and shared utilities
- **dataverse**: Dataverse client and API integration
- **engine**: Rule execution engine
- **rules**: Individual rule implementations (schema, security, alm, flow, capacity)
- **scope-selector**: Scope selection component
- **findings**: Findings display and filtering
- **deps**: Dependencies

### Description

The description contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

### Body

The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

### Examples

#### Feature commit with scope

```
feat(rules): add JS web resource size limit rule

Adds a new rule that fails when a JS web resource exceeds 300 KB,
helping teams detect bloated scripts before deployment.

Closes #14
```

#### Bug fix commit

```
fix(ui): prevent findings table column overflow

- Truncate long detail text with ellipsis
- Show full text on hover tooltip
- Enable column resizing

Closes #17
```

#### Documentation commit

```
docs: add conventional commits guide

Create CONTRIBUTING.md with commit message conventions
and development workflow guidelines.
```

#### Breaking change

```
feat(engine)!: change rule evaluate() return type

BREAKING CHANGE: Rule.evaluate() now returns Promise<Finding[]>
instead of Finding[]. Update all rule implementations to be async.
```

## Before You Start — Open an Issue First

If you want to contribute a new feature or a non-trivial change, **please open a GitHub issue before writing any code**.

This matters for a few reasons:

- **Avoid duplicate work** — someone else may already be working on the same thing
- **Confirm it fits the roadmap** — not every idea is the right fit for this tool at this stage, and a quick discussion saves you time
- **Shape the design early** — the maintainer may have context on constraints (API limits, PPTB Desktop compatibility, existing patterns) that affects how something should be built
- **Reserve the feature** — once an issue is open and acknowledged, other contributors know it's taken

### How to open a feature issue

1. Go to [GitHub Issues](https://github.com/aidevme/pptb-solution-health-checker/issues)
2. Click **New issue**
3. Describe what you want to build and why it would be useful — a sentence or two is fine
4. Wait for a response before investing significant time in implementation

For **bug fixes** and small improvements (typos, docs, obvious defects), you can skip the issue and go straight to a PR.

---

## Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make changes** following the project's coding standards

3. **Test your changes** in PPTB Desktop before committing

4. **Commit with conventional format**:
   ```bash
   git commit -m "feat(rules): add new governance rule"
   ```

5. **Push and create a pull request**:
   ```bash
   git push origin feat/your-feature-name
   ```

## Coding Standards

- **TypeScript**: Strict mode (`strict: true`); no `any` — use `unknown` and narrow explicitly
- **React**: Functional components with hooks only; no class components
- **Fluent UI**: Use Fluent UI v9 components; `makeStyles` for all styles — no inline `style` props
- **Rules**: Each rule must implement the `Rule` interface from `src/core/types.ts`; all rules are bundled in code (no remote fetch)
- **Naming**: Use descriptive names; avoid abbreviations unless well-known (e.g. `ALM`, `JS`)

### Interface Naming Convention

Use the `I` prefix **only** for true interface contracts used in dependency inversion:
- `IDataverseClient` — injected into classes that call Dataverse

Do **not** use the `I` prefix on:
- Hook return shapes (e.g. `UseHealthCheckReturn`, not `IUseHealthCheckReturn`)
- Type aliases or DTOs
- Props interfaces (e.g. `ScopeSelectorProps`, not `IScopeSelectorProps`)

### Adding a New Rule

1. Add the rule to the appropriate rule pack in `src/engine/rulePacks/` (`schema.ts`, `security.ts`, `alm.ts`, `flow.ts`, or `capacity.ts`)
2. Implement the `Rule` interface — `id`, `category`, `title`, `description`, `defaultSeverity`, and `evaluate(ctx)`
3. `evaluate()` must return `Promise<Finding[]>`; return an empty array when the rule passes
4. Add the rule to `RULES.md` with its rationale and remediation guidance

## File Organisation

**One file, one job.**

Before adding code to an existing file, ask: *does this belong here?*

- A React component file contains **one component**. Sub-components each get their own file.
- A hook file contains **one hook**.
- Utility functions that could be reused elsewhere live in `src/core/` or `src/hooks/`, not inside the file that first needed them.
- A rule pack file groups rules by category — one category per file.

**The test:** if you have to describe what a file does using the word "and", it probably needs to be split.

## Testing

Before committing:

1. Type check: `npm run typecheck`
2. Validate the PPTB manifest: `npm run validate`
3. Build the project: `npm run build`
4. Test in PPTB Desktop with a real Dataverse connection
5. Verify all features work as expected

## Pull Request Process

1. Update documentation (`README.md`, `RULES.md`) if needed
2. Update `CHANGELOG.md` with your changes
3. Ensure `npm run typecheck`, `npm run validate`, and `npm run build` all pass
4. Request review from maintainers
5. Address review feedback
6. Squash commits if requested

## Questions?

- Open a [GitHub Discussion](https://github.com/aidevme/pptb-solution-health-checker/discussions)
- Check existing [documentation](docs/)
- Review [GitHub Issues](https://github.com/aidevme/pptb-solution-health-checker/issues)

Thank you for contributing!
