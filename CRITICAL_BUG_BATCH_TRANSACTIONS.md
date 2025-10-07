# CRITICAL BUG: Batch Claims Transaction Rollback Broken

## Priority: P1

## Issue
The `processClaims` function in `lib/utils/claims-processor.ts` creates a transaction client but ALL database operations bypass it and use the global `sql` pool instead.

## Impact
- **Transaction rollback does NOT work**
- Failed batch imports leave **partial data** in the database (orphaned providers, payers, schemes, claims)
- Database can become inconsistent
- Cannot recover from errors - need manual database cleanup

## Root Cause
```typescript
// Line 58-62: Creates transaction client
const client = await db.connect();
await client.query('BEGIN');

// Lines 92, 108, 111, 121, 124, etc: Uses global sql pool
const exists = await claimNumberExists(String(mappedData.claim_number));
let provider = await getProviderByName(providerName);
provider = await createProvider({ name: providerName });
// ... all operations use `sql`, NOT `client`

// Line 202: Commits transaction (but nothing was in the transaction!)
await client.query('COMMIT');
```

## Functions That Need Fixing

All these functions need to accept an optional `client` parameter:

### lib/queries/claims.ts
- [x] `claimNumberExists(claimNumber, client?)`
- [x] `createClaim(data, client?)`

### lib/queries/providers.ts
- [x] `getProviderByName(name, client?)`
- [x] `createProvider(data, client?)`

### lib/queries/payers.ts
- [x] `getPayerByName(name, client?)`
- [x] `createPayer(data, client?)`

### lib/queries/schemes.ts
- [x] `getSchemeByNameAndPayer(name, payerId, client?)`
- [x] `createScheme(data, client?)`

### lib/queries/uploads.ts
- [x] `updateBatchProgress(batchId, processed, failed, client?)`
- [x] `updateBatchStatus(batchId, status, errorLog?, client?)`

## Solution Approach

1. Add optional `client?: VercelPoolClient` parameter to all query functions
2. Use `client.query()` when client is provided, otherwise use `sql`
3. Pass the transaction client through the entire call chain in `processClaims`

## Example Fix

```typescript
// BEFORE
export async function createProvider(data: { name: string }) {
  const { rows } = await sql`
    INSERT INTO providers (name)
    VALUES (${data.name})
    RETURNING *;
  `;
  return rows[0];
}

// AFTER
export async function createProvider(
  data: { name: string },
  client?: VercelPoolClient
) {
  if (client) {
    const result = await client.query(
      'INSERT INTO providers (name) VALUES ($1) RETURNING *',
      [data.name]
    );
    return result.rows[0];
  }

  const { rows } = await sql`
    INSERT INTO providers (name)
    VALUES (${data.name})
    RETURNING *;
  `;
  return rows[0];
}
```

## Testing Required
1. Test batch upload with valid data - should succeed
2. Test batch upload with one invalid row in the middle - should rollback ALL changes
3. Verify no orphaned providers/payers/schemes after failed batch
4. Verify transaction metrics in database logs

## Timeline
- **Fix Required:** ASAP - P1 Bug
- **Estimated Effort:** 2-3 hours (multiple files to update)
- **Risk:** High - affects data integrity

## Workaround (Temporary)
Until fixed, batch uploads should:
1. Validate ALL rows before processing ANY rows
2. Manually clean up orphaned data after failed uploads
3. Run in small batches (50-100 rows) to minimize impact

---

**Status:** 🔴 NOT FIXED YET
**Assignee:** TBD
**Created:** 2025-10-07
