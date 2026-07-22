alter table public.news_articles
add column if not exists seo_title text,
add column if not exists keywords text[] not null default '{}'::text[];