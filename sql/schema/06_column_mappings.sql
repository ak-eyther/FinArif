-- Column mappings table
CREATE TABLE IF NOT EXISTS column_mappings (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER REFERENCES upload_batches(id) ON DELETE CASCADE,
  excel_column VARCHAR(255) NOT NULL,
  schema_field VARCHAR(255) NOT NULL,
  data_type VARCHAR(50), -- string, integer, date, decimal
  transform_rule TEXT, -- JSON: {"type": "date_format", "from": "DD/MM/YYYY", "to": "YYYY-MM-DD"}
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mappings_batch ON column_mappings(batch_id);
