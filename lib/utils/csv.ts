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

/** Dangerous filename characters that must be removed or replaced. */
const UNSAFE_FILENAME_PATTERN = /[/\\:*?"<>|\x00-\x1F\x7F]/g;

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

/**
 * Sanitize a string for safe use as a filename.
 *
 * - Removes path separators (/, \)
 * - Removes special characters (:, *, ?, ", <, >, |)
 * - Removes control characters (\x00-\x1F, \x7F)
 * - Replaces spaces with underscores
 * - Trims leading/trailing whitespace
 * - Limits to 200 characters (reasonable filename length)
 * - Returns 'untitled' if result is empty
 *
 * @example
 * sanitizeFilename('My File/Name?.txt') // 'My_File_Name.txt'
 * sanitizeFilename('C:\\Users\\test')   // 'C_Users_test'
 */
export function sanitizeFilename(name: string | null | undefined): string {
  if (!name) {
    return 'untitled';
  }

  return name
    .replace(UNSAFE_FILENAME_PATTERN, '') // Remove dangerous chars
    .replace(/\s+/g, '_')                  // Replace spaces with underscores
    .trim()                                 // Remove leading/trailing whitespace
    .substring(0, 200)                      // Limit length
    || 'untitled';                          // Fallback if empty
}
