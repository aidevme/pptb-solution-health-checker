/**
 * Date formatting utilities pinned to the `en-GB` locale (`dd/MM/yyyy`).
 *
 * @remarks
 * All functions use the `en-GB` locale deliberately — Dataverse timestamps are
 * UTC ISO-8601 strings and the UI target audience is primarily UK/EU. Using the
 * browser's default locale would produce `MM/dd/yyyy` for US users, which would
 * make dates ambiguous (e.g. `01/02/2025` is 1 Feb in GB and 2 Jan in the US).
 *
 * @packageDocumentation
 */

/**
 * Formats a date to `dd/MM/yyyy`, optionally with a 24-hour `HH:mm` suffix.
 *
 * @param date - ISO-8601 string or `Date` object
 * @param includeTime - When `true`, appends ` HH:mm` in 24-hour format
 * @returns Formatted date string in `en-GB` locale
 */
export function formatDate(date: string | Date, includeTime: boolean = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = false;
  }

  return dateObj.toLocaleDateString('en-GB', options);
}

/**
 * Format a date to en-GB with time (dd/MM/yyyy HH:mm)
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, true);
}
