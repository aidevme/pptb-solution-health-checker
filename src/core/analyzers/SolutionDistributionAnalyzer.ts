import type {
  SolutionDistribution,
  ComponentCounts,
  SharedComponent,
  SolutionDependency,
  HealthCheckerResult,
} from '../types/healthChecker.js';
import type { Solution } from '../types.js';
import { normalizeGuid } from '../utils/guid.js';

/**
 * Breaks down component counts and inferred dependencies per solution.
 *
 * @remarks
 * Accurate component counting requires `solutionComponentMap` (solution ID → Set of
 * component IDs from the `solutioncomponent` entity). When that map is absent the
 * fallback returns all-zero counts — this is intentional to avoid falsely attributing
 * every component to every solution.
 *
 * Shared-component detection is deferred: implementing it correctly requires a reverse
 * index (component ID → solution IDs) which is not yet built during discovery.
 *
 * Dependency inference uses publisher customization prefix matching on schema/logical names,
 * not the Dataverse `dependency` entity. This heuristic may produce false positives for
 * entities that share a prefix by coincidence.
 */
export class SolutionDistributionAnalyzer {
  /**
   * @param solutionComponentMap - Solution ID → Set of component IDs from the
   * `solutioncomponent` Dataverse table. All IDs must be lower-cased GUIDs (no braces).
   * When omitted, component counts fall back to zeros.
   */
  analyzeSolutionDistribution(
    solutions: Solution[],
    result: HealthCheckerResult,
    solutionComponentMap?: Map<string, Set<string>>
  ): SolutionDistribution[] {
    const distributions: SolutionDistribution[] = [];

    for (const solution of solutions) {
      // Count components in this solution
      const componentCounts = solutionComponentMap && solutionComponentMap.size > 0
        ? this.countComponentsInSolutionAccurate(solution, result, solutionComponentMap)
        : this.countComponentsInSolution(solution, result);

      // Identify shared components (appear in multiple solutions)
      const sharedComponents = this.identifySharedComponents(solution, solutions, result);

      // Identify dependencies on other solutions
      const dependencies = this.identifyDependencies(solution, solutions, result);

      distributions.push({
        solutionName: solution.friendlyname,
        solutionId: solution.solutionid,
        publisher: solution.publisherid.friendlyname,
        version: solution.version,
        isManaged: solution.ismanaged,
        componentCounts,
        sharedComponents,
        dependencies,
      });
    }

    // Sort by solution name
    return distributions.sort((a, b) => a.solutionName.localeCompare(b.solutionName));
  }

  private countComponentsInSolution(_solution: Solution, _result: HealthCheckerResult): ComponentCounts {
    // Accurate per-solution counting requires solutionComponentMap, which is always provided
    // when called from HealthCheckerGenerator. This fallback returns zeros to avoid showing
    // misleading totals (e.g. all components from all solutions attributed to one solution).
    const counts: ComponentCounts = {
      entities: 0,
      plugins: 0,
      flows: 0,
      businessRules: 0,
      classicWorkflows: 0,
      bpfs: 0,
      webResources: 0,
      customAPIs: 0,
      environmentVariables: 0,
      connectionReferences: 0,
      globalChoices: 0,
      customConnectors: 0,
      securityRoles: 0,
      fieldSecurityProfiles: 0,
      canvasApps: 0,
      customPages: 0,
      modelDrivenApps: 0,
      total: 0,
    };
    return counts;
  }

  private countComponentsInSolutionAccurate(
    solution: Solution,
    result: HealthCheckerResult,
    solutionComponentMap: Map<string, Set<string>>
  ): ComponentCounts {
    const solutionId = normalizeGuid(solution.solutionid);
    const componentIdsInSolution = solutionComponentMap.get(solutionId) || new Set();

    const counts: ComponentCounts = {
      entities: result.entities.filter(e =>
        componentIdsInSolution.has(normalizeGuid(e.entity.MetadataId))
      ).length,

      plugins: result.plugins.filter(p =>
        componentIdsInSolution.has(normalizeGuid(p.id))
      ).length,

      flows: result.flows.filter(f =>
        componentIdsInSolution.has(normalizeGuid(f.id))
      ).length,

      businessRules: result.businessRules.filter(br =>
        componentIdsInSolution.has(normalizeGuid(br.id))
      ).length,

      classicWorkflows: result.classicWorkflows.filter(wf =>
        componentIdsInSolution.has(normalizeGuid(wf.id))
      ).length,

      bpfs: result.businessProcessFlows.filter(bpf =>
        componentIdsInSolution.has(normalizeGuid(bpf.id))
      ).length,

      webResources: result.webResources.filter(wr =>
        componentIdsInSolution.has(normalizeGuid(wr.id))
      ).length,

      customAPIs: result.customAPIs.filter(api =>
        componentIdsInSolution.has(normalizeGuid(api.id))
      ).length,

      environmentVariables: result.environmentVariables.filter(ev =>
        componentIdsInSolution.has(normalizeGuid(ev.id))
      ).length,

      connectionReferences: result.connectionReferences.filter(cr =>
        componentIdsInSolution.has(normalizeGuid(cr.id))
      ).length,

      globalChoices: result.globalChoices.filter(gc =>
        componentIdsInSolution.has(normalizeGuid(gc.id))
      ).length,

      customConnectors: result.customConnectors.filter(cc =>
        componentIdsInSolution.has(normalizeGuid(cc.id))
      ).length,

      securityRoles: result.securityRoles?.filter(sr =>
        componentIdsInSolution.has(normalizeGuid(sr.roleid))
      ).length ?? 0,

      fieldSecurityProfiles: result.fieldSecurityProfiles?.filter(fp =>
        componentIdsInSolution.has(normalizeGuid(fp.fieldsecurityprofileid))
      ).length ?? 0,

      canvasApps: result.canvasApps.filter(ca =>
        componentIdsInSolution.has(normalizeGuid(ca.id))
      ).length,

      customPages: result.customPages.filter(cp =>
        componentIdsInSolution.has(normalizeGuid(cp.id))
      ).length,

      modelDrivenApps: result.modelDrivenApps.filter(mda =>
        componentIdsInSolution.has(normalizeGuid(mda.id))
      ).length,

      total: 0,
    };

    // Calculate total
    counts.total = Object.entries(counts)
      .filter(([key]) => key !== 'total')
      .reduce((sum, [, value]) => sum + value, 0);

    return counts;
  }

