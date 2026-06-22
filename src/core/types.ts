/**
 * Root-level primitive types shared across the entire `core/` layer.
 *
 * @remarks
 * Domain-specific types (flows, BPFs, canvas apps, etc.) live in `./types/` sub-modules
 * and are re-exported through `./index.ts`. Only the universal primitives that cut across
 * multiple sub-modules belong here.
 */

export interface Publisher {
  publisherid: string;
  uniquename: string;
  friendlyname: string;
  customizationprefix: string;
}

export interface Solution {
  solutionid: string;
  uniquename: string;
  friendlyname: string;
  version: string;
  ismanaged: boolean;
  publisherid: {
    uniquename: string;
    friendlyname: string;
  };
}

export interface EntityMetadata {
  LogicalName: string;
  SchemaName: string;
  DisplayName: {
    UserLocalizedLabel?: {
      Label: string;
    };
  };
  MetadataId: string;
  EntitySetName: string;
  PrimaryIdAttribute: string;
  PrimaryNameAttribute: string;
  IsCustomEntity: boolean;
  IsCustomizable: {
    Value: boolean;
  };
  IsManaged: boolean;
  Description?: {
    UserLocalizedLabel?: {
      Label: string;
    };
  };
}

export interface ImageDefinition {
  id: string;
  name: string;
  imageType: 'PreImage' | 'PostImage';
  attributes: string[];
  messagePropertyName: string;
}

/**
 * A registered SDK message processing step (plugin step).
 *
 * @remarks
 * `stage` follows the Dataverse plugin pipeline numbering:
 * 10 = PreValidation, 20 = PreOperation, 40 = PostOperation (sync), 50 = PostOperation (async).
 *
 * `mode` is the Dataverse execution mode integer: 0 = Synchronous, 1 = Asynchronous.
 * Stage 50 is always async regardless of `mode`.
 */
export interface PluginStep {
  id: string;
  name: string;
  stage: number;
  stageName: string;
  mode: number;
  modeName: string;
  rank: number;
  message: string;
  entity: string | null;
  assemblyName: string;
  typeName: string;
  pluginTypeId: string;
  filteringAttributes: string[];
  description: string | null;
  asyncAutoDelete: boolean;
  configuration: string | null;
  customConfiguration: string | null;
  preImage: ImageDefinition | null;
  postImage: ImageDefinition | null;
  impersonatingUserId: string | null;
  impersonatingUserName: string | null;
  stateCode: number;
  state: 'Enabled' | 'Disabled';
}
