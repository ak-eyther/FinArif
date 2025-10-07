# VITRAYA EXCEL FILE STRUCTURE ANALYSIS
## Actual vs. Expected Data Analysis

**Version:** 1.0
**Date:** 2025-10-07
**Status:** Design Documentation
**Author:** Technical Analysis Team

---

## EXECUTIVE SUMMARY

### Critical Finding
The Vitraya Excel export currently provides **14 columns** but is **missing 7 critical columns** required for full Provider 360° Analytics implementation.

### Impact
- **Phase 1 (Current):** Can import claim data but cannot auto-link to providers
- **Phase 2 (Manual Mapping):** Requires finance team to manually assign providers to claims
- **Phase 3 (Future):** When Vitraya adds missing columns, system becomes fully automated

### Decision Required
Proceed with **Option C: Hybrid Approach** - Build manual mapping UI for Phase 2 while designing for future automation.

---

## ACTUAL EXCEL STRUCTURE (14 COLUMNS)

### Column Analysis Based on Screenshot

| Column # | Column Name | Data Type | Sample Values | Nullable | Notes |
|----------|------------|-----------|---------------|----------|-------|
| 1 | Invoice Number | String | "23101", "RBILL-250927-968065", "QDPK/044943/25" | No | Unique identifier, mixed formats |
| 2 | Patient Name | String | "JANELLE CHEROP", "RAELI J. KIPTENIT" | No | PII - requires encryption |
| 3 | Total Request Amt (KES) | Decimal | 3,000.00, 16,000.00, 14,000.00 | No | Pre-AI review amount |
| 4 | Total Extracted (KES) | Decimal | 3,000.00, 16,000.00, 14,000.00 | Yes | AI-extracted claim value |
| 5 | Total Allowed by VT (KES) | Decimal | 3,000.00, 16,000.00, 14,000.00 | Yes | Vitraya-approved amount |
| 6 | Final payable (KES) | Decimal | 3,000.00, 16,000.00, 14,000.00 | No | **PRIMARY** - Use for financing |
| 7 | Total Savings (KES) | Decimal | 0.00 | Yes | Savings from AI review |
| 8 | Savings % | Percentage | 0.00% | Yes | Savings percentage |
| 9 | claim_id | UUID/String | "uuid-format" | No | Vitraya internal ID |
| 10 | created_at | Timestamp | "2025-10-04 12:45:08" | No | Claim creation timestamp |
| 11 | claim_number | String | Similar to Invoice Number | Yes | Alternate identifier |
| 12 | data_extracted | Boolean | true/false | Yes | AI extraction status |
| 13 | adjudicated | Boolean | true/false | Yes | Adjudication status |
| 14 | (Unknown/Hidden) | ? | ? | ? | Possibly visible on scroll |

### Data Type Specifications

#### Invoice Number
```typescript
type InvoiceNumber = string;

// Observed Patterns:
// 1. Simple numeric: "23101"
// 2. Prefixed: "RBILL-250927-968065"
// 3. Slash-separated: "QDPK/044943/25"

// Pattern Matching Strategy:
const INVOICE_PATTERNS = {
  RBILL: /^RBILL-\d{6}-\d{6}$/,        // Likely specific provider
  QDPK: /^QDPK\/\d{6}\/\d{2}$/,        // Another provider pattern
  NUMERIC: /^\d{5,}$/                   // Simple numeric format
};
```

#### Patient Name
```typescript
type PatientName = string;

// Format: "FIRST MIDDLE/INITIAL. LAST"
// Examples:
// - "JANELLE CHEROP"
// - "RAELI J. KIPTENIT"

// Security Requirements:
// 1. Store encrypted in database (AES-256)
// 2. Display anonymized in UI: "J***E C***P"
// 3. Full access only with audit log
// 4. GDPR/HIPAA compliance required
```

#### Monetary Amounts
```typescript
type AmountKES = number; // Always in CENTS (integers)

// Columns:
// - Total Request Amt (KES): Original claim
// - Total Extracted (KES): AI-extracted
// - Total Allowed by VT (KES): Vitraya-approved
// - Final payable (KES): **USE THIS FOR FINANCING**

// Storage Rule:
// Excel: 16,000.00 → Database: 1600000 (cents)
// Excel: 3,000.00 → Database: 300000 (cents)

// Validation:
// - Must be positive
// - Must convert to integer cents
// - Range: KES 1,000 - KES 10,000,000 (typical)
```

#### Timestamps
```typescript
type Timestamp = string; // ISO 8601 format

// Excel Format: "2025-10-04 12:45:08"
// Database Format: timestamptz (UTC)

// Parsing:
import { parseISO, formatISO } from 'date-fns';

function parseVitravaTimestamp(excelDate: string): Date {
  // Excel gives: "2025-10-04 12:45:08"
  // Need to ensure UTC conversion
  return parseISO(excelDate);
}
```

