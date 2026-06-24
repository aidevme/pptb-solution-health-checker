import { Tab, TabList, Tooltip } from '@fluentui/react-components';
import type { SelectTabData, SelectTabEvent } from '@fluentui/react-components';
import type { HealthCheckerResult } from '../../core';
import { COMPONENT_TABS } from '../ComponentTabRegistry';
import { useComponentBrowserStyles } from '../../styles';

export interface ComponentBrowserProps {
  result: HealthCheckerResult;
  selectedTab: string;
  /** Must be a {@link ComponentTabDefinition} key — passing an unknown key leaves the content area empty. */
  onTabSelect: (key: string) => void;
}

/**
 * Renders the horizontal tab strip and content panel for the component detail browser.
 *
 * @remarks
 * Tab labels collapse to count-only when not selected, and expand to `"Label (N)"` when
 * selected. This keeps the strip compact across the full tab set while surfacing context
 * for the active tab without requiring a separate count badge.
 *
 * Tabs whose {@link ComponentTabDefinition.hidden} predicate returns `true` for the current
 * result are omitted from both the strip and the content area — their `count` is never
 * surfaced here (only in {@link ComponentSummaryCards}).
 */
export function ComponentBrowser({
  result,
  selectedTab,
  onTabSelect,
}: ComponentBrowserProps): JSX.Element {
  const styles = useComponentBrowserStyles();

  return (
    <>
      <TabList
        selectedValue={selectedTab}
        onTabSelect={(_event: SelectTabEvent, data: SelectTabData) => {
          onTabSelect(data.value as string);
        }}
        size="small"
        className={styles.tabList}
      >
        {COMPONENT_TABS.map((tab) => {
          if (tab.hidden?.(result)) return null;
          const count = tab.count(result);
          const isSelected = selectedTab === tab.key;
          return (
            <Tooltip key={tab.key} content={tab.label} relationship="label">
              <Tab value={tab.key} icon={tab.icon}>
                {isSelected ? `${tab.label} (${count})` : `${count}`}
              </Tab>
            </Tooltip>
          );
        })}
      </TabList>

      <div className={styles.tabContent}>
        {COMPONENT_TABS.map((tab) => {
          if (selectedTab !== tab.key) return null;
          if (tab.hidden?.(result)) return null;
          return <div key={tab.key}>{tab.render(result)}</div>;
        })}
      </div>
    </>
  );
}
