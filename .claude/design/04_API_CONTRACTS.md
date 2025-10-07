# API CONTRACTS - PROVIDER 360° ANALYTICS
## Complete REST API Specification

**Version:** 1.0
**Date:** October 2025
**Status:** Production-Ready Design
**Format:** OpenAPI 3.0 Compatible
**Base URL:** `https://api.finarif.com/v1`

---

## TABLE OF CONTENTS

1. [API Overview](#api-overview)
2. [Common Patterns](#common-patterns)
3. [Providers API](#providers-api)
4. [Payers API](#payers-api)
5. [Schemes API](#schemes-api)
6. [Claims API](#claims-api)
7. [Mappings API](#mappings-api)
8. [Analytics API](#analytics-api)
9. [Error Codes Reference](#error-codes-reference)
10. [Rate Limiting](#rate-limiting)
11. [Webhooks](#webhooks)

---

## API OVERVIEW

### Base URL Structure

```
Production:  https://api.finarif.com/v1
Staging:     https://api-staging.finarif.com/v1
Development: http://localhost:3000/api
```

### Authentication

All API requests require authentication using Bearer tokens (JWT).

**Header:**
```http
Authorization: Bearer <access_token>
```

**Getting a Token:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "finance_manager"
  }
}
```

### Common Headers

**Request Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
X-Request-ID: <uuid>          # Optional: For request tracing
X-API-Version: v1              # Optional: API version override
```

**Response Headers:**
```http
Content-Type: application/json
X-Request-ID: <uuid>
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1634567890
```

### Response Formats

All responses follow a consistent structure:

**Success Response (200-299):**
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    request_id: string;
    version: string;
  };
}
```

**Error Response (400-599):**
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    validation_errors?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
  };
  meta?: {
    timestamp: string;
    request_id: string;
    version: string;
  };
}
```

**Example Success:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Nairobi Hospital"
  },
  "meta": {
    "timestamp": "2025-10-07T10:30:00Z",
    "request_id": "req_abc123",
    "version": "1.0"
  }
}
```

**Example Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "validation_errors": [
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "INVALID_FORMAT"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-10-07T10:30:00Z",
    "request_id": "req_abc123",
    "version": "1.0"
  }
}
```

### Error Handling

**HTTP Status Codes:**
- `200` - OK: Request succeeded
- `201` - Created: Resource created successfully
- `204` - No Content: Request succeeded, no response body
- `400` - Bad Request: Invalid request parameters
- `401` - Unauthorized: Missing or invalid authentication
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `409` - Conflict: Resource already exists or conflict
- `422` - Unprocessable Entity: Validation failed
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error
- `503` - Service Unavailable: Service temporarily unavailable

---

## COMMON PATTERNS

### Pagination

All list endpoints support cursor-based pagination.

**Query Parameters:**
```typescript
interface PaginationParams {
  page?: number;        // Page number (default: 1)
  limit?: number;       // Items per page (default: 10, max: 100)
  cursor?: string;      // Cursor for next page
  sort_by?: string;     // Field to sort by
  sort_order?: 'asc' | 'desc'; // Sort direction
}
```

**Paginated Response:**
```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    next_cursor: string | null;
    prev_cursor: string | null;
  };
}
```

**Example:**
```http
GET /api/providers?page=1&limit=20&sort_by=created_at&sort_order=desc
```

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 127,
    "total_pages": 7,
    "has_next": true,
    "has_prev": false,
    "next_cursor": "eyJpZCI6IjEyMyIsImNyZWF0ZWRfYXQiOiIyMDI1LTAxLTAxIn0",
    "prev_cursor": null
  }
}
```

### Filtering

List endpoints support filtering via query parameters.

**Filter Pattern:**
```http
GET /api/providers?filter[status]=active&filter[risk_score][gte]=50
```

**Common Filter Operators:**
- `[eq]` - Equals
- `[ne]` - Not equals
- `[gt]` - Greater than
- `[gte]` - Greater than or equal
- `[lt]` - Less than
- `[lte]` - Less than or equal
- `[in]` - In array
- `[contains]` - Contains substring
- `[starts_with]` - Starts with
- `[ends_with]` - Ends with

### Date Ranges

```http
GET /api/claims?date_from=2025-01-01&date_to=2025-12-31
```

### Field Selection

Request only specific fields:
```http
GET /api/providers?fields=id,name,risk_score
```

### Include Related Resources

```http
GET /api/providers/[id]?include=claims,payers,schemes
```

---

## PROVIDERS API

Base path: `/api/providers`

### Data Types

```typescript
interface Provider {
  // Identity
  id: string;                    // UUID
  code: string;                  // Unique provider code
  name: string;
  name_search?: string;          // Auto-generated for search

  // Contact
  address?: string;
  city?: string;
  country?: string;              // Default: "Kenya"
  phone?: string;
  email?: string;
  contact_person?: string;

  // Legal & Licensing
  license_number?: string;
  license_expiry_date?: string;  // ISO 8601 date
  tax_id?: string;

  // Classification
  provider_type: 'hospital' | 'clinic' | 'pharmacy' | 'lab' | 'imaging' | 'dental';
  tier?: 'tier1' | 'tier2' | 'tier3' | 'tier4';

  // Financial
  bank_name?: string;
  bank_account_number_encrypted?: string;
  bank_branch?: string;
  swift_code?: string;

  // Risk & Performance
  risk_score?: number;                   // 0-100
  default_history_score?: number;        // 0-100
  claim_quality_score?: number;          // 0-100
  concentration_score?: number;          // 0-100

  // Credit
  credit_limit_cents: number;
  outstanding_balance_cents: number;
  available_credit_cents: number;        // Calculated

  // Status
  is_active: boolean;
  onboarding_status: 'pending' | 'documents_submitted' | 'under_review' |
                     'approved' | 'rejected' | 'active' | 'suspended';
  onboarded_at?: string;                 // ISO 8601 timestamp
  suspended_at?: string;
  suspension_reason?: string;

  // Metadata
  metadata?: Record<string, any>;
  created_at: string;                    // ISO 8601 timestamp
  updated_at: string;
  created_by?: string;                   // User UUID
}

interface ProviderCreateRequest {
  code: string;
  name: string;
  provider_type: Provider['provider_type'];
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  license_number?: string;
  credit_limit_cents?: number;
  metadata?: Record<string, any>;
}

interface ProviderUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  license_number?: string;
  license_expiry_date?: string;
  provider_type?: Provider['provider_type'];
  tier?: Provider['tier'];
  credit_limit_cents?: number;
  is_active?: boolean;
  onboarding_status?: Provider['onboarding_status'];
  suspension_reason?: string;
  metadata?: Record<string, any>;
}
```

---

### GET /api/providers
**List all providers with filters and pagination**

**Authorization:** Required
**Rate Limit:** 100 requests/minute

**Query Parameters:**
```typescript
interface ProvidersListQuery {
  // Pagination
  page?: number;              // Default: 1
  limit?: number;             // Default: 10, Max: 100

  // Sorting
  sort_by?: 'name' | 'risk_score' | 'outstanding_balance_cents' |
            'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';

  // Filters
  filter?: {
    name?: string;            // Fuzzy search
    code?: string;
    provider_type?: Provider['provider_type'] | Provider['provider_type'][];
    tier?: Provider['tier'] | Provider['tier'][];
    is_active?: boolean;
    onboarding_status?: Provider['onboarding_status'];
    risk_score?: {
      gte?: number;           // Greater than or equal
      lte?: number;           // Less than or equal
    };
    outstanding_balance_cents?: {
      gte?: number;
      lte?: number;
    };
    city?: string;
    country?: string;
  };

  // Date range
  created_after?: string;     // ISO 8601
  created_before?: string;

  // Field selection
  fields?: string;            // Comma-separated

  // Include related
  include?: string;           // Comma-separated: claims,analytics
}
```

**Example Request:**
```http
GET /api/providers?page=1&limit=20&sort_by=risk_score&sort_order=desc&filter[is_active]=true&filter[risk_score][gte]=50
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "PRV001",
      "name": "Nairobi Hospital",
      "provider_type": "hospital",
      "tier": "tier1",
      "email": "billing@nairobihospital.org",
      "phone": "+254-20-2845000",
      "city": "Nairobi",
      "country": "Kenya",
      "risk_score": 68,
      "credit_limit_cents": 500000000,
      "outstanding_balance_cents": 245000000,
      "available_credit_cents": 255000000,
      "is_active": true,
      "onboarding_status": "active",
      "created_at": "2023-01-15T08:30:00Z",
      "updated_at": "2025-10-07T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 127,
    "total_pages": 7,
    "has_next": true,
    "has_prev": false,
    "next_cursor": "eyJpZCI6IjEyMyJ9",
    "prev_cursor": null
  },
  "meta": {
    "timestamp": "2025-10-07T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Error Responses:**
- `400` - Invalid query parameters
- `401` - Unauthorized
- `429` - Rate limit exceeded

---

### POST /api/providers
**Create a new provider**

**Authorization:** Required (role: admin, finance_manager)
**Rate Limit:** 50 requests/minute

**Request Body:**
```json
{
  "code": "PRV127",
  "name": "Mombasa Medical Center",
  "provider_type": "hospital",
  "tier": "tier2",
  "email": "billing@mombasamedical.com",
  "phone": "+254-41-2312345",
  "address": "Nyerere Avenue, Mombasa",
  "city": "Mombasa",
  "country": "Kenya",
  "license_number": "HF-001234",
  "license_expiry_date": "2026-12-31",
  "credit_limit_cents": 300000000,
  "metadata": {
    "specializations": ["general", "maternity", "pediatrics"],
    "bed_capacity": 150
  }
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "code": "PRV127",
    "name": "Mombasa Medical Center",
    "provider_type": "hospital",
    "tier": "tier2",
    "email": "billing@mombasamedical.com",
    "phone": "+254-41-2312345",
    "address": "Nyerere Avenue, Mombasa",
    "city": "Mombasa",
    "country": "Kenya",
    "license_number": "HF-001234",
    "license_expiry_date": "2026-12-31",
    "risk_score": 0,
    "credit_limit_cents": 300000000,
    "outstanding_balance_cents": 0,
    "available_credit_cents": 300000000,
    "is_active": true,
    "onboarding_status": "pending",
    "metadata": {
      "specializations": ["general", "maternity", "pediatrics"],
      "bed_capacity": 150
    },
    "created_at": "2025-10-07T10:30:00Z",
    "updated_at": "2025-10-07T10:30:00Z",
    "created_by": "user_uuid_here"
  },
  "meta": {
    "timestamp": "2025-10-07T10:30:00Z",
    "request_id": "req_create_123"
  }
}
```

**Error Responses:**
- `400` - Invalid request body
- `401` - Unauthorized
- `403` - Insufficient permissions
- `409` - Provider with code already exists
- `422` - Validation error

**Validation Rules:**
- `code`: Required, unique, 2-50 characters, alphanumeric with hyphens
- `name`: Required, 2-200 characters
- `provider_type`: Required, must be valid enum value
- `email`: Optional, valid email format
- `phone`: Optional, valid phone format
- `credit_limit_cents`: Optional, must be >= 0

---

### GET /api/providers/[id]
**Get single provider details**

**Authorization:** Required
**Rate Limit:** 200 requests/minute

**Path Parameters:**
- `id` (string, required): Provider UUID

**Query Parameters:**
```typescript
interface ProviderDetailQuery {
  include?: string;  // Comma-separated: claims,analytics,payers,schemes
  fields?: string;   // Comma-separated field names
}
```

**Example Request:**
```http
GET /api/providers/550e8400-e29b-41d4-a716-446655440000?include=analytics
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "PRV001",
    "name": "Nairobi Hospital",
    "provider_type": "hospital",
    "tier": "tier1",
    "email": "billing@nairobihospital.org",
    "phone": "+254-20-2845000",
    "address": "Argwings Kodhek Road, Nairobi",
    "city": "Nairobi",
    "country": "Kenya",
    "license_number": "HF-000123",
    "license_expiry_date": "2026-06-30",
    "risk_score": 68,
    "default_history_score": 72,
    "claim_quality_score": 85,
    "concentration_score": 55,
    "credit_limit_cents": 500000000,
    "outstanding_balance_cents": 245000000,
    "available_credit_cents": 255000000,
    "is_active": true,
    "onboarding_status": "active",
    "onboarded_at": "2023-01-15T08:30:00Z",
    "metadata": {
      "specializations": ["cardiology", "neurology", "oncology"],
      "bed_capacity": 450,
      "accreditation": "ISO 9001:2015"
    },
    "created_at": "2023-01-15T08:30:00Z",
    "updated_at": "2025-10-07T10:30:00Z",
    "created_by": "admin_user_uuid"
  },
  "meta": {
    "timestamp": "2025-10-07T10:30:00Z",
    "request_id": "req_get_detail_123"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Provider not found

---

### PATCH /api/providers/[id]
**Update provider (partial update)**

**Authorization:** Required (role: admin, finance_manager)
**Rate Limit:** 50 requests/minute

**Path Parameters:**
- `id` (string, required): Provider UUID

**Request Body:**
```json
{
  "email": "newemail@nairobihospital.org",
  "credit_limit_cents": 600000000,
  "onboarding_status": "active",
  "metadata": {
    "accreditation": "ISO 9001:2015",
    "last_audit_date": "2025-09-15"
  }
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "PRV001",
    "name": "Nairobi Hospital",
    "email": "newemail@nairobihospital.org",
    "credit_limit_cents": 600000000,
    "onboarding_status": "active",
    "updated_at": "2025-10-07T11:00:00Z"
  },
  "meta": {
    "timestamp": "2025-10-07T11:00:00Z",
    "request_id": "req_update_123"
  }
}
```

**Error Responses:**
- `400` - Invalid request body
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Provider not found
- `422` - Validation error

---

### DELETE /api/providers/[id]
**Soft delete provider**

**Authorization:** Required (role: admin)
**Rate Limit:** 20 requests/minute

**Path Parameters:**
- `id` (string, required): Provider UUID

**Query Parameters:**
```typescript
interface DeleteQuery {
  force?: boolean;  // Hard delete (default: false)
  reason?: string;  // Deletion reason
}
```

**Example Request:**
```http
DELETE /api/providers/550e8400-e29b-41d4-a716-446655440000?reason=duplicate_entry
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 204 No Content**

**Error Responses:**
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Provider not found
- `409` - Cannot delete provider with active claims

---

### GET /api/providers/[id]/claims
**Get all claims for a provider**

**Authorization:** Required
**Rate Limit:** 100 requests/minute

**Path Parameters:**
- `id` (string, required): Provider UUID

**Query Parameters:**
```typescript
interface ProviderClaimsQuery {
  page?: number;
  limit?: number;
  status?: 'uploaded' | 'mapped' | 'validated' | 'financed' |
           'submitted_insurer' | 'collected' | 'partial_collected' |
           'defaulted' | 'disputed' | 'rejected';
  date_from?: string;      // ISO 8601
  date_to?: string;
  sort_by?: 'invoice_date' | 'invoice_amount_cents' | 'created_at';
  sort_order?: 'asc' | 'desc';
}
```

**Example Request:**
```http
GET /api/providers/550e8400-e29b-41d4-a716-446655440000/claims?status=collected&date_from=2025-01-01&date_to=2025-12-31
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "claim_uuid_1",
      "invoice_number": "INV-2025-001",
      "invoice_date": "2025-09-15",
      "invoice_amount_cents": 15000000,
      "approved_amount_cents": 14500000,
      "claimed_amount_cents": 14500000,
      "status": "collected",
      "payer_id": "payer_uuid",
      "payer_name": "NHIF",
      "scheme_id": "scheme_uuid",
      "scheme_name": "NHIF Standard",
      "disbursement_date": "2025-09-16",
      "expected_collection_date": "2025-10-16",
      "actual_collection_date": "2025-10-14",
      "days_to_collection": 28,
      "created_at": "2025-09-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 342,
    "total_pages": 18,
    "has_next": true,
    "has_prev": false
  },
  "summary": {
    "total_claims": 342,
    "total_amount_cents": 45200000000,
    "collected_amount_cents": 38900000000,
    "outstanding_amount_cents": 6300000000
  }
}
```

---

### GET /api/providers/[id]/analytics
**Get provider performance analytics**

**Authorization:** Required
**Rate Limit:** 50 requests/minute

**Path Parameters:**
- `id` (string, required): Provider UUID

**Query Parameters:**
```typescript
interface ProviderAnalyticsQuery {
  period?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  date_from?: string;
  date_to?: string;
  include_trends?: boolean;  // Include historical trends
}
```

**Example Request:**
```http
GET /api/providers/550e8400-e29b-41d4-a716-446655440000/analytics?period=month&include_trends=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "provider_id": "550e8400-e29b-41d4-a716-446655440000",
    "provider_name": "Nairobi Hospital",
    "period": "month",
    "date_range": {
      "from": "2025-09-01",
      "to": "2025-09-30"
    },
    "financial_metrics": {
      "total_outstanding_cents": 245000000,
      "total_outstanding_change_percent": 8.5,
      "total_collected_cents": 1820000000,
      "total_collected_change_percent": 15.2,
      "average_claim_amount_cents": 5320000,
      "total_claims_count": 342,
      "collected_claims_count": 285,
      "pending_claims_count": 45,
      "rejected_claims_count": 12,
      "collection_rate_percent": 83.3
    },
    "aging_metrics": {
      "average_ar_age_days": 42,
      "average_ar_age_change_days": 5,
      "ar_0_30_days_cents": 120000000,
      "ar_31_60_days_cents": 85000000,
      "ar_61_90_days_cents": 30000000,
      "ar_over_90_days_cents": 10000000,
      "ar_buckets": [
        {
          "bucket": "0-30 days",
          "amount_cents": 120000000,
          "percentage": 49.0,
          "count": 22
        },
        {
          "bucket": "31-60 days",
          "amount_cents": 85000000,
          "percentage": 34.7,
          "count": 15
        },
        {
          "bucket": "61-90 days",
          "amount_cents": 30000000,
          "percentage": 12.2,
          "count": 6
        },
        {
          "bucket": ">90 days",
          "amount_cents": 10000000,
          "percentage": 4.1,
          "count": 2
        }
      ]
    },
    "risk_metrics": {
      "risk_score": 68,
      "risk_level": "medium",
      "risk_change_percent": 3.2,
      "default_history_score": 72,
      "claim_quality_score": 85,
      "concentration_score": 55,
      "high_value_claims_count": 15,
      "overdue_claims_count": 8
    },
    "payer_distribution": [
      {
        "payer_id": "payer_uuid_1",
        "payer_name": "NHIF",
        "claims_count": 145,
        "amount_cents": 102000000,
        "percentage": 41.6
      },
      {
        "payer_id": "payer_uuid_2",
        "payer_name": "AAR Insurance",
        "claims_count": 98,
        "amount_cents": 78000000,
        "percentage": 31.8
      }
    ],
    "trends": {
      "last_6_months": [
        {
          "month": "2025-04",
          "claims_count": 52,
          "amount_cents": 280000000,
          "collected_cents": 245000000
        },
        {
          "month": "2025-05",
          "claims_count": 58,
          "amount_cents": 310000000,
          "collected_cents": 268000000
        },
        {
          "month": "2025-06",
          "claims_count": 64,
          "amount_cents": 342000000,
          "collected_cents": 295000000
        }
      ]
    }
  },
  "meta": {
    "timestamp": "2025-10-07T10:30:00Z",
    "request_id": "req_analytics_123"
  }
}
```

---

## PAYERS API

Base path: `/api/payers`

### Data Types

```typescript
interface Payer {
  // Identity
  id: string;                    // UUID
  code: string;                  // Unique payer code
  name: string;
  short_name?: string;

  // Contact
  address?: string;
  city?: string;
  country?: string;              // Default: "Kenya"
  phone?: string;
  email?: string;
  contact_person?: string;

  // Classification
  payer_type: 'government' | 'private' | 'corporate' | 'international';

  // Payment Characteristics
  average_payment_days: number;  // Default: 45
  payment_delay_score?: number;  // 0-100
  default_rate_score?: number;   // 0-100

  // Risk
  risk_score?: number;           // 0-100
  credit_rating?: string;

  // Performance
  total_claims_processed: number;
  total_amount_paid_cents: number;
  default_count: number;
  dispute_count: number;

  // Status
  is_active: boolean;

  // Metadata
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface PayerCreateRequest {
  code: string;
  name: string;
  short_name?: string;
  payer_type: Payer['payer_type'];
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  average_payment_days?: number;
  metadata?: Record<string, any>;
}

interface PayerUpdateRequest {
  name?: string;
  short_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  payer_type?: Payer['payer_type'];
  average_payment_days?: number;
  credit_rating?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
}
```

---

### GET /api/payers
**List all payers with filters and pagination**

**Authorization:** Required
**Rate Limit:** 100 requests/minute

**Query Parameters:**
```typescript
interface PayersListQuery {
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'risk_score' | 'average_payment_days' | 'created_at';
  sort_order?: 'asc' | 'desc';
  filter?: {
    name?: string;
    code?: string;
    payer_type?: Payer['payer_type'] | Payer['payer_type'][];
    is_active?: boolean;
    risk_score?: {
      gte?: number;
      lte?: number;
    };
  };
  fields?: string;
  include?: string;  // schemes,claims
}
```

**Example Request:**
```http
GET /api/payers?page=1&limit=20&filter[is_active]=true&sort_by=name
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "payer_uuid_1",
      "code": "PAY001",
      "name": "National Hospital Insurance Fund",
      "short_name": "NHIF",
      "payer_type": "government",
      "email": "claims@nhif.or.ke",
      "phone": "+254-20-2717000",
      "city": "Nairobi",
      "country": "Kenya",
      "average_payment_days": 45,
      "payment_delay_score": 65,
      "default_rate_score": 25,
      "risk_score": 45,
      "total_claims_processed": 15420,
      "total_amount_paid_cents": 125000000000,
      "is_active": true,
      "created_at": "2023-01-10T00:00:00Z",
      "updated_at": "2025-10-07T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 45,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### POST /api/payers
**Create a new payer**

**Authorization:** Required (role: admin, finance_manager)
**Rate Limit:** 50 requests/minute

**Request Body:**
```json
{
  "code": "PAY045",
  "name": "Resolution Health East Africa",
  "short_name": "Resolution Health",
  "payer_type": "private",
  "email": "claims@resolutionhealth.co.ke",
  "phone": "+254-709-932000",
  "address": "Lenana Road, Nairobi",
  "city": "Nairobi",
  "country": "Kenya",
  "average_payment_days": 30,
  "metadata": {
    "parent_company": "Resolution Insurance",
    "established_year": 2010
  }
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "new_payer_uuid",
    "code": "PAY045",
    "name": "Resolution Health East Africa",
    "short_name": "Resolution Health",
    "payer_type": "private",
    "email": "claims@resolutionhealth.co.ke",
    "phone": "+254-709-932000",
    "address": "Lenana Road, Nairobi",
    "city": "Nairobi",
    "country": "Kenya",
    "average_payment_days": 30,
    "risk_score": null,
    "total_claims_processed": 0,
    "total_amount_paid_cents": 0,
    "default_count": 0,
    "dispute_count": 0,
    "is_active": true,
    "metadata": {
      "parent_company": "Resolution Insurance",
      "established_year": 2010
    },
    "created_at": "2025-10-07T11:00:00Z",
    "updated_at": "2025-10-07T11:00:00Z"
  }
}
```

---

### GET /api/payers/[id]
**Get single payer details**

**Authorization:** Required
**Rate Limit:** 200 requests/minute

**Example Request:**
```http
GET /api/payers/payer_uuid_1?include=schemes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "payer_uuid_1",
    "code": "PAY001",
    "name": "National Hospital Insurance Fund",
    "short_name": "NHIF",
    "payer_type": "government",
    "email": "claims@nhif.or.ke",
    "phone": "+254-20-2717000",
    "address": "Ragati Road, Upper Hill",
    "city": "Nairobi",
    "country": "Kenya",
    "average_payment_days": 45,
    "payment_delay_score": 65,
    "default_rate_score": 25,
    "risk_score": 45,
    "credit_rating": "BBB+",
    "total_claims_processed": 15420,
    "total_amount_paid_cents": 125000000000,
    "default_count": 12,
    "dispute_count": 45,
    "is_active": true,
    "metadata": {
      "regulator": "Ministry of Health",
      "license_number": "NHIF-001"
    },
    "created_at": "2023-01-10T00:00:00Z",
    "updated_at": "2025-10-07T10:00:00Z"
  }
}
```

---

### PATCH /api/payers/[id]
**Update payer**

**Authorization:** Required (role: admin, finance_manager)
**Rate Limit:** 50 requests/minute

**Request Body:**
```json
{
  "email": "newemail@nhif.or.ke",
  "average_payment_days": 40,
  "credit_rating": "A-"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "payer_uuid_1",
    "email": "newemail@nhif.or.ke",
    "average_payment_days": 40,
    "credit_rating": "A-",
    "updated_at": "2025-10-07T11:30:00Z"
  }
}
```

---

### DELETE /api/payers/[id]
**Soft delete payer**

**Authorization:** Required (role: admin)
**Rate Limit:** 20 requests/minute

**Response: 204 No Content**

---

### GET /api/payers/[id]/schemes
**Get all schemes for a payer**

**Authorization:** Required
**Rate Limit:** 100 requests/minute

**Example Request:**
```http
GET /api/payers/payer_uuid_1/schemes?filter[is_active]=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "scheme_uuid_1",
      "code": "SCH001",
      "name": "NHIF Standard Cover",
      "payer_id": "payer_uuid_1",
      "scheme_type": "nhif",
      "coverage_tier": "standard",
      "coverage_percentage": 80.0,
      "covers_inpatient": true,
      "covers_outpatient": true,
      "is_active": true,
      "created_at": "2023-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 8,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

