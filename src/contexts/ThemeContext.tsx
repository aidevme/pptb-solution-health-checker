import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { webLightTheme, webDarkTheme, Theme } from '@fluentui/react-components';

/**
 * Shape of the value exposed by {@link ThemeContext}.
 *
 * @remarks
 * `theme` is a fully resolved Fluent UI `Theme` token object — pass it directly
 * to `FluentProvider`'s `theme` prop. `currentTheme` is the human-readable mode
 * identifier derived from the same source; use it for conditional logic (e.g.
 * choosing icon variants or chart palette colours) without having to inspect
 * individual token values.
 *
 * Both fields are updated atomically whenever the PPTB host fires a
 * `settings:updated` event or when the OS colour scheme changes as a fallback.
 */
interface ThemeContextValue {
  /**
   * Resolved Fluent UI token object for the active colour mode.
   *
   * @remarks
   * Corresponds to either `webLightTheme` or `webDarkTheme` from
   * `@fluentui/react-components`. Pass directly to `FluentProvider`'s `theme`
   * prop — do not read individual tokens from this object at call sites; consume
   * them through Fluent UI's `useThemeClassName` or `makeStyles` instead.
   */
  theme: Theme;

  /**
   * Human-readable identifier for the active colour mode.
   *
   * @remarks
   * Always either `'light'` or `'dark'`. Sourced from PPTB Desktop's theme
   * setting when available, otherwise from the OS `prefers-color-scheme` media
   * query. Use this field for conditional rendering logic rather than inspecting
   * token values in `theme`.
   */
  currentTheme: 'light' | 'dark';
}

/**
 * React context that carries the active {@link ThemeContextValue} through the
 * component tree.
 *
 * @remarks
 * The initial value is `undefined`; {@link ThemeProvider} always supplies a
 * concrete value before any consumer renders. Do not read from or render against
 * this context object directly — use {@link useTheme} instead, which enforces
 * the provider-presence invariant at runtime.
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Provides Fluent UI theme tokens to the component tree, driven by the PPTB
 * host when available.
 *
 * @remarks
 * On mount, the provider first attempts to read the active theme via
 * `window.toolboxAPI.utils.getCurrentTheme`. If that API is absent (e.g. the
 * app is opened outside PPTB Desktop) or its promise rejects, the provider
 * silently falls back to the OS `prefers-color-scheme` media query.
 *
 * After the initial read, the provider subscribes to PPTB's `settings:updated`
 * event via `window.toolboxAPI.events.on` and updates the theme whenever the
 * user changes it in PPTB settings. The subscription is torn down on unmount.
 *
 * `ThemeProvider` must be an ancestor of any component that calls
 * `FluentProvider` — place it at the app root so that the resolved `theme`
 * token object is available before `FluentProvider` renders.
 *
 * @param children - The subtree that gains access to theme tokens via
 * {@link useTheme}. Wrap `FluentProvider` inside this subtree so it receives
 * the resolved token object.
 *
 * @example App root wiring
 * ```tsx
 * // main.tsx — ThemeProvider wraps an intermediate component that calls
 * // useTheme() and passes the token object down to FluentProvider.
 * function AppWithTheme() {
 *   const { theme } = useTheme();
 *   return (
 *     <FluentProvider theme={theme}>
 *       <App />
 *     </FluentProvider>
 *   );
 * }
 *
 * ReactDOM.createRoot(root).render(
 *   <React.StrictMode>
 *     <ThemeProvider>
 *       <AppWithTheme />
 *     </ThemeProvider>
 *   </React.StrictMode>
 * );
 * ```
 *
 * @public
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(webLightTheme);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const applyTheme = (mode: 'light' | 'dark') => {
      setCurrentTheme(mode);
      setTheme(mode === 'dark' ? webDarkTheme : webLightTheme);
    };

    const fallbackToSystem = () => {
      const isDark =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(isDark ? 'dark' : 'light');
    };

    const pptbAPI = window.toolboxAPI;

    // Read initial theme
    if (pptbAPI?.utils?.getCurrentTheme) {
      pptbAPI.utils
        .getCurrentTheme()
        .then((mode: 'light' | 'dark') => applyTheme(mode))
        .catch(fallbackToSystem);
    } else {
      fallbackToSystem();
    }

    // Re-read theme whenever settings are saved
    const handleEvent = (_event: unknown, payload: unknown) => {
      const p = payload as { event?: unknown; data?: { theme?: unknown } } | null | undefined;
      if (p?.event === 'settings:updated' && p.data?.theme) {
        applyTheme(p.data.theme as 'light' | 'dark');
      }
    };
    pptbAPI?.events?.on(handleEvent);
    return () => {
      pptbAPI?.events?.off(handleEvent);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Returns the current Fluent UI theme and its mode identifier.
 *
 * @remarks
 * Reads from {@link ThemeContext}. The returned `theme` object is the fully
 * resolved Fluent UI token set — pass it to `FluentProvider`'s `theme` prop.
 * The returned `currentTheme` string (`'light'` or `'dark'`) is useful for
 * conditional rendering that cannot be expressed through Fluent UI tokens alone.
 *
 * Both values update reactively whenever {@link ThemeProvider} detects a theme
 * change from the PPTB host or the OS fallback.
 *
 * @returns A {@link ThemeContextValue} containing `theme` (the Fluent UI token
 * object to pass to `FluentProvider`) and `currentTheme` (the active colour
 * mode identifier, either `'light'` or `'dark'`).
 *
 * @throws {@link Error}
 * Thrown when called outside of a {@link ThemeProvider} tree.
 *
 * @example Consuming both fields
 * ```tsx
 * function MyComponent() {
 *   const { theme, currentTheme } = useTheme();
 *
 *   return (
 *     <>
 *       <FluentProvider theme={theme}>
 *         <SomeFluentComponent />
 *       </FluentProvider>
 *       {currentTheme === 'dark' && <DarkModeIndicator />}
 *     </>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
