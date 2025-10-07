/**
 * Claims Processor
 *
 * Processes Excel data into claims, auto-creating providers/payers/schemes as needed.
 * Handles batch processing with transaction safety and error logging.
 */

import { db } from '@vercel/postgres';
import { ColumnMapping } from '@/lib/queries/mappings';
import {
  validateClaimRow,
  amountToCents,
  formatDateForDB,
  parseDate,
  sanitizeString,
  ValidationError,
} from './data-validator';
import { createClaim, claimNumberExists } from '@/lib/queries/claims';
import { createProvider } from '@/lib/queries/providers';
import { createPayer } from '@/lib/queries/payers';
import { createScheme } from '@/lib/queries/schemes';
import { updateBatchProgress, updateBatchStatus } from '@/lib/queries/uploads';

export interface ProcessingResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: ProcessingError[];
  message: string;
}

export interface ProcessingError {
  row: number;
  error: string;
  data?: unknown;
}

interface MappedRow {
  [key: string]: string | number | null;
}

/**
 * Process a batch of claims from Excel data
 */
export async function processClaims(
  batchId: number,
  excelData: unknown[][],
  mappings: ColumnMapping[]
): Promise<ProcessingResult> {
  const errors: ProcessingError[] = [];
  let processedCount = 0;
  let failedCount = 0;

  // Update batch status to processing
  await updateBatchStatus(batchId, 'processing');

  // Get a database client for transaction
  const client = await db.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    // Process each row
    for (let i = 0; i < excelData.length; i++) {
      const rowIndex = i + 1; // Row numbers start at 1
      const row = excelData[i];

      try {
        // Skip empty rows
        if (!row || row.every(cell => !cell)) {
          continue;
        }

        // Apply mappings to transform Excel row to claim data
        const mappedData = applyMappings(row, mappings);

        // Validate the mapped data
        const validation = validateClaimRow(mappedData, rowIndex);
        if (!validation.isValid) {
          errors.push({
            row: rowIndex,
            error: validation.errors.map(e => e.error).join('; '),
            data: mappedData,
          });
          failedCount++;
          continue;
        }

        // Check for duplicate claim number
        if (mappedData.claim_number) {
          const exists = await claimNumberExists(String(mappedData.claim_number));
          if (exists) {
            errors.push({
              row: rowIndex,
              error: `Duplicate claim number: ${mappedData.claim_number}`,
              data: mappedData,
            });
            failedCount++;
            continue;
          }
        }

        // Lookup or create provider
        let providerId: number | null = null;
        if (mappedData.provider_name) {
          const providerName = String(mappedData.provider_name).trim();
          let provider = await getProviderByName(providerName);

          if (!provider) {
            provider = await createProvider({ name: providerName });
          }

          providerId = provider.id;
        }

        // Lookup or create payer
        let payerId: number | null = null;
        if (mappedData.payer_name) {
          const payerName = String(mappedData.payer_name).trim();
          let payer = await getPayerByName(payerName);

          if (!payer) {
            payer = await createPayer({ name: payerName });
          }

          payerId = payer.id;
        }

        // Lookup or create scheme (if both payer and scheme name exist)
        let schemeId: number | null = null;
        if (mappedData.scheme_name && payerId) {
          const schemeName = String(mappedData.scheme_name).trim();
          let scheme = await getSchemeByNameAndPayer(schemeName, payerId);

          if (!scheme) {
            scheme = await createScheme({
              payer_id: payerId,
              name: schemeName,
            });
          }

          schemeId = scheme.id;
        }

        // Parse dates
        const serviceDate = mappedData.service_date
          ? formatDateForDB(parseDate(mappedData.service_date))
          : null;

        const claimDate = mappedData.claim_date
          ? formatDateForDB(parseDate(mappedData.claim_date))
          : null;

        // Parse amounts
        const invoiceAmountCents = mappedData.invoice_amount
          ? amountToCents(mappedData.invoice_amount)
          : 0;

        const approvedAmountCents = mappedData.approved_amount
          ? amountToCents(mappedData.approved_amount)
          : null;

        // Create claim
        await createClaim({
          provider_id: providerId,
          payer_id: payerId,
          scheme_id: schemeId,
          claim_number: sanitizeString(mappedData.claim_number),
          member_number: sanitizeString(mappedData.member_number),
          patient_name: sanitizeString(mappedData.patient_name),
          provider_name: sanitizeString(mappedData.provider_name),
          payer_name: sanitizeString(mappedData.payer_name),
          scheme_name: sanitizeString(mappedData.scheme_name),
          service_date: serviceDate,
          claim_date: claimDate,
          invoice_amount_cents: invoiceAmountCents,
          approved_amount_cents: approvedAmountCents,
          status: sanitizeString(mappedData.status) || 'Pending',
          diagnosis_code: sanitizeString(mappedData.diagnosis_code),
          procedure_code: sanitizeString(mappedData.procedure_code),
          upload_batch_id: batchId,
        });

        processedCount++;

        // Update progress every 100 rows
        if (processedCount % 100 === 0) {
          await updateBatchProgress(batchId, processedCount, failedCount);
        }
      } catch (error) {
        failedCount++;
        errors.push({
          row: rowIndex,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: row,
        });
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    // Final progress update
    await updateBatchProgress(batchId, processedCount, failedCount);

    // Update batch status
    const errorLog = errors.length > 0 ? JSON.stringify(errors, null, 2) : null;
    await updateBatchStatus(
      batchId,
      failedCount > 0 && processedCount === 0 ? 'failed' : 'completed',
      errorLog
    );

    return {
      success: true,
      processedCount,
      failedCount,
      errors,
      message: `Processed ${processedCount} claims, ${failedCount} failed`,
    };
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateBatchStatus(batchId, 'failed', errorMessage);

    return {
      success: false,
      processedCount,
      failedCount,
      errors,
      message: `Processing failed: ${errorMessage}`,
    };
  } finally {
    client.release();
  }
}

/**
 * Apply column mappings to transform Excel row to claim data
 */
function applyMappings(row: unknown[], mappings: ColumnMapping[]): MappedRow {
  const result: MappedRow = {};

  mappings.forEach((mapping, index) => {
    const cellValue = row[index];
    const schemaField = mapping.schema_field;

    // Handle null/undefined values
    if (cellValue === null || cellValue === undefined || cellValue === '') {
      result[schemaField] = null;
      return;
    }

    // Apply transform rules if present
    let transformedValue: string | number | null = cellValue as string | number;

    if (mapping.transform_rule) {
      try {
        const rule = JSON.parse(mapping.transform_rule);
        transformedValue = applyTransformRule(cellValue, rule);
      } catch {
        // If transform fails, use raw value
        transformedValue = cellValue as string | number;
      }
    }

    result[schemaField] = transformedValue;
  });

  return result;
}

/**
 * Apply a transform rule to a value
 */
function applyTransformRule(value: unknown, rule: Record<string, unknown>): string | number | null {
  const type = rule.type as string;

  switch (type) {
    case 'date_format':
      // Date transformation already handled by parseDate in validator
      return value as string;

    case 'currency_to_cents':
      // Amount transformation already handled by amountToCents
      return value as string | number;

    case 'uppercase':
      return String(value).toUpperCase();

    case 'lowercase':
      return String(value).toLowerCase();

    case 'trim':
      return String(value).trim();

    default:
      return value as string | number;
  }
}

/**
 * Get provider by name, creating if it doesn't exist
 */
async function getProviderByName(name: string) {
  const { sql } = await import('@/lib/db');

  const { rows } = await sql`
    SELECT * FROM providers WHERE name = ${name}
  `;

  if (rows.length > 0) {
    return rows[0];
  }

  return null;
}

/**
 * Get payer by name
 */
async function getPayerByName(name: string) {
  const { sql } = await import('@/lib/db');

  const { rows } = await sql`
    SELECT * FROM payers WHERE name = ${name}
  `;

  if (rows.length > 0) {
    return rows[0];
  }

  return null;
}
