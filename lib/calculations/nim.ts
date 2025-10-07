/**
 * NIM (Net Interest Margin) calculations
 *
 * NIM = (Revenue - Capital Cost) ÷ Claim Amount
 * Measures profitability after cost of funds
 */

import type { Cents } from '../types';
import { DAYS_PER_YEAR } from '../constants';

/**
 * Calculate revenue from discount fee
 *
 * Formula: Revenue = Claim Amount × Discount Fee Rate
 *
 * @param claimAmountCents - Claim amount in cents
 * @param feeRate - Discount fee rate as decimal (e.g., 0.04 for 4%)
 * @returns Revenue in cents
 *
 * @example
 * // KES 10,000 claim with 3% fee
 * calculateRevenue(1000000, 0.03) // Returns: 30,000 cents (KES 300)
 */
export function calculateRevenue(
  claimAmountCents: Cents,
  feeRate: number
): Cents {
  // Validate inputs
  if (claimAmountCents <= 0 || !Number.isInteger(claimAmountCents)) {
    throw new Error('Claim amount must be positive integer (cents)');
  }
  if (feeRate <= 0 || feeRate > 0.1) {
    throw new Error('Fee rate must be between 0 and 0.1 (0-10%)');
  }

  return Math.round(claimAmountCents * feeRate) as Cents;
}

/**
 * Calculate capital cost based on cost of funds
 *
 * Formula: Capital Cost = (Claim Amount × Annual Rate × Days) ÷ 365
 *
 * WHY 365: We use actual days in year, not 360-day banker's year
 *
 * @param claimAmountCents - Claim amount in cents
 * @param annualRate - Annual interest rate as decimal (e.g., 0.14 for 14%)
 * @param days - Number of days until collection
 * @returns Capital cost in cents, rounded to nearest cent
 *
 * @example
 * // KES 10,000 claim, 14% annual rate, 45 days
 * calculateCapitalCost(1000000, 0.14, 45) // Returns: 17,260 cents (KES 172.60)
 */
export function calculateCapitalCost(
  claimAmountCents: Cents,
  annualRate: number,
  days: number
): Cents {
  // Validate inputs
  if (claimAmountCents <= 0 || !Number.isInteger(claimAmountCents)) {
    throw new Error('Claim amount must be positive integer (cents)');
  }
  if (annualRate < 0 || annualRate > 1) {
    throw new Error('Annual rate must be between 0 and 1 (0-100%)');
  }
  if (days <= 0 || !Number.isInteger(days)) {
    throw new Error('Days must be positive integer');
  }

  // Calculate using actual days
  const cost = (claimAmountCents * annualRate * days) / DAYS_PER_YEAR;

  return Math.round(cost) as Cents;
}

/**
 * Calculate Net Interest Margin (NIM)
 *
 * Formula: NIM = (Revenue - Capital Cost) ÷ Claim Amount
 *
 * NIM measures profitability after accounting for cost of funds.
 * Target: 4.5% minimum
 *
 * @param claimAmountCents - Claim amount in cents
 * @param feeRate - Discount fee rate as decimal
 * @param annualRate - Annual interest rate as decimal
 * @param days - Days until collection
 * @returns NIM as decimal (e.g., 0.01274 for 1.274%)
 *
 * @example
 * // BRD Example: KES 10,000, 3% fee, 14% COF, 45 days
 * calculateNIM(1000000, 0.03, 0.14, 45)
 * // Revenue = 30,000 cents
 * // Capital Cost = 17,260 cents
 * // NIM = (30,000 - 17,260) / 1,000,000 = 0.01274 (1.274%)
 */
export function calculateNIM(
  claimAmountCents: Cents,
  feeRate: number,
  annualRate: number,
  days: number
): number {
  const revenueCents = calculateRevenue(claimAmountCents, feeRate);
  const capitalCostCents = calculateCapitalCost(claimAmountCents, annualRate, days);

  const nim = (revenueCents - capitalCostCents) / claimAmountCents;

  // Return as decimal, not percentage
  return nim;
}

/**
 * Calculate blended cost of funds for a portfolio
 *
 * @param capitalSources - Array of capital sources with amounts and rates
 * @returns Weighted average annual rate as decimal
 *
 * @example
 * const sources = [
 *   { amountCents: 1000000, annualRate: 0.05 },
 *   { amountCents: 2000000, annualRate: 0.14 }
 * ];
 * calculateBlendedCOF(sources) // Returns: ~0.11 (11%)
 */
export function calculateBlendedCOF(
  capitalSources: Array<{ amountCents: Cents; annualRate: number }>
): number {
  const totalAmount = capitalSources.reduce(
    (sum, source) => sum + source.amountCents,
    0
  );

  if (totalAmount === 0) {
    return 0;
  }

  const weightedRate = capitalSources.reduce((sum, source) => {
    const weight = source.amountCents / totalAmount;
    return sum + source.annualRate * weight;
  }, 0);

  return weightedRate;
}
