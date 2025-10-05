# Financial Calculation Formulas - FinArif MVP

## Critical Rules

### ALL calculations must follow these rules:
1. **Money stored in CENTS** (integers only, no decimals)
2. **Rates as DECIMALS** (0.04 for 4%, not 4)
3. **Explicit ROUNDING** (always use Math.round())
4. **Test with KNOWN VALUES** (verify against BRD examples)

---

## 1. Risk Scoring

### Provider Risk Score (0-100)

**Formula:**
```
Provider Risk = (Default History × 40%) + (Claim Quality × 30%) + (Concentration × 30%)
```

**Implementation:**
```typescript
/**
 * Calculate provider risk score based on historical performance
 *
 * @param defaultHistory - Historical default rate (0-100)
 * @param claimQuality - Quality of submitted claims (0-100, lower is better)
 * @param concentration - Reliance on single insurer (0-100, higher is riskier)
 * @returns Risk score (0-100)
 *
 * @example
 * // Provider with some defaults, good claims, moderate concentration
 * calculateProviderRisk(20, 15, 30)
 * // Returns: (20 × 0.4) + (15 × 0.3) + (30 × 0.3) = 21.5 ≈ 22
 */
function calculateProviderRisk(
  defaultHistory: number,
  claimQuality: number,
  concentration: number
): number {
  if (defaultHistory < 0 || defaultHistory > 100) {
    throw new Error('Default history must be 0-100');
  }
  if (claimQuality < 0 || claimQuality > 100) {
    throw new Error('Claim quality must be 0-100');
  }
  if (concentration < 0 || concentration > 100) {
    throw new Error('Concentration must be 0-100');
  }

  const score =
    defaultHistory * 0.4 +
    claimQuality * 0.3 +
    concentration * 0.3;

  return Math.round(score);
}
```

### Insurance Risk Score (0-100)

**Formula:**
```
Insurance Risk = (Payment Delay × 50%) + (Default Rate × 50%)
```

**Implementation:**
```typescript
/**
 * Calculate insurance company risk score
 *
 * @param paymentDelay - Average payment delay score (0-100, higher = slower)
 * @param defaultRate - Historical default rate (0-100)
 * @returns Risk score (0-100)
 *
 * @example
 * // Insurer with moderate delays, low defaults
 * calculateInsuranceRisk(40, 10)
 * // Returns: (40 × 0.5) + (10 × 0.5) = 25
 */
function calculateInsuranceRisk(
  paymentDelay: number,
  defaultRate: number
): number {
  if (paymentDelay < 0 || paymentDelay > 100) {
    throw new Error('Payment delay must be 0-100');
  }
  if (defaultRate < 0 || defaultRate > 100) {
    throw new Error('Default rate must be 0-100');
  }

  const score = paymentDelay * 0.5 + defaultRate * 0.5;

  return Math.round(score);
}
```

### Transaction Risk Score (0-100)

**Formula:**
```
Transaction Risk = (Provider Risk + Insurance Risk) ÷ 2
```

**Implementation:**
```typescript
/**
 * Calculate overall transaction risk score
 *
 * @param providerRisk - Provider risk score (0-100)
 * @param insuranceRisk - Insurance risk score (0-100)
 * @returns Combined risk score (0-100)
 *
 * @example
 * calculateTransactionRisk(22, 25)
 * // Returns: (22 + 25) / 2 = 23.5 ≈ 24
 */
function calculateTransactionRisk(
  providerRisk: number,
  insuranceRisk: number
): number {
  if (providerRisk < 0 || providerRisk > 100) {
    throw new Error('Provider risk must be 0-100');
  }
  if (insuranceRisk < 0 || insuranceRisk > 100) {
    throw new Error('Insurance risk must be 0-100');
  }

  return Math.round((providerRisk + insuranceRisk) / 2);
}
```

### Risk Level Classification

**Formula:**
```
0-30   → Low Risk    (Green)  → 3% fee
31-60  → Medium Risk (Yellow) → 4% fee
61-100 → High Risk   (Red)    → 5% fee
```

**Implementation:**
```typescript
type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Classify risk score into risk level
 *
 * @param riskScore - Risk score (0-100)
 * @returns Risk level classification
 */
function getRiskLevel(riskScore: number): RiskLevel {
  if (riskScore < 0 || riskScore > 100) {
    throw new Error('Risk score must be 0-100');
  }

  if (riskScore <= 30) return 'low';
  if (riskScore <= 60) return 'medium';
  return 'high';
}

/**
 * Get discount fee rate based on risk score
 *
 * @param riskScore - Risk score (0-100)
 * @returns Fee rate as decimal (e.g., 0.03 for 3%)
 */
function getFeeRate(riskScore: number): number {
  const level = getRiskLevel(riskScore);

  const FEE_RATES = {
    low: 0.03,     // 3%
    medium: 0.04,  // 4%
    high: 0.05     // 5%
  };

  return FEE_RATES[level];
}
```

