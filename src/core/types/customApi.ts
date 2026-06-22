/**
 * Custom API types
 */

/**
 * Custom API definition
 */
export interface CustomAPI {
  id: string;
  uniqueName: string;
  displayName: string;
  description: string | null;
  bindingType: 'Global' | 'Entity' | 'EntityCollection';
  boundEntityLogicalName: string | null;
  /** `true` = OData Function (read-only, GET); `false` = OData Action (side-effects allowed, POST). */
  isFunction: boolean;
  isPrivate: boolean;
  isManaged: boolean;
  allowedCustomProcessingStepType: 'None' | 'AsyncOnly' | 'SyncAndAsync';
  executionPrivilege: 'None' | 'Basic' | 'Local' | 'Deep' | 'Global';
  requestParameters: CustomAPIParameter[];
  responseProperties: CustomAPIParameter[];
  owner: string;
  ownerId: string;
  modifiedBy: string;
  modifiedOn: string;
  createdOn: string;
}

/**
 * Custom API request parameter or response property
 */
export interface CustomAPIParameter {
  id: string;
  uniqueName: string;
  displayName: string;
  description: string | null;
  type: CustomAPIParameterType;
  typeName: string;
  isOptional: boolean;
  /** Target entity logical name when `type` is `EntityReference` or `Entity`; `null` for all other types. */
  logicalEntityName: string | null;
}

/**
 * Custom API parameter types
 */
export type CustomAPIParameterType =
  | 'Boolean'
  | 'DateTime'
  | 'Decimal'
  | 'Entity'
  | 'EntityCollection'
  | 'EntityReference'
  | 'Float'
  | 'Integer'
  | 'Money'
  | 'Picklist'
  | 'String'
  | 'StringArray'
  | 'Guid';

/**
 * Custom API binding type colors for UI
 */
/**
 * Custom API type colors for UI
 */