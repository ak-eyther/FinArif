# 🤖 AGENT CONTEXT MASTER DOCUMENT
## Provider 360° Analytics - Multi-Agent Build
**Version:** 1.0
**Date:** October 2025
**Backend:** Vercel Postgres (switched from Supabase)
**Context Handoff Threshold:** 70% token usage
**Maximum Context:** 80% before mandatory handoff

---

## 🎯 PROJECT OVERVIEW

### Mission
Build a complete Provider 360° Analytics module with Excel upload, manual mapping, and comprehensive analytics pages for Providers, Payers, and Schemes.

### Tech Stack
- **Frontend:** Next.js 14, React, TypeScript, shadcn/ui, Recharts
- **Backend:** Vercel Postgres (NOT Supabase)
- **Database:** PostgreSQL via `@vercel/postgres`
- **Deployment:** Vercel
- **Current Dashboard:** `/finarif-dashboard` (existing MVP)

### Key Requirements
1. **Backend:** Vercel Postgres ONLY (no Supabase)
2. **Excel Upload:** 14-column structure from real Vitraya file
3. **Manual Mapping:** UI for mapping Excel columns to schema
4. **Hyperlinks:** Provider → Payer → Scheme navigation
5. **Analytics:** 360° views for all three entities
6. **Historical Data:** Support 10K+ claims
7. **Parallel Build:** 9 agents with dependency management
8. **Context Management:** Handoff at 70%, mandatory at 80%

---

## 📊 VERCEL POSTGRES SCHEMA

### Database Connection
```typescript
// lib/db.ts
import { sql } from '@vercel/postgres';

// Direct SQL queries - no ORM
export { sql };
```

### Core Tables (9 Total)

#### 1. `providers`
```sql
CREATE TABLE providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(100), -- Hospital, Clinic, Pharmacy, Lab
  location VARCHAR(255),
  total_claims INTEGER DEFAULT 0,
  total_volume_cents BIGINT DEFAULT 0,
  avg_claim_value_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_providers_name ON providers(name);
CREATE INDEX idx_providers_type ON providers(type);
```

#### 2. `payers`
```sql
CREATE TABLE payers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(100), -- Insurance, Corporate, Government
  total_claims INTEGER DEFAULT 0,
  total_volume_cents BIGINT DEFAULT 0,
  avg_claim_value_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payers_name ON payers(name);
```

#### 3. `schemes`
```sql
CREATE TABLE schemes (
  id SERIAL PRIMARY KEY,
  payer_id INTEGER REFERENCES payers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  scheme_code VARCHAR(100),
  total_claims INTEGER DEFAULT 0,
  total_volume_cents BIGINT DEFAULT 0,
  avg_claim_value_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(payer_id, name)
);

CREATE INDEX idx_schemes_payer_id ON schemes(payer_id);
CREATE INDEX idx_schemes_name ON schemes(name);
```

#### 4. `claims`
```sql
CREATE TABLE claims (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES providers(id) ON DELETE CASCADE,
  payer_id INTEGER REFERENCES payers(id) ON DELETE CASCADE,
  scheme_id INTEGER REFERENCES schemes(id) ON DELETE SET NULL,

  -- Excel mapped fields
  claim_number VARCHAR(100) UNIQUE,
  member_number VARCHAR(100),
  patient_name VARCHAR(255),
  provider_name VARCHAR(255), -- Denormalized for display
  payer_name VARCHAR(255), -- Denormalized for display
  scheme_name VARCHAR(255), -- Denormalized for display
  service_date DATE,
  claim_date DATE,
  invoice_amount_cents INTEGER NOT NULL,
  approved_amount_cents INTEGER,
  status VARCHAR(50), -- Pending, Approved, Rejected
  diagnosis_code VARCHAR(50),
  procedure_code VARCHAR(50),

  -- Metadata
  upload_batch_id INTEGER REFERENCES upload_batches(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_claims_provider ON claims(provider_id);
CREATE INDEX idx_claims_payer ON claims(payer_id);
CREATE INDEX idx_claims_scheme ON claims(scheme_id);
CREATE INDEX idx_claims_service_date ON claims(service_date);
CREATE INDEX idx_claims_batch ON claims(upload_batch_id);
```

