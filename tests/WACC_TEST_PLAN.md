# Time-Based WACC Capital Management - Test Plan

## Overview
Comprehensive test cases for WACC feature covering UI interactions and backend logic validation.

---

## Test Environment Setup

### Prerequisites
- Dev server running: `npm run dev`
- Browser: Chrome/Firefox (latest)
- URL: http://localhost:3000/capital
- Clean state (refresh page to reset in-memory data)

### Test Data
```javascript
// Default Capital Sources (4 sources)
1. Grant Capital: KES 500,000 @ 5%
2. Equity: KES 1,000,000 @ 0%
3. Bank LOC: KES 750,000 @ 14%
4. Investor Debt: KES 500,000 @ 20%

// Expected Initial WACC
Total Capital: KES 2,750,000
Weighted Cost: (500K×5% + 1M×0% + 750K×14% + 500K×20%) / 2.75M = 8.18%
```

---

## Test Suite 1: Add Capital Source (UI + Backend)

### TC-001: Add Valid Capital Source
**Objective:** Verify new capital source appears and WACC recalculates correctly

**Test Steps:**
1. Navigate to `/capital`
2. Note current "Current WACC" value (should be ~8.18%)
3. Note "Total Available" value (should be KES 27.5 Lakhs)
4. Click "Add Capital Source" button
5. Fill form:
   - Source Name: "Test High-Cost Loan"
   - Total Capital: 1000000 (10 Lakhs)
   - Annual Rate: 25
   - Effective Date: (today's date - default)
   - Notes: "Test capital source"
6. Click "Add Capital Source" submit button

**Expected Results:**
- ✅ Dialog closes automatically
- ✅ New source appears in "Capital Sources Detail" table (5th row)
- ✅ Source details correct:
  - Name: "Test High-Cost Loan"
  - Annual Rate: 25.00%
  - Available: KES 10.00 Lakhs
  - Used: KES 0.00
  - Remaining: KES 10.00 Lakhs
  - Utilization: 0.00%
- ✅ "Total Available" increases to KES 37.5 Lakhs (+10 Lakhs)
- ✅ "Current WACC" increases (new calculation):
  ```
  Old: 8.18%
  New: (2.75M × 8.18% + 1M × 25%) / 3.75M = 12.67%
  ```
- ✅ Utilization chart shows 5 bars
- ✅ New bar colored red (most expensive source)

**Backend Validation:**
- Capital history store has new entry
- WACC calculation uses all 5 sources
- State refreshes correctly

---

### TC-002: Add Low-Cost Capital Source
**Objective:** Verify WACC decreases with cheaper capital

**Test Steps:**
1. From clean state (refresh page)
2. Note current WACC (~8.18%)
3. Click "Add Capital Source"
4. Fill form:
   - Source Name: "Cheap Grant"
   - Total Capital: 2000000 (20 Lakhs)
   - Annual Rate: 2
   - Effective Date: (today)
   - Notes: "Low cost grant"
5. Submit

**Expected Results:**
- ✅ "Current WACC" decreases to ~6.35%
  ```
  (2.75M × 8.18% + 2M × 2%) / 4.75M = 6.35%
  ```
- ✅ "Total Available" = KES 47.5 Lakhs
- ✅ New source in table
- ✅ Chart shows green bar (cheapest source)

---

### TC-003: Add Multiple Capital Sources
**Objective:** Verify multiple additions work correctly

**Test Steps:**
1. From clean state
2. Add source 1: "Loan A", 500000, 10%
3. Wait for UI update
4. Add source 2: "Loan B", 500000, 15%
5. Wait for UI update
6. Add source 3: "Loan C", 500000, 20%

**Expected Results:**
- ✅ All 7 sources visible in table (4 original + 3 new)
- ✅ "Total Available" = KES 42.5 Lakhs
- ✅ WACC recalculates after each addition
- ✅ Each addition triggers re-render
- ✅ No sources disappear
- ✅ Order maintained (newest at bottom)

---

### TC-004: Form Validation - Required Fields
**Objective:** Test client-side validation

**Test Steps:**
1. Click "Add Capital Source"
2. Leave "Source Name" empty
3. Fill other fields
4. Click submit

**Expected Results:**
- ✅ Error message: "Please fill all fields with valid values"
- ✅ Dialog stays open
- ✅ No new source added

**Repeat for each required field:**
- Empty name → Error
- Empty capital → Error
- Empty rate → Error
- All empty → Error

---

### TC-005: Form Validation - Invalid Values
**Objective:** Test numeric validation

**Test Cases:**
| Field | Invalid Value | Expected Error |
|-------|---------------|----------------|
| Capital | 0 | "Please fill all fields with valid values" |
| Capital | -1000 | "Please fill all fields with valid values" |
| Capital | abc | "Please fill all fields with valid values" |
| Rate | -5 | "Please fill all fields with valid values" |
| Rate | abc | "Please fill all fields with valid values" |

**Test Steps:**
1. Enter invalid value
2. Try to submit
3. Verify error shown
4. Verify no source added

---

### TC-006: Form Validation - Future Date
**Objective:** Verify future dates are blocked

**Test Steps:**
1. Click "Add Capital Source"
2. Fill all fields correctly
3. Change effective date to tomorrow
4. Submit

**Expected Results:**
- ✅ Error message shown
- ✅ Dialog stays open
- ✅ No source added

---

### TC-007: Form Validation - Name Length
**Objective:** Test name constraints

**Test Steps:**
1. Enter name: "AB" (2 characters)
2. Fill other fields
3. Submit

**Expected Results:**
- ✅ Error (minimum 3 characters)

**Then:**
4. Enter name: "ABC" (3 characters)
5. Submit

**Expected Results:**
- ✅ Success (minimum met)

---

## Test Suite 2: Period Selection (UI + WACC Logic)

### TC-101: Monthly Period Selection
**Objective:** Verify monthly period works and calculates correct WACC

**Test Steps:**
1. Navigate to WACC Analysis section
2. Period type should default to "Monthly"
3. Click "This Month" preset
4. Note the period metrics

**Expected Results:**
- ✅ Start WACC displayed (WACC at start of current month)
- ✅ End WACC displayed (WACC at end of current month)
- ✅ Average WACC displayed (time-weighted average)
- ✅ Chart shows 12 monthly bars
- ✅ Labels: "Jan 2025", "Feb 2025", etc. (NOT "Jan 1, 2025 - Jan 31, 2025")
- ✅ Current month highlighted/most recent

**Backend Validation:**
- Period dates calculated correctly (month start to end)
- WACC at each date retrieved from history
- Chart data has 12 entries

---

### TC-102: Quarterly Period Selection
**Objective:** Test quarterly periods

**Test Steps:**
1. Change period type to "Quarterly"
2. Click "This Quarter"

**Expected Results:**
- ✅ Start/End/Average WACC for current quarter
- ✅ Chart shows 4 quarterly bars
- ✅ Labels: "Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"
- ✅ Period metrics update

**Then click "Last Quarter":**
- ✅ Metrics show previous quarter
- ✅ Chart still shows last 4 quarters

---

### TC-103: Yearly Period Selection
**Objective:** Test yearly periods

**Test Steps:**
1. Change period type to "Yearly"
2. Click "This Year"

**Expected Results:**
- ✅ Start WACC: Jan 1, 2025
- ✅ End WACC: Dec 31, 2025
- ✅ Average WACC: weighted average for 2025
- ✅ Chart shows 3 yearly bars
- ✅ Labels: "2023", "2024", "2025" (NOT "Jan 1, 2025 - Dec 31, 2025")

---

### TC-104: 60-Day Period Selection
**Objective:** Test rolling 60-day periods

**Test Steps:**
1. Change period type to "60-Day"
2. Select start date: Jan 1, 2025
3. Note calculated end date

**Expected Results:**
- ✅ End date auto-calculated: Mar 2, 2025 (61 days inclusive)
- ✅ Helper text shows: "60 days from Jan 1, 2025 to Mar 2, 2025"
- ✅ Start/End/Average WACC for this 60-day period
- ✅ Chart shows last 6 rolling 60-day periods

---

### TC-105: 90-Day Period Selection
**Objective:** Test rolling 90-day periods

**Test Steps:**
1. Change period type to "90-Day"
2. Select start date: Jan 1, 2025

**Expected Results:**
- ✅ End date: Apr 1, 2025 (91 days inclusive)
- ✅ Helper text correct
- ✅ Metrics display
- ✅ Chart shows last 6 rolling 90-day periods

---

### TC-106: Custom Period Selection (Bug Fix Verification)
**Objective:** Verify custom periods don't crash (Bug #2 fix)

**Test Steps:**
1. Change period type to "Custom"
2. Select start date: Feb 1, 2025
3. Select end date: Feb 28, 2025
4. Observe UI

**Expected Results:**
- ✅ No crash/error
- ✅ Start WACC: Feb 1
- ✅ End WACC: Feb 28
- ✅ Average WACC: 28-day weighted average
- ✅ Chart shows single period
- ✅ Label: "Feb 1, 2025 - Feb 28, 2025" (custom format OK here)

**Backend Validation:**
- calculatePeriodWACC called with (Feb1, Feb28, history)
- No getPeriodDates call (would throw for 'custom')
- Correct date range passed through

---

### TC-107: Custom Period - Invalid Range
**Objective:** Test custom period validation

**Test Steps:**
1. Select period type: "Custom"
2. Select start date: Feb 28, 2025
3. Select end date: Feb 1, 2025 (before start)

**Expected Results:**
- ✅ Error message: "End date must be after start date"
- ✅ Metrics don't calculate
- ✅ Chart shows previous valid data or empty

---

### TC-108: Custom Period - Same Day
**Objective:** Test edge case

**Test Steps:**
1. Period type: "Custom"
2. Start date: Jan 15, 2025
3. End date: Jan 15, 2025 (same day)

**Expected Results:**
- ✅ No crash
- ✅ Start WACC = End WACC (same moment)
- ✅ Average WACC = Start WACC (single day)
- ✅ Chart shows single point

---

### TC-109: Period Type Detection - February (Bug #3 Fix)
**Objective:** Verify short months labeled correctly

**Test Steps:**
1. Select "Monthly" period
2. View chart for February 2025 (28 days)

**Expected Results:**
- ✅ Label shows "Feb 2025" (NOT "Feb 1, 2025 - Feb 28, 2025")
- ✅ Period detected as 'monthly' not 'custom'

**Backend Validation:**
- getDaysBetween(Feb1, Feb28) = 27
- inclusiveDays = 27 + 1 = 28
- 28 >= 28 && 28 <= 31 → monthly ✓

---

### TC-110: Period Type Detection - Leap Year
**Objective:** Verify leap year February works

**Test Steps:**
1. (If in 2024) Select February 2024
2. Verify it has 29 days

**Expected Results:**
- ✅ Label: "Feb 2024"
- ✅ Detected as 'monthly'
- ✅ inclusiveDays = 29 (within 28-31 range)

---

### TC-111: Period Type Detection - Non-Leap Year (Bug #3 Fix)
**Objective:** Verify 365-day years labeled correctly

**Test Steps:**
1. Select "Yearly" period
2. View 2025 (non-leap year)

**Expected Results:**
- ✅ Label shows "2025" (NOT "Jan 1, 2025 - Dec 31, 2025")
- ✅ Period detected as 'yearly' not 'custom'

**Backend Validation:**
- getDaysBetween(Jan1, Dec31) = 364
- inclusiveDays = 364 + 1 = 365
- 365 >= 365 && 365 <= 366 → yearly ✓

---

## Test Suite 3: WACC Calculations (Backend Logic via UI)

### TC-201: WACC Calculation - Single Source
**Objective:** Verify basic WACC formula

**Test Steps:**
1. (Theoretical - or create test environment)
2. Single source: 1,000,000 @ 10%

**Expected WACC:**
```
WACC = (1M / 1M) × 10% = 10.00%
```

---

### TC-202: WACC Calculation - Two Equal Sources
**Objective:** Test averaging logic

**Test Data:**
- Source A: 1,000,000 @ 10%
- Source B: 1,000,000 @ 20%

**Expected WACC:**
```
Total: 2M
WACC = (1M/2M × 10%) + (1M/2M × 20%)
     = 0.5 × 10% + 0.5 × 20%
     = 5% + 10%
     = 15.00%
```

**Verification:**
- Check "Current WACC" displays 15.00%

---

### TC-203: WACC Calculation - Weighted Sources
**Objective:** Test weighted average

**Test Data:**
- Source A: 3,000,000 @ 5%
- Source B: 1,000,000 @ 20%

**Expected WACC:**
```
Total: 4M
WACC = (3M/4M × 5%) + (1M/4M × 20%)
     = 0.75 × 5% + 0.25 × 20%
     = 3.75% + 5%
     = 8.75%
```

**Verification:**
- Current WACC = 8.75%

---

### TC-204: WACC Calculation - Zero-Cost Source
**Objective:** Test 0% rate handling

**Test Data:**
- Source A: 2,000,000 @ 0% (equity)
- Source B: 1,000,000 @ 15%

**Expected WACC:**
```
Total: 3M
WACC = (2M/3M × 0%) + (1M/3M × 15%)
     = 0% + 5%
     = 5.00%
```

---

### TC-205: WACC with Dynamic Additions
**Objective:** Verify WACC updates after each addition

**Test Steps:**
1. Start with 4 default sources (WACC = 8.18%)
2. Add Source: 1M @ 30%
3. Note new WACC
4. Add Source: 2M @ 5%
5. Note new WACC

**Expected:**
```
Step 1: 8.18% (baseline)
Step 2: (2.75M × 8.18% + 1M × 30%) / 3.75M = 14.00%
Step 3: (3.75M × 14.00% + 2M × 5%) / 5.75M = 10.87%
```

**Verification:**
- Each addition triggers recalculation
- WACC card updates in real-time
- Calculations are accurate

---

### TC-206: Time-Weighted Average WACC
**Objective:** Test period WACC averaging

**Scenario:**
- Period: Jan 1 - Jan 31
- Jan 1-15: WACC = 10%
- Jan 16-31: WACC = 20% (source added on Jan 16)

**Expected Average WACC:**
```
Average = (10% × 15 days + 20% × 16 days) / 31 days
        = (150 + 320) / 31
        = 15.16%
```

**Note:** This is theoretical - actual test requires date manipulation or mock data

---

## Test Suite 4: UI Integration & State Management

### TC-301: Page Load Performance
**Objective:** Verify fast initial load

**Test Steps:**
1. Open browser DevTools (Network tab)
2. Hard refresh page
3. Measure time to interactive

**Expected Results:**
- ✅ Page loads < 3 seconds
- ✅ All cards render
- ✅ Chart renders
- ✅ No JavaScript errors in console
- ✅ No 404s in network tab

---

### TC-302: State Persistence (In-Memory)
**Objective:** Verify state persists during session

**Test Steps:**
1. Add capital source: "Test", 1M, 10%
2. Navigate to /transactions page
3. Navigate back to /capital
4. Check if source still exists

**Expected Results:**
- ❌ Source gone (in-memory only - expected)
- ✅ Back to 4 default sources
- ✅ No error on re-init

---

### TC-303: State Refresh on Add
**Objective:** Verify refreshKey mechanism works

**Test Steps:**
1. Open browser DevTools (React DevTools if available)
2. Add capital source
3. Watch component re-render

**Expected Results:**
- ✅ Component re-renders (refreshKey increments)
- ✅ capitalSources array recalculated
- ✅ All derived state updates (metrics, chart)

---

### TC-304: Multiple Rapid Additions
**Objective:** Test race conditions

**Test Steps:**
1. Add source 1 rapidly
2. Immediately add source 2
3. Immediately add source 3
4. Don't wait for UI updates

**Expected Results:**
- ✅ All 3 sources appear
- ✅ No sources lost
- ✅ Final WACC correct for all 3
- ✅ No duplicate entries

---

### TC-305: Browser Back/Forward
**Objective:** Test navigation handling

**Test Steps:**
1. Add capital source
2. Change period to Quarterly
3. Click browser back button
4. Click browser forward button

**Expected Results:**
- ✅ No crashes
- ✅ State maintains correctly
- ✅ No duplicate sources

---

## Test Suite 5: Chart Visualization

### TC-401: Chart Renders Correctly
**Objective:** Verify chart displays

**Test Steps:**
1. Navigate to WACC Analysis section
2. View chart

**Expected Results:**
- ✅ Chart visible (not blank)
- ✅ X-axis shows period labels
- ✅ Y-axis shows percentages (0-25%)
- ✅ Line connects data points
- ✅ Smooth curve (monotone)
- ✅ Theme colors applied

---

### TC-402: Chart Tooltip
**Objective:** Test interactive tooltip

**Test Steps:**
1. Hover over chart line
2. Observe tooltip

**Expected Results:**
- ✅ Tooltip appears
- ✅ Shows period name
- ✅ Shows WACC percentage (e.g., "8.50%")
- ✅ Shows total capital (e.g., "KES 27.5 Lakhs")
- ✅ Tooltip follows cursor

---

### TC-403: Chart Updates on Period Change
**Objective:** Verify chart reactivity

**Test Steps:**
1. View monthly chart (12 bars)
2. Change to quarterly
3. Observe chart

**Expected Results:**
- ✅ Chart updates immediately
- ✅ Now shows 4 bars (not 12)
- ✅ Labels change to Q1, Q2, etc.
- ✅ Smooth transition (no flicker)

---

### TC-404: Chart Empty State
**Objective:** Test with no data

**Test Steps:**
1. (Requires code modification to simulate empty history)
2. View chart with empty data array

**Expected Results:**
- ✅ "No data available" message
- ✅ No chart errors
- ✅ Maintains height

---

### TC-405: Chart Responsive Design
**Objective:** Test on different screen sizes

**Test Steps:**
1. View on desktop (1920x1080)
2. Resize to tablet (768px)
3. Resize to mobile (375px)

**Expected Results:**
- ✅ Chart scales responsively
- ✅ Labels remain readable
- ✅ Tooltip still works
- ✅ No horizontal scroll

---

## Test Suite 6: Edge Cases & Error Handling

### TC-501: Division by Zero - No Capital Sources
**Objective:** Test edge case handling

**Test Steps:**
1. (Requires simulating empty CAPITAL_SOURCES)
2. View WACC

**Expected Results:**
- ✅ WACC = 0.00% (not NaN or Infinity)
- ✅ No console errors
- ✅ "Total Available" = 0

---

### TC-502: Very Large Numbers
**Objective:** Test number formatting

**Test Steps:**
1. Add source: 1000000000 (100 Crores)
2. Check display

**Expected Results:**
- ✅ Displays as "KES 100.00 Cr"
- ✅ No scientific notation
- ✅ WACC calculates correctly

---

### TC-503: Very Small Rate
**Objective:** Test decimal precision

**Test Steps:**
1. Add source: 1M @ 0.01%
2. Check WACC

**Expected Results:**
- ✅ Rate displays as "0.01%"
- ✅ WACC calculation includes this
- ✅ No rounding errors

---

### TC-504: Special Characters in Name
**Objective:** Test input sanitization

**Test Steps:**
1. Add source with name: "Test & <script>alert('xss')</script>"
2. Submit

**Expected Results:**
- ✅ Name saved correctly
- ✅ No XSS executed (React auto-escapes)
- ✅ Displays in table safely

---

## Test Suite 7: Cross-Browser Compatibility

### TC-601: Chrome
**Test Steps:**
1. Run all above tests in Chrome

**Expected:** All pass ✓

---

### TC-602: Firefox
**Test Steps:**
1. Run critical tests in Firefox

**Expected:** All pass ✓

---

### TC-603: Safari
**Test Steps:**
1. Run critical tests in Safari

**Expected:** All pass ✓

**Known Issues:**
- Date picker might look different (browser native)

---

## Test Execution Summary

### Priority Levels

**P0 - Critical (Must Test):**
- TC-001: Add capital source
- TC-106: Custom period (bug fix verification)
- TC-109: February labeling (bug fix verification)
- TC-111: Non-leap year (bug fix verification)
- TC-201-205: WACC calculations

**P1 - High:**
- TC-004-007: Form validations
- TC-101-105: Period selections
- TC-301-304: State management

**P2 - Medium:**
- TC-401-405: Chart tests
- TC-501-504: Edge cases

**P3 - Low:**
- TC-601-603: Cross-browser

---

## Automated Test Recommendations

### Unit Tests Needed
```typescript
// lib/calculations/wacc.test.ts
describe('calculateWACCAtDate', () => {
  test('single source returns source rate', () => {})
  test('two equal sources returns average', () => {})
  test('weighted sources calculates correctly', () => {})
  test('empty history returns 0', () => {})
})

// lib/utils/date-period.test.ts
describe('getDaysBetween', () => {
  test('Feb 1-28 returns 27 (exclusive)', () => {})
  test('leap year Feb has 29 days', () => {})
})
```

### Integration Tests Needed
```typescript
// __tests__/capital-page.test.tsx
describe('Capital Management Page', () => {
  test('adds capital source and updates UI', () => {})
  test('period selector changes chart', () => {})
})
```

---

## Bug Regression Tests

### Bug #1: Capital Sources Not Appearing
**Test:** TC-001, TC-003
**Verify:** Sources appear in UI after add

### Bug #2: Custom Period Crash
**Test:** TC-106, TC-107
**Verify:** Custom periods don't crash

### Bug #3: Period Label Detection
**Test:** TC-109, TC-111
**Verify:** Short months and years labeled correctly

---

## Test Report Template

```markdown
## Test Execution Report - WACC Feature
**Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** [Dev/QA/UAT]

### Summary
- Total Tests: X
- Passed: X
- Failed: X
- Blocked: X

### Failed Tests
| ID | Name | Result | Notes |
|----|------|--------|-------|
| TC-XXX | ... | FAIL | ... |

### Issues Found
1. [Description]
   - Severity: P0/P1/P2/P3
   - Steps to reproduce
   - Expected vs Actual

### Sign-off
- [ ] All P0 tests passed
- [ ] All P1 tests passed
- [ ] Bugs logged
- [ ] Ready for next phase
```
