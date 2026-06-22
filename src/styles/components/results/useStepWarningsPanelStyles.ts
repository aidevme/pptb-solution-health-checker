import { makeStyles, tokens } from '@fluentui/react-components';

export const useStepWarningsPanelStyles = makeStyles({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorStatusWarningBorderActive}`,
    backgroundColor: tokens.colorStatusWarningBackground1,
  },
  panelError: {
    border: `1px solid ${tokens.colorStatusDangerBorderActive}`,
    backgroundColor: tokens.colorStatusDangerBackground1,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  warningRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
  },
  warningStep: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    minWidth: '110px',
    fontWeight: tokens.fontWeightSemibold,
  },
  warningMessage: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  hint: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
});
