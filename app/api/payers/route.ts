import { NextRequest, NextResponse } from 'next/server';
import { getAllPayers, searchPayers, createPayer } from '@/lib/queries/payers';
import { CreatePayerRequest } from '@/lib/types/provider-360';

/**
 * GET /api/payers
 * List all payers or search by query
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    let payers;
    if (query) {
      payers = await searchPayers(query);
    } else {
      payers = await getAllPayers();
    }

    return NextResponse.json({
      success: true,
      data: payers,
      count: payers.length,
    });
  } catch (error) {
    console.error('Error fetching payers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payers',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payers
 * Create a new payer
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreatePayerRequest = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Payer name is required',
        },
        { status: 400 }
      );
    }

    const payer = await createPayer({
      name: body.name.trim(),
      type: body.type?.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        data: payer,
        message: 'Payer created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating payer:', error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Duplicate payer',
          message: 'A payer with this name already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create payer',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