  private identifySharedComponents(
    _solution: Solution,
    _allSolutions: Solution[],
    _result: HealthCheckerResult
  ): SharedComponent[] {
    // Deferred to a future release. Implementing this accurately requires a
    // reverse index (componentId → solutionIds[]) built during discovery.
    // The solutionComponentMap passed to analyzeSolutionDistribution is keyed
    // solutionId → componentIds, which is the wrong direction for this query.
    return [];
  }

  private identifyDependencies(
    solution: Solution,
    allSolutions: Solution[],
    result: HealthCheckerResult
  ): SolutionDependency[] {
    const dependencies: SolutionDependency[] = [];

    // Build publisher prefix map
    const solutionPublisherPrefixes = new Map<string, string>();
    for (const sol of allSolutions) {
      solutionPublisherPrefixes.set(sol.solutionid, sol.publisherid.uniquename);
    }

    const currentPublisher = solution.publisherid.uniquename;

    // Check for cross-solution entity references
    for (const entity of result.entities) {
      const entityPublisher = this.extractPublisherPrefix(entity.entity.SchemaName);

      // If entity belongs to a different publisher, it's a potential dependency
      if (entityPublisher && entityPublisher !== currentPublisher) {
        // Find which solution this entity belongs to
        const dependentSolution = allSolutions.find(
          sol => sol.publisherid.uniquename === entityPublisher
        );

        if (dependentSolution && dependentSolution.solutionid !== solution.solutionid) {
          // Check if we already have this dependency
          const existingDep = dependencies.find(
            dep => dep.dependsOnSolution === dependentSolution.friendlyname
          );

          if (existingDep) {
            existingDep.componentReferences.push(entity.entity.LogicalName);
          } else {
            dependencies.push({
              dependsOnSolution: dependentSolution.friendlyname,
              reason: 'References entities from this solution',
              componentReferences: [entity.entity.LogicalName],
            });
          }
        }
      }

      // Check for lookup dependencies (entity has lookup to entity in another solution)
      if (entity.entity.ManyToOneRelationships) {
        for (const rel of entity.entity.ManyToOneRelationships) {
          const refEntityPublisher = this.extractPublisherFromLogicalName(rel.ReferencedEntity);

          if (refEntityPublisher && refEntityPublisher !== currentPublisher) {
            const dependentSolution = allSolutions.find(
              sol => sol.publisherid.uniquename === refEntityPublisher
            );

            if (dependentSolution && dependentSolution.solutionid !== solution.solutionid) {
              const existingDep = dependencies.find(
                dep => dep.dependsOnSolution === dependentSolution.friendlyname
              );

              const reference = `${entity.entity.LogicalName} → ${rel.ReferencedEntity}`;

              if (existingDep) {
                if (!existingDep.componentReferences.includes(reference)) {
                  existingDep.componentReferences.push(reference);
                }
              } else {
                dependencies.push({
                  dependsOnSolution: dependentSolution.friendlyname,
                  reason: 'Has lookup relationships to entities in this solution',
                  componentReferences: [reference],
                });
              }
            }
          }
        }
      }
    }

    return dependencies;
  }

  private extractPublisherPrefix(schemaName: string): string | null {
    const match = schemaName.match(/^([a-z]+)_/i);
    return match ? match[1] : null;
  }

  private extractPublisherFromLogicalName(logicalName: string): string | null {
    const match = logicalName.match(/^([a-z]+)_/i);
    return match ? match[1] : null;
  }
}
