-- Create storage bucket for wagelists
INSERT INTO storage.buckets (id, name, public)
VALUES ('wagelists', 'wagelists', true);

-- Set up storage policies
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload wagelists"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'wagelists' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their files
CREATE POLICY "Allow authenticated users to update wagelists"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'wagelists' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their files
CREATE POLICY "Allow authenticated users to delete wagelists"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'wagelists' AND
  auth.role() = 'authenticated'
);

-- Allow public read access to wagelists
CREATE POLICY "Allow public read access to wagelists"
ON storage.objects
FOR SELECT
USING (bucket_id = 'wagelists');