#### Boolean Flags
```typescript
type BooleanFlag = boolean | null;

// Columns:
// - data_extracted: Has AI processed this claim?
// - adjudicated: Has claim been reviewed/approved?

// Excel Values: true/false/null/empty
// Database: boolean with nullable
```

---

## MISSING COLUMNS (7 REQUIRED)

### Critical for Provider 360° Analytics

| Missing Column | Data Type | Purpose | Current Workaround |
|----------------|-----------|---------|-------------------|
| Provider Name | String | Link claim to provider | **Manual mapping** |
| Provider Code | String (8-12 chars) | Unique provider ID | Manual assignment |
| Payer Name | String | Insurance company | Manual assignment |
| Payer Code | String (8-12 chars) | Unique payer ID | Manual assignment |
| Scheme Type | Enum | NHIF/Private/Corporate | Infer from payer |
| Service Date | Date | When service rendered | Use created_at as proxy |
| Claim Type | Enum | Inpatient/Outpatient/Emergency | Cannot infer - default "General" |

### Impact Analysis

#### Without Provider Name/Code
**Cannot:**
- Auto-generate Provider 360° reports
- Calculate provider-specific metrics
- Track provider performance over time
- Identify high-risk providers

**Workaround:**
- Finance team manually maps invoice patterns to providers
- Build lookup table: Invoice prefix → Provider
- Example: "RBILL-*" → "Nairobi Hospital"

#### Without Payer Name/Code
**Cannot:**
- Calculate payer payment patterns
- Track payer-specific risk
- Analyze scheme performance
- Identify slow-paying insurers

**Workaround:**
- Manual payer assignment during review
- Historical mapping from previous claims
- Smart suggestions based on patterns

#### Without Service Date
**Cannot:**
- Calculate accurate AR aging
- Track service-to-payment cycles
- Identify stale claims

**Workaround:**
- Use `created_at` timestamp as proxy
- Assume service date ≈ claim creation date
- Accept 1-3 day variance

#### Without Claim Type
**Cannot:**
- Segment analytics by claim type
- Risk-adjust by service complexity
- Price differently for inpatient vs outpatient

**Workaround:**
- Default all claims to "General" type
- Optionally allow manual classification
- Add in Phase 3 when Vitraya provides

---

## DATA QUALITY OBSERVATIONS

### Based on Screenshot Analysis

#### 1. Consistent Data Entry
✅ **Good:**
- All monetary values properly formatted with 2 decimals
- Timestamps follow consistent format
- No obvious null/empty cells in critical columns

#### 2. Invoice Number Patterns
⚠️ **Observation:**
- Multiple format patterns suggest different source systems
- "RBILL-*" appears to be a specific provider's format
- "QDPK/*" appears to be another provider's format
- Numeric-only might be internal Vitraya numbering

**Recommendation:**
Build pattern recognition system to auto-suggest providers:
```typescript
interface InvoicePattern {
  pattern: RegExp;
  suggestedProviderId: string;
  confidenceScore: number; // 0.0 - 1.0
}

const KNOWN_PATTERNS: InvoicePattern[] = [
  {
    pattern: /^RBILL-/,
    suggestedProviderId: "nairobi-hospital",
    confidenceScore: 0.95
  },
  {
    pattern: /^QDPK\//,
    suggestedProviderId: "aga-khan",
    confidenceScore: 0.90
  }
];
```

#### 3. Amount Discrepancies
⚠️ **Observation:**
- Total Request = Total Extracted = Total Allowed = Final Payable (all same in samples)
- Total Savings = 0.00 across visible rows
- Suggests either:
  - AI perfectly validated all claims (unlikely)
  - Sample data happens to have no adjustments
  - Vitraya AI feature not fully operational yet

**Risk:**
If all amounts are identical, cannot demonstrate AI value-add in savings.

**Validation Needed:**
Request full Excel file to verify:
- Are there rows with actual savings?
- What's typical savings rate?
- Do amounts ever differ significantly?

#### 4. Patient Name Sensitivity
🔒 **Security:**
- Full patient names visible in Excel
- MUST encrypt before storing in database
- Display format: "J***E C***P" (first + last letters only)
- Audit all access to decrypted names

#### 5. Timestamp Precision
✅ **Good:**
- Second-level precision: "2025-10-04 12:45:08"
- Sufficient for AR aging calculations
- No timezone information (assume EAT - East Africa Time, UTC+3)

**Validation:**
```typescript
// Ensure timezone handling
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

function parseVitravaTimestamp(excelDate: string): Date {
  // Assume EAT timezone if not specified
  const EAST_AFRICA_TZ = 'Africa/Nairobi'; // UTC+3

  const localDate = parseISO(excelDate);
  return zonedTimeToUtc(localDate, EAST_AFRICA_TZ);
}
```

