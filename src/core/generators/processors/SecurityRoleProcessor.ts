import type { IDataverseClient } from '../../dataverse/IDataverseClient.js';
import type { FetchLogger } from '../../utils/FetchLogger.js';
import type { ProgressInfo, StepWarning } from '../../types/healthChecker.js';
import { SecurityRoleDiscovery, type SecurityRoleDetail } from '../../discovery/SecurityRoleDiscovery.js';
import { checkForPartialFailures } from './processorUtils.js';

/**
 * Fetches security roles in the selected solutions and resolves their full
 * privilege detail.
 *
 * @remarks
 * Role privilege resolution requires two network passes: the first fetches
 * the `roleprivilegescollection` navigation property for each role to get
 * privilege IDs; the second fetches the `privilege` entity set to resolve
 * privilege names and access levels.  Both passes are handled by
 * {@link SecurityRoleDiscovery.getRoleDetailsForRoles}, which batches requests
 * to stay within OData URL-length limits.
 */
export async function processSecurityRoles(
  client: IDataverseClient,
  securityRoleIds: string[],
  onProgress: (progress: ProgressInfo) => void,
  logger: FetchLogger,
  stepWarnings: StepWarning[]
): Promise<SecurityRoleDetail[]> {
  if (securityRoleIds.length === 0) {
    return [];
  }

  try {
    const securityRoleDiscovery = new SecurityRoleDiscovery(client, (current, total) => {
      onProgress({
        phase: 'discovering',
        entityName: '',
        current,
        total,
        message: `Documenting security roles (${current}/${total})...`,
      });
    }, logger);

    // Batch-fetch only the solution-scoped roles by ID
    const srLogWatermark = logger.getEntries().length;
    const rolesInSolution = await securityRoleDiscovery.getSecurityRoles(securityRoleIds);

    // Bulk 2-pass fetch: roleprivilegescollection → privileges table
    const roleDetails = await securityRoleDiscovery.getRoleDetailsForRoles(rolesInSolution);
    checkForPartialFailures('Security Roles', srLogWatermark, logger, stepWarnings);

    return roleDetails;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    stepWarnings.push({ step: 'Security Roles', message: msg, partial: false });
    return [];
  }
}
