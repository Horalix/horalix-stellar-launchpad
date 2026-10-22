CREATE OR REPLACE FUNCTION public.contact_origin_allowed()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
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
DROP POLICY IF EXISTS "Contact form submit (prod + dev origins)" ON public.contact_submissions;

CREATE POLICY "Contact form submit (prod + dev origins)"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (public.contact_origin_allowed());