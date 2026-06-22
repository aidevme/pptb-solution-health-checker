/**
 * Extracts owner and modifiedBy from a Dataverse OData record.
 *
 * @remarks
 * Reads the `OData.Community.Display.V1.FormattedValue` annotation that Dataverse
 * appends to lookup columns when `Prefer: odata.include-annotations="*"` (or the
 * formatted-value annotation) is included in the request. Falls back to `'Unknown'`
 * when the annotation is absent — this happens for system-owned records where
 * `_ownerid_value` resolves to a non-user principal.
 */
export function extractOwnershipMetadata(record: Record<string, unknown>): {
  owner: string;
  ownerId: string;
  modifiedBy: string;
} {
  return {
    owner: (record['_ownerid_value@OData.Community.Display.V1.FormattedValue'] as string) ?? 'Unknown',
    ownerId: (record['_ownerid_value'] as string) ?? '',
    modifiedBy: (record['_modifiedby_value@OData.Community.Display.V1.FormattedValue'] as string) ?? 'Unknown',
  };
}
