/**
 * WACC (Weighted Average Cost of Capital) Calculation Functions
 * Phase 1 - Wave 2: Time-Based WACC Capital Management
 *
 * Provides functions for calculating WACC over time, analyzing periods,
 * and generating trend data for time-based capital cost analysis.
 *
 * CRITICAL RULES:
 * - All money values in CENTS (integers)
 * - All rates as decimals (0.14 for 14%)
 * - WACC formula: Σ(source.availableCents / totalCapital) × source.annualRate
 * - If no capital sources at a date, return WACC = 0
 *
 * @module calculations/wacc
 */

// ============================================================================
// TYPE IMPORTS
// ============================================================================

import type {
  CapitalSourceHistory,
  CapitalSource,
  WACCSnapshot,
  PeriodType,
  DateRange,
  Cents,
} from '@/lib/types';

import {
  formatPeriodLabel,
  getDaysBetween,
} from '@/lib/utils/date-period';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a date is the start of a calendar quarter
 *
 * Quarters start on:
 * - Q1: January 1
 * - Q2: April 1
 * - Q3: July 1
 * - Q4: October 1
 *
 * @param date - Date to check
 * @returns True if date is start of a quarter
 */
function isQuarterStart(date: Date): boolean {
  const month = date.getMonth(); // 0-indexed (0 = Jan, 1 = Feb, etc.)
  const day = date.getDate();

  // Must be the 1st day of the month
  if (day !== 1) {
    return false;
  }

  // Must be January (0), April (3), July (6), or October (9)
  return month === 0 || month === 3 || month === 6 || month === 9;
}

// ============================================================================
// CORE WACC CALCULATION FUNCTIONS
// ============================================================================

/**
 * Get snapshot of all active capital sources at a specific date
 *
 * This function filters the capital source history to find the most recent
 * state of each source at the given date. It:
 * 1. Filters history to entries on or before the target date
 * 2. Groups by sourceId and takes the latest entry
 * 3. Excludes sources with action='REMOVED'
 *
 * @param date - The date to get the snapshot for
 * @param history - Complete capital source history
 * @returns Array of active capital sources at the specified date
 *
 * @example
 * const sources = getCapitalSourcesAtDate(
 *   new Date('2025-03-15'),
 *   capitalHistory
 * );
 * // Returns: [{ name: 'Bank Loan', annualRate: 0.14, ... }, ...]
 */
export function getCapitalSourcesAtDate(
  date: Date,
  history: CapitalSourceHistory[]
): CapitalSource[] {
  // Filter history to entries on or before the target date
  const relevantHistory = history.filter(
    (entry) => entry.effectiveDate <= date
  );

  // If no history exists at this date, return empty array
  if (relevantHistory.length === 0) {
    return [];
  }

  // Sort chronologically: by effectiveDate ascending, then by id (timestamp-based) ascending
  // This ensures that later updates on the same day are processed last
  const sortedHistory = [...relevantHistory].sort((a, b) => {
    const dateDiff = a.effectiveDate.getTime() - b.effectiveDate.getTime();
    if (dateDiff !== 0) return dateDiff;

    // For same-day entries, sort by id (which contains timestamp)
    // This preserves insertion order for entries with the same effectiveDate
    return a.id.localeCompare(b.id);
  });

  // Group by sourceId and get the most recent entry for each source
  // Later entries in the sorted array will overwrite earlier ones
  const sourceMap = new Map<string, CapitalSourceHistory>();

  for (const entry of sortedHistory) {
    // Unconditionally set the entry - later (sorted) entries overwrite earlier ones
    // This preserves same-day updates
    sourceMap.set(entry.sourceId, entry);
  }

  // Convert to CapitalSource array, excluding REMOVED sources
  const activeSources: CapitalSource[] = [];

  // Use Array.from to iterate over Map values for better compatibility
  const entries = Array.from(sourceMap.values());

  for (const entry of entries) {
    // Skip sources that have been removed
    if (entry.action === 'REMOVED') {
      continue;
    }

    // Convert history entry to CapitalSource format
    activeSources.push({
      name: entry.name,
      annualRate: entry.annualRate,
      availableCents: entry.availableCents,
      usedCents: 0 as Cents, // Historical snapshots don't track usage
      remainingCents: entry.availableCents, // All available since no usage tracked
      priority: 1, // Default priority for historical data
    });
  }

  return activeSources;
}

