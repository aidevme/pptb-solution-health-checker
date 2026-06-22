import type { IDataverseClient } from '../dataverse/IDataverseClient.js';
import type { CustomConnector } from '../types/customConnector.js';
import type { FetchLogger } from '../utils/FetchLogger.js';
import { withAdaptiveBatch } from '../utils/withAdaptiveBatch.js';

interface RawConnector {
  connectorid: string;
  name: string;
  displayname?: string;
  description?: string;
  ismanaged?: boolean;
  modifiedon?: string;
  createdon?: string;
}

/**
 * Discovers Custom Connectors from the `connectors` entity set.
 *
 * @remarks
 * The `iscustomizable` field is a `ManagedProperty` OData navigation property.
 * Filtering on it (e.g. `iscustomizable/Value eq true`) returns 0 results silently
 * in some environments, so no filter is applied here. The `connectors` table only
 * holds connectors that are registered in the current environment, not built-in
 * platform connectors, so the result set is naturally scoped.
 */
export class CustomConnectorDiscovery {
  private readonly client: IDataverseClient;
  private onProgress?: (current: number, total: number) => void;
  private logger?: FetchLogger;

  constructor(
    client: IDataverseClient,
    onProgress?: (current: number, total: number) => void,
    logger?: FetchLogger
  ) {
    this.client = client;
    this.onProgress = onProgress;
    this.logger = logger;
  }

  async getConnectorsByIds(connectorIds: string[]): Promise<CustomConnector[]> {
    if (connectorIds.length === 0) {
      return [];
    }

    const { results: allResults } = await withAdaptiveBatch<string, RawConnector>(
      connectorIds,
      async (batch) => {
        const filter = batch
          .map(id => `connectorid eq ${id.replace(/[{}]/g, '')}`)
          .join(' or ');
        const result = await this.client.query<RawConnector>('connectors', {
          select: ['connectorid', 'name', 'displayname', 'description', 'ismanaged', 'modifiedon', 'createdon'],
          filter,
        });
        return result.value;
      },
      {
        initialBatchSize: 20,
        step: 'Custom Connector Discovery',
        entitySet: 'connectors',
        logger: this.logger,
        onProgress: (done, total) => this.onProgress?.(done, total),
      }
    );

    return allResults.map(raw => this.mapToCustomConnector(raw));
  }

  private mapToCustomConnector(raw: RawConnector): CustomConnector {
    return {
      id: raw.connectorid,
      name: raw.name,
      displayName: raw.displayname || raw.name,
      description: raw.description,
      connectorType: 'Custom',
      isManaged: raw.ismanaged || false,
      isCustomizable: true,
      capabilities: [],
      connectionParameters: [],
      owner: 'Unknown',
      modifiedOn: raw.modifiedon || raw.createdon || new Date().toISOString(),
      modifiedBy: 'Unknown',
    };
  }
}
