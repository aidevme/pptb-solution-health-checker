/**
 * Options for querying Dataverse
 */
export interface QueryOptions {
  select?: string[];
  filter?: string;
  expand?: string;
  orderBy?: string[];
  top?: number;
  // NOTE: $skip is NOT supported by all Dataverse entity types (e.g. customapis returns
  // 0x80060888 "Skip Clause is not supported in CRM"). Use queryAll() for pagination instead.
}

/**
 * Result from a Dataverse query
 */
export interface QueryResult<T> {
  value: T[];
  count?: number;
  /** Raw @odata.nextLink URL for the next page, if present */
  nextLink?: string;
}

/**
 * Abstraction over the Dataverse OData API used by all discovery and generator classes.
 *
 * @remarks
 * Two pagination contracts exist on purpose:
 * - {@link IDataverseClient.query} — single page, caller owns pagination.
 * - {@link IDataverseClient.queryAll} — follows `@odata.nextLink` automatically.
 *
 * `$skip`-based pagination is deliberately absent. Several Dataverse entity types
 * (e.g. `customapis`) reject `$skip` with error `0x80060888`. Cursor-based paging
 * via `@odata.nextLink` / `$skiptoken` is the only safe cross-entity approach.
 */
export interface IDataverseClient {
  /**
   * Query a single page from a Dataverse entity set.
   * Does NOT follow pagination automatically.
   * Use `queryAll` when you need all records across all pages.
   */
  query<T>(entitySet: string, options?: QueryOptions): Promise<QueryResult<T>>;

  /**
   * Query ALL records from a Dataverse entity set, following @odata.nextLink pagination.
   * Do not pass `top` in options — pagination is handled internally.
   * NOTE: $skip is NOT used internally; Dataverse cursor-based paging (@odata.nextLink /
   * $skiptoken) is the correct mechanism and works across all entity types.
   */
  queryAll<T>(entitySet: string, options?: Omit<QueryOptions, 'top'>): Promise<QueryResult<T>>;

  /**
   * Queries the Dataverse metadata API (`/api/data/vN.N/<metadataPath>`).
   *
   * @remarks
   * Metadata endpoints use the same OData syntax as entity sets but are served
   * from a different URL segment. Pass `'EntityDefinitions'`,
   * `'EntityDefinitions(<id>)/Attributes'`, etc. as `metadataPath`.
   */
  queryMetadata<T>(metadataPath: string, options?: QueryOptions): Promise<QueryResult<T>>;

  /**
   * @returns The Dataverse environment URL, or `'Unknown Environment'` if the URL was
   * not supplied at construction time.
   */
  getEnvironmentUrl(): string;
}
