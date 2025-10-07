-- Provider analytics cache table
CREATE TABLE IF NOT EXISTS provider_analytics_cache (
  provider_id INTEGER PRIMARY KEY REFERENCES providers(id) ON DELETE CASCADE,
  
  -- Claims volume
  total_claims INTEGER DEFAULT 0,
  total_invoice_cents BIGINT DEFAULT 0,
  total_approved_cents BIGINT DEFAULT 0,
  approval_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
  
  -- Payer breakdown (JSON)
  top_payers JSONB, -- [{"payer_id": 1, "name": "AAR", "claims": 50, "volume_cents": 500000}]
  top_schemes JSONB,
  
  -- Trends (JSON)
  monthly_trends JSONB, -- [{"month": "2025-01", "claims": 20, "volume_cents": 200000}]
  
  last_updated TIMESTAMP DEFAULT NOW()
);
