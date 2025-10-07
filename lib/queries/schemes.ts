import { sql } from '@/lib/db';

export interface Scheme {
  id: number;
  payer_id: number;
  name: string;
  scheme_code: string | null;
  total_claims: number;
  total_volume_cents: number;
  avg_claim_value_cents: number;
  created_at: Date;
  updated_at: Date;
  payer_name?: string; // From JOIN
}

export async function getAllSchemes(): Promise<Scheme[]> {
  const { rows } = await sql`
    SELECT s.*, p.name as payer_name
    FROM schemes s
    LEFT JOIN payers p ON s.payer_id = p.id
    ORDER BY s.total_claims DESC;
  `;
  return rows as Scheme[];
}

export async function getSchemeById(id: number): Promise<Scheme | null> {
  const { rows } = await sql`
    SELECT s.*, p.name as payer_name
    FROM schemes s
    LEFT JOIN payers p ON s.payer_id = p.id
    WHERE s.id = ${id};
  `;
  return rows[0] as Scheme | null;
}

export async function getSchemesByPayerId(payerId: number): Promise<Scheme[]> {
  const { rows } = await sql`
    SELECT s.*, p.name as payer_name
    FROM schemes s
    LEFT JOIN payers p ON s.payer_id = p.id
    WHERE s.payer_id = ${payerId}
    ORDER BY s.total_claims DESC;
  `;
  return rows as Scheme[];
}

export async function searchSchemes(query: string): Promise<Scheme[]> {
  const { rows } = await sql`
    SELECT s.*, p.name as payer_name
    FROM schemes s
    LEFT JOIN payers p ON s.payer_id = p.id
    WHERE s.name ILIKE ${'%' + query + '%'}
       OR p.name ILIKE ${'%' + query + '%'}
    ORDER BY s.total_claims DESC;
  `;
  return rows as Scheme[];
}

export async function createScheme(data: {
  payer_id: number;
  name: string;
  scheme_code?: string;
}): Promise<Scheme> {
  const { rows } = await sql`
    INSERT INTO schemes (payer_id, name, scheme_code)
    VALUES (${data.payer_id}, ${data.name}, ${data.scheme_code || null})
    RETURNING *;
  `;
  return rows[0] as Scheme;
}

export async function updateScheme(
  id: number,
  data: Partial<Omit<Scheme, 'id' | 'created_at' | 'updated_at'>>
): Promise<Scheme | null> {
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.name !== undefined) {
    updates.push(`name = $${values.length + 1}`);
    values.push(data.name);
  }
  if (data.scheme_code !== undefined) {
    updates.push(`scheme_code = $${values.length + 1}`);
    values.push(data.scheme_code);
  }
  if (data.payer_id !== undefined) {
    updates.push(`payer_id = $${values.length + 1}`);
    values.push(data.payer_id);
  }
  
  if (updates.length === 0) {
    return getSchemeById(id);
  }
  
  updates.push('updated_at = NOW()');
  values.push(id);
  
  const query = `
    UPDATE schemes
    SET ${updates.join(', ')}
    WHERE id = $${values.length}
    RETURNING *;
  `;
  
  const { rows } = await sql.query(query, values);
  return rows[0] as Scheme | null;
}

export async function deleteScheme(id: number): Promise<boolean> {
  const { rowCount } = await sql`
    DELETE FROM schemes
    WHERE id = ${id};
  `;
  return (rowCount || 0) > 0;
}
