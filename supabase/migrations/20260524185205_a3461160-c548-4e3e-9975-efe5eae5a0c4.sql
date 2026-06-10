
-- 1. Remove user self-insert on billing_invoices (system-generated only via service role)
DROP POLICY IF EXISTS p_billing_invoices_owner_insert ON public.billing_invoices;

-- 2. Remove user self-insert on subscriptions (privilege escalation risk; server/service-role only)
DROP POLICY IF EXISTS p_subscriptions_owner_insert ON public.subscriptions;

-- 3. Restrict live_sessions reads: gate meeting access to admins or users who registered for that session.
DROP POLICY IF EXISTS p_live_sessions_read ON public.live_sessions;
CREATE POLICY p_live_sessions_read_registered
ON public.live_sessions
FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.live_registrations r
    WHERE r.session_id = live_sessions.id
      AND r.user_id = auth.uid()
  )
);
