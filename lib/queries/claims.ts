/**
 * Claim database queries
 *
 * All SQL queries for claim CRUD operations.
 * Money is stored in cents as integers.
 * All queries use parameterized statements.
 */

import { sql } from '@/lib/db';

export interface Claim {
  id: number;
  provider_id: number | null;
  payer_id: number | null;
  scheme_id: number | null;
  claim_number: string | null;
  member_number: string | null;
  patient_name: string | null;
  provider_name: string | null;
  payer_name: string | null;
  scheme_name: string | null;
  service_date: Date | null;
  claim_date: Date | null;
  invoice_amount_cents: number;
  approved_amount_cents: number | null;
  status: string | null;
  diagnosis_code: string | null;
  procedure_code: string | null;
  upload_batch_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClaimInput {
  provider_id?: number | null;
  payer_id?: number | null;
  scheme_id?: number | null;
  claim_number?: string | null;
  member_number?: string | null;
  patient_name?: string | null;
  provider_name?: string | null;
  payer_name?: string | null;
  scheme_name?: string | null;
  service_date?: string | null;
  claim_date?: string | null;
  invoice_amount_cents: number;
  approved_amount_cents?: number | null;
  status?: string | null;
  diagnosis_code?: string | null;
  procedure_code?: string | null;
  upload_batch_id?: number | null;
}

/**
 * Get all claims with optional filtering and pagination
 */
export async function getAllClaims(options?: {
  provider_id?: number;
  payer_id?: number;
  scheme_id?: number;
  batch_id?: number;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Claim[]> {
  const {
    provider_id,
    payer_id,
    scheme_id,
    batch_id,
    status,
    limit = 50,
    offset = 0,
  } = options || {};

  let query = `
    SELECT id, provider_id, payer_id, scheme_id, claim_number, member_number,
           patient_name, provider_name, payer_name, scheme_name, service_date,
           claim_date, invoice_amount_cents, approved_amount_cents, status,
           diagnosis_code, procedure_code, upload_batch_id, created_at, updated_at
    FROM claims
    WHERE 1=1
  `;

  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (provider_id) {
    query += ` AND provider_id = $${paramIndex}`;
    params.push(provider_id);
    paramIndex++;
  }

  if (payer_id) {
    query += ` AND payer_id = $${paramIndex}`;
    params.push(payer_id);
    paramIndex++;
  }

  if (scheme_id) {
    query += ` AND scheme_id = $${paramIndex}`;
    params.push(scheme_id);
    paramIndex++;
  }

  if (batch_id) {
    query += ` AND upload_batch_id = $${paramIndex}`;
    params.push(batch_id);
    paramIndex++;
  }

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  query += ` ORDER BY service_date DESC, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const { rows } = await sql.query(query, params);
  return rows as Claim[];
}

/**
 * Get claim by ID
 */
export async function getClaimById(id: number): Promise<Claim | null> {
  const { rows } = await sql`
    SELECT id, provider_id, payer_id, scheme_id, claim_number, member_number,
           patient_name, provider_name, payer_name, scheme_name, service_date,
           claim_date, invoice_amount_cents, approved_amount_cents, status,
           diagnosis_code, procedure_code, upload_batch_id, created_at, updated_at
    FROM claims
    WHERE id = ${id}
  `;

  return rows.length > 0 ? (rows[0] as Claim) : null;
}

/**
 * Get claim by claim number
 */
export async function getClaimByClaimNumber(
  claimNumber: string
): Promise<Claim | null> {
  const { rows } = await sql`
    SELECT id, provider_id, payer_id, scheme_id, claim_number, member_number,
           patient_name, provider_name, payer_name, scheme_name, service_date,
           claim_date, invoice_amount_cents, approved_amount_cents, status,
           diagnosis_code, procedure_code, upload_batch_id, created_at, updated_at
    FROM claims
    WHERE claim_number = ${claimNumber}
  `;

  return rows.length > 0 ? (rows[0] as Claim) : null;
}

/**
 * Create a new claim
 */
export async function createClaim(input: CreateClaimInput): Promise<Claim> {
  const {
    provider_id = null,
    payer_id = null,
    scheme_id = null,
    claim_number = null,
    member_number = null,
    patient_name = null,
    provider_name = null,
    payer_name = null,
    scheme_name = null,
    service_date = null,
    claim_date = null,
    invoice_amount_cents,
    approved_amount_cents = null,
    status = null,
    diagnosis_code = null,
    procedure_code = null,
    upload_batch_id = null,
  } = input;

  const { rows } = await sql`
    INSERT INTO claims (
      provider_id, payer_id, scheme_id, claim_number, member_number,
      patient_name, provider_name, payer_name, scheme_name, service_date,
      claim_date, invoice_amount_cents, approved_amount_cents, status,
      diagnosis_code, procedure_code, upload_batch_id
    )
    VALUES (
      ${provider_id}, ${payer_id}, ${scheme_id}, ${claim_number}, ${member_number},
      ${patient_name}, ${provider_name}, ${payer_name}, ${scheme_name}, ${service_date},
      ${claim_date}, ${invoice_amount_cents}, ${approved_amount_cents}, ${status},
      ${diagnosis_code}, ${procedure_code}, ${upload_batch_id}
    )
    RETURNING *
  `;

  return rows[0] as Claim;
}

/**
 * Delete a claim by ID
 */
export async function deleteClaim(id: number): Promise<boolean> {
  const { rowCount } = await sql`
    DELETE FROM claims WHERE id = ${id}
  `;

  return (rowCount ?? 0) > 0;
}

/**
 * Get total count of claims (for pagination)
 */
export async function getClaimsCount(options?: {
  provider_id?: number;
  payer_id?: number;
  scheme_id?: number;
  batch_id?: number;
  status?: string;
}): Promise<number> {
  const { provider_id, payer_id, scheme_id, batch_id, status } = options || {};

  let query = 'SELECT COUNT(*) as count FROM claims WHERE 1=1';
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (provider_id) {
    query += ` AND provider_id = $${paramIndex}`;
    params.push(provider_id);
    paramIndex++;
  }

  if (payer_id) {
    query += ` AND payer_id = $${paramIndex}`;
    params.push(payer_id);
    paramIndex++;
  }

  if (scheme_id) {
    query += ` AND scheme_id = $${paramIndex}`;
    params.push(scheme_id);
    paramIndex++;
  }

  if (batch_id) {
    query += ` AND upload_batch_id = $${paramIndex}`;
    params.push(batch_id);
    paramIndex++;
  }

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
  }

  const { rows } = await sql.query(query, params);
  return parseInt(rows[0].count);
}

/**
 * Check if claim number exists (for duplicate detection)
 */
export async function claimNumberExists(claimNumber: string): Promise<boolean> {
  const { rows } = await sql<{ exists: boolean }>`
    SELECT EXISTS(SELECT 1 FROM claims WHERE claim_number = ${claimNumber}) as exists
  `;

  return rows[0]?.exists || false;
}

/**
 * Get claims by batch ID (for batch processing status)
 */
export async function getClaimsByBatchId(batchId: number): Promise<Claim[]> {
  const { rows } = await sql`
    SELECT id, provider_id, payer_id, scheme_id, claim_number, member_number,
           patient_name, provider_name, payer_name, scheme_name, service_date,
           claim_date, invoice_amount_cents, approved_amount_cents, status,
           diagnosis_code, procedure_code, upload_batch_id, created_at, updated_at
    FROM claims
    WHERE upload_batch_id = ${batchId}
    ORDER BY created_at ASC
  `;

  return rows as Claim[];
}
