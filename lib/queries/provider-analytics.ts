/**
 * Provider Analytics Queries
 *
 * Manages provider analytics cache for fast data retrieval.
 * Calculates and stores pre-aggregated analytics data.
 */

import { sql } from '@/lib/db';
import {
  calculateProviderAnalytics,
  type ProviderAnalytics,
} from '@/lib/utils/analytics-calculator';

export interface ProviderAnalyticsCache {
  provider_id: number;
  total_claims: number;
  total_invoice_cents: number;
  total_approved_cents: number;
  approval_rate: number;
  top_payers: object;
  top_schemes: object;
  monthly_trends: object;
  last_updated: Date;
}

/**
 * Get cached analytics for a provider
 * Returns null if cache doesn't exist or is stale (>24 hours old)
 */
export async function getCachedProviderAnalytics(
  providerId: number
): Promise<ProviderAnalytics | null> {
  const { rows } = await sql`
    SELECT
      provider_id,
      total_claims,
      total_invoice_cents,
      total_approved_cents,
      approval_rate,
      top_payers,
      top_schemes,
      monthly_trends,
      last_updated
    FROM provider_analytics_cache
    WHERE provider_id = ${providerId}
      AND last_updated > NOW() - INTERVAL '24 hours'
  `;

  if (rows.length === 0) {
    return null;
  }

  const cache = rows[0];
  return {
    total_claims: cache.total_claims,
    total_invoice_cents: parseInt(cache.total_invoice_cents),
    total_approved_cents: parseInt(cache.total_approved_cents),
    approval_rate: parseFloat(cache.approval_rate),
    top_payers: cache.top_payers || [],
    top_schemes: cache.top_schemes || [],
    monthly_trends: cache.monthly_trends || [],
  };
}

/**
 * Refresh analytics cache for a provider
 * Recalculates all metrics and updates cache
 */
export async function refreshProviderAnalytics(
  providerId: number
): Promise<ProviderAnalytics> {
  // Calculate fresh analytics
  const analytics = await calculateProviderAnalytics(providerId);

  // Upsert into cache
  await sql`
    INSERT INTO provider_analytics_cache (
      provider_id,
      total_claims,
      total_invoice_cents,
      total_approved_cents,
      approval_rate,
      top_payers,
      top_schemes,
      monthly_trends,
      last_updated
    ) VALUES (
      ${providerId},
      ${analytics.total_claims},
      ${analytics.total_invoice_cents},
      ${analytics.total_approved_cents},
      ${analytics.approval_rate},
      ${JSON.stringify(analytics.top_payers)},
      ${JSON.stringify(analytics.top_schemes)},
      ${JSON.stringify(analytics.monthly_trends)},
      NOW()
    )
    ON CONFLICT (provider_id)
    DO UPDATE SET
      total_claims = EXCLUDED.total_claims,
      total_invoice_cents = EXCLUDED.total_invoice_cents,
      total_approved_cents = EXCLUDED.total_approved_cents,
      approval_rate = EXCLUDED.approval_rate,
      top_payers = EXCLUDED.top_payers,
      top_schemes = EXCLUDED.top_schemes,
      monthly_trends = EXCLUDED.monthly_trends,
      last_updated = NOW()
  `;

  return analytics;
}

/**
 * Get analytics for a provider (with cache fallback)
 * First checks cache, if stale/missing then recalculates
 */
export async function getProviderAnalytics(
  providerId: number,
  forceRefresh: boolean = false
): Promise<ProviderAnalytics> {
  if (!forceRefresh) {
    const cached = await getCachedProviderAnalytics(providerId);
    if (cached) {
      return cached;
    }
  }

  // Cache miss or force refresh - calculate and cache
  return refreshProviderAnalytics(providerId);
}

/**
 * Delete analytics cache for a provider
 */
export async function deleteProviderAnalyticsCache(
  providerId: number
): Promise<void> {
  await sql`
    DELETE FROM provider_analytics_cache
    WHERE provider_id = ${providerId}
  `;
}

/**
 * Refresh analytics for all providers
 * Useful for batch refresh operations
 */
export async function refreshAllProviderAnalytics(): Promise<number> {
  // Get all provider IDs
  const { rows } = await sql`
    SELECT id FROM providers ORDER BY id
  `;

  let refreshed = 0;
  for (const row of rows) {
    try {
      await refreshProviderAnalytics(row.id);
      refreshed++;
    } catch (error) {
      console.error(`Failed to refresh analytics for provider ${row.id}:`, error);
    }
  }

  return refreshed;
}

/**
 * Get cache status for a provider
 */
export async function getProviderAnalyticsCacheStatus(providerId: number): Promise<{
  exists: boolean;
  last_updated: Date | null;
  is_stale: boolean;
}> {
  const { rows } = await sql`
    SELECT
      last_updated,
      (last_updated <= NOW() - INTERVAL '24 hours') as is_stale
    FROM provider_analytics_cache
    WHERE provider_id = ${providerId}
  `;

  if (rows.length === 0) {
    return {
      exists: false,
      last_updated: null,
      is_stale: true,
    };
  }

  return {
    exists: true,
    last_updated: rows[0].last_updated,
    is_stale: rows[0].is_stale,
  };
}
