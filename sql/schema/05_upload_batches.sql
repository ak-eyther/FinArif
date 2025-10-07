-- Upload batches table
CREATE TABLE IF NOT EXISTS upload_batches (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  uploaded_by VARCHAR(255),
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  error_log TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_batches_status ON upload_batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_created ON upload_batches(created_at DESC);