---

### GET /api/payers/[id]/claims
**Get all claims for a payer**

**Authorization:** Required
**Rate Limit:** 100 requests/minute

**Query Parameters:**
```typescript
interface PayerClaimsQuery {
  page?: number;
  limit?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  provider_id?: string;  // Filter by provider
}
```

**Example Request:**
```http
GET /api/payers/payer_uuid_1/claims?status=collected&date_from=2025-01-01
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "claim_uuid_1",
      "invoice_number": "INV-2025-001",
      "provider_id": "provider_uuid_1",
      "provider_name": "Nairobi Hospital",
      "scheme_id": "scheme_uuid_1",
      "scheme_name": "NHIF Standard Cover",
      "invoice_amount_cents": 15000000,
      "status": "collected",
      "invoice_date": "2025-09-15",
      "created_at": "2025-09-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 2845,
    "total_pages": 143,
    "has_next": true,
    "has_prev": false
  },
  "summary": {
    "total_claims": 2845,
    "total_amount_cents": 85000000000
  }
}
```

---

## SCHEMES API

Base path: `/api/schemes`

### Data Types

```typescript
interface Scheme {
  // Identity
  id: string;                    // UUID
  code: string;                  // Unique scheme code
  name: string;

  // Payer Relationship
  payer_id: string;              // UUID (required)
  payer_name?: string;           // Populated in responses

  // Classification
  scheme_type: 'individual' | 'corporate' | 'group' | 'nhif' |
               'civil_servants' | 'student' | 'family';
  coverage_tier?: 'basic' | 'standard' | 'premium' | 'vip';

  // Coverage Details
  coverage_percentage?: number;  // 0-100
  annual_limit_cents?: number;
  per_claim_limit_cents?: number;

  // Benefits
  covers_inpatient: boolean;
  covers_outpatient: boolean;
  covers_dental: boolean;
  covers_optical: boolean;
  covers_maternity: boolean;

  // Status
  is_active: boolean;

  // Metadata
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface SchemeCreateRequest {
  code: string;
  name: string;
  payer_id: string;
  scheme_type: Scheme['scheme_type'];
  coverage_tier?: Scheme['coverage_tier'];
  coverage_percentage?: number;
  annual_limit_cents?: number;
  per_claim_limit_cents?: number;
  covers_inpatient?: boolean;
  covers_outpatient?: boolean;
  covers_dental?: boolean;
  covers_optical?: boolean;
  covers_maternity?: boolean;
  metadata?: Record<string, any>;
}

interface SchemeUpdateRequest {
  name?: string;
  scheme_type?: Scheme['scheme_type'];
  coverage_tier?: Scheme['coverage_tier'];
  coverage_percentage?: number;
  annual_limit_cents?: number;
  per_claim_limit_cents?: number;
  covers_inpatient?: boolean;
  covers_outpatient?: boolean;
  covers_dental?: boolean;
  covers_optical?: boolean;
  covers_maternity?: boolean;
  is_active?: boolean;
  metadata?: Record<string, any>;
}
```