---

## EXCEL PARSER DESIGN REQUIREMENTS

### Parser Specifications

```typescript
interface VitravaExcelRow {
  // Column 1-14: Current fields
  invoice_number: string;
  patient_name: string; // Will be encrypted
  total_request_amount_kes: number; // Convert to cents
  total_extracted_kes: number | null;
  total_allowed_by_vt_kes: number | null;
  final_payable_kes: number; // PRIMARY for financing
  total_savings_kes: number | null;
  savings_percentage: number | null;
  claim_id: string;
  created_at: string; // ISO 8601
  claim_number: string | null;
  data_extracted: boolean | null;
  adjudicated: boolean | null;

  // Column 15-21: Future fields (Phase 3)
  provider_name?: string;
  provider_code?: string;
  payer_name?: string;
  payer_code?: string;
  scheme_type?: 'NHIF' | 'Private' | 'Corporate';
  service_date?: string; // ISO 8601
  claim_type?: 'Inpatient' | 'Outpatient' | 'Emergency' | 'General';
}
```

### Parser Implementation Strategy

```typescript
/**
 * Parse Vitraya Excel file with forward/backward compatibility
 *
 * Supports:
 * - Current 14-column format (Phase 1/2)
 * - Future 21-column format (Phase 3)
 * - Graceful degradation if columns missing
 */
class VitravaExcelParser {
  /**
   * Parse Excel file and validate structure
   */
  async parseFile(file: File): Promise<ParseResult> {
    // 1. Read Excel file
    const workbook = await this.readExcelFile(file);

    // 2. Detect column structure
    const columnMap = this.detectColumns(workbook);

    // 3. Validate required columns present
    this.validateRequiredColumns(columnMap);

    // 4. Parse rows
    const rows = this.parseRows(workbook, columnMap);

    // 5. Validate data quality
    const validationResults = this.validateRows(rows);

    // 6. Encrypt patient names
    const encryptedRows = await this.encryptPatientData(rows);

    return {
      rows: encryptedRows,
      totalRows: rows.length,
      validRows: validationResults.valid.length,
      invalidRows: validationResults.invalid,
      warnings: validationResults.warnings,
      hasProviderData: columnMap.has('provider_name'),
      hasPayerData: columnMap.has('payer_name')
    };
  }

  /**
   * Detect column positions (handles reordering)
   */
  private detectColumns(workbook: Workbook): Map<string, number> {
    const headerRow = workbook.sheets[0].rows[0];
    const columnMap = new Map<string, number>();

    // Map known column names to positions
    const COLUMN_ALIASES = {
      'Invoice Number': 'invoice_number',
      'Patient Name': 'patient_name',
      'Total Request Amt (KES)': 'total_request_amount_kes',
      'Final payable (KES)': 'final_payable_kes',
      'claim_id': 'claim_id',
      'created_at': 'created_at',
      // Add more aliases...
    };

    headerRow.cells.forEach((cell, index) => {
      const alias = COLUMN_ALIASES[cell.value];
      if (alias) {
        columnMap.set(alias, index);
      }
    });

    return columnMap;
  }

  /**
   * Validate required columns exist
   */
  private validateRequiredColumns(columnMap: Map<string, number>): void {
    const REQUIRED_COLUMNS = [
      'invoice_number',
      'patient_name',
      'final_payable_kes',
      'claim_id',
      'created_at'
    ];

    const missing = REQUIRED_COLUMNS.filter(col => !columnMap.has(col));

    if (missing.length > 0) {
      throw new ParseError(
        `Missing required columns: ${missing.join(', ')}`,
        'MISSING_COLUMNS',
        missing
      );
    }
  }

  /**
   * Parse individual row with type coercion
   */
  private parseRow(row: any[], columnMap: Map<string, number>): VitravaExcelRow {
    return {
      invoice_number: this.getString(row, columnMap, 'invoice_number'),
      patient_name: this.getString(row, columnMap, 'patient_name'),

      // Convert KES amounts to cents
      total_request_amount_kes: this.getAmountInCents(row, columnMap, 'total_request_amount_kes'),
      final_payable_kes: this.getAmountInCents(row, columnMap, 'final_payable_kes'),

      // Parse timestamp
      created_at: this.getTimestamp(row, columnMap, 'created_at'),

      // Optional fields with fallbacks
      provider_name: this.getOptionalString(row, columnMap, 'provider_name'),
      payer_name: this.getOptionalString(row, columnMap, 'payer_name'),

      // ... more fields
    };
  }

  /**
   * Convert KES decimal to integer cents
   */
  private getAmountInCents(
    row: any[],
    columnMap: Map<string, number>,
    field: string
  ): number {
    const colIndex = columnMap.get(field);
    if (colIndex === undefined) {
      throw new Error(`Column ${field} not found`);
    }

    const value = row[colIndex];

    if (typeof value === 'number') {
      return Math.round(value * 100); // Convert to cents
    }

    if (typeof value === 'string') {
      // Remove currency symbols, commas
      const cleaned = value.replace(/[KES,\s]/g, '');
      const parsed = parseFloat(cleaned);

      if (isNaN(parsed)) {
        throw new ParseError(`Invalid amount: ${value}`, 'INVALID_AMOUNT');
      }

      return Math.round(parsed * 100);
    }

    throw new ParseError(`Invalid amount type: ${typeof value}`, 'INVALID_TYPE');
  }
}
```

