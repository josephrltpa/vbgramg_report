-- Create village_wagelists table for village-level wagelist uploads
CREATE TABLE IF NOT EXISTS village_wagelists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  village TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  wagelist_link TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(village, month, year)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_village_wagelists_village_month_year 
ON village_wagelists(village, month, year);

-- Disable RLS (for now - add proper security later)
ALTER TABLE village_wagelists DISABLE ROW LEVEL SECURITY;
