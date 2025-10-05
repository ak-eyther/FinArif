/**
 * Risk scoring calculations
 *
 * All risk scores are 0-100 scale
 * Risk levels: 0-30 (low), 31-60 (medium), 61-100 (high)
 */

import type { RiskLevel, FeeTier } from '../types';
import {
  FEE_TIERS,
  PROVIDER_RISK_WEIGHTS,
  INSURANCE_RISK_WEIGHTS
} from '../constants';

/**
 * Calculate provider risk score based on historical performance
 *
 * Formula: (Default History × 40%) + (Claim Quality × 30%) + (Concentration × 30%)
 *
 * @param defaultHistory - Historical default rate (0-100)
 * @param claimQuality - Quality of submitted claims (0-100, lower is better)
 * @param concentration - Reliance on single insurer (0-100, higher is riskier)
 * @returns Risk score (0-100)
 *
 * @example
 * calculateProviderRisk(20, 15, 30) // Returns: 22
 */
export function calculateProviderRisk(
  defaultHistory: number,
  claimQuality: number,
  concentration: number
): number {
  // Validate inputs
  if (defaultHistory < 0 || defaultHistory > 100) {
    throw new Error(`Default history must be 0-100, got ${defaultHistory}`);
  }
  if (claimQuality < 0 || claimQuality > 100) {
    throw new Error(`Claim quality must be 0-100, got ${claimQuality}`);
  }
  if (concentration < 0 || concentration > 100) {
    throw new Error(`Concentration must be 0-100, got ${concentration}`);
  }

  const score =
    defaultHistory * PROVIDER_RISK_WEIGHTS.DEFAULT_HISTORY +
    claimQuality * PROVIDER_RISK_WEIGHTS.CLAIM_QUALITY +
    concentration * PROVIDER_RISK_WEIGHTS.CONCENTRATION;

  return Math.round(score);
}

/**
 * Calculate insurance company risk score
 *
 * Formula: (Payment Delay × 50%) + (Default Rate × 50%)
 *
 * @param paymentDelay - Average payment delay score (0-100, higher = slower)
 * @param defaultRate - Historical default rate (0-100)
 * @returns Risk score (0-100)
 *
 * @example
 * calculateInsuranceRisk(40, 10) // Returns: 25
 */
export function calculateInsuranceRisk(
  paymentDelay: number,
  defaultRate: number
): number {
  // Validate inputs
  if (paymentDelay < 0 || paymentDelay > 100) {
    throw new Error(`Payment delay must be 0-100, got ${paymentDelay}`);
  }
  if (defaultRate < 0 || defaultRate > 100) {
    throw new Error(`Default rate must be 0-100, got ${defaultRate}`);
  }

  const score =
    paymentDelay * INSURANCE_RISK_WEIGHTS.PAYMENT_DELAY +
    defaultRate * INSURANCE_RISK_WEIGHTS.DEFAULT_RATE;

  return Math.round(score);
}

/**
 * Calculate overall transaction risk score
 *
 * Formula: (Provider Risk + Insurance Risk) ÷ 2
 *
 * @param providerRisk - Provider risk score (0-100)
 * @param insuranceRisk - Insurance risk score (0-100)
 * @returns Combined risk score (0-100)
 *
 * @example
 * calculateTransactionRisk(22, 25) // Returns: 24
 */
export function calculateTransactionRisk(
  providerRisk: number,
  insuranceRisk: number
): number {
  // Validate inputs
  if (providerRisk < 0 || providerRisk > 100) {
    throw new Error(`Provider risk must be 0-100, got ${providerRisk}`);
  }
  if (insuranceRisk < 0 || insuranceRisk > 100) {
    throw new Error(`Insurance risk must be 0-100, got ${insuranceRisk}`);
  }

  return Math.round((providerRisk + insuranceRisk) / 2);
}

/**
 * Classify risk score into risk level
 *
 * Levels:
 * - 0-30: Low Risk
 * - 31-60: Medium Risk
 * - 61-100: High Risk
 *
 * @param riskScore - Risk score (0-100)
 * @returns Risk level classification
 *
 * @example
 * getRiskLevel(24) // Returns: "low"
 * getRiskLevel(45) // Returns: "medium"
 * getRiskLevel(75) // Returns: "high"
 */
export function getRiskLevel(riskScore: number): RiskLevel {
  // Validate input
  if (riskScore < 0 || riskScore > 100) {
    throw new Error(`Risk score must be 0-100, got ${riskScore}`);
  }

  // Find matching tier
  for (const tier of FEE_TIERS) {
    if (riskScore >= tier.min && riskScore <= tier.max) {
      return tier.level;
    }
  }

  // Fallback (should never reach here with valid input)
  return 'high';
}

/**
 * Get discount fee rate based on risk score
 *
 * Fee Rates:
 * - Low Risk (0-30): 3%
 * - Medium Risk (31-60): 4%
 * - High Risk (61-100): 5%
 *
 * @param riskScore - Risk score (0-100)
 * @returns Fee rate as decimal (e.g., 0.04 for 4%)
 *
 * @example
 * getFeeRate(24) // Returns: 0.03 (3%)
 * getFeeRate(45) // Returns: 0.04 (4%)
 * getFeeRate(75) // Returns: 0.05 (5%)
 */
export function getFeeRate(riskScore: number): number {
  // Validate input
  if (riskScore < 0 || riskScore > 100) {
    throw new Error(`Risk score must be 0-100, got ${riskScore}`);
  }

  // Find matching tier
  for (const tier of FEE_TIERS) {
    if (riskScore >= tier.min && riskScore <= tier.max) {
      return tier.fee;
    }
  }

  // Fallback to highest fee (should never reach here with valid input)
  return FEE_TIERS[FEE_TIERS.length - 1].fee;
}

/**
 * Get fee tier configuration for a risk score
 *
 * @param riskScore - Risk score (0-100)
 * @returns Complete fee tier information
 */
export function getFeeTier(riskScore: number): FeeTier {
  // Validate input
  if (riskScore < 0 || riskScore > 100) {
    throw new Error(`Risk score must be 0-100, got ${riskScore}`);
  }

  // Find matching tier
  for (const tier of FEE_TIERS) {
    if (riskScore >= tier.min && riskScore <= tier.max) {
      return tier;
    }
  }

  // Fallback to highest tier
  return FEE_TIERS[FEE_TIERS.length - 1];
}
