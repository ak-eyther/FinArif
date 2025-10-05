# FinArif MVP Dashboard - Project Brief

## Project Overview
Building a healthcare provider financing platform dashboard to demonstrate the business model to the board of directors for seed funding approval.

## The Business Model

### Problem
- Healthcare providers in Kenya wait 30-90 days for insurance claim payments
- Creates severe cash flow problems affecting operations
- Providers struggle to buy supplies and pay staff during waiting period

### Solution
- Vitraya's AI instantly approves healthcare claims
- FinArif pays providers within 24 hours (T+1)
- We collect from insurance companies 30-90 days later
- Earn 3-5% discount fee while managing all risk

### Revenue Model
**Discount Fee Structure (Risk-Based Pricing):**
- Low Risk (Score 0-30): 3% fee
- Medium Risk (Score 31-60): 4% fee
- High Risk (Score 61-100): 5% fee

**Cost Structure:**
- Capital Cost: Based on source (5-20% annual)
- Operating Cost: 0.5% of claim amount (fixed)
- Default Provision: Risk Score × 2%

**Target Metrics:**
- Net Interest Margin (NIM): 4.5% minimum
- Default Rate: Below 5%
- Return on Equity (ROE): 20%
- Capital Utilization: Above 70%

## MVP Scope

### What We're Building
A **frontend-only** Next.js dashboard with **mock data** that demonstrates:
1. The financial model works and is profitable
2. Risk is properly managed
3. Capital is efficiently utilized
4. Unit economics are sound

### What We're NOT Building (Out of Scope)
- ❌ Backend/Database
- ❌ API integrations
- ❌ Authentication
- ❌ Payment processing
- ❌ Real Vitraya integration
- ❌ Provider onboarding
- ❌ Mobile app

### Success Criteria
**Board approves seed funding after seeing the dashboard demonstration.**

## Dashboard Pages (5 Total)

### Page 1: Main Dashboard
**Purpose:** Show overall health at a glance

**Components:**
- 4 Key Metrics Cards:
  1. Total Outstanding to Providers (KES)
  2. Total Expected from Insurers (KES)
  3. Net Exposure (gap between them)
  4. Portfolio NIM (%)
- Each with trend indicator (up/down arrows)
- Recent transactions table (10-20 rows)
- Professional, clean design

### Page 2: Transactions
**Purpose:** Detailed view of all financing activities

**Components:**
- Sortable/filterable table with columns:
  - Transaction ID
  - Provider Name
  - Insurance Company
  - Claim Amount (KES)
  - Disbursement Date
  - Expected Collection Date
  - Status (Active/Collected/Defaulted)
  - Risk Score (0-100)
  - Actions (view details)

### Page 3: Risk Analysis
**Purpose:** Demonstrate risk management strategy

**Components:**
- Risk Heat Map (scatter plot):
  - X-axis: Provider Risk Score
  - Y-axis: Insurance Risk Score
  - Color: Transaction Risk Level
  - Size: Claim Amount
- Risk Distribution:
  - Low Risk: % of portfolio
  - Medium Risk: % of portfolio
  - High Risk: % of portfolio
- Concentration Metrics:
  - Top 3 Providers (% exposure)
  - Top 3 Insurers (% exposure)
- Average Portfolio Risk Score

### Page 4: Capital Management
**Purpose:** Show optimal capital utilization

**Components:**
- Capital Sources Table:
  | Source | Annual Cost | Available | Used | Remaining |
  |--------|-------------|-----------|------|-----------|
  | Grant | 5% | 500k | XXX | XXX |
  | Equity | 0%* | 1M | XXX | XXX |
  | Bank LOC | 14% | 750k | XXX | XXX |
  | Investor Debt | 20% | 500k | XXX | XXX |

- Utilization Bar Chart
- NIM Comparison (3 strategies):
  1. Equity-first approach
  2. Debt-first approach
  3. Mixed/Optimal approach (recommended)

### Page 5: Transaction Details
**Purpose:** Show unit economics work

**Components:**
- Complete P&L breakdown for selected transaction:
  ```
  Claim Amount: KES 10,000

  REVENUE
  Discount Fee (4%): KES 400

  COSTS
  Capital Cost: KES 172.60
  Operating Cost: KES 50.00
  Default Provision: KES 80.00
  Total Costs: KES 302.60

  NET PROFIT: KES 97.40
  Margin: 0.97%
  ```
- Transaction timeline
- Risk assessment details

## Core Calculations

### 1. Risk Score Formula

**Provider Risk Score (0-100):**
```
Provider Risk =
  (Default History × 40%) +
  (Claim Quality × 30%) +
  (Concentration × 30%)
```

**Insurance Risk Score (0-100):**
```
Insurance Risk =
  (Payment Delay × 50%) +
  (Default Rate × 50%)
```

