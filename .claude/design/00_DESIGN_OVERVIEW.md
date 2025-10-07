# PROVIDER 360° ANALYTICS - DESIGN PACKAGE
## Option C: Hybrid Approach with Manual Provider Mapping

**Version:** 1.0
**Date:** October 2025
**Status:** Design Review - Awaiting Approval

---

## 📋 DESIGN DOCUMENTS INDEX

This design package contains comprehensive specifications for the Provider 360° Analytics module before any code is written.

### Core Documents

1. **[00_DESIGN_OVERVIEW.md](./00_DESIGN_OVERVIEW.md)** ← You are here
2. **[01_EXCEL_STRUCTURE.md](./01_EXCEL_STRUCTURE.md)** - Actual vs Expected data analysis
3. **[02_DATABASE_DESIGN.md](./02_DATABASE_DESIGN.md)** - Complete schema with ER diagrams
4. **[03_UI_WIREFRAMES.md](./03_UI_WIREFRAMES.md)** - All page layouts (ASCII mockups)
5. **[04_API_CONTRACTS.md](./04_API_CONTRACTS.md)** - Request/response specs
6. **[05_USER_FLOWS.md](./05_USER_FLOWS.md)** - Step-by-step workflows
7. **[06_COMPONENT_TREE.md](./06_COMPONENT_TREE.md)** - React component hierarchy
8. **[07_IMPLEMENTATION_PLAN.md](./07_IMPLEMENTATION_PLAN.md)** - Phased rollout with agents

---

## 🎯 DESIGN PHILOSOPHY - OPTION C

### The Challenge
Vitraya Excel currently provides **14 columns** but lacks the **7 new columns** needed for Provider 360°:
- ❌ Provider Name
- ❌ Provider Code
- ❌ Payer Name
- ❌ Payer Code
- ❌ Scheme Type
- ❌ Service Date
- ❌ Claim Type

### The Solution: 3-Phase Hybrid Approach

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: FOUNDATION (Week 1)                                │
├─────────────────────────────────────────────────────────────┤
│ - Import 14-column Excel as-is                              │
│ - Build Provider Management (manual CRUD)                   │
│ - Build Payer/Scheme Management                             │
│ - Seed 10 Kenyan providers from BRD                         │
│                                                              │
│ Result: Clean database, manual onboarding ready             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: MANUAL MAPPING (Week 2-3)                          │
├─────────────────────────────────────────────────────────────┤
│ - Build "Invoice → Provider Mapper" UI                      │
│ - Finance team manually assigns providers to claims         │
│ - Smart suggestions based on patterns                       │
│ - Bulk mapping tools                                         │
│ - Lookup tables for future auto-matching                    │
│                                                              │
│ Result: Claims linked to providers, analytics possible      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: AUTO-IMPORT (Future - When Vitraya Ready)          │
├─────────────────────────────────────────────────────────────┤
│ - Vitraya adds 7 new columns to Excel                       │
│ - Parser auto-extracts provider/payer                       │
│ - Backfill existing claims                                  │
│ - Manual mapping becomes obsolete                           │
│                                                              │
│ Result: Fully automated Provider 360°                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ SYSTEM ARCHITECTURE

### High-Level Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Provider   │  │   Claims     │  │   Manual     │         │
│  │  Management  │  │   Upload     │  │   Mapper     │         │
│  │   (CRUD)     │  │  (14 cols)   │  │   (NEW!)     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Provider    │  │  Provider    │  │   AR Aging   │         │
│  │    List      │  │  Drill-Down  │  │   Analysis   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS API ROUTES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /api/providers        /api/claims/upload    /api/mappings     │
│  /api/payers           /api/claims/import    /api/analytics    │
│  /api/schemes          /api/claims/validate  /api/risk         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BUSINESS LOGIC LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  - Excel Parser (14 cols)     - Risk Scoring Engine            │
│  - Provider Matcher (Fuzzy)   - AR Aging Calculator            │
│  - Validation Engine          - Concentration Monitor          │
│  - Mapping Suggestions        - KPI Aggregator                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE POSTGRES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  providers        claims              invoice_mappings          │
│  payers           collections         provider_name_patterns    │
│  schemes          upload_batches      audit_logs                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 KEY DESIGN DECISIONS

### 1. Database Schema
- **UUID primary keys** for all tables (Supabase default)
- **Claims table**: Store 14 columns as-is + `provider_id` (nullable initially)
- **New table**: `invoice_provider_mappings` for manual assignments
- **New table**: `provider_name_patterns` for auto-suggestions

