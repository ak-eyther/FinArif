# Coding Rules for FinArif MVP Dashboard

## TypeScript Rules

### STRICT MODE - NO EXCEPTIONS
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### NO `any` Types
❌ **WRONG:**
```typescript
function calculate(data: any) {
  return data.amount * 0.03;
}
```

✅ **CORRECT:**
```typescript
interface Transaction {
  amountCents: number;
  feeRate: number;
}

function calculate(data: Transaction): number {
  return Math.round(data.amountCents * data.feeRate);
}
```

### Always Define Explicit Types
❌ **WRONG:**
```typescript
const fee = 0.03;
const amount = 10000;
```

✅ **CORRECT:**
```typescript
const FEE_RATE: number = 0.03;
const AMOUNT_CENTS: number = 10000;

// Or better, use const assertions
const FEE_RATE = 0.03 as const;
```

## Financial Calculations - CRITICAL RULES

### Rule 1: ALL Money in CENTS (Integers)

**WHY:** Avoid floating-point precision errors

❌ **WRONG:**
```typescript
const amount = 10000.50;  // KES in decimal
const fee = amount * 0.03;  // 300.015 - PRECISION ERROR!
```

✅ **CORRECT:**
```typescript
const amountCents = 1000050;  // Store as cents (integers)
const feeCents = Math.round(amountCents * 0.03);  // 30002 cents = KES 300.02
```

### Rule 2: ALL Percentages as Decimals

❌ **WRONG:**
```typescript
const feePercent = 3;  // Ambiguous - is this 3% or 3.0?
const nim = 4.5;       // Is this 4.5% or 450%?
```

✅ **CORRECT:**
```typescript
const FEE_RATE = 0.03;   // 3% expressed as decimal
const NIM_RATE = 0.045;  // 4.5% expressed as decimal
```

### Rule 3: ALWAYS Round Explicitly

❌ **WRONG:**
```typescript
// Floating point arithmetic without rounding
const cost = (1000000 * 0.14 * 45) / 365;  // 17260.273972...
```

✅ **CORRECT:**
```typescript
// Explicit rounding to nearest cent
const costCents = Math.round((amountCents * annualRate * days) / 365);
```

### Rule 4: Document ALL Financial Formulas

✅ **REQUIRED:**
```typescript
/**
 * Calculate capital cost for a claim based on source cost of funds
 *
 * @param amountCents - Claim amount in cents (e.g., 1000000 = KES 10,000)
 * @param annualRate - Annual interest rate as decimal (e.g., 0.14 = 14%)
 * @param days - Number of days until collection (e.g., 45)
 * @returns Capital cost in cents, rounded to nearest cent
 *
 * Formula: (Amount × Annual Rate × Days) ÷ 365
 * Example: (1,000,000 × 0.14 × 45) ÷ 365 = 17,260 cents (KES 172.60)
 */
function calculateCapitalCost(
  amountCents: number,
  annualRate: number,
  days: number
): number {
  return Math.round((amountCents * annualRate * days) / 365);
}
```

## Type Definitions

### Use Branded Types for Currency

✅ **BEST PRACTICE:**
```typescript
/**
 * Cents represent currency amounts as integers
 * Always use this type for money to prevent mixing with regular numbers
 */
type Cents = number & { readonly __brand: 'Cents' };

/**
 * Create a Cents value with validation
 */
function toCents(amount: number): Cents {
  if (!Number.isInteger(amount)) {
    throw new Error('Cents must be an integer');
  }
  return amount as Cents;
}

/**
 * Convert KES to cents safely
 */
function kesTo Cents(kes: number): Cents {
  return toCents(Math.round(kes * 100));
}

// Usage
const claimAmount: Cents = kesToCents(10000);  // 1,000,000 cents
```

### Define All Business Entities

