import { NextRequest, NextResponse } from 'next/server';
import { getProviderById } from '@/lib/queries/providers';
import {
  getProviderAnalytics,
  refreshProviderAnalytics,
} from '@/lib/queries/provider-analytics';

/**
 * GET /api/providers/:id/analytics
 * Get provider 360 analytics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const providerId = parseInt(id, 10);

    if (isNaN(providerId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid provider ID',
        },
        { status: 400 }
      );
    }

    // Check if provider exists
    const provider = await getProviderById(providerId);
    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          error: 'Provider not found',
        },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get('refresh') === 'true';

    let analytics;

    if (forceRefresh) {
      // Force refresh analytics
      analytics = await refreshProviderAnalytics(providerId);
    } else {
      // Try to get cached analytics
      analytics = await getProviderAnalytics(providerId);

      // If cache miss or stale, refresh
      if (!analytics) {
        analytics = await refreshProviderAnalytics(providerId);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        provider,
        analytics,
      },
    });
  } catch (error) {
    console.error('Error fetching provider analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch provider analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
