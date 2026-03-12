
-- Affiliates table
CREATE TABLE public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  pix_key text,
  pix_key_type text DEFAULT 'cpf',
  commission_rate numeric NOT NULL DEFAULT 30,
  slug text NOT NULL UNIQUE,
  balance numeric NOT NULL DEFAULT 0,
  total_earned numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  gateway_token text,
  gateway_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Affiliate clicks tracking
CREATE TABLE public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  ip_address text,
  user_agent text,
  referrer text,
  page text,
  created_at timestamptz DEFAULT now()
);

-- Affiliate sales
CREATE TABLE public.affiliate_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  purchase_id uuid REFERENCES public.purchases(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES public.vip_plans(id) ON DELETE SET NULL,
  sale_amount numeric NOT NULL,
  commission_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Affiliate withdrawals
CREATE TABLE public.affiliate_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  pix_key text NOT NULL,
  pix_key_type text NOT NULL DEFAULT 'cpf',
  status text NOT NULL DEFAULT 'pending',
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;

-- Affiliates RLS
CREATE POLICY "Affiliates can view own profile" ON public.affiliates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Affiliates can update own profile" ON public.affiliates FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage affiliates" ON public.affiliates FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can view affiliate by slug" ON public.affiliates FOR SELECT TO public USING (status = 'active');

-- Clicks RLS
CREATE POLICY "Public can insert clicks" ON public.affiliate_clicks FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Affiliates can view own clicks" ON public.affiliate_clicks FOR SELECT TO authenticated USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all clicks" ON public.affiliate_clicks FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Sales RLS
CREATE POLICY "Affiliates can view own sales" ON public.affiliate_sales FOR SELECT TO authenticated USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage sales" ON public.affiliate_sales FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Service can insert sales" ON public.affiliate_sales FOR INSERT TO public WITH CHECK (true);

-- Withdrawals RLS
CREATE POLICY "Affiliates can view own withdrawals" ON public.affiliate_withdrawals FOR SELECT TO authenticated USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));
CREATE POLICY "Affiliates can create withdrawals" ON public.affiliate_withdrawals FOR INSERT TO authenticated WITH CHECK (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage withdrawals" ON public.affiliate_withdrawals FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for sales
ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliate_sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliate_withdrawals;

-- Update trigger for updated_at
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON public.affiliates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_sales_updated_at BEFORE UPDATE ON public.affiliate_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_withdrawals_updated_at BEFORE UPDATE ON public.affiliate_withdrawals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
