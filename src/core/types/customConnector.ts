/**
 * Custom Connector types
 */

export interface CustomConnector {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  connectorType: string;
  iconUri?: string;
  isManaged: boolean;
  isCustomizable: boolean;
  capabilities: string[];
  connectionParameters: string[];
  owner: string;
  modifiedOn: string;
  modifiedBy: string;
  /** Raw JSON string of the connector's policy template; `undefined` when not present. */
  policy?: string;
  /** Raw JSON string of the OpenAPI (Swagger) definition; `undefined` when not present. */
  apiDefinition?: string;
}

/**
 * Color mapping for custom connector types
 */