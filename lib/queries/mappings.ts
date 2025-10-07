import { sql } from '@vercel/postgres';

export interface ColumnMapping {
  id: number;
  batch_id: number;
  excel_column: string;
  schema_field: string;
  data_type: string | null;
  transform_rule: string | null;
  created_at: Date;
}

export interface CreateMappingInput {
  batch_id: number;
  excel_column: string;
  schema_field: string;
  data_type?: string;
  transform_rule?: string;
}

/**
 * Valid schema fields that can be mapped from Excel columns
 */
export const VALID_SCHEMA_FIELDS = [
  'claim_number',
  'member_number',
  'patient_name',
  'provider_name',
  'payer_name',
  'scheme_name',
  'service_date',
  'claim_date',
  'invoice_amount_cents',
  'approved_amount_cents',
  'status',
  'diagnosis_code',
  'procedure_code',
] as const;

export type SchemaField = typeof VALID_SCHEMA_FIELDS[number];

/**
 * Get all mappings for a specific batch
 */
export async function getMappingsByBatchId(batchId: number): Promise<ColumnMapping[]> {
  const { rows } = await sql`
    SELECT
      id,
      batch_id,
      excel_column,
      schema_field,
      data_type,
      transform_rule,
      created_at
    FROM column_mappings
    WHERE batch_id = ${batchId}
    ORDER BY id ASC;
  `;

  return rows as ColumnMapping[];
}

/**
 * Create a new column mapping
 */
export async function createMapping(input: CreateMappingInput): Promise<ColumnMapping> {
  const { rows } = await sql`
    INSERT INTO column_mappings (
      batch_id,
      excel_column,
      schema_field,
      data_type,
      transform_rule
    ) VALUES (
      ${input.batch_id},
      ${input.excel_column},
      ${input.schema_field},
      ${input.data_type || null},
      ${input.transform_rule || null}
    )
    RETURNING *;
  `;

  return rows[0] as ColumnMapping;
}

/**
 * Create multiple mappings in a transaction
 */
export async function createMappingsBatch(mappings: CreateMappingInput[]): Promise<void> {
  if (mappings.length === 0) return;

  // Delete existing mappings for the batch first
  await sql`
    DELETE FROM column_mappings
    WHERE batch_id = ${mappings[0].batch_id};
  `;

  // Insert new mappings
  for (const mapping of mappings) {
    await createMapping(mapping);
  }
}

/**
 * Update an existing mapping
 */
export async function updateMapping(
  id: number,
  updates: Partial<CreateMappingInput>
): Promise<ColumnMapping> {
  const { rows } = await sql`
    UPDATE column_mappings
    SET
      excel_column = COALESCE(${updates.excel_column || null}, excel_column),
      schema_field = COALESCE(${updates.schema_field || null}, schema_field),
      data_type = COALESCE(${updates.data_type || null}, data_type),
      transform_rule = COALESCE(${updates.transform_rule || null}, transform_rule)
    WHERE id = ${id}
    RETURNING *;
  `;

  return rows[0] as ColumnMapping;
}

/**
 * Delete mappings for a batch
 */
export async function deleteMappingsByBatchId(batchId: number): Promise<void> {
  await sql`
    DELETE FROM column_mappings
    WHERE batch_id = ${batchId};
  `;
}

/**
 * Delete a specific mapping
 */
export async function deleteMapping(id: number): Promise<void> {
  await sql`
    DELETE FROM column_mappings
    WHERE id = ${id};
  `;
}

/**
 * Validate mappings for duplicate schema fields
 */
export function validateMappings(mappings: CreateMappingInput[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const schemaFieldsSeen = new Set<string>();

  for (const mapping of mappings) {
    // Check for duplicate schema fields
    if (schemaFieldsSeen.has(mapping.schema_field)) {
      errors.push(`Duplicate mapping for schema field: ${mapping.schema_field}`);
    }
    schemaFieldsSeen.add(mapping.schema_field);

    // Check if schema field is valid
    if (!VALID_SCHEMA_FIELDS.includes(mapping.schema_field as SchemaField)) {
      errors.push(`Invalid schema field: ${mapping.schema_field}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get mapping statistics for a batch
 */
export async function getMappingStats(batchId: number) {
  const { rows } = await sql`
    SELECT
      COUNT(*) as total_mappings,
      COUNT(DISTINCT schema_field) as unique_schema_fields,
      COUNT(CASE WHEN transform_rule IS NOT NULL THEN 1 END) as mappings_with_transforms
    FROM column_mappings
    WHERE batch_id = ${batchId};
  `;

  return rows[0];
}
