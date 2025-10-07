import { NextRequest, NextResponse } from 'next/server';
import { parseExcelFile, validateExcelFile } from '@/lib/utils/excel-parser';
import { createUploadBatch } from '@/lib/queries/uploads';

/**
 * POST /api/upload/preview
 * Upload Excel file and return preview data
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file uploaded',
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateExcelFile(file.name)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type',
          message: 'Please upload an Excel file (.xlsx or .xls)',
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: 'File too large',
          message: 'File size must be less than 10MB',
        },
        { status: 400 }
      );
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel file
    const parseResult = parseExcelFile(buffer);

    // Check for parsing errors
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

    // Create upload batch record
    const batch = await createUploadBatch({
      filename: file.name,
      uploadedBy: 'system', // TODO: Get from auth session
      totalRows: parseResult.totalRows,
    });

    return NextResponse.json({
      success: true,
      data: {
        batch_id: batch.id,
        filename: file.name,
        headers: parseResult.headers,
        preview_rows: parseResult.previewRows,
        total_rows: parseResult.totalRows,
      },
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload file',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
