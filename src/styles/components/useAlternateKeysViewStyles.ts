import { makeStyles, tokens } from '@fluentui/react-components';

export const useAlternateKeysViewStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  primaryKeyCard: {
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorBrandBackground2,
  },
  primaryKeyContent: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  keyIcon: {
    fontSize: '32px',
    color: tokens.colorBrandForeground1,
  },
  keysList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  keyCard: {
    padding: tokens.spacingVerticalM,
  },
  keyHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalS,
  },
  keyAttributes: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  emptyState: {
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
});
