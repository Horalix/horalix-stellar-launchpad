-- ============================================================================
-- Contact form: dev/preview-friendly + PostgREST-version-robust origin check
-- ============================================================================
-- The anti-clone migration (20260328120000) restricted contact_submissions
-- INSERT to https://horalix.com / www only, via is_allowed_origin(). That also
-- blocks the form on localhost and *.lovable.app / *.netlify.app previews, so it
-- could only ever succeed in production (every other origin -> "Transmission
-- Failed"). Contact INSERT is low-risk (SELECT/UPDATE stay admin-only; a
-- disallowed origin can at worst send spam, which client validation + the
-- recency-guarded notification absorb), so we widen the allowed origins for THIS
-- table only and keep the strict is_allowed_origin() everywhere else (profiles,
-- user_roles, storage, etc.).
--
-- We also read the Origin from BOTH the legacy `request.header.origin` GUC and
-- the modern `request.headers` JSON GUC, so the check is correct regardless of
-- the PostgREST version Supabase runs.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.contact_origin_allowed()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  WITH req AS (
    SELECT coalesce(
      nullif(current_setting('request.header.origin', true), ''),
      nullif(current_setting('request.headers', true), '')::json ->> 'origin'
    ) AS origin
  )
  SELECT coalesce(
    origin IN (
      'https://horalix.com',
      'https://www.horalix.com',
      'http://localhost:8080',
      'http://localhost:5173',
      'http://127.0.0.1:8080'
    )
    OR origin LIKE 'https://%.lovable.app'
    OR origin LIKE 'https://%.netlify.app',
    false
  )
  FROM req;
$$;

DROP POLICY IF EXISTS "Only horalix.com can submit contact form" ON public.contact_submissions;

CREATE POLICY "Contact form submit (prod + dev origins)"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (public.contact_origin_allowed());
