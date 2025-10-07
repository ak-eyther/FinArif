# COMPONENT TREE & HIERARCHY
## Provider 360° Analytics Module

**Version:** 1.0
**Date:** October 2025

---

## 📊 COMPONENT HIERARCHY (ASCII Tree)

```
app/
├── layout.tsx (Root Layout)
└── (dashboard)/
    ├── layout.tsx (DashboardLayout)
    │   ├── Sidebar
    │   ├── Header
    │   └── {children}
    │
    ├── page.tsx (Dashboard)
    │   ├── MetricCard (×4)
    │   └── RecentTransactionsTable
    │
    ├── providers/
    │   ├── page.tsx (ProviderListPage)
    │   │   ├── ProviderKPICards
    │   │   ├── FilterPanel
    │   │   ├── SearchBar
    │   │   ├── ProviderTable
    │   │   │   ├── DataTable
    │   │   │   ├── RiskBadge
    │   │   │   ├── TrendIndicator
    │   │   │   └── HyperlinkCell
    │   │   └── ExportButton
    │   │
    │   └── [id]/
    │       └── page.tsx (ProviderDetailPage)
    │           ├── Breadcrumb
    │           ├── ProviderHeader
    │           ├── MetricCard (×4)
    │           ├── ClaimsTrendChart
    │           ├── PayerBreakdownTable
    │           ├── ARAgingChart
    │           └── RecentClaimsTable
    │
    ├── payers/
    │   ├── page.tsx (PayerListPage)
    │   └── [id]/
    │       └── page.tsx (PayerDetailPage)
    │           ├── Breadcrumb
    │           ├── PayerHeader
    │           ├── MetricCard (×4)
    │           ├── SchemesTable
    │           ├── ProviderBreakdownTable
    │           └── ClaimsTable
    │
    ├── schemes/
    │   └── [id]/
    │       └── page.tsx (SchemeDetailPage)
    │           ├── Breadcrumb
    │           ├── SchemeHeader
    │           ├── ParentPayerCard
    │           ├── ProviderBreakdownTable
    │           └── ClaimsTable
    │
    ├── transactions/
    │   ├── page.tsx (TransactionListPage)
    │   │   ├── FilterPanel
    │   │   └── TransactionTable
    │   │       └── HyperlinkCells (Provider, Payer, Scheme)
    │   │
    │   └── [id]/
    │       └── page.tsx (TransactionDetailPage)
    │           ├── Breadcrumb
    │           ├── TransactionHeader
    │           ├── HyperlinkChips (Provider, Payer, Scheme)
    │           ├── PLBreakdown
    │           ├── TimelineView
    │           └── RelatedTransactions
    │
    ├── claims/
    │   ├── upload/
    │   │   └── page.tsx (ClaimsUploadPage)
    │   │       ├── UploadWizard
    │   │       │   ├── FileUploader
    │   │       │   ├── ValidationStep
    │   │       │   └── ReviewStep
    │   │       ├── ValidationReport
    │   │       └── RecentUploadsTable
    │   │
    │   └── map/
    │       └── page.tsx (ManualMapperPage) ⭐ NEW
    │           ├── MappingKPICards
    │           ├── MappingEngine
    │           │   ├── SuggestionCard (×3)
    │           │   ├── ManualSearchDropdown
    │           │   └── BulkActionBar
    │           └── MappingHistory
    │
    ├── settings/
    │   ├── providers/
    │   │   └── page.tsx (ProviderSettingsPage)
    │   │       ├── ProviderTable
    │   │       └── ProviderFormDialog
    │   │           ├── BasicInfoSection
    │   │           ├── ContactSection
    │   │           └── FinancialSection
    │   │
    │   └── payers/
    │       └── page.tsx (PayerSettingsPage)
    │           ├── PayerTable
    │           ├── SchemeTable
    │           ├── PayerFormDialog
    │           └── SchemeFormDialog
    │
    └── data-quality/
        └── page.tsx (DataQualityPage)
            ├── QualityScoreCard
            ├── QualityTrendChart
            ├── IssuesTable
            ├── CompletenessPanel
            └── ValidationRulesTable

components/
├── providers/
│   ├── ProviderList.tsx
│   ├── ProviderKPICards.tsx
│   ├── ProviderHeader.tsx
│   ├── ProviderTable.tsx
│   ├── ProviderForm.tsx
│   ├── PayerBreakdownTable.tsx
│   ├── ARAgingChart.tsx
│   └── ClaimsTrendChart.tsx
│
├── claims/
│   ├── ClaimsUploader.tsx
│   ├── FileUploader.tsx
│   ├── ValidationReport.tsx
│   ├── ClaimsTable.tsx
│   └── ClaimStatusBadge.tsx
│
├── mappings/ ⭐ NEW
│   ├── MappingEngine.tsx
│   ├── SuggestionCard.tsx
│   ├── ConfidenceScore.tsx
│   ├── BulkMappingTools.tsx
│   └── MappingHistory.tsx
│
├── shared/
│   ├── MetricCard.tsx ✅ Reusable
│   ├── TrendIndicator.tsx ✅ Reusable
│   ├── RiskBadge.tsx ✅ Reusable
│   ├── DataTable.tsx ✅ Reusable (generic)
│   ├── FilterPanel.tsx ✅ Reusable
│   ├── SearchBar.tsx ✅ Reusable
│   ├── ExportButton.tsx ✅ Reusable
│   ├── DateRangePicker.tsx ✅ Reusable
│   ├── HyperlinkCell.tsx ⭐ NEW ✅ Reusable
│   ├── Breadcrumb.tsx ⭐ NEW ✅ Reusable
│   └── LoadingSkeleton.tsx ✅ Reusable
│
└── ui/ (shadcn/ui primitives)
    ├── button.tsx
    ├── card.tsx
    ├── table.tsx
    ├── dialog.tsx
    ├── badge.tsx
    ├── input.tsx
    ├── select.tsx
    ├── calendar.tsx
    └── ... (20+ shadcn components)

lib/
├── hooks/
│   ├── useProviders.ts
│   ├── useClaims.ts
│   ├── useMappings.ts ⭐ NEW
│   ├── useAnalytics.ts
│   └── useSupabase.ts
│
└── utils/
    ├── supabase-client.ts
    ├── formatters.ts
    └── validation.ts
```

