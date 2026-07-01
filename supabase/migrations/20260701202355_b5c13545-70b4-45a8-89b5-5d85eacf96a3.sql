DROP POLICY IF EXISTS "Contact form submit (prod + dev origins)" ON public.contact_submissions;

CREATE POLICY "Public can submit contact form"
  ON public.contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);