/**
 * Calculate WACC at a specific date
 *
 * WACC (Weighted Average Cost of Capital) is calculated as:
 * WACC = Σ(Weight × Cost) where Weight = Source Amount / Total Capital
 *
 * Formula: Σ(source.availableCents / totalCapital) × source.annualRate
 *
 * @param date - The date to calculate WACC for
 * @param history - Complete capital source history
 * @returns WACC snapshot with date, sources, wacc, and total capital
 *
 * @example
 * const snapshot = calculateWACCAtDate(
 *   new Date('2025-03-15'),
 *   capitalHistory
 * );
 * // Returns: {
 * //   date: Date,
 * //   sources: [...],
 * //   wacc: 0.135, // 13.5%
 * //   totalCapitalCents: 500000000 // $5M
 * // }
 */
export function calculateWACCAtDate(
  date: Date,
  history: CapitalSourceHistory[]
): WACCSnapshot {
  // Get active sources at this date
  const sources = getCapitalSourcesAtDate(date, history);

  // If no sources, return zero WACC
  if (sources.length === 0) {
    return {
      date,
      sources: [],
      wacc: 0,
      totalCapitalCents: 0 as Cents,
    };
  }

  // Calculate total capital
  const totalCapitalCents = sources.reduce(
    (sum, source) => sum + source.availableCents,
    0
  ) as Cents;

  // Handle edge case: no capital (shouldn't happen if sources exist, but safety check)
  if (totalCapitalCents === 0) {
    return {
      date,
      sources,
      wacc: 0,
      totalCapitalCents: 0 as Cents,
    };
  }

  // Calculate weighted average cost of capital
  // WACC = Σ(weight × rate) where weight = source.availableCents / totalCapital
  let wacc = 0;

  for (const source of sources) {
    const weight = source.availableCents / totalCapitalCents;
    wacc += weight * source.annualRate;
  }

  return {
    date,
    sources,
    wacc,
    totalCapitalCents,
  };
}

/**
 * Calculate time-weighted average WACC for a period
 *
 * This function:
 * 1. Gets all history events within the period
 * 2. Creates sub-periods between each change
 * 3. Calculates WACC for each sub-period
 * 4. Weights each WACC by number of days it was active
 * 5. Returns the weighted average
 *
 * Edge cases handled:
 * - No changes during period: uses WACC at period start
 * - No capital at any point: returns 0
 * - Single source: returns that source's rate
 *
 * @param startDate - Start of the period
 * @param endDate - End of the period
 * @param history - Complete capital source history
 * @returns Time-weighted average WACC as decimal (e.g., 0.125 for 12.5%)
 *
 * @example
 * const avgWACC = calculateAverageWACCForPeriod(
 *   new Date('2025-01-01'),
 *   new Date('2025-01-31'),
 *   capitalHistory
 * );
 * // Returns: 0.132 (13.2% average for the month)
 */
export function calculateAverageWACCForPeriod(
  startDate: Date,
  endDate: Date,
  history: CapitalSourceHistory[]
): number {
  // Get all history events within the period (inclusive)
  const periodEvents = history.filter(
    (entry) => entry.effectiveDate >= startDate && entry.effectiveDate <= endDate
  );

  // If no changes during period, use WACC at period start
  if (periodEvents.length === 0) {
    const snapshot = calculateWACCAtDate(startDate, history);
    return snapshot.wacc;
  }

  // Sort events by date to process chronologically
  periodEvents.sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime());

  // Build sub-periods: from start date to first event, between events, last event to end
  const subPeriods: Array<{ start: Date; end: Date }> = [];

  // First sub-period: start date to first event
  if (periodEvents[0].effectiveDate > startDate) {
    subPeriods.push({
      start: startDate,
      end: periodEvents[0].effectiveDate,
    });
  }

  // Sub-periods between events
  for (let i = 0; i < periodEvents.length - 1; i++) {
    subPeriods.push({
      start: periodEvents[i].effectiveDate,
      end: periodEvents[i + 1].effectiveDate,
    });
  }

  // Last sub-period: last event to end date
  const lastEvent = periodEvents[periodEvents.length - 1];
  if (lastEvent.effectiveDate < endDate) {
    subPeriods.push({
      start: lastEvent.effectiveDate,
      end: endDate,
    });
  }

  // Handle edge case: single event on start or end date
  if (subPeriods.length === 0) {
    // Event is exactly on start or end date
    const snapshot = calculateWACCAtDate(startDate, history);
    return snapshot.wacc;
  }

  // Calculate weighted average WACC across sub-periods
  let totalWeightedWACC = 0;
  let totalDays = 0;

  for (const period of subPeriods) {
    // Get WACC at the start of this sub-period
    const snapshot = calculateWACCAtDate(period.start, history);

    // Calculate days in this sub-period
    const days = getDaysBetween(period.start, period.end);

    // Add to weighted sum
    totalWeightedWACC += snapshot.wacc * days;
    totalDays += days;
  }

  // Return weighted average (handle division by zero edge case)
  if (totalDays === 0) {
    const snapshot = calculateWACCAtDate(startDate, history);
    return snapshot.wacc;
  }

  return totalWeightedWACC / totalDays;
}

