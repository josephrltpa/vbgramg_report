-- ============================================================
-- MGNREGA Rural Employment Records - Supabase Schema
-- Free Tier Compatible (Lightweight tables)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: villages
-- ============================================================
CREATE TABLE villages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  block TEXT NOT NULL,
  district TEXT DEFAULT '',
  state TEXT DEFAULT 'Rajasthan',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: job_cards (Module 1)
-- ============================================================
CREATE TABLE job_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sl_no INTEGER NOT NULL,
  job_card_number TEXT NOT NULL,
  head_name TEXT NOT NULL,
  remarks TEXT NOT NULL CHECK (remarks IN ('Add New', 'Delete', 'Correction')),
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  approval_status TEXT NOT NULL DEFAULT 'Pending' CHECK (approval_status IN ('Approved', 'Not Approved', 'Pending')),
  office_action TEXT NOT NULL DEFAULT 'Pending' CHECK (office_action IN ('Added to Portal', 'Pending', 'Rejected')),
  village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: financial_records (Module 2)
-- ============================================================
CREATE TABLE financial_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demand_id TEXT NOT NULL,
  work_name TEXT NOT NULL,
  amount_credited NUMERIC(12, 2) NOT NULL DEFAULT 0,
  credit_status TEXT NOT NULL DEFAULT 'Pending' CHECK (credit_status IN ('Credited', 'Pending')),
  credit_date DATE,
  attachment_link TEXT DEFAULT '',
  processing_stage TEXT NOT NULL DEFAULT 'Generated' CHECK (processing_stage IN ('Generated', 'FTO Signed', 'Processed', 'Credited')),
  fy_month INTEGER NOT NULL CHECK (fy_month BETWEEN 1 AND 12),
  village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES (for fast queries)
-- ============================================================
CREATE INDEX idx_job_cards_village ON job_cards(village_id);
CREATE INDEX idx_job_cards_approval ON job_cards(approval_status);
CREATE INDEX idx_financial_records_village ON financial_records(village_id);
CREATE INDEX idx_financial_records_month ON financial_records(fy_month);
CREATE INDEX idx_financial_records_status ON financial_records(credit_status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- For free tier: simple auth-based policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- Villages: Anyone authenticated can read
CREATE POLICY "Villages are viewable by everyone"
  ON villages FOR SELECT
  USING (true);

-- Job Cards: Authenticated users can CRUD their records
CREATE POLICY "Job cards viewable by authenticated users"
  ON job_cards FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Job cards insertable by authenticated users"
  ON job_cards FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Job cards updatable by authenticated users"
  ON job_cards FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Job cards deletable by authenticated users"
  ON job_cards FOR DELETE
  USING (auth.role() = 'authenticated');

-- Financial Records: Authenticated users can CRUD
CREATE POLICY "Financial records viewable by authenticated users"
  ON financial_records FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Financial records insertable by authenticated users"
  ON financial_records FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Financial records updatable by authenticated users"
  ON financial_records FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Financial records deletable by authenticated users"
  ON financial_records FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA (Sample Villages)
-- ============================================================
INSERT INTO villages (name, block) VALUES
  ('Rampur', 'Sadar'),
  ('Sundarpur', 'Sadar'),
  ('Kishangarh', 'North'),
  ('Devgarh', 'North'),
  ('Chandpur', 'South');

-- ============================================================
-- FUNCTIONS: Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_job_cards
  BEFORE UPDATE ON job_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_financial_records
  BEFORE UPDATE ON financial_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
