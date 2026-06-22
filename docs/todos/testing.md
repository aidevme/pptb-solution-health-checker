# TODO: Unit & Integration Testing Strategy

Status: **Pending setup** — no test framework is installed yet.

---

## Decision: Vitest + React Testing Library

| | Vitest | Jest |
|---|---|---|
| ESM native | ✅ First-class | ✅ (via flag) |
| Vite integration | ✅ Zero config | ❌ Custom config required |
| TypeScript (strict) | ✅ Out of the box | ✅ (requires ts-jest) |
| Watch mode / HMR | ✅ Instant rebuild | ❌ Full reload |
| Setup effort | ~5 min | ~15 min |

**Vitest** is the correct choice for a Vite 5 + TypeScript strict + ESM project.

Full stack:
- **vitest** — test runner
- **@testing-library/react** — component rendering
- **@testing-library/user-event** — user interaction simulation
- **@testing-library/jest-dom** — DOM assertions (`.toBeInTheDocument()`)
- **jsdom** — DOM environment for hooks and components
- **@vitest/coverage-v8** — built-in V8 coverage

---

## Step 1 — Install dependencies

```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitest/ui @vitest/coverage-v8 jsdom
```

---

## Step 2 — Create `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
  },
});
```

---

## Step 3 — Create `vitest.setup.ts` (global mock for PPTB APIs)

`window.toolboxAPI` and `window.dataverseAPI` do not exist in jsdom — they must be
mocked globally before any test runs.

```ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

Object.defineProperty(window, 'toolboxAPI', {
  value: {
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
    utils: {
      getCurrentTheme: vi.fn().mockResolvedValue('light'),
    },
    getToolContext: vi.fn().mockResolvedValue({
      connectionUrl: 'https://mock-org.crm.dynamics.com',
    }),
  },
  writable: true,
});

