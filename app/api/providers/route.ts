import { NextRequest, NextResponse } from 'next/server';
import { getAllProviders, searchProviders, createProvider } from '@/lib/queries/providers';
import { CreateProviderRequest } from '@/lib/types/provider-360';

/**
 * GET /api/providers
 * List all providers or search by query
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    let providers;
    if (query) {
      providers = await searchProviders(query);
    } else {
      providers = await getAllProviders();
    }

    return NextResponse.json({
      success: true,
      data: providers,
      count: providers.length,
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch providers',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/providers
 * Create a new provider
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateProviderRequest = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Provider name is required',
        },
        { status: 400 }
      );
    }

    const provider = await createProvider({
      name: body.name.trim(),
      type: body.type?.trim(),
      location: body.location?.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        data: provider,
        message: 'Provider created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating provider:', error);

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
        error: 'Failed to create provider',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
