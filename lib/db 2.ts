/**
 * Database connection module
 * Uses Vercel Postgres for serverless SQL queries
 *
 * CRITICAL: Always use parameterized queries with the sql template tag
 * to prevent SQL injection attacks.
 *
 * @example
 * ```typescript
 * import { sql } from '@/lib/db';
 *
 * const { rows } = await sql`SELECT * FROM providers WHERE id = ${id};`;
 * ```
 */

import { sql } from '@vercel/postgres';

export { sql };
