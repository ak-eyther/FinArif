/**
 * Database initialization script for Vercel Postgres
 * Runs all SQL schema files in order
 */

import { config } from 'dotenv';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

const SCHEMA_FILES = [
  '00_users.sql',
  '01_providers.sql',
  '02_payers.sql',
  '03_schemes.sql',
  '04_claims.sql',
  '05_upload_batches.sql',
  '06_column_mappings.sql',
  '07_provider_analytics_cache.sql',
  '08_payer_analytics_cache.sql',
  '09_scheme_analytics_cache.sql',
];

async function initDatabase() {
  console.log('🗄️  Initializing FinArif Database...\n');

  // Check environment variable - use NON_POOLING for direct connection
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Error: POSTGRES_URL not set in environment');
    console.error('Please set POSTGRES_URL in .env.local');
    process.exit(1);
  }

  // Remove quotes if present
  const cleanUrl = connectionString.replace(/^["']|["']$/g, '');

  const client = new Client({
    connectionString: cleanUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();

  console.log('✅ Database connection configured\n');
  console.log('📝 Running migrations...\n');

  for (const filename of SCHEMA_FILES) {
    const filePath = path.join(process.cwd(), 'sql', 'schema', filename);

    try {
      console.log(`⚙️  Executing: ${filename}`);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Warning: ${filename} not found, skipping...\n`);
        continue;
      }

      const sqlContent = fs.readFileSync(filePath, 'utf-8');

      // Execute the SQL
      await client.query(sqlContent);

      console.log(`✅ Completed: ${filename}\n`);
    } catch (error: any) {
      console.error(`❌ Error in ${filename}:`, error.message);

      // Continue with other files even if one fails
      // (likely means table already exists)
      if (error.message.includes('already exists')) {
        console.log(`ℹ️  Table already exists, continuing...\n`);
      } else {
        throw error;
      }
    }
  }

  console.log('🎉 Database initialization complete!\n');
  console.log('📊 Verifying tables...');

  // List all tables
  const result = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log('\n✅ Tables in database:');
  result.rows.forEach((row: any) => {
    console.log(`   - ${row.table_name}`);
  });

  await client.end();

  console.log('\n✅ All done! Your database is ready.');
  process.exit(0);
}

// Run the initialization
initDatabase().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