/**
 * Calculate WACC metrics for a specific period type
 *
 * Uses the date-period utilities to get period boundaries, then calculates:
 * - WACC at period start
 * - WACC at period end
 * - Time-weighted average WACC for the entire period
 *
 * @param periodType - Type of period (monthly, quarterly, yearly, etc.)
 * @param referenceDate - Reference date within the period
 * @param history - Complete capital source history
 * @returns Object with start WACC, end WACC, and average WACC
 *
 * @example
 * const metrics = calculatePeriodWACC(
 *   'monthly',
 *   new Date('2025-03-15'),
 *   capitalHistory
 * );
 * // Returns: {
 * //   start: 0.13,  // 13% at March 1
 * //   end: 0.14,    // 14% at March 31
 * //   average: 0.135 // 13.5% average for March
 * // }
 */
export function calculatePeriodWACC(
  startDate: Date,
  endDate: Date,
  history: CapitalSourceHistory[]
): { start: number; end: number; average: number } {
  // Calculate WACC at start of period
  const startSnapshot = calculateWACCAtDate(startDate, history);

  // Calculate WACC at end of period
  const endSnapshot = calculateWACCAtDate(endDate, history);

  // Calculate time-weighted average WACC for the period
  const averageWACC = calculateAverageWACCForPeriod(startDate, endDate, history);

  return {
    start: startSnapshot.wacc,
    end: endSnapshot.wacc,
    average: averageWACC,
  };
}

/**
 * Generate WACC trend data for multiple periods
 *
 * Calculates average WACC and total capital for each period in the array.
 * Returns data suitable for charting and visualization.
 *
 * @param periods - Array of date ranges to analyze
 * @param history - Complete capital source history
 * @returns Array of trend data points with period label, WACC, and total capital
 *
 * @example
 * const periods = getMonthlyPeriods(2025);
 * const trendData = getWACCTrendData(periods, capitalHistory);
 * // Returns: [
 * //   { period: 'Jan 2025', wacc: 0.13, totalCapital: 5000000 },
 * //   { period: 'Feb 2025', wacc: 0.135, totalCapital: 5500000 },
 * //   ...
 * // ]
 */
export function getWACCTrendData(
  periods: DateRange[],
  history: CapitalSourceHistory[]
): Array<{ period: string; wacc: number; totalCapital: number }> {
  const trendData: Array<{ period: string; wacc: number; totalCapital: number }> = [];

  for (const periodRange of periods) {
    // Calculate average WACC for this period
    const averageWACC = calculateAverageWACCForPeriod(
      periodRange.startDate,
      periodRange.endDate,
      history
    );

    // Get snapshot at end of period for total capital
    const endSnapshot = calculateWACCAtDate(periodRange.endDate, history);

    // Determine period type based on date range characteristics
    // Use else-if ordering to make checks mutually exclusive
    let periodType: PeriodType = 'custom';

    // getDaysBetween returns exclusive count (difference), but we need inclusive
    // For Feb 1 to Feb 28: getDaysBetween = 27, but inclusive count = 28 days
    const daysDiff = getDaysBetween(periodRange.startDate, periodRange.endDate);
    const inclusiveDays = daysDiff + 1;

    // Check if it's a yearly period (365-366 days inclusive)
    if (inclusiveDays >= 365 && inclusiveDays <= 366) {
      periodType = 'yearly';
    }
    // Check if it's a quarterly period (90-92 days AND starts on quarter boundary)
    else if (inclusiveDays >= 90 && inclusiveDays <= 92 && isQuarterStart(periodRange.startDate)) {
      periodType = 'quarterly';
    }
    // Check if it's a rolling 90-day period (exactly 90 days, NOT a quarter)
    else if (inclusiveDays === 90) {
      periodType = '90-day';
    }
    // Check if it's a rolling 60-day period (exactly 60 days)
    else if (inclusiveDays === 60) {
      periodType = '60-day';
    }
    // Check if it's a monthly period (28-31 days inclusive, starts on month boundary)
    else if (inclusiveDays >= 28 && inclusiveDays <= 31) {
      const isStartOfMonth = periodRange.startDate.getDate() === 1;
      const isEndOfMonth = periodRange.endDate.getDate() >= 28;
      if (isStartOfMonth && isEndOfMonth) {
        periodType = 'monthly';
      }
    }

    // Format period label using utility function
    const periodLabel = formatPeriodLabel(
      periodType,
      periodRange.startDate,
      periodRange.endDate
    );

    // Add to trend data
    trendData.push({
      period: periodLabel,
      wacc: averageWACC,
      totalCapital: endSnapshot.totalCapitalCents,
    });
  }

  return trendData;
}