---

## 2. Revenue Calculation

### Discount Fee Revenue

**Formula:**
```
Revenue = Claim Amount × Discount Fee Rate
```

**Implementation:**
```typescript
/**
 * Calculate revenue from discount fee
 *
 * @param claimAmountCents - Claim amount in cents
 * @param feeRate - Discount fee rate as decimal (e.g., 0.04 for 4%)
 * @returns Revenue in cents
 *
 * @example
 * // KES 10,000 claim with 3% fee
 * calculateRevenue(1000000, 0.03)
 * // Returns: 1,000,000 × 0.03 = 30,000 cents (KES 300)
 */
function calculateRevenue(
  claimAmountCents: number,
  feeRate: number
): number {
  if (claimAmountCents <= 0 || !Number.isInteger(claimAmountCents)) {
    throw new Error('Claim amount must be positive integer (cents)');
  }
  if (feeRate <= 0 || feeRate > 0.1) {
    throw new Error('Fee rate must be between 0 and 0.1 (0-10%)');
  }

  return Math.round(claimAmountCents * feeRate);
}
```

---

## 3. Cost Calculations

### Capital Cost (Cost of Funds)

**Formula:**
```
Capital Cost = (Claim Amount × Annual Rate × Days) ÷ 365
```

**Implementation:**
```typescript
/**
 * Calculate capital cost based on cost of funds
 *
 * @param claimAmountCents - Claim amount in cents
 * @param annualRate - Annual interest rate as decimal (e.g., 0.14 for 14%)
 * @param days - Number of days until collection
 * @returns Capital cost in cents, rounded
 *
 * @example
 * // KES 10,000 claim, 14% annual rate, 45 days
 * calculateCapitalCost(1000000, 0.14, 45)
 * // Returns: (1,000,000 × 0.14 × 45) ÷ 365 = 17,260 cents (KES 172.60)
 */
function calculateCapitalCost(
  claimAmountCents: number,
  annualRate: number,
  days: number
): number {
  if (claimAmountCents <= 0 || !Number.isInteger(claimAmountCents)) {
    throw new Error('Claim amount must be positive integer (cents)');
  }
  if (annualRate < 0 || annualRate > 1) {
    throw new Error('Annual rate must be between 0 and 1 (0-100%)');
  }
  if (days <= 0 || !Number.isInteger(days)) {
    throw new Error('Days must be positive integer');
  }

  // CRITICAL: Use 365 for annual rate calculation
  const cost = (claimAmountCents * annualRate * days) / 365;

  return Math.round(cost);
}
```

### Operating Cost

**Formula:**
```
Operating Cost = Claim Amount × 0.5%
```

**Implementation:**
```typescript
const OPERATING_COST_RATE = 0.005;  // 0.5% fixed

/**
 * Calculate fixed operating cost
 *
 * @param claimAmountCents - Claim amount in cents
 * @returns Operating cost in cents
 *
 * @example
 * // KES 10,000 claim
 * calculateOperatingCost(1000000)
 * // Returns: 1,000,000 × 0.005 = 5,000 cents (KES 50)
 */
function calculateOperatingCost(claimAmountCents: number): number {
  if (claimAmountCents <= 0 || !Number.isInteger(claimAmountCents)) {
    throw new Error('Claim amount must be positive integer (cents)');
  }

  return Math.round(claimAmountCents * OPERATING_COST_RATE);
}
```

### Default Provision

**Formula:**
```
Default Provision = Claim Amount × (Risk Score ÷ 100) × 2%
```

**Implementation:**
```typescript
const DEFAULT_PROVISION_MULTIPLIER = 0.02;  // 2%

/**
 * Calculate default provision based on risk
 *
 * @param claimAmountCents - Claim amount in cents
 * @param riskScore - Transaction risk score (0-100)
 * @returns Default provision in cents
 *
 * @example
 * // KES 10,000 claim with risk score 40
 * calculateDefaultProvision(1000000, 40)
 * // Returns: 1,000,000 × (40/100) × 0.02 = 8,000 cents (KES 80)
 */
function calculateDefaultProvision(
  claimAmountCents: number,
  riskScore: number
): number {
  if (claimAmountCents <= 0 || !Number.isInteger(claimAmountCents)) {
    throw new Error('Claim amount must be positive integer (cents)');
  }
  if (riskScore < 0 || riskScore > 100) {
    throw new Error('Risk score must be 0-100');
  }

  const provision =
    claimAmountCents * (riskScore / 100) * DEFAULT_PROVISION_MULTIPLIER;

  return Math.round(provision);
}
```

