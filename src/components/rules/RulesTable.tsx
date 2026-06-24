import { useState } from 'react';
import {
  Text, Badge, Link, Tooltip,
  Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, TableSelectionCell,
  useTableFeatures, useTableSort, useTableSelection, createTableColumn,
} from '@fluentui/react-components';
import { useRulesTableStyles } from '../../styles';
import { RuleDetailsDialog } from './RuleDetailsDialog';
import { RULE_GROUP_LABELS } from '../../core/rules/rulesData';
import type { RuleDefinition } from '../../core/rules/rulesData';

export const MAX_ROWS = 25;

const SEVERITY_COLOR: Record<string, 'danger' | 'warning' | 'informative'> = {
  fail: 'danger',
  warn: 'warning',
  info: 'informative',
};
const SEVERITY_LABEL: Record<string, string> = { fail: 'Fail', warn: 'Warn', info: 'Info' };

const SEVERITY_ORDER: Record<string, number> = { fail: 0, warn: 1, info: 2 };
const EFFORT_ORDER: Record<string, number> = { low: 0, medium: 1, high: 2 };

const COLUMNS = [
  createTableColumn<RuleDefinition>({ columnId: 'id', compare: (a, b) => a.id.localeCompare(b.id) }),
  createTableColumn<RuleDefinition>({ columnId: 'title', compare: (a, b) => a.title.localeCompare(b.title) }),
  createTableColumn<RuleDefinition>({ columnId: 'group', compare: (a, b) => RULE_GROUP_LABELS[a.group].localeCompare(RULE_GROUP_LABELS[b.group]) }),
  createTableColumn<RuleDefinition>({ columnId: 'version', compare: (a, b) => (a.version ?? '').localeCompare(b.version ?? '') }),
  createTableColumn<RuleDefinition>({ columnId: 'severity', compare: (a, b) => (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99) }),
  createTableColumn<RuleDefinition>({ columnId: 'effort', compare: (a, b) => (EFFORT_ORDER[a.effortToFix] ?? 99) - (EFFORT_ORDER[b.effortToFix] ?? 99) }),
  createTableColumn<RuleDefinition>({ columnId: 'description', compare: (a, b) => a.description.localeCompare(b.description) }),
  createTableColumn<RuleDefinition>({ columnId: 'lastUpdated', compare: (a, b) => (a.lastUpdated?.getTime() ?? 0) - (b.lastUpdated?.getTime() ?? 0) }),
];

export interface RulesTableProps {
  rules: RuleDefinition[];
  selectedRules: Set<string>;
  onSelectionChange: (next: Set<string>) => void;
  currentPage?: number;
}

