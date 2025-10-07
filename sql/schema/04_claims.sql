-- Claims table
CREATE TABLE IF NOT EXISTS claims (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES providers(id) ON DELETE CASCADE,
  payer_id INTEGER REFERENCES payers(id) ON DELETE CASCADE,
  scheme_id INTEGER REFERENCES schemes(id) ON DELETE SET NULL,
  
  -- Excel mapped fields
  claim_number VARCHAR(100) UNIQUE,
  member_number VARCHAR(100),
  patient_name VARCHAR(255),
  provider_name VARCHAR(255), -- Denormalized for display
  payer_name VARCHAR(255), -- Denormalized for display
  scheme_name VARCHAR(255), -- Denormalized for display
  service_date DATE,
  claim_date DATE,
  invoice_amount_cents INTEGER NOT NULL,
  approved_amount_cents INTEGER,
  status VARCHAR(50), -- Pending, Approved, Rejected
  diagnosis_code VARCHAR(50),
  procedure_code VARCHAR(50),
  
  -- Metadata
  upload_batch_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_claims_provider ON claims(provider_id);
CREATE INDEX IF NOT EXISTS idx_claims_payer ON claims(payer_id);
CREATE INDEX IF NOT EXISTS idx_claims_scheme ON claims(scheme_id);
CREATE INDEX IF NOT EXISTS idx_claims_service_date ON claims(service_date);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
