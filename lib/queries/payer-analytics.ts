/**
 * Payer Analytics Query Functions
 *
 * All queries for payer 360° analytics.
 * Uses cached data from payer_analytics_cache table.
 * Money is stored in cents as integers.
 */

import { sql } from '@/lib/db';

// Type Definitions
export interface PayerAnalytics {
  payer_id: number;
  total_claims: number;
  total_invoice_cents: number;
  total_approved_cents: number;
  approval_rate: number;
  top_providers: TopProvider[] | null;
  top_schemes: TopScheme[] | null;
  monthly_trends: MonthlyTrend[] | null;
  last_updated: Date;
}

export interface TopProvider {
  provider_id: number;
  name: string;
  claims: number;
  volume_cents: number;
}

export interface TopScheme {
  scheme_id: number;
  name: string;
  claims: number;
  volume_cents: number;
}

export interface MonthlyTrend {
  month: string; // Format: "2025-01"
  claims: number;
  invoice_cents: number;
  approved_cents: number;
}

/**
 * Get payer analytics from cache
 */
export async function getPayerAnalytics(payerId: number): Promise<PayerAnalytics | null> {
  const { rows } = await sql<PayerAnalytics>`
    SELECT
      payer_id,
      total_claims,
      total_invoice_cents,
      total_approved_cents,
      approval_rate,
      top_providers,
      top_schemes,
      monthly_trends,
      last_updated
    FROM payer_analytics_cache
    WHERE payer_id = ${payerId};
  `;

  if (rows.length === 0) {
    return null;
  }

  const analytics = rows[0];

  return {
    ...analytics,
    // Parse JSONB fields
    top_providers: analytics.top_providers as unknown as TopProvider[] | null,
    top_schemes: analytics.top_schemes as unknown as TopScheme[] | null,
    monthly_trends: analytics.monthly_trends as unknown as MonthlyTrend[] | null,
  };
}

/**
 * Refresh payer analytics cache
 * Calculates all analytics from scratch and updates the cache
 * Returns the refreshed analytics
 */
export async function refreshPayerAnalytics(payerId: number): Promise<PayerAnalytics | null> {
  // Call the stored procedure to refresh analytics
  await sql`SELECT refresh_payer_analytics(${payerId});`;

  // Fetch and return the refreshed analytics
  return getPayerAnalytics(payerId);
}

/**
 * Refresh all payer analytics caches
 * Useful for batch updates
 */
export async function refreshAllPayerAnalytics(): Promise<void> {
  // Get all payer IDs
  const { rows } = await sql<{ id: number }>`
    SELECT id FROM payers;
  `;

  // Refresh each payer's analytics
  for (const row of rows) {
    await refreshPayerAnalytics(row.id);
  }
}

/**
 * Get payer analytics summary (without cache)
 * Used for real-time calculations when cache is empty
 */
export async function calculatePayerAnalyticsSummary(payerId: number): Promise<{
  total_claims: number;
  total_invoice_cents: number;
  total_approved_cents: number;
  approval_rate: number;
}> {
  const { rows } = await sql<{
    total_claims: number;
    total_invoice_cents: number;
    total_approved_cents: number;
  }>`
    SELECT
      COUNT(*) as total_claims,
      COALESCE(SUM(invoice_amount_cents), 0) as total_invoice_cents,
      COALESCE(SUM(approved_amount_cents), 0) as total_approved_cents
    FROM claims
    WHERE payer_id = ${payerId};
  `;

  const data = rows[0];
  const approval_rate = data.total_invoice_cents > 0
    ? (data.total_approved_cents / data.total_invoice_cents) * 100
    : 0;

  return {
    total_claims: data.total_claims,
    total_invoice_cents: data.total_invoice_cents,
    total_approved_cents: data.total_approved_cents,
    approval_rate: Number(approval_rate.toFixed(2)),
  };
}

/**
 * Get top providers for a payer (real-time, not cached)
 */
export async function getPayerTopProviders(
  payerId: number,
  limit: number = 10
): Promise<TopProvider[]> {
  const { rows } = await sql<TopProvider>`
    SELECT
      provider_id,
      provider_name as name,
      COUNT(*) as claims,
      SUM(invoice_amount_cents) as volume_cents
    FROM claims
    WHERE payer_id = ${payerId}
    GROUP BY provider_id, provider_name
    ORDER BY claims DESC
    LIMIT ${limit};
  `;

  return rows.map(row => ({
    ...row,
    claims: Number(row.claims),
    volume_cents: Number(row.volume_cents),
  }));
}

/**
 * Get top schemes for a payer (real-time, not cached)
 */
export async function getPayerTopSchemes(
  payerId: number,
  limit: number = 10
): Promise<TopScheme[]> {
  const { rows } = await sql<TopScheme>`
    SELECT
      scheme_id,
      scheme_name as name,
      COUNT(*) as claims,
      SUM(invoice_amount_cents) as volume_cents
    FROM claims
    WHERE payer_id = ${payerId} AND scheme_id IS NOT NULL
    GROUP BY scheme_id, scheme_name
    ORDER BY claims DESC
    LIMIT ${limit};
  `;

  return rows.map(row => ({
    ...row,
    claims: Number(row.claims),
    volume_cents: Number(row.volume_cents),
  }));
}

/**
 * Get monthly trends for a payer (real-time, not cached)
 */
export async function getPayerMonthlyTrends(
  payerId: number,
  months: number = 12
): Promise<MonthlyTrend[]> {
  const { rows } = await sql<{
    month: string;
    claims: number;
    invoice_cents: number;
    approved_cents: number;
  }>`
    SELECT
      TO_CHAR(service_date, 'YYYY-MM') as month,
      COUNT(*) as claims,
      SUM(invoice_amount_cents) as invoice_cents,
      SUM(approved_amount_cents) as approved_cents
    FROM claims
    WHERE payer_id = ${payerId}
      AND service_date >= CURRENT_DATE - INTERVAL '${months} months'
    GROUP BY TO_CHAR(service_date, 'YYYY-MM')
    ORDER BY month DESC
    LIMIT ${months};
  `;

  return rows.map(row => ({
    month: row.month,
    claims: Number(row.claims),
    invoice_cents: Number(row.invoice_cents),
    approved_cents: Number(row.approved_cents),
  }));
}

/**
 * Check if payer analytics cache needs refresh
 * Returns true if cache is older than 5 minutes or doesn't exist
 */
export async function shouldRefreshPayerAnalytics(payerId: number): Promise<boolean> {
  const { rows } = await sql<{ should_refresh: boolean }>`
    SELECT
      CASE
        WHEN last_updated IS NULL THEN true
        WHEN last_updated < NOW() - INTERVAL '5 minutes' THEN true
        ELSE false
      END as should_refresh
    FROM payer_analytics_cache
    WHERE payer_id = ${payerId};
  `;

  // If no cache exists, definitely need to refresh
  if (rows.length === 0) {
    return true;
  }

  return rows[0].should_refresh;
}
