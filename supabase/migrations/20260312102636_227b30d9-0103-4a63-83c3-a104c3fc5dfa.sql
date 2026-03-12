
-- Make analytics insert more restrictive by requiring event_type to be one of allowed values
DROP POLICY "Public can insert analytics" ON public.analytics;
CREATE POLICY "Public can insert analytics" ON public.analytics 
  FOR INSERT WITH CHECK (event_type IN ('view', 'vip_click', 'purchase'));
