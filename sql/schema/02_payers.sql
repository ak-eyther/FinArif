-- Payers table
CREATE TABLE IF NOT EXISTS payers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(100), -- Insurance, Corporate, Government
  total_claims INTEGER DEFAULT 0,
  total_volume_cents BIGINT DEFAULT 0,
  avg_claim_value_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payers_name ON payers(name);

-- Sample data
INSERT INTO payers (name, type, total_claims, total_volume_cents, avg_claim_value_cents)
VALUES 
  ('AAR Insurance', 'Insurance', 250, 30000000, 120000),
  ('Jubilee Insurance', 'Insurance', 180, 22000000, 122222),
  ('CIC Insurance', 'Insurance', 200, 28000000, 140000),
  ('Madison Insurance', 'Insurance', 150, 18000000, 120000),
  ('Britam Insurance', 'Insurance', 220, 26000000, 118181)
ON CONFLICT (name) DO NOTHING;