---

### GET /api/schemes
**List all schemes with filters and pagination**

**Authorization:** Required
**Rate Limit:** 100 requests/minute

**Query Parameters:**
```typescript
interface SchemesListQuery {
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'coverage_percentage' | 'created_at';
  sort_order?: 'asc' | 'desc';
  filter?: {
    name?: string;
    code?: string;
    payer_id?: string;
    scheme_type?: Scheme['scheme_type'] | Scheme['scheme_type'][];
    coverage_tier?: Scheme['coverage_tier'] | Scheme['coverage_tier'][];
    is_active?: boolean;
  };
  fields?: string;
  include?: string;  // payer,claims
}
```

**Example Request:**
```http
GET /api/schemes?filter[payer_id]=payer_uuid_1&filter[is_active]=true&include=payer
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "scheme_uuid_1",
      "code": "SCH001",
      "name": "NHIF Standard Cover",
      "payer_id": "payer_uuid_1",
      "payer_name": "National Hospital Insurance Fund",
      "scheme_type": "nhif",
      "coverage_tier": "standard",
      "coverage_percentage": 80.0,
      "annual_limit_cents": null,
      "per_claim_limit_cents": null,
      "covers_inpatient": true,
      "covers_outpatient": true,
      "covers_dental": false,
      "covers_optical": false,
      "covers_maternity": true,
      "is_active": true,
      "created_at": "2023-01-15T00:00:00Z",
      "updated_at": "2025-10-07T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 152,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### POST /api/schemes
**Create a new scheme**

**Authorization:** Required (role: admin, finance_manager)
**Rate Limit:** 50 requests/minute

**Request Body:**
```json
{
  "code": "SCH152",
  "name": "AAR Corporate Premium Plus",
  "payer_id": "payer_uuid_2",
  "scheme_type": "corporate",
  "coverage_tier": "premium",
  "coverage_percentage": 90.0,
  "annual_limit_cents": 1000000000,
  "per_claim_limit_cents": 50000000,
  "covers_inpatient": true,
  "covers_outpatient": true,
  "covers_dental": true,
  "covers_optical": true,
  "covers_maternity": true,
  "metadata": {
    "copay_percentage": 10,
    "waiting_period_days": 30
  }
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "new_scheme_uuid",
    "code": "SCH152",
    "name": "AAR Corporate Premium Plus",
    "payer_id": "payer_uuid_2",
    "scheme_type": "corporate",
    "coverage_tier": "premium",
    "coverage_percentage": 90.0,
    "annual_limit_cents": 1000000000,
    "per_claim_limit_cents": 50000000,
    "covers_inpatient": true,
    "covers_outpatient": true,
    "covers_dental": true,
    "covers_optical": true,
    "covers_maternity": true,
    "is_active": true,
    "metadata": {
      "copay_percentage": 10,
      "waiting_period_days": 30
    },
    "created_at": "2025-10-07T11:30:00Z",
    "updated_at": "2025-10-07T11:30:00Z"
  }
}
```

---

### GET /api/schemes/[id]
**Get single scheme details**

**Authorization:** Required
**Rate Limit:** 200 requests/minute

**Example Request:**
```http
GET /api/schemes/scheme_uuid_1?include=payer
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "scheme_uuid_1",
    "code": "SCH001",
    "name": "NHIF Standard Cover",
    "payer_id": "payer_uuid_1",
    "payer_name": "National Hospital Insurance Fund",
    "scheme_type": "nhif",
    "coverage_tier": "standard",
    "coverage_percentage": 80.0,
    "annual_limit_cents": null,
    "per_claim_limit_cents": null,
    "covers_inpatient": true,
    "covers_outpatient": true,
    "covers_dental": false,
    "covers_optical": false,
    "covers_maternity": true,
    "is_active": true,
    "metadata": {
      "benefit_schedule": "https://nhif.or.ke/benefits.pdf",
      "enrollment_type": "mandatory"
    },
    "created_at": "2023-01-15T00:00:00Z",
    "updated_at": "2025-10-07T10:00:00Z"
  }
}
```

---

### PATCH /api/schemes/[id]
**Update scheme**

**Authorization:** Required (role: admin, finance_manager)
**Rate Limit:** 50 requests/minute

**Request Body:**
```json
{
  "coverage_percentage": 85.0,
  "per_claim_limit_cents": 60000000
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "scheme_uuid_1",
    "coverage_percentage": 85.0,
    "per_claim_limit_cents": 60000000,
    "updated_at": "2025-10-07T12:00:00Z"
  }
}
```

---

### DELETE /api/schemes/[id]
**Soft delete scheme**

**Authorization:** Required (role: admin)
**Rate Limit:** 20 requests/minute

**Response: 204 No Content**

---

### GET /api/schemes/[id]/claims
**Get all claims for a scheme**

**Authorization:** Required
**Rate Limit:** 100 requests/minute

**Example Request:**
```http
GET /api/schemes/scheme_uuid_1/claims?status=collected&page=1&limit=50
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "claim_uuid_1",
      "invoice_number": "INV-2025-001",
      "provider_id": "provider_uuid_1",
      "provider_name": "Nairobi Hospital",
      "invoice_amount_cents": 15000000,
      "status": "collected",
      "invoice_date": "2025-09-15",
      "created_at": "2025-09-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total_items": 1542,
    "total_pages": 31,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## CLAIMS API