**Transaction Risk:**
```
Transaction Risk = (Provider Risk + Insurance Risk) ÷ 2
```

**Risk Levels:**
- 0-30: Low Risk (Green) → 3% fee
- 31-60: Medium Risk (Yellow) → 4% fee
- 61-100: High Risk (Red) → 5% fee

### 2. NIM (Net Interest Margin) Formula

```typescript
/**
 * All amounts in CENTS (integers)
 * All rates as decimals (e.g., 0.04 for 4%)
 * Days as integers
 */

Revenue = claimAmountCents × discountRate

CapitalCost = Math.round(
  (claimAmountCents × annualRate × days) / 365
)

NIM = (Revenue - CapitalCost) / claimAmountCents
```

**Example:**
- Claim: 1,000,000 cents (KES 10,000)
- Fee: 0.03 (3%)
- Annual Rate: 0.14 (14%)
- Days: 45

```
Revenue = 1,000,000 × 0.03 = 30,000 cents

CapitalCost = (1,000,000 × 0.14 × 45) / 365
            = 17,260 cents

NIM = (30,000 - 17,260) / 1,000,000
    = 0.01274 (1.274%)
```

### 3. P&L Formula

```typescript
/**
 * Complete profit & loss calculation
 * Returns breakdown in cents
 */

Revenue = claimAmountCents × discountRate

CapitalCost = Math.round(
  (claimAmountCents × annualRate × days) / 365
)

OperatingCost = Math.round(
  claimAmountCents × 0.005  // 0.5% fixed
)

DefaultProvision = Math.round(
  claimAmountCents × (riskScore / 100) × 0.02  // 2% of risk
)

NetProfit = Revenue - CapitalCost - OperatingCost - DefaultProvision

Margin = NetProfit / claimAmountCents
```

## Capital Sources Strategy

### 4 Capital Sources (Use in Priority Order)

1. **Grant Capital**
   - Cost: 5% annual
   - Available: KES 500,000
   - Use: FIRST (cheapest)

2. **Equity**
   - Cost: 0% interest (but 20% ROE expected)
   - Available: KES 1,000,000
   - Use: SECOND

3. **Bank Line of Credit (LOC)**
   - Cost: 14% annual
   - Available: KES 750,000
   - Use: THIRD (main source)

4. **Investor Debt**
   - Cost: 20% annual
   - Available: KES 500,000
   - Use: LAST (most expensive)

**Total Capital:** KES 2,750,000

**Strategy:** Always use cheapest capital first to maximize NIM

## Mock Data Requirements

### Providers (10 Kenyan Hospitals)
- Nairobi Hospital
- Aga Khan University Hospital
- Kenyatta National Hospital
- MP Shah Hospital
- Gertrude's Children Hospital
- The Mater Hospital
- Avenue Healthcare
- Coptic Hospital
- Karen Hospital
- Nairobi West Hospital

### Insurance Companies (8)
- NHIF (National Hospital Insurance Fund)
- AAR Insurance
- Jubilee Insurance
- CIC Insurance
- UAP Insurance
- Madison Insurance
- Britam
- APA Insurance

### Transaction Characteristics
- **Count:** 15-20 transactions
- **Claim Range:** KES 50,000 - KES 5,000,000
- **Average:** ~KES 500,000
- **Status Distribution:**
  - 70% Active
  - 20% Collected
  - 10% Defaulted
- **Risk Scores:**
  - Most: 20-60 range
  - Few high risk: 70-80
  - Few low risk: 10-20
- **Dates:** Last 90 days
- **Collection Period:** 30-60 days typical

## Technical Requirements

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **UI Components:** shadcn/ui
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **Date Handling:** date-fns
- **Deployment:** Vercel

### Code Quality Rules
1. ✅ TypeScript strict mode enabled
2. ✅ NO `any` types allowed
3. ✅ All money stored in CENTS (integers)
4. ✅ All percentages as decimals (0.04 not 4)
5. ✅ JSDoc comments on all functions
6. ✅ Explain WHY in comments, not WHAT
7. ✅ Use shadcn/ui components only
8. ✅ Test calculations with known values

### File Structure
```
finarif-dashboard/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Main Dashboard
│   │   ├── transactions/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx     # Transaction Details
│   │   ├── risk/
│   │   │   └── page.tsx
│   │   └── capital/
│   │       └── page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── dashboard/
│   │   ├── metric-card.tsx
│   │   ├── transaction-table.tsx
│   │   ├── risk-heatmap.tsx
│   │   └── capital-chart.tsx
│   └── charts/
│       └── base-chart.tsx
├── lib/
│   ├── calculations/
│   │   ├── risk.ts               # Risk scoring formulas
│   │   ├── nim.ts                # NIM calculations
│   │   └── profit-loss.ts        # P&L breakdowns
│   ├── types/
│   │   └── index.ts              # All TypeScript types
│   ├── utils/
│   │   ├── format.ts             # Currency, date formatting
│   │   └── helpers.ts
│   ├── constants.ts              # Business rules, rates
│   └── mock-data.ts              # Sample transactions
├── .claude/                       # AI assistant rules
└── public/
```

