
-- 1. Remove user-update on billing_invoices
DROP POLICY IF EXISTS p_billing_invoices_owner_update ON public.billing_invoices;

-- 2. Remove user-update on subscriptions
DROP POLICY IF EXISTS p_subscriptions_owner_update ON public.subscriptions;

-- 3. Restrict content reads: published OR admin
DROP POLICY IF EXISTS p_content_read ON public.content;
CREATE POLICY p_content_read ON public.content
  FOR SELECT
  USING (
    status = 'published'
    OR public.has_role(auth.uid(), 'admin')
  );

-- 4. yt_channel_requests: require auth and bind to auth.uid()
DROP POLICY IF EXISTS p_yt_requests_public_insert ON public.yt_channel_requests;
CREATE POLICY p_yt_requests_auth_insert ON public.yt_channel_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'pending'
    AND requester_user_id = auth.uid()
  );
