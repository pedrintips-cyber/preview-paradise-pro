
ALTER TABLE public.affiliates ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false;
ALTER TABLE public.affiliates ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone DEFAULT NULL;
ALTER TABLE public.affiliates ADD COLUMN IF NOT EXISTS activation_purchase_id uuid DEFAULT NULL;
