-- Step 1: Migrate legacy single image to array where image_urls is empty
UPDATE public.news_articles 
SET image_urls = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL 
  AND image_url != ''
  AND (image_urls IS NULL OR jsonb_array_length(image_urls) = 0);

-- Step 2: Generate default focus points for articles with images but empty/mismatched focus
UPDATE public.news_articles
SET image_focus = (
  SELECT jsonb_agg(jsonb_build_object('x', 50, 'y', 50))
  FROM generate_series(1, jsonb_array_length(image_urls))
)
WHERE jsonb_array_length(COALESCE(image_urls, '[]'::jsonb)) > 0
  AND (image_focus IS NULL OR jsonb_array_length(COALESCE(image_focus, '[]'::jsonb)) != jsonb_array_length(image_urls));

-- Step 3: Drop legacy column
ALTER TABLE public.news_articles DROP COLUMN IF EXISTS image_url;