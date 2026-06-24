/**
 * Barrel re-export for all React components in the `components/` directory.
 *
 * @remarks
 * Exports are grouped in five sections:
 *
 * 1. **Root components** — flat list of every top-level component.
 *    Includes two wildcard exports with non-component surface:
 *    - `ComponentTabRegistry` also exports the {@link ComponentTabDefinition} interface,
 *      the {@link COMPONENT_TABS} data array, and {@link getDefaultTabKey} — not just a component.
 *    - `componentIcons` exports only Fluent UI icon aliases; it contains no React component
 *      of its own despite living under `components/`.
 *
 * 2. **CrossEntityAutomation sub-components** — wildcard re-export of the internal
 *    `CrossEntityAutomation/` directory barrel. All exports are components; no types leak through.
 *
 * 3. **crossEntity panels** — four presentation sub-panels used inside
 *    {@link CrossEntityAutomationView}.
 *
 * 4. **results panels** — three sub-panels composed inside {@link ResultsDashboard}.
 *
 * 5. **scope panels** — two sub-panels composed inside {@link ScopeSelector}.
 *
 * @packageDocumentation
 */

// Root components
export { AlternateKeysView } from './AlternateKeysView';
export { BusinessProcessFlowsList } from './BusinessProcessFlowsList';
export { BusinessRulesList } from './BusinessRulesList';
export { CanvasAppsList } from './CanvasAppsList';
export { ClassicWorkflowsList } from './ClassicWorkflowsList';
export { CodeViewer } from './CodeViewer';
export * from './ComponentTabRegistry';
export * from './componentIcons';
export { ConnectionReferencesList } from './ConnectionReferencesList';
export { CrossEntityAutomationView } from './CrossEntityAutomationView';
export { CustomAPIDetailView } from './CustomAPIDetailView';
export { CustomAPIsList } from './CustomAPIsList';
export { CustomConnectorsList } from './CustomConnectorsList';
export { CustomPagesList } from './CustomPagesList';
export { EmptyState } from './EmptyState';
export { EntityList } from './EntityList';
export { EnvironmentVariablesList } from './EnvironmentVariablesList';
export { ERDView } from './ERDView';
export { ExecutionPipelineView } from './ExecutionPipelineView';
export { ExecutionTimeline } from './ExecutionTimeline';
export { ExportDialog } from './ExportDialog';
export { ExportProgressOverlay } from './ExportProgressOverlay';
export { ExternalDependenciesView } from './ExternalDependenciesView';
export { FetchDiagnosticsView } from './FetchDiagnosticsView';
export { FieldSecurityProfilesView } from './FieldSecurityProfilesView';
export { FieldsTable } from './FieldsTable';
export { FieldTypeIcon } from './FieldTypeIcon';
export { FilterBar, FilterGroup } from './FilterBar';
export { FlowsList } from './FlowsList';
export { Footer } from './Footer';
export { FormsTable } from './FormsTable';
export { GlobalChoicesList } from './GlobalChoicesList';
export { ModelDrivenAppsList } from './ModelDrivenAppsList';
export { PerformanceRisksPanel } from './PerformanceRisksPanel';
export { PluginPackagesList } from './PluginPackagesList';
export { PluginsList } from './PluginsList';
export { ProcessingScreen } from './ProcessingScreen';
export { RelationshipsView } from './RelationshipsView';
export { RulesList } from './RulesList';
export { ResultsDashboard } from './ResultsDashboard';
export { SchemaView } from './SchemaView';
export { ScopeSelector } from './ScopeSelector';
export { SecurityRolesView } from './SecurityRolesView';
export { SolutionDistributionView } from './SolutionDistributionView';
export { WebResourcesList } from './WebResourcesList';

// CrossEntityAutomation sub-components
export * from './CrossEntityAutomation';

// crossEntity panels
export { GlobalChainMapPanel } from './crossEntity/GlobalChainMapPanel';
export { PipelineTracesPanel } from './crossEntity/PipelineTracesPanel';
export { RiskWarningsSection } from './crossEntity/RiskWarningsSection';
export { SummaryStatsGrid } from './crossEntity/SummaryStatsGrid';

// results panels
export { ComponentBrowser } from './results/ComponentBrowser';
export { ComponentSummaryCards } from './results/ComponentSummaryCards';
export { StepWarningsPanel } from './results/StepWarningsPanel';

// scope panels
export { PublisherScopePanel } from './scope/PublisherScopePanel';
export { SolutionScopePanel } from './scope/SolutionScopePanel';