Base path: `/api/claims`

### Data Types

```typescript
interface Claim {
  // Identity
  id: string;                           // UUID

  // Vitraya Original Columns
  invoice_number: string;               // Unique
  invoice_date: string;                 // ISO 8601 date
  insurance_company?: string;           // Text from Excel
  patient_name_encrypted?: string;
  patient_dob?: string;
  card_number_encrypted?: string;
  approval_code?: string;
  approval_date?: string;
  invoice_amount_cents: number;
  approved_amount_cents?: number;
  claimed_amount_cents?: number;
  shortfall_amount_cents?: number;
  rejection_reason?: string;

  // Provider 360° Columns
  provider_id?: string;                 // UUID (nullable)
  provider_name?: string;               // Populated in responses
  payer_id?: string;                    // UUID (nullable)
  payer_name?: string;
  scheme_id?: string;                   // UUID (nullable)
  scheme_name?: string;
  batch_id: string;                     // UUID

  // Status
  status: 'uploaded' | 'mapped' | 'validated' | 'financed' |
          'submitted_insurer' | 'collected' | 'partial_collected' |
          'defaulted' | 'disputed' | 'rejected';

  // Risk & Analytics
  risk_score?: number;                  // 0-100

  // Financial Tracking
  disbursed_to_provider_cents?: number;
  collected_from_insurer_cents?: number;
  fee_earned_cents?: number;

  // Dates
  disbursement_date?: string;
  expected_collection_date?: string;
  actual_collection_date?: string;

  // Flags (calculated)
  is_high_value: boolean;               // > KES 500,000
  is_overdue: boolean;

  // Metadata
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface ClaimUploadResponse {
  batch_id: string;
  filename: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  validation_errors: Array<{
    row: number;
    field: string;
    error: string;
  }>;
  status: 'processing' | 'completed' | 'failed';
}
```

