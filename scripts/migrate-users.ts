import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Migration script for users table and admin seed
 * Run with: npx tsx scripts/migrate-users.ts
 */
async function runMigration(): Promise<void> {
  console.log('Starting users table migration...');

  try {
    const schemaPath = path.join(process.cwd(), 'sql', 'schema', '00_users.sql');
    console.log(`Reading schema from: ${schemaPath}`);

    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    const statements = schemaSQL
      .split(';')
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0 && !statement.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let index = 0; index < statements.length; index += 1) {
      const statement = statements[index];
      console.log(`\nExecuting statement ${index + 1}/${statements.length}...`);

      try {
        await sql.query(statement);
        console.log('Success!');
      } catch (error) {
        console.error(`Error executing statement ${index + 1}:`, error);
        throw error;
      }
    }

    console.log('\nVerifying table creation...');

    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'users'
      ) AS table_exists;
    `;

    if (!tableCheck.rows[0]?.table_exists) {
      console.error('Table verification failed!');
      process.exit(1);
    }

    console.log('Table "users" ready.');

    const adminCheck = await sql`
      SELECT email, role
      FROM users
      WHERE email = 'admin@finarif.com';
    `;

    if (adminCheck.rows.length === 0) {
      console.error('Admin user seed missing!');
      process.exit(1);
    }

    console.log('Admin user present with role:', adminCheck.rows[0]?.role);
    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
  }
}

runMigration()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFatal error:', error);
    process.exit(1);
  });
