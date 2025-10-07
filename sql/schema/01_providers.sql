-- Providers table
CREATE TABLE IF NOT EXISTS providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(100), -- Hospital, Clinic, Pharmacy, Lab
  location VARCHAR(255),
  total_claims INTEGER DEFAULT 0,
  total_volume_cents BIGINT DEFAULT 0,
  avg_claim_value_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_providers_name ON providers(name);
CREATE INDEX IF NOT EXISTS idx_providers_type ON providers(type);

-- Sample data for testing
INSERT INTO providers (name, type, location, total_claims, total_volume_cents, avg_claim_value_cents)
VALUES 
  ('Nairobi Hospital', 'Hospital', 'Nairobi', 150, 15000000, 100000),
  ('Aga Khan Hospital', 'Hospital', 'Nairobi', 200, 25000000, 125000),
  ('Kenyatta National Hospital', 'Hospital', 'Nairobi', 300, 20000000, 66666),
  ('MP Shah Hospital', 'Hospital', 'Nairobi', 120, 18000000, 150000),
  ('Avenue Healthcare', 'Clinic', 'Nairobi', 80, 5000000, 62500)
ON CONFLICT (name) DO NOTHING;
