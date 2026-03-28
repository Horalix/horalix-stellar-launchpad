-- Restrict contact form submissions to requests originating from horalix.com.
-- Supabase PostgREST passes the HTTP Origin header to PostgreSQL via the
-- "request.header.origin" GUC.  Browsers always send the Origin header on
-- cross-origin requests and it cannot be spoofed by client-side JavaScript.

-- Step 1: Replace the permissive INSERT policy with one that checks origin.
DROP POLICY IF EXISTS "Anyone can submit contact form"
  ON public.contact_submissions;

CREATE POLICY "Only horalix.com can submit contact form"
  ON public.contact_submissions
  FOR INSERT
  WITH CHECK (
    current_setting('request.header.origin', true) IN (
      'https://horalix.com',
      'https://www.horalix.com'
    )
  );

-- Step 2: Also restrict profile reads/updates to allowed origins.
-- (Existing policies already enforce auth.uid() = user_id, so this adds an
--  extra origin gate.)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    AND current_setting('request.header.origin', true) IN (
      'https://horalix.com',
      'https://www.horalix.com'
    )
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND current_setting('request.header.origin', true) IN (
      'https://horalix.com',
      'https://www.horalix.com'
    )
  );
