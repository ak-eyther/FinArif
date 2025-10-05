/**
 * Type definitions for FinArif MVP Dashboard
 *
 * CRITICAL RULES:
 * - All money values stored in CENTS (integers)
 * - All rates as decimals (0.04 for 4%)
 * - No floating point for currency
 */

/**
 * Branded type for currency in cents
 * Prevents mixing regular numbers with currency
 */
export type Cents = number & { readonly __brand: 'Cents' };

/**
 * Transaction status throughout lifecycle
 */
export type TransactionStatus = 'active' | 'collected' | 'defaulted';

/**
 * Risk level classification
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Trend direction for metrics
 */
export type TrendDirection = 'up' | 'down' | 'flat';

/**
 * Complete transaction record
 */
export interface Transaction {
  /** Unique transaction identifier */
  id: string;

  /** Provider information */
  providerName: string;
  providerRiskScore: number; // 0-100

  /** Insurance information */
  insuranceName: string;
  insuranceRiskScore: number; // 0-100

  /** Financial details */
  claimAmountCents: Cents;

  /** Dates */
  disbursementDate: Date;
  expectedCollectionDate: Date;
  actualCollectionDate: Date | null;

  /** Status and risk */
  status: TransactionStatus;
  riskScore: number; // 0-100 (average of provider + insurance)
  riskLevel: RiskLevel;

  /** Pricing */
  feeRate: number; // Decimal (e.g., 0.04 for 4%)

  /** Capital source used */
  capitalSourceName: string;
  capitalAnnualRate: number; // Decimal (e.g., 0.14 for 14%)

  /** Calculated fields */
  daysToCollection: number;
}

/**
 * Profit & Loss breakdown for a transaction
 */
export interface TransactionPL {
  claimAmountCents: Cents;
  revenueCents: Cents;
  capitalCostCents: Cents;
  operatingCostCents: Cents;
  defaultProvisionCents: Cents;
  totalCostsCents: Cents;
  netProfitCents: Cents;
  marginRate: number; // Decimal
  nimRate: number; // Decimal
}

/**
 * Capital source configuration
 */
export interface CapitalSource {
  name: string;
  annualRate: number; // Decimal (e.g., 0.14 for 14%)
  availableCents: Cents;
  usedCents: Cents;
  remainingCents: Cents;
  priority: number; // 1 = use first, 4 = use last
}

/**
 * Dashboard metrics summary
 */
export interface DashboardMetrics {
  totalOutstandingCents: Cents; // Money paid to providers
  totalExpectedCents: Cents; // Money expected from insurers
  netExposureCents: Cents; // Gap (risk we carry)
  portfolioNIM: number; // Decimal (e.g., 0.045 for 4.5%)
  trendOutstanding: TrendDirection;
  trendExpected: TrendDirection;
  trendExposure: TrendDirection;
  trendNIM: TrendDirection;
}

/**
 * Risk concentration metric
 */
export interface ConcentrationMetric {
  name: string;
  exposureCents: Cents;
  percentageOfPortfolio: number; // Decimal (e.g., 0.25 for 25%)
}

/**
 * Risk distribution summary
 */
export interface RiskDistribution {
  lowRiskCount: number;
  lowRiskPercentage: number; // Decimal
  mediumRiskCount: number;
  mediumRiskPercentage: number; // Decimal
  highRiskCount: number;
  highRiskPercentage: number; // Decimal
}

/**
 * Capital allocation result
 */
export interface CapitalAllocation {
  sourceName: string;
  amountCents: Cents;
  annualRate: number; // Decimal
}

/**
 * Fee tier configuration
 */
export interface FeeTier {
  min: number; // Min risk score
  max: number; // Max risk score
  fee: number; // Fee rate as decimal
  level: RiskLevel;
}

/**
 * Claim type for Kenyan healthcare market
 */
export type ClaimType = 'OPD' | 'IPD';

/**
 * Claim status
 */
export type ClaimStatus = 'paid' | 'unpaid' | 'pending' | 'rejected';

/**
 * Individual claim record with Visit Number (Kenya market)
 */
export interface Claim {
  /** Visit Number - Primary key in Kenya market */
  visitNumber: string;

  /** Claim type */
  claimType: ClaimType;

  /** Provider ID */
  providerId: string;

  /** Financial details */
  claimAmountCents: Cents;

  /** Dates */
  serviceDate: Date; // Date service was provided
  submissionDate: Date; // Date claim was submitted
  paymentDate: Date | null; // Date claim was paid (if paid)

  /** Status */
  status: ClaimStatus;

  /** AI validation flags */
  aiValidationPassed: boolean;
  aiFraudFlagged: boolean;
  fraudReason?: string;

  /** Rejection info (if rejected after AI validation) */
  rejectedAfterAI: boolean;
  rejectionReason?: string;

  /** Insurer information */
  insuranceName: string;
}

/**
 * Provider information
 */
export interface Provider {
  id: string;
  name: string;
  discountPercentage: number; // 0-100 (percentage discount for both OPD and IPD)
  riskScore?: number; // Auto-calculated, not visible in MVP
}

/**
 * Provider dashboard statistics
 */
export interface ProviderStats {
  /** OPD Claims */
  totalOPDClaims: number;
  paidOPDClaims: number;
  unpaidOPDClaims: number;
  opdClaimAmountCents: Cents;

  /** IPD Claims */
  totalIPDClaims: number;
  paidIPDClaims: number;
  unpaidIPDClaims: number;
  ipdClaimAmountCents: Cents;

  /** Unpaid Claims */
  totalUnpaidClaims: number;
  totalUnpaidAmountCents: Cents;

  /** Rejected Claims (after AI validation) */
  rejectedAfterAIClaims: number;
  rejectedReasons: { reason: string; count: number }[];

  /** AI Fraud Flags */
  aiFraudFlaggedClaims: number;
  fraudReasons: { reason: string; count: number }[];

  /** Claim Submission Speed */
  avgSubmissionDays: number; // Average days from service to submission
  submissionTrend: TrendDirection;
}
