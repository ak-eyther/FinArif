# UI WIREFRAMES - PROVIDER 360° ANALYTICS

**Version:** 1.0
**Date:** October 2025
**Status:** Design Review

---

## TABLE OF CONTENTS

1. [Design System Overview](#design-system-overview)
2. [Navigation Flow Diagram](#navigation-flow-diagram)
3. [Page 1: Provider List (/providers)](#page-1-provider-list-providers)
4. [Page 2: Provider Drill-down (/providers/[id])](#page-2-provider-drill-down-providersid)
5. [Page 3: Payer Detail Page (/payers/[id])](#page-3-payer-detail-page-payersid) **NEW**
6. [Page 4: Scheme Detail Page (/schemes/[id])](#page-4-scheme-detail-page-schemesid) **NEW**
7. [Page 5: Transaction Detail (/transactions/[id])](#page-5-transaction-detail-transactionsid) **NEW**
8. [Page 6: Provider Settings/CRUD (/settings/providers)](#page-6-provider-settingscrud-settingsproviders)
9. [Page 7: Payer/Scheme Management (/settings/payers)](#page-7-payerscheme-management-settingspayers)
10. [Page 8: Claims Upload (/claims/upload)](#page-8-claims-upload-claimsupload)
11. [Page 9: Manual Invoice Mapper (/claims/map)](#page-9-manual-invoice-mapper-claimsmap)
12. [Page 10: Mapping Suggestions Dashboard](#page-10-mapping-suggestions-dashboard)
13. [Page 11: Data Quality Dashboard (/data-quality)](#page-11-data-quality-dashboard-data-quality)
14. [Hyperlink Interaction Patterns](#hyperlink-interaction-patterns)

---

## DESIGN SYSTEM OVERVIEW

### Layout Structure (All Pages)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (240px)                    HEADER (64px)                                   │
│  ┌──────────────┐  ┌───────────────────────────────────────────────────────────┐   │
│  │              │  │  FinArif Dashboard                         Board View      │   │
│  │   FinArif    │  │  Healthcare Claims Financing Platform      Executive      │   │
│  │              │  └───────────────────────────────────────────────────────────┘   │
│  ├──────────────┤  ┌───────────────────────────────────────────────────────────┐   │
│  │              │  │                                                             │   │
│  │  Dashboard   │  │                                                             │   │
│  │  Transactions│  │                                                             │   │
│  │  Risk        │  │                                                             │   │
│  │  Capital     │  │                    MAIN CONTENT AREA                        │   │
│  │              │  │                      (Scrollable)                           │   │
│  │  ─────────   │  │                                                             │   │
│  │  Providers   │  │                                                             │   │
│  │  Claims      │  │                                                             │   │
│  │  Settings    │  │                                                             │   │
│  │  Data Quality│  │                                                             │   │
│  │              │  │                                                             │   │
│  └──────────────┘  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Color Palette (FinArif Style)
- **Primary:** Blue (#2563EB)
- **Background:** Slate-50 (#F8FAFC)
- **Cards:** White (#FFFFFF)
- **Text Primary:** Slate-900 (#0F172A)
- **Text Secondary:** Slate-600 (#475569)
- **Borders:** Slate-200 (#E2E8F0)
- **Risk Colors:**
  - Low: Green (#22C55E)
  - Medium: Yellow (#EAB308)
  - High: Red (#EF4444)

### Typography
- **Page Title:** 3xl, Bold, Slate-900
- **Card Title:** lg, Semibold, Slate-900
- **Body:** sm, Medium, Slate-700
- **Muted:** sm, Regular, Slate-600

### Component Library
- **Cards:** White background, border, rounded-lg, shadow-sm
- **Buttons:** Primary (Blue-600), Secondary (Outline), Destructive (Red)
- **Badges:** Rounded-full, small text, colored backgrounds
- **Tables:** Striped rows, hover effect, sortable columns
- **Forms:** Label + Input, validation states, helper text

---

## NAVIGATION FLOW DIAGRAM

This diagram shows how all pages interconnect via hyperlinks throughout the application.

```
                                    ┌────────────────────┐
                                    │   MAIN DASHBOARD   │
                                    │   (/dashboard)     │
                                    └─────────┬──────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
          ┌──────────────────┐    ┌──────────────────┐      ┌──────────────────┐
          │  PROVIDER LIST   │    │   CLAIMS UPLOAD  │      │  DATA QUALITY    │
          │  (/providers)    │    │ (/claims/upload) │      │ (/data-quality)  │
          └────────┬─────────┘    └────────┬─────────┘      └──────────────────┘
                   │                       │
                   │ Click                 │ After Import
                   │ Provider              │
                   │ Name                  ▼
                   │              ┌──────────────────┐
                   │              │  INVOICE MAPPER  │◄─────────────┐
                   │              │  (/claims/map)   │              │
                   │              └────────┬─────────┘              │
                   │                       │                        │
                   ▼                       │ Click Mapped           │
          ┌──────────────────┐            │ Provider               │
          │ PROVIDER DETAIL  │◄───────────┘                        │
          │ (/providers/[id])│                                     │
          └────────┬─────────┘                                     │
                   │                                                │
                   │ Click                                          │
                   │ Payer/Scheme/Transaction                       │
                   │                                                │
       ┌───────────┼──────────────┐                                │
       │           │              │                                │
       ▼           ▼              ▼                                │
┌─────────────┐ ┌──────────┐ ┌─────────────┐                     │
│ PAYER       │ │ SCHEME   │ │TRANSACTION  │                     │
│ DETAIL      │ │ DETAIL   │ │ DETAIL      │                     │
│(/payers/[id])│ │(/schemes/│ │(/trans./[id])│                    │
└──────┬──────┘ │  [id])   │ └──────┬──────┘                     │
       │        └────┬─────┘        │                             │
       │             │              │                             │
       │             │              │  All these pages have       │
       │             │              │  clickable provider,        │
       └─────────────┴──────────────┴─ payer, scheme names ───────┘
                                      that link back to
                                      respective detail pages


SETTINGS & MANAGEMENT PAGES:
┌──────────────────────┐         ┌──────────────────────┐
│  PROVIDER SETTINGS   │         │  PAYER/SCHEME MGMT   │
│ (/settings/providers)│         │  (/settings/payers)  │
└──────────────────────┘         └──────────────────────┘
         │                                  │
         │ Edit Provider                    │ Edit Payer/Scheme
         │                                  │
         └──────────┬───────────────────────┘
                    │
                    ▼ Creates/Updates entities that appear as hyperlinks
              throughout the application

ANALYTICS & QUALITY:
┌──────────────────────┐         ┌──────────────────────┐
│ MAPPING SUGGESTIONS  │         │  DATA QUALITY DASH   │
│   DASHBOARD          │         │  (/data-quality)     │
└──────────────────────┘         └──────────────────────┘
         │                                  │
         │ Links to providers               │ Links to providers,
         │ with mapping issues              │ payers with issues
         │                                  │
         └──────────────────────────────────┘
```

### Navigation Principles

**1. Bi-directional Navigation**
- Every entity detail page links back to list views
- List views link to detail pages
- Detail pages cross-link to related entities

**2. Breadcrumb Navigation**
- All detail pages show breadcrumb trail
- Example: `Home > Providers > Nairobi Hospital > Claims`

**3. Contextual Links**
- Tables: Entity names are clickable
- Cards: Click entire card or specific links
- Charts: Data points link to filtered views

**4. Consistent Link Styling**
- All hyperlinks use Primary Blue (#2563EB)
- Hover: Underline + darker shade (#1E40AF)
- Visited: Slightly muted (#475569)
- Active/Current: Bold with background highlight

---

## PAGE 1: PROVIDER LIST (/providers)

**Purpose:** Overview of all healthcare providers with key performance metrics

### Full Page Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FinArif                            PROVIDERS                      Board View         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  Providers                                                                            │
│  Complete overview of healthcare provider performance and financials                  │
│                                                                                       │
│  ┌─────────────────────────┬─────────────────────────┬─────────────────────────┐   │
│  │  Total Outstanding      │  Average AR Age         │  Active Providers       │   │
│  │  KES 45.2M             │  28 days               │  127                    │   │
│  │  ↑ 12.5% vs last month │  ↓ 3 days              │  +8 this month          │   │
│  │  💰                     │  📅                     │  🏥                     │   │
│  └─────────────────────────┴─────────────────────────┴─────────────────────────┘   │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  FILTERS & SEARCH                                                              │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  🔍 Search providers...          [Risk: All ▼] [Type: All ▼] [Export CSV]    │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  PROVIDER PERFORMANCE TABLE                                      127 Providers  │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  Provider Name ↕  │ Type      │ Outstanding │ AR Age │ Risk   │ Actions      │  │
│  ├───────────────────┼───────────┼─────────────┼────────┼────────┼──────────────┤  │
│  │  🔗Nairobi Hospital│ Hospital  │ KES 2.4M   │ 42 days│ 🟡 Med │ [View] [Map] │  │
│  │  🔗Aga Khan HC     │ Hospital  │ KES 1.8M   │ 18 days│ 🟢 Low │ [View] [Map] │  │
│  │  🔗MP Shah Hospital│ Hospital  │ KES 3.1M   │ 65 days│ 🔴 High│ [View] [Map] │  │
│  │  🔗Gertrude's Hosp │ Specialty │ KES 950K   │ 22 days│ 🟢 Low │ [View] [Map] │  │
│  │  🔗Avenue Hospital │ Hospital  │ KES 1.6M   │ 35 days│ 🟡 Med │ [View] [Map] │  │
│  │  🔗Karen Hospital  │ Hospital  │ KES 2.2M   │ 29 days│ 🟢 Low │ [View] [Map] │  │
│  │  🔗Coptic Hospital │ Hospital  │ KES 1.3M   │ 51 days│ 🟡 Med │ [View] [Map] │  │
│  │  🔗Kenyatta Natl   │ Public    │ KES 5.8M   │ 88 days│ 🔴 High│ [View] [Map] │  │
│  │  🔗Mater Hospital  │ Hospital  │ KES 2.7M   │ 26 days│ 🟢 Low │ [View] [Map] │  │
│  │  🔗Mediheal Group  │ Network   │ KES 4.1M   │ 45 days│ 🟡 Med │ [View] [Map] │  │
│  │  ... (117 more)                                                                │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  [◄ Previous]  Page 1 of 13  [Next ►]                                         │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│  📝 HYPERLINK BEHAVIOR:                                                              │
│  • 🔗 = Clickable hyperlink (Blue text)                                             │
│  • Provider Name → Links to /providers/[id] (Provider drill-down)                   │
│  • Hover: Underline appears, cursor changes to pointer                              │
│  • Opens in same tab, maintains navigation context                                  │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  QUICK INSIGHTS                                                                │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  ⚠️  8 providers with AR age > 60 days (high risk)                            │  │
│  │  ✅  45 providers collected on time this month                                 │  │
│  │  📊  Top 10 providers = 68% of total outstanding                              │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**1. KPI Cards (Top Row)**
- 3 metric cards using `MetricCard` component
- Shows: Outstanding amount, AR aging average, provider count
- Includes trend indicators (up/down arrows)
- Icons: DollarSign, Calendar, Building2

**2. Filter Bar**
- Search input with magnifying glass icon
- Dropdown filters: Risk Level, Provider Type
- Export button (CSV download)
- Clear filters button

**3. Data Table**
- Sortable columns (click headers)
- Row actions: View details, Map claims
- Color-coded risk badges
- Pagination controls (10 rows per page)
- Responsive: Horizontal scroll on mobile

**4. Quick Insights Card**
- Bottom card with key alerts
- Warning icons for critical items
- Click to filter table

---

## PAGE 2: PROVIDER DRILL-DOWN (/providers/[id])

**Purpose:** Detailed 360° view of a single provider's performance, claims, and payments

### Full Page Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FinArif                    PROVIDER DETAILS                       Board View         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  🔗[← Back to Providers]                                                               │
│                                                                                       │
│  The Nairobi Hospital                                                [Edit] [Delete] │
│  Level 5 Hospital • Nairobi, Kenya • Active since Jan 2023                           │
│  Breadcrumb: 🔗Home > 🔗Providers > Nairobi Hospital                                 │
│                                                                                       │
│  ┌────────────────────┬────────────────────┬────────────────────┬─────────────────┐ │
│  │ Total Outstanding  │ Total Collected    │ AR Age (Avg)       │ Risk Score      │ │
│  │ KES 2,450,000     │ KES 18,200,000     │ 42 days           │ 68 (Medium)     │ │
│  │ ↑ 8.5% this month │ ↑ 15.2% this month │ ⚠️ +5 days        │ ⚠️ Increasing   │ │
│  └────────────────────┴────────────────────┴────────────────────┴─────────────────┘ │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  CLAIMS TREND (Last 6 Months)                                                │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │   KES                                                                        │    │
│  │   5M  ┤                                                     ●                │    │
│  │   4M  ┤                                   ●           ●                      │    │
│  │   3M  ┤                   ●         ●                                   ●    │    │
│  │   2M  ┤           ●                                                          │    │
│  │   1M  ┤     ●                                                                │    │
│  │       └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────    │    │
│  │         May   Jun   Jul   Aug   Sep   Oct   Nov   Dec   Jan   Feb   Mar     │    │
│  │                                                                              │    │
│  │  Legend: ● Total Disbursed    ■ Total Collected                             │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌────────────────────────────────────────┬───────────────────────────────────────┐ │
│  │  PAYER BREAKDOWN                       │  AR AGING ANALYSIS                    │ │
│  ├────────────────────────────────────────┼───────────────────────────────────────┤ │
│  │  Payer               Claims   Amount   │  Age Range        Claims     Amount   │ │
│  │  ─────────────────────────────────────  │  ──────────────────────────────────   │ │
│  │  🔗NHIF               45      KES 1.2M │  0-30 days         12      KES 450K  │ │
│  │  🔗AAR Insurance      23      KES 680K │  31-60 days        8       KES 920K  │ │
│  │  🔗Jubilee Insurance  18      KES 450K │  61-90 days        5       KES 780K  │ │
│  │  🔗CIC Insurance      12      KES 320K │  90+ days          3       KES 300K  │ │
│  │  🔗Madison Insurance   8      KES 180K │                                       │ │
│  │  Other (4 payers)      6      KES 120K │  Total Outstanding: 28    KES 2.45M  │ │
│  └────────────────────────────────────────┴───────────────────────────────────────┘ │
│                                                                                       │
│  📝 Payer names link to Payer Detail page (/payers/[id])                            │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  RECENT CLAIMS                                              [View All Claims] │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │  Invoice #      Payer            Amount      Service Date  Status    AR Age │    │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  🔗INV-2024-342 🔗NHIF           KES 125,000 2024-02-15   Pending   21 days │    │
│  │  🔗INV-2024-298 🔗AAR Insurance  KES 89,500  2024-02-10   Pending   26 days │    │
│  │  🔗INV-2024-267 🔗Jubilee        KES 156,000 2024-01-28   Collecting 38 days│    │
│  │  🔗INV-2024-234 🔗NHIF           KES 210,000 2024-01-20   Collecting 46 days│    │
│  │  🔗INV-2024-189 🔗CIC Insurance  KES 78,900  2024-01-15   Overdue   51 days │    │
│  │  🔗INV-2024-156 🔗NHIF           KES 95,000  2023-12-28   Overdue   69 days │    │
│  │  🔗INV-2024-123 🔗AAR Insurance  KES 167,500 2023-12-20   Collected -       │    │
│  │  🔗INV-2024-098 🔗Madison        KES 45,000  2023-12-15   Collected -       │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  📝 HYPERLINKS IN CLAIMS TABLE:                                                      │
│  • Invoice # → Links to /transactions/[id] (Transaction detail page)                │
│  • Payer Name → Links to /payers/[id] (Payer detail page)                          │
│  • Hover: Blue text with underline                                                   │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  RISK FACTORS                                                                  │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  ⚠️  AR age increasing (42 days vs 37 days last month)                        │  │
│  │  ⚠️  3 claims overdue > 60 days (KES 300K total)                              │  │
│  │  ✅  Strong payment history with NHIF (98% on-time)                           │  │
│  │  ℹ️  Concentration risk: 49% of outstanding from single payer                 │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**1. Provider Header**
- Provider name (H1)
- Metadata: Type, Location, Active since date
- Action buttons: Edit, Delete

**2. KPI Cards (4 Metrics)**
- Outstanding, Collected, AR Age, Risk Score
- Trend indicators with context

**3. Claims Trend Chart**
- Line/area chart showing 6-month trend
- X-axis: Months, Y-axis: Amount in KES
- Two series: Disbursed vs Collected
- Uses Recharts library

**4. Two-Column Layout**
- **Left:** Payer Breakdown (mini table)
- **Right:** AR Aging Analysis (buckets)

**5. Recent Claims Table**
- Last 8 claims for this provider
- Sortable, filterable
- Link to "View All Claims" page

**6. Risk Factors Alert Card**
- Color-coded warnings
- Actionable insights
- Links to filter views

---

## PAGE 3: PAYER DETAIL PAGE (/payers/[id])

**Purpose:** Detailed 360° view of a single insurance payer's performance, claims, and schemes

### Full Page Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FinArif                      PAYER DETAILS                        Board View         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  🔗[← Back to Payers]                                                                 │
│                                                                                       │
│  NHIF (National Hospital Insurance Fund)                         [Edit] [Delete]     │
│  Public Payer • Registration: GOV-001 • Active since 2010                            │
│  Breadcrumb: 🔗Home > 🔗Settings > 🔗Payers > NHIF                                   │
│                                                                                       │
│  ┌────────────────────┬────────────────────┬────────────────────┬─────────────────┐ │
│  │ Total Claims       │ Total Outstanding  │ Avg Payment Days   │ Active Schemes  │ │
│  │ 456                │ KES 5,450,000     │ 32 days           │ 4               │ │
│  │ ↑ 45 this month    │ ↑ 8.2% this month  │ ↓ 3 days          │ All active      │ │
│  └────────────────────┴────────────────────┴────────────────────┴─────────────────┘ │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  PAYMENT PERFORMANCE TREND (Last 6 Months)                                   │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │   Days                                                                       │    │
│  │   45  ┤                                                                      │    │
│  │   40  ┤     ●                                                                │    │
│  │   35  ┤           ●         ●                                                │    │
│  │   30  ┤                           ●         ●         ●                      │    │
│  │   25  ┤                                                                      │    │
│  │       └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────         │    │
│  │         Oct   Nov   Dec   Jan   Feb   Mar   Apr   May   Jun   Jul   Aug     │    │
│  │                                                                              │    │
│  │  Legend: ● Avg Days to Payment    ◆ Industry Average (35 days)             │    │
│  │  ✅ Payment speed improving (32 days vs 38 days 6 months ago)              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌────────────────────────────────────────┬───────────────────────────────────────┐ │
│  │  SCHEMES UNDER THIS PAYER             │  PROVIDER BREAKDOWN                    │ │
│  ├────────────────────────────────────────┼───────────────────────────────────────┤ │
│  │  Scheme Name         Claims   Amount   │  Provider          Claims    Amount   │ │
│  │  ──────────────────────────────────────  │  ──────────────────────────────────  │ │
│  │  🔗NHIF Outpatient   189      KES 2.1M │  🔗Nairobi Hospital 45      KES 1.2M │ │
│  │  🔗NHIF Inpatient    156      KES 2.4M │  🔗Aga Khan HC      34      KES 980K │ │
│  │  🔗NHIF Maternity    78       KES 720K │  🔗MP Shah Hospital 28      KES 750K │ │
│  │  🔗NHIF Chronic      33       KES 230K │  🔗Karen Hospital   23      KES 640K │ │
│  │                                         │  🔗Mater Hospital   19      KES 520K │ │
│  │  Total: 4 Schemes    456    KES 5.45M  │  Other (15 providers) 307  KES 1.36M │ │
│  └────────────────────────────────────────┴───────────────────────────────────────┘ │
│                                                                                       │
│  📝 Scheme names link to /schemes/[id], Provider names link to /providers/[id]      │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  RECENT CLAIMS FROM THIS PAYER                          [View All Claims]    │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │  Invoice #      Provider         Scheme         Amount      Status   AR Age │    │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  🔗INV-2024-342 🔗Nairobi Hosp.  🔗NHIF OP      KES 125K   Pending  21 days │    │
│  │  🔗INV-2024-234 🔗Nairobi Hosp.  🔗NHIF IP      KES 210K   Collect  46 days │    │
│  │  🔗INV-2024-156 🔗Aga Khan HC     🔗NHIF OP      KES 95K    Overdue  69 days │    │
│  │  🔗INV-2024-089 🔗Karen Hospital  🔗NHIF Mat     KES 145K   Pending  18 days │    │
│  │  🔗INV-2024-067 🔗Mater Hospital  🔗NHIF Chronic KES 67K    Collect  35 days │    │
│  │  🔗INV-2024-045 🔗MP Shah Hosp.   🔗NHIF IP      KES 234K   Collected -      │    │
│  │  🔗INV-2024-023 🔗Nairobi Hosp.  🔗NHIF OP      KES 89K    Collected -      │    │
│  │  🔗INV-2024-012 🔗Aga Khan HC     🔗NHIF IP      KES 178K   Collected -      │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  📝 All entity names (Invoice, Provider, Scheme) are clickable hyperlinks           │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  PAYMENT PERFORMANCE METRICS                                                 │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                              │    │
│  │  On-time Payment Rate:  ████████████████░░░░  78% (Target: 85%)            │    │
│  │  Approval Rate:         ██████████████████░░  92% (Industry avg: 88%)      │    │
│  │  Avg Discount Rate:     12% (Weighted average across schemes)              │    │
│  │                                                                              │    │
│  │  Payment Reliability Score: 🟢 85/100 (Good)                               │    │
│  │  • Consistent payment within 30-35 days                                    │    │
│  │  • High approval rate for eligible claims                                  │    │
│  │  • Minimal disputes or rejections                                          │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  INSIGHTS & ALERTS                                                             │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  ✅  Payment speed improving over last 6 months                               │  │
│  │  ⚠️  3 claims overdue > 60 days (KES 285K total) - escalate to collections   │  │
│  │  ℹ️  Top provider: Nairobi Hospital (45 claims, 10% of total volume)         │  │
│  │  📊  NHIF Outpatient is most active scheme (41% of claims)                    │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**1. Payer Header**
- Payer name (H1) with full official name
- Metadata: Type (Public/Private/HMO), Registration number, Active since
- Action buttons: Edit, Delete
- Breadcrumb navigation with clickable links

**2. KPI Cards (4 Metrics)**
- Total claims count
- Outstanding amount
- Average payment days (key metric)
- Active schemes count
- Trend indicators

**3. Payment Performance Chart**
- Line chart showing average days to payment over 6 months
- Comparison line: Industry average
- Shows improvement/decline trend
- X-axis: Months, Y-axis: Days

**4. Two-Column Layout**
- **Left: Schemes Table**
  - Lists all schemes under this payer
  - Clickable scheme names → /schemes/[id]
  - Shows claims count and amount per scheme

- **Right: Provider Breakdown**
  - Top providers claiming from this payer
  - Clickable provider names → /providers/[id]
  - Shows distribution of claims

**5. Recent Claims Table**
- Last 8 claims from this payer
- **All columns clickable:**
  - Invoice # → /transactions/[id]
  - Provider → /providers/[id]
  - Scheme → /schemes/[id]
- Status and AR age indicators

**6. Payment Performance Metrics**
- On-time payment rate (progress bar)
- Approval rate comparison
- Average discount rate
- Payment reliability score (0-100)
- Qualitative insights

**7. Insights & Alerts Card**
- Color-coded alerts (✅⚠️ℹ️📊)
- Actionable insights
- Links to filtered views

---

## PAGE 4: SCHEME DETAIL PAGE (/schemes/[id])

**Purpose:** Detailed view of a specific insurance scheme, its claims, providers, and payment terms

### Full Page Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FinArif                     SCHEME DETAILS                        Board View         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  🔗[← Back to Schemes]                                                                │
│                                                                                       │
│  NHIF Outpatient Scheme                                          [Edit] [Delete]     │
│  Parent Payer: 🔗NHIF • Type: Outpatient • Active since 2015                         │
│  Breadcrumb: 🔗Home > 🔗Settings > 🔗Payers > 🔗NHIF > NHIF Outpatient               │
│                                                                                       │
│  ┌────────────────────┬────────────────────┬────────────────────┬─────────────────┐ │
│  │ Total Claims       │ Total Outstanding  │ Avg Claim Amount   │ Active Providers│ │
│  │ 189                │ KES 2,100,000     │ KES 11,111        │ 23              │ │
│  │ ↑ 23 this month    │ ↑ 12.3% this month │ ↓ KES 450         │ Growing         │ │
│  └────────────────────┴────────────────────┴────────────────────┴─────────────────┘ │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  SCHEME INFORMATION                                                          │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                              │    │
│  │  Parent Payer:          🔗NHIF (National Hospital Insurance Fund)           │    │
│  │  Scheme Code:           SCH001                                              │    │
│  │  Scheme Type:           Outpatient (OP)                                     │    │
│  │  Coverage Description:  Basic outpatient services, consultations, pharmacy  │    │
│  │                         services, and diagnostic tests                       │    │
│  │                                                                              │    │
│  │  PAYMENT TERMS:                                                             │    │
│  │  • Payment Days:        30 days                                             │    │
│  │  • Discount Rate:       10% (standard NHIF discount)                        │    │
│  │  • Max Claim Amount:    KES 50,000 per claim                                │    │
│  │  • Approval Required:   No (automatic for < KES 10,000)                     │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌────────────────────────────────────────┬───────────────────────────────────────┐ │
│  │  PROVIDER BREAKDOWN                    │  CLAIM VOLUME TREND                   │ │
│  ├────────────────────────────────────────┼───────────────────────────────────────┤ │
│  │  Provider          Claims     Amount   │   Claims                              │ │
│  │  ──────────────────────────────────────  │   60  ┤                              │ │
│  │  🔗Nairobi Hospital 28       KES 340K  │   50  ┤                         ●    │ │
│  │  🔗Aga Khan HC      19       KES 245K  │   40  ┤                   ●          │ │
│  │  🔗Karen Hospital   15       KES 189K  │   30  ┤           ●                  │ │
│  │  🔗Mater Hospital   12       KES 156K  │   20  ┤     ●                        │ │
│  │  🔗MP Shah Hosp.    11       KES 138K  │   10  ┤                              │ │
│  │  Other (18 providers)104     KES 1.03M │       └────┴────┴────┴────┴────     │ │
│  │                                         │         Mar  Apr  May  Jun  Jul     │ │
│  │  Total: 23 Providers 189   KES 2.10M   │   Growing 145% over last 5 months   │ │
│  └────────────────────────────────────────┴───────────────────────────────────────┘ │
│                                                                                       │
│  📝 Provider names link to /providers/[id]                                          │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  RECENT CLAIMS UNDER THIS SCHEME                        [View All Claims]    │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │  Invoice #      Provider         Amount      Service Date  Status   AR Age  │    │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  🔗INV-2024-342 🔗Nairobi Hosp.  KES 12,500  2024-07-15   Pending  21 days  │    │
│  │  🔗INV-2024-289 🔗Aga Khan HC     KES 8,900   2024-07-12   Pending  24 days  │    │
│  │  🔗INV-2024-245 🔗Karen Hospital  KES 15,600  2024-07-08   Collecting 28 days│    │
│  │  🔗INV-2024-198 🔗Mater Hospital  KES 9,200   2024-07-05   Collecting 31 days│    │
│  │  🔗INV-2024-156 🔗Nairobi Hosp.  KES 11,100  2024-06-28   Overdue  38 days  │    │
│  │  🔗INV-2024-123 🔗MP Shah Hosp.   KES 13,400  2024-06-25   Collected -       │    │
│  │  🔗INV-2024-098 🔗Aga Khan HC     KES 7,800   2024-06-20   Collected -       │    │
│  │  🔗INV-2024-067 🔗Karen Hospital  KES 14,200  2024-06-15   Collected -       │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  📝 Invoice # → /transactions/[id], Provider → /providers/[id]                      │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  SCHEME PERFORMANCE METRICS                                                  │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                              │    │
│  │  Utilization Rate:      ██████████████░░░░░░  68% of eligible providers    │    │
│  │  Approval Rate:         ████████████████████  98% (very high)              │    │
│  │  Avg Processing Time:   22 days (Target: 30 days) ✅                       │    │
│  │  Claim Rejection Rate:  2% (Industry avg: 8%)                              │    │
│  │                                                                              │    │
│  │  Scheme Health Score: 🟢 92/100 (Excellent)                                │    │
│  │  • Fast approval times                                                      │    │
│  │  • Low rejection rate                                                       │    │
│  │  • Growing provider adoption                                                │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  RELATED SCHEMES (from same payer)                                             │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  🔗NHIF Inpatient        156 claims    KES 2.4M    IP      Active            │  │
│  │  🔗NHIF Maternity        78 claims     KES 720K    IP      Active            │  │
│  │  🔗NHIF Chronic Disease  33 claims     KES 230K    OP      Active            │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  INSIGHTS & RECOMMENDATIONS                                                    │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  ✅  Excellent approval rate (98%) - reliable payer for this scheme           │  │
│  │  ✅  Growing adoption - 23 providers actively using this scheme               │  │
│  │  📊  Most popular with hospital-type providers (67% of claims)                │  │
│  │  💡  Opportunity: 42 registered providers haven't filed claims yet            │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**1. Scheme Header**
- Scheme name (H1)
- Parent payer link (clickable → /payers/[id])
- Metadata: Type (OP/IP), Active since
- Breadcrumb with clickable links showing hierarchy
- Action buttons: Edit, Delete

**2. KPI Cards (4 Metrics)**
- Total claims count
- Outstanding amount
- Average claim amount
- Active providers using this scheme

**3. Scheme Information Panel**
- Parent payer (clickable link)
- Scheme code
- Type and coverage description
- **Payment Terms:**
  - Payment days
  - Discount rate
  - Max claim amount
  - Approval requirements

**4. Two-Column Layout**
- **Left: Provider Breakdown**
  - Providers using this scheme
  - Clickable provider names
  - Claims count and amount per provider

- **Right: Claim Volume Trend**
  - Mini line chart showing growth
  - Shows trend over 5 months

**5. Recent Claims Table**
- Claims filed under this scheme
- **Clickable columns:**
  - Invoice # → /transactions/[id]
  - Provider → /providers/[id]
- Shows status and AR age

**6. Scheme Performance Metrics**
- Utilization rate (how many eligible providers use it)
- Approval rate
- Average processing time
- Claim rejection rate
- Scheme health score (0-100)

**7. Related Schemes**
- Other schemes from same parent payer
- Clickable links to sibling schemes
- Quick comparison of volume

**8. Insights & Recommendations**
- Performance highlights
- Growth indicators
- Opportunities for expansion

---

## PAGE 5: TRANSACTION DETAIL (/transactions/[id])

**Purpose:** Detailed view of a single claim/invoice transaction

### Full Page Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FinArif                  TRANSACTION DETAILS                      Board View         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  🔗[← Back to Claims]                                                                 │
│                                                                                       │
│  Invoice #INV-2024-342                                           [Edit] [Delete]     │
│  Submitted: 2024-07-15 • Last Updated: 2024-07-20 • Status: 🟡 Pending Payment       │
│  Breadcrumb: 🔗Home > 🔗Claims > INV-2024-342                                        │
│                                                                                       │
│  ┌────────────────────┬────────────────────┬────────────────────┬─────────────────┐ │
│  │ Claim Amount       │ Expected Payment   │ AR Age             │ Status          │ │
│  │ KES 125,000       │ KES 112,500       │ 21 days           │ Pending         │ │
│  │ Gross invoice      │ After 10% discount │ Within terms       │ On track        │ │
│  └────────────────────┴────────────────────┴────────────────────┴─────────────────┘ │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  CLAIM INFORMATION                                                           │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                              │    │
│  │  Invoice Number:        INV-2024-342                                        │    │
│  │  Service Date:          2024-07-15                                          │    │
│  │  Invoice Date:          2024-07-15                                          │    │
│  │  Claim Type:            Outpatient (OP)                                     │    │
│  │                                                                              │    │
│  │  PARTIES:                                                                   │    │
│  │  Provider:              🔗Nairobi Hospital (PROV001)                        │    │
│  │  Payer:                 🔗NHIF (PAY001)                                     │    │
│  │  Scheme:                🔗NHIF Outpatient (SCH001)                          │    │
│  │  Patient:               J***N D**E (encrypted for privacy)                 │    │
│  │  Member Number:         NHIF-1234567                                        │    │
│  │                                                                              │    │
│  │  FINANCIAL DETAILS:                                                         │    │
│  │  Gross Amount:          KES 125,000                                         │    │
│  │  Discount Rate:         10% (per scheme terms)                              │    │
│  │  Discount Amount:       KES 12,500                                          │    │
│  │  Net Amount Payable:    KES 112,500                                         │    │
│  │  Payment Terms:         30 days from invoice date                           │    │
│  │  Expected Payment Date: 2024-08-14                                          │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  📝 Provider, Payer, and Scheme names are clickable hyperlinks                      │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  PAYMENT STATUS & TIMELINE                                                   │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                              │    │
│  │  Current Status:  🟡 Pending Payment                                        │    │
│  │  AR Age:          21 days (within payment terms)                            │    │
│  │  Days Until Due:  9 days                                                    │    │
│  │                                                                              │    │
│  │  TIMELINE:                                                                  │    │
│  │  ✅ 2024-07-15  Invoice submitted to system                                │    │
│  │  ✅ 2024-07-16  Validated and mapped to provider                           │    │
│  │  ✅ 2024-07-17  Sent to payer (NHIF) for processing                        │    │
│  │  🟡 2024-07-20  Pending approval (current stage)                           │    │
│  │  ⏳ 2024-08-14  Expected payment date                                      │    │
│  │                                                                              │    │
│  │  [Download Invoice PDF]  [Send Reminder to Payer]  [Mark as Collected]    │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌────────────────────────────────────────┬───────────────────────────────────────┐ │
│  │  RELATED TRANSACTIONS                  │  AUDIT LOG                            │ │
│  ├────────────────────────────────────────┼───────────────────────────────────────┤ │
│  │  Same Provider (Recent):               │  Date       User        Action        │ │
│  │  🔗INV-2024-234  KES 210K  Collecting  │  ──────────────────────────────────   │ │
│  │  🔗INV-2024-156  KES 95K   Overdue     │  2024-07-20 admin      Status update │ │
│  │  🔗INV-2024-123  KES 167K  Collected   │  2024-07-17 system     Send to payer │ │
│  │                                         │  2024-07-16 admin      Map provider  │ │
│  │  Same Payer (Recent):                  │  2024-07-15 system     Import claim  │ │
│  │  🔗INV-2024-339  KES 89K   Pending     │  2024-07-15 admin      Create record │ │
│  │  🔗INV-2024-298  KES 156K  Collecting  │                                       │ │
│  │  🔗INV-2024-267  KES 78K   Overdue     │  [View Full Audit Log]                │ │
│  └────────────────────────────────────────┴───────────────────────────────────────┘ │
│                                                                                       │
│  📝 Related invoice numbers link to their respective transaction detail pages       │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  NOTES & ATTACHMENTS                                                           │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                                │  │
│  │  Internal Notes (3):                                                          │  │
│  │  • 2024-07-17: Sent to NHIF for processing - admin@finarif.com               │  │
│  │  • 2024-07-16: Validated all fields, ready for submission                    │  │
│  │  • 2024-07-15: Imported from Vitraya_Claims_July2024.xlsx                    │  │
│  │                                                                                │  │
│  │  [+ Add Note]                                                                 │  │
│  │                                                                                │  │
│  │  Attachments (1):                                                             │  │
│  │  📄 Invoice_INV-2024-342.pdf (245 KB) [Download]                             │  │
│  │                                                                                │  │
│  │  [+ Upload Attachment]                                                        │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  ALERTS & RECOMMENDATIONS                                                      │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  ✅  Claim is within payment terms (9 days until due)                         │  │
│  │  ℹ️  NHIF typically pays within 30-35 days (track record: 78% on-time)       │  │
│  │  💡  Similar claims from this provider usually approved within 5-7 days       │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**1. Transaction Header**
- Invoice number (H1)
- Submission and update timestamps
- Status badge with color coding
- Breadcrumb navigation
- Action buttons: Edit, Delete

**2. KPI Cards (4 Metrics)**
- Claim amount (gross)
- Expected payment (after discount)
- AR age (days outstanding)
- Status (visual indicator)

**3. Claim Information Panel**
- Invoice details (number, dates, type)
- **Parties Section (all clickable):**
  - Provider → /providers/[id]
  - Payer → /payers/[id]
  - Scheme → /schemes/[id]
  - Patient (encrypted)
  - Member number
- **Financial Details:**
  - Gross, discount, net amounts
  - Payment terms
  - Expected payment date

**4. Payment Status & Timeline**
- Current status with days tracking
- **Interactive timeline:**
  - Past events (✅)
  - Current stage (🟡)
  - Future milestones (⏳)
- Action buttons: Download PDF, Send reminder, Mark collected

**5. Two-Column Layout**
- **Left: Related Transactions**
  - Same provider (recent claims)
  - Same payer (recent claims)
  - All invoice numbers clickable → /transactions/[id]

- **Right: Audit Log**
  - Chronological record of all changes
  - User and timestamp for each action
  - Link to full audit log

**6. Notes & Attachments**
- Internal notes (chronological)
- Add note functionality
- File attachments with download links
- Upload new attachment button

**7. Alerts & Recommendations**
- Payment timeline status
- Payer historical performance
- Predictive insights based on similar claims

---

## PAGE 6: PROVIDER SETTINGS/CRUD (/settings/providers)

**Purpose:** Manage provider master data - Create, Read, Update, Delete providers

### Full Page Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FinArif                   PROVIDER MANAGEMENT                     Board View         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  Provider Management                                                                  │
│  Create and manage healthcare provider profiles for claims tracking                  │
│                                                                                       │
│  [+ Add New Provider]                         🔍 Search providers...  [Export CSV]   │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  ACTIVE PROVIDERS                                              127 Total       │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  Code     │ Provider Name        │ Type      │ Location │ Status │ Actions   │  │
│  ├───────────┼──────────────────────┼───────────┼──────────┼────────┼───────────┤  │
│  │  PROV001  │ Nairobi Hospital     │ Hospital  │ Nairobi  │ Active │ [✏️] [🗑️] │  │
│  │  PROV002  │ Aga Khan HC          │ Hospital  │ Nairobi  │ Active │ [✏️] [🗑️] │  │
│  │  PROV003  │ MP Shah Hospital     │ Hospital  │ Nairobi  │ Active │ [✏️] [🗑️] │  │
│  │  PROV004  │ Gertrude's Hospital  │ Specialty │ Nairobi  │ Active │ [✏️] [🗑️] │  │
│  │  PROV005  │ Avenue Hospital      │ Hospital  │ Kisumu   │ Active │ [✏️] [🗑️] │  │
│  │  PROV006  │ Karen Hospital       │ Hospital  │ Nairobi  │ Active │ [✏️] [🗑️] │  │
│  │  PROV007  │ Coptic Hospital      │ Hospital  │ Nairobi  │ Inactive│[✏️] [🗑️] │  │
│  │  PROV008  │ Kenyatta National    │ Public    │ Nairobi  │ Active │ [✏️] [🗑️] │  │
│  │  PROV009  │ Mater Hospital       │ Hospital  │ Nairobi  │ Active │ [✏️] [🗑️] │  │
│  │  PROV010  │ Mediheal Group       │ Network   │ Multi    │ Active │ [✏️] [🗑️] │  │
│  │  ... (117 more)                                                                │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  [◄ Previous]  Page 1 of 13  [Next ►]                                         │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ADD/EDIT PROVIDER FORM (Dialog/Modal)                                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  Add New Provider                                                        [✕ Close]   │
│  ─────────────────────────────────────────────────────────────────────────────────   │
│                                                                                       │
│  BASIC INFORMATION                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  Provider Code *              Provider Name *                               │    │
│  │  ┌────────────────┐           ┌──────────────────────────────────────────┐  │    │
│  │  │ PROV011        │           │ St. Mary's Hospital                      │  │    │
│  │  └────────────────┘           └──────────────────────────────────────────┘  │    │
│  │  Auto-generated                                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  Provider Type *              Legal Entity Type                             │    │
│  │  ┌────────────────────┐       ┌────────────────────┐                       │    │
│  │  │ Hospital        ▼  │       │ Private Ltd     ▼  │                       │    │
│  │  └────────────────────┘       └────────────────────┘                       │    │
│  │  Hospital, Clinic, Specialty  Company, NGO, Public                         │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  CONTACT DETAILS                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  Physical Address                                                            │    │
│  │  ┌───────────────────────────────────────────────────────────────────────┐  │    │
│  │  │ Upper Hill, Nairobi                                                    │  │    │
│  │  └───────────────────────────────────────────────────────────────────────┘  │    │
│  │                                                                              │    │
│  │  County/Region *              City/Town *                                    │    │
│  │  ┌────────────────────┐       ┌────────────────────┐                       │    │
│  │  │ Nairobi         ▼  │       │ Nairobi            │                       │    │
│  │  └────────────────────┘       └────────────────────┘                       │    │
│  │                                                                              │    │
│  │  Phone Number                 Email Address                                 │    │
│  │  ┌────────────────────┐       ┌────────────────────┐                       │    │
│  │  │ +254 700 123 456   │       │ finance@stmarys.co.ke │                    │    │
│  │  └────────────────────┘       └────────────────────┘                       │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  FINANCIAL SETTINGS                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  Credit Limit (KES)           Payment Terms (Days)                          │    │
│  │  ┌────────────────────┐       ┌────────────────────┐                       │    │
│  │  │ 5,000,000          │       │ 45                 │                       │    │
│  │  └────────────────────┘       └────────────────────┘                       │    │
│  │  Maximum financing allowed     Expected collection period                   │    │
│  │                                                                              │    │
│  │  Risk Category *              Status *                                      │    │
│  │  ┌────────────────────┐       ┌────────────────────┐                       │    │
│  │  │ Low             ▼  │       │ Active          ▼  │                       │    │
│  │  └────────────────────┘       └────────────────────┘                       │    │
│  │  Low, Medium, High             Active, Inactive, Suspended                 │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  AUDIT INFORMATION (Auto-populated)                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  Created: 2024-03-07 14:23 by admin@finarif.com                            │    │
│  │  Last Modified: -                                                            │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ─────────────────────────────────────────────────────────────────────────────────   │
│  [Cancel]                                                   [Save Provider]          │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**1. Page Header**
- Title + description
- Primary action: "Add New Provider" button
- Search bar and export button

**2. Providers Table**
- Columns: Code, Name, Type, Location, Status
- Actions: Edit (pencil icon), Delete (trash icon)
- Sortable by all columns
- Pagination (10 per page)

**3. Add/Edit Provider Dialog**
- Modal overlay (shadcn/ui Dialog)
- **Section 1: Basic Information**
  - Provider Code (auto-generated, can override)
  - Provider Name (required)
  - Provider Type dropdown (Hospital, Clinic, Specialty, Network, Public)
  - Legal Entity Type dropdown

- **Section 2: Contact Details**
  - Physical Address (textarea)
  - County/Region dropdown (47 Kenyan counties)
  - City/Town text input
  - Phone Number (validated format)
  - Email Address (validated format)

- **Section 3: Financial Settings**
  - Credit Limit (number input, KES)
  - Payment Terms (days)
  - Risk Category dropdown (Low, Medium, High)
  - Status dropdown (Active, Inactive, Suspended)

- **Section 4: Audit Info**
  - Created timestamp + user (read-only)
  - Last modified timestamp + user (read-only)

**4. Validation**
- Required fields marked with *
- Real-time validation on blur
- Error messages below fields
- Disabled submit until valid

**5. Actions**
- Cancel: Close dialog, discard changes
- Save: Validate + save to database

---

## PAGE 4: PAYER/SCHEME MANAGEMENT (/settings/payers)

**Purpose:** Manage insurance payers and their scheme types

### Full Page Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FinArif                   PAYER & SCHEME MANAGEMENT               Board View         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  Payer & Scheme Management                                                            │
│  Configure insurance payers and their scheme types for claims processing              │
│                                                                                       │
│  ┌─────────────────────────────────────┬───────────────────────────────────────┐    │
│  │  PAYERS (8)                         │  SCHEMES (24)                         │    │
│  │  [+ Add Payer]                      │  [+ Add Scheme]                       │    │
│  └─────────────────────────────────────┴───────────────────────────────────────┘    │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  INSURANCE PAYERS                                                            │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │  Code      │ Payer Name             │ Type      │ Schemes │ Status │ Actions│    │
│  ├────────────┼────────────────────────┼───────────┼─────────┼────────┼────────┤    │
│  │  PAY001    │ NHIF                   │ Public    │ 4       │ Active │ [✏️][🗑️]│   │
│  │  PAY002    │ AAR Insurance          │ Private   │ 3       │ Active │ [✏️][🗑️]│   │
│  │  PAY003    │ Jubilee Insurance      │ Private   │ 5       │ Active │ [✏️][🗑️]│   │
│  │  PAY004    │ CIC Insurance          │ Private   │ 2       │ Active │ [✏️][🗑️]│   │
│  │  PAY005    │ Madison Insurance      │ Private   │ 3       │ Active │ [✏️][🗑️]│   │
│  │  PAY006    │ Britam Insurance       │ Private   │ 4       │ Active │ [✏️][🗑️]│   │
│  │  PAY007    │ Resolution Insurance   │ Private   │ 2       │ Active │ [✏️][🗑️]│   │
│  │  PAY008    │ APA Insurance          │ Private   │ 1       │ Inactive│[✏️][🗑️]│   │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  SCHEME TYPES BY PAYER                                                       │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │  Filter by Payer: [All Payers ▼]                       🔍 Search schemes...  │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │  Scheme Code │ Scheme Name          │ Payer           │ Type    │ Actions   │    │
│  ├──────────────┼──────────────────────┼─────────────────┼─────────┼───────────┤    │
│  │  SCH001      │ NHIF Outpatient      │ NHIF            │ OP      │ [✏️] [🗑️]  │    │
│  │  SCH002      │ NHIF Inpatient       │ NHIF            │ IP      │ [✏️] [🗑️]  │    │
│  │  SCH003      │ NHIF Maternity       │ NHIF            │ IP      │ [✏️] [🗑️]  │    │
│  │  SCH004      │ NHIF Chronic Disease │ NHIF            │ OP      │ [✏️] [🗑️]  │    │
│  │  SCH005      │ AAR Gold Plan        │ AAR Insurance   │ OP/IP   │ [✏️] [🗑️]  │    │
│  │  SCH006      │ AAR Silver Plan      │ AAR Insurance   │ OP      │ [✏️] [🗑️]  │    │
│  │  SCH007      │ AAR Corporate        │ AAR Insurance   │ OP/IP   │ [✏️] [🗑️]  │    │
│  │  SCH008      │ Jubilee Premier      │ Jubilee         │ OP/IP   │ [✏️] [🗑️]  │    │
│  │  SCH009      │ Jubilee Classic      │ Jubilee         │ OP      │ [✏️] [🗑️]  │    │
│  │  ... (15 more)                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  QUICK STATS                                                                 │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │  Total Payers: 8  │  Active: 7  │  Inactive: 1                              │    │
│  │  Total Schemes: 24  │  OP: 10  │  IP: 6  │  Combined: 8                     │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ADD/EDIT PAYER FORM (Dialog)                                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  Add New Payer                                                           [✕ Close]   │
│  ─────────────────────────────────────────────────────────────────────────────────   │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  Payer Code *                 Payer Name *                                   │    │
│  │  ┌────────────────┐           ┌──────────────────────────────────────────┐  │    │
│  │  │ PAY009         │           │ Sanlam General Insurance                 │  │    │
│  │  └────────────────┘           └──────────────────────────────────────────┘  │    │
│  │  Auto-generated                Official registered name                     │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  Payer Type *                 Registration Number                           │    │
│  │  ┌────────────────────┐       ┌────────────────────┐                       │    │
│  │  │ Private         ▼  │       │ INS-2018-456       │                       │    │
│  │  └────────────────────┘       └────────────────────┘                       │    │
│  │  Public, Private, HMO         IRA registration number                       │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  Contact Email                Contact Phone                                 │    │
│  │  ┌────────────────────┐       ┌────────────────────┐                       │    │
│  │  │ claims@sanlam.co.ke│       │ +254 20 1234567    │                       │    │
│  │  └────────────────────┘       └────────────────────┘                       │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  Default Payment Terms (Days) Status *                                      │    │
│  │  ┌────────────────────┐       ┌────────────────────┐                       │    │
│  │  │ 30                 │       │ Active          ▼  │                       │    │
│  │  └────────────────────┘       └────────────────────┘                       │    │
│  │  Expected days to payment      Active, Inactive                             │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ─────────────────────────────────────────────────────────────────────────────────   │
│  [Cancel]                                                   [Save Payer]             │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ADD/EDIT SCHEME FORM (Dialog)                                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  Add New Scheme                                                          [✕ Close]   │
│  ─────────────────────────────────────────────────────────────────────────────────   │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  Scheme Code *                Scheme Name *                                  │    │
│  │  ┌────────────────┐           ┌──────────────────────────────────────────┐  │    │
│  │  │ SCH025         │           │ Sanlam Platinum Cover                    │  │    │
│  │  └────────────────┘           └──────────────────────────────────────────┘  │    │
│  │  Auto-generated                Marketing name of scheme                     │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  Parent Payer *               Scheme Type *                                  │    │
│  │  ┌────────────────────┐       ┌────────────────────┐                       │    │
│  │  │ Sanlam General  ▼  │       │ OP/IP Combined  ▼  │                       │    │
│  │  └────────────────────┘       └────────────────────┘                       │    │
│  │  Select insurance company      Outpatient, Inpatient, Both                  │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  Description (Optional)                                                      │    │
│  │  ┌───────────────────────────────────────────────────────────────────────┐  │    │
│  │  │ Premium health cover with worldwide coverage and evacuation services  │  │    │
│  │  └───────────────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  Status *                                                                    │    │
│  │  ┌────────────────────┐                                                     │    │
│  │  │ Active          ▼  │                                                     │    │
│  │  └────────────────────┘                                                     │    │
│  │  Active, Inactive                                                            │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ─────────────────────────────────────────────────────────────────────────────────   │
│  [Cancel]                                                   [Save Scheme]            │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**1. Dual-Tab Layout**
- Top pills: "PAYERS (8)" | "SCHEMES (24)"
- Each tab has "Add" button

**2. Payers Table**
- Columns: Code, Name, Type, Scheme Count, Status
- Actions: Edit, Delete
- Color-coded status badges

**3. Schemes Table**
- Filter by parent payer dropdown
- Search functionality
- Columns: Code, Name, Payer, Type, Actions
- Linked to parent payer

**4. Add Payer Dialog**
- **Fields:**
  - Payer Code (auto)
  - Payer Name (required)
  - Payer Type (Public/Private/HMO)
  - Registration Number
  - Contact Email + Phone
  - Default Payment Terms (days)
  - Status dropdown

**5. Add Scheme Dialog**
- **Fields:**
  - Scheme Code (auto)
  - Scheme Name (required)
  - Parent Payer (dropdown, required)
  - Scheme Type (OP/IP/Combined)
  - Description (textarea, optional)
  - Status dropdown

**6. Relationships**
- One Payer → Many Schemes
- Cascade delete warning: "This payer has 5 schemes. Delete all?"

---

## PAGE 8: CLAIMS UPLOAD (/claims/upload)

**Purpose:** Upload Vitraya Excel files and import claims data

### Full Page Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FinArif                      CLAIMS UPLOAD                        Board View         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  Claims Upload                                                                        │
│  Import healthcare claims from Vitraya Excel exports                                  │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  STEP 1: SELECT FILE                                                           │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                                │  │
│  │      ┌───────────────────────────────────────────────────────────┐            │  │
│  │      │                                                             │            │  │
│  │      │              📁  Drag & Drop Excel File Here                │            │  │
│  │      │                        or                                  │            │  │
│  │      │                  [Choose File from Computer]               │            │  │
│  │      │                                                             │            │  │
│  │      │         Accepted formats: .xlsx, .xls                      │            │  │
│  │      │         Max size: 10 MB                                    │            │  │
│  │      │                                                             │            │  │
│  │      └───────────────────────────────────────────────────────────┘            │  │
│  │                                                                                │  │
│  │  ✅  File selected: Vitraya_Claims_March2024.xlsx (2.4 MB)                    │  │
│  │      Preview: 156 rows detected                                               │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  STEP 2: VALIDATE DATA                                         [Validate File] │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                                │  │
│  │  Validating...                                                                 │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░ 65% (102/156 rows)                │  │
│  │                                                                                │  │
│  │  ✅  Valid Rows: 148                                                          │  │
│  │  ⚠️  Warnings: 4 (missing optional fields)                                    │  │
│  │  ❌  Errors: 4 (invalid data, duplicates)                                     │  │
│  │                                                                                │  │
│  │  VALIDATION RESULTS                                                            │  │
│  │  ┌────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Row │ Status │ Issue                                                    │  │  │
│  │  ├─────┼────────┼──────────────────────────────────────────────────────────┤  │  │
│  │  │ 23  │ ❌     │ Invoice number already exists: INV-2024-001              │  │  │
│  │  │ 45  │ ❌     │ Invalid date format in Service Date column               │  │  │
│  │  │ 67  │ ⚠️     │ Missing patient name (optional but recommended)          │  │  │
│  │  │ 89  │ ❌     │ Claim amount exceeds maximum allowed (KES 10M)           │  │  │
│  │  │ 102 │ ⚠️     │ Provider 🔗"Nairobi Hosp" not found - needs mapping     │  │  │
│  │  │ 134 │ ❌     │ Invalid claim type (must be IP/OP)                       │  │  │
│  │  │ 145 │ ⚠️     │ Payer 🔗"NHIF" found, scheme missing                    │  │  │
│  │  └─────┴────────┴──────────────────────────────────────────────────────────┘  │  │
│  │                                                                                │  │
│  │  📝 Provider and Payer names in errors are clickable (if they exist in system)│  │
│  │                                                                                │  │
│  │  [Download Validation Report]      [Fix Errors & Re-upload]                   │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  STEP 3: REVIEW & IMPORT                                                       │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                                │  │
│  │  Import Summary:                                                               │  │
│  │  • 148 claims will be imported                                                 │  │
│  │  • 4 rows will be skipped (errors)                                             │  │
│  │  • 4 warnings (data will still be imported)                                    │  │
│  │  • Total claim value: KES 12,450,000                                           │  │
│  │                                                                                │  │
│  │  ⚠️  WARNING: All claims will be marked as "UNMAPPED"                         │  │
│  │     You must manually assign providers after import.                           │  │
│  │     → Go to Manual Invoice Mapper after import                                 │  │
│  │                                                                                │  │
│  │  Import Options:                                                               │  │
│  │  ☑ Skip duplicate invoices (recommended)                                      │  │
│  │  ☑ Create audit log entry                                                     │  │
│  │  ☑ Send email notification on completion                                      │  │
│  │  ☐ Auto-map providers (requires provider data in Excel)                       │  │
│  │                                                                                │  │
│  │  [Cancel]                                            [Import 148 Claims →]    │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  RECENT UPLOADS                                                                │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  Date       │ Filename                    │ Claims │ Status      │ Actions    │  │
│  ├────────────┼─────────────────────────────┼────────┼─────────────┼────────────┤  │
│  │  2024-03-07│ Vitraya_Claims_March.xlsx   │ 156    │ Processing  │ [View Log] │  │
│  │  2024-02-28│ Vitraya_Claims_Feb.xlsx     │ 142    │ ✅ Complete │ [View Log] │  │
│  │  2024-01-31│ Vitraya_Claims_Jan.xlsx     │ 189    │ ✅ Complete │ [View Log] │  │
│  │  2024-01-15│ Vitraya_Claims_Jan_Rev.xlsx │ 23     │ ⚠️ Partial  │ [View Log] │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**1. Step 1: File Upload**
- Drag-and-drop zone (react-dropzone)
- File type validation (.xlsx, .xls only)
- Size validation (max 10MB)
- File preview (name, size, row count)
- Clear file button

**2. Step 2: Validation**
- Progress bar showing validation progress
- Real-time validation results
- Three categories: Valid, Warnings, Errors
- **Validation Table:**
  - Row number
  - Status icon (✅⚠️❌)
  - Issue description
- Download validation report (CSV)
- Option to fix and re-upload

**3. Validation Rules**
- **Errors (blocking):**
  - Duplicate invoice numbers
  - Invalid date formats
  - Missing required fields (invoice, amount, date)
  - Amount out of range
  - Invalid claim type

- **Warnings (non-blocking):**
  - Missing optional fields
  - Future dates
  - Unusual patterns

**4. Step 3: Review & Import**
- Import summary stats
- Warning about unmapped providers
- Link to Manual Mapper
- **Import Options (checkboxes):**
  - Skip duplicates
  - Create audit log
  - Email notification
  - Auto-map providers (if columns present)
- Cancel or Import button

**5. Recent Uploads Table**
- Last 10 uploads
- Columns: Date, Filename, Claims Count, Status, Actions
- Status indicators: Processing, Complete, Partial, Failed
- View log action (opens modal with detailed log)

**6. Success State**
- After import: Success message
- Button: "Map Providers Now →" (goes to page 6)
- Button: "View Imported Claims"

---

## PAGE 9: MANUAL INVOICE MAPPER (/claims/map)

**Purpose:** Manually assign providers to unmapped claims (core workflow for Phase 2)

### Full Page Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FinArif                   MANUAL INVOICE MAPPER                   Board View         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  Manual Invoice Mapper                                                                │
│  Assign healthcare providers to unmapped claims                                       │
│                                                                                       │
│  ┌─────────────────────┬─────────────────────┬─────────────────────┬──────────────┐ │
│  │ Unmapped Claims     │ In Progress         │ Mapped Today        │ Auto-Matched │ │
│  │ 87                 │ 12                 │ 45                 │ 23           │ │
│  │ Needs attention     │ Being reviewed      │ Ready to process    │ Verified     │ │
│  └─────────────────────┴─────────────────────┴─────────────────────┴──────────────┘ │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  FILTERS & BULK ACTIONS                                                        │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  Status: [Unmapped ▼]  Amount: [All ▼]  Date: [Last 30 days ▼]              │  │
│  │                                                                                │  │
│  │  ☑ Select All (10 on this page)  [Bulk Map to Provider ▼]  [Mark Review]     │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  UNMAPPED CLAIMS QUEUE                                            87 claims    │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                                │  │
│  │  ┌────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ ☐  Invoice: INV-2024-342                            📋 Copy Invoice #   │  │  │
│  │  │     Amount: KES 125,000  │  Service Date: 2024-02-15  │  Payer: NHIF    │  │  │
│  │  │     Patient: J***N D**E (encrypted)  │  Claim Type: Outpatient           │  │  │
│  │  │                                                                           │  │  │
│  │  │     🤖 SMART SUGGESTIONS (Confidence Score)                              │  │  │
│  │  │     ┌────────────────────────────────────────────────────────────────┐  │  │  │
│  │  │     │ 1. Nairobi Hospital         92%  [Select] Why?                  │  │  │  │
│  │  │     │    • Similar invoice pattern: RBILL-NAI-*                       │  │  │  │
│  │  │     │    • 45 previous claims matched                                 │  │  │  │
│  │  │     │    • NHIF claims typically from this provider                   │  │  │  │
│  │  │     ├────────────────────────────────────────────────────────────────┤  │  │  │
│  │  │     │ 2. Aga Khan Hospital        67%  [Select] Why?                  │  │  │  │
│  │  │     │    • Similar claim amounts (avg KES 120K)                       │  │  │  │
│  │  │     │    • 12 previous NHIF claims                                    │  │  │  │
│  │  │     ├────────────────────────────────────────────────────────────────┤  │  │  │
│  │  │     │ 3. MP Shah Hospital         45%  [Select] Why?                  │  │  │  │
│  │  │     │    • Geographic proximity                                       │  │  │  │
│  │  │     └────────────────────────────────────────────────────────────────┘  │  │  │
│  │  │                                                                           │  │  │
│  │  │     Manual Selection: [Search providers... ▼]  [Create New Provider]    │  │  │
│  │  │                                                                           │  │  │
│  │  │     [Skip for Now]  [Mark as Unmatched]              [Save Mapping →]   │  │  │
│  │  └────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                │  │
│  │  ┌────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ ☐  Invoice: INV-2024-298                            📋 Copy Invoice #   │  │  │
│  │  │     Amount: KES 89,500  │  Service Date: 2024-02-10  │  Payer: AAR      │  │  │
│  │  │     Patient: S***H K***A  │  Claim Type: Inpatient                      │  │  │
│  │  │                                                                           │  │  │
│  │  │     🤖 SMART SUGGESTIONS (Confidence Score)                              │  │  │
│  │  │     ┌────────────────────────────────────────────────────────────────┐  │  │  │
│  │  │     │ 1. Aga Khan Hospital        89%  [Select] Why?                  │  │  │  │
│  │  │     │    • Invoice pattern: AK-*                                      │  │  │  │
│  │  │     │    • 78 previous AAR claims                                     │  │  │  │
│  │  │     ├────────────────────────────────────────────────────────────────┤  │  │  │
│  │  │     │ 2. MP Shah Hospital         34%  [Select] Why?                  │  │  │  │
│  │  │     │    • Similar amounts                                            │  │  │  │
│  │  │     └────────────────────────────────────────────────────────────────┘  │  │  │
│  │  │                                                                           │  │  │
│  │  │     Manual Selection: [Search providers... ▼]  [Create New Provider]    │  │  │
│  │  │     [Skip for Now]  [Mark as Unmatched]              [Save Mapping →]   │  │  │
│  │  └────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                │  │
│  │  ... (8 more claims on this page)                                             │  │
│  │                                                                                │  │
│  │  [◄ Previous]  Page 1 of 9  [Next ►]                                          │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  MAPPING HISTORY (Recent Activity)                                             │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  Time        │ User          │ Action                                         │  │
│  ├─────────────┼───────────────┼────────────────────────────────────────────────┤  │
│  │  2 min ago  │ admin@fin.com │ Mapped 🔗INV-2024-340 → 🔗Nairobi Hospital    │  │
│  │  5 min ago  │ admin@fin.com │ Mapped 🔗INV-2024-339 → 🔗Aga Khan (89%)      │  │
│  │  8 min ago  │ admin@fin.com │ Created new provider: 🔗St. Mary's Hospital   │  │
│  │  12 min ago │ admin@fin.com │ Bulk mapped 5 claims → 🔗Karen Hospital       │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│  📝 HYPERLINKS IN THIS PAGE:                                                         │
│  • Invoice numbers → Link to /transactions/[id] (Transaction detail)                 │
│  • Payer names → Link to /payers/[id] (Payer detail)                                │
│  • Provider suggestions → Link to /providers/[id] (Provider detail)                  │
│  • Mapped provider names in history → Link to /providers/[id]                        │
│  • All links open in same tab with hover underline                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**1. Status KPI Cards**
- 4 metrics: Unmapped, In Progress, Mapped Today, Auto-Matched
- Click to filter view

**2. Filter Bar**
- Dropdowns: Status, Amount range, Date range
- Bulk select checkbox
- Bulk actions dropdown: Map to Provider, Mark for Review, Export

**3. Claims Queue (Main Area)**
- Each claim shown as expandable card
- **Claim Header:**
  - Checkbox for bulk selection
  - Invoice number (with copy button)
  - Key fields: Amount, Date, Payer, Patient (encrypted), Type

**4. Smart Suggestions Section**
- AI-powered ranking (1-3 suggestions)
- Confidence score (percentage)
- **Why?** expandable explanation:
  - Invoice pattern matching
  - Historical mapping data
  - Amount patterns
  - Geographic/specialty matching
- Quick [Select] button for each suggestion

**5. Manual Selection**
- Searchable dropdown of all providers
- Type-ahead search
- "Create New Provider" quick action (opens modal)

**6. Claim Actions**
- Skip for Now: Move to bottom of queue
- Mark as Unmatched: Flag for later review
- Save Mapping: Confirm and save

**7. Mapping History**
- Real-time activity log
- Shows user, timestamp, action
- Undo button for recent actions (last 10)

**8. Keyboard Shortcuts**
- Enter: Select top suggestion
- 1-3: Select numbered suggestion
- S: Skip
- N: Next claim
- B: Back

---

## PAGE 10: MAPPING SUGGESTIONS DASHBOARD

**Purpose:** Analytics dashboard showing mapping quality, patterns, and improvement opportunities

### Full Page Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FinArif                 MAPPING SUGGESTIONS DASHBOARD             Board View         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  Mapping Suggestions Dashboard                                                        │
│  Monitor mapping quality and improve suggestion accuracy                              │
│                                                                                       │
│  ┌─────────────────────┬─────────────────────┬─────────────────────┬──────────────┐ │
│  │ Total Mappings      │ Avg Confidence      │ Auto-Match Rate     │ Manual Review│ │
│  │ 1,245              │ 78%                │ 34%                │ 87 claims    │ │
│  │ ↑ 156 this week     │ ↑ 5% improvement    │ ↑ 12% vs last week  │ Pending      │ │
│  └─────────────────────┴─────────────────────┴─────────────────────┴──────────────┘ │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  MAPPING ACCURACY TREND (Last 30 Days)                                       │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │   %                                                                          │    │
│  │   100 ┤                                                     ●────●           │    │
│  │    90 ┤                                   ●────●────●                        │    │
│  │    80 ┤                   ●────●                                             │    │
│  │    70 ┤           ●                                                          │    │
│  │    60 ┤     ●                                                                │    │
│  │       └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────         │    │
│  │         W1   W2   W3   W4   W5   W6   W7   W8   W9   W10  W11  W12         │    │
│  │                                                                              │    │
│  │  Legend: ● Avg Confidence Score    ■ User Acceptance Rate                   │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌────────────────────────────────────────┬───────────────────────────────────────┐ │
│  │  TOP PERFORMING PATTERNS              │  IMPROVEMENT OPPORTUNITIES             │ │
│  ├────────────────────────────────────────┼───────────────────────────────────────┤ │
│  │  Pattern          Accuracy   Mappings  │  Issue                     Impact     │ │
│  │  ──────────────────────────────────────  │  ──────────────────────────────────  │ │
│  │  RBILL-NAI-*      98%       234        │  Low confidence (<50%)     45 claims │ │
│  │  AK-INV-*         95%       189        │  Conflicting suggestions   23 claims │ │
│  │  MP-*             92%       156        │  No suggestions found      12 claims │ │
│  │  GH-2024-*        89%       98         │  Manual override common    8 claims  │ │
│  │  NHIF-OP-*        87%       267        │                                      │ │
│  │  KRN-*            85%       145        │  💡 Train model on these patterns    │ │
│  └────────────────────────────────────────┴───────────────────────────────────────┘ │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  PROVIDER MAPPING BREAKDOWN                                                  │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │  Provider              Auto   Manual  Total  Confidence  Review Needed      │    │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  Nairobi Hospital      189    45      234    92%        ✅ None             │    │
│  │  Aga Khan Hospital     156    33      189    88%        ✅ None             │    │
│  │  MP Shah Hospital      98     58      156    76%        ⚠️ 12 low confidence│    │
│  │  Gertrude's Hospital   87     11      98     95%        ✅ None             │    │
│  │  Avenue Hospital       45     23      68     68%        ⚠️ 8 conflicts      │    │
│  │  Karen Hospital        123    22      145    84%        ✅ None             │    │
│  │  Kenyatta National     34     89      123    45%        ❌ 34 manual review │    │
│  │  Mater Hospital        67     12      79     89%        ✅ None             │    │
│  │  ... (119 more)                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  SUGGESTION ENGINE INSIGHTS                                                  │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                              │    │
│  │  🎯 Suggestion Methods Performance:                                         │    │
│  │     ┌──────────────────────────────────────────────────────────┐           │    │
│  │     │ Invoice Pattern Matching    ████████████░░░░░  78%       │           │    │
│  │     │ Historical Claim Data       ██████████████░░░  85%       │           │    │
│  │     │ Amount Pattern              ████████░░░░░░░░░  56%       │           │    │
│  │     │ Payer-Provider Affinity     ███████████░░░░░░  67%       │           │    │
│  │     │ Geographic Proximity        █████░░░░░░░░░░░░  34%       │           │    │
│  │     └──────────────────────────────────────────────────────────┘           │    │
│  │                                                                              │    │
│  │  📊 Model Training Recommendations:                                         │    │
│  │     • Add 45 low-confidence mappings to training set                        │    │
│  │     • Review 23 conflicting suggestions (user chose different option)       │    │
│  │     • Improve geographic matching (lowest accuracy)                         │    │
│  │     • Add invoice pattern for new provider: St. Mary's Hospital             │    │
│  │                                                                              │    │
│  │  [Retrain Model]  [Export Training Data]  [View Detailed Analytics]        │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**1. KPI Cards**
- Total mappings count
- Average confidence score
- Auto-match rate (accepted without manual change)
- Manual review queue count

**2. Accuracy Trend Chart**
- Dual-line chart (Recharts)
- Blue line: Average confidence score
- Green line: User acceptance rate (% of top suggestions accepted)
- X-axis: Weeks, Y-axis: Percentage

**3. Top Performing Patterns Table**
- Invoice patterns that consistently match correctly
- Shows accuracy percentage and mapping count
- Used to identify reliable patterns

**4. Improvement Opportunities Panel**
- Identifies problematic areas:
  - Low confidence mappings
  - Conflicting suggestions (user chose different option)
  - No suggestions found
  - Frequent manual overrides
- Shows impact (number of claims)
- Action button: "Train model on these patterns"

**5. Provider Mapping Breakdown Table**
- Per-provider statistics:
  - Auto-mapped count
  - Manual-mapped count
  - Total mappings
  - Average confidence
  - Review needed (flags)
- Sortable by any column

**6. Suggestion Engine Insights**
- **Method Performance:**
  - Horizontal bar chart showing accuracy of each matching method
  - Invoice Pattern: 78%
  - Historical Data: 85%
  - Amount Pattern: 56%
  - Payer Affinity: 67%
  - Geography: 34%

- **Training Recommendations:**
  - Actionable insights to improve model
  - Links to affected claims
  - Retrain button (triggers background job)

**7. Actions**
- Retrain Model: Updates matching algorithm
- Export Training Data: Download CSV for analysis
- View Detailed Analytics: Full report page

---

## PAGE 11: DATA QUALITY DASHBOARD (/data-quality)

**Purpose:** Monitor data completeness, accuracy, and health across the system

### Full Page Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ FinArif                    DATA QUALITY DASHBOARD                 Board View         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  Data Quality Dashboard                                                               │
│  Monitor data completeness, accuracy, and system health                               │
│                                                                                       │
│  ┌─────────────────────┬─────────────────────┬─────────────────────┬──────────────┐ │
│  │ Overall Quality     │ Critical Issues     │ Data Completeness   │ Unmapped     │ │
│  │ 87%                │ 12                 │ 94%                │ 87 claims    │ │
│  │ 🟡 Good             │ 🔴 Needs attention  │ 🟢 Excellent        │ 7% of total  │ │
│  └─────────────────────┴─────────────────────┴─────────────────────┴──────────────┘ │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  DATA QUALITY SCORE TREND (Last 90 Days)                                     │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │   Score                                                                      │    │
│  │   100 ┤                                                                      │    │
│  │    90 ┤                           ●────●────●────●────●────●                │    │
│  │    80 ┤           ●────●────●                                                │    │
│  │    70 ┤     ●                                                                │    │
│  │    60 ┤                                                                      │    │
│  │       └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────         │    │
│  │         Jan   Jan   Feb   Feb   Mar   Mar   Apr   Apr   May   May   Jun     │    │
│  │          1    15    1     15    1     15    1     15    1     15    1       │    │
│  │                                                                              │    │
│  │  ✅ Quality improving steadily (+17% since Jan)                             │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  CRITICAL ISSUES (Requires Immediate Action)                         12 Total  │  │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  Severity │ Issue                                          Count   Actions    │  │
│  ├───────────┼────────────────────────────────────────────────┼──────┼───────────┤  │
│  │  🔴 High  │ Claims with missing invoice numbers             3      [Fix Now]  │  │
│  │  🔴 High  │ Duplicate invoice numbers detected              2      [Review]   │  │
│  │  🟡 Med   │ Future service dates (>30 days ahead)           5      [Verify]   │  │
│  │  🟡 Med   │ Amounts exceeding provider credit limit         2      [Review]   │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│  ┌────────────────────────────────────────┬───────────────────────────────────────┐ │
│  │  DATA COMPLETENESS BY FIELD           │  PROVIDER DATA HEALTH                  │ │
│  ├────────────────────────────────────────┼───────────────────────────────────────┤ │
│  │  Field              Completeness  Gap  │  Metric              Value    Status  │ │
│  │  ──────────────────────────────────────  │  ──────────────────────────────────  │ │
│  │  Invoice Number     100%         0     │  Total Providers      127     -      │ │
│  │  Claim Amount       100%         0     │  Mapped to Claims     95      75%    │ │
│  │  Service Date       100%         0     │  Complete Profiles    112     88%    │ │
│  │  Invoice Date       100%         0     │  Missing Contact      15      12%    │ │
│  │  Patient Name       87%          156   │  Missing Financial    8       6%     │ │
│  │  Provider (Mapped)  93%          87    │  Active Status        119     94%    │ │
│  │  Payer Name         98%          24    │                                      │ │
│  │  Scheme Type        96%          48    │  ⚠️ 15 providers have incomplete    │ │
│  │  Approval Number    76%          288   │     contact information              │ │
│  │  Member Number      82%          216   │                                      │ │
│  │  Claim Type (IP/OP) 94%          72    │  [View Details]                      │ │
│  └────────────────────────────────────────┴───────────────────────────────────────┘ │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  PAYER DATA HEALTH                                                           │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │  Payer              Claims  Schemes  Avg Payment Days  Data Quality  Issues │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │  NHIF               456     4        32                95%          ✅ None │    │
│  │  AAR Insurance      298     3        28                98%          ✅ None │    │
│  │  Jubilee Insurance  234     5        35                92%          ⚠️ 2    │    │
│  │  CIC Insurance      189     2        41                88%          ⚠️ 5    │    │
│  │  Madison Insurance  145     3        38                90%          ⚠️ 3    │    │
│  │  Britam Insurance   123     4        29                96%          ✅ None │    │
│  │  ... (2 more)                                                                │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  DATA VALIDATION RULES                                                       │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                              │    │
│  │  Active Rules: 24  │  Passed: 1,198  │  Failed: 12  │  Warning: 45         │    │
│  │                                                                              │    │
│  │  Rule Category         Rules   Pass Rate   Failures   Actions               │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │  Required Fields       8       99.7%       3          [View Details]        │    │
│  │  Data Formats          6       99.8%       2          [View Details]        │    │
│  │  Business Logic        5       98.9%       5          [View Details]        │    │
│  │  Referential Integrity 3       99.8%       2          [View Details]        │    │
│  │  Range Validation      2       100%        0          ✅                    │    │
│  │                                                                              │    │
│  │  Recent Failures:                                                           │    │
│  │  • INV-2024-342: Service date is in the future (2024-12-15)                │    │
│  │  • INV-2024-289: Claim amount exceeds KES 10M limit                        │    │
│  │  • INV-2024-267: Invalid claim type "X" (must be IP or OP)                 │    │
│  │                                                                              │    │
│  │  [Configure Rules]  [Run Full Validation]  [Export Report]                 │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │  AUDIT LOG (Recent Data Changes)                                             │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │  Timestamp       User            Action                              Entity  │    │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  5 min ago      admin@fin.com   Mapped claim to provider            Claim    │    │
│  │  12 min ago     admin@fin.com   Updated provider contact info       Provider │    │
│  │  18 min ago     system           Imported 156 claims from Excel     Batch    │    │
│  │  25 min ago     admin@fin.com   Created new payer                   Payer    │    │
│  │  32 min ago     admin@fin.com   Deleted invalid claim record        Claim    │    │
│  │  ... (more)                                                                   │    │
│  ├───────────────────────────────────────────────────────────────────────────────┤  │
│  │  [View Full Audit Log]  [Export Last 30 Days]  [Configure Alerts]           │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**1. Quality KPI Cards**
- Overall Quality Score (0-100%)
- Critical Issues Count (red if >5)
- Data Completeness Percentage
- Unmapped Claims (number and percentage)

**2. Quality Score Trend**
- Line chart showing 90-day trend
- Shows overall improvement/decline
- Annotated with key events (imports, fixes)

**3. Critical Issues Table**
- Severity color-coding (Red, Yellow, Green)
- Issue description
- Count of affected records
- Quick action buttons:
  - Fix Now: Opens fix wizard
  - Review: Opens affected records
  - Verify: Mark as reviewed

**4. Data Completeness Section**
- **Left Panel: Field Completeness**
  - Each field with percentage complete
  - Gap count (missing records)
  - Progress bars
  - Required fields highlighted

- **Right Panel: Provider Data Health**
  - Provider-specific metrics
  - Incomplete profile alerts
  - Quick fix links

**5. Payer Data Health Table**
- Per-payer quality metrics:
  - Claims count
  - Schemes count
  - Average payment days
  - Data quality score
  - Issue count
- Click row to drill down

**6. Data Validation Rules**
- Summary: Total rules, pass/fail counts
- **Rules by Category:**
  - Required Fields (8 rules)
  - Data Formats (6 rules)
  - Business Logic (5 rules)
  - Referential Integrity (3 rules)
  - Range Validation (2 rules)

- **Recent Failures:**
  - List of last 10 validation failures
  - Link to affected record

- **Actions:**
  - Configure Rules: Edit validation rules
  - Run Full Validation: Re-check all data
  - Export Report: Download CSV

**7. Audit Log**
- Real-time log of data changes
- Columns: Timestamp, User, Action, Entity
- Filterable by user, entity type, date
- Export options

**8. Alerts Configuration**
- Set up email/SMS alerts for:
  - Quality score drops below threshold
  - Critical issues detected
  - Data completeness falls below target
  - Validation failures spike

---

## DESIGN NOTES

### Responsive Design
All pages should adapt to these breakpoints:
- **Desktop:** 1920px+ (default wireframes above)
- **Laptop:** 1280-1919px (compact spacing)
- **Tablet:** 768-1279px (stack some columns)
- **Mobile:** <768px (full stack, bottom navigation)

### Component Reuse
Use shadcn/ui components consistently:
- `Card` for all panels
- `Table` for data grids
- `Badge` for status indicators
- `Button` for actions
- `Dialog` for modals
- `Select` for dropdowns
- `Alert` for warnings

### Loading States
All tables and cards should show:
- Skeleton loaders during fetch
- Empty states with helpful messages
- Error states with retry buttons

### Accessibility
- All interactive elements keyboard navigable
- ARIA labels on icons
- Color contrast ratio ≥4.5:1
- Focus indicators visible
- Screen reader friendly

### Performance
- Pagination for large datasets (>100 rows)
- Virtual scrolling for very large tables (>1000 rows)
- Debounced search inputs (300ms)
- Lazy load charts (below fold)
- Optimistic UI updates

---

## APPROVAL CHECKLIST

Review these wireframes and confirm:

- [ ] Page layouts match FinArif style
- [ ] All required functionality present
- [ ] User flows are intuitive
- [ ] Data fields are complete
- [ ] Actions are clearly labeled
- [ ] Filters make sense
- [ ] Tables are sortable/searchable
- [ ] Forms have proper validation
- [ ] Mobile-friendly design
- [ ] Consistent with existing MVP

---

## HYPERLINK INTERACTION PATTERNS

This section defines the comprehensive hyperlink behavior and interaction patterns throughout the application.

### Link Types & Destinations

**1. Entity Name Links (Primary Navigation)**

| Entity Type | Appears In | Links To | Example |
|------------|-----------|----------|---------|
| Provider Name | All tables, cards | `/providers/[id]` | Nairobi Hospital → `/providers/PROV001` |
| Payer Name | All tables, cards | `/payers/[id]` | NHIF → `/payers/PAY001` |
| Scheme Name | All tables, cards | `/schemes/[id]` | NHIF Outpatient → `/schemes/SCH001` |
| Invoice/Transaction | All tables | `/transactions/[id]` | INV-2024-342 → `/transactions/TXN123` |

**2. Breadcrumb Navigation Links**

Every detail page includes clickable breadcrumbs:

```
🔗Home > 🔗Providers > Nairobi Hospital
🔗Home > 🔗Settings > 🔗Payers > 🔗NHIF > NHIF Outpatient
🔗Home > 🔗Claims > INV-2024-342
```

**Behavior:**
- Each crumb is clickable except the current page
- Hover shows underline
- Clicking navigates to that level
- Preserves context when navigating back

**3. Back Navigation Links**

All detail pages have a back button:
```
🔗[← Back to Providers]
🔗[← Back to Payers]
🔗[← Back to Claims]
```

**Behavior:**
- Returns to the previous list view
- Maintains filter/sort state when possible
- Uses browser history when available

**4. Cross-Reference Links**

Detail pages link to related entities:
- Provider page → Payer names in "Payer Breakdown" section
- Payer page → Scheme names in "Schemes" section
- Scheme page → Parent payer link, provider names
- Transaction page → Provider, Payer, Scheme all clickable

### Visual Design & States

**Default State:**
- Color: Primary Blue (#2563EB)
- Font Weight: Medium (500)
- Text Decoration: None
- Cursor: Default text cursor

**Hover State:**
- Color: Darker Blue (#1E40AF)
- Text Decoration: Underline
- Cursor: Pointer
- Transition: 150ms ease
- Optional: Slight background highlight on row/card

**Active/Pressed State:**
- Color: Darkest Blue (#1E3A8A)
- Slight opacity change (95%)

**Visited State (Optional):**
- Color: Slightly muted (#475569)
- Only used in documentation/help pages
- Not used in data tables (confusing)

**Disabled/Unavailable State:**
- Color: Slate-400 (#94A3B8)
- Cursor: Not-allowed
- No underline on hover
- Used when entity is deleted or inaccessible

### Table Hyperlink Patterns

**Provider List Table:**
```
┌────────────────────────────────────────────┐
│ Provider Name ↕  │ Type │ Outstanding │    │
├────────────────────────────────────────────┤
│ 🔗Nairobi Hospital│ Hosp │ KES 2.4M   │    │ ← Provider name clickable
│ 🔗Aga Khan HC     │ Hosp │ KES 1.8M   │    │
└────────────────────────────────────────────┘
```

**Claims Table (with multiple links):**
```
┌─────────────────────────────────────────────────────────────┐
│ Invoice #      │ Provider        │ Payer       │ Scheme     │
├─────────────────────────────────────────────────────────────┤
│ 🔗INV-2024-342│ 🔗Nairobi Hosp. │ 🔗NHIF      │ 🔗NHIF OP  │ ← All clickable
│ 🔗INV-2024-298│ 🔗Aga Khan HC   │ 🔗AAR Ins.  │ 🔗AAR Gold │
└─────────────────────────────────────────────────────────────┘
```

**Best Practices:**
- Use 🔗 icon in wireframes to indicate clickable items
- In implementation, use color + hover state (no icon needed)
- Entire table row can have hover highlight
- Only specific cells are clickable (not entire row)
- Clicking row background does nothing (avoid confusion)

### Card Hyperlink Patterns

**Payer Breakdown Card (on Provider Detail page):**
```
┌─────────────────────────────────┐
│ PAYER BREAKDOWN                 │
├─────────────────────────────────┤
│ Payer               Claims      │
│ ──────────────────────────      │
│ 🔗NHIF               45         │ ← Payer name clickable
│ 🔗AAR Insurance      23         │
│ 🔗Jubilee Insurance  18         │
└─────────────────────────────────┘
```

**Scheme List (on Payer Detail page):**
```
┌─────────────────────────────────┐
│ SCHEMES UNDER THIS PAYER        │
├─────────────────────────────────┤
│ Scheme Name         Claims      │
│ ──────────────────────────      │
│ 🔗NHIF Outpatient   189         │ ← Scheme name clickable
│ 🔗NHIF Inpatient    156         │
└─────────────────────────────────┘
```

### Smart Suggestions Hyperlinks

In the Manual Invoice Mapper, provider suggestions are clickable:

```
🤖 SMART SUGGESTIONS (Confidence Score)
┌────────────────────────────────────────┐
│ 1. 🔗Nairobi Hospital    92%  [Select] │ ← Provider name clickable
│    • 45 previous claims matched        │    Opens provider detail in new tab
│ 2. 🔗Aga Khan Hospital   67%  [Select] │    (Ctrl/Cmd+Click)
└────────────────────────────────────────┘
```

**Behavior:**
- Regular click: Open in same tab
- Ctrl/Cmd+Click: Open in new tab
- Right-click: Show context menu
- Allows user to research provider before selecting

### Validation Error Hyperlinks

In Claims Upload validation results:

```
VALIDATION RESULTS
┌────────────────────────────────────────────────┐
│ Row │ Status │ Issue                           │
├─────┼────────┼─────────────────────────────────┤
│ 102 │ ⚠️     │ Provider 🔗"Nairobi Hosp"       │
│     │        │ not found - needs mapping       │
│ 145 │ ⚠️     │ Payer 🔗"NHIF" found,          │
│     │        │ scheme missing                  │
└────────────────────────────────────────────────┘
```

**Behavior:**
- If entity exists: Link to detail page
- If entity doesn't exist: Link to creation form
- Helps user quickly fix data issues

### Keyboard Navigation

**Tab Navigation:**
- All hyperlinks are focusable via Tab key
- Tab order follows visual layout (left-to-right, top-to-bottom)
- Focused links show outline ring

**Keyboard Shortcuts:**
- Enter/Space: Activate link
- Ctrl/Cmd+Click: Open in new tab
- Shift+Click: Open in new window

### Accessibility (a11y)

**ARIA Labels:**
```html
<a
  href="/providers/PROV001"
  aria-label="View details for Nairobi Hospital"
>
  Nairobi Hospital
</a>
```

**Screen Reader Announcements:**
- "Link: Nairobi Hospital - View provider details"
- "Breadcrumb navigation: Home, Providers, Nairobi Hospital (current page)"
- "Recent claims table: 8 rows, 6 columns with clickable links"

**Focus Indicators:**
- Visible focus ring (2px solid, blue)
- High contrast (4.5:1 ratio minimum)
- Not removed by CSS

**Skip Links:**
- "Skip to main content" at top of page
- "Skip to navigation" for tables with many links

### Mobile/Touch Considerations

**Touch Targets:**
- Minimum size: 44x44px (iOS) / 48x48px (Android)
- Adequate spacing between links (8px minimum)
- No hover state on touch devices (use tap to navigate)

**Long Press:**
- Shows preview of destination
- Option to open in new tab
- Copy link address

**Table Links on Mobile:**
- Stacked layout (one column)
- Each link clearly separated
- Tap target extends to full width

### Link Color Consistency

**Primary Application Links:**
- Blue (#2563EB) - Main navigation, entity links
- Never use blue for non-link text

**Secondary Links:**
- Slate-700 (#334155) - Footer, help text
- Must have underline to distinguish from text

**Danger Links:**
- Red (#EF4444) - Delete actions, critical warnings
- Always paired with confirmation dialog

### Opening Behavior

**Same Tab (Default):**
- All primary navigation
- Entity detail links
- Breadcrumbs
- Back buttons
- Maintains application context

**New Tab (Modifiers Only):**
- Never automatic
- Only via Ctrl/Cmd+Click
- User preference respected

**External Links:**
- Open in new tab automatically
- Show external link icon (↗)
- Warning if leaving application
- Example: Documentation, help articles

### Context Preservation

When navigating via hyperlinks, preserve:

1. **Filters:** Return to same filtered view
2. **Sorting:** Maintain column sort order
3. **Pagination:** Remember page number
4. **Search:** Keep search term active
5. **Scroll Position:** Restore scroll when using back button

**Implementation:**
- Use query parameters: `/providers?filter=high-risk&sort=ar-age&page=2`
- Save state to session storage
- Restore state on page load

### Performance Optimization

**Prefetching:**
- Preload linked pages on hover (after 200ms delay)
- Reduces perceived navigation time
- Only for same-domain links

**Link Preconnect:**
```html
<link rel="preconnect" href="/api/providers">
```

**Lazy Loading:**
- Don't prefetch all linked resources
- Load on-demand when user navigates

### Error Handling

**404 - Entity Not Found:**
```
┌────────────────────────────────────┐
│ Provider Not Found                 │
│                                    │
│ The provider you're looking for    │
│ (PROV999) no longer exists.        │
│                                    │
│ It may have been deleted or merged.│
│                                    │
│ [🔗 Back to Providers]  [🔗 Home]  │
└────────────────────────────────────┘
```

**403 - Access Denied:**
```
┌────────────────────────────────────┐
│ Access Denied                      │
│                                    │
│ You don't have permission to view  │
│ this provider's details.           │
│                                    │
│ [🔗 Back to Providers]  [🔗 Home]  │
└────────────────────────────────────┘
```

**Deleted Entity Links:**
- Gray out link
- Add strikethrough
- Tooltip: "This provider was deleted on [date]"
- Click shows "Entity Deleted" message

### Testing Checklist

- [ ] All entity name links navigate to correct detail pages
- [ ] Breadcrumbs work on all detail pages
- [ ] Back buttons return to previous view
- [ ] Hover states visible and smooth
- [ ] Focus states visible for keyboard navigation
- [ ] Links work with keyboard (Tab + Enter)
- [ ] Ctrl/Cmd+Click opens in new tab
- [ ] Screen readers announce links correctly
- [ ] Touch targets adequate on mobile (44x44px min)
- [ ] Link colors meet WCAG AA contrast (4.5:1)
- [ ] No blue text that isn't a link
- [ ] Visited state appropriate (or disabled)
- [ ] Error states handled gracefully
- [ ] Context preserved when navigating back
- [ ] Filters/sort maintained across navigation
- [ ] Performance acceptable (no lag on click)

---

## NAVIGATION SUMMARY

**Total Pages with Hyperlink Navigation:** 11

**New Detail Pages Added:**
1. Payer Detail (`/payers/[id]`)
2. Scheme Detail (`/schemes/[id]`)
3. Transaction Detail (`/transactions/[id]`)

**Key Hyperlink Additions:**

**Provider List:**
- Provider names → Provider detail

**Provider Drill-down:**
- Payer names → Payer detail
- Invoice numbers → Transaction detail

**Payer Detail (NEW):**
- Scheme names → Scheme detail
- Provider names → Provider detail
- Invoice numbers → Transaction detail

**Scheme Detail (NEW):**
- Parent payer → Payer detail
- Provider names → Provider detail
- Invoice numbers → Transaction detail
- Related schemes → Scheme detail

**Transaction Detail (NEW):**
- Provider → Provider detail
- Payer → Payer detail
- Scheme → Scheme detail
- Related invoices → Transaction detail

**Claims Upload:**
- Validation errors link to providers/payers

**Manual Invoice Mapper:**
- Invoice numbers → Transaction detail
- Payer names → Payer detail
- Provider suggestions → Provider detail
- Mapping history → All entities clickable

**Result:** Fully interconnected navigation allowing users to explore relationships between providers, payers, schemes, and transactions seamlessly.

---

**Status:** Ready for Review - UPDATED with Hyperlinked Navigation
**Next Step:** API Contracts (04_API_CONTRACTS.md)
**Created:** 2025-10-07
**Updated:** 2025-10-07 - Added hyperlinked navigation throughout application
