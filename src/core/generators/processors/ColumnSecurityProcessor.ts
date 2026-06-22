import type { IDataverseClient } from '../../dataverse/IDataverseClient.js';
import type { ProgressInfo, StepWarning } from '../../types/blueprint.js';
import { ColumnSecurityDiscovery, type AttributeMaskingRule, type ColumnSecurityProfile } from '../../discovery/ColumnSecurityDiscovery.js';

/**
 * Discovers attribute masking rules and column security profiles for the
 * environment.
 *
 * @remarks
 * Unlike most processors this fetch is **not scoped to the selected solutions**
 * — column security is an environment-level configuration and there is no
 * `solutioncomponents` entry to filter against.  The results therefore reflect
 * the full environment, which may include rules outside the analysed solutions.
 *
 * Errors are caught and returned as a partial warning rather than thrown,
 * consistent with the {@link ProcessorStep} no-throw contract.
 */
export async function processColumnSecurity(
  client: IDataverseClient,
  onProgress: (progress: ProgressInfo) => void,
  stepWarnings: StepWarning[]
): Promise<{
  attributeMaskingRules: AttributeMaskingRule[];
  columnSecurityProfiles: ColumnSecurityProfile[];
}> {
  try {
    onProgress({
      phase: 'discovering',
      entityName: '',
      current: 0,
      total: 2,
      message: `Discovering attribute masking and column security...`,
    });

    const columnSecurityDiscovery = new ColumnSecurityDiscovery(client);

    // Get attribute masking rules
    const attributeMaskingRules = await columnSecurityDiscovery.getAttributeMaskingRules();

    onProgress({
      phase: 'discovering',
      entityName: '',
      current: 1,
      total: 2,
      message: `Found ${attributeMaskingRules.length} attribute masking rule(s)`,
    });

    // Get column security profiles
    const columnSecurityProfiles = await columnSecurityDiscovery.getColumnSecurityProfiles();

    onProgress({
      phase: 'discovering',
      entityName: '',
      current: 2,
      total: 2,
      message: `Column security discovery complete`,
    });

    return {
      attributeMaskingRules,
      columnSecurityProfiles,
    };
  } catch (error) {
    stepWarnings.push({
      step: 'Column Security',
      message: `Column security discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}. Results may be incomplete.`,
      partial: true,
    });
    return {
      attributeMaskingRules: [],
      columnSecurityProfiles: [],
    };
  }
}
