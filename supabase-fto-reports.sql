-- Create FTO Reports table
CREATE TABLE IF NOT EXISTS fto_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_card_no TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  amount_to_be_credited NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT,
  processed_date DATE,
  bank_name TEXT,
  village TEXT NOT NULL,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  source_file TEXT
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_fto_reports_village ON fto_reports(village);
CREATE INDEX IF NOT EXISTS idx_fto_reports_job_card_no ON fto_reports(job_card_no);
CREATE INDEX IF NOT EXISTS idx_fto_reports_status ON fto_reports(status);
CREATE INDEX IF NOT EXISTS idx_fto_reports_imported_at ON fto_reports(imported_at DESC);

-- Disable RLS for now
ALTER TABLE fto_reports DISABLE ROW LEVEL SECURITY;
