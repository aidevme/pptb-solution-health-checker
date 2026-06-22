/**
 * Returns `undefined` when `description` is one of the three casing variants of
 * Dataverse's built-in placeholder text ("Click to add description"), otherwise
 * returns the original string unchanged.
 *
 * @remarks
 * Dataverse stores the literal string `"Click to add description"` when a user
 * never fills in the description field. The placeholder appears in three casing
 * forms depending on the client that created the record (Power Apps portal,
 * classic solution explorer, or bulk import tools). All three are treated as
 * absent so components can render a proper empty state instead of placeholder text.
 *
 * Returns `undefined` rather than `""` so callers can distinguish "no description
 * was provided" from "an empty string was explicitly stored".
 *
 * @param description - Raw description value from a Dataverse metadata response
 * @returns The original string, or `undefined` if it is a placeholder or falsy
 */
export function filterDescription(description: string | undefined): string | undefined {
  if (!description) return undefined;

  // Filter out Dataverse placeholder text
  const placeholders = [
    'Click to add description',
    'click to add description',
    'CLICK TO ADD DESCRIPTION',
  ];

  const trimmed = description.trim();
  if (placeholders.includes(trimmed)) {
    return undefined;
  }

  return description;
}
