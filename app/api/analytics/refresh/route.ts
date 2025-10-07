import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { refreshProviderAnalytics } from '@/lib/queries/provider-analytics';
import { refreshPayerAnalytics } from '@/lib/queries/payer-analytics';

/**
 * POST /api/analytics/refresh
 * Refresh all analytics caches
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entityType = body.entity_type; // 'provider' | 'payer' | 'all'
    const entityId = body.entity_id;

    if (entityType === 'provider' && entityId) {
      // Refresh specific provider
      await refreshProviderAnalytics(entityId);
      return NextResponse.json({
        success: true,
        message: 'Provider analytics refreshed',
      });
    }

    if (entityType === 'payer' && entityId) {
      // Refresh specific payer
      await refreshPayerAnalytics(entityId);
      return NextResponse.json({
        success: true,
        message: 'Payer analytics refreshed',
      });
    }

    if (entityType === 'all') {
      // Refresh all providers
      const { rows: providers } = await sql`SELECT id FROM providers`;
      for (const provider of providers) {
        await refreshProviderAnalytics(provider.id);
      }

      // Refresh all payers
      const { rows: payers } = await sql`SELECT id FROM payers`;
      for (const payer of payers) {
        await refreshPayerAnalytics(payer.id);
      }

      return NextResponse.json({
        success: true,
        message: 'All analytics refreshed',
        counts: {
          providers: providers.length,
          payers: payers.length,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request',
        message: 'Specify entity_type and entity_id, or entity_type=all',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error refreshing analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
