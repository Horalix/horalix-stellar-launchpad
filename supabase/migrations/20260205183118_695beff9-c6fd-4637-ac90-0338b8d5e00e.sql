-- Create newsletter_subscriptions table for tracking opt-ins
CREATE TABLE public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    is_subscribed BOOLEAN NOT NULL DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(email)
);

-- Create newsletter_sends table to track which articles have been sent (idempotency)
CREATE TABLE public.newsletter_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    recipients_count INTEGER NOT NULL DEFAULT 0,
    UNIQUE(article_id)
);

-- Enable RLS on newsletter_subscriptions
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on newsletter_sends
ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.newsletter_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own subscription
CREATE POLICY "Users can update their own subscription"
ON public.newsletter_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own subscription
CREATE POLICY "Users can insert their own subscription"
ON public.newsletter_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all subscriptions (for sending newsletters)
CREATE POLICY "Admins can view all subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can view newsletter_sends
CREATE POLICY "Admins can view newsletter sends"
ON public.newsletter_sends
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can insert newsletter_sends
CREATE POLICY "Admins can insert newsletter sends"
ON public.newsletter_sends
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updating updated_at
CREATE TRIGGER update_newsletter_subscriptions_updated_at
    BEFORE UPDATE ON public.newsletter_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();