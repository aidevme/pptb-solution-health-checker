import { Text, Card, tokens } from '@fluentui/react-components';
import type { HealthCheckerResult } from '../../core';
import { COMPONENT_TABS } from '../ComponentTabRegistry';
import { useComponentSummaryCardsStyles } from '../../styles';

export interface ComponentSummaryCardsProps {
  result: HealthCheckerResult;
  /**
   * Key of the currently active component tab, or `null` when no tab has been
   * explicitly selected yet.
   *
   * @remarks
   * Cards with zero-count components are rendered with `appearance="outline"` and have
   * no click handler — they cannot become selected even if `selectedCard` matches their key.
   */
  selectedCard: string | null;
  /** Must be a {@link ComponentTabDefinition} key — zero-count cards never fire this callback. */
  onCardClick: (key: string) => void;
}

/**
 * Renders the grid of summary cards, one per registered component tab.
 *
 * @remarks
 * Cards with zero items are non-interactive (`appearance="outline"`, no `onClick`).
 * Unlike {@link ComponentBrowser}, this grid always shows all tabs regardless of
 * their `hidden` predicate — hiding a tab from the browser does not remove its
 * count card from the summary view.
 */
export function ComponentSummaryCards({
  result,
  selectedCard,
  onCardClick,
}: ComponentSummaryCardsProps): JSX.Element {
  const styles = useComponentSummaryCardsStyles();

  return (
    <div className={styles.summaryGrid}>
      {COMPONENT_TABS.map((tab) => {
        const count = tab.count(result);
        const hasData = count > 0;
        const isSelected = selectedCard === tab.key;

        return (
          <Card
            key={tab.key}
            className={
              !hasData
                ? styles.summaryCardDisabled
                : isSelected
                ? styles.summaryCardSelected
                : styles.summaryCard
            }
            appearance={hasData ? 'filled' : 'outline'}
            onClick={hasData ? () => onCardClick(tab.key) : undefined}
            style={hasData ? { cursor: 'pointer' } : undefined}
          >
            <div className={styles.summaryCardContent}>
              <span
                style={{
                  color: hasData ? tokens.colorBrandForeground1 : tokens.colorNeutralForeground4,
                  lineHeight: 1,
                }}
              >
                {tab.icon}
              </span>
              <Text className={styles.summaryCount}>{count}</Text>
              <Text className={styles.summaryLabel}>{tab.label}</Text>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