---

## 4. NIM (Net Interest Margin) Calculation

**Formula:**
```
NIM = (Revenue - Capital Cost) ÷ Claim Amount
```

**Implementation:**
```typescript
/**
 * Calculate Net Interest Margin (NIM)
 *
 * NIM measures profitability after accounting for cost of funds
 * Target: 4.5% minimum
 *
 * @param claimAmountCents - Claim amount in cents
 * @param feeRate - Discount fee rate as decimal
 * @param annualRate - Annual interest rate as decimal
 * @param days - Days until collection
 * @returns NIM as decimal (e.g., 0.01274 for 1.274%)
 *
 * @example
 * // BRD Example: KES 10,000, 3% fee, 14% COF, 45 days
 * calculateNIM(1000000, 0.03, 0.14, 45)
 * // Revenue = 30,000 cents
 * // Capital Cost = 17,260 cents
 * // NIM = (30,000 - 17,260) / 1,000,000 = 0.01274 (1.274%)
 */
function calculateNIM(
  claimAmountCents: number,
  feeRate: number,
  annualRate: number,
  days: number
): number {
  const revenueCents = calculateRevenue(claimAmountCents, feeRate);
  const capitalCostCents = calculateCapitalCost(claimAmountCents, annualRate, days);

  const nim = (revenueCents - capitalCostCents) / claimAmountCents;

  return nim;  // Return as decimal, not rounded
}
```

---

## 5. Complete P&L Calculation

**Formula:**
```
Revenue = Claim Amount × Fee Rate
Capital Cost = (Claim Amount × Annual Rate × Days) ÷ 365
Operating Cost = Claim Amount × 0.5%
Default Provision = Claim Amount × (Risk Score ÷ 100) × 2%

Total Costs = Capital Cost + Operating Cost + Default Provision
Net Profit = Revenue - Total Costs
Margin = Net Profit ÷ Claim Amount
```

**Implementation:**
```typescript
interface TransactionPL {
  claimAmountCents: number;
  revenueCents: number;
  capitalCostCents: number;
  operatingCostCents: number;
  defaultProvisionCents: number;
  totalCostsCents: number;
  netProfitCents: number;
  marginRate: number;
  nimRate: number;
}

/**
 * Calculate complete Profit & Loss for a transaction
 *
 * @param claimAmountCents - Claim amount in cents
 * @param riskScore - Transaction risk score (0-100)
 * @param annualRate - Cost of funds annual rate as decimal
 * @param days - Days until collection
 * @returns Complete P&L breakdown
 *
 * @example
 * // BRD Example: KES 10,000, risk 40, 14% COF, 45 days
 * calculatePL(1000000, 40, 0.14, 45)
 * // Returns:
 * // {
 * //   claimAmountCents: 1000000,
 * //   revenueCents: 40000,         // 4% fee (medium risk)
 * //   capitalCostCents: 17260,     // 14% × 45/365
 * //   operatingCostCents: 5000,    // 0.5%
 * //   defaultProvisionCents: 8000, // 40 × 2%
 * //   totalCostsCents: 30260,
 * //   netProfitCents: 9740,
 * //   marginRate: 0.00974,         // 0.974%
 * //   nimRate: 0.02274             // 2.274%
 * // }
 */
function calculatePL(
  claimAmountCents: number,
  riskScore: number,
  annualRate: number,
  days: number
): TransactionPL {
  // Get fee rate based on risk score
  const feeRate = getFeeRate(riskScore);

  // Calculate revenue
  const revenueCents = calculateRevenue(claimAmountCents, feeRate);

  // Calculate all costs
  const capitalCostCents = calculateCapitalCost(claimAmountCents, annualRate, days);
  const operatingCostCents = calculateOperatingCost(claimAmountCents);
  const defaultProvisionCents = calculateDefaultProvision(claimAmountCents, riskScore);

  // Total costs
  const totalCostsCents =
    capitalCostCents + operatingCostCents + defaultProvisionCents;

  // Net profit
  const netProfitCents = revenueCents - totalCostsCents;

  // Margin (includes all costs)
  const marginRate = netProfitCents / claimAmountCents;

  // NIM (only revenue - capital cost)
  const nimRate = (revenueCents - capitalCostCents) / claimAmountCents;

  return {
    claimAmountCents,
    revenueCents,
    capitalCostCents,
    operatingCostCents,
    defaultProvisionCents,
    totalCostsCents,
    netProfitCents,
    marginRate,
    nimRate
  };
}
```

