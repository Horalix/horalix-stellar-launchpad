-- Update signup trigger to support newsletter opt in without client side inserts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wants_newsletter BOOLEAN := false;
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  wants_newsletter := COALESCE((NEW.raw_user_meta_data->>'newsletter_opt_in')::BOOLEAN, false);

  IF wants_newsletter THEN
    INSERT INTO public.newsletter_subscriptions (
      user_id,
      email,
      is_subscribed,
      subscribed_at,
      unsubscribed_at
    )
    VALUES (
      NEW.id,
      LOWER(NEW.email),
      true,
      now(),
      NULL
    )
    ON CONFLICT (email) DO UPDATE
    SET
      user_id = EXCLUDED.user_id,
      is_subscribed = true,
      unsubscribed_at = NULL,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;
