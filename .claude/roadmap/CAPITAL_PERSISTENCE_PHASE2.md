# 🚀 Phase 2: Production-Grade Capital Persistence

**Status**: 📋 Planned (Not Started)
**Priority**: P1 - Required before multi-user production deployment
**Estimated Effort**: 1-2 weeks

---

## 📌 Problem Statement

**Current State (Phase 1):**
- Capital history stored in browser localStorage
- Works for single-user demos and MVP testing
- Data lost when switching browsers/devices
- No multi-user support
- No real-time sync across sessions

**Phase 2 Goal:**
- Production-grade database persistence
- Multi-user support with proper authentication
- Real-time synchronization across sessions
- Full audit trail and data integrity
- RESTful API for mobile/external integrations

---

## 🎯 Requirements

### Functional Requirements

1. **Data Persistence**
   - Store capital history in PostgreSQL database
   - Maintain full audit trail (all ADDED, AMOUNT_CHANGED, RATE_CHANGED, REMOVED events)
   - Support point-in-time queries (as of date X, what was capital state?)
   - Preserve immutability (append-only history)

2. **Multi-User Support**
   - Each organization has isolated capital data
   - Role-based access control (view vs edit permissions)
   - Support multiple users viewing/editing simultaneously

3. **API Endpoints**
   - `GET /api/capital-history` - Fetch all history entries
   - `GET /api/capital-history?sourceId={id}` - Fetch history for specific source
   - `GET /api/capital-history?startDate={date}&endDate={date}` - Date range query
   - `POST /api/capital-history/add-source` - Add new capital source
   - `POST /api/capital-history/update-amount` - Update capital amount
   - `POST /api/capital-history/update-rate` - Update interest rate
   - `POST /api/capital-history/remove-source` - Remove capital source
   - `GET /api/capital-sources/active` - Get current active sources (computed view)

4. **Real-Time Sync**
   - WebSocket or polling for live updates
   - When User A adds capital source, User B sees it immediately
   - Optimistic UI updates with rollback on error

### Non-Functional Requirements

1. **Performance**
   - Sub-100ms query response times
   - Handle 10,000+ history entries efficiently
   - Indexed queries on sourceId, effectiveDate, organizationId

2. **Data Integrity**
   - Foreign key constraints
   - Transaction support (ACID compliance)
   - Validation at database level (effectiveDate <= NOW())
   - Prevent duplicate sourceIds per organization

3. **Security**
   - Row-level security (RLS) in PostgreSQL
   - API authentication (JWT tokens)
   - Input validation and SQL injection prevention
   - Audit logging (who changed what, when)

4. **Migration Path**
   - Zero data loss from Phase 1 to Phase 2
   - Export localStorage → Import to database
   - Backward compatibility during transition

---

## 🏗️ Technical Architecture

### Database Schema (Prisma)

```prisma
// prisma/schema.prisma

model Organization {
  id               String              @id @default(uuid())
  name             String
  createdAt        DateTime            @default(now())
  capitalHistory   CapitalHistory[]
  users            User[]
}

model User {
  id               String              @id @default(uuid())
  email            String              @unique
  name             String
  role             UserRole            @default(VIEWER)
  organizationId   String
  organization     Organization        @relation(fields: [organizationId], references: [id])
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt
}

enum UserRole {
  ADMIN      // Full access
  EDITOR     // Can add/edit capital sources
  VIEWER     // Read-only access
}

model CapitalHistory {
  id               String              @id @default(uuid())
  organizationId   String
  organization     Organization        @relation(fields: [organizationId], references: [id])
  sourceId         String              // Links entries for same capital source
  effectiveDate    DateTime            // When this change took effect
  name             String              // Capital source name
  annualRate       Decimal             @db.Decimal(10, 6) // Interest rate as decimal
  availableCents   BigInt              // Amount in cents
  action           CapitalAction       // Type of change
  previousRate     Decimal?            @db.Decimal(10, 6)
  previousAmount   BigInt?
  notes            String?
  createdAt        DateTime            @default(now()) // When record was created
  createdBy        String?             // User who made the change

  @@index([organizationId, sourceId])
  @@index([organizationId, effectiveDate])
  @@index([sourceId, effectiveDate])
}

enum CapitalAction {
  ADDED
  AMOUNT_CHANGED
  RATE_CHANGED
  REMOVED
}
```

