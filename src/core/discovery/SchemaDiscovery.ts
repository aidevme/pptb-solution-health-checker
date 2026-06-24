import type { IDataverseClient } from '../dataverse/IDataverseClient.js';
import type { DetailedEntityMetadata } from '../types/healthChecker.js';

/**
 * Retrieves detailed entity schema from the Dataverse metadata API for a single entity by logical name.
 *
 * @remarks
 * The `$expand` clause requests `Attributes`, all three relationship collections, and `Keys`.
 * Attribute type-specific properties (`MaxLength`, `Targets`, `Precision`, etc.) are not
 * listed in `$select` for the `Attributes` sub-expand — the metadata API returns them
 * automatically as part of the concrete type payload even when not explicitly selected.
 * Listing them would require knowing the concrete attribute type in advance, which is only
 * known after the response arrives.
 */
export class SchemaDiscovery {
  private readonly client: IDataverseClient;

  constructor(client: IDataverseClient) {
    this.client = client;
  }

  async getEntitySchema(logicalName: string): Promise<DetailedEntityMetadata> {
    if (!/^[a-z][a-z0-9_]*$/.test(logicalName)) {
      throw new TypeError(`Invalid entity logical name: ${logicalName}`);
    }
    try {
      // Fetch comprehensive entity metadata with all expansions
      const result = await this.client.queryMetadata<DetailedEntityMetadata>(
        'EntityDefinitions',
        {
          select: [
            'LogicalName',
            'SchemaName',
            'DisplayName',
            'MetadataId',
            'EntitySetName',
            'PrimaryIdAttribute',
            'PrimaryNameAttribute',
            'Description',
            'OwnershipType',
            'IsAuditEnabled',
            'ChangeTrackingEnabled',
            'IsActivity',
            'IsActivityParty',
            'IsCustomEntity',
            'IsCustomizable',
            'IsManaged',
            'ObjectTypeCode',
          ],
          filter: `LogicalName eq '${logicalName}'`,
          expand: [
            // Attributes - only select properties on base AttributeMetadata
            // Type-specific properties (MaxLength, Targets, etc.) are included automatically
            'Attributes($select=LogicalName,SchemaName,MetadataId,DisplayName,AttributeType,IsPrimaryId,IsPrimaryName,IsValidForCreate,IsValidForUpdate,IsValidForRead,IsValidForAdvancedFind,IsAuditEnabled,IsSecured,RequiredLevel,Description,IsCustomAttribute,IsManaged)',
            // Relationships
            'ManyToOneRelationships($select=SchemaName,MetadataId,ReferencingEntity,ReferencedEntity,ReferencingAttribute,ReferencedAttribute,CascadeConfiguration,IsCustomRelationship,IsManaged)',
            'OneToManyRelationships($select=SchemaName,MetadataId,ReferencingEntity,ReferencedEntity,ReferencingAttribute,ReferencedAttribute,CascadeConfiguration,IsCustomRelationship,IsManaged)',
            'ManyToManyRelationships($select=SchemaName,MetadataId,Entity1LogicalName,Entity2LogicalName,IntersectEntityName,Entity1IntersectAttribute,Entity2IntersectAttribute,IsCustomRelationship,IsManaged)',
            // Alternate Keys
            'Keys($select=LogicalName,DisplayName,KeyAttributes,EntityKeyIndexStatus)',
          ].join(','),
        }
      );

      if (result.value.length === 0) {
        throw new Error(`Entity '${logicalName}' not found`);
      }

      const entity = result.value[0];

      // Compute ownership type name
      entity.OwnershipTypeName = this.getOwnershipTypeName(entity.OwnershipType);

      return entity;
    } catch (error) {
      throw new Error(
        `Failed to retrieve schema for ${logicalName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private getOwnershipTypeName(ownershipType?: number): string {
    switch (ownershipType) {
      case 1:
        return 'User or Team Owned';
      case 2:
        return 'Team Owned';
      case 4:
        return 'Organization Owned';
      case 8:
        return 'Business Owned';
      default:
        return 'Unknown';
    }
  }
}
