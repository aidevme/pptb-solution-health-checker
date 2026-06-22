import { makeStyles, tokens } from '@fluentui/react-components';

export const usePublisherScopePanelStyles = makeStyles({
  radioContent: {
    marginLeft: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  dropdown: {
    minWidth: '400px',
  },
  selectedItems: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS,
  },
  solutionInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  secondaryText: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  disabledOptionText: {
    color: tokens.colorNeutralForeground4,
    fontSize: tokens.fontSizeBase200,
    fontStyle: 'italic',
  },
  subOptions: {
    marginTop: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
});