export function RulesTable({ rules, selectedRules, onSelectionChange, currentPage = 1 }: RulesTableProps): JSX.Element {
  const styles = useRulesTableStyles();
  const [detailRule, setDetailRule] = useState<RuleDefinition | null>(null);

  const {
    getRows,
    sort: { sort, toggleColumnSort, getSortDirection },
    selection: { allRowsSelected, someRowsSelected, toggleAllRows, toggleRow, isRowSelected },
  } = useTableFeatures(
    { columns: COLUMNS, items: rules, getRowId: (item) => item.id },
    [
      useTableSort({ defaultSortState: { sortColumn: 'id', sortDirection: 'ascending' } }),
      useTableSelection({
        selectionMode: 'multiselect',
        selectedItems: selectedRules,
        onSelectionChange: (_e, data) => {
          // Preserve selections for rules not visible in this view, merge in the new visible selection.
          const visibleIds = new Set(rules.map((r) => r.id));
          const preserved = new Set([...selectedRules].filter((id) => !visibleIds.has(id)));
          for (const id of data.selectedItems) preserved.add(id as string);
          onSelectionChange(preserved);
        },
      }),
    ]
  );

  const sortedRows = sort(getRows()).slice((currentPage - 1) * MAX_ROWS, currentPage * MAX_ROWS);

  const headerSortProps = (columnId: string) => ({
    onClick: (e: React.MouseEvent) => toggleColumnSort(e, columnId),
    sortDirection: getSortDirection(columnId),
  });

  return (
    <>
      <Table size="small" aria-label="Rules" sortable>
        <TableHeader>
          <TableRow>
            <TableSelectionCell
              checked={allRowsSelected ? true : someRowsSelected ? 'mixed' : false}
              onClick={toggleAllRows}
              checkboxIndicator={{ 'aria-label': 'Select all rules' }}
            />
            <Tooltip content="Unique rule identifier used in reports and exports." relationship="description" withArrow>
              <TableHeaderCell {...headerSortProps('id')} className={styles.colRuleId}>
                <Text weight="semibold" size={200}>Rule ID</Text>
              </TableHeaderCell>
            </Tooltip>
            <Tooltip content="Short name describing what the rule checks." relationship="description" withArrow>
              <TableHeaderCell {...headerSortProps('title')}>
                <Text weight="semibold" size={200}>Title</Text>
              </TableHeaderCell>
            </Tooltip>
            <Tooltip content="Rule category grouping rules by domain." relationship="description" withArrow>
              <TableHeaderCell {...headerSortProps('group')} className={styles.colCategory}>
                <Text weight="semibold" size={200}>Category</Text>
              </TableHeaderCell>
            </Tooltip>
            <Tooltip content="Rule definition version, e.g. 1.0." relationship="description" withArrow>
              <TableHeaderCell {...headerSortProps('version')} className={styles.colVersion}>
                <Text weight="semibold" size={200}>Version</Text>
              </TableHeaderCell>
            </Tooltip>
            <Tooltip content="Fail = blocks healthy ALM · Warn = should be fixed · Info = advisory only." relationship="description" withArrow>
              <TableHeaderCell {...headerSortProps('severity')} className={styles.colSeverity}>
                <Text weight="semibold" size={200}>Severity</Text>
              </TableHeaderCell>
            </Tooltip>
            <Tooltip content="Estimated effort to remediate: low, medium, or high." relationship="description" withArrow>
              <TableHeaderCell {...headerSortProps('effort')} className={styles.colEffort}>
                <Text weight="semibold" size={200}>Effort</Text>
              </TableHeaderCell>
            </Tooltip>
            <Tooltip content="Full explanation of what the rule checks and why it matters." relationship="description" withArrow>
              <TableHeaderCell {...headerSortProps('description')}>
                <Text weight="semibold" size={200}>Description</Text>
              </TableHeaderCell>
            </Tooltip>
            <Tooltip content="Date this rule definition was last updated." relationship="description" withArrow>
              <TableHeaderCell {...headerSortProps('lastUpdated')} className={styles.colLastUpdated}>
                <Text weight="semibold" size={200}>Last Updated</Text>
              </TableHeaderCell>
            </Tooltip>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((row) => {
            const { item: rule } = row;
            return (
              <TableRow key={rule.id} aria-selected={isRowSelected(row.rowId)}>
                <TableSelectionCell
                  checked={isRowSelected(row.rowId)}
                  onClick={(e) => toggleRow(e, row.rowId)}
                  checkboxIndicator={{ 'aria-label': `Select rule ${rule.id}` }}
                />
                <TableCell>
                  <Link
                    as="button"
                    className={styles.ruleIdLink}
                    onClick={() => setDetailRule(rule)}
                  >
                    {rule.id}
                  </Link>
                </TableCell>
                <TableCell>{rule.title}</TableCell>
                <TableCell>{RULE_GROUP_LABELS[rule.group]}</TableCell>
                <TableCell>
                  <Text font="monospace" size={100}>{rule.version}</Text>
                </TableCell>
                <TableCell>
                  <Badge appearance="tint" color={SEVERITY_COLOR[rule.severity]} shape="rounded" size="small">
                    {SEVERITY_LABEL[rule.severity]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge appearance="outline" shape="rounded" size="small">{rule.effortToFix}</Badge>
                </TableCell>
                <TableCell>
                  <Tooltip content={rule.description} relationship="label" withArrow>
                    <div className={styles.cellDescription}>{rule.description}</div>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Text size={100}>{rule.lastUpdated?.toLocaleDateString() ?? '—'}</Text>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {detailRule && (
        <RuleDetailsDialog
          rule={detailRule}
          open={true}
          onDismiss={() => setDetailRule(null)}
        />
      )}
    </>
  );
}
