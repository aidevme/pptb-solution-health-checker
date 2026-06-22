/**
 * Environment Variable types
 */

/**
 * Environment Variable Definition with current value
 */
export interface EnvironmentVariable {
  id: string;
  schemaName: string;
  displayName: string;
  description: string | null;
  type: EnvironmentVariableType;
  typeName: string;
  /** Fallback value defined on the definition record; used when no environment-specific `currentValue` exists. */
  defaultValue: string | null;
  /**
   * Environment-specific override stored on the separate `environmentvariablevalue` entity.
   * `null` when no value has been set for this environment (the `defaultValue` applies at runtime).
   */
  currentValue: string | null;
  /** GUID of the `environmentvariablevalue` record; `null` when `currentValue` is null. */
  currentValueId: string | null;
  isManaged: boolean;
  isRequired: boolean;
  isCustomizable: boolean;
  hint: string | null;
  values: EnvironmentVariableValue[];
  owner: string;
  ownerId: string;
  modifiedBy: string;
  modifiedOn: string;
  createdOn: string;
}

/**
 * Environment Variable Value (can be multiple for different environments)
 */
export interface EnvironmentVariableValue {
  id: string;
  definitionId: string;
  schemaName: string;
  value: string;
  owner: string;
  ownerId: string;
  modifiedBy: string;
  modifiedOn: string;
  createdOn: string;
}

/**
 * Environment variable data types.
 *
 * @remarks
 * `DataSource` is a special type that stores a connector data source reference
 * (e.g. a Dataverse environment URL). Its value is stored as a JSON blob, not plain text.
 */
export type EnvironmentVariableType = 'String' | 'Number' | 'Boolean' | 'JSON' | 'DataSource';

/**
 * Environment Variable type colors for UI
 */