---

### GET /api/claims
**List all claims with filters and pagination**

**Authorization:** Required
**Rate Limit:** 100 requests/minute

**Query Parameters:**
```typescript
interface ClaimsListQuery {
  page?: number;
  limit?: number;
  sort_by?: 'invoice_date' | 'invoice_amount_cents' | 'created_at' | 'status';
  sort_order?: 'asc' | 'desc';
  filter?: {
    invoice_number?: string;
    provider_id?: string;
    payer_id?: string;
    scheme_id?: string;
    batch_id?: string;
    status?: Claim['status'] | Claim['status'][];
    is_high_value?: boolean;
    is_overdue?: boolean;
    is_unmapped?: boolean;           // Claims without provider_id
    invoice_amount_cents?: {
      gte?: number;
      lte?: number;
    };
  };
  date_from?: string;                // invoice_date filter
  date_to?: string;
  fields?: string;
  include?: string;                  // provider,payer,scheme,batch
}
```

**Example Request:**
```http
GET /api/claims?page=1&limit=50&filter[status]=uploaded&filter[is_unmapped]=true&sort_by=invoice_date&sort_order=desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "claim_uuid_1",
      "invoice_number": "INV-2025-12345",
      "invoice_date": "2025-09-30",
      "insurance_company": "NHIF",
      "invoice_amount_cents": 15000000,
      "approved_amount_cents": 14500000,
      "claimed_amount_cents": 14500000,
      "shortfall_amount_cents": 500000,
      "provider_id": null,
      "payer_id": null,
      "scheme_id": null,
      "batch_id": "batch_uuid_1",
      "status": "uploaded",
      "is_high_value": false,
      "is_overdue": false,
      "created_at": "2025-10-01T08:00:00Z",
      "updated_at": "2025-10-01T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total_items": 4523,
    "total_pages": 91,
    "has_next": true,
    "has_prev": false
  },
  "summary": {
    "total_claims": 4523,
    "total_amount_cents": 125000000000,
    "unmapped_count": 342,
    "high_value_count": 145,
    "overdue_count": 67
  }
}
```

---

### POST /api/claims/upload
**Upload Excel file with claims data**

**Authorization:** Required (role: finance_manager, admin)
**Rate Limit:** 10 uploads/hour

**Request:**
```http
POST /api/claims/upload
Content-Type: multipart/form-data
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

--boundary
Content-Disposition: form-data; name="file"; filename="claims_october_2025.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

[Binary Excel file data]
--boundary
Content-Disposition: form-data; name="batch_name"

October 2025 Claims Upload
--boundary
Content-Disposition: form-data; name="auto_map"

true
--boundary--
```

**Request Parameters:**
- `file` (file, required): Excel file (.xlsx, .xls)
- `batch_name` (string, optional): Descriptive name for batch
- `auto_map` (boolean, optional): Attempt automatic provider mapping (default: false)

**Response: 202 Accepted**
```json
{
  "success": true,
  "data": {
    "batch_id": "batch_uuid_new",
    "filename": "claims_october_2025.xlsx",
    "batch_name": "October 2025 Claims Upload",
    "file_size_bytes": 2458624,
    "status": "processing",
    "uploaded_by": "user_uuid",
    "uploaded_at": "2025-10-07T12:00:00Z",
    "estimated_completion": "2025-10-07T12:05:00Z",
    "progress_url": "/api/claims/upload/batch_uuid_new/status"
  },
  "meta": {
    "timestamp": "2025-10-07T12:00:00Z",
    "request_id": "req_upload_123"
  }
}
```

**Error Responses:**
- `400` - Invalid file format or missing file
- `413` - File too large (max 50MB)
- `422` - File validation errors

---

### POST /api/claims/validate
**Pre-validate Excel file before import**

**Authorization:** Required
**Rate Limit:** 20 requests/hour

**Request:**
```http
POST /api/claims/validate
Content-Type: multipart/form-data
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

--boundary
Content-Disposition: form-data; name="file"; filename="claims_test.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

[Binary Excel file data]
--boundary--
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "is_valid": false,
    "total_rows": 1250,
    "valid_rows": 1180,
    "invalid_rows": 70,
    "warnings": [
      {
        "severity": "warning",
        "message": "15 claims have missing approval codes",
        "affected_rows": [5, 12, 23, 45, 67]
      }
    ],
    "validation_errors": [
      {
        "row": 3,
        "field": "invoice_number",
        "value": "",
        "error": "Invoice number is required",
        "code": "REQUIRED_FIELD"
      },
      {
        "row": 8,
        "field": "invoice_amount",
        "value": "-500",
        "error": "Invoice amount must be positive",
        "code": "INVALID_VALUE"
      },
      {
        "row": 15,
        "field": "invoice_date",
        "value": "2025-13-45",
        "error": "Invalid date format",
        "code": "INVALID_FORMAT"
      }
    ],
    "duplicates": [
      {
        "invoice_number": "INV-2025-001",
        "rows": [45, 67],
        "existing_claim_id": "claim_uuid_existing"
      }
    ],
    "summary": {
      "required_field_errors": 12,
      "format_errors": 28,
      "duplicate_errors": 30,
      "can_proceed": false
    }
  }
}
```

---

### POST /api/claims/import
**Bulk import validated claims**

**Authorization:** Required (role: finance_manager, admin)
**Rate Limit:** 10 requests/hour

