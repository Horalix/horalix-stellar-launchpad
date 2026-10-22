-- Create the faq_items table
CREATE TABLE public.faq_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    page text NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    sort_order int NOT NULL DEFAULT 0,
    is_published boolean NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published FAQ items
CREATE POLICY "Anyone can view published FAQ items"
ON public.faq_items
FOR SELECT
USING (is_published = true);

-- Policy: Admins/Editors can manage FAQ items
CREATE POLICY "Admins can manage FAQ items"
ON public.faq_items
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_faq_items_updated_at
BEFORE UPDATE ON public.faq_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial FAQ items
INSERT INTO public.faq_items (page, question, answer, sort_order) VALUES
('home', 'What is Horalix, in one sentence?', 'Horalix is clinical AI software that helps teams review echocardiograms faster, with outputs you can verify visually inside the workflow.', 1),
('home', 'Who is Horalix for?', 'Horalix is built for cardiologists, echo labs, imaging leads, and health systems that want faster review, more consistent reporting, and verification-friendly AI support.', 2),
('home', 'Does Horalix replace clinicians?', 'No. Horalix is decision support. It is designed to keep clinicians in control by tying outputs to visual evidence, overlays, and measurable signals.', 3),
('home', 'What files does Horalix support?', 'We work with DICOM echocardiogram studies. If you have a specific export from your ultrasound system, we can confirm compatibility quickly.', 4),
('home', 'How fast is the analysis?', 'Typical end to end analysis is under one minute per study, depending on hardware and clip count. The focus is speed plus clarity, not speed alone.', 5),
('home', 'What do you mean by "visual verification"?', 'Instead of only giving numbers, Horalix uses overlays, segmentation, and annotations so clinicians can confirm what the system is suggesting without leaving the viewer.', 6),
('home', 'What reports do you generate?', 'Horalix produces two outputs: a clinician-readable narrative summary grounded in extracted findings, and a separate print-ready numeric report for documentation workflows.', 7),
('home', 'Can Horalix integrate with PACS or existing hospital systems?', 'We are designed to fit into real clinical environments. Integration depends on your stack, but we support standards-based workflows and can discuss the right approach during a demo.', 8),
('home', 'How do you handle data privacy and security?', 'We take privacy seriously. Deployment options and controls depend on your environment, and we can walk through security, access, and data handling during onboarding.', 9),
('home', 'Where is Horalix based, and where do you work?', 'We are based in Sarajevo, Bosnia and Herzegovina, and we collaborate with teams across the Balkans, Europe, and beyond.', 10),
('home', 'Is Horalix available for pilots or demos?', 'Yes. If you want to evaluate Horalix with your team, request a demo and we will share the current capabilities, setup, and what a pilot looks like.', 11),
('home', 'What makes Horalix different from other medical AI tools?', 'Horalix is built around calm clinical review, not dashboard chaos. The product is designed to reduce context switching and make AI outputs easy to verify.', 12);