---

## VALIDATION RULES

### Critical Validations (Must Pass)

```typescript
interface ValidationRule {
  field: string;
  rule: (value: any, row: VitravaExcelRow) => boolean;
  errorMessage: string;
  severity: 'error' | 'warning';
}

const VALIDATION_RULES: ValidationRule[] = [
  // Invoice Number
  {
    field: 'invoice_number',
    rule: (value) => value && value.length > 0,
    errorMessage: 'Invoice number is required',
    severity: 'error'
  },
  {
    field: 'invoice_number',
    rule: (value) => value.length <= 100,
    errorMessage: 'Invoice number too long (max 100 chars)',
    severity: 'error'
  },

  // Patient Name
  {
    field: 'patient_name',
    rule: (value) => value && value.length >= 2,
    errorMessage: 'Patient name is required (min 2 chars)',
    severity: 'error'
  },
  {
    field: 'patient_name',
    rule: (value) => /^[A-Z\s\.]+$/.test(value),
    errorMessage: 'Patient name contains invalid characters',
    severity: 'warning'
  },

  // Final Payable Amount
  {
    field: 'final_payable_kes',
    rule: (value) => value > 0,
    errorMessage: 'Final payable amount must be positive',
    severity: 'error'
  },
  {
    field: 'final_payable_kes',
    rule: (value) => value >= 100000, // KES 1,000 minimum
    errorMessage: 'Claim amount below minimum (KES 1,000)',
    severity: 'warning'
  },
  {
    field: 'final_payable_kes',
    rule: (value) => value <= 1000000000, // KES 10M maximum
    errorMessage: 'Claim amount exceeds maximum (KES 10M)',
    severity: 'warning'
  },

  // Amount Consistency
  {
    field: 'total_savings_kes',
    rule: (value, row) => {
      if (value === null) return true;
      const request = row.total_request_amount_kes || 0;
      const final = row.final_payable_kes || 0;
      const expectedSavings = request - final;
      return Math.abs(value - expectedSavings) < 100; // Allow 1 KES variance
    },
    errorMessage: 'Savings calculation inconsistent with amounts',
    severity: 'warning'
  },

  // Timestamp
  {
    field: 'created_at',
    rule: (value) => {
      try {
        const date = parseISO(value);
        return !isNaN(date.getTime());
      } catch {
        return false;
      }
    },
    errorMessage: 'Invalid timestamp format',
    severity: 'error'
  },
  {
    field: 'created_at',
    rule: (value) => {
      const date = parseISO(value);
      const now = new Date();
      const sixMonthsAgo = subMonths(now, 6);
      return date >= sixMonthsAgo && date <= now;
    },
    errorMessage: 'Claim date outside expected range (6 months)',
    severity: 'warning'
  },

  // Claim ID
  {
    field: 'claim_id',
    rule: (value) => value && value.length > 0,
    errorMessage: 'Claim ID is required',
    severity: 'error'
  }
];
```

### Business Logic Validations

```typescript
/**
 * Validate entire batch for business rules
 */
function validateBatch(rows: VitravaExcelRow[]): BatchValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for duplicates
  const invoiceNumbers = new Set<string>();
  const claimIds = new Set<string>();

  rows.forEach((row, index) => {
    // Duplicate invoice number
    if (invoiceNumbers.has(row.invoice_number)) {
      errors.push({
        row: index + 1,
        field: 'invoice_number',
        message: `Duplicate invoice number: ${row.invoice_number}`,
        severity: 'error'
      });
    }
    invoiceNumbers.add(row.invoice_number);

    // Duplicate claim ID
    if (claimIds.has(row.claim_id)) {
      errors.push({
        row: index + 1,
        field: 'claim_id',
        message: `Duplicate claim ID: ${row.claim_id}`,
        severity: 'error'
      });
    }
    claimIds.add(row.claim_id);
  });

  // Check batch statistics
  const amounts = rows.map(r => r.final_payable_kes);
  const totalAmount = amounts.reduce((sum, amt) => sum + amt, 0);
  const avgAmount = totalAmount / rows.length;
  const maxAmount = Math.max(...amounts);

  // Warn if batch is unusually large
  if (totalAmount > 100000000000) { // > KES 1B
    warnings.push({
      message: `Large batch total: ${formatCurrency(totalAmount)}`,
      suggestion: 'Consider splitting into multiple uploads'
    });
  }

  // Warn if single claim dominates batch
  if (maxAmount > totalAmount * 0.5) {
    warnings.push({
      message: 'Single claim exceeds 50% of batch total',
      suggestion: 'Review high-value claim separately'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalRows: rows.length,
      totalAmount,
      avgAmount,
      maxAmount,
      minAmount: Math.min(...amounts)
    }
  };
}
```

