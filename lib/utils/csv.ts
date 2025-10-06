/**
 * CSV utility helpers.
 *
 * Provides sanitization to prevent spreadsheet formula injection attacks
 * while keeping CSV formatting compliant for values containing commas,
 * quotes, or new lines.
 */

/** Characters that can trigger spreadsheet formula execution when a cell starts with them. */
const FORMULA_PREFIX_PATTERN = /^[=+\-@\t\r]/;

/** Values containing these characters must be wrapped in double quotes. */
const NEEDS_QUOTING_PATTERN = /[",\n\r]/;

/**
 * Sanitize a value for safe inclusion in a CSV cell.
 *
 * - Prevents formula injection by prefixing risky values with a single quote.
 * - Escapes embedded double quotes and wraps values requiring CSV quoting.
 */
export function sanitizeCsvField(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  const needsFormulaEscape = FORMULA_PREFIX_PATTERN.test(stringValue);
  const prefixedValue = needsFormulaEscape ? `'${stringValue}` : stringValue;

  const escapedValue = prefixedValue.replace(/"/g, '""');

  if (NEEDS_QUOTING_PATTERN.test(prefixedValue)) {
    return `"${escapedValue}"`;
  }

  return escapedValue;
}