### 2. Manual Mapping UI
- **Smart suggestions** based on:
  - Invoice number patterns (e.g., "RBILL" might be specific provider)
  - Historical mappings (remember previous assignments)
  - Claim amount patterns (high amounts → certain providers)
- **Bulk operations**: Map multiple invoices at once
- **Confidence scores**: Show how confident system is in suggestions

### 3. Excel Parser
- **Current**: Parse 14 columns from actual Vitraya file
- **Future-proof**: Design parser to accept optional 7 columns
- **Validation**: Strict checks on required fields
- **Error handling**: Graceful degradation if columns missing

### 4. Risk Scoring
- **Phase 1**: Use placeholder risk scores (like current MVP)
- **Phase 2**: Calculate from mapped historical data
- **Phase 3**: Real-time calculation as more data arrives

---

## 🎨 DESIGN PRINCIPLES

### User Experience
1. **Progressive Disclosure** - Show simple view first, advanced on demand
2. **Contextual Help** - Inline tooltips explaining each feature
3. **Undo/Redo** - All mapping operations reversible
4. **Bulk Actions** - Never force users to click 100 times

### Data Integrity
1. **Validation First** - Never let bad data into database
2. **Audit Everything** - Log all manual mappings
3. **Soft Deletes** - Keep history, never truly delete
4. **Idempotent Operations** - Re-uploading same file is safe

### Performance
1. **Pagination** - Never load 10K rows at once
2. **Lazy Loading** - Load details only when needed
3. **Caching** - Cache KPI calculations
4. **Background Jobs** - Large imports run async

### Security
1. **Patient Names Encrypted** - AES-256 encryption at rest
2. **Anonymized Display** - "J***N D**E" format in UI
3. **Audit Logs** - Who changed what, when
4. **RLS Policies** - Row-level security in Supabase

---

## 📈 SUCCESS METRICS

### Phase 1 Completion
- [ ] Import 100 claims from Vitraya Excel
- [ ] 10 providers onboarded manually
- [ ] 8 payers configured
- [ ] Zero TypeScript errors
- [ ] All tests passing

### Phase 2 Completion
- [ ] 100 claims mapped to providers
- [ ] Mapping suggestions >80% accurate
- [ ] Provider 360° dashboard shows accurate KPIs
- [ ] AR aging calculations validated
- [ ] Finance team trained and comfortable

### Phase 3 Ready
- [ ] Parser accepts 21 columns
- [ ] Auto-backfill runs successfully
- [ ] Manual mapping UI still available (backup)
- [ ] Performance <3 seconds with 10K claims

---

## 🚀 DELIVERABLES

### Design Phase (Current)
- [x] Excel structure analysis
- [ ] Database ER diagrams
- [ ] UI wireframes (all 8 pages)
- [ ] API contract documentation
- [ ] User flow diagrams
- [ ] Component hierarchy
- [ ] Implementation plan

### Build Phase (After Approval)
- [ ] Supabase database setup
- [ ] Provider management CRUD
- [ ] Excel parser (14 columns)
- [ ] Manual mapping UI
- [ ] Provider 360° analytics
- [ ] AR aging dashboard
- [ ] Risk scoring engine
- [ ] Testing suite
- [ ] Documentation

---

## 📞 REVIEW PROCESS

### How to Review This Design

1. **Read Each Document** - Start with Excel structure, then database, then UI
2. **Check Wireframes** - Visualize each page, imagine using it
3. **Review API Contracts** - Ensure endpoints make sense
4. **Validate Flows** - Walk through user workflows
5. **Ask Questions** - Clarify anything unclear
6. **Suggest Changes** - Mark what to modify

### Approval Checklist

- [ ] Excel structure matches actual file ✅
- [ ] Database schema supports all features
- [ ] UI wireframes are intuitive
- [ ] API contracts are complete
- [ ] User flows make sense
- [ ] Implementation plan is realistic
- [ ] Security requirements met
- [ ] Performance targets achievable

### Once Approved

**Say "APPROVED - START BUILD"** and I'll:
1. Launch 9 parallel agents
2. Build according to approved design
3. No surprises - code matches design exactly
4. Complete in 1 week

---

## 🎯 NEXT DOCUMENT

Continue to **[01_EXCEL_STRUCTURE.md](./01_EXCEL_STRUCTURE.md)** to see detailed analysis of the Vitraya Excel file.

---

**Status:** ⏸️ **Awaiting Design Review**
**Created:** 2025-10-07
**Last Updated:** 2025-10-07
