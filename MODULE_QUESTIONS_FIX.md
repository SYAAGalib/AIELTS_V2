# Module-Questions Fix Summary

## Issues Found

1. **Missing Database Table**: The `module_questions` junction table was missing, preventing any relationship between modules and questions
2. **No Backend Functions**: Functions to manage module-question relationships didn't exist
3. **No UI**: The admin panel had no way to add/remove questions from modules

## Changes Made

### 1. Database Migration (Created)
**File**: `supabase/migrations/20260610000132_add_module_questions.sql`

Creates:
- `module_questions` table with foreign keys to `modules` and `questions`
- Indexes for performance
- RLS policies for security
- Triggers for `updated_at`

### 2. Backend Functions (Added)
**File**: `src/lib/admin-cms.functions.ts`

Added functions:
- `adminListModuleQuestions` - Get all questions for a module
- `adminAddQuestionToModule` - Add a question to a module
- `adminRemoveQuestionFromModule` - Remove a question from a module
- `adminUpdateModuleQuestionPosition` - Reorder questions within a module

### 3. Admin UI (Enhanced)
**File**: `src/routes/admin.modules.tsx`

Added features:
- Two-panel layout: modules list + questions panel
- Click a module to see its questions
- Add questions from the question bank (filtered by skill)
- Remove questions from modules
- Reorder questions with up/down buttons
- Shows position numbers for questions

## How to Apply the Migration

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to https://lngrdjskqafdvyhotuth.supabase.co
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/20260610000132_add_module_questions.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click "Run" to execute

### Option 2: Via CLI (if you have access)
```bash
npx supabase link --project-ref lngrdjskqafdvyhotuth
npx supabase db push
```

## Testing Checklist

After applying the migration:

✅ **Create a Module**
1. Go to http://localhost:8081/admin/modules
2. Fill in module details (slug, title, skill, etc.)
3. Click "Add module"
4. Verify it appears in the list

✅ **Create Questions**
1. Go to http://localhost:8081/admin/questions
2. Create some questions matching the module's skill
3. Verify they're saved

✅ **Add Questions to Module**
1. Go back to http://localhost:8081/admin/modules
2. Click on a module in the left panel
3. Click "Add" in the questions panel
4. Select questions from the dropdown
5. Verify they appear in the module

✅ **Reorder Questions**
1. Use the up/down arrows to reorder
2. Verify position numbers change

✅ **Remove Questions**
1. Click the trash icon on a question
2. Verify it's removed from the module

✅ **Fetch and Display**
1. Check if questions display properly in the student-facing app
2. Verify data persistence after page refresh

## Database Schema

```sql
CREATE TABLE module_questions (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (module_id, question_id)
);
```

This creates a many-to-many relationship:
- One module can have many questions
- One question can belong to many modules
- Position determines the order within each module

## Notes

- Questions are filtered by skill - you can only add listening questions to listening modules, etc.
- The unique constraint prevents adding the same question twice to a module
- Cascade delete ensures cleanup when modules or questions are deleted
- All admin operations require admin authentication (via RLS policies)
