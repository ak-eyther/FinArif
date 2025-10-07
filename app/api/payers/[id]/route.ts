import { NextRequest, NextResponse } from 'next/server';
import { getPayerById, updatePayer, deletePayer } from '@/lib/queries/payers';
import { UpdatePayerRequest } from '@/lib/types/provider-360';

/**
 * GET /api/payers/:id
 * Get payer by ID
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

    return NextResponse.json({
      success: true,
      data: payer,
    });
  } catch (error) {
    console.error('Error fetching payer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payer',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/payers/:id
 * Update payer by ID
 */
export async function PUT(
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

    const body: UpdatePayerRequest = await request.json();

    const payer = await updatePayer(payerId, {
      name: body.name?.trim(),
      type: body.type?.trim(),
    });

    if (!payer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payer not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payer,
      message: 'Payer updated successfully',
    });
  } catch (error) {
    console.error('Error updating payer:', error);

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
        error: 'Failed to update payer',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payers/:id
 * Delete payer by ID
 */
export async function DELETE(
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

    const deleted = await deletePayer(payerId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payer not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete payer',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
