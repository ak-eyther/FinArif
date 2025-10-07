#!/bin/bash

# Database initialization script for Vercel Postgres
# Runs all SQL schema files in order

set -e  # Exit on any error

echo "🗄️  Initializing FinArif Database..."
echo ""

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Check if POSTGRES_URL is set
if [ -z "$POSTGRES_URL" ]; then
  echo "❌ Error: POSTGRES_URL not set"
  echo "Please set POSTGRES_URL in .env.local"
  exit 1
fi

echo "📦 Installing psql if needed..."
if ! command -v psql &> /dev/null; then
  echo "❌ psql not found. Please install PostgreSQL client:"
  echo "   brew install postgresql"
  exit 1
fi

echo "✅ psql found"
echo ""

# Remove quotes from POSTGRES_URL
DB_URL=$(echo $POSTGRES_URL | tr -d '"')

# Run schema files in order
SCHEMA_FILES=(
  "sql/schema/00_users.sql"
  "sql/schema/01_providers.sql"
  "sql/schema/02_payers.sql"
  "sql/schema/03_schemes.sql"
  "sql/schema/04_claims.sql"
  "sql/schema/05_upload_batches.sql"
  "sql/schema/06_column_mappings.sql"
  "sql/schema/07_provider_analytics_cache.sql"
  "sql/schema/08_payer_analytics_cache.sql"
  "sql/schema/09_scheme_analytics_cache.sql"
)

echo "📝 Running migrations..."
echo ""

for schema_file in "${SCHEMA_FILES[@]}"; do
  if [ -f "$schema_file" ]; then
    echo "⚙️  Executing: $schema_file"
    psql "$DB_URL" -f "$schema_file"
    echo "✅ Completed: $schema_file"
    echo ""
  else
    echo "⚠️  Warning: $schema_file not found, skipping..."
  fi
done

echo ""
echo "🎉 Database initialization complete!"
echo ""
echo "📊 Verifying tables..."
psql "$DB_URL" -c "\dt"
echo ""
echo "✅ All done! Your database is ready."
