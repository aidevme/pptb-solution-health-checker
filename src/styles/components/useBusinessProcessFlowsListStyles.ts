import { makeStyles, tokens } from '@fluentui/react-components';

export const useBusinessProcessFlowsListStyles = makeStyles({
  row: {
    display: 'grid',
    gridTemplateColumns: `${tokens.spacingHorizontalXXL} minmax(200px, 2fr) auto auto auto auto`,
    alignItems: 'start',
  },
  stagesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    marginTop: tokens.spacingVerticalXS,
  },
  stageItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  stageNumber: {
    minWidth: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
  },
  stageArrow: {
    display: 'flex',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground3,
    paddingTop: tokens.spacingVerticalXXS,
    paddingBottom: tokens.spacingVerticalXXS,
  },
});
