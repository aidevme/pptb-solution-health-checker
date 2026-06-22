/**
 * OData query building utilities.
 */

/**
 * Builds an OData `$filter` expression joining multiple values with OR.
 *
 * @remarks
 * Dataverse OData requires GUIDs to be unquoted (`roleid eq 3fa85f64-…`) whereas
 * string values must be single-quoted (`name eq 'foo'`). Always pass `{ guids: true }`
 * when filtering on GUID/lookup fields to avoid a 400 Bad Request.
 *
 * @example String filter
 * ```ts
 * buildOrFilter(['a', 'b'], 'fieldname')
 * // → "fieldname eq 'a' or fieldname eq 'b'"
 * ```
 *
 * @example GUID filter
 * ```ts
 * buildOrFilter(['guid1', 'guid2'], 'roleid', { guids: true })
 * // → "roleid eq guid1 or roleid eq guid2"
 * ```
 *
 * @param values - Values to match against
 * @param field - OData field name
 * @param opts - Set `guids: true` to omit single-quotes around values
 * @returns OData OR filter expression, or empty string when `values` is empty
 */
export function buildOrFilter(
  values: string[],
  field: string,
  opts?: { guids?: boolean }
): string {
  if (values.length === 0) return '';
  const fmt = opts?.guids
    ? (v: string) => `${field} eq ${v}`
    : (v: string) => `${field} eq '${v}'`;
  return values.map(fmt).join(' or ');
}