**Request Body:**
```json
{
  "batch_id": "batch_uuid_validated",
  "skip_duplicates": true,
  "auto_map_providers": true,
  "metadata": {
    "import_source": "vitraya_export",
    "period": "2025-Q3"
  }
}
```

**Response: 202 Accepted**
```json
{
  "success": true,
  "data": {
    "batch_id": "batch_uuid_validated",
    "import_job_id": "import_job_uuid",
    "status": "processing",
    "total_rows": 1180,
    "estimated_completion": "2025-10-07T12:10:00Z",
    "progress_url": "/api/claims/import/import_job_uuid/status"
  }
}
```

---

### GET /api/claims/[id]
**Get single claim details**

**Authorization:** Required
**Rate Limit:** 200 requests/minute

**Example Request:**
```http
GET /api/claims/claim_uuid_1?include=provider,payer,scheme,collections
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "claim_uuid_1",
    "invoice_number": "INV-2025-12345",
    "invoice_date": "2025-09-15",
    "insurance_company": "National Hospital Insurance Fund",
    "patient_name_encrypted": "enc_patient_data_here",
    "patient_dob": "1985-05-20",
    "card_number_encrypted": "enc_card_data_here",
    "approval_code": "APPR-2025-98765",
    "approval_date": "2025-09-14",
    "invoice_amount_cents": 15000000,
    "approved_amount_cents": 14500000,
    "claimed_amount_cents": 14500000,
    "shortfall_amount_cents": 500000,
    "rejection_reason": null,
    "provider_id": "provider_uuid_1",
    "provider_name": "Nairobi Hospital",
    "payer_id": "payer_uuid_1",
    "payer_name": "National Hospital Insurance Fund",
    "scheme_id": "scheme_uuid_1",
    "scheme_name": "NHIF Standard Cover",
    "batch_id": "batch_uuid_1",
    "status": "collected",
    "risk_score": 45,
    "disbursed_to_provider_cents": 13775000,
    "collected_from_insurer_cents": 14500000,
    "fee_earned_cents": 725000,
    "disbursement_date": "2025-09-16",
    "expected_collection_date": "2025-10-16",
    "actual_collection_date": "2025-10-14",
    "is_high_value": false,
    "is_overdue": false,
    "metadata": {
      "claim_type": "OPD",
      "diagnosis_codes": ["J00", "J06.9"]
    },
    "created_at": "2025-09-15T10:00:00Z",
    "updated_at": "2025-10-14T14:30:00Z"
  }
}
```

---

### PATCH /api/claims/[id]/map-provider
**Manually map claim to provider**

**Authorization:** Required (role: finance_manager, admin)
**Rate Limit:** 100 requests/minute

**Request Body:**
```json
{
  "provider_id": "provider_uuid_1",
  "payer_id": "payer_uuid_1",
  "scheme_id": "scheme_uuid_1",
  "confidence_score": 95.5,
  "mapping_source": "manual",
  "notes": "Confirmed with hospital billing department"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "claim_id": "claim_uuid_1",
    "invoice_number": "INV-2025-12345",
    "provider_id": "provider_uuid_1",
    "provider_name": "Nairobi Hospital",
    "payer_id": "payer_uuid_1",
    "payer_name": "National Hospital Insurance Fund",
    "scheme_id": "scheme_uuid_1",
    "scheme_name": "NHIF Standard Cover",
    "status": "mapped",
    "mapping_created_at": "2025-10-07T12:30:00Z",
    "mapped_by": "user_uuid",
    "updated_at": "2025-10-07T12:30:00Z"
  }
}
```

**Error Responses:**
- `400` - Invalid provider/payer/scheme IDs
- `404` - Claim not found
- `409` - Claim already mapped

---

## MAPPINGS API

Base path: `/api/mappings`

### Data Types

```typescript
interface MappingSuggestion {
  provider_id: string;
  provider_name: string;
  confidence_score: number;        // 0-100
  match_reasons: Array<{
    type: 'invoice_pattern' | 'amount_range' | 'insurance_pairing' |
          'historical_match' | 'approval_code';
    description: string;
    weight: number;
  }>;
  historical_accuracy?: number;    // If previously suggested
  last_matched?: string;           // ISO 8601 timestamp
}

interface BulkMappingRequest {
  mappings: Array<{
    invoice_number: string;
    provider_id: string;
    payer_id?: string;
    scheme_id?: string;
    confidence_score?: number;
  }>;
  mapping_source?: 'manual' | 'bulk_import' | 'auto_suggested';
  notes?: string;
}
```

---

### GET /api/mappings/suggestions
**Get AI-powered provider suggestions for unmapped claims**

**Authorization:** Required
**Rate Limit:** 100 requests/minute

**Query Parameters:**
```typescript
interface SuggestionsQuery {
  invoice_number?: string;         // Get suggestions for specific invoice
  claim_id?: string;               // Get suggestions for specific claim
  batch_id?: string;               // Get suggestions for entire batch
  limit?: number;                  // Max suggestions per claim (default: 5)
  min_confidence?: number;         // Min confidence score (default: 50)
}
```

**Example Request:**
```http
GET /api/mappings/suggestions?invoice_number=INV-2025-12345&limit=3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "claim_id": "claim_uuid_1",
    "invoice_number": "INV-2025-12345",
    "suggestions": [
      {
        "provider_id": "provider_uuid_1",
        "provider_name": "Nairobi Hospital",
        "confidence_score": 92.5,
        "match_reasons": [
          {
            "type": "invoice_pattern",
            "description": "Invoice prefix 'NH-' matches historical pattern",
            "weight": 0.4
          },
          {
            "type": "amount_range",
            "description": "Invoice amount (KES 150,000) typical for this provider",
            "weight": 0.25
          },
          {
            "type": "insurance_pairing",
            "description": "Provider frequently works with NHIF",
            "weight": 0.35
          }
        ],
        "historical_accuracy": 94.2,
        "last_matched": "2025-09-28T10:00:00Z",
        "times_matched": 145
      },
      {
        "provider_id": "provider_uuid_5",
        "provider_name": "Nairobi Women's Hospital",
        "confidence_score": 78.3,
        "match_reasons": [
          {
            "type": "invoice_pattern",
            "description": "Similar invoice numbering pattern",
            "weight": 0.5
          },
          {
            "type": "historical_match",
            "description": "Occasional matches with similar invoices",
            "weight": 0.5
          }
        ],
        "historical_accuracy": 72.0,
        "last_matched": "2025-08-15T14:20:00Z",
        "times_matched": 12
      },
      {
        "provider_id": "provider_uuid_8",
        "provider_name": "Aga Khan University Hospital",
        "confidence_score": 65.8,
        "match_reasons": [
          {
            "type": "insurance_pairing",
            "description": "Also works with NHIF",
            "weight": 0.6
          },
          {
            "type": "amount_range",
            "description": "Amount within typical range",
            "weight": 0.4
          }
        ],
        "historical_accuracy": 68.5,
        "last_matched": "2025-09-10T09:15:00Z",
        "times_matched": 34
      }
    ],
    "algorithm_version": "v2.1.0",
    "generated_at": "2025-10-07T12:45:00Z"
  }
}
```

---

### POST /api/mappings/bulk
**Bulk map multiple claims to providers**

**Authorization:** Required (role: finance_manager, admin)
**Rate Limit:** 20 requests/minute

**Request Body:**
```json
{
  "mappings": [
    {
      "invoice_number": "INV-2025-12345",
      "provider_id": "provider_uuid_1",
      "payer_id": "payer_uuid_1",
      "scheme_id": "scheme_uuid_1",
      "confidence_score": 95.0
    },
    {
      "invoice_number": "INV-2025-12346",
      "provider_id": "provider_uuid_2",
      "payer_id": "payer_uuid_1",
      "scheme_id": "scheme_uuid_2",
      "confidence_score": 88.5
    },
    {
      "invoice_number": "INV-2025-12347",
      "provider_id": "provider_uuid_1",
      "payer_id": "payer_uuid_3",
      "scheme_id": "scheme_uuid_5",
      "confidence_score": 92.0
    }
  ],
  "mapping_source": "auto_suggested",
  "notes": "Bulk mapping from AI suggestions with >85% confidence"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "total_requested": 3,
    "successful": 3,
    "failed": 0,
    "results": [
      {
        "invoice_number": "INV-2025-12345",
        "claim_id": "claim_uuid_1",
        "provider_id": "provider_uuid_1",
        "status": "success",
        "mapped_at": "2025-10-07T13:00:00Z"
      },
      {
        "invoice_number": "INV-2025-12346",
        "claim_id": "claim_uuid_2",
        "provider_id": "provider_uuid_2",
        "status": "success",
        "mapped_at": "2025-10-07T13:00:00Z"
      },
      {
        "invoice_number": "INV-2025-12347",
        "claim_id": "claim_uuid_3",
        "provider_id": "provider_uuid_1",
        "status": "success",
        "mapped_at": "2025-10-07T13:00:00Z"
      }
    ],
    "errors": []
  },
  "meta": {
    "timestamp": "2025-10-07T13:00:00Z",
    "request_id": "req_bulk_map_123"
  }
}
```

