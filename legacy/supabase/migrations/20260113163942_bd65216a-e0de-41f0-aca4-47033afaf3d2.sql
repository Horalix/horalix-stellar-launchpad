-- Add display_date and image_focus columns to news_articles
ALTER TABLE public.news_articles 
ADD COLUMN display_date timestamp with time zone,
ADD COLUMN image_focus jsonb DEFAULT '[]'::jsonb;

-- Create linkedin_posts table
CREATE TABLE public.linkedin_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_url text NOT NULL UNIQUE,
  post_id text NOT NULL UNIQUE,
  post_date timestamp with time zone,
  is_visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  added_by uuid REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.linkedin_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for linkedin_posts
CREATE POLICY "Anyone can view visible posts" 
ON public.linkedin_posts 
FOR SELECT 
USING (is_visible = true);

CREATE POLICY "Admins can manage linkedin posts" 
ON public.linkedin_posts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));