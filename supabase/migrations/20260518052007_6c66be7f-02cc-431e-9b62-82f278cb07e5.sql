-- ============================================================
-- AIELTS full schema (idempotent where possible)
-- ============================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.skill AS ENUM ('reading','writing','listening','speaking','vocabulary','general');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM ('trial','active','past_due','canceled','expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.attempt_status AS ENUM ('in_progress','submitted','graded','abandoned');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.content_status AS ENUM ('draft','published','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  country TEXT,
  locale TEXT DEFAULT 'en',
  target_band NUMERIC(2,1),
  exam_date DATE,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- user_roles + has_role()
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id,'admin')
$$;

-- Auto-create profile + default 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
          NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- subscriptions / billing
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status public.subscription_status NOT NULL DEFAULT 'trial',
  trial_end TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  provider TEXT,
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'open',
  hosted_invoice_url TEXT,
  provider TEXT,
  provider_invoice_id TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- catalog: modules / questions / mock tests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  skill public.skill NOT NULL,
  summary TEXT,
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill public.skill NOT NULL,
  type TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  prompt TEXT NOT NULL,
  body JSONB NOT NULL DEFAULT '{}'::jsonb,
  answer_key JSONB,
  tags TEXT[] DEFAULT '{}',
  status public.content_status NOT NULL DEFAULT 'published',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_questions_skill ON public.questions(skill);

CREATE TABLE IF NOT EXISTS public.mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 180,
  is_full_test BOOLEAN NOT NULL DEFAULT TRUE,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.mock_test_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id UUID NOT NULL REFERENCES public.mock_tests(id) ON DELETE CASCADE,
  skill public.skill NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  instructions TEXT
);
ALTER TABLE public.mock_test_sections ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.mock_test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.mock_test_sections(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  points NUMERIC(5,2) NOT NULL DEFAULT 1
);
ALTER TABLE public.mock_test_questions ENABLE ROW LEVEL SECURITY;

-- attempts
CREATE TABLE IF NOT EXISTS public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mock_test_id UUID REFERENCES public.mock_tests(id) ON DELETE SET NULL,
  skill public.skill,
  status public.attempt_status NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  score NUMERIC(5,2),
  band NUMERIC(2,1),
  feedback JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.attempts(user_id);

CREATE TABLE IF NOT EXISTS public.attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer JSONB,
  score NUMERIC(5,2),
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON public.attempt_answers(attempt_id);

-- vocabulary
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  part_of_speech TEXT,
  definition TEXT NOT NULL,
  example TEXT,
  cefr TEXT,
  tags TEXT[] DEFAULT '{}',
  status public.content_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS uq_vocab_word ON public.vocabulary(lower(word));

CREATE TABLE IF NOT EXISTS public.user_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES public.vocabulary(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'learning',
  next_review_at TIMESTAMPTZ,
  ease NUMERIC(3,2) DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, vocabulary_id)
);
ALTER TABLE public.user_vocabulary ENABLE ROW LEVEL SECURITY;

-- content (CMS)
CREATE TABLE IF NOT EXISTS public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body JSONB NOT NULL DEFAULT '{}'::jsonb,
  cover_url TEXT,
  category TEXT,
  status public.content_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- live sessions
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  host_name TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  meeting_url TEXT,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.live_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, session_id)
);
ALTER TABLE public.live_registrations ENABLE ROW LEVEL SECURITY;

-- predictions
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  skill public.skill NOT NULL,
  content TEXT NOT NULL,
  exam_period TEXT,
  exam_date DATE,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- speaking AI
CREATE TABLE IF NOT EXISTS public.speaking_ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT,
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  audio_url TEXT,
  score NUMERIC(2,1),
  feedback JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.speaking_ai_sessions ENABLE ROW LEVEL SECURITY;

-- writing
CREATE TABLE IF NOT EXISTS public.writing_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  essay TEXT NOT NULL,
  word_count INTEGER,
  band NUMERIC(2,1),
  feedback JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.writing_submissions ENABLE ROW LEVEL SECURITY;

