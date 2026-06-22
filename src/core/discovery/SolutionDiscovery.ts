import type { IDataverseClient } from '../dataverse/IDataverseClient.js';
import type { Solution } from '../types.js';

/**
 * Discovers solutions in the Power Platform environment.
 *
 * @remarks
 * The `isvisible eq true` filter excludes internal Microsoft infrastructure solutions
 * (e.g. `System`, `Active`) that are present in every environment but are not
 * meaningful targets for health checks.
 */
export class SolutionDiscovery {
  private readonly client: IDataverseClient;

  constructor(client: IDataverseClient) {
    this.client = client;
  }

  async getSolutions(): Promise<Solution[]> {
    try {
      const result = await this.client.query<Solution>('solutions', {
        select: ['solutionid', 'uniquename', 'friendlyname', 'version', 'ismanaged'],
        filter: 'isvisible eq true',
        expand: 'publisherid($select=uniquename,friendlyname)',
        orderBy: ['friendlyname'],
      });

      return result.value;
    } catch (error) {
      throw new Error(
        `Failed to retrieve solutions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
