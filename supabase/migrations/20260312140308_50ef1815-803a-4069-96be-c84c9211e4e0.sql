
ALTER TABLE public.purchases ADD COLUMN affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE SET NULL;
