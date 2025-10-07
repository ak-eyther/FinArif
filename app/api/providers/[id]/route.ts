import { NextRequest, NextResponse } from 'next/server';
import { getProviderById, updateProvider, deleteProvider } from '@/lib/queries/providers';
import { UpdateProviderRequest } from '@/lib/types/provider-360';

/**
 * GET /api/providers/:id
 * Get provider by ID
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

    return NextResponse.json({
      success: true,
      data: provider,
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch provider',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/providers/:id
 * Update provider by ID
 */
export async function PUT(
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

    const body: UpdateProviderRequest = await request.json();

    const provider = await updateProvider(providerId, {
      name: body.name?.trim(),
      type: body.type?.trim(),
      location: body.location?.trim(),
    });

    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          error: 'Provider not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: provider,
      message: 'Provider updated successfully',
    });
  } catch (error) {
    console.error('Error updating provider:', error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Duplicate provider',
          message: 'A provider with this name already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update provider',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/providers/:id
 * Delete provider by ID
 */
export async function DELETE(
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

    const deleted = await deleteProvider(providerId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Provider not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Provider deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting provider:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete provider',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
