import { makeStyles, tokens } from '@fluentui/react-components';

export const useBusinessRulesListStyles = makeStyles({
  ruleRow: {
    display: 'grid',
    gridTemplateColumns: `${tokens.spacingHorizontalXXL} minmax(200px, 2fr) minmax(100px, 1fr) auto auto auto`,
    alignItems: 'start',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalM,
    borderLeft: `3px solid ${tokens.colorBrandForeground1}`,
  },
  conditionItem: {
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    marginBottom: tokens.spacingVerticalXS,
  },
  actionItem: {
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    marginBottom: tokens.spacingVerticalXS,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    borderLeft: '3px solid transparent',
  },
  badges: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
    marginTop: tokens.spacingVerticalM,
  },
});
