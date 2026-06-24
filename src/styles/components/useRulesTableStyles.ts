import { makeStyles, tokens } from '@fluentui/react-components';

export const useRulesTableStyles = makeStyles({
  colRuleId: { width: '120px' },
  colCategory: { width: '130px' },
  colVersion: { width: '80px' },
  colLastUpdated: { width: '110px' },
  colSeverity: { width: '72px' },
  colEffort: { width: '80px' },
  ruleIdLink: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
  },
  cellDescription: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: '320px',
  },
});
