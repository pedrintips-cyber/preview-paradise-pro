
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES public.vip_plans(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_document text NOT NULL,
  customer_phone text NOT NULL,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paradise_transaction_id text,
  paradise_reference text NOT NULL,
  qr_code text,
  qr_code_base64 text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage purchases" ON public.purchases
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can create purchases" ON public.purchases
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Public can view own purchase" ON public.purchases
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Public can update purchases" ON public.purchases
  FOR UPDATE TO public
  USING (true)
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.purchases;