**Partial Success Response:**
```json
{
  "success": true,
  "data": {
    "total_requested": 3,
    "successful": 2,
    "failed": 1,
    "results": [
      {
        "invoice_number": "INV-2025-12345",
        "status": "success",
        "claim_id": "claim_uuid_1"
      },
      {
        "invoice_number": "INV-2025-12346",
        "status": "success",
        "claim_id": "claim_uuid_2"
      }
    ],
    "errors": [
      {
        "invoice_number": "INV-2025-12347",
        "status": "failed",
        "error": "Claim already mapped to different provider",
        "code": "ALREADY_MAPPED"
      }
    ]
  }
}
```

---

### GET /api/mappings/history
**Get mapping history and audit trail**

**Authorization:** Required
**Rate Limit:** 100 requests/minute

**Query Parameters:**
```typescript
interface MappingHistoryQuery {
  page?: number;
  limit?: number;
  provider_id?: string;
  invoice_number?: string;
  mapped_by?: string;              // User ID
  mapping_source?: string;
  date_from?: string;
  date_to?: string;
  verified?: boolean;
}
```

**Example Request:**
```http
GET /api/mappings/history?provider_id=provider_uuid_1&date_from=2025-09-01&limit=50
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "mapping_uuid_1",
      "invoice_number": "INV-2025-12345",
      "claim_id": "claim_uuid_1",
      "provider_id": "provider_uuid_1",
      "provider_name": "Nairobi Hospital",
      "payer_id": "payer_uuid_1",
      "payer_name": "NHIF",
      "scheme_id": "scheme_uuid_1",
      "scheme_name": "NHIF Standard",
      "confidence_score": 95.5,
      "mapping_source": "manual",
      "mapped_by": "user_uuid_1",
      "mapped_by_name": "Jane Doe",
      "mapped_at": "2025-09-16T10:30:00Z",
      "verified": true,
      "verified_by": "user_uuid_2",
      "verified_by_name": "John Smith",
      "verified_at": "2025-09-16T14:00:00Z",
      "notes": "Confirmed with hospital billing"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total_items": 1245,
    "total_pages": 25,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## ANALYTICS API

Base path: `/api/analytics`

---

### GET /api/analytics/provider-kpis
**Get aggregated provider KPIs**

**Authorization:** Required
**Rate Limit:** 50 requests/minute

**Query Parameters:**
```typescript
interface ProviderKPIsQuery {
  provider_ids?: string;           // Comma-separated UUIDs
  period?: 'week' | 'month' | 'quarter' | 'year';
  date_from?: string;
  date_to?: string;
  include_trends?: boolean;
}
```

**Example Request:**
```http
GET /api/analytics/provider-kpis?period=month&include_trends=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "date_range": {
      "from": "2025-09-01",
      "to": "2025-09-30"
    },
    "summary": {
      "total_outstanding_cents": 4520000000,
      "total_outstanding_change_percent": 12.5,
      "average_ar_age_days": 28,
      "average_ar_age_change_days": -3,
      "active_providers": 127,
      "active_providers_change": 8,
      "total_claims": 5842,
      "total_claims_change_percent": 18.2,
      "collection_rate_percent": 84.5,
      "collection_rate_change_percent": 2.3
    },
    "top_providers_by_outstanding": [
      {
        "provider_id": "provider_uuid_1",
        "provider_name": "Nairobi Hospital",
        "outstanding_cents": 245000000,
        "percentage_of_total": 5.4,
        "ar_age_days": 42,
        "risk_score": 68
      },
      {
        "provider_id": "provider_uuid_3",
        "provider_name": "Kenyatta National Hospital",
        "outstanding_cents": 580000000,
        "percentage_of_total": 12.8,
        "ar_age_days": 88,
        "risk_score": 85
      }
    ],
    "risk_distribution": {
      "low_risk": {
        "count": 65,
        "percentage": 51.2,
        "outstanding_cents": 1850000000
      },
      "medium_risk": {
        "count": 48,
        "percentage": 37.8,
        "outstanding_cents": 2120000000
      },
      "high_risk": {
        "count": 14,
        "percentage": 11.0,
        "outstanding_cents": 550000000
      }
    },
    "trends": {
      "last_6_months": [
        {
          "month": "2025-04",
          "outstanding_cents": 3800000000,
          "ar_age_days": 32,
          "active_providers": 115
        },
        {
          "month": "2025-05",
          "outstanding_cents": 4100000000,
          "ar_age_days": 30,
          "active_providers": 118
        }
      ]
    }
  }
}
```

---

### GET /api/analytics/ar-aging
**Get accounts receivable aging report**

**Authorization:** Required
**Rate Limit:** 50 requests/minute

**Query Parameters:**
```typescript
interface ARAgingQuery {
  provider_id?: string;
  payer_id?: string;
  group_by?: 'provider' | 'payer' | 'scheme';
  as_of_date?: string;            // Default: today
}
```

**Example Request:**
```http
GET /api/analytics/ar-aging?group_by=provider
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "as_of_date": "2025-10-07",
    "summary": {
      "total_outstanding_cents": 4520000000,
      "bucket_0_30_days_cents": 2210000000,
      "bucket_31_60_days_cents": 1570000000,
      "bucket_61_90_days_cents": 520000000,
      "bucket_over_90_days_cents": 220000000,
      "weighted_average_days": 35
    },
    "by_provider": [
      {
        "provider_id": "provider_uuid_1",
        "provider_name": "Nairobi Hospital",
        "total_outstanding_cents": 245000000,
        "buckets": {
          "0_30_days": {
            "amount_cents": 120000000,
            "percentage": 49.0,
            "claims_count": 22
          },
          "31_60_days": {
            "amount_cents": 85000000,
            "percentage": 34.7,
            "claims_count": 15
          },
          "61_90_days": {
            "amount_cents": 30000000,
            "percentage": 12.2,
            "claims_count": 6
          },
          "over_90_days": {
            "amount_cents": 10000000,
            "percentage": 4.1,
            "claims_count": 2
          }
        },
        "average_days": 42,
        "oldest_claim_days": 125
      }
    ],
    "chart_data": {
      "labels": ["0-30 days", "31-60 days", "61-90 days", ">90 days"],
      "amounts": [2210000000, 1570000000, 520000000, 220000000],
      "percentages": [48.9, 34.7, 11.5, 4.9]
    }
  }
}
```

---

### GET /api/analytics/concentration
**Get concentration risk analysis**

**Authorization:** Required
**Rate Limit:** 50 requests/minute

**Query Parameters:**
```typescript
interface ConcentrationQuery {
  dimension?: 'provider' | 'payer' | 'scheme' | 'city';
  top_n?: number;                 // Default: 10
  threshold_percent?: number;     // Highlight concentrations above %
}
```

**Example Request:**
```http
GET /api/analytics/concentration?dimension=provider&top_n=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "dimension": "provider",
    "total_outstanding_cents": 4520000000,
    "top_10_concentration_percent": 68.2,
    "herfindahl_index": 0.145,
    "concentration_risk_level": "medium",
    "concentrations": [
      {
        "rank": 1,
        "provider_id": "provider_uuid_3",
        "provider_name": "Kenyatta National Hospital",
        "outstanding_cents": 580000000,
        "percentage": 12.8,
        "cumulative_percentage": 12.8,
        "claims_count": 342
      },
      {
        "rank": 2,
        "provider_id": "provider_uuid_10",
        "provider_name": "Mediheal Group",
        "outstanding_cents": 410000000,
        "percentage": 9.1,
        "cumulative_percentage": 21.9,
        "claims_count": 285
      },
      {
        "rank": 3,
        "provider_id": "provider_uuid_4",
        "provider_name": "MP Shah Hospital",
        "outstanding_cents": 310000000,
        "percentage": 6.9,
        "cumulative_percentage": 28.8,
        "claims_count": 198
      }
    ],
    "insights": {
      "high_concentration_entities": 3,
      "entities_above_5_percent": 8,
      "recommendation": "Consider setting credit limits for top 3 providers"
    }
  }
}
```

---

### GET /api/analytics/data-quality
**Get data quality metrics**

**Authorization:** Required
**Rate Limit:** 50 requests/minute

**Query Parameters:**
```typescript
interface DataQualityQuery {
  batch_id?: string;
  date_from?: string;
  date_to?: string;
}
```

**Example Request:**
```http
GET /api/analytics/data-quality
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "overall_score": 87.5,
    "total_claims": 15420,
    "claims_with_issues": 1928,
    "categories": {
      "completeness": {
        "score": 92.3,
        "total_fields_checked": 154200,
        "missing_fields": 11886,
        "issues": [
          {
            "field": "approval_code",
            "missing_count": 342,
            "missing_percent": 2.2
          },
          {
            "field": "patient_dob",
            "missing_count": 156,
            "missing_percent": 1.0
          }
        ]
      },
      "mapping_status": {
        "score": 89.2,
        "mapped_claims": 13752,
        "unmapped_claims": 1668,
        "unmapped_percent": 10.8,
        "high_confidence_mappings": 12450,
        "low_confidence_mappings": 1302
      },
      "validity": {
        "score": 95.8,
        "valid_claims": 14772,
        "invalid_claims": 648,
        "issues": [
          {
            "type": "invalid_date",
            "count": 234,
            "description": "Invoice date in future"
          },
          {
            "type": "negative_amount",
            "count": 12,
            "description": "Negative invoice amount"
          },
          {
            "type": "amount_mismatch",
            "count": 402,
            "description": "Claimed amount > approved amount"
          }
        ]
      },
      "duplicates": {
        "score": 98.5,
        "duplicate_groups": 115,
        "duplicate_claims": 230,
        "duplicate_percent": 1.5
      }
    },
    "trends": {
      "score_change_percent": 2.3,
      "previous_period_score": 85.3
    },
    "recommendations": [
      {
        "priority": "high",
        "category": "mapping_status",
        "message": "1,668 claims need provider mapping",
        "action_url": "/claims/map"
      },
      {
        "priority": "medium",
        "category": "validity",
        "message": "402 claims have amount mismatches - review before financing",
        "action_url": "/claims?filter[validity]=invalid"
      }
    ]
  }
}
```

---

## ERROR CODES REFERENCE

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | Missing or invalid authentication token |
| `INVALID_TOKEN` | 401 | Token expired or malformed |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource does not exist |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `DUPLICATE_RESOURCE` | 409 | Resource with identifier already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Domain-Specific Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `PROVIDER_NOT_FOUND` | 404 | Provider with ID does not exist |
| `PROVIDER_CODE_EXISTS` | 409 | Provider code already in use |
| `PROVIDER_HAS_ACTIVE_CLAIMS` | 409 | Cannot delete provider with active claims |
| `PAYER_NOT_FOUND` | 404 | Payer with ID does not exist |
| `SCHEME_NOT_FOUND` | 404 | Scheme with ID does not exist |
| `CLAIM_NOT_FOUND` | 404 | Claim with ID does not exist |
| `CLAIM_ALREADY_MAPPED` | 409 | Claim already mapped to provider |
| `INVALID_FILE_FORMAT` | 400 | Uploaded file format not supported |
| `FILE_TOO_LARGE` | 413 | File exceeds maximum size limit |
| `BATCH_NOT_FOUND` | 404 | Upload batch not found |
| `BATCH_PROCESSING` | 409 | Batch still being processed |
| `INVALID_MAPPING` | 400 | Invalid provider/payer/scheme combination |
| `MAPPING_NOT_FOUND` | 404 | Mapping record not found |
| `INSUFFICIENT_CREDIT` | 409 | Provider credit limit exceeded |
| `INVALID_DATE_RANGE` | 400 | Invalid date range specified |

---

## RATE LIMITING

### Rate Limit Headers

All API responses include rate limit information:

```http
X-RateLimit-Limit: 1000        # Total requests allowed per window
X-RateLimit-Remaining: 999     # Requests remaining in current window
X-RateLimit-Reset: 1634567890  # Unix timestamp when window resets
X-RateLimit-Window: 3600       # Window duration in seconds
```

### Default Limits

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| Read Operations (GET) | 1000 requests | 1 hour |
| Write Operations (POST/PATCH/DELETE) | 200 requests | 1 hour |
| File Uploads | 10 requests | 1 hour |
| Authentication | 20 requests | 15 minutes |

### Rate Limit Exceeded Response

**Response: 429 Too Many Requests**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 1000,
      "window_seconds": 3600,
      "retry_after_seconds": 1245,
      "reset_at": "2025-10-07T14:00:00Z"
    }
  }
}
```

