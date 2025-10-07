/**
 * Database Migration Script
 *
 * Runs all SQL schema files in order to set up the database.
 * This should be run after setting up Vercel Postgres.
 */

import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

const SCHEMA_DIR = path.join(__dirname, '..', 'sql', 'schema');

interface MigrationFile {
  name: string;
  path: string;
  order: number;
}

/**
 * Get all SQL schema files in order
 */
function getSQLFiles(): MigrationFile[] {
  const files = fs.readdirSync(SCHEMA_DIR);

  return files
    .filter(file => file.endsWith('.sql'))
    .map(file => {
      const match = file.match(/^(\d+)_/);
      const order = match ? parseInt(match[1], 10) : 999;

      return {
        name: file,
        path: path.join(SCHEMA_DIR, file),
        order,
      };
    })
    .sort((a, b) => a.order - b.order);
}

/**
 * Run a single migration file
 */
async function runMigration(migration: MigrationFile): Promise<void> {
  console.log(`Running migration: ${migration.name}`);

  try {
    const sqlContent = fs.readFileSync(migration.path, 'utf-8');

    // Split by semicolons to handle multiple statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      await sql.query(statement);
    }

    console.log(`✓ Successfully ran ${migration.name}`);
  } catch (error) {
    console.error(`✗ Error running ${migration.name}:`, error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('Starting database migrations...\n');

  try {
    const migrations = getSQLFiles();
    console.log(`Found ${migrations.length} migration files\n`);

    for (const migration of migrations) {
      await runMigration(migration);
    }

    console.log('\n✓ All migrations completed successfully!');
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Check database connection
 */
async function checkConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1 as test`;
    console.log('✓ Database connection successful\n');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('===================================');
  console.log('  Provider 360 Database Migration  ');
  console.log('===================================\n');

  // Check connection
  const connected = await checkConnection();
  if (!connected) {
    console.error('Please check your database configuration.');
    process.exit(1);
  }

  // Run migrations
  await migrate();
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\nMigration complete. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nFatal error:', error);
      process.exit(1);
    });
}

export { migrate, runMigration, getSQLFiles };
