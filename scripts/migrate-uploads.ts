import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Migration script for upload_batches table
 * Run with: npx tsx scripts/migrate-uploads.ts
 */

async function runMigration() {
  console.log('Starting upload_batches migration...');

  try {
    // Read the SQL schema file
    const schemaPath = path.join(
      process.cwd(),
      'sql',
      'schema',
      '05_upload_batches.sql'
    );

    console.log(`Reading schema from: ${schemaPath}`);

    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    // Split by semicolons to execute each statement separately
    const statements = schemaSQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);

      try {
        await sql.query(statement);
        console.log('Success!');
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        throw error;
      }
    }

    // Verify the table was created
    console.log('\nVerifying table creation...');

    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'upload_batches'
      ) as table_exists;
    `;

    const tableExists = result.rows[0]?.table_exists;

    if (tableExists) {
      console.log('Table "upload_batches" created successfully!');

      // Check indexes
      const indexResult = await sql`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'upload_batches';
      `;

      console.log('\nIndexes created:');
      indexResult.rows.forEach((row) => {
        console.log(`  - ${row.indexname}`);
      });
    } else {
      console.error('Table verification failed!');
      process.exit(1);
    }

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFatal error:', error);
    process.exit(1);
  });