### API Routes (Next.js App Router)

```
app/api/capital-history/
├── route.ts                    # GET (fetch history), POST (add source)
├── [sourceId]/
│   └── route.ts                # GET (fetch source history)
├── update-amount/
│   └── route.ts                # POST (update amount)
├── update-rate/
│   └── route.ts                # POST (update rate)
└── remove/
    └── route.ts                # POST (remove source)
```

### Client-Side Store Updates

```typescript
// lib/data/capital-history-store.ts (Phase 2 version)

/**
 * Phase 2: API-backed store with optimistic updates
 */

// Add capital source (with API call)
export async function addCapitalSource(
  source: Omit<CapitalSource, 'priority'>,
  effectiveDate: Date,
  notes?: string
): Promise<string> {
  // Optimistic update to UI
  const sourceId = generateSourceId();
  const historyEntry = { /* ... */ };
  capitalHistoryStore.push(historyEntry);

  try {
    // Send to API
    const response = await fetch('/api/capital-history/add-source', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, effectiveDate, notes }),
    });

    if (!response.ok) {
      // Rollback optimistic update on error
      capitalHistoryStore = capitalHistoryStore.filter(h => h.id !== historyEntry.id);
      throw new Error('Failed to add capital source');
    }

    const { sourceId: serverSourceId } = await response.json();

    // Update with server-assigned ID
    historyEntry.sourceId = serverSourceId;

    return serverSourceId;
  } catch (error) {
    // Rollback on error
    capitalHistoryStore = capitalHistoryStore.filter(h => h.id !== historyEntry.id);
    throw error;
  }
}

// Similar pattern for update/remove functions
```

### Real-Time Sync (Option 1: Polling)

```typescript
// lib/hooks/useCapitalHistory.ts

export function useCapitalHistory() {
  const [history, setHistory] = useState<CapitalSourceHistory[]>([]);

  useEffect(() => {
    // Fetch initial data
    fetchHistory();

    // Poll every 5 seconds for updates
    const interval = setInterval(fetchHistory, 5000);

    return () => clearInterval(interval);
  }, []);

  async function fetchHistory() {
    const response = await fetch('/api/capital-history');
    const data = await response.json();
    setHistory(data);
  }

  return history;
}
```

### Real-Time Sync (Option 2: WebSocket)

```typescript
// lib/realtime/capital-sync.ts

import { io } from 'socket.io-client';

const socket = io('/capital-events');

socket.on('capital-source-added', (entry: CapitalSourceHistory) => {
  capitalHistoryStore.push(entry);
  // Trigger UI refresh
});

socket.on('capital-source-updated', (entry: CapitalSourceHistory) => {
  capitalHistoryStore.push(entry);
  // Trigger UI refresh
});
```

---

## 📋 Implementation Checklist

### Phase 2.1: Database Setup (Week 1, Days 1-2)

- [ ] Install Prisma: `npm install @prisma/client prisma`
- [ ] Set up PostgreSQL database (Vercel Postgres or Supabase)
- [ ] Create Prisma schema with models above
- [ ] Run `npx prisma migrate dev` to create tables
- [ ] Seed database with existing CAPITAL_SOURCES
- [ ] Write integration tests for database operations

### Phase 2.2: API Endpoints (Week 1, Days 3-4)

- [ ] Create `/api/capital-history/route.ts` (GET all history)
- [ ] Create POST endpoint for adding sources
- [ ] Create POST endpoint for updating amounts
- [ ] Create POST endpoint for updating rates
- [ ] Create POST endpoint for removing sources
- [ ] Add authentication middleware (NextAuth.js)
- [ ] Add input validation (Zod schemas)
- [ ] Write API endpoint tests

### Phase 2.3: Client Integration (Week 1, Day 5)

- [ ] Update `capital-history-store.ts` to call API
- [ ] Implement optimistic UI updates
- [ ] Add error handling and rollback logic
- [ ] Update `AddCapitalSourceDialog` to use async API calls
- [ ] Add loading states and error messages
- [ ] Test create/update/delete flows

