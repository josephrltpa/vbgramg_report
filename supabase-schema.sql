-- ============================================================================
-- MGNREGA VEC Portal - Updated Schema
-- Run this in Supabase SQL Editor (delete old tables first if needed)
-- ============================================================================

-- Drop old tables if they exist
DROP TABLE IF EXISTS monthly_demands CASCADE;
DROP TABLE IF EXISTS jc_requests CASCADE;
DROP TABLE IF EXISTS job_cards CASCADE;
DROP TABLE IF EXISTS villages CASCADE;

-- ============================================================================
-- TABLE: job_cards (Fixed list of JCs per village)
-- ============================================================================
CREATE TABLE job_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_card_number TEXT NOT NULL,
  head_name TEXT NOT NULL,
  village TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: jc_requests (VEC requests for JC changes)
-- ============================================================================
CREATE TABLE jc_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_card_number TEXT NOT NULL,
  head_name TEXT NOT NULL,
  village TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('Add New JC', 'Delete JC', 'Correction')),
  remarks TEXT DEFAULT '',
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'In Progress', 'Completed', 'Rejected')),
  feedback TEXT DEFAULT '',
  action_date DATE,
  requested_by TEXT DEFAULT '',
  processed_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: monthly_demands (Monthly wage demand tracking)
-- ============================================================================
CREATE TABLE monthly_demands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_card_id UUID REFERENCES job_cards(id) ON DELETE SET NULL,
  job_card_number TEXT NOT NULL,
  head_name TEXT NOT NULL,
  village TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  days_worked INTEGER DEFAULT 0,
  wage_amount NUMERIC(12, 2) DEFAULT 0,
  credit_status TEXT NOT NULL DEFAULT 'Pending' CHECK (credit_status IN ('Credited', 'Pending')),
  credit_date DATE,
  wagelist_link TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_job_cards_village ON job_cards(village);
CREATE INDEX idx_jc_requests_village ON jc_requests(village);
CREATE INDEX idx_jc_requests_status ON jc_requests(status);
CREATE INDEX idx_monthly_demands_village ON monthly_demands(village);
CREATE INDEX idx_monthly_demands_month_year ON monthly_demands(month, year);

-- ============================================================================
-- DISABLE RLS (for now, we'll add proper auth later)
-- ============================================================================
ALTER TABLE job_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE jc_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_demands DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SEED DATA: Sample Job Cards for each village
-- ============================================================================
INSERT INTO job_cards (job_card_number, head_name, village) VALUES
  -- Rampur
  ('RAM/2024/0001', 'Ramesh Kumar', 'Rampur'),
  ('RAM/2024/0002', 'Sita Devi', 'Rampur'),
  ('RAM/2024/0003', 'Mohan Lal', 'Rampur'),
  ('RAM/2024/0004', 'Geeta Bai', 'Rampur'),
  ('RAM/2024/0005', 'Raju Sharma', 'Rampur'),
  -- Sundarpur
  ('SUN/2024/0001', 'Kamla Devi', 'Sundarpur'),
  ('SUN/2024/0002', 'Bharat Singh', 'Sundarpur'),
  ('SUN/2024/0003', 'Phoolo Devi', 'Sundarpur'),
  ('SUN/2024/0004', 'Dinesh Yadav', 'Sundarpur'),
  -- Kishangarh
  ('KIS/2024/0001', 'Meena Kumari', 'Kishangarh'),
  ('KIS/2024/0002', 'Ravi Patel', 'Kishangarh'),
  ('KIS/2024/0003', 'Sunita Devi', 'Kishangarh'),
  -- Devgarh
  ('DEV/2024/0001', 'Jagdish Prasad', 'Devgarh'),
  ('DEV/2024/0002', 'Lakshmi Bai', 'Devgarh'),
  ('DEV/2024/0003', 'Suresh Gupta', 'Devgarh'),
  ('DEV/2024/0004', 'Radha Devi', 'Devgarh'),
  -- Chandpur
  ('CHA/2024/0001', 'Manoj Tiwari', 'Chandpur'),
  ('CHA/2024/0002', 'Savitri Devi', 'Chandpur'),
  ('CHA/2024/0003', 'Arun Kumar', 'Chandpur');
