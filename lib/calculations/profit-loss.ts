/**
 * Complete Profit & Loss calculations
 *
 * Includes all costs: capital, operating, and default provision
 */

import type { Cents, TransactionPL } from '../types';
import { OPERATING_COST_RATE, DEFAULT_PROVISION_MULTIPLIER } from '../constants';
import { calculateRevenue, calculateCapitalCost, calculateNIM } from './nim';
import { getFeeRate } from './risk';

/**
 * Calculate fixed operating cost
 *
 * Formula: Operating Cost = Claim Amount × 0.5%
 *
 * Covers platform costs, servicing, admin
 *
 * @param claimAmountCents - Claim amount in cents
 * @returns Operating cost in cents
 *
 * @example
 * // KES 10,000 claim
 * calculateOperatingCost(1000000) // Returns: 5,000 cents (KES 50)
 */
export function calculateOperatingCost(claimAmountCents: Cents): Cents {
  // Validate input
  if (claimAmountCents <= 0 || !Number.isInteger(claimAmountCents)) {
    throw new Error('Claim amount must be positive integer (cents)');
  }

  return Math.round(claimAmountCents * OPERATING_COST_RATE) as Cents;
}

/**
 * Calculate default provision based on risk
 *
 * Formula: Default Provision = Claim Amount × (Risk Score ÷ 100) × 2%
 *
 * WHY: Higher risk requires larger provision to cover potential defaults
 *
 * @param claimAmountCents - Claim amount in cents
 * @param riskScore - Transaction risk score (0-100)
 * @returns Default provision in cents
 *
 * @example
 * // KES 10,000 claim with risk score 40
 * calculateDefaultProvision(1000000, 40) // Returns: 8,000 cents (KES 80)
 * // Calculation: 1,000,000 × (40/100) × 0.02 = 8,000
 */
export function calculateDefaultProvision(
  claimAmountCents: Cents,
  riskScore: number
): Cents {
  // Validate inputs
  if (claimAmountCents <= 0 || !Number.isInteger(claimAmountCents)) {
    throw new Error('Claim amount must be positive integer (cents)');
  }
  if (riskScore < 0 || riskScore > 100) {
    throw new Error('Risk score must be 0-100');
  }

  const provision =
    claimAmountCents * (riskScore / 100) * DEFAULT_PROVISION_MULTIPLIER;

  return Math.round(provision) as Cents;
}

/**
 * Calculate complete Profit & Loss for a transaction
 *
 * Breakdown:
 * - Revenue = Claim × Fee Rate
 * - Capital Cost = (Claim × Rate × Days) ÷ 365
 * - Operating Cost = Claim × 0.5%
 * - Default Provision = Claim × (Risk/100) × 2%
 * - Net Profit = Revenue - All Costs
 *
 * @param claimAmountCents - Claim amount in cents
 * @param riskScore - Transaction risk score (0-100)
 * @param annualRate - Cost of funds annual rate as decimal
 * @param days - Days until collection
 * @returns Complete P&L breakdown
 *
 * @example
 * // BRD Example: KES 10,000, risk 40, 14% COF, 45 days
 * calculatePL(1000000, 40, 0.14, 45)
 * // Returns:
 * // {
 * //   claimAmountCents: 1000000,
 * //   revenueCents: 40000,         // 4% fee (medium risk)
 * //   capitalCostCents: 17260,     // 14% × 45/365
 * //   operatingCostCents: 5000,    // 0.5%
 * //   defaultProvisionCents: 8000, // 40 × 2%
 * //   totalCostsCents: 30260,
 * //   netProfitCents: 9740,
 * //   marginRate: 0.00974,         // 0.974%
 * //   nimRate: 0.02274             // 2.274%
 * // }
 */
export function calculatePL(
  claimAmountCents: Cents,
  riskScore: number,
  annualRate: number,
  days: number
): TransactionPL {
  // Get fee rate based on risk score
  const feeRate = getFeeRate(riskScore);

  // Calculate revenue
  const revenueCents = calculateRevenue(claimAmountCents, feeRate);

  // Calculate all costs
  const capitalCostCents = calculateCapitalCost(claimAmountCents, annualRate, days);
  const operatingCostCents = calculateOperatingCost(claimAmountCents);
  const defaultProvisionCents = calculateDefaultProvision(
    claimAmountCents,
    riskScore
  );

  // Total costs
  const totalCostsCents = (capitalCostCents +
    operatingCostCents +
    defaultProvisionCents) as Cents;

  // Net profit
  const netProfitCents = (revenueCents - totalCostsCents) as Cents;

  // Margin (includes all costs)
  const marginRate = netProfitCents / claimAmountCents;

  // NIM (only revenue - capital cost)
  const nimRate = calculateNIM(claimAmountCents, feeRate, annualRate, days);

  return {
    claimAmountCents,
    revenueCents,
    capitalCostCents,
    operatingCostCents,
    defaultProvisionCents,
    totalCostsCents,
    netProfitCents,
    marginRate,
    nimRate
  };
}

/**
 * Calculate portfolio-level P&L summary
 *
 * @param transactions - Array of transaction P&Ls
 * @returns Aggregated P&L
 */
export function calculatePortfolioPL(
  transactions: TransactionPL[]
): TransactionPL {
  if (transactions.length === 0) {
    // Return zero P&L
    return {
      claimAmountCents: 0 as Cents,
      revenueCents: 0 as Cents,
      capitalCostCents: 0 as Cents,
      operatingCostCents: 0 as Cents,
      defaultProvisionCents: 0 as Cents,
      totalCostsCents: 0 as Cents,
      netProfitCents: 0 as Cents,
      marginRate: 0,
      nimRate: 0
    };
  }

  // Sum all components
  const claimAmountCents = transactions.reduce(
    (sum, tx) => sum + tx.claimAmountCents,
    0
  ) as Cents;

  const revenueCents = transactions.reduce(
    (sum, tx) => sum + tx.revenueCents,
    0
  ) as Cents;

  const capitalCostCents = transactions.reduce(
    (sum, tx) => sum + tx.capitalCostCents,
    0
  ) as Cents;

  const operatingCostCents = transactions.reduce(
    (sum, tx) => sum + tx.operatingCostCents,
    0
  ) as Cents;

  const defaultProvisionCents = transactions.reduce(
    (sum, tx) => sum + tx.defaultProvisionCents,
    0
  ) as Cents;

  const totalCostsCents = (capitalCostCents +
    operatingCostCents +
    defaultProvisionCents) as Cents;

  const netProfitCents = (revenueCents - totalCostsCents) as Cents;

  // Portfolio-level rates
  const marginRate = claimAmountCents > 0 ? netProfitCents / claimAmountCents : 0;
  const nimRate =
    claimAmountCents > 0
      ? (revenueCents - capitalCostCents) / claimAmountCents
      : 0;

  return {
    claimAmountCents,
    revenueCents,
    capitalCostCents,
    operatingCostCents,
    defaultProvisionCents,
    totalCostsCents,
    netProfitCents,
    marginRate,
    nimRate
  };
}
