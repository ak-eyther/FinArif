/**
 * Type definitions for Time-Based WACC Capital Management
 * Phase 1 - Wave 1: Capital History & Period Analysis
 *
 * CRITICAL RULES:
 * - All money values stored in CENTS (integers)
 * - All rates as decimals (0.04 for 4%)
 * - No floating point for currency
 */

import type { Cents, CapitalSource } from './index';

/**
 * Tracks all changes to capital sources over time
 * Used for audit trail and historical WACC calculations
 */
export interface CapitalSourceHistory {
  /** Unique identifier for this history record */
  id: string;

  /** Links to the capital source this record tracks */
  sourceId: string;

  /** When this change became active/effective */
  effectiveDate: Date;

  /** Name of the capital source at this point in time */
  name: string;

  /** Annual interest rate as decimal (e.g., 0.14 for 14%) */
  annualRate: number;

  /** Available capital amount in cents */
  availableCents: Cents;

  /** Type of change that occurred */
  action: 'ADDED' | 'AMOUNT_CHANGED' | 'RATE_CHANGED' | 'REMOVED';

  /** Previous rate before change (for audit trail) */
  previousRate?: number;

  /** Previous amount before change (for audit trail) */
  previousAmount?: Cents;

  /** Optional explanation for why the change was made */
  notes?: string;
}

/**
 * Supported period types for time-based analysis
 */
export type PeriodType = 'monthly' | 'quarterly' | 'custom' | 'yearly' | '60-day' | '90-day';

/**
 * Snapshot of capital state at a specific point in time
 * Used to calculate historical WACC and analyze capital changes
 */
export interface WACCSnapshot {
  /** Date of this snapshot */
  date: Date;

  /** All active capital sources at this date */
  sources: CapitalSource[];

  /** Calculated Weighted Average Cost of Capital as decimal (e.g., 0.12 for 12%) */
  wacc: number;

  /** Total capital available across all sources in cents */
  totalCapitalCents: Cents;
}

/**
 * Complete analysis for a specific time period
 * Combines WACC metrics with transaction performance
 */
export interface PeriodAnalysis {
  /** Start date of analysis period */
  periodStart: Date;

  /** End date of analysis period */
  periodEnd: Date;

  /** Type of period being analyzed */
  periodType: PeriodType;

  /** WACC at the start of the period */
  startWACC: number;

  /** WACC at the end of the period */
  endWACC: number;

  /** Time-weighted average WACC for the period */
  averageWACC: number;

  /** Total amount disbursed to providers during period in cents */
  totalDisbursedCents: Cents;

  /** Total revenue earned during period in cents */
  totalRevenueCents: Cents;

  /** Total costs incurred during period in cents */
  totalCostsCents: Cents;

  /** Net Interest Margin for the period as decimal (e.g., 0.045 for 4.5%) */
  nim: number;

  /** Number of transactions processed during period */
  transactionCount: number;
}

/**
 * Helper type for defining date ranges
 * Used for filtering and querying historical data
 */
export interface DateRange {
  /** Start of the date range */
  startDate: Date;

  /** End of the date range */
  endDate: Date;
}
