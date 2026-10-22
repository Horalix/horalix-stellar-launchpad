-- Create storage bucket for team member photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-photos', 'team-photos', true);

-- Create storage bucket for news article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-images', 'news-images', true);

-- RLS policies for team-photos bucket
-- Allow authenticated users to upload/update/delete team photos
CREATE POLICY "Authenticated users can upload team photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team-photos');

CREATE POLICY "Authenticated users can update team photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'team-photos');

CREATE POLICY "Authenticated users can delete team photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'team-photos');

CREATE POLICY "Team photos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'team-photos');

-- RLS policies for news-images bucket
-- Allow authenticated users to upload/update/delete news images
CREATE POLICY "Authenticated users can upload news images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'news-images');

CREATE POLICY "Authenticated users can update news images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'news-images');

CREATE POLICY "Authenticated users can delete news images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'news-images');

CREATE POLICY "News images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'news-images');