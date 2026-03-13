
-- Create sections table for video row groupings
CREATE TABLE public.sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Admins can manage sections
CREATE POLICY "Admins can manage sections" ON public.sections
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view active sections
CREATE POLICY "Public can view active sections" ON public.sections
  FOR SELECT TO public
  USING (active = true);

-- Add section_id to videos table
ALTER TABLE public.videos ADD COLUMN section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL;
