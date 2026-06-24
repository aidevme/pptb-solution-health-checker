import { useState } from 'react';
import {
  Text,
  Badge,
  ToggleButton,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { RULE_GROUP_ORDER, RULE_GROUP_LABELS } from '../../core/rules/rulesData';
import type { RuleEvalResult, RuleGroup } from '../../core/rules/rulesData';

const SEVERITY_COLOR: Record<string, 'danger' | 'warning' | 'informative'> = {
  fail: 'danger',
  warn: 'warning',
  info: 'informative',
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  summary: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  filterRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
    flexWrap: 'wrap',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  colStatus: { width: '90px' },
  colRuleId: { width: '120px' },
  colSeverity: { width: '80px' },
  colEffort: { width: '80px' },
  ruleIdCell: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
  },
  rowFinding: {
    backgroundColor: tokens.colorNeutralBackground2,
  },
});

export interface RuleResultsViewProps {
  results: RuleEvalResult[];
}

export function RuleResultsView({ results }: RuleResultsViewProps): JSX.Element {
  const styles = useStyles();
  const [selectedGroup, setSelectedGroup] = useState<RuleGroup | null>(null);

  const filteredResults = selectedGroup
    ? results.filter((r) => r.group === selectedGroup)
    : results;

  const failCount = results.filter((r) => r.status === 'finding' && r.severity === 'fail').length;
  const warnCount = results.filter((r) => r.status === 'finding' && r.severity === 'warn').length;
  const infoCount = results.filter((r) => r.status === 'finding' && r.severity === 'info').length;
  const passCount = results.filter((r) => r.status === 'pass').length;

  const toggleGroup = (group: RuleGroup) =>
    setSelectedGroup((prev) => (prev === group ? null : group));

  return (
    <div className={styles.root}>
      <div className={styles.summary}>
        {failCount > 0 && (
          <Badge appearance="filled" color="danger" shape="rounded">{failCount} critical</Badge>
        )}
        {warnCount > 0 && (
          <Badge appearance="filled" color="warning" shape="rounded">{warnCount} warnings</Badge>
        )}
        {infoCount > 0 && (
          <Badge appearance="filled" color="informative" shape="rounded">{infoCount} informational</Badge>
        )}
        {passCount > 0 && (
          <Badge appearance="filled" color="success" shape="rounded">{passCount} passed</Badge>
        )}
      </div>

      <div className={styles.filterRow}>
        <ToggleButton
          size="small"
          appearance="outline"
          checked={selectedGroup === null}
          onClick={() => setSelectedGroup(null)}
        >
          All Categories
        </ToggleButton>
        {RULE_GROUP_ORDER.map((group) => {
          const groupFindings = results.filter((r) => r.group === group && r.status === 'finding').length;
          return (
            <ToggleButton
              key={group}
              size="small"
              appearance="outline"
              checked={selectedGroup === group}
              onClick={() => toggleGroup(group)}
            >
              {RULE_GROUP_LABELS[group]}{groupFindings > 0 ? ` (${groupFindings})` : ''}
            </ToggleButton>
          );
        })}
      </div>

      <div className={styles.tableWrapper}>
        <Table size="small" aria-label="Rule evaluation results">
          <TableHeader>
            <TableRow>
              <TableHeaderCell className={styles.colStatus}>
                <Text weight="semibold" size={200}>Status</Text>
              </TableHeaderCell>
              <TableHeaderCell className={styles.colRuleId}>
                <Text weight="semibold" size={200}>Rule ID</Text>
              </TableHeaderCell>
              <TableHeaderCell>
                <Text weight="semibold" size={200}>Title</Text>
              </TableHeaderCell>
              {selectedGroup === null && (
                <TableHeaderCell>
                  <Text weight="semibold" size={200}>Category</Text>
                </TableHeaderCell>
              )}
              <TableHeaderCell className={styles.colSeverity}>
                <Text weight="semibold" size={200}>Severity</Text>
              </TableHeaderCell>
              <TableHeaderCell className={styles.colEffort}>
                <Text weight="semibold" size={200}>Effort</Text>
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.map((r) => (
              <TableRow key={r.id} className={r.status === 'finding' ? styles.rowFinding : undefined}>
                <TableCell>
                  {r.status === 'finding' ? (
                    <Badge color={SEVERITY_COLOR[r.severity]} shape="rounded" size="small">Finding</Badge>
                  ) : (
                    <Badge color="success" shape="rounded" size="small" appearance="outline">Passed</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className={styles.ruleIdCell}>{r.id}</span>
                </TableCell>
                <TableCell>{r.title}</TableCell>
                {selectedGroup === null && (
                  <TableCell>
                    <Text size={200}>{RULE_GROUP_LABELS[r.group]}</Text>
                  </TableCell>
                )}
                <TableCell>
                  <Badge color={SEVERITY_COLOR[r.severity]} appearance="tint" shape="rounded" size="small">
                    {r.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge appearance="outline" shape="rounded" size="small">{r.effortToFix}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
