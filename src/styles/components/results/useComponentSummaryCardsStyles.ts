import { makeStyles, tokens } from '@fluentui/react-components';

export const useComponentSummaryCardsStyles = makeStyles({
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS,
  },
  summaryCard: {
    padding: tokens.spacingVerticalS,
  },
  summaryCardDisabled: {
    padding: tokens.spacingVerticalS,
    opacity: 0.5,
    cursor: 'default',
  },
  summaryCardSelected: {
    padding: tokens.spacingVerticalS,
    borderBottom: `3px solid ${tokens.colorBrandForeground1}`,
  },
  summaryCardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    alignItems: 'center',
    textAlign: 'center',
  },
  summaryCount: {
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightHero800,
  },
  summaryLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground2,
  },
});
