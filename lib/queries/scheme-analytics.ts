/**
 * Scheme Analytics queries
 *
 * Queries for computing and caching scheme analytics.
 * Used for the Scheme 360° analytics page.
 */

import { sql } from '@/lib/db';

export interface SchemeAnalytics {
  scheme_id: number;
  total_claims: number;
  total_invoice_cents: number;
  total_approved_cents: number;
  approval_rate: number; // Percentage (0-100)
  top_providers: ProviderBreakdown[];
  monthly_trends: MonthlyTrend[];
  last_updated: Date;
}

export interface ProviderBreakdown {
  provider_id: number;
  name: string;
  claims: number;
  volume_cents: number;
}

export interface MonthlyTrend {
  month: string; // Format: YYYY-MM
  claims: number;
  volume_cents: number;
  approved_cents: number;
}

/**
 * Get analytics for a scheme (from cache if available)
 */
export async function getSchemeAnalytics(
  schemeId: number
): Promise<SchemeAnalytics | null> {
  const { rows } = await sql`
    SELECT
      scheme_id,
      total_claims,
      total_invoice_cents,
      total_approved_cents,
      approval_rate,
      top_providers,
      monthly_trends,
      last_updated
    FROM scheme_analytics_cache
    WHERE scheme_id = ${schemeId}
  `;

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    scheme_id: row.scheme_id,
    total_claims: row.total_claims,
    total_invoice_cents: row.total_invoice_cents,
    total_approved_cents: row.total_approved_cents,
    approval_rate: parseFloat(row.approval_rate),
    top_providers: row.top_providers || [],
    monthly_trends: row.monthly_trends || [],
    last_updated: row.last_updated,
  };
}

/**
 * Calculate and cache analytics for a scheme
 */
export async function refreshSchemeAnalytics(
  schemeId: number
): Promise<SchemeAnalytics> {
  // Calculate total claims and amounts
  const { rows: totalsRows } = await sql`
    SELECT
      COUNT(*) as total_claims,
      COALESCE(SUM(invoice_amount_cents), 0) as total_invoice_cents,
      COALESCE(SUM(approved_amount_cents), 0) as total_approved_cents
    FROM claims
    WHERE scheme_id = ${schemeId}
  `;

  const totals = totalsRows[0];
  const totalClaims = parseInt(totals.total_claims);
  const totalInvoiceCents = parseInt(totals.total_invoice_cents);
  const totalApprovedCents = parseInt(totals.total_approved_cents);

  // Calculate approval rate
  const approvalRate =
    totalInvoiceCents > 0
      ? (totalApprovedCents / totalInvoiceCents) * 100
      : 0;

  // Get top providers
  const { rows: providerRows } = await sql`
    SELECT
      p.id as provider_id,
      p.name,
      COUNT(*) as claims,
      COALESCE(SUM(c.invoice_amount_cents), 0) as volume_cents
    FROM claims c
    JOIN providers p ON c.provider_id = p.id
    WHERE c.scheme_id = ${schemeId}
    GROUP BY p.id, p.name
    ORDER BY volume_cents DESC
    LIMIT 10
  `;

  const topProviders: ProviderBreakdown[] = providerRows.map((row) => ({
    provider_id: row.provider_id,
    name: row.name,
    claims: parseInt(row.claims),
    volume_cents: parseInt(row.volume_cents),
  }));

  // Get monthly trends (last 12 months)
  const { rows: trendsRows } = await sql`
    SELECT
      TO_CHAR(service_date, 'YYYY-MM') as month,
      COUNT(*) as claims,
      COALESCE(SUM(invoice_amount_cents), 0) as volume_cents,
      COALESCE(SUM(approved_amount_cents), 0) as approved_cents
    FROM claims
    WHERE scheme_id = ${schemeId}
      AND service_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY TO_CHAR(service_date, 'YYYY-MM')
    ORDER BY month ASC
  `;

  const monthlyTrends: MonthlyTrend[] = trendsRows.map((row) => ({
    month: row.month,
    claims: parseInt(row.claims),
    volume_cents: parseInt(row.volume_cents),
    approved_cents: parseInt(row.approved_cents),
  }));

  // Upsert into cache
  await sql`
    INSERT INTO scheme_analytics_cache (
      scheme_id,
      total_claims,
      total_invoice_cents,
      total_approved_cents,
      approval_rate,
      top_providers,
      monthly_trends,
      last_updated
    ) VALUES (
      ${schemeId},
      ${totalClaims},
      ${totalInvoiceCents},
      ${totalApprovedCents},
      ${approvalRate},
      ${JSON.stringify(topProviders)},
      ${JSON.stringify(monthlyTrends)},
      NOW()
    )
    ON CONFLICT (scheme_id)
    DO UPDATE SET
      total_claims = EXCLUDED.total_claims,
      total_invoice_cents = EXCLUDED.total_invoice_cents,
      total_approved_cents = EXCLUDED.total_approved_cents,
      approval_rate = EXCLUDED.approval_rate,
      top_providers = EXCLUDED.top_providers,
      monthly_trends = EXCLUDED.monthly_trends,
      last_updated = NOW()
  `;

  return {
    scheme_id: schemeId,
    total_claims: totalClaims,
    total_invoice_cents: totalInvoiceCents,
    total_approved_cents: totalApprovedCents,
    approval_rate: approvalRate,
    top_providers: topProviders,
    monthly_trends: monthlyTrends,
    last_updated: new Date(),
  };
}

/**
 * Refresh analytics for all schemes
 */
export async function refreshAllSchemeAnalytics(): Promise<void> {
  const { rows } = await sql`SELECT id FROM schemes`;

  for (const row of rows) {
    await refreshSchemeAnalytics(row.id);
  }
}

/**
 * Check if analytics cache is stale (older than 5 minutes)
 */
export async function isSchemeAnalyticsStale(schemeId: number): Promise<boolean> {
  const { rows } = await sql`
    SELECT last_updated
    FROM scheme_analytics_cache
    WHERE scheme_id = ${schemeId}
  `;

  if (rows.length === 0) {
    return true; // No cache exists
  }

  const lastUpdated = new Date(rows[0].last_updated);
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  return lastUpdated < fiveMinutesAgo;
}