---

## 6. Capital Allocation

### Capital Source Priority

**Strategy: Use cheapest capital first**

```typescript
const CAPITAL_SOURCES = [
  { name: 'Grant', rate: 0.05, available: 50000000, priority: 1 },
  { name: 'Equity', rate: 0.00, available: 100000000, priority: 2 },  // 0% interest but 20% ROE
  { name: 'Bank LOC', rate: 0.14, available: 75000000, priority: 3 },
  { name: 'Investor Debt', rate: 0.20, available: 50000000, priority: 4 }
];
```

**Implementation:**
```typescript
interface CapitalAllocation {
  sourceName: string;
  amountCents: number;
  annualRate: number;
}

/**
 * Allocate capital to a transaction using cheapest-first strategy
 *
 * @param requiredCents - Amount needed in cents
 * @param availableSources - Available capital sources
 * @returns Allocated capital source and details
 *
 * @example
 * allocateCapital(1000000, CAPITAL_SOURCES)
 * // Returns: { sourceName: 'Grant', amountCents: 1000000, annualRate: 0.05 }
 */
function allocateCapital(
  requiredCents: number,
  availableSources: CapitalSource[]
): CapitalAllocation {
  // Sort by priority (already in order, but explicit)
  const sorted = [...availableSources].sort((a, b) => a.priority - b.priority);

  // Find first source with enough capacity
  for (const source of sorted) {
    if (source.remainingCents >= requiredCents) {
      return {
        sourceName: source.name,
        amountCents: requiredCents,
        annualRate: source.annualRate
      };
    }
  }

  throw new Error('Insufficient capital available');
}
```

---

## 7. Portfolio Metrics

### Total Outstanding

**Formula:**
```
Total Outstanding = Sum of all disbursed amounts for active transactions
```

**Implementation:**
```typescript
/**
 * Calculate total amount outstanding to providers
 *
 * @param transactions - All active transactions
 * @returns Total outstanding in cents
 */
function calculateTotalOutstanding(
  transactions: Transaction[]
): number {
  return transactions
    .filter(tx => tx.status === 'active')
    .reduce((sum, tx) => sum + tx.claimAmountCents, 0);
}
```

### Total Expected

**Formula:**
```
Total Expected = Sum of (claim amount + revenue) for active transactions
```

**Implementation:**
```typescript
/**
 * Calculate total expected from insurers
 *
 * @param transactions - All active transactions
 * @returns Total expected in cents
 */
function calculateTotalExpected(
  transactions: Transaction[]
): number {
  return transactions
    .filter(tx => tx.status === 'active')
    .reduce((sum, tx) => {
      const revenueCents = calculateRevenue(tx.claimAmountCents, tx.feeRate);
      return sum + tx.claimAmountCents + revenueCents;
    }, 0);
}
```

### Net Exposure

**Formula:**
```
Net Exposure = Total Expected - Total Outstanding
```

**Implementation:**
```typescript
/**
 * Calculate net exposure (risk we carry)
 *
 * @param totalOutstandingCents - Total paid to providers
 * @param totalExpectedCents - Total expected from insurers
 * @returns Net exposure in cents
 */
function calculateNetExposure(
  totalOutstandingCents: number,
  totalExpectedCents: number
): number {
  return totalExpectedCents - totalOutstandingCents;
}
```

### Portfolio NIM

**Formula:**
```
Portfolio NIM = Sum(transaction NIM × transaction weight)
Weight = Transaction claim amount ÷ Total portfolio value
```

**Implementation:**
```typescript
/**
 * Calculate weighted average NIM across portfolio
 *
 * @param transactions - All active transactions
 * @returns Portfolio NIM as decimal
 */
function calculatePortfolioNIM(
  transactions: Transaction[]
): number {
  const activeTransactions = transactions.filter(tx => tx.status === 'active');

  if (activeTransactions.length === 0) return 0;

  const totalValue = activeTransactions.reduce(
    (sum, tx) => sum + tx.claimAmountCents,
    0
  );

  const weightedNIM = activeTransactions.reduce((sum, tx) => {
    const nim = calculateNIM(
      tx.claimAmountCents,
      tx.feeRate,
      tx.capitalAnnualRate,
      tx.daysToCollection
    );

    const weight = tx.claimAmountCents / totalValue;
    return sum + nim * weight;
  }, 0);

  return weightedNIM;
}
```

