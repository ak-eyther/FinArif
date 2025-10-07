/**
 * Provider table migration script
 *
 * Run this script to create the providers table in Vercel Postgres
 * Usage: npx tsx scripts/migrate-providers.ts
 */

import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  console.log('Starting provider table migration...');

  try {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'sql/schema/01_providers.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split by semicolon to get individual statements
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      await sql.query(statement);
    }

    console.log('✓ Providers table created successfully');
    console.log('✓ Indexes created successfully');

    // Optionally seed some test data
    const seedData = await seedProviders();
    if (seedData) {
      console.log(`✓ Seeded ${seedData} test providers`);
    }

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

async function seedProviders(): Promise<number> {
  try {
    // Check if table already has data
    const { rows } = await sql`SELECT COUNT(*) as count FROM providers`;
    const count = parseInt(rows[0].count);

    if (count > 0) {
      console.log(`Table already has ${count} providers, skipping seed`);
      return 0;
    }

    // Sample providers for testing
    const testProviders = [
      {
        name: 'Nairobi Hospital',
        type: 'Hospital',
        location: 'Nairobi, Kenya',
      },
      {
        name: 'Aga Khan University Hospital',
        type: 'Hospital',
        location: 'Nairobi, Kenya',
      },
      {
        name: 'Gertrudes Children\'s Hospital',
        type: 'Hospital',
        location: 'Nairobi, Kenya',
      },
      {
        name: 'MP Shah Hospital',
        type: 'Hospital',
        location: 'Nairobi, Kenya',
      },
      {
        name: 'Kenyatta National Hospital',
        type: 'Hospital',
        location: 'Nairobi, Kenya',
      },
      {
        name: 'City Pharmacy',
        type: 'Pharmacy',
        location: 'Nairobi, Kenya',
      },
      {
        name: 'Westlands Medical Centre',
        type: 'Clinic',
        location: 'Nairobi, Kenya',
      },
      {
        name: 'Pathologists Lancet Kenya',
        type: 'Lab',
        location: 'Nairobi, Kenya',
      },
    ];

    for (const provider of testProviders) {
      await sql`
        INSERT INTO providers (name, type, location)
        VALUES (${provider.name}, ${provider.type}, ${provider.location})
      `;
    }

    return testProviders.length;
  } catch (error) {
    console.error('Seeding failed:', error);
    return 0;
  }
}

// Run migration
runMigration();
