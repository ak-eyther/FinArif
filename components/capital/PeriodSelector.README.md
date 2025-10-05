# PeriodSelector Component

## Overview

The `PeriodSelector` component is a comprehensive period selection UI for the Time-Based WACC Capital Management feature (Phase 2 - Wave 3). It provides an intuitive interface for selecting different time periods with various modes and presets.

## File Location

```text
/Users/arifkhan/Desktop/FinArif/finarif-dashboard/components/capital/PeriodSelector.tsx
```

## Features Implemented

### 1. Period Type Selection

- **Dropdown/Select** for choosing period type
- **Supported types:**
  - Monthly
  - Quarterly
  - Yearly
  - 60-Day
  - 90-Day
  - Custom
- **Default:** Monthly
- Uses shadcn/ui `Select` component with proper styling

### 2. Quick Date Presets

Contextual preset buttons that appear based on selected period type:

**Monthly:**

- This Month
- Last Month

**Quarterly:**

- This Quarter
- Last Quarter

**Yearly:**

- This Year
- Last Year

### 3. Custom Date Range

When "Custom" period type is selected:

- **Two date pickers:** Start Date and End Date
- **Calendar with Popover** UI for easy date selection
- **Validation:** End date must be after start date
- **Error message** displayed when validation fails
- **Disabled dates** on end date picker (can't select before start date)
- **Formatted display** using date-fns

### 4. Reference Date Selector (60-Day/90-Day)

For fixed-duration periods:

- **Single date picker** for start date
- **Auto-calculates** end date based on period type (60 or 90 days)
- **Helper text** shows "60/90 days from [date] to [date]"
- Uses `addDays` utility from date-period utilities

### 5. onChange Callback

- **Emits both** `PeriodType` and `DateRange` when selection changes
- **Automatic date calculation** from period type and user selection
- **Type-safe** interface with full TypeScript support

## Component Props

```typescript
interface PeriodSelectorProps {
  value: {
    periodType: PeriodType;
    dateRange: DateRange;
  };
  onChange: (selection: {
    periodType: PeriodType;
    dateRange: DateRange;
  }) => void;
}
```

## Usage Example

```tsx
import { PeriodSelector } from "@/components/capital/PeriodSelector";
import type { PeriodType, DateRange } from "@/lib/types";

function MyComponent() {
  const [selection, setSelection] = React.useState<{
    periodType: PeriodType;
    dateRange: DateRange;
  }>({
    periodType: "monthly",
    dateRange: {
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2025, 0, 31),
    },
  });

  return <PeriodSelector value={selection} onChange={setSelection} />;
}
```

## Date Calculation Logic

### Standard Periods (Monthly, Quarterly, Yearly)

1. Uses `getPeriodDates()` utility with current date
2. Automatically calculates start and end based on period type:
   - **Monthly:** First day to last day of month
   - **Quarterly:** First day of quarter to last day of quarter
   - **Yearly:** January 1 to December 31

### Fixed-Duration Periods (60-Day, 90-Day)

1. User selects a reference/start date
2. End date calculated using `addDays(referenceDate, 60 or 90)`
3. Both dates emitted via onChange callback

### Custom Period

1. User selects both start and end dates independently
2. Validation ensures end date > start date
3. End date picker disables all dates before selected start date

### Quick Presets

Each preset calculates the appropriate date range:

- **This Month/Quarter/Year:** Uses current date with period utilities
- **Last Month/Quarter/Year:** Subtracts appropriate time unit from current date
- **Example for "Last Month":**

```typescript
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const range = {
  startDate: getStartOfMonth(lastMonth),
  endDate: getEndOfMonth(lastMonth),
};
```

## Layout & Responsiveness

### Desktop (sm and above)

- **Horizontal layout:** Period Type dropdown on left, presets/pickers on right
- **Aligned items** for consistent visual hierarchy
- **Grouped sections** with proper spacing

### Mobile (below sm)

- **Vertical stacking** for all elements
- **Full-width** controls for easier touch interaction
- **Maintained visual grouping** with consistent spacing

## shadcn/ui Components Used

- ✅ `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- ✅ `Button` (for presets and calendar triggers)
- ✅ `Calendar` (from react-day-picker)
- ✅ `Popover`, `PopoverContent`, `PopoverTrigger`
- ✅ `Label`

## Utilities Imported

### From `@/lib/types`

- `PeriodType`
- `DateRange`

### From `@/lib/utils/date-period`

- `getPeriodDates` - Main period calculation function
- `getStartOfMonth`, `getEndOfMonth` - Month boundaries
- `getStartOfQuarter`, `getEndOfQuarter` - Quarter boundaries
- `getStartOfYear`, `getEndOfYear` - Year boundaries
- `addDays` - Date arithmetic for 60/90-day periods
- `subtractDays` - (imported but available if needed)

### From `date-fns`

- `format` - Date formatting for display

## State Management

### Internal State

- `customStartDate` - Tracks start date for custom period
- `customEndDate` - Tracks end date for custom period
- `referenceDate` - Tracks start date for 60/90-day periods

### State Synchronization

- State updates trigger `onChange` callback with new selection
- Parent component controls the actual value via props
- Component handles intermediate UI state internally

## Validation & Error Handling

1. **Custom Period Validation**
   - Checks if end date > start date
   - Displays error message when invalid
   - Prevents invalid date range from being emitted

2. **Date Picker Constraints**
   - End date picker disables dates before start date
   - Prevents user from creating invalid ranges through UI

3. **Period Type Switching**
   - Gracefully handles switching between period types
   - Preserves custom dates when switching back to custom
   - Initializes with sensible defaults for each type

## Accessibility

- **Keyboard navigation** through all controls
- **Screen reader support** via semantic HTML and ARIA labels
- **Focus management** in popovers and calendars
- **Clear visual feedback** for selected states

## Performance Considerations

- **Memoization opportunities:** Consider wrapping preset handlers if performance is critical
- **Lightweight state:** Minimal re-renders, only when selection actually changes
- **Lazy rendering:** Only shows relevant UI for selected period type

## Future Enhancements

Potential improvements for future iterations:

- Add "Compare to previous period" toggle
- Support for fiscal year vs calendar year
- Keyboard shortcuts for common presets
- Date range history/recent selections
- Time zone support if needed
- Preset customization via props

## Dependencies

- React 18+
- shadcn/ui components (Select, Button, Calendar, Popover, Label)
- lucide-react (icons)
- date-fns (date formatting)
- Custom utilities from `@/lib/utils/date-period`

## Component Size

- **Lines of code:** 490
- **File size:** ~14KB

## Testing Considerations

When testing this component:

1. **Period Type Changes**
   - Verify all 6 period types work correctly
   - Check date calculations for each type

2. **Preset Buttons**
   - Test all presets across month boundaries
   - Verify leap year handling
   - Test quarter calculations

3. **Custom Date Range**
   - Test validation error display
   - Verify date picker constraints
   - Test switching between dates

4. **60/90-Day Periods**
   - Verify correct day counting
   - Test date arithmetic accuracy
   - Check helper text formatting

5. **Edge Cases**
   - Month/year boundaries
   - Leap years
   - Invalid date states
   - Rapid period type switching

## Issues Encountered

No issues encountered during implementation. All requirements were successfully implemented:

- ✅ Period type selection with 6 options
- ✅ Quick date presets for Monthly/Quarterly/Yearly
- ✅ Custom date range with validation
- ✅ Reference date selector for 60/90-day periods
- ✅ onChange callback with proper typing
- ✅ Responsive layout (horizontal → vertical)
- ✅ All shadcn/ui components properly integrated
- ✅ Date utilities correctly imported and used
- ✅ Clear visual grouping and spacing

## Related Files

- **Example usage:** `PeriodSelector.example.tsx`
- **Type definitions:** `/lib/types/index.ts`, `/lib/types/capital-history.ts`
- **Date utilities:** `/lib/utils/date-period.ts`
- **UI components:** `/components/ui/*.tsx`