-- reading/listening progress
CREATE TABLE IF NOT EXISTS public.reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  passage_id TEXT NOT NULL,
  progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  score NUMERIC(5,2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, passage_id)
);
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.listening_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_id TEXT NOT NULL,
  progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  score NUMERIC(5,2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, audio_id)
);
ALTER TABLE public.listening_progress ENABLE ROW LEVEL SECURITY;

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_notif_user ON public.notifications(user_id, read_at);

-- mail templates
CREATE TABLE IF NOT EXISTS public.mail_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  text TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mail_templates ENABLE ROW LEVEL SECURITY;

-- videos
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  skill public.skill,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- study plans
CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  plan JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- api keys (admin-managed)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  hashed_secret TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- admin audit log
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  query_kind TEXT NOT NULL,
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- app settings (admin-only key/value)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- updated_at triggers (only for tables with updated_at)
-- ============================================================
DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'profiles','subscriptions','modules','questions','mock_tests',
    'attempts','attempt_answers','vocabulary','user_vocabulary',
    'content','live_sessions','predictions','writing_submissions',
    'mail_templates','videos','reports'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated ON public.%I;', t, t);
    EXECUTE format('CREATE TRIGGER trg_%I_updated BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t, t);
  END LOOP;
END $$;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- profiles: public read, owner write
DROP POLICY IF EXISTS p_profiles_select ON public.profiles;
CREATE POLICY p_profiles_select ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS p_profiles_insert ON public.profiles;
CREATE POLICY p_profiles_insert ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS p_profiles_update_self ON public.profiles;
CREATE POLICY p_profiles_update_self ON public.profiles FOR UPDATE USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS p_profiles_delete_admin ON public.profiles;
CREATE POLICY p_profiles_delete_admin ON public.profiles FOR DELETE USING (public.is_admin(auth.uid()));

-- user_roles: user can read own, admin full
DROP POLICY IF EXISTS p_roles_select_self ON public.user_roles;
CREATE POLICY p_roles_select_self ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS p_roles_admin_all ON public.user_roles;
CREATE POLICY p_roles_admin_all ON public.user_roles FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Helper: define standard policy set
-- subscriptions / billing / attempts / attempt_answers / user_vocab / writing / speaking / reading_progress / listening_progress / notifications / live_registrations / study_plans
-- pattern: owner full + admin full
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'subscriptions','billing_invoices','attempts','user_vocabulary',
    'writing_submissions','speaking_ai_sessions','reading_progress',
    'listening_progress','notifications','live_registrations','study_plans'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS p_%1$s_owner_select ON public.%1$I;', tbl);
    EXECUTE format('CREATE POLICY p_%1$s_owner_select ON public.%1$I FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));', tbl);
    EXECUTE format('DROP POLICY IF EXISTS p_%1$s_owner_insert ON public.%1$I;', tbl);
    EXECUTE format('CREATE POLICY p_%1$s_owner_insert ON public.%1$I FOR INSERT WITH CHECK (auth.uid() = user_id);', tbl);
    EXECUTE format('DROP POLICY IF EXISTS p_%1$s_owner_update ON public.%1$I;', tbl);
    EXECUTE format('CREATE POLICY p_%1$s_owner_update ON public.%1$I FOR UPDATE USING (auth.uid() = user_id OR public.is_admin(auth.uid())) WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));', tbl);
    EXECUTE format('DROP POLICY IF EXISTS p_%1$s_owner_delete ON public.%1$I;', tbl);
    EXECUTE format('CREATE POLICY p_%1$s_owner_delete ON public.%1$I FOR DELETE USING (auth.uid() = user_id OR public.is_admin(auth.uid()));', tbl);
  END LOOP;
END $$;

-- attempt_answers: scoped via parent attempt
DROP POLICY IF EXISTS p_answers_select ON public.attempt_answers;
CREATE POLICY p_answers_select ON public.attempt_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.attempts a WHERE a.id = attempt_answers.attempt_id AND (a.user_id = auth.uid() OR public.is_admin(auth.uid())))
);
DROP POLICY IF EXISTS p_answers_insert ON public.attempt_answers;
CREATE POLICY p_answers_insert ON public.attempt_answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.attempts a WHERE a.id = attempt_answers.attempt_id AND a.user_id = auth.uid())
);
DROP POLICY IF EXISTS p_answers_update ON public.attempt_answers;
CREATE POLICY p_answers_update ON public.attempt_answers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.attempts a WHERE a.id = attempt_answers.attempt_id AND (a.user_id = auth.uid() OR public.is_admin(auth.uid())))
);
DROP POLICY IF EXISTS p_answers_delete ON public.attempt_answers;
CREATE POLICY p_answers_delete ON public.attempt_answers FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.attempts a WHERE a.id = attempt_answers.attempt_id AND (a.user_id = auth.uid() OR public.is_admin(auth.uid())))
);

