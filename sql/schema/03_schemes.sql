-- Schemes table
CREATE TABLE IF NOT EXISTS schemes (
  id SERIAL PRIMARY KEY,
  payer_id INTEGER REFERENCES payers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  scheme_code VARCHAR(100),
  total_claims INTEGER DEFAULT 0,
  total_volume_cents BIGINT DEFAULT 0,
  avg_claim_value_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(payer_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schemes_payer_id ON schemes(payer_id);
CREATE INDEX IF NOT EXISTS idx_schemes_name ON schemes(name);

-- Sample data (will insert after payers exist)
INSERT INTO schemes (payer_id, name, scheme_code, total_claims, total_volume_cents, avg_claim_value_cents)
SELECT 
  p.id,
  s.name,
  s.code,
  s.claims,
  s.volume,
  s.avg_value
FROM payers p
CROSS JOIN (VALUES
  ('AAR Insurance', 'Afya Imara', 'AAR-AI', 100, 12000000, 120000),
  ('AAR Insurance', 'Smart Health', 'AAR-SH', 80, 9000000, 112500),
  ('Jubilee Insurance', 'Inuka Cover', 'JUB-IC', 90, 11000000, 122222),
  ('Jubilee Insurance', 'Bima Afya', 'JUB-BA', 60, 7000000, 116666),
  ('CIC Insurance', 'Inua Jamii', 'CIC-IJ', 120, 16000000, 133333),
  ('Madison Insurance', 'Smart Cover', 'MAD-SC', 80, 9000000, 112500),
  ('Britam Insurance', 'Afya Plus', 'BRI-AP', 110, 13000000, 118181)
) s(payer_name, name, code, claims, volume, avg_value)
WHERE p.name = s.payer_name
ON CONFLICT (payer_id, name) DO NOTHING;
