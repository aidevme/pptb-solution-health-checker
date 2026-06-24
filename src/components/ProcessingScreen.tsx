import { useEffect, useRef, useState } from 'react';
import {
  Text,
  Title2,
  Subtitle2,
  Button,
  ProgressBar,
  Spinner,
  Badge,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  CheckmarkCircle16Regular,
  ErrorCircle16Regular,
  Warning16Regular,
  Info16Regular,
  Record16Regular,
} from '@fluentui/react-icons';
import { RULES, RULE_GROUP_ORDER } from '../core/rules/rulesData';
import type { RuleGroup, RuleEvalResult } from '../core/rules/rulesData';
import { Footer } from './Footer';

const RULE_ID_COLUMN_WIDTH = '100px';
const EVAL_START_DELAY = 1500;
const EVAL_INTERVAL = 110;

const GROUP_SHORT_LABELS: Record<RuleGroup, string> = {
  schema: 'Schema & Data',
  plugins: 'Plugins & Code',
  flows: 'Flows & Automation',
  connections: 'Connections & Env Vars',
  alm: 'ALM & Layering',
  security: 'Security Model',
  capacity: 'Capacity & Governance',
  webresource: 'Web Resources',
};

const GROUP_RANGES = RULE_GROUP_ORDER.map((group) => {
  const firstIdx = RULES.findIndex((r) => r.group === group);
  const count = (RULES as readonly (typeof RULES[number])[]).filter((r) => r.group === group).length;
  return { group, firstIdx, lastIdx: firstIdx + count - 1, count };
});


