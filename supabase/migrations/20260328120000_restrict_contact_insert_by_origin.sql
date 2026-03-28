-- ============================================================================
-- Origin-based RLS hardening
-- ============================================================================
-- Supabase PostgREST passes the HTTP Origin header to PostgreSQL via the
-- "request.header.origin" GUC.  Browsers always send the Origin header on
-- cross-origin requests and it cannot be spoofed by client-side JavaScript.
--
-- This migration adds origin checks to ALL user-facing authenticated policies
-- so that a cloned frontend on an unauthorized domain (e.g. horalix.si) cannot
-- read, write, or delete user data even if the user has a valid session.
-- ============================================================================

-- Helper: reusable origin check expression
-- (Wrapped in a SECURITY INVOKER function so RLS evaluates it per-request)
CREATE OR REPLACE FUNCTION public.is_allowed_origin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    current_setting('request.header.origin', true) IN (
      'https://horalix.com',
      'https://www.horalix.com'
    ),
    false
  );
$$;

-- ============================================================================
-- 1. contact_submissions
-- ============================================================================

-- 1a. INSERT — replace the wide-open "Anyone can submit" policy
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

CREATE POLICY "Only horalix.com can submit contact form"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (public.is_allowed_origin());

-- 1b. SELECT — users viewing their own submissions
DROP POLICY IF EXISTS "Users can view own submissions" ON public.contact_submissions;

CREATE POLICY "Users can view own submissions"
  ON public.contact_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND public.is_allowed_origin());

-- 1c. DELETE — users deleting their own submissions
DROP POLICY IF EXISTS "Users can delete own submissions" ON public.contact_submissions;

CREATE POLICY "Users can delete own submissions"
  ON public.contact_submissions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND public.is_allowed_origin());

-- ============================================================================
-- 2. profiles
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND public.is_allowed_origin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND public.is_allowed_origin());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_allowed_origin());

-- ============================================================================
-- 3. user_roles — prevents clone from detecting admin/editor status
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND public.is_allowed_origin());

-- ============================================================================
-- 4. newsletter_subscriptions
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own subscription" ON public.newsletter_subscriptions;

CREATE POLICY "Users can view their own subscription"
  ON public.newsletter_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND public.is_allowed_origin());

DROP POLICY IF EXISTS "Users can update their own subscription" ON public.newsletter_subscriptions;

CREATE POLICY "Users can update their own subscription"
  ON public.newsletter_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND public.is_allowed_origin());

DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.newsletter_subscriptions;

CREATE POLICY "Users can insert their own subscription"
  ON public.newsletter_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_allowed_origin());

-- ============================================================================
-- 5. Storage: user-avatars — block uploads/edits from unauthorized origins
-- ============================================================================

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.is_allowed_origin()
  );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.is_allowed_origin()
  );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.is_allowed_origin()
  );
