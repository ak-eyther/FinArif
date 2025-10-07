/**
 * Migration script for column_mappings table
 * Run this script to create the column_mappings table and indexes
 *
 * Usage:
 *   npx tsx scripts/migrate-mappings.ts
 */

import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  try {
    console.log('Starting column_mappings migration...');

    // Read the SQL schema file
    const schemaPath = join(process.cwd(), 'sql/schema/06_column_mappings.sql');
    const schemaSql = readFileSync(schemaPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = schemaSql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 60)}...`);
      await sql.query(statement);
      console.log('✓ Success');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nCreated:');
    console.log('  - Table: column_mappings');
    console.log('  - Index: idx_mappings_batch');
    console.log('  - Index: idx_mappings_schema_field');
    console.log('  - Index: idx_mappings_unique (unique constraint)');

    // Verify table was created
    const result = await sql`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'column_mappings'
      ORDER BY ordinal_position;
    `;

    console.log('\nTable structure:');
    result.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run migration
runMigration();