#### 5. `upload_batches`
```sql
CREATE TABLE upload_batches (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  uploaded_by VARCHAR(255), -- User email
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  error_log TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_batches_status ON upload_batches(status);
CREATE INDEX idx_batches_created ON upload_batches(created_at DESC);
```

#### 6. `column_mappings`
```sql
CREATE TABLE column_mappings (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER REFERENCES upload_batches(id) ON DELETE CASCADE,
  excel_column VARCHAR(255) NOT NULL, -- Original Excel header
  schema_field VARCHAR(255) NOT NULL, -- Target database field
  data_type VARCHAR(50), -- string, integer, date, decimal
  transform_rule TEXT, -- JSON: {"type": "date_format", "from": "DD/MM/YYYY", "to": "YYYY-MM-DD"}
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mappings_batch ON column_mappings(batch_id);
```

#### 7. `provider_analytics_cache`
```sql
CREATE TABLE provider_analytics_cache (
  provider_id INTEGER PRIMARY KEY REFERENCES providers(id) ON DELETE CASCADE,

  -- Claims volume
  total_claims INTEGER DEFAULT 0,
  total_invoice_cents BIGINT DEFAULT 0,
  total_approved_cents BIGINT DEFAULT 0,
  approval_rate DECIMAL(5,2) DEFAULT 0, -- Percentage

  -- Payer breakdown (JSON)
  top_payers JSONB, -- [{"payer_id": 1, "name": "AAR", "claims": 50, "volume_cents": 500000}]
  top_schemes JSONB,

  -- Trends (JSON)
  monthly_trends JSONB, -- [{"month": "2025-01", "claims": 20, "volume_cents": 200000}]

  last_updated TIMESTAMP DEFAULT NOW()
);
```

#### 8. `payer_analytics_cache`
```sql
CREATE TABLE payer_analytics_cache (
  payer_id INTEGER PRIMARY KEY REFERENCES payers(id) ON DELETE CASCADE,

  -- Claims volume
  total_claims INTEGER DEFAULT 0,
  total_invoice_cents BIGINT DEFAULT 0,
  total_approved_cents BIGINT DEFAULT 0,
  approval_rate DECIMAL(5,2) DEFAULT 0,

  -- Provider breakdown
  top_providers JSONB,
  top_schemes JSONB,

  -- Trends
  monthly_trends JSONB,

  last_updated TIMESTAMP DEFAULT NOW()
);
```

#### 9. `scheme_analytics_cache`
```sql
CREATE TABLE scheme_analytics_cache (
  scheme_id INTEGER PRIMARY KEY REFERENCES schemes(id) ON DELETE CASCADE,

  -- Claims volume
  total_claims INTEGER DEFAULT 0,
  total_invoice_cents BIGINT DEFAULT 0,
  total_approved_cents BIGINT DEFAULT 0,
  approval_rate DECIMAL(5,2) DEFAULT 0,

  -- Provider breakdown
  top_providers JSONB,

  -- Trends
  monthly_trends JSONB,

  last_updated TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 VERCEL POSTGRES PATTERNS

### 1. Database Migration Pattern
```typescript
// scripts/migrate.ts
import { sql } from '@vercel/postgres';

export async function runMigrations() {
  // Read SQL files and execute
  await sql`CREATE TABLE IF NOT EXISTS providers (...);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_providers_name ON providers(name);`;
  // etc.
}
```

### 2. Query Pattern (NO ORM)
```typescript
// app/api/providers/route.ts
import { sql } from '@vercel/postgres';

export async function GET() {
  const { rows } = await sql`
    SELECT id, name, type, total_claims, total_volume_cents
    FROM providers
    ORDER BY total_claims DESC
    LIMIT 50;
  `;

  return Response.json(rows);
}
```

### 3. Parameterized Queries
```typescript
// ALWAYS use parameterized queries to prevent SQL injection
const providerId = 123;
const { rows } = await sql`
  SELECT * FROM claims
  WHERE provider_id = ${providerId}
  ORDER BY service_date DESC;
`;
```

### 4. Transactions
```typescript
import { db } from '@vercel/postgres';

