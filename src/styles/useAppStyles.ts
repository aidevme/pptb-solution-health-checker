import { makeStyles, tokens } from '@fluentui/react-components';

export const useAppStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXXL,
    width: '95%',
    maxWidth: '1600px',
    margin: '0 auto',
    minHeight: '100vh',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    '@media (max-width: 768px)': {
      width: '100%',
      padding: tokens.spacingVerticalL,
    },
  },
  retryButton: {
    marginTop: tokens.spacingVerticalS,
  },
  header: {
    marginBottom: tokens.spacingVerticalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    position: 'relative',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    flex: 1,
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
  },
  confirmationCard: {
    marginBottom: tokens.spacingVerticalL,
  },
  scopeDetails: {
    padding: tokens.spacingVerticalM,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  label: {
    fontWeight: tokens.fontWeightSemibold,
  },
  value: {
    color: tokens.colorNeutralForeground2,
  },
  readyCard: {
    marginBottom: tokens.spacingVerticalL,
    textAlign: 'center',
    padding: tokens.spacingVerticalXXL,
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalL,
  },
  successCard: {
    marginBottom: tokens.spacingVerticalL,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalM,
  },
  summaryItem: {
    textAlign: 'center',
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  summaryValue: {
    fontSize: tokens.fontSizeHero900,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
  },
  summaryLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalXS,
  },
  errorContainer: {
    marginBottom: tokens.spacingVerticalL,
  },
  loadingOverlay: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground1,
    zIndex: 9999,
  },
});