---

## EDGE CASES TO HANDLE

### 1. Empty/Null Values

**Scenario:** Optional columns are empty or null
**Example:** `total_extracted_kes` is null

```typescript
// Handle gracefully - use final_payable_kes as fallback
const claimAmount = row.final_payable_kes; // Always use this
const extractedAmount = row.total_extracted_kes ?? claimAmount; // Fallback
```

### 2. Currency Formatting Variations

**Scenario:** Excel might format amounts differently
**Examples:**
- "16,000.00" (with comma)
- "16000" (no decimals)
- "KES 16,000.00" (with currency)
- "16000.50" (odd cents)

```typescript
function parseKESAmount(value: string | number): number {
  if (typeof value === 'number') {
    return Math.round(value * 100);
  }

  // Strip all non-numeric except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    throw new ParseError(`Cannot parse amount: ${value}`);
  }

  return Math.round(parsed * 100);
}
```

### 3. Timestamp Timezone Ambiguity

**Scenario:** Excel timestamp has no timezone
**Example:** "2025-10-04 12:45:08"

```typescript
// Assume East Africa Time (EAT = UTC+3)
import { zonedTimeToUtc } from 'date-fns-tz';

function parseVitravaTimestamp(excelDate: string): Date {
  const localDate = parseISO(excelDate);

  // Convert from EAT to UTC for storage
  return zonedTimeToUtc(localDate, 'Africa/Nairobi');
}
```

### 4. Invoice Number Collisions

**Scenario:** Two providers use same invoice number
**Example:** Both use "23101"

```typescript
// Solution: Use composite key
type UniqueClaimKey = `${string}_${string}`; // claim_id + invoice_number

function generateUniqueKey(row: VitravaExcelRow): UniqueClaimKey {
  return `${row.claim_id}_${row.invoice_number}`;
}

// Check for collisions
const seen = new Set<UniqueClaimKey>();
rows.forEach(row => {
  const key = generateUniqueKey(row);
  if (seen.has(key)) {
    throw new Error(`Duplicate claim: ${key}`);
  }
  seen.add(key);
});
```

### 5. Unicode/Special Characters in Names

**Scenario:** Patient names with accents or special characters
**Example:** "JOSÉ MARÍA LÓPEZ"

```typescript
// Normalize before storing
function normalizePatientName(name: string): string {
  return name
    .normalize('NFKC') // Unicode normalization
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' '); // Collapse multiple spaces
}
```

### 6. Very Large Excel Files

**Scenario:** Excel has 10,000+ rows
**Impact:** Memory issues, slow parsing

```typescript
/**
 * Stream-based parser for large files
 */
async function* parseExcelInChunks(
  file: File,
  chunkSize: number = 1000
): AsyncGenerator<VitravaExcelRow[]> {
  const stream = createReadStream(file);
  const parser = createExcelStreamParser(stream);

  let buffer: VitravaExcelRow[] = [];

  for await (const row of parser) {
    buffer.push(row);

    if (buffer.length >= chunkSize) {
      yield buffer;
      buffer = [];
    }
  }

  if (buffer.length > 0) {
    yield buffer;
  }
}

// Usage:
for await (const chunk of parseExcelInChunks(file)) {
  await importClaimsToDatabase(chunk);
  updateProgress(chunk.length);
}
```

### 7. Excel Date Serial Numbers

**Scenario:** Excel stores dates as numbers (days since 1900-01-01)
**Example:** 45292 instead of "2025-10-04"

```typescript
function parseExcelDate(value: string | number): Date {
  if (typeof value === 'number') {
    // Excel serial date (days since 1900-01-01)
    const EXCEL_EPOCH = new Date('1900-01-01');
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    // Excel incorrectly treats 1900 as leap year, adjust
    const adjusted = value > 60 ? value - 2 : value - 1;

    return new Date(EXCEL_EPOCH.getTime() + adjusted * MS_PER_DAY);
  }

  // String format
  return parseISO(value);
}
```

### 8. Missing Patient Name (Privacy)

**Scenario:** Future Vitraya version redacts patient names
**Example:** "PATIENT-REDACTED-001"