const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXXL,
    width: '95%',
    maxWidth: '860px',
    margin: '0 auto',
    minHeight: '100vh',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
    '@media (max-width: 768px)': {
      width: '100%',
      padding: tokens.spacingVerticalL,
    },
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
  },
  currentActivity: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  sectionLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  progressText: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase300,
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    maxHeight: '480px',
    overflowY: 'auto',
    paddingRight: tokens.spacingHorizontalXS,
  },
  categoryGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  categoryHeader: {
    display: 'grid',
    gridTemplateColumns: '16px 1fr auto auto',
    gap: tokens.spacingHorizontalS,
    alignItems: 'center',
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalXS}`,
    borderRadius: tokens.borderRadiusSmall,
  },
  catActive: {
    backgroundColor: tokens.colorNeutralBackground2,
  },
  catPending: {
    opacity: '0.45',
  },
  catName: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  catCount: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    fontFamily: tokens.fontFamilyMonospace,
    whiteSpace: 'nowrap',
  },
  ruleRows: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingBottom: tokens.spacingVerticalXS,
  },
  ruleRow: {
    display: 'grid',
    gridTemplateColumns: `14px ${RULE_ID_COLUMN_WIDTH} 1fr auto`,
    gap: tokens.spacingHorizontalXS,
    alignItems: 'baseline',
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase100,
    lineHeight: '1.6',
    color: tokens.colorNeutralForeground2,
  },
  ruleId: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground3,
  },
  ruleTitle: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rowError: { color: tokens.colorStatusDangerForeground1 },
  rowWarn: { color: tokens.colorStatusWarningForeground1 },
  rowPass: { color: tokens.colorNeutralForeground3 },
  rowRunning: { color: tokens.colorBrandForeground1 },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalL,
  },
});

export interface ProcessingScreenProps {
  onCancel: () => void;
  onShowResult?: () => void;
  onEvalComplete?: (results: RuleEvalResult[]) => void;
  isCancelling?: boolean;
}

export function ProcessingScreen({ onCancel, onShowResult, onEvalComplete, isCancelling = false }: ProcessingScreenProps) {
  const styles = useStyles();
  const activeCategoryRef = useRef<HTMLDivElement>(null);

  const [evalResults, setEvalResults] = useState<RuleEvalResult[]>([]);
  const [evalStarted, setEvalStarted] = useState(false);
  const [evalCurrent, setEvalCurrent] = useState(0);

  useEffect(() => {
    activeCategoryRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [evalCurrent]);

  useEffect(() => {
    if (isCancelling) return;
    const t = setTimeout(() => setEvalStarted(true), EVAL_START_DELAY);
    return () => clearTimeout(t);
  }, [isCancelling]);

  useEffect(() => {
    if (!evalStarted || isCancelling || evalCurrent >= RULES.length) return;
    const t = setTimeout(() => {
      const rule = RULES[evalCurrent];
      const rand = Math.random();
      const hasFinding =
        rule.severity === 'fail' ? rand < 0.7
        : rule.severity === 'warn' ? rand < 0.5
        : rand < 0.25;
      setEvalResults((prev) => [
        ...prev,
        { id: rule.id, title: rule.title, group: rule.group, severity: rule.severity, effortToFix: rule.effortToFix, status: hasFinding ? 'finding' : 'pass' },
      ]);
      setEvalCurrent((prev) => prev + 1);
    }, EVAL_INTERVAL);
    return () => clearTimeout(t);
  }, [evalStarted, evalCurrent, isCancelling]);

  useEffect(() => {
    if (evalCurrent >= RULES.length && evalResults.length === RULES.length) {
      onEvalComplete?.(evalResults);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evalCurrent]);

  const evalPercentage = RULES.length > 0 ? evalCurrent / RULES.length : 0;
  const totalFindings = evalResults.filter((r) => r.status === 'finding').length;
  const evalComplete = evalCurrent >= RULES.length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title2>Analysing Solution Health</Title2>
        <Subtitle2 className={styles.subtitle}>Evaluating governance rules against your selected solutions</Subtitle2>
      </div>

      {isCancelling && (
        <div className={styles.currentActivity}>
          <Spinner size="small" />
          <Text weight="semibold">Cancelling, please wait...</Text>
        </div>
      )}

      {!isCancelling && (
        <>
          <div className={styles.sectionHeader}>
            <Text className={styles.sectionLabel}>Governance Rules</Text>
            {totalFindings > 0 && (
              <Badge color="danger" shape="rounded" size="small">
                {totalFindings} finding{totalFindings !== 1 ? 's' : ''}
              </Badge>
            )}
            {evalComplete && totalFindings === 0 && (
              <Badge color="success" shape="rounded" size="small">all passed</Badge>
            )}
          </div>

          <ProgressBar value={evalPercentage} />
          <Text className={styles.progressText}>
            {evalCurrent} of {RULES.length} rules evaluated ({Math.round(evalPercentage * 100)}%)
          </Text>

          <div className={styles.categoryList}>
            {GROUP_RANGES.map(({ group, firstIdx, lastIdx, count }) => {
              const isDone = evalStarted && evalCurrent > lastIdx;
              const isActive = evalStarted && evalCurrent >= firstIdx && evalCurrent <= lastIdx;
              const isPending = !isDone && !isActive;

              const doneInGroup = isDone
                ? evalResults.slice(firstIdx, lastIdx + 1)
                : isActive
                  ? evalResults.slice(firstIdx, evalCurrent)
                  : [];
              const findings = doneInGroup.filter((r) => r.status === 'finding').length;

              const headerIcon = isDone
                ? (findings > 0
                  ? <ErrorCircle16Regular style={{ color: tokens.colorStatusDangerForeground1 }} />
                  : <CheckmarkCircle16Regular style={{ color: tokens.colorStatusSuccessForeground1 }} />)
                : isActive
                  ? <Spinner size="tiny" />
                  : <Record16Regular style={{ color: tokens.colorNeutralForeground3 }} />;

              return (
                <div
                  key={group}
                  className={styles.categoryGroup}
                  ref={isActive ? activeCategoryRef : undefined}
                >
                  <div className={`${styles.categoryHeader} ${isActive ? styles.catActive : isPending ? styles.catPending : ''}`}>
                    {headerIcon}
                    <span className={styles.catName}>{GROUP_SHORT_LABELS[group]}</span>
                    <span className={styles.catCount}>{doneInGroup.length}/{count}</span>
                    {isDone && (
                      <Badge color={findings > 0 ? 'danger' : 'success'} shape="rounded" size="small">
                        {findings > 0 ? `${findings} finding${findings !== 1 ? 's' : ''}` : 'passed'}
                      </Badge>
                    )}
                    {(isActive || isPending) && <span />}
                  </div>

                  {isActive && (
                    <div className={styles.ruleRows}>
                      {doneInGroup.map((r) => {
                        const isFinding = r.status === 'finding';
                        const Icon = isFinding
                          ? (r.severity === 'fail' ? ErrorCircle16Regular
                            : r.severity === 'warn' ? Warning16Regular
                            : Info16Regular)
                          : CheckmarkCircle16Regular;
                        const rowStyle = isFinding
                          ? (r.severity === 'fail' ? styles.rowError : styles.rowWarn)
                          : styles.rowPass;
                        return (
                          <div key={r.id} className={`${styles.ruleRow} ${rowStyle}`}>
                            <Icon style={{ flexShrink: 0, marginTop: '1px' }} />
                            <span className={styles.ruleId}>{r.id}</span>
                            <span className={styles.ruleTitle}>{r.title}</span>
                            <span>{isFinding ? r.severity : 'pass'}</span>
                          </div>
                        );
                      })}
                      {evalCurrent >= firstIdx && evalCurrent <= lastIdx && (
                        <div className={`${styles.ruleRow} ${styles.rowRunning}`}>
                          <Spinner size="tiny" />
                          <span className={styles.ruleId}>{RULES[evalCurrent].id}</span>
                          <span className={styles.ruleTitle}>{RULES[evalCurrent].title}</span>
                          <span>—</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className={styles.buttonContainer}>
        <Button appearance="secondary" onClick={onCancel} disabled={isCancelling}>
          Cancel
        </Button>
        {onShowResult && (
          <Button appearance="primary" onClick={onShowResult} disabled={isCancelling}>
            Show Result
          </Button>
        )}
      </div>

      <Footer />
    </div>
  );
}
