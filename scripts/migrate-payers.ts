#!/usr/bin/env tsx

/**
 * Payers Table Migration Script
 *
 * Creates the payers table and indexes in Vercel Postgres.
 * Run this script to set up the payers schema.
 *
 * Usage:
 *   npx tsx scripts/migrate-payers.ts
 *
 * Environment:
 *   Requires POSTGRES_URL environment variable
 */

import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

async function migratePayers() {
  console.log('🚀 Starting payers migration...');

  try {
    // Read the SQL schema file
    const schemaPath = join(process.cwd(), 'sql', 'schema', '02_payers.sql');
    const schemaSql = readFileSync(schemaPath, 'utf-8');

    console.log('📄 Read schema from:', schemaPath);

    // Split SQL commands (handle multiple statements)
    const statements = schemaSql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('COMMENT'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (const statement of statements) {
      console.log(`   ▶ ${statement.substring(0, 60)}...`);
      await sql.query(statement);
    }

    console.log('✅ Payers table created successfully!');

    // Verify table was created
    const { rows } = await sql`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'payers'
      ORDER BY ordinal_position;
    `;

    console.log('\n📋 Table structure:');
    rows.forEach((row) => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });

    // Check indexes
    const { rows: indexes } = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'payers';
    `;

    console.log('\n🔍 Indexes:');
    indexes.forEach((idx) => {
      console.log(`   - ${idx.indexname}`);
    });

    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await sql.end();
  }
}

// Run migration
migratePayers();
