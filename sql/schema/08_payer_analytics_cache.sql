-- Payer analytics cache table
CREATE TABLE IF NOT EXISTS payer_analytics_cache (
  payer_id INTEGER PRIMARY KEY REFERENCES payers(id) ON DELETE CASCADE,
  
  -- Claims volume
  total_claims INTEGER DEFAULT 0,
  total_invoice_cents BIGINT DEFAULT 0,
  total_approved_cents BIGINT DEFAULT 0,
  approval_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Provider breakdown
  top_providers JSONB,
  top_schemes JSONB,
  
  -- Trends
  monthly_trends JSONB,
  
  last_updated TIMESTAMP DEFAULT NOW()
);