```typescript
// Handle gracefully
function isRedactedName(name: string): boolean {
  return name.startsWith('PATIENT-REDACTED') ||
         name === 'REDACTED' ||
         name === 'ANONYMOUS';
}

// Store differently
if (isRedactedName(row.patient_name)) {
  row.patient_name_encrypted = null; // Don't encrypt placeholder
  row.patient_redacted = true;
} else {
  row.patient_name_encrypted = await encrypt(row.patient_name);
  row.patient_redacted = false;
}
```

---

## DATABASE IMPORT STRATEGY

### Table: `claims`

```sql
CREATE TABLE claims (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vitraya Core Fields (14 columns)
  invoice_number VARCHAR(100) NOT NULL,
  patient_name_encrypted TEXT, -- AES-256 encrypted
  patient_redacted BOOLEAN DEFAULT false,

  -- Amounts (stored in CENTS as BIGINT)
  total_request_amount_cents BIGINT NOT NULL,
  total_extracted_cents BIGINT,
  total_allowed_by_vt_cents BIGINT,
  final_payable_cents BIGINT NOT NULL, -- Primary amount for financing
  total_savings_cents BIGINT,
  savings_percentage DECIMAL(5,2),

  -- Vitraya Metadata
  vitraya_claim_id VARCHAR(100) NOT NULL UNIQUE,
  claim_number VARCHAR(100),
  data_extracted BOOLEAN,
  adjudicated BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL,

  -- Provider/Payer (Phase 3 - Nullable for now)
  provider_id UUID REFERENCES providers(id),
  payer_id UUID REFERENCES payers(id),
  scheme_type VARCHAR(20), -- 'NHIF', 'Private', 'Corporate'
  service_date DATE,
  claim_type VARCHAR(20), -- 'Inpatient', 'Outpatient', 'Emergency', 'General'

  -- Import Tracking
  import_batch_id UUID REFERENCES import_batches(id),
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  imported_by UUID REFERENCES users(id),

  -- Audit
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT claims_unique_invoice_per_batch UNIQUE(invoice_number, import_batch_id)
);

-- Performance Indexes
CREATE INDEX idx_claims_invoice ON claims(invoice_number);
CREATE INDEX idx_claims_vitraya_id ON claims(vitraya_claim_id);
CREATE INDEX idx_claims_provider ON claims(provider_id) WHERE provider_id IS NOT NULL;
CREATE INDEX idx_claims_payer ON claims(payer_id) WHERE payer_id IS NOT NULL;
CREATE INDEX idx_claims_created_at ON claims(created_at DESC);
CREATE INDEX idx_claims_import_batch ON claims(import_batch_id);

-- Full-text search on invoice numbers
CREATE INDEX idx_claims_invoice_search ON claims USING gin(invoice_number gin_trgm_ops);
```

### Table: `import_batches`

```sql
CREATE TABLE import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- File metadata
  filename VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_hash VARCHAR(64) NOT NULL, -- SHA-256 to detect duplicates

  -- Import statistics
  total_rows INTEGER NOT NULL,
  valid_rows INTEGER NOT NULL,
  invalid_rows INTEGER NOT NULL,
  total_amount_cents BIGINT NOT NULL,

  -- Status
  status VARCHAR(20) NOT NULL, -- 'processing', 'completed', 'failed'
  error_message TEXT,

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- User
  imported_by UUID REFERENCES users(id),

  -- Validation results
  validation_errors JSONB,
  validation_warnings JSONB,

  CONSTRAINT import_batches_unique_hash UNIQUE(file_hash)
);

CREATE INDEX idx_import_batches_status ON import_batches(status);
CREATE INDEX idx_import_batches_started ON import_batches(started_at DESC);
```

### Import Transaction Flow

```typescript
/**
 * Import claims from parsed Excel file
 *
 * Atomic transaction - all or nothing
 */
async function importClaimsToDatabase(
  rows: VitravaExcelRow[],
  file: File,
  userId: string
): Promise<ImportResult> {
  const supabase = createClient();

  // Start transaction
  const { data: batch, error: batchError } = await supabase
    .from('import_batches')
    .insert({
      filename: file.name,
      file_size_bytes: file.size,
      file_hash: await hashFile(file),
      total_rows: rows.length,
      valid_rows: 0, // Will update
      invalid_rows: 0,
      total_amount_cents: rows.reduce((sum, r) => sum + r.final_payable_kes, 0),
      status: 'processing',
      imported_by: userId
    })
    .select()
    .single();

  if (batchError) {
    throw new ImportError('Failed to create batch', batchError);
  }

  try {
    // Insert claims
    const claimsToInsert = rows.map(row => ({
      invoice_number: row.invoice_number,
      patient_name_encrypted: encryptPatientName(row.patient_name),
      total_request_amount_cents: row.total_request_amount_kes,
      final_payable_cents: row.final_payable_kes,
      vitraya_claim_id: row.claim_id,
      created_at: parseVitravaTimestamp(row.created_at),
      import_batch_id: batch.id,
      imported_by: userId,
      // ... more fields
    }));

    const { data: claims, error: claimsError } = await supabase
      .from('claims')
      .insert(claimsToInsert)
      .select();

    if (claimsError) {
      throw new ImportError('Failed to insert claims', claimsError);
    }

    // Update batch status
    await supabase
      .from('import_batches')
      .update({
        status: 'completed',
        valid_rows: claims.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', batch.id);

    return {
      success: true,
      batchId: batch.id,
      claimsImported: claims.length,
      totalAmount: rows.reduce((sum, r) => sum + r.final_payable_kes, 0)
    };

  } catch (error) {
    // Rollback by marking batch as failed
    await supabase
      .from('import_batches')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', batch.id);

    throw error;
  }
}
```