-- Catalog tables (read by any authenticated user; write admin-only)
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'modules','questions','mock_tests','mock_test_sections','mock_test_questions',
    'vocabulary','content','live_sessions','predictions','videos','mail_templates'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS p_%1$s_read ON public.%1$I;', tbl);
    EXECUTE format('CREATE POLICY p_%1$s_read ON public.%1$I FOR SELECT TO authenticated USING (true);', tbl);
    EXECUTE format('DROP POLICY IF EXISTS p_%1$s_admin_write ON public.%1$I;', tbl);
    EXECUTE format('CREATE POLICY p_%1$s_admin_write ON public.%1$I FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));', tbl);
  END LOOP;
END $$;

-- Public anon read for content marketing surfaces
DROP POLICY IF EXISTS p_content_public ON public.content;
CREATE POLICY p_content_public ON public.content FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS p_videos_public ON public.videos;
CREATE POLICY p_videos_public ON public.videos FOR SELECT USING (status = 'published');

-- admin-only tables
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['api_keys','admin_audit_log','reports','app_settings'];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS p_%1$s_admin ON public.%1$I;', tbl);
    EXECUTE format('CREATE POLICY p_%1$s_admin ON public.%1$I FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));', tbl);
  END LOOP;
END $$;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars','avatars', true),
  ('content-media','content-media', true),
  ('submissions','submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Public read for avatars + content-media
DROP POLICY IF EXISTS p_avatars_read ON storage.objects;
CREATE POLICY p_avatars_read ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS p_content_media_read ON storage.objects;
CREATE POLICY p_content_media_read ON storage.objects FOR SELECT USING (bucket_id = 'content-media');

-- Owner upload to avatars (folder = user id)
DROP POLICY IF EXISTS p_avatars_owner_write ON storage.objects;
CREATE POLICY p_avatars_owner_write ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
DROP POLICY IF EXISTS p_avatars_owner_update ON storage.objects;
CREATE POLICY p_avatars_owner_update ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
DROP POLICY IF EXISTS p_avatars_owner_delete ON storage.objects;
CREATE POLICY p_avatars_owner_delete ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin uploads to content-media
DROP POLICY IF EXISTS p_content_media_admin_write ON storage.objects;
CREATE POLICY p_content_media_admin_write ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'content-media' AND public.is_admin(auth.uid())
);
DROP POLICY IF EXISTS p_content_media_admin_update ON storage.objects;
CREATE POLICY p_content_media_admin_update ON storage.objects FOR UPDATE USING (
  bucket_id = 'content-media' AND public.is_admin(auth.uid())
);
DROP POLICY IF EXISTS p_content_media_admin_delete ON storage.objects;
CREATE POLICY p_content_media_admin_delete ON storage.objects FOR DELETE USING (
  bucket_id = 'content-media' AND public.is_admin(auth.uid())
);

-- Submissions: private to owner (folder = user id) + admin read
DROP POLICY IF EXISTS p_subs_owner_read ON storage.objects;
CREATE POLICY p_subs_owner_read ON storage.objects FOR SELECT USING (
  bucket_id = 'submissions' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid()))
);
DROP POLICY IF EXISTS p_subs_owner_write ON storage.objects;
CREATE POLICY p_subs_owner_write ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]
);
DROP POLICY IF EXISTS p_subs_owner_update ON storage.objects;
CREATE POLICY p_subs_owner_update ON storage.objects FOR UPDATE USING (
  bucket_id = 'submissions' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid()))
);
DROP POLICY IF EXISTS p_subs_owner_delete ON storage.objects;
CREATE POLICY p_subs_owner_delete ON storage.objects FOR DELETE USING (
  bucket_id = 'submissions' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid()))
);