---

## 🎯 KEY COMPONENT SPECIFICATIONS

### 1. HyperlinkCell Component ⭐ NEW

```typescript
// components/shared/HyperlinkCell.tsx
interface HyperlinkCellProps {
  type: 'provider' | 'payer' | 'scheme' | 'transaction';
  id: string;
  name: string;
  subtitle?: string;
  onClick?: () => void;
}

export function HyperlinkCell({ type, id, name, subtitle }: HyperlinkCellProps) {
  const href = {
    provider: `/providers/${id}`,
    payer: `/payers/${id}`,
    scheme: `/schemes/${id}`,
    transaction: `/transactions/${id}`
  }[type];

  return (
    <Link href={href} className="group">
      <div className="flex flex-col">
        <span className="text-blue-600 hover:underline group-hover:text-blue-800">
          {name}
        </span>
        {subtitle && (
          <span className="text-xs text-gray-500">{subtitle}</span>
        )}
      </div>
    </Link>
  );
}

// Usage in TransactionTable
<HyperlinkCell
  type="provider"
  id={row.provider_id}
  name={row.provider_name}
  subtitle={row.provider_code}
/>
```

### 2. MappingEngine Component ⭐ NEW

```typescript
// components/mappings/MappingEngine.tsx
interface MappingEngineProps {
  unmappedClaims: Claim[];
  onMap: (claimId: string, providerId: string) => Promise<void>;
  onSkip: (claimId: string) => void;
  onBulkMap: (mappings: ClaimProviderMapping[]) => Promise<void>;
}

export function MappingEngine({
  unmappedClaims,
  onMap,
  onSkip,
  onBulkMap
}: MappingEngineProps) {
  const [currentClaim, setCurrentClaim] = useState(unmappedClaims[0]);
  const { data: suggestions } = useSuggestions(currentClaim.invoice_number);

  return (
    <div className="space-y-4">
      {/* Current Claim Card */}
      <ClaimCard claim={currentClaim} />

      {/* AI Suggestions (Top 3) */}
      <div className="grid grid-cols-3 gap-4">
        {suggestions.slice(0, 3).map(suggestion => (
          <SuggestionCard
            key={suggestion.provider_id}
            suggestion={suggestion}
            onAccept={() => onMap(currentClaim.id, suggestion.provider_id)}
          />
        ))}
      </div>

      {/* Manual Search */}
      <ProviderSearchDropdown
        onSelect={(providerId) => onMap(currentClaim.id, providerId)}
      />

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => onSkip(currentClaim.id)}>
          Skip
        </Button>
        <Button onClick={nextClaim}>
          Next ({unmappedClaims.length - 1} remaining)
        </Button>
      </div>
    </div>
  );
}
```

