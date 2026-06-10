# AIELTS — Phase 2 status

## Done
- **Server functions** (`src/lib/student.functions.ts`): question listing, attempt start/submit with answer-key scoring + IELTS-style band, writing submit, speaking save, listening/reading progress upsert, vocab SRS review, weekly plan get/upsert, billing, videos, live registration.
- **Practice routes connected to Supabase**:
  - `dashboard.listening` + `dashboard.reading` (shared `PracticePage`) — fetch real `questions` by skill, render MCQ/fill UI, submit creates `attempts` + `attempt_answers`, scored and saved.
  - `dashboard.writing` — fetch writing prompts from `questions`, save real `writing_submissions` with band + feedback, recent-submission list.
  - `dashboard.speaking` — fetch cue cards from `questions`, save transcript to `speaking_ai_sessions`.
- **Dashboard pages**:
  - `dashboard.progress` — real per-skill averages + band trend chart from attempts/writing/speaking.
  - `dashboard.intelligence` — strongest/weakest skill, target-band delta, recommendations from real data.
  - `dashboard.plan` — `study_plans` upsert with auto-generated weekly plan ranked by weakest skill.
  - `dashboard.billing` — real subscription + `billing_invoices`.
  - `dashboard.videos` — real `videos` table with YouTube embed + skill filter.
  - `dashboard.live` — added Register button → `live_registrations` upsert.
  - `dashboard.vocabulary` / `dashboard.mock-tests` / `dashboard.index` — already DB-connected.

## Notes
- Listening audio playback and real speech-to-text are out of scope; current speaking page accepts typed turns and saves transcripts.
- Writing and speaking band scores are heuristic; swap in Lovable AI Gateway later for true grading.
- All reads/writes go through `requireSupabaseAuth` middleware and respect RLS.

## Phase 3 (optional)
- Wire AI grading for writing/speaking via Lovable AI Gateway.
- Add audio upload + STT for speaking; audio playback for listening modules.
- Verify empty states on every page with a fresh user.
