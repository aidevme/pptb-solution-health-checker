/**
 * Model-Driven App component type
 */
export interface ModelDrivenApp {
  id: string;
  /** Dataverse `uniquename` — the stable internal identifier, not the user-visible label. */
  name: string;
  /** User-visible friendly name (`appmodule.name` column). */
  displayName: string;
  description?: string;
  isManaged: boolean;
  modifiedOn?: string;
}
