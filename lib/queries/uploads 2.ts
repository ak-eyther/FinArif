import { sql } from '@vercel/postgres';

export interface UploadBatch {
  id: number;
  filename: string;
  uploaded_by: string | null;
  total_rows: number;
  processed_rows: number;
  failed_rows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_log: string | null;
  created_at: Date;
  completed_at: Date | null;
}

export interface CreateBatchParams {
  filename: string;
  uploadedBy?: string;
  totalRows: number;
}

/**
 * Create a new upload batch record
 */
export async function createUploadBatch(
  params: CreateBatchParams
): Promise<UploadBatch> {
  const { filename, uploadedBy = null, totalRows } = params;

  const result = await sql<UploadBatch>`
    INSERT INTO upload_batches (filename, uploaded_by, total_rows, status)
    VALUES (${filename}, ${uploadedBy}, ${totalRows}, 'pending')
    RETURNING *;
  `;

  return result.rows[0];
}

/**
 * Get upload batch by ID
 */
export async function getUploadBatchById(id: number): Promise<UploadBatch | null> {
  const result = await sql<UploadBatch>`
    SELECT * FROM upload_batches
    WHERE id = ${id};
  `;

  return result.rows[0] || null;
}

/**
 * Get all upload batches (most recent first)
 */
export async function getAllUploadBatches(limit = 50): Promise<UploadBatch[]> {
  const result = await sql<UploadBatch>`
    SELECT * FROM upload_batches
    ORDER BY created_at DESC
    LIMIT ${limit};
  `;

  return result.rows;
}

/**
 * Update batch status
 */
export async function updateBatchStatus(
  id: number,
  status: UploadBatch['status'],
  errorLog?: string
): Promise<UploadBatch> {
  const result = await sql<UploadBatch>`
    UPDATE upload_batches
    SET
      status = ${status},
      error_log = ${errorLog || null},
      completed_at = ${status === 'completed' || status === 'failed' ? new Date().toISOString() : null}
    WHERE id = ${id}
    RETURNING *;
  `;

  return result.rows[0];
}

/**
 * Update batch progress
 */
export async function updateBatchProgress(
  id: number,
  processedRows: number,
  failedRows: number
): Promise<UploadBatch> {
  const result = await sql<UploadBatch>`
    UPDATE upload_batches
    SET
      processed_rows = ${processedRows},
      failed_rows = ${failedRows}
    WHERE id = ${id}
    RETURNING *;
  `;

  return result.rows[0];
}

/**
 * Delete upload batch
 */
export async function deleteUploadBatch(id: number): Promise<void> {
  await sql`
    DELETE FROM upload_batches
    WHERE id = ${id};
  `;
}

/**
 * Get batches by status
 */
export async function getBatchesByStatus(
  status: UploadBatch['status']
): Promise<UploadBatch[]> {
  const result = await sql<UploadBatch>`
    SELECT * FROM upload_batches
    WHERE status = ${status}
    ORDER BY created_at DESC;
  `;

  return result.rows;
}
