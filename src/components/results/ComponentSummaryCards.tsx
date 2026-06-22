import { Text, Card, tokens } from '@fluentui/react-components';
import type { BlueprintResult } from '../../core';
import { COMPONENT_TABS } from '../ComponentTabRegistry';
import { useComponentSummaryCardsStyles } from '../../styles';

export interface ComponentSummaryCardsProps {
  result: BlueprintResult;
  selectedCard: string | null;
  onCardClick: (key: string) => void;
}

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