### Phase 2.4: Real-Time Sync (Week 2, Days 1-2)

- [ ] Choose sync strategy (polling vs WebSocket)
- [ ] Implement sync mechanism
- [ ] Test multi-user scenarios (2+ users editing simultaneously)
- [ ] Add conflict resolution (last-write-wins or CRDT)
- [ ] Performance testing with 1000+ history entries

### Phase 2.5: Migration & Deployment (Week 2, Days 3-4)

- [ ] Create migration script: localStorage → PostgreSQL
- [ ] Add "Export to Database" button in UI (for Phase 1 users)
- [ ] Test migration with real demo data
- [ ] Update environment variables for production
- [ ] Deploy to staging (UAT) environment
- [ ] Run full QA regression testing
- [ ] Deploy to production

### Phase 2.6: Cleanup & Documentation (Week 2, Day 5)

- [ ] Remove localStorage code (or keep as offline fallback?)
- [ ] Update all documentation to reflect Phase 2
- [ ] Write migration guide for users
- [ ] Create admin tools for data management
- [ ] Performance monitoring setup (query times, error rates)
- [ ] Mark this roadmap as ✅ COMPLETE

---

## 🔄 Migration Strategy (Phase 1 → Phase 2)

### Option A: One-Time Export
1. User clicks "Migrate to Production Database" in UI
2. System exports localStorage data to JSON
3. System POSTs JSON to `/api/capital-history/import`
4. Server validates and inserts all records
5. localStorage cleared, app switches to API mode

### Option B: Automatic Background Sync
1. On first login after Phase 2 deployment
2. System detects localStorage data
3. Auto-export to database in background
4. Show success notification
5. Keep localStorage as offline cache

**Recommended: Option A** (explicit, user-controlled)

---

## 🚨 Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | HIGH | Thorough testing, backup localStorage before export |
| Performance degradation with large datasets | MEDIUM | Database indexing, pagination, caching |
| Multi-user conflicts (two users edit simultaneously) | MEDIUM | Optimistic locking, last-write-wins strategy |
| API authentication complexity | LOW | Use NextAuth.js (standard solution) |
| Real-time sync failures | MEDIUM | Graceful degradation to polling, retry logic |

---

## 📊 Success Metrics

- ✅ Zero data loss during Phase 1 → Phase 2 migration
- ✅ API response times < 100ms for 95th percentile
- ✅ Support 10+ concurrent users without conflicts
- ✅ 100% test coverage for API endpoints
- ✅ User can add capital source and see it reflected immediately
- ✅ Full audit trail: every change tracked with user ID + timestamp

---

## 🔗 Related Documentation

- Current Phase 1 Implementation: `lib/data/capital-history-store.ts`
- Capital History Types: `lib/types/capital-history.ts`
- WACC Calculations: `lib/calculations/wacc.ts`
- Test Plan: `.claude/WACC_TEST_PLAN.md`

---

## 💡 Future Enhancements (Phase 3+)

After Phase 2 is complete, consider:

1. **Offline Support**: Service Worker + IndexedDB for offline-first architecture
2. **Mobile App**: React Native app using same API
3. **Bulk Import**: CSV upload for migrating from Excel
4. **Analytics Dashboard**: Track WACC trends over 1+ year periods
5. **Predictive Modeling**: ML model to forecast future WACC based on trends
6. **Automated Alerts**: Notify when WACC exceeds threshold
7. **Multi-Currency**: Support USD, EUR in addition to KES
8. **Capital Budgeting**: Forecast future capital needs based on pipeline

---

## 📝 Notes for Future Implementation

When picking up this task:

1. **Read this document fully** before starting
2. **Set up local PostgreSQL first** (Docker recommended)
3. **Test migration with real localStorage data** before deploying
4. **Deploy to UAT first**, test with stakeholders
5. **Monitor error rates closely** in first 48 hours post-deployment
6. **Have rollback plan ready** (revert to Phase 1 if issues occur)

---

**Remember to mark this as complete when Phase 2 is deployed to production!**

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
