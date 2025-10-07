import { NextRequest, NextResponse } from 'next/server';
import { getUploadBatchById } from '@/lib/queries/uploads';
import { getMappingsByBatchId } from '@/lib/queries/mappings';
import { parseExcelFile } from '@/lib/utils/excel-parser';
import { processClaims } from '@/lib/utils/claims-processor';

/**
 * POST /api/upload/process
 * Process uploaded batch with mappings
 */
export async function POST(request: NextRequest) {
  try {
    const body: { batch_id: number; file_data?: string } = await request.json();

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

    // Get batch record
    const batch = await getUploadBatchById(body.batch_id);
    if (!batch) {
      return NextResponse.json(
        {
          success: false,
          error: 'Batch not found',
        },
        { status: 404 }
      );
    }

    // Get mappings for this batch
    const mappings = await getMappingsByBatchId(body.batch_id);
    if (mappings.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No mappings found',
          message: 'Please save column mappings before processing',
        },
        { status: 400 }
      );
    }

    // For now, we need the actual Excel data
    // In a real implementation, we'd store the file and retrieve it
    if (!body.file_data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing file data',
          message: 'File data is required for processing',
        },
        { status: 400 }
      );
    }

    // Decode base64 file data
    const buffer = Buffer.from(body.file_data, 'base64');
    const parseResult = parseExcelFile(buffer);

    if ('error' in parseResult) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error,
          message: parseResult.details,
        },
        { status: 400 }
      );
    }

    // Convert rows to array format for processing
    const excelData = parseResult.rows.map(row => [
      row.claimNumber,
      row.memberNumber,
      row.patientName,
      row.providerName,
      row.payerName,
      row.schemeName,
      row.serviceDate,
      row.claimDate,
      row.invoiceAmount,
      row.approvedAmount,
      row.status,
      row.diagnosisCode,
      row.procedureCode,
      row.reserved,
    ]);

    // Process claims
    const result = await processClaims(body.batch_id, excelData, mappings);

    return NextResponse.json({
      success: result.success,
      data: {
        batch_id: body.batch_id,
        processed_rows: result.processedCount,
        failed_rows: result.failedCount,
        errors: result.errors.slice(0, 10), // Return first 10 errors only
      },
      message: result.message,
    });
  } catch (error) {
    console.error('Error processing batch:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process batch',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
