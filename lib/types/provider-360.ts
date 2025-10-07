// TypeScript type definitions for Provider 360° Analytics Module

// ============================================================================
// DATABASE ENTITY TYPES
// ============================================================================

export interface Provider {
  id: number;
  name: string;
  type: string | null;
  location: string | null;
  total_claims: number;
  total_volume_cents: number;
  avg_claim_value_cents: number;
  created_at: Date;
  updated_at: Date;
}

export interface Payer {
  id: number;
  name: string;
  type: string | null;
  total_claims: number;
  total_volume_cents: number;
  avg_claim_value_cents: number;
  created_at: Date;
  updated_at: Date;
}

export interface Scheme {
  id: number;
  payer_id: number;
  name: string;
  scheme_code: string | null;
  total_claims: number;
  total_volume_cents: number;
  avg_claim_value_cents: number;
  created_at: Date;
  updated_at: Date;
}

export interface Claim {
  id: number;
  provider_id: number;
  payer_id: number;
  scheme_id: number | null;
  claim_number: string;
  member_number: string | null;
  patient_name: string | null;
  provider_name: string;
  payer_name: string;
  scheme_name: string | null;
  service_date: Date;
  claim_date: Date;
  invoice_amount_cents: number;
  approved_amount_cents: number | null;
  status: string;
  diagnosis_code: string | null;
  procedure_code: string | null;
  upload_batch_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface UploadBatch {
  id: number;
  filename: string;
  uploaded_by: string | null;
  total_rows: number;
  processed_rows: number;
  failed_rows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_log: string | null;
  created_at: Date;
  completed_at: Date | null;
}

export interface ColumnMapping {
  id: number;
  batch_id: number;
  excel_column: string;
  schema_field: string;
  data_type: string;
  transform_rule: string | null;
  created_at: Date;
}

// ============================================================================
// ANALYTICS CACHE TYPES
// ============================================================================

export interface TopPayer {
  payer_id: number;
  name: string;
  claims: number;
  volume_cents: number;
}

export interface TopScheme {
  scheme_id: number;
  name: string;
  claims: number;
  volume_cents: number;
}

export interface TopProvider {
  provider_id: number;
  name: string;
  claims: number;
  volume_cents: number;
}

export interface MonthlyTrend {
  month: string;
  claims: number;
  volume_cents: number;
}

export interface ProviderAnalyticsCache {
  provider_id: number;
  total_claims: number;
  total_invoice_cents: number;
  total_approved_cents: number;
  approval_rate: number;
  top_payers: TopPayer[];
  top_schemes: TopScheme[];
  monthly_trends: MonthlyTrend[];
  last_updated: Date;
}

export interface PayerAnalyticsCache {
  payer_id: number;
  total_claims: number;
  total_invoice_cents: number;
  total_approved_cents: number;
  approval_rate: number;
  top_providers: TopProvider[];
  top_schemes: TopScheme[];
  monthly_trends: MonthlyTrend[];
  last_updated: Date;
}

export interface SchemeAnalyticsCache {
  scheme_id: number;
  total_claims: number;
  total_invoice_cents: number;
  total_approved_cents: number;
  approval_rate: number;
  top_providers: TopProvider[];
  monthly_trends: MonthlyTrend[];
  last_updated: Date;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateProviderRequest {
  name: string;
  type?: string;
  location?: string;
}

export interface UpdateProviderRequest {
  name?: string;
  type?: string;
  location?: string;
}

export interface CreatePayerRequest {
  name: string;
  type?: string;
}

export interface UpdatePayerRequest {
  name?: string;
  type?: string;
}

export interface CreateSchemeRequest {
  payer_id: number;
  name: string;
  scheme_code?: string;
}

export interface UpdateSchemeRequest {
  payer_id?: number;
  name?: string;
  scheme_code?: string;
}

// ============================================================================
// EXCEL UPLOAD TYPES
// ============================================================================

export interface ExcelRow {
  [key: string]: string | number | Date | null;
}

export interface ExcelPreviewData {
  headers: string[];
  rows: ExcelRow[];
  total_rows: number;
}

export interface MappingRule {
  excel_column: string;
  schema_field: string;
  data_type: 'string' | 'integer' | 'date' | 'decimal';
  transform_rule?: {
    type: 'date_format' | 'currency' | 'uppercase' | 'lowercase';
    from?: string;
    to?: string;
  };
}

export interface SaveMappingRequest {
  batch_id: number;
  mappings: MappingRule[];
}

export interface ProcessBatchRequest {
  batch_id: number;
}

export interface ProcessBatchResponse {
  batch_id: number;
  status: string;
  processed_rows: number;
  failed_rows: number;
  errors: string[];
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface ProviderAnalytics {
  provider: Provider;
  total_claims: number;
  total_invoice: number; // in KES
  total_approved: number; // in KES
  approval_rate: number; // percentage
  top_payers: Array<{
    payer_id: number;
    name: string;
    claims: number;
    volume: number; // in KES
  }>;
  top_schemes: Array<{
    scheme_id: number;
    name: string;
    claims: number;
    volume: number; // in KES
  }>;
  monthly_trends: Array<{
    month: string;
    claims: number;
    volume: number; // in KES
  }>;
}

export interface PayerAnalytics {
  payer: Payer;
  total_claims: number;
  total_invoice: number; // in KES
  total_approved: number; // in KES
  approval_rate: number; // percentage
  top_providers: Array<{
    provider_id: number;
    name: string;
    claims: number;
    volume: number; // in KES
  }>;
  top_schemes: Array<{
    scheme_id: number;
    name: string;
    claims: number;
    volume: number; // in KES
  }>;
  monthly_trends: Array<{
    month: string;
    claims: number;
    volume: number; // in KES
  }>;
}

export interface SchemeAnalytics {
  scheme: Scheme;
  payer: Payer;
  total_claims: number;
  total_invoice: number; // in KES
  total_approved: number; // in KES
  approval_rate: number; // percentage
  top_providers: Array<{
    provider_id: number;
    name: string;
    claims: number;
    volume: number; // in KES
  }>;
  monthly_trends: Array<{
    month: string;
    claims: number;
    volume: number; // in KES
  }>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ValidationError {
  row: number;
  field: string;
  value: unknown;
  error: string;
}

export interface TransformResult {
  success: boolean;
  data?: ExcelRow;
  errors?: ValidationError[];
}

// ============================================================================
// CHART DATA TYPES
// ============================================================================

export interface BarChartData {
  name: string;
  value: number;
  id: number;
}

export interface LineChartData {
  month: string;
  claims: number;
  volume: number;
}

export interface PieChartData {
  name: string;
  value: number;
  id: number;
}
