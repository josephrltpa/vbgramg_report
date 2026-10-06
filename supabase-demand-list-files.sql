-- Create demand_list_files table for VEC demand list uploads
CREATE TABLE IF NOT EXISTS demand_list_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  village TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  file_link TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(village, month, year)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_demand_list_files_village_month_year 
ON demand_list_files(village, month, year);

-- Disable RLS for now (we can add proper security later)
ALTER TABLE demand_list_files DISABLE ROW LEVEL SECURITY;
