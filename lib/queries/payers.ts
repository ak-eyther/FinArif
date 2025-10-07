import { sql } from '@/lib/db';

export interface Payer {
  id: number;
  name: string;
  type: string | null;
  total_claims: number;
  total_volume_cents: number;
  avg_claim_value_cents: number;
  created_at: Date;
  updated_at: Date;
}

export async function getAllPayers(): Promise<Payer[]> {
  const { rows } = await sql`
    SELECT * FROM payers
    ORDER BY total_claims DESC;
  `;
  return rows as Payer[];
}

export async function getPayerById(id: number): Promise<Payer | null> {
  const { rows } = await sql`
    SELECT * FROM payers
    WHERE id = ${id};
  `;
  return rows[0] as Payer | null;
}

export async function searchPayers(query: string): Promise<Payer[]> {
  const { rows } = await sql`
    SELECT * FROM payers
    WHERE name ILIKE ${'%' + query + '%'}
    ORDER BY total_claims DESC;
  `;
  return rows as Payer[];
}

export async function createPayer(data: {
  name: string;
  type?: string;
}): Promise<Payer> {
  const { rows } = await sql`
    INSERT INTO payers (name, type)
    VALUES (${data.name}, ${data.type || null})
    RETURNING *;
  `;
  return rows[0] as Payer;
}

export async function updatePayer(
  id: number,
  data: Partial<Omit<Payer, 'id' | 'created_at' | 'updated_at'>>
): Promise<Payer | null> {
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.name !== undefined) {
    updates.push(`name = $${values.length + 1}`);
    values.push(data.name);
  }
  if (data.type !== undefined) {
    updates.push(`type = $${values.length + 1}`);
    values.push(data.type);
  }
  
  if (updates.length === 0) {
    return getPayerById(id);
  }
  
  updates.push('updated_at = NOW()');
  values.push(id);
  
  const query = `
    UPDATE payers
    SET ${updates.join(', ')}
    WHERE id = $${values.length}
    RETURNING *;
  `;
  
  const { rows } = await sql.query(query, values);
  return rows[0] as Payer | null;
}

export async function deletePayer(id: number): Promise<boolean> {
  const { rowCount } = await sql`
    DELETE FROM payers
    WHERE id = ${id};
  `;
  return (rowCount || 0) > 0;
}
