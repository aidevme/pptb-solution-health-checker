/**
 * Application entry point — Vite mounts the React tree here.
 *
 * @remarks
 * **Render tree**
 * ```
 * StrictMode
 *   └── ThemeProvider       (owns theme state, exposes useTheme)
 *         └── AppWithTheme  (bridges ThemeProvider → FluentProvider)
 *               └── FluentProvider  (applies the active Fluent UI theme token set)
 *                     └── App
 * ```
 * `AppWithTheme` is a named component rather than an inline JSX expression because
 * `useTheme()` is a React hook — it can only be called inside a component that is
 * itself a descendant of `ThemeProvider`.
 *
 * **Keyboard-navigation class**
 * `Tab` keydown adds `keyboard-nav` to `<body>`; `mousedown` removes it.
 * `accessibility.css` uses this class to show enhanced focus rings exclusively for
 * keyboard users — mouse users never trigger the extra outline.
 *
 * **Global stylesheets**
 * `accessibility.css` and `design-system.css` are imported here so they load once
 * for the entire application. Do not import them inside individual components.
 *
 * @packageDocumentation
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';
import App from './App';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './styles/accessibility.css';
import './styles/design-system.css';

// Detect keyboard navigation for enhanced focus indicators
window.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
});

window.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

function AppWithTheme() {
  const { theme } = useTheme();

  return (
    <FluentProvider theme={theme}>
      <App />
    </FluentProvider>
  );
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  </React.StrictMode>
);
