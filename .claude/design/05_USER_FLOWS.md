# USER FLOWS - PROVIDER 360° ANALYTICS

**Version:** 1.0
**Date:** October 2025
**Status:** Design Review
**Purpose:** Step-by-step workflows for all critical user interactions

---

## TABLE OF CONTENTS

1. [Flow 1: Onboard New Provider](#flow-1-onboard-new-provider)
2. [Flow 2: Upload Claims from Vitraya Excel](#flow-2-upload-claims-from-vitraya-excel)
3. [Flow 3: Manual Provider Mapping](#flow-3-manual-provider-mapping)
4. [Flow 4: View Provider Analytics](#flow-4-view-provider-analytics)
5. [Flow 5: Navigate via Hyperlinks](#flow-5-navigate-via-hyperlinks)
6. [Flow 6: Track Collections](#flow-6-track-collections)
7. [Flow 7: Risk Assessment](#flow-7-risk-assessment)
8. [Flow 8: Data Quality Monitoring](#flow-8-data-quality-monitoring)

---

## FLOW LEGEND

```
┌─────────────────────────────────────────────────────────┐
│  FLOW COMPONENT TYPES                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [USER ACTION]        Blue boxes = User interactions    │
│  {SYSTEM ACTION}      Green boxes = System processes    │
│  <DECISION?>          Diamond = Decision points         │
│  !ERROR!              Red = Error states                │
│  →                    Arrow = Flow direction            │
│  ◊                    Diamond connector = Branch        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**User Types:**
- **Admin:** Full access, can manage providers/payers
- **Finance User:** Can map claims, view analytics
- **Read-Only:** View-only access to analytics

---

## FLOW 1: ONBOARD NEW PROVIDER

**Purpose:** Add a new healthcare provider to the system
**Role Required:** Admin
**Time Estimate:** 3-5 minutes per provider
**Entry Point:** /settings/providers

### Flow Diagram

```
START: Admin navigates to Provider Settings
│
▼
[Click "Add New Provider" button]
│
▼
{System opens Provider Form dialog}
│
▼
[Fill Basic Information]
│  • Provider Code (auto-generated, editable)
│  • Provider Name (required)
│  • Provider Type (dropdown: Hospital/Clinic/Specialty/Network/Public)
│  • Legal Entity Type (dropdown: Private Ltd/NGO/Public)
│
▼
[Fill Contact Details]
│  • Physical Address
│  • County/Region (47 Kenyan counties dropdown)
│  • City/Town
│  • Phone Number (+254 format)
│  • Email Address
│
▼
[Fill Financial Settings]
│  • Credit Limit (KES)
│  • Payment Terms (days)
│  • Risk Category (Low/Medium/High)
│  • Status (Active/Inactive/Suspended)
│
▼
{System validates form in real-time}
│
▼
         <All fields valid?>
                │
        ┌───────┴────────┐
        NO              YES
        │                │
        ▼                ▼
   !SHOW ERRORS!    [Click "Save Provider"]
        │                │
        ▼                ▼
   [Fix errors]    {System saves to database}
        │                │
        └────────────────┤
                         ▼
                {Generate audit log entry}
                         │
                         ▼
                {Refresh provider list}
                         │
                         ▼
                {Show success message}
                "Provider 'Name' created successfully"
                         │
                         ▼
                {Close dialog}
                         │
                         ▼
                [See new provider in table]
                         │
                         ▼
                    END: Provider onboarded
```

### Error States

| Error Type | Trigger | User Action |
|------------|---------|-------------|
| **Duplicate Code** | Provider code already exists | System auto-increments code, user confirms |
| **Invalid Phone** | Phone format wrong | Show format hint: "+254 7XX XXX XXX" |
| **Invalid Email** | Email format wrong | Show validation message in real-time |
| **Network Error** | Save fails | Show retry button, preserve form data |
| **Missing Required** | Required field empty | Highlight field in red, disable save button |

### Success Criteria

- ✅ Provider appears in provider list table
- ✅ Audit log entry created with admin user ID
- ✅ Provider code is unique and auto-generated
- ✅ All required fields validated and saved
- ✅ Provider is immediately available for mapping

### Edge Cases

1. **User cancels mid-form:** Confirm dialog "Discard changes?" → Yes = close, No = return
2. **Duplicate provider name:** Warning shown but allowed (different locations may exist)
3. **Credit limit set to 0:** Warning shown "This provider cannot be financed"
4. **Status set to Inactive:** Warning shown "This provider won't appear in mappings"

---

## FLOW 2: UPLOAD CLAIMS FROM VITRAYA EXCEL

**Purpose:** Import claims data from Vitraya Excel export
**Role Required:** Admin or Finance User
**Time Estimate:** 5-10 minutes (including validation)
**Entry Point:** /claims/upload

### Flow Diagram

```
START: User navigates to Claims Upload page
│
▼
[Drag & drop Excel file OR click "Choose File"]
│
▼
{System checks file}
│  • File type (.xlsx, .xls only)
│  • File size (max 10MB)
│  • Not empty
│
▼
         <File valid?>
                │
        ┌───────┴────────┐
        NO              YES
        │                │
        ▼                ▼
   !FILE ERROR!     {Extract row count}
   "Invalid file     "156 rows detected"
    type/size"              │
        │                   ▼
        ▼              [Click "Validate File"]
   [Upload again]           │
        │                   ▼
        └──────────────────►{Start validation process}
                                   │
                                   ▼
                          {Progress bar: 0-100%}
                          {Check each row:}
                          │  • Required fields present
                          │  • Date formats correct
                          │  • Amounts valid (>0, <10M KES)
                          │  • Invoice numbers unique
                          │  • Claim type (IP/OP)
                          │
                          ▼
                    {Categorize results}
                    │  • Valid rows
                    │  • Warnings (non-blocking)
                    │  • Errors (blocking)
                          │
                          ▼
                    {Display validation table}
                    Row | Status | Issue
                    23  | ❌     | Duplicate invoice
                    45  | ❌     | Invalid date
                    67  | ⚠️     | Missing patient name
                          │
                          ▼
                   <Any errors?>
                          │
                ┌─────────┴─────────┐
               YES                  NO
                │                    │
                ▼                    ▼
        [Download report]      {Show import summary}
        [Fix errors]           "148 claims will import"
        [Re-upload]            "4 will skip (errors)"
                │              "4 warnings (ok to import)"
                └──────────────────┤
                                   ▼
                          [Review import options]
                          ☑ Skip duplicates
                          ☑ Create audit log
                          ☑ Send email notification
                          ☐ Auto-map (no data available)
                                   │
                                   ▼
                          [Click "Import Claims"]
                                   │
                                   ▼
                          {Create batch record}
                          {Insert valid claims}
                          {Mark claims as UNMAPPED}
                          {Update batch status}
                                   │
                                   ▼
                          {Show success message}
                          "✅ 148 claims imported"
                          "⚠️ 87 need provider mapping"
                                   │
                                   ▼
                          [Button: "Map Providers Now →"]
                          [Button: "View Imported Claims"]
                                   │
                                   ▼
                              END: Claims uploaded
```

### Validation Rules

| Category | Rule | Error/Warning |
|----------|------|---------------|
| **Required Fields** | Invoice number must exist | ❌ Error - Row skipped |
| **Required Fields** | Invoice amount must exist | ❌ Error - Row skipped |
| **Required Fields** | Invoice date must exist | ❌ Error - Row skipped |
| **Duplicates** | Invoice number already in DB | ❌ Error - Duplicate |
| **Duplicates** | Invoice number appears twice in file | ❌ Error - Internal dup |
| **Date Format** | Date must be YYYY-MM-DD | ❌ Error - Invalid format |
| **Date Logic** | Service date > 1 year in future | ⚠️ Warning - Still imports |
| **Amount Range** | Amount must be > 0 | ❌ Error - Invalid |
| **Amount Range** | Amount > KES 10M | ❌ Error - Exceeds limit |
| **Claim Type** | Must be "IP" or "OP" or empty | ❌ Error - Invalid type |
| **Patient Name** | Missing patient name | ⚠️ Warning - Privacy concern |
| **Approval Code** | Missing approval number | ⚠️ Warning - Verification issue |

### Error Recovery

1. **Fix & Re-upload Flow:**
   ```
   Download validation report (CSV)
   → Open in Excel
   → Fix highlighted errors
   → Save fixed file
   → Upload again
   → Validation passes
   → Import succeeds
   ```

2. **Partial Import Flow:**
   ```
   If 148 valid, 4 errors:
   → Import 148 valid rows
   → Skip 4 error rows
   → Log skipped rows to batch.error_log
   → Email admin with error details
   → Allow manual entry of skipped rows later
   ```

### What Happens to Unmapped Providers

```
┌──────────────────────────────────────────────┐
│  ALL CLAIMS IMPORTED AS "UNMAPPED"           │
├──────────────────────────────────────────────┤
│                                              │
│  1. Claims.provider_id = NULL                │
│  2. Claims.status = "UNMAPPED"               │
│  3. Cannot calculate provider KPIs           │
│  4. Cannot show in Provider 360° dashboard   │
│  5. Must use Manual Mapper (Flow 3)          │
│                                              │
│  Next Step Required:                         │
│  → Go to /claims/map                         │
│  → Manually assign providers                 │
│  → OR wait for Vitraya to add provider cols  │
│                                              │
└──────────────────────────────────────────────┘
```

### Success Criteria

- ✅ Valid rows imported to claims table
- ✅ Batch record created with stats
- ✅ Error rows logged with reasons
- ✅ Audit log entry created
- ✅ Email notification sent (if enabled)
- ✅ User redirected to mapping page

### Edge Cases

1. **All rows have errors:** Show "0 claims to import" → prevent import
2. **Excel has extra columns:** Ignore unknown columns, import known 14
3. **File corrupted:** Show "Cannot read file" → ask to re-download from Vitraya
4. **Timeout on large file:** Show progress, allow cancel, resume from last checkpoint
5. **User uploads same file twice:** Dedupe based on invoice numbers

---

## FLOW 3: MANUAL PROVIDER MAPPING

**Purpose:** Assign providers to unmapped claims using AI suggestions
**Role Required:** Admin or Finance User
**Time Estimate:** 30-60 seconds per claim (with suggestions)
**Entry Point:** /claims/map

### Flow Diagram

```
START: User navigates to Manual Mapper
│
▼
{System queries unmapped claims}
{Load AI suggestion engine}
{Show status KPIs}
│
▼
[View unmapped claims queue (87 total)]
│
▼
[Select first claim to map]
│
▼
{System analyzes claim data:}
│  • Invoice number pattern
│  • Claim amount
│  • Payer (NHIF, AAR, etc)
│  • Historical mappings
│  • Geographic hints
│
▼
{Generate AI suggestions (1-3 providers)}
{Calculate confidence scores}
│
▼
[See suggestion card]
│
│  🤖 SMART SUGGESTIONS
│  1. Nairobi Hospital    92%  [Select]  Why?
│     • Invoice pattern: RBILL-NAI-*
│     • 45 previous claims matched
│     • NHIF claims → this provider
│
│  2. Aga Khan Hospital   67%  [Select]  Why?
│     • Similar amounts (~KES 120K)
│
▼
         <Accept top suggestion?>
                │
        ┌───────┴────────┐
       YES               NO
        │                 │
        ▼                 ▼
   [Click "Select"  [Expand "Why?" to verify]
    on top match]         │
        │                 ▼
        │            <Suggestion correct?>
        │                 │
        │         ┌───────┴────────┐
        │        YES               NO
        │         │                 │
        │         ▼                 ▼
        │    [Select lower   [Use manual search]
        │     suggestion]     [Type provider name]
        │         │                 │
        └─────────┴─────────────────┘
                  │
                  ▼
         {Update claim record}
         {Set provider_id}
         {Set status = "MAPPED"}
         {Learn from mapping}
                  │
                  ▼
         {Update pattern table}
         invoice_provider_mappings:
         • invoice_number
         • provider_id
         • confidence_score
         • mapping_method
         • mapped_by (user_id)
                  │
                  ▼
         {Show success indicator}
         "✅ Mapped to [Provider]"
                  │
                  ▼
         {Auto-advance to next claim}
                  │
                  ▼
         <More claims in queue?>
                  │
        ┌─────────┴─────────┐
       YES                  NO
        │                    │
        ▼                    ▼
   [Continue      {Show completion message}
    mapping]      "All claims mapped! 🎉"
        │          "87 claims processed"
        │                   │
        └───────────────────┤
                            ▼
                   {Update AI model}
                   {Retrain suggestions}
                            │
                            ▼
                       END: Mapping complete
```

### AI Suggestion Logic

```
┌─────────────────────────────────────────────────────┐
│  HOW SUGGESTIONS ARE GENERATED                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  INPUT: Claim data                                  │
│  • invoice_number: "RBILL-NAI-2024-342"            │
│  • amount: KES 125,000                             │
│  • payer: "NHIF"                                   │
│  • patient: encrypted                              │
│                                                     │
│  MATCHING METHODS (weighted):                       │
│                                                     │
│  1. Invoice Pattern Match (40% weight)             │
│     • Extract prefix: "RBILL-NAI"                  │
│     • Query pattern table                          │
│     • Find providers with this pattern             │
│     • Score: 92% (45 historical matches)           │
│                                                     │
│  2. Historical Claim Data (30% weight)             │
│     • Look up previous claims from same payer      │
│     • Check amount range (±20%)                    │
│     • Score: 85% (similar amounts)                 │
│                                                     │
│  3. Payer-Provider Affinity (20% weight)           │
│     • NHIF → Nairobi Hospital (high volume)        │
│     • Score: 78%                                   │
│                                                     │
│  4. Amount Pattern (10% weight)                    │
│     • Avg claim KES 120K                           │
│     • This claim KES 125K (close)                  │
│     • Score: 88%                                   │
│                                                     │
│  FINAL SCORE: Weighted average = 92%               │
│                                                     │
│  OUTPUT: Top 3 suggestions ranked by score         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Bulk Mapping Flow

```
Alternative: Map multiple claims at once

[Select claims using checkboxes (up to 50)]
│
▼
[Click "Bulk Map to Provider"]
│
▼
{Check if claims have common pattern}
│
▼
         <Same invoice prefix?>
                │
        ┌───────┴────────┐
       YES               NO
        │                 │
        ▼                 ▼
   {Suggest provider  !CANNOT BULK MAP!
    based on pattern} "Claims too different"
        │              "Map individually"
        ▼
   [Review suggestion]
   "Map all 15 to Nairobi Hospital?"
        │
        ▼
   [Confirm or cancel]
        │
        ▼
   {Batch update all claims}
   {Create mapping records}
   {Log bulk action}
        │
        ▼
   "✅ 15 claims mapped"
        │
        ▼
   END
```

### Pattern Learning

After each mapping, system learns:

1. **Create Pattern Record:**
   ```sql
   INSERT INTO invoice_provider_mappings (
     invoice_number,
     provider_id,
     confidence_score,
     mapping_method,
     mapped_by,
     created_at
   ) VALUES (
     'RBILL-NAI-2024-342',
     'uuid-of-nairobi-hospital',
     92,
     'AI_SUGGESTION_ACCEPTED',
     'user-uuid',
     NOW()
   );
   ```

2. **Update Provider Name Patterns:**
   ```sql
   INSERT INTO provider_name_patterns (
     provider_id,
     pattern_type,
     pattern_value,
     match_count
   ) VALUES (
     'uuid-of-nairobi-hospital',
     'INVOICE_PREFIX',
     'RBILL-NAI',
     1
   ) ON CONFLICT (provider_id, pattern_value)
   DO UPDATE SET match_count = match_count + 1;
   ```

3. **Improve Future Suggestions:**
   - Next claim with "RBILL-NAI-*" → automatically suggest Nairobi Hospital at 95%+ confidence
   - If pattern reaches 50+ matches → auto-map (no user confirmation needed)

### Error States

| Error Type | Cause | Resolution |
|------------|-------|------------|
| **No Suggestions** | New invoice pattern | User must manually search provider |
| **Low Confidence** | Conflicting data | Show multiple options, user chooses |
| **Provider Not Found** | Provider doesn't exist | Quick "Create Provider" button in mapper |
| **Network Error** | API timeout | Preserve selections, retry on reconnect |
| **Claim Already Mapped** | Race condition (multi-user) | Skip claim, show warning |

### Success Criteria

- ✅ Claim.provider_id updated
- ✅ Claim.status changed to "MAPPED"
- ✅ Mapping record created in invoice_provider_mappings
- ✅ Pattern learned for future suggestions
- ✅ Audit log entry with user ID
- ✅ AI confidence improves over time

### Edge Cases

1. **User disagrees with top suggestion:**
   - Selects 2nd or 3rd suggestion → system learns this preference
   - System downgrades weight of rejected pattern

2. **User manually searches every time:**
   - Indicates poor suggestions → flag for model retraining
   - Admin sees alert: "Manual search rate >50%"

3. **Multiple users mapping simultaneously:**
   - Real-time sync: Lock claim when user starts mapping
   - If other user maps same claim → show "Already mapped by [User]"

4. **Provider created mid-mapping:**
   - Refresh provider dropdown
   - New provider immediately available

---

## FLOW 4: VIEW PROVIDER ANALYTICS

**Purpose:** Drill down into provider performance metrics
**Role Required:** All roles (read access)
**Time Estimate:** 2-5 minutes
**Entry Point:** /providers

### Flow Diagram

```
START: User navigates to Providers page
│
▼
{System loads provider list}
{Calculate KPIs for each provider}
│
▼
[View provider table]
│  • 127 providers
│  • Sortable columns
│  • Risk indicators
│
▼
[Apply filters (optional)]
│  • Search by name
│  • Filter by risk (High/Med/Low)
│  • Filter by type (Hospital/Clinic)
│
▼
{Table updates with filtered results}
│
▼
[Select provider to drill down]
│
▼
[Click "View" or provider name]
│
▼
{Navigate to /providers/[id]}
{Load provider details}
{Query all related claims}
{Calculate analytics}
│
▼
[See Provider 360° Dashboard]
│
│  KPI Cards:
│  • Total Outstanding: KES 2.45M
│  • Total Collected: KES 18.2M
│  • AR Age: 42 days
│  • Risk Score: 68 (Medium)
│
│  Claims Trend Chart:
│  • Last 6 months line graph
│  • Disbursed vs Collected
│
│  Payer Breakdown:
│  • NHIF: 45 claims, KES 1.2M
│  • AAR: 23 claims, KES 680K
│  • (others...)
│
│  AR Aging Analysis:
│  • 0-30 days: 12 claims, KES 450K
│  • 31-60 days: 8 claims, KES 920K
│  • 61-90 days: 5 claims, KES 780K
│  • 90+ days: 3 claims, KES 300K
│
│  Recent Claims Table:
│  • Last 8 claims
│  • Status, amount, AR age
│
│  Risk Factors:
│  • ⚠️ AR age increasing
│  • ⚠️ 3 claims overdue >60 days
│  • ✅ Strong NHIF history
│
▼
[User actions available:]
│
├─[Edit Provider Details]
│    │
│    ▼
│    {Open edit dialog}
│    {Pre-fill current data}
│    {Allow updates}
│    {Save changes}
│    {Refresh dashboard}
│
├─[Export Data (CSV)]
│    │
│    ▼
│    {Generate CSV}
│    {Include claims, payments, KPIs}
│    {Download file}
│
├─[View All Claims]
│    │
│    ▼
│    {Navigate to Claims page}
│    {Pre-filter by provider_id}
│
├─[Map More Claims]
│    │
│    ▼
│    {Navigate to Mapper}
│    {Pre-filter by provider}
│
└─[Back to Provider List]
     │
     ▼
     {Return to /providers}
     │
     ▼
     END
```

### Drill-Down Navigation

```
Level 1: Provider List
   │
   ├── Filter/Search
   │
   ▼
Level 2: Provider Detail Page
   │
   ├── Overview KPIs
   ├── Claims Trend Chart
   ├── Payer Breakdown
   ├── AR Aging Analysis
   ├── Recent Claims
   ├── Risk Factors
   │
   ▼
Level 3: Claim Detail (click any claim)
   │
   ├── Full claim data
   ├── Collection history
   ├── Linked payer/scheme
   ├── Audit trail
   │
   ▼
Level 4: Payer Detail (click payer name)
   │
   ├── Payer performance
   ├── All providers using payer
   ├── Average payment days
   ├── Scheme breakdown
```

### Export Data Flow

```
[Click "Export CSV" on Provider page]
│
▼
{Show export options dialog}
│
│  What to export?
│  ☑ Provider summary
│  ☑ All claims
│  ☑ Collections history
│  ☑ AR aging breakdown
│  ☑ Risk factors
│
│  Date range:
│  [Last 12 months ▼]
│
▼
[Click "Export"]
│
▼
{System generates CSV}
{Includes selected data}
{Format for Excel compatibility}
│
▼
{Download file}
"Nairobi_Hospital_Analytics_2024-03-07.csv"
│
▼
[User opens in Excel]
│
▼
END: Data exported
```

### Filter & Search Flow

```
[User types in search box: "nairobi"]
│
▼
{Debounce 300ms}
│
▼
{Filter providers where:}
  name ILIKE '%nairobi%'
│
▼
{Show results in table}
"3 providers match"
│
│  • Nairobi Hospital
│  • Nairobi Women's Hospital
│  • Nairobi South Hospital
│
▼
[Apply additional filter: Risk = High]
│
▼
{Combine filters (AND logic)}
│
▼
{Show refined results}
"1 provider matches"
│
│  • Nairobi Hospital (High risk)
│
▼
[Click "Clear Filters"]
│
▼
{Reset to show all 127 providers}
│
▼
END
```

### Success Criteria

- ✅ Provider list loads in <2 seconds
- ✅ Drill-down shows accurate KPIs
- ✅ Charts render correctly
- ✅ Export includes all requested data
- ✅ Filters work in real-time
- ✅ Back button preserves filter state

### Edge Cases

1. **Provider with no claims:**
   - Show "No claims mapped yet"
   - Show "Map Claims" button
   - Hide charts (no data)

2. **Provider with only old claims (>1 year):**
   - Show warning "No recent activity"
   - Suggest "Mark as Inactive?"

3. **Very large provider (1000+ claims):**
   - Paginate claims table
   - Lazy load charts
   - Show summary stats first

4. **Provider deleted while viewing:**
   - Show "Provider no longer exists"
   - Redirect to list

---

## FLOW 5: NAVIGATE VIA HYPERLINKS

**Purpose:** Seamlessly navigate between interconnected data
**Role Required:** All roles
**Time Estimate:** Instant (click-through)
**Entry Point:** Any page with linked data

### Flow Diagram

```
START: User on any page with linked entities
│
▼
EXAMPLE PATH 1: Transaction → Provider → Payer
├─────────────────────────────────────────────┐
│                                             │
│  [View Transactions table]                  │
│   Invoice | Provider          | Amount     │
│   INV-001 | Nairobi Hospital  | KES 125K   │
│                    │                        │
│                    │ (click)                │
│                    ▼                        │
│  {Navigate to /providers/uuid-123}         │
│                    │                        │
│                    ▼                        │
│  [Provider 360° page loads]                │
│   • See all claims                          │
│   • Payer breakdown shows:                  │
│     NHIF: 45 claims ← (clickable)          │
│                    │                        │
│                    │ (click NHIF)           │
│                    ▼                        │
│  {Navigate to /payers/uuid-456}            │
│                    │                        │
│                    ▼                        │
│  [Payer Detail page loads]                 │
│   • All providers using NHIF                │
│   • Payment performance                     │
│   • Scheme breakdown                        │
│                    │                        │
│                    ▼                        │
│  [Click scheme: "NHIF Outpatient"]         │
│                    │                        │
│                    ▼                        │
│  {Navigate to /schemes/uuid-789}           │
│                    │                        │
│                    ▼                        │
│  [Scheme Detail page loads]                │
│   • All claims under this scheme            │
│   • Provider performance                    │
│                                             │
└─────────────────────────────────────────────┘

EXAMPLE PATH 2: Provider → Claim → Patient (encrypted)
├─────────────────────────────────────────────┐
│                                             │
│  [On Provider page]                         │
│                    │                        │
│                    ▼                        │
│  [Recent Claims table]                      │
│   Invoice     | Patient    | Amount        │
│   INV-2024-01 | J***N D**E | KES 89K       │
│                    │                        │
│                    │ (click invoice)        │
│                    ▼                        │
│  {Navigate to /claims/uuid-claim}          │
│                    │                        │
│                    ▼                        │
│  [Claim Detail page]                       │
│   • Full claim data                         │
│   • Patient: J***N D**E (encrypted)        │
│   • Provider: Nairobi Hospital (link)      │
│   • Payer: NHIF (link)                     │
│   • Scheme: NHIF Outpatient (link)         │
│   • Collection history                      │
│                    │                        │
│                    ▼                        │
│  [Breadcrumb navigation]                   │
│   Home > Providers > Nairobi > Claim-01   │
│                    │                        │
│                    │ (click Providers)      │
│                    ▼                        │
│  {Back to /providers}                      │
│                                             │
└─────────────────────────────────────────────┘

EXAMPLE PATH 3: Risk Dashboard → High Risk Provider
├─────────────────────────────────────────────┐
│                                             │
│  [Risk Dashboard]                           │
│                    │                        │
│                    ▼                        │
│  [High Risk Providers widget]              │
│   • MP Shah Hospital (Risk: 85)            │
│   • Kenyatta National (Risk: 78)           │
│                    │                        │
│                    │ (click MP Shah)        │
│                    ▼                        │
│  {Navigate to /providers/mp-shah}          │
│                    │                        │
│                    ▼                        │
│  [Provider page with risk factors]         │
│   Risk Factors:                             │
│   • ❌ 8 claims overdue >90 days           │
│   • ⚠️ Concentration: 65% from NHIF        │
│                    │                        │
│                    │ (click "8 claims")     │
│                    ▼                        │
│  {Navigate to /claims?                     │
│    provider=mp-shah&                       │
│    status=overdue&                         │
│    ar_age=>90}                             │
│                    │                        │
│                    ▼                        │
│  [Filtered Claims table]                   │
│   • Shows only overdue claims               │
│   • Pre-filtered by provider                │
│                                             │
└─────────────────────────────────────────────┘
```

### Interconnected Navigation Map

```
                    ┌──────────────┐
                    │  DASHBOARD   │
                    │   (Home)     │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │PROVIDERS │◄──►│  CLAIMS  │◄──►│  PAYERS  │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
         │               │               │
         ├──────────┐    ├─────────┐     ├────────┐
         │          │    │         │     │        │
         ▼          ▼    ▼         ▼     ▼        ▼
    ┌────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
    │PROVIDER│  │  RISK   │  │COLLECTION│  │ SCHEMES │
    │ DETAIL │  │DASHBOARD│  │         │  │         │
    └────────┘  └─────────┘  └─────────┘  └─────────┘
         │                         │            │
         └─────────────┬───────────┴────────────┘
                       │
                       ▼
                ┌──────────────┐
                │ DATA QUALITY │
                │  DASHBOARD   │
                └──────────────┘

CLICKABLE ENTITIES IN TABLES:
• Provider Name → /providers/[id]
• Payer Name → /payers/[id]
• Scheme Name → /schemes/[id]
• Invoice Number → /claims/[id]
• Risk Score → /risk?provider=[id]
• AR Age → /claims?ar_age_min=[days]
```

### Breadcrumb Navigation

```
Every page shows breadcrumbs for context:

Example 1: Provider Detail
┌────────────────────────────────────────┐
│ Home > Providers > Nairobi Hospital    │
└────────────────────────────────────────┘
         │          │
         ▼          ▼
     (click)    (click)
         │          │
         ▼          ▼
    /dashboard  /providers

Example 2: Claim Detail
┌──────────────────────────────────────────────────────┐
│ Home > Providers > Aga Khan > Claims > INV-2024-342  │
└──────────────────────────────────────────────────────┘
         │          │          │         │
         └──────────┴──────────┴─────────┘
         (all clickable, navigate back)

Example 3: Scheme Detail
┌────────────────────────────────────────────────────┐
│ Home > Settings > Payers > NHIF > NHIF Outpatient │
└────────────────────────────────────────────────────┘
```

### Context Preservation

When navigating via links, preserve context:

```
User flow:
1. /providers (filtered: Risk=High)
2. Click "MP Shah Hospital"
3. /providers/mp-shah (detail page)
4. Click "Back" or "Providers" breadcrumb
5. Return to /providers (still filtered: Risk=High) ✅

Implementation:
• Store filter state in URL params
• Use Next.js router state
• Preserve scroll position
• Highlight previously selected row
```

### Success Criteria

- ✅ All entity names are clickable links
- ✅ Links open in same tab (not new tab)
- ✅ Back button works correctly
- ✅ Breadcrumbs reflect current path
- ✅ Filter state preserved on back navigation
- ✅ Loading states during navigation

### Edge Cases

1. **Deep linking to deleted entity:**
   - Show 404 page
   - Suggest: "View all providers" button

2. **Circular navigation (A→B→C→A):**
   - Works correctly, no infinite loop
   - Browser back button works

3. **Multi-tab usage:**
   - Each tab independent
   - No state conflicts

---

## FLOW 6: TRACK COLLECTIONS

**Purpose:** Record and track claim collections/payments
**Role Required:** Finance User or Admin
**Time Estimate:** 1-2 minutes per collection
**Entry Point:** /claims/[id] or /collections

### Flow Diagram

```
START: Finance user needs to record payment
│
▼
          <Entry point?>
                │
        ┌───────┴────────┐
        │                │
  From Claim     From Collections
   Detail           Dashboard
        │                │
        └────────┬───────┘
                 │
                 ▼
        [Open Record Collection form]
                 │
                 ▼
        {Pre-fill data if from claim}
        • Claim ID
        • Invoice number
        • Expected amount
        • Provider
        • Payer
                 │
                 ▼
        [Fill collection details]
        ┌─────────────────────────────┐
        │ Collection Date *           │
        │ [2024-03-07] (date picker)  │
        │                             │
        │ Amount Collected (KES) *    │
        │ [125,000]                   │
        │                             │
        │ Collection Method           │
        │ [Bank Transfer ▼]           │
        │ (Bank/Mpesa/Check/Cash)     │
        │                             │
        │ Reference Number            │
        │ [TXN-2024-0307-001]        │
        │                             │
        │ Notes (optional)            │
        │ [Full payment received...]  │
        └─────────────────────────────┘
                 │
                 ▼
        {Validate collection amount}
                 │
                 ▼
        <Amount matches expected?>
                 │
        ┌────────┴─────────┐
       YES                 NO
        │                   │
        ▼                   ▼
   [Save]          <Amount is less?>
        │                   │
        │          ┌────────┴─────────┐
        │         YES                 NO
        │          │ (partial)         │ (over-payment)
        │          ▼                   ▼
        │    [Confirm partial    [Confirm over-
        │     collection]         payment?]
        │          │                   │
        │          ▼                   ▼
        │    {Mark as "PARTIAL"}  {Mark as "OVERPAID"
        │     {Set shortfall}      {Set excess}
        │          │                   │
        └──────────┴───────────────────┘
                   │
                   ▼
          {Create collection record}
                   │
                   ▼
          {Update claim status}
          • "PENDING" → "COLLECTED" (full)
          • "PENDING" → "PARTIAL" (partial)
          • "PENDING" → "OVERPAID" (excess)
                   │
                   ▼
          {Recalculate AR aging}
          • If collected: AR age = 0
          • If partial: AR age continues
                   │
                   ▼
          {Update provider KPIs}
          • Total collected += amount
          • Outstanding -= amount
          • Avg AR age recalculated
                   │
                   ▼
          {Update payer performance}
          • Track payment speed
          • Update avg payment days
                   │
                   ▼
          {Create audit log}
          "Collection recorded by [user]"
                   │
                   ▼
          {Show success message}
          "✅ Collection recorded"
          "Claim INV-2024-342 marked as COLLECTED"
                   │
                   ▼
          [Navigate back to claim detail]
                   │
                   ▼
          [See updated status and AR age]
                   │
                   ▼
                  END
```

### Partial Collection Handling

```
Scenario: Expected KES 125,000, Received KES 100,000

[Record collection: KES 100,000]
│
▼
{System detects shortfall: KES 25,000}
│
▼
[Show warning dialog]
┌──────────────────────────────────────────┐
│  ⚠️ PARTIAL COLLECTION DETECTED          │
├──────────────────────────────────────────┤
│                                          │
│  Expected:    KES 125,000                │
│  Received:    KES 100,000                │
│  Shortfall:   KES  25,000 (20%)          │
│                                          │
│  What would you like to do?              │
│                                          │
│  ○ Record partial, expect balance later  │
│  ○ Mark claim as settled (write-off)     │
│  ○ Cancel and verify amount              │
│                                          │
│  [Cancel]              [Confirm]         │
└──────────────────────────────────────────┘
│
▼
         <User choice?>
                │
        ┌───────┴────────┐
        │                │
  Record partial    Mark settled
        │                │
        ▼                ▼
{Create collection  {Create collection
 KES 100,000}        KES 100,000}
{Mark claim as     {Mark claim as
 "PARTIAL"}          "SETTLED"}
{Set balance:      {Write off KES 25K}
 KES 25,000}        {Audit log reason}
        │                │
        └────────┬───────┘
                 │
                 ▼
        {Update AR aging}
        • Partial: Continue aging on balance
        • Settled: Stop aging, close claim
                 │
                 ▼
                END
```

### Match Collection to Claim

When recording from Collections Dashboard (not claim detail):

```
[Collections Dashboard]
│
▼
[Click "Record New Collection"]
│
▼
[Search for claim/invoice]
│  • Search by invoice number
│  • Search by provider
│  • Search by amount
│  • Filter by date range
│
▼
{Show matching claims}
│
│  Invoice      Provider          Amount      Status
│  INV-2024-342 Nairobi Hospital  KES 125K   Pending
│  INV-2024-289 Nairobi Hospital  KES 89K    Pending
│
▼
[Select correct claim]
│
▼
{Pre-fill collection form}
│
▼
[Continue with Flow 6 main path...]
```

### Update AR Aging

```
Before Collection:
┌──────────────────────────────────────┐
│  Claim: INV-2024-342                 │
│  Invoice Date: 2024-02-15            │
│  Today: 2024-03-07                   │
│  AR Age: 21 days                     │
│  Status: PENDING                     │
└──────────────────────────────────────┘

After Full Collection:
┌──────────────────────────────────────┐
│  Claim: INV-2024-342                 │
│  Invoice Date: 2024-02-15            │
│  Collected: 2024-03-07               │
│  AR Age: 0 days (closed)             │
│  Status: COLLECTED                   │
│  Collection Days: 21                 │
└──────────────────────────────────────┘

After Partial Collection:
┌──────────────────────────────────────┐
│  Claim: INV-2024-342                 │
│  Invoice Date: 2024-02-15            │
│  Partial Collected: 2024-03-07       │
│  AR Age: 21 days (continues)         │
│  Status: PARTIAL                     │
│  Outstanding: KES 25,000             │
└──────────────────────────────────────┘
```

### Success Criteria

- ✅ Collection record created in database
- ✅ Claim status updated
- ✅ Provider outstanding balance reduced
- ✅ AR aging recalculated
- ✅ Payer payment days updated
- ✅ Audit log entry created
- ✅ User notified of success

### Edge Cases

1. **Duplicate collection:**
   - Check if invoice already has collection
   - Show warning: "Collection already recorded on [date]"
   - Allow: "Record additional collection" (if partial)

2. **Future collection date:**
   - Show warning: "Date is in the future"
   - Confirm: "Are you sure? This will be recorded as expected collection"

3. **Overpayment scenario:**
   - Expected: KES 100K
   - Received: KES 120K
   - Excess: KES 20K
   - Options:
     - Apply excess to another claim
     - Record as credit balance
     - Return to provider

4. **Collection before invoice date:**
   - Invalid scenario
   - Show error: "Collection date cannot be before invoice date"

---

## FLOW 7: RISK ASSESSMENT

**Purpose:** Automatically calculate and manually override risk scores
**Role Required:** System (auto) or Admin (manual override)
**Time Estimate:** Real-time (auto) or 2-3 minutes (manual)
**Entry Point:** Background job or /providers/[id]

### Automatic Risk Calculation Flow

```
START: Trigger event occurs
│
▼
          <What triggered?>
                │
        ┌───────┴────────┬────────────┐
        │                │            │
  New collection   Claim mapped   Daily job
   recorded         to provider     (batch)
        │                │            │
        └────────────────┴────────────┘
                         │
                         ▼
            {Load provider data}
            • All claims
            • Collections history
            • Current AR aging
            • Payer concentration
                         │
                         ▼
            {Calculate risk factors}
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
    [AR Age Risk]  [Concentration] [Payment]
                       [Risk]      [History]
            │            │            │
            └────────────┼────────────┘
                         │
                         ▼
            {Compute weighted score}
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│  RISK SCORING FORMULA                                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Factor 1: AR Age Risk (40% weight)                 │
│  ────────────────────────────────────               │
│  • Avg AR age < 30 days    = 0 points               │
│  • Avg AR age 30-60 days   = 20 points              │
│  • Avg AR age 60-90 days   = 35 points              │
│  • Avg AR age > 90 days    = 50 points              │
│                                                      │
│  Factor 2: Concentration Risk (30% weight)          │
│  ──────────────────────────────────────             │
│  • Top payer < 40% of total    = 0 points           │
│  • Top payer 40-60% of total   = 15 points          │
│  • Top payer 60-80% of total   = 25 points          │
│  • Top payer > 80% of total    = 40 points          │
│                                                      │
│  Factor 3: Payment History (20% weight)             │
│  ──────────────────────────────────────             │
│  • 0 overdue claims            = 0 points           │
│  • 1-3 overdue (>60 days)      = 10 points          │
│  • 4-10 overdue                = 20 points          │
│  • 10+ overdue                 = 30 points          │
│                                                      │
│  Factor 4: Outstanding Amount (10% weight)          │
│  ──────────────────────────────────────             │
│  • < KES 1M outstanding        = 0 points           │
│  • KES 1M - 3M                 = 5 points           │
│  • KES 3M - 5M                 = 10 points          │
│  • > KES 5M outstanding        = 15 points          │
│                                                      │
│  TOTAL RISK SCORE: Sum of all factors (0-100)       │
│                                                      │
│  Risk Levels:                                       │
│  • 0-33:   Low Risk    (Green)                      │
│  • 34-66:  Medium Risk (Yellow)                     │
│  • 67-100: High Risk   (Red)                        │
│                                                      │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
            {Assign risk category}
                         │
                         ▼
            {Calculate discount rate}
            Based on risk:
            • Low (0-33):    0.5% discount
            • Medium (34-66): 1.5% discount
            • High (67-100):  3.0% discount
                         │
                         ▼
            {Check concentration limits}
                         │
                         ▼
         <Exceeds concentration?>
                         │
                ┌────────┴─────────┐
               YES                 NO
                │                   │
                ▼                   ▼
        {Flag for review}    {Update provider}
        "⚠️ Concentration    {Save risk score}
         limit exceeded:     {Save discount}
         NHIF = 68%"         {Update timestamp}
                │                   │
                └────────┬──────────┘
                         │
                         ▼
                {Create audit log}
                "Risk score updated: 68"
                "Reason: AR age increased"
                         │
                         ▼
                {Notify if threshold}
                         │
                         ▼
         <Risk changed category?>
                         │
                ┌────────┴─────────┐
               YES                 NO
                │                   │
                ▼                   ▼
        {Send alert email}    {Silent update}
        "Provider [Name]
         now HIGH risk"
                │                   │
                └────────┬──────────┘
                         │
                         ▼
                    END: Risk updated
```

### Manual Override Flow

```
START: Admin reviews risk score
│
▼
[On Provider Detail page]
│
│  Current Risk Score: 68 (Medium)
│  System Calculated: 2024-03-07
│
▼
[Click "Override Risk Score"]
│
▼
{Open override dialog}
┌──────────────────────────────────────────┐
│  MANUAL RISK OVERRIDE                    │
├──────────────────────────────────────────┤
│                                          │
│  Current System Score: 68 (Medium)       │
│                                          │
│  Risk Factors:                           │
│  • AR Age: 42 days (+35 points)         │
│  • Concentration: NHIF 49% (+15 points) │
│  • Overdue: 3 claims (+10 points)       │
│  • Outstanding: KES 2.4M (+5 points)    │
│                                          │
│  ─────────────────────────────────────   │
│                                          │
│  Override Score: [__75__]  (0-100)      │
│                   (slider)               │
│                                          │
│  Override Reason: *Required              │
│  ┌────────────────────────────────────┐ │
│  │ Provider has secured new contract  │ │
│  │ with AAR Insurance worth KES 5M,   │ │
│  │ reducing concentration risk. Also, │ │
│  │ management committed to faster     │ │
│  │ collections starting next month.   │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Valid Until:                            │
│  [2024-04-07] (30 days default)         │
│                                          │
│  [Cancel]              [Save Override]  │
└──────────────────────────────────────────┘
│
▼
[Click "Save Override"]
│
▼
{Validate override}
│  • Reason must be >20 characters
│  • Valid until must be future date
│  • Score must be 0-100
│
▼
         <Valid?>
                │
        ┌───────┴────────┐
       YES               NO
        │                 │
        ▼                 ▼
{Save override}     {Show errors}
{Create record:}    "Reason too short"
• provider_id            │
• override_score         ▼
• system_score      [Fix errors]
• reason                 │
• overridden_by          │
• valid_until            │
• created_at        └────┘
        │
        ▼
{Update provider}
{Set risk_score = 75}
{Set risk_override = true}
        │
        ▼
{Recalculate discount}
High risk (75) → 3.0% discount
        │
        ▼
{Create audit log}
"Risk manually overridden by [Admin]"
"68 → 75"
"Reason: New AAR contract..."
        │
        ▼
{Set expiration job}
{On 2024-04-07:}
• Revert to system score
• Notify admin
• Re-audit
        │
        ▼
{Show success message}
"✅ Risk score overridden"
"Will revert to system score on 2024-04-07"
        │
        ▼
[Return to Provider page]
│
│  Risk Score: 75 (High) 🔒 OVERRIDDEN
│  System would calculate: 68
│  Override expires: 2024-04-07
│  Reason: [click to view]
│
▼
END: Override active
```

### Concentration Limit Enforcement

```
During risk calculation:

{Check concentration}
│
▼
Top payer share = NHIF 68% of outstanding
│
▼
         <Exceeds limit (60%)?>
                │
        ┌───────┴────────┐
       YES               NO
        │                 │
        ▼                 ▼
{Add concentration  {Pass concentration
 risk points}        check}
 +25 points          +0 points
        │                 │
        ▼                 ▼
{Flag provider}     {No flag}
┌──────────────┐
│ ⚠️ Warning:  │
│ Concentration│
│ Risk         │
│              │
│ NHIF: 68%    │
│ Limit: 60%   │
│              │
│ Actions:     │
│ • Diversify  │
│ • Reduce     │
│   exposure   │
└──────────────┘
        │
        └────────┬───────┘
                 │
                 ▼
        {Update risk score}
                 │
                 ▼
                END
```

### Automatic Re-assessment

```
Scheduled Job: Daily at 2:00 AM

{Load all providers}
│
▼
{For each provider:}
│
├─{Calculate current risk}
├─{Compare to previous score}
│
▼
         <Score changed >10 points?>
                │
        ┌───────┴────────┐
       YES               NO
        │                 │
        ▼                 ▼
{Update risk}       {Skip update}
{Send alert}        {Log: "No change"}
        │                 │
        └────────┬────────┘
                 │
                 ▼
{Check manual overrides}
│
▼
         <Override expired?>
                │
        ┌───────┴────────┐
       YES               NO
        │                 │
        ▼                 ▼
{Revert to system} {Keep override}
{Notify admin}     {Decrement TTL}
        │                 │
        └────────┬────────┘
                 │
                 ▼
{Generate risk report}
"Daily Risk Assessment"
• 12 providers increased risk
• 5 providers decreased risk
• 3 overrides expired
                 │
                 ▼
{Email to admin}
                 │
                 ▼
                END
```

### Success Criteria

- ✅ Risk score calculated accurately
- ✅ Discount rate applied correctly
- ✅ Concentration limits enforced
- ✅ Manual overrides expire automatically
- ✅ Audit trail complete
- ✅ Alerts sent when risk changes

### Edge Cases

1. **Provider with no claims:**
   - Risk score = 0 (lowest)
   - Discount = 0.5% (default low)
   - Note: "No claims to assess"

2. **All claims paid immediately:**
   - AR age = 0
   - Risk score very low
   - Discount = 0.5%

3. **Override conflict (multiple admins):**
   - Last override wins
   - Log all attempts
   - Show warning: "Another admin overrode this 5 min ago"

4. **Expired override during calculation:**
   - Auto-revert to system score
   - Recalculate immediately
   - Notify admin

---

## FLOW 8: DATA QUALITY MONITORING

**Purpose:** Continuously monitor and improve data quality
**Role Required:** System (auto) or Admin (manual fixes)
**Time Estimate:** Real-time validation + periodic review
**Entry Point:** Upload triggers or /data-quality dashboard

### Flow Diagram

```
START: Data quality check triggered
│
▼
          <Trigger type?>
                │
        ┌───────┴─────────┬──────────────┐
        │                 │              │
  File upload      Manual edit    Scheduled job
   (Flow 2)        (any entity)    (daily 3AM)
        │                 │              │
        └─────────────────┴──────────────┘
                          │
                          ▼
            {Run validation suite}
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             ▼             ▼
    [Required      [Data Format]  [Business]
     Fields]       [Validation]   [Logic]
            │             │             │
            └─────────────┼─────────────┘
                          │
                          ▼
            {Categorize issues}
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             ▼             ▼
        CRITICAL      WARNINGS      INFO
        (Errors)     (Non-blocking) (FYI)
            │             │             │
            └─────────────┼─────────────┘
                          │
                          ▼
                {Update quality score}
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│  DATA QUALITY SCORE CALCULATION                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Component 1: Completeness (40%)                    │
│  ────────────────────────────────                   │
│  Required fields filled / Total records = %         │
│                                                      │
│  Component 2: Accuracy (30%)                        │
│  ────────────────────────────                       │
│  Valid formats / Total fields = %                   │
│                                                      │
│  Component 3: Consistency (20%)                     │
│  ─────────────────────────────                      │
│  Referential integrity / Total refs = %             │
│                                                      │
│  Component 4: Timeliness (10%)                      │
│  ────────────────────────────                       │
│  Records updated < 30 days / Total = %              │
│                                                      │
│  Overall Score: Weighted average                    │
│                                                      │
│  Quality Levels:                                    │
│  • 90-100%: Excellent (Green)                       │
│  • 70-89%:  Good (Yellow)                           │
│  • <70%:    Poor (Red)                              │
│                                                      │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
                {Store validation results}
                          │
                          ▼
         <Critical issues found?>
                          │
                ┌─────────┴──────────┐
               YES                   NO
                │                     │
                ▼                     ▼
        {Create alerts}         {Log success}
        {Flag for review}       "Quality: 94%"
                │                     │
                ▼                     ▼
        [Email admin]           [Update dashboard]
        "12 critical issues"          │
                │                     │
                └──────────┬──────────┘
                           │
                           ▼
                  {Update dashboard}
                  /data-quality
                           │
                           ▼
                      END: Quality checked
```

### Upload Validation Flow (Detailed)

```
User uploads Excel (see Flow 2)
│
▼
{Extract data from Excel}
│
▼
{For each row:}
│
├─ STEP 1: Required Field Validation
│  ┌────────────────────────────────┐
│  │ Check mandatory fields:        │
│  │ • invoice_number (required)    │
│  │ • invoice_amount (required)    │
│  │ • invoice_date (required)      │
│  │                                │
│  │ Missing field?                 │
│  │ → ❌ CRITICAL ERROR            │
│  │ → Skip row                     │
│  │ → Log to error_log             │
│  └────────────────────────────────┘
│         │
│         ▼
├─ STEP 2: Format Validation
│  ┌────────────────────────────────┐
│  │ Check data types:              │
│  │ • Dates: YYYY-MM-DD            │
│  │ • Amounts: Numeric >0          │
│  │ • Claim type: IP/OP only       │
│  │                                │
│  │ Invalid format?                │
│  │ → ❌ CRITICAL ERROR            │
│  │ → Skip row                     │
│  │ → Show specific error          │
│  └────────────────────────────────┘
│         │
│         ▼
├─ STEP 3: Business Logic Validation
│  ┌────────────────────────────────┐
│  │ Check business rules:          │
│  │ • Amount < KES 10M             │
│  │ • Invoice date <= today        │
│  │ • Service date <= today + 30   │
│  │                                │
│  │ Rule violated?                 │
│  │ → ❌ ERROR or ⚠️ WARNING       │
│  │ → Log with context             │
│  └────────────────────────────────┘
│         │
│         ▼
├─ STEP 4: Duplicate Check
│  ┌────────────────────────────────┐
│  │ Check for duplicates:          │
│  │ • In current file (row-wise)   │
│  │ • In database (query)          │
│  │                                │
│  │ Duplicate found?               │
│  │ → ❌ CRITICAL ERROR            │
│  │ → Show which record conflicts  │
│  └────────────────────────────────┘
│         │
│         ▼
├─ STEP 5: Referential Integrity
│  ┌────────────────────────────────┐
│  │ Check relationships:           │
│  │ • Provider exists (if mapped)  │
│  │ • Payer exists (if provided)   │
│  │ • Scheme exists (if provided)  │
│  │                                │
│  │ Reference broken?              │
│  │ → ⚠️ WARNING                   │
│  │ → Can still import             │
│  └────────────────────────────────┘
│         │
│         ▼
└─ STEP 6: Optional Field Warnings
   ┌────────────────────────────────┐
   │ Check optional fields:         │
   │ • Patient name (privacy)       │
   │ • Approval number (audit)      │
   │ • Member number (tracking)     │
   │                                │
   │ Missing optional?              │
   │ → ⚠️ WARNING                   │
   │ → Still imports                │
   └────────────────────────────────┘
            │
            ▼
   {Compile validation report}
            │
            ▼
   {Show to user (see Flow 2)}
            │
            ▼
          END
```

### Issue Detection & Resolution Flow

```
{Validation detects issue}
│
▼
{Create issue record}
data_quality_issues:
• issue_type
• entity_type
• entity_id
• severity (critical/warning/info)
• description
• detected_at
• resolved_at (null)
• resolved_by (null)
│
▼
{Display on Data Quality Dashboard}
│
▼
[Admin reviews issue]
│
▼
          <Issue type?>
                │
        ┌───────┴─────────┬──────────────┐
        │                 │              │
  Missing data     Invalid format   Duplicate
        │                 │              │
        ▼                 ▼              ▼
 [Fill missing]    [Fix format]   [Merge/Delete]
        │                 │              │
        └─────────────────┴──────────────┘
                          │
                          ▼
              [Click "Fix Now" button]
                          │
                          ▼
              {Open fix wizard}
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
        [Edit inline] [Bulk fix] [Skip/Ignore]
              │           │           │
              └───────────┼───────────┘
                          │
                          ▼
              {Apply fix}
              {Re-validate}
                          │
                          ▼
              <Fix successful?>
                          │
                ┌─────────┴──────────┐
               YES                   NO
                │                     │
                ▼                     ▼
        {Mark issue      {Show error}
         as resolved}    "Fix failed"
        {Update score}   "Try again"
                │                     │
                └──────────┬──────────┘
                           │
                           ▼
                  {Refresh dashboard}
                           │
                           ▼
                      END: Issue handled
```

### Unmapped Provider Warning Flow

```
After upload (Flow 2):

{Count unmapped claims}
│
▼
         <Any unmapped?>
                │
        ┌───────┴────────┐
       YES               NO
        │                 │
        ▼                 ▼
{Create DQ issue}    {All good}
┌──────────────────┐
│ ⚠️ DATA QUALITY  │
│                  │
│ 87 claims have   │
│ no provider      │
│                  │
│ Impact:          │
│ • No KPIs        │
│ • No analytics   │
│ • No risk calc   │
│                  │
│ Resolution:      │
│ [Map Providers]  │
│                  │
└──────────────────┘
        │
        ▼
[Click "Map Providers"]
│
▼
{Navigate to /claims/map}
│
▼
[Follow Flow 3: Manual Mapping]
│
▼
{As claims get mapped...}
│
▼
{Unmapped count decreases}
│
▼
{Data quality score improves}
│
▼
         <All mapped?>
                │
        ┌───────┴────────┐
       YES               NO
        │                 │
        ▼                 ▼
{Auto-resolve    {Keep warning}
 DQ issue}       {Show progress}
"✅ All claims   "65% mapped"
 now mapped"     "22 remaining"
        │                 │
        └────────┬────────┘
                 │
                 ▼
{Update dashboard}
"Data Quality: 94%"
                 │
                 ▼
                END
```

### Periodic Data Quality Review

```
Scheduled: Daily at 3:00 AM

{Run full data scan}
│
▼
{Check all entities:}
│
├─ Providers
│  • Complete profiles?
│  • Active but no claims?
│  • Duplicate names?
│
├─ Claims
│  • Orphaned claims (no provider)?
│  • Stale claims (>1 year old)?
│  • Inconsistent amounts?
│
├─ Payers
│  • No schemes defined?
│  • Schemes with no claims?
│
├─ Collections
│  • Collections without claims?
│  • Negative amounts?
│
└─ Mappings
   • Broken references?
   • Low confidence (<50%)?
            │
            ▼
   {Generate quality report}
            │
            ▼
   {Calculate trend}
   Today: 87%
   Yesterday: 85%
   Trend: ↑ Improving
            │
            ▼
   {Create summary}
   ┌─────────────────────────┐
   │ DATA QUALITY REPORT     │
   │ 2024-03-07              │
   ├─────────────────────────┤
   │ Overall: 87% (Good)     │
   │                         │
   │ Issues Found: 18        │
   │ • Critical: 3           │
   │ • Warnings: 12          │
   │ • Info: 3               │
   │                         │
   │ Top Issues:             │
   │ 1. 87 unmapped claims   │
   │ 2. 15 providers missing │
   │    contact info         │
   │ 3. 5 duplicate invoices │
   │                         │
   │ Actions Required:       │
   │ → Map claims            │
   │ → Update provider data  │
   │ → Resolve duplicates    │
   └─────────────────────────┘
            │
            ▼
   {Email to admin}
            │
            ▼
   {Update dashboard}
            │
            ▼
          END: Report complete
```

### Success Criteria

- ✅ All uploads validated before import
- ✅ Issues detected and categorized
- ✅ Quality score accurate and trending
- ✅ Admin alerted to critical issues
- ✅ Fixes tracked and audited
- ✅ Dashboard shows real-time status

### Edge Cases

1. **All data valid:**
   - Quality score = 100%
   - Show "Excellent" badge
   - No action required

2. **Massive data quality drop:**
   - Score drops >20% in one day
   - Trigger urgent alert
   - Auto-flag for investigation

3. **Issues resolved but score not updating:**
   - Re-run calculation manually
   - Check for caching issues
   - Verify triggers working

4. **Conflicting validation rules:**
   - Log conflict
   - Use most strict rule
   - Notify admin to resolve

---

## FLOW SUMMARY & TIME ESTIMATES

| Flow | User Role | Typical Time | Complexity |
|------|-----------|--------------|------------|
| **1. Onboard Provider** | Admin | 3-5 minutes | Medium |
| **2. Upload Claims** | Admin/Finance | 5-10 minutes | High |
| **3. Manual Mapping** | Finance | 30-60 sec/claim | Medium |
| **4. View Analytics** | All | 2-5 minutes | Low |
| **5. Navigate Links** | All | Instant | Low |
| **6. Track Collections** | Finance | 1-2 min/collection | Medium |
| **7. Risk Assessment** | System/Admin | Real-time / 3 min | High |
| **8. Data Quality** | System/Admin | Continuous / 10 min review | High |

---

## APPROVAL CHECKLIST

Review these user flows and confirm:

- [ ] All critical workflows documented
- [ ] Decision points clearly marked
- [ ] Error states and recovery paths defined
- [ ] Success criteria established
- [ ] Edge cases considered
- [ ] Time estimates realistic
- [ ] Role requirements clear
- [ ] Flows match UI wireframes (03_UI_WIREFRAMES.md)
- [ ] Flows align with database schema (02_DATABASE_DESIGN.md)
- [ ] ASCII diagrams are clear and readable

---

## NEXT STEPS

After approval of user flows:

1. **Review API Contracts** (04_API_CONTRACTS.md)
   - Ensure endpoints support all flows
   - Validate request/response formats

2. **Design Component Tree** (06_COMPONENT_TREE.md)
   - Map UI components to flows
   - Identify reusable components

3. **Plan Implementation** (07_IMPLEMENTATION_PLAN.md)
   - Break flows into development tasks
   - Assign to parallel agents

---

**Status:** Ready for Review
**Created:** 2025-10-07
**Last Updated:** 2025-10-07
