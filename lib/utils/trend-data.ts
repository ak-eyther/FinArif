/**
 * Trend Data Generation Utilities
 *
 * Functions for generating time-series trend data for WACC analysis
 * across different period types (monthly, quarterly, yearly, etc.)
 *
 * @module utils/trend-data
 */

import type {
  PeriodType,
  DateRange,
  CapitalSourceHistory,
} from '@/lib/types';
import { getWACCTrendData } from '@/lib/calculations/wacc';
import { getPeriodDates, subtractDays } from '@/lib/utils/date-period';

/**
 * WACC trend data point for visualization
 */
export interface WACCTrendDataPoint {
  period: string;
  wacc: number;
  totalCapital: number;
}

/**
 * Generate WACC trend data for visualization based on period type
 *
 * Creates an array of date ranges based on the period type, then calculates
 * WACC metrics for each period. The number and span of periods varies:
 * - monthly: last 12 months
 * - quarterly: last 4 quarters
 * - yearly: last 3 years
 * - 60-day/90-day: last 6 rolling periods
 * - custom: just the selected period
 *
 * @param periodType - Type of period for trend analysis
 * @param dateRange - Current selected date range (used for custom periods)
 * @param capitalHistory - Complete capital source history
 * @returns Array of trend data points with period labels and WACC metrics
 *
 * @example
 * const trendData = generateWACCTrendData(
 *   'monthly',
 *   { startDate: new Date('2025-01-01'), endDate: new Date('2025-01-31') },
 *   capitalHistory
 * );
 * // Returns: [
 * //   { period: 'Jan 2024', wacc: 0.13, totalCapital: 5000000 },
 * //   { period: 'Feb 2024', wacc: 0.135, totalCapital: 5500000 },
 * //   ...
 * //   { period: 'Dec 2024', wacc: 0.14, totalCapital: 6000000 }
 * // ]
 */
export function generateWACCTrendData(
  periodType: PeriodType,
  dateRange: DateRange,
  capitalHistory: CapitalSourceHistory[]
): WACCTrendDataPoint[] {
  const now = new Date();
  let periods: DateRange[] = [];

  switch (periodType) {
    case 'monthly': {
      // Show last 12 months
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const monthPeriod = getPeriodDates('monthly', date);
        periods.push(monthPeriod);
      }
      break;
    }

    case 'quarterly': {
      // Show last 4 quarters
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentQuarter = Math.floor(currentMonth / 3);

      for (let i = 3; i >= 0; i--) {
        const quarterOffset = currentQuarter - i;
        const year = currentYear + Math.floor(quarterOffset / 4);
        const quarter = ((quarterOffset % 4) + 4) % 4;
        const date = new Date(year, quarter * 3, 1);
        const quarterPeriod = getPeriodDates('quarterly', date);
        periods.push(quarterPeriod);
      }
      break;
    }

    case 'yearly': {
      // Show last 3 years
      const currentYear = now.getFullYear();

      for (let i = 2; i >= 0; i--) {
        const date = new Date(currentYear - i, 0, 1);
        const yearPeriod = getPeriodDates('yearly', date);
        periods.push(yearPeriod);
      }
      break;
    }

    case '60-day':
    case '90-day': {
      // Show last 6 rolling periods
      const days = periodType === '60-day' ? 60 : 90;

      for (let i = 5; i >= 0; i--) {
        const startDate = subtractDays(now, days * (i + 1));
        const period = getPeriodDates(periodType, startDate);
        periods.push(period);
      }
      break;
    }

    case 'custom': {
      // Show just the selected period
      periods = [dateRange];
      break;
    }
  }

  // Generate trend data from periods
  const trendData = getWACCTrendData(periods, capitalHistory);

  // Convert to WACCTrendDataPoint format
  return trendData.map((point) => ({
    period: point.period,
    wacc: point.wacc,
    totalCapital: point.totalCapital,
  }));
}
