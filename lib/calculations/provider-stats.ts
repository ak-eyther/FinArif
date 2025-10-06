/**
 * Provider statistics calculations
 */

import type { Claim, ProviderStats, Cents, TrendDirection } from '../types';

/**
 * Calculate provider statistics from claims
 */
export function calculateProviderStats(claims: Claim[]): ProviderStats {
  // Separate claims by type
  const opdClaims = claims.filter(c => c.claimType === 'OPD');
  const ipdClaims = claims.filter(c => c.claimType === 'IPD');

  // Calculate OPD stats
  const totalOPDClaims = opdClaims.length;
  const paidOPDClaims = opdClaims.filter(c => c.status === 'paid').length;
  const unpaidOPDClaims = opdClaims.filter(
    c => c.status === 'unpaid' || c.status === 'pending'
  ).length;
  const opdClaimAmountCents = opdClaims.reduce(
    (sum, c) => sum + c.claimAmountCents,
    0
  ) as Cents;

  // Calculate IPD stats
  const totalIPDClaims = ipdClaims.length;
  const paidIPDClaims = ipdClaims.filter(c => c.status === 'paid').length;
  const unpaidIPDClaims = ipdClaims.filter(
    c => c.status === 'unpaid' || c.status === 'pending'
  ).length;
  const ipdClaimAmountCents = ipdClaims.reduce(
    (sum, c) => sum + c.claimAmountCents,
    0
  ) as Cents;

  // Calculate unpaid claims
  const unpaidClaims = claims.filter(
    c => c.status === 'unpaid' || c.status === 'pending'
  );
  const totalUnpaidClaims = unpaidClaims.length;
  const totalUnpaidAmountCents = unpaidClaims.reduce(
    (sum, c) => sum + c.claimAmountCents,
    0
  ) as Cents;

  // Calculate rejected claims (after AI validation)
  const rejectedClaims = claims.filter(c => c.rejectedAfterAI);
  const rejectedAfterAIClaims = rejectedClaims.length;
  const rejectedReasons = calculateReasons(
    rejectedClaims.map(c => c.rejectionReason || 'Unknown')
  );

  // Calculate AI fraud flagged claims
  const fraudFlaggedClaims = claims.filter(c => c.aiFraudFlagged);
  const aiFraudFlaggedClaims = fraudFlaggedClaims.length;
  const fraudReasons = calculateReasons(
    fraudFlaggedClaims.map(c => c.fraudReason || 'Unknown')
  );

  // Calculate average submission days
  const submissionDays = claims.map(c => {
    const diffMs = c.submissionDate.getTime() - c.serviceDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  });
  const avgSubmissionDays =
    submissionDays.length > 0
      ? Math.round(
          submissionDays.reduce((sum, days) => sum + days, 0) /
            submissionDays.length
        )
      : 0;

  // Calculate submission trend (simplified - would need historical data for real trend)
  const submissionTrend: TrendDirection = 'flat';

  return {
    totalOPDClaims,
    paidOPDClaims,
    unpaidOPDClaims,
    opdClaimAmountCents,
    totalIPDClaims,
    paidIPDClaims,
    unpaidIPDClaims,
    ipdClaimAmountCents,
    totalUnpaidClaims,
    totalUnpaidAmountCents,
    rejectedAfterAIClaims,
    rejectedReasons,
    aiFraudFlaggedClaims,
    fraudReasons,
    avgSubmissionDays,
    submissionTrend,
  };
}

/**
 * Helper to calculate reason counts
 */
function calculateReasons(
  reasons: string[]
): { reason: string; count: number }[] {
  const reasonMap = new Map<string, number>();

  reasons.forEach(reason => {
    const count = reasonMap.get(reason) || 0;
    reasonMap.set(reason, count + 1);
  });

  return Array.from(reasonMap.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate aging for unpaid claims
 */
export function calculateUnpaidClaimsAging(
  claims: Claim[]
): { bucket: string; count: number; amountCents: Cents }[] {
  const unpaidClaims = claims.filter(
    c => c.status === 'unpaid' || c.status === 'pending'
  );

  const now = new Date();
  const buckets = {
    '0-30 days': { count: 0, amountCents: 0 },
    '31-60 days': { count: 0, amountCents: 0 },
    '61-90 days': { count: 0, amountCents: 0 },
    '90+ days': { count: 0, amountCents: 0 },
  };

  unpaidClaims.forEach(claim => {
    const daysUnpaid = Math.floor(
      (now.getTime() - claim.submissionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUnpaid <= 30) {
      buckets['0-30 days'].count++;
      buckets['0-30 days'].amountCents += claim.claimAmountCents;
    } else if (daysUnpaid <= 60) {
      buckets['31-60 days'].count++;
      buckets['31-60 days'].amountCents += claim.claimAmountCents;
    } else if (daysUnpaid <= 90) {
      buckets['61-90 days'].count++;
      buckets['61-90 days'].amountCents += claim.claimAmountCents;
    } else {
      buckets['90+ days'].count++;
      buckets['90+ days'].amountCents += claim.claimAmountCents;
    }
  });

  return Object.entries(buckets).map(([bucket, data]) => ({
    bucket,
    count: data.count,
    amountCents: data.amountCents as Cents,
  }));
}
