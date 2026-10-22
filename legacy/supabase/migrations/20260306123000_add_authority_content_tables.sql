CREATE TABLE public.contributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    credentials TEXT,
    specialty TEXT,
    bio_short TEXT NOT NULL,
    bio_long TEXT,
    photo_url TEXT,
    linkedin_url TEXT,
    same_as JSONB NOT NULL DEFAULT '[]'::jsonb,
    contributor_type TEXT NOT NULL DEFAULT 'author',
    is_public BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public contributors"
ON public.contributors FOR SELECT
USING (is_public = true);

CREATE POLICY "Admins can manage contributors"
ON public.contributors FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TABLE public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'guide',
    topic_cluster TEXT,
    primary_keyword TEXT,
    secondary_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    hero_image_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    author_id UUID REFERENCES public.contributors(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES public.contributors(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    seo_title TEXT,
    seo_description TEXT,
    canonical_path TEXT,
    region_scope TEXT NOT NULL DEFAULT 'global',
    cta_variant TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published resources"
ON public.resources FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage resources"
ON public.resources FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_contributors_updated_at
    BEFORE UPDATE ON public.contributors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON public.resources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
