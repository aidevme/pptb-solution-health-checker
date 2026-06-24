import { version } from '../../../package.json';
import type { HealthCheckerResult } from '../types/healthChecker.js';
import type { IReporter } from './IReporter.js';

interface JsonExportWrapper {
  exportVersion: string;
  exportedAt: string;
  toolVersion: string;
  healthChecker: Record<string, unknown>;
}

/**
 * Exports a {@link HealthCheckerResult} as a pretty-printed JSON string wrapped in version metadata.
 *
 * @remarks
 * Environment variable `currentValue` and `defaultValue` fields are intentionally omitted
 * from the output and replaced with `hasCurrentValue`/`hasDefaultValue` boolean flags.
 * This prevents secrets (connection strings, API keys) stored in environment variable
 * current values from leaking into exported files.
 *
 * `Map` instances throughout the result are serialized to plain objects so the JSON is
 * portable — `JSON.stringify` does not handle `Map` natively.
 */
export class JsonReporter implements IReporter<string> {
  private readonly toolVersion = version;

  generate(result: HealthCheckerResult): string {
    // Create export wrapper with metadata
    const exportWrapper: JsonExportWrapper = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      toolVersion: this.toolVersion,
      healthChecker: this.serializeResult(result),
    };

    // Pretty-print with 2-space indentation
    return JSON.stringify(exportWrapper, this.jsonReplacer, 2);
  }

  private serializeResult(result: HealthCheckerResult): Record<string, unknown> {
    return {
      metadata: {
        ...result.metadata,
        generatedAt: result.metadata.generatedAt.toISOString(),
      },
      entities: result.entities,
      summary: result.summary,
      plugins: result.plugins,
      pluginsByEntity: this.mapToObject(result.pluginsByEntity),
      flows: result.flows,
      flowsByEntity: this.mapToObject(result.flowsByEntity),
      businessRules: result.businessRules,
      businessRulesByEntity: this.mapToObject(result.businessRulesByEntity),
      classicWorkflows: result.classicWorkflows,
      classicWorkflowsByEntity: this.mapToObject(result.classicWorkflowsByEntity),
      businessProcessFlows: result.businessProcessFlows,
      businessProcessFlowsByEntity: this.mapToObject(result.businessProcessFlowsByEntity),
      customAPIs: result.customAPIs,
      environmentVariables: result.environmentVariables.map(ev => ({
        ...ev,
        currentValue: undefined,
        defaultValue: undefined,
        hasCurrentValue: !!ev.currentValue,
        hasDefaultValue: !!ev.defaultValue,
      })),
      connectionReferences: result.connectionReferences,
      globalChoices: result.globalChoices,
      customConnectors: result.customConnectors,
      canvasApps: result.canvasApps,
      customPages: result.customPages,
      modelDrivenApps: result.modelDrivenApps,
      webResources: result.webResources,
      webResourcesByType: this.mapToObject(result.webResourcesByType),
      erd: result.erd,
      crossEntityAnalysis: result.crossEntityAnalysis
        ? {
            entityViews: this.mapToObject(result.crossEntityAnalysis.entityViews),
            chainLinks: result.crossEntityAnalysis.chainLinks,
            totalEntryPoints: result.crossEntityAnalysis.totalEntryPoints,
            totalBranches: result.crossEntityAnalysis.totalBranches,
            risks: result.crossEntityAnalysis.risks,
            allEntityPipelines: this.mapToObject(result.crossEntityAnalysis.allEntityPipelines),
            noFilterPluginCount: result.crossEntityAnalysis.noFilterPluginCount,
          }
        : undefined,
      externalEndpoints: result.externalEndpoints,
      solutionDistribution: result.solutionDistribution,
      securityRoles: result.securityRoles,
      fieldSecurityProfiles: result.fieldSecurityProfiles,
      attributeMaskingRules: result.attributeMaskingRules,
      columnSecurityProfiles: result.columnSecurityProfiles,
    };
  }

  private mapToObject<T>(map: Map<string, T>): Record<string, T> {
    const obj: Record<string, T> = {};
    for (const [key, value] of map.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  private jsonReplacer(_key: string, value: unknown): unknown {
    // Convert undefined to null
    if (value === undefined) {
      return null;
    }

    // Convert Date to ISO string
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Convert Map to object
    if (value instanceof Map) {
      const obj: Record<string, unknown> = {};
      for (const [k, v] of value.entries()) {
        obj[k] = v;
      }
      return obj;
    }

    return value;
  }
}
