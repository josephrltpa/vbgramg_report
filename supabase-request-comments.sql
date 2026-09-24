-- Create request_comments table for discussion threads
CREATE TABLE IF NOT EXISTS request_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES jc_requests(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  comment_by TEXT NOT NULL,
  comment_role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_request_comments_request_id 
ON request_comments(request_id);

-- Disable RLS for now (we can add proper security later)
ALTER TABLE request_comments DISABLE ROW LEVEL SECURITY;