const client = await db.connect();
try {
  await client.query('BEGIN');

  await client.query('INSERT INTO providers ...');
  await client.query('INSERT INTO claims ...');

  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

---

## 📁 PROJECT STRUCTURE

```
finarif-dashboard/
├── app/
│   ├── api/
│   │   ├── providers/
│   │   │   ├── route.ts              # GET /api/providers (list)
│   │   │   └── [id]/
│   │   │       ├── route.ts          # GET /api/providers/:id
│   │   │       ├── analytics/route.ts
│   │   │       └── claims/route.ts
│   │   ├── payers/
│   │   │   ├── route.ts
│   │   │   └── [id]/...
│   │   ├── schemes/
│   │   │   ├── route.ts
│   │   │   └── [id]/...
│   │   ├── upload/
│   │   │   ├── preview/route.ts      # POST /api/upload/preview
│   │   │   ├── mapping/route.ts      # POST /api/upload/mapping
│   │   │   └── process/route.ts      # POST /api/upload/process
│   │   └── analytics/
│   │       └── refresh/route.ts      # POST /api/analytics/refresh
│   ├── providers/
│   │   ├── page.tsx                  # List page
│   │   └── [id]/page.tsx             # Detail page
│   ├── payers/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── schemes/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── upload/
│       ├── page.tsx                  # Upload wizard
│       └── mapping/page.tsx          # Mapping UI
├── components/
│   ├── providers/
│   │   ├── ProviderCard.tsx
│   │   ├── ProviderAnalytics.tsx
│   │   └── ProviderClaimsTable.tsx
│   ├── payers/
│   │   └── ...
│   ├── schemes/
│   │   └── ...
│   └── upload/
│       ├── ExcelUpload.tsx
│       ├── ColumnMapper.tsx
│       └── MappingPreview.tsx
├── lib/
│   ├── db.ts                         # Vercel Postgres connection
│   ├── queries/
│   │   ├── providers.ts              # Provider SQL queries
│   │   ├── payers.ts
│   │   ├── schemes.ts
│   │   └── claims.ts
│   └── utils/
│       ├── excel-parser.ts           # Parse Excel to JSON
│       ├── analytics-calculator.ts   # Calculate metrics
│       └── data-validator.ts         # Validate claims data
├── scripts/
│   ├── migrate.ts                    # Run DB migrations
│   └── seed.ts                       # Seed test data
└── sql/
    ├── schema/
    │   ├── 01_providers.sql
    │   ├── 02_payers.sql
    │   ├── 03_schemes.sql
    │   ├── 04_claims.sql
    │   └── ...
    └── migrations/
        └── ...
```

---

## 🌳 GIT BRANCHING STRATEGY

### Branch Structure
```
main (production)
├── develop (integration)
│   ├── feature/provider-crud          # Agent 1
│   ├── feature/payer-crud             # Agent 2
│   ├── feature/scheme-crud            # Agent 3
│   ├── feature/excel-upload           # Agent 4
│   ├── feature/column-mapping         # Agent 5
│   ├── feature/claims-processor       # Agent 6
│   ├── feature/provider-analytics     # Agent 7
│   ├── feature/payer-analytics        # Agent 8
│   └── feature/scheme-analytics       # Agent 9
```

### Merge Rules
1. **Wave 1 → develop:** Merge independently (no dependencies)
2. **Wave 2 → develop:** Merge after Wave 1 complete
3. **Wave 3 → develop:** Merge after Wave 2 complete
4. **develop → main:** Merge after all features tested

### Branch Commands
```bash
# Wave 1 (parallel)
git checkout -b feature/provider-crud develop
git checkout -b feature/payer-crud develop
git checkout -b feature/scheme-crud develop

# Wave 2 (after Wave 1 merged)
git checkout -b feature/excel-upload develop
git checkout -b feature/column-mapping develop
git checkout -b feature/claims-processor develop

# Wave 3 (after Wave 2 merged)
git checkout -b feature/provider-analytics develop
git checkout -b feature/payer-analytics develop
git checkout -b feature/scheme-analytics develop
```

---

## 🤖 AGENT DEPENDENCY GRAPH

### Wave 1: Foundation (Parallel - No Dependencies)
```
┌─────────────────────┐
│ Agent 1: Provider   │ ─┐
│ CRUD + Pages        │  │
└─────────────────────┘  │
                         │
┌─────────────────────┐  │
│ Agent 2: Payer      │  ├──▶ All merge to develop
│ CRUD + Pages        │  │
└─────────────────────┘  │
                         │
┌─────────────────────┐  │
│ Agent 3: Scheme     │  │
│ CRUD + Pages        │ ─┘
└─────────────────────┘
```

**Can Start:** Immediately
**Dependencies:** None
**Duration:** 8-12 hours each

### Wave 2: Upload & Processing (Parallel - Depends on Wave 1)
```
┌─────────────────────┐
│ Agent 4: Excel      │ ─┐
│ Upload + Preview    │  │
└─────────────────────┘  │
                         │
┌─────────────────────┐  │
│ Agent 5: Column     │  ├──▶ All merge to develop
│ Mapping UI          │  │
└─────────────────────┘  │
                         │
┌─────────────────────┐  │
│ Agent 6: Claims     │  │
│ Processor + Batch   │ ─┘
└─────────────────────┘
```

**Can Start:** After Wave 1 merged to develop
**Dependencies:** Needs providers, payers, schemes tables
**Duration:** 12-16 hours each

### Wave 3: Analytics (Parallel - Depends on Wave 2)
```
┌─────────────────────┐
│ Agent 7: Provider   │ ─┐
│ 360° Analytics      │  │
└─────────────────────┘  │
                         │
┌─────────────────────┐  │
│ Agent 8: Payer      │  ├──▶ All merge to develop
│ 360° Analytics      │  │
└─────────────────────┘  │
                         │
┌─────────────────────┐  │
│ Agent 9: Scheme     │  │
│ 360° Analytics      │ ─┘
└─────────────────────┘
```

**Can Start:** After Wave 2 merged to develop
**Dependencies:** Needs claims table + upload working
**Duration:** 10-14 hours each

---

## 📝 AGENT TASK DEFINITIONS

### Agent 1: Provider CRUD + Pages
**Branch:** `feature/provider-crud`
**Files to Create:**
- `sql/schema/01_providers.sql`
- `lib/queries/providers.ts`
- `app/api/providers/route.ts`
- `app/api/providers/[id]/route.ts`
- `app/providers/page.tsx`
- `app/providers/[id]/page.tsx`
- `components/providers/ProviderCard.tsx`
- `components/providers/ProviderList.tsx`

**Tasks:**
1. Create `providers` table SQL schema
2. Create Vercel Postgres queries for CRUD
3. Build API routes (GET list, GET by ID, POST, PUT, DELETE)
4. Build Provider List page with shadcn/ui Table
5. Build Provider Detail page (basic view - analytics added later)
6. Add to sidebar navigation
7. Write unit tests
8. Commit and PR to develop

**Success Criteria:**
- Can create/read/update/delete providers
- List page shows all providers with search/filter
- Detail page shows provider info + placeholder for analytics
- No TypeScript errors
- All tests pass

---

### Agent 2: Payer CRUD + Pages
**Branch:** `feature/payer-crud`
**Files to Create:**
- `sql/schema/02_payers.sql`
- `lib/queries/payers.ts`
- `app/api/payers/route.ts`
- `app/api/payers/[id]/route.ts`
- `app/payers/page.tsx`
- `app/payers/[id]/page.tsx`
- `components/payers/PayerCard.tsx`
- `components/payers/PayerList.tsx`

**Tasks:**
1. Create `payers` table SQL schema
2. Create Vercel Postgres queries for CRUD
3. Build API routes (GET list, GET by ID, POST, PUT, DELETE)
4. Build Payer List page with shadcn/ui Table
5. Build Payer Detail page (basic view - analytics added later)
6. Add to sidebar navigation
7. Write unit tests
8. Commit and PR to develop

**Success Criteria:**
- Can create/read/update/delete payers
- List page shows all payers with search/filter
- Detail page shows payer info + placeholder for analytics
- No TypeScript errors
- All tests pass

---

### Agent 3: Scheme CRUD + Pages
**Branch:** `feature/scheme-crud`
**Files to Create:**
- `sql/schema/03_schemes.sql`
- `lib/queries/schemes.ts`
- `app/api/schemes/route.ts`
- `app/api/schemes/[id]/route.ts`
- `app/schemes/page.tsx`
- `app/schemes/[id]/page.tsx`
- `components/schemes/SchemeCard.tsx`
- `components/schemes/SchemeList.tsx`

**Tasks:**
1. Create `schemes` table SQL schema (with payer foreign key)
2. Create Vercel Postgres queries for CRUD
3. Build API routes (GET list, GET by ID, POST, PUT, DELETE)
4. Build Scheme List page with shadcn/ui Table
5. Build Scheme Detail page (basic view - analytics added later)
6. Add to sidebar navigation
7. Write unit tests
8. Commit and PR to develop

**Success Criteria:**
- Can create/read/update/delete schemes
- Schemes linked to payers correctly
- List page shows all schemes with payer name
- Detail page shows scheme info + placeholder for analytics
- No TypeScript errors
- All tests pass

---

### Agent 4: Excel Upload + Preview
**Branch:** `feature/excel-upload`
**Files to Create:**
- `sql/schema/05_upload_batches.sql`
- `lib/utils/excel-parser.ts`
- `lib/queries/uploads.ts`
- `app/api/upload/preview/route.ts`
- `app/upload/page.tsx`
- `components/upload/ExcelUpload.tsx`
- `components/upload/ExcelPreview.tsx`

**Tasks:**
1. Create `upload_batches` table SQL schema
2. Install `xlsx` package for Excel parsing
3. Build Excel parser utility (read 14 columns)
4. Build upload API endpoint (parse + save batch record)
5. Build upload page UI with drag-drop
6. Show preview of first 10 rows after upload
7. Detect Excel headers automatically
8. Write unit tests
9. Commit and PR to develop

**Excel Structure (14 Columns):**
1. Claim Number
2. Member Number
3. Patient Name
4. Provider Name
5. Payer Name
6. Scheme Name
7. Service Date
8. Claim Date
9. Invoice Amount
10. Approved Amount
11. Status
12. Diagnosis Code
13. Procedure Code
14. (Reserved/Custom)

**Success Criteria:**
- Can upload Excel file (.xlsx, .xls)
- Parser extracts all 14 columns correctly
- Batch record created in database
- Preview shows first 10 rows with headers
- Handles errors gracefully (invalid file, wrong format)
- No TypeScript errors
- All tests pass

---

### Agent 5: Column Mapping UI
**Branch:** `feature/column-mapping`
**Files to Create:**
- `sql/schema/06_column_mappings.sql`
- `lib/queries/mappings.ts`
- `app/api/upload/mapping/route.ts`
- `app/upload/mapping/page.tsx`
- `components/upload/ColumnMapper.tsx`
- `components/upload/MappingPreview.tsx`

**Tasks:**
1. Create `column_mappings` table SQL schema
2. Build mapping API endpoint (save mappings)
3. Build mapping UI:
   - Left column: Excel headers (auto-detected)
   - Right column: Schema field dropdowns
   - Preview: Show how data will transform
4. Add data type validation
5. Add transform rules (date formats, number formats)
6. Save mappings per batch
7. Write unit tests
8. Commit and PR to develop

**Mapping UI Example:**
```
Excel Column          →  Schema Field
────────────────────     ─────────────────
Claim No              →  claim_number
Member ID             →  member_number
Patient               →  patient_name
Hospital              →  provider_name
Insurer               →  payer_name
Plan                  →  scheme_name
Date of Service       →  service_date (transform: DD/MM/YYYY → YYYY-MM-DD)
Invoiced              →  invoice_amount_cents (transform: KES → cents)
```

**Success Criteria:**
- Can map any Excel column to any schema field
- Dropdown shows all valid schema fields
- Preview shows transformed data
- Validation prevents duplicate mappings
- Can save/load mappings per batch
- No TypeScript errors
- All tests pass

---

### Agent 6: Claims Processor + Batch
**Branch:** `feature/claims-processor`
**Files to Create:**
- `sql/schema/04_claims.sql`
- `lib/queries/claims.ts`
- `lib/utils/data-validator.ts`
- `lib/utils/claims-processor.ts`
- `app/api/upload/process/route.ts`
- `app/upload/status/page.tsx`
- `components/upload/ProcessingStatus.tsx`

**Tasks:**
1. Create `claims` table SQL schema
2. Build data validator utility
3. Build claims processor:
   - Read batch + mappings
   - Transform Excel data per mapping rules
   - Lookup/create providers, payers, schemes
   - Insert claims in transaction
   - Update batch status
4. Build processing API endpoint
5. Build status page (show progress)
6. Handle errors (log failed rows)
7. Write unit tests
8. Commit and PR to develop

**Processing Flow:**
```
1. Load batch + mappings from DB
2. For each Excel row:
   a. Apply column mappings
   b. Validate data types
   c. Lookup provider (create if missing)
   d. Lookup payer (create if missing)
   e. Lookup scheme (create if missing)
   f. Insert claim with foreign keys
3. Update batch: processed_rows++
4. On error: Log to error_log, failed_rows++
5. Complete: Set batch status = 'completed'
```

**Success Criteria:**
- Can process 1000+ claims without errors
- Auto-creates providers/payers/schemes if missing
- Handles duplicate claims gracefully
- Updates batch progress in real-time
- Error logging for failed rows
- Status page shows progress bar
- No TypeScript errors
- All tests pass

---

### Agent 7: Provider 360° Analytics
**Branch:** `feature/provider-analytics`
**Files to Create:**
- `sql/schema/07_provider_analytics_cache.sql`
- `lib/queries/provider-analytics.ts`
- `lib/utils/analytics-calculator.ts`
- `app/api/providers/[id]/analytics/route.ts`
- `app/api/analytics/refresh/route.ts`
- `components/providers/ProviderAnalytics.tsx`
- `components/providers/PayerBreakdownChart.tsx`
- `components/providers/TrendsChart.tsx`

**Tasks:**
1. Create `provider_analytics_cache` table
2. Build analytics calculator utility:
   - Total claims
   - Total invoice/approved amounts
   - Approval rate
   - Top payers (with volume)
   - Top schemes (with volume)
   - Monthly trends
3. Build analytics API endpoint
4. Build analytics UI components:
   - KPI cards (claims, volume, approval rate)
   - Payer breakdown bar chart
   - Scheme breakdown pie chart
   - Monthly trends line chart
   - Top payers table (clickable to payer detail)
5. Add cache refresh logic
6. Update Provider Detail page with analytics
7. Write unit tests
8. Commit and PR to develop

**Analytics Displayed:**
- Total Claims: 234
- Total Invoice: KES 12,345,678
- Total Approved: KES 11,234,567
- Approval Rate: 91%
- Top Payers: [Bar chart]
- Top Schemes: [Pie chart]
- Monthly Trends: [Line chart]
- Top Payers Table: [Clickable rows → payer detail]

**Success Criteria:**
- All analytics calculated correctly
- Charts render with Recharts
- Cache updates when claims added
- Hyperlinks work (payer name → payer detail)
- No TypeScript errors
- All tests pass

---

### Agent 8: Payer 360° Analytics
**Branch:** `feature/payer-analytics`
**Files to Create:**
- `sql/schema/08_payer_analytics_cache.sql`
- `lib/queries/payer-analytics.ts`
- `app/api/payers/[id]/analytics/route.ts`
- `components/payers/PayerAnalytics.tsx`
- `components/payers/ProviderBreakdownChart.tsx`
- `components/payers/SchemeBreakdownChart.tsx`

**Tasks:**
1. Create `payer_analytics_cache` table
2. Build payer analytics calculator:
   - Total claims
   - Total invoice/approved amounts
   - Approval rate
   - Top providers (with volume)
   - Top schemes (with volume)
   - Monthly trends
3. Build analytics API endpoint
4. Build analytics UI components:
   - KPI cards
   - Provider breakdown bar chart
   - Scheme breakdown pie chart
   - Monthly trends line chart
   - Top providers table (clickable to provider detail)
   - Top schemes table (clickable to scheme detail)
5. Add cache refresh logic
6. Update Payer Detail page with analytics
7. Write unit tests
8. Commit and PR to develop

**Analytics Displayed:**
- Total Claims: 456
- Total Invoice: KES 23,456,789
- Total Approved: KES 21,234,567
- Approval Rate: 90.5%
- Top Providers: [Bar chart with clickable bars]
- Top Schemes: [Pie chart]
- Monthly Trends: [Line chart]

**Success Criteria:**
- All analytics calculated correctly
- Charts render with Recharts
- Cache updates when claims added
- Hyperlinks work (provider/scheme → detail pages)
- No TypeScript errors
- All tests pass

---

### Agent 9: Scheme 360° Analytics
**Branch:** `feature/scheme-analytics`
**Files to Create:**
- `sql/schema/09_scheme_analytics_cache.sql`
- `lib/queries/scheme-analytics.ts`
- `app/api/schemes/[id]/analytics/route.ts`
- `components/schemes/SchemeAnalytics.tsx`
- `components/schemes/ProviderBreakdownChart.tsx`

**Tasks:**
1. Create `scheme_analytics_cache` table
2. Build scheme analytics calculator:
   - Total claims
   - Total invoice/approved amounts
   - Approval rate
   - Top providers (with volume)
   - Monthly trends
3. Build analytics API endpoint
4. Build analytics UI components:
   - KPI cards
   - Provider breakdown bar chart
   - Monthly trends line chart
   - Top providers table (clickable to provider detail)
5. Add cache refresh logic
6. Update Scheme Detail page with analytics
7. Write unit tests
8. Commit and PR to develop

**Analytics Displayed:**
- Total Claims: 123
- Total Invoice: KES 5,678,910
- Total Approved: KES 5,123,456
- Approval Rate: 90%
- Top Providers: [Bar chart with clickable bars]
- Monthly Trends: [Line chart]

**Success Criteria:**
- All analytics calculated correctly
- Charts render with Recharts
- Cache updates when claims added
- Hyperlinks work (provider → detail page)
- No TypeScript errors
- All tests pass

---

## 🔄 CONTEXT HANDOFF PROTOCOL

### When to Handoff
1. **70% Token Usage:** Prepare context document
2. **80% Token Usage:** MANDATORY handoff to new agent

### Handoff Document Template
Create in `.claude/handoffs/agent-X-handoff-N.md`:

```markdown
# AGENT X HANDOFF #N
**From:** Agent X (Session 1)
**To:** Agent X (Session 2)
**Date:** [Timestamp]
**Token Usage:** 75%
**Branch:** feature/provider-crud

## What's Complete
- ✅ Task 1: Description
- ✅ Task 2: Description
- 🚧 Task 3: In progress (50% done)

## What's Remaining
- ⏸️ Task 3: Finish XYZ
- ⏸️ Task 4: Not started
- ⏸️ Task 5: Not started

## Current State
**Files Modified:**
- app/api/providers/route.ts (COMPLETE)
- app/providers/page.tsx (IN PROGRESS - need to add filter UI)

**Database:**
- providers table created ✅
- Indexes created ✅
- Test data seeded ✅

**Issues Encountered:**
- None

**Next Steps:**
1. Finish filter UI on providers/page.tsx
2. Build provider detail page
3. Write tests
4. Commit and PR

## Context for New Agent
[Paste relevant code snippets, error messages, or decisions made]

## Reference Documents
- Main context: .claude/AGENT_CONTEXT_MASTER.md
- Design docs: .claude/design/
- Database schema: sql/schema/01_providers.sql
```

### Handoff Process
1. Agent detects 70% token usage
2. Agent creates handoff document
3. Agent completes current task (don't stop mid-task)
4. Agent commits work with clear message
5. New agent session started with handoff doc

---

## 🎯 SUCCESS CRITERIA (Overall)

### Functional Requirements
- ✅ Upload Excel (14 columns)
- ✅ Map columns to schema (manual UI)
- ✅ Process 10K+ claims
- ✅ Provider 360° analytics page
- ✅ Payer 360° analytics page
- ✅ Scheme 360° analytics page
- ✅ Hyperlinks: Provider ↔ Payer ↔ Scheme
- ✅ Charts: Bar, Pie, Line (Recharts)
- ✅ Filter/search on all list pages

### Technical Requirements
- ✅ Vercel Postgres (NO Supabase)
- ✅ Next.js 14 + TypeScript
- ✅ shadcn/ui components
- ✅ No `any` types
- ✅ All money in cents (integers)
- ✅ All SQL parameterized (no injection)
- ✅ All tests passing
- ✅ Zero TypeScript errors

### Performance Requirements
- ✅ List pages load <1s (50 items)
- ✅ Detail pages load <1s
- ✅ Upload processes 1000 claims <5s
- ✅ Analytics cached (refresh every 5 min)

### Deployment Requirements
- ✅ All branches merged to develop
- ✅ develop merged to main
- ✅ Vercel deployment successful
- ✅ Database migrations run
- ✅ Seed data loaded

---

## 📊 TIMELINE

| Wave | Agents | Duration | Start | End |
|------|--------|----------|-------|-----|
| 1    | 1-3    | 12h      | Day 1 | Day 1 |
| 2    | 4-6    | 16h      | Day 2 | Day 3 |
| 3    | 7-9    | 14h      | Day 4 | Day 5 |
| Test | All    | 8h       | Day 6 | Day 6 |
| Deploy | - | 4h       | Day 7 | Day 7 |

**Total:** 7 days (with parallel execution)

---

## 🚨 CRITICAL REMINDERS

### For ALL Agents
1. **Backend:** Use `@vercel/postgres` ONLY (no Supabase)
2. **Queries:** Use `sql` template tag, always parameterized
3. **Money:** Store as cents (integers), display as KES
4. **Percentages:** Store as decimals (0-1), display as %
5. **TypeScript:** No `any` types allowed
6. **Context:** Handoff at 70%, mandatory at 80%
7. **Branching:** Work on feature branch, PR to develop
8. **Testing:** Write tests before PR

### Vercel Postgres Connection
```typescript
// lib/db.ts
import { sql } from '@vercel/postgres';
export { sql };

// Usage in API routes
import { sql } from '@/lib/db';

const { rows } = await sql`SELECT * FROM providers;`;
```

### Environment Variables
```env
# .env.local
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

---

## 📞 COMMUNICATION PROTOCOL

### Agent Status Updates
Every agent should update status in `.claude/status/agent-X-status.md`:

```markdown
# Agent X Status
**Last Update:** [Timestamp]
**Branch:** feature/provider-crud
**Status:** 🚧 In Progress (60% complete)

## Progress
- ✅ Database schema created
- ✅ API routes built
- 🚧 List page UI (80% done)
- ⏸️ Detail page (not started)

## Blockers
None

## ETA
4 hours remaining
```

### Cross-Agent Dependencies
If Agent 7 needs something from Agent 1:
1. Check `.claude/status/agent-1-status.md`
2. If not complete, wait or ask user for guidance
3. Do NOT proceed with incomplete dependencies

---

## 🎓 LEARNING RESOURCES

### Vercel Postgres Docs
- https://vercel.com/docs/storage/vercel-postgres
- https://vercel.com/docs/storage/vercel-postgres/using-an-orm

### Next.js 14 Docs
- https://nextjs.org/docs/app

### shadcn/ui Docs
- https://ui.shadcn.com/docs

### Recharts Docs
- https://recharts.org/en-US/

---

## 🔒 SECURITY CHECKLIST

- ✅ All SQL queries parameterized (no string concat)
- ✅ File upload validation (type, size)
- ✅ Input validation on all API endpoints
- ✅ Error messages don't leak sensitive data
- ✅ Environment variables never committed
- ✅ Database credentials in Vercel env vars only

---

**END OF MASTER CONTEXT DOCUMENT**

This document should be referenced by ALL agents at the start of their work and updated if critical information changes.
