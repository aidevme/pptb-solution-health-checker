import { Badge, Text, tokens } from '@fluentui/react-components';
import { Warning24Regular, ErrorCircle24Regular } from '@fluentui/react-icons';
import type { HealthCheckerResult } from '../../core';
import { useStepWarningsPanelStyles } from '../../styles';

export interface StepWarningsPanelProps {
  /**
   * Caller must pass a non-empty array; rendering an empty list is a no-op from
   * the parent's perspective but will still render a panel with an empty body.
   *
   * @remarks
   * The array is the unwrapped `stepWarnings` field from {@link HealthCheckerResult}.
   * The `NonNullable` unwrap means callers must guard for `undefined` before mounting
   * this component — the panel itself has no empty-state fallback.
   */
  stepWarnings: NonNullable<HealthCheckerResult['stepWarnings']>;
}

/**
 * Displays a panel summarising discovery steps that failed or returned partial data.
 *
 * @remarks
 * The panel severity escalates from warning (amber) to error (red) when any entry has
 * `partial: false` — meaning the step produced no usable data at all rather than just
 * incomplete data. The header icon and colour token both change to reflect this distinction.
 *
 * Entries are indexed by array position (`key={i}`) because step names are not guaranteed
 * unique — the same discovery step can fail multiple times across batches and push separate
 * entries with the same `step` string.
 */
export function StepWarningsPanel({ stepWarnings }: StepWarningsPanelProps): JSX.Element {
  const styles = useStepWarningsPanelStyles();
  const hasFullFailures = stepWarnings.some((w) => !w.partial);

  return (
    <div className={`${styles.panel}${hasFullFailures ? ` ${styles.panelError}` : ''}`}>
      <div className={styles.headerRow}>
        {hasFullFailures ? (
          <ErrorCircle24Regular style={{ color: tokens.colorStatusDangerForeground1, flexShrink: 0 }} />
        ) : (
          <Warning24Regular style={{ color: tokens.colorStatusWarningForeground1, flexShrink: 0 }} />
        )}
        <Text
          weight="semibold"
          style={{
            color: hasFullFailures
              ? tokens.colorStatusDangerForeground1
              : tokens.colorStatusWarningForeground1,
          }}
        >
          {hasFullFailures ? 'Some components could not be loaded' : 'Some data may be incomplete'}
        </Text>
        <Badge color="danger" shape="rounded" size="small" style={{ marginLeft: 'auto' }}>
          {stepWarnings.length} {stepWarnings.length === 1 ? 'issue' : 'issues'}
        </Badge>
      </div>

      {stepWarnings.map((w, i) => (
        <div key={i} className={styles.warningRow}>
          <Text className={styles.warningStep}>{w.step}</Text>
          <Text className={styles.warningMessage}>{w.message}</Text>
        </div>
      ))}

      <Text className={styles.hint}>
        Open the <strong>Fetch Log</strong> tab for full API call details.
      </Text>
    </div>
  );
}
