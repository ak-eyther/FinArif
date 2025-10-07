/**
 * Provider Database Queries
 * All SQL queries for Provider CRUD operations
 *
 * Security: All queries use parameterized statements to prevent SQL injection
 * Money: All amounts stored in cents (integers)
 */

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

export interface CreateProviderData {
  name: string;
  type?: string;
  location?: string;
  total_claims?: number;
  total_volume_cents?: number;
  avg_claim_value_cents?: number;
}

export interface UpdateProviderData {
  name?: string;
  type?: string;
  location?: string;
  total_claims?: number;
  total_volume_cents?: number;
  avg_claim_value_cents?: number;
}

/**
 * Get all providers sorted by total claims (descending)
 */
export async function getAllProviders(): Promise<Provider[]> {
  const { rows } = await sql<Provider>`
    SELECT 
      id, 
      name, 
      type, 
      location, 
      total_claims, 
      total_volume_cents, 
      avg_claim_value_cents,
      created_at,
      updated_at
    FROM providers
    ORDER BY total_claims DESC;
  `;
  
  return rows;
}

/**
 * Get a single provider by ID
 */
export async function getProviderById(id: number): Promise<Provider | null> {
  const { rows } = await sql<Provider>`
    SELECT 
      id, 
      name, 
      type, 
      location, 
      total_claims, 
      total_volume_cents, 
      avg_claim_value_cents,
      created_at,
      updated_at
    FROM providers
    WHERE id = ${id};
  `;
  
  return rows[0] || null;
}

/**
 * Create a new provider
 */
export async function createProvider(data: CreateProviderData): Promise<Provider> {
  const {
    name,
    type = null,
    location = null,
    total_claims = 0,
    total_volume_cents = 0,
    avg_claim_value_cents = 0,
  } = data;

  const { rows } = await sql<Provider>`
    INSERT INTO providers (
      name, 
      type, 
      location, 
      total_claims, 
      total_volume_cents, 
      avg_claim_value_cents,
      created_at,
      updated_at
    )
    VALUES (
      ${name}, 
      ${type}, 
      ${location}, 
      ${total_claims}, 
      ${total_volume_cents}, 
      ${avg_claim_value_cents},
      NOW(),
      NOW()
    )
    RETURNING 
      id, 
      name, 
      type, 
      location, 
      total_claims, 
      total_volume_cents, 
      avg_claim_value_cents,
      created_at,
      updated_at;
  `;

  return rows[0];
}

/**
 * Update a provider by ID
 */
export async function updateProvider(
  id: number,
  data: UpdateProviderData
): Promise<Provider | null> {
  // Build dynamic update query based on provided fields
  const updateFields: string[] = [];
  const values: (string | number | null)[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    updateFields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.type !== undefined) {
    updateFields.push(`type = $${paramIndex++}`);
    values.push(data.type);
  }
  if (data.location !== undefined) {
    updateFields.push(`location = $${paramIndex++}`);
    values.push(data.location);
  }
  if (data.total_claims !== undefined) {
    updateFields.push(`total_claims = $${paramIndex++}`);
    values.push(data.total_claims);
  }
  if (data.total_volume_cents !== undefined) {
    updateFields.push(`total_volume_cents = $${paramIndex++}`);
    values.push(data.total_volume_cents);
  }
  if (data.avg_claim_value_cents !== undefined) {
    updateFields.push(`avg_claim_value_cents = $${paramIndex++}`);
    values.push(data.avg_claim_value_cents);
  }

  if (updateFields.length === 0) {
    // No fields to update, return current provider
    return getProviderById(id);
  }

  updateFields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE providers
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING 
      id, 
      name, 
      type, 
      location, 
      total_claims, 
      total_volume_cents, 
      avg_claim_value_cents,
      created_at,
      updated_at;
  `;

  const { rows } = await sql.query<Provider>(query, values);

  return rows[0] || null;
}

/**
 * Delete a provider by ID
 */
export async function deleteProvider(id: number): Promise<boolean> {
  const { rowCount } = await sql`
    DELETE FROM providers
    WHERE id = ${id};
  `;

  return (rowCount ?? 0) > 0;
}

/**
 * Search providers by name (case-insensitive)
 */
export async function searchProviders(query: string): Promise<Provider[]> {
  const searchTerm = `%${query}%`;
  
  const { rows } = await sql<Provider>`
    SELECT 
      id, 
      name, 
      type, 
      location, 
      total_claims, 
      total_volume_cents, 
      avg_claim_value_cents,
      created_at,
      updated_at
    FROM providers
    WHERE name ILIKE ${searchTerm}
    ORDER BY total_claims DESC;
  `;

  return rows;
}