---

## PATIENT DATA ENCRYPTION

### AES-256 Encryption Implementation

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16;

// Encryption key from environment
const ENCRYPTION_KEY = Buffer.from(
  process.env.PATIENT_DATA_ENCRYPTION_KEY!,
  'hex'
);

/**
 * Encrypt patient name for storage
 *
 * Returns: "iv:authTag:encryptedData" (all hex-encoded)
 */
function encryptPatientName(name: string): string {
  if (!name || name.length === 0) {
    throw new Error('Cannot encrypt empty name');
  }

  // Generate random IV for each encryption
  const iv = randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  // Encrypt
  let encrypted = cipher.update(name, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get authentication tag
  const authTag = cipher.getAuthTag();

  // Combine: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt patient name for display
 */
function decryptPatientName(encrypted: string): string {
  if (!encrypted || encrypted.length === 0) {
    throw new Error('Cannot decrypt empty string');
  }

  // Split components
  const parts = encrypted.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  // Convert from hex
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encryptedData = Buffer.from(encryptedHex, 'hex');

  // Create decipher
  const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  let decrypted = decipher.update(encryptedData, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Anonymize patient name for UI display
 *
 * "JANELLE CHEROP" → "J***E C***P"
 */
function anonymizePatientName(name: string): string {
  if (!name || name.length === 0) return 'UNKNOWN';

  return name
    .split(' ')
    .map(word => {
      if (word.length <= 2) return word; // Keep short words
      return `${word[0]}***${word[word.length - 1]}`;
    })
    .join(' ');
}

/**
 * Full encryption + anonymization pipeline
 */
async function processPatientName(name: string): Promise<{
  encrypted: string;
  anonymized: string;
}> {
  // Normalize first
  const normalized = normalizePatientName(name);

  // Encrypt for storage
  const encrypted = encryptPatientName(normalized);

  // Anonymize for display
  const anonymized = anonymizePatientName(normalized);

  return { encrypted, anonymized };
}
```

### Audit Logging for Decryption

```typescript
/**
 * Log all access to patient names
 */
async function logPatientDataAccess(
  userId: string,
  claimId: string,
  action: 'view' | 'export',
  reason: string
): Promise<void> {
  await supabase
    .from('patient_data_audit_log')
    .insert({
      user_id: userId,
      claim_id: claimId,
      action,
      reason,
      ip_address: getRequestIP(),
      user_agent: getRequestUserAgent(),
      accessed_at: new Date().toISOString()
    });
}

/**
 * Decrypt with audit trail
 */
async function decryptPatientNameWithAudit(
  encrypted: string,
  claimId: string,
  userId: string,
  reason: string
): Promise<string> {
  // Log access
  await logPatientDataAccess(userId, claimId, 'view', reason);

  // Decrypt
  return decryptPatientName(encrypted);
}
```

---

## PHASE 3 MIGRATION PLAN

### When Vitraya Adds 7 New Columns

```typescript
/**
 * Backfill provider/payer data from new Excel format
 */
async function backfillProviderData(file: File): Promise<BackfillResult> {
  // 1. Parse new Excel with all 21 columns
  const rows = await parseVitravaExcel21(file);

  // 2. Match existing claims by vitraya_claim_id
  const updates: ClaimUpdate[] = [];

  for (const row of rows) {
    const { data: existingClaim } = await supabase
      .from('claims')
      .select('id, provider_id')
      .eq('vitraya_claim_id', row.claim_id)
      .single();

    if (!existingClaim) {
      // New claim, import normally
      continue;
    }

    if (existingClaim.provider_id) {
      // Already has provider (manual mapping), skip
      continue;
    }

    // 3. Find or create provider
    const provider = await findOrCreateProvider({
      name: row.provider_name!,
      code: row.provider_code!
    });

    // 4. Find or create payer
    const payer = await findOrCreatePayer({
      name: row.payer_name!,
      code: row.payer_code!
    });

    updates.push({
      claimId: existingClaim.id,
      providerId: provider.id,
      payerId: payer.id,
      schemeType: row.scheme_type,
      serviceDate: row.service_date,
      claimType: row.claim_type
    });
  }

  // 5. Batch update
  for (const update of updates) {
    await supabase
      .from('claims')
      .update({
        provider_id: update.providerId,
        payer_id: update.payerId,
        scheme_type: update.schemeType,
        service_date: update.serviceDate,
        claim_type: update.claimType,
        backfilled_at: new Date().toISOString()
      })
      .eq('id', update.claimId);
  }

  return {
    claimsUpdated: updates.length,
    newProviders: [...new Set(updates.map(u => u.providerId))].length,
    newPayers: [...new Set(updates.map(u => u.payerId))].length
  };
}
```

---

## SUMMARY & RECOMMENDATIONS

### Immediate Actions (Phase 1)

1. **Build Excel Parser**
   - Support current 14-column format
   - Validate all required fields
   - Handle edge cases (currency formats, timezones)
   - Encrypt patient names before storage

2. **Database Setup**
   - Create `claims` table with nullable provider/payer fields
   - Create `import_batches` for tracking
   - Set up encryption key management
   - Configure audit logging

3. **Validation Rules**
   - Implement all critical validations
   - Graceful handling of warnings
   - Clear error messages for users

### Phase 2 Requirements

4. **Manual Mapping UI**
   - Invoice pattern recognition
   - Smart provider suggestions
   - Bulk mapping operations
   - Audit trail for manual assignments

5. **Lookup Tables**
   - `invoice_provider_patterns` for auto-suggestions
   - `provider_name_variations` for fuzzy matching
   - Historical mapping memory

### Phase 3 Preparation

6. **Future-Proof Parser**
   - Design parser to accept optional columns
   - Graceful degradation if columns missing
   - Easy migration when Vitraya updates

7. **Backfill Strategy**
   - Script to update existing claims
   - Preserve manual mappings
   - Validate data quality

### Critical Risks

⚠️ **Risk 1: All Amounts Identical**
- Sample data shows no savings (0.00%)
- Need full Excel file to validate AI is working
- If always zero, cannot demonstrate value-add

⚠️ **Risk 2: Patient Data Privacy**
- Full names visible in Excel
- Must encrypt immediately on import
- Audit all access to decrypted data
- GDPR/HIPAA compliance required

⚠️ **Risk 3: Missing Provider Data**
- Cannot auto-generate Provider 360° reports
- Requires manual mapping UI (Phase 2)
- Finance team workload increases

⚠️ **Risk 4: Timezone Assumptions**
- Excel has no timezone information
- Assuming EAT (UTC+3) for Kenya
- Could cause +/- 1 day errors if wrong

---

## APPENDIX: SAMPLE DATA

### Row 1 (from screenshot)
```json
{
  "invoice_number": "23101",
  "patient_name": "JANELLE CHEROP",
  "total_request_amount_kes": 300000,
  "total_extracted_kes": 300000,
  "total_allowed_by_vt_kes": 300000,
  "final_payable_kes": 300000,
  "total_savings_kes": 0,
  "savings_percentage": 0.00,
  "claim_id": "uuid-placeholder",
  "created_at": "2025-10-04T12:45:08.000Z",
  "claim_number": "23101",
  "data_extracted": true,
  "adjudicated": true
}
```

### Row 2 (from screenshot)
```json
{
  "invoice_number": "RBILL-250927-968065",
  "patient_name": "RAELI J. KIPTENIT",
  "total_request_amount_kes": 1600000,
  "total_extracted_kes": 1600000,
  "total_allowed_by_vt_kes": 1600000,
  "final_payable_kes": 1600000,
  "total_savings_kes": 0,
  "savings_percentage": 0.00,
  "claim_id": "uuid-placeholder-2",
  "created_at": "2025-10-04T12:45:08.000Z",
  "claim_number": "RBILL-250927-968065",
  "data_extracted": true,
  "adjudicated": true
}
```

### Row 3 (from screenshot)
```json
{
  "invoice_number": "QDPK/044943/25",
  "patient_name": "[PATIENT NAME]",
  "total_request_amount_kes": 1400000,
  "total_extracted_kes": 1400000,
  "total_allowed_by_vt_kes": 1400000,
  "final_payable_kes": 1400000,
  "total_savings_kes": 0,
  "savings_percentage": 0.00,
  "claim_id": "uuid-placeholder-3",
  "created_at": "2025-10-04T12:45:08.000Z",
  "claim_number": "QDPK/044943/25",
  "data_extracted": true,
  "adjudicated": true
}
```

---

## NEXT STEPS

**Continue to:** [02_DATABASE_DESIGN.md](./02_DATABASE_DESIGN.md) for complete schema with ER diagrams.

---

**Document Status:** ✅ **Complete**
**Reviewed By:** Pending
**Last Updated:** 2025-10-07
**Version:** 1.0
