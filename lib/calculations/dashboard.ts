/**
 * Dashboard metrics calculations
 *
 * Calculate key metrics for main dashboard view
 */

import type { Transaction, DashboardMetrics, Cents, TrendDirection } from '../types/index';
import { calculatePL } from './profit-loss';

/**
 * Calculate total outstanding to providers
 *
 * Sum of all active transaction claim amounts
 *
 * @param transactions - All transactions
 * @returns Total outstanding in cents
 */
export function calculateTotalOutstanding(transactions: Transaction[]): Cents {
  const activeTransactions = transactions.filter(tx => tx.status === 'active');

  const total = activeTransactions.reduce(
    (sum, tx) => sum + tx.claimAmountCents,
    0
  );

  return total as Cents;
}

/**
 * Calculate total expected from insurers
 *
 * Sum of active claims plus revenue (what insurers will pay us)
 *
 * @param transactions - All transactions
 * @returns Total expected in cents
 */
export function calculateTotalExpected(transactions: Transaction[]): Cents {
  const activeTransactions = transactions.filter(tx => tx.status === 'active');

  const total = activeTransactions.reduce((sum, tx) => {
    // Expected = Claim Amount + Fee
    const feeCents = Math.round(tx.claimAmountCents * tx.feeRate);
    return sum + tx.claimAmountCents + feeCents;
  }, 0);

  return total as Cents;
}

/**
 * Calculate net exposure (gap)
 *
 * Difference between what we expect from insurers vs what we paid providers
 * Positive = profit expected, Negative = loss expected
 *
 * @param totalExpectedCents - Total expected from insurers
 * @param totalOutstandingCents - Total outstanding to providers
 * @returns Net exposure in cents
 */
export function calculateNetExposure(
  totalExpectedCents: Cents,
  totalOutstandingCents: Cents
): Cents {
  return (totalExpectedCents - totalOutstandingCents) as Cents;
}

/**
 * Calculate portfolio NIM
 *
 * Weighted average NIM across all active transactions
 *
 * @param transactions - All transactions
 * @returns Portfolio NIM as decimal (e.g., 0.045 for 4.5%)
 */
export function calculatePortfolioNIM(transactions: Transaction[]): number {
  const activeTransactions = transactions.filter(tx => tx.status === 'active');

  if (activeTransactions.length === 0) {
    return 0;
  }

  // Calculate total claim amount for weighting
  const totalClaimAmount = activeTransactions.reduce(
    (sum, tx) => sum + tx.claimAmountCents,
    0
  );

  if (totalClaimAmount === 0) {
    return 0;
  }

  // Calculate weighted NIM
  const weightedNIM = activeTransactions.reduce((sum, tx) => {
    const pl = calculatePL(
      tx.claimAmountCents,
      tx.riskScore,
      tx.capitalAnnualRate,
      tx.daysToCollection
    );

    // Weight each transaction's NIM by its claim amount
    const weight = tx.claimAmountCents / totalClaimAmount;
    return sum + pl.nimRate * weight;
  }, 0);

  return weightedNIM;
}

/**
 * Calculate trend direction (simplified for MVP)
 *
 * For MVP, we use simple heuristics:
 * - Outstanding: up if > 50% of portfolio
 * - Expected: up if > outstanding
 * - Exposure: up if positive
 * - NIM: up if > 4% target
 *
 * In production, this would compare to previous period
 *
 * @param currentValue - Current metric value
 * @param metricType - Type of metric
 * @param referenceValue - Optional reference value for comparison
 * @returns Trend direction
 */
export function calculateTrend(
  currentValue: number,
  metricType: 'outstanding' | 'expected' | 'exposure' | 'nim',
  referenceValue?: number
): TrendDirection {
  switch (metricType) {
    case 'outstanding':
      // For MVP: up if there's significant activity
      return currentValue > 0 ? 'up' : 'flat';

    case 'expected':
      // For MVP: up if expected > outstanding
      if (referenceValue !== undefined) {
        return currentValue > referenceValue ? 'up' : 'flat';
      }
      return 'flat';

    case 'exposure':
      // Up if positive exposure (profit expected)
      return currentValue > 0 ? 'up' : currentValue < 0 ? 'down' : 'flat';

    case 'nim':
      // Up if above 4% target
      return currentValue >= 0.04 ? 'up' : currentValue >= 0.03 ? 'flat' : 'down';

    default:
      return 'flat';
  }
}

/**
 * Calculate all dashboard metrics
 *
 * @param transactions - All transactions
 * @returns Complete dashboard metrics
 */
export function calculateDashboardMetrics(
  transactions: Transaction[]
): DashboardMetrics {
  const totalOutstandingCents = calculateTotalOutstanding(transactions);
  const totalExpectedCents = calculateTotalExpected(transactions);
  const netExposureCents = calculateNetExposure(
    totalExpectedCents,
    totalOutstandingCents
  );
  const portfolioNIM = calculatePortfolioNIM(transactions);

  return {
    totalOutstandingCents,
    totalExpectedCents,
    netExposureCents,
    portfolioNIM,
    trendOutstanding: calculateTrend(totalOutstandingCents, 'outstanding'),
    trendExpected: calculateTrend(
      totalExpectedCents,
      'expected',
      totalOutstandingCents
    ),
    trendExposure: calculateTrend(netExposureCents, 'exposure'),
    trendNIM: calculateTrend(portfolioNIM, 'nim')
  };
}
