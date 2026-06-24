import { useState, useCallback, useEffect } from 'react';
import {
  Text, Badge, Button, Card, CardHeader, ToggleButton, Tooltip,
  Tab, TabList,
} from '@fluentui/react-components';
import { ChevronDown20Regular, ChevronRight20Regular, ChevronUp20Regular, Grid20Regular, Table20Regular } from '@fluentui/react-icons';
import { Stagger, Slide } from '@fluentui/react-motion-components-preview';
import { useRulesListStyles } from '../styles';
import { RULES, RULE_GROUP_LABELS, RULE_GROUP_ORDER } from '../core/rules/rulesData';
import { RuleCard } from './rules/RuleCard';
import { RulesTable, MAX_ROWS } from './rules/RulesTable';
import { RulesFooter } from './rules/RulesFooter';
import type { RuleGroup, RuleDefinition } from '../core/rules/rulesData';

const FAIL_COUNT = RULES.filter((r) => r.severity === 'fail').length;
const WARN_COUNT = RULES.filter((r) => r.severity === 'warn').length;
const INFO_COUNT = RULES.filter((r) => r.severity === 'info').length;

const GROUPED: Map<RuleGroup, RuleDefinition[]> = new Map();
for (const rule of RULES) {
  if (!GROUPED.has(rule.group)) GROUPED.set(rule.group, []);
  GROUPED.get(rule.group)!.push(rule);
}

const INITIAL_COLLAPSED = new Set<RuleGroup>();

interface CategoryCardsGridProps {
  rules: RuleDefinition[];
  selectedRules: Set<string>;
  onCheckedChange: (id: string, checked: boolean) => void;
}

function CategoryCardsGrid({ rules, selectedRules, onCheckedChange }: CategoryCardsGridProps): JSX.Element {
  const styles = useRulesListStyles();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className={styles.cardsGrid}>
      <Stagger visible={visible}>
        {rules.map((rule) => (
          <Slide key={rule.id} outY="16px">
            <div>
              <RuleCard rule={rule} checked={selectedRules.has(rule.id)} onCheckedChange={onCheckedChange} />
            </div>
          </Slide>
        ))}
      </Stagger>
    </div>
  );
}


const CATEGORY_TOOLTIPS: Record<RuleGroup, string> = {
  schema:
    'Schema & Data — Checks entity structure, field types, alternate keys, and relationships. Flags schema anti-patterns that affect data quality or upgrade safety.',
  plugins:
    'Plugins & Code — Evaluates plugin assembly registration, step configuration, pre/post images, execution order, and filtering attributes. Catches misconfigurations that cause silent failures or performance bottlenecks.',
  flows:
    'Flows & Automation — Reviews cloud flows, classic workflows, and Business Process Flows for unsupported connectors, missing error handling, deprecated triggers, and ownership issues.',
  connections:
    'Connections — Audits connection references for missing or environment-specific connections that block solution import and deployment across environments.',
  alm:
    'ALM & Lifecycle — Validates solution publisher prefix, managed-layer settings, unmanaged active layers, and component ownership patterns that affect healthy ALM practices.',
  security:
    'Security & Access — Inspects security role assignments, team memberships, field-level security profiles, and privilege configurations for over-permissioned or missing access patterns.',
  capacity:
    'Capacity & Performance — Measures table row counts, attachment sizes, audit log volume, and API call patterns that signal capacity risk or performance degradation.',
  webresource:
    'Web Resources — Checks web resource file sizes, deprecated script patterns, missing dependencies, and orphaned resources that unnecessarily inflate solution size.',
};

