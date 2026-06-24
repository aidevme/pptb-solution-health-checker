export type CodeAppSource = 'Code' | 'Dataverse Entity' | 'Azure Hosted JSON';

/**
 * Code App component type
 */
export interface CodeApps {
  id: string;
  /** Dataverse `uniquename` — the stable internal identifier, not the user-visible label. */
  name: string;
  /** User-visible friendly name (`appmodule.name` column). */
  displayName: string;
  description?: string;
  isManaged: boolean;
  modifiedOn?: string;
  source?: CodeAppSource;
}