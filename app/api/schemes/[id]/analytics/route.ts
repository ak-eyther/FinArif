import { NextRequest, NextResponse } from 'next/server';
import { getSchemeById } from '@/lib/queries/schemes';
import { sql } from '@/lib/db';

/**
 * GET /api/schemes/:id/analytics
 * Get scheme 360 analytics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schemeId = parseInt(id, 10);

    if (isNaN(schemeId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid scheme ID',
        },
        { status: 400 }
      );
    }

    // Check if scheme exists
    const scheme = await getSchemeById(schemeId);
    if (!scheme) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scheme not found',
        },
        { status: 404 }
      );
    }

    // Calculate scheme analytics
    const { rows } = await sql`
      SELECT
        COUNT(*) as total_claims,
        SUM(invoice_amount_cents) as total_invoice_cents,
        SUM(approved_amount_cents) as total_approved_cents,
        CASE
          WHEN SUM(invoice_amount_cents) > 0
          THEN (SUM(approved_amount_cents)::DECIMAL / SUM(invoice_amount_cents)) * 100
          ELSE 0
        END as approval_rate
      FROM claims
      WHERE scheme_id = ${schemeId}
    `;

    const analytics = rows[0];

    // Get top providers
    const { rows: topProviders } = await sql`
      SELECT
        p.id as provider_id,
        p.name,
        COUNT(*) as claims,
        SUM(c.invoice_amount_cents) as volume_cents
      FROM claims c
      JOIN providers p ON c.provider_id = p.id
      WHERE c.scheme_id = ${schemeId}
      GROUP BY p.id, p.name
      ORDER BY volume_cents DESC
      LIMIT 10
    `;

    // Get monthly trends
    const { rows: monthlyTrends } = await sql`
      SELECT
        TO_CHAR(service_date, 'YYYY-MM') as month,
        COUNT(*) as claims,
        SUM(invoice_amount_cents) as volume_cents
      FROM claims
      WHERE scheme_id = ${schemeId}
      GROUP BY TO_CHAR(service_date, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `;

    return NextResponse.json({
      success: true,
      data: {
        scheme,
        analytics: {
          total_claims: parseInt(analytics.total_claims) || 0,
          total_invoice_cents: parseInt(analytics.total_invoice_cents) || 0,
          total_approved_cents: parseInt(analytics.total_approved_cents) || 0,
          approval_rate: parseFloat(analytics.approval_rate) || 0,
          top_providers: topProviders.map(p => ({
            provider_id: p.provider_id,
            name: p.name,
            claims: parseInt(p.claims),
            volume_cents: parseInt(p.volume_cents),
          })),
          monthly_trends: monthlyTrends.map(t => ({
            month: t.month,
            claims: parseInt(t.claims),
            volume_cents: parseInt(t.volume_cents),
          })),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching scheme analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch scheme analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