## Business Rules (Constants)

### Fee Structure
```typescript
const FEE_TIERS = {
  LOW_RISK: { min: 0, max: 30, fee: 0.03 },      // 3%
  MEDIUM_RISK: { min: 31, max: 60, fee: 0.04 },  // 4%
  HIGH_RISK: { min: 61, max: 100, fee: 0.05 }    // 5%
}
```

### Cost Structure
```typescript
const OPERATING_COST_RATE = 0.005;  // 0.5%
const DEFAULT_PROVISION_MULTIPLIER = 0.02;  // 2%
```

### Capital Sources
```typescript
const CAPITAL_SOURCES = [
  { name: 'Grant', rate: 0.05, available: 50000000 },     // 500k in cents
  { name: 'Equity', rate: 0.00, available: 100000000 },   // 1M (0% but 20% ROE)
  { name: 'Bank LOC', rate: 0.14, available: 75000000 },  // 750k
  { name: 'Investor Debt', rate: 0.20, available: 50000000 }  // 500k
]
```

### Risk Limits
```typescript
const MAX_PROVIDER_CONCENTRATION = 0.20;  // 20%
const MAX_INSURER_CONCENTRATION = 0.30;   // 30%
const MIN_NIM = 0.03;                     // 3%
const TARGET_NIM = 0.045;                 // 4.5%
const MAX_DEFAULT_RATE = 0.05;            // 5%
```

## Development Timeline (4 Weeks)

### Week 1: Foundation
- Days 1-2: Setup (Next.js, shadcn/ui, dependencies)
- Days 3-4: Project structure, configurations
- Days 5-7: Types, constants, mock data

### Week 2: Core Logic
- Days 8-9: Risk calculation functions
- Days 10-11: NIM calculation functions
- Days 12-14: P&L calculation + testing

### Week 3: UI Components
- Days 15-16: Main dashboard page
- Days 17-18: Transactions page
- Days 19-21: Risk analysis page

### Week 4: Final Pages & Polish
- Days 22-23: Capital management page
- Days 24-25: Loading states, error handling
- Days 26-28: Bug fixes, testing, polish

### Week 5: Presentation Prep
- Day 29: Rehearsal
- Day 30: **BOARD PRESENTATION** 🎯

## Success Metrics

### Technical Success
- [ ] All calculations accurate (verified)
- [ ] Loads in < 2 seconds
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Works in Chrome, Safari, Firefox
- [ ] Professional appearance

### Functional Success
- [ ] 4 key metrics display correctly
- [ ] 15-20 transactions visible
- [ ] Charts render properly
- [ ] Can navigate all pages
- [ ] NIM calculations verified

### Business Success
- [ ] Board understands the model
- [ ] Risk management is clear
- [ ] Capital efficiency demonstrated
- [ ] **BOARD APPROVES FUNDING** ✅

## Key Assumptions

### Business
- Board accepts mock data demonstration
- 3-5% fee acceptable to providers
- Insurance pays in 30-90 days average
- Default rate will be < 5%
- Vitraya partnership confirmed

### Technical
- Next.js 14 stable
- shadcn/ui has needed components
- Recharts sufficient for charts
- Vercel free tier works for demo
- 4 weeks is enough time

### Market
- Providers have cash flow problems (validated)
- Market size sufficient (to validate)
- Regulatory environment favorable (to validate)

## Next Steps After MVP

### If Board Approves:

**Month 2:**
- Hire developers
- Build real backend
- Add authentication

**Month 3:**
- Integrate Vitraya
- Add payments
- Launch pilot (5 providers)

**Month 4-6:**
- Scale to 20 providers
- Process 200+ transactions
- Refine risk model
- Raise Series A

**Month 6-12:**
- Scale to 50+ providers
- Expand to other cities
- Reach profitability
- Regional expansion

## Critical Reminders

### MUST DO:
✅ Store money in CENTS (integers)
✅ No `any` types in TypeScript
✅ Use shadcn/ui components
✅ Test all calculations
✅ Stay in scope (no backend!)
✅ Professional appearance
✅ Complete in 4 weeks

### MUST NOT DO:
❌ Build backend/database
❌ Add authentication
❌ Integrate real APIs
❌ Build mobile app
❌ Add features outside scope

## Contact & Support

**Project Owner:** Arif Khan (VP Africa, Vitraya)
**Target:** Board of Directors
**Timeline:** 4 weeks to MVP
**Goal:** Seed funding approval

---

**Let's build this! 🚀**
