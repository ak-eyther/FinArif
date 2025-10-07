import { NextRequest, NextResponse } from 'next/server';
import { saveMappings } from '@/lib/queries/mappings';
import { MappingRule } from '@/lib/types/provider-360';

/**
 * POST /api/upload/mapping
 * Save column mappings for a batch
 */
export async function POST(request: NextRequest) {
  try {
    const body: { batch_id: number; mappings: MappingRule[] } = await request.json();

    if (!body.batch_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Batch ID is required',
        },
        { status: 400 }
      );
    }

    if (!body.mappings || !Array.isArray(body.mappings)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Mappings array is required',
        },
        { status: 400 }
      );
    }

    // Validate that all required fields are mapped
    const requiredFields = [
      'claim_number',
      'provider_name',
      'payer_name',
      'service_date',
      'invoice_amount',
    ];

    const mappedFields = body.mappings.map(m => m.schema_field);
    const missingFields = requiredFields.filter(f => !mappedFields.includes(f));

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Missing required field mappings: ' + missingFields.join(', '),
        },
        { status: 400 }
      );
    }

    // Save mappings
    await saveMappings(body.batch_id, body.mappings);

    return NextResponse.json({
      success: true,
      message: 'Mappings saved successfully',
    });
  } catch (error) {
    console.error('Error saving mappings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save mappings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
