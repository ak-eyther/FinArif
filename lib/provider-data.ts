/**
 * Mock data for Provider Dashboard
 *
 * Includes providers and their claims (OPD and IPD)
 * Uses Visit Number as primary key (Kenya market)
 */

import type { Provider, Claim, Cents } from './types';
import { kesToCents } from './constants';

/**
 * Helper to create a date N days ago
 */
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Mock providers with discount settings
 */
export const mockProviders: Provider[] = [
  {
    id: 'PRV001',
    name: 'Nairobi Hospital',
    discountPercentage: 5,
    riskScore: 15,
  },
  {
    id: 'PRV002',
    name: 'Aga Khan University Hospital',
    discountPercentage: 7,
    riskScore: 25,
  },
  {
    id: 'PRV003',
    name: 'Kenyatta National Hospital',
    discountPercentage: 3,
    riskScore: 30,
  },
  {
    id: 'PRV004',
    name: 'MP Shah Hospital',
    discountPercentage: 10,
    riskScore: 45,
  },
  {
    id: 'PRV005',
    name: "Gertrude's Children Hospital",
    discountPercentage: 4,
    riskScore: 12,
  },
];

/**
 * Mock claims data for providers
 */
export const mockClaims: Claim[] = [
  // Nairobi Hospital Claims (PRV001)
  {
    visitNumber: 'VN-2024-001',
    claimType: 'OPD',
    providerId: 'PRV001',
    claimAmountCents: kesToCents(15000),
    serviceDate: daysAgo(10),
    submissionDate: daysAgo(8),
    paymentDate: daysAgo(2),
    status: 'paid',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'NHIF',
  },
  {
    visitNumber: 'VN-2024-002',
    claimType: 'IPD',
    providerId: 'PRV001',
    claimAmountCents: kesToCents(250000),
    serviceDate: daysAgo(45),
    submissionDate: daysAgo(42),
    paymentDate: daysAgo(5),
    status: 'paid',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'AAR Insurance',
  },
  {
    visitNumber: 'VN-2024-003',
    claimType: 'OPD',
    providerId: 'PRV001',
    claimAmountCents: kesToCents(22000),
    serviceDate: daysAgo(15),
    submissionDate: daysAgo(12),
    paymentDate: null,
    status: 'pending',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'Jubilee Insurance',
  },
  {
    visitNumber: 'VN-2024-004',
    claimType: 'IPD',
    providerId: 'PRV001',
    claimAmountCents: kesToCents(450000),
    serviceDate: daysAgo(30),
    submissionDate: daysAgo(25),
    paymentDate: null,
    status: 'unpaid',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'CIC Insurance',
  },
  {
    visitNumber: 'VN-2024-005',
    claimType: 'OPD',
    providerId: 'PRV001',
    claimAmountCents: kesToCents(18000),
    serviceDate: daysAgo(60),
    submissionDate: daysAgo(55),
    paymentDate: null,
    status: 'rejected',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: true,
    rejectionReason: 'Incomplete documentation',
    insuranceName: 'NHIF',
  },
  {
    visitNumber: 'VN-2024-006',
    claimType: 'OPD',
    providerId: 'PRV001',
    claimAmountCents: kesToCents(32000),
    serviceDate: daysAgo(20),
    submissionDate: daysAgo(18),
    paymentDate: null,
    status: 'pending',
    aiValidationPassed: false,
    aiFraudFlagged: true,
    fraudReason: 'Duplicate claim detected',
    rejectedAfterAI: false,
    insuranceName: 'AAR Insurance',
  },
  {
    visitNumber: 'VN-2024-007',
    claimType: 'IPD',
    providerId: 'PRV001',
    claimAmountCents: kesToCents(680000),
    serviceDate: daysAgo(5),
    submissionDate: daysAgo(3),
    paymentDate: null,
    status: 'pending',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'Britam',
  },
  {
    visitNumber: 'VN-2024-008',
    claimType: 'OPD',
    providerId: 'PRV001',
    claimAmountCents: kesToCents(12000),
    serviceDate: daysAgo(90),
    submissionDate: daysAgo(85),
    paymentDate: daysAgo(60),
    status: 'paid',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'NHIF',
  },

  // Aga Khan Hospital Claims (PRV002)
  {
    visitNumber: 'VN-2024-101',
    claimType: 'OPD',
    providerId: 'PRV002',
    claimAmountCents: kesToCents(28000),
    serviceDate: daysAgo(12),
    submissionDate: daysAgo(7),
    paymentDate: daysAgo(1),
    status: 'paid',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'AAR Insurance',
  },
  {
    visitNumber: 'VN-2024-102',
    claimType: 'IPD',
    providerId: 'PRV002',
    claimAmountCents: kesToCents(520000),
    serviceDate: daysAgo(35),
    submissionDate: daysAgo(30),
    paymentDate: null,
    status: 'unpaid',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'CIC Insurance',
  },
  {
    visitNumber: 'VN-2024-103',
    claimType: 'OPD',
    providerId: 'PRV002',
    claimAmountCents: kesToCents(45000),
    serviceDate: daysAgo(25),
    submissionDate: daysAgo(20),
    paymentDate: null,
    status: 'rejected',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: true,
    rejectionReason: 'Service not covered under policy',
    insuranceName: 'Jubilee Insurance',
  },
  {
    visitNumber: 'VN-2024-104',
    claimType: 'IPD',
    providerId: 'PRV002',
    claimAmountCents: kesToCents(890000),
    serviceDate: daysAgo(8),
    submissionDate: daysAgo(6),
    paymentDate: null,
    status: 'pending',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'UAP Insurance',
  },
  {
    visitNumber: 'VN-2024-105',
    claimType: 'OPD',
    providerId: 'PRV002',
    claimAmountCents: kesToCents(65000),
    serviceDate: daysAgo(18),
    submissionDate: daysAgo(15),
    paymentDate: null,
    status: 'pending',
    aiValidationPassed: false,
    aiFraudFlagged: true,
    fraudReason: 'Unusual claim pattern',
    rejectedAfterAI: false,
    insuranceName: 'AAR Insurance',
  },

  // Kenyatta National Hospital Claims (PRV003)
  {
    visitNumber: 'VN-2024-201',
    claimType: 'OPD',
    providerId: 'PRV003',
    claimAmountCents: kesToCents(8000),
    serviceDate: daysAgo(40),
    submissionDate: daysAgo(35),
    paymentDate: daysAgo(10),
    status: 'paid',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'NHIF',
  },
  {
    visitNumber: 'VN-2024-202',
    claimType: 'IPD',
    providerId: 'PRV003',
    claimAmountCents: kesToCents(320000),
    serviceDate: daysAgo(55),
    submissionDate: daysAgo(48),
    paymentDate: null,
    status: 'unpaid',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'Jubilee Insurance',
  },
  {
    visitNumber: 'VN-2024-203',
    claimType: 'OPD',
    providerId: 'PRV003',
    claimAmountCents: kesToCents(15000),
    serviceDate: daysAgo(70),
    submissionDate: daysAgo(62),
    paymentDate: null,
    status: 'rejected',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: true,
    rejectionReason: 'Pre-existing condition exclusion',
    insuranceName: 'AAR Insurance',
  },
  {
    visitNumber: 'VN-2024-204',
    claimType: 'IPD',
    providerId: 'PRV003',
    claimAmountCents: kesToCents(720000),
    serviceDate: daysAgo(22),
    submissionDate: daysAgo(18),
    paymentDate: null,
    status: 'pending',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'CIC Insurance',
  },
  {
    visitNumber: 'VN-2024-205',
    claimType: 'OPD',
    providerId: 'PRV003',
    claimAmountCents: kesToCents(95000),
    serviceDate: daysAgo(14),
    submissionDate: daysAgo(10),
    paymentDate: null,
    status: 'pending',
    aiValidationPassed: false,
    aiFraudFlagged: true,
    fraudReason: 'Claim amount exceeds typical range',
    rejectedAfterAI: false,
    insuranceName: 'NHIF',
  },

  // MP Shah Hospital Claims (PRV004)
  {
    visitNumber: 'VN-2024-301',
    claimType: 'OPD',
    providerId: 'PRV004',
    claimAmountCents: kesToCents(35000),
    serviceDate: daysAgo(28),
    submissionDate: daysAgo(22),
    paymentDate: daysAgo(8),
    status: 'paid',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'Britam',
  },
  {
    visitNumber: 'VN-2024-302',
    claimType: 'IPD',
    providerId: 'PRV004',
    claimAmountCents: kesToCents(1200000),
    serviceDate: daysAgo(50),
    submissionDate: daysAgo(42),
    paymentDate: null,
    status: 'unpaid',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'UAP Insurance',
  },
  {
    visitNumber: 'VN-2024-303',
    claimType: 'OPD',
    providerId: 'PRV004',
    claimAmountCents: kesToCents(52000),
    serviceDate: daysAgo(65),
    submissionDate: daysAgo(58),
    paymentDate: null,
    status: 'rejected',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: true,
    rejectionReason: 'Claim exceeds policy limit',
    insuranceName: 'CIC Insurance',
  },
  {
    visitNumber: 'VN-2024-304',
    claimType: 'IPD',
    providerId: 'PRV004',
    claimAmountCents: kesToCents(950000),
    serviceDate: daysAgo(16),
    submissionDate: daysAgo(12),
    paymentDate: null,
    status: 'pending',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'AAR Insurance',
  },

  // Gertrude's Children Hospital Claims (PRV005)
  {
    visitNumber: 'VN-2024-401',
    claimType: 'OPD',
    providerId: 'PRV005',
    claimAmountCents: kesToCents(12000),
    serviceDate: daysAgo(32),
    submissionDate: daysAgo(28),
    paymentDate: daysAgo(15),
    status: 'paid',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'NHIF',
  },
  {
    visitNumber: 'VN-2024-402',
    claimType: 'IPD',
    providerId: 'PRV005',
    claimAmountCents: kesToCents(180000),
    serviceDate: daysAgo(48),
    submissionDate: daysAgo(44),
    paymentDate: daysAgo(20),
    status: 'paid',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'Jubilee Insurance',
  },
  {
    visitNumber: 'VN-2024-403',
    claimType: 'OPD',
    providerId: 'PRV005',
    claimAmountCents: kesToCents(25000),
    serviceDate: daysAgo(11),
    submissionDate: daysAgo(8),
    paymentDate: null,
    status: 'pending',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'AAR Insurance',
  },
  {
    visitNumber: 'VN-2024-404',
    claimType: 'IPD',
    providerId: 'PRV005',
    claimAmountCents: kesToCents(420000),
    serviceDate: daysAgo(24),
    submissionDate: daysAgo(20),
    paymentDate: null,
    status: 'unpaid',
    aiValidationPassed: true,
    aiFraudFlagged: false,
    rejectedAfterAI: false,
    insuranceName: 'Britam',
  },
];

/**
 * Get all providers
 */
export function getProviders(): Provider[] {
  return mockProviders;
}

/**
 * Get provider by ID
 */
export function getProviderById(id: string): Provider | undefined {
  return mockProviders.find(p => p.id === id);
}

/**
 * Get all claims
 */
export function getClaims(): Claim[] {
  return mockClaims;
}

/**
 * Get claims by provider ID
 */
export function getClaimsByProviderId(providerId: string): Claim[] {
  return mockClaims.filter(c => c.providerId === providerId);
}

/**
 * Get claims by provider ID and date range
 */
export function getClaimsByProviderIdAndDateRange(
  providerId: string,
  startDate: Date,
  endDate: Date
): Claim[] {
  return mockClaims.filter(
    c =>
      c.providerId === providerId &&
      c.serviceDate >= startDate &&
      c.serviceDate <= endDate
  );
}

/**
 * Update provider discount
 */
export function updateProviderDiscount(
  providerId: string,
  discountPercentage: number
): Provider | undefined {
  const provider = mockProviders.find(p => p.id === providerId);
  if (provider) {
    provider.discountPercentage = discountPercentage;
  }
  return provider;
}
