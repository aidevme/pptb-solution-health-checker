import { makeStyles, tokens } from '@fluentui/react-components';

// No token exists for these layout values; named constants keep them findable and self-documenting.
// RADIO_CONTENT_INDENT aligns content under the radio-button label (radio indicator ≈ 28 px wide).
const RADIO_CONTENT_INDENT = '28px';
// SOLUTION_DROPDOWN_MIN_WIDTH prevents the Dropdown from collapsing too narrow on small panels.
const SOLUTION_DROPDOWN_MIN_WIDTH = '400px';

export const useSolutionScopePanelStyles = makeStyles({
  radioContent: {
    marginLeft: RADIO_CONTENT_INDENT,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  dropdown: {
    minWidth: SOLUTION_DROPDOWN_MIN_WIDTH,
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
});