```typescript
/**
 * Transaction status throughout its lifecycle
 */
type TransactionStatus = 'active' | 'collected' | 'defaulted';

/**
 * Risk level classification
 */
type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Complete transaction record
 */
interface Transaction {
  id: string;
  providerName: string;
  providerRiskScore: number;  // 0-100
  insuranceName: string;
  insuranceRiskScore: number;  // 0-100
  claimAmountCents: Cents;
  disbursementDate: Date;
  expectedCollectionDate: Date;
  actualCollectionDate: Date | null;
  status: TransactionStatus;
  riskScore: number;  // 0-100 (avg of provider + insurance)
  riskLevel: RiskLevel;
  feeRate: number;  // Decimal (e.g., 0.04 for 4%)
  capitalSourceName: string;
  capitalAnnualRate: number;  // Decimal
  daysToCollection: number;
}

/**
 * Profit & Loss breakdown for a transaction
 */
interface TransactionPL {
  claimAmountCents: Cents;
  revenueCents: Cents;
  capitalCostCents: Cents;
  operatingCostCents: Cents;
  defaultProvisionCents: Cents;
  totalCostsCents: Cents;
  netProfitCents: Cents;
  marginRate: number;  // Decimal
  nimRate: number;     // Decimal
}

/**
 * Capital source configuration
 */
interface CapitalSource {
  name: string;
  annualRate: number;          // Decimal (e.g., 0.14 for 14%)
  availableCents: Cents;
  usedCents: Cents;
  remainingCents: Cents;
  priority: number;            // 1 = use first, 4 = use last
}

/**
 * Dashboard metrics
 */
interface DashboardMetrics {
  totalOutstandingCents: Cents;      // Money we've paid to providers
  totalExpectedCents: Cents;         // Money we expect from insurers
  netExposureCents: Cents;           // Gap (risk we carry)
  portfolioNIM: number;              // Decimal (e.g., 0.045 for 4.5%)
  trendOutstanding: 'up' | 'down' | 'flat';
  trendExpected: 'up' | 'down' | 'flat';
  trendExposure: 'up' | 'down' | 'flat';
  trendNIM: 'up' | 'down' | 'flat';
}
```

## Component Rules

### Use shadcn/ui Components ONLY

❌ **WRONG:**
```typescript
// Custom button without shadcn/ui
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="bg-blue-500">{children}</button>;
}
```

✅ **CORRECT:**
```typescript
// Use shadcn/ui button
import { Button } from '@/components/ui/button';

export function MyComponent() {
  return <Button variant="default">Click Me</Button>;
}
```

### Required shadcn/ui Components to Install
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add skeleton
npx shadcn@latest add separator
npx shadcn@latest add alert
```

## Function Documentation

### JSDoc Required on ALL Functions

✅ **TEMPLATE:**
```typescript
/**
 * [One-line summary of what the function does]
 *
 * [Optional: Longer description if needed]
 *
 * @param paramName - Description including units/format
 * @returns Description of return value including units/format
 *
 * @example
 * // Example usage with actual values
 * const result = functionName(input);
 * // result = expectedOutput
 */
```

### Comment WHY, Not WHAT

❌ **WRONG:**
```typescript
// Loop through transactions
transactions.forEach(tx => {
  // Calculate fee
  const fee = tx.amount * 0.03;
});
```

✅ **CORRECT:**
```typescript
// Use 3% fee for low-risk transactions to remain competitive
// while maintaining 4.5% NIM target given our 14% cost of funds
transactions.forEach(tx => {
  const feeCents = Math.round(tx.amountCents * LOW_RISK_FEE_RATE);
});
```

## Error Handling

### Validate All Inputs

```typescript
/**
 * Calculate risk score with input validation
 */
function calculateRiskScore(
  providerRisk: number,
  insuranceRisk: number
): number {
  // Validate inputs are in expected range
  if (providerRisk < 0 || providerRisk > 100) {
    throw new Error(`Provider risk must be 0-100, got ${providerRisk}`);
  }
  if (insuranceRisk < 0 || insuranceRisk > 100) {
    throw new Error(`Insurance risk must be 0-100, got ${insuranceRisk}`);
  }

  // Calculate average
  return Math.round((providerRisk + insuranceRisk) / 2);
}
```

### Use Type Guards

```typescript
/**
 * Type guard to check if a value is valid Cents
 */
