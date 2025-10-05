/**
 * Mock data for FinArif MVP Dashboard
 *
 * 18 realistic transactions with Kenyan providers and insurers
 * Mix of statuses, risk levels, and amounts
 */

import type { Transaction, Cents } from './types';
import { PROVIDERS, INSURERS, CAPITAL_SOURCES, kesToCents } from './constants';
import {
  calculateProviderRisk,
  calculateInsuranceRisk,
  calculateTransactionRisk,
  getRiskLevel,
  getFeeRate
} from './calculations/risk';

/**
 * Helper to create a date N days ago
 */
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Helper to create a date N days from now
 */
function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Generate mock transactions
 */
export const mockTransactions: Transaction[] = [
  // Transaction 1: Nairobi Hospital - Active, Low Risk
  {
    id: 'TX001',
    providerName: PROVIDERS[0], // Nairobi Hospital
    providerRiskScore: calculateProviderRisk(10, 8, 15), // 11
    insuranceName: INSURERS[0], // NHIF
    insuranceRiskScore: calculateInsuranceRisk(25, 15), // 20
    claimAmountCents: kesToCents(750000),
    disbursementDate: daysAgo(15),
    expectedCollectionDate: daysFromNow(45),
    actualCollectionDate: null,
    status: 'active',
    riskScore: 0, // Will be calculated
    riskLevel: 'low',
    feeRate: 0.03,
    capitalSourceName: CAPITAL_SOURCES[0].name, // Grant Capital
    capitalAnnualRate: CAPITAL_SOURCES[0].annualRate,
    daysToCollection: 60
  },

  // Transaction 2: Aga Khan - Active, Medium Risk
  {
    id: 'TX002',
    providerName: PROVIDERS[1], // Aga Khan
    providerRiskScore: calculateProviderRisk(25, 20, 30), // 25
    insuranceName: INSURERS[1], // AAR Insurance
    insuranceRiskScore: calculateInsuranceRisk(40, 35), // 38
    claimAmountCents: kesToCents(1200000),
    disbursementDate: daysAgo(30),
    expectedCollectionDate: daysFromNow(30),
    actualCollectionDate: null,
    status: 'active',
    riskScore: 0,
    riskLevel: 'medium',
    feeRate: 0.04,
    capitalSourceName: CAPITAL_SOURCES[1].name, // Equity
    capitalAnnualRate: CAPITAL_SOURCES[1].annualRate,
    daysToCollection: 60
  },

  // Transaction 3: Kenyatta National - Collected, Medium Risk
  {
    id: 'TX003',
    providerName: PROVIDERS[2], // Kenyatta National
    providerRiskScore: calculateProviderRisk(30, 25, 20), // 26
    insuranceName: INSURERS[2], // Jubilee Insurance
    insuranceRiskScore: calculateInsuranceRisk(35, 30), // 33
    claimAmountCents: kesToCents(450000),
    disbursementDate: daysAgo(75),
    expectedCollectionDate: daysAgo(15),
    actualCollectionDate: daysAgo(10),
    status: 'collected',
    riskScore: 0,
    riskLevel: 'medium',
    feeRate: 0.04,
    capitalSourceName: CAPITAL_SOURCES[2].name, // Bank LOC
    capitalAnnualRate: CAPITAL_SOURCES[2].annualRate,
    daysToCollection: 65
  },

  // Transaction 4: MP Shah - Active, High Risk
  {
    id: 'TX004',
    providerName: PROVIDERS[3], // MP Shah
    providerRiskScore: calculateProviderRisk(50, 40, 45), // 45
    insuranceName: INSURERS[3], // CIC Insurance
    insuranceRiskScore: calculateInsuranceRisk(70, 65), // 68
    claimAmountCents: kesToCents(2500000),
    disbursementDate: daysAgo(20),
    expectedCollectionDate: daysFromNow(40),
    actualCollectionDate: null,
    status: 'active',
    riskScore: 0,
    riskLevel: 'high',
    feeRate: 0.05,
    capitalSourceName: CAPITAL_SOURCES[2].name, // Bank LOC
    capitalAnnualRate: CAPITAL_SOURCES[2].annualRate,
    daysToCollection: 60
  },

  // Transaction 5: Gertrude's - Collected, Low Risk
  {
    id: 'TX005',
    providerName: PROVIDERS[4], // Gertrude's Children Hospital
    providerRiskScore: calculateProviderRisk(12, 10, 18), // 13
    insuranceName: INSURERS[0], // NHIF
    insuranceRiskScore: calculateInsuranceRisk(22, 18), // 20
    claimAmountCents: kesToCents(325000),
    disbursementDate: daysAgo(90),
    expectedCollectionDate: daysAgo(30),
    actualCollectionDate: daysAgo(25),
    status: 'collected',
    riskScore: 0,
    riskLevel: 'low',
    feeRate: 0.03,
    capitalSourceName: CAPITAL_SOURCES[0].name, // Grant Capital
    capitalAnnualRate: CAPITAL_SOURCES[0].annualRate,
    daysToCollection: 65
  },

  // Transaction 6: The Mater - Active, Medium Risk
  {
    id: 'TX006',
    providerName: PROVIDERS[5], // The Mater Hospital
    providerRiskScore: calculateProviderRisk(35, 28, 32), // 32
    insuranceName: INSURERS[4], // UAP Insurance
    insuranceRiskScore: calculateInsuranceRisk(45, 40), // 43
    claimAmountCents: kesToCents(890000),
    disbursementDate: daysAgo(10),
    expectedCollectionDate: daysFromNow(50),
    actualCollectionDate: null,
    status: 'active',
    riskScore: 0,
    riskLevel: 'medium',
    feeRate: 0.04,
    capitalSourceName: CAPITAL_SOURCES[1].name, // Equity
    capitalAnnualRate: CAPITAL_SOURCES[1].annualRate,
    daysToCollection: 60
  },

  // Transaction 7: Avenue Healthcare - Defaulted, High Risk
  {
    id: 'TX007',
    providerName: PROVIDERS[6], // Avenue Healthcare
    providerRiskScore: calculateProviderRisk(65, 55, 60), // 60
    insuranceName: INSURERS[5], // Madison Insurance
    insuranceRiskScore: calculateInsuranceRisk(80, 75), // 78
    claimAmountCents: kesToCents(150000),
    disbursementDate: daysAgo(120),
    expectedCollectionDate: daysAgo(30),
    actualCollectionDate: null,
    status: 'defaulted',
    riskScore: 0,
    riskLevel: 'high',
    feeRate: 0.05,
    capitalSourceName: CAPITAL_SOURCES[3].name, // Investor Debt
    capitalAnnualRate: CAPITAL_SOURCES[3].annualRate,
    daysToCollection: 90
  },

  // Transaction 8: Coptic Hospital - Active, Low Risk
  {
    id: 'TX008',
    providerName: PROVIDERS[7], // Coptic Hospital
    providerRiskScore: calculateProviderRisk(15, 12, 20), // 15
    insuranceName: INSURERS[6], // Britam
    insuranceRiskScore: calculateInsuranceRisk(28, 22), // 25
    claimAmountCents: kesToCents(620000),
    disbursementDate: daysAgo(25),
    expectedCollectionDate: daysFromNow(35),
    actualCollectionDate: null,
    status: 'active',
    riskScore: 0,
    riskLevel: 'low',
    feeRate: 0.03,
    capitalSourceName: CAPITAL_SOURCES[0].name, // Grant Capital
    capitalAnnualRate: CAPITAL_SOURCES[0].annualRate,
    daysToCollection: 60
  },

  // Transaction 9: Karen Hospital - Active, Medium Risk
  {
    id: 'TX009',
    providerName: PROVIDERS[8], // Karen Hospital
    providerRiskScore: calculateProviderRisk(38, 32, 35), // 35
    insuranceName: INSURERS[7], // APA Insurance
    insuranceRiskScore: calculateInsuranceRisk(50, 45), // 48
    claimAmountCents: kesToCents(1800000),
    disbursementDate: daysAgo(5),
    expectedCollectionDate: daysFromNow(55),
    actualCollectionDate: null,
    status: 'active',
    riskScore: 0,
    riskLevel: 'medium',
    feeRate: 0.04,
    capitalSourceName: CAPITAL_SOURCES[2].name, // Bank LOC
    capitalAnnualRate: CAPITAL_SOURCES[2].annualRate,
    daysToCollection: 60
  },

  // Transaction 10: Nairobi West - Collected, Low Risk
  {
    id: 'TX010',
    providerName: PROVIDERS[9], // Nairobi West Hospital
    providerRiskScore: calculateProviderRisk(18, 15, 22), // 18
    insuranceName: INSURERS[1], // AAR Insurance
    insuranceRiskScore: calculateInsuranceRisk(30, 25), // 28
    claimAmountCents: kesToCents(540000),
    disbursementDate: daysAgo(80),
    expectedCollectionDate: daysAgo(20),
    actualCollectionDate: daysAgo(15),
    status: 'collected',
    riskScore: 0,
    riskLevel: 'low',
    feeRate: 0.03,
    capitalSourceName: CAPITAL_SOURCES[0].name, // Grant Capital
    capitalAnnualRate: CAPITAL_SOURCES[0].annualRate,
    daysToCollection: 65
  },

  // Transaction 11: Nairobi Hospital - Active, Medium Risk
  {
    id: 'TX011',
    providerName: PROVIDERS[0], // Nairobi Hospital
    providerRiskScore: calculateProviderRisk(28, 22, 25), // 25
    insuranceName: INSURERS[3], // CIC Insurance
    insuranceRiskScore: calculateInsuranceRisk(42, 38), // 40
    claimAmountCents: kesToCents(975000),
    disbursementDate: daysAgo(12),
    expectedCollectionDate: daysFromNow(48),
    actualCollectionDate: null,
    status: 'active',
    riskScore: 0,
    riskLevel: 'medium',
    feeRate: 0.04,
    capitalSourceName: CAPITAL_SOURCES[1].name, // Equity
    capitalAnnualRate: CAPITAL_SOURCES[1].annualRate,
    daysToCollection: 60
  },

  // Transaction 12: Aga Khan - Collected, Medium Risk
  {
    id: 'TX012',
    providerName: PROVIDERS[1], // Aga Khan
    providerRiskScore: calculateProviderRisk(32, 28, 30), // 30
    insuranceName: INSURERS[0], // NHIF
    insuranceRiskScore: calculateInsuranceRisk(38, 32), // 35
    claimAmountCents: kesToCents(1350000),
    disbursementDate: daysAgo(85),
    expectedCollectionDate: daysAgo(25),
    actualCollectionDate: daysAgo(20),
    status: 'collected',
    riskScore: 0,
    riskLevel: 'medium',
    feeRate: 0.04,
    capitalSourceName: CAPITAL_SOURCES[2].name, // Bank LOC
    capitalAnnualRate: CAPITAL_SOURCES[2].annualRate,
    daysToCollection: 65
  },

  // Transaction 13: The Mater - Active, High Risk
  {
    id: 'TX013',
    providerName: PROVIDERS[5], // The Mater Hospital
    providerRiskScore: calculateProviderRisk(55, 48, 50), // 51
    insuranceName: INSURERS[4], // UAP Insurance
    insuranceRiskScore: calculateInsuranceRisk(72, 68), // 70
    claimAmountCents: kesToCents(3200000),
    disbursementDate: daysAgo(8),
    expectedCollectionDate: daysFromNow(52),
    actualCollectionDate: null,
    status: 'active',
    riskScore: 0,
    riskLevel: 'high',
    feeRate: 0.05,
    capitalSourceName: CAPITAL_SOURCES[2].name, // Bank LOC
    capitalAnnualRate: CAPITAL_SOURCES[2].annualRate,
    daysToCollection: 60
  },

  // Transaction 14: Karen Hospital - Collected, Low Risk
  {
    id: 'TX014',
    providerName: PROVIDERS[8], // Karen Hospital
    providerRiskScore: calculateProviderRisk(14, 11, 17), // 14
    insuranceName: INSURERS[6], // Britam
    insuranceRiskScore: calculateInsuranceRisk(26, 20), // 23
    claimAmountCents: kesToCents(425000),
    disbursementDate: daysAgo(92),
    expectedCollectionDate: daysAgo(32),
    actualCollectionDate: daysAgo(28),
    status: 'collected',
    riskScore: 0,
    riskLevel: 'low',
    feeRate: 0.03,
    capitalSourceName: CAPITAL_SOURCES[0].name, // Grant Capital
    capitalAnnualRate: CAPITAL_SOURCES[0].annualRate,
    daysToCollection: 64
  },

  // Transaction 15: MP Shah - Active, Medium Risk
  {
    id: 'TX015',
    providerName: PROVIDERS[3], // MP Shah
    providerRiskScore: calculateProviderRisk(36, 30, 33), // 33
    insuranceName: INSURERS[2], // Jubilee Insurance
    insuranceRiskScore: calculateInsuranceRisk(48, 42), // 45
    claimAmountCents: kesToCents(1100000),
    disbursementDate: daysAgo(18),
    expectedCollectionDate: daysFromNow(42),
    actualCollectionDate: null,
    status: 'active',
    riskScore: 0,
    riskLevel: 'medium',
    feeRate: 0.04,
    capitalSourceName: CAPITAL_SOURCES[1].name, // Equity
    capitalAnnualRate: CAPITAL_SOURCES[1].annualRate,
    daysToCollection: 60
  },

  // Transaction 16: Gertrude's - Active, Low Risk
  {
    id: 'TX016',
    providerName: PROVIDERS[4], // Gertrude's Children Hospital
    providerRiskScore: calculateProviderRisk(16, 13, 19), // 16
    insuranceName: INSURERS[7], // APA Insurance
    insuranceRiskScore: calculateInsuranceRisk(32, 28), // 30
    claimAmountCents: kesToCents(680000),
    disbursementDate: daysAgo(22),
    expectedCollectionDate: daysFromNow(38),
    actualCollectionDate: null,
    status: 'active',
    riskScore: 0,
    riskLevel: 'low',
    feeRate: 0.03,
    capitalSourceName: CAPITAL_SOURCES[0].name, // Grant Capital
    capitalAnnualRate: CAPITAL_SOURCES[0].annualRate,
    daysToCollection: 60
  },

  // Transaction 17: Coptic Hospital - Defaulted, High Risk
  {
    id: 'TX017',
    providerName: PROVIDERS[7], // Coptic Hospital
    providerRiskScore: calculateProviderRisk(70, 62, 68), // 67
    insuranceName: INSURERS[5], // Madison Insurance
    insuranceRiskScore: calculateInsuranceRisk(85, 80), // 83
    claimAmountCents: kesToCents(95000),
    disbursementDate: daysAgo(135),
    expectedCollectionDate: daysAgo(45),
    actualCollectionDate: null,
    status: 'defaulted',
    riskScore: 0,
    riskLevel: 'high',
    feeRate: 0.05,
    capitalSourceName: CAPITAL_SOURCES[3].name, // Investor Debt
    capitalAnnualRate: CAPITAL_SOURCES[3].annualRate,
    daysToCollection: 90
  },

  // Transaction 18: Nairobi West - Active, Medium Risk
  {
    id: 'TX018',
    providerName: PROVIDERS[9], // Nairobi West Hospital
    providerRiskScore: calculateProviderRisk(40, 35, 38), // 38
    insuranceName: INSURERS[1], // AAR Insurance
    insuranceRiskScore: calculateInsuranceRisk(52, 48), // 50
    claimAmountCents: kesToCents(1450000),
    disbursementDate: daysAgo(14),
    expectedCollectionDate: daysFromNow(46),
    actualCollectionDate: null,
    status: 'active',
    riskScore: 0,
    riskLevel: 'medium',
    feeRate: 0.04,
    capitalSourceName: CAPITAL_SOURCES[2].name, // Bank LOC
    capitalAnnualRate: CAPITAL_SOURCES[2].annualRate,
    daysToCollection: 60
  }
];

// Calculate missing riskScore for all transactions
mockTransactions.forEach(tx => {
  tx.riskScore = calculateTransactionRisk(tx.providerRiskScore, tx.insuranceRiskScore);
});

/**
 * Get all transactions
 */
export function getTransactions(): Transaction[] {
  return mockTransactions;
}

/**
 * Get transaction by ID
 */
export function getTransactionById(id: string): Transaction | undefined {
  return mockTransactions.find(tx => tx.id === id);
}

/**
 * Get active transactions only
 */
export function getActiveTransactions(): Transaction[] {
  return mockTransactions.filter(tx => tx.status === 'active');
}

/**
 * Get collected transactions only
 */
export function getCollectedTransactions(): Transaction[] {
  return mockTransactions.filter(tx => tx.status === 'collected');
}

/**
 * Get defaulted transactions only
 */
export function getDefaultedTransactions(): Transaction[] {
  return mockTransactions.filter(tx => tx.status === 'defaulted');
}
