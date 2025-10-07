import { NextRequest, NextResponse } from 'next/server';
import { getSchemeById, updateScheme, deleteScheme } from '@/lib/queries/schemes';
import { UpdateSchemeRequest } from '@/lib/types/provider-360';

/**
 * GET /api/schemes/:id
 * Get scheme by ID
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

    return NextResponse.json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    console.error('Error fetching scheme:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch scheme',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/schemes/:id
 * Update scheme by ID
 */
export async function PUT(
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

    const body: UpdateSchemeRequest = await request.json();

    const scheme = await updateScheme(schemeId, {
      payer_id: body.payer_id,
      name: body.name?.trim(),
      scheme_code: body.scheme_code?.trim(),
    });

    if (!scheme) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scheme not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: scheme,
      message: 'Scheme updated successfully',
    });
  } catch (error) {
    console.error('Error updating scheme:', error);

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
        error: 'Failed to update scheme',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schemes/:id
 * Delete scheme by ID
 */
export async function DELETE(
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

    const deleted = await deleteScheme(schemeId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scheme not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scheme deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting scheme:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete scheme',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
