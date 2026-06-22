import { useState, useCallback } from 'react';
import {
  Button,
  Title1,
  Subtitle1,
  Text,
  Card,
  CardHeader,
  Tooltip,
  tokens,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from '@fluentui/react-components';
import { useAppStyles } from './styles/useAppStyles';
import { ScopeSelector } from './components/ScopeSelector';
import { ProcessingScreen } from './components/ProcessingScreen';
import { ResultsDashboard } from './components/ResultsDashboard';
import { useBlueprint } from './hooks/useBlueprint';
import { useConnectionChange } from './hooks/useConnectionChange';
import type { ScopeSelection } from './types/scope';
import { Footer } from './components/Footer';


/**
 * Root application component — owns the top-level screen state machine.
 *
 * @remarks
 * Renders one of four screens via sequential early returns, in priority order:
 *
 * 1. **ScopeSelector** — no scope confirmed yet (`!selectedScope || !showConfirmation`)
 * 2. **ProcessingScreen** — generation is active and first progress tick has arrived (`isGenerating && progress`)
 * 3. **ResultsDashboard** — a completed result is available
 * 4. **Confirmation screen** (inline JSX) — scope chosen but generation not yet started,
 *    or generation failed and the error banner + Retry button are shown
 *
 * **`selectedScope!` non-null assertion**
 * `useBlueprint` must be called unconditionally (rules of hooks), but `selectedScope`
 * starts as `null`. The assertion is safe because `generate()` is only reachable from
 * the confirmation screen, which requires `selectedScope` to be non-null.
 *
 * **`handleConnectionChange` stability**
 * Wrapped in `useCallback([reset])` to satisfy `useConnectionChange`'s requirement
 * that the callback be stable across renders. `reset` from `useBlueprint` is itself
 * stable (memoised with `useCallback([])`).
 *
 * **`handleCancel` flow**
 * Cancelling returns to the confirmation screen (`setShowConfirmation(true)`), not to
 * scope selection — the user already chose a scope and is most likely retrying.
 *
 * **`handleConnectionChange` teardown order**
 * `reset()` is called before `setSelectedScope(null)` so any in-flight generation
 * is aborted before the scope reference is cleared.
 */
function App() {
  const styles = useAppStyles();
  const [selectedScope, setSelectedScope] = useState<ScopeSelection | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { generate, result, progress, recentFetches, isGenerating, isCancelling, error, cancel, reset } = useBlueprint(
    selectedScope!
  );

  // Reset app to scope selector when connection changes
  const handleConnectionChange = useCallback(() => {
    reset(); // Clear blueprint state first
    setSelectedScope(null);
    setShowConfirmation(false);
  }, [reset]);

  useConnectionChange(handleConnectionChange);

  const handleScopeSelected = (scope: ScopeSelection) => {
    setSelectedScope(scope);
    setShowConfirmation(true);
  };

  const handleChangeSelection = () => {
    setSelectedScope(null);
    setShowConfirmation(false);
  };

  const handleGenerate = async () => {
    await generate();
  };

  const handleCancel = () => {
    cancel();
    setShowConfirmation(true);
  };

  const renderScopeSummary = (scope: ScopeSelection) => {
    if (scope.type === 'publisher') {
      return (
        <div className={styles.scopeDetails}>
          <div>
            <Text className={styles.label}>Scope: </Text>
            <Text className={styles.value}>
              {scope.mode === 'all-solutions'
                ? `All solutions from ${scope.publisherNames.join(', ')}`
                : `Specific solutions from ${scope.publisherNames.join(', ')}`}
            </Text>
          </div>
          {scope.mode === 'specific-solutions' && scope.solutionNames && (
            <div>
              <Text className={styles.label}>Solutions: </Text>
              <Text className={styles.value}>{scope.solutionNames.join(', ')}</Text>
            </div>
          )}
          <div>
            <Text className={styles.label}>Include System Entities: </Text>
            <Text className={styles.value}>{scope.includeSystem ? 'Yes' : 'No'}</Text>
          </div>
        </div>
      );
    }

    if (scope.type === 'solution') {
      return (
        <div className={styles.scopeDetails}>
          <div>
            <Text className={styles.label}>Scope: </Text>
            <Text className={styles.value}>Selected Solutions</Text>
          </div>
          <div>
            <Text className={styles.label}>Solutions: </Text>
            <Text className={styles.value}>{scope.solutionNames.join(', ')}</Text>
          </div>
          <div>
            <Text className={styles.label}>Include System Entities: </Text>
            <Text className={styles.value}>{scope.includeSystem ? 'Yes' : 'No'}</Text>
          </div>
        </div>
      );
    }

    return null;
  };

  // Show scope selector
  if (!selectedScope || !showConfirmation) {
    return <ScopeSelector onScopeSelected={handleScopeSelected} />;
  }

  // Show processing screen
  if (isGenerating && progress) {
    return <ProcessingScreen progress={progress} recentFetches={recentFetches} onCancel={handleCancel} isCancelling={isCancelling} />;
  }

  // Show results
  if (result && selectedScope) {
    return (
      <ResultsDashboard
        result={result}
        scope={selectedScope}
        onStartOver={handleChangeSelection}
      />
    );
  }

  // Show confirmation screen
  return (
    <main id="main-content" className={styles.container} role="main" aria-label="Power Platform Solution Blueprint">
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerContent}>
            <Title1>Power Platform Solution Health Checker</Title1>
            <Subtitle1 className={styles.subtitle}>
              Complete health checks for your Power Platform solutions
            </Subtitle1>
          </div>
        </div>
      </header>

      {error && (
        <div className={styles.errorContainer}>
          <MessageBar intent="error">
            <MessageBarBody>
              <MessageBarTitle>Generation Failed</MessageBarTitle>
              {error.message}
              <br />
              <Button
                appearance="secondary"
                size="small"
                onClick={handleGenerate}
                className={styles.retryButton}
              >
                Retry
              </Button>
            </MessageBarBody>
          </MessageBar>
        </div>
      )}

      <Card className={styles.confirmationCard}>
        <CardHeader header={<Text weight="semibold">Selected Scope</Text>} />
        {renderScopeSummary(selectedScope)}
      </Card>

      <Card className={styles.readyCard}>
        <Text size={500} weight="semibold">
          Start Analysing Solution(s) Health
        </Text>
        <Text style={{ marginTop: tokens.spacingVerticalM }}>
          Runs a comprehensive set of governance rules across your selected solutions — evaluating
          schema design, security configuration, ALM hygiene, flow quality, and capacity risks.
          Findings are grouped by severity (fail, warn, info) with remediation guidance for each issue.
        </Text>
      </Card>

      <div className={styles.buttonGroup}>
        <Tooltip
          content="Go back to scope selection to change the publisher or solution scope before running the health check."
          relationship="description" withArrow
        >
          <Button appearance="secondary" onClick={handleChangeSelection}>
            Change Selection
          </Button>
        </Tooltip>
        <Tooltip
          content="Run all governance rules against the selected scope. Findings will be grouped by severity — failures, warnings, and informational items — each with remediation guidance."
          relationship="description" withArrow
        >
          <Button appearance="primary" onClick={handleGenerate} aria-label="Analyse Solution Health">
            Analyse Solution Health
          </Button>
        </Tooltip>
      </div>

      <Footer />
    </main>
  );
}

export default App;