function isCents(value: unknown): value is Cents {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * Assert value is Cents or throw
 */
function assertCents(value: unknown, label: string): asserts value is Cents {
  if (!isCents(value)) {
    throw new Error(`${label} must be a non-negative integer (cents)`);
  }
}
```

## Testing Rules

### Test All Calculations with Known Values

```typescript
/**
 * Test NIM calculation with known example from BRD
 */
describe('calculateNIM', () => {
  it('should match BRD example: KES 10,000 claim with 3% fee, 14% COF, 45 days', () => {
    const amountCents = kesToCents(10000);  // 1,000,000 cents
    const feeRate = 0.03;
    const annualRate = 0.14;
    const days = 45;

    const result = calculateNIM(amountCents, feeRate, annualRate, days);

    // Expected from BRD:
    // Revenue = 30,000 cents
    // Capital Cost = 17,260 cents
    // NIM = (30,000 - 17,260) / 1,000,000 = 0.01274
    expect(result).toBeCloseTo(0.01274, 5);
  });
});
```

## Naming Conventions

### Variables
```typescript
// Constants: SCREAMING_SNAKE_CASE
const MAX_RISK_SCORE = 100;
const DEFAULT_FEE_RATE = 0.04;

// Regular variables: camelCase
const transactionId = 'TX123';
const riskScore = 45;

// Booleans: is/has/can prefix
const isActive = true;
const hasDefaulted = false;
const canDisburse = checkEligibility();
```

### Functions
```typescript
// Actions: verb prefix
function calculateRiskScore() {}
function validateTransaction() {}
function formatCurrency() {}

// Getters: get prefix
function getTransactionById() {}
function getTotalExposure() {}

// Predicates: is/has/can prefix
function isHighRisk() {}
function hasDefaulted() {}
function canAfford() {}
```

### Components
```typescript
// PascalCase, descriptive names
export function MetricCard() {}
export function TransactionTable() {}
export function RiskHeatMap() {}
```

## File Organization

### One Concern Per File

❌ **WRONG:**
```typescript
// lib/utils.ts - TOO MANY CONCERNS!
export function calculateNIM() {}
export function calculateRisk() {}
export function formatCurrency() {}
export function validateEmail() {}
```

✅ **CORRECT:**
```typescript
// lib/calculations/nim.ts
export function calculateNIM() {}
export function calculateRevenue() {}
export function calculateCapitalCost() {}

// lib/calculations/risk.ts
export function calculateProviderRisk() {}
export function calculateInsuranceRisk() {}
export function calculateTransactionRisk() {}

// lib/utils/format.ts
export function formatCents() {}
export function formatPercentage() {}
export function formatDate() {}
```

## Import Rules

### Order Imports Consistently

```typescript
// 1. React and framework imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { format } from 'date-fns';

// 3. UI components
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// 4. Custom components
import { MetricCard } from '@/components/dashboard/metric-card';

// 5. Utils and helpers
import { formatCents } from '@/lib/utils/format';
import { calculateNIM } from '@/lib/calculations/nim';

// 6. Types
import type { Transaction, DashboardMetrics } from '@/lib/types';

// 7. Constants
import { FEE_RATES, CAPITAL_SOURCES } from '@/lib/constants';
```

## Performance Rules

### Memoize Expensive Calculations

```typescript
'use client';

import { useMemo } from 'react';

export function Dashboard({ transactions }: { transactions: Transaction[] }) {
  // Recalculate only when transactions change
  const metrics = useMemo(
    () => calculateDashboardMetrics(transactions),
    [transactions]
  );

  return <MetricCard metrics={metrics} />;
}
```

### Use Server Components by Default

```typescript
// app/(dashboard)/page.tsx
// This is a Server Component (default in App Router)
// NO 'use client' directive needed

import { getTransactions } from '@/lib/mock-data';

export default function DashboardPage() {
  const transactions = getTransactions();  // Can be async in real app
  return <Dashboard transactions={transactions} />;
}
```

## Accessibility Rules

### Semantic HTML

✅ **CORRECT:**
```typescript
export function MetricCard({ title, value }: Props) {
  return (
    <Card>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold" aria-label={`${title}: ${value}`}>
        {value}
      </p>
    </Card>
  );
}
```

### Color is Not the Only Indicator

```typescript
// Use both color AND text/icon
function RiskBadge({ level }: { level: RiskLevel }) {
  const config = {
    low: { color: 'bg-green-100 text-green-800', icon: '✓', text: 'Low Risk' },
    medium: { color: 'bg-yellow-100 text-yellow-800', icon: '!', text: 'Medium Risk' },
    high: { color: 'bg-red-100 text-red-800', icon: '⚠', text: 'High Risk' }
  };

  const { color, icon, text } = config[level];

  return (
    <Badge className={color}>
      <span aria-hidden="true">{icon}</span>
      <span className="sr-only">{text}</span>
      {level}
    </Badge>
  );
}
```

## Security Rules

### No Sensitive Data in Client Code

❌ **WRONG:**
```typescript
const API_KEY = 'sk_live_abc123';  // NEVER in frontend!
```

✅ **CORRECT:**
```typescript
// For MVP with mock data, no API keys needed
// In production, use environment variables server-side only
```

### Sanitize User Inputs (Future)

```typescript
// For future when adding user input
import DOMPurify from 'isomorphic-dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input);
}
```

## Final Checklist

Before committing any code, verify:

- [ ] TypeScript strict mode enabled, no errors
- [ ] No `any` types used
- [ ] All money in cents (integers)
- [ ] All percentages as decimals
- [ ] Explicit rounding on all calculations
- [ ] JSDoc on all functions
- [ ] Comments explain WHY, not WHAT
- [ ] Using shadcn/ui components
- [ ] Imports organized correctly
- [ ] Functions tested with known values
- [ ] Semantic HTML with accessibility
- [ ] No console.log in production code
- [ ] Files organized by concern

---

**These rules are NON-NEGOTIABLE for financial software.**
**When in doubt, ask before proceeding.**
