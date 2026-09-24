-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload wagelists" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update wagelists" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete wagelists" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to wagelists" ON storage.objects;

-- Create new policies that allow public access (since we're using anon key)
-- Allow anyone to upload files
CREATE POLICY "Allow public uploads to wagelists"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'wagelists');

-- Allow anyone to update files
CREATE POLICY "Allow public updates to wagelists"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'wagelists');

-- Allow anyone to delete files
CREATE POLICY "Allow public deletes from wagelists"
ON storage.objects
FOR DELETE
USING (bucket_id = 'wagelists');

-- Allow public read access to wagelists
CREATE POLICY "Allow public read access to wagelists"
ON storage.objects
FOR SELECT
USING (bucket_id = 'wagelists');
