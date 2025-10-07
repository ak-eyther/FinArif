/**
 * Analytics Calculator Utility
 *
 * Calculates provider analytics metrics from claims data.
 * All money calculations use cents (integers).
 */

import { sql } from '@/lib/db';

export interface PayerBreakdown {
  payer_id: number;
  name: string;
  claims: number;
  invoice_cents: number;
  approved_cents: number;
}

export interface SchemeBreakdown {
  scheme_id: number;
  name: string;
  claims: number;
  invoice_cents: number;
  approved_cents: number;
}

export interface MonthlyTrend {
  month: string; // YYYY-MM format
  claims: number;
  invoice_cents: number;
  approved_cents: number;
}

export interface ProviderAnalytics {
  total_claims: number;
  total_invoice_cents: number;
  total_approved_cents: number;
  approval_rate: number; // Percentage (0-100)
  top_payers: PayerBreakdown[];
  top_schemes: SchemeBreakdown[];
  monthly_trends: MonthlyTrend[];
}

/**
 * Calculate all analytics for a provider
 */
export async function calculateProviderAnalytics(
  providerId: number
): Promise<ProviderAnalytics> {
  // Calculate totals
  const totals = await calculateProviderTotals(providerId);

  // Calculate payer breakdown
  const topPayers = await calculateTopPayers(providerId, 10);

  // Calculate scheme breakdown
  const topSchemes = await calculateTopSchemes(providerId, 10);

  // Calculate monthly trends (last 12 months)
  const monthlyTrends = await calculateMonthlyTrends(providerId, 12);

  // Calculate approval rate
  const approvalRate =
    totals.total_invoice_cents > 0
      ? Number(((totals.total_approved_cents / totals.total_invoice_cents) * 100).toFixed(2))
      : 0;

  return {
    total_claims: totals.total_claims,
    total_invoice_cents: totals.total_invoice_cents,
    total_approved_cents: totals.total_approved_cents,
    approval_rate: approvalRate,
    top_payers: topPayers,
    top_schemes: topSchemes,
    monthly_trends: monthlyTrends,
  };
}

/**
 * Calculate provider totals
 */
async function calculateProviderTotals(providerId: number): Promise<{
  total_claims: number;
  total_invoice_cents: number;
  total_approved_cents: number;
}> {
  const { rows } = await sql`
    SELECT
      COUNT(*) as total_claims,
      COALESCE(SUM(invoice_amount_cents), 0) as total_invoice_cents,
      COALESCE(SUM(approved_amount_cents), 0) as total_approved_cents
    FROM claims
    WHERE provider_id = ${providerId}
  `;

  return {
    total_claims: parseInt(rows[0].total_claims || '0'),
    total_invoice_cents: parseInt(rows[0].total_invoice_cents || '0'),
    total_approved_cents: parseInt(rows[0].total_approved_cents || '0'),
  };
}

/**
 * Calculate top payers for a provider
 */
async function calculateTopPayers(
  providerId: number,
  limit: number = 10
): Promise<PayerBreakdown[]> {
  const { rows } = await sql`
    SELECT
      p.id as payer_id,
      p.name,
      COUNT(c.id) as claims,
      COALESCE(SUM(c.invoice_amount_cents), 0) as invoice_cents,
      COALESCE(SUM(c.approved_amount_cents), 0) as approved_cents
    FROM claims c
    INNER JOIN payers p ON c.payer_id = p.id
    WHERE c.provider_id = ${providerId}
    GROUP BY p.id, p.name
    ORDER BY claims DESC, invoice_cents DESC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    payer_id: row.payer_id,
    name: row.name,
    claims: parseInt(row.claims),
    invoice_cents: parseInt(row.invoice_cents || '0'),
    approved_cents: parseInt(row.approved_cents || '0'),
  }));
}

/**
 * Calculate top schemes for a provider
 */
async function calculateTopSchemes(
  providerId: number,
  limit: number = 10
): Promise<SchemeBreakdown[]> {
  const { rows } = await sql`
    SELECT
      s.id as scheme_id,
      s.name,
      COUNT(c.id) as claims,
      COALESCE(SUM(c.invoice_amount_cents), 0) as invoice_cents,
      COALESCE(SUM(c.approved_amount_cents), 0) as approved_cents
    FROM claims c
    INNER JOIN schemes s ON c.scheme_id = s.id
    WHERE c.provider_id = ${providerId} AND c.scheme_id IS NOT NULL
    GROUP BY s.id, s.name
    ORDER BY claims DESC, invoice_cents DESC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    scheme_id: row.scheme_id,
    name: row.name,
    claims: parseInt(row.claims),
    invoice_cents: parseInt(row.invoice_cents || '0'),
    approved_cents: parseInt(row.approved_cents || '0'),
  }));
}

/**
 * Calculate monthly trends for a provider
 */
async function calculateMonthlyTrends(
  providerId: number,
  months: number = 12
): Promise<MonthlyTrend[]> {
  const { rows } = await sql`
    SELECT
      TO_CHAR(DATE_TRUNC('month', service_date), 'YYYY-MM') as month,
      COUNT(*) as claims,
      COALESCE(SUM(invoice_amount_cents), 0) as invoice_cents,
      COALESCE(SUM(approved_amount_cents), 0) as approved_cents
    FROM claims
    WHERE provider_id = ${providerId}
      AND service_date >= DATE_TRUNC('month', NOW() - INTERVAL '${months} months')
    GROUP BY DATE_TRUNC('month', service_date)
    ORDER BY month DESC
  `;

  return rows.map((row) => ({
    month: row.month,
    claims: parseInt(row.claims),
    invoice_cents: parseInt(row.invoice_cents || '0'),
    approved_cents: parseInt(row.approved_cents || '0'),
  }));
}

/**
 * Format cents to KES currency string
 */
export function formatKES(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage with 2 decimal places
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
