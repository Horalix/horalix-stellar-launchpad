-- Add user_id column to contact_submissions table
ALTER TABLE public.contact_submissions 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add RLS policy for users to view their own submissions
CREATE POLICY "Users can view own submissions" 
ON public.contact_submissions 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Add RLS policy for users to delete their own submissions
CREATE POLICY "Users can delete own submissions" 
ON public.contact_submissions 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);