---

## 8. Concentration Analysis

**Formula:**
```
Provider Concentration = Provider exposure ÷ Total portfolio
Insurance Concentration = Insurer exposure ÷ Total portfolio
```

**Implementation:**
```typescript
interface ConcentrationMetric {
  name: string;
  exposureCents: number;
  percentageOfPortfolio: number;
}

/**
 * Calculate top provider concentrations
 *
 * @param transactions - All active transactions
 * @param topN - Number of top providers to return (default 3)
 * @returns Top N providers by exposure
 */
function calculateProviderConcentration(
  transactions: Transaction[],
  topN: number = 3
): ConcentrationMetric[] {
  const activeTransactions = transactions.filter(tx => tx.status === 'active');

  const totalExposure = activeTransactions.reduce(
    (sum, tx) => sum + tx.claimAmountCents,
    0
  );

  // Group by provider
  const providerExposures = new Map<string, number>();

  activeTransactions.forEach(tx => {
    const current = providerExposures.get(tx.providerName) || 0;
    providerExposures.set(tx.providerName, current + tx.claimAmountCents);
  });

  // Convert to array and sort
  const concentrations = Array.from(providerExposures.entries())
    .map(([name, exposureCents]) => ({
      name,
      exposureCents,
      percentageOfPortfolio: exposureCents / totalExposure
    }))
    .sort((a, b) => b.exposureCents - a.exposureCents)
    .slice(0, topN);

  return concentrations;
}
```

---

## Test Cases (MUST PASS)

### Test 1: BRD Example - NIM Calculation
```typescript
// From BRD Section 16
const result = calculateNIM(
  1000000,  // KES 10,000 in cents
  0.03,     // 3% fee
  0.14,     // 14% annual rate
  45        // 45 days
);

expect(result).toBeCloseTo(0.01274, 5);  // 1.274% NIM
```

### Test 2: BRD Example - Complete P&L
```typescript
// From BRD Section 16
const result = calculatePL(
  1000000,  // KES 10,000 in cents
  40,       // Risk score 40 (medium)
  0.14,     // 14% annual rate
  45        // 45 days
);

expect(result.revenueCents).toBe(40000);         // KES 400
expect(result.capitalCostCents).toBe(17260);     // KES 172.60
expect(result.operatingCostCents).toBe(5000);    // KES 50
expect(result.defaultProvisionCents).toBe(8000); // KES 80
expect(result.netProfitCents).toBe(9740);        // KES 97.40
expect(result.marginRate).toBeCloseTo(0.00974, 5); // 0.974%
```

### Test 3: Risk Classification
```typescript
expect(getRiskLevel(20)).toBe('low');     // Score 20 → low
expect(getRiskLevel(40)).toBe('medium');  // Score 40 → medium
expect(getRiskLevel(70)).toBe('high');    // Score 70 → high
expect(getFeeRate(20)).toBe(0.03);        // Low → 3%
expect(getFeeRate(40)).toBe(0.04);        // Medium → 4%
expect(getFeeRate(70)).toBe(0.05);        // High → 5%
```

---

## Common Pitfalls to Avoid

### ❌ WRONG: Floating Point Currency
```typescript
const amount = 10000.50;  // DON'T DO THIS
const fee = amount * 0.03;  // 300.015 - PRECISION ERROR!
```

### ✅ CORRECT: Integer Cents
```typescript
const amountCents = 1000050;  // Store as integer cents
const feeCents = Math.round(amountCents * 0.03);  // 30002 cents
```

### ❌ WRONG: Implicit Rounding
```typescript
const cost = (amount * rate * days) / 365;  // Float result
```

### ✅ CORRECT: Explicit Rounding
```typescript
const costCents = Math.round((amountCents * rate * days) / 365);
```

### ❌ WRONG: Percentages as Integers
```typescript
const fee = 3;  // Is this 3% or 3.0?
const nim = 4.5;  // Ambiguous!
```

### ✅ CORRECT: Percentages as Decimals
```typescript
const FEE_RATE = 0.03;   // Clearly 3%
const NIM_RATE = 0.045;  // Clearly 4.5%
```

---

**All formulas verified against BRD examples.**
**Any changes must be validated with test cases.**
