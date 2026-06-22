import { makeStyles, tokens } from '@fluentui/react-components';

/**
 * Shared card-row styles used by all list components
 * (FlowsList, PluginsList, BusinessRulesList, ClassicWorkflowsList,
 *  BusinessProcessFlowsList, WebResourcesList, CustomAPIsList,
 *  EnvironmentVariablesList, GlobalChoicesList, CustomConnectorsList).
 *
 * @remarks
 * Components that need component-specific columns define a local `*Row` key
 * that sets `gridTemplateColumns` for their layout and merge it with the
 * common `cardRow` key via `mergeClasses`. `cardRow` itself deliberately omits
 * `gridTemplateColumns` so every consuming component can supply its own template
 * without overriding a shared value.
 *
 * Layout audit constraints — do not change these without updating the audit record:
 * - **AUDIT-005** `nameColumn` must keep `minWidth: 0` + `wordBreak: 'break-word'`.
 * - **AUDIT-006** `detailValue` must keep `minWidth: 0` + overflow protection.
 * - **AUDIT-011** `cardRow` must keep `transition` + `:hover` styles.
 * - **AUDIT-012** `detailsGrid` must use `minmax(200px, 1fr)` — not `250px` or a fixed track.
 */
export const useCardRowStyles = makeStyles({
  /** Outer list wrapper */
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },

  /**
   * Small toggle-buttons inside FilterBar.
   * `minWidth: '56px'` prevents oval pills from collapsing to circles on very short labels.
   */
  filterButton: {
    minWidth: '56px',
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusCircular,
  },

  /**
   * Base card-row — intentionally omits `gridTemplateColumns`.
   * Each consuming component merges a local style key that supplies its own column template.
   */
  cardRow: {
    gap: tokens.spacingHorizontalM,
    alignItems: 'start',
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      boxShadow: tokens.shadow4,
    },
  },

  /** Applied on top of cardRow when a row is expanded */
  cardRowExpanded: {
    backgroundColor: tokens.colorBrandBackground2,
  },

  /** Chevron cell — left-most 24 px column */
  chevron: {
    display: 'flex',
    alignItems: 'center',
    color: tokens.colorNeutralForeground3,
  },

  /** Name + subtitle column. See AUDIT-005 in the hook TSDoc. */
  nameColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
    wordBreak: 'break-word',
  },

  /** Monospace helper for logical names, IDs, plugin message strings, etc. */
  codeText: {
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },

  /** Wrapping text — used for descriptions and field values */
  wrapText: {
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    hyphens: 'auto',
  },

  /** Horizontal badge cluster */
  badgeGroup: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  /**
   * Expanded detail panel beneath the card row.
   * `marginTop: '-4px'` visually fuses the panel to the card row bottom — removes the gap
   * that would otherwise appear between the card border and the panel border.
   */
  expandedDetails: {
    backgroundColor: tokens.colorNeutralBackground2,
    padding: tokens.spacingVerticalL,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderTop: 'none',
    borderRadius: `0 0 ${tokens.borderRadiusMedium} ${tokens.borderRadiusMedium}`,
    marginTop: '-4px',
  },

  /** Responsive details grid inside the expanded panel. See AUDIT-012 in the hook TSDoc. */
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },

  /** Individual label+value pair inside detailsGrid */
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },

  /** Muted label above a detail value */
  detailLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },

  /** Detail value cell. See AUDIT-006 in the hook TSDoc. */
  detailValue: {
    fontWeight: tokens.fontWeightSemibold,
    minWidth: 0,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
  },

  /** Section divider inside the expanded panel */
  section: {
    marginTop: tokens.spacingVerticalM,
  },
});
