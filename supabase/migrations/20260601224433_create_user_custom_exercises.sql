-- Migration: 20260601190000_create_user_custom_exercises.sql
-- Description: Drop global INSERT policy on public.exercises, create public.user_custom_exercises, and add custom_exercise_id column to user_set_logs.

-- 1. Drop the INSERT policy on public.exercises to protect it from spammers
DROP POLICY IF EXISTS "Users can insert exercises" ON public.exercises;

-- 2. Create the user_custom_exercises table
CREATE TABLE IF NOT EXISTS public.user_custom_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    youtube_video_id TEXT,
    instructions TEXT,
    equipment TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_custom_exercises ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for public.user_custom_exercises
CREATE POLICY "Users can insert their own custom exercises"
ON public.user_custom_exercises
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own custom exercises"
ON public.user_custom_exercises
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom exercises"
ON public.user_custom_exercises
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom exercises"
ON public.user_custom_exercises
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Add custom_exercise_id to user_set_logs
ALTER TABLE public.user_set_logs
ADD COLUMN IF NOT EXISTS custom_exercise_id UUID REFERENCES public.user_custom_exercises(id) ON DELETE SET NULL;

-- 6. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_set_logs_custom_exercise_id ON public.user_set_logs(custom_exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_set_logs_custom_exercise_completed ON public.user_set_logs(custom_exercise_id, completed_at DESC);
