/**
 * Date and Period Utility Functions
 *
 * Provides comprehensive utilities for handling dates, periods, and date ranges
 * in the context of time-based WACC capital management.
 *
 * @module date-period
 */

// ============================================================================
// TYPE IMPORTS
// ============================================================================

import type { PeriodType, DateRange } from '@/lib/types';

// ============================================================================
// MONTH UTILITIES
// ============================================================================

/**
 * Get the first day of the month for a given date
 *
 * @param date - The reference date
 * @returns A new Date object set to the first day of the month at 00:00:00
 *
 * @example
 * getStartOfMonth(new Date('2025-03-15')) // Returns 2025-03-01 00:00:00
 */
export function getStartOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the last day of the month for a given date
 *
 * Handles variable month lengths including leap years correctly.
 *
 * @param date - The reference date
 * @returns A new Date object set to the last day of the month at 23:59:59.999
 *
 * @example
 * getEndOfMonth(new Date('2025-02-15')) // Returns 2025-02-28 23:59:59.999
 * getEndOfMonth(new Date('2024-02-15')) // Returns 2024-02-29 23:59:59.999 (leap year)
 */
export function getEndOfMonth(date: Date): Date {
  const result = new Date(date);
  // Set to next month's first day, then subtract one day
  result.setMonth(result.getMonth() + 1, 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
}

// ============================================================================
// QUARTER UTILITIES
// ============================================================================

/**
 * Get the first day of the quarter for a given date
 *
 * Quarters are defined as:
 * - Q1: January 1 - March 31
 * - Q2: April 1 - June 30
 * - Q3: July 1 - September 30
 * - Q4: October 1 - December 31
 *
 * @param date - The reference date
 * @returns A new Date object set to the first day of the quarter at 00:00:00
 *
 * @example
 * getStartOfQuarter(new Date('2025-05-15')) // Returns 2025-04-01 00:00:00 (Q2)
 */
export function getStartOfQuarter(date: Date): Date {
  const result = new Date(date);
  const month = result.getMonth();
  const quarterStartMonth = Math.floor(month / 3) * 3;
  result.setMonth(quarterStartMonth, 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the last day of the quarter for a given date
 *
 * @param date - The reference date
 * @returns A new Date object set to the last day of the quarter at 23:59:59.999
 *
 * @example
 * getEndOfQuarter(new Date('2025-05-15')) // Returns 2025-06-30 23:59:59.999 (Q2)
 */
export function getEndOfQuarter(date: Date): Date {
  const result = new Date(date);
  const month = result.getMonth();
  const quarterEndMonth = Math.floor(month / 3) * 3 + 2;
  result.setMonth(quarterEndMonth + 1, 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
}

// ============================================================================
// YEAR UTILITIES
// ============================================================================

/**
 * Get the first day of the year for a given date
 *
 * @param date - The reference date
 * @returns A new Date object set to January 1 at 00:00:00
 *
 * @example
 * getStartOfYear(new Date('2025-06-15')) // Returns 2025-01-01 00:00:00
 */
export function getStartOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the last day of the year for a given date
 *
 * @param date - The reference date
 * @returns A new Date object set to December 31 at 23:59:59.999
 *
 * @example
 * getEndOfYear(new Date('2025-06-15')) // Returns 2025-12-31 23:59:59.999
 */
export function getEndOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
}

// ============================================================================
// DATE ARITHMETIC
// ============================================================================

/**
 * Add a specified number of days to a date
 *
 * @param date - The reference date
 * @param days - Number of days to add (can be negative)
 * @returns A new Date object with the days added
 *
 * @example
 * addDays(new Date('2025-01-30'), 5) // Returns 2025-02-04
 * addDays(new Date('2025-02-28'), 1) // Returns 2025-03-01
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract a specified number of days from a date
 *
 * @param date - The reference date
 * @param days - Number of days to subtract
 * @returns A new Date object with the days subtracted
 *
 * @example
 * subtractDays(new Date('2025-03-05'), 10) // Returns 2025-02-23
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Calculate the number of days between two dates
 *
 * Returns the absolute number of days, ignoring time components.
 *
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns The number of days between the dates (always positive)
 *
 * @example
 * getDaysBetween(new Date('2025-01-01'), new Date('2025-01-31')) // Returns 30
 * getDaysBetween(new Date('2025-01-31'), new Date('2025-01-01')) // Returns 30
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Reset time to midnight for accurate day calculation
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// ============================================================================
// PERIOD OPERATIONS
// ============================================================================

/**
 * Get the start and end dates for a specific period type
 *
 * @param periodType - The type of period (monthly, quarterly, yearly, custom)
 * @param referenceDate - The reference date (defaults to current date)
 * @returns A DateRange object with startDate and endDate
 *
 * @throws {Error} If periodType is 'custom' (custom periods require explicit dates)
 *
 * @example
 * getPeriodDates('monthly', new Date('2025-03-15'))
 * // Returns { startDate: 2025-03-01, endDate: 2025-03-31 23:59:59.999 }
 *
 * getPeriodDates('quarterly', new Date('2025-05-15'))
 * // Returns { startDate: 2025-04-01, endDate: 2025-06-30 23:59:59.999 }
 */
export function getPeriodDates(
  periodType: PeriodType,
  referenceDate: Date = new Date()
): DateRange {
  switch (periodType) {
    case 'monthly':
      return {
        startDate: getStartOfMonth(referenceDate),
        endDate: getEndOfMonth(referenceDate),
      };

    case 'quarterly':
      return {
        startDate: getStartOfQuarter(referenceDate),
        endDate: getEndOfQuarter(referenceDate),
      };

    case 'yearly':
      return {
        startDate: getStartOfYear(referenceDate),
        endDate: getEndOfYear(referenceDate),
      };

    case '60-day':
      // Use 59 days offset to get exactly 60 inclusive days
      // Example: Jan 1 (start) + 59 days = Mar 1 (end) = 60 days inclusive
      return {
        startDate: referenceDate,
        endDate: addDays(referenceDate, 59),
      };

    case '90-day':
      // Use 89 days offset to get exactly 90 inclusive days
      // Example: Jan 1 (start) + 89 days = Mar 31 (end) = 90 days inclusive
      return {
        startDate: referenceDate,
        endDate: addDays(referenceDate, 89),
      };

    case 'custom':
      throw new Error(
        'Custom period type requires explicit startDate and endDate. Use DateRange directly.'
      );

    default:
      throw new Error(`Unknown period type: ${periodType}`);
  }
}

/**
 * Format a period as a human-readable string
 *
 * @param periodType - The type of period
 * @param startDate - The start date of the period
 * @param endDate - The end date of the period
 * @returns A formatted string representation of the period
 *
 * @example
 * formatPeriodLabel('monthly', new Date('2025-01-01'), new Date('2025-01-31'))
 * // Returns "Jan 2025"
 *
 * formatPeriodLabel('quarterly', new Date('2025-04-01'), new Date('2025-06-30'))
 * // Returns "Q2 2025"
 *
 * formatPeriodLabel('yearly', new Date('2025-01-01'), new Date('2025-12-31'))
 * // Returns "2025"
 *
 * formatPeriodLabel('custom', new Date('2025-01-15'), new Date('2025-03-20'))
 * // Returns "Jan 15, 2025 - Mar 20, 2025"
 */
export function formatPeriodLabel(
  periodType: PeriodType,
  startDate: Date,
  endDate: Date
): string {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  /**
   * Helper function to format a date range label
   * Handles year boundaries intelligently:
   * - Same year: "Mon Day - Mon Day, Year"
   * - Different years: "Mon Day, Year - Mon Day, Year"
   *
   * @param start - Start date
   * @param end - End date
   * @returns Formatted date range string
   */
  const formatDateRange = (start: Date, end: Date): string => {
    const startMonth = monthNames[start.getMonth()];
    const startDay = start.getDate();
    const startYear = start.getFullYear();

    const endMonth = monthNames[end.getMonth()];
    const endDay = end.getDate();
    const endYear = end.getFullYear();

    // Same year: compact format
    if (startYear === endYear) {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
    }

    // Different years: full format with both years
    return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
  };

  switch (periodType) {
    case 'monthly': {
      const month = monthNames[startDate.getMonth()];
      const year = startDate.getFullYear();
      return `${month} ${year}`;
    }

    case 'quarterly': {
      const quarterMonth = startDate.getMonth();
      const quarter = Math.floor(quarterMonth / 3) + 1;
      const year = startDate.getFullYear();
      return `Q${quarter} ${year}`;
    }

    case 'yearly': {
      return startDate.getFullYear().toString();
    }

    case '60-day': {
      return formatDateRange(startDate, endDate);
    }

    case '90-day': {
      return formatDateRange(startDate, endDate);
    }

    case 'custom': {
      return formatDateRange(startDate, endDate);
    }

    default:
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }
}

/**
 * Get all 12 monthly periods for a given year
 *
 * @param year - The year to generate monthly periods for
 * @returns An array of 12 DateRange objects, one for each month
 *
 * @example
 * getMonthlyPeriods(2025)
 * // Returns [
 * //   { startDate: 2025-01-01, endDate: 2025-01-31 23:59:59.999 },
 * //   { startDate: 2025-02-01, endDate: 2025-02-28 23:59:59.999 },
 * //   ...
 * //   { startDate: 2025-12-01, endDate: 2025-12-31 23:59:59.999 }
 * // ]
 */
export function getMonthlyPeriods(year: number): DateRange[] {
  const periods: DateRange[] = [];

  for (let month = 0; month < 12; month++) {
    const date = new Date(year, month, 1);
    periods.push({
      startDate: getStartOfMonth(date),
      endDate: getEndOfMonth(date),
    });
  }

  return periods;
}

/**
 * Get all 4 quarterly periods for a given year
 *
 * @param year - The year to generate quarterly periods for
 * @returns An array of 4 DateRange objects, one for each quarter
 *
 * @example
 * getQuarterlyPeriods(2025)
 * // Returns [
 * //   { startDate: 2025-01-01, endDate: 2025-03-31 23:59:59.999 }, // Q1
 * //   { startDate: 2025-04-01, endDate: 2025-06-30 23:59:59.999 }, // Q2
 * //   { startDate: 2025-07-01, endDate: 2025-09-30 23:59:59.999 }, // Q3
 * //   { startDate: 2025-10-01, endDate: 2025-12-31 23:59:59.999 }  // Q4
 * // ]
 */
export function getQuarterlyPeriods(year: number): DateRange[] {
  const periods: DateRange[] = [];

  for (let quarter = 0; quarter < 4; quarter++) {
    const startMonth = quarter * 3;
    const date = new Date(year, startMonth, 1);
    periods.push({
      startDate: getStartOfQuarter(date),
      endDate: getEndOfQuarter(date),
    });
  }

  return periods;
}

/**
 * Check if a date falls within a specified date range (inclusive)
 *
 * @param date - The date to check
 * @param range - The date range to check against
 * @returns True if the date is within the range (inclusive), false otherwise
 *
 * @example
 * const range = {
 *   startDate: new Date('2025-01-01'),
 *   endDate: new Date('2025-01-31')
 * };
 *
 * isDateInRange(new Date('2025-01-15'), range) // Returns true
 * isDateInRange(new Date('2025-02-01'), range) // Returns false
 * isDateInRange(new Date('2025-01-01'), range) // Returns true (inclusive)
 */
export function isDateInRange(date: Date, range: DateRange): boolean {
  const timestamp = date.getTime();
  const startTimestamp = range.startDate.getTime();
  const endTimestamp = range.endDate.getTime();

  return timestamp >= startTimestamp && timestamp <= endTimestamp;
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Get the quarter number (1-4) for a given date
 *
 * @param date - The reference date
 * @returns The quarter number (1, 2, 3, or 4)
 *
 * @example
 * getQuarterNumber(new Date('2025-02-15')) // Returns 1
 * getQuarterNumber(new Date('2025-05-15')) // Returns 2
 */
export function getQuarterNumber(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

/**
 * Check if a year is a leap year
 *
 * @param year - The year to check
 * @returns True if the year is a leap year, false otherwise
 *
 * @example
 * isLeapYear(2024) // Returns true
 * isLeapYear(2025) // Returns false
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get the number of days in a specific month
 *
 * @param year - The year
 * @param month - The month (0-11, where 0 is January)
 * @returns The number of days in the month
 *
 * @example
 * getDaysInMonth(2024, 1) // Returns 29 (February in leap year)
 * getDaysInMonth(2025, 1) // Returns 28 (February in non-leap year)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