### Best Practices

1. **Implement exponential backoff** when receiving 429 responses
2. **Cache responses** where appropriate to reduce API calls
3. **Use webhooks** instead of polling for status updates
4. **Batch operations** when processing multiple resources
5. **Monitor rate limit headers** to avoid hitting limits

---

## WEBHOOKS

### Available Webhook Events

Subscribe to real-time events via webhooks:

| Event | Trigger |
|-------|---------|
| `provider.created` | New provider created |
| `provider.updated` | Provider details updated |
| `provider.deleted` | Provider soft deleted |
| `claim.uploaded` | New claim uploaded |
| `claim.mapped` | Claim mapped to provider |
| `claim.financed` | Provider paid for claim |
| `claim.collected` | Payment collected from insurer |
| `batch.completed` | Upload batch processing completed |
| `batch.failed` | Upload batch processing failed |
| `mapping.suggestion_ready` | AI suggestions generated |

### Webhook Configuration

Configure webhooks via the API:

```http
POST /api/webhooks
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://your-app.com/webhooks/finarif",
  "events": ["claim.mapped", "claim.collected"],
  "secret": "your_webhook_secret",
  "active": true
}
```

### Webhook Payload

```json
{
  "id": "webhook_event_uuid",
  "event": "claim.mapped",
  "created_at": "2025-10-07T13:00:00Z",
  "data": {
    "claim_id": "claim_uuid_1",
    "invoice_number": "INV-2025-12345",
    "provider_id": "provider_uuid_1",
    "mapped_by": "user_uuid",
    "mapped_at": "2025-10-07T13:00:00Z"
  },
  "api_version": "v1"
}
```

### Webhook Security

1. **Verify signature**: Each webhook includes `X-FinArif-Signature` header
2. **Use HTTPS**: Only HTTPS URLs accepted
3. **Validate timestamp**: Reject old webhook deliveries
4. **Return 200**: Acknowledge receipt with 200 status code

---

## APPENDIX

### TypeScript SDK Example

```typescript
import { FinArifClient } from '@finarif/sdk';

const client = new FinArifClient({
  apiKey: process.env.FINARIF_API_KEY,
  baseUrl: 'https://api.finarif.com/v1'
});

// List providers
const providers = await client.providers.list({
  filter: { is_active: true },
  sort_by: 'risk_score',
  sort_order: 'desc',
  page: 1,
  limit: 20
});

// Create provider
const newProvider = await client.providers.create({
  code: 'PRV127',
  name: 'Mombasa Medical Center',
  provider_type: 'hospital',
  email: 'billing@mombasamedical.com'
});

// Get provider analytics
const analytics = await client.providers.analytics('provider_uuid', {
  period: 'month',
  include_trends: true
});

// Upload claims
const batch = await client.claims.upload({
  file: fs.createReadStream('claims.xlsx'),
  batch_name: 'October 2025 Claims',
  auto_map: true
});

// Get mapping suggestions
const suggestions = await client.mappings.suggestions({
  invoice_number: 'INV-2025-12345',
  limit: 3
});
```

### Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-07 | Initial API specification |

### Support

For API support, contact:
- **Email:** api-support@finarif.com
- **Documentation:** https://docs.finarif.com
- **Status Page:** https://status.finarif.com

---

**End of API Contracts Document**