export function RulesList(): JSX.Element {
  const styles = useRulesListStyles();
  const [collapsed, setCollapsed] = useState<Set<RuleGroup>>(INITIAL_COLLAPSED);
  const [selectedGroups, setSelectedGroups] = useState<Set<RuleGroup>>(new Set());
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set(RULES.map((r) => r.id)));
  const [activeView, setActiveView] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState(1);

  const toggleRule = useCallback((id: string, isChecked: boolean) => {
    setSelectedRules((prev) => {
      const next = new Set(prev);
      if (isChecked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggle = useCallback((group: RuleGroup) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }, []);

  const toggleGroup = useCallback((group: RuleGroup) => {
    setSelectedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
        setCollapsed((c) => { const nc = new Set(c); nc.delete(group); return nc; });
      }
      return next;
    });
  }, []);

  const visibleGroups = selectedGroups.size > 0 ? RULE_GROUP_ORDER.filter((g) => selectedGroups.has(g)) : RULE_GROUP_ORDER;
  const visibleRules = visibleGroups.flatMap((g) => GROUPED.get(g) ?? []);
  const totalPages = Math.max(1, Math.ceil(visibleRules.length / MAX_ROWS));
  const allCollapsed = visibleGroups.every((g) => collapsed.has(g));

  useEffect(() => { setCurrentPage(1); }, [activeView, selectedGroups]);

  const toggleAll = useCallback(() => {
    setCollapsed((prev) => {
      const shouldExpand = visibleGroups.every((g) => prev.has(g));
      const next = new Set(prev);
      if (shouldExpand) {
        visibleGroups.forEach((g) => next.delete(g));
      } else {
        visibleGroups.forEach((g) => next.add(g));
      }
      return next;
    });
  }, [visibleGroups]);

  const groupButtonClass: Record<RuleGroup, string> = {
    schema: styles.catSchema,
    plugins: styles.catPlugins,
    flows: styles.catFlows,
    connections: styles.catConnections,
    alm: styles.catAlm,
    security: styles.catSecurity,
    capacity: styles.catCapacity,
    webresource: styles.catWebresource,
  };

  return (
    <div className={styles.wrapper}>
    <Card className={styles.card}>
      <CardHeader
        header={<Text weight="semibold">Rules ({RULES.length})</Text>}
        action={
          <Tooltip
            content={allCollapsed ? 'Expand all categories' : 'Collapse all categories'}
            relationship="label"
            withArrow
          >
            <Button
              size="small"
              appearance="subtle"
              icon={allCollapsed ? <ChevronDown20Regular /> : <ChevronUp20Regular />}
              onClick={toggleAll}
            />
          </Tooltip>
        }
      />

      <div className={styles.summary}>
        <Text size={200} style={{ color: 'inherit' }}>Governance rules evaluated against your selected solutions:</Text>
        <Badge appearance="filled" color="danger" shape="rounded" size="small">
          {FAIL_COUNT} critical
        </Badge>
        <Badge appearance="filled" color="warning" shape="rounded" size="small">
          {WARN_COUNT} warnings
        </Badge>
        <Badge appearance="filled" color="informative" shape="rounded" size="small">
          {INFO_COUNT} informational
        </Badge>
      </div>

      <TabList
        selectedValue={activeView}
        onTabSelect={(_, data) => setActiveView(data.value as 'card' | 'table')}
        size="small"
      >
        <Tooltip content="Browse rules grouped by category with expandable cards." relationship="description" withArrow>
          <Tab value="card" icon={<Grid20Regular />}>Card View</Tab>
        </Tooltip>
        <Tooltip content="Browse all rules in a compact sortable table." relationship="description" withArrow>
          <Tab value="table" icon={<Table20Regular />}>Table View</Tab>
        </Tooltip>
      </TabList>

      <div className={styles.filterRow}>
        <Tooltip content="Show rules from all categories at once." relationship="description" withArrow>
          <ToggleButton
            size="small"
            appearance="outline"
            checked={selectedGroups.size === 0}
            onClick={() => setSelectedGroups(new Set())}
          >
            Show All Categories
          </ToggleButton>
        </Tooltip>
        {RULE_GROUP_ORDER.map((group) => (
          <Tooltip key={group} content={CATEGORY_TOOLTIPS[group]} relationship="description" withArrow>
            <ToggleButton
              size="small"
              appearance="outline"
              className={groupButtonClass[group]}
              checked={selectedGroups.has(group)}
              onClick={() => toggleGroup(group)}
            >
              {RULE_GROUP_LABELS[group]}
            </ToggleButton>
          </Tooltip>
        ))}
      </div>

      {activeView === 'card' ? (
        visibleGroups.map((group) => {
          const rules = GROUPED.get(group) ?? [];
          const isCollapsed = collapsed.has(group);
          return (
            <div key={group} className={styles.categorySection}>
              <div
                className={styles.categoryHeader}
                role="button"
                tabIndex={0}
                aria-expanded={!isCollapsed}
                onClick={() => toggle(group)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle(group);
                  }
                }}
              >
                {isCollapsed ? <ChevronRight20Regular /> : <ChevronDown20Regular />}
                <Text className={styles.categoryLabel} weight="semibold" size={200}>
                  {RULE_GROUP_LABELS[group]}
                </Text>
                <Badge appearance="outline" shape="rounded" size="small">
                  {rules.length}
                </Badge>
              </div>
              {!isCollapsed && (
                <CategoryCardsGrid rules={rules} selectedRules={selectedRules} onCheckedChange={toggleRule} />
              )}
            </div>
          );
        })
      ) : (
        <RulesTable
          rules={visibleRules}
          selectedRules={selectedRules}
          onSelectionChange={setSelectedRules}
          currentPage={currentPage}
        />
      )}
    </Card>
    <RulesFooter
      selectedCount={selectedRules.size}
      totalCount={RULES.length}
      activeView={activeView}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
    </div>
  );
}
