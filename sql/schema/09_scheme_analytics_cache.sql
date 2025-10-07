-- Scheme analytics cache table
CREATE TABLE IF NOT EXISTS scheme_analytics_cache (
  scheme_id INTEGER PRIMARY KEY REFERENCES schemes(id) ON DELETE CASCADE,
  
  -- Claims volume
  total_claims INTEGER DEFAULT 0,
  total_invoice_cents BIGINT DEFAULT 0,
  total_approved_cents BIGINT DEFAULT 0,
  approval_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Provider breakdown
  top_providers JSONB,
  
  -- Trends
  monthly_trends JSONB,
  
  last_updated TIMESTAMP DEFAULT NOW()
);
