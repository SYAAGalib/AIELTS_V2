-- ============================================================
-- Add module_questions junction table
-- ============================================================
-- This migration creates a junction table to link modules with
-- questions, allowing dynamic question assignment through the
-- admin panel. Follows the same pattern as mock_test_questions.

CREATE TABLE IF NOT EXISTS public.module_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (module_id, question_id)
);

-- Enable RLS
ALTER TABLE public.module_questions ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_module_questions_module ON public.module_questions(module_id);
CREATE INDEX IF NOT EXISTS idx_module_questions_question ON public.module_questions(question_id);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at_module_questions
  BEFORE UPDATE ON public.module_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- RLS Policies
-- Allow admins to manage module questions
CREATE POLICY "Admins can view module_questions"
  ON public.module_questions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert module_questions"
  ON public.module_questions FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update module_questions"
  ON public.module_questions FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete module_questions"
  ON public.module_questions FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Allow authenticated users to view published module questions
CREATE POLICY "Users can view published module_questions"
  ON public.module_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      WHERE m.id = module_questions.module_id
      AND m.status = 'published'
    )
    AND EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = module_questions.question_id
      AND q.status = 'published'
    )
  );
