-- Add image_urls column to support multiple images (JSON array)
-- Keep image_url for backwards compatibility
ALTER TABLE public.news_articles
ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;

-- Migrate existing single images to the array if they exist
UPDATE public.news_articles
SET image_urls = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL AND image_url != '' AND image_urls = '[]'::jsonb;