Object.defineProperty(window, 'dataverseAPI', {
  value: {
    queryData: vi.fn().mockResolvedValue({ value: [] }),
    queryMetadata: vi.fn().mockResolvedValue({}),
  },
  writable: true,
});
```

Reset between tests with `vi.clearAllMocks()` in `beforeEach`.

---

## Step 4 — Add scripts to `package.json`

```json
{
  "scripts": {
    "test":          "vitest",
    "test:run":      "vitest run",
    "test:ui":       "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Fluent UI v9 / makeStyles

Griffel generates hashed CSS class names at runtime. Do **not** snapshot class names —
they change on every rebuild.

When testing components, wrap in a minimal `FluentProvider` via a shared test wrapper:

```tsx
// src/test-utils.tsx
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { ThemeProvider } from './contexts/ThemeContext';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <FluentProvider theme={webLightTheme}>{children}</FluentProvider>
    </ThemeProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
```

---

## Test file co-location

Tests live **alongside** source files, not in a separate `__tests__` folder.

```
src/
├── utils/
│   ├── dateFormat.ts
│   └── dateFormat.test.ts
├── hooks/
│   ├── useHealthCheck.ts
│   ├── useHealthCheck.test.ts
│   ├── useConnectionChange.ts
│   └── useConnectionChange.test.ts
├── contexts/
│   ├── ThemeContext.tsx
│   └── ThemeContext.test.tsx
├── components/
│   ├── ProcessingScreen.tsx
│   ├── ProcessingScreen.test.tsx
│   └── scope/
│       ├── ScopeSelector.tsx
│       └── ScopeSelector.test.tsx
└── engine/
    └── rulePacks/
        ├── schema.ts
        └── schema.test.ts   ← one per rule pack
```

Naming:
- Pure TypeScript logic: `*.test.ts`
- React components: `*.test.tsx`
- Multi-component flows: `*.integration.test.tsx`

---

## What to test and in what order

### Tier 1 — Rule `evaluate()` functions (highest ROI)

Rules are pure async functions: `(ctx: RuleContext) => Promise<Finding[]>`.
They have no React or UI dependency — fast, deterministic, easy to assert.

```ts
// src/engine/rulePacks/schema.test.ts
import { describe, it, expect } from 'vitest';
import { jsWebResourceSizeRule } from './schema';
import type { RuleContext } from '../../core/types';

const ctx: RuleContext = { config: {} };

describe('jsWebResourceSizeRule', () => {
  it('returns no findings when resources are within size limit', async () => {
    const findings = await jsWebResourceSizeRule.evaluate(ctx);
    expect(findings).toHaveLength(0);
  });

  it('returns a fail finding when a resource exceeds 300 KB', async () => {
    const findings = await jsWebResourceSizeRule.evaluate({
      config: { oversizedResource: true },
    });
    expect(findings[0].severity).toBe('fail');
    expect(findings[0].ruleId).toBe(jsWebResourceSizeRule.id);
  });
});
```

Every `Rule` must have at minimum:
- A passing case (returns `[]`)
- A failing case (returns the expected `Finding` with the correct `severity`)

### Tier 2 — Custom hooks

**`useConnectionChange`**:

```ts
// src/hooks/useConnectionChange.test.ts
import { renderHook } from '@testing-library/react';
import { useConnectionChange } from './useConnectionChange';
import { vi, beforeEach, describe, it, expect } from 'vitest';

describe('useConnectionChange', () => {
  let capturedHandler: ((_e: unknown, payload: unknown) => void) | null = null;

  beforeEach(() => {
    capturedHandler = null;
    vi.clearAllMocks();
    (window.toolboxAPI.events.on as ReturnType<typeof vi.fn>)
      .mockImplementation((h) => { capturedHandler = h; });
  });

  it('registers event listener on mount', () => {
    renderHook(() => useConnectionChange(vi.fn()));
    expect(window.toolboxAPI.events.on).toHaveBeenCalledTimes(1);
  });

  it('fires callback on connection:created', () => {
    const cb = vi.fn();
    renderHook(() => useConnectionChange(cb));
    capturedHandler?.({}, { event: 'connection:created' });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('removes listener on unmount', () => {
    const { unmount } = renderHook(() => useConnectionChange(vi.fn()));
    unmount();
    expect(window.toolboxAPI.events.off).toHaveBeenCalledTimes(1);
  });
});
```

**`useHealthCheck`** — test state transitions once the rule engine is wired:
- idle → running → complete
- idle → running → cancelled
- idle → running → error

### Tier 3 — Utility functions

```ts
// src/utils/dateFormat.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './dateFormat';

describe('formatDate', () => {
  it('formats ISO string to dd/MM/yyyy', () => {
    expect(formatDate('2026-06-22')).toBe('22/06/2026');
  });
});
```

Pure functions — no mocking required. Start here when first setting up the suite.

### Tier 4 — Components

Focus on components with logic branching. Skip pure placeholder stubs.

```tsx
// src/components/ProcessingScreen.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import { ProcessingScreen } from './ProcessingScreen';

const progress = {
  currentRule: 'schema-001',
  completedRules: 3,
  totalRules: 10,
  percentComplete: 30,
};

describe('ProcessingScreen', () => {
  it('renders current rule name', () => {
    renderWithProviders(
      <ProcessingScreen
        progress={progress}
        recentFetches={[]}
        onCancel={vi.fn()}
        isCancelling={false}
      />,
    );
    expect(screen.getByText('schema-001')).toBeInTheDocument();
  });

  it('shows cancelling label when isCancelling is true', () => {
    renderWithProviders(
      <ProcessingScreen
        progress={progress}
        recentFetches={[]}
        onCancel={vi.fn()}
        isCancelling={true}
      />,
    );
    expect(screen.getAllByText('Cancelling…').length).toBeGreaterThan(0);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ProcessingScreen
        progress={progress}
        recentFetches={[]}
        onCancel={onCancel}
        isCancelling={false}
      />,
    );
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
```

---

## Known challenges

| Challenge | Solution |
|---|---|
| Fluent UI hashed class names | Never assert on class names; use role/text queries |
| `window.toolboxAPI` absent in jsdom | Mock globally in `vitest.setup.ts` |
| Async theme init in `ThemeContext` | Use `await screen.findBy*()` — not `getBy*()` |
| TypeScript strict in test files | Type all `vi.fn()` calls: `vi.fn<[Args], Return>()` |
| ThemeProvider required by all components | Use shared `renderWithProviders` from `src/test-utils.tsx` |

---

## Implementation order

1. Install packages and create `vitest.config.ts` + `vitest.setup.ts`
2. Create `src/test-utils.tsx` provider wrapper
3. Add `test`, `test:run`, `test:coverage` scripts to `package.json`
4. Write `src/utils/dateFormat.test.ts` — first passing test
5. Write `src/hooks/useConnectionChange.test.ts`
6. Write `src/contexts/ThemeContext.test.tsx`
7. Add rule tests as each rule pack is implemented (one test file per pack)
8. Add component tests for `ProcessingScreen`, `ResultsDashboard`, `ScopeSelector`
9. Wire `npm run test:run` into `.github/workflows/publish-npm.yml` before the build step
