import { NextRequest, NextResponse } from 'next/server';
import { getAllSchemes, searchSchemes, getSchemesByPayerId, createScheme } from '@/lib/queries/schemes';
import { CreateSchemeRequest } from '@/lib/types/provider-360';

/**
 * GET /api/schemes
 * List all schemes or filter by payer_id or search by query
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const payerId = searchParams.get('payer_id');

    let schemes;
    if (query) {
      schemes = await searchSchemes(query);
    } else if (payerId) {
      schemes = await getSchemesByPayerId(parseInt(payerId, 10));
    } else {
      schemes = await getAllSchemes();
    }

    return NextResponse.json({
      success: true,
      data: schemes,
      count: schemes.length,
    });
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch schemes',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schemes
 * Create a new scheme
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateSchemeRequest = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Scheme name is required',
        },
        { status: 400 }
      );
    }

    if (!body.payer_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Payer ID is required',
        },
        { status: 400 }
      );
    }

    const scheme = await createScheme({
      payer_id: body.payer_id,
      name: body.name.trim(),
      scheme_code: body.scheme_code?.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        data: scheme,
        message: 'Scheme created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating scheme:', error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Duplicate scheme',
          message: 'A scheme with this name already exists for this payer',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create scheme',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
