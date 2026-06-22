/**
 * Connection Reference types
 */

export interface ConnectionReference {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  /** Runtime connection ID for the linked connector; `null` when no connection has been set up. */
  connectionId: string | null;
  /** Connector's internal ID (e.g. `/providers/Microsoft.PowerApps/apis/shared_commondataserviceforapps`); `null` when not resolved. */
  connectorId: string | null;
  connectorDisplayName: string | null;
  isManaged: boolean;
  isCustomizable: boolean;
  /** Dataverse statecode: 0 = Active, 1 = Inactive. */
  statecode: number;
  /** Dataverse statuscode — meaning varies by statecode: 1 = Active, 2 = Inactive. */
  statuscode: number;
  owner: string;
  ownerId: string;
  modifiedBy: string;
  modifiedOn: string;
  createdOn: string;
}
