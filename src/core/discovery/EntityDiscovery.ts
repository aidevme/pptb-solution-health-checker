import type { IDataverseClient } from '../dataverse/IDataverseClient.js';
import type { EntityMetadata } from '../types.js';

/**
 * Note: EntityDiscovery intentionally does not implement IDiscoverer<T>.
 * Entity discovery requires metadata API calls, schema discovery, and multi-step
 * resolution that does not fit the discoverByIds(ids: string[]) contract.
 * See IDiscoverer.ts for rationale. If generic orchestration is needed, use the
 * adapter pattern: EntityDiscoveryAdapter implements IDiscoverer<EntityBlueprint>.
 */

/**
 * Solution component for entity lookup
 */
interface SolutionComponent {
  objectid: string;
  componenttype: number;
}

/**
 * Discovers entities in the Power Platform environment.
 *
 * @remarks
 * The Dataverse metadata API (`/api/data/v9.x/EntityDefinitions`) does not support
 * `$filter` on `MetadataId` or `IsManaged` in the same way the OData entity API does.
 * Both `getEntitiesByIds` and `getAllEntities` therefore fetch all `EntityDefinitions`
 * and filter the result set in memory. This is intentional — the alternative (individual
 * per-ID requests) would be dramatically slower for large environments.
 */
export class EntityDiscovery {
  private readonly client: IDataverseClient;

  constructor(client: IDataverseClient) {
    this.client = client;
  }

  async getEntitiesByIds(entityIds: string[]): Promise<EntityMetadata[]> {
    try {
      if (entityIds.length === 0) {
        return [];
      }

      // Fetch all EntityDefinitions and filter in memory by MetadataId
      const result = await this.client.queryMetadata<EntityMetadata>('EntityDefinitions', {
        select: [
          'LogicalName',
          'SchemaName',
          'DisplayName',
          'EntitySetName',
          'PrimaryIdAttribute',
          'PrimaryNameAttribute',
          'MetadataId',
          'IsCustomEntity',
          'IsCustomizable',
          'IsManaged',
          'Description',
        ],
      });

      // Filter to only entities with matching MetadataIds
      const filteredEntities = result.value.filter((entity) =>
        entityIds.includes(entity.MetadataId.toLowerCase())
      );

      // Sort by LogicalName
      return filteredEntities.sort((a, b) => a.LogicalName.localeCompare(b.LogicalName));
    } catch (error) {
      throw new Error(
        `Failed to retrieve entities by IDs: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getEntitiesBySolutions(solutionIds: string[]): Promise<EntityMetadata[]> {
    try {
      // Step 1: Get all entity components from the solutions
      const entityMetadataIds = new Set<string>();

      for (const solutionId of solutionIds) {
        const result = await this.client.query<SolutionComponent>('solutioncomponents', {
          select: ['objectid', 'componenttype'],
          filter: `_solutionid_value eq ${solutionId} and componenttype eq 1`,
        });

        // Collect unique entity metadata IDs (convert to lowercase for comparison)
        result.value.forEach((component) => {
          entityMetadataIds.add(component.objectid.toLowerCase());
        });
      }

      if (entityMetadataIds.size === 0) {
        return [];
      }

      // Step 2: Get all EntityDefinitions and filter in memory
      // The metadata API doesn't support complex MetadataId filters
      const result = await this.client.queryMetadata<EntityMetadata>('EntityDefinitions', {
        select: [
          'LogicalName',
          'SchemaName',
          'DisplayName',
          'EntitySetName',
          'PrimaryIdAttribute',
          'PrimaryNameAttribute',
          'MetadataId',
          'IsCustomEntity',
          'IsCustomizable',
          'IsManaged',
          'Description',
        ],
      });

      // Filter to only entities that are in our solution components
      const filteredEntities = result.value.filter((entity) =>
        entityMetadataIds.has(entity.MetadataId.toLowerCase())
      );

      // Sort by LogicalName
      return filteredEntities.sort((a, b) => a.LogicalName.localeCompare(b.LogicalName));
    } catch (error) {
      throw new Error(
        `Failed to retrieve entities by solutions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getAllEntities(includeSystem: boolean, onlyUnmanaged: boolean = false): Promise<EntityMetadata[]> {
    try {
      // Only use IsCustomEntity filter in the query - metadata API has limited query parameter support
      const filter = !includeSystem ? 'IsCustomEntity eq true' : undefined;

      const result = await this.client.queryMetadata<EntityMetadata>('EntityDefinitions', {
        select: [
          'LogicalName',
          'SchemaName',
          'DisplayName',
          'EntitySetName',
          'PrimaryIdAttribute',
          'PrimaryNameAttribute',
          'MetadataId',
          'IsCustomEntity',
          'IsCustomizable',
          'IsManaged',
          'Description',
        ],
        filter,
        // Note: orderBy not supported by metadata API - sort in memory instead
      });

      // Filter for unmanaged in memory (metadata API doesn't support IsManaged filter)
      let entities = result.value;
      if (onlyUnmanaged) {
        entities = entities.filter(e => !e.IsManaged);
      }

      // Sort in memory since metadata API doesn't support orderBy
      entities.sort((a, b) => a.LogicalName.localeCompare(b.LogicalName));

      return entities;
    } catch (error) {
      throw new Error(
        `Failed to retrieve all entities: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