### 3. DataTable Component (Enhanced)

```typescript
// components/shared/DataTable.tsx
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  onRowClick?: (row: T) => void;
  hyperlinkColumns?: {
    [key: string]: (row: T) => HyperlinkCellProps;
  };
}

export function DataTable<T>({
  data,
  columns,
  pagination = true,
  sorting = true,
  filtering = true,
  hyperlinkColumns
}: DataTableProps<T>) {
  // TanStack Table v8 implementation
  const table = useReactTable({
    data,
    columns: columns.map(col => {
      if (hyperlinkColumns?.[col.id]) {
        return {
          ...col,
          cell: ({ row }) => (
            <HyperlinkCell {...hyperlinkColumns[col.id](row.original)} />
          )
        };
      }
      return col;
    }),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return <Table>...</Table>;
}

// Usage
<DataTable
  data={transactions}
  columns={transactionColumns}
  hyperlinkColumns={{
    provider_name: (row) => ({
      type: 'provider',
      id: row.provider_id,
      name: row.provider_name
    }),
    payer_name: (row) => ({
      type: 'payer',
      id: row.payer_id,
      name: row.payer_name
    })
  }}
/>
```

---

## 📦 COMPONENT PROPS REFERENCE

### Page Components (Server Components by default)

```typescript
// app/(dashboard)/providers/page.tsx
export default async function ProvidersPage({
  searchParams
}: {
  searchParams: { search?: string; status?: string; page?: string }
}) {
  const providers = await getProviders(searchParams);
  return <ProviderList providers={providers} />;
}

// app/(dashboard)/providers/[id]/page.tsx
export default async function ProviderDetailPage({
  params
}: {
  params: { id: string }
}) {
  const provider = await getProviderById(params.id);
  const analytics = await getProviderAnalytics(params.id);
  return <ProviderDetail provider={provider} analytics={analytics} />;
}
```

### Feature Components (Client Components)

```typescript
// components/providers/ProviderList.tsx
'use client';

interface ProviderListProps {
  providers: Provider[];
}

export function ProviderList({ providers }: ProviderListProps) {
  const [filters, setFilters] = useState({});
  const [sorting, setSorting] = useState({});

  return (
    <div>
      <FilterPanel filters={filters} onChange={setFilters} />
      <DataTable data={providers} columns={providerColumns} />
    </div>
  );
}
```

---

## 🔄 STATE MANAGEMENT STRATEGY

### Server State (Supabase Data)
- Use React Server Components for initial data
- Use custom hooks for client-side data fetching
- Cache with SWR or React Query

```typescript
// lib/hooks/useProviders.ts
export function useProviders(filters?: ProviderFilters) {
  return useSWR(
    ['/api/providers', filters],
    () => fetchProviders(filters),
    { revalidateOnFocus: false }
  );
}
```

### Client State (UI State)
- Use useState for local component state
- Use useSearchParams for URL state (filters, pagination)
- Use Context for cross-component state (rare)

### Form State
- Use react-hook-form for all forms
- Use Zod for validation

```typescript
const form = useForm<ProviderFormData>({
  resolver: zodResolver(providerSchema)
});
```

---

## 🚀 PERFORMANCE OPTIMIZATIONS

### Code Splitting
```typescript
// Lazy load heavy components
const MappingEngine = dynamic(() => import('@/components/mappings/MappingEngine'), {
  loading: () => <LoadingSkeleton />
});
```

### Virtualization
```typescript
// For large tables (>1000 rows)
import { useVirtualizer } from '@tanstack/react-virtual';
```

### Memoization
```typescript
const expensiveCalculation = useMemo(
  () => calculateARAging(claims),
  [claims]
);
```

---

## ✅ COMPONENT CHECKLIST

### Must Have
- [ ] All 10+ page components
- [ ] HyperlinkCell component with routing
- [ ] MappingEngine component with AI suggestions
- [ ] Enhanced DataTable with hyperlink support
- [ ] Breadcrumb navigation component
- [ ] All form components with validation

### Nice to Have
- [ ] Keyboard shortcuts for mapping
- [ ] Drag-and-drop for bulk mapping
- [ ] Real-time updates (Supabase subscriptions)
- [ ] Offline support (service worker)

---

**Status:** ✅ Design Complete
**Ready for:** Implementation
