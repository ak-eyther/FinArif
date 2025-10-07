import { sql } from '@/lib/db';

export interface Provider {
  id: number;
  name: string;
  type: string | null;
  location: string | null;
  total_claims: number;
  total_volume_cents: number;
  avg_claim_value_cents: number;
  created_at: Date;
  updated_at: Date;
}

export async function getAllProviders(): Promise<Provider[]> {
  const { rows } = await sql`
    SELECT * FROM providers
    ORDER BY total_claims DESC;
  `;
  return rows as Provider[];
}

export async function getProviderById(id: number): Promise<Provider | null> {
  const { rows } = await sql`
    SELECT * FROM providers
    WHERE id = ${id};
  `;
  return rows[0] as Provider | null;
}

export async function searchProviders(query: string): Promise<Provider[]> {
  const { rows} = await sql`
    SELECT * FROM providers
    WHERE name ILIKE ${'%' + query + '%'}
    ORDER BY total_claims DESC;
  `;
  return rows as Provider[];
}

export async function createProvider(data: {
  name: string;
  type?: string;
  location?: string;
}): Promise<Provider> {
  const { rows } = await sql`
    INSERT INTO providers (name, type, location)
    VALUES (${data.name}, ${data.type || null}, ${data.location || null})
    RETURNING *;
  `;
  return rows[0] as Provider;
}

export async function updateProvider(
  id: number,
  data: Partial<Omit<Provider, 'id' | 'created_at' | 'updated_at'>>
): Promise<Provider | null> {
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
  if (data.location !== undefined) {
    updates.push(`location = $${values.length + 1}`);
    values.push(data.location);
  }
  
  if (updates.length === 0) {
    return getProviderById(id);
  }
  
  updates.push('updated_at = NOW()');
  values.push(id);
  
  const query = `
    UPDATE providers
    SET ${updates.join(', ')}
    WHERE id = $${values.length}
    RETURNING *;
  `;
  
  const { rows } = await sql.query(query, values);
  return rows[0] as Provider | null;
}

export async function deleteProvider(id: number): Promise<boolean> {
  const { rowCount } = await sql`
    DELETE FROM providers
    WHERE id = ${id};
  `;
  return (rowCount || 0) > 0;
}
