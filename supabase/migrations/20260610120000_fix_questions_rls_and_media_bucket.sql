-- ============================================================
-- Fix 1: Allow authenticated students to read published questions
-- The previous policy only allowed admins to read questions,
-- which meant the student dashboard returned no data.
-- ============================================================

DROP POLICY IF EXISTS p_questions_student_read ON public.questions;

CREATE POLICY p_questions_student_read
  ON public.questions FOR SELECT
  TO authenticated
  USING (status = 'published');

-- ============================================================
-- Fix 2: Create the question-media storage bucket for file uploads
-- Used by adminCreateMediaUploadUrl to store audio and image files.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-media',
  'question-media',
  true,
  52428800,  -- 50 MB
  ARRAY[
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/webm',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow service role to upload/manage files (used by adminCreateMediaUploadUrl via supabaseAdmin)
-- The bucket is public so anyone can read files via URL.
-- Uploads are restricted to the server-side admin client (service role bypasses RLS).
