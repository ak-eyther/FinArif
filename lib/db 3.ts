/**
 * Vercel Postgres database connection
 *
 * This module exports the sql client for direct database queries.
 * All queries should use parameterized statements to prevent SQL injection.
 */

import { sql } from '@vercel/postgres';

export { sql };
