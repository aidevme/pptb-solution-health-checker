import { makeStyles, tokens } from '@fluentui/react-components';

export const useRulesListStyles = makeStyles({
  wrapper: {
    marginTop: tokens.spacingVerticalXL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  card: {},
  totalLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  summary: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
    marginBottom: tokens.spacingVerticalS,
  },
  categorySection: {
    marginTop: tokens.spacingVerticalXS,
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalXS}`,
    cursor: 'pointer',
    borderRadius: tokens.borderRadiusMedium,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  categoryLabel: {
    flex: '1 1 auto',
  },
  catSchema: {
    color: tokens.colorPaletteBlueForeground2,
    ':hover': { backgroundColor: tokens.colorPaletteBlueBackground2 },
    '&[aria-pressed="true"]': { backgroundColor: tokens.colorPaletteBlueBackground2 },
  },
  catPlugins: {
    color: tokens.colorPaletteDarkOrangeForeground2,
    ':hover': { backgroundColor: tokens.colorPaletteDarkOrangeBackground2 },
    '&[aria-pressed="true"]': { backgroundColor: tokens.colorPaletteDarkOrangeBackground2 },
  },
  catFlows: {
    color: tokens.colorPalettePurpleForeground2,
    ':hover': { backgroundColor: tokens.colorPalettePurpleBackground2 },
    '&[aria-pressed="true"]': { backgroundColor: tokens.colorPalettePurpleBackground2 },
  },
  catConnections: {
    color: tokens.colorPaletteTealForeground2,
    ':hover': { backgroundColor: tokens.colorPaletteTealBackground2 },
    '&[aria-pressed="true"]': { backgroundColor: tokens.colorPaletteTealBackground2 },
  },
  catAlm: {
    color: tokens.colorPaletteMarigoldForeground2,
    ':hover': { backgroundColor: tokens.colorPaletteMarigoldBackground2 },
    '&[aria-pressed="true"]': { backgroundColor: tokens.colorPaletteMarigoldBackground2 },
  },
  catSecurity: {
    color: tokens.colorPaletteCranberryForeground2,
    ':hover': { backgroundColor: tokens.colorPaletteCranberryBackground2 },
    '&[aria-pressed="true"]': { backgroundColor: tokens.colorPaletteCranberryBackground2 },
  },
  catCapacity: {
    color: tokens.colorPaletteGrapeForeground2,
    ':hover': { backgroundColor: tokens.colorPaletteGrapeBackground2 },
    '&[aria-pressed="true"]': { backgroundColor: tokens.colorPaletteGrapeBackground2 },
  },
  catWebresource: {
    color: tokens.colorPaletteForestForeground2,
    ':hover': { backgroundColor: tokens.colorPaletteForestBackground2 },
    '&[aria-pressed="true"]': { backgroundColor: tokens.colorPaletteForestBackground2 },
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    marginBottom: tokens.spacingVerticalM,
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: tokens.spacingHorizontalM,
  },
});
