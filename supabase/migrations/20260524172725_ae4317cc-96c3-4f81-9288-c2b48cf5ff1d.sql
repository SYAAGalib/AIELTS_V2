-- 1. Profiles: restrict reads to owner or admin
DROP POLICY IF EXISTS p_profiles_select ON public.profiles;
CREATE POLICY p_profiles_select_own_or_admin
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 2. Questions: hide answer_key by restricting SELECT to admins only
DROP POLICY IF EXISTS p_questions_read ON public.questions;
CREATE POLICY p_questions_admin_read
  ON public.questions FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 3. Mail templates: server-only, drop authenticated read
DROP POLICY IF EXISTS p_mail_templates_read ON public.mail_templates;

-- 4. Notifications: only admins/service role can insert
DROP POLICY IF EXISTS p_notifications_owner_insert ON public.notifications;
CREATE POLICY p_notifications_admin_insert
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));