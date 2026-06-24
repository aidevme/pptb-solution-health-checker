import { useState, useCallback } from 'react';
import {
  Button,
  Spinner,
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
import { useHealthChecker } from './hooks/useHealthChecker';
import { useConnectionChange } from './hooks/useConnectionChange';
import type { ScopeSelection } from './types/scope';
import type { RuleEvalResult } from './core/rules/rulesData';
import { Footer } from './components/Footer';
import { RulesList } from './components/RulesList';

type AppScreen = 'scope' | 'rules' | 'confirmation';

/**
 * Root application component — owns the top-level screen state machine.
 *
 * Screen order: scope → rules → confirmation → (processing) → (results)
 *
 * ScopeSelector is always kept mounted during the scope/rules/confirmation
 * flow (hidden with display:none when not active) so its internal selection
 * state survives the Scope → Rules → Back navigation without lifting that
 * state up to App.
 *
 * Processing and Results use early returns, which unmount ScopeSelector —
 * acceptable because "Start Over" from results always starts a fresh analysis.
 */
function App() {
  const styles = useAppStyles();
  const [selectedScope, setSelectedScope] = useState<ScopeSelection | null>(null);
  const [screen, setScreen] = useState<AppScreen>('scope');
  const [loadingMessage, setLoadingMessage] = useState<string | null>('Loading Solutions and Publishers…');
  const [showResult, setShowResult] = useState(false);
  const [ruleEvalResults, setRuleEvalResults] = useState<RuleEvalResult[]>([]);

  const handleLoadingChange = useCallback((isLoading: boolean) => {
    if (isLoading) {
      setLoadingMessage('Loading Solutions and Publishers…');
    } else {
      setLoadingMessage('Loading Solution Health Checker Rules…');
      setTimeout(() => setLoadingMessage(null), 800);
    }
  }, []);

  const { generate, result, progress, isGenerating, isCancelling, error, cancel, reset } = useHealthChecker(
    selectedScope!
  );

  const handleConnectionChange = useCallback(() => {
    reset();
    setSelectedScope(null);
    setScreen('scope');
  }, [reset]);

  useConnectionChange(handleConnectionChange);

  const handleScopeSelected = (scope: ScopeSelection) => {
    setSelectedScope(scope);
    setScreen('rules');
  };

  // Back from rules → scope: only change screen, never clear selectedScope so
  // ScopeSelector's internal checkbox/radio state is preserved.
  const handleBackFromRules = () => {
    setScreen('scope');
  };

  const handleContinueFromRules = () => {
    setScreen('confirmation');
  };

  // "Change Selection" (confirmation) and "Start Over" (results) both do a
  // full reset so the next analysis starts clean.
  const handleChangeSelection = () => {
    reset();
    setSelectedScope(null);
    setScreen('scope');
    setShowResult(false);
    setRuleEvalResults([]);
  };

  const handleGenerate = async () => {
    await generate();
  };

  const handleCancel = () => {
    cancel();
    setScreen('confirmation');
  };

  const handleShowResult = () => {
    setShowResult(true);
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

  // Processing and results use early returns — ScopeSelector unmounts here,
  // which is acceptable because both flows lead to a fresh start.
  if ((isGenerating || (result && !showResult)) && progress) {
    return <ProcessingScreen onCancel={handleCancel} onShowResult={handleShowResult} onEvalComplete={setRuleEvalResults} isCancelling={isCancelling} />;
  }

  if (result && selectedScope && showResult) {
    return (
      <ResultsDashboard
        result={result}
        scope={selectedScope}
        ruleEvalResults={ruleEvalResults}
        onStartOver={handleChangeSelection}
      />
    );
  }

  // Scope / Rules / Confirmation flow.
  // ScopeSelector is always mounted; display:none hides it on non-scope screens
  // so its internal state (radio selections, checkboxes) survives navigation.
  return (
    <>
      {loadingMessage && (
        <div className={styles.loadingOverlay}>
          <Spinner size="huge" label={loadingMessage} />
        </div>
      )}

      <div style={{ display: screen === 'scope' ? undefined : 'none' }}>
        <ScopeSelector onScopeSelected={handleScopeSelected} onLoadingChange={handleLoadingChange} />
      </div>

      {screen === 'rules' && (
        <main id="main-content" className={styles.container} role="main" aria-label="Power Platform Solution Health Checker">
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <div className={styles.headerContent}>
                <Title1>Power Platform Solution Health Checker</Title1>
                <Subtitle1 className={styles.subtitle}>
                  Review and configure the governance rules for your health check
                </Subtitle1>
              </div>
            </div>
          </header>
          <RulesList />
          <div className={styles.buttonGroup}>
            <Button appearance="secondary" onClick={handleBackFromRules}>
              Back
            </Button>
            <Button appearance="primary" onClick={handleContinueFromRules}>
              Continue
            </Button>
          </div>
          <Footer />
        </main>
      )}

      {screen === 'confirmation' && selectedScope && (
        <main id="main-content" className={styles.container} role="main" aria-label="Power Platform Solution Health Checker">
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
              Start Solution Health Analysis
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
      )}
    </>
  );
}

export default App;
