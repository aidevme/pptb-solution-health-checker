# `src/contexts`

React context providers for cross-cutting concerns shared across the component tree.

---

## `ThemeContext.tsx`

Manages the active Fluent UI theme, driven by the PPTB Desktop host with an automatic OS fallback.

### Exports

| Export | Kind | Description |
|---|---|---|
| `ThemeProvider` | Component | Wraps the app root; resolves and provides the active theme |
| `useTheme` | Hook | Reads `theme` and `currentTheme` from the nearest `ThemeProvider` |

### `ThemeProvider`

Place `ThemeProvider` at the app root, above any component that needs theme tokens.

On mount it reads the active theme from `window.toolboxAPI.utils.getCurrentTheme`. If that API is absent (running outside PPTB Desktop) or its promise rejects, it silently falls back to the OS `prefers-color-scheme` media query. After the initial read it subscribes to the PPTB `settings:updated` event and updates the theme whenever the user changes it in PPTB settings. The subscription is torn down on unmount.

**App root wiring:**

```tsx
// main.tsx
function AppWithTheme() {
  const { theme } = useTheme();
  return (
    <FluentProvider theme={theme}>
      <App />
    </FluentProvider>
  );
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  </React.StrictMode>
);
```

### `useTheme`

Returns a `ThemeContextValue` object with two fields:

| Field | Type | Description |
|---|---|---|
| `theme` | `Theme` | Fully resolved Fluent UI token object — pass directly to `FluentProvider`'s `theme` prop |
| `currentTheme` | `'light' \| 'dark'` | Human-readable mode identifier — use for conditional rendering that cannot be expressed through tokens |

Both fields update reactively whenever the host or OS reports a theme change.

Throws `Error` if called outside a `ThemeProvider` tree.

**Usage:**

```tsx
function MyComponent() {
  const { theme, currentTheme } = useTheme();

  return (
    <>
      <FluentProvider theme={theme}>
        <SomeFluentComponent />
      </FluentProvider>
      {currentTheme === 'dark' && <DarkModeIndicator />}
    </>
  );
}
```

### Theme resolution priority

```
PPTB Desktop setting (window.toolboxAPI.utils.getCurrentTheme)
  └─ success → apply PPTB theme
  └─ absent or rejected → OS prefers-color-scheme media query
       └─ true  → 'dark'
       └─ false → 'light'
```

Live updates come exclusively from the PPTB `settings:updated` event — the OS media query is only read once on mount.
