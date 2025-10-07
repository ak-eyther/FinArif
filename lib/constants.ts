/**
 * Business constants and configuration for FinArif MVP
 *
 * CRITICAL: These values drive all calculations
 * Changes must be validated with business team
 */

import type { Cents, FeeTier, CapitalSource } from './types';

/**
 * Fee structure based on risk levels
 * Low Risk (0-30): 3%
 * Medium Risk (31-60): 4%
 * High Risk (61-100): 5%
 */
export const FEE_TIERS: FeeTier[] = [
  { min: 0, max: 30, fee: 0.03, level: 'low' },
  { min: 31, max: 60, fee: 0.04, level: 'medium' },
  { min: 61, max: 100, fee: 0.05, level: 'high' }
];

/**
 * Fixed operating cost rate
 * Applied to all transactions
 */
export const OPERATING_COST_RATE = 0.005; // 0.5%

/**
 * Default provision multiplier
 * Provision = Risk Score × 2%
 */
export const DEFAULT_PROVISION_MULTIPLIER = 0.02; // 2%

/**
 * Capital sources with priority order
 * Priority 1 = use first (cheapest)
 * Priority 4 = use last (most expensive)
 *
 * Total Available Capital: KES 2,750,000 (275,000,000 cents)
 */
export const CAPITAL_SOURCES: CapitalSource[] = [
  {
    name: 'Grant Capital',
    annualRate: 0.05, // 5%
    availableCents: 50000000 as Cents, // KES 500,000
    usedCents: 0 as Cents,
    remainingCents: 50000000 as Cents,
    priority: 1
  },
  {
    name: 'Equity',
    annualRate: 0.00, // 0% interest (but 20% ROE expected)
    availableCents: 100000000 as Cents, // KES 1,000,000
    usedCents: 0 as Cents,
    remainingCents: 100000000 as Cents,
    priority: 2
  },
  {
    name: 'Bank LOC',
    annualRate: 0.14, // 14%
    availableCents: 75000000 as Cents, // KES 750,000
    usedCents: 0 as Cents,
    remainingCents: 75000000 as Cents,
    priority: 3
  },
  {
    name: 'Investor Debt',
    annualRate: 0.20, // 20%
    availableCents: 50000000 as Cents, // KES 500,000
    usedCents: 0 as Cents,
    remainingCents: 50000000 as Cents,
    priority: 4
  }
];

/**
 * Risk management limits
 */
export const RISK_LIMITS = {
  /** Maximum exposure to single provider (20%) */
  MAX_PROVIDER_CONCENTRATION: 0.20,

  /** Maximum exposure to single insurer (30%) */
  MAX_INSURER_CONCENTRATION: 0.30,

  /** Minimum acceptable NIM (3%) */
  MIN_NIM: 0.03,

  /** Target NIM (4.5%) */
  TARGET_NIM: 0.045,

  /** Maximum acceptable default rate (5%) */
  MAX_DEFAULT_RATE: 0.05
};

/**
 * Risk score weights for provider risk calculation
 */
export const PROVIDER_RISK_WEIGHTS = {
  DEFAULT_HISTORY: 0.40, // 40%
  CLAIM_QUALITY: 0.30, // 30%
  CONCENTRATION: 0.30 // 30%
};

/**
 * Risk score weights for insurance risk calculation
 */
export const INSURANCE_RISK_WEIGHTS = {
  PAYMENT_DELAY: 0.50, // 50%
  DEFAULT_RATE: 0.50 // 50%
};

/**
 * Kenyan healthcare providers
 */
export const PROVIDERS = [
  'Nairobi Hospital',
  'Aga Khan University Hospital',
  'Kenyatta National Hospital',
  'MP Shah Hospital',
  "Gertrude's Children Hospital",
  'The Mater Hospital',
  'Avenue Healthcare',
  'Coptic Hospital',
  'Karen Hospital',
  'Nairobi West Hospital'
] as const;

/**
 * Kenyan insurance companies
 */
export const INSURERS = [
  'NHIF', // National Hospital Insurance Fund
  'AAR Insurance',
  'Jubilee Insurance',
  'CIC Insurance',
  'UAP Insurance',
  'Madison Insurance',
  'Britam',
  'APA Insurance'
] as const;

/**
 * Currency settings
 */
export const CURRENCY = {
  CODE: 'KES',
  SYMBOL: 'KES',
  NAME: 'Kenyan Shilling',
  /** Cents per unit (100 cents = 1 KES) */
  CENTS_PER_UNIT: 100
};

/**
 * Days in year for interest calculations
 * Using 365 days (not 360)
 */
export const DAYS_PER_YEAR = 365;

/**
 * Typical collection periods (days)
 */
export const COLLECTION_PERIODS = {
  MIN: 30,
  MAX: 90,
  AVERAGE: 60
};

/**
 * Claim amount ranges (in cents)
 */
export const CLAIM_RANGES = {
  OPD_MIN: 5000000 as Cents, // KES 50,000
  OPD_MAX: 200000000 as Cents, // KES 2,000,000
  IPD_MIN: 100000000 as Cents, // KES 1,000,000
  IPD_MAX: 500000000 as Cents, // KES 5,000,000
  AVERAGE: 50000000 as Cents // KES 500,000
};

/**
 * ROE (Return on Equity) expectations
 */
export const ROE_TARGETS = {
  /** Expected ROE for equity investors */
  EQUITY_ROE: 0.20, // 20%

  /** Target blended ROE */
  TARGET_ROE: 0.20 // 20%
};

/**
 * Helper to convert KES to cents
 */
export function kesToCents(kes: number): Cents {
  const cents = Math.round(kes * CURRENCY.CENTS_PER_UNIT);
  return cents as Cents;
}

/**
 * Helper to convert cents to KES
 */
export function centsToKes(cents: Cents): number {
  return cents / CURRENCY.CENTS_PER_UNIT;
}
