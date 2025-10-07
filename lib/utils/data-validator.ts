// Data Validator Utility
// Validates claim data before processing

export interface ValidationError {
  row: number;
  field: string;
  value: unknown;
  error: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ClaimRowData {
  claim_number?: string;
  member_number?: string;
  patient_name?: string;
  provider_name?: string;
  payer_name?: string;
  scheme_name?: string;
  service_date?: string | Date;
  claim_date?: string | Date;
  invoice_amount?: string | number;
  approved_amount?: string | number;
  status?: string;
  diagnosis_code?: string;
  procedure_code?: string;
}

// Validate a single claim row
export function validateClaimRow(
  data: ClaimRowData,
  rowIndex: number
): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields validation
  if (!data.claim_number || String(data.claim_number).trim() === '') {
    errors.push({
      row: rowIndex,
      field: 'claim_number',
      value: data.claim_number,
      error: 'Claim number is required',
    });
  }

  if (!data.provider_name || String(data.provider_name).trim() === '') {
    errors.push({
      row: rowIndex,
      field: 'provider_name',
      value: data.provider_name,
      error: 'Provider name is required',
    });
  }

  if (!data.payer_name || String(data.payer_name).trim() === '') {
    errors.push({
      row: rowIndex,
      field: 'payer_name',
      value: data.payer_name,
      error: 'Payer name is required',
    });
  }

  // Invoice amount validation
  if (data.invoice_amount === undefined || data.invoice_amount === null) {
    errors.push({
      row: rowIndex,
      field: 'invoice_amount',
      value: data.invoice_amount,
      error: 'Invoice amount is required',
    });
  } else {
    const amount = parseAmount(data.invoice_amount);
    if (isNaN(amount) || amount < 0) {
      errors.push({
        row: rowIndex,
        field: 'invoice_amount',
        value: data.invoice_amount,
        error: 'Invoice amount must be a positive number',
      });
    }
  }

  // Date validation
  if (data.service_date) {
    const serviceDate = parseDate(data.service_date);
    if (!serviceDate) {
      errors.push({
        row: rowIndex,
        field: 'service_date',
        value: data.service_date,
        error: 'Invalid service date format',
      });
    }
  }

  if (data.claim_date) {
    const claimDate = parseDate(data.claim_date);
    if (!claimDate) {
      errors.push({
        row: rowIndex,
        field: 'claim_date',
        value: data.claim_date,
        error: 'Invalid claim date format',
      });
    }
  }

  // Approved amount validation (optional)
  if (
    data.approved_amount !== undefined &&
    data.approved_amount !== null &&
    data.approved_amount !== ''
  ) {
    const amount = parseAmount(data.approved_amount);
    if (isNaN(amount) || amount < 0) {
      errors.push({
        row: rowIndex,
        field: 'approved_amount',
        value: data.approved_amount,
        error: 'Approved amount must be a positive number',
      });
    }
  }

  // Status validation
  if (data.status) {
    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Processing', 'Paid'];
    const status = String(data.status).trim();
    if (!validStatuses.includes(status)) {
      // Not a hard error, just normalize it
      // errors.push({
      //   row: rowIndex,
      //   field: 'status',
      //   value: data.status,
      //   error: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
      // });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Parse amount from various formats (KES 1,234.56, 1234.56, etc.)
export function parseAmount(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }

  // Remove currency symbols, commas, and whitespace
  const cleaned = String(value)
    .replace(/[KES\s,]/gi, '')
    .trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? NaN : parsed;
}

// Convert amount to cents (integer)
export function amountToCents(value: string | number): number {
  const amount = parseAmount(value);
  return Math.round(amount * 100);
}

// Parse date from various formats
export function parseDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (!value || String(value).trim() === '') {
    return null;
  }

  // Try parsing as ISO format first
  let date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try DD/MM/YYYY format
  const ddmmyyyyMatch = String(value).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Try MM/DD/YYYY format
  const mmddyyyyMatch = String(value).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mmddyyyyMatch) {
    const [, month, day, year] = mmddyyyyMatch;
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

// Format date to YYYY-MM-DD for database
export function formatDateForDB(date: Date | null): string | null {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Sanitize string for database
export function sanitizeString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const str = String(value).trim();
  return str === '' ? null : str;
}

// Validate batch of claims
export function validateClaimBatch(
  rows: ClaimRowData[]
): ValidationResult {
  const allErrors: ValidationError[] = [];

  rows.forEach((row, index) => {
    const result = validateClaimRow(row, index + 1); // Row numbers start at 1
    allErrors.push(...result.errors);
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

// Get validation summary
export function getValidationSummary(result: ValidationResult): string {
  if (result.isValid) {
    return 'All rows validated successfully';
  }

  const errorsByRow = new Map<number, number>();
  result.errors.forEach((error) => {
    errorsByRow.set(error.row, (errorsByRow.get(error.row) || 0) + 1);
  });

  const totalErrors = result.errors.length;
  const affectedRows = errorsByRow.size;

  return `Found ${totalErrors} error(s) in ${affectedRows} row(s)`;
}
