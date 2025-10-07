import { NextRequest, NextResponse } from 'next/server';
import { getPayerById } from '@/lib/queries/payers';
import {
  getPayerAnalytics,
  refreshPayerAnalytics,
} from '@/lib/queries/payer-analytics';

/**
 * GET /api/payers/:id/analytics
 * Get payer 360 analytics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payerId = parseInt(id, 10);

    if (isNaN(payerId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payer ID',
        },
        { status: 400 }
      );
    }

    // Check if payer exists
    const payer = await getPayerById(payerId);
    if (!payer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payer not found',
        },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get('refresh') === 'true';

    let analytics;

    if (forceRefresh) {
      // Force refresh analytics
      analytics = await refreshPayerAnalytics(payerId);
    } else {
      // Try to get cached analytics
      analytics = await getPayerAnalytics(payerId);

      // If cache miss or stale, refresh
      if (!analytics) {
        analytics = await refreshPayerAnalytics(payerId);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        payer,
        analytics,
      },
    });
  } catch (error) {
    console.error('Error fetching payer analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payer analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
