import * as XLSX from 'xlsx';

export interface ExcelRow {
  claimNumber: string;
  memberNumber: string;
  patientName: string;
  providerName: string;
  payerName: string;
  schemeName: string;
  serviceDate: string;
  claimDate: string;
  invoiceAmount: string;
  approvedAmount: string;
  status: string;
  diagnosisCode: string;
  procedureCode: string;
  reserved: string;
}

export interface ParsedExcelData {
  headers: string[];
  rows: ExcelRow[];
  totalRows: number;
  previewRows: ExcelRow[];
}

export interface ExcelParserError {
  error: string;
  details?: string;
}

/**
 * Parse Excel file buffer and extract data
 * Expects 14 columns in the following order:
 * 1. Claim Number
 * 2. Member Number
 * 3. Patient Name
 * 4. Provider Name
 * 5. Payer Name
 * 6. Scheme Name
 * 7. Service Date
 * 8. Claim Date
 * 9. Invoice Amount
 * 10. Approved Amount
 * 11. Status
 * 12. Diagnosis Code
 * 13. Procedure Code
 * 14. Reserved/Custom
 */
export function parseExcelFile(
  buffer: Buffer
): ParsedExcelData | ExcelParserError {
  try {
    // Read the Excel file from buffer
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        error: 'No sheets found in Excel file',
        details: 'The uploaded file does not contain any worksheets',
      };
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON with headers
    const jsonData: unknown[] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false,
    });

    if (jsonData.length === 0) {
      return {
        error: 'Empty Excel file',
        details: 'The uploaded file does not contain any data',
      };
    }

    // Extract headers (first row)
    const headers = jsonData[0] as string[];

    // Validate minimum columns
    if (headers.length < 14) {
      return {
        error: 'Invalid Excel format',
        details: `Expected 14 columns but found ${headers.length}. Please ensure the file has all required columns.`,
      };
    }

    // Extract data rows (skip header)
    const dataRows = jsonData.slice(1) as string[][];

    // Map rows to structured format
    const rows: ExcelRow[] = dataRows
      .filter((row) => row.length > 0 && row[0]) // Filter out empty rows
      .map((row) => ({
        claimNumber: String(row[0] || '').trim(),
        memberNumber: String(row[1] || '').trim(),
        patientName: String(row[2] || '').trim(),
        providerName: String(row[3] || '').trim(),
        payerName: String(row[4] || '').trim(),
        schemeName: String(row[5] || '').trim(),
        serviceDate: String(row[6] || '').trim(),
        claimDate: String(row[7] || '').trim(),
        invoiceAmount: String(row[8] || '').trim(),
        approvedAmount: String(row[9] || '').trim(),
        status: String(row[10] || '').trim(),
        diagnosisCode: String(row[11] || '').trim(),
        procedureCode: String(row[12] || '').trim(),
        reserved: String(row[13] || '').trim(),
      }));

    // Get preview (first 10 rows)
    const previewRows = rows.slice(0, 10);

    return {
      headers,
      rows,
      totalRows: rows.length,
      previewRows,
    };
  } catch (error) {
    return {
      error: 'Failed to parse Excel file',
      details:
        error instanceof Error
          ? error.message
          : 'An unknown error occurred while parsing the file',
    };
  }
}

/**
 * Validate Excel file type
 */
export function validateExcelFile(filename: string): boolean {
  const validExtensions = ['.xlsx', '.xls'];
  return validExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
